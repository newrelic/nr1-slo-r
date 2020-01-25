/**
 * Provides the inital react context for assembling the complete list of SLO Groups.
 *
 * @file
 * @author Gil Rice
 */
/** core */
import React from 'react';

/** nr1 */
import {
  EntitiesByDomainTypeQuery,
  Spinner
} from 'nr1';

import { NerdGraphError } from '@newrelic/nr1-community';

/** local */
import SLOREstate from './components/slo-r-estate';

export default class SloRMain extends React.Component {
  static propTypes = {
    // propTypes
  };

  constructor(props) {
    super(props);
  } // constructor

  render() {
    return (
      <div>
        <EntitiesByDomainTypeQuery entityDomain="APM" entityType="APPLICATION">
          {({ loading, error, data, fetchMore }) => {
            if (loading) {
              return <Spinner />;
            }
            if (error) {
              return <NerdGraphError error={error} />
            }
            return (
                <SLOREstate
                  entities={data.entities}
                  fetchMore={fetchMore}
                />
            );
          }}
        </EntitiesByDomainTypeQuery>
      </div>
    );
  } // render
} // SloRMain
