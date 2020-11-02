import { AccountStorageMutation, AccountStorageQuery } from 'nr1';
import { FLOW_COLLECTION_NAME } from '../constants';

const uuid = require('uuid/v4');

export const fetchFlowDocuments = async function(account) {
  const _query = {
    accountId: account.value,
    collection: FLOW_COLLECTION_NAME
  };

  const result = await AccountStorageQuery.query(_query);
  const documents = result.data || [];

  return documents;

  // // raggimuffen
  // const __versionValidatedDocuments = await validateSLODocVersion(documents);
  //
  // return __versionValidatedDocuments;
};

export const fetchAnAccountFlowDocuments = async function(account) {
  const _query = {
    accountId: account,
    collection: FLOW_COLLECTION_NAME
  };

  const result = await AccountStorageQuery.query(_query);
  const documents = result.data || [];

  return documents;
};

// TO DO - Return null, undefined, false?
// export const fetchDocumentById = async function({ entityGuid, documentId }) {
//   if (!entityGuid || !documentId) {
//     return null;
//   }
//
//   const query = {
//     actionType: EntityStorageQuery.FETCH_POLICY_TYPE.NO_CACHE,
//     collection: ENTITY_COLLECTION_NAME,
//     documentId,
//     entityGuid
//   };
//
//   const result = await EntityStorageQuery.query(query);
//   const documents = result.data || null;
//
//   // raggimuffen
//   const __versionValidatedDocuments = await validateSLODocVersion(documents);
//
//   return __versionValidatedDocuments;
// };

export const writeFlowDocument = async function({ document }) {
  // Add a documentId to any we update that are missing one
  if (!document.documentId) {
    document.documentId = uuid();
  }

  const __write_mutation = {
    actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
    accountId: document.account,
    collection: FLOW_COLLECTION_NAME,
    documentId: document.documentId,
    document
  };

  // need to have a real flow name - this is previously validated but acts as a double check.
  if (!document.name) {
    throw new Error('Error - no Flow name provided');
  }

  // console.debug(JSON.stringify(__write_mutation, null, 2));
  const __write_result = await AccountStorageMutation.mutate(__write_mutation);

  if (!__write_result) {
    throw new Error('Error writing Flow Document to Account Storage');
  }

  return { mutation: __write_mutation, result: __write_result };
};

export const validateFlow = function(document) {
  if (document.name === '') {
    return false;
  }

  if (document.owner === '') {
    return false;
  }

  if (document.account === '') {
    return false;
  }

  if (document.slos.length === 0) {
    return false;
  }

  return true;
};

export const flowDocumentModel = {
  create: function() {
    return {
      documentId: uuid(),
      account: '',
      name: '',
      description: '',
      owner: '',
      slos: [],
      alerts: []
    };
  }
};
