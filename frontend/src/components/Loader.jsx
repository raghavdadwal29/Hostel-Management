import React from 'react';

const Loader = ({ full }) => (
  <div className={full ? 'min-h-screen flex items-center justify-center' : 'flex items-center justify-center py-16'}>
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" />
      <p className="text-sm text-gray-400">Loading...</p>
    </div>
  </div>
);

export default Loader;
