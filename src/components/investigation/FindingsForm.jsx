import React from 'react';

export default function FindingsForm({ findings, onChangeFindings, recommendations, onChangeRecommendations }) {
  return (
    <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200">
      <h4 className="text-base font-semibold text-slate-900">Investigation Findings</h4>
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Factual Findings</label>
        <textarea
          rows={3}
          value={findings || ''}
          onChange={e => onChangeFindings && onChangeFindings(e.target.value)}
          className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
          placeholder="Summarize the physical evidence and witness testimonies..."
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Recommendations</label>
        <textarea
          rows={3}
          value={recommendations || ''}
          onChange={e => onChangeRecommendations && onChangeRecommendations(e.target.value)}
          className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
          placeholder="Proposed structural, procedural, or training interventions..."
        />
      </div>
    </div>
  );
}
