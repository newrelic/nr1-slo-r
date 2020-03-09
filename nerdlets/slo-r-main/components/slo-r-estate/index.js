/**
 * Provides the component that displays the aggregation of SLOs by defined Group.
 *
 * @file
 * @author Gil Rice
 */
/** core */
import React from 'react';
import PropTypes from 'prop-types';
/** nr1 */
import {
  BlockText,
  Grid,
  GridItem,
  PlatformStateContext,
  Spinner,
  Stack,
  StackItem
} from 'nr1';

/** local */
import TagSelector from '../tag-selector';
import SloSummary from '../slo-summary';
import { fetchSloDocuments } from '../../../shared/services/slo-documents';
import { SLO_INDICATORS } from '../../../shared/constants';

/** 3rd party */

/**
 * SLOREstate
 */
export default class SLOREstate extends React.Component {
  static propTypes = {
    entities: PropTypes.array
  }; // propTypes

  constructor(props) {
    super(props);

    this.state = {
      tagOptions: [],
      allDocuments: [],
      tagDocuments: [],
      selectedTag: null,
      activeIndicator: 'error_budget'
    }; // state

    this.sloSelectorCallback = this._sloSelectorCallback.bind(this);
  } // constructor

  componentDidMount() {
    this.fetchDocuments();
  } // componentDidMount

  _sloSelectorCallback(tag) {
    const { allDocuments } = this.state;

    const tagDocuments = allDocuments.filter(slo => slo.tagName === tag);
    // console.debug(tagDocuments);

    this.setState({ selectedTag: tag, tagDocuments });
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
    const { allDocuments, tagOptions } = this.state;
    const slogroup = slo.document.slogroup;

    const newState = {
      allDocuments: [
        ...allDocuments,
        {
          id: slo.id,
          tagName: slo.document.slogroup,
          slo: slo.document
        }
      ]
    };

    if (!tagOptions.includes(slogroup)) {
      newState.tagOptions = [...tagOptions, slogroup];
    }

    this.setState(newState);
  }

  renderNoneDefined() {
    return (
      <StackItem>
        <BlockText>
          Unable to find any SLOs defined. Use the Entity Explorer to find a
          Service and define an SLO.

          Barf Braf Brarf
        </BlockText>
      </StackItem>
    );
  }

  renderNoSelected() {
    const { tagOptions, selectedTag } = this.state;

    return (
      <>
        <Stack
          className="no-tag-selected-container empty-state-container"
          directionType={Stack.DIRECTION_TYPE.VERTICAL}
          horizontalType={Stack.HORIZONTAL_TYPE.CENTER}
          verticalType={Stack.VERTICAL_TYPE.CENTER}
        >
          <StackItem>
            <h3 className="empty-state-header">Choose a SLO Group</h3>
            <p className="empty-state-description">
              Select a SLO Group from the dropdown to get started.
            </p>
          </StackItem>
          <StackItem className="tag-selector">
            <TagSelector
              options={tagOptions}
              onChange={this.sloSelectorCallback}
              selectedTag={selectedTag}
              showLabel={false}
              title="Choose a SLO Group"
            />
          </StackItem>
        </Stack>
      </>
    );
  }

  render() {
    const {
      activeIndicator,
      tagOptions,
      tagDocuments,
      selectedTag
    } = this.state;

    const tagWithSlos = {
      tagName: selectedTag,
      slos: tagDocuments
    };

    return (
      <>
        <Stack
          className="summary-toolbar toolbar-container"
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
                <TagSelector
                  options={tagOptions}
                  onChange={this.sloSelectorCallback}
                  selectedTag={selectedTag}
                />
              </StackItem>

              <StackItem className="slo-preview-toolbar-item">
                <div className="segmented-control-container multiple-segments">
                  {SLO_INDICATORS.map((indicator, index) => {
                    return (
                      <button
                        key={index}
                        type="button"
                        className={
                          this.state.activeIndicator === indicator.value
                            ? 'active'
                            : ''
                        }
                        onClick={() =>
                          this.setState({ activeIndicator: indicator.value })
                        }
                      >
                        {indicator.label}
                      </button>
                    );
                  })}
                </div>
              </StackItem>
            </Stack>
          </StackItem>
        </Stack>
        <Grid
          className={`primary-grid ${
            !this.state.selectedTag ? 'empty-state-parent' : ''
          }`}
          spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}
        >
          <GridItem className="primary-content-container" columnSpan={12}>
            {/* No SLO Group selected */}
            {!this.state.selectedTag && this.renderNoSelected()}

            {/* SLO Group selected but loading */}
            {this.state.selectedTag && this.state.allDocuments === null && (
              <Spinner />
            )}

            {/* SLO Group selected but no results */}
            {this.state.selectedTag &&
              this.state.allDocuments.length < 1 &&
              this.renderNoneDefined()}

            {this.state.selectedTag && (
              <PlatformStateContext.Consumer>
                {platformUrlState => (
                  <Stack
                    horizontalType={Stack.HORIZONTAL_TYPE.CENTER}
                    verticalType={Stack.VERTICAL_TYPE.CENTER}
                    fullWidth
                    fullHeight
                  >
                    <StackItem className="sla-summary-table-stack-item">
                      <SloSummary
                        tag={tagWithSlos}
                        timeRange={platformUrlState.timeRange}
                        activeIndicator={activeIndicator}
                      />
                    </StackItem>
                  </Stack>
                )}
              </PlatformStateContext.Consumer>
            )}
            {!this.state.selectedTag && <></>}
          </GridItem>
        </Grid>
      </>
    );
  } // render
} // SLOREstate
