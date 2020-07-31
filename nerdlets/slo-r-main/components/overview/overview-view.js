import React, { Component } from 'react';
import { Spinner, Stack, StackItem } from 'nr1';

import { getEntities } from './queries';
import { fetchSloDocuments } from '../../../shared/services/slo-documents';

import EmptyState from './empty-state';
import SloList from './slo-list';
import MainContent from './main-content';

export default class Overview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      entities: [],
      slos: [],
      selectedSlosIds: [],
      isProcessing: true
    };
  }

  componentDidMount = async () => {
    try {
      const entities = await getEntities();
      let slos = [];

      for (let index = 0; index < entities.length; index++) {
        const entity = entities[index];

        const { guid: entityGuid } = entity;
        const result = await fetchSloDocuments({ entityGuid });
        slos.push(...result);
      }

      slos = slos.sort((a, b) =>
        a.document.indicator > b.document.indicator ? 1 : -1
      );

      this.setState({
        entities,
        slos
      });
    } finally {
      this.setState({ isProcessing: false });
    }
  };

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
    const { isProcessing, slos, selectedSlosIds } = this.state;

    return (
      <Stack fullHeight fullWidth gapType={Stack.GAP_TYPE.NONE}>
        <StackItem className="slos-list">
          {isProcessing ? (
            <Spinner />
          ) : (
            <SloList
              slos={slos}
              selectedSlosIds={selectedSlosIds}
              handleSloClick={this.handleSloClick}
            />
          )}
        </StackItem>
        <StackItem className="main-content-container">
          {!isProcessing && slos.length === 0 && <EmptyState />}
          <MainContent
            slos={slos.filter(slo => selectedSlosIds.includes(slo.id))}
          />
        </StackItem>
      </Stack>
    );
  }
}
