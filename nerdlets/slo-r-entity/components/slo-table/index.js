/** eslint can't decipher that we're using the props via lodash's pick(this.props, someProps) method */
/* eslint-disable react/no-unused-prop-types */

/**
 * Provides a table and calculations for SLOs defined for a given entity.
 *
 * @file This files defines a component that renders the SLO report for an entity.
 * @author Gil Rice
 */
/** core */
import React from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';

/** nr1 */
import {
  // EntityStorageMutation,
  Button,
  Stack,
  StackItem,
  TableChart
} from 'nr1';

/** local */
import ErrorBudgetSLO from '../../../shared/queries/error-budget-slo';
import SLOGrid from '../slo-grid';
import AlertDrivenSLO from '../../../shared/queries/alert-driven-slo';
/** 3rd party */

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

/**
 * SLOTable
 */
export default class SLOTable extends React.Component {
  static propTypes = {
    slo_documents: PropTypes.array,
    timeRange: PropTypes.object,
    tableView: PropTypes.bool,
    openDefineSLOModal: PropTypes.func,
    addSloDocumentCallback: PropTypes.func,
    deleteCallback: PropTypes.func
  }; // propTypes

  constructor(props) {
    super(props);

    this.state = {
      tableData: []
    }; // state

    //* * TO BE IMPLEMENTED this.editSLO = this._editSLO.bind(this);
    this.deleteSLO = this._deleteSLO.bind(this);
  } // constructor

  componentDidMount() {
    const { timeRange, slo_documents } = this.props;
    this.loadData(timeRange, slo_documents);
  }

  componentDidUpdate(prevProps) {
    const updatedDocs = this.props.slo_documents;

    // Time change - reload all
    const prevTimeRange = prevProps.timeRange;
    const currentTimeRange = this.props.timeRange;

    if (!isEqual(prevTimeRange, currentTimeRange)) {
      this.loadData(currentTimeRange, updatedDocs);
      return;
    }

    // Reload all if anything is different
    // TO DO - a more intelligent diff between prev and updated
    const prevDocs = prevProps.slo_documents;
    if (!isEqual(updatedDocs, prevDocs)) {
      this.loadData(currentTimeRange, updatedDocs);
    }
  }

  /*
   * Generate and execute all of the queries we need to make against NRQL and Nerdgraph for each row of data and each column
   */
  async loadData(timeRange, slo_documents) {
    if (slo_documents) {
      const queryPromises = slo_documents.reduce((result, slo_document) => {
        const scopes = ['current', '7_day', '30_day'];

        scopes.forEach(scope => {
          let sloPromise;

          console.debug(slo_document);
          if (slo_document.type === 'error_budget') {
            sloPromise = ErrorBudgetSLO.query({
              scope,
              slo_document,
              timeRange
            });
          } else {
            sloPromise = AlertDrivenSLO.query({
              scope,
              slo_document,
              timeRange
            });
          }

          result.push(sloPromise);
        });

        return result;
      }, []);

      const results = await Promise.all(queryPromises);
      const newTableData = this.transformQueryResultsForTable(results);

      this.setState({ tableData: newTableData });
    }
  }

  /*
   * Create a row object from a query result
   */
  transformQueryResultsForTable(results) {
    const formatted = results.reduce((result, item) => {
      const { slo_document, scope, data } = item;
      const id = slo_document.id;

      if (!result[id]) {
        result[id] = {
          name: id,
          type: '',
          current: '',
          sevenDay: '',
          thirtyDay: '',
          target: slo_document.document.target,
          org: slo_document.document.organization,
          delete: (
            <Button
              iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__TRASH}
              sizeType={Button.SIZE_TYPE.SMALL}
              onClick={() => this.deleteSLO(slo_document.document)}
            />
          )
        };
      }

      result[id][scope] = data;
      return result;
    }, {});

    return Object.values(formatted);
  }

  /** TO BE IMPLEMENTED -
   * Will allow you to edit an SLO definition ...
   * _editSLO(_slo_document){ }//editSLO
   */

  /** Deletes an SLO definition from the entity's document collection */
  async _deleteSLO(_slo_document) {
    this.props.deleteCallback(_slo_document);
  } // deleteSLO

  /** lifecycle - provides the simple table component as a encapsulated <div> */
  render() {
    const { tableData } = this.state;

    const data = [
      {
        metadata: {
          id: 'slo-table',
          name: 'SLO Table',
          color: '#008c99',
          viz: 'main',
          columns: [
            'name',
            'type',
            'current',
            'sevenDay',
            'thirtyDay',
            'target',
            'org',
            'delete'
          ]
        },
        data: tableData
      }
    ];

    // render the table or just the headings if we have no clo_documents defined.
    if (this.props.slo_documents.length === 0) {
      return (
        <Stack
          className="no-slos-container empty-state-container"
          directionType={Stack.DIRECTION_TYPE.VERTICAL}
          horizontalType={Stack.HORIZONTAL_TYPE.CENTER}
          verticalType={Stack.VERTICAL_TYPE.CENTER}
        >
          <StackItem>
            <h3 className="empty-state-header">Get started</h3>
            <p className="empty-state-description">
              It looks like no SLOs have been defined for this entity. To get
              started, define an SLO using the button below and follow the
              instructions. For more information please see the{' '}
              <a href="https://github.com/newrelic/nr1-csg-slo-r">
                documentation
              </a>
              .
            </p>
          </StackItem>
          <StackItem>
            <Button
              onClick={this.props.openDefineSLOModal}
              sizeType={Button.SIZE_TYPE.LARGE}
              type={Button.TYPE.PRIMARY}
              iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_ADD}
            >
              Define an SLO
            </Button>
          </StackItem>
        </Stack>
      );
    } // if
    else {
      // calculate the height of the table including the header row.
      // (#ofRows + headerRow) * heightOfSingleRow + 'px'
      const tableHeight = `${(this.props.slo_documents.length + 1) * 40}px`;

      // for now put together a simple table with each of the elements ... build the table data structure

      // Todo: figure out a way to enable sorting on columns that include a color
      // The blocker here is that color is included by wrapping the cell value in an html element.
      // When the cell is provided an html element rather than a string or number it can't sort
      return (
        <>
          {this.props.tableView ? (
            <TableChart
              className="slo-table"
              data={data}
              fullWidth
              fullHeight
              style={{ height: tableHeight }}
            />
          ) : (
            <SLOGrid data={data[0].data} />
            // <div className="slo-grid">I'm the SLO Grid</div>
          )}
        </>
      );
    } // else
  } // render
} // SLOTable

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
                                <td>Organization</td>
                                {/** TO BE IMPLEMENTED - <td>Edit</td> */ // }
/** <td>Delete</td>
</tr>
</tbody>
</table>
<Spinner className="centered" size={'small'}/>
</div>
*/
