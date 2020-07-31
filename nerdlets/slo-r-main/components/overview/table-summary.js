import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import PropTypes from 'prop-types';

import { StackItem, HeadingText, navigation, Button, Spinner } from 'nr1';

import CompositeAlertSlo from '../../../shared/queries/alert-driven-slo/composite';
import CompositeErrorBudgetSlo from '../../../shared/queries/error-budget-slo/composite';
import { sloIndicatorLabelLookup } from '../../../shared/helpers';

export default class SummaryTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isProcessing: true,
      cachedSummaryData: [],
      summaryData: []
    };
  }

  componentDidMount = async () => {
    await this.fetchSummaryData();
  };

  componentDidUpdate = async prevProps => {
    const { slos } = this.props;

    const hasNewValues =
      slos.length !== prevProps.slos.length ||
      slos.some(
        slo => prevProps.slos.findIndex(prevSlo => prevSlo.id === slo.id) < 0
      );

    if (hasNewValues) {
      await this.fetchSummaryData();
    }
  };

  fetchSummaryData = async () => {
    const { slos, indicator } = this.props;
    const { cachedSummaryData } = this.state;

    if (slos.length === 0) return;

    this.setState({ isProcessing: true });

    try {
      const cachedSummary = [];
      const promises = [];

      const summaryFunction =
        indicator === 'error_budget'
          ? CompositeErrorBudgetSlo
          : CompositeAlertSlo;

      slos.forEach(slo => {
        const cachedIndex = cachedSummaryData.findIndex(
          data => data.slo_document.documentId === slo.document.documentId
        );
        if (cachedIndex < 0) {
          promises.push(
            summaryFunction.query({
              slo_document: slo.document,
              timeRange: this.props.timeRange
            })
          );
        } else {
          cachedSummary.push(cachedSummaryData[cachedIndex]);
        }
      });

      const fetchedSummaryData = await Promise.all(promises);

      const summaryData = [...fetchedSummaryData, ...cachedSummary];
      const tableData = this.transformToTableData({ data: summaryData });

      this.setState(prevState => ({
        cachedSummaryData: [
          ...prevState.cachedSummaryData,
          ...fetchedSummaryData
        ],
        tableData,
        summaryData
      }));
    } finally {
      this.setState({ isProcessing: false });
    }
  };

  transformToTableData({ data }) {
    return data.map(row => {
      return this.transformRow({ data: row });
    });
  }

  transformRow({ data }) {
    const transformedData = {
      documentId: data.slo_document.documentId,
      entityGuid: data.slo_document.entityGuid,

      name: data.slo_document.name,
      target: data.slo_document.target,

      current: data.result_current.result,
      sevenDay: data.result_7_day.result,
      thirtyDay: data.result_30_day.result
    };

    return transformedData;
  }

  calculateTotalAttainment({ _slo_data }) {
    const numberOfSlos = _slo_data.length;
    const aggregateAttainment = {
      totalCurrent: 0,
      totalSevenDay: 0,
      totalThirtyDay: 0
    };

    _slo_data.reduce((previousValue, currentValue) => {
      previousValue.totalCurrent += currentValue.result_current.result;
      previousValue.totalSevenDay += currentValue.result_7_day.result;
      previousValue.totalThirtyDay += currentValue.result_30_day.result;

      return previousValue;
    }, aggregateAttainment);

    const { totalCurrent, totalSevenDay, totalThirtyDay } = aggregateAttainment;

    const results = {
      currentAttainment:
        Math.round((totalCurrent / numberOfSlos) * 1000) / 1000,
      sevenDayAttainment:
        Math.round((totalSevenDay / numberOfSlos) * 1000) / 1000,
      thirtyDayAttainment:
        Math.round((totalThirtyDay / numberOfSlos) * 1000) / 1000
    };

    return results;
  }

  renderTableView() {
    const { tableData, summaryData } = this.state;

    if (!summaryData || summaryData.length === 0) return;

    const attainment = this.calculateTotalAttainment({
      _slo_data: summaryData
    });

    const linkFormatter = (_, row) => {
      const { entityGuid } = row;
      return (
        <Button
          type={Button.TYPE.NORMAL}
          iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__EXTERNAL_LINK}
          onClick={() => {
            navigation.openStackedEntity(entityGuid);
          }}
        />
      );
    };

    const columns = [
      {
        dataField: 'entityGuid',
        text: 'Entity Guid',
        hidden: true
      },
      {
        dataField: 'documentId',
        text: 'SLO Document Id',
        hidden: true
      },
      {
        dataField: 'name', // SLO Name not Entity Name
        text: 'Name',
        footer: 'Total attainment:',
        headerStyle: () => {
          return { width: '300px' };
        }
      },
      {
        dataField: 'current',
        text: 'Current',
        footer: `${attainment.currentAttainment}`
      },
      {
        dataField: 'sevenDay',
        text: 'Seven Day',
        footer: `${attainment.sevenDayAttainment}`
      },
      {
        dataField: 'thirtyDay',
        text: 'Thirty Day',
        footer: `${attainment.thirtyDayAttainment}`
      },
      {
        dataField: 'target',
        text: 'Target',
        footer: '--'
      },
      {
        dataField: '',
        text: 'Entity',
        footer: '--',
        formatter: linkFormatter
      }
    ];

    return (
      <BootstrapTable
        keyField="name"
        data={tableData}
        columns={columns}
        striped={false}
        wrapperClasses="slo-table-container"
        classes="slo-table slo-summary-table"
        footerClasses="attainment-footer"
      />
    );
  }

  render() {
    const { indicator } = this.props;
    const { isProcessing } = this.state;
    return (
      <div className="table-container">
        <div>
          <HeadingText className="table-container__header">
            {sloIndicatorLabelLookup({
              value: indicator
            })}
          </HeadingText>
          {isProcessing && <Spinner inline />}
        </div>
        {this.renderTableView()}
      </div>
    );
  }
}

SummaryTable.propTypes = {
  indicator: PropTypes.string.isRequired,
  slos: PropTypes.array.isRequired,
  timeRange: PropTypes.object.isRequired
};
