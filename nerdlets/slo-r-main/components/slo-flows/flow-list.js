import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon, Tooltip } from 'nr1';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';

import searchIcon from '../../../../assets/icon-search.svg';
import SettingsMenu from './settings-menu';

export default class FlowList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      table: []
    };
  }

  componentDidMount() {
    const { flows } = this.props;
    let t = [];

    flows.forEach(f => {
      t.push(f.document);
    })

    this.setState({ table: t });
  }

  componentDidUpdate(prevProps) {
    let { flows } = this.props;
    if (prevProps.flows !== this.props.flows) {
      let t = [];

      flows.forEach(f => {
        t.push(f.document);
      })

      this.setState({ table: t });
    }
  }

  formatterDescription = cell => {
    if (cell !== undefined) {
      return (
        <Tooltip className="table-description-tooltip" text={cell}>
          {cell}
        </Tooltip>
      );
    }

    return '';
  };

  formatterSLO = cell => { //TODO: render SLO status (r, y, g) directly?
    return cell.length.toString();
  }

  formatterMenu = (_, row) => {
    const { toggleViewModal, toggleUpdateModal, deleteCallback } = this.props;
    return (
      <SettingsMenu>
        <li
          className="service-settings-dropdown-item"
          onClick={() => toggleViewModal(row)}
        >
          <Icon type={Icon.TYPE.INTERFACE__INFO__INFO} />
          View details
        </li>
        <li
          className="service-settings-dropdown-item"
          onClick={() => toggleUpdateModal(row)}
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

  renderFlowTable = () => {
    const { table } = this.state;
    const { SearchBar } = Search;

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
        dataField: 'owner',
        text: 'Owner',
        sort: true
      },
      {
        dataField: 'slos',
        text: 'SLOs Assigned',
        formatter: this.formatterSLO
      },
      {
        dataField: 'documentId',
        text: '',
        sort: false,
        formatter: this.formatterMenu,
        headerStyle: () => {
          return { width: '75px' };
        },
        formatExtraData: {
          data: table
        }
      }
    ];

    const rowEvents = {
      onClick: (e, row, rowIndex) => this.updateFlowDocument(e, row, rowIndex)
    };

    return (
      <>
        <ToolkitProvider
          keyField="name"
          data={table}
          columns={columns}
          rowEvents={rowEvents}
          striped={false}
          search
        >
          {props => (
            <div>
              <SearchBar
                placeholder="Search for a Flow"
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

  render() {
    return (
      <div className="slo-list__table-container">
        {this.renderFlowTable()}
      </div>
    );
  }
}

FlowList.propTypes = {
  flows: PropTypes.array.isRequired,
  toggleViewModal: PropTypes.func.isRequired,
  toggleUpdateModal: PropTypes.func.isRequired,
  deleteCallback: PropTypes.func.isRequired
};
