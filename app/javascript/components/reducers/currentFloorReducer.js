import { SET_CURRENT_FLOOR_ID } from '../constants/actionTypes';
import initialState from './initialState';

export default function currentFloorReducer(state = initialState.currentFloorId, action) {
  switch (action.type) {
    case SET_CURRENT_FLOOR_ID:
      return action.currentFloorId;
    default:
      return state;
  }
}
