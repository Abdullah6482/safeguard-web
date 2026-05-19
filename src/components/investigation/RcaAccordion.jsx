import React from 'react';

export default function RcaAccordion({ steps = [], onUpdateStep }) {
  return (
    <div className="space-y-3 bg-white p-5 rounded-xl border border-slate-200">
      <h4 className="text-base font-semibold text-slate-900 mb-2">5-Whys Root Cause Analysis</h4>
      {steps.map((node, index) => (
        <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Why #{index + 1}
          </label>
          <input
            type="text"
            value={node.answer || ''}
            onChange={e => onUpdateStep && onUpdateStep(index, e.target.value)}
            placeholder="State the direct causal factor..."
            className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
      ))}
    </div>
  );
}
