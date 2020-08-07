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
import { SloCombine, SloList, DefineSLOForm } from './components';

const PAGES = {
  SLO_LIST: SloList,
  COMBINE_SLOs: SloCombine
};

export default class SLOR extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ActivePage: PAGES.SLO_LIST,
      entities: [],
      slos: [],
      isProcessing: true,
      isTableViewActive: false,
      isCreateModalActive: false,
      lastUpdateDate: new Date()
    };
  }

  componentDidMount = async () => {
    await this.fetchData();

    this.intervalId = setInterval(() => {
      this.fetchData();
    }, 60000);
  };

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  fetchData = async () => {
    const entities = await getEntities();
    this.setState(
      {
        entities
      },
      () => {
        this.fetchSlos();
      }
    );
  };

  fetchSlos = async () => {
    this.setState({ isProcessing: true });
    const { entities } = this.state;
    let slos = [];

    const promises = entities.map(({ guid: entityGuid }) => {
      return fetchSloDocuments({ entityGuid });
    });

    const results = await Promise.all(promises);

    results.forEach(result => slos.push(...result));

    slos = slos.sort((a, b) =>
      a.document.indicator > b.document.indicator ? 1 : -1
    );

    this.setState({
      slos,
      lastUpdateDate: new Date(),
      isProcessing: false
    });
  };

  handleDefineNewSLO = () => {
    this.setState({ isCreateModalActive: true });
  };

  removeFromList = slo => {
    this.setState(prevState => ({
      slos: prevState.slos.filter(prevSlo => {
        return prevSlo.document.documentId !== slo.documentId;
      })
    }));
  };

  render() {
    const {
      ActivePage,
      slos,
      isProcessing,
      isTableViewActive,
      lastUpdateDate,
      isCreateModalActive
    } = this.state;

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
            Last updated at: {format(lastUpdateDate, 'hh:mm:ss')}
          </StackItem>
          <StackItem className="toolbar__item toolbar__item--align-right">
            <Button
              type={Button.TYPE.PRIMARY}
              iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_ADD}
              onClick={this.handleDefineNewSLO}
            >
              Define an SLO
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
            {platformUrlState => (
              <ActivePage
                timeRange={platformUrlState.timeRange}
                slos={slos}
                isTableViewActive={isTableViewActive}
                removeFromList={this.removeFromList}
                handleDefineNewSLO={this.handleDefineNewSLO}
              />
            )}
          </PlatformStateContext.Consumer>
        </Stack>
        <DefineSLOForm
          onClose={() => this.setState({ isCreateModalActive: false })}
          isOpen={isCreateModalActive}
        />
      </Stack>
    );
  }
}
