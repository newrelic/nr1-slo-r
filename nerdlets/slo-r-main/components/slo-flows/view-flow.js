import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Spinner } from 'nr1';
import { Button, Card, Icon, Modal, Statistic } from 'semantic-ui-react';

import { writeFlowDocument } from '../../../shared/services/flow-documents';
import ErrorBudgetSLO from '../../../shared/queries/error-budget-slo/single-document';
import AlertDrivenSLO from '../../../shared/queries/alert-driven-slo/single-document';

export default class ViewFlow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      slos: [],
      aggregate: null
    };
  }

  componentDidMount = async () => {
    await this.filterSlos();
  };

  componentDidUpdate = async prevProps => {
    if (prevProps.flow !== this.props.flow) {
      this.setState({ isLoading: true }); // eslint-disable-line react/no-did-update-set-state
      await this.filterSlos();
    }
  };

  calculateAggregateScores() {
    const { slos } = this.state;
    const averageScores = { thirty: 0, seven: 0, current: 0 };
    let thirty = 0;
    let seven = 0;
    let current = 0;

    slos.forEach(s => {
      thirty += s['30_day'];
      seven += s['7_day'];
      current += s.current;
    });

    thirty = thirty / slos.length;
    seven = seven / slos.length;
    current = current / slos.length;

    averageScores.thirty = thirty;
    averageScores.seven = seven;
    averageScores.current = current;

    this.setState({ aggregate: averageScores });
  }

  writeNewFlowDocument = async document => {
    await writeFlowDocument({
      document
    });
  };

  pluckSlos() {
    const { flow, slos } = this.props;
    const pluckedSlos = [];

    flow.slos.forEach(slo => {
      const index = slos.findIndex(i => i.id === slo.value);
      if (index !== -1) {
        pluckedSlos.push(slos[index]);
      }
    });

    return pluckedSlos;
  }

  filterSlos = async () => {
    const { flow } = this.props;

    if (Object.keys(flow).length === 0) {
      return;
    }

    const pluckedSlos = await this.pluckSlos();

    const filtered = pluckedSlos.filter(res => res != null);
    if (filtered.length !== flow.slos.length) {
      // delete check - update the flow in AccountStorage if a SLO was deleted.
      flow.slos.forEach((s, i) => {
        const index = filtered.findIndex(i => i.documentId === s.value);
        if (index === -1) {
          flow.slos.splice(i, 1);
          this.writeNewFlowDocument(flow);
        }
      });
    }

    await this.fetchDetails(filtered);
  };

  fetchDetails = async slos => {
    const { timeRange } = this.props;

    try {
      const promises = slos.map(slo => this.loadData(timeRange, slo));
      const loadDataResults = await Promise.all(promises);

      loadDataResults.forEach(data => {
        data.forEach(item => this.handleScopeResult(item));
      });
    } finally {
      await this.calculateAggregateScores();
      this.setState({ isLoading: false });
    }
  };

  async loadData(timeRange, slo) {
    const scopes = ['current', '7_day', '30_day'];

    const { document } = slo;

    const promises = scopes.map(scope => {
      if (
        document.indicator === 'error_budget' ||
        document.indicator === 'latency_budget'
      ) {
        return ErrorBudgetSLO.query({
          scope,
          document,
          timeRange
        });
      } else {
        return AlertDrivenSLO.query({
          scope,
          document,
          timeRange
        });
      }
    });

    const results = await Promise.all(promises);
    return results;
  }

  handleScopeResult = result => {
    const { slos } = this.state;
    const { document } = result;

    const index = slos.findIndex(value => {
      return value.documentId === document.documentId;
    });

    if (index < 0) {
      this.addScopeResult(result);
    }

    if (index >= 0) {
      this.updateScopeResult({ result, index });
    }
  };

  addScopeResult = result => {
    const { document, scope, data } = result;
    const formattedDocument = {
      ...document
    };
    formattedDocument[scope] = data;

    this.setState(prevState => ({
      slos: [...prevState.slos, formattedDocument]
    }));
  };

  updateScopeResult = ({ result, index }) => {
    const { slos } = this.state;
    const { scope, data } = result;
    const updatedDocument = { ...slos[index] };
    updatedDocument[scope] = data;

    this.setState(prevState => ({
      slos: [
        ...prevState.slos.slice(0, index),
        updatedDocument,
        ...prevState.slos.slice(index + 1)
      ]
    }));
  };

  moveUp = e => {
    const { slos } = this.state;
    const sloCopy = [...slos];
    const id = e.currentTarget.id;

    const index = sloCopy.findIndex(i => i.documentId === id);

    if (index > 0) {
      const slo = sloCopy[index];
      sloCopy[index] = sloCopy[index - 1];
      sloCopy[index - 1] = slo;
    }

    this.setState({ slos: sloCopy });
  };

  moveDown = e => {
    const { slos } = this.state;
    const sloCopy = [...slos];
    const id = e.currentTarget.id;

    const index = sloCopy.findIndex(i => i.documentId === id);

    if (index !== -1 && index < sloCopy.length - 1) {
      const slo = sloCopy[index];
      sloCopy[index] = sloCopy[index + 1];
      sloCopy[index + 1] = slo;
    }

    this.setState({ slos: sloCopy });
  };

  handleCloseModal = () => {
    const { slos } = this.state;
    const { handleClose } = this.props;

    handleClose(slos);
    this.setState({ slos: [] });
  };

  render() {
    const { aggregate, slos, isLoading } = this.state;
    const { flow, isOpen } = this.props;

    const noSlos = <p>No SLOs Found</p>;
    const loader = <Spinner />;

    return (
      <>
        <Modal
          closeIcon
          size="fullscreen"
          open={isOpen}
          onClose={this.handleCloseModal}
          dimmer="inverted"
        >
          {isLoading ? (
            loader
          ) : (
            <>
              <Modal.Header>
                <div>
                  <h1 className="flow__displayHeader">Flow: {flow.name}</h1>
                  <h2 style={{ display: 'inline-flex', marginLeft: '20%' }}>
                    Owner: {flow.owner}
                  </h2>
                  <Statistic.Group
                    style={{ display: 'inline-flex', marginLeft: '15%' }}
                    size="small"
                  >
                    <Statistic>
                      <Statistic.Value>
                        {aggregate.current === 100
                          ? aggregate.current
                          : aggregate.current.toFixed(3)}
                      </Statistic.Value>
                      <Statistic.Label>Current</Statistic.Label>
                    </Statistic>
                    <Statistic>
                      <Statistic.Value>
                        {aggregate.seven === 100
                          ? aggregate.seven
                          : aggregate.seven.toFixed(3)}
                      </Statistic.Value>
                      <Statistic.Label>7 Day</Statistic.Label>
                    </Statistic>
                    <Statistic>
                      <Statistic.Value>
                        {aggregate.thirty === 100
                          ? aggregate.thirty
                          : aggregate.thirty.toFixed(3)}
                      </Statistic.Value>
                      <Statistic.Label>30 Day</Statistic.Label>
                    </Statistic>
                  </Statistic.Group>
                </div>
              </Modal.Header>
              <Modal.Content>
                {slos === null || slos.length === 0 ? (
                  noSlos
                ) : (
                  <Card.Group itemsPerRow={4}>
                    {slos.map((s, i) => {
                      return (
                        <>
                          <Card
                            color={s.current < s.target ? 'red' : 'green'}
                            key={i}
                          >
                            <Card.Content>
                              <Card.Header style={{ float: 'left' }}>
                                {i + 1}
                              </Card.Header>
                              <Card.Header style={{ textAlign: 'center' }}>
                                <h3 style={{ display: 'inline' }}>{s.name}</h3>
                              </Card.Header>
                              <Statistic.Group size="mini" widths={2}>
                                <Statistic
                                  color={s.current < s.target ? 'red' : 'green'}
                                >
                                  <Statistic.Value>
                                    {s.current === 100
                                      ? s.current
                                      : s.current.toFixed(3)}
                                  </Statistic.Value>
                                  <Statistic.Label>Current</Statistic.Label>
                                </Statistic>
                                <Statistic>
                                  <Statistic.Value>{s.target}</Statistic.Value>
                                  <Statistic.Label>Target</Statistic.Label>
                                </Statistic>
                                <Statistic
                                  color={
                                    s['7_day'] < s.target ? 'red' : 'green'
                                  }
                                >
                                  <Statistic.Value>
                                    {s['7_day'] === 100
                                      ? s['7_day']
                                      : s['7_day'].toFixed(3)}
                                  </Statistic.Value>
                                  <Statistic.Label>7 Day</Statistic.Label>
                                </Statistic>
                                <Statistic
                                  color={
                                    s['30_day'] < s.target ? 'red' : 'green'
                                  }
                                >
                                  <Statistic.Value>
                                    {s['30_day'] === 100
                                      ? s['30_day']
                                      : s['30_day'].toFixed(3)}
                                  </Statistic.Value>
                                  <Statistic.Label>30 Day</Statistic.Label>
                                </Statistic>
                                <Statistic style={{ margin: 'auto' }}>
                                  <Statistic.Value>{s.budget}</Statistic.Value>
                                  <Statistic.Label>
                                    Budget Remaining
                                  </Statistic.Label>
                                </Statistic>
                              </Statistic.Group>
                              <Button
                                id={s.documentId}
                                onClick={this.moveUp}
                                style={{ float: 'left', margin: 'auto' }}
                                size="mini"
                                icon="arrow alternate circle left outline"
                              />
                              <Button
                                id={s.documentId}
                                onClick={this.moveDown}
                                style={{ float: 'right', margin: 'auto' }}
                                size="mini"
                                icon="arrow alternate circle right outline"
                              />
                            </Card.Content>
                          </Card>
                          {slos.length === i + 1 ? (
                            ''
                          ) : (
                            <Icon
                              style={{ marginTop: '5%' }}
                              size="big"
                              name="chevron circle right"
                            />
                          )}
                        </>
                      );
                    })}
                  </Card.Group>
                )}
              </Modal.Content>
            </>
          )}
        </Modal>
      </>
    );
  }
}

ViewFlow.propTypes = {
  flow: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  slos: PropTypes.array.isRequired,
  timeRange: PropTypes.object
};
