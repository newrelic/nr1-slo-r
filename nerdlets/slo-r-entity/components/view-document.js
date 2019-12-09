import React from 'react';
import PropTypes from 'prop-types';

import { navigation, PlatformStateContext } from 'nr1';

import { fetchDocumentById } from '../../shared/services/slo-documents';
import ErrorBudgetSLO from '../../shared/queries/error-budget-slo';
import AlertDrivenSLO from '../../shared/queries/alert-driven-slo';

function openChartBuilder(query) {
  const nerdlet = {
    id: 'wanda-data-exploration.nrql-editor',
    urlState: {
      initialActiveInterface: 'nrqlEditor',
      // initialAccountId: account.id,
      initialNrqlValue: query,
      isViewingQuery: true
    }
  };
  navigation.openOverlay(nerdlet);
}

// eslint-disable-next-line react/prop-types
function Nrql({ query, scope }) {
  return (
    <div
      className="nrql-query-container"
      onClick={() => openChartBuilder(query)}
    >
      <h4 className="nrql-query-header">View {scope} NRQL</h4>
      <div className="nrql-query">{query}</div>
      <br />
    </div>
  );
}

export default class ViewDocument extends React.Component {
  static propTypes = {
    documentId: PropTypes.string,
    entityGuid: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      document: null
    };
  }

  async componentDidMount() {
    const { entityGuid, documentId } = this.props;

    if (this.props.documentId) {
      await this.getDocumentById({ entityGuid, documentId });
    }
  }

  async componentDidUpdate(prevProps) {
    const { entityGuid, documentId } = this.props;

    if (documentId && prevProps.documentId !== documentId) {
      await this.getDocumentById({ entityGuid, documentId });
    }
  }

  async getDocumentById({ entityGuid, documentId }) {
    if (entityGuid && documentId) {
      const response = await fetchDocumentById({ entityGuid, documentId });

      this.setState({
        document: response
      });
    }
  }

  renderNrql(timeRange) {
    const { document } = this.state;

    if (!document) {
      return null;
    }

    const nrqlFunction =
      document.indicator === 'error_budget' || document.type === 'error_budget'
        ? ErrorBudgetSLO
        : AlertDrivenSLO;

    const scopes = ['current', '7_day', '30_day'];

    return scopes.map((scope, index) => {
      const nrql = nrqlFunction.generateQuery({
        scope,
        document,
        timeRange
      });
      return <Nrql key={index} query={nrql} scope={scope} />;
    });
  }

  render() {
    const { document } = this.state;

    return (
      <>
        <pre>{JSON.stringify(document, null, 2)}</pre>
        <PlatformStateContext.Consumer>
          {launcherUrlState => this.renderNrql(launcherUrlState.timeRange)}
        </PlatformStateContext.Consumer>
      </>
    );
  }
}
