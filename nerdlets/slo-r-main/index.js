import React, { Component } from 'react';
import { Stack, StackItem, Tabs, TabsItem } from 'nr1';

import { Overview } from './components';

export default class SLOR extends Component {
  render() {
    return (
      <Stack
        verticalType={Stack.VERTICAL_TYPE.FILL}
        className="nerdlet-container"
        fullWidth
        fullHeight
      >
        <StackItem grow>
          <Overview />
          {/* <Tabs>
            <TabsItem value="tab-1" label="View/Combine SLOs">
              <Overview />
            </TabsItem>
            <TabsItem value="tab-2" label="Create new SLO">
              Create new SLO
            </TabsItem>
          </Tabs> */}
        </StackItem>
      </Stack>
    );
  }
}
