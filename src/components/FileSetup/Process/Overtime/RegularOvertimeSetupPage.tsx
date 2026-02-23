import { useState, useEffect } from 'react';
import { X, Search, Check, Plus, Info, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';
import apiClient from '../../../../services/apiClient';
import auditTrail from '../../../../services/auditTrail';
import Swal from 'sweetalert2';

const formName = 'Regular Day OT Rate SetUp';
interface RegularOvertimeRecord {
  id: number;
  code: string;
  desc: string;
  afterTheShift: string;
  withinTheShiftND: string;
  afterTheShiftND: string;
  otPremiumAfterTheShift: string;
  otPremiumWithinTheShift: string;
  doleRegDay: string;
}

interface OTCode {
  otfid: number;
  otfCode: string;
  earnCode: string;
  rate1: number;
  rate2: number;
  defAmt: number;
  incPayslip: string;
  incColaOT: string;
  incColaBasic: string;
  description: string;
  isExemptionRpt: boolean;
}

export function RegularOvertimeSetupPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('');
  const [otSearchQuery, setOtSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [otSearchPage, setOtSearchPage] = useState(1);
  const [editingItem, setEditingItem] = useState<RegularOvertimeRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<RegularOvertimeRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    desc: '',
    afterTheShift: '',
    withinTheShiftND: '',
    afterTheShiftND: '',
    otPremiumAfterTheShift: '',
    otPremiumWithinTheShift: '',
    doleRegDay: ''
  });

  // Regular Overtime records
  const [regularOvertimeData, setRegularOvertimeData] = useState<RegularOvertimeRecord[]>([]);
  const [loadingROT, setLoadingROT] = useState(false);
  const [rotError, setROTError] = useState('');

  // OT Codes from API
  const [otCodesData, setOTCodesData] = useState<OTCode[]>([]);
  const [loadingOTCodes, setLoadingOTCodes] = useState(false);

  // ── Fetch Regular Day OT records ─────────────────────────────────────────
  useEffect(() => {
    fetchRegularOvertimeData();
  }, []);

  const fetchRegularOvertimeData = async () => {
    setLoadingROT(true);
    setROTError('');
    try {
      const response = await apiClient.get('/Fs/Process/Overtime/RegularDayOTRateSetUp');
      if (response.status === 200 && response.data) {
        setRegularOvertimeData(response.data);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load regular overtime data';
      setROTError(errorMsg);
      console.error('Error fetching regular OT data:', error);
    } finally {
      setLoadingROT(false);
    }
  };

  // ── Fetch OT Codes ────────────────────────────────────────────────────────
  const fetchOTCodes = async () => {
    setLoadingOTCodes(true);
    try {
      const response = await apiClient.get('/Fs/Process/Overtime/OverTimeFileSetUp');
      if (response.status === 200 && response.data) {
        setOTCodesData(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching OT codes:', error);
    } finally {
      setLoadingOTCodes(false);
    }
  };

  // ── Filter / paginate ─────────────────────────────────────────────────────
  const filteredMainData = regularOvertimeData.filter(item =>
    item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOTCodes = otCodesData.filter(item =>
    item.otfCode.toLowerCase().includes(otSearchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(otSearchQuery.toLowerCase())
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredMainData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredMainData.slice(startIndex, endIndex);

  const otItemsPerPage = 10;
  const otTotalPages = Math.ceil(filteredOTCodes.length / otItemsPerPage);
  const otStartIndex = (otSearchPage - 1) * otItemsPerPage;
  const otEndIndex = otStartIndex + otItemsPerPage;
  const currentOTCodes = filteredOTCodes.slice(otStartIndex, otEndIndex);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  // ── Modal openers ─────────────────────────────────────────────────────────
  const handleCreateNew = () => {
    setFormData({
      code: '',
      desc: '',
      afterTheShift: '',
      withinTheShiftND: '',
      afterTheShiftND: '',
      otPremiumAfterTheShift: '',
      otPremiumWithinTheShift: '',
      doleRegDay: ''
    });
    setEditingItem(null);
    setShowCreateModal(true);
  };

  const handleEdit = (item: RegularOvertimeRecord) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      desc: item.desc,
      afterTheShift: item.afterTheShift,
      withinTheShiftND: item.withinTheShiftND,
      afterTheShiftND: item.afterTheShiftND,
      otPremiumAfterTheShift: item.otPremiumAfterTheShift,
      otPremiumWithinTheShift: item.otPremiumWithinTheShift,
      doleRegDay: item.doleRegDay
    });
    setShowCreateModal(true);
  };

  const handleDetails = (item: RegularOvertimeRecord) => {
    setSelectedRecord(item);
    setShowDetailsModal(true);
  };

  // ── OT code search modal ──────────────────────────────────────────────────
  const handleOpenSearch = (field: string) => {
    setSearchField(field);
    setOtSearchQuery('');
    setOtSearchPage(1);
    fetchOTCodes(); // Fetch fresh data when opening
    setShowSearchModal(true);
  };

  const handleSelectOTCode = (code: string) => {
    setFormData(prev => ({ ...prev, [searchField]: code }));
    setShowSearchModal(false);
  };

  const handleClearField = (field: string) => {
    setFormData(prev => ({ ...prev, [field]: '' }));
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (item: RegularOvertimeRecord) => {
    const confirmed = await Swal.fire({
      icon: 'warning',
      title: 'Confirm Delete',
      text: `Are you sure you want to delete "${item.code} - ${item.desc}"?`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (confirmed.isConfirmed) {
      try {
        await apiClient.delete(`/Fs/Process/Overtime/RegularDayOTRateSetUp/${item.id}`);
        await auditTrail.log({
          accessType: 'Delete',
          trans: `Deleted regular OT "${item.code} - ${item.desc}"`,
          messages: `Regular OT "${item.code} - ${item.desc}" removed`,
          formName
        });
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Record deleted successfully.', timer: 2000, showConfirmButton: false });
        await fetchRegularOvertimeData();
      } catch (error: any) {
        await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to delete record' });
      }
    }
  };

  // ── Submit (create or update) ─────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!formData.code.trim()) {
      await Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Code is required.' });
      return;
    }
    if (formData.code.length > 10) {
      await Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Code must be 10 characters or less.' });
      return;
    }
    if (!formData.desc.trim()) {
      await Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Description is required.' });
      return;
    }

    const isDuplicate = regularOvertimeData.some(
      item =>
        (!editingItem || item.id !== editingItem.id) &&
        item.code.toLowerCase() === formData.code.toLowerCase()
    );
    if (isDuplicate) {
      await Swal.fire({ icon: 'error', title: 'Duplicate Code', text: 'A record with this code already exists.' });
      return;
    }

    setSubmitting(true);
    try {
      const payload: RegularOvertimeRecord = {
        id: editingItem ? editingItem.id : 0,
        code: formData.code,
        desc: formData.desc,
        afterTheShift: formData.afterTheShift,
        withinTheShiftND: formData.withinTheShiftND,
        afterTheShiftND: formData.afterTheShiftND,
        otPremiumAfterTheShift: formData.otPremiumAfterTheShift,
        otPremiumWithinTheShift: formData.otPremiumWithinTheShift,
        doleRegDay: formData.doleRegDay
      };

      if (editingItem) {
        await apiClient.put(`/Fs/Process/Overtime/RegularDayOTRateSetUp/${editingItem.id}`, payload);
        await auditTrail.log({
          accessType: 'Edit',
          trans: `Updated regular OT "${formData.code} - ${formData.desc}"`,
          messages: `Regular OT "${formData.code} - ${formData.desc}" updated`,
          formName
        });
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Record updated successfully.', timer: 2000, showConfirmButton: false });
      } else {
        await apiClient.post('/Fs/Process/Overtime/RegularDayOTRateSetUp', payload);
        await auditTrail.log({
          accessType: 'Add',
          trans: `Created regular OT "${formData.code} - ${formData.desc}"`,
          messages: `Regular OT "${formData.code} - ${formData.desc}" created`,
          formName
        });
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Record created successfully.', timer: 2000, showConfirmButton: false });
      }

      await fetchRegularOvertimeData();
      setShowCreateModal(false);
      setEditingItem(null);
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'An error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Close ─────────────────────────────────────────────────────────────────
  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowSearchModal(false);
    setShowDetailsModal(false);
    setEditingItem(null);
    setSelectedRecord(null);
  };

  // ── ESC key ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showDetailsModal) setShowDetailsModal(false);
        else if (showSearchModal) setShowSearchModal(false);
        else if (showCreateModal) setShowCreateModal(false);
      }
    };
    if (showSearchModal || showCreateModal || showDetailsModal) {
      document.addEventListener('keydown', handleEscKey);
    }
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showSearchModal, showCreateModal, showDetailsModal]);

  // ── Render field row with search + clear buttons ─────────────────────────
  const renderFieldRow = (label: string, field: keyof typeof formData) => (
    <div className="flex items-center gap-3">
      <label className="w-64 text-gray-700 text-sm">{label} :</label>
      <input
        type="text"
        value={formData[field]}
        readOnly
        className="flex-1 px-3 py-1.5 border border-gray-300 rounded bg-gray-50 text-sm"
      />
      <button
        type="button"
        onClick={() => handleOpenSearch(field)}
        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-shrink-0"
      >
        <Search className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => handleClearField(field)}
        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Regular Day OT Rate Setup</h1>
          </div>

          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
            {/* Info banner */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    Define regular day overtime rate codes and their corresponding overtime premiums. Configure rates for within shift, after shift, and night differential scenarios to ensure accurate overtime calculations.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {['Within shift OT configurations', 'After shift OT premium rates', 'Night differential premiums', 'DOLE regular day compliance'].map(t => (
                      <div key={t} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-4 mb-6">
              <button onClick={handleCreateNew} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                <Plus className="w-4 h-4" /> Create New
              </button>
              <div className="ml-auto flex items-center gap-2">
                <label className="text-gray-700">Search:</label>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              {loadingROT ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-600 text-sm">Loading records...</div>
                </div>
              ) : rotError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 text-sm">{rotError}</p>
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-4 py-2 text-left text-gray-700">Code ▲</th>
                      <th className="px-4 py-2 text-left text-gray-700">Description ▲</th>
                      <th className="px-4 py-2 text-center text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length > 0 ? currentData.map((item) => (
                      <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-2">{item.code}</td>
                        <td className="px-4 py-2">{item.desc}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleDetails(item)} className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors" title="Details">
                              <Info className="w-4 h-4" />
                            </button>
                            <span className="text-gray-300">|</span>
                            <button onClick={() => handleEdit(item)} className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                            <span className="text-gray-300">|</span>
                            <button onClick={() => handleDelete(item)} className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-16 text-center text-gray-500">No data available in table</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredMainData.length)} of {filteredMainData.length} entries
              </div>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-orange-500 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Create/Edit Modal ────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0 z-[1]">
              <h2 className="text-gray-900">{editingItem ? 'Edit' : 'Create New'}</h2>
              <button onClick={handleCloseModal} className="text-gray-600 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              <h3 className="text-blue-600 mb-3">Regular Day OT Rate Setup</h3>

              <div className="space-y-2">
                {/* Code */}
                <div className="flex items-center gap-3">
                  <label className="w-64 text-gray-700 text-sm">Code :</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    maxLength={10}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Max 10 characters"
                  />
                  <span className="text-xs text-gray-500 w-16 text-right">{formData.code.length}/10</span>
                </div>

                {/* Description */}
                <div className="flex items-center gap-3">
                  <label className="w-64 text-gray-700 text-sm">Description :</label>
                  <input
                    type="text"
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* All searchable fields */}
                {renderFieldRow('After the Shift', 'afterTheShift')}
                {renderFieldRow('Within the Shift with ND', 'withinTheShiftND')}
                {renderFieldRow('After the Shift with ND', 'afterTheShiftND')}
                {renderFieldRow('OT Premium After the Shift', 'otPremiumAfterTheShift')}
                {renderFieldRow('OT Premium Within the Shift', 'otPremiumWithinTheShift')}
                {renderFieldRow('DOLE Regular Day', 'doleRegDay')}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm text-sm"
                >
                  {submitting ? (editingItem ? 'Updating...' : 'Submitting...') : (editingItem ? 'Update' : 'Submit')}
                </button>
                <button
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm text-sm"
                >
                  Back to List
                </button>
              </div>
            </div>

            {/* ── OT Code Search Modal (nested on top) ─────────────────── */}
            {showSearchModal && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-[10] rounded-lg p-4">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl" style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-3 border-b border-gray-300 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg flex-shrink-0">
                    <h2 className="text-gray-900 text-lg font-semibold">Overtime Code</h2>
                    <button onClick={() => setShowSearchModal(false)} className="text-gray-600 hover:text-gray-900 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Search field */}
                  <div className="px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center gap-3 justify-end">
                      <label className="text-gray-700 font-medium">Search:</label>
                      <input 
                        type="text" 
                        value={otSearchQuery} 
                        onChange={(e) => setOtSearchQuery(e.target.value)} 
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                        placeholder="Search by code or description..."
                      />
                    </div>
                  </div>

                  {/* Table (scrollable) */}
                  <div className="flex-1 overflow-y-auto bg-gray-50">
                    {loadingOTCodes ? (
                      <div className="py-12 text-center text-gray-500">Loading OT codes...</div>
                    ) : (
                      <div className="px-6 py-4">
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-100 border-b border-gray-300">
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                  Code <span className="text-gray-400">▲</span>
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                  Description <span className="text-gray-400">▲</span>
                                </th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                                  Rate <span className="text-gray-400">▲</span>
                                </th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                                  Default Amount <span className="text-gray-400">▲</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {currentOTCodes.length > 0 ? currentOTCodes.map((item, index) => (
                                <tr 
                                  key={item.otfid} 
                                  onClick={() => handleSelectOTCode(item.otfCode)} 
                                  className={`cursor-pointer transition-colors ${
                                    index % 2 === 0 ? 'bg-blue-50/30' : 'bg-white'
                                  } hover:bg-blue-100`}
                                >
                                  <td className="px-6 py-3 text-sm text-blue-600 font-semibold">
                                    {item.otfCode}
                                  </td>
                                  <td className="px-6 py-3 text-sm text-gray-900">
                                    {item.description}
                                  </td>
                                  <td className="px-6 py-3 text-sm text-gray-900 text-center">
                                    {item.rate1.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-3 text-sm text-gray-900 text-center">
                                    {item.defAmt.toFixed(2)}
                                  </td>
                                </tr>
                              )) : (
                                <tr>
                                  <td colSpan={4} className="py-12 text-center text-gray-500">
                                    No OT codes found.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pagination */}
                  <div className="px-6 py-4 border-t border-gray-300 bg-white rounded-b-lg flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="text-gray-600 text-sm">
                        Showing {otStartIndex + 1} to {Math.min(otEndIndex, filteredOTCodes.length)} of {filteredOTCodes.length} entries
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setOtSearchPage(prev => Math.max(1, prev - 1))} 
                          disabled={otSearchPage === 1} 
                          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                        >
                          Previous
                        </button>
                        {[...Array(Math.min(5, otTotalPages))].map((_, i) => (
                          <button 
                            key={i} 
                            onClick={() => setOtSearchPage(i + 1)} 
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              otSearchPage === i + 1 
                                ? 'bg-orange-500 text-white shadow-sm' 
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button 
                          onClick={() => setOtSearchPage(prev => Math.min(otTotalPages, prev + 1))} 
                          disabled={otSearchPage === otTotalPages} 
                          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Details Modal ─────────────────────────────────────────────────── */}
      {showDetailsModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-gray-800 font-semibold">Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-600 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <h3 className="text-blue-600 text-xl font-semibold mb-6">Regular Day OT Rate Setup</h3>
              <div className="space-y-3">
                <div className="flex items-start"><span className="font-bold text-gray-900 w-80">Code :</span><span className="text-gray-700">{selectedRecord.code}</span></div>
                <div className="flex items-start"><span className="font-bold text-gray-900 w-80">Description :</span><span className="text-gray-700">{selectedRecord.desc}</span></div>
                <div className="flex items-start"><span className="font-bold text-gray-900 w-80">After the Shift :</span><span className="text-gray-700">{selectedRecord.afterTheShift || ''}</span></div>
                <div className="flex items-start"><span className="font-bold text-gray-900 w-80">Within the Shift with ND :</span><span className="text-gray-700">{selectedRecord.withinTheShiftND || ''}</span></div>
                <div className="flex items-start"><span className="font-bold text-gray-900 w-80">After the Shift with ND :</span><span className="text-gray-700">{selectedRecord.afterTheShiftND || ''}</span></div>
                <div className="flex items-start"><span className="font-bold text-gray-900 w-80">OT Premium After the Shift :</span><span className="text-gray-700">{selectedRecord.otPremiumAfterTheShift || ''}</span></div>
                <div className="flex items-start"><span className="font-bold text-gray-900 w-80">OT Premium Within the Shift :</span><span className="text-gray-700">{selectedRecord.otPremiumWithinTheShift || ''}</span></div>
                <div className="flex items-start"><span className="font-bold text-gray-900 w-80">DOLE Regular Day :</span><span className="text-gray-700">{selectedRecord.doleRegDay || ''}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}