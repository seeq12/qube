import React from 'react';
import { Modal } from 'react-bootstrap';

const AdminOnlyModal = () => {
  return <Modal show={true}>
      <div className="flexRowContainer flexAlignCenter pt25 pb15 flexCenter pr20 pl20">
        <div className="sadTurtle"></div>
        <div className="flexRowContainer flexCenter text-center pb15">
          <h3>Even the things we love break sometimes.</h3>
          <p>Qube isn't fully functioning yet. But don't worry, Nikhila's on it!</p>
        </div>
      </div>
    </Modal>;
};

export default AdminOnlyModal;
