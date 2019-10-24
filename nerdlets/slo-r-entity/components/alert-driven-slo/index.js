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
 * AlertDrivenSLO
 */
export default class AlertDrivenSLO extends Component { 

    static propTypes = {
        entityGuid: PropTypes.any,
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
            slo_results: null
        } //state
    } //constructor

        /** lifecycle method initiaties the SLO calculation and saves the result to state */
        componentWillMount() {

            if (this.state.slo_results === null) {
    
                //this._getAlertDrivenSLOData(this.props.scope);
            }//if
        } //componentWillMount
    
        /** lifecycle renders the html element for slo based on one or more alerts firing */
        render() {
    
            var __colour;
            const __red = "#C70039";
            const __green = "#00922F";
    
            return(
                <div>
                    <p>TBD</p>
                </div>
            );
            // if (this.state.slo_results === null) {
    
            //     return(
            //         <div>
            //             <Spinner className="centered" size={'small'}/>
            //         </div>
            //     );
            // } //if
            // else{
    
            //     //unable to format what has been returned
            //     if (this.state.slo_results === null) {
            //         return(
            //             <div>
            //                 <p>NaN</p>
            //             </div>
            //         );
            //     } //if
            //     else {
    
            //         if ((Math.round(this.state.slo_results.chart[0].data[0].SLO * 1000) / 1000) < this.props.target) {
    
            //             __colour = __red;
            //         } //if
            //         else {
    
            //             __colour = __green;
            //         } //else
    
            //         return(
    
            //             <div>
            //                 <p style={{color: __colour}}>{Math.round(this.state.slo_results.chart[0].data[0].SLO * 1000) / 1000}</p>
            //             </div>  
            //         );
            //     } //else
            // }//else
        }//render    
} //AlertDrivenSLO