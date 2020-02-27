/**
 * Provides an html output of an alert centric SLO calculation.
 *
 * @file This files defines a component that renders the a given SLO definition for an entity.
 * @author Gil Rice
 */
/** nr1 */
import { NerdGraphQuery } from 'nr1';
/** local */
import { updateTimeRangeFromScope } from '../../helpers';

/** 3rd party */

/**
 * AlertDrivenSLO
 */
/** provides the where clause for the queries given the alerts array provided by the component properties */
const _getAlertsWhereClause = function(_alerts) {

  //validate the _alert array being passed
  try {

    if (_alerts[0].policy_name === null || _alerts[0].policy_name === undefined) {
      throw "Invalid Alert";
    } //if
  }//try
  catch{
    console.warn('No alerts defined for an alert-driven SLO. Returning all alerts for comparison. This may be a result of an old version of SLO/R, please delete the SLO and try to recreate.', _alerts);
    return 'timestamp > 0';
  } //catch

  const alertNames = _alerts.map(a => a.policy_name);
  const alertsClause = `policy_name IN ('${alertNames.join("', '")}')`;

  return alertsClause;
}; // _getAlertsWhereClause

/** returns the full nrql needed to collect the alert policy violations that caused an open alert to fire */
const _getOpenedAlertNRQL = function(_alerts, _begin, _end) {
  const __NRQL = `SELECT latest(duration), latest(timestamp) FROM SLOR_ALERTS WHERE ${_getAlertsWhereClause(
    _alerts
  )} AND current_state = 'open' FACET incident_id SINCE ${Math.round(
    _begin
  )} UNTIL ${Math.round(_end)} LIMIT MAX`;
  return __NRQL;
}; // getErrorBudgerNRQL

/** returns the full nrql needed to collect the alert policy violations that caused an close alert to fire */
const _getClosedAlertNRQL = function(_alerts, _begin, _end) {
  const __NRQL = `SELECT latest(duration), latest(timestamp) FROM SLOR_ALERTS WHERE ${_getAlertsWhereClause(
    _alerts
  )} AND current_state = 'closed' FACET incident_id SINCE ${Math.round(
    _begin
  )} UNTIL ${Math.round(_end)} LIMIT MAX`;
  return __NRQL;
}; // getErrorBudgerNRQL

/** provides the SLO attainment for the given SLO document for the time scope provided */
const _getAlertDrivenSLOData = async function(props) {
  const { accountId, alerts, scope, timeRange } = props;

  const {
    begin_time: __beginTS,
    // duration: __duration,
    end_time: __endTS
  } = updateTimeRangeFromScope({
    scope,
    timeRange
  });

  const __NRQL_OPEN = _getOpenedAlertNRQL(alerts, __beginTS, __endTS);
  const __NRQL_CLOSED = _getClosedAlertNRQL(alerts, __beginTS, __endTS);

  const __queryOpenAlerts = `{
            actor {
              account(id: ${accountId}) {
                nrql(query: "${__NRQL_OPEN}") {
                  results
                }
              }
            }
          }`;

  const __queryClosedAlerts = `{
            actor {
              account(id: ${accountId}) {
                nrql(query: "${__NRQL_CLOSED}") {
                  results
                }
              }
            }
          }`;

  const __resultOpenAlerts = await NerdGraphQuery.query({
    query: __queryOpenAlerts
  });

  const __resultClosedAlerts = await NerdGraphQuery.query({
    query: __queryClosedAlerts
  });

  // process the finished alerts and determine if the start time exists in this time period -
  // if not the alert starts at the beginning of the time bucket .....
  let __effectiveAlertWindows = []; // this variable stores the alert window ranges calculated from the open and closed alert occurances
  let __deduplicatedAlertWindows = [];
  let __tempAlertWindow;

  // looping through the closed alerts defines those alert violations that have opened and closed during the current time period. It does not contemplate
  // alerts that are open pending a close operation.
  // eslint-disable-next-line array-callback-return
  __resultClosedAlerts.data.actor.account.nrql.results.map(_alertClosed => {
    const __openAlertInfo = _getOpenAlert(
      _alertClosed.incident_id,
      __resultOpenAlerts.data.actor.account.nrql.results,
      __beginTS
    );
    __tempAlertWindow = {
      incidentId: _alertClosed.incident_id,
      openedTimeStamp: __openAlertInfo.timestamp,
      openedDuration: __openAlertInfo.duration,
      closedDuration: _alertClosed['latest.duration'],
      closedTimeStamp: _alertClosed['latest.timestamp']
    };
    __effectiveAlertWindows = _reconcileCandidateRange(
      __tempAlertWindow,
      __effectiveAlertWindows
    );
  });

  // process the effective alert windows to ensure we get a final dedupicated list
  __deduplicatedAlertWindows = _deduplicateCandidateRanges(
    __effectiveAlertWindows
  );

  // process the __effectiveAlertWindows to come up with a total in milliseconds of the effective time ranges
  let __accumulatedMillisecondsInAlertState = 0;

  // eslint-disable-next-line array-callback-return
  __deduplicatedAlertWindows.map(_window => {
    __accumulatedMillisecondsInAlertState +=
      +_window.closedTimeStamp - +_window.openedTimeStamp;
  });

  // calculate the percentage of time of this window that the effective alerts were fired
  const __SLO_RESULT_OBJ = {
    accumulatedMilliseconds: __accumulatedMillisecondsInAlertState,
    totalTimeMilliseconds: __endTS - __beginTS,
    slo_result:
      100 - __accumulatedMillisecondsInAlertState / (__endTS - __beginTS)
  };

  // set thw SLO result as 100 - the percentage of time in violation
  return __SLO_RESULT_OBJ;
}; // _getAlertDrivenSLOData

const _getOpenAlert = function(_incidentId, _candidateOpens, _beginTS) {
  let __openAlertInfo = null;

  for (let i = 0; i < _candidateOpens.length; i++) {
    if (_candidateOpens[i].incident_id === _incidentId) {
      __openAlertInfo = {
        timestamp: _candidateOpens[i]['latest.timestamp'],
        duration: _candidateOpens[i]['latest.duration']
      };
      break;
    } // if
  }

  // if the time is still null then it is the start time of this evaluation bucket
  if (__openAlertInfo === null) {
    __openAlertInfo = {
      timestamp: _beginTS,
      duration: 0
    };
  } // if
  return __openAlertInfo;
}; // _getOpenAlert

const _deduplicateCandidateRanges = function(_candidateRanges) {
  const __sortedCandidateRanges = _candidateRanges.sort(_compareRanges);
  const __deduplicatedRanges = [];
  let __mergedRange = null;

  for (let i = 0; i < __sortedCandidateRanges.length; i++) {
    // only perform this option if there is another candidate in the queue
    if (__sortedCandidateRanges.length - (i + 1) >= 1) {
      // does the preceeding end time stamp land within the next alert timestamp?
      if (
        __sortedCandidateRanges[i].closedTimeStamp >
        __sortedCandidateRanges[i + 1].openedTimeStamp
      ) {
        if (
          __sortedCandidateRanges[i].closedTimeStamp >
          __sortedCandidateRanges[i + 1].closedTimeStamp
        ) {
          __mergedRange = {
            closedDuration:
              __sortedCandidateRanges[i].closedTimeStamp -
              __sortedCandidateRanges[i].openedTimeStamp,
            closedTimeStamp: __sortedCandidateRanges[i].closedTimeStamp,
            incidentId: `${__sortedCandidateRanges[i].incidentId}|${
              __sortedCandidateRanges[i + 1].incidentId
            }`,
            openedDuration: __sortedCandidateRanges[i].openedDuration,
            openedTimeStamp: __sortedCandidateRanges[i].openedTimeStamp
          };
        } // if
        else {
          __mergedRange = {
            closedDuration:
              __sortedCandidateRanges[i + 1].closedTimeStamp -
              __sortedCandidateRanges[i].openedTimeStamp,
            closedTimeStamp: __sortedCandidateRanges[i + 1].closedTimeStamp,
            incidentId: `${__sortedCandidateRanges[i].incidentId}|${
              __sortedCandidateRanges[i + 1].incidentId
            }`,
            openedDuration: __sortedCandidateRanges[i].openedDuration,
            openedTimeStamp: __sortedCandidateRanges[i].openedTimeStamp
          };
        } // else

        // merge this timestamp into the next one by overwriting the next index of this array
        __sortedCandidateRanges[i + 1] = __mergedRange;
      } // if
      else {
        __deduplicatedRanges.push(__sortedCandidateRanges[i]);
      } // else
    } // if
    else {
      __deduplicatedRanges.push(__sortedCandidateRanges[i]);
    } // else
  } // for

  return __deduplicatedRanges;
}; // _deduplicateCandidateRanges

const _reconcileCandidateRange = function(_candidateRange, _alertRanges) {
  let __addRange = true;
  const __alertRanges = _alertRanges;

  // there are no current candidate ranges to compare against to just push the range we have been supplied
  if (__alertRanges.length === 0) {
    __addRange = true;
  } // if
  else {
    // loop the candidate ranges and determine if this range overlaps wioth the others
    // eslint-disable-next-line array-callback-return
    __alertRanges.map(_range => {
      // check to see the candidate range occurs wholly within the given range
      if (
        _candidateRange.openedTimeStamp >= _range.openedTimeStamp &&
        _candidateRange.openedTimeStamp <= _range.closedTimeStamp
      ) {
        // closed timestamp conditions ...
        if (_candidateRange.closedTimeStamp > _range.closedTimeStamp) {
          // update the new end period of this range timestamp and ignore the start
          _range.closedTimeStamp = _candidateRange.closedTimeStamp;
          // __integretryCheck = true;
          __addRange = false;
        } // if
      } // if
      // need to check that this candidate range doesn't wholly overlap the given range ...
      else if (
        _candidateRange.closedTimeStamp >= _range.openedTimeStamp &&
        _candidateRange.closedTimeStamp <= _range.closedTimeStamp
      ) {
        if (_candidateRange.openedTimeStamp < _range.openedTimeStamp) {
          _range.openedTimeStamp = _candidateRange.openedTimeStamp;
          // __integretryCheck = true;
          __addRange = false;
        } // if
      } // else if
      // the begin and end events are greater than the cadidate range
      else if (
        _candidateRange.openedTimeStamp < _range.openedTimeStamp &&
        _candidateRange.closedTimeStamp > _range.closedTimeStamp
      ) {
        _range.openedTimeStamp = _candidateRange.openedTimeStamp;
        _range.closedTimeStamp = _candidateRange.closedTimeStamp;
        // __integretryCheck = true;
        __addRange = false;
      } // else if
      // the begin and end events are entirely contained within the candidate range
      else if (
        _candidateRange.openedTimeStamp >= _range.openedTimeStamp &&
        _candidateRange.closedTimeStamp <= _range.closedTimeStamp
      ) {
        __addRange = false;
      } // else if
    });
  } // else

  // determine if we need to add the canidate to the given array
  if (__addRange) {
    __alertRanges.push(_candidateRange);
  } // if

  return __alertRanges;
}; // _reconcileCandidateRange

function _compareRanges(_a, _b) {
  const __timestampA = _a.openedTimeStamp;
  const __timestampB = _b.openedTimeStamp;
  let __comparison = 0;

  if (__timestampA > __timestampB) {
    __comparison = 1;
  } // if
  else if (__timestampA < __timestampB) {
    __comparison = -1;
  } // else if

  return __comparison;
} // _compareRanges

const AlertDrivenSLO = {
  query: async props => {
    props.nerdlet_beginTS = props.timeRange.begin_time;
    props.nerdlet_endTS = props.timeRange.end_time;
    props.nerdlet_duration = props.timeRange.duration;

    props.alerts = props.document.alerts;
    props.accountId = props.document.accountId;
    props.target = props.document.target;

    const slo_result = await _getAlertDrivenSLOData(props);
    return {
      document: props.document,
      scope: props.scope,
      data: Math.round(slo_result.slo_result * 1000) / 1000,
      numerator: slo_result.accumulatedMilliseconds,
      denominator: slo_result.totalTimeMilliseconds
    };
  },
  generateQueries: props => {
    const { document, scope, timeRange } = props;

    // eslint-disable-next-line no-unused-vars
    const { begin_time, duration, end_time } = updateTimeRangeFromScope({
      scope,
      timeRange
    });

    const __NRQL_OPEN = _getOpenedAlertNRQL(
      document.alerts,
      begin_time,
      end_time
    );

    const __NRQL_CLOSED = _getClosedAlertNRQL(
      document.alerts,
      begin_time,
      end_time
    );

    return [
      { name: 'Alert Open NRQL', query: __NRQL_OPEN },
      { name: 'Alert Closed NRQL', query: __NRQL_CLOSED }
    ];
  }
};

export default AlertDrivenSLO;
