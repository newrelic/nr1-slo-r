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
import { EntityStorageMutation, Button, Stack, StackItem } from 'nr1';
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
            refresh: this.props.refresh
        } //state

        //** TO BE IMPLEMENTED this.editSLO = this._editSLO.bind(this);
        this.deleteSLO = this._deleteSLO.bind(this);
    } //constructor


    /** TO BE IMPLEMENTED -
     * Will allow you to edit an SLO definition ...
     * _editSLO(_slo_document){ }//editSLO
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

    /** lifecuycle - provides the simple table component as a encapsulated <div> */
    render() {

        const { nerdlet_beginTS, nerdlet_duration, nerdlet_endTS } = this.props;

        //render the table or just the headings if we have no clo_documents defined.
        if (this.props.slo_documents.length === 0) {

            return(
                <Stack
                    className="no-slos-container empty-state-container"
                    directionType={Stack.DIRECTION_TYPE.VERTICAL}
                    horizontalType={Stack.HORIZONTAL_TYPE.CENTER}
                    verticalType={Stack.VERTICAL_TYPE.CENTER}
                >
                    <StackItem>
                        <h3 className="empty-state-header">Get started</h3>
                        <p className="empty-state-description">
                            It looks like no SLOs have been defined for this entity.
                            To get started, define an SLO using the button below and
                            follow the instructions. For more information please see
                            the <a href="https://github.com/newrelic/nr1-csg-slo-r">documentation</a>.
                        </p>
                    </StackItem>
                    <StackItem>
                        <Button
                            onClick={this.props.openConfig}
                            sizeType={Button.SIZE_TYPE.LARGE}
                            type={Button.TYPE.PRIMARY}
                            iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_ADD}
                        >Define an SLO</Button>
                    </StackItem>
                </Stack>
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
                                {/** TO BE IMPLEMENTED <td>Edit</td> */}
                                <td>Delete</td>
                            </tr>
                            { this.props.slo_documents.map((slo_document, index) =>
                                <tr key={index}>
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
                                                nerdlet_beginTS={nerdlet_beginTS}
                                                nerdlet_endTS={nerdlet_endTS}
                                                nerdlet_duration={nerdlet_duration}
                                                appName={slo_document.document.appName}
                                                accountId={slo_document.document.accountId}
                                                language={slo_document.document.language}
                                                scope={"current"}
                                                target={slo_document.document.target}
                                            />)
                                            :
                                            (<AlertDrivenSLO
                                                alerts={slo_document.document.alerts}
                                                nerdlet_beginTS={nerdlet_beginTS}
                                                nerdlet_endTS={nerdlet_endTS}
                                                nerdlet_duration={nerdlet_duration}
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


/**
 *                 <div>
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
                                {/** TO BE IMPLEMENTED - <td>Edit</td> *///}
                               /** <td>Delete</td>
                            </tr>
                        </tbody>
                    </table>
                    <Spinner className="centered" size={'small'}/>
                </div>
 */