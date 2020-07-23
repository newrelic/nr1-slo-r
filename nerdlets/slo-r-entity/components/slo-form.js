import React from 'react';
import PropTypes, { string } from 'prop-types';

import {
  Button,
  Dropdown,
  DropdownItem,
  HeadingText,
  NerdGraphQuery,
  TextField
} from 'nr1';

/** 3rd party */
import { Multiselect } from 'react-widgets';

import {
  validateSlo,
  sloDocumentModel,
  writeSloDocument,
  fetchDocumentById
} from '../../shared/services/slo-documents';

// entities
import { fetchEntity } from '../../shared/services/entity';
import { SLO_INDICATORS, SLO_DEFECTS } from '../../shared/constants';

import { timeRangeToNrql } from '../../shared/helpers';

import OrLine from './or-line';

export default class SloForm extends React.Component {
  static propTypes = {
    entityGuid: PropTypes.string,
    documentId: PropTypes.string,
    upsertDocumentCallback: PropTypes.func,
    modalToggleCallback: PropTypes.func,
    timeRange: PropTypes.object,
    groupList: PropTypes.array
  };

  static defaultProps = {
    documentId: undefined
  };

  constructor(props) {
    super(props);

    this.state = {
      isNew: false,
      document: undefined,
      defaultDocumentFields: sloDocumentModel.create(),

      // Related data
      entityDetails: null,
      transactions: null,

      // Form options populated from nrql
      alertOptions: [],
      transactionOptions: [],

      selectedGroup: null
    };

    if (!props.documentId) {
      this.state.isNew = true;
      this.state.document = sloDocumentModel.create();
    }

    this.upsertHandler = this.upsertHandler.bind(this);
  }

  async componentDidMount() {
    const { documentId, entityGuid } = this.props;

    if (this.props.documentId) {
      await this.getDocumentById({ entityGuid, documentId });
    }

    // TO DO - change to something that executes all 3 at once
    // Either promise.all or callbacks
    await this._getEntityInformation();
    await this._updateAlertConfig();
    await this._loadEntityTransactions();
  }

  async componentDidUpdate(prevProps) {
    const { documentId, entityGuid, timeRange } = this.props;
    const documentChanged = documentId && prevProps.documentId !== documentId;
    const entityChanged = prevProps.entityGuid !== entityGuid;
    const timeRangeChanged = prevProps.timeRange !== timeRange;

    if (documentChanged) {
      await this.getDocumentById({ entityGuid, documentId });
    }

    if (entityChanged) {
      await this._getEntityInformation();
    }

    if (entityChanged || timeRangeChanged) {
      await this._loadEntityTransactions();
      await this._updateAlertConfig();
    }
  }

  async getDocumentById({ entityGuid, documentId }) {
    if (entityGuid && documentId) {
      const response = await fetchDocumentById({ entityGuid, documentId });

      this.setState({
        selectedGroup: response.slogroup,
        document: response,
        isNew: false
      });
    }
  }

  async _getEntityInformation() {
    // get the entityGuid react context
    const { entityGuid } = this.props;

    const entityDetails = await fetchEntity({ entityGuid });
    // console.debug('Context: Entity', __service_entity);

    // set the entity details state
    this.setState({ entityDetails: entityDetails });
  }

  async _updateAlertConfig() {
    const { entityDetails, document } = this.state;
    const { timeRange } = this.props;

    const timeRangeNrql = timeRangeToNrql(timeRange);

    if (entityDetails && document.alerts.length < 1) {
      const __query = `{
            actor {
              account(id: ${entityDetails.accountId}) {
                nrql(query: "SELECT count(*) FROM SLOR_ALERTS ${timeRangeNrql} FACET policy_name") {
                  results
                }
              }
            }
          }`;

      const __result = await NerdGraphQuery.query({ query: __query });
      this.setState({
        alertOptions: __result.data.actor.account.nrql.results
      });
    }
  }

  async _loadEntityTransactions() {
    const { entityDetails, transactions } = this.state;
    const { timeRange } = this.props;

    const timeRangeNrql = timeRangeToNrql(timeRange);

    // we only want to run this the one time to gather transactions
    if (entityDetails && transactions === null) {
      const __query = `{
            actor {
              account(id: ${entityDetails.accountId}) {
                nrql(query: "SELECT count(*) FROM Transaction WHERE appName='${entityDetails.appName}' ${timeRangeNrql} FACET name LIMIT 100") {
                  results
                }
              }
            }
          }`;

      const __result = await NerdGraphQuery.query({ query: __query });
      const transactions = __result.data.actor.account.nrql.results;
      const transactionOptions = transactions.map(transaction => {
        return transaction.name;
      });

      this.setState({ transactions, transactionOptions });
    } // if
  }

  /*
   * Handle user submission of a new SLO document
   */
  upsertHandler(e) {
    // prevent default used to stop form submission to iframe
    e.preventDefault();

    const { entityDetails, document } = this.state;
    const isValid = validateSlo(document);

    if (!isValid) {
      // eslint-disable-next-line no-alert
      alert(
        'Problem with SLO definition! Please validate you have an SLO Name, Group, and Target defined. Also ensure your Error Budget includes at least one transaction and one defect, or your Alert driven SLO includes an Alert.'
      );
      return;
    }

    // Merge in entityDetails
    const newDocument = {
      ...document,
      entityGuid: entityDetails.entityGuid,
      accountId: entityDetails.accountId,
      accountName: entityDetails.accountName,
      language: entityDetails.language,
      appName: entityDetails.appName
    };

    // write the document
    this.writeNewSloDocument(newDocument);
  }

  /*
   * Add to NerdStorage and navigate
   */
  async writeNewSloDocument(document) {
    const { entityGuid } = this.props;

    const { mutation, result } = await writeSloDocument({
      entityGuid,
      document
    });

    this.props.upsertDocumentCallback({ document: mutation, response: result });

    if (result) {
      this.setState({ document: sloDocumentModel.create() });
    }
  }

  inputHandler({ field, value }) {
    this.setState(previousState => {
      const updatedDocument = {
        ...previousState.document
      };
      updatedDocument[field] = value;

      return {
        ...previousState,
        document: updatedDocument
      };
    });
  }

  getValue({ field }) {
    const { documentId } = this.props;
    const { document } = this.state;

    // Error loading document for editing
    if (documentId && !document) {
      throw new Error('Error populating document for edit');
    }

    // Find value on the document being edited
    if ((documentId && document) || !documentId) {
      let value = document[field];

      // Get a default value
      if (value === undefined) {
        value = this.state.defaultDocumentFields[field];
      }

      if (value === undefined) {
        throw new Error(`SLO Document field: ${field} not defined`);
      }

      return value;
    }
  }

  dropdownTitleLookup({ name, options }) {
    const value = this.getValue({ field: name });
    const option = options.find(o => o.value === value);

    if (option) {
      return option.label;
    }

    return null;
  }

  renderErrorBudget() {
    const { document, transactionOptions } = this.state;

    if (document.indicator !== 'error_budget') {
      return null;
    }

    return (
      <div>
        <div className="error-budget-dependancy">
          <div className="defects-dropdown-container">
            <h4 className="dropdown-label">Defects</h4>
            <Multiselect
              valueField="value"
              textField="label"
              data={SLO_DEFECTS}
              className="defects-dropdown react-select-dropdown"
              placeholder="Select one or more defects"
              onChange={value =>
                this.inputHandler({
                  field: 'defects',
                  value
                })
              }
              defaultValue={this.getValue({ field: 'defects' })}
            />

            <small className="input-description">
              Defects that occur on the selected transactions will be counted
              against error budget attainment.
            </small>
          </div>
        </div>

        <div className="error-budget-dependancy">
          <div className="transactions-dropdown-container">
            <h4 className="dropdown-label">Transactions</h4>
            <Multiselect
              data={transactionOptions}
              className="transactions-dropdown react-select-dropdown"
              placeholder="Select one or more transactions"
              onChange={value =>
                this.inputHandler({
                  field: 'transactions',
                  value
                })
              }
              defaultValue={this.getValue({ field: 'transactions' })}
            />

            <small className="input-description">
              Select one or more transactions evaluate for defects for this
              error budget.
            </small>
          </div>
        </div>
      </div>
    );
  }

  renderAlerts() {
    const { document, alertOptions } = this.state;
    if (document.indicator === 'error_budget') {
      return null;
    }

    if (document.indicator === '') {
      return null;
    }

    return (
      <div className="error-budget-dependancy">
        <div className="alerts-dropdown-container">
          <h4 className="dropdown-label">Alerts</h4>
          <Multiselect
            data={alertOptions}
            valueField="policy_name"
            value={document.alerts}
            allowCreate
            onCreate={value => {
              this.inputHandler({
                field: 'alerts',
                value
              });

              this.setState(prevState => ({
                alertOptions: [...prevState.alertOptions, value]
              }));
            }}
            textField="policy_name"
            className="transactions-dropdown react-select-dropdown"
            placeholder="Select one or more Alerts"
            onChange={value =>
              this.inputHandler({
                field: 'alerts',
                value
              })
            }
            defaultValue={this.getValue({ field: 'alerts' })}
          />

          <small className="input-description">
            Select one or more Alerts that appear in the SLOR_ALERTS event table
            in Insights, or click the "Add Alert" button below to enter the
            policy name of an Alert you would like to associate with this SLO.
            For more information about configuring alerts to be used with SLO/R
            please see the{' '}
            <a
              href="https://github.com/newrelic/nr1-slo-r"
              target="_blank"
              rel="noopener noreferrer"
            >
              "Configuring Alerts" section of the SLO/R readme
            </a>
            .
          </small>
        </div>
      </div>
    );
  }

  renderFormFields() {
    return (
      <>
        <TextField
          label="SLO name"
          className="define-slo-input"
          onChange={event => {
            this.inputHandler({
              field: 'name',
              value: event.target.value
            });
          }}
          value={this.getValue({ field: 'name' })}
        />

        <TextField
          label="Description"
          className="define-slo-input"
          placeholder="Provide a description"
          onChange={event => {
            this.inputHandler({
              field: 'description',
              value: event.target.value
            });
          }}
          value={this.getValue({ field: 'description' })}
          multiline
        />

        <Dropdown
          title={
            this.props.groupList?.length === 0
              ? 'no groups available'
              : this.state.selectedGroup
          }
          className="define-slo-input"
          label="Select existing SLO group"
          disabled={this.props.groupList?.length === 0}
        >
          <DropdownItem
            onClick={() => {
              this.setState({ selectedGroup: null });
              this.inputHandler({ field: 'slogroup', value: undefined });
            }}
          >
            ''
          </DropdownItem>
          {this.props.groupList?.map((group, index) => (
            <DropdownItem
              key={index}
              onClick={() => {
                this.setState({ selectedGroup: group });
                this.inputHandler({
                  field: 'slogroup',
                  value: group
                });
              }}
            >
              {group}
            </DropdownItem>
          ))}
        </Dropdown>

        <OrLine />

        <TextField
          label="Create new SLO Group"
          disabled={this.state.selectedGroup}
          className="define-slo-input"
          onChange={event => {
            this.inputHandler({
              field: 'slogroup',
              value: event.target.value
            });
          }}
          value={
            this.state.selectedGroup ? '' : this.getValue({ field: 'slogroup' })
          }
        />

        <TextField
          label="Target Attainment"
          className="define-slo-input"
          onChange={event => {
            this.inputHandler({
              field: 'target',
              value: event.target.value
            });
          }}
          value={this.getValue({ field: 'target' })}
        />

        <Dropdown
          title={
            this.dropdownTitleLookup({
              name: 'indicator',
              options: SLO_INDICATORS
            }) || 'Choose an Indicator'
          }
          label="Indicator"
          className="define-slo-input"
        >
          {SLO_INDICATORS.map((indicator, index) => {
            return (
              <DropdownItem
                key={index}
                onClick={() => {
                  this.inputHandler({
                    field: 'indicator',
                    value: indicator.value
                  });
                }}
              >
                {indicator.label}
              </DropdownItem>
            );
          })}
        </Dropdown>
      </>
    );
  }

  render() {
    const { documentId } = this.props;
    const { document, isNew } = this.state;
    const documentIsReady = (documentId && document) || !documentId;

    return (
      <>
        <HeadingText type={HeadingText.TYPE.HEADING_2}>
          Define an SLO
        </HeadingText>
        <p>
          Please provide the information needed to create this SLO below. You
          will be able to edit this information in the future. Looking for
          guidance on{' '}
          <a
            href="https://github.com/newrelic/nr1-slo-r/blob/master/docs/error_slos.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            error driven SLOs
          </a>{' '}
          or{' '}
          <a
            href="https://github.com/newrelic/nr1-slo-r/blob/master/docs/alert_slos.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            alert driven SLOs
          </a>
          ?
        </p>

        {documentIsReady && this.renderFormFields()}
        {documentIsReady && this.renderErrorBudget()}
        {documentIsReady && this.renderAlerts()}

        <Button
          type={Button.TYPE.Secondary}
          onClick={() => this.props.modalToggleCallback()}
        >
          Cancel
        </Button>
        <Button type={Button.TYPE.PRIMARY} onClick={this.upsertHandler}>
          {isNew ? 'Add new service' : 'Update service'}
        </Button>
      </>
    );
  }
}
