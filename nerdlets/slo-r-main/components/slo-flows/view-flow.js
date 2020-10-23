import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EntityStorageQuery, Spinner } from 'nr1';
import { Button, Card, Label, Icon, Modal, Progress, Segment, Statistic } from 'semantic-ui-react'

import { ENTITY_COLLECTION_NAME } from '../../../shared/constants';
import { writeFlowDocument } from '../../../shared/services/flow-documents';
import ErrorBudgetSLO from '../../../shared/queries/error-budget-slo/single-document';
import AlertDrivenSLO from '../../../shared/queries/alert-driven-slo/single-document';

export default class ViewFlow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      slos: [],
      updatedFlow: null,
      aggregate: null
    };
  }

  componentDidMount = async () => {
    let { slos } = this.state;
    await this.filterSlos();
  }

  componentDidUpdate = async (prevProps) => {
    if (prevProps.flow !== this.props.flow) {
      this.setState({isLoading: true })
      await this.filterSlos();
    }
  }

  calculateAggregateScores() {
    const { slos } = this.state;
    let averageScores = {'thirty': 0, 'seven': 0, 'current': 0};
    let thirty = 0;
    let seven = 0;
    let current = 0;

    slos.forEach(s => {
      thirty += s['30_day'];
      seven += s['7_day'];
      current += s['current'];
    });

    thirty = (thirty/slos.length);
    seven = (seven/slos.length);
    current = (current/slos.length);

    averageScores['thirty'] = thirty;
    averageScores['seven'] = seven;
    averageScores['current'] = current;

    this.setState({ aggregate: averageScores });
  }

  writeNewFlowDocument = async document => {
    await writeFlowDocument({
      document
    });
  };

  pluckSlos() {
    const { flow, slos } = this.props;
    let pluckedSlos = [];

    flow.slos.forEach((slo, i) => {
      let index = slos.findIndex(i => i.id == slo.value);
      if (index !== -1) {
        pluckedSlos.push(slos[index]);
      }
    })

    return pluckedSlos;
  }

  filterSlos = async () => {
    const { flow } = this.props;

    if (Object.keys(flow).length === 0) {
      return;
    }

    let pluckedSlos = await this.pluckSlos();

    let filtered = pluckedSlos.filter((res) => res != null);
    if (filtered.length !== flow.slos.length) { //delete check - update the flow in AccountStorage if a SLO was deleted.
      flow.slos.forEach((s, i) => {
        let index = filtered.findIndex(i => i.documentId == s.value);
        if (index == -1) {
          flow.slos.splice(i, 1);
          this.writeNewFlowDocument(flow)
        }
      })
    }

    await this.fetchDetails(filtered);
  }

  fetchDetails = async (slos) => {
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

  moveUp = (e) => {
    let { slos } = this.state;
    let sloCopy = [...slos];
    let id = e.currentTarget.id;

    let index = sloCopy.findIndex(i => i.documentId == id);

    if (index > 0) {
      let slo = sloCopy[index];
      sloCopy[index] = sloCopy[index - 1];
      sloCopy[index - 1] = slo;
    }

    this.setState({slos: sloCopy});
  }

  moveDown = (e) => {
    let { slos } = this.state;
    let sloCopy = [...slos];
    let id = e.currentTarget.id;

    let index = sloCopy.findIndex(i => i.documentId == id);

    if (index !== -1 && index < sloCopy.length - 1) {
      let slo = sloCopy[index];
      sloCopy[index] = sloCopy[index + 1];
      sloCopy[index + 1] = slo;
    }

    this.setState({slos: sloCopy});
  }

  handleCloseModal = () => {
    let { slos } = this.state;
    let { handleClose } = this.props;

    handleClose(slos)
    this.setState({ slos: [] });
  }

  render() {
    let { aggregate, updatedFlow, slos, isLoading } = this.state;
    const { flow, isOpen } = this.props;

    const noSlos = <p>No SLOs Found</p>
    const loader = <Spinner />

    return (
      <>
        <Modal
          closeIcon
          size='fullscreen'
          open={isOpen}
          onClose={this.handleCloseModal}
          dimmer='inverted'
        >
        {
          isLoading ? loader :
          <>
          <Modal.Header>
            <div>
              <h1 className='flow__displayHeader'>Flow: {flow.name}</h1>
              <h2 style={{display: 'inline-flex', marginLeft: '20%'}}>Owner: {flow.owner}</h2>
              <Statistic.Group style={{display: 'inline-flex', marginLeft: '15%'}} size='small'>
                <Statistic>
                  <Statistic.Value>{aggregate['current'].toFixed(2)}</Statistic.Value>
                  <Statistic.Label>Current</Statistic.Label>
                </Statistic>
                <Statistic>
                  <Statistic.Value>{aggregate['seven'].toFixed(2)}</Statistic.Value>
                  <Statistic.Label>7 Day</Statistic.Label>
                </Statistic>
                <Statistic>
                  <Statistic.Value>{aggregate['thirty'].toFixed(2)}</Statistic.Value>
                  <Statistic.Label>30 Day</Statistic.Label>
                </Statistic>
              </Statistic.Group>
            </div>
          </Modal.Header>
          <Modal.Content>
            {
              slos == null || slos.length == 0
              ?
              noSlos
              :
              <Card.Group itemsPerRow={4}>
              {
                slos.map((s, i) => {
                  return (
                    <>
                    <Card color={s.current < s.target ? 'red' : 'green'} key={i}>
                      <Card.Content>
                        <Card.Header style={{float: 'left'}}>{i + 1}</Card.Header>
                        <Card.Header style={{textAlign: 'center'}}><h3 style={{display: 'inline'}}>{s.name}</h3></Card.Header>
                        <Statistic.Group size='mini' widths={2}>
                          <Statistic color={s.current < s.target ? 'red' : 'green'}>
                            <Statistic.Value>{s.current.toFixed(2)}</Statistic.Value>
                            <Statistic.Label>Current</Statistic.Label>
                          </Statistic>
                          <Statistic>
                            <Statistic.Value>{s.target}</Statistic.Value>
                            <Statistic.Label>Target</Statistic.Label>
                          </Statistic>
                          <Statistic color={s['7_day'] < s.target ? 'red' : 'green'}>
                            <Statistic.Value>{s['7_day'].toFixed(2)}</Statistic.Value>
                            <Statistic.Label>7 Day</Statistic.Label>
                          </Statistic>
                          <Statistic color={s['30_day'] < s.target ? 'red' : 'green'}>
                            <Statistic.Value>{s['30_day'].toFixed(2)}</Statistic.Value>
                            <Statistic.Label>30 Day</Statistic.Label>
                          </Statistic>
                          <Statistic style={{margin: 'auto'}}>
                            <Statistic.Value>{s.budget}</Statistic.Value>
                            <Statistic.Label>Budget Remaining</Statistic.Label>
                          </Statistic>
                        </Statistic.Group>
                        <Button id={s.documentId} onClick={this.moveUp} style={{float: 'left', margin: 'auto'}} size='mini' icon='arrow alternate circle left outline'/>
                        <Button id={s.documentId} onClick={this.moveDown} style={{float: 'right', margin: 'auto'}} size='mini' icon='arrow alternate circle right outline'/>
                      </Card.Content>
                    </Card>
                    {slos.length === i + 1 ? '' : <Icon style={{marginTop: '5%'}} size='big' name='chevron circle right'/>}
                    </>
                  )
                })
              }
              </Card.Group>
            }
          </Modal.Content>
          </>
        }
        </Modal>
      </>
    )
  }
}

ViewFlow.propTypes = {
  flow: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired
};
