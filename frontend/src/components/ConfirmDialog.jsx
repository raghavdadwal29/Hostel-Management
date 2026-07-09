import React from 'react';
import Modal from './Modal';

const ConfirmDialog = ({ open, onClose, onConfirm, title = 'Are you sure?', message, confirmLabel = 'Confirm', danger = true }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
    <div className="flex justify-end gap-3">
      <button className="btn-outline" onClick={onClose}>Cancel</button>
      <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>{confirmLabel}</button>
    </div>
  </Modal>
);

export default ConfirmDialog;
