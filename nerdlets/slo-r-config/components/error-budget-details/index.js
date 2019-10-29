/**
 * Provides a configuration UI to create new SLO definitions and save them to an entity's nerdstore.
 *
 * @file This files defines the NR1 App SLO/R Entity configuration functionality.
 * @author Gil Rice
 */
/** core */
import React from 'react';
import { Component } from 'react';
import PropTypes from 'prop-types';
/** nr1 */
import { Spinner } from 'nr1';
import { NerdGraphQuery } from 'nr1';
import { Button } from 'nr1';
import { Grid } from 'nr1';
import { GridItem } from 'nr1';
import { PlatformStateContext } from 'nr1'
import { NerdletStateContext } from 'nr1';
/** local */
/** 3rd party */


/**
 * ErrorBudgetDetails
 */
export default class ErrorBudgetDetails extends Component {


    render() {

        if (this.state.slo_type === null) {
            return(
                <div>
                    <Spinner/>
                </div>
            );
        } //if
        else {
            if (this.state.slo_type === "error_budget") {

                //TODO - CONSIDER MAKING THIS A COMPONENT? OR 2 COMPONENTS AND USING REACT CONDITIONAL RENDERING LOGIC ... THIS CAN BE CLEANED UP A LOT
                return(
                    <div>
                        <label>Defects</label>
                        <div>
                            <input type="checkbox" category="defect" name="5%" id="500" onChange={_evt => this.props.errorBudgetOnClickHandler('defect', '5%', _evt.nativeEvent.target.checked)}/>
                            <label>5xx Errors</label>
                        </div> 
                        <div>
                            <input type="checkbox" category="defect" name="400" id="400" onChange={_evt => this.props.errorBudgetOnClickHandler('defect', '400', _evt.nativeEvent.target.checked)}/>
                            <label>400 Bad Request</label>
                        </div> 
                        <div>
                            <input type="checkbox" category="defect" name="401" value="off" id="401" onChange={_evt => this.props.errorBudgetOnClickHandler('defect', '401', _evt.nativeEvent.target.checked)}/>
                            <label>401 Unauthorized</label>
                        </div>
                        <div>
                            <input type="checkbox" category="defect" name="403" value="off" id="403" onChange={_evt => this.props.errorBudgetOnClickHandler('defect', '403', _evt.nativeEvent.target.checked)}/>
                            <label>403 Forbidden</label>
                        </div> 
                        <div>
                            <input type="checkbox" category="defect" name="404" value="off" id="404" onChange={_evt => this.props.errorBudgetOnClickHandler('defect', '404', _evt.nativeEvent.target.checked)}/>
                            <label>404 Not Found</label>
                        </div>
                        <div>
                            <input type="checkbox" category="defect" name="409" value="off" id="409" onChange={_evt => this.props.errorBudgetOnClickHandler('defect', '409', _evt.nativeEvent.target.checked)}/>
                            <label>409 Conflict</label>
                        </div>
                        <div>
                            <input type="checkbox" category="defect" name="Apdex Frustrated" value="off" id="999" onChange={_evt => this.props.errorBudgetOnClickHandler('defect', 'apdex_frustrated', _evt.nativeEvent.target.checked)}/>
                            <label>Apdex Frustrated</label>
                        </div> 
                        <br/>
                        <label>Transactions</label>
                        {/** using nrqlquery to get the transaction associated with this entity */}
                        <NrqlQuery accountId={this.props.accountId} query={`SELECT count(*) FROM Transaction WHERE appName='${this.props.appName}' SINCE 5 DAYS AGO FACET name LIMIT 100`}>
                            {({loading, data, error}) => {
                                if (loading) {
                                    return(<Spinner />)
                                } //if
                                if (error) {
                                    return(<p>{JSON.stringify(error)}</p>)
                                } //if
                                //console.debug("nrql", data);
                                return (
                                    <ul>
                                        {data.map((result, i) => {
                                            if (result.metadata.name !== "Other") {
                                                return (
                                                    <div>
                                                        <input type="checkbox" category="transaction" name={result.metadata.name} value="off" id={i} onChange={_evt => this.props.errorBudgetOnClickHandler('transaction', result.metadata.name, _evt.nativeEvent.target.checked)}/>
                                                        <label for={i}>{result.metadata.name} {result.count}</label>
                                                    </div> 
                                                    )
                                                } 
                                            })}
                                    </ul>
                                );
                                }}
                        </NrqlQuery>
                    </div>
                );
            } //if
        } //else

    }
} //ErrorBudgetDetails