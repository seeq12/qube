import { SET_FLOORPLAN_TRANSFORMS } from '../constants/actionTypes';
import initialState from './initialState';

export default function floorPlanTransformReducer(state = initialState.floorPlanTransforms, action) {
  switch (action.type) {
    case SET_FLOORPLAN_TRANSFORMS:
      return _.assign({}, state, action.transforms);
    default:
      return state;
  }
}
