import React, { Component } from 'react';
import {
  Icon,
  Stack,
  StackItem,
  Button,
  Spinner,
  PlatformStateContext
} from 'nr1';
import { format } from 'date-fns';

import { fetchSloDocuments } from '../shared/services/slo-documents';
import { getEntities } from './queries';
import { Overview, SloList } from './components';

const PAGES = {
  SLO_LIST: SloList,
  COMBINE_SLOs: Overview
};

export default class SLOR extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ActivePage: PAGES.SLO_LIST,
      entities: [],
      slos: [],
      isProcessing: true,
      isTableViewActive: false
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

  removeFromList = slo => {
    this.setState(prevState => ({
      slos: prevState.slos.filter(prevSlo => {
        return prevSlo.document.documentId !== slo.documentId;
      })
    }));
  };

  render() {
    const { ActivePage, slos, isProcessing, isTableViewActive } = this.state;

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
              type={
                ActivePage === PAGES.COMBINE_SLOs
                  ? Button.TYPE.PLAIN
                  : Button.TYPE.NORMAL
              }
              onClick={() => {
                this.setState({ ActivePage: PAGES.COMBINE_SLOs });
              }}
              iconType={Button.ICON_TYPE.INTERFACE__VIEW__LAYER_LIST}
            >
              Combine SLOs
            </Button>
          </StackItem>
          <StackItem className="toolbar__item toolbar__item--separator">
            <Button
              type={
                ActivePage === PAGES.SLO_LIST
                  ? Button.TYPE.PLAIN
                  : Button.TYPE.NORMAL
              }
              onClick={() => {
                this.setState({ ActivePage: PAGES.SLO_LIST });
              }}
              iconType={Button.ICON_TYPE.INTERFACE__VIEW__LIST_VIEW}
            >
              View SLOs
            </Button>
          </StackItem>
          <StackItem className="toolbar__item">
            {ActivePage === PAGES.SLO_LIST && (
              <div className="segmented-control-container">
                <button
                  type="button"
                  className={`grid-view-button ${
                    !isTableViewActive ? 'active' : ''
                  }`}
                  onClick={() => this.setState({ isTableViewActive: false })}
                >
                  <Icon
                    type={Icon.TYPE.INTERFACE__OPERATIONS__GROUP}
                    color={isTableViewActive ? '#007e8a' : '#ffffff'}
                  />
                  Grid
                </button>
                <button
                  type="button"
                  className={`table-view-button ${
                    isTableViewActive ? 'active' : ''
                  }`}
                  onClick={() => this.setState({ isTableViewActive: true })}
                >
                  <Icon
                    type={Icon.TYPE.INTERFACE__VIEW__LIST_VIEW}
                    color={isTableViewActive ? '#ffffff' : '#007e8a'}
                  />
                  Table
                </button>
              </div>
            )}
          </StackItem>
          <StackItem
            grow
            className="toolbar__item toolbar__item--separator toolbar__item--align-right"
          >
            {isProcessing && <Spinner inline />}
            Last updated at: {format(new Date(), 'hh:mm:ss')}
          </StackItem>
          <StackItem className="toolbar__item toolbar__item--align-right">
            <Button
              type={Button.TYPE.PRIMARY}
              iconType={Button.ICON_TYPE.INTERFACE__SIGN__PLUS}
            >
              Create new SLO
            </Button>
          </StackItem>
        </Stack>
        <Stack
          className="slos"
          fullHeight
          fullWidth
          gapType={Stack.GAP_TYPE.NONE}
        >
          <PlatformStateContext.Consumer>
            {platformUrlState =>
              isProcessing ? (
                <Spinner />
              ) : (
                <ActivePage
                  timeRange={platformUrlState.timeRange}
                  slos={slos}
                  isTableViewActive={isTableViewActive}
                  removeFromList={this.removeFromList}
                />
              )
            }
          </PlatformStateContext.Consumer>
        </Stack>
      </Stack>
    );
  }
}
