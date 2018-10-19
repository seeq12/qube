import * as types from '../constants/actionTypes';

export function updateUserProperty(data) {
  return (dispatch) =>  {
    return dispatch({
      type: types.UPDATE_USER,
      data
    });
  };
}

export function addUser(data) {
  return (dispatch) =>  {
    return dispatch({
      type: types.ADD_USER,
      data
    });
  };
}

export function removeGuestUser(data) {
  return (dispatch) =>  {
    return dispatch({
      type: types.REMOVE_GUEST_USER,
      data
    });
  };
}

export function removeUser(data) {
  return (dispatch) =>  {
    return dispatch({
      type: types.REMOVE_USER,
      data
    });
  };
}

