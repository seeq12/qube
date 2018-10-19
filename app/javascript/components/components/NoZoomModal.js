import React from 'react';
import { Modal } from 'react-bootstrap';

const NoZoomModal = () => {
  return <Modal show={true}>
      <div className="flexRowContainer flexAlignCenter pt25 pb15 flexCenter pr20 pl20">
        <div className="sadTurtle"></div>
        <div className="flexRowContainer flexCenter text-center pb15">
          <p>You're not ready to enter the office yet!<br/>
            You may not have a Zoom account or Qube invitation - please contact your Qube Administrator to set you up.
           </p>
        </div>
      </div>
    </Modal>;
};

export default NoZoomModal;
