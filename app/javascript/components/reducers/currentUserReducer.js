import { SET_CURRENT_USER_ID } from '../constants/actionTypes';
import objectAssign from 'object-assign';
import initialState from './initialState';

export default function currentUserReducer(state = initialState.currentUserId, action) {
  let newState;
  switch (action.type) {
    case SET_CURRENT_USER_ID:
      newState = objectAssign({}, state);
      return action.userId;
      return newState;
    default:
      return state;
  }
}
