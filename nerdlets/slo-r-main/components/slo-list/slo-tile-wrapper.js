import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SloGridTags from './slo-grid-tags/slo-grid-tags';
import SloGridGroups from './slo-grid-groups/slo-grid-groups';

export default class SloTileWrapper extends Component {
  render() {
    const { toggleViewModal, slo } = this.props;
    // const data = tableData[0];

    return slo && slo.tags ? (
      <SloGridTags toggleViewModal={toggleViewModal} document={slo} />
    ) : (
      <SloGridGroups toggleViewModal={toggleViewModal} document={slo} />
    );
  }
}

SloTileWrapper.propTypes = {
  slo: PropTypes.object.isRequired,
  toggleViewModal: PropTypes.func.isRequired
};
