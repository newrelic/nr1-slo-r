import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Spinner, GridItem } from 'nr1';

import ErrorBudgetSLO from '../../../shared/queries/error-budget-slo/single-document';
import AlertDrivenSLO from '../../../shared/queries/alert-driven-slo/single-document';
import SloGridTags from './slo-grid-tags/slo-grid-tags';

export default class SloTileWrapper extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isProcessing: true,
      tableData: []
    };
  }

  componentDidMount = async () => {
    const { timeRange, slo } = this.props;
    await this.loadData(timeRange, slo);
  };

  async loadData(timeRange, slo) {
    try {
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
    } finally {
      this.setState({ isProcessing: false });
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
    const { tableData, isProcessing } = this.state;

    return isProcessing ? (
      <GridItem columnSpan={3} className="slo-grid-item-tag">
        <Spinner style={{ top: '50%', left: '50%' }} />
      </GridItem>
    ) : (
      <SloGridTags document={tableData[0]} />
    );
  }
}

SloTileWrapper.propTypes = {
  slo: PropTypes.object.isRequired,
  timeRange: PropTypes.object.isRequired
};
