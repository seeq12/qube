import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import $ from 'jquery';
import { formatTime, getUserName, knockOrGo, tooltipMe } from '../../utils/utils';
import {
  slackUser,
  inviteUser,
  watchUser,
  unwatchUser,
  sendUserHome,
  callUser
} from '../../utils/api.utils';
import { AVATAR_DISPLAY_LOCATIONS, STATES } from '../../constants/appConstants';
import Avatar from './Avatar';
import 'moment-timezone';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../../actions/loadActions';

export class SidePanelUserEntry extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      returnToFloor: null
    };
    this.bounceTimeout = null;
  }

  bbTime = () => {
    return _.get(this.props.user, 'back_by') ? (
      <span className="allUserStatus">BB {formatTime(this.props.user.back_by, this.props.currentUser.timezone)}
      </span>
    ) : '';
  };

  doSendUserHome = () => {
    sendUserHome(this.props.user.id);
  };

  renderSendHome = () => {
    return <div className="pr10"><i className="fa icon fa-home cursorPointer" onClick={this.doSendUserHome}></i></div>;
  };

  showWatchIcon = () => {
    const occupants = _.filter(this.props.userList, { current_room_id: this.props.user.home_id });
    const isCurrentUser = this.props.user.id === this.props.currentUser.id;
    const userAtHomeAndWatchWorthy = this.props.user.current_room_id === _.get(this.props.user, 'home_id') && (_.size(occupants) > 1 || !_.includes([STATES.AVAILABLE, STATES.SOCIAL], this.props.user.state));
    const offlineUser = !_.get(this.props.user, 'present');
    const notInSameRoom = this.props.currentUser.current_room_id !== this.props.user.current_room_id;
    const notAtHome = this.props.user.current_room_id !== this.props.user.home_id;
    return (this.watchActive() || (userAtHomeAndWatchWorthy && notInSameRoom) || offlineUser || (notAtHome && notInSameRoom)) && !this.props.user.is_guest && !isCurrentUser;
  };

  watchActive = () => {
    return _.indexOf(_.get(this.props.currentUser, 'watching_ids'), _.get(this.props.user, 'id')) > -1;
  };

  renderWatchIcon = () => {
    return this.watchActive() ?
      (<div className="pr10" onClick={this.doWatchUser}>
        {tooltipMe('Stop watching', `stop_watching_${this.props.user.id}`, <i
          className="fa fa-eye icon cursorPointer watchActive"></i>)}
      </div>) : (<div className="pr10" onClick={this.doWatchUser}>
        {tooltipMe('Start watching', `start_watching_${this.props.user.id}`, <i
          className="fa fa-eye icon cursorPointer"></i>)}
      </div>);
  };

  doCallUser = () => {
    callUser(this.props.user.id);
  };

  renderCallIcon = () => {
    return <div className="pr10" onClick={this.doCallUser}>
      {tooltipMe('Call on Phone', `call_${this.props.user.id}`, <i className="fa fa-phone icon cursorPointer"></i>)}
    </div>;
  };

  renderInviteIcon = () => {
    return <div className="pr10" onClick={this.doInviteUser}>
      {tooltipMe('Invite', `invite_${this.props.user.id}`, <i className="fa fa-user-plus icon cursorPointer"></i>)}
    </div>;
  };

  renderSlackIcon = () => {
    const slackURl = `slack://channel?team=${slack_team_url}&id=${this.props.user.slackDMToken}`;
    return <div className="pr10">
      <a href={slackURl} onClick={this.doSlackUser}>
        {tooltipMe('Slack', `slack${this.props.user.id}`, <i className="fa fa-slack icon cursorPointer" aria-hidden="true"></i>)}
      </a>
    </div>;
  };

  doSlackUser = () => {
    slackUser(this.props.user.id);
  };

  doInviteUser = () => {
    inviteUser(this.props.user.id);
  };

  doWatchUser = () => {
    this.watchActive() ? unwatchUser(this.props.user.id) : watchUser(this.props.user.id);
  };

  doKnock() {
    knockOrGo(this.props.user.current_room_id,  this.props.currentUser.current_room_id,  this.props.currentUser.home_id, this.props.rooms);
  }

  doSpotlightUser = () => {
    // check that the user is on the current Floor:
    const user = this.props.user;
    if (!_.get(this.props.user, 'present')) {
      return;
    }

    const returnToFloor = this.props.currentFloorId;
    const floor = _.get(_.find(this.props.rooms, { id: user.current_room_id }), 'floor_id');
    const validFloor = _.find(this.props.floors, { id: floor });
    if (this.bounceTimeout) {
      clearTimeout(this.bounceTimeout);
    }

    this.bounceTimeout = setTimeout(() => {
      $('#floorSpot').fadeIn('slow');

      this.doBounce = true;
      const userId = this.props.user.id;
      if (floor !== this.props.currentFloorId && validFloor) {
        this.setState({ returnToFloor });
        // go to the floor the person is on
        this.props.actions.setCurrentFloorId(floor);
      }

      $('#avatar-spot-' + userId).hide();
      $('#avatar-spot-' + userId).addClass('spotlight');
      $('#avatar-spot-' + userId).fadeIn('slow', () => {
        var i;
        var times = 4;
        var distance = 10;
        var speed = 300;
        for (i = 0; i < times; i++) {
          if (this.doBounce) {
            $('#avatar-icon-' + userId).animate({ marginTop: '-=' + distance }, speed)
              .animate({ marginTop: '+=' + distance }, speed);
          } else {
            break;
          }
        }
      }).show();
    }, 1000);
  };

  undoSpotlightUser = () => {
    const currentUserRoom =  _.find(this.props.rooms, { id: this.props.currentUser.current_room_id });

    const floor = _.get(_.find(this.props.rooms, { id: this.props.currentUser.current_room_id }), 'floor_id');
    const validFloor = _.find(this.props.floors, { id: floor });

    if (this.bounceTimeout) {
      clearTimeout(this.bounceTimeout);
    }

    const userId = this.props.user.id;
    this.doBounce = false;
    $('#avatar-spot-' + userId).fadeOut('slow', function() {
      $('#avatar-spot-' + userId).removeClass('spotlight');
    });

    $('#floorSpot').fadeOut('fast');
    if (validFloor && this.props.currentFloorId !== currentUserRoom.floor_id) {
      this.props.actions.setCurrentFloorId(floor);
    }
  };

  render() {
    const user = this.props.user;
    const isCurrentUser = _.get(user, 'id') === _.get(this.props.currentUser, 'id');
    const userName = isCurrentUser ?  _.get(user, 'first_name') : getUserName(user, this.props.selfRegistration);

    return (
      <div className="flexColumnContainer mb1">
        <Avatar color={user.present ? user.color : '708090'}
                firstName={user.first_name}
                lastName={user.last_name}
                isGhost={user.isGhost}
                isGuest={ user.is_guest}
                emotion={user.emotion}
                state={user.state}
                displayLocation={AVATAR_DISPLAY_LOCATIONS.SIDE_PANEL}/>
        <div className="flexRowContainer flexFill cursorPointer" onMouseEnter={this.doSpotlightUser.bind(this)}
             onMouseLeave={this.undoSpotlightUser.bind(this)} onDoubleClick={this.doKnock.bind(this)}>
          <span className="cursorPointer pt5">{_.truncate(userName, { length: 50 })}</span>
          <span className="allUserStatus">{user.status}</span>
          {this.bbTime()}
        </div>
        {this.props.showSendHome && this.renderSendHome()}
        {this.showWatchIcon() && this.renderWatchIcon()}
        {this.props.showInvite && this.renderInviteIcon()}
        {this.props.showCall && this.renderCallIcon()}
        {this.props.showSlack && this.renderSlackIcon()}
      </div>
    );
  }
}

SidePanelUserEntry.defaultProps = {
  user: {},
  currentUser: {},
  userList: [],
  showInvite: false,
  showSendHome: false,
  showCall: false,
  showSlack: true
};

SidePanelUserEntry.propTypes = {
  user: PropTypes.object,
  userList: PropTypes.array,
  showInvite: PropTypes.bool
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

const mapStateToProps = (...args) => {
  return {
    rooms: args[0].rooms,
    currentFloorId: args[0].currentFloorId,
    floors: args[0].floors,
    selfRegistration: args[0].selfRegistration
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SidePanelUserEntry);

