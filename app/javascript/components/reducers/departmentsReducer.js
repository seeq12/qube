import { REMOVE_DEPARTMENT, SET_DEPARTMENTS, UPDATE_OR_ADD_DEPARTMENT } from '../constants/actionTypes';
import objectAssign from 'object-assign';
import initialState from './initialState';
import _ from 'lodash';

export default function departmentsReducer(state = initialState.departments, action) {
  let newState;
  let deptIndex;
  switch (action.type) {
    case SET_DEPARTMENTS:
      newState = objectAssign({}, state);
      newState = action.data.data;
      return newState;
    case REMOVE_DEPARTMENT:
      deptIndex = _.findIndex(state, { id: action.data.id });
      if (deptIndex > -1) {
        return [
          ...state.slice(0, deptIndex), ...state.slice(deptIndex + 1)
        ];
      } else {
        return state;
      }

    case UPDATE_OR_ADD_DEPARTMENT:
      deptIndex = _.findIndex(state, { id: action.data.id });
      if (deptIndex > -1) {
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

    default:
      return state;
  }
}
