import React from 'react';
import { evaluateRisk } from '../../utils/riskEvaluation';

export default function RiskScoreBadge({ probability, severity }) {
  const { score, label, color, bg } = evaluateRisk(probability, severity);

  return (
    <span
      style={{ backgroundColor: bg, color }}
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border border-current"
    >
      {label} ({score})
    </span>
  );
}
