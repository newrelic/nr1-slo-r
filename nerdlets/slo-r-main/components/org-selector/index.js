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
    selectedOrg: PropTypes.string,
    showLabel: PropTypes.bool,
    title: PropTypes.string
  }; // propTypes

  static defaultProps = {
    showLabel: true,
    title: 'Select an SLO Organization to display'
  };

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
    const { orgs, showLabel, selectedOrg, title } = this.props;

    return (
      <div>
        <Dropdown
          label={showLabel ? 'Organization' : ''}
          title={selectedOrg || title}
          items={orgs}
        >
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
