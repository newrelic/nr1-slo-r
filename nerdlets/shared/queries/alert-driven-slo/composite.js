/**
 * This convenience class is a reimplementation of "alert-driven-slo" and is intended to calculate the opperands of the SLO calculation
 * so they can be meaningfully summarized on the composite SLO model.
 *
 * @file Defines functions for the purpose of calculating an Alert Driven SLOs in aggregate.
 * @author Gil Rice
 */
/** nr1 */
// import { NrqlQuery, NerdGraphQuery } from 'nr1';

/** local */
import AlertDrivenSLO from './single-document';

/** 3rd party */

/** assembles and executes the query to report the error budget for the given SLO scope */
const _getAlertSLOData = async function(props) {
  const scopes = ['current', '7_day', '30_day'];

  // Set defaults
  const __SLO_RESULT = scopes.reduce((previousValue, scope) => {
    previousValue[scope] = {
      numerator: '',
      denominator: '',
      result: ''
    };
    return previousValue;
  }, {});

  // Populate from single queries per scope
  for (const scope of scopes) {
    const response = await AlertDrivenSLO.query({
      scope,
      document: props.slo_document,
      timeRange: props.timeRange
    });
    __SLO_RESULT[scope] = {
      numerator: response.numerator,
      denominator: response.denominator,
      result: response.data
    };
  }

  return __SLO_RESULT;
}; // _getAlertSLOData

const CompositeAlertSlo = {
  query: async props => {
    props.nerdlet_beginTS = props.timeRange.begin_time; // begin time for current calculation
    props.nerdlet_endTS = props.timeRange.end_time; // end time for current calculation
    props.nerdlet_duration = props.timeRange.duration; // duration for time ending now calculations
    props.alerts = props.slo_document.alerts; // alerts defined for this alert driven SLO
    props.appName = props.slo_document.appName; // name of application for query
    props.accountId = props.slo_document.accountId; // account is of applictaion for query

    const slo_results = await _getAlertSLOData(props);

    // console.debug('RE FRIGGED SLO RESULTS  ALERTS', slo_results);

    return {
      slo_document: props.slo_document,
      result_current: slo_results.current,
      result_7_day: slo_results['7_day'],
      result_30_day: slo_results['30_day']
    };
  }
};

export default CompositeAlertSlo;
