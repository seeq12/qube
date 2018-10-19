import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import { setTimezone } from '../../utils/api.utils';

export class TimezoneModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShownModal: true
    };
  }

  closeModal = () => {
    this.setState({ isShownModal: false });
  };

  changeTimezone = () => {
    setTimezone(this.props.browserTimezone, this.props.userId);
    this.closeModal();
  };

  render() {
    return <Modal show={this.state.isShownModal} onHide={this.closeModal}>
      <div className="timezoneModal flexRowContainer flexAlignCenter pt25 pb15 flexCenter pr20 pl20">
        <div onClick={this.closeModal}><i className="fa fa-close modalCloseBtn"></i></div>
        <div className="sadTurtle"></div>

        <div className="flexRowContainer flexCenter text-center pb15">
          <h4>Your timezone setting in Qube does not match your browser timezone!</h4>
          <span>Looks like your browser is using {this.props.browserTimezone} and Qube is set to use {this.props.qubeTimezone}</span>
        </div>
        <div className="flexColumnContainer">
            <button className="btn btn-primary customBtn mr10" onClick={this.closeModal}>That's ok.</button>
            <button className="btn btn-primary customBtn" onClick={this.changeTimezone}>Change it to match!</button>
        </div>
      </div>
    </Modal>;
  }
}

TimezoneModal.propTypes = {
  userId: PropTypes.any,
  qubeTimezone: PropTypes.string,
  browserTimezone: PropTypes.string
};

export default TimezoneModal;
