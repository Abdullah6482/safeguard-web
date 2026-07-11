import React from 'react';
import Modal from './Modal';

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  const shortcuts = [
    { key: '/', desc: 'Focus global search bar' },
    { key: 'N', desc: 'New incident report' },
    { key: 'Esc', desc: 'Close modals & drawers' },
    { key: 'E', desc: 'Export current table' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts">
      <div className="space-y-2">
        {shortcuts.map((s, i) => (
          <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-100 text-sm">
            <span className="text-slate-600">{s.desc}</span>
            <kbd className="px-2 py-1 bg-slate-100 rounded border border-slate-200 font-mono text-xs font-semibold">{s.key}</kbd>
          </div>
        ))}
      </div>
    </Modal>
  );
}
