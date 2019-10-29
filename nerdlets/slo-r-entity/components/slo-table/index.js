/**
 * Provides a table and calculations for SLOs defined for a given entity.
 *
 * @file This files defines a component that renders the SLO report for an entity.
 * @author Gil Rice
 */
/** core */
import React from 'react';
import { Component } from 'react';
import PropTypes from 'prop-types';
/** nr1 */
import { Spinner } from 'nr1';
import { Button } from 'nr1';
import { EntityStorageMutation } from 'nr1';
import { PlatformStateContext } from 'nr1';
import { NerdletStateContext } from 'nr1';
/** local */
import ErrorBudgetSLO from '../error-budget-slo';
import AlertDrivenSLO from '../alert-driven-slo';
import SLOTypeIcon from '../slo-type-icon';
/** 3rd party */

/**
 * SLOTable
 */
export default class SLOTable extends Component {

    static propTypes = {
        entityGuid: PropTypes.any,
        slo_documents: PropTypes.array,
        nerdlet_beginTS: PropTypes.any,
        nerdlet_endTS: PropTypes.any,
        nerdlet_duration: PropTypes.any,
        renderCallback: PropTypes.func
    } //propTypes

    constructor(props) {
        super(props)

        this.state = {
            refresh: this.props.refresh,
            last_render: ''
        } //state

        //** TO BE IMPLEMENTED this.editSLO = this._editSLO.bind(this);
        this.deleteSLO = this._deleteSLO.bind(this);
    } //constructor


    /** TO BE IMPLEMENTED - 
     * Will allow you to edit an SLO definition ...
    _editSLO(_slo_document){

        console.log("EDIT");

        const __nerdlet = {
            id: 'sloer-config',
            urlState: {
                slo_document: _slo_document
            }
       };
       
       navigation.openStackedNerdlet(__nerdlet);

    }//editSLO
    */

   /** Deletes an SLO definition from the entity's document collection */
    async _deleteSLO(_slo_document){
  
         const __mutation = {
             actionType: EntityStorageMutation.ACTION_TYPE.DELETE_DOCUMENT, 
             collection: "nr1-csg-slo-r", 
             entityGuid: _slo_document.entityGuid, 
             documentId: _slo_document.slo_name
         } //mutation

         //TODO Provide message of the successful deletion
         const __result = await EntityStorageMutation.mutate(__mutation);

        //callback to SLOREntityNerdlet to get the table redrawn. 
        this.props.renderCallback();
    }//deleteSLO
    
    /** Provides the simple table component as a encapsulated <div> */
    render() {
        
        console.debug("nerdlet being TS " + this.props.nerdlet_beginTS);
        console.debug("nerdlet end TS " + this.props.nerdlet_endTS);
        console.debug("nerdlet duration " + this.props.nerdlet_duration);
        //render the table or just the headings if we have no clo_documents defined.
        if (this.props.slo_documents === "EMPTY") {

            return(
                <div>
                    <table>
                        <tbody>
                            <tr>
                                <td>Type</td>
                                <td>Name</td>
                                <td>Current</td>
                                <td>7 day</td>
                                <td>30 day</td>
                                <td>Target</td>
                                <td>Team</td>
                                {/** TO BE IMPLEMENTED - <td>Edit</td> */}
                                <td>Delete</td>
                            </tr>
                        </tbody>
                    </table>
                    <Spinner className="centered" size={'small'}/>
                </div>
            );
        } //if
        else { 

            //for now put together a simple table with each of the elements ... build the table data structure
            return(

                <div>
                    <table>
                        <tbody>
                            <tr>
                                <td>Type</td>
                                <td>Name</td>
                                <td>Current</td>
                                <td>7 day</td>
                                <td>30 day</td>
                                <td>Target</td>
                                <td>Team</td>
                                {/** <td>Edit</td> */}
                                <td>Delete</td>
                            </tr>
                            { this.props.slo_documents.map(slo_document =>
                                <tr>
                                    <td>
                                        <SLOTypeIcon
                                            slo_type={slo_document.document.type}
                                        />
                                    </td>
                                    <td>       
                                        <p>{slo_document.document.slo_name}</p>
                                    </td>
                                    <td>
                                        {slo_document.document.type === 'error_budget' ? 
                                            (<ErrorBudgetSLO
                                                transactions={slo_document.document.transactions}
                                                defects={slo_document.document.defects}
                                                nerdlet_beginTS={this.props.nerdlet_beginTS}
                                                nerdlet_endTS={this.props.nerdlet_endTS}
                                                nerdlet_duration={this.props.nerdlet_duration}
                                                appName={slo_document.document.appName}
                                                accountId={slo_document.document.accountId}
                                                language={slo_document.document.language}
                                                scope={"current"}
                                                target={slo_document.document.target}
                                            />) 
                                            : 
                                            (<AlertDrivenSLO
                                                alerts={slo_document.document.alerts}
                                                nerdlet_beginTS={this.props.nerdlet_beginTS}
                                                nerdlet_endTS={this.props.nerdlet_endTS}
                                                nerdlet_duration={this.props.nerdlet_duration}
                                                accountId={slo_document.document.accountId}
                                                scope={"current"}
                                                target={slo_document.document.target}
                                            />)
                                        }
                                    </td>
                                    <td>
                                        {slo_document.document.type === 'error_budget' ? 
                                            (<ErrorBudgetSLO
                                                transactions={slo_document.document.transactions}
                                                defects={slo_document.document.defects}
                                                nerdlet_beginTS={this.props.nerdlet_beginTS}
                                                nerdlet_endTS={this.props.nerdlet_endTS}
                                                nerdlet_duration={this.props.nerdlet_duration}
                                                appName={slo_document.document.appName}
                                                accountId={slo_document.document.accountId}
                                                language={slo_document.document.language}
                                                scope={"7_day"}
                                                target={slo_document.document.target}
                                            />) 
                                            : 
                                            (<AlertDrivenSLO
                                                alerts={slo_document.document.alerts}
                                                nerdlet_beginTS={this.props.nerdlet_beginTS}
                                                nerdlet_endTS={this.props.nerdlet_endTS}
                                                nerdlet_duration={this.props.nerdlet_duration}
                                                accountId={slo_document.document.accountId}
                                                scope={"7_day"}
                                                target={slo_document.document.target}
                                            />)
                                        }
                                    </td>
                                    <td>
                                        {slo_document.document.type === 'error_budget' ? 
                                            (<ErrorBudgetSLO
                                                transactions={slo_document.document.transactions}
                                                defects={slo_document.document.defects}
                                                nerdlet_beginTS={this.props.nerdlet_beginTS}
                                                nerdlet_endTS={this.props.nerdlet_endTS}
                                                nerdlet_duration={this.props.nerdlet_duration}
                                                appName={slo_document.document.appName}
                                                accountId={slo_document.document.accountId}
                                                language={slo_document.document.language}
                                                scope={"30_day"}
                                                target={slo_document.document.target}
                                            />) 
                                            : 
                                            (<AlertDrivenSLO
                                                alerts={slo_document.document.alerts}
                                                nerdlet_beginTS={this.props.nerdlet_beginTS}
                                                nerdlet_endTS={this.props.nerdlet_endTS}
                                                nerdlet_duration={this.props.nerdlet_duration}
                                                accountId={slo_document.document.accountId}
                                                scope={"30_day"}
                                                target={slo_document.document.target}
                                            />)
                                        }
                                    </td>
                                    <td>{slo_document.document.target}</td>
                                    <td>{slo_document.document.team}</td>
                                    {/** TODO implement edit
                                    <td>       
                                        <Button
                                            onClick={() => this.editSLO(slo_document.document)}
                                            type={Button.TYPE.NORMAL}
                                            iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_EDIT}>
                                        </Button>
                                    </td> */}
                                    <td>       
                                        <Button
                                            onClick={() => this.deleteSLO(slo_document.document)}
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
                
            );
        } //else

    } //render

} //SLOTable


