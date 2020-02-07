import { NerdGraphQuery } from 'nr1';
import { get } from 'lodash';

export const fetchEntity = async function({ entityGuid }) {
  let __result;

  if (entityGuid === undefined) {
    __result.data.actor.entity = 'UNKNOWN';
  } else {
    const __query = `{
            actor {
                entity(guid: "${entityGuid}") {
                account {
                    id
                    name
                }
                name
                accountId
                ... on ApmApplicationEntity {
                    language
                }
                tags {
                    key
                }
                }
            }}`;
    // console.debug(__query);
    // fetchPolicyType is a workaround for (what we believe to be) platform issue
    // https://newrelic.atlassian.net/browse/NR1UI-2038 for more context
    __result = await NerdGraphQuery.query({ query: __query, fetchPolicyType: NerdGraphQuery.FETCH_POLICY_TYPE.NO_CACHE });
  }

  // console.debug('Entity Result: ', __result);

  const entity = get(__result, 'data.actor.entity', false);

  if (!entity) {
    return false;
  }

  // Return entity details
  return {
    accountId: entity.accountId,
    appName: entity.name,
    language: entity.language,
    entityGuid: entityGuid,
    accountName: entity.account.name
  };
};
