import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function IncidentTrendAreaChart({ data = [] }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200">
      <h3 className="text-base font-semibold text-slate-900 mb-4">Incident Frequency Trend</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} />
            <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="count" stroke="#0D9488" strokeWidth={2} fillOpacity={1} fill="url(#colorIncidents)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
