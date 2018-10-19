import React from 'react';
import { Modal } from 'react-bootstrap';

const NoMobile = () => {
  return <Modal show={true}>
    <div className="flexRowContainer flexAlignCenter pt25 pb15 flexCenter pr20 pl20">
      <div className="sadTurtle"></div>
      <div className="flexRowContainer flexCenter text-center pb15">
        <h3>Sorry - Qube is not supported on mobile devices.</h3>
        <p>Use Slack to update your status! Type &quot;/qube away&quot;</p>
      </div>
    </div>
  </Modal>;
};

export default NoMobile;