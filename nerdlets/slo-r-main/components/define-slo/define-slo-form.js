import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Spinner, Modal, HeadingText, Button, NerdGraphQuery } from 'nr1';
import { Formik } from 'formik';
import { Multiselect } from 'react-widgets';
import get from 'lodash.get';
import * as Yup from 'yup';

import { fetchEntity } from '../../../shared/services/entity';
import { SLO_INDICATORS, SLO_DEFECTS } from '../../../shared/constants';
import { writeSloDocument } from '../../../shared/services/slo-documents';
import { timeRangeToNrql } from '../../../shared/helpers';
import Dropdown from './dropdown';
import TagsDropdown from './tags-dropdown';
import TextField from './text-field-wrapper';
import { getTags } from '../../queries';

export default class DefineSLOForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: [],
      entityDetails: undefined,
      transactions: [],
      alerts: [],
      isProcessing: false
    };
  }

  componentDidUpdate = async prevProps => {
    if (this.props.slo && this.props.slo !== prevProps.slo) {
      await this.refreshLists();
    }
  };

  refreshLists = async () => {
    this.setState({ isProcessing: true });

    const {
      slo: { entityGuid, indicator }
    } = this.props;

    await this.getEntityInformation(entityGuid);
    const tags = await this.fetchEntityTags(entityGuid);

    if (indicator === 'error_budget') {
      await this.fetchEntityTransactions();
    } else {
      await this.fetchAlerts();
    }

    this.setState({ tags });
    this.setState({ isProcessing: false });
  };

  writeNewSloDocument = async document => {
    const { entityDetails } = this.state;

    await writeSloDocument({
      entityGuid: entityDetails.entityGuid,
      document
    });
  };

  fetchEntityTransactions = async () => {
    const { entityDetails } = this.state;
    const { timeRange } = this.props;

    const timeRangeNrql = timeRangeToNrql(timeRange);

    if (entityDetails) {
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

      this.setState({ transactions });
    }
  };

  getEntityInformation = async entityGuid => {
    const entityDetails = await fetchEntity({ entityGuid });
    this.setState({ entityDetails });
  };

  fetchEntityTags = async entityGuid => {
    const response = await getTags(entityGuid);
    return get(response, 'data.actor.entity.tags');
  };

  fetchAlerts = async () => {
    const { entityDetails } = this.state;

    if (entityDetails) {
      const __query = `{
            actor {
              account(id: ${entityDetails.accountId}) {
                nrql(query: "SELECT count(*) FROM SLOR_ALERTS SINCE 7 days ago FACET policy_name") {
                  results
                }
              }
            }
          }`;

      const __result = await NerdGraphQuery.query({ query: __query });

      this.setState({
        alerts: __result.data.actor.account.nrql.results
      });
    }
  };

  renderAlerts(values, setFieldValue, errors) {
    if (!values.indicator || values.indicator === 'error_budget') {
      return null;
    }

    const { alerts } = this.state;

    return (
      <div className="error-budget-dependancy">
        <div className="alerts-dropdown-container">
          <h4 className="dropdown-label">Alerts</h4>
          <Multiselect
            data={alerts}
            valueField="policy_name"
            value={values.alerts}
            allowCreate
            onCreate={value => {
              setFieldValue('alerts', value);
            }}
            textField="policy_name"
            className="transactions-dropdown react-select-dropdown"
            placeholder="Select one or more Alerts"
            onChange={value => setFieldValue('alerts', value)}
            defaultValue={values.alerts}
          />
          <span className="multiselect__validation">{errors.alerts}</span>

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

  renderErrorBudget(values, setFieldValue, errors) {
    if (values.indicator !== 'error_budget') {
      return null;
    }

    const { transactions } = this.state;

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
              onChange={value => setFieldValue('defects', value)}
              defaultValue={values.defects}
            />

            <span className="multiselect__validation">{errors.defects}</span>
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
              data={transactions.map(({ name }) => name)}
              className="transactions-dropdown react-select-dropdown"
              placeholder="Select one or more transactions"
              onChange={value => setFieldValue('transactions', value)}
              defaultValue={values.transactions}
            />
            <span className="multiselect__validation">
              {errors.transactions}
            </span>

            <small className="input-description">
              Select one or more transactions evaluate for defects for this
              error budget.
            </small>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { slo, isEdit, isOpen, onClose, onSave, entities } = this.props;
    const { tags, isProcessing } = this.state;

    return (
      <Modal hidden={!isOpen} onClose={onClose}>
        <HeadingText type={HeadingText.TYPE.HEADING_2}>
          Define an SLO
          {isProcessing && <Spinner inline />}
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
        <Formik
          initialValues={
            slo || {
              name: '',
              description: '',
              tags: [],
              target: '',
              indicator: '',
              transactions: [],
              defects: [],
              alerts: []
            }
          }
          enableReinitialize
          validateOnChange={false}
          validateOnBlur={false}
          validationSchema={Yup.object().shape({
            name: Yup.string().required('Name is required'),
            entityGuid: Yup.string().required('Entity is required'),
            tags: Yup.array().min(1, 'At least one tag must be selected'),
            target: Yup.number()
              .typeError('Target must be positive number')
              .positive('Target must be positive number')
              .max(100, "Target must be positive number and can't exceed 100")
              .required('Target is required'),
            indicator: Yup.string().required('Indicator is required'),
            alerts: Yup.array().when('indicator', {
              is: 'error_budget',
              otherwise: Yup.array().min(
                1,
                'At least one alert must be selected'
              )
            }),
            transactions: Yup.array().when('indicator', {
              is: 'error_budget',
              then: Yup.array().min(
                1,
                'At least one transaction must be selected'
              )
            }),
            defects: Yup.array().when('indicator', {
              is: 'error_budget',
              then: Yup.array().min(1, 'At least one defect must be selected')
            })
          })}
          onSubmit={async (values, { resetForm }) => {
            this.setState({ isProcessing: true });
            const { entityDetails } = this.state;

            const newDocument = {
              ...values,
              entityGuid: entityDetails.entityGuid,
              accountId: entityDetails.accountId,
              accountName: entityDetails.accountName,
              language: entityDetails.language,
              appName: entityDetails.appName
            };

            await this.writeNewSloDocument(newDocument);
            this.setState({ isProcessing: false });

            onSave();
            resetForm();
            onClose();
          }}
        >
          {({ values, errors, setFieldValue, handleSubmit, resetForm }) => (
            <form onSubmit={handleSubmit}>
              <div>
                <Dropdown
                  label="Entity"
                  value={values.entityGuid}
                  disabled={values.entityGuid}
                  onChange={async value => {
                    this.setState({ isProcessing: true });
                    await this.getEntityInformation(value);
                    const tags = await this.fetchEntityTags(value);

                    this.setState({ tags });
                    setFieldValue('entityGuid', value);
                    setFieldValue('tags', []);
                    this.setState({ isProcessing: false });
                  }}
                  items={entities.map(({ guid, name }) => ({
                    label: name,
                    value: guid
                  }))}
                />
                <span className="text-field__validation">
                  {errors.entityGuid}
                </span>
              </div>
              {values.entityGuid && (
                <>
                  <TextField
                    label="SLO name"
                    onChange={e => setFieldValue('name', e.target.value)}
                    value={values.name}
                    validationText={errors.name}
                  />
                  <TextField
                    label="Description"
                    onChange={e => setFieldValue('description', e.target.value)}
                    value={values.description}
                  />
                  <div>
                    <TagsDropdown
                      tags={tags}
                      selectedTags={values.tags}
                      handleTagChange={tag => setFieldValue('tags', tag)}
                    />
                    <span className="text-field__validation">
                      {errors.tags}
                    </span>
                  </div>
                  <TextField
                    label="Target Attainment"
                    onChange={e => setFieldValue('target', e.target.value)}
                    value={values.target}
                    validationText={errors.target}
                  />
                  <div>
                    <Dropdown
                      label="Indicator"
                      value={values.indicator}
                      onChange={async value => {
                        this.setState({ isProcessing: true });
                        if (value === 'error_budget') {
                          await this.fetchEntityTransactions();
                        } else {
                          await this.fetchAlerts();
                        }
                        setFieldValue('indicator', value);
                        this.setState({ isProcessing: false });
                      }}
                      items={SLO_INDICATORS}
                    />
                    <span className="text-field__validation">
                      {errors.indicator}
                    </span>
                  </div>
                  {this.renderErrorBudget(values, setFieldValue, errors)}
                  {this.renderAlerts(values, setFieldValue, errors)}
                </>
              )}

              <Button
                type={Button.TYPE.Secondary}
                onClick={() => {
                  resetForm();
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                loading={isProcessing}
                type={Button.TYPE.PRIMARY}
                onClick={handleSubmit}
              >
                {isEdit ? 'Update service' : 'Add new service'}
              </Button>
            </form>
          )}
        </Formik>
      </Modal>
    );
  }
}

DefineSLOForm.propTypes = {
  slo: PropTypes.object,
  entities: PropTypes.array.isRequired,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  isEdit: PropTypes.bool,
  timeRange: PropTypes.object.isRequired
};
