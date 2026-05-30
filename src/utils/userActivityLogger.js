export function logUserActivity(userId, action, metadata = {}) {
  return {
    id: 'act_' + Date.now(),
    userId,
    action,
    metadata,
    timestamp: new Date().toISOString(),
  };
}
