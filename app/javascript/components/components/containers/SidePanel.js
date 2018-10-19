import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../../actions/loadActions';
import {
  getRoom,
  getOnlineUsers,
  getOfflineUsers,
  getUsersInRoom,
  tooltipMe,
  knockOrGo,
  getUserName
} from '../../utils/utils';
import SidePanelUserEntry from './SidePanelUserEntry';
import { inviteAll, inviteByDepartment } from '../../utils/api.utils';
import { SIDE_PANEL_DISPLAY } from '../../constants/appConstants';
import _ from 'lodash';
import Cookies from 'universal-cookie';

export class SidePanel extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      sidePanelDisplay: SIDE_PANEL_DISPLAY.DEFAULT,
      searchTerm: ''
    };
  }

  onlineUsers() {
    const users = getOnlineUsers(this.props.userList, _.get(this.props.user, 'currentUserId'),
      _.get(this.props.user, 'current_room_id'));

    return _.reject(users, { is_guest: true });
  };

  guestUsers() {
    const users = getOnlineUsers(this.props.userList, _.get(this.props.user, 'currentUserId'),
      _.get(this.props.user, 'current_room_id'));
    return _.filter(users, { is_guest: true });
  };

  offlineUsers() {
    return getOfflineUsers(this.props.userList);
  };

  currentRoom() {
    return getRoom(this.props.rooms, _.get(this.props.user, 'current_room_id'));
  };

  usersInRoom = () => {
    return getUsersInRoom(this.props.userList, _.get(this.props.user, 'id'),
      _.get(this.props.user, 'current_room_id'));
  };

  showCurrentRoomSlackIcon() {
    return <div className="pr10 pt20"><a href={_.get(this.currentRoom(), 'slack_url')}>
      {tooltipMe('Slack', 'slack', <i className="fa fa-slack icon cursorPointer" aria-hidden="true"></i>)}
      </a></div>;
  };

  renderInviteAll = (roomId) => {
    return <div className="pr10 pt15">
        {tooltipMe('invite all', 'invite_all',   <i className="fa fa-user-plus icon cursorPointer" aria-hidden="true" onClick={()=> inviteAll(roomId)}></i>)}
    </div>;
  };

  renderInviteByDepartment = (departmentId, roomId) => {
      return <div className="pr10 pt15">
    {tooltipMe('invite department', `invite_${departmentId}`, <i className="fa fa-user-plus icon cursorPointer" aria-hidden="true" onClick={()=> inviteByDepartment(departmentId, roomId)}></i>)}
    </div>;
    };

  renderDefaultSidePanelUserList = () => {
    const { user, userList } = this.props;
    const currentRoom = this.currentRoom();
    const roomType = _.get(currentRoom, 'room_type');
    return <div className="ml20 flexRowContainer">
      <div className="flexColumnContainer"><h3 className="flexFill">Everyone</h3> {(roomType === 'cafeteria' || roomType === 'auditorium') && this.renderInviteAll(currentRoom.id)}</div>
      { this.applyUserSearch(this.onlineUsers()).map((onlineUser) => {
        return <SidePanelUserEntry user={onlineUser} currentUser={user} showSlack={!onlineUser.is_guest} showInvite={!onlineUser.is_guest && onlineUser.present} key={onlineUser.id} userList={userList}/>;
      })}

        <div className="flexColumnContainer"><h3 className="flexFill">Guests</h3></div>
        { this.applyUserSearch(this.guestUsers()).map((guest) => {
          return <SidePanelUserEntry user={guest} currentUser={user}  showSlack={false} key={guest.id} showCall={false} />;
        })}

      <div className="flexColumnContainer"><h3 className="flexFill">Offline</h3></div>
      { this.applyUserSearch(this.offlineUsers()).map((offlineUser) => {
        return <SidePanelUserEntry user={offlineUser} currentUser={user}  showSlack={!offlineUser.is_guest} key={offlineUser.id} showCall={_.get(currentRoom, 'meeting_id')} userList={userList} />;
      })}
    </div>;
  };

  renderUserListByRoom = () => {
    const { user, rooms, userList } = this.props;
    return <div className="ml20 flexRowContainer">
     {_.chain(rooms)
       .orderBy([room => _.toLower(_.get(room, 'name'))], ['asc'])
       .map((room) => {
        let usersInRoom = getUsersInRoom(this.props.userList, _.get(this.props.user, 'id'), room.id);
        usersInRoom = this.applyUserSearch(usersInRoom);
        if (_.isEmpty(usersInRoom) || room.id === this.props.user.current_room_id) {
          return '';
        } else {
          


return <div className="mb10" key={room.id}>
             <h4 className="cursorPointer" onDoubleClick={()=> { knockOrGo(room.id,  _.get(this.props.user, 'current_room_id'),  _.get(this.props.user, 'home_id'), this.props.rooms);}}>{room.name}</h4>
             {
               usersInRoom.map((userInRoom) => {
                return <SidePanelUserEntry user={userInRoom} currentUser={user} showSlack={!userInRoom.is_guest}
                                    showInvite={!userInRoom.is_guest && userInRoom.present} key={userInRoom.id} userList={userList} />;
              })
            }
           </div>;
        }
      }).value()}
   </div>;
  };

  renderUsersWithDepartments(user, userList) {
    const currentRoom = this.currentRoom();
    const roomType = _.get(currentRoom, 'room_type');
    return (<div>{_.chain(this.props.departments)
      .orderBy([department => _.get(department, 'name').toLowerCase()], ['asc'])
      .map((department) => {
        let usersByDepartment = _.chain(userList)
          .filter({ department_id: department.id })
          .orderBy(['present', user => _.get(user, 'first_name').toLowerCase()], ['desc'])
          .value();
        usersByDepartment =  this.applyUserSearch(usersByDepartment);
        if (_.isEmpty(usersByDepartment)) {
          return '';
        } else {
          return <div className="mb10" key={`department_${department.id}`}>
            <div className="flexColumnContainer"><h4 className="flexFill">{department.name}</h4>{(roomType === 'cafeteria' || roomType === 'auditorium' || roomType === 'meeting') && this.renderInviteByDepartment(department.id, currentRoom.id)}</div>
            {
              usersByDepartment.map((userInRoom) => {
                return <SidePanelUserEntry user={userInRoom} currentUser={user} showSlack={!userInRoom.is_guest}
                                           showInvite={!userInRoom.is_guest && userInRoom.present} key={userInRoom.id} userList={userList}/>;
              })
            }
          </div>;
        }
      }).value()
    }</div>);
  };

  renderUsersWithoutDepartments(user, userList) {
    let unassignedUsers = _.chain(userList)
      .reject({ id: this.props.currentUserId })
      .map(listUser => {
      if (_.isNil(listUser.department_id)) {
        return listUser;
      }
    })
      .orderBy([user => _.get(user, 'name', '').toLowerCase()], ['asc'])
      .compact()

      .value();

    if (_.isEmpty(unassignedUsers)) {
      return '';
    } else {
      return (<div className="mb10" key={`department_other`}>
        <h4>Other</h4>
          {
          unassignedUsers.map((userInRoom) => {
              return <SidePanelUserEntry user={userInRoom} currentUser={user} showSlack={!userInRoom.is_guest}
                                         showInvite={!userInRoom.is_guest && userInRoom.present} key={userInRoom.id} userList={userList}/>;
            })
          }
      </div>);
    }
  }

  renderUserListByDepartment = () => {
    const { user, userList } = this.props;
    return (<div className="ml20 flexRowContainer">
      {this.renderUsersWithDepartments(user, userList)}
      {this.renderUsersWithoutDepartments(user, userList)}
    </div>);
  };

  applyUserSearch = (users) => {
    const searchTerm = this.state.searchTerm;
    const selfRegistration = this.props.selfRegistration;
    if (searchTerm === '') {
      return _.reject(users, { id: this.props.currentUserId });
    }

    return _.chain(users)
      .filter((user) => {
          if (_.includes(_.toLower(getUserName(user), selfRegistration), _.toLower(searchTerm))) {
            return user;
          }
        })
      .reject({ id: this.props.currentUserId })
      .compact()
      .value();
  };

  renderUserListByFloor = () => {
    const { user, rooms, userList } = this.props;
    return <div className="ml20 flexRowContainer">
      {_.chain(this.props.floors)
        .sortBy('level')
        .map((floor) => {
          let usersByFloor = _.chain(rooms)
            .filter({ floor_id: floor.id })
            .map((room) => getUsersInRoom(this.props.userList, _.get(this.props.user, 'id'), room.id))
            .flatten()
            .orderBy([user => _.get(user, 'first_name').toLowerCase()], ['asc'])
            .value();

          usersByFloor = this.applyUserSearch(usersByFloor);
          if (_.isEmpty(usersByFloor)) {
            return '';
          } else {
            return <div className="mb10" key={`sidepanelFloor${floor.id}`}>
              <h4>{floor.name}</h4>
              {
               _.map(usersByFloor, (userInRoom) => {
                  return <SidePanelUserEntry user={userInRoom} currentUser={user} showSlack={!userInRoom.is_guest}
                                             showInvite={!userInRoom.is_guest && userInRoom.present} key={userInRoom.id} userList={userList}/>;
                })
              }
            </div>;
          }
        }).value()
      }
    </div>;
  };

  getFilterOptions() {
    let filterOptions = {
      DEFAULT: SIDE_PANEL_DISPLAY.DEFAULT, BY_ROOM: SIDE_PANEL_DISPLAY.BY_ROOM
    };

    if (!_.isEmpty(this.props.departments) && _.size(this.props.departments) > 1) {
      _.assign(filterOptions, { BY_DEPARTMENT: SIDE_PANEL_DISPLAY.BY_DEPARTMENT });
    }

    if (!_.isEmpty(this.props.floors) && _.size(this.props.floors) > 1) {
      _.assign(filterOptions, { BY_FLOOR: SIDE_PANEL_DISPLAY.BY_FLOOR });
    }

    return filterOptions;
  }

  renderSidePanelSortFilter = () => {
    const filterOptions  = this.getFilterOptions();
    return <div id="nav"><ul className="mr4 pt5"><li className="icon cursorPointer"><span className="fa fa-sort-amount-desc"/> <ul>
      {_.keys(filterOptions).map((sidePanelDisplayOptionKey) => {
          if (this.state.sidePanelDisplay ===  filterOptions[sidePanelDisplayOptionKey]) {
            return <li className="boldText" key={sidePanelDisplayOptionKey}>{filterOptions[sidePanelDisplayOptionKey]}</li>;
          } else {
            return <li key={sidePanelDisplayOptionKey}
              onClick={() => this.setSidePanelSort(sidePanelDisplayOptionKey) }>{filterOptions[sidePanelDisplayOptionKey]}</li>;
          }
        })}
      </ul>
      </li>
    </ul>
  </div>;
  };

  setSidePanelSort(sidePanelDisplayOptionKey) {
    const cookies = new Cookies();
    cookies.set('sidePanelSort', sidePanelDisplayOptionKey, { path: '/' });
    this.setState({ sidePanelDisplay: this.getFilterOptions()[sidePanelDisplayOptionKey] });
  }

  renderSidePanelList = () => {
    switch (this.state.sidePanelDisplay) {
      case SIDE_PANEL_DISPLAY.DEFAULT:
        return this.renderDefaultSidePanelUserList();
      case SIDE_PANEL_DISPLAY.BY_ROOM:
        return this.renderUserListByRoom();
      case SIDE_PANEL_DISPLAY.BY_DEPARTMENT:
        return this.renderUserListByDepartment();
      case SIDE_PANEL_DISPLAY.BY_FLOOR:
        return this.renderUserListByFloor();
      default:
        return this.renderDefaultSidePanelUserList();
    }
  };

  render() {
    const { user, userList } = this.props;
    const currentRoom = this.currentRoom();
    const roomType = _.get(currentRoom, 'room_type');
    return (
      <div className="flexRowContainer sidePanel width-250 mt50">

        <div className="overflowYAuto pb150">
          <div className="flexRowContainer ml20 mb15">
            <div className="flexColumnContainer flexAlignCenter">
            <div className="flexFill"><h3> {_.get(currentRoom, 'name')}</h3></div>
              { roomType == 'office' && !_.isEmpty(this.usersInRoom()) && this.showCurrentRoomSlackIcon()}
          </div>
          <SidePanelUserEntry user={user} currentUser={user} />
          {this.usersInRoom().map((userInRoom) => {
            return <SidePanelUserEntry user={userInRoom} showSendHome={!userInRoom.is_guest } currentUser={user} key={userInRoom.id}  userList={userList} showSlack={!userInRoom.is_guest}/>;
          })}
        </div>
          <div className="flexColumnContainer sidePanelFilter pl20 pr10 pt8 pb5">
            <div className="flexFill"><input id="sidePanelSearch" type="text" autoFocus placeholder="search by username" value={this.state.searchTerm} onChange={(event)=> this.setState({ searchTerm: event.target.value })}/></div> {this.renderSidePanelSortFilter()}
          </div>

          {this.renderSidePanelList()}
      </div>
      </div>
    );
  }

  componentDidMount() {
    const cookies = new Cookies();
    const sort = cookies.get('sidePanelSort');
    this.setState({ sidePanelDisplay: SIDE_PANEL_DISPLAY[sort] });
  }
}

SidePanel.defaultProps = {
  userList: [],
  rooms: []
};

SidePanel.propTypes = {
  actions: PropTypes.object.isRequired,
  user: PropTypes.object
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(actions, dispatch)
  };
};

const mapStateToProps = (...args) => {
  return {
    userList: args[0].userList,
    rooms: args[0].rooms,
    floors: args[0].floors,
    departments: args[0].departments,
    currentFloorId: args[0].currentFloorId,
    selfRegistration: args[0].selfRegistration,
    currentUserId: args[0].currentUserId
  };
};

export default connect(mapStateToProps,
  mapDispatchToProps)(SidePanel);

