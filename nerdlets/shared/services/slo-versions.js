import { writeSloDocument } from './slo-documents';

export const validateSLODocVersion = async function(_documents) {
  let __versionedDocuments = [];

  try {
    _documents.forEach(_document => {
      if (_document.document.slo_r_version === '1.0.2') {
        __versionedDocuments.push(v102Update(_document));
      } // if
      else if (_document.document.slo_r_version === '1.0.1') {
        __versionedDocuments.push(v102Update(_document));
      } // else if
      else {
        __versionedDocuments.push(_document);
      } // else
    });
  } catch (_err) {
    // try
    __versionedDocuments = _documents;
  } // catch

  return __versionedDocuments;
};

/**
 * Updates the given document from v102 to the most recent version
 * @param {*} _document
 */
const v102Update = function(_document) {
  let __updated_document = _document;
  const __updated_transactions = [];

  try {
    if (_document.document.indicator === 'error_budget') {
      _document.document.transactions.forEach(_transaction => {
        __updated_transactions.push(_transaction.replace(/\\/g, '%'));
      });
    } // if

    _document.document.slo_r_version = currentVersion;
    _document.document.transactions = __updated_transactions;
    const document = _document.document;
    const entityGuid = _document.document.entityGuid;
    writeSloDocument({ entityGuid, document });

    // finalize the changes
    __updated_document = _document;
  } catch (_err) {
    // try
    /* eslint-disable no-console */
    console.error(
      `Problem updating slo_document from v1.0.1/2 to ${currentVersion}, old version maintained`,
      _err
    );
    /* eslint-enable */
  } // catch

  return __updated_document;
}; // v102Update

const currentVersion = '1.0.5';
