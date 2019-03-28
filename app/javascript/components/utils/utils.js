import _ from 'lodash';
import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import moment from 'moment-timezone/builds/moment-timezone-with-data';
import { enterRoom, knock } from './api.utils';

window['moment'] = moment;

export function getRoom(rooms, id) {
  if (!_.isEmpty(rooms) && id) {
    return _.find(rooms, { id: id });
  }
}

export function getOnlineUsers(userList, currentUserId, currentRoomId) {
  return _.chain(userList)
    .filter({ present: true })
    .difference(getUsersInRoom(userList, currentUserId, currentRoomId))
    .reject({ id: currentUserId })
    .orderBy(function(user) {
      return user.first_name.toLowerCase();
    }, 'asc')
    .value();
}

export function getUsersInRoom(userList, currentUserId, currentRoomId) {
  if (!_.isEmpty(userList)) {
    return _.chain(userList)
      .filter({ current_room_id: currentRoomId, present: true })
      .reject({ id: currentUserId })
      .orderBy(function(user) {
        return _.get(user, 'first_name').toLowerCase();
      }, 'asc').value();
  } else {
    return [];
  }
}

export function getOfflineUsers(userList) {
  return _.chain(userList)
    .filter({ present: false })
    .orderBy(function(user) {
      return user.first_name.toLowerCase();
    }, 'asc')
    .value();
}

export function formatTime(time, timezone) {
  return moment(time).tz(timezone).format('h:mm a');
}

export function formatLoginTime(time, timezone) {
  return moment(time).tz(timezone).format('MM-DD-YYYY, h:mm a');
}

export function clearMeeting() {
  jQuery('#meetingFrameWrapper').empty();
}

export function joinMeeting(meetingId) {
  startMeeting('https://zoom.us/j/' + meetingId);
}

export function startMeeting(meetingUrl) {
  const meetingFrame = '<iframe id="zoomFrame" style="width: 1px; height:1px;" src="' + meetingUrl + '"></iframe>';
  // Remove old iframe from the DOM and replace with new iframe
  if (meetingUrl !== null) {
    jQuery('#meetingFrameWrapper').empty().append(meetingFrame);
    setTimeout(() => {
      clearMeeting();
    }, 1800000);
  } else {
    clearMeeting();
  }
}

export function formatDateTime(timestamp, timezone) {
  return moment(timestamp).tz(timezone).format('MMMM Do, YYYY h:mm a');
}

export function getInitialZoomLevel(expectedWidth, expectedHeight) {
  const xBuff = 100;
  const yBuff = 50;
  const availableHeight = window.innerHeight - 70 - yBuff;
  const availableWidth = window.innerWidth - 250 - xBuff;

  const scale = _.min([availableWidth / expectedWidth, availableHeight / expectedHeight]);

  // determine translation based on initial scale:
  const width = expectedWidth * scale;
  const height  = expectedHeight * scale;

  const y =  (availableHeight -  height + yBuff) / 2;
  const x =  (availableWidth - width + xBuff) / 2;
  return { scale, x, y };
}

export function tooltipMe(tooltip, id, toolTipped, placement='top') {
  return <OverlayTrigger
      overlay={<Tooltip id={`id`}>{tooltip}</Tooltip>}
      placement={placement}>
        {toolTipped}
      </OverlayTrigger>;
}

export function knockOrGo(roomId, currentRoomId, homeId, roomList) {
  if (roomId === currentRoomId) {
    return;
  }

  const room = _.find(roomList, { id: roomId });
  if (_.get(room, 'room_type', 'office') !== 'office' || homeId === roomId) {
    enterRoom(roomId);
  } else {
    knock(roomId);
  }
}

export function getUserName(user, selfRegistration) {
  const firstName = _.get(user, 'first_name', '');
  const lastName = _.get(user, 'last_name', '');
  if (selfRegistration) {
    return (!!firstName ? firstName : 'No name?!');
  } else {
    return (!!firstName ? firstName : '') + ' ' + (!!lastName ? lastName : '');
  }
}

