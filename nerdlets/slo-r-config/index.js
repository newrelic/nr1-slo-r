/**
 * Provides a configuration UI to create new SLO definitions and save them to an entity's nerdstore.
 *
 * @file This files defines the NR1 App SLO/R Entity configuration functionality.
 * @author Gil Rice
 */
/** core */
import React from 'react';
import { Component } from 'react';
import PropTypes from 'prop-types';
/** nr1 */
import { EntityStorageMutation } from 'nr1';
import { BlockText } from 'nr1';
import { Grid } from 'nr1';
import { GridItem } from 'nr1';
import { Spinner } from 'nr1';
import { navigation } from 'nr1';
import { NerdGraphQuery } from 'nr1'
import { PlatformStateContext } from 'nr1'
import { NerdletStateContext } from 'nr1';
/** local */
import SLODefinitionElements from './components/slo-definition-elements'; //TODO this goes away
import ErrorBudgetDetails from './components/error-budget-details';
import GenericAlertDetails from './components/generic-alert-details';

/** 3rd party */

/**
 * SLORConfig
 */
export default class SLORConfig extends Component {

    static contextType = NerdletStateContext;

    static propTypes = {        
        nerdletUrlState: PropTypes.object,
        launcherUrlState: PropTypes.object
    } //propTypes

    constructor(props) {
        super(props);

        //The component state includes each of the form attributes we want to keep track of and rendering variables.
        this.state = {
            slo_name: '',
            transactions: [],
            alerts: [],
            defects: [],
            team: '',
            target: '',
            type: '',
            entity_details: null,
            showHideAlert: false,
            showHideEB: false
        } //state

        //on-click binds
        this.writeSLO = this.writeSLO.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleEBElementsChange = this._handleEBElementsChange.bind(this);
        this.handleGenericAlertChange = this._handleGenericAlertChange.bind(this);
    } //constructor

    /** manages the creation and deletion of Alerts defined for an SLO */
    _handleGenericAlertChange(_alerts) {

        //update the state object
        this.setState({
            ["alerts"]: _alerts
        });
    } //_handleGenericAlertChange

    /** manages the state change in elements related to error budget definition (mostly checkboxes) */
    _handleEBElementsChange(_type, _name, _checked) {

        if (_type === 'transaction') {

            var __transactions = this.state.transactions;
            if (_checked) {

                __transactions.push(_name);
            } //if
            else {

                for( var i = 0; i < __transactions.length; i++){ 
                    if ( __transactions[i] === _name) {
                        __transactions.splice(i, 1); 
                      i--;
                    } //if
                 } //for
            } //else

            this.setState({
                ["transactions"]: __transactions
            });
        } //if
        else if (_type === 'defect') {

            var __defects = this.state.defects; //need this to manage the state of the defects array

            if (_checked) {

                __defects.push(_name);
            } //if
            else {

                for( var i = 0; i < __defects.length; i++){ 
                    if ( __defects[i] === _name) {
                        __defects.splice(i, 1); 
                      i--;
                    } //if
                 } //for
            } //else

            this.setState({
                ["defects"]: __defects
            });
        } //else if

    } //_handleEBElementsChange

    /** handles the change events on the slo configuration definitional components */
    handleChange(_evt) {

        const __target = _evt.target;
        var __name = __target.name;
        var __value = __target.value;

    
        //validate the target is a number
        if (__name === "target") {

            if (isNaN(__value)) {

                this.setState({
                    [__name]: this.state.target
                });
            } //if
            else {

                this.setState({
                    [__name]: __value
                });
            } //else        
        } //if
        else {

            this.setState({
                [__name]: __value
            });
        }//else

        //toggle the visual elements of the form
        if (__name === "type") {

            if (__value === "error_budget") {

                this.setState({showHideEB: true});
                this.setState({showHideAlert: false});
            } //if
            else {

                this.setState({showHideEB: false});
                this.setState({showHideAlert: true});
            } //else
        } //if
        
    } //handleChange

    /** handler to write the SLO defined into this entity's nerdstore */
    writeSLO(_evt) {
        //prevent default used to stop form submission to iframe
        _evt.preventDefault();

        //the SLO definition document we are about to write to nerdstore
        var __slo_document;
    
        if (this._validateSLOForm()) {

            //assemble the document object
            __slo_document = {
                slo_name: this.state.slo_name,
                team: this.state.team,
                target: this.state.target,
                type: this.state.type,
                alerts: this.state.alerts,
                defects: this.state.defects,
                transactions: this.state.transactions,
                entityGuid: this.state.entity_details.entityGuid,
                accountId: this.state.entity_details.accountId,
                accountName: this.state.entity_details.accountName,
                language: this.state.entity_details.language,
                appName: this.state.entity_details.appName,
                slo_r_version: "1.0.1"
            };

            //write the document
            this._writeSLODocument(__slo_document);

        } //if
        else {

            alert("Problem with SLO definition! Please validate you have an SLO Name, Team, and Target defined. Also ensure your Error Budget includes at least one transaction and one defect, or your Alert driven SLO includes an Alert.");
        } //else

    } //addSLO
    
    /** validates the structure of the SLO definition and returns an indication of the invalid option */
    _validateSLOForm() {

        if (this.state.slo_name === '') {

            return false;
        } //if

        if (this.state.target === '') {

            return false;
        } //if

        if (this.state.team === '') {

            return false;
        } //if

        if (this.state.type === "error_budget") {

            if (this.state.transactions.length === 0 || this.state.defects.length === 0) {

                return false;
            } //if

        } //if
        else {

            if (this.state.alerts.length === 0) {

                return false;
            } //if
        } //else

        return true;
    } //validateSLOForm
    
    /** writes the given SLO configuration to nerdstore for the given entity */
    async _writeSLODocument(_slo) { 
            
        const __entityGuid = this.state.entity_details.entityGuid;
        //console.debug("SLO DOCUMENT ---> " + JSON.stringify(_slo));
        const __write_mutation = {
            actionType: EntityStorageMutation.ACTION_TYPE.WRITE_DOCUMENT, 
            collection: "nr1-csg-slo-r", 
            entityGuid: __entityGuid, 
            documentId: _slo.slo_name, 
            document: _slo
        } //__write_mutation
    
        //need to have a real slo name - this is previously validated but acts as a double check.
        if (_slo.slo_name !== "") {

            const __write_result = await EntityStorageMutation.mutate(__write_mutation)      

            //navigate to the root entity nerdlet for SLO/R
            const __nerdlet = {
                id: 'nr1-csg-slo-r-nerdlet',
            };

            navigation.openNerdlet(__nerdlet);
        } //if

    } //_writeSLODocument

    /** gets the deails needed from the entity we are writing the SLO about */
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
    
            __result = await NerdGraphQuery.query({query: __query});
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
       this.setState({entity_details: __entity_details});
    } //_getEntityInformation

    /** lifecycle - loads the entity information into state so the UI can render */
    componentDidMount() {

        this._getEntityInformation();
    } //componentDidMount

    /** lifecycle - renders the UI options to configure an SLO for this entity */
    render() {
        
        if (this.state.entity_details === null) {

            return(
                <div>
                    <Spinner/>
                </div>
            );

        } //if
        else {

            return(

                 <div> 
                     <Grid>
                            <GridItem columnSpan={6}>
                                <div>
                                    <br/>
                                    <form onSubmit={this.writeSLO}>
                                        <label>SLO Name:
                                            <input type="text" name="slo_name" size="55" id="slo_name" value={this.state.slo_name} onChange={this.handleChange}/>
                                        </label>
                                        <br/>
                                        <label>Team:
                                            <input type="text" name="team" size="55" id="team" value={this.state.team} onChange={this.handleChange}/>
                                        </label>
                                        <br/>
                                        <label>Target Attainment:
                                            <input type="text" name="target" size="55" id="target" value={this.state.target} onChange={this.handleChange}/>
                                        </label>
                                        <br/>
                                        <br/>
                                        <label>Type</label>
                                        <br/>
                                        <input type="radio" id="error_budget" name="type" value="error_budget" onChange={this.handleChange}  id="error_budget"/>
                                        <label for="error_budget">Error Budget</label>
                                        <br/>
                                        <input type="radio" id="availability" name="type"  value="availability" onChange={this.handleChange} id="availability" />
                                        <label for="availability">Availability</label>
                                        <br/>
                                        <input type="radio" id="capacity" name="type"  value="capacity" onChange={this.handleChange}  id="capacity"/>
                                        <label for="capacity">Capacity</label>
                                        <br/>
                                        <input type="radio" id="latency" name="type"  value="latency" onChange={this.handleChange}  id="latency"/>
                                        <label for="latency">Latency</label>
                                        <br/>
                                        <br/>
                                        <hr></hr>
                                        <br/>
                                        { this.state.showHideEB && 
                                        
                                            <ErrorBudgetDetails
                                            accountId={this.state.entity_details.accountId}
                                            appName={this.state.entity_details.appName}
                                            errorBudgetOnClickHandler={this.handleEBElementsChange}
                                            />
                                        }
                                        { this.state.showHideAlert &&
                                                <GenericAlertDetails
                                                accountId={ this.state.entity_details.accountId }
                                                genericAlertOnClickHandler={ this.handleGenericAlertChange }
                                            />
                                        }
                                        <br/>
                                        <input type="submit" value="Create SLO" id="submit"/>
                                    </form>
                                </div>
                                <br/>
                            </GridItem>
                            <GridItem columnSpan={5}>
                                <div>
                                    <br/>
                                    <BlockText spacingType={[BlockText.SPACING_TYPE.MEDIUM]}>
                                        SLO Name: Pick a unique name that describes the SLO for this entity. You might want to use a naming convention (e.g. North America DataServices Availability)
                                    </BlockText>
                                    <br/>
                                    <BlockText spacingType={[BlockText.SPACING_TYPE.MEDIUM]}>
                                        Team: Enter the team name with which you wish to associate this SLO. Teams can have multiple SLOs and permit SLO aggregation. 
                                    </BlockText>
                                    <br/>
                                    <BlockText spacingType={[BlockText.SPACING_TYPE.MEDIUM]}>
                                        Target Attainment: Specifiy a numeric target for the SLO (e.g. 99.995). 
                                    </BlockText>
                                    <br/>
                                    <BlockText spacingType={[BlockText.SPACING_TYPE.MEDIUM]}>
                                        Type: Select the type of SLO you wish to calculate. Error Budget SLOs calculate the percentage of transactions that do not exhibit a specified defect. 
                                        Availability, Latency, and Capacity SLOs are all powered by one or more Alert policies; they calculate the percentage of time that their dependent policies are not in violation. 
                                    </BlockText>
                                </div>
                            </GridItem>
                        </Grid>
                        <br/>
                    </div> 
            ); 
        } //else
    } //render
} //SLORConfig