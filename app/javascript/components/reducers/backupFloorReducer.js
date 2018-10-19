import { SET_BACKUP_FLOOR_ID } from '../constants/actionTypes';
import initialState from './initialState';

export default function backupFloorReducer(state = initialState.backUpFloorId, action) {
  switch (action.type) {
    case SET_BACKUP_FLOOR_ID:
      return action.backUpFloorId;
    default:
      return state;
  }
}
