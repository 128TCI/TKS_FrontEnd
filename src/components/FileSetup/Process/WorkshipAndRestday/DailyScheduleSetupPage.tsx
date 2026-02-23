import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Check, Search as SearchIcon, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';
import apiClient from '../../../../services/apiClient';
import auditTrail from '../../../../services/auditTrail';
import Swal from 'sweetalert2';

interface DailySchedule {
  dailyScheduleId: number;
  referenceNo: string;
  monday: string | null;
  tuesday: string | null;
  wednesday: string | null;
  thursday: string | null;
  friday: string | null;
  saturday: string | null;
  sunday: string | null;
}

interface WorkshiftCode {
  code: string;
  description: string;
}

interface ApiDailyScheduleResponse {
  data: DailySchedule[];
  totalCount: number;
}

const ITEMS_PER_PAGE          = 25;
const WORKSHIFT_ITEMS_PER_PAGE = 10;
const formName               = 'Daily Schedule SetUp';

export function DailyScheduleSetupPage() {
  const [showCreateModal, setShowCreateModal]   = useState(false);
  const [showSearchModal, setShowSearchModal]   = useState(false);
  const [searchModalField, setSearchModalField] = useState<string>('');
  const [searchQuery, setSearchQuery]           = useState('');
  const [workshiftSearchQuery, setWorkshiftSearchQuery] = useState('');
  const [currentPage, setCurrentPage]           = useState(1);
  const [workshiftCurrentPage, setWorkshiftCurrentPage] = useState(1);
  const [isEditMode, setIsEditMode]             = useState(false);
  const [editingCode, setEditingCode]           = useState('');

  // Main table state
  const [dailyScheduleData, setDailyScheduleData] = useState<DailySchedule[]>([]);
  const [totalRecords, setTotalRecords]           = useState(0);
  const [isLoading, setIsLoading]                 = useState(false);

  // Workshift modal state — all records fetched once, filtered client-side
  const [allWorkshiftData, setAllWorkshiftData]   = useState<WorkshiftCode[]>([]);
  const [isWorkshiftLoading, setIsWorkshiftLoading] = useState(false);

  const [formData, setFormData] = useState({
    referenceNo: '',
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: '',
  });

  // ─── Client-side workshift filter + pagination ────────────────────────────
  const filteredWorkshifts = allWorkshiftData.filter(
    (w) =>
      w.code.toLowerCase().includes(workshiftSearchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(workshiftSearchQuery.toLowerCase())
  );
  const workshiftTotalRecords = filteredWorkshifts.length;
  const workshiftTotalPages   = Math.max(1, Math.ceil(workshiftTotalRecords / WORKSHIFT_ITEMS_PER_PAGE));
  const workshiftStartIndex   = (workshiftCurrentPage - 1) * WORKSHIFT_ITEMS_PER_PAGE;
  const workshiftEndIndex     = Math.min(workshiftStartIndex + WORKSHIFT_ITEMS_PER_PAGE, workshiftTotalRecords);
  const pagedWorkshifts       = filteredWorkshifts.slice(workshiftStartIndex, workshiftStartIndex + WORKSHIFT_ITEMS_PER_PAGE);

  // ─── API: Fetch Daily Schedules ───────────────────────────────────────────
  const fetchDailySchedules = useCallback(async () => {
    setIsLoading(true);
    try {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const response = await apiClient.get<ApiDailyScheduleResponse>(
        '/Fs/Process/DailyScheduleSetUp',
        { params: { referenceNo: searchQuery, start, length: ITEMS_PER_PAGE } }
      );
      setDailyScheduleData(response.data.data);
      setTotalRecords(response.data.totalCount);
    } catch (error) {
      console.error('Failed to fetch daily schedules:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load daily schedules. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => { fetchDailySchedules(); }, [fetchDailySchedules]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  // ─── API: Fetch ALL Workshift Codes once when modal opens ─────────────────
  const fetchWorkshifts = useCallback(async () => {
    setIsWorkshiftLoading(true);
    try {
      const response = await apiClient.get('/Fs/Process/WorkshiftSetUp', {
        params: { code: '', start: 0, length: 9999 },
      });
      setAllWorkshiftData(response.data.data ?? []);
    } catch (error) {
      console.error('Failed to fetch workshift codes:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load workshift codes. Please try again.' });
    } finally {
      setIsWorkshiftLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showSearchModal) fetchWorkshifts();
  }, [showSearchModal, fetchWorkshifts]);

  // Reset workshift page when search query changes
  useEffect(() => { setWorkshiftCurrentPage(1); }, [workshiftSearchQuery]);

  // ─── Pagination Helpers (main table) ──────────────────────────────────────
  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex   = Math.min(startIndex + ITEMS_PER_PAGE, totalRecords);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleCreateNew = () => {
    setFormData({ referenceNo: '', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: '' });
    setIsEditMode(false);
    setEditingCode('');
    setShowCreateModal(true);
  };

  const handleEdit = (item: DailySchedule) => {
    setFormData({
      referenceNo: item.referenceNo,
      monday:    item.monday    ?? '',
      tuesday:   item.tuesday   ?? '',
      wednesday: item.wednesday ?? '',
      thursday:  item.thursday  ?? '',
      friday:    item.friday    ?? '',
      saturday:  item.saturday  ?? '',
      sunday:    item.sunday    ?? '',
    });
    setEditingCode(item.referenceNo);
    setIsEditMode(true);
    setShowCreateModal(true);
  };

  const handleDelete = async (item: DailySchedule) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Confirm Delete',
      text: `Are you sure you want to delete daily schedule "${item.referenceNo}"?`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });
    if (!result.isConfirmed) return;

    try {
      await apiClient.delete(`/Fs/Process/DailyScheduleSetUp/${encodeURIComponent(item.referenceNo)}`);
      await auditTrail.log({
        accessType: 'Delete',
        trans: `Deleted daily schedule ${item.referenceNo}`,
        messages: `Daily schedule deleted: ${item.referenceNo}`,
        formName: formName,
      });
      await fetchDailySchedules();
      Swal.fire({ icon: 'success', title: 'Deleted', text: `Daily schedule "${item.referenceNo}" has been deleted.`, timer: 1500, showConfirmButton: false });
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error.message || 'Failed to delete the entry.';
      console.error('Failed to delete daily schedule:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
    }
  };

  const handleSubmit = async () => {
    if (!formData.referenceNo.trim()) {
      Swal.fire({ icon: 'warning', title: 'Validation', text: 'Please enter a Reference Code.' });
      return;
    }

    const payload = {
      referenceNo: formData.referenceNo,
      monday:    formData.monday,
      tuesday:   formData.tuesday,
      wednesday: formData.wednesday,
      thursday:  formData.thursday,
      friday:    formData.friday,
      saturday:  formData.saturday,
      sunday:    formData.sunday,
    };

    const resetForm = () => {
      setShowCreateModal(false);
      setFormData({ referenceNo: '', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: '' });
      setIsEditMode(false);
      setEditingCode('');
    };

    try {
      if (isEditMode) {
        await apiClient.put(`/Fs/Process/DailyScheduleSetUp/${encodeURIComponent(editingCode)}`, payload);
        await auditTrail.log({
          accessType: 'Edit',
          trans: `Edited daily schedule ${payload.referenceNo}`,
          messages: `Daily schedule updated: ${payload.referenceNo}`,
          formName: formName,
        });
        resetForm();
        await fetchDailySchedules();
        Swal.fire({ icon: 'success', title: 'Updated', text: 'Daily schedule updated successfully.', timer: 1500, showConfirmButton: false });
      } else {
        await apiClient.post('/Fs/Process/DailyScheduleSetUp', payload);
        await auditTrail.log({
          accessType: 'Add',
          trans: `Added daily schedule ${payload.referenceNo}`,
          messages: `Daily schedule created: ${payload.referenceNo}`,
          formName: formName,
        });
        resetForm();
        await fetchDailySchedules();
        Swal.fire({ icon: 'success', title: 'Created', text: 'Daily schedule created successfully.', timer: 1500, showConfirmButton: false });
      }
    } catch (error: any) {
      const status  = error?.response?.status;
      const message = error?.response?.data?.message;
      if (status === 409) {
        Swal.fire({ icon: 'warning', title: 'Duplicate Entry', text: message ?? 'A Daily Schedule with this Reference Code already exists.' });
      } else {
        console.error('Failed to save daily schedule:', error);
        Swal.fire({ icon: 'error', title: 'Error', text: message ?? 'Failed to save the entry. Please try again.' });
      }
    }
  };

  const handleOpenSearch = (field: string) => {
    setSearchModalField(field);
    setWorkshiftSearchQuery('');
    setWorkshiftCurrentPage(1);
    setShowSearchModal(true);
  };

  const handleSelectWorkshift = (code: string) => {
    setFormData({ ...formData, [searchModalField]: code });
    setShowSearchModal(false);
  };

  const handleClearField = (field: string) => {
    setFormData({ ...formData, [field]: '' });
  };

  // ─── ESC Key Handler ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showSearchModal) setShowSearchModal(false);
        else if (showCreateModal) setShowCreateModal(false);
      }
    };
    if (showCreateModal || showSearchModal) document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showCreateModal, showSearchModal]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Daily Schedule Setup</h1>
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
                    Define daily work schedules by assigning workshift codes for each day of the week. Create reference codes that represent complete weekly schedule patterns for easy assignment to employees or groups.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {['Weekly schedule templates', 'Day-specific workshift assignments', 'Reference code organization', 'Flexible schedule configurations'].map(label => (
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
                    {['Reference Code ▲', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(h => (
                      <th key={h} className="px-4 py-2 text-left text-gray-700">{h}</th>
                    ))}
                    <th className="px-4 py-2 text-center text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={9} className="text-center py-8 text-gray-500">Loading...</td></tr>
                  ) : dailyScheduleData.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-8 text-gray-500">No records found.</td></tr>
                  ) : (
                    dailyScheduleData.map((item, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-2">{item.referenceNo}</td>
                        <td className="px-4 py-2">{item.monday}</td>
                        <td className="px-4 py-2">{item.tuesday}</td>
                        <td className="px-4 py-2">{item.wednesday}</td>
                        <td className="px-4 py-2">{item.thursday}</td>
                        <td className="px-4 py-2">{item.friday}</td>
                        <td className="px-4 py-2">{item.saturday}</td>
                        <td className="px-4 py-2">{item.sunday}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-2">
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-gray-600">
                {totalRecords > 0 ? `Showing ${startIndex + 1} to ${endIndex} of ${totalRecords} entries` : 'No entries'}
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>Previous</button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded">{currentPage}</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || totalPages === 0}>Next</button>
              </div>
            </div>

            {/* ── Create / Edit Modal ── */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                    <h2 className="text-gray-800">{isEditMode ? 'Edit' : 'Create New'}</h2>
                    <button onClick={() => setShowCreateModal(false)} className="text-gray-600 hover:text-gray-800"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-blue-600 mb-3">Daily Schedule</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <label className="w-32 text-gray-700 text-sm">Reference Code :</label>
                        <input
                          type="text"
                          maxLength={10}
                          value={formData.referenceNo}
                          onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                          disabled={isEditMode}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                      {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => (
                        <div key={day} className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm capitalize">{day} :</label>
                          <input type="text" value={formData[day]} readOnly className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm bg-gray-50" />
                          <button onClick={() => handleOpenSearch(day)} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"><SearchIcon className="w-4 h-4" /></button>
                          <button onClick={() => handleClearField(day)} className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm">
                        {isEditMode ? 'Update' : 'Submit'}
                      </button>
                      <button onClick={() => setShowCreateModal(false)} className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm">
                        Back to List
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Workshift Search Modal ── */}
            {showSearchModal && (
              <>
                <div className="fixed inset-0 bg-black/30 z-30" onClick={() => setShowSearchModal(false)} />
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                      <h2 className="text-gray-800">Search</h2>
                      <button onClick={() => setShowSearchModal(false)} className="text-gray-600 hover:text-gray-800"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="p-3">
                      <h3 className="text-blue-600 mb-2 text-sm">Workshift Code</h3>
                      <div className="flex items-center gap-2 mb-4 justify-end">
                        <label className="text-gray-700">Search:</label>
                        <input
                          type="text"
                          value={workshiftSearchQuery}
                          onChange={(e) => setWorkshiftSearchQuery(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        />
                      </div>
                      <div className="border border-gray-200 rounded">
                        <table className="w-full border-collapse text-sm">
                          <thead className="sticky top-0 bg-white">
                            <tr className="bg-gray-100 border-b-2 border-gray-300">
                              <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Code ▲</th>
                              <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {isWorkshiftLoading ? (
                              <tr><td colSpan={2} className="text-center py-6 text-gray-500">Loading...</td></tr>
                            ) : pagedWorkshifts.length === 0 ? (
                              <tr><td colSpan={2} className="text-center py-6 text-gray-500">No workshift codes found.</td></tr>
                            ) : (
                              pagedWorkshifts.map((item, index) => (
                                <tr key={index} className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer" onClick={() => handleSelectWorkshift(item.code)}>
                                  <td className="px-3 py-1.5">{item.code}</td>
                                  <td className="px-3 py-1.5">{item.description}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                      {/* Workshift Pagination */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-gray-600 text-xs">
                          {workshiftTotalRecords > 0
                            ? `Showing ${workshiftStartIndex + 1} to ${workshiftEndIndex} of ${workshiftTotalRecords} entries`
                            : 'No entries'}
                        </div>
                        <div className="flex gap-1">
                          <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-xs" onClick={() => setWorkshiftCurrentPage(prev => Math.max(1, prev - 1))} disabled={workshiftCurrentPage === 1}>Previous</button>
                          <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs">{workshiftCurrentPage}</button>
                          {workshiftCurrentPage < workshiftTotalPages && (
                            <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs" onClick={() => setWorkshiftCurrentPage(workshiftCurrentPage + 1)}>{workshiftCurrentPage + 1}</button>
                          )}
                          <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-xs" onClick={() => setWorkshiftCurrentPage(prev => Math.min(workshiftTotalPages, prev + 1))} disabled={workshiftCurrentPage === workshiftTotalPages || workshiftTotalPages === 0}>Next</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}