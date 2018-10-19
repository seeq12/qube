import { SET_ADMIN_ONLY_MODE } from '../constants/actionTypes';
import initialState from './initialState';

export default function adminOnlyModeReducer(state = initialState.adminOnlyMode, action) {
  switch (action.type) {
    case SET_ADMIN_ONLY_MODE:
      return  _.get(action, 'enabled', false);
    default:
      return state;
  }
}