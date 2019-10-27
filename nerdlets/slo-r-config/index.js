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
        launcherUrlState: PropTypes.object,
        accountID: PropTypes.any, //IS this needed?
        renderCallback: PropTypes.func //need a render callback but how to implement ... 
    } //propTypes

    //TODO NEED TO FIND A WAY TO PERSIST THE accountid, appname, accountname
    constructor(props) {
        super(props);

        //The component state includes each of the form attributes we want to keep track of
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

        //on-click thingmies
        this.writeSLO = this.writeSLO.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleEBElementsChange = this._handleEBElementsChange.bind(this);
        this.handleGenericAlertChange = this._handleGenericAlertChange.bind(this);
    } //constructor

    /** manages the creation and deletion of Alerts defined for an SLO */
    _handleGenericAlertChange(_type, _name, _checked) {


        var __name = "alerts";
        var __value;
        var __alerts = this.state.alerts; //get the current alerts state ...

        if (_type === 'checkbox') {

            if (_checked) {

                console.debug('item checked');
                __alerts.push(_name);
            } //if
            else {

                console.debug('item UN checked');
                for( var i = 0; i < __alerts.length; i++){ 
                    if ( __alerts[i] === _name) {
                        __alerts.splice(i, 1); 
                      i--;
                    } //if
                 } //for
            } //else

            this.setState({
                ["alerts"]: __alerts
            });
        } //if

    } //_handleGenericAlertChange

    /** manages the state change in elements related to error budget definition (mostly checkboxes) */
    _handleEBElementsChange(_type, _name, _checked) {

        if (_type === 'transaction') {

            var __transactions = this.state.transactions;
            if (_checked) {

                console.debug('item checked');
                __transactions.push(_name);
            } //if
            else {

                console.debug('item UN checked');
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

                console.debug('item checked');
                __defects.push(_name);
            } //if
            else {

                console.debug('item UN checked');
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
        else {
            //no opt
        } //else

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
                slo_r_version: "1.0.0"
            };
            //debugger;
            //write the document please ... 
            this._writeSLODocument(__slo_document);

        } //if
        else {

            alert("Problem with SLO definition please validate form and try again.");
        } //else

    } //addSLO
    
    /** validates the structure of the SLO definition and returns an indication of the invalid option */
    _validateSLOForm() {

        var __validForm = true;

        //TODO need some validation events brought forward ...
        // Must have SLO name
        // Must have numeric target
        // if error_budget must have at least 1 defect and transaction selected
        // if alert the alerts must be non-empty input strings

        return(__validForm);
    } //validateSLOForm
    
    /** writes the given SLO configuration to nerdstore for the given entity */
    async _writeSLODocument(_slo) { 
            
        const __entityGuid = this.state.entity_details.entityGuid;
        console.debug("SLO DOCUMENT ---> " + JSON.stringify(_slo));
        const __write_mutation = {
            actionType: EntityStorageMutation.ACTION_TYPE.WRITE_DOCUMENT, 
            collection: "nr1-csg-slo-r", 
            entityGuid: __entityGuid, 
            documentId: _slo.slo_name, 
            document: _slo
        } //__write_mutation
    
        //need to have a real slo name
        if (_slo.slo_name !== "") {

            const __write_result = await EntityStorageMutation.mutate(__write_mutation)      
            console.log("write slo", __write_result);

            //callback to SLOEntity to get the table redrawn. 
            ///??? this.renderCallback();

console.debug("call back", this.context.renderCallback);
        //close this slide out thingmy
            const __nerdlet = {
                id: 'nr1-csg-slo-r-nerdlet',
            };
        
            navigation.openNerdlet(__nerdlet);
        } //if
        else {
            console.log("no name no do nothing .... ")
            //TODO REMOVE THIS - an SKLO with no name should not pass validation
        } //else
        
    } //_writeSLODocument

    /** gets the deails needed from the entity we are writing the SLO about */
    async _getEntityInformation() {
        
        //get the entityGuid react context
        const __service_entity = this.context.entityGuid;
        //this.renderCallback = this.context.renderCallback; ///TODO might try this again 
        console.debug("Context: Entity", __service_entity);

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

        console.debug("Entity Result: ", __result);
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

       // this.setState({entity_details: __result.data.actor.entity})
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
                                alertsArray={ this.state.alerts }
                            />
                        }
                        <br/>
                        <input type="submit" value="Create" id="submit"/>
                    </form>
                </div> 
            ); 
        } //else
    } //render
} //SLORConfig

/**
 *    <SLODefinitionElements
                                accountId={this.state.entity_details.accountId}
                                appName={this.state.entity_details.appName}
                                type={this.state.type}
                                errorBudgetOnClickHandler={this.handleEBElementsChange}
                                genericAlertOnClickHandler={this.handleGenericAlertChange}
                            />
 
 
 /** manages the creation and deletion of Alerts defined for an SLO 
 _handleGenericAlertChange(_name, _value, _index) {

    console.debug("ALERT Name", _name);
    console.debug("ALERT Value", _value);
    console.debug("ALERT Index", _index);

    var __name = "alerts";
    var __value;
    var __alerts = this.state.alerts; //get the current alerts state ...
console.debug("alerts len " + __alerts.length);
    if (_name === "add") {

        if (_index === __alerts.length) {

            //means the thing I want to add should be at the end.
            __alerts.push(
                {
                    id: _index,
                    value: null
                }
            );
        } //if
        else {

            console.debug("I didn't expect this ... ");
        } //else

    } //if
    else if (_name === "remove") {

        __alerts.splice(_index, 1);  //remove the selected index
    } //else if
    else if (_name === "alert") {
        //assumes the alert has already been added do a little validation and replace the values in the array element and repack.
        
        if(_index < __alerts.length) {

            __alerts[_index] = _value;
        } //if
        else {

            console.debug("this shouldn't be what the hell");
        } //else

    } //else if
    else {

        console.debug("this should not happen - alert handler");
    } //else
    //this is where we do the update state thingy ....

    console.debug("now alerts are", __alerts);

    this.setState({
        ["alerts"]: __alerts
    });
} //_handleGenericAlertChange
                           */