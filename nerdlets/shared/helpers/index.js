/*
 * Helper function to turn timeRange into NRQL Since
 */
export const timeRangeToNrql = timeRange => {
  if (!timeRange) {
    return '';
  } else if (timeRange.begin_time && timeRange.end_time) {
    return ` SINCE ${timeRange.begin_time} UNTIL ${timeRange.end_time}`;
  } else if (timeRange.duration) {
    return ` SINCE ${timeRange.duration / 1000} SECONDS AGO`;
  }

  return '';
};

export const updateTimeRangeFromScope = ({ scope, timeRange }) => {
  // Time Range before taking scope into account
  const { begin_time, duration, end_time } = timeRange;

  // Variables for our adjustments
  let __beginTS = begin_time;
  let __duration = duration;
  let __endTS = end_time;

  const __date = Date.now();

  // Need to ensure we have the latest current time if no time supplied - otherwise the ranges might go negative and that's not cool
  if (__endTS === undefined || __endTS === null) {
    __endTS = __date;
  } // if
  else {
    __endTS = end_time;
  } // else

  // determine if this is a fixed or variable time scope
  if (scope === '7_day') {
    __duration = null;
    __beginTS = +__endTS - +'604800000';
  } // if
  else if (scope === '30_day') {
    __duration = null;
    __beginTS = +__endTS - +'2592000000';
  } // else if
  else {
    // assume current time
    // eslint-disable-next-line no-lonely-if
    if (__duration !== null) {
      __beginTS = +__endTS - +__duration;
    } // if
    else {
      __beginTS = begin_time;
      __endTS = end_time;
    } // else
  } // else

  return {
    begin_time: __beginTS,
    duration: __duration,
    end_time: __endTS
  };
};

// In seconds
export const getNow = () => {
  return Math.floor(new Date().getTime());
};
