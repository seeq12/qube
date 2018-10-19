import * as types from '../constants/actionTypes';

export function setAdminOnlyMode(enabled) {
  return (dispatch) => {
    return dispatch({
      type: types.SET_ADMIN_ONLY_MODE,
      enabled
    });
  };
}export function setSelfRegistrationMode(selfRegistration) {
  return (dispatch) => {
    return dispatch({
      type: types.SET_SELF_REGISTRATION,
      selfRegistration
    });
  };
}
