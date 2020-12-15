import {
  EntityStorageMutation,
  EntityStorageQuery,
  NerdGraphMutation
} from 'nr1';
import { ENTITY_COLLECTION_NAME } from '../constants';
import { validateSLODocVersion } from './slo-versions';

const uuid = require('uuid/v4');

export const fetchSloDocuments = async function({ entityGuid }) {
  const _query = {
    actionType: EntityStorageQuery.FETCH_POLICY_TYPE.NO_CACHE,
    entityGuid: entityGuid,
    collection: ENTITY_COLLECTION_NAME
  };

  const result = await EntityStorageQuery.query(_query);
  const documents = result.data || [];

  // documents.forEach((doc) => {
  //   // console.debug('$$$$$$$ ' + JSON.stringify(doc, null, 2));
  //   console.debug('**** Loaded ' + doc.document.name + ', policy ' + doc.document.alertPolicy + ', docId ' + doc.id);
  // });

  // raggimuffen
  const __versionValidatedDocuments = await validateSLODocVersion(documents);

  return __versionValidatedDocuments;
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

  // raggimuffen
  const __versionValidatedDocuments = await validateSLODocVersion(documents);

  return __versionValidatedDocuments;
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

  if (document.indicator.includes('budget') && document.defects.length === 0) {
    throw new Error('Error - No Defects Selected');
  }

  // console.debug(JSON.stringify(__write_mutation, null, 2));
  const __write_result = await EntityStorageMutation.mutate(__write_mutation);

  /*
    for the purposes of limiting the search of entities to just those having an SLO definition
    we are adding an slor tag to entities with an SLO document written
  */
  const __mutation = `mutation {
    taggingAddTagsToEntity(guid: "${entityGuid}", tags: {key: "slor", values: "true"}) {
      errors {
        message
        type
      }
    }
  }`;

  const __result = await NerdGraphMutation.mutate({ mutation: __mutation });

  if (!__result) {
    /* eslint-disable no-console */
    console.error(`Problem adding slor tag to entity: ${entityGuid}`);
    /* eslint-enable */
  } // if

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

  if (document.tags.length === 0 && document.slogroup === '') {
    return false;
  }

  // Error/Latency Driven SLO
  if (
    document.indicator === 'error_budget' ||
    document.indicator === 'latency_budget'
  ) {
    // console.debug("validating the error or latency budge");
    if (document.transactions !== 'all') {
      // console.error("all???");
      // return 'all';

      if (document.transactions.length === 0 || document.defects.length === 0) {
        /* console.debug(
          'Invalid SLO document - no transactions or defects targeted.'
        ); */
        return false;
      } // if
      else {
        // review the document for problematic transaction characters
        const __updated_transactions = [];
        document.transactions.forEach(_transaction => {
          __updated_transactions.push(_transaction.replace(/\\/g, '%'));
        });

        document.transactions = __updated_transactions;
      } // else
    } // if
  } // if

  // Alert Driven SLO
  if (
    document.indicator !== 'error_budget' &&
    document.indicator !== 'latency_budget'
  ) {
    if (document.alerts.length === 0) {
      console.debug('Invalid SLO document - no alerts targeted.'); // eslint-disable-line no-console
      return false;
    }
    // add validation to ensure we have the alerts object array
    try {
      const __updated_alerts = [];
      document.alerts.forEach(_alert => {
        if (typeof _alert === 'object') {
          if (
            document.alerts[0].policy_name === null ||
            document.alerts[0].policy_name === undefined
          ) {
            /* console.debug(
              `Invalid SLO Alert slkipping unexpected alert defined: ${_alert}`
            ); */
          } // if
          else {
            // just add the alert
            __updated_alerts.push(_alert);
          } // else
        } // if
        else {
          __updated_alerts.push({
            facet: _alert,
            count: 0,
            policy_name: _alert
          });
        } // else
      }); // forEach

      // ensure our transformation of the alerts types was successful.
      if (__updated_alerts.length > 0) {
        document.alerts = __updated_alerts;
      } // if
      else {
        console.debug('Invalid SLO document - no alerts defined after.'); // eslint-disable-line no-console
        return false;
      } // else
    } catch (_err) {
      // try
      console.error('Problem validating SLO Document', _err); // eslint-disable-line no-console
      return false;
    } // catch
  } // if (alert driven SLOs)

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
      slo_r_version: '1.0.5',
      description: '',
      tags: []
    };
  }
};
