import React from 'react';
import PropTypes from 'prop-types';

import { Button } from 'nr1';

export default class SettingsMenu extends React.Component {
  static propTypes = {
    children: PropTypes.node
  };

  constructor(props) {
    super(props);

    this.state = {
      settingsPopoverActive: false
    };
  }

  handleSettingsPopover = e => {
    this.setState(prevState => ({
      settingsPopoverActive: !prevState.settingsPopoverActive
    }));
    e.stopPropagation();
  };

  render() {
    return (
      <div
        className={`service-settings-button-container ${
          this.state.settingsPopoverActive
            ? 'settings-popover-active'
            : 'settings-popover-inactive'
        }`}
      >
        <Button
          sizeType={Button.SIZE_TYPE.SMALL}
          className="service-settings-button"
          type={Button.TYPE.NORMAL}
          iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__MORE}
          onClick={this.handleSettingsPopover}
        />
        <ul className="service-settings-dropdown">{this.props.children}</ul>
      </div>
    );
  }
}
