import React from 'react';
import { calculatePillarMetrics } from '../../utils/pillarAnalysis';

export default function PillarComparisonCard({ scores }) {
  const { max, avg, dominantPillar } = calculatePillarMetrics(scores);

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200">
      <h4 className="text-sm font-semibold text-slate-800 mb-3">Enterprise Risk Profile</h4>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-500 mb-1">Max Severity</div>
          <div className="text-xl font-bold text-red-600">{max} / 5</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-500 mb-1">Average Score</div>
          <div className="text-xl font-bold text-teal-600">{avg}</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-500 mb-1">Critical Pillar</div>
          <div className="text-sm font-bold text-slate-800 mt-1">{dominantPillar}</div>
        </div>
      </div>
    </div>
  );
}
