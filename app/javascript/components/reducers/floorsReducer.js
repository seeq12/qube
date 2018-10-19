import { REMOVE_FLOOR, SET_FLOORS, UPDATE_FLOOR } from '../constants/actionTypes';
import objectAssign from 'object-assign';
import initialState from './initialState';
import _ from 'lodash';

export default function floorsReducer(state = initialState.floors, action) {
  let newState;
  let floorIndex;
  switch (action.type) {
    case SET_FLOORS:
      newState = objectAssign({}, state);
      newState = action.data.data;
      return newState;
    case UPDATE_FLOOR:
      floorIndex = _.findIndex(state, { id: action.data.id });
      if (floorIndex > -1) {
        newState = objectAssign({}, state);
        return _.map(newState, (current) => {
          if (current.id === action.data.id) {
            return _.assign({}, current, action.data);
          } else {
            return current;
          }
        });
      } else {
        // add the department
        return [...state, action.data];
      }

      return;
    case REMOVE_FLOOR:
      floorIndex = _.findIndex(state, { id: action.data.id });
      if (floorIndex > -1) {
        return [
          ...state.slice(0, floorIndex), ...state.slice(floorIndex + 1)
        ];
      } else {
        return state;
      }

    default:
      return state;

  }
}
