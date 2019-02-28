import * as types from '../constants/actionTypes';
import { loadUsers, loadRooms, fetchThemes, fetchDepartments, fetchFloors } from '../utils/api.utils';

export function setCurrentUserId(userId) {
  return (dispatch) => {
    return dispatch({
      type: types.SET_CURRENT_USER_ID,
      userId
    });
  };
}

export function setCurrentFloorId(currentFloorId) {
  return (dispatch) => {
    return dispatch({
      type: types.SET_CURRENT_FLOOR_ID,
      currentFloorId
    });
  };
}

export function setBackupFloorId(backUpFloorId) {
  return (dispatch) => {
    return dispatch({
      type: types.SET_BACKUP_FLOOR_ID,
      backUpFloorId
    });
  };
}

export function loadUserList() {
  return (dispatch) => {
    return loadUsers().then((data) => {
        return dispatch({
          type: types.LOAD_USER_LIST,
          data
        });
      }
    );
  };
}

export function getRooms() {
  return (dispatch) => {
    return loadRooms().then((data) => {
        return dispatch({
          type: types.ROOMS_LOADED,
          data
        });
      }
    );
  };
}

export function loadThemes() {
  return (dispatch) => {
    return fetchThemes().then((data) => {
        return dispatch({
          type: types.SET_THEMES,
          data
        });
      }
    );
  };
}

export function setFloorplanTransforms(transforms) {
  return (dispatch) => {
    return dispatch({
        type: types.SET_FLOORPLAN_TRANSFORMS,
        transforms
      });
  };
}

export function loadFloors() {
  return (dispatch) => {
    return fetchFloors().then((data) => {
        return dispatch({
          type: types.SET_FLOORS,
          data
        });
      }
    );
  };
}

export function loadDepartments() {
  return (dispatch) => {
    return fetchDepartments().then((data) => {
        return dispatch({
          type: types.SET_DEPARTMENTS,
          data
        });
      }
    );
  };
}

export function removeDepartment(data) {
  return (dispatch) => {
        return dispatch({
              type: types.REMOVE_DEPARTMENT,
              data
            });
      };
};


export function removeFloor(data) {
  return (dispatch) => {
    return dispatch({
      type: types.REMOVE_FLOOR,
      data
    });
  };
};

export function setPinnedOffices(pinnedOffices) {
  return (dispatch) => {
    return dispatch({
      type: types.SET_PINNED_OFFICES,
      pinnedOffices
    });
  };
}

export function setAdminToolDisplay() {
  return (dispatch) => {
    return dispatch({
      type: types.DISPLAY_ADMIN_TOOL
    });
  };
}

export function updateFloor(data) {
  return (dispatch) => {
    return dispatch({
      type: types.UPDATE_FLOOR,
      data
    });
  };
}

export function updateOrAddDepartment(data) {
  return (dispatch) => {
    return dispatch({
      type: types.UPDATE_OR_ADD_DEPARTMENT,
      data
    });
  };
}
export function setSidePanelSearchTerm(sidePanelSearchTerm) {
  return (dispatch) => {
    return dispatch({
      type: types.SET_SIDE_PANEL_SEACH_TERM,
      sidePanelSearchTerm
    });
  };
}

