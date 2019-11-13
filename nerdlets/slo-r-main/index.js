/**
 * Foo
 *
 * @file Foo
 * @author Gil Rice
 */
/** core */
import React from 'react';
import { Component } from 'react';
import PropTypes from 'prop-types';
/** nr1 */
import { EntitiesByDomainTypeQuery } from 'nr1';
import { Spinner } from 'nr1';
import { List } from 'nr1';
import { ListItem } from 'nr1';
/** local */
import SLOREstate from './components/slo-r-estate';

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

export default class SloRMain extends React.Component {
    
    static propTypes = {
        nerdlet_beginTS: PropTypes.any,
        nerdlet_endTS: PropTypes.any,
        nerdlet_duration: PropTypes.any
    } //propTypes

    constructor(props) {
        super(props)
    } //constructor

    render() {

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
                            <SLOREstate
                                entities_data={data}
                                entities_fetchmoar={fetchMore}
                                nerdlet_beginTS={this.props.nerdlet_beginTS}
                                nerdlet_endTS={this.props.nerdlet_endTS}
                                nerdlet_duration={this.props.nerdlet_duration}
                            />
                            );
                        }
                    }
                </EntitiesByDomainTypeQuery>
            </div>
        );


        



    } //render

} //SloRMain
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