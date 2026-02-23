import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Check, Edit, Trash2, Loader2 } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';
import apiClient from '../../../../services/apiClient';
import auditTrail from '../../../../services/auditTrail';
import Swal from 'sweetalert2';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RestDayRow {
  id: number;
  referenceNo: string;
  defRestDay1_WK1: string | null;
  defRestDay2_WK1: string | null;
  defRestDay3_WK1: string | null;
  defRestDay1_WK2: string | null;
  defRestDay2_WK2: string | null;
  defRestDay3_WK2: string | null;
}

interface ApiRestDayResponse {
  data: RestDayRow[];
  totalCount: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 25;
const DAYS_OF_WEEK   = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const formName      = 'Rest Day SetUp';

const EMPTY_FORM = {
  referenceNo: '',
  week1Day1: '',
  week1Day2: '',
  week1Day3: '',
  week2Day1: '',
  week2Day2: '',
  week2Day3: '',
};

// ── Component ─────────────────────────────────────────────────────────────────

export function RestDaySetupPage() {
  const [rows, setRows]                 = useState<RestDayRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading]       = useState(false);

  const [searchQuery, setSearchQuery]   = useState('');
  const [currentPage, setCurrentPage]   = useState(1);

  const [showModal, setShowModal]       = useState(false);
  const [isEditMode, setIsEditMode]     = useState(false);
  const [editingRef, setEditingRef]     = useState('');
  const [formData, setFormData]         = useState(EMPTY_FORM);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchRestDays = useCallback(async () => {
    setIsLoading(true);
    try {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const response = await apiClient.get<ApiRestDayResponse>(
        '/Fs/Process/RestDaySetUp',
        { params: { referenceNo: searchQuery, start, length: ITEMS_PER_PAGE } }
      );
      setRows(response.data.data);
      setTotalRecords(response.data.totalCount);
    } catch (error) {
      console.error('Failed to fetch rest days:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load rest day setups. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => { fetchRestDays(); }, [fetchRestDays]);

  // Reset to page 1 when search changes
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  // ── ESC key ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowModal(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showModal]);

  // ── Pagination helpers ─────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(totalRecords / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex   = Math.min(startIndex + ITEMS_PER_PAGE, totalRecords);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreateNew = () => {
    setFormData(EMPTY_FORM);
    setIsEditMode(false);
    setEditingRef('');
    setShowModal(true);
  };

  const handleEdit = (row: RestDayRow) => {
    setFormData({
      referenceNo: row.referenceNo,
      week1Day1:   row.defRestDay1_WK1 ?? '',
      week1Day2:   row.defRestDay2_WK1 ?? '',
      week1Day3:   row.defRestDay3_WK1 ?? '',
      week2Day1:   row.defRestDay1_WK2 ?? '',
      week2Day2:   row.defRestDay2_WK2 ?? '',
      week2Day3:   row.defRestDay3_WK2 ?? '',
    });
    setEditingRef(row.referenceNo);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (row: RestDayRow) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Confirm Delete',
      text: `Are you sure you want to delete rest day setup "${row.referenceNo}"?`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });
    if (!result.isConfirmed) return;

    try {
      await apiClient.delete(`/Fs/Process/RestDaySetUp/${encodeURIComponent(row.referenceNo)}`);
      await auditTrail.log({
        accessType: 'Delete',
        trans: `Deleted rest day setup ${row.referenceNo}`,
        messages: `Rest day setup deleted: ${row.referenceNo}`,
        formName: formName,
      });
      await fetchRestDays();
      Swal.fire({ icon: 'success', title: 'Deleted', text: `Rest day setup "${row.referenceNo}" has been deleted.`, timer: 1500, showConfirmButton: false });
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error.message || 'Failed to delete the entry.';
      console.error('Failed to delete rest day setup:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
    }
  };

  const handleSubmit = async () => {
    if (!formData.referenceNo.trim()) {
      Swal.fire({ icon: 'warning', title: 'Validation', text: 'Please enter a Reference No.' });
      return;
    }

    const payload = {
      referenceNo:      formData.referenceNo.trim(),
      defRestDay1_WK1:  formData.week1Day1 || null,
      defRestDay2_WK1:  formData.week1Day2 || null,
      defRestDay3_WK1:  formData.week1Day3 || null,
      defRestDay1_WK2:  formData.week2Day1 || null,
      defRestDay2_WK2:  formData.week2Day2 || null,
      defRestDay3_WK2:  formData.week2Day3 || null,
    };

    const resetForm = () => {
      setShowModal(false);
      setFormData(EMPTY_FORM);
      setIsEditMode(false);
      setEditingRef('');
    };

    try {
      if (isEditMode) {
        await apiClient.put(`/Fs/Process/RestDaySetUp/${encodeURIComponent(editingRef)}`, payload);
        await auditTrail.log({
          accessType: 'Edit',
          trans: `Edited rest day setup ${payload.referenceNo}`,
          messages: `Rest day setup updated: ${payload.referenceNo}`,
          formName: formName,
        });
        resetForm();
        await fetchRestDays();
        Swal.fire({ icon: 'success', title: 'Updated', text: 'Rest day setup updated successfully.', timer: 1500, showConfirmButton: false });
      } else {
        await apiClient.post('/Fs/Process/RestDaySetUp', payload);
        await auditTrail.log({
          accessType: 'Add',
          trans: `Added rest day setup ${payload.referenceNo}`,
          messages: `Rest day setup created: ${payload.referenceNo}`,
          formName: formName,
        });
        resetForm();
        await fetchRestDays();
        Swal.fire({ icon: 'success', title: 'Created', text: 'Rest day setup created successfully.', timer: 1500, showConfirmButton: false });
      }
    } catch (error: any) {
      const status  = error?.response?.status;
      const message = error?.response?.data?.message;
      if (status === 409) {
        Swal.fire({ icon: 'warning', title: 'Duplicate Entry', text: message ?? 'A Rest Day Setup with this Reference No. already exists.' });
      } else {
        console.error('Failed to save rest day setup:', error);
        Swal.fire({ icon: 'error', title: 'Error', text: message ?? 'Failed to save the entry. Please try again.' });
      }
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">

          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Rest Day Setup</h1>
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
                    Define rest day schedules by specifying up to three rest days per week over a two-week cycle.
                    Create reference codes that represent complete rest day patterns for easy assignment to employees or groups.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {[
                      'Two-week rest day patterns',
                      'Up to 3 rest days per week',
                      'Reference code organization',
                      'Flexible schedule configurations',
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
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-4 py-2 text-left text-gray-700" rowSpan={2}>Code ▲</th>
                    <th className="px-4 py-2 text-center text-gray-700 border-l border-gray-300" colSpan={3}>Week 1</th>
                    <th className="px-4 py-2 text-center text-gray-700 border-l border-gray-300" colSpan={3}>Week 2</th>
                    <th className="px-4 py-2 text-left text-gray-700 border-l border-gray-300" rowSpan={2}></th>
                  </tr>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    {['Day 1', 'Day 2', 'Day 3', 'Day 1', 'Day 2', 'Day 3'].map((d, i) => (
                      <th key={i} className="px-4 py-2 text-left text-gray-700 border-l border-gray-300">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                        Loading...
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">No records found.</td>
                    </tr>
                  ) : (
                    rows.map((row, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-2">{row.referenceNo}</td>
                        <td className="px-4 py-2 border-l border-gray-200">{row.defRestDay1_WK1 ?? ''}</td>
                        <td className="px-4 py-2 border-l border-gray-200">{row.defRestDay2_WK1 ?? ''}</td>
                        <td className="px-4 py-2 border-l border-gray-200">{row.defRestDay3_WK1 ?? ''}</td>
                        <td className="px-4 py-2 border-l border-gray-200">{row.defRestDay1_WK2 ?? ''}</td>
                        <td className="px-4 py-2 border-l border-gray-200">{row.defRestDay2_WK2 ?? ''}</td>
                        <td className="px-4 py-2 border-l border-gray-200">{row.defRestDay3_WK2 ?? ''}</td>
                        <td className="px-4 py-2 border-l border-gray-200">
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
                {totalRecords > 0
                  ? `Showing ${startIndex + 1} to ${endIndex} of ${totalRecords} entries`
                  : 'No entries'}
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
                    <h3 className="text-blue-600 mb-3">Rest Day Setup</h3>

                    <div className="space-y-3">
                      {/* Reference No */}
                      <div className="flex items-center gap-3">
                        <label className="w-32 text-gray-700 text-sm">Reference No :</label>
                        <input
                          type="text"
                          maxLength={10}
                          value={formData.referenceNo}
                          onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                          disabled={isEditMode}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>

                      {/* Week 1 */}
                      <h4 className="text-blue-600 text-sm mt-4">Week 1</h4>
                      {(['week1Day1', 'week1Day2', 'week1Day3'] as const).map((key, i) => (
                        <div key={key} className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">RestDay {i + 1} :</label>
                          <select
                            value={formData[key]}
                            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            {DAYS_OF_WEEK.map((day, idx) => (
                              <option key={idx} value={day}>{day}</option>
                            ))}
                          </select>
                        </div>
                      ))}

                      {/* Week 2 */}
                      <h4 className="text-blue-600 text-sm mt-4">Week 2</h4>
                      {(['week2Day1', 'week2Day2', 'week2Day3'] as const).map((key, i) => (
                        <div key={key} className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">RestDay {i + 1} :</label>
                          <select
                            value={formData[key]}
                            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            {DAYS_OF_WEEK.map((day, idx) => (
                              <option key={idx} value={day}>{day}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>

                    {/* Modal Actions */}
                    <div className="flex gap-3 mt-4">
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