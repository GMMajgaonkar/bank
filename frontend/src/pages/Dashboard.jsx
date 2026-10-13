import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import {
  Calendar,
  Building2,
  AlertTriangle,
  ArrowRight,
  Calculator,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import BankCard from '../components/BankCard';
import StatusBadge from '../components/StatusBadge';
import { dashboardService, siteService, expenseService } from '../services/api';
import { formatCurrencyShort, formatCurrencyINR, formatDateDDMMYYYY } from '../utils/formatters';

const Dashboard = () => {
  const navigate = useNavigate();
  const context = useOutletContext();
  const refreshTrigger = context?.refreshTrigger || 0;
  const triggerRefresh = context?.triggerRefresh || (() => {});

  // States
  const [loading, setLoading] = useState(true);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [sites, setSites] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('All');

  // Daily Expense Form State
  const initialFormState = {
    date: new Date().toISOString().split('T')[0],
    siteId: '',
    supplier: '',
    material: '',
    quantity: '',
    unit: 'Bags',
    ratePerUnit: '',
    paymentMethod: 'Bank Transfer',
    remark: '',
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // Load Dashboard Data
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [banksRes, summaryRes, sitesRes, expensesRes] = await Promise.all([
        dashboardService.getBankAccounts(),
        dashboardService.getSummary(),
        siteService.getAll(),
        dashboardService.getRecentExpenses({ siteId: selectedSiteFilter !== 'All' ? selectedSiteFilter : undefined }),
      ]);

      if (banksRes.data) setBankAccounts(banksRes.data);
      if (summaryRes.data) setDashboardData(summaryRes.data);
      if (sitesRes.data) {
        setSites(sitesRes.data);
        if (!formData.siteId && sitesRes.data.length > 0) {
          setFormData((prev) => ({ ...prev, siteId: sitesRes.data[0]._id }));
        }
      }
      if (expensesRes.data) setRecentExpenses(expensesRes.data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [refreshTrigger, selectedSiteFilter]);

  // Form Handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError(null);
  };

  const calculatedFormTotal = (parseFloat(formData.quantity) || 0) * (parseFloat(formData.ratePerUnit) || 0);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.siteId) {
      setFormError('Please select a construction site.');
      return;
    }

    const qty = parseFloat(formData.quantity);
    if (isNaN(qty) || qty <= 0) {
      setFormError('Quantity must be a positive number.');
      return;
    }

    const rate = parseFloat(formData.ratePerUnit);
    if (isNaN(rate) || rate <= 0) {
      setFormError('Rate per unit must be a positive number.');
      return;
    }

    try {
      setFormSubmitting(true);
      const totalAmount = Math.round(qty * rate * 100) / 100;

      const payload = {
        siteId: formData.siteId,
        date: formData.date,
        supplier: formData.supplier.trim() || 'Direct Supplier',
        material: formData.material.trim() || 'Cement',
        description: `${formData.material || 'Material'} – ${qty} ${formData.unit}`,
        category:
          formData.unit === 'Week' || formData.unit === 'Hours' || formData.material.toLowerCase().includes('labour')
            ? 'Labour'
            : formData.material.toLowerCase().includes('excavator') || formData.material.toLowerCase().includes('crane')
            ? 'Equipment'
            : formData.unit === 'Trucks'
            ? 'Transport'
            : 'Material',
        quantity: qty,
        unit: formData.unit,
        ratePerUnit: rate,
        paidAmount: totalAmount, // marked paid by default for quick entry
        paymentMethod: formData.paymentMethod,
        remark: formData.remark,
      };

      await expenseService.create(payload);
      setFormSuccess('Expense successfully recorded!');
      setFormData((prev) => ({
        ...initialFormState,
        siteId: prev.siteId,
        date: new Date().toISOString().split('T')[0],
      }));
      triggerRefresh();
      fetchDashboard();

      setTimeout(() => {
        setFormSuccess(null);
      }, 3500);
    } catch (err) {
      setFormError(err.message || 'Failed to submit expense entry.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Formatted date string matching screenshot: MONDAY, 26 MAY
  const currentDateDisplay = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).toUpperCase();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Sub Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold text-sky-600 tracking-wider uppercase mb-0.5">
            {currentDateDisplay}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Good morning, Lorem
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live financial overview</span>
          </span>
        </div>
      </div>

      {/* 1. Bank Accounts Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700">Bank Accounts</h2>
          <span className="text-xs font-medium text-slate-400">
            {bankAccounts.length} accounts active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bankAccounts.map((account) => (
            <BankCard key={account._id || account.accountIdentifier} account={account} />
          ))}
        </div>
      </section>

      {/* 2. Daily Expense Entry Form */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-sm font-bold text-slate-800">Add Daily Expenses</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Record today's material purchase and supplier payment.
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          {/* Row 1: Date, Construction Site, Supplier, Material */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Construction Site
              </label>
              <select
                name="siteId"
                value={formData.siteId}
                onChange={handleFormChange}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              >
                <option value="">Select site</option>
                {sites.map((site) => (
                  <option key={site._id} value={site._id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Supplier
              </label>
              <input
                type="text"
                name="supplier"
                placeholder="e.g. Shree cement co."
                value={formData.supplier}
                onChange={handleFormChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Material
              </label>
              <input
                type="text"
                name="material"
                placeholder="Cement"
                value={formData.material}
                onChange={handleFormChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>
          </div>

          {/* Row 2: Quantity, Unit, Rate Per Unit, Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Quantity
              </label>
              <input
                type="number"
                step="any"
                min="0.001"
                name="quantity"
                placeholder="0"
                value={formData.quantity}
                onChange={handleFormChange}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Unit
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleFormChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              >
                <option value="Bags">Bags</option>
                <option value="Tons">Tons</option>
                <option value="Trucks">Trucks</option>
                <option value="Week">Week</option>
                <option value="Month">Month</option>
                <option value="Hours">Hours</option>
                <option value="Units">Units</option>
                <option value="Phase">Phase</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Rate Per Unit
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                name="ratePerUnit"
                placeholder="₹ 0"
                value={formData.ratePerUnit}
                onChange={handleFormChange}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleFormChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              >
                <option value="Bank Transfer">Select method</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>
          </div>

          {/* Row 3: Remark & Action */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
            <div className="flex-1 w-full">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Remark
              </label>
              <input
                type="text"
                name="remark"
                placeholder="Add invoice number or a note"
                value={formData.remark}
                onChange={handleFormChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>

            <div className="sm:self-end flex items-center gap-3 w-full sm:w-auto">
              {calculatedFormTotal > 0 && (
                <div className="text-xs text-sky-800 font-semibold px-3 py-2 bg-sky-50 rounded-xl border border-sky-100 whitespace-nowrap">
                  Total: {formatCurrencyINR(calculatedFormTotal)}
                </div>
              )}

              <button
                type="submit"
                disabled={formSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b3] disabled:opacity-50 rounded-xl active:scale-95 transition shadow-sm shadow-sky-500/20 whitespace-nowrap"
              >
                {formSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>+ Add Expense</span>
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* 3. Recent Expense Entries Table */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Recent Expense Entries</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage projects, progress and financial health in one place.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Site Filter dropdown */}
            <div className="relative">
              <select
                value={selectedSiteFilter}
                onChange={(e) => setSelectedSiteFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer pr-7"
              >
                <option value="All">All Sites</option>
                {sites.map((site) => (
                  <option key={site._id} value={site._id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl font-medium text-slate-600 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Date</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Site</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Paid</th>
                <th className="py-3 px-3">Pending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentExpenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No expense entries recorded yet.
                  </td>
                </tr>
              ) : (
                recentExpenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 font-medium text-slate-600 whitespace-nowrap">
                      {formatDateDDMMYYYY(expense.date)}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-800 whitespace-nowrap">
                      {expense.description}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                      {expense.site}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                      {expense.category}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                      {formatCurrencyINR(expense.amount)}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-600 whitespace-nowrap">
                      {expense.paid > 0 ? formatCurrencyINR(expense.paid) : '-'}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-600 whitespace-nowrap">
                      {expense.pending > 0 ? formatCurrencyINR(expense.pending) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Sites Overview Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Sites Overview</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Progress and financial health of active projects
            </p>
          </div>

          <Link
            to="/sites"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 group transition"
          >
            <span>View all sites</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {dashboardData?.siteCards?.map((siteCard) => (
            <div
              key={siteCard._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Header: Icon, Name, Location */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 truncate">
                      {siteCard.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <span>📍</span> {siteCard.location}
                    </p>
                  </div>
                </div>

                {/* Site Owner */}
                <div className="flex items-center justify-between text-xs py-2 border-y border-slate-100 mb-3">
                  <span className="text-slate-400 text-[11px]">Site owner</span>
                  <span className="font-bold text-slate-800">
                    {siteCard.clientName}
                  </span>
                </div>

                {/* Financial 3-column stats */}
                <div className="grid grid-cols-3 gap-2 text-center py-2 bg-slate-50/70 rounded-xl mb-4">
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Total Budget</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">
                      {formatCurrencyShort(siteCard.budget)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Total Spent</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">
                      {formatCurrencyShort(siteCard.totalSpent)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Remaining</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">
                      {formatCurrencyShort(siteCard.remainingBudget)}
                    </div>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-2.5 mb-5 text-[11px]">
                  <div>
                    <div className="flex justify-between text-slate-500 font-medium mb-1">
                      <span>Total Budget</span>
                      <span className="font-bold text-slate-700">100%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full w-full"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-500 font-medium mb-1">
                      <span>Total Spent</span>
                      <span className="font-bold text-emerald-600">
                        {siteCard.budgetUtilizedPercent}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, siteCard.budgetUtilizedPercent)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-500 font-medium mb-1">
                      <span>Remaining</span>
                      <span className="font-bold text-rose-500">
                        {siteCard.remainingPercent}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(0, siteCard.remainingPercent)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer: Alert & View Site Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {siteCard.hasBudgetAlert ? (
                  <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>1 budget alert</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-emerald-600">
                    Within budget
                  </span>
                )}

                <button
                  onClick={() => navigate(`/sites/${siteCard._id}`)}
                  className="font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group transition"
                >
                  <span>View Site</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
