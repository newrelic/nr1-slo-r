/**
 * Provides the inital react context for assembling the complete list of ORG SLOs.
 *
 * @file 
 * @author Gil Rice
 */
/** core */
import React from 'react';
import PropTypes from 'prop-types';
/** nr1 */
import {   PlatformStateContext,
  NerdletStateContext,
  EntitiesByDomainTypeQuery, Spinner } from 'nr1';
/** local */
import SLOREstate from './components/slo-r-estate';


export default class SloRMain extends React.Component {
  static propTypes = {
    nerdlet_beginTS: PropTypes.string,
    nerdlet_endTS: PropTypes.string,
    nerdlet_duration: PropTypes.string
  }; // propTypes

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
              return 'Error!';
            }
            return (

              <PlatformStateContext.Consumer>
              {launcherUrlState => (
                <NerdletStateContext.Consumer>
                  {nerdletUrlState => (
                    <SLOREstate
                    entities_data={data}
                    entities_fetchmoar={fetchMore}
                    launcherUrlState={launcherUrlState}
                    nerdletUrlState={nerdletUrlState}
                  />
                  )}
                </NerdletStateContext.Consumer>
              )}
            </PlatformStateContext.Consumer>
            );
          }}
        </EntitiesByDomainTypeQuery>
      </div>
    );
  } // render
} // SloRMain
/**
 *     {this.state.entities.map(_entity => 
                        
                        <p>_entity</p>
                        )}
 
 
 
 
         return(
            <div>
            <EntitiesByDomainTypeQuery entityDomain="APM" entityType="APPLICATION">
    {({ loading, error, data, fetchMore }) => {
        if (loading) {
            return <Spinner />;
        }

        if (error) {
            return 'Error!';
        }

        return (
            <List items={data.entities} rowCount={data.count} onLoadMore={fetchMore}>
                {({ item }) => <ListItem key={item.guid}>{item.name}</ListItem>}
            </List>
        );
    }}
</EntitiesByDomainTypeQuery>
            </div>
        );
                               */
