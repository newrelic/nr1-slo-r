import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SloGridTags from './slo-grid-tags/slo-grid-tags';
import SloGridGroups from './slo-grid-groups/slo-grid-groups';

export default class SloTileWrapper extends Component {
  render() {
    const {
      toggleViewModal,
      toggleUpdateModal,
      deleteCallback,
      slo
    } = this.props;

    return slo && slo.tags && slo.tags.length > 0 ? (
      <SloGridTags
        deleteCallback={deleteCallback}
        toggleViewModal={toggleViewModal}
        toggleUpdateModal={toggleUpdateModal}
        document={slo}
      />
    ) : (
      <SloGridGroups
        deleteCallback={deleteCallback}
        toggleViewModal={toggleViewModal}
        toggleUpdateModal={toggleUpdateModal}
        document={slo}
      />
    );
  }
}

SloTileWrapper.propTypes = {
  slo: PropTypes.object.isRequired,
  toggleViewModal: PropTypes.func.isRequired,
  toggleUpdateModal: PropTypes.func.isRequired,
  deleteCallback: PropTypes.func.isRequired
};
