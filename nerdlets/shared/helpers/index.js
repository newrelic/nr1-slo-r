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
