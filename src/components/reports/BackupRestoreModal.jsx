import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

export default function BackupRestoreModal({ isOpen, onClose, onDownloadBackup }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Backup & Restore Data">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Export your complete incident records, CAPA actions, and audit logs into a portable JSON backup file.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={onDownloadBackup}>Download Backup (.json)</Button>
        </div>
      </div>
    </Modal>
  );
}
