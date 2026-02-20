import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Plus, Check, Edit, Trash2, Loader2 } from 'lucide-react';
import { Footer } from '../../Footer/Footer';
import apiClient from '../../../services/apiClient';
import auditTrail from '../../../services/auditTrail';
import Swal from 'sweetalert2';

// ── Types ─────────────────────────────────────────────────────────────────────

interface LunchDeductionRow {
  id: number;
  otHours: number | null;
  lunchDeduction: number | null;
}

interface ApiResponse {
  data: LunchDeductionRow[];
  totalCount: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 25;
const FORM_NAME      = 'Unpaid Lunch Deduction Bracket Setup';

const EMPTY_FORM = { otHours: '', lunchDeduction: '' };

// ── Helpers: decimal ↔ hh:mm ──────────────────────────────────────────────────

/** Converts a decimal hour value (e.g. 1.5) to "hh:mm" (e.g. "01:30") */
function decimalToHHMM(value: number | null): string {
  if (value === null || value === undefined) return '';
  const totalMinutes = Math.round(value * 60);
  const hh = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const mm = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

/** Converts "hh:mm" to a decimal hour value (e.g. "01:30" → 1.5) */
function hhmmToDecimal(value: string): number | null {
  if (!value || !value.includes(':')) return null;
  const [hh, mm] = value.split(':').map(Number);
  if (isNaN(hh) || isNaN(mm)) return null;
  return hh + mm / 60;
}

/** Formats raw keystrokes into hh:mm — strips non-digits, inserts colon at position 2 */
function formatTimeInput(value: string): string {
  const numbers = value.replace(/[^\d]/g, '').slice(0, 4);
  if (numbers.length >= 3) return `${numbers.slice(0, 2)}:${numbers.slice(2)}`;
  return numbers;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function UnpaidLunchDeductionBracketSetupPage() {
  const [rows, setRows]                 = useState<LunchDeductionRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading]       = useState(false);

  const [searchQuery, setSearchQuery]   = useState('');
  const [currentPage, setCurrentPage]   = useState(1);

  const [showModal, setShowModal]       = useState(false);
  const [isEditMode, setIsEditMode]     = useState(false);
  const [editingId, setEditingId]       = useState<number | null>(null);
  const [formData, setFormData]         = useState(EMPTY_FORM);

  const firstInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const response = await apiClient.get<ApiResponse>(
        '/Fs/Process/UnpaidLunchDeductionBracketSetUp',
        { params: { start, length: ITEMS_PER_PAGE } }
      );
      setRows(response.data.data);
      setTotalRecords(response.data.totalCount);
    } catch (error) {
      console.error('Failed to fetch unpaid lunch deduction brackets:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load records. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Client-side search filter (OTHours & LunchDeduction displayed as hh:mm) ─

  const filteredData = rows.filter((row) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      decimalToHHMM(row.otHours).includes(q) ||
      decimalToHHMM(row.lunchDeduction).includes(q)
    );
  });

  // ── Pagination ─────────────────────────────────────────────────────────────

  const totalPages  = Math.max(1, Math.ceil(totalRecords / ITEMS_PER_PAGE));
  const startIndex  = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex    = Math.min(startIndex + ITEMS_PER_PAGE, totalRecords);

  // ── ESC key ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowModal(false); };
    document.addEventListener('keydown', onKey);
    // Auto-focus first input
    setTimeout(() => firstInputRef.current?.focus(), 100);
    return () => document.removeEventListener('keydown', onKey);
  }, [showModal]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreateNew = () => {
    setFormData(EMPTY_FORM);
    setIsEditMode(false);
    setEditingId(null);
    setShowModal(true);
  };

  const handleEdit = (row: LunchDeductionRow) => {
    setFormData({
      otHours:       decimalToHHMM(row.otHours),
      lunchDeduction: decimalToHHMM(row.lunchDeduction),
    });
    setEditingId(row.id);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (row: LunchDeductionRow) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Confirm Delete',
      text: `Are you sure you want to delete this bracket (OT: ${decimalToHHMM(row.otHours)})?`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });
    if (!result.isConfirmed) return;

    try {
      await apiClient.delete(`/Fs/Process/UnpaidLunchDeductionBracketSetUp/${row.id}`);
      await auditTrail.log({
        accessType: 'Delete',
        trans: `Deleted unpaid lunch deduction bracket ID ${row.id}`,
        messages: `Bracket deleted — OTHours: ${decimalToHHMM(row.otHours)}, LunchDeduction: ${decimalToHHMM(row.lunchDeduction)}`,
        formName: FORM_NAME,
      });
      await fetchData();
      Swal.fire({ icon: 'success', title: 'Deleted', text: 'Record has been deleted.', timer: 1500, showConfirmButton: false });
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error.message || 'Failed to delete the record.';
      console.error('Failed to delete bracket:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
    }
  };

  const handleSubmit = async () => {
    if (!formData.otHours.trim()) {
      Swal.fire({ icon: 'warning', title: 'Validation', text: 'Please enter OT Hours.' });
      return;
    }
    if (!formData.lunchDeduction.trim()) {
      Swal.fire({ icon: 'warning', title: 'Validation', text: 'Please enter Lunch Deduction.' });
      return;
    }

    const payload = {
      otHours:       hhmmToDecimal(formData.otHours),
      lunchDeduction: hhmmToDecimal(formData.lunchDeduction),
    };

    // Confirm before saving on Update
    if (isEditMode) {
      const confirm = await Swal.fire({
        icon: 'question',
        title: 'Confirm Update',
        text: 'Are you sure you want to update this record?',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Update',
        cancelButtonText: 'Cancel',
      });
      if (!confirm.isConfirmed) return;
    }

    const resetForm = () => {
      setShowModal(false);
      setFormData(EMPTY_FORM);
      setIsEditMode(false);
      setEditingId(null);
    };

    try {
      if (isEditMode && editingId !== null) {
        await apiClient.put(`/Fs/Process/UnpaidLunchDeductionBracketSetUp/${editingId}`, payload);
        await auditTrail.log({
          accessType: 'Edit',
          trans: `Edited unpaid lunch deduction bracket ID ${editingId}`,
          messages: `Bracket updated — OTHours: ${formData.otHours}, LunchDeduction: ${formData.lunchDeduction}`,
          formName: FORM_NAME,
        });
        resetForm();
        await fetchData();
        Swal.fire({ icon: 'success', title: 'Updated', text: 'Record updated successfully.', timer: 1500, showConfirmButton: false });
      } else {
        await apiClient.post('/Fs/Process/UnpaidLunchDeductionBracketSetUp', payload);
        await auditTrail.log({
          accessType: 'Add',
          trans: `Added unpaid lunch deduction bracket`,
          messages: `Bracket created — OTHours: ${formData.otHours}, LunchDeduction: ${formData.lunchDeduction}`,
          formName: FORM_NAME,
        });
        resetForm();
        await fetchData();
        Swal.fire({ icon: 'success', title: 'Created', text: 'Record created successfully.', timer: 1500, showConfirmButton: false });
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error.message || 'Failed to save the record.';
      console.error('Failed to save bracket:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">

          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Unpaid Lunch Deduction Bracket Setup</h1>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">

            {/* Info Banner */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    Define unpaid lunch deduction brackets based on overtime hours worked. Configure automatic lunch break deductions that apply when employees exceed specified overtime thresholds.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {[
                      'Overtime-based deductions',
                      'Automated lunch calculations',
                      'Time-based brackets',
                      'Flexible deduction rules',
                    ].map((label) => (
                      <div key={label} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-4 mb-6">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                onClick={handleCreateNew}
              >
                <Plus className="w-4 h-4" />
                Create New
              </button>
              <div className="ml-auto flex items-center gap-2">
                <label className="text-gray-700">Search:</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  placeholder="hh:mm"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-4 py-2 text-left text-gray-700">Overtime [hh:mm] ▲</th>
                    <th className="px-4 py-2 text-left text-gray-700">Lunch Deduction [hh:mm]</th>
                    <th className="px-4 py-2 text-center text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                        Loading...
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-gray-500">No data available in table</td>
                    </tr>
                  ) : (
                    filteredData.map((row) => (
                      <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-2">{decimalToHHMM(row.otHours)}</td>
                        <td className="px-4 py-2">{decimalToHHMM(row.lunchDeduction)}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(row)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => handleDelete(row)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                              title="Delete"
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

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-gray-600">
                {totalRecords === 0
                  ? 'No entries'
                  : `Showing ${startIndex + 1} to ${endIndex} of ${totalRecords} entries`}
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded">{currentPage}</button>
                <button
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next
                </button>
              </div>
            </div>

            {/* ── Create / Edit Modal ── */}
            {showModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">

                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                    <h2 className="text-gray-800">{isEditMode ? 'Edit' : 'Create New'}</h2>
                    <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-gray-800">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-4">
                    <h3 className="text-blue-600 mb-4">Unpaid Lunch Deduction Bracket Setup</h3>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="w-40 text-gray-700 text-sm">OTHours :</label>
                        <input
                          ref={firstInputRef}
                          type="text"
                          value={formData.otHours}
                          onChange={(e) => setFormData({ ...formData, otHours: formatTimeInput(e.target.value) })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="hh:mm"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="w-40 text-gray-700 text-sm">Lunch Deduction :</label>
                        <input
                          type="text"
                          value={formData.lunchDeduction}
                          onChange={(e) => setFormData({ ...formData, lunchDeduction: formatTimeInput(e.target.value) })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="hh:mm"
                        />
                      </div>
                    </div>

                    {/* Modal Actions */}
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
                      >
                        {isEditMode ? 'Update' : 'Submit'}
                      </button>
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
                      >
                        Back to List
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}