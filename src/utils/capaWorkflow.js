export function canTransitionCapa(currentStatus, nextStatus) {
  const validTransitions = {
    pending: ['in_progress', 'cancelled'],
    in_progress: ['review', 'pending'],
    review: ['completed', 'in_progress'],
    completed: ['review'],
  };

  const allowed = validTransitions[currentStatus] || [];
  return allowed.includes(nextStatus);
}
