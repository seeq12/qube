import { SET_PINNED_OFFICES } from '../constants/actionTypes';
import initialState from './initialState';

export default function pinnedOfficesReducer(state = initialState.pinned, action) {
  switch (action.type) {
    case SET_PINNED_OFFICES:
      return _.assign({}, state, action.pinnedOffices);
    default:
      return state;
  }
}
