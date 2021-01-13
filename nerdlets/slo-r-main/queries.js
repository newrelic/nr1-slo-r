import { NerdGraphQuery } from 'nr1';

export const getTags = async guid => {
  const tagsQuery = `{
    actor {
      entity(guid: "${guid}") {
        tags {
          key
          values
        }
      }
    }
  }
  `;

  return NerdGraphQuery.query({
    query: tagsQuery
  });
};

export const getEntities = async () => {
  const query = `{
    actor {
      entitySearch(queryBuilder: {tags: {key: "slor", value: "true"}, domain: APM, type: APPLICATION}) {
        count
        query
        results {
          entities {
            guid
            name
            accountId
          }
          nextCursor
        }
      }
    }
  }`;

  const result = await NerdGraphQuery.query({
    query,
    fetchPolicyType: NerdGraphQuery.FETCH_POLICY_TYPE.NO_CACHE
  });

  // TODO Need NULL checks to verify the query retured with reasonable data
  const entities = result.data.actor.entitySearch.results.entities;
  let moarEntities = [];

  if (result.data.actor.entitySearch.results.nextCursor !== null) {
    moarEntities = await getCursorEntities(
      result.data.actor.entitySearch.results.nextCursor
    );
  }

  return entities.concat(moarEntities);
};

const getCursorEntities = async _cursorId => {
  let gotCursor = true;
  let compositeResult = [];
  let cursorId = _cursorId;
  let query;
  let results;

  /* loop until all the cursors have been exhaused - 2400 records max
     in general this shouldn't be an issue as we are scoping our slo lookup to those entities with the slor=true tag */
  while (gotCursor) {
    query = `{
      actor {
        entitySearch(queryBuilder: {tags: {key: "slor", value: "true"}, domain: APM, type: APPLICATION}) {
          count
          query
          results(cursor: "${cursorId}") {
            entities {
              guid
              name
            }
            nextCursor
          }
        }
      }
    }`;

    results = await NerdGraphQuery.query({
      query,
      fetchPolicyType: NerdGraphQuery.FETCH_POLICY_TYPE.NO_CACHE
    });

    if (
      results.data.actor.entitySearch.results !== null ||
      results.data.actor.entitySearch.results !== undefined
    ) {
      if (results.data.actor.entitySearch.results.nextCursor !== null) {
        compositeResult = compositeResult.concat(
          results.data.actor.entitySearch.results.entities
        );
        cursorId = results.data.actor.entitySearch.results.nextCursor;
      } else {
        gotCursor = false;
      }
    } else {
      gotCursor = false;
    }
  }

  return compositeResult;
};
