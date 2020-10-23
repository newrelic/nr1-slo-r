import React from 'react';
import PropTypes from 'prop-types';

import { navigation, PlatformStateContext, HeadingText } from 'nr1';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monoBlue } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import { fetchDocumentById } from '../../../shared/services/slo-documents';
import ErrorBudgetSLO from '../../../shared/queries/error-budget-slo/single-document';
import AlertDrivenSLO from '../../../shared/queries/alert-driven-slo/single-document';

function openChartBuilder(query, doc) {
  const nerdlet = {
    id: 'wanda-data-exploration.nrql-editor',
    urlState: {
      initialActiveInterface: 'nrqlEditor',
      initialAccountId: doc.accountId,
      initialNrqlValue: query.query,
      isViewingQuery: true
    }
  };
  navigation.openOverlay(nerdlet);
}

function Nrql({ query, scope, activeViewNRQLQuery, doc }) {
  const scopeNormalized = scope
    .replace(/_/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();

  return (
    <>
      <div
        className={`nrql-query-container ${
          activeViewNRQLQuery === scopeNormalized ? 'active' : ''
        }`}
        onClick={() => openChartBuilder(query, doc)}
      >
        <HeadingText type={HeadingText.TYPE.HEADING_4}>
          {query.name}
        </HeadingText>
        <div className="nrql-query">{query.query}</div>
      </div>
    </>
  );
}

Nrql.propTypes = {
  query: PropTypes.object,
  scope: PropTypes.string,
  activeViewNRQLQuery: PropTypes.string
};

export default class ViewDocument extends React.Component {
  static propTypes = {
    documentId: PropTypes.string,
    entityGuid: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      document: null,
      activeViewNRQLQuery: 'current'
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
    const { document, activeViewNRQLQuery } = this.state;

    if (!document) {
      return null;
    }

    const nrqlFunction =
      document.indicator === 'error_budget' ||
      document.type === 'error_budget' ||
      document.indicator === 'latency_budget' ||
      document.type === 'latency_budget'
        ? ErrorBudgetSLO
        : AlertDrivenSLO;

    const scopes = ['current', '7_day', '30_day'];

    return scopes.map((scope, index) => {
      const queries = nrqlFunction.generateQueries({
        scope,
        document,
        timeRange
      });

      // console.debug(queries);

      return queries.map((query, qIndex) => {
        return (
          <Nrql
            key={index + qIndex}
            query={query}
            scope={scope}
            activeViewNRQLQuery={activeViewNRQLQuery}
            doc={document}
          />
        );
      });
    });
  }

  debugger;
  render() {
    const { document } = this.state;
    const isLoaded = document !== null;

    return (
      <>
        <HeadingText
          className="view-details-header"
          type={HeadingText.TYPE.HEADING_2}
        >
          {isLoaded && document.name}
        </HeadingText>

        <p className="document-description">
          {isLoaded && document.description}
        </p>

        <hr />

        <div className="document-definition-container">
          <HeadingText type={HeadingText.TYPE.HEADING_4}>
            Document definition
          </HeadingText>
          <div className="code-snippet-container">
            <SyntaxHighlighter language="JSON" style={monoBlue}>
              {JSON.stringify(document, null, 2)}
            </SyntaxHighlighter>
          </div>
        </div>

        <div className="view-nrql-container">
          <header className="view-nrql-header">
            <HeadingText type={HeadingText.TYPE.HEADING_4}>
              View NRQL
            </HeadingText>
            <div className="segmented-control-container multiple-segments">
              <button
                type="button"
                className={`${
                  this.state.activeViewNRQLQuery === 'current' ? 'active' : ''
                }`}
                onClick={() =>
                  this.setState({ activeViewNRQLQuery: 'current' })
                }
              >
                Current
              </button>
              <button
                type="button"
                className={`${
                  this.state.activeViewNRQLQuery === '7day' ? 'active' : ''
                }`}
                onClick={() => this.setState({ activeViewNRQLQuery: '7day' })}
              >
                7 day
              </button>
              <button
                type="button"
                className={`${
                  this.state.activeViewNRQLQuery === '30day' ? 'active' : ''
                }`}
                onClick={() => this.setState({ activeViewNRQLQuery: '30day' })}
              >
                30 day
              </button>
            </div>
          </header>

          <div className="view-nrql-content">
            <PlatformStateContext.Consumer>
              {platformUrlState => this.renderNrql(platformUrlState.timeRange)}
            </PlatformStateContext.Consumer>
          </div>
        </div>
      </>
    );
  }
}
