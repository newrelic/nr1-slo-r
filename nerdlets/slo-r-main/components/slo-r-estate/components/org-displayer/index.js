/**
 * Provides the component that a rolled up SLO attainment for an Organization
 *
 * @file
 * @author Gil Rice
 */
/** core */
import React from 'react';
import PropTypes from 'prop-types';
/** nr1 */
import { 
    Dropdown,
    DropdownItem 
} from 'nr1'
/** local */
/** 3rd party */

/**
 * OrgDisplayer
 */
export default class OrgDisplayer extends React.Component { 

    static propTypes = {
        org: PropTypes.object
    }; // propTypes

    constructor(props) {
        super(props);

        this.state = {
        }; // state

    } // constructor


    render() {

        return(
        <p>{this.props.org.orgName}</p>
        );
    } //render

}//OrgDisplayer