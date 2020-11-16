import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, HeadingText } from 'nr1';
import { Formik } from 'formik';
import { Multiselect } from 'react-widgets';
import * as Yup from 'yup';
import TextField from './text-field-wrapper';
import Dropdown from './dropdown';

import { writeFlowDocument } from '../../../shared/services/flow-documents';

export default class DefineFlowForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isProcessing: false
    };
  }

  writeNewFlowDocument = async document => {
    await writeFlowDocument({
      document
    });
  };

  render() {
    const { isProcessing } = this.state;
    const {
      accounts,
      flow,
      slos,
      isEdit,
      isOpen,
      onClose,
      onSave
    } = this.props;

    return (
      <Modal hidden={!isOpen} onClose={onClose}>
        <HeadingText type={HeadingText.TYPE.HEADING_2}>
          Define a Flow
        </HeadingText>
        <p>
          Please provide the information needed to create this Flow below. You
          will be able to edit this information in the future.
        </p>
        <Formik
          initialValues={
            flow || {
              name: '',
              description: '',
              owner: '',
              account: '',
              slos: []
            }
          }
          enableReinitialize
          validateOnChange={false}
          validateOnBlur={false}
          validationSchema={Yup.object().shape({
            name: Yup.string().required('Name is required'),
            owner: Yup.string().required('Owner is required'),
            account: Yup.number()
              .typeError('Account must be a positive number')
              .required('Account is required'),
            slos: Yup.array().min(2, 'Two or more slos must be selected')
          })}
          onSubmit={async (values, { resetForm }) => {
            this.setState({ isProcessing: true });
            const newFlow = {
              ...values
            };

            await this.writeNewFlowDocument(newFlow);
            this.setState({ isProcessing: false });

            onSave();
            resetForm();
            onClose();
          }}
        >
          {({ values, errors, setFieldValue, handleSubmit, resetForm }) => (
            <form onSubmit={handleSubmit}>
              <TextField
                label="Flow Name"
                onChange={e => setFieldValue('name', e.target.value)}
                value={values.name}
              />
              <span className="text-field__validation">{errors.name}</span>
              <TextField
                label="Owner"
                onChange={e => setFieldValue('owner', e.target.value)}
                value={values.owner}
              />
              <span className="text-field__validation">{errors.owner}</span>
              <TextField
                label="Description"
                onChange={e => setFieldValue('description', e.target.value)}
                value={values.description}
              />
              <div>
                <h4
                  style={{ display: 'inline-flex' }}
                  className="dropdown-label"
                >
                  Account
                </h4>
                <small
                  style={{ marginLeft: '12px', display: 'inline-flex' }}
                  className="input-description"
                >
                  Select an account to save this flow to.
                </small>
                <Dropdown
                  value={values.account}
                  onChange={value => setFieldValue('account', value)}
                  items={accounts}
                />
                <span className="text-field__validation">{errors.account}</span>
              </div>
              <h4 style={{ display: 'inline-flex' }} className="dropdown-label">
                SLOs
              </h4>
              <small
                style={{ marginLeft: '12px', display: 'inline-flex' }}
                className="input-description"
              >
                Select two or more SLOs to aggregate into this flow.
              </small>
              <div style={{ paddingBottom: '10px' }}>
                <Multiselect
                  style={{ paddingBottom: '10px' }}
                  data={slos}
                  valueField="value"
                  value={values.slos}
                  textField="label"
                  className="transactions-dropdown react-select-dropdown"
                  placeholder="Select two or more SLOs"
                  onChange={value => setFieldValue('slos', value)}
                />
                <span className="multiselect__validation">{errors.slos}</span>
              </div>
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
                {isEdit ? 'Update Flow' : 'Add New Flow'}
              </Button>
            </form>
          )}
        </Formik>
      </Modal>
    );
  }
}

DefineFlowForm.propTypes = {
  flow: PropTypes.object,
  slos: PropTypes.array.isRequired,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  isEdit: PropTypes.bool,
  accounts: PropTypes.array.isRequired
};
