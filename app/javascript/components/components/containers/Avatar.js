import React from 'react';
import PropTypes from 'prop-types';
import { AVATAR_DISPLAY_LOCATIONS, STATES } from '../../constants/appConstants';
import 'font-awesome/css/font-awesome.min.css';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import Ghost from '../Ghost';
import { tooltipMe } from '../../utils/utils';
let i = 0;
/**
 * This component renders the avatar.
 * The avatar is displayed in multiple locations (the toolbar, the side panel and in the rooms).
 * Based on where it is displayed it looks a bit different.
 * The emotion is only displayed in the toolbar and the side panel.
 * State icons are displayed in all views except the condensed room view.
 * Names are only displayed in the ROOM displayLocation.
 */
export class Avatar extends React.Component {
  constructor(props) {
    super(props);
    this.ghostDimensions = {};
    this.ghostDimensions[AVATAR_DISPLAY_LOCATIONS.ROOM] = 38;
    this.ghostDimensions[AVATAR_DISPLAY_LOCATIONS.SIDE_PANEL] = 20;
    this.ghostDimensions[AVATAR_DISPLAY_LOCATIONS.HEADER] = 30; // in theory this should not be needed as a ghost is defined as a person not logged in to Qube
  }

  renderName = () => {
    if (this.props.firstName && this.props.displayLocation === AVATAR_DISPLAY_LOCATIONS.ROOM) {
      const charCount = isNaN(_.size(this.props.firstName)) ? 11 : 8;
      return (<span className="userName noselect">{_.truncate(this.props.firstName, { length: charCount })}</span>);
    } else {
      return null;
    }
  };

  renderStatusIcon = () => {
    if (this.props.displayLocation === AVATAR_DISPLAY_LOCATIONS.ROOM) {
      if (this.props.isGuest) {
        return <div className={`status guestUserSmall`}></div>;
      }

      return <div className={`status ${getStatusIndicatorClass(this.props.state)}_fill statusSmall`}></div>;
    } else if (this.props.displayLocation === AVATAR_DISPLAY_LOCATIONS.SIDE_PANEL || this.props.displayLocation === AVATAR_DISPLAY_LOCATIONS.HEADER) {
      if (this.props.isGuest) {
        return <div className={`status guestUser`}></div>;
      }
      return <div className={`status ${getStatusIndicatorClass(this.props.state)}`}></div>;
    }
  };

  renderCondensed = (divStyle) => {
    return <div className={`avatarWrapperRoomCondensed flexRowContainer flexAlignCenter mr5 mt0`}>
        <div className="avatarBackdropCondensed" id={`avatar-spot-${this.props.id}`}></div>
          {tooltipMe(this.props.firstName+ ' '+ this.props.lastName, `avatar${this.props.firstName}`, <div className={`avatarRoomCondensed`} style={divStyle} id={`avatar-icon-${this.props.id}`}/>)}
          </div>;
  };

  renderGhost = (displayColor) => {
    const size =  this.ghostDimensions[this.props.displayLocation];
    return <div className={`avatarWrapper${this.props.displayLocation} flexRowContainer flexAlignCenter mr10 mt0`}>
      <div className="avatarBackdrop" id={`avatar-spot-${this.props.id}`}></div>
      <div className={`ghost${this.props.displayLocation}`} id={`avatar-icon-${this.props.id}`}>
       <Ghost width={size} height={size} fillColor={displayColor}/>
      </div>
      {this.renderName()}
    </div>;
  };

  render() {
    const displayEmotion = this.props.displayLocation !== AVATAR_DISPLAY_LOCATIONS.ROOM  &&
      this.props.displayLocation !== AVATAR_DISPLAY_LOCATIONS.ROOM_CONDENSED && 'NONE' !== this.props.emotion;
    const displayColor = _.startsWith('#', this.props.color) ? this.props.color : '#' + this.props.color;
    const divStyle = this.props.emotion && displayEmotion ? {} : { background: displayColor || '#ccc' };
    const emotionStyle = (displayEmotion && this.props.emotion) ? { color:  displayColor, lineHeight: '32px' } : { display: 'none' };

    if (this.props.displayLocation === AVATAR_DISPLAY_LOCATIONS.ROOM_CONDENSED) {
      return this.renderCondensed(divStyle);
    }

    if (this.props.isGhost) {
      return this.renderGhost(displayColor);
    }

    return (
    <div className={`avatarWrapper${this.props.displayLocation} flexRowContainer flexAlignCenter mr10 mt0`}>
        {this.props.id  &&  <div className="avatarBackdrop" id={`avatar-spot-${this.props.id}`}></div>}
        <div className={`avatar${this.props.displayLocation}`} id={`avatar-icon-${this.props.id}`}>
          <div style={emotionStyle}>
           <span className={`flaticon fi ${this.props.emotion}`}></span>
          </div>
          { displayColor && (<div className={`avatarNoIconWrapper${this.props.displayLocation}`}><div className={`avatar${this.props.displayLocation}`} style={divStyle}/> </div>) }
          {this.renderStatusIcon()}
        </div>
        {this.renderName()}
      </div>
    );
  }
}

Avatar.propTypes = {
  color: PropTypes.string,
  state: PropTypes.string,
  name: PropTypes.string,
  displayLocation: PropTypes.string,
  id: PropTypes.any,
  isGhost: PropTypes.bool,
  isGuest: PropTypes.bool
};

function getStatusIndicatorClass(state) {
  switch (state) {
    case STATES.AWAY:
      return 'away';
    case STATES.BUSY:
      return 'busy';
    case STATES.RIGHT_BACK:
      return 'rightBack';
    case STATES.SOCIAL:
      return 'social';
    default:
      return '';
  }
}

export default Avatar;
