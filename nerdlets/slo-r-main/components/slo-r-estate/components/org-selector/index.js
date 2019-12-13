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
import { Dropdown, DropdownItem } from 'nr1';

/** local */

/** 3rd party */

/**
 * OrgSelector
 */
export default class OrgSelector extends React.Component {
  static propTypes = {
    orgs: PropTypes.array,
    onChange: PropTypes.func,
    selectedOrg: PropTypes.string
  }; // propTypes

  constructor(props) {
    super(props);

    this.state = {
      // state
    };
  } // constructor

  shouldComponentUpdate(nextProps) {
    if (nextProps.orgs !== this.props.orgs) {
      return true;
    }

    if (nextProps.selectedOrg !== this.props.selectedOrg) {
      return true;
    }

    return false;
  }

  render() {
    const { orgs, selectedOrg } = this.props;
    const title = selectedOrg || 'Select an SLO Organization to display';

    return (
      <div>
        <Dropdown label="Organization" title={title} items={orgs}>
          {({ item, index }) => (
            <DropdownItem key={index} onClick={() => this.props.onChange(item)}>
              {item}
            </DropdownItem>
          )}
        </Dropdown>
      </div>
    );
  }
} // OrgSelector
