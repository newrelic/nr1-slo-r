import React, { Component } from 'react';
import { Stack, StackItem, Tabs, TabsItem } from 'nr1';

import { Overview } from './components';

export default class SLOR extends Component {
  render() {
    return (
      <Stack
        directionType={Stack.DIRECTION_TYPE.VERTICAL}
        verticalType={Stack.VERTICAL_TYPE.FILL}
        className="nerdlet-container"
        fullWidth
        fullHeight
      >
        <StackItem>Toolbar</StackItem>
        <Stack fullHeight fullWidth gapType={Stack.GAP_TYPE.NONE}>
          <Overview />
        </Stack>
      </Stack>
    );
  }
}
