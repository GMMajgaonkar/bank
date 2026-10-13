import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  User,
  Plus,
  Box,
  HardHat,
  Receipt,
  Calendar,
  AlertCircle,
  Loader2,
  Package,
  Truck,
  CreditCard,
  Building2,
  Trash2,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import AddExpenseModal from '../components/AddExpenseModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { siteService, expenseService } from '../services/api';
import { formatCurrencyShort, formatCurrencyINR, formatDateDisplay, formatDateDDMMYYYY } from '../utils/formatters';

const SiteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const context = useOutletContext();
  const refreshTrigger = context?.refreshTrigger || 0;
  const triggerRefresh = context?.triggerRefresh || (() => {});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [siteData, setSiteData] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  // Expense modal pre-filled with this site
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(false);

  const fetchSiteDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await siteService.getById(id);
      if (res.data) {
        setSiteData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Construction site not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSiteDetails();
    }
  }, [id, refreshTrigger]);

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    try {
      setDeletingExpense(true);
      await expenseService.delete(expenseToDelete._id);
      setExpenseToDelete(null);
      triggerRefresh();
      fetchSiteDetails();
    } catch (err) {
      alert(err.message || 'Failed to delete expense.');
    } finally {
      setDeletingExpense(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
        <p className="text-sm">Loading construction site details...</p>
      </div>
    );
  }

  if (error || !siteData) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto mt-12 space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Site Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'Unable to retrieve the requested site record.'}</p>
        <Link
          to="/sites"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0088cc] rounded-xl"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Sites</span>
        </Link>
      </div>
    );
  }

  // Calculated metrics
  const budget = siteData.budget || 0;
  const totalSpent = siteData.totalSpent || 0;
  const remainingBudget = Math.max(0, budget - totalSpent);
  const clientReceived = siteData.clientReceived || 0;
  const balanceReceivable = Math.max(0, (siteData.contractValue || budget) - clientReceived);

  const spentPercent = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;
  const receivedPercent = budget > 0 ? Math.min(100, Math.round((clientReceived / budget) * 100)) : 0;

  const tabs = [
    'Overview',
    'Expenses',
    'Materials',
    'Labour',
    'Client Payments',
    'Suppliers',
  ];

  // Filtered expenses by active tab category
  const getTabExpenses = () => {
    if (!siteData.expenses) return [];
    if (activeTab === 'Materials') {
      return siteData.expenses.filter((e) => e.category === 'Material');
    }
    if (activeTab === 'Labour') {
      return siteData.expenses.filter((e) => e.category === 'Labour');
    }
    if (activeTab === 'Suppliers') {
      return siteData.expenses.filter((e) => !!e.supplier);
    }
    return siteData.expenses;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Back Navigation */}
      <div>
        <Link
          to="/sites"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to all sites</span>
        </Link>
      </div>

      {/* Site Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {siteData.name}
            </h1>
            <StatusBadge status={siteData.status} />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{siteData.location || 'Bengaluru'}</span>
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Client: {siteData.clientName}</span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Started: {formatDateDDMMYYYY(siteData.startDate)}</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-slate-400" />
            <span>Add Labour</span>
          </button>

          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-slate-400" />
            <span>Add Material</span>
          </button>

          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b3] rounded-xl active:scale-95 transition shadow-sm shadow-sky-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expenses</span>
          </button>
        </div>
      </div>

      {/* Budget Summary: 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Project Budget */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 mb-1">Project Budget</div>
          <div className="text-xl font-black text-slate-900 tracking-tight">
            {formatCurrencyShort(budget)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Total contract value</div>
        </div>

        {/* Total Spent */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 mb-1">Total Spent</div>
          <div className="text-xl font-black text-slate-900 tracking-tight">
            {formatCurrencyShort(totalSpent)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">{spentPercent}% utilized</div>
        </div>

        {/* Remaining Budget */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 mb-1">Remaining Budget</div>
          <div className="text-xl font-black text-slate-900 tracking-tight">
            {formatCurrencyShort(remainingBudget)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Available to spend</div>
        </div>

        {/* Client Received */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 mb-1">Client Received</div>
          <div className="text-xl font-black text-slate-900 tracking-tight">
            {formatCurrencyShort(clientReceived)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">{receivedPercent}% collected</div>
        </div>

        {/* Balance Receivable */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 mb-1">Balance Receivable</div>
          <div className="text-xl font-black text-sky-600 tracking-tight">
            {formatCurrencyShort(balanceReceivable)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Next due 06 Jun</div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-0 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">{siteData.name}</h2>
        </div>

        <div className="px-6 border-b border-slate-100 flex items-center gap-6 overflow-x-auto text-xs font-semibold">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 relative transition whitespace-nowrap ${
                activeTab === tab
                  ? 'text-sky-600 font-bold border-b-2 border-sky-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'Overview' && (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Expense Breakdown by Category */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
                  Expense breakdown
                </h3>

                {siteData.categoryBreakdown && siteData.categoryBreakdown.length > 0 ? (
                  <div className="space-y-4">
                    {siteData.categoryBreakdown.map((cat, idx) => {
                      const colors = [
                        'bg-sky-600',
                        'bg-amber-500',
                        'bg-emerald-500',
                        'bg-indigo-500',
                        'bg-purple-500',
                      ];
                      const color = colors[idx % colors.length];

                      return (
                        <div key={cat.category} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-medium">
                            <span className="text-slate-600">{cat.category}</span>
                            <span className="font-bold text-slate-800">
                              {cat.percentage}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${color} rounded-full transition-all duration-700`}
                              style={{ width: `${Math.max(5, Math.min(100, cat.percentage))}%` }}
                            ></div>
                          </div>
                          <div className="text-[10px] text-slate-400 text-right">
                            {formatCurrencyINR(cat.amount)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No expense breakdown data available yet.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Recent Transactions Card */}
            <div className="lg:col-span-5 bg-slate-50/60 rounded-2xl border border-slate-200/80 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Recent Transactions</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Latest activity on this site</p>
                </div>
                <button
                  onClick={() => setActiveTab('Expenses')}
                  className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 transition"
                >
                  View all
                </button>
              </div>

              <div className="space-y-3">
                {siteData.recentTransactions && siteData.recentTransactions.length > 0 ? (
                  siteData.recentTransactions.map((tx) => (
                    <div
                      key={tx._id}
                      className="bg-white rounded-xl border border-slate-200/70 p-3 flex items-center justify-between gap-3 shadow-sm hover:shadow transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                          {tx.category === 'Labour' ? (
                            <User className="w-4 h-4" />
                          ) : tx.category === 'Equipment' ? (
                            <Truck className="w-4 h-4" />
                          ) : (
                            <Box className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate">
                            {tx.description}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {formatDateDisplay(tx.date)} · {tx.category}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-slate-800">
                          {formatCurrencyINR(tx.amount)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-xs text-slate-400">
                    No transactions recorded for this site yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Expenses & Categories (Expenses, Materials, Labour, Suppliers) */}
        {activeTab !== 'Overview' && activeTab !== 'Client Payments' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {activeTab} Records ({getTabExpenses().length})
              </h3>

              <button
                onClick={() => setIsAddExpenseOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b3] rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Record</span>
              </button>
            </div>

            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Supplier</th>
                    <th className="py-3 px-3">Quantity</th>
                    <th className="py-3 px-3">Rate</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Paid</th>
                    <th className="py-3 px-3">Method</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getTabExpenses().length === 0 ? (
                    <tr>
                      <td colSpan="10" className="py-12 text-center text-slate-400">
                        No records found in this category. Click "Add Record" to log expenses.
                      </td>
                    </tr>
                  ) : (
                    getTabExpenses().map((exp) => (
                      <tr key={exp._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          {formatDateDDMMYYYY(exp.date)}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800 whitespace-nowrap">
                          {exp.description}
                        </td>
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {exp.category}
                        </td>
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          {exp.supplier || '-'}
                        </td>
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          {exp.quantity} {exp.unit}
                        </td>
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          ₹{exp.ratePerUnit}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800 whitespace-nowrap">
                          {formatCurrencyINR(exp.amount)}
                        </td>
                        <td className="py-3 px-3 text-emerald-600 font-medium whitespace-nowrap">
                          {formatCurrencyINR(exp.paidAmount || 0)}
                        </td>
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {exp.paymentMethod}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => setExpenseToDelete(exp)}
                            title="Delete Entry"
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Client Payments */}
        {activeTab === 'Client Payments' && (
          <div className="p-8 text-center max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Client Payments Status</h4>
            <p className="text-xs text-slate-500">
              Total Contract: <span className="font-bold text-slate-700">{formatCurrencyINR(budget)}</span>.
              Client has remitted <span className="font-bold text-emerald-600">{formatCurrencyINR(clientReceived)}</span> with a remaining receivable balance of <span className="font-bold text-sky-600">{formatCurrencyINR(balanceReceivable)}</span>.
            </p>
          </div>
        )}
      </div>

      {/* Add Expense Modal with preselected site */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onExpenseAdded={() => {
          triggerRefresh();
          fetchSiteDetails();
        }}
        preselectedSiteId={siteData._id}
      />

      {/* Delete Expense Modal */}
      <DeleteConfirmModal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleDeleteExpense}
        title="Delete Expense Entry"
        message={`Are you sure you want to delete "${expenseToDelete?.description}" (${formatCurrencyINR(expenseToDelete?.amount)})? This will recalculate the site's total spent and remaining budget immediately.`}
        deleting={deletingExpense}
      />
    </div>
  );
};

export default SiteDetails;
