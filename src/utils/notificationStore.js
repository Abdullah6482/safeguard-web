let notifications = [];

export const NotificationStore = {
  add(title, message, type = 'info') {
    const item = {
      id: 'notif_' + Date.now(),
      title,
      message,
      type,
      read: false,
      timestamp: new Date().toISOString(),
    };
    notifications.unshift(item);
    return item;
  },

  getAll() {
    return [...notifications];
  },

  getUnreadCount() {
    return notifications.filter(n => !n.read).length;
  },

  markAllAsRead() {
    notifications = notifications.map(n => ({ ...n, read: true }));
  },
};
