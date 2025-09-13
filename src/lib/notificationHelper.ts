const NOTIFICATION_PERMISSION_KEY = 'notification_permission';

/**
 * Checks if the Notification API is supported by the browser.
 */
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

/**
 * Gets the current notification permission status.
 * Can be 'granted', 'denied', or 'default'.
 */
export const getNotificationPermission = (): NotificationPermission => {
  return Notification.permission;
};

/**
 * Requests permission from the user to show notifications.
 * Returns true if permission is granted, false otherwise.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported by this browser.');
    return false;
  }

  const permission = await Notification.requestPermission();

  // Store the decision so we don't ask again if denied.
  localStorage.setItem(NOTIFICATION_PERMISSION_KEY, permission);

  if (permission === 'granted') {
    console.log('Notification permission granted.');
    return true;
  } else {
    console.log('Notification permission denied.');
    return false;
  }
};

/**
 * Sends a simple test notification to confirm everything is working.
 */
export const sendTestNotification = () => {
  if (!isNotificationSupported() || getNotificationPermission() !== 'granted') {
    console.warn('Cannot send notification. Permission not granted or not supported.');
    return;
  }

  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SEND_TEST_NOTIFICATION' });
  } else {
    // Fallback for when SW is not active yet
    new Notification('Test Notification', {
      body: 'If you can see this, notifications are working!',
      icon: '/favicon.ico',
    });
  }
};

/**
 * Schedules a daily reminder notification at a specific time (e.g., 21:00).
 */
export const scheduleDailyReminder = () => {
  if (!isNotificationSupported() || getNotificationPermission() !== 'granted' || !navigator.serviceWorker.controller) {
    console.warn('Cannot schedule reminder. Conditions not met.');
    return;
  }
  // This is a simplified approach. A real app would use periodic background sync.
  // We are telling the SW to handle it.
  console.log('Requesting SW to schedule daily reminder...');
  navigator.serviceWorker.controller.postMessage({ type: 'SCHEDULE_DAILY_REMINDER' });
};

/**
 * Cancels any scheduled daily reminders.
 */
export const cancelDailyReminder = () => {
  if (!navigator.serviceWorker.controller) return;
  console.log('Requesting SW to cancel daily reminder...');
  navigator.serviceWorker.controller.postMessage({ type: 'CANCEL_DAILY_REMINDER' });
};
