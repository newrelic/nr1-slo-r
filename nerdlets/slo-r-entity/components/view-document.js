import React from 'react';
import PropTypes from 'prop-types';

import { fetchDocumentById } from '../../shared/services/slo-documents';

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

  render() {
    const { document } = this.state;

    return (
      <>
        <pre>{JSON.stringify(document, null, 2)}</pre>
      </>
    );
  }
}
