import React from 'react';

const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase().trim();

  if (normalized === 'completed') {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
        Completed
      </span>
    );
  }

  if (normalized === 'on hold' || normalized === 'onhold') {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
        On Hold
      </span>
    );
  }

  // Default In Progress
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-600 border border-sky-200">
      In Progress
    </span>
  );
};

export default StatusBadge;
