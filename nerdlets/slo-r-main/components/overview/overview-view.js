import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StackItem } from 'nr1';

import EmptyState from './empty-state';
import SloList from './slo-list';
import MainContent from './main-content';

export default class Overview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedSlosIds: [],
      isProcessing: true
    };
  }

  handleSloClick = (id, isSelected) => {
    this.setState(prevState => {
      let newSelectedSlosIds = [];

      if (isSelected) {
        newSelectedSlosIds = prevState.selectedSlosIds.filter(
          item => item !== id
        );
      } else {
        newSelectedSlosIds = [...prevState.selectedSlosIds, id];
      }

      return {
        ...prevState,
        selectedSlosIds: newSelectedSlosIds
      };
    });
  };

  render() {
    const { isProcessing, selectedSlosIds } = this.state;
    const { slos, timeRange } = this.props;

    return (
      <>
        <StackItem className="slos-container">
          <SloList
            slos={slos}
            selectedSlosIds={selectedSlosIds}
            handleSloClick={this.handleSloClick}
          />
        </StackItem>
        <StackItem grow className="main-content-container">
          {!isProcessing && slos.length === 0 && <EmptyState />}
          <MainContent
            timeRange={timeRange}
            slos={slos.filter(slo => selectedSlosIds.includes(slo.id))}
          />
        </StackItem>
      </>
    );
  }
}

Overview.propTypes = {
  slos: PropTypes.array.isRequired,
  timeRange: PropTypes.object
};
