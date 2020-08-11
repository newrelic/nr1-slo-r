import React, { Component } from 'react';
import { Spinner } from 'nr1';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { startOfDay, endOfDay, startOfTomorrow, isSameDay } from 'date-fns';
import AlertDrivenSLO from '../../shared/queries/alert-driven-slo/single-document';
import ErrorBudgetSLO from '../../shared/queries/error-budget-slo/single-document';

export default class Day extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: undefined,
      isProcessing: true,
      sloExists: false,
      cachedDays: []
    };
  }

  componentDidMount = async () => {
    this.calculateValue();
  };

  componentDidUpdate = async prevProps => {
    if (prevProps.date !== this.props.date) {
      this.calculateValue();
    }
  };

  calculateValue = async () => {
    this.setState({ isProcessing: true });

    try {
      const { date, slo } = this.props;

      if (date > startOfTomorrow()) {
        this.setState({ sloExists: false });
        return;
      }

      const { cachedDays } = this.state;
      const foundIndex = cachedDays.findIndex(item =>
        isSameDay(item.date, date)
      );

      if (foundIndex >= 0) {
        const { value } = cachedDays[foundIndex];
        this.setState({
          value,
          sloExists: true
        });
      } else {
        const summaryFunction =
          slo.indicator === 'error_budget' ? ErrorBudgetSLO : AlertDrivenSLO;

        const sloCalculation = await summaryFunction.query({
          document: slo,
          timeRange: {
            begin_time: startOfDay(date),
            end_time: endOfDay(date)
          },
          scope: '1_day'
        });

        this.setState(prevState => ({
          value: sloCalculation.data,
          sloExists: true,
          cachedDays: [
            ...prevState.cachedDays,
            { date, value: sloCalculation.data }
          ]
        }));
      }
    } finally {
      this.setState({ isProcessing: false });
    }
  };

  render() {
    const { date, slo } = this.props;
    const { value, isProcessing, sloExists } = this.state;
    const day = date.getDate();

    const className = classNames(
      'value',
      sloExists && value && (value >= slo.target ? 'value--good' : 'value--bad')
    );

    const content = isProcessing ? (
      <Spinner />
    ) : (
      <>
        <div className={className}>{sloExists ? value : 'No SLO yet'}</div>
      </>
    );

    return (
      <div className="day-container" key={day}>
        <span className="day">{day}</span>
        {content}
      </div>
    );
  }
}

Day.propTypes = {
  date: PropTypes.object.isRequired,
  slo: PropTypes.object.isRequired
};
