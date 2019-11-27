import React from 'react';
import PropTypes from 'prop-types';

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

export default class SloForm extends React.Component {
  static propTypes = {
    entityGuid: PropTypes.string,
    documentId: PropTypes.string,
    createDocumentCallback: PropTypes.func,
    modalToggleCallback: PropTypes.func
  };

  static defaultProps = {
    documentId: undefined
  };

  constructor(props) {
    super(props);

    this.state = {
      newSloDocument: sloDocumentModel.create(),
      updateSloDocument: undefined,

      // Related data
      entityDetails: null,
      transactions: null,

      // Form options
      alertOptions: [],
      defectOptions: [
        { value: '5%', label: '5xx Errors' },
        { value: '400', label: '400 Bad Request' },
        { value: '401', label: '401 Unauthorized' },
        { value: '403', label: '403 Forbidden' },
        { value: '404', label: '404 Not Found' },
        { value: '409', label: '409 Conflict' },
        { value: 'apdex_frustrated', label: 'Apdex Frustrated' }
      ],
      transactionOptions: []
    };

    this.addNewHandler = this.addNewHandler.bind(this);
  }

  async componentDidMount() {
    const { entityGuid, documentId } = this.props;

    if (this.props.documentId !== undefined) {
      await this.fetchDocumentById({ entityGuid, documentId });
    }

    // TO DO - change to something that executes all 3 at once
    // Either promise.all or callbacks
    await this._getEntityInformation();
    await this._updateAlertConfig();
    await this._loadEntityTransactions();
  }

  async componentDidUpdate(prevProps) {
    const { entityGuid, documentId } = this.props;

    if (prevProps.documentId !== documentId) {
      await this.fetchDocumentById({ entityGuid, documentId });
    }

    if (prevProps.entityGuid !== entityGuid) {
      await this._getEntityInformation();
      await this._updateAlertConfig();
      await this._loadEntityTransactions();
    }
  }

  async fetchDocumentById({ entityGuid, documentId }) {
    const response = await fetchDocumentById({ entityGuid, documentId });

    this.setState({
      updateSloDocument: response
    });
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
    const { entityDetails, newSloDocument } = this.state;

    if (entityDetails && newSloDocument.alerts.length < 1) {
      const __query = `{
            actor {
              account(id: ${entityDetails.accountId}) {
                nrql(query: "SELECT count(*) FROM SLOR_ALERTS SINCE 12 MONTHS AGO FACET policy_name") {
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

    // we only want to run this the one time to gather transactions
    if (entityDetails && transactions === null) {
      const __query = `{
            actor {
              account(id: ${entityDetails.accountId}) {
                nrql(query: "SELECT count(*) FROM Transaction WHERE appName='${entityDetails.appName}' SINCE 1 MONTH AGO FACET name LIMIT 100") {
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
  addNewHandler(e) {
    // prevent default used to stop form submission to iframe
    e.preventDefault();

    const { entityDetails, newSloDocument } = this.state;
    const isValid = validateSlo(newSloDocument);

    if (!isValid) {
      // eslint-disable-next-line no-alert
      alert(
        'Problem with SLO definition! Please validate you have an SLO Name, Organization, and Target defined. Also ensure your Error Budget includes at least one transaction and one defect, or your Alert driven SLO includes an Alert.'
      );
      return;
    }

    let formattedSelectedDefects = '';

    if (formattedSelectedDefects) {
      formattedSelectedDefects = newSloDocument.defects.map(defect => {
        return defect.value;
      });
    }

    // assemble the document object
    // the SLO definition document we are about to write to nerdstore
    const __slo_document = {
      name: newSloDocument.name,
      organization: newSloDocument.organization,
      target: newSloDocument.target,
      type: newSloDocument.type,
      alerts: newSloDocument.alerts,
      defects: formattedSelectedDefects,
      transactions: newSloDocument.transactions,
      entityGuid: entityDetails.entityGuid,
      accountId: entityDetails.accountId,
      accountName: entityDetails.accountName,
      language: entityDetails.language,
      appName: entityDetails.appName
    };

    // write the document
    this.writeNewSloDocument(__slo_document);
  }

  /*
   * Add to NerdStorage and navigate
   */
  async writeNewSloDocument(_slo) {
    const { entityGuid } = this.props;

    const { mutation, result } = await writeSloDocument({ entityGuid, _slo });
    this.props.createDocumentCallback({ document: mutation, response: result });

    // TO DO - reset this.state.newSloDocument if successful, keep if error?
    if (result) {
      this.setState({ newSloDocument: sloDocumentModel.create() });
    }
  }

  inputHandler({ field, value }) {
    this.setState(previousState => {
      const updatedDocument = {
        ...previousState.newSloDocument
      };
      updatedDocument[field] = value;

      return {
        ...previousState,
        newSloDocument: updatedDocument
      };
    });
  }

  getValue({ field }) {
    const { documentId } = this.props;
    const { newSloDocument, updateSloDocument } = this.state;

    if (documentId && !updateSloDocument) {
      // console.debug(documentId);
      // console.debug(updateSloDocument);
      throw new Error('Error populating document for edit');
    }

    if (documentId && updateSloDocument) {
      const value = updateSloDocument[field];
      return value;
    }

    if (!documentId && this.state.newSloDocument) {
      return newSloDocument[field];
    }
  }

  renderErrorBudget() {
    const { defectOptions, newSloDocument, transactionOptions } = this.state;

    if (newSloDocument.type !== 'error_budget') {
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
              data={defectOptions}
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
    const { newSloDocument } = this.state;
    if (newSloDocument.type === 'error_budget') {
      return null;
    }

    if (newSloDocument.type === '') {
      return null;
    }

    return (
      <div className="error-budget-dependancy">
        <div className="alerts-dropdown-container">
          <h4 className="dropdown-label">Alerts</h4>
          <Multiselect
            data={this.state.alertOptions}
            valueField="policy_name"
            value={this.state.newSloDocument.alerts}
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
            policy name of an Alert you your like to associate with this SLO.
            For more information about configuring alerts to be used with SLO/R
            please see the "Configuring Alerts" section of the SLO/R readme
            (https://github.com/newrelic/nr1-csg-slo-r).
          </small>
        </div>
      </div>
    );
  }

  renderFormFields() {
    const { documentId } = this.props;
    const { updateSloDocument } = this.state;

    // Don't render until we've fetched the document
    if (!documentId || !updateSloDocument) {
      return null;
    }

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
          label="organization"
          className="define-slo-input"
          onChange={() =>
            this.inputHandler({
              field: 'organization',
              value: event.target.value
            })
          }
          value={this.getValue({ field: 'organization' })}
        />

        <TextField
          label="Target Attainment"
          className="define-slo-input"
          onChange={() =>
            this.inputHandler({
              field: 'target',
              value: event.target.value
            })
          }
          value={this.getValue({ field: 'target' })}
        />

        <Dropdown
          title={this.getValue({ field: 'type' })}
          label="Type"
          className="define-slo-input"
        >
          <DropdownItem
            onClick={() => {
              this.inputHandler({
                field: 'type',
                value: 'error_budget'
              });
            }}
          >
            Error budget
          </DropdownItem>
          <DropdownItem
            onClick={() =>
              this.inputHandler({
                field: 'type',
                value: 'availability'
              })
            }
          >
            Availablility
          </DropdownItem>
          <DropdownItem
            onClick={() =>
              this.inputHandler({
                field: 'type',
                value: 'capacity'
              })
            }
          >
            Capacity
          </DropdownItem>
          <DropdownItem
            onClick={() =>
              this.inputHandler({
                field: 'type',
                value: 'latency'
              })
            }
          >
            Latency
          </DropdownItem>
        </Dropdown>
      </>
    );
  }

  render() {
    // const { updateSloDocument, transactionOptions } = this.state;
    return (
      <>
        <HeadingText type={HeadingText.TYPE.HEADING_2}>
          Define an SLO
        </HeadingText>
        <p>
          Please provide the information needed to create this SLO below. You
          will be able to edit this information in the future.
        </p>

        {this.renderFormFields()}
        {this.renderErrorBudget()}
        {this.renderAlerts()}

        <Button
          type={Button.TYPE.Secondary}
          onClick={() => this.props.modalToggleCallback()}
        >
          Cancel
        </Button>
        <Button type={Button.TYPE.PRIMARY} onClick={this.addNewHandler}>
          Add new service
        </Button>
      </>
    );
  }
}
