/**
 * Provides a configuration UI to create new SLO definitions for an error budget type.
 *
 * @file This files defines the NR1 App SLO/R error budget SLO configuration.
 * @author Gil Rice
 */
/** core */
import React from 'react';
import { Component } from 'react';
import PropTypes from 'prop-types';
/** nr1 */
import { BlockText } from 'nr1';
import { Spinner } from 'nr1';
import { NerdGraphQuery } from 'nr1';
import { Grid } from 'nr1';
import { GridItem } from 'nr1';
/** local */
/** 3rd party */


/**
 * ErrorBudgetDetails
 */
export default class ErrorBudgetDetails extends Component {

    static propTypes = {
        accountId: PropTypes.any,
        errorBudgetOnClickHandler: PropTypes.func,
        appName: PropTypes.any
    } //propTypes

    constructor(props) {
        super(props)

        this.state = {
            transactions: null
        } //state
    } //constructor

    /** loads the transactions available to calculate this SLO */
    async _loadEntityTransactions() {

        //we only want to run this the one time to gather transactions
        if (this.state.transactions === null) { 

            const __query = `{
                actor {
                  account(id: ${this.props.accountId}) {
                    nrql(query: "SELECT count(*) FROM Transaction WHERE appName='${this.props.appName}' SINCE 1 MONTH AGO FACET name LIMIT 100") {
                      results
                    }
                  }
                }
              }`;
    
            const __result = await NerdGraphQuery.query({query: __query});
            this.setState({transactions: __result.data.actor.account.nrql.results});
        } //if
    } //_loadEntityTransactions

    /** lifecycle - prtovides the context to load the transactions for this SLO calculation */
    componentDidMount() {

        this._loadEntityTransactions();
    } //componentDidMount

    /** lifecycle - provides the configuration UI for the defect and transaction selection for an error budget SLO */
    render() {

        if (this.state.transactions === null) {
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
                        <GridItem columnSpan={12}>
                            <BlockText spacingType={[BlockText.SPACING_TYPE.MEDIUM]}>
                            Defects: Select one or more defects. Defects that occur on the selected transactions will be counted against error budget attainment.
                            </BlockText>
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
                        <BlockText spacingType={[BlockText.SPACING_TYPE.MEDIUM]}>
                        Transactions: Select one or more transactions evaluate for defects for this error budget.
                        </BlockText>
                        <div>
                            {this.state.transactions.map((_transaction, _index) => {
                                return(
                                    <ul>
                                    {_transaction !== "Other" && 
                                        <div>
                                            <input type="checkbox" category="transaction" name={_transaction.name} value="off" id={_index} onChange={_evt => this.props.errorBudgetOnClickHandler('transaction', _transaction.name, _evt.nativeEvent.target.checked)}/>
                                            <label>{_transaction.name}</label>
                                        </div>          
                                    }
                                    </ul>
                                );
                            })}
                        </div>

                        </GridItem>
                    </Grid>

                </div>
            );

        } //else
    } //render
} //ErrorBudgetDetails