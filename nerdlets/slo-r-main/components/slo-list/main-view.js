import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'nr1';

import ErrorBudgetSLO from '../../../shared/queries/error-budget-slo/single-document';
import AlertDrivenSLO from '../../../shared/queries/alert-driven-slo/single-document';
import SloGridTags from './slo-grid-tags/slo-grid-tags';

export default class MainView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isProcessing: true,
      tableData: []
    };
  }

  componentDidMount = async () => {
    const { timeRange, slos } = this.props;
    const response = await this.loadData(timeRange, slos);
  };

  async loadData(timeRange, documents) {
    const scopes = ['current', '7_day', '30_day'];

    if (documents) {
      documents.forEach(documentObject => {
        const { document } = documentObject;

        scopes.forEach(scope => {
          if (document.indicator === 'error_budget') {
            ErrorBudgetSLO.query({
              scope,
              document,
              timeRange
            }).then(result => this.handleScopeResult(result));
          } else {
            AlertDrivenSLO.query({
              scope,
              document,
              timeRange
            }).then(result => this.handleScopeResult(result));
          }
        });
      });
    }
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

  render() {
    const { isProcessing, tableData } = this.state;
    const { slos } = this.props;

    return (
      <Grid
        className="grid-container"
        spacingType={[Grid.SPACING_TYPE.EXTRA_LARGE]}
      >
        {tableData.map((document, index) => (
          <SloGridTags key={index} document={document} />
        ))}
      </Grid>
    );
  }
}

MainView.propTypes = {
  slos: PropTypes.array.isRequired
};
