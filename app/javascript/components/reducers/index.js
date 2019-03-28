import { combineReducers } from 'redux';
import userList from './userListReducer';
import rooms from './roomListReducer';
import currentUserId from './currentUserReducer';
import meetingConfig from './meetingConfigReducer';
import maxOccupancy from './maxOccupancyReducer';
import themes from './themeReducer';
import floors from './floorsReducer';
import departments from './departmentsReducer';
import floorPlanTransforms from './floorPlanTransformReducer';
import currentFloorId from './currentFloorReducer';
import adminDisplay from './adminToolReducer';
import adminOnlyMode from './adminOnlyModeReducer';
import selfRegistration from './selfRegistrationReducer';
import backUpFloorId from './backupFloorReducer';
import sidePanelSearchTerm from './sidePanelSearchTermReducer';
import { routerReducer } from 'react-router-redux';

const rootReducer = combineReducers({
    userList,
    currentUserId,
    rooms,
    meetingConfig,
    themes,
    floorPlanTransforms,
    maxOccupancy,
    floors,
    departments,
    currentFloorId,
    backUpFloorId,
    adminDisplay,
    adminOnlyMode,
    selfRegistration,
    sidePanelSearchTerm,
    routing: routerReducer
  });

export default rootReducer;
