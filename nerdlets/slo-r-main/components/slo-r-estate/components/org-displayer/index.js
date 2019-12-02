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
    BlockText, 
    EntityStorageQuery, 
    Grid, 
    GridItem, 
    Spinner 
} from 'nr1';
/** local */
import SLO_TYPES from '../../../../../shared/constants'; //TODO use with type statements
import ComponentErrorBudgetSLO from './component_eb_slo';
/** 3rd party */
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, {
    selectFilter,
    textFilter
  } from 'react-bootstrap-table2-filter';

/**
 * OrgDisplayer
 */
export default class OrgDisplayer extends React.Component { 

    static propTypes = {
        org: PropTypes.object,
        timeRange: PropTypes.object
    }; // propTypes

    constructor(props) {
        super(props);

        this.state = {
            org_slo_data: null
        }; // state

    } // constructor

    // async _getScopedOrgSLOData(_scope) {


    //     return(__org_slo_data);
    // } //_getScopedOrgSLOData

    async _assembleOrganizationData() {

        //var __org_data = [];
        var __types = ["error_budget"]; //??
        var __data_promises = [];
        //var __org_slo_data = [];
        
        //get error budget SLOs
        var __eb_slos = this.props.org.slos.filter(function(value, index, arr){

            return value.type === 'error_budget';
        });

        console.debug("what is being returned here", __eb_slos);

        __eb_slos.map(_eb_slo => {

            var slo_document = _eb_slo;
            var timeRange = this.props.timeRange;
            let sloPromise = ComponentErrorBudgetSLO.query({
                slo_document,
                timeRange
              });

              __data_promises.push(sloPromise);

        });

        const __org_slo_data = await Promise.all(__data_promises);

        //var __org_slo_data = this._getScopedOrgSLOData("7_day");
        console.debug("dis is der org data ... ", __org_slo_data);

        this.setState({ org_slo_data: __org_slo_data });
    } //_assembleOrganizationData


    componentWillMount() {

        this._assembleOrganizationData();
    } //componentWillMount

    render() {

        var __total_current_numerator = 0;
        var __total_current_denominator = 0;
        var __total_7_day_numerator = 0;
        var __total_7_day_denominator = 0;
        var __total_30_day_numerator = 0;
        var __total_30_day_denominator = 0;

        if (this.state.org_slo_data === null) {

            return(
                <div>
                    <Spinner/>
                </div>
            );
        } //if
        else {

            return(

                <div>
                    <p>ORGANIZATION: {this.props.org.orgName}</p>
                    <br/>   
                    <p>SLO TYPE: Error Budgie</p>
                    <table>
                        <thead>
                            <tr>
                                <th>SLO</th>
                                <th>current</th>
                                <th>7 day</th>
                                <th>30 day</th>
                                <th>target</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.org_slo_data.map(_slo_data => {

                                __total_current_numerator = __total_current_numerator + _slo_data.result_current.numerator;
                                __total_current_denominator = __total_current_denominator + _slo_data.result_current.denominator;

                                __total_7_day_numerator = __total_7_day_numerator + _slo_data.result_7_day.numerator;
                                __total_7_day_denominator = __total_7_day_denominator + _slo_data.result_7_day.denominator;

                                __total_30_day_numerator = __total_30_day_numerator + _slo_data.result_30_day.numerator;
                                __total_30_day_denominator = __total_30_day_denominator + _slo_data.result_30_day.denominator;

                                return(
                                    <tr>
                                        <td>
                                            {_slo_data.slo_document.slo_name}
                                        </td>
                                        <td>
                                            {_slo_data.result_current.result}
                                        </td>
                                        <td>
                                            {_slo_data.result_7_day.result}
                                        </td>
                                        <td>
                                            {_slo_data.result_30_day.result}
                                        </td>
                                        <td>
                                            {_slo_data.slo_document.target}
                                        </td>
                                    </tr>
                                )
                            })}
                         
                         <tr>
                                <td>Total</td>
                                <td>{ Math.round((100 - (__total_current_numerator / __total_current_denominator) * 100) * 1000) / 1000 }</td>
                                <td>{ Math.round((100 - (__total_7_day_numerator / __total_7_day_denominator) * 100) * 1000) / 1000 }</td>
                                <td>{ Math.round((100 - (__total_30_day_numerator / __total_30_day_denominator) * 100) * 1000) / 1000 }</td>
                                <td>{"--"}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                
                );
        } //else


    } //render

}//OrgDisplayer

/**
 *                                 
 * __total_current_numerator =+ __total_current_numerator + _slo_data.numerator;
                                __total_current_denominator =+ __total_current_denominator + _slo_data.denominator;

                                   <tr>
                                <td>Total</td>
                                <td>{Math.round()}</td>
                            </tr>


__SLO_RESULT._current.result = Math.round((100 - (__SLO_RESULT._current.numerator / __SLO_RESULT._current.denominator) * 100) * 1000) / 1000;

 */
 