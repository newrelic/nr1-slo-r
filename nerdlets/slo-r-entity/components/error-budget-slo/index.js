/**
 * Provides an html output of an error budget calculation.
 *
 * @file This files defines a component that renders the Error Budget attainment for a given SLO definition for an entity.
 * @author Gil Rice
 */
/** core */
import React from 'react';
import { Component } from 'react';
import PropTypes from 'prop-types';
/** nr1 */
import { Spinner } from 'nr1';
import { NrqlQuery } from 'nr1'
/** local */
/** 3rd party */

/**
 * ErrorBudgetSLO
 */
export default class ErrorBudgetSLO extends Component { 

    static propTypes = {
        entityGuid: PropTypes.any,
        transactions: PropTypes.array,
        defects: PropTypes.array,
        nerdlet_beginTS: PropTypes.any,
        nerdlet_endTS: PropTypes.any,
        nerdlet_duration: PropTypes.any,
        appName: PropTypes.any,
        accountId: PropTypes.any,
        language: PropTypes.any,
        scope: PropTypes.any,
        target: PropTypes.any
    } //propTypes

    constructor(props) {
        super(props)

        this.state = {
            slo_results: null
        } //state
    } //constructor

    /** returns an nrql fragment string that describes the errors or defects to contemplate for the error budget slo */
    _getErrorFilter(_transactions, _defects) {

        var __ERROR_FILTER = "";
    
        _transactions.map(transaction => {
            
            __ERROR_FILTER = __ERROR_FILTER + "FILTER(count(*), WHERE name = '" + transaction + "'";

            var __DEFECTS_FILTER = "";
            _defects.map(defect => {

                //evaluate if the defect is an httpResponseCode releated or apdexPerfZone
                if (defect === 'apdex') {

                    __DEFECTS_FILTER = __DEFECTS_FILTER + " AND apdexPerfZone = 'F'"
                } //if
                else {

                    __DEFECTS_FILTER = __DEFECTS_FILTER + " AND " + this._getAgentHTTPResponseAttributeName() + " LIKE " + "'" + defect + "'";
                } //else

            });

            __ERROR_FILTER = __ERROR_FILTER + __DEFECTS_FILTER + ") + "; //lazy way to account for the array elements
        });

        __ERROR_FILTER = __ERROR_FILTER + "0"; //completes the expression on the final array element
    
        return(__ERROR_FILTER);
    } //getErrorFilter

    /** returns an nrql fragment string that desribes the total number of transactions */
    _getTotalFilter(_transactions) {
    
        var __TOTAL_FILTER = "";
    
        _transactions.map(transaction => {
            
            __TOTAL_FILTER = __TOTAL_FILTER + "FILTER(count(*), WHERE name = '" + transaction + "') + ";
        });
        __TOTAL_FILTER = __TOTAL_FILTER + "0"; //completes the expression on the array element
    
        return(__TOTAL_FILTER);
    } //getTotalFilter

    //TODO this seems like a general purpose utility for creating a time clause for NRQL
    /** returns a string that represents the time clause for nrql */
    _formatNRQLTimeRange(_begin_time, _end_time, _duration) {
    
        var __begin = _begin_time;
        var __end = _end_time;
        var __duration = _duration;
        var __durationInMinutes;
        var __date = new Date();
        var __time_clause = "";
        var __apm_begin;
        var __apm_end;
    
        //define the time clause for our NRQL
        if (__duration !== null) {
    
            __durationInMinutes = __duration / 1000 / 60;
            __time_clause = "SINCE " + __durationInMinutes + " MINUTES AGO";
        } //if
        else {
    
            if (__begin === null) {
    
                __begin = __date.getMilliseconds();
            } //if
    
            if (__end === null) {
    
                __end = __date.getMilliseconds();
            } //if
    
            __apm_begin = __begin / 1000;
            __apm_end = __end / 1000;
    
            __time_clause = "SINCE " + Math.round(__apm_begin) + " UNTIL " + Math.round(__apm_end);
    
        } //else
    
        return(__time_clause);
    
    } //_formatNRQLTimeRange

    /** returns the full nrql needed to calculate the error budget */
    _getErrorBudgetNRQL(_transactions, _defects, _begin, _end, _duration, _appName) {
    
        const __NRQL = `SELECT 100 - ((${this._getErrorFilter(_transactions, _defects)}) / (${this._getTotalFilter(_transactions)})) AS 'SLO' FROM Transaction WHERE appName = '${_appName}' AND ${this._getAgentHTTPResponseAttributeName()} IS NOT NULL ${this._formatNRQLTimeRange(_begin, _end, _duration)}`;
        
        console.log("NRQL TEST", __NRQL);
        return(__NRQL);    
    } //getErrorBudgerNRQL

    /** returns a string the describes the attribute name for the http response code for our language agents */
    _getAgentHTTPResponseAttributeName() {

        if (this.props.language === "dotnet" || this.props.language === "python") {

            return("response.status");
        } //if
        else {

            return("httpResponseCode");
        } //else
    } //_getAgentHTTPResponseAttributeName

    /** assembles and executes the query to report the error budget for the given SLO scope */
    async _getErrorBudgetSLOData(_scope) {

        var __NRQL;
        var __beginTS;
        var __endTS;
        var __duration;
        var __date = Date.now();

        //need to ensure we have the latest current time if no time supplied - otherwise the ranges might go negative and that's not cool
        if (__endTS === undefined) {

            __endTS = __date;
        } //if
        else {
            
            __endTS = this.props.nerdlet_endTS;
        } //else

        //determine if this is a fixed or variable time scope
        if (_scope === "7_day") {

            __duration = null;
            __beginTS = +__endTS - +"604800000";
        } //if
        else if (_scope === "30_day") {
            
            __duration = null;
            __beginTS = +__endTS - +"2592000000";
        } //else if
        else {
            //assume current time 
            __beginTS = this.props.nerdlet_beginTS;
            __endTS = this.props.nerdlet_endTS;
            __duration = this.props.nerdlet_duration;
        } //else

        var __NRQL = this._getErrorBudgetNRQL(this.props.transactions, this.props.defects, __beginTS, __endTS, __duration, this.props.appName);

        const {data: __SLO} = await NrqlQuery.query({
            accountId: this.props.accountId,
            query: __NRQL
        });

        //ensure we have a valid data object else return a 0 in data structure
        if (__SLO.chart.length < 1) {

            var __ERR_SLO = {
                "chart": [{
                    "data": [{
                        "SLO": 0.00
                    }]
                }]
            };

            this.setState({slo_results: __ERR_SLO});
        } //if
        else {

            this.setState({slo_results: __SLO});
        } //else
    } //_getErrorBudgetSLOData

    /** lifecycle method initiaties the SLO calculation and saves the result to state */
    componentWillMount() {

        if (this.state.slo_results === null) {

            this._getErrorBudgetSLOData(this.props.scope);
        }//if
    } //componentWillMount

    /** lifecycle renders the html element for error budget */
    render() {

        var __colour;
        const __red = "#C70039";
        const __green = "#00922F";

        if (this.state.slo_results === null) {

            return(
                <div>
                    <Spinner className="centered" size={'small'}/>
                </div>
            );
        } //if
        else{

            //unable to format what has been returned
            if (this.state.slo_results === null) {
                return(
                    <div>
                        <p>NaN</p>
                    </div>
                );
            } //if
            else {

                if ((Math.round(this.state.slo_results.chart[0].data[0].SLO * 1000) / 1000) < this.props.target) {

                    __colour = __red;
                } //if
                else {

                    __colour = __green;
                } //else

                return(

                    <div>
                        <p style={{color: __colour}}>{Math.round(this.state.slo_results.chart[0].data[0].SLO * 1000) / 1000}</p>
                    </div>  
                );
            } //else
        }//else
    }//render    
}//ErrorBudgetSLO