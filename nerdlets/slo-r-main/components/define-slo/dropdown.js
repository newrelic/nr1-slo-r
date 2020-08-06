import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown as NR1Dropdown, DropdownItem } from 'nr1';

export default class Dropdown extends Component {
  handleOnClick = value => {
    const { onChange } = this.props;
    onChange(value);
  };

  dropdownTitleLookup(value, options) {
    const index = options.findIndex(option => option.value === value);
    if (index >= 0) {
      return options[index].label;
    }

    return null;
  }

  render() {
    const { value, items, label } = this.props;

    return (
      <NR1Dropdown
        label={label}
        title={this.dropdownTitleLookup(value, items) || 'Choose an Indicator'}
        className="define-slo-input"
      >
        {items?.map(({ label, value }, index) => (
          <DropdownItem
            key={index}
            onClick={() => {
              this.handleOnClick(value);
            }}
          >
            {label}
          </DropdownItem>
        ))}
      </NR1Dropdown>
    );
  }
}
Dropdown.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
  label: PropTypes.string,
  items: PropTypes.array.isRequired
};
