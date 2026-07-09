import React from 'react';
import CampusBackdrop from '../../components/CampusBackdrop';

// Shared visual shell for all auth screens - mirrors the CGC University
// hostel portal login look: full-bleed campus backdrop, maroon banner,
// angled white card panel on the left.
const AuthShell = ({ children }) => (
  <div className="relative min-h-screen w-full overflow-hidden bg-navy-900">
    <CampusBackdrop />

    {/* maroon banner */}
    <div
      className="absolute top-0 left-0 hidden sm:block"
      style={{
        width: 0,
        height: 0,
        borderTop: '160px solid #8f1e26',
        borderRight: '90px solid transparent',
      }}
    />

    <div className="relative min-h-screen flex items-center px-4 sm:px-0">
      <div
        className="w-full max-w-md sm:ml-0 sm:pl-10 sm:pr-14 py-10 sm:py-14 bg-white/95 backdrop-blur rounded-2xl sm:rounded-none shadow-panel"
        style={{ clipPath: 'none' }}
      >
        <div className="sm:pr-4">{children}</div>
      </div>
    </div>
  </div>
);

export default AuthShell;
