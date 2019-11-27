/* eslint-disable react/no-did-update-set-state */
import React from 'react';
import PropTypes from 'prop-types';

import { Modal } from 'nr1';

export default class ModalWrapper extends React.Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ]).isRequired,
    modalIsActive: PropTypes.bool,
    modalToggleCallback: PropTypes.func.isRequired
  };

  static defaultProps = {
    modalIsActive: true
  };

  constructor(props) {
    super(props);

    this.state = {
      modalIsActive: props.modalIsActive || false
    };
  }

  async componentDidMount() {
    //
  }

  /*
   * Map changes from this.props.modalIsActive to this.state.modalIsActive
   * This ensures the parent component can control the visibility in addition to the nr1 Modal component's onClose
   */
  async componentDidUpdate(prevProps) {
    if (prevProps.modalIsActive !== this.props.modalIsActive) {
      this.setState({ modalIsActive: this.props.modalIsActive });
    }
  }

  render() {
    return (
      <Modal
        hidden={!this.state.modalIsActive}
        onClose={() => this.props.modalToggleCallback()}
      >
        {this.props.children}
      </Modal>
    );
  }
}
