import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../../actions/loadActions';
import { updateUserProperty, addUser, removeGuestUser, removeUser } from '../../actions/userListActions';
import { updateRoomProperty } from '../../actions/roomListActions';
import Toolbar from './Toolbar';
import Floorplan from './Floorplan';
import SidePanel from './SidePanel';
import { NotificationContainer } from 'react-notifications';
import { checkForSlack, fetchSlackURLS, setUserAvailable, setUserPresent, signOut } from '../../utils/api.utils';
import { clearMeeting, joinMeeting, startMeeting, getRoom, getUsersInRoom, getUserName } from '../../utils/utils';
import TimezoneModal from './TimezoneModal';
import SlackModal from './SlackModal';
import AdminOnlyModal from '../AdminOnlyModal';
import BackButton from '../BackButton';
import NoNotificationsModal from '../NoNotificationsModal';
import WeatherThemeSupport from '../WeatherThemeSupport';
import { STATES, WEATHER_THEME } from '../../constants/appConstants';
import ActionCable from 'actioncable';
import { addCss, replayCondition } from '../../utils/theme.utils';
import CatchMe from './CatchMe';
import AdminTool from './AdminTool';
import { loadThemes } from '../../actions/loadActions';
import { setAdminOnlyMode } from '../../actions/adminToolActions';
import _ from "lodash";

export class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialLoad: true,
      timeZoneWarningCount: 0,
      slackWarningCount: 0,
      displayBackButton: 0,
      backButtonTimeout: null,
      pushNotificationsEnabled: true,
      lastWeatherUpdate: moment(),
      adminToolDisplayed: -1
    };

    window.addEventListener('beforeunload', this.killServiceWorker);
    window.addEventListener('keydown', this.previewFloor.bind(this));
    window.addEventListener('keyup', this.undoPreview.bind(this));
  }

  previewFloor(event) {

    if (event.keyCode === 27) {
      this.props.actions.setSidePanelSearchTerm('');
      event.preventDefault();
    }

    if (event.altKey) {
      if (event.keyCode === 83) {
        // this is not reactIsh at all:
        $('#sidePanelSearch').focus();
        event.preventDefault();
      }

      if (event.keyCode === 39) {
        this.props.actions.setBackupFloorId(this.props.currentFloorId);
        return;
      }

      if (event.keyCode === 38 || event.keyCode === 40) {
        const sortedFloors = _.sortBy(this.props.floors, 'level');
        let nextFloor = sortedFloors[0];
        const currentIdx = _.findIndex(sortedFloors, { id: this.props.currentFloorId });

        if (event.keyCode === 38) {
          if (currentIdx > -1 && currentIdx < _.size(sortedFloors) - 1) {
            nextFloor = sortedFloors[currentIdx + 1];
          }
        }

        if (event.keyCode === 40) {
          if (currentIdx > 0) {
            nextFloor = sortedFloors[currentIdx - 1];
          } else {
            nextFloor = _.last(sortedFloors);
          }
        }

        this.props.actions.setCurrentFloorId(_.get(nextFloor, 'id'));
      }
    }
  }

  undoPreview(event) {
    if (event.key === 'Alt') {
      this.props.actions.setCurrentFloorId(this.props.backUpFloorId);
    }
  }

  // Manage Action Cable messages
  onReceived = (message) => {
    console.log(message);
    const user = _.find(this.props.userList, { id: this.props.currentUserId });
    if (user && !_.get(user, 'present')) {
      // we are not really sure if we still need this but it's hard to test because I (Birgit) think this was due to network connections dropping
      setUserPresent(this.props.currentUserId);
    }

    if (_.get(user, 'theme') === WEATHER_THEME && this.state.lastWeatherUpdate.add(1, 'h').isBefore(moment())) {
      // re-fetch the weather
      addCss(WEATHER_THEME, this.props.themes);
    }

    if (_.has(message, 'present') && message.id === this.props.currentUserId && !_.get(user, 'present') && !this.state.initialLoad) {
      this.props.actions.loadUserList().then(() => {
        // verify current users have logged in within the last week
        const lastValidLogin = moment().subtract(1, 'w');
        const lastUpdated = _.get(_.find(this.props.userList, { id: this.props.currentUserId }), 'last_updated');
        if (moment(lastUpdated).isBefore(lastValidLogin)) {
          return signOut().then(() => window.location.reload());
        }
      });
    }

    switch (_.get(message, 'type')) {
      case 'refresh':
        if ((_.has(message, 'id') && message.id === this.props.currentUserId) || !_.has(message, 'id')) {
          window.location.reload();
        }

        return;
      case 'floor':
        this.props.actions.updateFloor(_.omit(message, ['type']));
        return;
      case 'setting':
        if (_.has(message, 'admin_mode')) {
          this.props.setAdminOnlyMode(message.admin_mode);
        }

        return;
      case 'destroy_user':
        this.props.removeUser(message);
        return;
      case 'destroy_floor':
        this.props.actions.removeFloor(message);
        return;
      case 'destroy_department':
        this.props.actions.removeDepartment(message);
        return;
      case 'department':
        this.props.actions.updateOrAddDepartment(_.omit(message, 'type'));
        return;
      case 'user':
        if (_.has(message, 'present')) {
          message = _.assign({}, message, { isGhost: false });
        }

        if (_.has(message, 'pinned_rooms')) {
          this.props.actions.setPinnedOffices(message.pinned_rooms);
        }

        if (_.has(message, 'current_room_id') &&  message.id === this.props.currentUserId) {
          const currentFloorId = _.get(_.find(this.props.rooms, { id: message.current_room_id }), 'floor_id');
          const isOnProperFloor = currentFloorId === this.props.currentFloorId === this.props.backUpFloorId;
          if (!isOnProperFloor) {
            this.props.actions.setBackupFloorId(currentFloorId);
            this.props.actions.setCurrentFloorId(currentFloorId);
          }
        }

        this.props.updateUserProperty(_.omit(message, ['type']));
        return;
      case 'guest_user':
        const guest = _.assign({}, _.omit(message, ['type']), { is_guest: true, id: `${message.id}_guest`});
        if (_.get(message, 'present')) {
          this.props.addUser(guest);
        } else {
          // remove guest users from the list as they should no longer display when they go offline:
          this.props.removeGuestUser(guest);
        }

        return;
      case 'logout':
        if (_.get(message, 'id') === this.props.currentUserId) {
          window.dispatchEvent(new CustomEvent('doUnsubscribe'));
          window.location.reload();
        }

        return;
      case 'ghost_user':
        // only existing users can be ghost users - add the isGhost flag and make them present
        this.props.updateUserProperty({ id: message.id, isGhost: true, present: message.present });
        return;
      case 'room':
        if (_.has(message, 'owner_id')) {
          this.props.updateUserProperty({ id: message.owner_id, home_id: message.id });
          this.props.updateRoomProperty(_.omit(message, ['type']));
        } else if (_.has(message, 'meeting_id')) {
          this.props.updateRoomProperty(_.omit(message, ['type']));

          if (message.meeting_id === null) {
            clearMeeting();
            const ghostsInRoom = _.filter(getUsersInRoom(this.props.userList, '', _.get(message, 'id')), { isGhost: true });
            _.forEach(ghostsInRoom, (ghost) =>  this.props.updateUserProperty({ id: ghost.id, isGhost: false }));
          }
        } else if (_.has(message, 'name') || _.has(message, 'slack_url')) {
          this.props.updateRoomProperty(_.omit(message, ['type']));
        }

        return;
      case 'meeting':
        if (_.has(message, 'meeting_url') && message.meeting_url) {
          if (this.props.currentUserId === message.user) {
            if (message.try_count % 3 === 0) {
              const currentRoom = getRoom(this.props.rooms, user.current_room_id);
              const meetingId = _.get(currentRoom, 'meeting_id');
              joinMeeting(meetingId);
            } else {
              startMeeting(message.meeting_url);
            }
          }
        }

        return;
      case 'meeting_joined':
        if (message.id === this.props.currentUserId) {
          // also reset the spinner
          const currentUser = _.find(this.props.userList, {id: message.id});
          this.props.updateRoomProperty({ id: _.get(currentUser, 'room_id'), spinner: 'stop' });
          clearMeeting();
        }

        return;
      case 'new_user':
        this.props.addUser(_.omit(message, ['type']));
        setTimeout(this.doFetchSlackUrls, _.size(this.props.userList) * 500);
      case 'spinner':
        this.props.updateRoomProperty({ id: message.room_id, spinner: message.action });
      default:
        return;
    }
  };

  killServiceWorker = () => {
    window.dispatchEvent(new CustomEvent('doUnsubscribe'));
  };

  onDisconnect = () => {
    console.log('on disconnect called');
    loadThemes();
  };

  onConnect = () => {
    console.log('on connect triggered');
    // this was added to ensure that users show present after their connection dropped
    setUserPresent(this.props.currentUserId);
    if (!this.state.initialLoad) {
      this.props.actions.loadUserList();
    }
  };

  doFetchSlackUrls = () => {
    fetchSlackURLS().then((response) => {
      _.forEach(_.keys(response.data), (key) => {
        this.props.updateUserProperty({ id: _.toNumber(key), slackDMToken: response.data[key] });
      });
    });
  };

  renderTurtle = (user) => {
    if (_.get(user, 'theme') === WEATHER_THEME) {
      return <div className="sidePanelTurtle rightSidePanelBottomCorner cursorPointer" onClick={() => replayCondition(user)}/>;
    } else {
      return <div className="sidePanelTurtle rightSidePanelBottomCorner"/>;
    }
  };

  setUserBack = () => {
    this.setState({ displayBackButton: 0 });
    setUserAvailable(this.props.currentUserId);
  };

  render() {
    const user = _.find(this.props.userList, { id: this.props.currentUserId });
    if (!user) {
      return <div  className="height-maximum backdrop flexRowContainer flexCenter"><i className="fa fa-circle-o-notch fa-spin fa-5x loadingSpinner"/> </div>;
    }

    const displayNotificationWarning = _.get(document.getElementById('pushNotifications'), 'dataset.pushnotificationsenabled') === 'false';
    const displayTimezoneWarning = this.state.timeZoneWarningCount === 1 && !displayNotificationWarning;
    const displaySlackWarning = this.state.slackWarningCount === 2;
    const displayBackButton =  this.state.displayBackButton === 2;
    const showAdminModal = this.props.adminOnlyMode && !user.admin;

    return showAdminModal ? <AdminOnlyModal/> : (this.props.displayAdmin ? <AdminTool adminOnlyMode={this.props.adminOnlyMode} rooms={this.props.rooms}/> :
      (<div className="height-maximum backdrop">
        <CatchMe/>
        <NotificationContainer/>
        <div id="meetingFrameWrapper" className="width-1 height-1 positionOffscreen"></div>
        <iframe name="slackWrapper" className="width-1 height-1 positionOffscreen"></iframe>
        <WeatherThemeSupport/>
        { this.renderTurtle(user) }
        { displayTimezoneWarning && <TimezoneModal userId={user.id} qubeTimezone={this.state.qubeTimezone} browserTimezone={this.state.browserTimezone}/>}
        { displaySlackWarning && <SlackModal/>}
        { displayNotificationWarning && <NoNotificationsModal/>}
        {user && <Toolbar user={user}></Toolbar>}
        <div className="flexColumnContainer flexFill height-maximum">
          { displayBackButton && <BackButton userIsBack={this.setUserBack}/>}
          <SidePanel user={user}/>
          {!_.isEmpty(this.props.rooms) && <Floorplan/>}
        </div>
      </div>)
    );
  }

  componentWillMount() {
    window.dispatchEvent(new CustomEvent('doSubscribe'));
  }

  componentDidMount() {
    const cable = ActionCable.createConsumer(action_cable_url);

    cable.subscriptions.create('MapChannel', { received: this.onReceived, disconnected: this.onDisconnect, connected: this.onConnect });
    Promise.all([
      this.props.actions.loadUserList(),
      this.props.actions.loadThemes(),
      this.props.actions.loadFloors(),
      this.props.actions.getRooms(),
      this.props.actions.loadDepartments()
    ]).then((responses)=> {
      const user = _.find(responses[0].data, { id:  this.props.currentUserId });
      const currentRoom = _.find(responses[3].data, { id: user.current_room_id });
      this.props.actions.setBackupFloorId(currentRoom.floor_id);
      this.props.actions.setCurrentFloorId(currentRoom.floor_id);
      this.setState({ initialLoad: false });
    });
  }

  componentDidUpdate() {
    const user = _.find(this.props.userList, { id: this.props.currentUserId });

    if (user) {
      // make the user available to serviceworker
      if (!window.user) {
        window.user = user;
      }
      // check and see if we need to display the "I'm back" button
      if (this.state.displayBackButton === 0 && _.indexOf([STATES.RIGHT_BACK, STATES.AWAY], user.state) > -1) {
        this.setState({ displayBackButton: 1 });
        const backButtonTimeout = setTimeout(() => {
          this.setState({ displayBackButton: 2, backButtonTimeout: null });
        }, 1000 * 30);
        this.setState({ backButtonTimeout });
      }

      if ((this.state.backButtonTimeout  || this.state.displayBackButton === 2) && _.indexOf([STATES.AVAILABLE, STATES.SOCIAL, user.BUSY], user.state) > -1) {
        clearTimeout(this.state.backButtonTimeout);
        this.setState({ backButtonTimeout: null, displayBackButton: 0 });
      }

      // check and see if we need to display the timezone warning modal:
      const qubeTimezone = user.timezone;
      const browserTimezone = moment.tz.guess();

      if (qubeTimezone !== browserTimezone && this.state.timeZoneWarningCount === 0) {
        this.setState({ timeZoneWarningCount: 1, browserTimezone, qubeTimezone });
      }

      if (this.state.slackWarningCount === 0) {
        this.setState({ slackWarningCount: 1 });
        setTimeout(() => {
          checkForSlack(user.id).then((response) => {
            if (response.data.slack_presence !== 'active') {
              this.setState({ slackWarningCount: 2 });
            }
          });
        }, 1000 * 60 * 2);
      }

      if (this.props.displayAdmin && this.state.adminToolDisplayed !== 1) {
        this.setState({ adminToolDisplayed: 1 });
        this.props.actions.setBackupFloorId(-1);
      } else if(!this.props.displayAdmin && this.state.adminToolDisplayed === 1) {
        this.setState({ adminToolDisplayed: 2 }, () => {
          const currentUser = _.find(this.props.userList, { id: this.props.currentUserId });
          const currentRoom = _.find(this.props.rooms, { id: currentUser.current_room_id });
          const currentLevel = _.get( _.find(this.props.floors, { id: currentRoom.floor_id }), 'id');
          this.props.actions.setBackupFloorId(currentLevel);
          this.props.actions.setCurrentFloorId(currentLevel);
        });
      }
    }
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(actions, dispatch),
    updateUserProperty: bindActionCreators(updateUserProperty, dispatch),
    updateRoomProperty: bindActionCreators(updateRoomProperty, dispatch),
    addUser: bindActionCreators(addUser, dispatch),
    removeGuestUser: bindActionCreators(removeGuestUser, dispatch),
    removeUser: bindActionCreators(removeUser, dispatch),
    setAdminOnlyMode: bindActionCreators(setAdminOnlyMode, dispatch)
  };
};

const mapStateToProps = (...args) => {
  return {
    application: args[0].application,
    currentUserId: args[0].currentUserId,
    currentFloorId: args[0].currentFloorId,
    backUpFloorId: args[0].backUpFloorId,
    rooms: args[0].rooms,
    userList: args[0].userList,
    floors: args[0].floors,
    departments: args[0].departments,
    themes: args[0].themes,
    displayAdmin: args[0].adminDisplay,
    selfRegistration: args[0].selfRegistration,
    adminOnlyMode: args[0].adminOnlyMode
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Layout);
