import React from 'react';
import { FiInbox } from 'react-icons/fi';

const EmptyState = ({ title = 'Nothing here yet', subtitle }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
    <FiInbox size={36} className="mb-3 opacity-60" />
    <p className="font-semibold text-navy-700 dark:text-gray-200">{title}</p>
    {subtitle && <p className="text-sm mt-1 max-w-sm">{subtitle}</p>}
  </div>
);

export default EmptyState;
