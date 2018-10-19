import { DISPLAY_ADMIN_TOOL, SET_ADMIN_ONLY_MODE } from '../constants/actionTypes';
import objectAssign from 'object-assign';
import initialState from './initialState';

export default function adminToolReducer(state = initialState.adminDisplay, action) {
  let newState;
  switch (action.type) {
    case DISPLAY_ADMIN_TOOL:
      return !state;
    default:
      return state;
  }
}
