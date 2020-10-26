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
import get from 'lodash.get';
import uniqWith from 'lodash.uniqwith';
import isEqual from 'lodash.isequal';

import { NoSlosNotification } from '../shared/components';
import { fetchSloDocuments } from '../shared/services/slo-documents';
import { getTags, getEntities } from './queries';
import { SloCombine, SloList, SloFlows, DefineSLOForm } from './components';

const PAGES = {
  SLO_LIST: SloList,
  COMBINE_SLOs: SloCombine,
  SLO_FLOWS: SloFlows
};

export default class SLOR extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ActivePage: PAGES.COMBINE_SLOs,
      entities: [],
      tags: [],
      slos: [],
      isLoaded: false,
      isRefreshing: true,
      isTableViewActive: false,
      isCreateModalActive: false,
      lastUpdateDate: new Date(),
      sloToBeEdited: undefined
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
    this.setState({ isRefreshing: true });
    const entities = await getEntities();
    await this.fetchTags(entities);
    await this.fetchSlos(entities);

    this.setState({ entities, isRefreshing: false });
  };

  fetchTags = async entities => {
    const promises = entities.map(({ guid }) => getTags(guid));
    const results = await Promise.all(promises);

    const allTags = [];

    results.forEach(result => {
      const tags = get(result, 'data.actor.entity.tags');
      allTags.push(...tags);
    });

    let uniqTags = uniqWith(allTags, isEqual);

    uniqTags = uniqTags.sort((a, b) =>
      a.key.toLowerCase() > b.key.toLowerCase() ? 1 : -1
    );

    this.setState({ tags: uniqTags });
  };

  fetchSlos = async entities => {
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
      isLoaded: true
    });
  };

  handleEditSLO = slo => {
    this.setState({ sloToBeEdited: slo.document, isCreateModalActive: true });
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
      entities,
      tags,
      isLoaded,
      isRefreshing,
      isTableViewActive,
      lastUpdateDate,
      isCreateModalActive,
      sloToBeEdited,
      formattedSlos
    } = this.state;

    let emptyState = null;

    if (isLoaded && slos.length === 0) {
      emptyState = <NoSlosNotification handleClick={this.handleDefineNewSLO} />;
    }

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
              style={{
                background: `${
                  ActivePage === PAGES.COMBINE_SLOs ? '#E0E2E2' : ''
                }`
              }}
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
              style={{
                background: `${ActivePage === PAGES.SLO_LIST ? '#E0E2E2' : ''}`
              }}
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
              View All SLOs
            </Button>
          </StackItem>
          <StackItem className="toolbar__item toolbar__item--separator">
            <Button
              style={{
                background: `${ActivePage === PAGES.SLO_FLOWS ? '#E0E2E2' : ''}`
              }}
              type={
                ActivePage === PAGES.SLO_FLOWS
                  ? Button.TYPE.PLAIN
                  : Button.TYPE.NORMAL
              }
              onClick={() => {
                this.setState({ ActivePage: PAGES.SLO_FLOWS });
              }}
              iconType={Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__OVERVIEW}
            >
              Flows
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
            {isRefreshing && <Spinner inline />}
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
              <>
                {emptyState || (
                  <ActivePage
                    timeRange={platformUrlState.timeRange}
                    slos={slos}
                    tags={tags}
                    isTableViewActive={isTableViewActive}
                    removeFromList={this.removeFromList}
                    handleEditSLO={this.handleEditSLO}
                    handleDefineNewSLO={this.handleDefineNewSLO}
                  />
                )}
                <DefineSLOForm
                  slo={sloToBeEdited}
                  isEdit={sloToBeEdited}
                  timeRange={platformUrlState.timeRange}
                  entities={entities}
                  onSave={() => this.fetchSlos(entities)}
                  onClose={() =>
                    this.setState({
                      sloToBeEdited: undefined,
                      isCreateModalActive: false
                    })
                  }
                  isOpen={isCreateModalActive}
                />
              </>
            )}
          </PlatformStateContext.Consumer>
        </Stack>
      </Stack>
    );
  }
}
