import React from 'react';

const PageHeader = ({ title, subtitle, actions }) => (
  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl font-bold font-display text-navy-900 dark:text-white">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

export default PageHeader;
