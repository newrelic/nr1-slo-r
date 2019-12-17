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
import { HeadingText, Spinner, Stack, StackItem } from 'nr1';

/** local */
import CompositeAlertSlo from '../../../shared/queries/alert-driven-slo/composite';
import CompositeErrorBudgetSlo from '../../../shared/queries/error-budget-slo/composite';
import { SLO_INDICATORS } from '../../../shared/constants';

/** 3rd party */
import BootstrapTable from 'react-bootstrap-table-next';

/**
 * OrgDisplayer
 */
export default class OrgDisplayer extends React.Component {
  static propTypes = {
    org: PropTypes.object,
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
    await this._assembleOrganizationData();
  } // componentDidMount

  async componentDidUpdate(prevProps) {
    const orgChanged = prevProps.org.orgName !== this.props.org.orgName;
    const timeRangeChanged = prevProps.timeRange !== this.props.timeRange;
    const selectedIndicatorChanged =
      prevProps.activeIndicator !== this.props.activeIndicator;

    if (orgChanged || timeRangeChanged || selectedIndicatorChanged) {
      await this._assembleOrganizationData();
    }
  }

  async _assembleOrganizationData() {
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
  } // _assembleOrganizationData

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
      name: data.slo_document.name,
      target: data.slo_document.target,

      current: data.result_current.result,
      sevenDay: data.result_7_day.result,
      thirtyDay: data.result_30_day.result
    };

    return transformedData;
  }

  filterSlos() {
    const { activeIndicator, org } = this.props;
    const slosFilteredByIndicator = org.slos.filter(
      item => item.slo.indicator === activeIndicator
    );

    return slosFilteredByIndicator;
  }

  calculateTotalAttainment({ _slo_data }) {
    let __total_current_numerator = 0;
    let __total_current_denominator = 0;
    let __total_7_day_numerator = 0;
    let __total_7_day_denominator = 0;
    let __total_30_day_numerator = 0;
    let __total_30_day_denominator = 0;

    _slo_data.forEach(data => {
      __total_current_numerator =
        __total_current_numerator + data.result_current.numerator;
      __total_current_denominator =
        __total_current_denominator + data.result_current.denominator;

      __total_7_day_numerator =
        __total_7_day_numerator + data.result_7_day.numerator;
      __total_7_day_denominator =
        __total_7_day_denominator + data.result_7_day.denominator;

      __total_30_day_numerator =
        __total_30_day_numerator + data.result_30_day.numerator;
      __total_30_day_denominator =
        __total_30_day_denominator + data.result_30_day.denominator;
    });

    const currentAttainment =
      Math.round(
        (100 -
          (__total_current_numerator / __total_current_denominator) * 100) *
          1000
      ) / 1000;

    const sevenDayAttainment =
      Math.round(
        (100 - (__total_7_day_numerator / __total_7_day_denominator) * 100) *
          1000
      ) / 1000;

    const thirtyDayAttainment =
      Math.round(
        (100 - (__total_30_day_numerator / __total_30_day_denominator) * 100) *
          1000
      ) / 1000;

    return {
      currentAttainment,
      sevenDayAttainment,
      thirtyDayAttainment
    };
  }

  renderBootStrapTableView() {
    const { activeIndicator, org } = this.props;
    const { tableData, summarySloData } = this.state;
    const attainment = this.calculateTotalAttainment({
      _slo_data: summarySloData
    });

    const indicatorLabel = SLO_INDICATORS.find(i => i.value === activeIndicator)
      .label;
    const tableHeader = `${org.orgName}'s ${indicatorLabel} SLO's`;

    const columns = [
      {
        dataField: 'name', // SLO
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
              There are no SLO's defined for this Services in this SLO group and
              category. To define an SLO:
            </p>
            <ol>
              <li>navigate to the Entity Explorer</li>
              <li>choose a Service</li>
              <li>select SLO/R from the sidebar menu</li>
              <li>click Define an SLO</li>
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
  } // render
} // OrgDisplayer
