import React from 'react';
import { Modal } from 'react-bootstrap';

export class SlackModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShownModal: true
    };
  }

  closeModal = () => {
    this.setState({ isShownModal: false });
  };

  render() {
    return <Modal show={this.state.isShownModal} onHide={this.closeModal}>
      <div className="timezoneModal flexRowContainer flexAlignCenter pt25 pb15 flexCenter pr20 pl20">
        <div onClick={this.closeModal}><i className="fa fa-close modalCloseBtn"></i></div>
        <div className="sadTurtle"></div>
        <div className="flexRowContainer flexCenter text-center pb15">
          <h3 className="pb15">Qube works so much better with Slack.</h3>
          <div className="flexColumnContainer">
            <a href="slack://open" onClick={this.closeModal}>
              <button className="btn btn-primary customBtn mr10">Open Slack</button>
            </a>
            <button className="btn btn-danger" onClick={this.closeModal}>No, I am a rebel.</button>
          </div>
      </div>
      </div>
    </Modal>;
  }
}

export default SlackModal;
