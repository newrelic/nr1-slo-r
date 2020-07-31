import React, { Component } from 'react';
import { StackItem, BlockText } from 'nr1';

export default class EmptyState extends Component {
  render() {
    return (
      <StackItem>
        <BlockText>
          Unable to find any SLOs defined. Use the Entity Explorer to find a
          Service and define an SLO.
        </BlockText>
      </StackItem>
    );
  }
}
