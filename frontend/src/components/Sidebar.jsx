import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Building2,
  ReceiptText,
  HardHat,
  Package,
  Truck,
  UserCheck,
  CreditCard,
  BarChart2,
  Settings,
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutGrid, activeMatch: (p) => p === '/' },
    { name: 'Sites', path: '/sites', icon: Building2, activeMatch: (p) => p.startsWith('/sites') },
    { name: 'Expenses', path: '#', icon: ReceiptText, disabled: true },
    { name: 'Labour', path: '#', icon: HardHat, disabled: true },
    { name: 'Materials', path: '#', icon: Package, disabled: true },
    { name: 'Suppliers', path: '#', icon: Truck, disabled: true },
    { name: 'Site Owners', path: '#', icon: UserCheck, disabled: true },
    { name: 'Payments', path: '#', icon: CreditCard, disabled: true, badge: 5 },
    { name: 'Reports', path: '#', icon: BarChart2, disabled: true },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col h-screen sticky top-0 shrink-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 font-black text-xl tracking-tighter">
          G
        </div>
        <div>
          <div className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-700 via-sky-600 to-blue-800 bg-clip-text text-transparent leading-none">
            Geocrete
          </div>
          <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase mt-0.5">
            Arch Group
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            Workspace
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.activeMatch ? item.activeMatch(location.pathname) : false;

              if (item.disabled) {
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-sm font-medium transition cursor-default opacity-80"
                    title={`${item.name} (Preview module)`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#0088cc] text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        isActive ? 'bg-white text-[#0088cc]' : 'bg-sky-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Settings at Bottom */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium cursor-pointer transition">
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
