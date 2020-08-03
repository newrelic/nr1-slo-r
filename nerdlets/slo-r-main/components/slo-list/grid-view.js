import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, PlatformStateContext } from 'nr1';

import ErrorBudgetSLO from '../../../shared/queries/error-budget-slo/single-document';
import AlertDrivenSLO from '../../../shared/queries/alert-driven-slo/single-document';
import SloGridTags from './slo-grid-tags/slo-grid-tags';

export default class GridView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isProcessing: true
    };
  }

  componentDidMount = async () => {
    const { timeRange, slo_documents } = this.props;
    this.loadData(timeRange, slo_documents);
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

  render() {
    const { isProcessing } = this.state;
    const { slos } = this.props;

    return (
      <Grid className="grid-container" spacingType={[Grid.SPACING_TYPE.LARGE]}>
        <PlatformStateContext.Consumer>
          {platformUrlState =>
            slos.map((slo, index) => (
              <SloGridTags key={index} document={slo.document} />
            ))
          }
        </PlatformStateContext.Consumer>
      </Grid>
    );
  }
}

MainView.propTypes = {
  slos: PropTypes.array.isRequired
};
