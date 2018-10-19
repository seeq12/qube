import { ADD_USER, LOAD_USER_LIST, UPDATE_USER, REMOVE_GUEST_USER, REMOVE_USER } from '../constants/actionTypes';
import objectAssign from 'object-assign';
import initialState from './initialState';
import _ from 'lodash';

export default function userListReducer(state = initialState.userList, action) {
  let newState;
  let userIndex;

  switch (action.type) {
    case LOAD_USER_LIST:
      newState = objectAssign({}, state);
      newState = action.data;
      return newState;
    case UPDATE_USER:
      // ADDS a new user if a user with given id does not exist yet
      userIndex = _.findIndex(state, { id: action.data.id });
      if (userIndex > -1) {
        newState = objectAssign({}, state);
        return _.map(newState, (current) => {
          if (current.id === action.data.id) {
            return _.assign({}, current, action.data);
          } else {
            return current;
          }
        });
      } else {
        if (_.has(action.data, 'first_name')) {
          return [...state, action.data];
        }

        return state;

      }

    case ADD_USER:
      return [...state, action.data];
    case REMOVE_GUEST_USER:
      const guestIndex = _.findIndex(state, { id: action.data.id, is_guest: true });
      if (guestIndex > -1) {
        return [
          ...state.slice(0, guestIndex), ...state.slice(guestIndex + 1)
        ];
      } else {
        return state;
      }

      return;
    case REMOVE_USER:
      userIndex = _.findIndex(state, { id: action.data.id });
      if (userIndex > -1) {
        return [
          ...state.slice(0, userIndex), ...state.slice(userIndex + 1)
        ];
      } else {
        return state;
      }

    default:
      return state;
  }
}
