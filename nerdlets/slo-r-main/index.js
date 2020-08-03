import React, { Component } from 'react';
import { Stack, StackItem, Button } from 'nr1';

import { Overview } from './components';

const PAGES = {
  SLO_LIST: 'slo-list',
  COMBINE_SLOs: <Overview />
};

export default class SLOR extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activePage: PAGES.COMBINE_SLOs
    };
  }

  render() {
    const { activePage } = this.state;

    return (
      <Stack
        directionType={Stack.DIRECTION_TYPE.VERTICAL}
        verticalType={Stack.VERTICAL_TYPE.FILL}
        className="nerdlet-container"
        fullWidth
        fullHeight
      >
        <Stack fullWidth className="toolbar">
          <StackItem className="toolbar__item toolbar__item--separator">
            <Button
              type={Button.TYPE.NORMAL}
              onClick={() => {
                this.setState({ activePage: PAGES.SLO_LIST });
              }}
              iconType={Button.ICON_TYPE.INTERFACE__VIEW__LIST_VIEW}
            >
              View SLOs
            </Button>
          </StackItem>
          <StackItem className="toolbar__item" grow>
            <Button
              type={Button.TYPE.NORMAL}
              onClick={() => {
                this.setState({ activePage: PAGES.COMBINE_SLOs });
              }}
              iconType={Button.ICON_TYPE.INTERFACE__VIEW__LAYER_LIST}
            >
              Combine SLOs
            </Button>
          </StackItem>
          <StackItem className="toolbar__item">
            <Button
              type={Button.TYPE.PRIMARY}
              // onClick={() =>
              //   navigation.router({
              //     to: 'createMap',
              //     state: { selectedMap: null, activeStep: 1 }
              //   })
              // }
              iconType={Button.ICON_TYPE.INTERFACE__SIGN__PLUS}
            >
              Create new SLO
            </Button>
          </StackItem>
        </Stack>
        <Stack fullHeight fullWidth gapType={Stack.GAP_TYPE.NONE}>
          {activePage}
        </Stack>
      </Stack>
    );
  }
}
