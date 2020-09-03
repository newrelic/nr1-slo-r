export const SLO_INDICATORS = [
  { value: 'error_budget', label: 'Errors' },
  { value: 'availability', label: 'Availability' },
  { value: 'capacity', label: 'Capacity' },
  { value: 'latency', label: 'Latency' },
  { value: 'latency_budget', label: 'Latency (Calculated)' }
];

export const ENTITY_COLLECTION_NAME = 'nr1-csg-slo-r';

export const SLO_DEFECTS = [
  { value: '5%', label: '5xx Errors' },
  { value: '400', label: '400 Bad Request' },
  { value: '401', label: '401 Unauthorized' },
  { value: '403', label: '403 Forbidden' },
  { value: '404', label: '404 Not Found' },
  { value: '409', label: '409 Conflict' },
  { value: 'apdex_frustrated', label: 'Apdex Frustrated' }
];
