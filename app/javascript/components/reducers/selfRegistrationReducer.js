import { SET_SELF_REGISTRATION } from '../constants/actionTypes';
import initialState from './initialState';

export default function selfRegistrationReducer(state = initialState.selfRegistration, action) {
  switch (action.type) {
    case SET_SELF_REGISTRATION:
      return _.get(action, 'selfRegistration', false);
    default:
      return state;
  }
}
