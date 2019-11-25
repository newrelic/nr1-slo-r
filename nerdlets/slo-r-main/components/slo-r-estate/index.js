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
import { EntityStorageQuery } from 'nr1';
import { Grid } from 'nr1';
import { GridItem } from 'nr1';
import { Spinner } from 'nr1';
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

    _orgAddOrAppend(_orgSLOs, _candidateSLO) {

        console.debug("the passed _orgSLOs", _orgSLOs);
        console.debug("the passed candidate SLOs", _candidateSLO);

        var __SLOsForCandidate = _orgSLOs.filter(function(value, index, arr){

            return value.orgName === _candidateSLO.document.team;
        });

        console.debug("candidate slos", __SLOsForCandidate);
        if (__SLOsForCandidate.length === 1) {

            __SLOsForCandidate[0].slos.push(_candidateSLO.document);

            console.debug("adding a new slo/org", _orgSLOs);
        } //if
        else if (__SLOsForCandidate.length === 0) {

            _orgSLOs.push(
                {
                    orgName: _candidateSLO.document.team,
                    slos: [_candidateSLO.document]      
                }
            );

            console.debug("adding a new slo/org", _orgSLOs);
        } //else
        else {

            console.log("candidate length is weird: " + __SLOsForCandidate.length );
        } //else

        return(_orgSLOs);
    } //_orgAddOrAppend
    
    
    async _lookupSLOs(_entity_guid) {
        var __slo_document = null;
        
        if (_entity_guid !== null || _entity_guid !== undefined) {
            const _query = {
                actionType: EntityStorageQuery.FETCH_POLICY_TYPE.NO_CACHE,
                entityGuid: _entity_guid,
                collection: "nr1-csg-slo-r"
              }; //_query
          
            const __result = await EntityStorageQuery.query(_query);

            if (__result !== null) {

                __slo_document = __result.data;
            } //if
        } //if

        console.debug("candidate slo", __slo_document);
        return(__slo_document);
    } //_lookupSLOs

    async assembleOrgSLOs() {

        var __orgSLOs = [];
        var __candidateSLOs = null;

        if (this.props.entities_data.entities !== null) {

            for (var i = 0; i < this.props.entities_data.entities.length; i++) {

                __candidateSLOs = await this._lookupSLOs(this.props.entities_data.entities[i].guid);

                if (__candidateSLOs !== null) {

                    console.debug("candidate SLOs", __candidateSLOs);
                    __candidateSLOs.map(_candidateSLO => {

                        __orgSLOs = this._orgAddOrAppend(__orgSLOs, _candidateSLO);
                    });
                    
                } //if
            };

            //set the entity details state
            this.setState({org_slos: __org_slos});
        } //if
        else {

            //provide some error message ...
        } //else
    } //assembleOrgSLOs

    componentWillMount() {

        this.assembleOrgSLOs();
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

            if (this.state.org_slos === "NONE") {
                return(
                    <div>
                        <Grid>
                            <GridItem>
                                <BlockText>
                                    Unable to find any SLOs defined. Use the Entity Explorer to find a Service and define an SLO.
                                </BlockText>
                            </GridItem>
                        </Grid>
                    </div>
                );
            } //if
            else {
                return(
                    <div>
                        <Grid>
                            <GridItem>
                                <BlockText>
                                    Cool Org UI ... .
                                </BlockText>
                            </GridItem>
                        </Grid>
                    </div>
                );
            } //else

        } //else
 
    } //render

} //SLOREstate