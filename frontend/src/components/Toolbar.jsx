import React from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';

const Toolbar = ({ search, onSearchChange, onAddClick, addLabel, children }) => (
  <div className="flex flex-wrap items-center gap-3 mb-5">
    {onSearchChange !== undefined && (
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search..."
          className="input pl-9"
        />
      </div>
    )}
    {children}
    <div className="flex-1" />
    {onAddClick && (
      <button onClick={onAddClick} className="btn-primary">
        <FiPlus size={16} /> {addLabel || 'Add New'}
      </button>
    )}
  </div>
);

export default Toolbar;
