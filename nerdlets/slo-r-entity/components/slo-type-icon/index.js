/**
 * Provides an html output for the correct icon given the SLO type provided.
 *
 * @file This files defines a component that renders the icon used to identify a type of SLO.
 * @author Gil Rice
 */
/** core */
import React from 'react';
import { Component } from 'react';
import PropTypes from 'prop-types';
/** nr1 */
import { Icon } from 'nr1'
import { Spinner } from 'nr1';
/** local */
/** 3rd party */

/**
 * SLOTypeIcon
 */
export default class SLOTypeIcon extends Component {  

    static propTypes = {
        slo_type: PropTypes.any
    } //propTypes


    constructor(props) {
        super(props)

        this.state = {
            slo_type: null
        } //state

    } //constructor

    /** lifecycle evaluates the type property and updates the render state */
    componentWillMount() {

        //this should be defined in the component props
        if (this.state.slo_type === null) {

            this.setState({slo_type: this.props.slo_type});
        }//if
        else {

            this.setState({slo_type: "UNKNOWN_TYPE"});
        } //else
    } //componentWillMount

    /** lifecycle given the type passed to the component properties it renders a generic icon */
    render() {

        //structure the component display - make available for dynamism
        if (this.state.slo_type === null) {

            return(
                <div>
                    <Spinner className="centered" size={'small'}/>
                </div>
            );
        } //if
        else{
            if (this.state.slo_type === "error_budget") {
                
                return(

                    <div>
                        <Icon type={Icon.TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__APPLICATION__S_WARNING} />
                    </div>
    
                );
            } //if
            else if (this.state.slo_type === "availability") {

                return(

                    <div>
                        <Icon type={Icon.TYPE.DATAVIZ__DATAVIZ__LINE_CHART} />
                    </div>
    
                );
            } //else if
            else if (this.state.slo_type === "capacity") {

                return(

                    <div>
                        <Icon type={Icon.TYPE.Icon.TYPE.INTERFACE__STATE__HEALTHY} />
                    </div>
    
                );
            } //else if
            else if (this.state.slo_type === "latency") {

                return(

                    <div>
                        <Icon type={Icon.TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__APPLICATION} />
                    </div>
    
                );
            } //else if
            else {

                return(

                    <div>
                        <Icon type={Icon.TYPE.INTERFACE__INFO__HELP} />
                    </div>
    
                );
            } //else -> default icon
        }//else -> state load
    }//render
} //SLOTypeIcon