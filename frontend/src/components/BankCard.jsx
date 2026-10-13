import React from 'react';

const badgeColors = {
  B1: 'bg-sky-100 text-sky-700 border-sky-200',
  B2: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  B3: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  B4: 'bg-amber-100 text-amber-700 border-amber-200',
};

const topBorderColors = {
  B1: 'before:bg-sky-500',
  B2: 'before:bg-emerald-500',
  B3: 'before:bg-cyan-500',
  B4: 'before:bg-amber-500',
};

const BankCard = ({ account }) => {
  const code = account.code || 'B1';
  const badgeStyle = badgeColors[code] || badgeColors.B1;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Account identifier and code badge */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
          {account.accountIdentifier || 'ACCOUNT'}
        </span>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badgeStyle}`}>
          {code}
        </span>
      </div>

      {/* Bank Name */}
      <h3 className="text-sm font-bold text-slate-800 mb-3">
        {account.bankName}
      </h3>

      {/* Balances */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center justify-between text-slate-600">
          <span className="text-slate-400 text-[11px]">bal.</span>
          <span className="font-semibold text-slate-800">
            {Number(account.balance).toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span className="text-slate-400 text-[11px]">credit.</span>
          <span className="font-semibold text-slate-500">
            {Number(account.credit).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BankCard;
