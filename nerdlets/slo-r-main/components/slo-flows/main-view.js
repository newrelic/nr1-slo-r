import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StackItem, Button, AccountsQuery, AccountStorageQuery, AccountStorageMutation, Spinner, Modal, HeadingText } from 'nr1';
import { EmptyState } from '@newrelic/nr1-community';
import { Multiselect } from 'react-widgets';
import isEqual from 'lodash.isequal';

import FlowList from './flow-list';
import ViewFlow from './view-flow';
import { fetchFlowDocuments, writeFlowDocument } from '../../../shared/services/flow-documents';
import DefineFlowForm from './define-flow-form';
import { FLOW_COLLECTION_NAME } from '../../../shared/constants';

export default class MainView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isProcessing: true,
      isSaving: false,
      isDeleteFlowModalActive: false,
      flows: [],
      accounts: [],
      openAddFlowMenu: false,
      openViewFlowModal: false,
      flowToBeEdited: undefined,
      flowToBeDeleted: undefined,
      flowToBeViewed: {},
    };
  }

  async getAccounts() {
    let resp = await AccountsQuery.query();

    if (resp.errors) {
      console.debug('Error fetching accounts');
      console.debug(resp.errors);
    } else {
      let accts = []
      resp.data.forEach(acct => {
        accts.push({ value: acct.id, label: acct.name });
      })
      this.setState({ accounts: accts })
    }
  }

  componentDidMount = async () => { //save to accountStorage
    let { slos } = this.props;
    let { accounts } = this.state;
    let formatted = []
    slos.forEach(s => {
      formatted.push({ value: s.id, label: s.document.name, entity: s.document.entityGuid })
    })
    await this.getAccounts();
    await this.fetchFlows();
    this.setState({ formattedSlos: formatted, isProcessing: false });
  };

  // componentDidUpdate = async prevProps => {
  //   // if (!this.areSlosEqual(prevProps.slos, this.props.slos)) {
  //   //   const { selectedSlosIds } = this.state;
  //   //   this.clearSelectionForNonExisting(selectedSlosIds);
  //   // }
  // };

  fetchFlows = async () => {
    const { accounts } = this.state;
    let flows = [];
    const proms = accounts.map(acct => {
      return fetchFlowDocuments(acct);
    })

    const results = await Promise.all(proms);
    results.forEach(result => flows.push(...result));
    this.setState({ flows: flows });
  }

  handleNewFlowOpen = () => {
    this.setState({ openAddFlowMenu: true })
  }

  handleEditFlow = flow => {
    this.setState({ flowToBeEdited: flow, openAddFlowMenu: true });
  };

  handleViewFlow = flow => {
    this.setState({ flowToBeViewed: flow, openViewFlowModal: true })
  }

  writeNewFlowDocument = async document => {
    await writeFlowDocument({
      document
    });
  };

  handleViewClose = async slos => {
    const { flowToBeViewed } = this.state;
    let flowCopy = flowToBeViewed

    if (flowToBeViewed.slos.length === slos.length && flowToBeViewed.slos.every((val, index) => val.value === slos[index].documentId) == false) {
        this.setState({ isProcessing: true });
        flowCopy.slos.sort((a, b) => {
          return slos.findIndex(s => s.documentId === a.value) - slos.findIndex(s => s.documentId === b.value);
        })
        await this.writeNewFlowDocument(flowCopy);
        await this.fetchFlows();
        this.setState({ isProcessing: false });
    }

    this.setState({ flowToBeViewed: {}, openViewFlowModal: false });
  }

  deleteFlowCallback = document => {
    this.setState({
      flowToBeDeleted: document,
      isDeleteFlowModalActive: true
    });
  };

  deleteFlow = async () => {
    this.setState({ isProcessing: true });
    let { flowToBeDeleted } = this.state;

    const mutation = {
      accountId: flowToBeDeleted.account,
      actionType: AccountStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
      collection: FLOW_COLLECTION_NAME,
      documentId: flowToBeDeleted.documentId
    }

    const result = await AccountStorageMutation.mutate(mutation);

    if (!result) {
      throw new Error('Error deleting Flow document from Account Storage');
    }
    await this.fetchFlows();
    this.setState({ isDeleteFlowModalActive: false, isProcessing: false });
  }

  renderAddNewFlow() {
    const { accounts, formattedSlos, flowToBeEdited, openAddFlowMenu } = this.state;

    return (
      <DefineFlowForm
        accounts={accounts}
        flow={flowToBeEdited}
        slos={formattedSlos}
        isEdit={flowToBeEdited}
        isOpen={openAddFlowMenu}
        onSave={() => this.fetchFlows(accounts)}
        onClose={() =>
          this.setState({flowToBeEdited: undefined, openAddFlowMenu: false})
        }
      />
    )
  }

  render() {
    const {
      accounts,
      isDeleteFlowModalActive,
      isProcessing,
      flows,
      flowToBeViewed,
      openViewFlowModal
    } = this.state;

    const { slos, timeRange } = this.props;

    let noFlowsSelected = <Spinner />;

    if (flows.length === 0 && !isProcessing) {
      noFlowsSelected = (
        <EmptyState
          buttonText="Define a Flow"
          buttonOnClick={this.handleNewFlowOpen}
          heading="No Flows created"
          description="Flows are designed to aggregate multiple SLOs in the context of a critical service path or user journey."
        />
      );
    }

    if (isProcessing) {
      return <Spinner />
    }

    return (
      <>
        <StackItem grow className="main-content-container">
          {flows.length === 0 ? noFlowsSelected :
            <>
              <Button onClick={this.handleNewFlowOpen}>
                Define a Flow
              </Button>
              <FlowList
                flows={flows}
                toggleViewModal={this.handleViewFlow}
                toggleUpdateModal={this.handleEditFlow}
                deleteCallback={this.deleteFlowCallback}
              />
            </>
          }
          {this.renderAddNewFlow()}
        </StackItem>
        <ViewFlow
          flow={flowToBeViewed}
          isOpen={openViewFlowModal}
          handleClose={this.handleViewClose}
          slos={slos}
          timeRange={timeRange}
        />
        <Modal
          hidden={!isDeleteFlowModalActive}
          onClose={() => this.setState({ isDeleteFlowModalActive: false })}
        >
          <HeadingText type={HeadingText.TYPE.HEADING_2}>
            Are you sure you want to delete this flow?
          </HeadingText>
          <p>
            This cannot be undone. Please confirm whether or not you want to
            delete this flow.
          </p>
          <Button
            type={Button.TYPE.PRIMARY}
            onClick={() => this.setState({ isDeleteFlowModalActive: false })}
          >
            Cancel
          </Button>
          <Button
            type={Button.TYPE.DESTRUCTIVE}
            onClick={this.deleteFlow}
            iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__TRASH}
          >
            Delete
          </Button>
        </Modal>
      </>
    );
  }
}

MainView.propTypes = {
  slos: PropTypes.array.isRequired,
  timeRange: PropTypes.object,
  tags: PropTypes.array.isRequired
};
