/**
 * Provides full New Relic One SLO/R Entity functionality.
 *
 * @file This files defines the NR1 App SLO/R Entity functionaly and loads dedicated elements to define and display SLOs.
 * @author Gil Rice
 */
/** core */
import React from "react";
import { Component } from "react";
import PropTypes from "prop-types";
/** nr1 */
import {
  Button,
  navigation,
  Grid,
  GridItem,
  EntityStorageQuery,
  Spinner,
  PlatformStateContext,
  NerdletStateContext,
  Modal,
  HeadingText,
  Dropdown,
  DropdownItem,
  TextField
} from "nr1";
/** local */
import SLOTable from "./components/slo-table";
/** 3rd party */
import { Multiselect } from "react-widgets";

/**
 * SLOREntityNerdlet
 */
export default class SLOREntityNedlet extends Component {
  static contextType = NerdletStateContext;

  static propTypes = {
    nerdletUrlState: PropTypes.object,
    launcherUrlState: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      entityGuid: this.props.nerdletUrlState.entityGuid,
      slo_documents: null,
      newSLOModalActive: true,
      newSLOName: "",
      newSLOTeam: "",
      newSLOTargetAttainment: "",
      newSLOType: "",
      newSLOSelectedDefects: ""
    }; //state

    this.openConfig = this._openConfig.bind(
      this
    ); /** opens the SLO configuration */
    this.rerenderSLOs = this._rerenderSLOs.bind(
      this
    ); /** forces nerdlet to redraw the SLO table */
    this.AddSLOModal = this.AddSLOModal.bind(this);
  } //constructor

  /** refresh the SLODocuments through a callback */
  _rerenderSLOs() {
    this._getSLODocuments();
  } //_rerenderSLOs

  /** opens the slo-r configuration nerdlet */
  _openConfig(_evt) {
    const __confignerdlet = {
      id: "slo-r-config",
      urlState: {
        entityGuid: this.state.entityGuid,
        renderCallback: this.rerenderSLOs
      }
    };

    navigation.openStackedNerdlet(__confignerdlet);
  } //openConfig

  /** gets all the SLO documents defined for this entity */
  async _getSLODocuments() {
    const __entityGuid = this.state.entityGuid;

    const _query = {
      actionType: EntityStorageQuery.FETCH_POLICY_TYPE.NO_CACHE,
      entityGuid: __entityGuid,
      collection: "nr1-csg-slo-r"
    }; //_query

    const __result = await EntityStorageQuery.query(_query);

    //no documents defined - populate the documents object with some innocuous text to have an empty table render
    if (__result.data === null) {
      this.setState({ slo_documents: "EMPTY" });
    } //if
    else {
      this.setState({ slo_documents: __result.data });
    } //else
  } //_getSLODocuments

  /** lifecycle prompts the fetching of the SLO documents for this entity */
  componentDidMount() {
    this._getSLODocuments();
  } //componentDidMount

  AddSLOModal() {
    const defectOptions = [
      { value: "5xErrors", label: "5xx Errors" },
      { value: 400, label: "400 Bad Request" },
      { value: 401, label: "401 Unauthorized" },
      { value: 403, label: "403 Forbidden" },
      { value: 404, label: "404 Not Found" },
      { value: 409, label: "409 Conflict" },
      { value: "apdexFrustrated", label: "Apdex Frustrated" }
    ];

    // * Where I left off on 11/12/19 at 3:27 PM:
    // Need to style the dropdown arrow and tokens of the
    // multiselect that I'm using

    return (
      <Modal
        hidden={!this.state.newSLOModalActive}
        onClose={() => this.setState({ newSLOModalActive: false })}
      >
        <HeadingText type={HeadingText.TYPE.HEADING_2}>
          Define an SLO
        </HeadingText>
        <p>
          Please provide the information needed to create this SLO below. You
          will be able to edit this information in the future.
        </p>

        <TextField
          label="SLO name"
          className="define-slo-input"
          onChange={() =>
            this.setState(previousState => ({
              ...previousState,
              newSLOName: event.target.value
            }))
          }
          value={this.state.newSLOName}
        ></TextField>

        <TextField
          label="team"
          className="define-slo-input"
          onChange={() =>
            this.setState(previousState => ({
              ...previousState,
              newSLOTeam: event.target.value
            }))
          }
          value={this.state.newSLOTeam}
        ></TextField>

        <TextField
          label="Target Attainment"
          className="define-slo-input"
          onChange={() =>
            this.setState(previousState => ({
              ...previousState,
              newSLOTargetAttainment: event.target.value
            }))
          }
          value={this.state.newSLOTargetAttainment}
        ></TextField>

        <Dropdown
          title={
            this.state.newSLOType === ""
              ? "Select the type of SLO you want to calculate"
              : this.state.newSLOType
          }
          label="Type"
          className="define-slo-input"
        >
          <DropdownItem
            onClick={e =>
              this.setState(previousState => ({
                ...previousState,
                newSLOType: event.target.innerHTML
              }))
            }
          >
            Error budget
          </DropdownItem>
          <DropdownItem
            onClick={e =>
              this.setState(previousState => ({
                ...previousState,
                newSLOType: event.target.innerHTML
              }))
            }
          >
            Availablility
          </DropdownItem>
          <DropdownItem
            onClick={e =>
              this.setState(previousState => ({
                ...previousState,
                newSLOType: event.target.innerHTML
              }))
            }
          >
            Capacity
          </DropdownItem>
          <DropdownItem
            onClick={e =>
              this.setState(previousState => ({
                ...previousState,
                newSLOType: event.target.innerHTML
              }))
            }
          >
            Latency
          </DropdownItem>
        </Dropdown>

        <div className="error-budget-dependancy">
          <div className="defects-dropdown-container">
            <h4 className="defects-dropdown-label">Defects</h4>
            <Multiselect
              valueField="value"
              textField="label"
              data={defectOptions}
              className="defects-dropdown react-select-dropdown"
              placeholder="Select one or more defects"
            />

            <small className="input-description">
              Defects that occur on the selected transactions will be counted
              against error budget attainment.
            </small>
          </div>
        </div>

        <Button
          type={Button.TYPE.Secondary}
          onClick={() => this.setState({ createTileModalActive: false })}
        >
          Cancel
        </Button>
        <Button type={Button.TYPE.PRIMARY} onClick={this.handleDefineSLOSubmit}>
          Add new serivce
        </Button>
      </Modal>
    );
  }

  /** lifecycle provides the rendering context for this nerdlet */
  render() {
    let AddSLOModal = this.AddSLOModal;
    //ensure we have state for our slo documents to render the reporting table and configuration options

    if (this.state.slo_documents === null) {
      return (
        <div>
          <Spinner className="centered" size={"small"} />
        </div>
      );
    } //if
    else {
      let sloHasBeenDefined = this.state.slo_documents.length > 0;

      return (
        <>
          <Grid className={!sloHasBeenDefined ? "hidden" : ""}>
            <GridItem columnSpan={3}>
              <div>
                <Button
                  onClick={this.openConfig}
                  type={Button.TYPE.NORMAL}
                  iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__FILE__A_ADD}
                >
                  Define an SLO
                </Button>
              </div>
              <br />
            </GridItem>
          </Grid>
          <Grid className={!sloHasBeenDefined ? "no-slos-exist" : ""}>
            <GridItem columnSpan={sloHasBeenDefined ? 4 : 12}>
              <PlatformStateContext.Consumer>
                {launcherUrlState => (
                  <NerdletStateContext.Consumer>
                    {nerdletUrlState => (
                      <SLOTable
                        entityGuid={this.state.entity}
                        slo_documents={this.state.slo_documents}
                        nerdlet_beginTS={launcherUrlState.timeRange.begin_time}
                        nerdlet_endTS={launcherUrlState.timeRange.end_time}
                        nerdlet_duration={launcherUrlState.timeRange.duration}
                        renderCallback={this.rerenderSLOs}
                        openConfig={this.openConfig}
                      />
                    )}
                  </NerdletStateContext.Consumer>
                )}
              </PlatformStateContext.Consumer>
            </GridItem>
          </Grid>
          <AddSLOModal />
        </>
      );
    } //else
  } //render
} //SLOREntityNedlet
