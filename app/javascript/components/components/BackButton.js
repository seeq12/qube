import React from 'react';


const BackButton = ({userIsBack}) => {

  return (
    <div className="backButtonDiv flexRowContainer height-maximum flexCenter flexAlignCenter">
      <button className="btn btn-primary btn-lg backButton customBtn" onClick={userIsBack}>I'm back.</button>
    </div>
  );
};

export default BackButton;