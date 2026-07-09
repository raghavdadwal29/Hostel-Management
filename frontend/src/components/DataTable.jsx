import React from 'react';
import EmptyState from './EmptyState';
import Loader from './Loader';

const DataTable = ({ columns, data, loading, emptyTitle = 'No records found', emptySubtitle }) => {
  if (loading) return <Loader />;
  if (!data || data.length === 0) return <EmptyState title={emptyTitle} subtitle={emptySubtitle} />;

  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-black/5 dark:border-white/10">
            {columns.map((col) => (
              <th key={col.key} className="py-3 pr-4 font-semibold whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row._id || i} className="border-b border-black/5 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition">
              {columns.map((col) => (
                <td key={col.key} className="py-3 pr-4 align-middle whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
