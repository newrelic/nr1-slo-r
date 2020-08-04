import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StackItem } from 'nr1';
import { Multiselect } from 'react-widgets';

import EmptyState from './empty-state';
import SloList from './slo-list';
import MainContent from './main-content';

export default class Overview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedSlosIds: [],
      isProcessing: true,
      selectedTags: [],
      filteredSlos: []
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

  handleSelectTag = selectedTag => {
    const { slos } = this.props;
    const { selectedTags } = this.state;

    let currentState = selectedTags;
    currentState = [...selectedTag];

    this.setState({
      selectedTags: currentState
    });

    if (currentState.length > 0) {
      console.log('tag was selected');
      const slosWithTags = [];

      slos.forEach(slo => {
        if (slo.document.tags) {
          slosWithTags.push(slo);
        }
      });

      this.setState({
        filteredSlos: [...slosWithTags]
      });
    } else {
      this.setState({
        filteredSlos: []
      });
    }
  };

  render() {
    const { isProcessing, selectedSlosIds } = this.state;
    const { slos, timeRange } = this.props;

    const allSlosTags = [];

    slos &&
      slos.forEach(slo => {
        slo.document.tags &&
          slo.document.tags.forEach(tag => {
            allSlosTags.push(tag);
          });
      });

    const uniqueTags = Array.from(new Set(allSlosTags.map(JSON.stringify))).map(
      JSON.parse
    );

    return (
      <>
        <StackItem className="slos-container">
          <Multiselect
            data={uniqueTags}
            value={this.state.selectedTags}
            textField={entityTag => `${entityTag.key}=${entityTag.values[0]}`}
            valueField={entityTag => `${entityTag.key}=${entityTag.values[0]}`}
            onChange={value => this.handleSelectTag(value)}
            placeholder="Filter SLO by Tags"
            containerClassName="slos-container__multiselect"
          />
          <SloList
            slos={
              this.state.selectedTags.length === 0
                ? slos
                : this.state.filteredSlos
            }
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
