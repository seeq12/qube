import React from 'react';
import { Modal } from 'react-bootstrap';

const NoNotificationsModal = () => {
  return <Modal show={true}>
    <div className="flexRowContainer flexAlignCenter pt25 pb15 flexCenter pr20 pl20">
      <div className="sadTurtle"></div>
      <div className="flexRowContainer flexCenter text-center pb15">
        <h3>Oh no! qube can't run without notifications.</h3>
        <p>Choose a supported browser (Chrome or Firefox) and enable notifications.</p>
      </div>
    </div>
  </Modal>;
};

export default NoNotificationsModal;