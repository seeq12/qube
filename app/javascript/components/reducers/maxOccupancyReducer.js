import { SET_MAX_OCCUPANCY } from '../constants/actionTypes';
import initialState from './initialState';

export default function maxOccupancyReducer(state = initialState.maxOccupancy, action) {
  switch (action.type) {
    case SET_MAX_OCCUPANCY:
      return _.assign({}, state, action.maxOccupancy);
    default:
      return state;
  }
}
