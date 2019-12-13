/* eslint-disable no-console */
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
import AlertDrivenSLO from '../../../../../shared/queries/alert-driven-slo';
/** 3rd party */

/** assembles and executes the query to report the error budget for the given SLO scope */
const _getAlertSLOData = async function(props) {
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

  const __SLO_current = await AlertDrivenSLO.query({
    scope: 'current',
    document: props.slo_document,
    timeRange: props.timeRange
  });

  const __SLO_7_day = await AlertDrivenSLO.query({
    scope: '7_day',
    document: props.slo_document,
    timeRange: props.timeRange
  });

  const __SLO_30_day = await AlertDrivenSLO.query({
    scope: '30_day',
    document: props.slo_document,
    timeRange: props.timeRange
  });

  console.debug('COMPOSITE CURRENT ALERTS', __SLO_current);
  console.debug('COMPOSITE 7D ALERTS', __SLO_7_day);
  console.debug('COMPOSITE 30D ALERTS', __SLO_30_day);

  // complete the results for each timerange
  __SLO_RESULT._current.result = __SLO_current.data;
  __SLO_RESULT._current.numerator = __SLO_current.numerator;
  __SLO_RESULT._current.denominator = __SLO_current.denominator;
  __SLO_RESULT._7_day.result = __SLO_7_day.data;
  __SLO_RESULT._7_day.numerator = __SLO_7_day.numerator;
  __SLO_RESULT._7_day.denominator = __SLO_7_day.denominator;
  __SLO_RESULT._30_day.result = __SLO_30_day.data;
  __SLO_RESULT._30_day.numerator = __SLO_30_day.numerator;
  __SLO_RESULT._30_day.denominator = __SLO_30_day.denominator;

  return __SLO_RESULT;
}; // _getAlertSLOData

const ComponentAlertSLO = {
  query: async props => {
    props.nerdlet_beginTS = props.timeRange.begin_time; // begin time for current calculation
    props.nerdlet_endTS = props.timeRange.end_time; // end time for current calculation
    props.nerdlet_duration = props.timeRange.duration; // duration for time ending now calculations
    props.alerts = props.slo_document.alerts; // alerts defined for this alert driven SLO
    props.appName = props.slo_document.appName; // name of application for query
    props.accountId = props.slo_document.accountId; // account is of applictaion for query

    const slo_results = await _getAlertSLOData(props);

    console.debug('RE FRIGGED SLO RESULTS  ALERTS', slo_results);

    return {
      slo_document: props.slo_document,
      result_current: slo_results._current,
      result_7_day: slo_results._7_day,
      result_30_day: slo_results._30_day
    };
  }
};

export default ComponentAlertSLO; // ComponentAlertSLO
