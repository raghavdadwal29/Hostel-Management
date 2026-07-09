import React from 'react';

// Stylized campus skyline backdrop (SVG) used behind the auth screens,
// evoking the CGC University campus without relying on an external photo.
const CampusBackdrop = () => (
  <svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4fa8e8" />
        <stop offset="55%" stopColor="#8cc8ef" />
        <stop offset="100%" stopColor="#dff0fb" />
      </linearGradient>
      <linearGradient id="bldgA" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#9c3b3b" />
        <stop offset="100%" stopColor="#7a2c2c" />
      </linearGradient>
      <linearGradient id="bldgB" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f4ece2" />
        <stop offset="100%" stopColor="#d9cfc0" />
      </linearGradient>
    </defs>
    <rect width="1280" height="720" fill="url(#sky)" />
    {/* soft clouds */}
    <g opacity="0.5" fill="#ffffff">
      <ellipse cx="220" cy="120" rx="90" ry="20" />
      <ellipse cx="980" cy="90" rx="120" ry="24" />
      <ellipse cx="700" cy="150" rx="70" ry="16" />
    </g>
    {/* distant green */}
    <rect x="0" y="560" width="1280" height="160" fill="#8fbf6b" opacity="0.6" />
    {/* buildings */}
    <rect x="520" y="330" width="120" height="290" fill="url(#bldgB)" />
    <rect x="660" y="380" width="90" height="240" fill="url(#bldgA)" />
    <rect x="770" y="300" width="110" height="320" fill="url(#bldgB)" />
    <rect x="900" y="360" width="100" height="260" fill="url(#bldgA)" />
    <rect x="1020" y="410" width="130" height="210" fill="url(#bldgB)" />
    {/* windows */}
    {Array.from({ length: 8 }).map((_, r) =>
      Array.from({ length: 4 }).map((__, c) => (
        <rect key={`w1-${r}-${c}`} x={540 + c * 22} y={350 + r * 30} width="10" height="14" fill="#fff7e0" opacity="0.85" />
      ))
    )}
    {/* ground / lawn foreground */}
    <path d="M0 620 Q 320 570 640 620 T 1280 620 V720 H0 Z" fill="#6fae4e" />
    <path d="M0 650 Q 320 610 640 650 T 1280 650 V720 H0 Z" fill="#5c9a41" />
  </svg>
);

export default CampusBackdrop;
