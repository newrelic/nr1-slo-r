import { EntityStorageMutation, EntityStorageQuery } from 'nr1';
import { ENTITY_COLLECTION_NAME } from '../constants';

const uuid = require('uuid/v4');

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

// TO DO - Return null, undefined, false?
export const fetchDocumentById = async function({ entityGuid, documentId }) {
  if (!entityGuid || !documentId) {
    return null;
  }

  const query = {
    actionType: EntityStorageQuery.FETCH_POLICY_TYPE.NO_CACHE,
    collection: ENTITY_COLLECTION_NAME,
    documentId,
    entityGuid
  };

  const result = await EntityStorageQuery.query(query);
  const documents = result.data || null;

  return documents;
};

export const writeSloDocument = async function({ entityGuid, document }) {
  // Add a documentId to any we update that are missing one
  if (!document.documentId) {
    document.documentId = uuid();
  }

  const __write_mutation = {
    actionType: EntityStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
    collection: ENTITY_COLLECTION_NAME,
    entityGuid: entityGuid,
    documentId: document.documentId,
    document
  };

  // need to have a real slo name - this is previously validated but acts as a double check.
  if (!document.name) {
    throw new Error('Error - no SLO name provided');
  }

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
  }

  if (document.target === '') {
    return false;
  }

  if (document.slogroup === '') {
    return false;
  }

  // Error Driven SLO
  if (document.indicator === 'error_budget') {
    if (document.transactions.length === 0 || document.defects.length === 0) {
      return false;
    }
  }

  // Alert Driven SLO
  if (document.indicator !== 'error_budget') {
    if (document.alerts.length === 0) {
      return false;
    }
  }

  return true;
};

export const sloDocumentModel = {
  create: function() {
    return {
      documentId: uuid(),
      name: '',
      slogroup: '',
      target: '',
      alerts: [],
      indicator: '',
      defects: [],
      transactions: [],
      slo_r_version: '1.0.1',
      description: ''
    };
  }
};
