import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import AddExpenseModal from './AddExpenseModal';
import AddSiteModal from './AddSiteModal';

const Layout = () => {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-vh-100 flex bg-[#f8fafc] text-slate-800">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar
          onOpenAddExpense={() => setIsAddExpenseOpen(true)}
          onOpenAddSite={() => setIsAddSiteOpen(true)}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet
            context={{
              openAddExpense: () => setIsAddExpenseOpen(true),
              openAddSite: () => setIsAddSiteOpen(true),
              globalSearch,
              refreshTrigger,
              triggerRefresh,
            }}
          />
        </main>
      </div>

      {/* Global Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onExpenseAdded={triggerRefresh}
      />

      <AddSiteModal
        isOpen={isAddSiteOpen}
        onClose={() => setIsAddSiteOpen(false)}
        onSiteSaved={triggerRefresh}
      />
    </div>
  );
};

export default Layout;
