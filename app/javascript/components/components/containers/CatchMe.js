import React from 'react';
import { fetchHighscore, updateHighscore } from '../../utils/api.utils';
import { connect } from 'react-redux';
import {getUserName} from "../../utils/utils";

let circleId = 1;
let clickCount = 0;

export class CatchMe extends React.Component {

  constructor(props) {
    super(props);
    this.timer = 0;
    this.state = { playing: false, seconds: 10 };
  }

  getClickHandler = (idx) => {
    return ()=> {
      if (this.state.gameOver) {
        return;
      }

      clickCount++;

      if (!this.state.playing && clickCount >= 1) {
        this.startTimer();
        this.setState({ playing: true });
      }

      jQuery(`#circle_${idx}`).remove();
    };
  };

  removeClickHandler = (idx) => {
    return ()=> {
      jQuery(`#circle_${idx}`).remove();
    };
  };

  addCircle= ()=> {
    const size = Math.random() * 170 + 20;
    const x = Math.random() *  window.innerWidth + 7;
    const y = Math.random() *  window.innerHeight + 7;
    circleId++;

    const circleHtml = `<div id="circle_${circleId}" class="circle" style="opacity: 0; top: ${y}px; left: ${x}px; width: ${size}px; height:${size}px">`;
    jQuery(circleHtml).appendTo('#playground').animate({
        opacity: 1,
        height: size,
        width: size
      }, 1000).animate({
      opacity: 0,
      height: 1,
      width: 1
    }, 2000, this.removeClickHandler(circleId));

    jQuery(`#circle_${circleId}`).click(this.getClickHandler(circleId));
  };

  startTimer= () => {
    if (this.timer == 0) {
      this.timer = setInterval(this.countDown, 1000);
    }
  };

  countDown= () => {
    let seconds = this.state.seconds - 1;
    this.setState({
      seconds: seconds
    });

    if (seconds == 0) {
      clearInterval(this.timer);
    }
  };

  componentDidMount() {
    this.scheduleCircle();
  }

  scheduleCircle=() => {
    this.addCircle();
    if (this.state.seconds > 0 || (!this.state.playing && !this.state.gameOver)) {
      setTimeout(this.scheduleCircle, Math.random() * 300 + 100);
    } else {
      this.setState({ gameOver: true, playing: false });
      // send the highscore
      updateHighscore(this.props.currentUserId, clickCount);
      // display the highscore + enter button
      fetchHighscore().then((scores) =>
        this.setState({ highScore: scores.data }
        ));
    }
  };

  renderHighScore = () => {
    return <div className="flexRowContainer width-300">
      <div className="flexRowContainer pt10 pb15 pl10 pr10">
      <h2>Your Score: {clickCount}</h2>
      { _.map(this.state.highScore, (score) => {
        return <div className="flexColumnContainer width-275 flexCenter" key={`${score.score}_${score.name}`}>
          <div className="flexFill textLeft">{getUserName(score, this.props.selfRegistration)}</div><div className="textRight">{score.score}</div></div>; })
      }
      </div>
      <div className="pt15">
        <button type="button" onClick={this.selfDestruct}  className="btn btn-primary mr10 customBtn">Off to work</button>
      </div>
    </div>;
  };

  renderCountdown = () => {
    return <div className="flexCenter"><span className="largeFont">{this.state.seconds}</span></div>;
  };

  selfDestruct = () => {
    jQuery('#playground').animate({
      opacity: 0 }, 1600).remove();
  };

  overallClick = (evt) => {
    if (!this.state.playing && !this.state.gameOver) {
      this.selfDestruct();
    } else {
      evt.preventDefault();
    }
  };

  renderPrompt= () => {
    return (<div className="flexRowContainer flexCenter">
      <div className="rightSidePanelBottomCorner turtle"></div>
      <div className="pl10 pr10 mt10"><h2>Click to enter</h2></div>
    </div>);
  };

  render() {
    return (
      <div id="playground" className="height-maximum width-maximum flexRowContainer flexCenter playground" onClick={ evt => this.overallClick(evt) }>
        <div className="flexRowContainer flexCenter office min-width-300 min-height-300">
        {!this.state.playing && !this.state.gameOver && this.renderPrompt()}
        { this.state.playing && this.renderCountdown() }
        { this.state.gameOver && this.renderHighScore() }
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {};
};

const mapStateToProps = (...args) => {
  return {
    currentUserId: args[0].currentUserId,
    selfRegistration: args[0].selfRegistration
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CatchMe);

