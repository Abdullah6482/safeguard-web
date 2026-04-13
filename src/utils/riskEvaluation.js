export const RiskTiers = {
  LOW: { label: 'Low', color: '#10B981', bg: '#D1FAE5' },
  MEDIUM: { label: 'Medium', color: '#F59E0B', bg: '#FEF3C7' },
  HIGH: { label: 'High', color: '#F97316', bg: '#FFEDD5' },
  CRITICAL: { label: 'Critical', color: '#EF4444', bg: '#FEE2E2' },
};

export function evaluateRisk(probability, severity) {
  const p = Math.max(1, Math.min(5, Number(probability) || 1));
  const s = Math.max(1, Math.min(5, Number(severity) || 1));
  const score = p * s;

  if (score >= 16) return { score, ...RiskTiers.CRITICAL };
  if (score >= 10) return { score, ...RiskTiers.HIGH };
  if (score >= 5) return { score, ...RiskTiers.MEDIUM };
  return { score, ...RiskTiers.LOW };
}
