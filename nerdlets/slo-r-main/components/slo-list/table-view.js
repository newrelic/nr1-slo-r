import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Icon } from 'nr1';

import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';

import { SLO_INDICATORS } from '../../../shared/constants';
import searchIcon from '../../../../assets/icon-search.svg';
import SettingsMenu from './settings-menu';

export default class TableView extends Component {
  formatterDescription = cell => {
    if (cell !== undefined) {
      return <Tooltip text={cell}>{cell}</Tooltip>;
    }

    return '';
  };

  formatterMenu = (_, row) => {
    const { toggleViewModal, toggleUpdateModal, deleteCallback } = this.props;
    return (
      <SettingsMenu>
        <li
          className="service-settings-dropdown-item"
          onClick={() => {
            toggleViewModal({
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
            toggleUpdateModal({
              document: row
            });
          }}
        >
          <Icon type={Icon.TYPE.INTERFACE__OPERATIONS__EDIT} />
          Edit
        </li>
        <li
          className="service-settings-dropdown-item destructive"
          onClick={() => deleteCallback(row)}
        >
          <Icon type={Icon.TYPE.INTERFACE__OPERATIONS__TRASH} color="#BF0016" />
          Delete
        </li>
      </SettingsMenu>
    );
  };

  formatterAttainmentCheck = (cell, row, _, formatExtraData) => {
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
  };

  renderBootStrapTableView = () => {
    const {
      tableData,
      toggleViewModal,
      toggleUpdateModal,
      alertPolicyMap
    } = this.props;

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
        sort: true
      },
      {
        dataField: 'current',
        text: 'Current',
        sort: true,
        formatter: this.formatterAttainmentCheck,
        formatExtraData: {
          scope: 'current',
          positiveAttainmentHighlight: true
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
        dataField: 'budget',
        text: 'Budget Remaining',
        sort: true
      },
      {
        dataField: 'slogroup',
        formatter: cell => {
          if (cell) {
            return cell;
          }
          return '-';
        },
        text: 'SLO Group',
        sort: true
      },
      {
        dataField: 'alertPolicy',
        formatter: cell => {
          if (cell) {
            const policy = alertPolicyMap.get(cell);
            if (policy) {
              return policy.name;
            }
          }
          return '-';
        },
        text: 'Alert Policy',
        sort: true
      },
      {
        dataField: 'tags',
        formatter: cell => {
          if (cell) {
            const tag = cell.map(tag => (
              <span
                style={{
                  display: 'block',
                  fontSize: '12px',
                  padding: '0 8px',
                  margin: '2px 0'
                }}
                key={tag.key}
              >
                {tag.values[0]}
              </span>
            ));
            return tag;
          }
          return '-';
        },
        text: 'Tag',
        sort: true
      },
      {
        dataField: 'language',
        text: '',
        sort: false,
        formatter: this.formatterMenu,
        headerStyle: () => {
          return { width: '75px' };
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
                toggleViewModal={toggleViewModal}
                toggleUpdateModal={toggleUpdateModal}
                {...props.baseProps}
              />
            </div>
          )}
        </ToolkitProvider>
      </>
    );
  };

  render() {
    return (
      <div className="slo-list__table-container">
        {this.renderBootStrapTableView()}
      </div>
    );
  }
}

TableView.propTypes = {
  tableData: PropTypes.array.isRequired,
  toggleViewModal: PropTypes.func.isRequired,
  toggleUpdateModal: PropTypes.func.isRequired,
  deleteCallback: PropTypes.func.isRequired,
  alertPolicyMap: PropTypes.object
};
