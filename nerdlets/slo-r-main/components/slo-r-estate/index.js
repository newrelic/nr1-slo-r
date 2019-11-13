/**
 * Provides the component that displays the aggregation of SLOs by defined Org.
 *
 * @file 
 * @author Gil Rice
 */
/** core */
import React from 'react';
import { Component } from 'react';
import PropTypes from 'prop-types';
/** nr1 */
import { BlockText } from 'nr1';
import { Button } from 'nr1';
import { EntityStorageMutation } from 'nr1';
import { Grid } from 'nr1';
import { GridItem } from 'nr1';
/** local */
import OrgSelector from './components/org-selector';
import OrgDisplayer from './components/org-displayer';

/** 3rd party */

/**
 * SLOREstate
 */
export default class SLOREstate extends Component { 

    static propTypes = {
        nerdlet_beginTS: PropTypes.any,
        nerdlet_endTS: PropTypes.any,
        nerdlet_duration: PropTypes.any,
        entities_data: PropTypes.object,
        entities_fetchmoar: PropTypes.object
    } //propTypes

    constructor(props) {
        super(props)

        this.state = {
            org_slos: null
        } //state
    } //constructor

    _orgAddOrAppend() {} //_orgAddOrAppend

    async assembleOrgSLOs() {

        var __orgSLOs = [];
        var __candidateSLO = null;

        if (this.props.entities_data.entities !== null) {

            this.props.entities_data.entities.map(_entity => {

                __candidateSLO = await this._lookupSLOs(_entity.guid);

                if (__candidateSLO !== null) {

                    __orgSLOs = this._orgAddOrAppend(__orgSLOs, __candidateSLO);
                } //if
            });

            //set the entity details state
            this.setState({org_slos: __org_slos});
        } //if
        else {

            //provide some error message ...
        } //else
    } //assembleOrgSLOs

    componentWillMount() {

        _this.assembleOrgSLOs();
    } //componentWillMount

    render() {

        console.debug("entities", this.props.entities_data);
        console.debug("moar", this.props.entities_fetchmoar);
        
        if (this.state.org_slos === null) {

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
                        <GridItem>
    
                        </GridItem>
                    </Grid>
                </div>
            );
        } //else
 
    } //render

} //SLOREstate