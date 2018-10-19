import {START_MEETING} from '../constants/actionTypes';
import objectAssign from 'object-assign';
import initialState from './initialState';

export default function authenticationReducer(state = initialState.meetingConfig, action) {
  let newState;

  switch (action.type) {
    case START_MEETING:
      newState = objectAssign({}, state);
      newState.meetingStarting = true;
      return newState;
    default:
      return state;
  }
}
