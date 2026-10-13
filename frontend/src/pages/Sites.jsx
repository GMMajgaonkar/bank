import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Building2,
  TrendingUp,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Loader2,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import AddSiteModal from '../components/AddSiteModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { siteService } from '../services/api';
import { formatCurrencyShort, formatDateDDMMYYYY } from '../utils/formatters';

const Sites = () => {
  const navigate = useNavigate();
  const context = useOutletContext();
  const refreshTrigger = context?.refreshTrigger || 0;
  const triggerRefresh = context?.triggerRefresh || (() => {});
  const globalSearch = context?.globalSearch || '';

  // States
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState([]);
  const [stats, setStats] = useState({
    totalSites: 0,
    sitesInProgress: 0,
    completed: 0,
    onHold: 0,
  });

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [siteToEdit, setSiteToEdit] = useState(null);
  const [siteToDelete, setSiteToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Sync global search from navbar
  useEffect(() => {
    if (globalSearch !== undefined && globalSearch !== searchQuery) {
      setSearchQuery(globalSearch);
    }
  }, [globalSearch]);

  // Load sites
  const fetchSites = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchQuery.trim() || undefined,
        status: statusFilter !== 'All Status' ? statusFilter : undefined,
        sort: sortBy,
      };
      const res = await siteService.getAll(params);
      if (res.data) {
        setSites(res.data);
      }
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load sites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, [searchQuery, statusFilter, sortBy, refreshTrigger]);

  // Delete site
  const handleDeleteConfirm = async () => {
    if (!siteToDelete) return;
    try {
      setDeleting(true);
      await siteService.delete(siteToDelete._id);
      setSiteToDelete(null);
      triggerRefresh();
      fetchSites();
    } catch (err) {
      alert(err.message || 'Failed to delete site.');
    } finally {
      setDeleting(false);
    }
  };

  // Pagination calculations
  const totalItems = sites.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSites = sites.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1">
            WORKSPACE / <span className="text-sky-600">SITES</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Sites</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage projects, progress and financial health in one place.
          </p>
        </div>

        <button
          onClick={() => {
            setSiteToEdit(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b3] rounded-xl active:scale-95 transition shadow-sm shadow-sky-500/20 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Site</span>
        </button>
      </div>

      {/* Summary Statistics 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sites */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-xs font-medium text-slate-500 mb-1">Total Sites</div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.totalSites}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            {stats.sitesInProgress} currently active
          </div>
        </div>

        {/* Sites In Progress */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-xs font-medium text-slate-500 mb-1">Sites In Progress</div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.sitesInProgress}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            {stats.totalSites > 0
              ? `${Math.round((stats.sitesInProgress / stats.totalSites) * 100)}% of all projects`
              : '0%'}
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xs font-medium text-slate-500 mb-1">Completed</div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.completed}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            Delivered successfully
          </div>
        </div>

        {/* On hold */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-xs font-medium text-slate-500 mb-1">On hold</div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.onHold}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            Awaiting client approval
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sites, clients, suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
          >
            <option value="All Status">All Status</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="budget-desc">Budget: High to Low</option>
            <option value="budget-asc">Budget: Low to High</option>
          </select>
        </div>
      </div>

      {/* All Sites Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">All Sites</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage projects, progress and financial health in one place.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Site</th>
                <th className="py-3.5 px-6">Particular's</th>
                <th className="py-3.5 px-6">Project Budget</th>
                <th className="py-3.5 px-6">Total Spent</th>
                <th className="py-3.5 px-6">Remaining</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-500 mb-2" />
                    <span>Loading sites records...</span>
                  </td>
                </tr>
              ) : currentSites.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No sites found matching your criteria.
                  </td>
                </tr>
              ) : (
                currentSites.map((site) => (
                  <tr
                    key={site._id}
                    onClick={() => navigate(`/sites/${site._id}`)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                      {formatDateDDMMYYYY(site.startDate || site.createdAt)}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800 group-hover:text-sky-600 transition whitespace-nowrap">
                      {site.name}
                    </td>
                    <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                      {site.clientName}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800 whitespace-nowrap">
                      {formatCurrencyShort(site.budget)}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600 whitespace-nowrap">
                      {site.totalSpent > 0 ? formatCurrencyShort(site.totalSpent) : '00'}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600 whitespace-nowrap">
                      {site.remainingBudget > 0 ? formatCurrencyShort(site.remainingBudget) : '00'}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <StatusBadge status={site.status} />
                    </td>
                    <td
                      className="py-4 px-6 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/sites/${site._id}`)}
                          title="View Details"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSiteToEdit(site);
                            setIsAddModalOpen(true);
                          }}
                          title="Edit Site"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSiteToDelete(site)}
                          title="Delete Site"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span>
              {totalItems > 0 ? `${startIndex + 1}–${Math.min(startIndex + itemsPerPage, totalItems)} of ${totalItems}` : '0 of 0'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium flex items-center gap-1 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition ${
                  currentPage === page
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium flex items-center gap-1 transition"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Site Modal */}
      <AddSiteModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSiteToEdit(null);
        }}
        onSiteSaved={() => {
          triggerRefresh();
          fetchSites();
        }}
        siteToEdit={siteToEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!siteToDelete}
        onClose={() => setSiteToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Construction Site"
        message={`Are you sure you want to permanently delete "${siteToDelete?.name}"? All associated expense logs will also be removed.`}
        deleting={deleting}
      />
    </div>
  );
};

export default Sites;
