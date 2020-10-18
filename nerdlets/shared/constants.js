export const SLO_INDICATORS = [
  { value: 'error_budget', label: 'Availability (errors)' },
  { value: 'availability', label: 'Availability (custom)' },
  { value: 'capacity', label: 'Capacity (custom)' },
  { value: 'latency', label: 'Latency (custom)' },
  { value: 'latency_budget', label: 'Latency (threshold)' }
];

export const ENTITY_COLLECTION_NAME = 'nr1-csg-slo-r';
export const FLOW_COLLECTION_NAME = 'nr1-csg-slo-r-flows';

export const SLO_DEFECTS = [
  { value: '5%', label: '5xx Errors' },
  { value: '400', label: '400 Bad Request' },
  { value: '401', label: '401 Unauthorized' },
  { value: '403', label: '403 Forbidden' },
  { value: '404', label: '404 Not Found' },
  { value: '409', label: '409 Conflict' },
  { value: 'apdex_frustrated', label: 'Apdex Frustrated' }
];
