import React from 'react';

export default function Button({ children, variant = 'primary', size = 'md', disabled, loading, onClick, className = '', ...props }) {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none';
  const variants = {
    primary: 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700',
  };
  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
