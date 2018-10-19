import {APPLICATION_LOAD} from '../constants/actionTypes';
import objectAssign from 'object-assign';
import initialState from './initialState';

// IMPORTANT: Note that with Redux, state should NEVER be changed.
// State is considered immutable. Instead,
// create a copy of the state passed and set new values on the copy.
// Note that I'm using Object.assign to create a copy of current state
// and update values on the copy.
export default function authenticationReducer(state = initialState.config, action) {
  let newState;

  switch (action.type) {
    case APPLICATION_LOAD:
      newState = objectAssign({}, state);
      newState = action.data;
      return newState;
    default:
      return state;
  }
}
