import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Spinner, StackItem } from 'nr1';
//import TableSummary from './table-summary';

export default class MainContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      aggregatedData: [],
      isProcessing: true
    };
  }

  componentDidMount = () => {
    this.aggregateData();
  };

  componentDidUpdate = prevProps => {
    if (prevProps.slos !== this.props.slos) {
      this.aggregateData();
    }
  };

  aggregateData = () => {
    const { slos } = this.props;
    this.setState({ isProcessing: true });
    try {
      const aggregatedData = [];
      slos.forEach(slo => {
        const indicatorIndex = aggregatedData.findIndex(
          item => item.indicator === slo.document.indicator
        );
        if (indicatorIndex < 0) {
          aggregatedData.push({
            indicator: slo.document.indicator,
            slos: [slo]
          });
        } else {
          aggregatedData[indicatorIndex].slos.push(slo);
        }
      });

      this.setState({ aggregatedData });
    } finally {
      this.setState({ isProcessing: false });
    }
  };

  render() {
    const { isProcessing, aggregatedData } = this.state;
    const { timeRange } = this.props;

    return (
      <StackItem>
        <p>text</p>
      </StackItem>
    );
  }
}

MainContainer.propTypes = {
  slos: PropTypes.array.isRequired,
  timeRange: PropTypes.object
};
