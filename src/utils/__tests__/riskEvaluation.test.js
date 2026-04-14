import { evaluateRisk } from '../riskEvaluation';

describe('Risk Evaluation Tests', () => {
  test('rates 1x1 as Low Risk', () => {
    const res = evaluateRisk(1, 1);
    expect(res.score).toBe(1);
    expect(res.label).toBe('Low');
  });

  test('rates 3x3 as Medium Risk', () => {
    const res = evaluateRisk(3, 3);
    expect(res.score).toBe(9);
    expect(res.label).toBe('Medium');
  });

  test('rates 4x3 as High Risk', () => {
    const res = evaluateRisk(4, 3);
    expect(res.score).toBe(12);
    expect(res.label).toBe('High');
  });

  test('rates 5x5 as Critical Risk', () => {
    const res = evaluateRisk(5, 5);
    expect(res.score).toBe(25);
    expect(res.label).toBe('Critical');
  });
});
