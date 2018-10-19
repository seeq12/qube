import {NotificationManager} from 'react-notifications';

export function showSuccessNotification(message) {
  NotificationManager.success(message);
}

export function showErrorNotification(message) {
  NotificationManager.error(message);
}

export function showWarningNotification(message) {
  NotificationManager.warning(message);
}

export function showInfoNotification(message) {
  NotificationManager.warning(message);
}