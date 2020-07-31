/**
 * Provides the inital react context for assembling the complete list of SLO Groups.
 *
 * @file
 * @author Gil Rice
 */
/** core */
import React from 'react';

/** nr1 */
import { NerdGraphQuery, Spinner } from 'nr1';

/** local */
import SLOREstate from './components/slo-r-estate';

export default class SloRMain extends React.Component {
  static propTypes = {
    // propTypes
  };

  constructor(props) {
    super(props);

    this.state = {
      entities: null
    };
  } // constructor

  async componentDidMount() {
    await this._getEntities();
  }

  async _getEntities() {
    const __query = `{
      actor {
        entitySearch(queryBuilder: {tags: {key: "slor", value: "true"}, domain: APM, type: APPLICATION}) {
          count
          query
          results {
            entities {
              guid
              name
            }
            nextCursor
          }
        }
      }
    }`;

    const __result = await NerdGraphQuery.query({
      query: __query,
      fetchPolicyType: NerdGraphQuery.FETCH_POLICY_TYPE.NO_CACHE
    });

    // TODO Need NULL checks to verify the query retured with reasonable data
    let __entities = __result.data.actor.entitySearch.results.entities;
    let __moarEntities = [];

    if (__result.data.actor.entitySearch.results.nextCursor !== null) {
      __moarEntities = await this._getCursorEntities(
        __result.data.actor.entitySearch.results.nextCursor
      );
    } // if

    __entities = __entities.concat(__moarEntities);

    this.setState({
      entities: __entities
    });

    return __entities;
  } // _getEntities

  async _getCursorEntities(_cursorId) {
    let __gotCursor = true;
    let __compositeResults = [];
    let __cursorId = _cursorId;
    let __query;
    let __results;

    /* loop until all the cursors have been exhaused - 2400 records max
       in general this shouldn't be an issue as we are scoping our slo lookup to those entities with the slor=true tag */
    while (__gotCursor) {
      __query = `{
        actor {
          entitySearch(queryBuilder: {tags: {key: "slor", value: "true"}, domain: APM, type: APPLICATION}) {
            count
            query
            results(cursor: "${__cursorId}") {
              entities {
                guid
                name
              }
              nextCursor
            }
          }
        }
      }`;

      __results = await NerdGraphQuery.query({
        query: __query,
        fetchPolicyType: NerdGraphQuery.FETCH_POLICY_TYPE.NO_CACHE
      });

      if (
        __results.data.actor.entitySearch.results !== null ||
        __results.data.actor.entitySearch.results !== undefined
      ) {
        if (__results.data.actor.entitySearch.results.nextCursor !== null) {
          __compositeResults = __compositeResults.concat(
            __results.data.actor.entitySearch.results.entities
          );
          __cursorId = __results.data.actor.entitySearch.results.nextCursor;
        } // if
        else {
          __gotCursor = false;
        } // else
      } // if
      else {
        __gotCursor = false;
      } // else
    } // while

    return __compositeResults;
  } // _getCursorEntities

  render() {
    if (this.state.entities === null) {
      return (
        <div>
          <Spinner />
        </div>
      );
    } // if
    else {
      return (
        <div>
          <SLOREstate entities={this.state.entities} />
        </div>
      );
    } // else
  } // render
} // SloRMain
