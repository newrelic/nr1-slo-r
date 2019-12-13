/* eslint-disable no-console */
/**
 * Provides the component that displays the aggregation of SLOs by defined Org.
 *
 * @file
 * @author Gil Rice
 */
/** core */
import React from 'react';
import PropTypes from 'prop-types';
/** nr1 */
import {
  Button,
  BlockText,
  Grid,
  GridItem,
  PlatformStateContext,
  Spinner,
  Stack,
  StackItem
} from 'nr1';

/** local */
import OrganizationSelector from './components/org-selector';
import OrganizationSummary from './components/org-displayer';

/** 3rd party */
import { fetchSloDocuments } from '../../../shared/services/slo-documents';

/**
 * SLOREstate
 */
export default class SLOREstate extends React.Component {
  static propTypes = {
    entities: PropTypes.array
    // fetchMore: PropTypes.object
  }; // propTypes

  constructor(props) {
    super(props);

    this.state = {
      organizationOptions: [],
      allDocuments: [],
      orgDocuments: [],
      selectedOrg: null
    }; // state

    this.sloSelectorCallback = this._sloSelectorCallback.bind(this);
  } // constructor

  componentDidMount() {
    this.fetchDocuments();
  } // componentDidMount

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.allDocuments === null) {
      return true;
    } // if

    if (this.state.allDocuments !== nextState.allDocuments) {
      return true;
    }

    if (this.state.selectedOrg !== nextState.selectedOrg) {
      return true;
    } // if

    return false;
  } // shouldComponentUpdate

  // componentDidUpdate(prevProps) {
  //   //
  // }

  _sloSelectorCallback(_org) {
    const { allDocuments } = this.state;

    const orgDocuments = allDocuments.filter(slo => slo.orgName === _org);
    // console.debug(orgDocuments);

    this.setState({ selectedOrg: _org, orgDocuments });
  } // _sloSelectorCallback

  async fetchDocuments() {
    const { entities } = this.props;

    entities.forEach(entity => {
      const { guid: entityGuid } = entity;
      fetchSloDocuments({ entityGuid }).then(result => this.addEntity(result));
    });
  }

  addEntity(entity) {
    if (entity.length === 0) {
      return;
    }

    entity.forEach(slo => {
      this.addSlo(slo);
    });
  }

  addSlo(slo) {
    const { allDocuments, organizationOptions } = this.state;
    const organization = slo.document.organization;

    const newState = {
      allDocuments: [
        ...allDocuments,
        {
          id: slo.id,
          orgName: slo.document.organization,
          slo: slo.document
        }
      ]
    };

    if (!organizationOptions.includes(organization)) {
      newState.organizationOptions = [...organizationOptions, organization];
    }

    this.setState(newState);
  }

  renderNoneDefined() {
    return (
      <StackItem>
        <BlockText>
          Unable to find any SLOs defined. Use the Entity Explorer to find a
          Service and define an SLO.
        </BlockText>
      </StackItem>
    );
  }

  renderNoOrganizationSelected() {
    return (
      <>
        <StackItem>
          <h4 className="empty-state-header">Choose an Organization</h4>
        </StackItem>
        <StackItem>
          <p className="empty-state-description">
            Select an organization from the dropdown above.
          </p>
        </StackItem>
      </>
    );
  }

  render() {
    const { entities } = this.props;
    const { organizationOptions, orgDocuments, selectedOrg } = this.state;
    const orgWithSlos = {
      orgName: selectedOrg,
      slos: orgDocuments
    };

    return (
      <>
        <Stack
          className="toolbar-container"
          fullWidth
          gapType={Stack.GAP_TYPE.NONE}
          horizontalType={Stack.HORIZONTAL_TYPE.FILL_EVENLY}
          verticalType={Stack.VERTICAL_TYPE.FILL}
        >
          <StackItem className="toolbar-section1">
            <Stack
              gapType={Stack.GAP_TYPE.NONE}
              fullWidth
              verticalType={Stack.VERTICAL_TYPE.FILL}
            >
              <StackItem className="toolbar-item has-separator">
                <OrganizationSelector
                  orgs={organizationOptions}
                  onChange={this.sloSelectorCallback}
                  selectedOrg={selectedOrg}
                />
              </StackItem>
            </Stack>
          </StackItem>
          <StackItem className="toolbar-section2">
            <Stack
              fullWidth
              fullHeight
              verticalType={Stack.VERTICAL_TYPE.CENTER}
              horizontalType={Stack.HORIZONTAL_TYPE.RIGHT}
            >
              <StackItem>
                <Button
                  onClick={() => alert('You clicked me!')}
                  type={Button.TYPE.PRIMARY}
                >
                  Primary button
                </Button>
              </StackItem>
            </Stack>
          </StackItem>
        </Stack>
        <Grid
          className="primary-grid"
          spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}
        >
          <GridItem className="sidebar-container" columnSpan={3}>
            <ul className="sidebar-list">
              {entities.map((item, index) => {
                return (
                  <li key={index} className="sidebar-list-item">
                    {item.name}
                  </li>
                );
              })}
            </ul>
          </GridItem>
          <GridItem className="primary-content-container" columnSpan={9}>
            <main className="primary-content full-height">
              <Stack
                className="empty-state"
                fullWidth
                fullHeight
                verticalType={Stack.VERTICAL_TYPE.CENTER}
                horizontalType={Stack.HORIZONTAL_TYPE.CENTER}
                directionType={Stack.DIRECTION_TYPE.VERTICAL}
                gapType={Stack.GAP_TYPE.NONE}
              >
                {/* No organization selected */}
                {!this.state.selectedOrg && this.renderNoOrganizationSelected()}

                {/* Org selected but loading */}
                {this.state.selectedOrg && this.state.allDocuments === null && (
                  <Spinner />
                )}

                {/* Org selected but no results */}
                {this.state.selectedOrg &&
                  this.state.allDocuments.length < 1 &&
                  this.renderNoneDefined()}

                <StackItem>
                  {this.state.selectedOrg && (
                    <PlatformStateContext.Consumer>
                      {launcherUrlState => (
                        <OrganizationSummary
                          org={orgWithSlos}
                          timeRange={launcherUrlState.timeRange}
                        />
                      )}
                    </PlatformStateContext.Consumer>
                  )}
                  {!this.state.selectedOrg && <></>}
                </StackItem>
              </Stack>
            </main>
          </GridItem>
        </Grid>
      </>
    );
  } // render
} // SLOREstate
