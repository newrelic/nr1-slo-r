import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StackItem, Button, UserStorageMutation, UserStorageQuery } from 'nr1';
import { EmptyState } from '@newrelic/nr1-community';
import { Multiselect } from 'react-widgets';
import isEqual from 'lodash.isequal';

import MainContent from './main-container';
import DefineFlowForm from './define-flow-form';

const SLO_COLLECTION_KEY = 'slo_collection_v1';
const SLO_DOCUMENT_ID = 'slo_document';

export default class MainView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isProcessing: false,
      isSaving: false,
      flows: [],
      openAddFlowMenu: false,
      flowToBeEdited: undefined,
      formattedSlos: []
    };
  }

  componentDidMount = async () => { //save to accountStorage
    let { slos } = this.props;
    let formatted = []
    slos.forEach(s => {
      formatted.push({ value: s.id, label: s.document.name })
    })
    this.setState({ formattedSlos: formatted });
    // try {
    //   const { data } = await UserStorageQuery.query({
    //     collection: SLO_COLLECTION_KEY,
    //     documentId: SLO_DOCUMENT_ID
    //   });
    //
    //   this.setState({
    //     aggregatedIds: data.selectedIds,
    //     selectedSlosIds: data.selectedIds
    //   });
    // } finally {
    //   this.setState({
    //     isProcessing: false
    //   });
    // }
  };

  // componentDidUpdate = prevProps => {
  //   if (!this.areSlosEqual(prevProps.slos, this.props.slos)) {
  //     const { selectedSlosIds } = this.state;
  //     this.clearSelectionForNonExisting(selectedSlosIds);
  //   }
  // };


  // handleSelectSlo = (id, isSelected) => {
  //   this.setState(prevState => {
  //     let newSelectedSlosIds = [];
  //
  //     if (isSelected) {
  //       newSelectedSlosIds = prevState.selectedSlosIds.filter(
  //         item => item !== id
  //       );
  //     } else {
  //       newSelectedSlosIds = [...prevState.selectedSlosIds, id];
  //     }
  //
  //     return {
  //       ...prevState,
  //       selectedSlosIds: newSelectedSlosIds
  //     };
  //   });
  // };

  // handleSave = async () => {
  //   this.setState({
  //     isSaving: true
  //   });
  //
  //   await UserStorageMutation.mutate({
  //     actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
  //     collection: SLO_COLLECTION_KEY,
  //     documentId: SLO_DOCUMENT_ID,
  //     document: { selectedIds: this.state.selectedSlosIds }
  //   });
  //
  //   this.setState(prevState => ({
  //     aggregatedIds: prevState.selectedSlosIds,
  //     isSaving: false
  //   }));
  // };

  handleNewFlowOpen = () => {
    this.setState({ openAddFlowMenu: true })
  }

  handleEditFlow = flow => {
    this.setState({ flowToBeEdited: flow, openAddFlowMenu: true });
  };

  renderAddNewFlow() {
    const { formattedSlos, flowToBeEdited, openAddFlowMenu } = this.state;

    return (
      <DefineFlowForm
        flow={flowToBeEdited}
        slos={formattedSlos}
        isEdit={flowToBeEdited}
        isOpen={openAddFlowMenu}
        onSave={() => this.fetchFlows()}
        onClose={() =>
          this.setState({flowToBeEdited: undefined, openAddFlowMenu: false})
        }
      />
    )
  }

  // <MainContent
  //   timeRange={timeRange}
  //   slos={slos.filter(slo => aggregatedIds.includes(slo.id))}
  // />

  render() {
    const {
      isProcessing,
      flows
    } = this.state;

    const { slos, timeRange } = this.props;

    let noSlosSelected = null;

    if (flows.length === 0 && !isProcessing) {
      noSlosSelected = (
        <EmptyState
          buttonText="Define a Flow"
          buttonOnClick={this.handleNewFlowOpen}
          heading="No Flows created"
          description="Flows are designed to aggregate multiple SLOs in the context of a critical service path or user journey."
        />
      );
    }

    return (
      <>
        <StackItem grow className="main-content-container">
          {noSlosSelected}
          {this.renderAddNewFlow()}
        </StackItem>
      </>
    );
  }
}

MainView.propTypes = {
  slos: PropTypes.array.isRequired,
  timeRange: PropTypes.object,
  tags: PropTypes.array.isRequired
};
