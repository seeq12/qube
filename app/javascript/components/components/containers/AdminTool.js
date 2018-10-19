import ReactTable from 'react-table';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { NotificationContainer } from 'react-notifications';

import { updateRoomProperty } from '../../actions/roomListActions';
import * as actions from '../../actions/loadActions';
import { addUser, removeGuestUser, updateUserProperty } from '../../actions/userListActions';
import {
  deleteFloor,
  deleteUser,
  logoutEveryone,
  refreshEveryone,
  setAdminOnlyModeAPI,
  renameRoom,
  renameFloor,
  updateFirstName,
  updateLastName,
  updateDepartmentAssignment,
  makeUserAdmin,
  renameDepartment, deleteDepartment, updateFloorSize, setSelfRegistrationAPI
} from '../../utils/api.utils';
import { setAdminOnlyMode, setSelfRegistrationMode } from '../../actions/adminToolActions';
import { setAdminToolDisplay } from '../../actions/loadActions';
import _ from 'lodash';
import AssignHomeModal from './adminModals/AssignHomeModal';
import NewUserModal from './adminModals/NewUserModal';
import NewDepartmentModal from './adminModals/NewDepartmentModal';
import { NewFloorModal } from './adminModals/NewFloorModal';
import { FLOOR_SIZES } from '../../constants/appConstants';
import OrderFloorModal from './adminModals/OrderFloorModal';
import { formatLoginTime, getUserName } from '../../utils/utils';
import { AssignOwnerModal } from './adminModals/AssignOwnerModal';

export class AdminTool extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      display: 'userMgmt',
      godMode: false,
      displayAssignHome: false,
      displayNewUserModal: false,
      displayNewDepartmentModal: false,
      displayNewFloorModal: false,
      displaySortFloorModal: false,
      displayAssignOwner: false,
      userType: 'all'
    };

    this.menuOptions = [{
      key: 'userMgmt',
      display: 'Users'
    }, {
      key: 'rooms',
      display: 'Rooms'
    }, {
      key: 'dept', display: 'Departments' }, { key: 'floors', display: 'Building Management' }, { key: 'more', display: 'More' }];
  }

  componentWillUnmount() {
  }

  renderAdminMenu() {
    return <div className="flexColumnContainer ml20 pt10 pb10">
      {_.map(this.menuOptions, (menu, idx) => {
        return <div className="flexColumnContainer" key={`adminNav${menu.key}`}>
          {idx > 0 && <span className="mr10 ml10"> |</span>}
          <span onClick={() => {this.setState({ display: menu.key });}} className={`${this.state.display === menu.key ? 'text-bold' : 'cursorPointer'}`}>{menu.display}</span></div>;
      })}
    </div>;
  }

  getDepartmentTableColumns() {
    let columns = [];
    if (this.state.godMode) {
      columns = [{ accessor: 'id', Header: 'Department Id' }];
    }

    return _.concat(columns, [{ accessor: 'name', Header: 'Name',
      Cell: row => this.renderEditable(row.original.id, renameDepartment, row.value) },
      { accessor: 'id', Header: '',  width: 30, filterable: false, Cell: row=> (<div className={`text-center`}><i className="fa fa-close cursorPointer mr10" onClick={()=> { deleteDepartment(row.value);}}/></div>) }]);
  }

  getFloorTableColumns() {
    let columns = [];
    if (this.state.godMode) {
      columns = [{ accessor: 'id', Header: 'FloorId' }];
    }

    return _.concat(columns, [{ accessor: 'name', Header: 'Name', Cell: row => {
        return this.renderEditable(row.original.id, renameFloor, row.value);}},

      { accessor: 'level', Header: 'Level', filterable: false },
      { accessor: 'size', Header: '# of Rooms', filterable: false, Cell: row => {
        const options = _.remove(_.clone(FLOOR_SIZES), function(n) {
          return n >= row.value;
        });

        return <select className="mr20 ml10" value={row.value} onChange={(event) => { updateFloorSize(row.original.id, event.target.value);}}>

          {_.map(options, (s) =>
            <option value={s} key={s}>{s}</option>
          )}
        </select>;
      }
    },
      { accessor: 'id', Header: '', width: 30, filterable: false, Cell: row=> (<div className={`text-center`}><i className="fa fa-close cursorPointer mr10" onClick={()=> { deleteFloor(row.value);}}/></div>) }]);
  }

  assignHome(userId, currentHomeId) {
    console.log(userId);
    this.setState({ displayAssignHome: true, userId, currentHomeId });
  }

  assignOwner(roomId) {
    this.setState({ displayAssignOwner: true, roomId });
  }

  renderEditable(id, toCall, displayValue) {
    return (
      <div
        style={{ backgroundColor: '#fafafa' }}
        contentEditable="true"
        suppressContentEditableWarning
        onBlur={e => {
          if (e.target.textContent !== displayValue) {
            toCall(id, e.target.textContent);
          }
        }}>{displayValue}</div>
    );
  }

  getRoomTableColumns() {
    let columns = [];
    if (this.state.godMode) {
      columns = [{ accessor: 'id', Header: 'Room Id', width: 60 },
        { accessor: 'floorplan_id', Header: 'Floorplan Id', width: 60 },
        { accessor: 'owner_id', Header: 'Owner Id', width: 60 }];
    }

    return _.concat(columns, [
      { accessor: 'name', Header: 'Name', Cell: row => this.renderEditable(row.original.id, renameRoom, row.value)},
      { accessor: 'floor_id', Header: 'Floor',  filterable: false, Cell: row => {
        const floor = _.find(this.props.floors, { id: row.value });
        return <div>{_.get(floor, 'name')} (Level {_.get(floor, 'level')})</div>;
      }},

      { accessor: 'room_type', Header: 'Type',
        filterMethod: (filter, row) => {
          if (filter.value === 'all') {
            return true;
          }

          return (row[filter.id]) === (filter.value);
        },

        Filter: ({ filter, onChange }) => {
          const opts = _.chain(this.props.rooms)
            .map('room_type')
            .uniq()
            .sort()
            .value();
          return <select
             onChange={event => onChange(event.target.value)}
             style={{ width: '100%' }}
             value={filter ? filter.value : 'all'}
           >
            <option value="all" key={`filter_opt_all`}>all types</option>
            {_.map(opts, (opt) =>  <option value={opt} key={opt}>{opt}</option>)}
          </select>;
        }},

      { accessor: 'owner_id', Header: 'Owner',
        filterMethod: (filter, row) => {

          const name = getUserName(_.find(this.props.userList, {home_id: row._original.id}));
          return _.includes(_.toLower(name), filter.value);
        },

        Cell: row => {
          if (row.original['room_type'] !== 'office') {
            return '';
          } else if (row.original.owner_id === null) {
            return <div  onClick={()=> this.assignOwner(row.original.id)} className="fa fa-user cursorPointer"/>;
          } else {
            return <div>{getUserName(_.find(this.props.userList, { id: row.value }))}</div>;
          }

        }}]);
  }

  getUserTableColumns() {
    let columns = [];
    if (this.state.godMode) {
      columns = [{ accessor: 'id', Header: 'User Id' }, { accessor: 'home_id', Header: 'Room Id' }];
    }

    return _.concat(columns, [{
      accessor: 'first_name',
      Header: 'First name',
      Cell: row => this.renderEditable(row.original.id, updateFirstName, row.value)
    }, {
      accessor: 'last_name',
      Header: 'Last name',
      Cell: row => this.renderEditable(row.original.id, updateLastName, row.value)
    },
       { accessor: 'email', Header: 'Email' },
       {
        accessor: 'department_id',
        Header: 'Department',
        width: 280,
        filterable: false,
        Cell: row => {

          if (row.original.is_guest) {
            return '';
          }



return <select className="mr20 ml10 width-200" value={row.value} onChange={(event) => { updateDepartmentAssignment(row.original.id, event.target.value);}}>
  <option value={`null`}>none</option>
            {_.map(this.props.departments, (s) =>
                        <option value={s.id} key={s.id}>{s.name}</option>
                      )}
          </select>;
        }
      },
      { accessor: 'home_id', Header: 'Home', filterable: false, Cell: row => {

        if (row.original.is_guest) {
          return '';
        }

        return <div className="flexColumnContainer"><div className="flexFill">{_.get(_.find(this.props.rooms, { id: row.value }), 'name')}</div> <i onClick={()=> this.assignHome(row.original.id, row.value)} className="fa fa-home cursorPointer"/> </div>;
      } },

      { accessor: 'home_id', Header: 'Level', filterable: false, Cell: row => {
        const floorId = _.get(_.find(this.props.rooms, { id: row.value }), 'floor_id');
        return _.get(_.find(this.props.floors, { id: floorId }), 'level');
      }},

      { accessor: 'last_sign_in_at', Header: 'Last Login', filterable: false, Cell: row => {
          const user = _.find(this.props.userList, { id: this.props.currentUserId });
          return formatLoginTime(row.value, user.timezone);
        } },

       { accessor: 'admin', Header: 'Admin', filterable: false,  width: 80,
        Cell: row => {

          if (row.original.is_guest) {
            return '';
          }

          return <div className={`text-center`}><i onClick={()=> this.toggleAdmin(row.original.id, row.value)} className={`fa ${row.value ? 'fa-check' : 'fa-square-o'}`}/></div>;
        }},

      { accessor: 'is_guest', Header: '', filterable: false,  width: 20,
        Cell: row => {

          if (row.value) {
            return <div className="guestIcon"/>;
          }

          return '';
        }},

       { accessor: 'id', Header: '', width: 30, filterable: false, Cell: row=> (<div className={`text-center`}><i className="fa fa-close cursorPointer mr10" onClick={()=> { deleteUser(row.value);}}/></div>) }]);

  }

  toggleAdmin(userId, admin) {
    makeUserAdmin(userId, !admin);
  }

  doLogOutEveryone() {
    logoutEveryone();
  }

  doRefreshEveryone() {
    refreshEveryone();
  }

  closeAdminTool() {
    this.props.setAdminToolDisplay();
  }

  toggleGodMode() {
    this.setState({ godMode: !this.state.godMode });
  }

  toggleAdminOnlyMode() {
    const enabled = !this.props.adminOnlyMode;
    setAdminOnlyModeAPI(enabled)
      .then(() =>
        setAdminOnlyMode(enabled));
  }

  toggleSelfRegistration() {
    const enabled = !this.props.selfRegistration;
    setSelfRegistrationAPI(enabled)
      .then(() =>
        this.props.setSelfRegistrationMode(enabled));
  }

  renderUserManagement() {
    const userTypes = [{ key: 'all', display: 'all' }, { key: 'guest', display: 'Guests' }, { key: 'registerd', display: 'Registered Users only' }];
    const columns = this.getUserTableColumns();
    let data = this.props.userList;
    if (this.state.userType === 'guest') {
      data = _.filter(data, { is_guest: true });
    } else if (this.state.userType === 'registered') {
      data =  _.filter(data, { is_guest: false });
    }

    return <div className="pl20 pr20 scroll">
      <div className="flexColumnContainer mb10">
        <div className="flexColumbContainer flexFill"></div>
        <div className="flexColumnContainer">
          <select  className="mr10" value={this.state.userType} onChange={(event) => { this.setState({ userType: event.target.value });}}>

            {_.map(userTypes, (type) =>
              <option value={type.key} key={`userTyype${type.key}`}>{type.display}</option>
            )}
          </select>
        <button type="button" className="btn customBtn"
                onClick={()=> this.setState({ displayNewUserModal: true })}>
          New User</button>
        </div>
      </div>
      <ReactTable
        data={data}
        columns={columns}
        filterable
        defaultPageSize={10}
        defaultFilterMethod={(filter, row) =>
          _.includes(_.toLower(String(row[filter.id])), _.toLower(filter.value))}
        className="-striped -highlight"/>
    </div>;
  }

  renderDepartmentManagement() {
    const columns = this.getDepartmentTableColumns();
    return <div className="pl20 pr20 scroll">
      <div className="flexColumnContainer mb10">
        <div className="flexColumbContainer flexFill"></div>
        <div className="flexColumnContainer">
          <button type="button" className="btn customBtn"
                  onClick={()=> this.setState({ displayNewDepartmentModal: true })}>
            New Department</button>
        </div>
      </div>
      <ReactTable
        data={this.props.departments}
        columns={columns}
        filterable
        defaultPageSize={10}
        defaultFilterMethod={(filter, row) =>
          _.includes(_.toLower(String(row[filter.id])), _.toLower(filter.value))}
        className="-striped -highlight"/>
    </div>;
  }

  renderFloorManagement() {
    const columns = this.getFloorTableColumns();
    return <div className="pl20 pr20 scroll">
      <div className="flexColumnContainer mb10">
        <div className="flexColumbContainer flexFill"></div>
        <div className="flexColumnContainer">
          <button type="button" className="btn customBtn mr10"
                  onClick={()=> this.setState({ displaySortFloorModal: true })}>
            Order Floors</button>
          <button type="button" className="btn customBtn"
                  onClick={()=> this.setState({ displayNewFloorModal: true })}>
            New Floor</button>
        </div>
      </div>
      <ReactTable
        data={this.props.floors}
        columns={columns}
        filterable
        defaultPageSize={10}
        defaultFilterMethod={(filter, row) =>
          _.includes(String(row[filter.id]), filter.value)}
        className="-striped -highlight"/>
    </div>;
  }

  renderRoomManagement() {
    const columns = this.getRoomTableColumns();
    return <div className="pl20 pr20 scroll">
      <ReactTable
        data={this.props.rooms}
        columns={columns}
        filterable
        defaultPageSize={10}
        defaultFilterMethod={(filter, row) =>
          _.includes(_.toLower(String(row[filter.id])), _.toLower(filter.value))}
        className="-striped -highlight"/>
    </div>;
  }

  renderMoreSection() {
    return <div className="flexRowContainer pl20">
      <div onClick={this.toggleAdminOnlyMode.bind(this)}>
      <i className={`fa fa-fw ${this.props.adminOnlyMode ? 'fa-check-square-o' : 'fa-square-o'}`} aria-hidden="true"></i> Admin Only Mode
    </div>
      <div onClick={this.toggleSelfRegistration.bind(this)}>
        <i className={`fa fa-fw ${this.props.selfRegistration ? 'fa-check-square-o' : 'fa-square-o'}`} aria-hidden="true"></i> Self Registration
      </div>

       <div onClick={this.toggleGodMode.bind(this)}>
        <i className={`fa fa-fw ${this.state.godMode ? 'fa-check-square-o' : 'fa-square-o'}`}  aria-hidden="true"></i> God Mode
      </div>

      <div className="pt10" onClick={this.doLogOutEveryone.bind(this)}>
        <button type="button" className="btn backButton">Force Everyone to Logout</button>
      </div>

      <div className="pt10" onClick={this.doRefreshEveryone.bind(this)}>
        <button type="button" className="btn backButton">Force refresh Everyone</button>
      </div>
    </div>;
  }

  renderSection() {
    switch (this.state.display){
      case 'userMgmt':
        return this.renderUserManagement();
      case 'more':
        return this.renderMoreSection();
      case 'dept':
        return this.renderDepartmentManagement();
      case 'floors':
        return this.renderFloorManagement();
      case 'rooms':
        return this.renderRoomManagement();
      default:
        return <div>this should not have happened.</div>;
    }
  }

  toggleAssignHomeModal() {
    this.setState({ displayAssignHome: false, userId: null, currentHomeId: null });
  }

  toggleAssignOwnerModal() {
    this.setState({ displayAssignOwner: false });
  }

  toggleAddUserModal() {
    this.setState({ displayNewUserModal: false });
  }

  toggleAddDepartmentModal() {
    this.setState({ displayNewDepartmentModal: false });
  }

  toggleAddFloorModal() {
    this.setState({ displayNewFloorModal: false });
  }

  toggleOrderFloorModal() {
    this.setState({ displaySortFloorModal: false });
  }

  render() {
    return <div className="adminBackdrop flexRowContainer">
      <NotificationContainer/>
      <div className="toolbar height-50 width-maximum flexColumnContainer">
        <div className="adminLogo ml10 mt5"/> <div className="ml10"><h3>Admin</h3></div>
        <div onClick={this.closeAdminTool.bind(this)}><i className="fa fa-close fa-2x closeAdminTool cursorPointer"/></div>
      </div>
      <div className="flexRowContainer adminContent width-maximum">
        {this.renderAdminMenu()}
         {this.renderSection()}
        { this.state.displayAssignHome && <AssignHomeModal rooms={this.props.rooms} userList={this.props.userList} userId={this.state.userId} currentHomeId={this.state.currentHomeId} floors={this.props.floors} handleHideModal={this.toggleAssignHomeModal.bind(this)} userId={this.state.userId}/>}
        { this.state.displayNewUserModal && <NewUserModal departments={this.props.departments} rooms={this.props.rooms} floors={this.props.floors} handleHideModal={this.toggleAddUserModal.bind(this)} />}
        { this.state.displayNewDepartmentModal && <NewDepartmentModal handleHideModal={this.toggleAddDepartmentModal.bind(this)} />}
        { this.state.displayNewFloorModal && <NewFloorModal handleHideModal={this.toggleAddFloorModal.bind(this)} floors={this.props.floors}/>}
        { this.state.displaySortFloorModal && <OrderFloorModal handleHideModal={this.toggleOrderFloorModal.bind(this)} floors={this.props.floors}/>}
        { this.state.displayAssignOwner && <AssignOwnerModal handleHideModal={this.toggleAssignOwnerModal.bind(this)} userList={this.props.userList} roomId={this.state.roomId}/>}
      </div>
    </div>;
  }

  componentWillMount() {

  }

  componentDidMount() {

  }

  componentDidUpdate() {
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(actions, dispatch),
    updateUserProperty: bindActionCreators(updateUserProperty, dispatch),
    updateRoomProperty: bindActionCreators(updateRoomProperty, dispatch),
    addUser: bindActionCreators(addUser, dispatch),
    removeGuestUser: bindActionCreators(removeGuestUser, dispatch),
    setAdminToolDisplay: bindActionCreators(setAdminToolDisplay, dispatch),
    setSelfRegistrationMode: bindActionCreators(setSelfRegistrationMode, dispatch)
  };
};

const mapStateToProps = (...args) => {
  return {
    application: args[0].application,
    currentUserId: args[0].currentUserId,
    rooms: args[0].rooms,
    userList: args[0].userList,
    floors: args[0].floors,
    departments: args[0].departments,
    themes: args[0].themes,
    adminOnlyMode: args[0].adminOnlyMode,
    selfRegistration: args[0].selfRegistration
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminTool);

