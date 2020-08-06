import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StackItem } from 'nr1';
import { Multiselect } from 'react-widgets';

import EmptyState from './empty-state';
import SloList from './slo-list';
import MainContent from './main-container';

export default class MainView extends Component {
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

    let currentSelectedTags = selectedTags;
    currentSelectedTags = [...selectedTag];

    this.setState({
      selectedTags: currentSelectedTags
    });

    if (currentSelectedTags.length > 0) {
      const filteredByTag = [];
      let sloTags = [];
      let selectedTags = [];

      selectedTags = currentSelectedTags.map(
        ({ key, values }) => `${key}:${values[0]}`
      );

      slos.forEach(slo => {
        const { tags } = slo.document;

        if (tags) {
          sloTags = tags.map(({ key, values }) => `${key}:${values[0]}`);

          if (
            selectedTags.every(selectedTag => sloTags.includes(selectedTag))
          ) {
            filteredByTag.push(slo);
          }
        }
      });

      this.setState({
        filteredSlos: [...filteredByTag]
      });
    } else {
      this.setState({
        filteredSlos: []
      });
    }
  };

  render() {
    const {
      isProcessing,
      selectedSlosIds,
      selectedTags,
      filteredSlos
    } = this.state;
    const { slos, timeRange } = this.props;

    const allSlosTags = [];

    slos &&
      slos.forEach(slo => {
        const { tags } = slo.document;

        tags &&
          tags.forEach(tag => {
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
            value={selectedTags}
            textField={entityTag => `${entityTag.key}=${entityTag.values[0]}`}
            valueField={entityTag => `${entityTag.key}=${entityTag.values[0]}`}
            onChange={value => this.handleSelectTag(value)}
            placeholder="Filter SLO by Tags"
            containerClassName="slos-container__multiselect"
          />
          <SloList
            slos={selectedTags.length === 0 ? slos : filteredSlos}
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

MainView.propTypes = {
  slos: PropTypes.array.isRequired,
  timeRange: PropTypes.object
};
