import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  HeadingText,
  EntityStorageMutation,
  Grid,
  Modal,
  Spinner
} from 'nr1';
import isEqual from 'lodash.isequal';

import ErrorBudgetSLO from '../../../shared/queries/error-budget-slo/single-document';
import AlertDrivenSLO from '../../../shared/queries/alert-driven-slo/single-document';
import {
  fetchAnAccountFlowDocuments,
  writeFlowDocument
} from '../../../shared/services/flow-documents';

import SloTileWrapper from './slo-tile-wrapper';
import ViewDocument from './view-document';
import TableView from './table-view';

export default class MainView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isActiveViewModal: false,
      isProcessing: true,
      isDeleteSloModalActive: false,
      tableData: [],
      sloToBeDeleted: undefined
    };
  }

  componentDidMount = async () => {
    await this.fetchDetails();
  };

  componentWillReceiveProps(nextProps) {
    if (!this.alertPolicyMap && nextProps.alertPolicies.length > 0) {
      this.alertPolicyMap = new Map();
      nextProps.alertPolicies.forEach(p => {
        this.alertPolicyMap.set(p.id, p);
      });
    }
  }

  componentDidUpdate = async prevProps => {
    const { slos, timeRange } = this.props;

    if (
      !this.areSlosEqual(slos, prevProps.slos) ||
      !isEqual(prevProps.timeRange, timeRange)
    ) {
      this.clearAndFetch();
    }
  };

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  areSlosEqual = (newSlos, prevSlos) => {
    if (newSlos.length !== prevSlos.length) {
      return false;
    }

    return isEqual(newSlos, prevSlos);
  };

  clearAndFetch = () => {
    clearInterval(this.intervalId);
    this.setState(
      {
        isProcessing: true,
        tableData: []
      },
      async () => {
        await this.fetchDetails();
        this.intervalId = setInterval(() => this.fetchDetails(), 60000);
      }
    );
  };

  fetchDetails = async () => {
    this.setState({ isProcessing: true });
    const { timeRange, slos } = this.props;

    try {
      const promises = slos.map(slo => this.loadData(timeRange, slo));
      const loadDataResults = await Promise.all(promises);

      loadDataResults.forEach(data => {
        data.forEach(item => this.handleScopeResult(item));
      });
    } finally {
      this.setState({ isProcessing: false });
    }
  };

  async loadData(timeRange, slo) {
    const scopes = ['current', '7_day', '30_day'];

    const { document } = slo;

    const promises = scopes.map(scope => {
      if (
        document.indicator === 'error_budget' ||
        document.indicator === 'latency_budget'
      ) {
        return ErrorBudgetSLO.query({
          scope,
          document,
          timeRange
        });
      } else {
        return AlertDrivenSLO.query({
          scope,
          document,
          timeRange
        });
      }
    });

    const results = await Promise.all(promises);
    return results;
  }

  handleScopeResult = result => {
    const { tableData } = this.state;
    const { document } = result;

    const index = tableData.findIndex(value => {
      return value.documentId === document.documentId;
    });

    if (index < 0) {
      this.addScopeResult(result);
    }

    if (index >= 0) {
      this.updateScopeResult({ result, index });
    }
  };

  addScopeResult = result => {
    const { document, scope, data } = result;
    const formattedDocument = {
      ...document
    };
    formattedDocument[scope] = data;

    this.setState(prevState => ({
      tableData: [...prevState.tableData, formattedDocument]
    }));
  };

  updateScopeResult = ({ result, index }) => {
    const { tableData } = this.state;
    const { scope, data } = result;
    const updatedDocument = { ...tableData[index] };
    updatedDocument[scope] = data;

    this.setState(prevState => ({
      tableData: [
        ...prevState.tableData.slice(0, index),
        updatedDocument,
        ...prevState.tableData.slice(index + 1)
      ]
    }));
  };

  toggleViewModal = (options = { document: {} }) => {
    const { document } = options;

    this.setState(prevState => ({
      entityGuid: document.entityGuid,
      viewDocumentId: document.documentId,
      isActiveViewModal: !prevState.isActiveViewModal
    }));
  };

  deleteSlo = async () => {
    this.setState({ isProcessing: true });
    const { sloToBeDeleted: document } = this.state;

    const mutation = {
      actionType: EntityStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
      collection: 'nr1-csg-slo-r',
      entityGuid: document.entityGuid,
      documentId: document.documentId
    };

    const result = await EntityStorageMutation.mutate(mutation);

    if (!result) {
      throw new Error('Error deleting SLO document from Entity Storage');
    }

    this.removeDocumentFromList(document);
    const flows = await fetchAnAccountFlowDocuments(document.accountId);
    if (flows.length > 0) {
      const updatedFlows = await this.checkAndRemoveSlosFromFlows(
        flows,
        document
      );
      updatedFlows.forEach(flow => {
        this.writeNewFlowDocument(flow.document);
      });
    }
    // TODO: Check to see the entity in question has any other SLO documents in the collection and remove the tag slor=true if there are none.
  };

  writeNewFlowDocument = async document => {
    await writeFlowDocument({
      document
    });
  };

  deleteDocumentCallback = document => {
    this.setState({
      sloToBeDeleted: document,
      isDeleteSloModalActive: true
    });
  };

  removeDocumentFromList = document => {
    const { removeFromList } = this.props;
    removeFromList(document);

    this.setState({
      isDeleteSloModalActive: false
    });
  };

  checkAndRemoveSlosFromFlows = (flows, document) => {
    flows.forEach(f => {
      const obj = f.document.slos.filter(s => s.value !== document.documentId);
      if (obj !== undefined) {
        f.document.slos = obj;
      }
    });

    return flows;
  };

  render() {
    const { isTableViewActive, handleEditSLO } = this.props;

    const {
      isActiveViewModal,
      tableData,
      isProcessing,
      isDeleteSloModalActive,
      entityGuid,
      viewDocumentId
    } = this.state;

    if (isProcessing) {
      return <Spinner />;
    }

    return (
      <>
        <div className="slo-list">
          {isTableViewActive ? (
            <TableView
              tableData={tableData}
              toggleViewModal={this.toggleViewModal}
              toggleUpdateModal={handleEditSLO}
              deleteCallback={this.deleteDocumentCallback}
              alertPolicyMap={this.alertPolicyMap}
            />
          ) : (
            <Grid className="grid-container">
              {tableData.map((slo, index) => (
                <SloTileWrapper
                  toggleUpdateModal={handleEditSLO}
                  toggleViewModal={this.toggleViewModal}
                  deleteCallback={this.deleteDocumentCallback}
                  key={index}
                  slo={slo}
                />
              ))}
            </Grid>
          )}
        </div>

        <Modal
          hidden={!isActiveViewModal}
          onClose={() => this.setState({ isActiveViewModal: false })}
        >
          <ViewDocument entityGuid={entityGuid} documentId={viewDocumentId} />
        </Modal>
        <Modal
          hidden={!isDeleteSloModalActive}
          onClose={() => this.setState({ isDeleteSloModalActive: false })}
        >
          <HeadingText type={HeadingText.TYPE.HEADING_2}>
            Are you sure you want to delete this SLO?
          </HeadingText>
          <p>
            This cannot be undone. Please confirm whether or not you want to
            delete this SLO.
          </p>
          <Button
            type={Button.TYPE.PRIMARY}
            onClick={() => this.setState({ isDeleteSloModalActive: false })}
          >
            Cancel
          </Button>
          <Button
            type={Button.TYPE.DESTRUCTIVE}
            onClick={this.deleteSlo}
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
  timeRange: PropTypes.object.isRequired,
  isTableViewActive: PropTypes.bool,
  removeFromList: PropTypes.func.isRequired,
  handleEditSLO: PropTypes.func.isRequired,
  alertPolicies: PropTypes.array.isRequired
};
