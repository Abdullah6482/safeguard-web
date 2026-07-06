import { NotificationStore } from '../notificationStore';

describe('Notification Store Tests', () => {
  test('adds notification and updates unread count', () => {
    NotificationStore.add('Spill Reported', 'Area 4 chemical storage', 'warning');
    expect(NotificationStore.getUnreadCount()).toBeGreaterThan(0);

    NotificationStore.markAllAsRead();
    expect(NotificationStore.getUnreadCount()).toBe(0);
  });
});
