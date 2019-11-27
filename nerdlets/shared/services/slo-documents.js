import { EntityStorageMutation, EntityStorageQuery } from 'nr1';
import { ENTITY_COLLECTION_NAME } from '../constants';

export const fetchSloDocuments = async function({ entityGuid }) {
  const _query = {
    actionType: EntityStorageQuery.FETCH_POLICY_TYPE.NO_CACHE,
    entityGuid: entityGuid,
    collection: ENTITY_COLLECTION_NAME
  };

  const result = await EntityStorageQuery.query(_query);
  const documents = result.data || [];

  return documents;
};

export const writeSloDocument = async function({ entityGuid, _slo }) {
  // console.debug("SLO DOCUMENT ---> " + JSON.stringify(_slo));
  const __write_mutation = {
    actionType: EntityStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
    collection: ENTITY_COLLECTION_NAME,
    entityGuid: entityGuid,
    documentId: _slo.name,
    document: _slo
  }; // __write_mutation

  // need to have a real slo name - this is previously validated but acts as a double check.
  if (!_slo.name) {
    throw new Error('Error - no SLO name provided');
  }

  // eslint-disable-next-line no-console
  // console.debug(JSON.stringify(__write_mutation, null, 2));
  const __write_result = await EntityStorageMutation.mutate(__write_mutation);

  if (!__write_result) {
    throw new Error('Error writing SLO Document to Entity Storage');
  }

  return { mutation: __write_mutation, result: __write_result };
};

export const validateSlo = function(document) {
  if (document.name === '') {
    return false;
  } // if

  if (document.target === '') {
    return false;
  } // if

  if (document.organization === '') {
    return false;
  } // if

  if (document.type === 'error_budget') {
    if (document.transactions.length === 0 || document.defects.length === 0) {
      return false;
    } // if
  } // if
  else {
    // eslint-disable-next-line no-lonely-if
    if (document.alerts.length === 0) {
      return false;
    } // if
  } // else

  return true;
};

export const sloDocumentModel = {
  create: function() {
    return {
      name: '',
      organization: '',
      target: '',
      alerts: [],
      type: '',
      defects: '',
      transactions: '',
      slo_r_version: '1.0.1'
    };
  }
};
