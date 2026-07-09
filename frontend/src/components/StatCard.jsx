import React from 'react';

const StatCard = ({ icon: Icon, label, value, tone = 'primary', suffix = '' }) => {
  const tones = {
    primary: 'bg-primary-500/10 text-primary-600',
    navy: 'bg-navy-500/10 text-navy-700',
    gold: 'bg-gold-500/10 text-gold-600',
    green: 'bg-emerald-500/10 text-emerald-600',
    red: 'bg-red-500/10 text-red-600',
  };
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}>
        {Icon && <Icon size={22} />}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold font-display text-navy-900 dark:text-white leading-tight">
          {value}
          {suffix}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
