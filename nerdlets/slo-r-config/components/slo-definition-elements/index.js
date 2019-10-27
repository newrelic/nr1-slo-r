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
import { Spinner } from 'nr1';
import { NrqlQuery } from 'nr1';
import { Button } from 'nr1';
import { Grid } from 'nr1';
import { GridItem } from 'nr1';
import { PlatformStateContext } from 'nr1'
import { NerdletStateContext } from 'nr1';
/** local */
//TODO ... make these components and simplify this layout/function
//import EBDefinition from './components/error-budget-definition';
//import GenericAlertDefinition from './components/generic-alert-definition';
/** 3rd party */


/**
 * SLODefinitionElements
 */
export default class SLODefinitionElements extends Component { 

    static contextType = NerdletStateContext;

    static propTypes = {
        accountId: PropTypes.any,
        appName: PropTypes.any,
        type: PropTypes.any,
        errorBudgetOnClickHandler: PropTypes.func,
        genericAlertOnClickHandler: PropTypes.func
    } //propTypes

    constructor(props) {
        super(props)

        this.state = {
            slo_type: '',
            alerts: []
        } //state

        this.addAlert = this._addAlert.bind(this);
        this.removeAlert = this._removeAlert.bind(this);
    } //constructor

    /** removes the alert index at the specified location */
    _removeAlert(_evt, _index) {

        _evt.preventDefault(); /* hoping this stops the submit of the form */

        var __alerts = this.state.alerts;

        // need to loop through the structure and actually reorder the alert indicies because I am saving their state
        for( var i = 0; i < __alerts.length; i++){ 
         
            console.debug("index passed: " + _index);
            console.debug("iterator: " + i);
            console.debug();
            if ( __alerts[i].id === _index) {

                __alerts.splice(_index, 1);  
              i--;
            } //if
            else if (__alerts[i].id !== i) {
            __alerts[i] = { index: i}
            } //else if

         } //for



        this.props.genericAlertOnClickHandler("remove", null, _index);
        this.setState({alerts: __alerts});

        console.debug("Alerts after delete", __alerts);
    } //_removeAlert

    /** creates a new alert object in the array */
    _addAlert(_evt) {

        _evt.preventDefault(); /* hoping this stops the submit of the form */
console.debug("add fired");
        var __alerts = this.state.alerts;
        var __alert;

        if (__alerts.length < 1) {

            __alert = {
                index: 0
            }
        } //if
        else {
            __alert = {
                index: __alerts.length
            }
        } //else

        __alerts.push(__alert);

        this.props.genericAlertOnClickHandler("add", null, __alerts.length - 1);

        this.setState({alerts: __alerts});

    } //_addAlert

    /** convinence method to toggle the state of the underlying UI components */
    _setSLODefinitionType(_slotype) {

        this.setState({slo_type: _slotype});
    } //_setSLODefinitionType

    /** lifecycle - sets the type state to effect conditional rendering */
    componentDidMount() {

        if (this.props.accountId !== undefined) {

            this._setSLODefinitionType(this.props.type)
        } //if

    } //componentDidMount
       
    /** lifecycle renders the definitional UI for the SLO based on content parameters of the enclosing SLO configuration component */
    render() {

        if (this.state.slo_type === "error_budget") {

            //TODO - CONSIDER MAKING THIS A COMPONENT? OR 2 COMPONENTS AND USING REACT CONDITIONAL RENDERING LOGIC ... THIS CAN BE CLEANED UP A LOT
            return(
                <div>
                    <label>Defects</label>
                    <div>
                        <input type="checkbox" category="defect" name="5%" id="500" onChange={_evt => this.props.errorBudgetOnClickHandler('defect', '5%', _evt.nativeEvent.target.checked)}/>
                        <label>5xx Errors</label>
                    </div> 
                    <div>
                        <input type="checkbox" category="defect" name="400" id="400" onChange={_evt => this.props.errorBudgetOnClickHandler('defect', '400', _evt.nativeEvent.target.checked)}/>
                        <label>400 Bad Request</label>
                    </div> 
                    <div>
                        <input type="checkbox" category="defect" name="401" value="off" id="401" onChange={_evt => this.props.errorBudgetOnClickHandler('defect', '401', _evt.nativeEvent.target.checked)}/>
                        <label>401 Unauthorized</label>
                    </div>
                    <div>
                        <input type="checkbox" category="defect" name="403" value="off" id="403" onChange={_evt => this.props.errorBudgetOnClickHandler('defect', '403', _evt.nativeEvent.target.checked)}/>
                        <label>403 Forbidden</label>
                    </div> 
                    <div>
                        <input type="checkbox" category="defect" name="404" value="off" id="404" onChange={_evt => this.props.errorBudgetOnClickHandler('defect', '404', _evt.nativeEvent.target.checked)}/>
                        <label>404 Not Found</label>
                    </div>
                    <div>
                        <input type="checkbox" category="defect" name="409" value="off" id="409" onChange={_evt => this.props.errorBudgetOnClickHandler('defect', '409', _evt.nativeEvent.target.checked)}/>
                        <label>409 Conflict</label>
                    </div>
                    <div>
                        <input type="checkbox" category="defect" name="Apdex Frustrated" value="off" id="999" onChange={_evt => this.props.errorBudgetOnClickHandler('defect', 'apdex_frustrated', _evt.nativeEvent.target.checked)}/>
                        <label>Apdex Frustrated</label>
                    </div> 
                    <br/>
                    <label>Transactions</label>
                    {/** using nrqlquery to get the transaction associated with this entity */}
                    <NrqlQuery accountId={this.props.accountId} query={`SELECT count(*) FROM Transaction WHERE appName='${this.props.appName}' SINCE 5 DAYS AGO FACET name LIMIT 100`}>
                        {({loading, data, error}) => {
                            if (loading) {
                                return(<Spinner />)
                            } //if
                            if (error) {
                                return(<p>{JSON.stringify(error)}</p>)
                            } //if
                            //console.debug("nrql", data);
                            return (
                                <ul>
                                    {data.map((result, i) => {
                                        if (result.metadata.name !== "Other") {
                                            return (
                                                <div>
                                                    <input type="checkbox" category="transaction" name={result.metadata.name} value="off" id={i} onChange={_evt => this.props.errorBudgetOnClickHandler('transaction', result.metadata.name, _evt.nativeEvent.target.checked)}/>
                                                    <label for={i}>{result.metadata.name} {result.count}</label>
                                                </div> 
                                                )
                                            } 
                                        })}
                                </ul>
                            );
                            }}
                    </NrqlQuery>
                </div>
            );
        } //if
        else if (this.state.slo_type === "capacity" || this.state.slo_type === "availability" || this.state.slo_type === "latency") {
            return(
                <div>
                    <Grid>
                        <GridItem columnSpan={3}>
                            <div>
                                <Button
                                    onClick={this.addAlert}
                                    type={Button.TYPE.NORMAL}
                                    iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__FILE__A_ADD}>
                                    Add Alert
                                </Button>
                            </div>
                            <br/>
                        </GridItem>
                    </Grid>
                    <Grid>
                        <GridItem columnSpan={4}>
                            <div>
                            <table>
                                <tbody>
                            { this.state.alerts.map(__alert =>
                                    <tr>
                                
                                        <td>
                                            <input type="text" name="alert" size="55" id={__alert.index} onChange={_evt => {this.props.genericAlertOnClickHandler(_evt.nativeEvent.target.name, _evt.nativeEvent.target.value, __alert.index)}}/>
                                        </td>
                                        <td>
                                        <Button
                                            onClick={_evt => {this.removeAlert(_evt, __alert.index)}}
                                            type={Button.TYPE.NORMAL}
                                            iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_REMOVE}>
                                        </Button>
                                        </td>
                                    </tr>
                            )                            
                            }
                            </tbody>
                            </table>                             
                            </div>
                            
                        </GridItem>
                    </Grid>
                </div>
            );

        } //else if
        else {

            return(<div></div>);
        } //else

    } //render

}//SLODefinitionElements