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

/** nr1 */
import { Button, HeadingText, Stack, StackItem, TableChart } from 'nr1';

/** 3rd party */
import { isEqual } from 'lodash';
import BootstrapTable from 'react-bootstrap-table-next';

import filterFactory, {
  selectFilter,
  textFilter
} from 'react-bootstrap-table2-filter';

/** local */
import SLOGrid from '../slo-grid';
import ErrorBudgetSLO from '../../../shared/queries/error-budget-slo';
import AlertDrivenSLO from '../../../shared/queries/alert-driven-slo';
import { SLO_TYPES } from '../../../shared/constants';

/**
 * SLOTable
 */
export default class SLOTable extends React.Component {
  static propTypes = {
    slo_documents: PropTypes.array,
    timeRange: PropTypes.object,
    tableView: PropTypes.bool,
    toggleCreateModal: PropTypes.func,
    toggleUpdateModal: PropTypes.func,
    addSloDocumentCallback: PropTypes.func,
    deleteCallback: PropTypes.func
    // editCallback: PropTypes.func
  }; // propTypes

  constructor(props) {
    super(props);

    this.state = {
      tableData: []
    }; // state
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
          update: (
            <Button
              iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_EDIT}
              sizeType={Button.SIZE_TYPE.SMALL}
              onClick={() => {
                this.props.toggleUpdateModal({
                  document: slo_document.document
                });
              }}
            />
          ),
          delete: (
            <Button
              iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__TRASH}
              sizeType={Button.SIZE_TYPE.SMALL}
              onClick={() =>
                this.props.deleteCallback({ document: slo_document.document })
              }
            />
          )
          // TO DO - Add edit click callback as well
        };
      }

      result[id][scope] = data;
      return result;
    }, {});

    return Object.values(formatted);
  }

  async updateSloDocument(e, row, rowIndex) {
    console.debug(e);
    console.debug(row);
    console.debug(rowIndex);
  }

  renderGettingStarted() {
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
            onClick={() => this.props.toggleCreateModal()}
            sizeType={Button.SIZE_TYPE.LARGE}
            type={Button.TYPE.PRIMARY}
            iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_ADD}
          >
            Define an SLO
          </Button>
        </StackItem>
      </Stack>
    );
  }

  renderGridView() {
    const data = this.getTableData();
    return <SLOGrid data={data[0].data} />;
  }

  renderTableView() {
    const { slo_documents } = this.props;
    const data = this.getTableData();
    // calculate the height of the table including the header row.
    // (#ofRows + headerRow) * heightOfSingleRow + 'px'
    const tableHeight = `${(slo_documents.length + 1) * 40}px`;

    return (
      <TableChart
        className="slo-table"
        data={data}
        fullWidth
        fullHeight
        style={{ height: tableHeight }}
      />
    );
  }

  renderBootStrapTableView() {
    const { tableData } = this.state;
    const typeOptions = SLO_TYPES.reduce((previousValue, currentValue) => {
      previousValue[currentValue.field] = currentValue.name;
      return previousValue;
    }, {});
    const columns = [
      {
        dataField: 'name',
        text: 'Name',
        filter: textFilter()
      },
      {
        dataField: 'type',
        text: 'Type',
        formatter: cell => typeOptions[cell],
        filter: selectFilter({
          options: typeOptions
        })
      },
      {
        dataField: 'current',
        text: 'Current'
      },
      {
        dataField: 'sevenDay',
        text: 'Seven Day'
      },
      {
        dataField: 'thirtyDay',
        text: 'Thirty Day'
      },
      {
        dataField: 'target',
        text: 'Target'
      },
      {
        dataField: 'org',
        text: 'Organization',
        filter: textFilter()
      }
    ];

    const rowEvents = {
      onClick: (e, row, rowIndex) => this.updateSloDocument(e, row, rowIndex)
    };

    return (
      <>
        <HeadingText spacingType={[HeadingText.SPACING_TYPE.EXTRA_LARGE]}>
          Service Level Objectives
        </HeadingText>
        <BootstrapTable
          keyField="name"
          data={tableData}
          columns={columns}
          filter={filterFactory()}
          rowEvents={rowEvents}
          striped={false}
          wrapperClasses="slo-table-container"
          classes="slo-table"
        />
      </>
    );
  }

  getTableData() {
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
    return data;
  }

  /** lifecycle - provides the simple table component as a encapsulated <div> */
  render() {
    const gettingStarted = this.renderGettingStarted();
    const gridView = this.renderGridView();
    const tableView = this.renderTableView();

    const bootstrapTable = true;
    const bootstrapTableView = this.renderBootStrapTableView();

    // render the table or just the headings if we have no clo_documents defined.
    if (this.props.slo_documents.length === 0) {
      return { gettingStarted };
    } else {
      // Todo: figure out a way to enable sorting on columns that include a color
      // The blocker here is that color is included by wrapping the cell value in an html element.
      // When the cell is provided an html element rather than a string or number it can't sort
      return (
        <>
          {this.props.tableView && tableView}
          {this.props.tableView && bootstrapTable && bootstrapTableView}
          {!this.props.tableView && gridView}
        </>
      );
    } // else
  } // render
} // SLOTable
