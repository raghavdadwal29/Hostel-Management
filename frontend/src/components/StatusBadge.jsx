import React from 'react';

const map = {
  pending: 'badge-pending',
  in_progress: 'badge-progress',
  resolved: 'badge-resolved',
  approved: 'badge-approved',
  rejected: 'badge-rejected',
  paid: 'badge-paid',
  unpaid: 'badge-pending',
  partial: 'badge-progress',
  overdue: 'badge-overdue',
  active: 'badge-active',
  vacated: 'badge-pending',
  present: 'badge-approved',
  absent: 'badge-rejected',
  leave: 'badge-progress',
  requested: 'badge-pending',
  checked_in: 'badge-progress',
  checked_out: 'badge-active',
  not_applied: 'badge-pending',
};

const StatusBadge = ({ status }) => (
  <span className={map[status] || 'badge bg-gray-100 text-gray-600'}>{String(status).replace(/_/g, ' ')}</span>
);

export default StatusBadge;
