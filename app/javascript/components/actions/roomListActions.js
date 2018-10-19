import * as types from '../constants/actionTypes';

export function updateRoomProperty(data) {
  return (dispatch) =>  {
    return dispatch({
      type: types.UPDATE_ROOM,
      data
    });
  };
}

export function setRoomMaxOccupancy(maxOccupancy) {
  return (dispatch) => {
    return dispatch({
      type: types.SET_MAX_OCCUPANCY,
      maxOccupancy
    });
  };
}

