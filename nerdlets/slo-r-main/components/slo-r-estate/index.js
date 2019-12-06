/* eslint-disable no-lonely-if */
/**
 * Provides the component that displays the aggregation of SLOs by defined Org.
 *
 * @file
 * @author Gil Rice
 */
/** core */
import React from 'react';
import PropTypes from 'prop-types';
/** nr1 */
import {   
  PlatformStateContext,
  NerdletStateContext,
  BlockText, 
  EntityStorageQuery, 
  Grid, 
  GridItem, 
  Spinner 
} from 'nr1';
/** local */
import OrgSelector from './components/org-selector';
import OrgDisplayer from './components/org-displayer';
/** 3rd party */

/**
 * SLOREstate
 */
export default class SLOREstate extends React.Component {
  static propTypes = {
    // nerdlet_beginTS: PropTypes.string,
    // nerdlet_endTS: PropTypes.string,
    // nerdlet_duration: PropTypes.string,
    entities_data: PropTypes.object,
    entities_fetchmoar: PropTypes.object,
    launcherUrlState: PropTypes.object,
    nerdletUrlState: PropTypes.object
  }; // propTypes

  constructor(props) {
    super(props);

    this.state = {
      org_slos: null,
      render_org: null
    }; // state

    this.sloSelectorCallback = this._sloSelectorCallback.bind(this);
  } // constructor

  _sloSelectorCallback(_org) {

    console.debug("the big event", _org);
    this.setState({ render_org: _org });
  }//_sloSelectorCallback
  

  _orgAddOrAppend(_orgSLOs, _candidateSLO) {
//    console.debug('the passed _orgSLOs', _orgSLOs);
//    console.debug('the passed candidate SLO', _candidateSLO);
//    console.debug('the passed candidate SLO TEAM', _candidateSLO.document.team);

    const __SLOsForCandidate = _orgSLOs.filter(function(value) {
      //return value.orgName === _candidateSLO.document.organization;
      return value.orgName === _candidateSLO.document.organization;  
    });

    console.debug('candidate slos', __SLOsForCandidate);
    if (__SLOsForCandidate.length === 1) {
      __SLOsForCandidate[0].slos.push(_candidateSLO.document);
//
//      console.debug('adding a new slo/org', _orgSLOs);
    } // if
    else if (__SLOsForCandidate.length === 0) {
      _orgSLOs.push({
        orgName: _candidateSLO.document.organization,
        slos: [_candidateSLO.document]
      });

//      console.debug('adding a new slo/org', _orgSLOs);
    } // else
    else {
      console.log(`candidate length is weird: ${__SLOsForCandidate.length}`);
    } // else

    return _orgSLOs;
  } // _orgAddOrAppend

  async _lookupSLOs(_entity_guid) {
    let __slo_document = null;

    if (_entity_guid !== null || _entity_guid !== undefined) {
      const _query = {
        actionType: EntityStorageQuery.FETCH_POLICY_TYPE.NO_CACHE,
        entityGuid: _entity_guid,
        collection: 'nr1-csg-slo-r'
      }; // _query

      const __result = await EntityStorageQuery.query(_query);

      if (__result !== null) {
        __slo_document = __result.data;
      } // if
    } // if

   // console.debug('candidate slo', __slo_document);
    return __slo_document;
  } // _lookupSLOs

  async assembleOrgSLOs() {
    var __orgSLOs = [];
    var __candidateSLOs = null;

    if (this.props.entities_data.entities !== null) {
      for (let i = 0; i < this.props.entities_data.entities.length; i++) {
        __candidateSLOs = await this._lookupSLOs(this.props.entities_data.entities[i].guid);

        if (__candidateSLOs !== null) {
          //   console.debug('candidate SLOs', __candidateSLOs);
   
          __candidateSLOs.map(_candidateSLO => {
            __orgSLOs = this._orgAddOrAppend(__orgSLOs, _candidateSLO);
          });
        } // if
      }

      console.debug("The SLO assembly looks like what? ", __orgSLOs);
      // set the entity details state
      this.setState({ org_slos: __orgSLOs });
    } // if
    else {
      // provide some error message ...
      //do we really need this the rendering aspect of the component should just handle the fact there are no orgs defined therefore no slo docs .. 
      this.setState({ org_slos: "NONE" });
    } // else
  } // assembleOrgSLOs

  componentDidMount() {
    this.assembleOrgSLOs();
  } // componentDidMount

  shouldComponentUpdate(nextProps, nextState) {

    if (this.state.org_slos === null){
      return true;
    }//if

    if (this.state.org_slos != nextState.org_slos) {
      return true;
    }

    if (this.state.render_org != nextState.render_org) {
      return true;
    } //if
    
    console.debug("returning false");
    console.debug("current state", this.state);
    console.debug("next state", nextState)

    return false;

  } //shouldComponentUpdate

  render() {
    // console.debug('entities', this.props.entities_data);
    // console.debug('moar', this.props.entities_fetchmoar);

    if (this.state.org_slos === null) {
      return (
        <div>
          <Spinner />
        </div>
      );
    } // if
    else {
      if (this.state.org_slos.length < 1) {
        return (
          <div>
            <Grid>
              <GridItem columnSpan={10}>
                <BlockText>
                  Unable to find any SLOs defined. Use the Entity Explorer to
                  find a Service and define an SLO.
                </BlockText>
              </GridItem>
            </Grid>
          </div>
        );
      } // if
      else {
        return (
          <div>
            <Grid>
              <GridItem columnSpan={10}>
                <OrgSelector
                  orgs={this.state.org_slos}
                  onChange={this.sloSelectorCallback}
                />
              </GridItem>
            </Grid>
            <Grid>
              <GridItem columnSpan={10}>
                {this.state.render_org && (
                <PlatformStateContext.Consumer>
                  {launcherUrlState => (
                    <OrgDisplayer
                      org={this.state.render_org}
                      timeRange={launcherUrlState.timeRange}
                    />
                  )}
                </PlatformStateContext.Consumer>
                )}                
              </GridItem>
            </Grid>
          </div>
        );
      } // else
    } // else
  } // render
} // SLOREstate


