import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import EditableInput from '../../utils/EditableInput';

import { AVATAR_DISPLAY_LOCATIONS } from '../../constants/appConstants';
import Avatar from './Avatar';
import MeetingControls from './MeetingControls';
import ZoomControls from './ZoomControls';
import { StatusControls } from './StatusControls';
import { fetchHistory, renameUser, signOut, sendUserHome } from '../../utils/api.utils';
import NotificationHistory from './NotificationHistory';
import Config from './Config';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import _ from 'lodash';
import { tooltipMe } from '../../utils/utils';
import { setAdminToolDisplay } from '../../actions/loadActions';
import * as actions from '../../actions/loadActions';

export class Toolbar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      notificationHistory: [],
      showConfig: false
    };

    this.toggleConfig = this.toggleConfig.bind(this);
    this.goHome = this.goHome.bind(this);
    this.loadHistory = this.loadHistory.bind(this);
    this.doSignOut = this.doSignOut.bind(this);
    this.showAdminTool = this.showAdminTool.bind(this);
  }

  toggleConfig(e) {
    this.setState({ target: e.target, showConfig: !this.state.showConfig });
  }

  showAdminTool() {
    this.props.setAdminToolDisplay();
  }

  goHome() {
    const currentHomeLevel = _.get(_.find(this.props.rooms, { id: _.get(this.props.user, 'home_id')}), 'floor_id');
    return sendUserHome(this.props.user.id).then(()=> this.props.actions.setBackupFloorId(currentHomeLevel));
  };

  loadHistory() {
    fetchHistory()
      .then((notificationHistory) => {
        this.setState({ notificationHistory: notificationHistory.data });
      });
  };

  doSignOut() {
    return signOut().then(() => window.location.reload());
  };

  changeUsername = (value) => {
    if (!_.isEmpty(value)) {
      return renameUser(this.props.user.id, value);
    }
  };

  render() {
    const { user, themes } = this.props;
    const configPop = (<Popover id="configPop"><Config user={user} themes={themes} /></Popover>);
    const historyPop = (
      <Popover id="historyPop" style={{ position: 'absolute', 'z-index': 8000, top: '40px' }}><NotificationHistory user={user} notificationHistory={this.state.notificationHistory} placement="bottom"/></Popover>);
    return (
      <div className="flexColumnContainer flexFill mt10 height-50 toolbar">
        <div className="sidePanel flexColumnContainer flexAlignCenter namebox pl20 flexFill">
          <OverlayTrigger
            trigger="click"
            placement="bottom"
            overlay={configPop}
            rootClose>
            <div>
              <Avatar
                color={user.color} emotion={user.emotion} firstName={user.first_name} lastName={user.last_name} state={user.state}
                displayLocation={AVATAR_DISPLAY_LOCATIONS.HEADER} id="avatar" />
            </div>
          </OverlayTrigger>

          <div className="mt10 ml10 mr15 pb10 flexColumnContainer currentUser min-width-175">
            {this.props.selfRegistration  && <EditableInput display={_.truncate(user.first_name, { length: 30 })} editingStyle="blackText width-175" changeAction={this.changeUsername} tabIndex={9}/>}
            {!this.props.selfRegistration && <span>{_.truncate(_.get(user, 'first_name'), { length: 30 })}</span>}
          </div>
          <StatusControls currentUser={user} />
        </div>

        <div className="flexColumnContainer flexJustifyEnd mr30 flexAlignCenter">
          <MeetingControls currentRoomId={user.current_room_id} user={user} />

          <ZoomControls />


          { user.admin && tooltipMe('Admin Tool', 'admin', <span className="fa fa-users fa-lg pl15 cursorPointer iconLarge" onClick={this.showAdminTool}></span>, 'bottom')}
          {tooltipMe('Take my to my office', 'goHome', <span className="fa fa-home fa-2x pl15 cursorPointer iconLarge" onClick={this.goHome}></span>, 'bottom')}

          <OverlayTrigger
            trigger="click"
            placement="bottom"
            overlay={historyPop}
            rootClose>
            {tooltipMe('View missed notifications', 'notificationHistorty', <span className="fa fa-gear fa-2x pl15 cursorPointer iconLarge" onClick={this.loadHistory}></span>, 'bottom')}
          </OverlayTrigger>
          {tooltipMe('Logout', 'logout', <span className="fa fa-power-off fa-2x pl15 cursorPointer iconLarge" onClick={this.doSignOut}></span>, 'bottom')}
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setAdminToolDisplay: bindActionCreators(setAdminToolDisplay, dispatch),
    actions: bindActionCreators(actions, dispatch)
  };
};

Toolbar.propTypes = {
  user: PropTypes.object
};

const mapStateToProps = (...args) => {
  return {
    themes: args[0].themes,
    selfRegistration: args[0].selfRegistration,
    rooms: args[0].rooms
  };
};

export default connect(mapStateToProps,
  mapDispatchToProps)(Toolbar);
