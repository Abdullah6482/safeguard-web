import React from 'react';

export default function Alert({ type = 'info', message, title }) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div className={`p-4 rounded-lg border ${styles[type]} mb-4`}>
      {title && <h5 className="font-semibold mb-1">{title}</h5>}
      <p className="text-sm">{message}</p>
    </div>
  );
}
