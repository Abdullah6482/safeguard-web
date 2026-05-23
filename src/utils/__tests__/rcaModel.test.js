import { createRcaNode, validateRcaChain } from '../rcaModel';

describe('RCA Model Tests', () => {
  test('creates RCA node with proper step and root cause designation', () => {
    const node = createRcaNode(5, 'Why did valve fail?', 'Fatigue crack');
    expect(node.step).toBe(5);
    expect(node.isRootCause).toBe(true);
  });

  test('validates completed RCA chains', () => {
    const completeChain = [
      { step: 1, answer: 'Pump overheated' },
      { step: 2, answer: 'Coolant line clogged' },
    ];
    expect(validateRcaChain(completeChain)).toBe(true);
  });
});
