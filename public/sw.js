self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

let reminderTimeout;

const showNotification = (title, options) => {
  self.registration.showNotification(title, options);
};

const scheduleReminder = () => {
  // Clear any existing reminder
  if (reminderTimeout) {
    clearTimeout(reminderTimeout);
  }

  const now = new Date();
  const reminderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 0, 0); // 9 PM today

  let delay;
  if (now > reminderTime) {
    // If it's already past 9 PM, schedule for 9 PM tomorrow
    reminderTime.setDate(reminderTime.getDate() + 1);
    delay = reminderTime.getTime() - now.getTime();
    console.log(`Service Worker: Reminder scheduled for tomorrow at 9 PM.`);
  } else {
    // If it's before 9 PM, schedule for 9 PM today
    delay = reminderTime.getTime() - now.getTime();
    console.log(`Service Worker: Reminder scheduled for today at 9 PM.`);
  }

  reminderTimeout = setTimeout(() => {
    console.log('Service Worker: Triggering daily reminder.');
    showNotification('Jangan Lupa!', {
      body: 'Catat pengeluaran dan pemasukan Anda hari ini.',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'daily-reminder', // Use a tag to prevent multiple reminders
    });
    // Schedule the next day's reminder
    scheduleReminder();
  }, delay);
};

self.addEventListener('message', (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SCHEDULE_DAILY_REMINDER':
        console.log('Service Worker received: SCHEDULE_DAILY_REMINDER');
        scheduleReminder();
        break;
      case 'CANCEL_DAILY_REMINDER':
        console.log('Service Worker received: CANCEL_DAILY_REMINDER');
        if (reminderTimeout) clearTimeout(reminderTimeout);
        break;
      case 'SEND_TEST_NOTIFICATION':
        console.log('Service Worker received: SEND_TEST_NOTIFICATION');
        showNotification('Notifikasi Tes', {
          body: 'Notifikasi ini dikirim dari Service Worker.',
          icon: '/favicon.ico',
        });
        break;
      case 'SEND_BUDGET_ALERT':
        console.log('Service Worker received: SEND_BUDGET_ALERT');
        showNotification('Peringatan Budget', {
          body: event.data.message || 'Anda hampir mencapai batas budget bulanan Anda!',
          icon: '/favicon.ico',
          tag: 'budget-alert',
        });
        break;
    }
  }
});
