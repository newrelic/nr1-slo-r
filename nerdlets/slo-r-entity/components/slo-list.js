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
import { Button, Stack, StackItem, Tooltip, Icon } from 'nr1';

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
import SettingsMenu from './settings-menu';

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

    this.formatterMenu = this.formatterMenu.bind(this);
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
      ...document
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
            . We also have documentation for more specific information about{' '}
            <a
              href="https://github.com/newrelic/nr1-csg-slo-r/blob/master/docs/error_slos.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              error driven SLOs
            </a>{' '}
            or{' '}
            <a
              href="https://github.com/newrelic/nr1-csg-slo-r/blob/master/docs/alert_slos.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              alert driven SLOs
            </a>
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

  formatterAttainmentCheck(cell, row, rowIndex, formatExtraData) {
    const { scope, positiveAttainmentHighlight = false } = formatExtraData;
    const compareTo = row[scope];
    const target = row.target;

    const label = cell;

    if (parseFloat(compareTo) < parseFloat(target)) {
      return <span className="warning-cell">{label}</span>;
    }

    if (positiveAttainmentHighlight) {
      return <span className="success-cell">{label}</span>;
    }

    return <span>{label}</span>;
  }

  formatterDescription(cell) {
    if (cell !== undefined) {
      return (
        <Tooltip className="table-description-tooltip" text={cell}>
          {cell}
        </Tooltip>
      );
    }

    return '';
  }

  formatterMenu(cell, row, rowIndex, formatExtraData) {
    return (
      <SettingsMenu>
        <li
          className="service-settings-dropdown-item"
          onClick={() => {
            this.props.toggleViewModal({
              document: row
            });
          }}
        >
          <Icon type={Icon.TYPE.INTERFACE__INFO__INFO} />
          View details
        </li>
        <li
          className="service-settings-dropdown-item"
          onClick={() => {
            this.props.toggleUpdateModal({
              document: row
            });
          }}
        >
          <Icon type={Icon.TYPE.INTERFACE__OPERATIONS__EDIT} />
          Edit
        </li>
        <li
          className="service-settings-dropdown-item destructive"
          onClick={() => this.props.deleteCallback({ document: row })}
        >
          <Icon type={Icon.TYPE.INTERFACE__OPERATIONS__TRASH} color="#BF0016" />
          Delete
        </li>
      </SettingsMenu>
    );
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
        dataField: 'description',
        text: 'Description',
        formatter: this.formatterDescription
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
        sort: true,
        headerStyle: () => {
          return { width: '115px' };
        }
      },
      {
        dataField: 'current',
        text: 'Current',
        sort: true,
        formatter: this.formatterAttainmentCheck,
        formatExtraData: {
          scope: 'current',
          positiveAttainmentHighlight: true
        },
        headerStyle: () => {
          return { width: '110px' };
        }
      },
      {
        dataField: '7_day',
        text: 'Seven Day',
        sort: true,
        formatter: this.formatterAttainmentCheck,
        formatExtraData: {
          scope: '7_day'
        },
        headerStyle: () => {
          return { width: '115px' };
        }
      },
      {
        dataField: '30_day',
        text: 'Thirty Day',
        sort: true,
        formatter: this.formatterAttainmentCheck,
        formatExtraData: {
          scope: '30_day'
        },
        headerStyle: () => {
          return { width: '125px' };
        }
      },
      {
        dataField: 'target',
        text: 'Target',
        sort: true,
        headerStyle: () => {
          return { width: '100px' };
        }
      },
      {
        dataField: 'organization',
        text: 'Organization',
        sort: true,
        headerStyle: () => {
          return { width: '140px' };
        }
      },
      {
        dataField: 'language',
        text: '',
        sort: false,
        formatter: this.formatterMenu,
        headerStyle: () => {
          return { width: '50px' };
        },
        formatExtraData: {
          data: tableData
        }
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
                toggleViewModal={this.props.toggleViewModal}
                toggleUpdateModal={this.props.toggleUpdateModal}
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
            'organization',
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
    const bootstrapTable = true;
    const bootstrapTableView = this.renderBootStrapTableView();

    // render the table or just the headings if we have no clo_documents defined.
    if (!hasDocuments) {
      return <>{gettingStarted}</>;
    } else {
      return (
        <>
          {this.props.tableView && bootstrapTable && bootstrapTableView}
          {!this.props.tableView && gridView}
        </>
      );
    } // else
  } // render
} // SLOTable
