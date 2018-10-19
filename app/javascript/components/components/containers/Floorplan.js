import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../../actions/loadActions';
import _ from 'lodash';
import { Office } from './Office';
import { MapInteractionCSS } from 'react-map-interaction';
import { getInitialZoomLevel, tooltipMe } from '../../utils/utils';
import { setRoomMaxOccupancy } from '../../actions/roomListActions';

export class Floorplan extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pinned: [],
      maxPinnables: -1,
      currentUserHomeFloor: -1,
      doCheckElevator: true,
      leftWing: [],
      rightWing: [],
      center: [],
      x: 0.5,
      y: 0.5,
      scale: 1,
      currentFloorId: null,
      backUpFloorId: null,
      fW: null,
      roomConfig: [{
        'roomCount': 66,
        'pinnables': 6,
        'maxOccupancy': {
          'office': 4,
          'watercooler': 20,
          'lobby': 15,
          'auditorium': 35,
          'cafeteria': 35,
          'meeting': 20
        },
        'width': 1570,
        'height': 940,
        'layout': {
          'leftWing': [
            [8, 9, 10, 11, 12, 13],
            ['x'],
            [14, 15, 16, 17, 18, 19],
            [20, 21, 22, 23, 24, 25],
            ['x'],
            [26, 27, 28, 29, 30, 31],
            ['x'],
            [4, 5],
            ['x'],
            [32, 33, 34, 35, 36, 37],
            [38, 39, 40, 41, 42, 43]
          ],
          'center': [
            [0, 1, 2, 3]
          ],
          'rightWing': [
            [44, 45, 46, 47, 48, 49],
            ['x'],
            [6, 7],
            ['x'],
            [50, 51, 52, 53, 54, 55],
            [56, 57, 58, 59, 60, 61],
            ['x'],
            [62, 63, 64, 65, 66, 67],
            [68, 69, 70, 71, 72, 73],
            ['x'],
            ['PIN-0', 'PIN-1', 'PIN-2', 'PIN-3', 'PIN-4', 'PIN-5']
          ]
        }
      }, {
        'roomCount': 54,
        'pinnables': 6,
        'maxOccupancy': {
          'office': 4,
          'watercooler': 15,
          'lobby': 15,
          'auditorium': 25,
          'cafeteria': 25,
          'meeting': 20
        },
        'width': 1570,
        'height': 820,
        'layout': {
          'leftWing': [
            [8, 9, 10, 11, 12, 13],
            ['x'],
            [14, 15, 16, 17, 18, 19],
            [20, 21, 22, 23, 24, 25],
            ['x'],
            [4, 5],
            ['x'],
            [26, 27, 28, 29, 30, 31],
            [32, 33, 34, 35, 36, 37]
          ],
          'center': [
            [0, 1, 2, 3]
          ],
          'rightWing': [
            [38, 39, 40, 41, 42, 43],
            ['x'],
            [6, 7],
            ['x'],
            [44, 45, 46, 47, 48, 49],
            [50, 51, 52, 53, 54, 55],
            [56, 57, 58, 59, 60, 61],
            ['x'],
            ['PIN-0', 'PIN-1', 'PIN-2', 'PIN-3', 'PIN-4', 'PIN-5']
          ]
        }
      }, {
        'roomCount': 45,
        'pinnables': 5,
        'maxOccupancy': {
          'office': 4,
          'watercooler': 15,
          'lobby': 15,
          'auditorium': 25,
          'cafeteria': 25,
          'meeting': 15
        },
        'width': 1435,
        'height': 820,
        'layout': {
          'leftWing': [
            [8, 9, 10, 11, 12],
            ['x'],
            [13, 14, 15, 16, 17],
            [18, 19, 20, 21, 22],
            ['x'],
            [4, 5],
            ['x'],
            [23, 24, 25, 26, 27],
            [28, 29, 30, 31, 32]
          ],
          'center': [
            [0, 1, 2, 3]
          ],
          'rightWing': [
            [33, 34, 35, 36, 37],
            ['x'],
            [6, 7],
            ['x'],
            [38, 39, 40, 41, 42],

            [43, 44, 45, 46, 47],
            [48, 49, 50, 51, 52],
            ['x'],
            ['PIN-0', 'PIN-1', 'PIN-2', 'PIN-3', 'PIN-4']
          ]
        }
      }, {
        'roomCount': 35,
        'pinnables': 5,
        'maxOccupancy': {
          'office': 4,
          'watercooler': 15,
          'lobby': 15,
          'auditorium': 25,
          'cafeteria': 25,
          'meeting': 15
        },
        'width': 1435,
        'height': 770,
        'layout': {
          'leftWing': [
            [8, 9, 10, 11, 12],
            ['x'],
            [13, 14, 15, 16, 17],
            [18, 19, 20, 21, 22],
            ['x'],
            [4, 5],
            ['x'],
            [23, 24, 25, 26, 27]
          ],
          'center': [
            [0, 1, 2, 3]
          ],
          'rightWing': [
            [28, 29, 30, 31, 32],
            ['x'],
            [6, 7],
            ['x'],
            [33, 34, 35, 36, 37],
            [38, 39, 40, 41, 42],
            ['x'],
            ['PIN-0', 'PIN-1', 'PIN-2', 'PIN-3', 'PIN-4']
          ]
        }
      }, {
        'roomCount': 25,
        'pinnables': 5,
        'maxOccupancy': {
          'office': 4,
          'watercooler': 15,
          'lobby': 15,
          'auditorium': 25,
          'cafeteria': 25,
          'meeting': 15
        },
        'width': 1435,
        'height': 595,
        'layout': {
          'leftWing': [
            [8, 9, 10, 11, 12],
            [13, 14, 15, 16, 17],
            ['x'],
            [4, 5],
            ['x'],
            [18, 19, 20, 21, 22]
          ],
          'center': [
            [0, 2, 3]
          ],
          'rightWing': [
            [23, 24, 25, 26, 27],
            ['x'],
            [6, 7],
            ['x'],
            [28, 29, 30, 31, 32],
            ['PIN-0', 'PIN-1', 'PIN-2', 'PIN-3', 'PIN-4']
          ]
        }
      }, {
        'roomCount': 10,
        'pinnables': 5,
        'maxOccupancy': {
          'office': 4,
          'watercooler': 15,
          'lobby': 15,
          'auditorium': 25,
          'cafeteria': 25,
          'meeting': 15
        },
        'width': 890,
        'height': 600,
        'layout': {
          'leftWing': [
            [8, 9, 10, 11, 12],
            [13, 14, 15, 16, 17],
            ['x'],
            [4, 5],
            ['x'],
            ['PIN-0', 'PIN-1', 'PIN-2', 'PIN-3', 'PIN-4']
          ],
          'center': [
            [0, 2, 3]
          ],
          'rightWing': []
        }
      }]
    };
  };

  renderRow = (row, meetingRoomRow) => {
    const { pinned, currentUserHomeFloor, currentFloorId } = this.state;
    const floorId = currentFloorId;
    const onHomeFloor = currentUserHomeFloor === floorId;
    return _.map(row, (columnRoomId, idx) => {
      const pinnedRoom = _.startsWith(columnRoomId, 'PIN');
      let room;

      if (pinnedRoom) {
        const pinnedEntry = _.find(pinned, { position_id: Number(columnRoomId.substring(4)) });
        if (pinnedEntry && onHomeFloor) {
          room = _.find(this.props.rooms, { id: _.get(pinnedEntry, 'room_id') });
        }else {
          return <div className={`${columnRoomId} pinColor`} key={columnRoomId}></div>;
        }
      } else {
        room = _.find(this.props.rooms, { floorplan_id: columnRoomId, floor_id: floorId });
      }

      return (<div className={ meetingRoomRow ? 'flexColumnContainer flexAlignCenter flexCenter flexFill' : 'flexColumnContainer flexAlignCenter'} key={_.get(room, 'id') || idx}>
        {
          !_.isUndefined(room) ?
            <Office selfRegistration={this.props.selfRegistration} room={room} userList={this.props.userList} currentUserId={this.props.currentUserId}
                    maxOccupancy={this.props.maxOccupancy[room.room_type]} roomCount={this.state.roomCount} onHomeFloor={onHomeFloor} maxPinnables={this.state.maxPinnables} pinned={this.state.pinned}/> :
            <div className="pt20" key={`space${idx}`}></div>
        }
      </div>);
    });
  };

  getKey = (idx, val) => {
    return val + '_' + idx;
  };

  panZoomHandler = (transform) => {
    const { scale, translation } = transform;
    this.props.actions.setFloorplanTransforms({ scale, x: translation.x, y: translation.y });
  };

  render() {
    const { leftWing, rightWing, center } = this.state;
    const scale = _.get(this.props.floorPlanTransforms, 'scale');
    return (
      <div id="officeSpace">
        <div className="logoCorner"></div>

        {scale && <MapInteractionCSS scale={scale} translation={{
          x: this.props.floorPlanTransforms.x,
          y: this.props.floorPlanTransforms.y
        }} onChange={({ scale, translation }) => this.panZoomHandler({ scale, translation })}>

          <div id="floorPlan" className="flexColumnContainer floorPlan p10 pb10 pr5 pl5">
            <div className="flexRowContainer flexSpaceBetween">
              {_.map(leftWing, (row, idx) => {
                return (
                  <div className="flexColumnContainer" key={this.getKey(idx, 'left')}>
                    {this.renderRow(row, _.size(row) === 2)}
                  </div>
                );
              })}
            </div>
            <div className="flexRowContainer flexSpaceBetween">
              {center.map((row) => {
                return this.renderRow(row);
              })}
            </div>

            <div className="flexRowContainer flexSpaceBetween">
              {rightWing.map((row, idx) => {
                return (<div className="flexColumnContainer" key={this.getKey(idx, 'right')}>
                  {this.renderRow(row, _.size(row) === 2)}
                </div>);
              })}
            </div>
          </div>
        </MapInteractionCSS>}
        <div className="elevatorMasker" style={{ height: $('#officeSpace').height() - 50 + 'px' }}></div>
        {this.renderFloorSelection()}
        {this.renderElevator()}
      </div>
    );
  }

  renderFloorSelection() {
    const { floors, currentFloorId, backUpFloorId } = this.props;
    const floorCount = _.size(floors);
    let widthStyle = 'nineFloorsOrMore';
    if (floorCount < 4) {
      widthStyle = 'threeFloorsOrLess';
    } else if (floorCount < 9) {
      widthStyle = 'moreThanThreeLessThanNine';
    }

    return <div className={`floorSelection ${widthStyle}`} onMouseLeave={()=> this.removePreview()} >
      {_.chain(floors)
        .sortBy('level')
        .reverse()
        .map((floor) => {
          const classNameString = (floor.id === currentFloorId || floor.id === backUpFloorId) ? 'floor current' : 'floor';
          


return <div className="floorWrapper" key={`wrapper_${floor.id}`}>
  { (currentFloorId === floor.id && currentFloorId !== backUpFloorId) && <div className="floorName">{floor.name}</div>}
            <div className={classNameString} key={`floorSelection${floor.id}`} onMouseEnter={()=> this.previewFloor(floor)} onClick={() => {
                                this.switchFloor(floor);
                              }}>
            {floor.level}</div></div>;
        }).value()}
    </div>;
  };

  previewFloor(floor) {
    this.props.actions.setCurrentFloorId(floor.id);
  }

  removePreview() {
    this.props.actions.setCurrentFloorId(this.state.backUpFloorId);
  }
  // make the previewed floor the current floor
  switchFloor(floor) {
    this.props.actions.setBackupFloorId(floor.id);
  };

  renderElevator() {
    let floors = _.clone(this.props.floors);
    return <div className="elevator">
      {_.chain(floors)
        .sortBy('level')
        .reverse()
        .map((floor) => {
          return <div className="floor" key={`elevator${floor.id}`}>
            <div className="elevatorDoorRight elevatorDoor"></div>
            <div className="elevatorDoorLeft elevatorDoor"></div>
            <span  id={`floorLabel${floor.id}`} className="label" >{floor.name}</span>
            </div>;
        }).value()}
    </div>;
  }

  animateElevator(level) {
    $('.elevatorDoorRight').velocity({ width: 108 },  { duration: 1000, complete: ()=> {
        $('.elevator').velocity({ translateY: (level - 1) * 200 },  { duration: 1000, complete: ()=> {
            $('.elevatorDoorLeft').velocity({ width: 0 }, { duration: 1000 });
            $('.elevatorDoorRight').velocity({ width: 0 }, { duration: 1000 });

          } });
      } });
    $('.elevatorDoorLeft').velocity({ width: 108 }, { duration: 1000 });

  }

  componentDidUpdate() {
    if (this.props.backUpFloorId !== this.state.backUpFloorId || this.state.backUpFloorId === null) { // this happens on selecting a floor
      this.setState({ backUpFloorId:  this.props.backUpFloorId, currentFloorId: -1 }, ()=> {;});
      this.props.actions.setCurrentFloorId(this.props.backUpFloorId);
      const currentFloor = _.find(this.props.floors, { id: this.props.backUpFloorId });
      this.animateElevator(_.get(currentFloor, 'level'));
    }

    if (this.state.currentFloorId !== this.props.currentFloorId) { // this happens on preview
      this.setState({ currentFloorId: this.props.currentFloorId }, this.setFloorPlan);
    }

    let pinnedOffices = [];
    const currentUser = _.find(this.props.userList, { id: this.props.currentUserId });
    if (currentUser) {
      pinnedOffices = currentUser.pinned_rooms;
      if (!_.isEqual(this.state.pinned, pinnedOffices)) {
        this.setState({ pinned: pinnedOffices });
      }

      const homeRoom = _.find(this.props.rooms, { id: currentUser.home_id });
      if (this.state.currentUserHomeFloor === -1) {
        if (homeRoom) {
          this.setState({ currentUserHomeFloor:  _.get(homeRoom, 'floor_id') });
        } else {
          this.setState({ currentUserHomeFloor:  _.get(this.props.floors, '[0].id') });
        }

      }

    }
  }

  setFloorPlan = () => {
    let roomCount = _.size(_.filter(this.props.rooms, { room_type: 'office', floor_id:  this.props.currentFloorId }));
    const config = this.state.roomConfig;
    const currentConfig = _.find(config, { roomCount });
    if (currentConfig) {
      this.props.setRoomMaxOccupancy(currentConfig.maxOccupancy);
      const { width, height, layout: { rightWing, leftWing, center }} = currentConfig;
      // calculate the initial zoom level:
      const floorplanSizing = getInitialZoomLevel(width, height);
      this.props.actions.setFloorplanTransforms(_.assign(floorplanSizing, { width, height }));
      this.setState({ width, height, rightWing, leftWing, center, maxPinnables: currentConfig.pinnables });
    }
  };
}

Floorplan.defaultProps = {
  userList: [],
  rooms: []
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(actions, dispatch),
    setRoomMaxOccupancy: bindActionCreators(setRoomMaxOccupancy, dispatch)
  };
};

const mapStateToProps = (...args) => {
  return {
    userList: args[0].userList,
    pinnedOffices: args[0].pinnedOffices,
    rooms: args[0].rooms,
    currentUserId: args[0].currentUserId,
    floorPlanTransforms: args[0].floorPlanTransforms,
    maxOccupancy: args[0].maxOccupancy,
    floors: args[0].floors,
    currentFloorId: args[0].currentFloorId,
    selfRegistration: args[0].selfRegistration,
    backUpFloorId: args[0].backUpFloorId
  };
};

export default connect(mapStateToProps,
  mapDispatchToProps)(Floorplan);
