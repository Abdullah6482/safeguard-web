import React, { useState } from 'react';

export default function NotificationPreferences() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [criticalSound, setCriticalSound] = useState(true);

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 max-w-lg space-y-4">
      <h4 className="text-base font-semibold text-slate-900">Notification Preferences</h4>
      <label className="flex items-center justify-between text-sm text-slate-700 cursor-pointer">
        <span>Email Alerts for High/Critical Incidents</span>
        <input type="checkbox" checked={emailAlerts} onChange={e => setEmailAlerts(e.target.checked)} className="rounded text-teal-600" />
      </label>
      <label className="flex items-center justify-between text-sm text-slate-700 cursor-pointer">
        <span>Play Audio Chime on New Incident</span>
        <input type="checkbox" checked={criticalSound} onChange={e => setCriticalSound(e.target.checked)} className="rounded text-teal-600" />
      </label>
    </div>
  );
}
