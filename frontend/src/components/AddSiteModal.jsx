import React, { useState, useEffect } from 'react';
import { X, Building2, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { siteService } from '../services/api';

const AddSiteModal = ({ isOpen, onClose, onSiteSaved, siteToEdit = null }) => {
  const initialForm = {
    name: '',
    location: 'Bengaluru',
    clientName: '',
    budget: '',
    contractValue: '',
    clientReceived: '',
    status: 'In Progress',
    startDate: new Date().toISOString().split('T')[0],
  };

  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (siteToEdit) {
        setFormData({
          name: siteToEdit.name || '',
          location: siteToEdit.location || 'Bengaluru',
          clientName: siteToEdit.clientName || '',
          budget: siteToEdit.budget !== undefined ? siteToEdit.budget : '',
          contractValue: siteToEdit.contractValue !== undefined ? siteToEdit.contractValue : siteToEdit.budget,
          clientReceived: siteToEdit.clientReceived !== undefined ? siteToEdit.clientReceived : '',
          status: siteToEdit.status || 'In Progress',
          startDate: siteToEdit.startDate
            ? new Date(siteToEdit.startDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        });
      } else {
        setFormData(initialForm);
      }
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, siteToEdit]);

  if (!isOpen) return null;

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
    if (!formData.name.trim()) {
      setError('Site name is required.');
      return;
    }
    if (!formData.clientName.trim()) {
      setError('Client name (Particular) is required.');
      return;
    }
    if (formData.budget === '' || parseFloat(formData.budget) < 0) {
      setError('Project budget must be a positive number.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        clientName: formData.clientName.trim(),
        budget: parseFloat(formData.budget),
        contractValue:
          formData.contractValue !== '' ? parseFloat(formData.contractValue) : parseFloat(formData.budget),
        clientReceived:
          formData.clientReceived !== '' ? parseFloat(formData.clientReceived) : 0,
        status: formData.status,
        startDate: formData.startDate,
      };

      if (siteToEdit && siteToEdit._id) {
        await siteService.update(siteToEdit._id, payload);
        setSuccess('Site updated successfully!');
      } else {
        await siteService.create(payload);
        setSuccess('New construction site created successfully!');
      }

      setTimeout(() => {
        setFormData(initialForm);
        if (onSiteSaved) onSiteSaved();
        onClose();
      }, 900);
    } catch (err) {
      setError(err.message || 'Failed to save site.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {siteToEdit ? 'Edit Construction Site' : 'Add New Construction Site'}
              </h3>
              <p className="text-xs text-slate-500">
                {siteToEdit ? 'Update site metrics and status' : 'Define budget, client, and location'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Site Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Greenfield Villa, Aarav Heights"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Client Name (Particular's) *
              </label>
              <input
                type="text"
                name="clientName"
                placeholder="e.g. Shreedhar Patil, Rajesh Mehta"
                value={formData.clientName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Location
              </label>
              <input
                type="text"
                name="location"
                placeholder="e.g. Bengaluru, Baner, Pune"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Project Budget (₹) *
              </label>
              <input
                type="number"
                step="any"
                min="0"
                name="budget"
                placeholder="e.g. 18500000 or 4200000"
                value={formData.budget}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Tip: 1 Cr = 1,00,00,000 | 1 Lakh = 1,00,000
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Client Received Amount (₹)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                name="clientReceived"
                placeholder="e.g. 13500000"
                value={formData.clientReceived}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Project Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>
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
              <span>{submitting ? 'Saving...' : siteToEdit ? 'Update Site' : '+ Add Site'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSiteModal;
