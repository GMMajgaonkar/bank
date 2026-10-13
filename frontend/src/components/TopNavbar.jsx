import React from 'react';
import { Search, Plus, Bell } from 'lucide-react';

const TopNavbar = ({ onOpenAddExpense, onOpenAddSite, globalSearch, setGlobalSearch }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Bar */}
      <div className="relative w-80 md:w-96">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search sites, clients, suppliers..."
          value={globalSearch || ''}
          onChange={(e) => setGlobalSearch && setGlobalSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200/70 focus:border-sky-500 focus:outline-none transition"
        />
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center gap-3">
        {/* + Add Expense button */}
        <button
          onClick={onOpenAddExpense}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-slate-500" />
          <span>Add Expense</span>
        </button>

        {/* + Add Site button */}
        <button
          onClick={onOpenAddSite}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b3] rounded-xl active:scale-95 transition shadow-sm shadow-sky-500/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Site</span>
        </button>

        {/* Notification Bell */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
            LI
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">
              Lorem Ipsum
            </div>
            <div className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">
              Business Owner
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
