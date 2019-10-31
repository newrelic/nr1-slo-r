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
            
            __ERROR_FILTER = __ERROR_FILTER + "FILTER(count(*), WHERE name = '" + transaction + "' AND (";
            var __defectsIndex = 0;
            var __DEFECTS_JOIN = "";
            var __DEFECTS_FILTER = "";

            _defects.map(defect => {

                if (__defectsIndex > 0) {

                    __DEFECTS_JOIN = " OR ";
                } //if
                else {

                    __DEFECTS_JOIN = "";
                } //else


                //evaluate if the defect is an httpResponseCode releated or apdexPerfZone
                if (defect === 'apdex_frustrated') {

                    __DEFECTS_FILTER = __DEFECTS_FILTER + __DEFECTS_JOIN + "apdexPerfZone = 'F'"
                } //if
                else {

                    __DEFECTS_FILTER = __DEFECTS_FILTER + __DEFECTS_JOIN + this._getAgentHTTPResponseAttributeName() + " LIKE " + "'" + defect + "'";
                } //else

                __defectsIndex++;
            });

            __ERROR_FILTER = __ERROR_FILTER + __DEFECTS_FILTER + ")) + "; //lazy way to account for the array elements
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

    /** returns the full nrql needed to calculate the error budget */
    _getErrorBudgetNRQL(_transactions, _defects, _begin, _end, _appName) {
    
        const __NRQL = `SELECT 100 - ((${this._getErrorFilter(_transactions, _defects)}) / (${this._getTotalFilter(_transactions)})) AS 'SLO' FROM Transaction WHERE appName = '${_appName}' AND ${this._getAgentHTTPResponseAttributeName()} IS NOT NULL SINCE ${Math.round(_begin)} UNTIL ${Math.round(_end)}`;
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
        var __date = Date.now();
        var __beginTS = this.props.nerdlet_beginTS;
        var __endTS = this.props.nerdlet_endTS;
        var __duration = this.props.nerdlet_duration;

        //need to ensure we have the latest current time if no time supplied - otherwise the ranges might go negative and that's not cool
        if (__endTS === undefined || __endTS === null) {
            
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
            if (__duration !== null) {

                __beginTS = +__endTS - +__duration;
            } //if
            else {

                __beginTS = this.props.nerdlet_beginTS;
                __endTS = this.props.nerdlet_endTS;
            } //else

        } //else

        var __NRQL = this._getErrorBudgetNRQL(this.props.transactions, this.props.defects, __beginTS, __endTS, this.props.appName);
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

        this._getErrorBudgetSLOData(this.props.scope);   
    } //componentWillMount

    /** lifecyce - provides for a subsequent update of the component based on entry criteria of shouldComponentUpdate */
    componentDidUpdate() {

        this._getErrorBudgetSLOData(this.props.scope);
    } //componentDidUpdate 

    /** lifecycle - determines if there should be a full component update */
    shouldComponentUpdate(nextProps) {

        if (this.state.slo_results === null) {

            return true;
        } //if

        if (nextProps.nerdlet_beginTS === this.props.nerdlet_beginTS && nextProps.nerdlet_duration === this.props.nerdlet_duration && nextProps.nerdlet_endTS === this.props.nerdlet_endTS) {

            return false;

        } //if
        else {

            return true;
        } //if
    } //shouldComponentUpdate

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