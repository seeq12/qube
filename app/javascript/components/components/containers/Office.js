import React from 'react';
import EditableInput from '../../utils/EditableInput';
import Avatar from './Avatar';
import _ from 'lodash';
import {getOnlineUsers, getUserName, tooltipMe} from '../../utils/utils';
import { enterRoom, knock, claimRoom, renameRoom, starRoom, unstarRoom } from '../../utils/api.utils';
import { AVATAR_DISPLAY_LOCATIONS } from '../../constants/appConstants';
const MAX_OFFICE_CHARS = 21;
export class Office extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showOwner: false, renderEditableRoomName: false };
  }

  doKnock= () => {
    const room = this.props.room;
    const currentUser = _.find(this.props.userList, { id: this.props.currentUserId });
    if (_.get(this.props.room, 'id') === _.get(currentUser, 'current_room_id')) {
      return;
    }

    if (_.get(room, 'room_type', 'office') !== 'office' || _.get(currentUser, 'home_id') === room.id) {
      enterRoom(room.id);
    } else {
      if (this.getOccupants().length > 0) {
        knock(room.id);
      }
    }
  };

  claimHome = () => {
    return claimRoom(this.props.room.id);
  };

  isOffice= () => {
    return this.props.room.room_type === 'office';
  };

  available= () => {
    return _.isEmpty(this.getOwner());
  };

  getOwner= () => {
    return _.find(this.props.userList, {
      home_id: this.props.room.id
    });
  };

  getStyle= () => {
    let style;
    if (this.isOffice()) {
      style = 'office';
      if (this.available()) {
        style += ' unclaimed';
      } else if (!_.get(this.getOwner(), 'present')) {
        style += ' out';
      }

      style += ' office';
    } else {
      style = _.get(this.props.room, 'room_type', '');
      style += ' ' + style;
    }

    style += this.props.roomCount;

    return `${style} flexRowContainer pt5`;
  };

  renderRoomName = (owner) => {
    if (this.props.room.room_type === 'office') {
      if (_.get(owner, 'id') === this.props.currentUserId) {
        if (this.state.renderEditableRoomName) {
          return this.renderEditableRoomName();
        } else {
          return <div className="commonName cursorPointer" onClick={() => this.setState({ renderEditableRoomName: true })}>{_.truncate(this.props.room.name, { length: MAX_OFFICE_CHARS })}</div>;
        }
      }

      if (this.state.showOwner && owner) {
        return (<div className="commonName">{getUserName(this.getOwner(), this.props.selfRegistration)}</div>);
      }

      return <div className="commonName">{_.truncate(this.props.room.name, { length: MAX_OFFICE_CHARS })}</div>;
    }

    return <div className="commonName">{this.props.room.name}</div>;
  };

  renderClaimOffice = (owner) => {
    if (owner || this.props.room.room_type !== 'office' || !this.props.selfRegistration) {
      return '';
    } else {
      return <div className="claimOfficeHover flexRowContainer flexCenter flexAlignCenter" onClick={this.claimHome}>
        <span className="fa fa-home"></span>
      </div>;
    }
  };

  unpinOffice = () => {
    unstarRoom(this.props.room.id);
  };

  doPinOffice=()=> {
    // find the next "pinnable slot"
    let nextUp = null;
    let i = 0;
    while (i < this.props.maxPinnables && nextUp === null) {
      const entry = _.find(this.props.pinned, { position_id: i });
      if (_.isEmpty(entry)) {
        nextUp = i;
      }

      i++;
    }

    if (nextUp > -1) {
      starRoom(this.props.room.id, nextUp);
    }
  };

  renderPinIt=(mouseOver, onHomeFloor)=> {
    const roomAlreadyPinned = _.find(this.props.pinned, { room_id: this.props.room.id });
    if (roomAlreadyPinned) {
      // always render star and allow unpinning: todo:

      return <div className="renderPin">
        {tooltipMe('Unpin office.', `unpin${this.props.room.id}`, <i className="fa fa-star" onClick={this.unpinOffice.bind(this)}></i>)}
      </div>;
    }

    if ((this.props.room.room_type === 'office' && mouseOver) && !onHomeFloor && _.size(this.props.pinned) < this.props.maxPinnables) { // and make sure the office isn't owned by the current user already
      return <div className="renderPin">
        {tooltipMe('Pin Office', `pin${this.props.room.id}`,<i className="fa fa-star-o" onClick={this.doPinOffice.bind(this)}></i>)}
      </div>;
    }
  };

  updateRoomName = (name) => {
    this.setState({ renderEditableRoomName: false });
    return renameRoom(this.props.room.id, name);
  };

  renderEditableRoomName = () => {
    const { room } = this.props;
    return <div className="commonName" id={`roomname_${room.id}`}>
      <EditableInput display={_.truncate(room.name, { length: MAX_OFFICE_CHARS })} editingStyle="blackText"
                     changeAction={this.updateRoomName} editing={false}
                     tabIndex={12}    editing={this.state.renderEditableRoomName}/>
    </div>;
  };

  getOccupants = () => {
    return _.chain(getOnlineUsers(this.props.userList))
      .map((user)=> {
        if (user.current_room_id === _.get(this.props, 'room.id')) {
          return user;
        }
      }).compact()
      .orderBy(['last_room_entered_at'], ['asc'])
      .value();
  };

  renderOccupants= () => {
    const occupants = this.getOccupants();
    const displayLocation = _.size(occupants) > this.props.maxOccupancy ?  AVATAR_DISPLAY_LOCATIONS.ROOM_CONDENSED : AVATAR_DISPLAY_LOCATIONS.ROOM;

    return (_.map(occupants, (occupant) => {
      return (<Avatar firstName={occupant.first_name} lastName={occupant.last_name} color={occupant.color} key={occupant.id} id={occupant.id}
                     state={occupant.state} displayLocation={displayLocation} isGhost={occupant.isGhost} isGuest={occupant.is_guest}></Avatar>);
    }));
  };

  render() {
    const doMouseEnter = () => this.setState({ showOwner: true });
    const doMouseLeave = () => this.setState({ showOwner: false });
    const owner = this.getOwner();
    return (

      <div className={this.getStyle()} onDoubleClick={this.doKnock}
           onMouseEnter={doMouseEnter}
           onMouseLeave={doMouseLeave}
           key={this.props.room.id}>

        <div className="pl8 occupants">
          {this.renderOccupants()}
        </div>
          {this.renderRoomName(owner)}
        {this.state.showOwner && this.renderClaimOffice(owner)}
        {owner && this.renderPinIt(this.state.showOwner, this.props.onHomeFloor)}
        </div>
    );
  }

  componentDidUpdate() {
    if (this.state.renderEditableRoomName) {
      const inputFields = jQuery(`#roomname_${this.props.room.id} :input`);
      if (inputFields && inputFields[0]) {
        inputFields[0].select();
      }
    }
  }
}

Office
  .defaultProps = {
  room: {},
  userList: {},
  currentUserId: null
};

export default Office;
