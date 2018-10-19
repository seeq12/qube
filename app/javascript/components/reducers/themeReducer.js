import {SET_THEMES} from '../constants/actionTypes';
import objectAssign from 'object-assign';
import initialState from './initialState';

export default function authenticationReducer(state = initialState.themes, action) {
  let newState;

  switch (action.type) {
    case SET_THEMES:
      newState = objectAssign({}, state);
      newState = action.data.data.themes;
      return newState;
    default:
      return state;
  }
}
