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
import { Button, Stack, StackItem, TableChart } from 'nr1';

/** 3rd party */
import { isEqual } from 'lodash';
import BootstrapTable from 'react-bootstrap-table-next';

import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';

/** local */
import SLOGrid from './slo-grid';
import ErrorBudgetSLO from '../../shared/queries/error-budget-slo';
import AlertDrivenSLO from '../../shared/queries/alert-driven-slo';
import { SLO_INDICATORS } from '../../shared/constants';
import searchIcon from '../../../assets/icon-search.svg';

/**
 * SloList
 */
export default class SloList extends React.Component {
  static propTypes = {
    slo_documents: PropTypes.array,
    timeRange: PropTypes.object,
    tableView: PropTypes.bool,
    toggleCreateModal: PropTypes.func,
    toggleUpdateModal: PropTypes.func,
    toggleViewModal: PropTypes.func,
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
    const hasChanged = !isEqual(updatedDocs, prevDocs);

    if (hasChanged) {
      this.reloadData(currentTimeRange, updatedDocs);
    }
  }

  reloadData(timeRange, documents) {
    this.setState({ tableData: [] }, () => this.loadData(timeRange, documents));
  }

  async loadData(timeRange, documents) {
    const scopes = ['current', '7_day', '30_day'];

    if (documents) {
      documents.forEach(documentObject => {
        const { document } = documentObject;

        scopes.forEach(scope => {
          if (document.indicator === 'error_budget') {
            ErrorBudgetSLO.query({
              scope,
              document,
              timeRange
            }).then(result => this.handleScopeResult(result));
          } else {
            AlertDrivenSLO.query({
              scope,
              document,
              timeRange
            }).then(result => this.handleScopeResult(result));
          }
        });
      });
    }
  }

  handleScopeResult(result) {
    const { tableData } = this.state;
    const { document } = result;

    const index = tableData.findIndex(value => {
      return value.documentId === document.documentId;
    });

    if (index < 0) {
      this.addScopeResult(result);
    }

    if (index >= 0) {
      this.updateScopeResult({ result, index });
    }
  }

  addScopeResult(result) {
    const { document, scope, data } = result;
    const formattedDocument = {
      documentId: document.documentId,
      name: document.name,
      indicator: document.indicator,
      target: document.target,
      org: document.organization,
      entityGuid: document.entityGuid
    };
    formattedDocument[scope] = data;

    this.setState(prevState => ({
      tableData: [...prevState.tableData, formattedDocument]
    }));
  }

  updateScopeResult({ result, index }) {
    const { tableData } = this.state;
    const { scope, data } = result;
    const updatedDocument = { ...tableData[index] };
    updatedDocument[scope] = data;

    this.setState(prevState => ({
      tableData: [
        ...prevState.tableData.slice(0, index),
        updatedDocument,
        ...prevState.tableData.slice(index + 1)
      ]
    }));
  }

  // TO DO - Do we want per cell editing?
  async updateSloDocument(e, row, rowIndex) {
    // eslint-disable-next-line no-console
    console.debug(e);
    // eslint-disable-next-line no-console
    console.debug(row);
    // eslint-disable-next-line no-console
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
    const { tableData } = this.state;

    return (
      <SLOGrid
        data={tableData}
        toggleViewModal={this.props.toggleViewModal}
        toggleUpdateModal={this.props.toggleUpdateModal}
        deleteCallback={this.props.deleteCallback}
      />
    );
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

  formatterAttainmentCheck(cell, row, rowIndex, formatExtraData) {
    const scopeField = formatExtraData.scope;
    const compareTo = row[scopeField];
    const target = row.target;

    const label = cell;

    if (parseFloat(compareTo) < parseFloat(target)) {
      return (
        <span>
          <strong style={{ color: 'red' }}>{label}</strong>
        </span>
      );
    }
    return <span>{label}</span>;
  }

  renderBootStrapTableView() {
    const { tableData } = this.state;
    const { SearchBar } = Search;
    const indicatorOptions = SLO_INDICATORS.reduce(
      (previousValue, currentValue) => {
        previousValue[currentValue.value] = currentValue.label;
        return previousValue;
      },
      {}
    );

    const columns = [
      {
        dataField: 'name',
        text: 'Name',
        sort: true
      },
      {
        dataField: 'indicator',
        text: 'Indicator',
        formatter: (cell, row, rowIndex, formatExtraData) => {
          const { indicatorOptions } = formatExtraData;
          const label = indicatorOptions[cell] || cell;

          return label;
        },
        formatExtraData: {
          indicatorOptions
        },
        sort: true
      },
      {
        dataField: 'current',
        text: 'Current',
        sort: true,
        formatter: this.formatterAttainmentCheck,
        formatExtraData: {
          scope: 'current'
        }
      },
      {
        dataField: '7_day',
        text: 'Seven Day',
        sort: true,
        formatter: this.formatterAttainmentCheck,
        formatExtraData: {
          scope: '7_day'
        }
      },
      {
        dataField: '30_day',
        text: 'Thirty Day',
        sort: true,
        formatter: this.formatterAttainmentCheck,
        formatExtraData: {
          scope: '30_day'
        }
      },
      {
        dataField: 'target',
        text: 'Target',
        sort: true
      },
      {
        dataField: 'org',
        text: 'Organization',
        sort: true
      }
    ];

    const rowEvents = {
      onClick: (e, row, rowIndex) => this.updateSloDocument(e, row, rowIndex)
    };

    return (
      <>
        <ToolkitProvider
          keyField="name"
          data={tableData}
          columns={columns}
          rowEvents={rowEvents}
          striped={false}
          search
        >
          {props => (
            <div>
              <SearchBar
                placeholder="Search for an SLO"
                className="TextField-input table-search-input"
                {...props.searchProps}
                style={{ backgroundImage: `url(${searchIcon})` }}
              />
              <BootstrapTable
                wrapperClasses="slo-table-container"
                classes="slo-table"
                {...props.baseProps}
              />
            </div>
          )}
        </ToolkitProvider>
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
            'indicator',
            'current',
            '7_day',
            '30_day',
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
    const { slo_documents } = this.props;
    const hasDocuments = slo_documents.length > 0;
    const gettingStarted = this.renderGettingStarted();
    const gridView = this.renderGridView();
    const tableView = this.renderTableView();
    const bootstrapTable = true;
    const bootstrapTableView = this.renderBootStrapTableView();

    // render the table or just the headings if we have no clo_documents defined.
    if (!hasDocuments) {
      return <>{gettingStarted}</>;
    } else {
      // Todo: figure out a way to enable sorting on columns that include a color
      // The blocker here is that color is included by wrapping the cell value in an html element.
      // When the cell is provided an html element rather than a string or number it can't sort
      return (
        <>
          {this.props.tableView && bootstrapTable && bootstrapTableView}
          {!this.props.tableView && gridView}
        </>
      );
    } // else
  } // render
} // SLOTable
