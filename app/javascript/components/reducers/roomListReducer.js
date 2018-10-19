import { ROOMS_LOADED, UPDATE_ROOM } from '../constants/actionTypes';
import objectAssign from 'object-assign';
import initialState from './initialState';

export default function roomListReducer(state = initialState.rooms, action) {
  let newState;

  switch (action.type) {
    case ROOMS_LOADED:
      newState = objectAssign({}, state);
      newState = action.data;
      return newState;
    case UPDATE_ROOM:
      return _.map(state, (current) => {
        if (current.id === action.data.id) {
          return _.assign({}, current, action.data);
        } else {
          return current;
        }
      });
    default:
      return state;
  }
}
