import React, { useState, useEffect } from 'react';
import { X, Calculator, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { siteService, expenseService } from '../services/api';
import { formatCurrencyINR } from '../utils/formatters';

const AddExpenseModal = ({ isOpen, onClose, onExpenseAdded, preselectedSiteId = null }) => {
  const [sites, setSites] = useState([]);
  const [loadingSites, setLoadingSites] = useState(false);

  const initialForm = {
    siteId: preselectedSiteId || '',
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    material: '',
    quantity: '',
    unit: 'Bags',
    ratePerUnit: '',
    paidAmount: '',
    paymentMethod: 'Bank Transfer',
    remark: '',
  };

  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadSites();
      setFormData((prev) => ({
        ...prev,
        siteId: preselectedSiteId || prev.siteId,
      }));
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, preselectedSiteId]);

  const loadSites = async () => {
    try {
      setLoadingSites(true);
      const res = await siteService.getAll();
      if (res.data) {
        setSites(res.data);
        if (!preselectedSiteId && res.data.length > 0 && !formData.siteId) {
          setFormData((prev) => ({ ...prev, siteId: res.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to load sites:', err);
    } finally {
      setLoadingSites(false);
    }
  };

  if (!isOpen) return null;

  const qty = parseFloat(formData.quantity) || 0;
  const rate = parseFloat(formData.ratePerUnit) || 0;
  const calculatedTotal = qty * rate;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.siteId) {
      setError('Please select a construction site.');
      return;
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      setError('Quantity must be a positive number greater than 0.');
      return;
    }

    if (!formData.ratePerUnit || parseFloat(formData.ratePerUnit) <= 0) {
      setError('Rate per unit must be a positive number greater than 0.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        siteId: formData.siteId,
        date: formData.date,
        supplier: formData.supplier.trim() || 'Direct Purchase',
        material: formData.material.trim() || 'Construction Material',
        description: `${formData.material || 'Material'} – ${formData.quantity} ${formData.unit}`,
        category:
          formData.unit === 'Week' || formData.unit === 'Hours' || formData.material.toLowerCase().includes('labour')
            ? 'Labour'
            : formData.material.toLowerCase().includes('excavator') || formData.material.toLowerCase().includes('crane')
            ? 'Equipment'
            : 'Material',
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        ratePerUnit: parseFloat(formData.ratePerUnit),
        paidAmount: formData.paidAmount !== '' ? parseFloat(formData.paidAmount) : calculatedTotal,
        paymentMethod: formData.paymentMethod,
        remark: formData.remark,
      };

      await expenseService.create(payload);
      setSuccess('Expense added successfully!');

      setTimeout(() => {
        setFormData(initialForm);
        if (onExpenseAdded) onExpenseAdded();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to submit expense. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-800">Add Daily Expense</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Record new materials, labour, or machinery purchases
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>

            {/* Construction Site */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Construction Site *
              </label>
              <select
                name="siteId"
                value={formData.siteId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              >
                <option value="">Select site...</option>
                {sites.map((site) => (
                  <option key={site._id} value={site._id}>
                    {site.name} ({site.location})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supplier */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Supplier
              </label>
              <input
                type="text"
                name="supplier"
                placeholder="e.g. UltraTech, Tata Steel"
                value={formData.supplier}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>

            {/* Material */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Material / Particular
              </label>
              <input
                type="text"
                name="material"
                placeholder="e.g. Cement, Structural Steel"
                value={formData.material}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>
          </div>

          {/* Quantity, Unit, Rate */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Quantity *
              </label>
              <input
                type="number"
                step="any"
                min="0.001"
                name="quantity"
                placeholder="0"
                value={formData.quantity}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Unit
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Rate Per Unit (₹) *
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                name="ratePerUnit"
                placeholder="₹ 0"
                value={formData.ratePerUnit}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>
          </div>

          {/* Amount Calculation Banner */}
          <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-sky-800 font-medium">
              <Calculator className="w-4 h-4 text-sky-600" />
              <span>Calculated Amount (Qty × Rate):</span>
            </div>
            <span className="text-sm font-bold text-sky-700">
              {formatCurrencyINR(calculatedTotal)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>

            {/* Paid Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Paid Amount (₹)
              </label>
              <input
                type="number"
                step="any"
                name="paidAmount"
                placeholder={`Default: ${formatCurrencyINR(calculatedTotal)}`}
                value={formData.paidAmount}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>
          </div>

          {/* Remark */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Remark / Invoice Note
            </label>
            <input
              type="text"
              name="remark"
              placeholder="Add invoice number or a note"
              value={formData.remark}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b3] disabled:opacity-50 rounded-xl active:scale-95 transition shadow-sm shadow-sky-500/20"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{submitting ? 'Adding...' : '+ Add Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
