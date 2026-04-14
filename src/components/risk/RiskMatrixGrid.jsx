import React from 'react';
import { evaluateRisk } from '../../utils/riskEvaluation';

export default function RiskMatrixGrid({ onSelectCell, selectedProb, selectedSev }) {
  const rows = [5, 4, 3, 2, 1]; // Likelihood / Probability
  const cols = [1, 2, 3, 4, 5]; // Severity

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200">
      <h4 className="text-sm font-semibold text-slate-800 mb-3">5x5 Risk Heatmap Matrix</h4>
      <div className="grid grid-cols-5 gap-1.5 w-full max-w-xs">
        {rows.map(p =>
          cols.map(s => {
            const { score, color, bg } = evaluateRisk(p, s);
            const isSelected = selectedProb === p && selectedSev === s;
            return (
              <button
                key={`${p}-${s}`}
                onClick={() => onSelectCell && onSelectCell(p, s)}
                style={{ backgroundColor: bg, borderColor: color }}
                className={`h-10 rounded border font-semibold text-xs transition-transform hover:scale-105 flex items-center justify-center ${
                  isSelected ? 'ring-2 ring-slate-900 shadow-md' : ''
                }`}
              >
                <span style={{ color }}>{score}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
