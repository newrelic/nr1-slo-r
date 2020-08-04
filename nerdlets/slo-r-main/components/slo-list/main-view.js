import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Modal, Spinner } from 'nr1';

import ErrorBudgetSLO from '../../../shared/queries/error-budget-slo/single-document';
import AlertDrivenSLO from '../../../shared/queries/alert-driven-slo/single-document';

import SloTileWrapper from './slo-tile-wrapper';
import ViewDocument from './view-document';
import TableView from './table-view';

export default class MainView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isActiveViewModal: false,
      isProcessing: true,
      tableData: []
    };
  }

  componentDidMount = async () => {
    const { timeRange, slos } = this.props;

    try {
      const promises = slos.map(slo => this.loadData(timeRange, slo));
      await Promise.all(promises);
    } finally {
      this.setState({ isProcessing: false });
    }
  };

  async loadData(timeRange, slo) {
    const scopes = ['current', '7_day', '30_day'];

    const { document } = slo;

    const promises = scopes.map(scope => {
      if (document.indicator === 'error_budget') {
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

    results.forEach(result => {
      this.handleScopeResult(result);
    });
  }

  handleScopeResult(result) {
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
  }

  addScopeResult(result) {
    const { document, scope, data } = result;
    const formattedDocument = {
      ...document
    };
    formattedDocument[scope] = data;

    this.setState(prevState => ({
      tableData: [...prevState.tableData, formattedDocument]
    }));
  }

  updateScopeResult({ result, index }) {
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
  }

  toggleViewModal = (options = { document: {} }) => {
    const { document } = options;

    this.setState(prevState => ({
      entityGuid: document.entityGuid,
      viewDocumentId: document.documentId,
      isActiveViewModal: !prevState.isActiveViewModal
    }));
  };

  render() {
    const { isTableViewActive } = this.props;
    const { tableData, isProcessing } = this.state;

    if (isProcessing) {
      return <Spinner />;
    }

    return (
      <>
        {isTableViewActive ? (
          <TableView
            tableData={tableData}
            toggleViewModal={this.toggleViewModal}
          />
        ) : (
          <Grid
            className="grid-container"
            spacingType={[Grid.SPACING_TYPE.EXTRA_LARGE]}
          >
            {tableData.map((slo, index) => (
              <SloTileWrapper
                toggleViewModal={this.toggleViewModal}
                key={index}
                slo={slo}
              />
            ))}
          </Grid>
        )}

        <Modal
          hidden={!this.state.isActiveViewModal}
          onClose={() => this.setState({ isActiveViewModal: false })}
        >
          <ViewDocument
            entityGuid={this.state.entityGuid}
            documentId={this.state.viewDocumentId}
          />
        </Modal>
      </>
    );
  }
}

MainView.propTypes = {
  slos: PropTypes.array.isRequired,
  timeRange: PropTypes.object.isRequired,
  isTableViewActive: PropTypes.bool
};
