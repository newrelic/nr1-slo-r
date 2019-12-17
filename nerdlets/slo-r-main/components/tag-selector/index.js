/**
 * Provides the component that displays the available SLO options to display.
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
 * TagSelector
 */
export default class OptionsSelector extends React.Component {
  static propTypes = {
    options: PropTypes.array,
    onChange: PropTypes.func,
    selectedTag: PropTypes.string,
    showLabel: PropTypes.bool,
    title: PropTypes.string
  }; // propTypes

  static defaultProps = {
    showLabel: true,
    title: 'Select an SLO Group to display'
  };

  constructor(props) {
    super(props);

    this.state = {
      // state
    };
  } // constructor

  shouldComponentUpdate(nextProps) {
    if (nextProps.options !== this.props.options) {
      return true;
    }

    if (nextProps.selectedTag !== this.props.selectedTag) {
      return true;
    }

    return false;
  }

  render() {
    const { options, showLabel, selectedTag, title } = this.props;

    return (
      <div>
        <Dropdown
          label={showLabel ? 'SLO Group' : ''}
          title={selectedTag || title}
          items={options}
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
}
