import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'nr1';

import SloTileWrapper from './slo-tile-wrapper';

export default class MainView extends Component {
  render() {
    const { slos, timeRange } = this.props;

    return (
      <Grid
        className="grid-container"
        spacingType={[Grid.SPACING_TYPE.EXTRA_LARGE]}
      >
        {slos.map((slo, index) => (
          <SloTileWrapper key={index} timeRange={timeRange} slo={slo} />
        ))}
      </Grid>
    );
  }
}

MainView.propTypes = {
  slos: PropTypes.array.isRequired,
  timeRange: PropTypes.object.isRequired
};
