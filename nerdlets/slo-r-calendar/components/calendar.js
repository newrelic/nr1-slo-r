import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'nr1';
import {
  add,
  sub,
  getDaysInMonth,
  endOfMonth,
  startOfMonth,
  getISODay
} from 'date-fns';

import { Day } from '.';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export default class Calendar extends PureComponent {
  constructor(props) {
    super(props);

    const today = new Date();

    const convertedDate = this.convertDate(today);

    this.state = {
      ...convertedDate
    };
  }

  convertDate = date => {
    return {
      currentDate: date,
      currentMonth: date.getMonth(),
      currentYear: date.getFullYear(),
      firstDayOfMonth: getISODay(startOfMonth(date)),
      daysInCurrentMonth: getDaysInMonth(date),
      lastDayOfMonth: getISODay(endOfMonth(date))
    };
  };

  handlePreviousMonth = () => {
    const { currentDate } = this.state;

    const convertedDate = this.convertDate(sub(currentDate, { months: 1 }));

    this.setState({
      ...convertedDate
    });
  };

  handleNextMonth = () => {
    const { currentDate } = this.state;

    const convertedDate = this.convertDate(add(currentDate, { months: 1 }));

    this.setState({
      ...convertedDate
    });
  };

  render() {
    const daysComponents = [];

    const { slo } = this.props;

    const {
      currentYear,
      currentMonth,
      firstDayOfMonth,
      lastDayOfMonth,
      daysInCurrentMonth
    } = this.state;

    Array.from({ length: firstDayOfMonth - 1 }).forEach((_, index) =>
      daysComponents.push(<div key={`${index}-1`} className="day-container" />)
    );

    Array.from({ length: daysInCurrentMonth }).forEach((_, index) => {
      daysComponents.push(
        <Day
          key={index}
          date={new Date(currentYear, currentMonth, index + 1)}
          slo={slo}
        />
      );
    });

    if (lastDayOfMonth > 0) {
      Array.from({ length: 7 - lastDayOfMonth }).forEach((_, index) =>
        daysComponents.push(
          <div key={`${index}-2`} className="day-container" />
        )
      );
    }

    return (
      <div className="calendar-container">
        <div className="calendar">
          <div className="calendar__month">
            <Button
              onClick={this.handlePreviousMonth}
              type={Button.TYPE.NORMAL}
            >
              Previous
            </Button>
            <div>
              {MONTHS[this.state.currentMonth]} {this.state.currentYear}
            </div>
            <Button onClick={this.handleNextMonth} type={Button.TYPE.NORMAL}>
              Next
            </Button>
          </div>
          <div className="calendar__weekdays">
            <div>Monday</div>
            <div>Tuesday</div>
            <div>Wednesday</div>
            <div>Thursday</div>
            <div>Friday</div>
            <div>Saturday</div>
            <div>Sunday</div>
          </div>
          <div className="calendar__days">{daysComponents}</div>
        </div>
      </div>
    );
  }
}

Calendar.propTypes = {
  slo: PropTypes.object.isRequired
};
