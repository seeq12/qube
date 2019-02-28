import { SET_SIDE_PANEL_SEACH_TERM } from '../constants/actionTypes';
import initialState from './initialState';

export default function sidePanelSearchTermReducer(state = initialState.sidePanelSearchTerm, action) {
  switch (action.type) {
    case SET_SIDE_PANEL_SEACH_TERM:
      return action.sidePanelSearchTerm;
    default:
      return state;
  }
}
