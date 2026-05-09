import { canTransitionCapa } from '../capaWorkflow';

describe('CAPA Workflow Transitions', () => {
  test('allows advancing from pending to in_progress', () => {
    expect(canTransitionCapa('pending', 'in_progress')).toBe(true);
  });

  test('blocks skipping from pending directly to completed without review', () => {
    expect(canTransitionCapa('pending', 'completed')).toBe(false);
  });
});
