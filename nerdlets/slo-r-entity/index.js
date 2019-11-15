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
  Stack,
  StackItem,
  EntityStorageQuery,
  EntityStorageMutation,
  Spinner,
  PlatformStateContext,
  NerdletStateContext,
  Modal,
  HeadingText,
  Dropdown,
  DropdownItem,
  TextField,
  NerdGraphQuery
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
      newSLOModalActive: false,
      newSLOName: "",
      newSLOTeam: "",
      newSLOTargetAttainment: "",
      newSLOSelectedAlerts: [],
      newSLOType: "",
      newSLOSelectedDefects: "",
      newSLOSelectedTransactions: "",
      transactions: null,
      entityDetails: null,
      alertOptions: "",
      transactionOptions: [],
      SLOTableView: false,
    }; //state

    this.openConfig = this._openConfig.bind(
      this
    ); /** opens the SLO configuration */
    this.rerenderSLOs = this._rerenderSLOs.bind(
      this
    ); /** forces nerdlet to redraw the SLO table */
    this.AddSLOModal = this.AddSLOModal.bind(this);
    this._loadEntityTransactions = this._loadEntityTransactions.bind(this);
    this._getEntityInformation = this._getEntityInformation.bind(this);
    this._validateSLOForm = this._validateSLOForm.bind(this);
    this.writeSLO = this.writeSLO.bind(this);
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

  async _getEntityInformation() {
    //get the entityGuid react context
    const __service_entity = this.context.entityGuid;
    //console.debug("Context: Entity", __service_entity);
    let __result;
    let __entity_details;

    //ensure we have a service entity from the context
    if (__service_entity === undefined) {
      __result.data.actor.entity == "UNKNOWN";
    } //if
    else {
      const __query = `{
            actor {
                entity(guid: "${__service_entity}") {
                account {
                    id
                    name
                }
                name
                accountId
                ... on ApmApplicationEntity {
                    language
                }
                tags {
                    key
                }
                }
            }}`;

      __result = await NerdGraphQuery.query({ query: __query });
    } //else

    //console.debug("Entity Result: ", __result);
    //check if we have a result object
    if (__result !== undefined) {
      __entity_details = {
        accountId: __result.data.actor.entity.accountId,
        appName: __result.data.actor.entity.name,
        language: __result.data.actor.entity.language,
        entityGuid: __service_entity,
        accountName: __result.data.actor.entity.account.name
      };
    } //if

    //set the entity details state
    this.setState({ entityDetails: __entity_details });

    this._loadEntityTransactions();
    this._updateAlertConfig();
  }

  async _loadEntityTransactions() {
    //we only want to run this the one time to gather transactions
    if (this.state.transactions === null) {
      const __query = `{
            actor {
              account(id: ${this.state.entityDetails.accountId}) {
                nrql(query: "SELECT count(*) FROM Transaction WHERE appName='${this.state.entityDetails.appName}' SINCE 1 MONTH AGO FACET name LIMIT 100") {
                  results
                }
              }
            }
          }`;

      const __result = await NerdGraphQuery.query({ query: __query });
      this.setState({ transactions: __result.data.actor.account.nrql.results });

      const transactionOptions = this.state.transactions.map(
        (transaction, index) => {
          return transaction.name;
        }
      );

      this.setState({ transactionOptions: transactionOptions });
    } //if
  }

  async _writeSLODocument(_slo) {
    const __entityGuid = this.state.entityGuid;
    //console.debug("SLO DOCUMENT ---> " + JSON.stringify(_slo));
    const __write_mutation = {
      actionType: EntityStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: "nr1-csg-slo-r",
      entityGuid: __entityGuid,
      documentId: _slo.slo_name,
      document: _slo
    }; //__write_mutation

    //need to have a real slo name - this is previously validated but acts as a double check.
    if (_slo.slo_name !== "") {
      const __write_result = await EntityStorageMutation.mutate(
        __write_mutation
      );

      //navigate to the root entity nerdlet for SLO/R
      const __nerdlet = {
        id: "nr1-csg-slo-r-nerdlet"
      };

      navigation.openNerdlet(__nerdlet);
    } //if
  }

  _validateSLOForm() {
    if (this.state.newSLOName === "") {
      return false;
    } //if

    if (this.state.newSLOTargetAttainment === "") {
      return false;
    } //if

    if (this.state.newSLOTeam === "") {
      return false;
    } //if

    if (this.state.newSLOType === "error_budget") {
      if (
        this.state.newSLOSelectedTransactions.length === 0 ||
        this.state.newSLOSelectedDefects.length === 0
      ) {
        return false;
      } //if
    } //if
    else {
      if (this.state.newSLOSelectedAlerts.length === 0) {
        return false;
      } //if
    } //else

    return true;
  }

  writeSLO(e) {
    //prevent default used to stop form submission to iframe
    e.preventDefault();

    //the SLO definition document we are about to write to nerdstore
    var __slo_document;

    if (this._validateSLOForm()) {
      let formattedSelectedDefects = "";

      if (formattedSelectedDefects) {
        formattedSelectedDefects = this.state.newSLOSelectedDefects.map(
          defect => {
            return defect.value;
          }
        );
      }

      //assemble the document object
      __slo_document = {
        slo_name: this.state.newSLOName,
        team: this.state.newSLOTeam,
        target: this.state.newSLOTargetAttainment,
        type: this.state.newSLOType,
        alerts: this.state.newSLOSelectedAlerts,
        defects: formattedSelectedDefects,
        transactions: this.state.newSLOSelectedTransactions,
        entityGuid: this.state.entityGuid,
        accountId: this.state.entityDetails.accountId,
        accountName: this.state.entityDetails.accountName,
        language: this.state.entityDetails.language,
        appName: this.state.entityDetails.appName,
        slo_r_version: "1.0.1"
      };

      //write the document
      this._writeSLODocument(__slo_document);
    } //if
    else {
      alert(
        "Problem with SLO definition! Please validate you have an SLO Name, Team, and Target defined. Also ensure your Error Budget includes at least one transaction and one defect, or your Alert driven SLO includes an Alert."
      );
    } //else
  }

  async _updateAlertConfig() {
    if (this.state.newSLOSelectedAlerts.length < 1) {
      const __query = `{
            actor {
              account(id: ${this.state.entityDetails.accountId}) {
                nrql(query: "SELECT count(*) FROM SLOR_ALERTS SINCE 12 MONTHS AGO FACET policy_name") {
                  results
                }
              }
            }
          }`;

      const __result = await NerdGraphQuery.query({ query: __query });
      this.setState({
        alertOptions: __result.data.actor.account.nrql.results
      });
    }
  }

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
    this._getEntityInformation();
  } //componentDidMount

  AddSLOModal() {
    const { transactions } = this.state;
    const defectOptions = [
      { value: "5%", label: "5xx Errors" },
      { value: "400", label: "400 Bad Request" },
      { value: "401", label: "401 Unauthorized" },
      { value: "403", label: "403 Forbidden" },
      { value: "404", label: "404 Not Found" },
      { value: "409", label: "409 Conflict" },
      { value: "apdex_frustrated", label: "Apdex Frustrated" }
    ];

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
                newSLOType:
                  event.target.innerHTML === "Error budget"
                    ? "error_budget"
                    : event.target.innerHTML
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
        {this.state.newSLOType === "error_budget" && (
          <div>
            <div className="error-budget-dependancy">
              <div className="defects-dropdown-container">
                <h4 className="dropdown-label">Defects</h4>
                <Multiselect
                  valueField="value"
                  textField="label"
                  data={defectOptions}
                  className="defects-dropdown react-select-dropdown"
                  placeholder="Select one or more defects"
                  onChange={value =>
                    this.setState({ newSLOSelectedDefects: value })
                  }
                />

                <small className="input-description">
                  Defects that occur on the selected transactions will be
                  counted against error budget attainment.
                </small>
              </div>
            </div>

            <div className="error-budget-dependancy">
              <div className="transactions-dropdown-container">
                <h4 className="dropdown-label">Transactions</h4>
                <Multiselect
                  data={this.state.transactionOptions}
                  className="transactions-dropdown react-select-dropdown"
                  placeholder="Select one or more transactions"
                  onChange={value =>
                    this.setState({ newSLOSelectedTransactions: value })
                  }
                />

                <small className="input-description">
                  Select one or more transactions evaluate for defects for this
                  error budget.
                </small>
              </div>
            </div>
          </div>
        )}
        {this.state.newSLOType !== "error_budget" &&
          this.state.newSLOType !== "" ? (
            <div className="error-budget-dependancy">
              <div className="alerts-dropdown-container">
                <h4 className="dropdown-label">Alerts</h4>
                <Multiselect
                  data={this.state.alertOptions}
                  valueField="policy_name"
                  value={this.state.newSLOSelectedAlerts}
                  allowCreate={true}
                  onCreate={name => {
                    this.setState(prevState => ({
                      newSLOSelectedAlerts: [
                        ...prevState.newSLOSelectedAlerts,
                        name
                      ]
                    }));
                    this.setState(prevState => ({
                      alertOptions: [...prevState.alertOptions, name]
                    }));
                  }}
                  textField="policy_name"
                  className="transactions-dropdown react-select-dropdown"
                  placeholder="Select one or more Alerts"
                  onChange={value =>
                    this.setState({ newSLOSelectedAlerts: value })
                  }
                />

                <small className="input-description">
                  Select one or more Alerts that appear in the SLOR_ALERTS event
                  table in Insights, or click the "Add Alert" button below to
                  enter the policy name of an Alert you your like to associate
                  with this SLO. For more information about configuring alerts to
                  be used with SLO/R please see the "Configuring Alerts" section
                  of the SLO/R readme (https://github.com/newrelic/nr1-csg-slo-r).
              </small>
              </div>
            </div>
          ) : (
            ""
          )}

        <Button
          type={Button.TYPE.Secondary}
          onClick={() => this.setState({ createTileModalActive: false })}
        >
          Cancel
        </Button>
        <Button type={Button.TYPE.PRIMARY} onClick={this.writeSLO}>
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
        <div>
          <Stack
            className="toolbar-container"
            fullWidth
            horizontalType={Stack.HORIZONTAL_TYPE.FILL}
            verticalType={Stack.VERTICAL_TYPE.CENTER}
            gapType={Stack.GAP_TYPE.NONE}
          >
            <StackItem className="toolbar-left-side">
              <div className="segmented-control-container">
                <button className="grid-view-button" onClick={() => this.setState({ SLOTableView: false })}>Grid</button>
                <button className="table-view-button" onClick={() => this.setState({ SLOTableView: true })}>Table</button>
              </div>

              <hr />
            </StackItem>
            <StackItem>
              <Stack
                className="toolbar-right-side"
                fullWidth
                horizontalType={Stack.HORIZONTAL_TYPE.RIGHT}
              >
                <Button
                  onClick={() => this.setState({ newSLOModalActive: true })}
                  type={Button.TYPE.PRIMARY}
                  iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_ADD}
                >
                  Define an SLO
                </Button>
              </Stack>
            </StackItem>
          </Stack>
          <Grid className={!sloHasBeenDefined ? "no-slos-exist" : "slo-table-container"}>
            <GridItem columnSpan={!sloHasBeenDefined ? 4 : 12}>
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
                        openDefineSlOModal={() => this.setState({ newSLOModalActive: true })}
                        tableView={this.state.SLOTableView}
                      />
                    )}
                  </NerdletStateContext.Consumer>
                )}
              </PlatformStateContext.Consumer>
            </GridItem>
          </Grid>
          <AddSLOModal />
        </div>
      );
    } //else
  } //render
} //SLOREntityNedlet
