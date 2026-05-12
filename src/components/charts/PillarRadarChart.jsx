import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

export default function PillarRadarChart({ scores = {} }) {
  const data = [
    { pillar: 'People', value: scores.people || 0 },
    { pillar: 'Assets', value: scores.asset || 0 },
    { pillar: 'Environment', value: scores.environment || 0 },
    { pillar: 'Reputation', value: scores.reputation || 0 },
  ];

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200">
      <h3 className="text-base font-semibold text-slate-900 mb-4">4 Pillars Risk Radar</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#E2E8F0" />
            <PolarAngleAxis dataKey="pillar" stroke="#64748B" fontSize={12} />
            <PolarRadiusAxis angle={30} domain={[0, 5]} />
            <Radar name="Severity" dataKey="value" stroke="#0D9488" fill="#0D9488" fillOpacity={0.4} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
