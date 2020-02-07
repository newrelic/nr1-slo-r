/* eslint-disable array-callback-return */
/**
 * Provides an html output of an error budget calculation.
 *
 * @file This files defines a component that renders the Error Budget attainment for a given SLO definition for an entity.
 * @author Gil Rice
 */
/** nr1 */
import { NrqlQuery } from 'nr1';
/** local */

import { updateTimeRangeFromScope } from '../../helpers';

/** 3rd party */

/**
 * ErrorBudgetSLO
 */

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
        if (defect.value === 'apdex_frustrated') {
          __DEFECTS_FILTER = `${__DEFECTS_FILTER +
            __DEFECTS_JOIN}apdexPerfZone = 'F'`;
        } // if
        else {
          __DEFECTS_FILTER = `${__DEFECTS_FILTER +
            __DEFECTS_JOIN +
            _getAgentHTTPResponseAttributeName(language)} LIKE '${
            defect.value
          }'`;
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
  const __NRQL = `SELECT 100 - ((${_getErrorFilter(
    _transactions,
    _defects,
    language
  )}) / (${_getTotalFilter(
    _transactions
  )})) AS 'SLO' FROM Transaction WHERE appName = '${_appName}' AND ${_getAgentHTTPResponseAttributeName(
    language
  )} IS NOT NULL SINCE ${Math.round(_begin)} UNTIL ${Math.round(_end)}`;
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
  const { scope, timeRange } = props;

  // eslint-disable-next-line no-unused-vars
  const { begin_time, duration, end_time } = updateTimeRangeFromScope({
    scope,
    timeRange
  });

  const __NRQL = _getErrorBudgetNRQL(
    props.transactions,
    props.defects,
    begin_time,
    end_time,
    props.appName,
    props.language
  );

  const { data: __SLO } = await NrqlQuery.query({
    accountId: props.accountId,
    query: __NRQL
  });

  // ensure we have a valid data object else return a 0 in data structure
  if (__SLO.chart.length < 1) {
    const __ERR_SLO = {
      chart: [
        {
          data: [
            {
              SLO: 0.0
            }
          ]
        }
      ]
    };

    return __ERR_SLO;
  } // if
  else {
    return __SLO;
  } // else
}; // _getErrorBudgetSLOData

const ErrorBudgetSLO = {
  // Expects props.timeRange to exist
  query: async props => {
    props.defects = props.document.defects || [];
    props.transactions = props.document.transactions;
    props.appName = props.document.appName;
    props.accountId = props.document.accountId;
    props.language = props.document.language;

    const slo_results = await _getErrorBudgetSLOData(props);

    return {
      document: props.document,
      scope: props.scope,
      data: Math.round(slo_results.chart[0].data[0].SLO * 1000) / 1000
    };
  },
  // Expects props.timeRange to exist
  generateQueries: props => {
    const { document, scope, timeRange } = props;

    // eslint-disable-next-line no-unused-vars
    const { begin_time, duration, end_time } = updateTimeRangeFromScope({
      scope,
      timeRange
    });

    const query = _getErrorBudgetNRQL(
      document.transactions,
      document.defects,
      begin_time,
      end_time,
      document.appName,
      document.language
    );

    return [{ name: 'Error Budget NRQL', query }];
  }
};

export default ErrorBudgetSLO; // ErrorBudgetSLO
