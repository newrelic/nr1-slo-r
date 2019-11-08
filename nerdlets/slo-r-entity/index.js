/**
 * Provides full New Relic One SLO/R Entity functionality.
 *
 * @file This files defines the NR1 App SLO/R Entity functionaly and loads dedicated elements to define and display SLOs.
 * @author Gil Rice
 */
/** core */
import React from 'react';
import { Component } from 'react';
import PropTypes from 'prop-types';
/** nr1 */
import { Button } from 'nr1';
import { navigation } from 'nr1';
import { Grid } from 'nr1';
import { GridItem } from 'nr1';
import { EntityStorageQuery } from 'nr1'
import { Spinner } from 'nr1';
import { PlatformStateContext } from 'nr1'
import { NerdletStateContext } from 'nr1';
/** local */
import SLOTable from './components/slo-table';
/** 3rd party */


/**
 * SLOREntityNerdlet
 */
export default class SLOREntityNedlet extends Component {

    static contextType = NerdletStateContext;

    static propTypes = {
        nerdletUrlState: PropTypes.object,
        launcherUrlState: PropTypes.object
    };

    constructor(props) {
        super(props);
        this.state = {
            entityGuid: this.props.nerdletUrlState.entityGuid,
            slo_documents: null
        } //state

        this.openConfig = this._openConfig.bind(this); /** opens the SLO configuration */
        this.rerenderSLOs = this._rerenderSLOs.bind(this); /** forces nerdlet to redraw the SLO table */
    } //constructor

    /** refresh the SLODocuments through a callback */
    _rerenderSLOs() {

        this._getSLODocuments();
    } //_rerenderSLOs

    /** opens the slo-r configuration nerdlet */
    _openConfig(_evt) {

        const __confignerdlet = {
            id: 'slo-r-config',
            urlState: {
                entityGuid: this.state.entityGuid,
                renderCallback: this.rerenderSLOs
            }
        };

        navigation.openStackedNerdlet(__confignerdlet);
    } //openConfig

    /** gets all the SLO documents defined for this entity */
    async _getSLODocuments() {

        const __entityGuid = this.state.entityGuid;

        const _query = {
            actionType: EntityStorageQuery.FETCH_POLICY_TYPE.NO_CACHE,
            entityGuid: __entityGuid,
            collection: "nr1-csg-slo-r",
        } //_query

        const __result = await EntityStorageQuery.query(_query);

        //no documents defined - populate the documents object with some innocuous text to have an empty table render
        if (__result.data === null) {

            this.setState({slo_documents: "EMPTY"});
        }//if
        else {
            this.setState({slo_documents: __result.data});
        } //else

    } //_getSLODocuments

    /** lifecycle prompts the fetching of the SLO documents for this entity */
    componentDidMount() {

        this._getSLODocuments();
    } //componentDidMount

    /** lifecycle provides the rendering context for this nerdlet */
    render() {
        //ensure we have state for our slo documents to render the reporting table and configuration options

        if (this.state.slo_documents === null) {


            return(
                <div>
                    <Spinner className="centered" size={'small'}/>
                </div>
            );
        } //if
        else {
            let sloHasBeenDefined = this.state.slo_documents.length > 0;

            return(
                <div>
                    <Grid className={ !sloHasBeenDefined ? 'hidden' : ''}>
                        <GridItem columnSpan={3}>
                            <div>
                                <Button
                                    onClick={this.openConfig}
                                    type={Button.TYPE.NORMAL}
                                    iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__FILE__A_ADD}>
                                    Define an SLO
                                </Button>
                            </div>
                            <br/>
                        </GridItem>
                    </Grid>
                    <Grid className={!sloHasBeenDefined ? 'no-slos-exist' : ''}>
                        <GridItem columnSpan={sloHasBeenDefined ? 4 : 12}>
                            <PlatformStateContext.Consumer>
                                {launcherUrlState => (
                                <NerdletStateContext.Consumer>
                                    {nerdletUrlState => (
                                    <SLOTable
                                        entityGuid={this.state.entity}
                                        slo_documents={this.state.slo_documents}
                                        nerdlet_beginTS={launcherUrlState.timeRange.begin_time}
                                        nerdlet_endTS={launcherUrlState.timeRange.end_time}
                                        nerdlet_duration={launcherUrlState.timeRange.duration}
                                        renderCallback={this.rerenderSLOs}
                                        openConfig={this.openConfig}
                                    />
                                    )}
                                </NerdletStateContext.Consumer>
                                )}
                            </PlatformStateContext.Consumer>

                        </GridItem>
                    </Grid>
                </div>
            );
        } //else
    } //render
} //SLOREntityNedlet