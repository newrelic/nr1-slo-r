/**
 * Provides an html output of an alert centric SLO calculation.
 *
 * @file This files defines a component that renders the a given SLO definition for an entity.
 * @author Gil Rice
 */
/** core */
import React from 'react';
import { Component } from 'react';
import PropTypes from 'prop-types';
/** nr1 */
import { Spinner } from 'nr1';
import { NerdGraphQuery } from 'nr1';
/** local */
/** 3rd party */

/**
 * AlertDrivenSLO
 */
export default class AlertDrivenSLO extends Component {

    static propTypes = {
        alerts: PropTypes.array,
        nerdlet_beginTS: PropTypes.any,
        nerdlet_endTS: PropTypes.any,
        nerdlet_duration: PropTypes.any,
        accountId: PropTypes.any,
        scope: PropTypes.any,
        target: PropTypes.any
    } //propTypes

    constructor(props) {
        super(props)

        this.state = {
            slo_result: null
        } //state
    } //constructor

    /** provides the where clause for the queries given the alerts array provided by the component properties */
    _getAlertsWhereClause(_alerts) {

        var _alertsClause = "policy_name IN (";

        for (var i = 0; i < _alerts.length; i++) {

            if (i > 0) {

                _alertsClause = _alertsClause + ", ";
            } //if
            _alertsClause = _alertsClause + "'" + _alerts[i] + "'"

        } //for

        _alertsClause = _alertsClause + ")"

        return (_alertsClause);
    } //_getAlertsWhereClause

    /** returns the full nrql needed to collect the alert policy violations that caused an open alert to fire */
    _getOpenedAlertNRQL(_alerts, _begin, _end) {

        const __NRQL = `SELECT latest(duration), latest(timestamp) FROM SLOR_ALERTS WHERE ${this._getAlertsWhereClause(_alerts)} AND current_state = 'open' FACET incident_id SINCE ${Math.round(_begin)} UNTIL ${Math.round(_end)} LIMIT MAX`;
        return (__NRQL);
    } //getErrorBudgerNRQL

    /** returns the full nrql needed to collect the alert policy violations that caused an close alert to fire */
    _getClosedAlertNRQL(_alerts, _begin, _end) {

        const __NRQL = `SELECT latest(duration), latest(timestamp) FROM SLOR_ALERTS WHERE ${this._getAlertsWhereClause(_alerts)} AND current_state = 'closed' FACET incident_id SINCE ${Math.round(_begin)} UNTIL ${Math.round(_end)} LIMIT MAX`;
        return (__NRQL);
    } //getErrorBudgerNRQL


    /** provides the SLO attainment for the given SLO document for the time scope provided */
    async _getAlertDrivenSLOData() {

        var __scope = this.props.scope;
        var __NRQL_OPEN;
        var __NRQL_CLOSED;
        var __beginTS = this.props.nerdlet_beginTS;
        var __endTS = this.props.nerdlet_endTS;
        var __duration = this.props.nerdlet_duration;
        var __date = Date.now();

        //need to ensure we have the latest current time if no time supplied - otherwise the ranges might go negative and that's not cool
        if (__endTS === undefined || __endTS === null) {
            __endTS = __date;
        } //if
        else {

            __endTS = this.props.nerdlet_endTS;
        } //else

        //determine if this is a fixed or variable time scope
        if (__scope === "7_day") {

            __duration = null;
            __beginTS = +__endTS - +"604800000";
        } //if
        else if (__scope === "30_day") {

            __duration = null;
            __beginTS = +__endTS - +"2592000000";
        } //else if
        else {
            //assume current time 
            if (__duration !== null) {

                __beginTS = +__endTS - +__duration;
            } //if
            else {

                __beginTS = this.props.nerdlet_beginTS;
                __endTS = this.props.nerdlet_endTS;
            } //else
        } //else

        var __NRQL_OPEN = this._getOpenedAlertNRQL(this.props.alerts, __beginTS, __endTS);
        var __NRQL_CLOSED = this._getClosedAlertNRQL(this.props.alerts, __beginTS, __endTS);

        const __queryOpenAlerts = `{
            actor {
              account(id: ${this.props.accountId}) {
                nrql(query: "${__NRQL_OPEN}") {
                  results
                }
              }
            }
          }`;

        const __queryClosedAlerts = `{
            actor {
              account(id: ${this.props.accountId}) {
                nrql(query: "${__NRQL_CLOSED}") {
                  results
                }
              }
            }
          }`;

        const __resultOpenAlerts = await NerdGraphQuery.query({ query: __queryOpenAlerts });
        const __resultClosedAlerts = await NerdGraphQuery.query({ query: __queryClosedAlerts });


        //process the finished alerts and determine if the start time exists in this time period - 
        //if not the alert starts at the beginning of the time bucket .....
        var __effectiveAlertWindows = []; //this variable stores the alert window ranges calculated from the open and closed alert occurances
        var __tempAlertWindow;

        //looping through the closed alerts defines those alert violations that have opened and closed during the current time period. It does not contemplate 
        //alerts that are open pending a close operation.   
        __resultClosedAlerts.data.actor.account.nrql.results.map(_alertClosed => {

            var __openAlertInfo = this._getOpenAlert(_alertClosed.incident_id, __resultOpenAlerts.data.actor.account.nrql.results, __beginTS);
            __tempAlertWindow = {
                incidentId: _alertClosed.incident_id,
                openedTimeStamp: __openAlertInfo.timestamp,
                openedDuration: __openAlertInfo.duration,
                closedDuration: _alertClosed["latest.duration"],
                closedTimeStamp: _alertClosed["latest.timestamp"]
            }
            __effectiveAlertWindows = this._reconcileCandidateRange(__tempAlertWindow, __effectiveAlertWindows);
        });

        //process the __effectiveAlertWindows to come up with a total in milliseconds of the effective time ranges
        var __accumulatedMillisecondsInAlertState = 0;

        __effectiveAlertWindows.map(_window => {

            __accumulatedMillisecondsInAlertState = __accumulatedMillisecondsInAlertState + (+_window.closedTimeStamp - +_window.openedTimeStamp);
        });

        //calculate the percentage of time of this window that the effective alerts were fired
        var __SLO_RESULT = 100 - (__accumulatedMillisecondsInAlertState / (__endTS - __beginTS));

        //set thw SLO result as 100 - the percentage of time in violation
        this.setState({ slo_result: __SLO_RESULT });

    } //_getAlertDrivenSLOData

    _getOpenAlert(_incidentId, _candidateOpens, _beginTS) {

        var __openAlertInfo = null;

        for (var i = 0; i < _candidateOpens.length; i++) {

            if (_candidateOpens[i].incident_id === _incidentId) {

                __openAlertInfo = {
                    timestamp: _candidateOpens[i]["latest.timestamp"],
                    duration: _candidateOpens[i]["latest.duration"]
                }
                break;
            } //if
        };

        //if the time is still null then it is the start time of this evaluation bucket
        if (__openAlertInfo === null) {

            __openAlertInfo = {
                timestamp: _beginTS,
                duration: 0
            }

        } //if
        return (__openAlertInfo);

    } //_getOpenAlert

    _reconcileCandidateRange(_candidateRange, _alertRanges) {

        //TODO returns the adjusted array of alert ranges
        var __integretryCheck = false;
        var __addRange = true;
        var __alertRanges = _alertRanges;

        //there are no current candidate ranges to compare against to just push the range we have been supplied
        if (__alertRanges.length === 0) {

            __addRange = true;
        } //if
        else {

            //loop the candidate ranges and determine if this range overlaps wioth the others
            __alertRanges.map(_range => {

                //check to see the candidate range occurs wholly within the given range
                if (_candidateRange.openedTimeStamp >= _range.openedTimeStamp && _candidateRange.openedTimeStamp <= _range.closedTimeStamp) {

                    //closed timestamp conditions ...
                    if (_candidateRange.closedTimeStamp > _range.closedTimeStamp) {
                        //update the new end period of this range timestamp and ignore the start
                        _range.closedTimeStamp = _candidateRange.closedTimeStamp;
                        __integretryCheck = true;
                        __addRange = false;
                    } //if
                } //if
                //need to check that this candidate range doesn't wholly overlap the given range ...
                else if (_candidateRange.closedTimeStamp >= _range.openedTimeStamp && _candidateRange.closedTimeStamp <= _range.closedTimeStamp) {

                    if (_candidateRange.openedTimeStamp < _range.openedTimeStamp) {

                        _range.openedTimeStamp = _candidateRange.openedTimeStamp;
                        __integretryCheck = true;
                        __addRange = false;
                    } //if
                } //else if
                // the begin and end events are greater than the cadidate range
                else if (_candidateRange.openedTimeStamp < _range.openedTimeStamp && _candidateRange.closedTimeStamp > _range.closedTimeStamp) {

                    _range.openedTimeStamp = _candidateRange.openedTimeStamp;
                    _range.closedTimeStamp = _candidateRange.closedTimeStamp;
                    __integretryCheck = true;
                    __addRange = false;
                } //else if
                //the begin and end events are entirely contained within the candidate range         
                else if (_candidateRange.openedTimeStamp >= _range.openedTimeStamp && _candidateRange.closedTimeStamp <= _range.closedTimeStamp) {

                    __addRange = false;
                } //else if

            });

        } //else

        //determine if we need to add the canidate to the given array
        if (__addRange) {

            __alertRanges.push(_candidateRange);
        } //if

        //perform integrity check, because we might have created a bridge between ranges by expanding and we don't want to double count time
        if (__integretryCheck) {
            //TODO
        } //if

        return (__alertRanges);
    } //_reconcileCandidateRange

    /** lifecycle method initiaties the SLO calculation and saves the result to state */
    componentWillMount() {

        this._getAlertDrivenSLOData();
    } //componentWillMount

    /** lifecyce - provides for a subsequent update of the component based on entry criteria of shouldComponentUpdate */
    componentDidUpdate() {

        this._getAlertDrivenSLOData();
    } //componentDidUpdate 

    /** lifecycle - determines if there should be a full component update */
    shouldComponentUpdate(nextProps) {

        if (this.state.slo_result === null) {

            return true;
        } //if

        if (nextProps.nerdlet_beginTS === this.props.nerdlet_beginTS && nextProps.nerdlet_duration === this.props.nerdlet_duration && nextProps.nerdlet_endTS === this.props.nerdlet_endTS) {

            return false;

        } //if
        else {

            return true;
        } //if
    } //shouldComponentUpdate

    /** lifecycle renders the html element for slo based on one or more alerts firing */
    render() {

        let status;

        if (this.state.slo_result === null) {

            return (
                <div>
                    <Spinner />
                </div>
            );
        } //if
        else {

            //unable to format what has been returned
            if (this.state.slo_result === null) {
                return ('NaN');
            } //if
            else {

                if ((Math.round(this.state.slo_result * 1000) / 1000) < this.props.target) {
                    status = 'status-poor';
                } //if
                else {
                    status = 'status-good';
                } //else

                return (<span className={status}>{Math.round(this.state.slo_result * 1000) / 1000}</span>);
            } //else
        }//else

    }//render    
} //AlertDrivenSLO