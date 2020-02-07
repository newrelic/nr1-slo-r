/* eslint-disable array-callback-return */
/**
 * This convenience class is a reimplementation of "error-budget-slo" and is intended to calculate the opperands of the SLO calculation
 * so they can be meaningfully summarized on the composite SLO model.
 *
 * @file Defines functions for the purpose of calculating an Error Budget SLO in aggregate.
 * @author Gil Rice
 */
/** nr1 */
import { NerdGraphQuery } from 'nr1';

/** local */
import { updateTimeRangeFromScope } from '../../helpers';

/** 3rd party */

/** returns an nrql fragment string that describes the errors or defects to contemplate for the error budget slo */
const _getErrorFilter = function(_transactions, _defects, language) {
  let __ERROR_FILTER = '';

  _transactions.map(transaction => {
    __ERROR_FILTER = `${__ERROR_FILTER}FILTER(count(*), WHERE name = '${transaction}' `;

    if (_defects.length > 0) {
      __ERROR_FILTER += `AND (`;

      let __defectsIndex = 0;
      let __DEFECTS_JOIN = '';
      let __DEFECTS_FILTER = '';

      _defects.map(defect => {
        if (__defectsIndex > 0) {
          __DEFECTS_JOIN = ' OR ';
        } // if
        else {
          __DEFECTS_JOIN = '';
        } // else

        // evaluate if the defect is an httpResponseCode releated or apdexPerfZone
        if (defect === 'apdex_frustrated') {
          __DEFECTS_FILTER = `${__DEFECTS_FILTER +
            __DEFECTS_JOIN}apdexPerfZone = 'F'`;
        } // if
        else {
          __DEFECTS_FILTER = `${__DEFECTS_FILTER +
            __DEFECTS_JOIN +
            _getAgentHTTPResponseAttributeName(language)} LIKE '${defect}'`;
        } // else

        __defectsIndex++;
      });

      __ERROR_FILTER = `${__ERROR_FILTER + __DEFECTS_FILTER})`;
    }
    __ERROR_FILTER += `) + `; // lazy way to account for the array elements
  });

  __ERROR_FILTER = `${__ERROR_FILTER}0`; // completes the expression on the final array element

  return __ERROR_FILTER;
}; // getErrorFilter

/** returns an nrql fragment string that desribes the total number of transactions */
const _getTotalFilter = function(_transactions) {
  let __TOTAL_FILTER = '';

  _transactions.map(transaction => {
    __TOTAL_FILTER = `${__TOTAL_FILTER}FILTER(count(*), WHERE name = '${transaction}') + `;
  });
  __TOTAL_FILTER = `${__TOTAL_FILTER}0`; // completes the expression on the array element

  return __TOTAL_FILTER;
}; // getTotalFilter

/** returns the full nrql needed to calculate the error budget */
const _getErrorBudgetNRQL = function(
  _transactions,
  _defects,
  _begin,
  _end,
  _appName,
  language
) {
  const __NRQL = `SELECT ((${_getErrorFilter(
    _transactions,
    _defects,
    language
  )}) AS 'numerator', (${_getTotalFilter(
    _transactions
  )}) AS 'denominator') FROM Transaction WHERE appName = '${_appName}' AND ${_getAgentHTTPResponseAttributeName(
    language
  )} IS NOT NULL SINCE ${Math.round(_begin)} UNTIL ${Math.round(_end)}`;

  // console.debug('NRQL Looks like what', __NRQL);
  return __NRQL;
}; // getErrorBudgerNRQL

/** returns a string the describes the attribute name for the http response code for our language agents */
const _getAgentHTTPResponseAttributeName = function(language) {
  if (language === 'dotnet' || language === 'python') {
    return 'response.status';
  } // if
  else {
    return 'httpResponseCode';
  } // else
}; // _getAgentHTTPResponseAttributeName

/** assembles and executes the query to report the error budget for the given SLO scope */
const _getErrorBudgetSLOData = async function(props) {
  const __SLO_RESULT = {
    _current: {
      numerator: '',
      denominator: '',
      result: ''
    },
    _7_day: {
      numerator: '',
      denominator: '',
      result: ''
    },
    _30_day: {
      numerator: '',
      denominator: '',
      result: ''
    }
  };

  const __current_TSObj = updateTimeRangeFromScope({
    timeRange: {
      begin_time: props.nerdlet_beginTS,
      end_time: props.nerdlet_endTS,
      duration: props.nerdlet_duration
    },
    scope: 'current'
  });

  props.defects = props.defects.map(d => d.value);

  const __NRQL_current = _getErrorBudgetNRQL(
    props.transactions,
    props.defects,
    __current_TSObj.begin_time,
    __current_TSObj.end_time,
    props.appName,
    props.language
  );

  const __7_day_TSObj = updateTimeRangeFromScope({
    timeRange: {
      begin_time: props.nerdlet_beginTS,
      end_time: props.nerdlet_endTS,
      duration: props.nerdlet_duration
    },
    scope: '7_day'
  });

  const __NRQL_7_day = _getErrorBudgetNRQL(
    props.transactions,
    props.defects,
    __7_day_TSObj.begin_time,
    __7_day_TSObj.end_time,
    props.appName,
    props.language
  );

  const __30_day_TSObj = updateTimeRangeFromScope({
    timeRange: {
      begin_time: props.nerdlet_beginTS,
      end_time: props.nerdlet_endTS,
      duration: props.nerdlet_duration
    },
    scope: '30_day'
  });

  const __NRQL_30_day = _getErrorBudgetNRQL(
    props.transactions,
    props.defects,
    __30_day_TSObj.begin_time,
    __30_day_TSObj.end_time,
    props.appName,
    props.language
  );

  const __GRAPHQL_current = `{
    actor {
      account(id: ${props.accountId}) {
        nrql(query: "${__NRQL_current}") {
          results
        }
      }
    }
  }`;

  const __GRAPHQL_7_day = `{
    actor {
      account(id: ${props.accountId}) {
        nrql(query: "${__NRQL_7_day}") {
          results
        }
      }
    }
  }`;

  const __GRAPHQL_30_day = `{
    actor {
      account(id: ${props.accountId}) {
        nrql(query: "${__NRQL_30_day}") {
          results
        }
      }
    }
  }`;

  // console.debug(__GRAPHQL_current);

  const __SLO_current = await NerdGraphQuery.query({
    query: __GRAPHQL_current
  });
  const __SLO_7_day = await NerdGraphQuery.query({ query: __GRAPHQL_7_day });
  const __SLO_30_day = await NerdGraphQuery.query({ query: __GRAPHQL_30_day });

  // console.debug('COMPOSITE CURRENT', __SLO_current);
  // console.debug('COMPOSITE 7D', __SLO_7_day);
  // console.debug('COMPOSITE 30D', __SLO_30_day);

  // account for errant conditions
  if (__SLO_current.data.actor.account.nrql.results[0].denominator === 0) {
    __SLO_RESULT._current.numerator = 0;
    __SLO_RESULT._current.denominator = 1;
  } // if
  else {
    __SLO_RESULT._current.numerator =
      __SLO_current.data.actor.account.nrql.results[0].numerator;
    __SLO_RESULT._current.denominator =
      __SLO_current.data.actor.account.nrql.results[0].denominator;
  } // else

  // account for errant conditions - 7 day
  if (__SLO_7_day.data.actor.account.nrql.results[0].denominator === 0) {
    __SLO_RESULT._7_day.numerator = 0;
    __SLO_RESULT._7_day.denominator = 1;
  } // if
  else {
    __SLO_RESULT._7_day.numerator =
      __SLO_7_day.data.actor.account.nrql.results[0].numerator;
    __SLO_RESULT._7_day.denominator =
      __SLO_7_day.data.actor.account.nrql.results[0].denominator;
  } // else

  // account for errant conditions - 30 day
  if (__SLO_30_day.data.actor.account.nrql.results[0].denominator === 0) {
    __SLO_RESULT._30_day.numerator = 0;
    __SLO_RESULT._30_day.denominator = 1;
  } // if
  else {
    __SLO_RESULT._30_day.numerator =
      __SLO_30_day.data.actor.account.nrql.results[0].numerator;
    __SLO_RESULT._30_day.denominator =
      __SLO_30_day.data.actor.account.nrql.results[0].denominator;
  } // else

  // complete the results for each timerange
  __SLO_RESULT._30_day.result =
    Math.round(
      (100 -
        __SLO_RESULT._30_day.numerator / __SLO_RESULT._30_day.denominator) *
        1000
    ) / 1000;
  __SLO_RESULT._7_day.result =
    Math.round(
      (100 - __SLO_RESULT._7_day.numerator / __SLO_RESULT._7_day.denominator) *
        1000
    ) / 1000;
  __SLO_RESULT._current.result =
    Math.round(
      (100 -
        __SLO_RESULT._current.numerator / __SLO_RESULT._current.denominator) *
        1000
    ) / 1000;

  return __SLO_RESULT;
}; // _getErrorBudgetSLOData

const CompositeErrorBudgetSlo = {
  query: async props => {
    props.nerdlet_beginTS = props.timeRange.begin_time; // begin time for current calculation
    props.nerdlet_endTS = props.timeRange.end_time; // end time for current calculation
    props.nerdlet_duration = props.timeRange.duration; // duration for time ending now calculations
    props.defects = props.slo_document.defects; // defects for the error calculation review why was this an empty []???
    props.transactions = props.slo_document.transactions; // list of candidate transactions for error burget
    props.appName = props.slo_document.appName; // name of application for query
    props.accountId = props.slo_document.accountId; // account is of applictaion for query
    props.language = props.slo_document.language; // the language of the application for http response code attribute.

    // console.debug('BEGIN', props.nerdlet_beginTS);
    // console.debug('END', props.nerdlet_endTS);
    // console.debug('DURATION', props.nerdlet_duration);

    const slo_results = await _getErrorBudgetSLOData(props);

    // console.debug('RE FRIGGED SLO RESULTS', slo_results);
    // return {
    //   slo_document: props.slo_document,
    //   scope: props.scope,
    //   numerator: slo_results.numerator,
    //   denominator: slo_results.demoninator,
    //   result: Math.round((numerator / denominator) * 1000 / 1000)
    // };

    return {
      slo_document: props.slo_document,
      result_current: slo_results._current,
      result_7_day: slo_results._7_day,
      result_30_day: slo_results._30_day
    };
  }
};

export default CompositeErrorBudgetSlo;
