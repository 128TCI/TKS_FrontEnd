import { useState, useEffect } from 'react';
import { X, Search, Check, Plus, Info, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';
import apiClient from '../../../../services/apiClient';
import Swal from 'sweetalert2';

interface RestDayOvertimeRecord {
  id: number;
  code: string;
  desc: string;
  withinTheShift: string;
  afterTheShift: string;
  withinTheShiftWithND: string;
  afterTheShiftWithND: string;
  otPremiumWithinTheShiftWithND: string;
  otPremiumAfterTheShiftWithND: string;
  equiOTCode: string;
  eqOTCodeAftrShfForNoOfHrs: string;
  eqOTCodeAftrShfNDForNoOfHrs: string;
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

export function RestDayOvertimeSetupPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('');
  const [otSearchQuery, setOtSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [otSearchPage, setOtSearchPage] = useState(1);
  const [editingItem, setEditingItem] = useState<RestDayOvertimeRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<RestDayOvertimeRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    desc: '',
    withinTheShift: '',
    afterTheShift: '',
    withinTheShiftWithND: '',
    afterTheShiftWithND: '',
    otPremiumWithinTheShiftWithND: '',
    otPremiumAfterTheShiftWithND: '',
    equiOTCode: '',
    eqOTCodeAftrShfForNoOfHrs: '',
    eqOTCodeAftrShfNDForNoOfHrs: ''
  });

  // Rest Day Overtime records
  const [restDayOvertimeData, setRestDayOvertimeData] = useState<RestDayOvertimeRecord[]>([]);
  const [loadingRDOT, setLoadingRDOT] = useState(false);
  const [rdotError, setRDOTError] = useState('');

  // OT Codes from API
  const [otCodesData, setOTCodesData] = useState<OTCode[]>([]);
  const [loadingOTCodes, setLoadingOTCodes] = useState(false);

  // ── Fetch Rest Day OT records ────────────────────────────────────────────
  useEffect(() => {
    fetchRestDayOvertimeData();
  }, []);

  const fetchRestDayOvertimeData = async () => {
    setLoadingRDOT(true);
    setRDOTError('');
    try {
      const response = await apiClient.get('/Fs/Process/Overtime/RestDayOTRateSetUp');
      if (response.status === 200 && response.data) {
        setRestDayOvertimeData(response.data);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load rest day overtime data';
      setRDOTError(errorMsg);
      console.error('Error fetching rest day OT data:', error);
    } finally {
      setLoadingRDOT(false);
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
  const filteredMainData = restDayOvertimeData.filter(item =>
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
      withinTheShift: '',
      afterTheShift: '',
      withinTheShiftWithND: '',
      afterTheShiftWithND: '',
      otPremiumWithinTheShiftWithND: '',
      otPremiumAfterTheShiftWithND: '',
      equiOTCode: '',
      eqOTCodeAftrShfForNoOfHrs: '',
      eqOTCodeAftrShfNDForNoOfHrs: ''
    });
    setEditingItem(null);
    setShowCreateModal(true);
  };

  const handleEdit = (item: RestDayOvertimeRecord) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      desc: item.desc,
      withinTheShift: item.withinTheShift,
      afterTheShift: item.afterTheShift,
      withinTheShiftWithND: item.withinTheShiftWithND,
      afterTheShiftWithND: item.afterTheShiftWithND,
      otPremiumWithinTheShiftWithND: item.otPremiumWithinTheShiftWithND,
      otPremiumAfterTheShiftWithND: item.otPremiumAfterTheShiftWithND,
      equiOTCode: item.equiOTCode,
      eqOTCodeAftrShfForNoOfHrs: item.eqOTCodeAftrShfForNoOfHrs,
      eqOTCodeAftrShfNDForNoOfHrs: item.eqOTCodeAftrShfNDForNoOfHrs
    });
    setShowCreateModal(true);
  };

  const handleDetails = (item: RestDayOvertimeRecord) => {
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
  const handleDelete = async (item: RestDayOvertimeRecord) => {
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
        await apiClient.delete(`/Fs/Process/Overtime/RestDayOTRateSetUp/${item.id}`);
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Record deleted successfully.', timer: 2000, showConfirmButton: false });
        await fetchRestDayOvertimeData();
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

    const isDuplicate = restDayOvertimeData.some(
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
      const payload: RestDayOvertimeRecord = {
        id: editingItem ? editingItem.id : 0,
        code: formData.code,
        desc: formData.desc,
        withinTheShift: formData.withinTheShift,
        afterTheShift: formData.afterTheShift,
        withinTheShiftWithND: formData.withinTheShiftWithND,
        afterTheShiftWithND: formData.afterTheShiftWithND,
        otPremiumWithinTheShiftWithND: formData.otPremiumWithinTheShiftWithND,
        otPremiumAfterTheShiftWithND: formData.otPremiumAfterTheShiftWithND,
        equiOTCode: formData.equiOTCode,
        eqOTCodeAftrShfForNoOfHrs: formData.eqOTCodeAftrShfForNoOfHrs,
        eqOTCodeAftrShfNDForNoOfHrs: formData.eqOTCodeAftrShfNDForNoOfHrs
      };

      if (editingItem) {
        await apiClient.put(`/Fs/Process/Overtime/RestDayOTRateSetUp/${editingItem.id}`, payload);
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Record updated successfully.', timer: 2000, showConfirmButton: false });
      } else {
        await apiClient.post('/Fs/Process/Overtime/RestDayOTRateSetUp', payload);
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Record created successfully.', timer: 2000, showConfirmButton: false });
      }

      await fetchRestDayOvertimeData();
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
      <label className="w-56 text-gray-700 text-sm">{label} :</label>
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
            <h1 className="text-white">Rest Day OT Rate Setup</h1>
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
                    Configure rest day overtime rate codes and premium calculations. Define rates for within shift, after shift, night differential scenarios, and equivalent overtime codes for accurate rest day pay computations.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {['Rest day within/after shift rates', 'Night differential premium setup', 'OT premium configurations', 'Equivalent code for hours mapping'].map(t => (
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
              {loadingRDOT ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-600 text-sm">Loading records...</div>
                </div>
              ) : rdotError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 text-sm">{rdotError}</p>
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
              <h3 className="text-blue-600 mb-3">Rest Day OT Rate Setup</h3>

              <div className="space-y-2">
                {/* Code */}
                <div className="flex items-center gap-3">
                  <label className="w-56 text-gray-700 text-sm">Code :</label>
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
                  <label className="w-56 text-gray-700 text-sm">Description :</label>
                  <input
                    type="text"
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* All searchable fields */}
                {renderFieldRow('Within the Shift', 'withinTheShift')}
                {renderFieldRow('After the Shift', 'afterTheShift')}
                {renderFieldRow('Within the Shift with ND', 'withinTheShiftWithND')}
                {renderFieldRow('After the Shift with ND', 'afterTheShiftWithND')}
                {renderFieldRow('OT Premium Within the Shift with ND', 'otPremiumWithinTheShiftWithND')}
                {renderFieldRow('OT Premium After the Shift with ND', 'otPremiumAfterTheShiftWithND')}
                {renderFieldRow('Equivalent Overtime Code', 'equiOTCode')}

                {/* Equivalent OT Code for No of Hrs Section */}
                <div className="mt-3 border border-orange-300 bg-orange-50 p-3 rounded">
                  <h4 className="text-orange-700 mb-2 text-sm">Equivalent OT Code for No of Hrs</h4>
                  <div className="space-y-2">
                    {renderFieldRow('After the Shift', 'eqOTCodeAftrShfForNoOfHrs')}
                    {renderFieldRow('After the Shift with ND', 'eqOTCodeAftrShfNDForNoOfHrs')}
                  </div>
                </div>
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
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-[10] rounded-lg p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl" style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg flex-shrink-0">
                    <h2 className="text-gray-800 text-lg font-semibold">Overtime Code</h2>
                    <button onClick={() => setShowSearchModal(false)} className="text-gray-600 hover:text-gray-800">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Search field */}
                  <div className="px-6 py-3 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-2 justify-end">
                      <label className="text-gray-700 text-sm">Search:</label>
                      <input type="text" value={otSearchQuery} onChange={(e) => setOtSearchQuery(e.target.value)} className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-80" />
                    </div>
                  </div>

                  {/* Table (scrollable) */}
                  <div className="flex-1 overflow-y-auto px-6 py-4">
                    {loadingOTCodes ? (
                      <div className="py-8 text-center text-gray-500 text-sm">Loading OT codes...</div>
                    ) : (
                      <table className="w-full border-collapse">
                        <thead className="bg-gray-100 border-b-2 border-gray-300 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Code ▲</th>
                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Description ▲</th>
                            <th className="px-4 py-2 text-right text-gray-700 text-sm">Rate ▲</th>
                            <th className="px-4 py-2 text-right text-gray-700 text-sm">Default Amount ▲</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentOTCodes.length > 0 ? currentOTCodes.map((item) => (
                            <tr key={item.otfid} onClick={() => handleSelectOTCode(item.otfCode)} className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer">
                              <td className="px-4 py-2 text-sm text-blue-600 font-medium">{item.otfCode}</td>
                              <td className="px-4 py-2 text-sm">{item.description}</td>
                              <td className="px-4 py-2 text-sm text-right">{item.rate1.toFixed(2)}</td>
                              <td className="px-4 py-2 text-sm text-right">{item.defAmt.toFixed(2)}</td>
                            </tr>
                          )) : (
                            <tr><td colSpan={4} className="py-8 text-center text-gray-500 text-sm">No OT codes found.</td></tr>
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Pagination */}
                  <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="text-gray-600 text-sm">
                        Showing {otStartIndex + 1} to {Math.min(otEndIndex, filteredOTCodes.length)} of {filteredOTCodes.length} entries
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setOtSearchPage(prev => Math.max(1, prev - 1))} disabled={otSearchPage === 1} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-sm">
                          Previous
                        </button>
                        {[...Array(Math.min(5, otTotalPages))].map((_, i) => (
                          <button key={i} onClick={() => setOtSearchPage(i + 1)} className={`px-3 py-1 rounded text-sm ${otSearchPage === i + 1 ? 'bg-orange-500 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>
                            {i + 1}
                          </button>
                        ))}
                        <button onClick={() => setOtSearchPage(prev => Math.min(otTotalPages, prev + 1))} disabled={otSearchPage === otTotalPages} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-sm">
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
              <h3 className="text-blue-600 mb-3">Rest Day OT Rate Setup</h3>
              <div className="space-y-3">
                <div className="flex items-start"><span className="font-bold text-gray-900 w-80">Code :</span><span className="text-gray-700">{selectedRecord.code}</span></div>
                <div className="flex items-start"><span className="font-bold text-gray-900 w-80">Description :</span><span className="text-gray-700">{selectedRecord.desc}</span></div>
                <div className="flex items-start"><span className="font-bold text-gray-900 w-80">Within the Shift :</span><span className="text-gray-700">{selectedRecord.withinTheShift || ''}</span></div>
                <div className="flex items-start"><span className="font-bold text-gray-900 w-80">After the Shift :</span><span className="text-gray-700">{selectedRecord.afterTheShift || ''}</span></div>
                <div className="flex items-start"><span className="font-bold text-gray-900 w-80">Within the Shift with ND :</span><span className="text-gray-700">{selectedRecord.withinTheShiftWithND || ''}</span></div>
                <div className="flex items-start"><span className="font-bold text-gray-900 w-80">After the Shift with ND :</span><span className="text-gray-700">{selectedRecord.afterTheShiftWithND || ''}</span></div>
                <div className="flex items-start"><span className="font-bold text-gray-900 w-80">OT Premium Within the Shift with ND :</span><span className="text-gray-700">{selectedRecord.otPremiumWithinTheShiftWithND || ''}</span></div>
                <div className="flex items-start"><span className="font-bold text-gray-900 w-80">OT Premium After the Shift with ND :</span><span className="text-gray-700">{selectedRecord.otPremiumAfterTheShiftWithND || ''}</span></div>
                <div className="flex items-start"><span className="font-bold text-gray-900 w-80">Equivalent Overtime Code :</span><span className="text-gray-700">{selectedRecord.equiOTCode || ''}</span></div>

                {/* Equivalent OT Code Section */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="bg-gray-100 px-3 py-2 rounded mb-3">
                    <h4 className="text-gray-700 font-semibold">Equivalent OT Code for No of Hrs</h4>
                  </div>
                  <div className="space-y-3 pl-4">
                    <div className="flex items-start"><span className="font-bold text-gray-900 w-72">After the Shift :</span><span className="text-gray-700">{selectedRecord.eqOTCodeAftrShfForNoOfHrs || ''}</span></div>
                    <div className="flex items-start"><span className="font-bold text-gray-900 w-72">After the Shift with ND :</span><span className="text-gray-700">{selectedRecord.eqOTCodeAftrShfNDForNoOfHrs || ''}</span></div>
                  </div>
                </div>
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