/**
 * Provides the component that a rolled up SLO attainment for a SLO Group
 *
 * @file
 * @author Gil Rice
 */
/** core */
import React from 'react';
import PropTypes from 'prop-types';

/** nr1 */
import {
  Button,
  HeadingText,
  navigation,
  Spinner,
  Stack,
  StackItem
} from 'nr1';

/** local */
import CompositeAlertSlo from '../../../shared/queries/alert-driven-slo/composite';
import CompositeErrorBudgetSlo from '../../../shared/queries/error-budget-slo/composite';
import { SLO_INDICATORS } from '../../../shared/constants';

/** 3rd party */
import BootstrapTable from 'react-bootstrap-table-next';

/**
 * SloSummary
 */
export default class SloSummary extends React.Component {
  static propTypes = {
    tag: PropTypes.object,
    timeRange: PropTypes.object,
    activeIndicator: PropTypes.string
  }; // propTypes

  constructor(props) {
    super(props);

    this.state = {
      summarySloData: [],
      tableData: [],
      loadingData: false,
      slosFilteredByIndicator: []
    }; // state
  } // constructor

  async componentDidMount() {
    this.filterSlos();
    await this._assembleData();
  } // componentDidMount

  async componentDidUpdate(prevProps) {
    const tagChanged = prevProps.tag.tagName !== this.props.tag.tagName;
    const timeRangeChanged = prevProps.timeRange !== this.props.timeRange;
    const selectedIndicatorChanged =
      prevProps.activeIndicator !== this.props.activeIndicator;

    if (tagChanged || timeRangeChanged || selectedIndicatorChanged) {
      await this._assembleData();
    }
  }

  async _assembleData() {
    const { activeIndicator } = this.props;
    const slosFilteredByIndicator = this.filterSlos();

    this.setState({
      loadingData: true,
      tableData: [],
      summarySloData: [],
      slosFilteredByIndicator: []
    });

    if (slosFilteredByIndicator.length === 0) {
      this.setState({
        loadingData: false
      });
      return;
    }

    const summaryFunction =
      activeIndicator === 'error_budget'
        ? CompositeErrorBudgetSlo
        : CompositeAlertSlo;

    const promises = slosFilteredByIndicator.map(sloObject => {
      const slo_document = sloObject.slo;
      const timeRange = this.props.timeRange;

      const sloPromise = summaryFunction.query({
        slo_document,
        timeRange
      });

      return sloPromise;
    });

    const summarySloData = await Promise.all(promises);
    this.transformToTableData({ data: summarySloData });

    this.setState({
      slosFilteredByIndicator,
      summarySloData,
      loadingData: false
    });
  } // _assembleData

  transformToTableData({ data }) {
    const { activeIndicator } = this.props;
    const filteredByIndicator = data.filter(
      d => d.slo_document.indicator === activeIndicator
    );

    const tableData = filteredByIndicator.map(row => {
      return this.transformRow({ data: row });
    });
    this.setState({ tableData, summarySloData: data });
  }

  /* Transform row data for bootstrap table */
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

  filterSlos() {
    const { activeIndicator, tag } = this.props;
    const slosFilteredByIndicator = tag.slos.filter(
      item => item.slo.indicator === activeIndicator
    );

    return slosFilteredByIndicator;
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

  renderBootStrapTableView() {
    const { activeIndicator, tag } = this.props;
    const { tableData, summarySloData } = this.state;
    const attainment = this.calculateTotalAttainment({
      _slo_data: summarySloData
    });

    const indicatorLabel = SLO_INDICATORS.find(i => i.value === activeIndicator)
      .label;
    const tableHeader = `${tag.tagName}'s ${indicatorLabel} SLO's`;

    // eslint-disable-next-line no-unused-vars
    const linkFormatter = function(cell, row, rowIndex, formatExtraData) {
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

    const calendarFormatter = (cell, row) => {
      const { documentId } = row;
      const { slosFilteredByIndicator } = this.state;

      const document =
        slosFilteredByIndicator[
          slosFilteredByIndicator.findIndex(
            element => element.slo.documentId === documentId
          )
        ];

      const options = {
        id: 'slo-r-calendar',
        urlState: {
          slo_document: document.slo
        }
      };

      return (
        <Button
          type={Button.TYPE.NORMAL}
          iconType={Button.ICON_TYPE.DATE_AND_TIME__DATE_AND_TIME__DATE}
          onClick={() => {
            navigation.openStackedNerdlet(options);
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
      },
      {
        dataField: '',
        text: 'Calendar',
        footer: '--',
        formatter: calendarFormatter
      }
    ];

    return (
      <>
        <HeadingText
          className="summary-table-header"
          spacingType={[HeadingText.SPACING_TYPE.EXTRA_LARGE]}
        >
          {tableHeader}
        </HeadingText>
        <BootstrapTable
          keyField="name"
          data={tableData}
          columns={columns}
          striped={false}
          wrapperClasses="slo-table-container"
          classes="slo-table slo-summary-table"
          footerClasses="attainment-footer"
        />
      </>
    );
  }

  renderEmptyState() {
    return (
      <>
        <Stack
          className="no-slos-container empty-state-container"
          directionType={Stack.DIRECTION_TYPE.VERTICAL}
          horizontalType={Stack.HORIZONTAL_TYPE.CENTER}
          verticalType={Stack.VERTICAL_TYPE.CENTER}
        >
          <StackItem>
            <h3 className="empty-state-header">
              No SLO's found for this SLO group
            </h3>
            <p className="empty-state-description">
              There are no SLO's defined for Services in this SLO group and
              category. To define an SLO:
            </p>
            <ol>
              <li>navigate to the Entity Explorer</li>
              <li>select a Service</li>
              <li>select SLO/R from the sidebar menu</li>
              <li>
                click <strong>Define an SLO</strong>
              </li>
              <li>create an SLO under this SLO category and group</li>
            </ol>
          </StackItem>
        </Stack>
      </>
    );
  }

  render() {
    const { loadingData, slosFilteredByIndicator } = this.state;
    const noSlos = !slosFilteredByIndicator.length > 0;

    if (loadingData) {
      return (
        <div>
          <Spinner />
        </div>
      );
    }

    if (noSlos) {
      return <>{this.renderEmptyState()}</>;
    }

    return <>{this.renderBootStrapTableView()}</>;
  }
}
