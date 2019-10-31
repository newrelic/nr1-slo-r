/**
 * Provides configuration options for defining an alert driven SLO
 *
 * @file This files defines the NR1 App SLO/R Entity configuration functionality.
 * @author Gil Rice
 */
/** core */
import React from 'react';
import { Component } from 'react';
import PropTypes from 'prop-types';
/** nr1 */
import { BlockText } from 'nr1';
import { Spinner } from 'nr1';
import { NerdGraphQuery } from 'nr1';
import { Button } from 'nr1';
import { Grid } from 'nr1';
import { GridItem } from 'nr1';
import { PlatformStateContext } from 'nr1'
import { NerdletStateContext } from 'nr1';
/** local */
/** 3rd party */


/**
 * GenericAlertDetails
 */
export default class GenericAlertDetails extends Component {

    static propTypes = {
        accountId: PropTypes.any,
        genericAlertOnClickHandler: PropTypes.func
    } //propTypes

    constructor(props) {
        super(props)

        this.state = {
            candidate_alerts: [],
            selected_alerts: [],
            user_entered_alerts: []
        } //state

        this.addAlert = this._addAlert.bind(this);
        this.removeAlert = this._removeAlert.bind(this);
        this.updateAlert = this._updateAlert.bind(this);
        this.selectAlert = this._selectAlert.bind(this);
    } //constructor

    /** packages the sources of alerts for the parent config component via callback function */
    _sendAlerts2Config(_alerts) {

        this.props.genericAlertOnClickHandler(_alerts);
    } //_sendAlerts2Config

    /** manages the state of the selected alerts from the checkbox controls */
    _selectAlert(_name, _checked) {

        var __alerts = this.state.selected_alerts; //get the current alerts state ...

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

        

        //update the state object
        this.setState({
            ["selected_alerts"]: __alerts
        });
        this._sendAlerts2Config(this.state.selected_alerts.concat(this.state.user_entered_alerts));
    } //_selectAlert

    /** manages the state of the local alert array and conveys state changes to config */
    _updateAlert(_index, _value) {

        var __alerts = this.state.user_entered_alerts;
        __alerts[_index] = _value;
         
        
        
        this.setState({user_entered_alerts: __alerts});
        this._sendAlerts2Config(this.state.selected_alerts.concat(this.state.user_entered_alerts));
    } //updateAlerts

    /** removes the alert index at the specified location */
    _removeAlert(_evt, _index) {

        _evt.preventDefault(); /* stops the submit of the form */        
        var __alerts = this.state.user_entered_alerts;
        __alerts.splice(_index, 1);
    
        //this.props.genericAlertOnClickHandler("textfield_delete", null, _index);
        this.setState({user_entered_alerts: __alerts});
        this._sendAlerts2Config(this.state.selected_alerts.concat(this.state.user_entered_alerts));
        console.debug("Alerts after delete", __alerts);
    } //_removeAlert

    /** creates a new alert object in the array */
    _addAlert(_evt) {

        _evt.preventDefault(); /* stops the submit of the form */

        var __alerts = this.state.user_entered_alerts;
        __alerts.push(""); //add the alert to the array

        this.setState({user_entered_alerts: __alerts});
        this._sendAlerts2Config(this.state.selected_alerts.concat(this.state.user_entered_alerts));
    } //_addAlert

    /** provides an update to the alerts array and fills the candidate_alerts array the fiorst time it is invoked of if the array is still empty */
    async _updateAlertConfig() {

        if (this.state.candidate_alerts.length < 1) {

            const __query = `{
                actor {
                  account(id: ${this.props.accountId}) {
                    nrql(query: "SELECT count(*) FROM SLOR_ALERTS SINCE 12 MONTHS AGO FACET policy_name") {
                      results
                    }
                  }
                }
              }`;
    
            const __result = await NerdGraphQuery.query({query: __query});
            this.setState({candidate_alerts: __result.data.actor.account.nrql.results});
        } //if

    }//_updateAlertConfig

    /** lifecycle - establishes the alerts array for render */
    componentDidMount() {

        this._updateAlertConfig();
    } //componentDidMount

    /** lifecycle - provides the options required to configure an SLO related to one or more Alerts */
    render() {

        const { user_entered_alerts } = this.state;

        return(
            <div>
                {this.state.candidate_alerts.length > 0 ? (
                <div>
                    <Grid>
                        <GridItem columnSpan={12}>
                            <div>
                                <BlockText spacingType={[BlockText.SPACING_TYPE.MEDIUM]}>
                                    Select one or more Alerts that appear in the SLOR_ALERTS event table in Insights, or click the "Add Alert" button below to enter the policy name of an Alert you your like to associate with this SLO.
                                    For more information about configuring alerts to be used with SLO/R please see the "Configuring Alerts" section of the SLO/R readme (https://github.com/newrelic/nr1-csg-slo-r).
                                </BlockText>
                            </div>
                            <br/>
                        </GridItem>
                    </Grid>
                    
                    <Grid>
                        <GridItem columnSpan={12}>
                            <ul>
                                { this.state.candidate_alerts.map((_candidate, i) => {
                                    
                                    return (
                                        <div>
                                            <input type="checkbox" category="alert" name={_candidate.policy_name} value="off" id={i} onChange={_evt => this.selectAlert(_candidate.policy_name, _evt.nativeEvent.target.checked)}/>
                                            <label for={i}>{_candidate.policy_name}</label>
                                        </div> 
                                    )
                                })}
                            </ul>
                        </GridItem>
                    </Grid>
                </div>
                ) : (
                    <Grid>
                        <GridItem columnSpan={12}>
                            <div>
                                <BlockText spacingType={[BlockText.SPACING_TYPE.MEDIUM]}>
                                    We are unable to find any Alerts that appear in the SLOR_ALERTS event table in Insights. Please click the "Add Alert" button below to enter the policy name of an Alert you your like to associate with this SLO. 
                                    The Alert policy name you define must implement a notification webhook that forwards alert state to Insights, to be included in an SLO calculation. 
                                    For more information about configuring alerts to be used with SLO/R please see the "Configuring Alerts" section of the SLO/R readme (https://github.com/newrelic/nr1-csg-slo-r).
                                </BlockText>
                            </div>
                            <br/>
                        </GridItem>
                    </Grid>

                )}
                <br/>
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
                    <GridItem columnSpan={12}>
                        <div>
                        <table>
                            <tbody>
                            {user_entered_alerts.map((_alert, _index) =>
                                <tr>
                            
                                    <td>
                                        <input type="text" name="alert" size="55" id={_index} value={_alert} onChange={_evt => {this.updateAlert(_index, _evt.nativeEvent.target.value)}}/>
                                    </td>
                                    <td>
                                    <Button
                                        onClick={_evt => {this.removeAlert(_evt, _index)}}
                                        type={Button.TYPE.NORMAL}
                                        iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_REMOVE}>
                                    </Button>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>                             
                        </div>
                        
                    </GridItem>
                </Grid>
            </div>
        );
    } //render
 } //GenericAlertDetails
 //<input type="checkbox" category="alert" name={_candidate.policy_name} value="off" id={i} onChange={_evt => this.props.genericAlertOnClickHandler("checkbox", _candidate.policy_name, _evt.nativeEvent.target.checked)}/>