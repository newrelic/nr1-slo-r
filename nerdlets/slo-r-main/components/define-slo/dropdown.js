import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown as NR1Dropdown, DropdownItem } from 'nr1';

export default class Dropdown extends Component {

  constructor(props) {
    super(props);

    this.searchEnabled = !!this.props.search;

    this.state = {
      search: this.getSearchText(this.props.value),
      items: props.items,
    }
  }

  getSearchText(value) {
    const selectedItem = this.props.items.find(item => item.value === value);
    return this.searchEnabled ? (selectedItem ? selectedItem.label : this.props.search) : null;
  }

  handleOnSearch(text) {
    let search = text;
    let items;

    if(search) {
      search = search.toLowerCase();
      items = this.props.items.filter((item) => item.label.toLowerCase().includes(search));
    } else {
      items = this.props.items;
    }

    this.setState({
      search: search,
      items: items
    });
  }

  handleOnClick = value => {
    const { onChange } = this.props;
    onChange(value);

    if(this.searchEnabled) {
      this.setState({search: this.getSearchText(value)});
    }
  };

  handleOnOpen(e) {
    if(this.searchEnabled) {
      this.handleOnSearch(this.state.search);
    }
  }

  dropdownTitleLookup(value, options) {
    const index = options.findIndex(option => option.value === value);
    if (index >= 0) {
      return options[index].label;
    }

    return null;
  }

  render() {
    const { value, label, disabled } = this.props;
    const { items, search } = this.state;

    return (
      <NR1Dropdown
        label={label}
        disabled={disabled}
        title={this.dropdownTitleLookup(value, items)}
        className="define-slo-input"
        search={search}
        onSearch={(e) => {
          this.handleOnSearch(e.target.value);
        }}
        onOpen={(e) => {
          this.handleOnOpen(e);
        }}
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
  search: PropTypes.string,
  items: PropTypes.array.isRequired,
  disabled: PropTypes.bool
};
