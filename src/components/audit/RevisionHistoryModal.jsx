import React from 'react';
import Modal from '../common/Modal';

export default function RevisionHistoryModal({ isOpen, onClose, revisions = [] }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Incident Revision History">
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {revisions.length === 0 ? (
          <p className="text-sm text-slate-500">No previous revisions recorded.</p>
        ) : (
          revisions.map((rev, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
              <span className="font-semibold text-slate-800 uppercase text-xs">{rev.field} changed:</span>
              <div className="mt-1 text-slate-600">
                <span className="line-through text-red-500 mr-2">{String(rev.from)}</span>
                <span className="text-emerald-600 font-medium">{String(rev.to)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
