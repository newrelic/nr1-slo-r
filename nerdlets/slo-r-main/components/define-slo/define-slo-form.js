import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, HeadingText, Button, TextField } from 'nr1';
import { Formik } from 'formik';
import { Multiselect } from 'react-widgets';
import * as Yup from 'yup';

import { SLO_INDICATORS, SLO_DEFECTS } from '../../../shared/constants';
import Dropdown from './dropdown';
import TagsDropdown from './tags-dropdown';

export default class DefineSLOForm extends Component {
  renderAlerts(values, alertOptions, setFieldValue) {
    if (!values.indicator || values.indicator === 'error_budget') {
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
              setFieldValue('alerts', value);

              this.setState(prevState => ({
                alertOptions: [...prevState.alertOptions, value]
              }));
            }}
            textField="policy_name"
            className="transactions-dropdown react-select-dropdown"
            placeholder="Select one or more Alerts"
            onChange={value => setFieldValue('alerts', value)}
            defaultValue={values.alerts}
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

  renderErrorBudget(values, transactionOptions, setFieldValue) {
    if (values.indicator !== 'error_budget') {
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
              onChange={value => setFieldValue('defects', value)}
              defaultValue={values.defects}
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
              onChange={value => setFieldValue('transactions', value)}
              defaultValue={values.transactions}
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

  VALIDATION_SCHEMA = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    description: '',
    tags: [],
    target: '',
    indicator: '',
    transactions: [],
    defects: [],
    alerts: []
  });

  render() {
    const { isNew, isOpen, onClose, tags } = this.props;
    return (
      <Modal hidden={!isOpen} onClose={onClose}>
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
        <Formik
          initialValues={{
            name: '',
            description: '',
            tags: [],
            target: '',
            indicator: '',
            transactions: [],
            defects: [],
            alerts: []
          }}
          validationSchema={this.VALIDATION_SCHEMA}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            console.log('DefineSLOForm -> render -> values', values);
            resetForm();
          }}
        >
          {({ values, errors, setFieldValue, handleSubmit, resetForm }) => (
            <form onSubmit={handleSubmit}>
              {console.log('DefineSLOForm -> errors', errors)}
              <TextField
                label="SLO name"
                className="define-slo-input"
                onChange={e => setFieldValue('name', e.target.value)}
                value={values.name}
              />
              <TextField
                label="Description"
                className="define-slo-input"
                placeholder="Provide a description"
                onChange={e => setFieldValue('description', e.target.value)}
                value={values.description}
              />
              <TagsDropdown
                tags={tags}
                selectedTags={values.tags}
                // handleClickReset={this.handleClickReset}
                handleTagChange={tag => setFieldValue('tags', tag)}
              />
              <TextField
                label="Target Attainment"
                className="define-slo-input"
                onChange={e => setFieldValue('target', e.target.value)}
                value={values.target}
              />
              <Dropdown
                label="Indicator"
                value={values.indicator}
                onChange={value => setFieldValue('indicator', value)}
                items={SLO_INDICATORS}
              />
              {this.renderErrorBudget(values, [], setFieldValue)}
              {this.renderAlerts(values, [], setFieldValue)}
              <Button
                type={Button.TYPE.Secondary}
                onClick={() => {
                  resetForm();
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button type={Button.TYPE.PRIMARY} onClick={handleSubmit}>
                {isNew ? 'Add new service' : 'Update service'}
              </Button>
            </form>
          )}
        </Formik>
      </Modal>
    );
  }
}

DefineSLOForm.propTypes = {
  tags: PropTypes.array.isRequired,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  isNew: PropTypes.bool
};
