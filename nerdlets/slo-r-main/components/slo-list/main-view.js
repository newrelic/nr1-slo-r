import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Modal } from 'nr1';

import SloTileWrapper from './slo-tile-wrapper';
import ViewDocument from './view-document';

export default class MainView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isActiveViewModal: false
    };
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
    const { slos, timeRange, isTableViewActive } = this.props;

    return (
      <>
        {isTableViewActive ? (
          <div>Table view</div>
        ) : (
          <Grid
            className="grid-container"
            spacingType={[Grid.SPACING_TYPE.EXTRA_LARGE]}
          >
            {slos.map((slo, index) => (
              <SloTileWrapper
                toggleViewModal={this.toggleViewModal}
                key={index}
                timeRange={timeRange}
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
