/**
 * Provides the component that displays the available SLO orgs to display.
 *
 * @file
 * @author Gil Rice
 */
/** core */
import React from 'react';
import PropTypes from 'prop-types';
/** nr1 */
import { BlockText, Dropdown, DropdownItem } from 'nr1';
/** local */
/** 3rd party */

/**
 * OrgSelector
 */
export default class OrgSelector extends React.Component {
  static propTypes = {
    orgs: PropTypes.array,
    onChange: PropTypes.func
  }; // propTypes

  constructor(props) {
    super(props);

    this.state = {}; // state
  } // constructor

  render() {

    return (
      <div>
        <Dropdown
          label="Organization"
          title="Select an SLO Organization to display"
          items={this.props.orgs}
        >
          {({ item, index }) => (
            <DropdownItem key={index} onClick={() => this.props.onChange(item)}>
              {item.orgName}
            </DropdownItem>
          )}
        </Dropdown>
      </div>
    );
  }
} // OrgSelector
