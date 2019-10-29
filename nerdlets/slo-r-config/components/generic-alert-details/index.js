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
        genericAlertOnClickHandler: PropTypes.func,
        alerts: PropTypes.array
    } //propTypes

    constructor(props) {
        super(props)

        this.state = {
            alerts: null,
            candidate_alerts: []
        } //state

        this.addAlert = this._addAlert.bind(this);
        this.removeAlert = this._removeAlert.bind(this);
    } //constructor

    /** removes the alert index at the specified location */
    _removeAlert(_evt, _index) {

        _evt.preventDefault(); /* stops the submit of the form */

        var __alerts = this.state.alerts;

        // need to loop through the structure and actually reorder the alert indicies because I am saving their state
        for( var i = 0; i < __alerts.length; i++){ 
         
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

    /** provides an update to the alerts array and fills the candidate_alerts array the fiorst time it is invoked of if the array is still empty */
    async _updateAlertState(_alerts){

        console.debug("updateAlertState", _alerts);

        if (this.state.candidate_alerts.length < 1) {
            console.debug("we have no candidate alerts");
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
//            console.debug("some results: " +  JSON.stringify(__result));
            this.setState({candidate_alerts: __result.data.actor.account.nrql.results});
        } //if

        if (_alerts === undefined) {

            this.setState({alerts: this.props.alerts});
        } //alerts
        else {

            this.setState({alerts: _alerts});
        } //else

    }//_updateAlertState

    /** lifecycle - establishes the alerts array for render */
    componentDidMount() {

        this._updateAlertState();
    } //componentDidMount

    /** lifecycle - provides the options required to configure an SLO related to one or more Alerts */
    render() {

        if (this.state.alerts === null) {

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
                            <ul>
                                { this.state.candidate_alerts.map((_candidate, i) => {
                                    
                                    return (
                                        <div>
                                            <input type="checkbox" category="alert" name={_candidate.policy_name} value="off" id={i} onChange={_evt => this.props.genericAlertOnClickHandler("checkbox", _candidate.policy_name, _evt.nativeEvent.target.checked)}/>
                                            <label for={i}>{_candidate.policy_name} {_candidate.count}</label>
                                        </div> 
                                    )
                                })}
                            </ul>
                        </GridItem>
                    </Grid>
                </div>
            );

        } //else
    } //render
 } //GenericAlertDetails


 /**
  * 
  * return(
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

  */