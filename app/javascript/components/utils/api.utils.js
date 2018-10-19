import axios from 'axios';
import { STATES } from '../constants/appConstants';

export function loadRooms() {
  return axios.get('/rooms.json').then(response => response.data);
}

export function loadUsers() {
  return axios.get('/users.json').then(response => response.data);
}

export function slackUser(userId) {
  axios.get('/users/' + userId + '/message');
}

export function inviteUser(userId) {
  return axios.post('/users/' + userId + '/invite');
}

export function watchUser(userId) {
  axios.patch('/users/' + userId + '/watch');
}

export function unwatchUser(userId) {
  axios.patch('/users/' + userId + '/unwatch');
}

export function startMeeting(roomId) {
  return axios.patch('/rooms/' + roomId + '/start_meeting');
}

export function endMeeting(roomId) {
  return axios.patch('/rooms/' + roomId + '/end_meeting');
}

export function updateStatus(status, userId) {
  return doPatchUpdate('/users/' + userId, { status });
}

export function updateState(state, userId) {
  return doPatchUpdate('/users/' + userId, { state });
}

export function updateEmotion(emotion, userId) {
  doPatchUpdate('/users/' + userId, { emotion });
}

export function updateColor(color, userId) {
  doPatchUpdate('/users/' + userId, { color });
}

export function updateBackBy(backByTime, userId) {
  return doPatchUpdate('/users/' + userId, { back_by: backByTime });
}

export function setUserAvailable(userId) {
  doPatchUpdate('/users/' + userId, { back_by: null, state: STATES.AVAILABLE, status: '' });
}

export function setUserSocial(userId) {
  doPatchUpdate('/users/' + userId, { back_by: null, state: STATES.SOCIAL, status: '' });
}

export function enterRoom(roomId) {
  return axios.patch('/rooms/' + roomId + '/enter');
}

export function knock(roomId) {
  return axios.post('/rooms/' + roomId + '/knock');
}

export function claimRoom(roomId) {
  return axios.patch('/rooms/' + roomId + '/claim');
}

export function assignRoomToUser(roomId, userId) {
  return axios({
    method: 'patch',
    url: '/rooms/' + roomId + '/claim',
    data: { user_id: userId }
  });
}

export function sendUserHome(userId) {
  return axios.patch('/users/' + userId + '/send_home');
}

export function fetchHistory() {
  return axios.get('/history');
}

export function fetchThemes() {
  return axios.get('/themes.json');
}

export function fetchDepartments() {
  return axios.get('/departments.json');
}

export function fetchFloors() {
  return axios.get('/floors.json');
}

export function signOut() {
  return axios.get('/users/sign_out');
}

export function setTheme(theme, userId) {
  return doPatchUpdate('/users/' + userId, { theme })
    .then(() => {
    location.reload(true);
  });
}

export function setTimezone(timezone, userId) {
  return doPatchUpdate('/users/' + userId, { timezone });
}

export function updatePMI(userId, usePmi) {
  doPatchUpdate('/users/' + userId, { 'use_pmi': usePmi });
}

export function updateHighscore(userId, score) {
  doPatchUpdate('/users/' + userId, { score });
}

export function fetchHighscore() {
  return axios.get('/high_score.json');
}

export function renameRoom(roomId, name) {
  return doPatchUpdate('/rooms/' + roomId, { name: name });
}

export function checkForSlack(userId) {
  return axios.get('/users/' + userId + '/slack_presence');
}

export function fetchSlackURLS() {
  return axios.get('/slack_urls');
}

export function fetchWeather() {
  return axios.get('/weather');
}

export function callUser(userId) {
  doPatchUpdate('/users/' + userId + '/call', {});
}

export function inviteAll(roomId) {
  axios.post('/rooms/' + roomId + '/invite');
}

export function inviteByDepartment(departmentId, roomId) {

  return axios({
    method: 'post',
    url: '/departments/' + departmentId + '/invite',
    data: { room_id: roomId }
  });
}

export function renameUser(userId, name) {
  return doPatchUpdate('/users/' + userId, { first_name: name });
}

export function updateDepartmentAssignment(userId, departmentId) {
  return doPatchUpdate('/users/' + userId, { department_id: departmentId });
}

export function updateFirstName(userId, name) {
  return doPatchUpdate('/users/' + userId, { first_name: name });
}

export function updateLastName(userId, name) {
  return doPatchUpdate('/users/' + userId, { last_name: name });
}


export function renameFloor(floorId, name) {
  return doPatchUpdate('/floors/' + floorId, { name });
}

export function setUserPresent(userId) {
  return doPatchUpdate('/users/' + userId, { present: true });
}

export function starRoom(roomId, position) {
  return doPatchUpdate('/rooms/' + roomId + '/star', { position_id: position });
}

export function unstarRoom(roomId) {
  return doPatchUpdate('/rooms/' + roomId + '/unstar');
}

export function deleteUser(userId) {
  console.log('delete user userId' + userId);
  return axios({
    method: 'delete',
    url: '/users/' + userId
  });
}

export function deleteFloor(floorId) {
  return axios({
    method: 'delete',
    url: '/floors/' + floorId
  });
}

export function deleteDepartment(departmentId) {
  return axios({
    method: 'delete',
    url: '/departments/' + departmentId
  });
}

export function loadApplicationSettings() {
  return axios.get('/settings.json');
}

export function logoutEveryone() {
  return doPatchUpdate('/settings/master_logout', {});
}

export function refreshEveryone() {
  return doPatchUpdate('/settings/master_refresh', {});
}

export function setAdminOnlyModeAPI(adminOnly) {
  return doPatchUpdate('/settings', { admin_mode: adminOnly });

}

export function setSelfRegistrationAPI(selfRegistration) {
  return doPatchUpdate('/settings', { self_registration: selfRegistration });
}

export function makeUserAdmin(userId, admin) {
  return doPatchUpdate('/users/' + userId, { admin });
}

export function renameDepartment(departmentId, name) {
  return doPatchUpdate('/departments/' + departmentId, { name });
}

export function updateFloorSize(floorId, size) {
  return doPatchUpdate('/floors/' + floorId, { size });
}

export function addDepartment(name) {
  return axios({
    method: 'post',
    url: '/departments',
    data: { name }
  });
}

export function addFloor(name, size, level) {
  return axios({
    method: 'post',
    url: '/floors',
    data: { name, size, level }
  });
}

export function addUser(userObj) {
  return axios({
    method: 'post',
    url: '/users/welcome',
    data: userObj
  });
}

export function reorderFloors(sortedFloorIds) {
  return axios({
    method: 'patch',
    url: '/floors/reorder',
    data: { order: sortedFloorIds }
  });
}

function doPatchUpdate(endpoint, data) {
  return axios({
    method: 'patch',
    url: endpoint,
    data: data
  });
}
