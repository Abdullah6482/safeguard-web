import React from 'react';

export default function ExecutivePrintReport({ report }) {
  if (!report) return null;

  return (
    <div className="print-report bg-white p-8 max-w-3xl mx-auto border border-slate-200">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">INCIDENT INVESTIGATION REPORT</h1>
        <p className="text-sm text-slate-500">Report Ref: {report.id} • Issued: {new Date().toLocaleDateString()}</p>
      </div>
      <div className="space-y-4">
        <div><h4 className="font-semibold text-slate-800">Title:</h4><p className="text-slate-700">{report.title}</p></div>
        <div><h4 className="font-semibold text-slate-800">Description:</h4><p className="text-slate-700">{report.description}</p></div>
        <div><h4 className="font-semibold text-slate-800">Classification:</h4><p className="text-slate-700">{report.incidentType} (Risk: {report.severity})</p></div>
      </div>
    </div>
  );
}
