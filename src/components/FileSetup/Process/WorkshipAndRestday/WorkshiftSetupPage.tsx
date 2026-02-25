import { useState, useEffect } from 'react';
import { Plus, Check, Info, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';
import apiClient from '../../../../services/apiClient';
import auditTrail from '../../../../services/auditTrail'
import Swal from 'sweetalert2';

import { Workshift, DEFAULT_WORKSHIFT } from '../../../Types/Workshift.types';
import { WorkshiftFormModal, normalizeWorkshiftForForm } from '../../../Modals/WorkshiftSetupModals/WorkshiftSetupFormModal';
import { WorkshiftDetailsModal } from '../../../Modals/WorkshiftSetupModals/WorkshiftSetupDetailsModal';

const formName = 'Workshift SetUp';

const ITEMS_PER_PAGE = 25;

export function WorkshiftSetupPage() {
  // ── State ────────────────────────────────────────────────────────────────
  const [workshiftData,     setWorkshiftData]     = useState<Workshift[]>([]);
  const [searchQuery,       setSearchQuery]       = useState('');
  const [currentPage,       setCurrentPage]       = useState(1);
  const [isLoading,         setIsLoading]         = useState(false);

  const [showFormModal,     setShowFormModal]     = useState(false);
  const [showDetailsModal,  setShowDetailsModal]  = useState(false);

  const [isEditMode,        setIsEditMode]        = useState(false);
  const [editingCode,       setEditingCode]       = useState('');
  const [formData,          setFormData]          = useState<Workshift>({ ...DEFAULT_WORKSHIFT });

  const [selectedWorkshift, setSelectedWorkshift] = useState<Workshift | null>(null);

  // ── Fetch on mount ───────────────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const workshifts = await apiClient.get('/Fs/Process/WorkshiftSetUp');
        if (!controller.signal.aborted) {
          setWorkshiftData(workshifts.data?.data ?? workshifts.data ?? []);
        }
      } catch (error) {
        console.error('Failed to load workshift data:', error);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  // ── ESC key to close modals ──────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (showFormModal)    setShowFormModal(false);
      if (showDetailsModal) setShowDetailsModal(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showFormModal, showDetailsModal]);

  // ── Filtering & pagination ───────────────────────────────────────────────
  const filteredData = workshiftData.filter(
    (item) =>
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages  = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const startIndex  = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ── CRUD handlers ────────────────────────────────────────────────────────
  const handleCreateNew = () => {
    setFormData({ ...DEFAULT_WORKSHIFT });
    setIsEditMode(false);
    setEditingCode('');
    setShowFormModal(true);
  };

  const handleEdit = (item: Workshift) => {
    // Normalize raw DB values (datetime strings, decimal hours) into
    // the human-readable strings the form inputs expect.
    setFormData(normalizeWorkshiftForForm(item as unknown as Record<string, unknown>));
    setEditingCode(item.code);
    setIsEditMode(true);
    setShowFormModal(true);
  };

  const handleDetails = (item: Workshift) => {
    setSelectedWorkshift(item);
    setShowDetailsModal(true);
  };

  const handleDelete = async (code: string) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Confirm Delete',
      text: `Are you sure you want to delete workshift "${code}"?`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      await apiClient.delete(`/Fs/Process/WorkshiftSetUp/${encodeURIComponent(code)}`);

      await auditTrail.log({
        accessType: 'Delete',
        trans: `Deleted workshift ${code}`,
        messages: `Workshift deleted: ${code}`,
        formName: formName,
      });

      setWorkshiftData(prev => prev.filter(item => item.code !== code));

      Swal.fire({ icon: 'success', title: 'Deleted', text: `Workshift "${code}" has been deleted.`, timer: 1500, showConfirmButton: false });

    } catch (error: any) {
      console.error('Failed to delete workshift:', error);

      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to delete workshift.';

      Swal.fire({ icon: 'error', title: 'Error', text: message });
    }
  };

  // Called by WorkshiftFormModal after a successful save
  const handleSuccess = (saved: Workshift) => {
    setWorkshiftData((prev) =>
      isEditMode
        ? prev.map((item) => (item.code === editingCode ? saved : item))
        : [...prev, saved],
    );
    setShowFormModal(false);
    setIsEditMode(false);
    setEditingCode('');
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto relative">

          {/* Page header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Workshift Setup</h1>
          </div>

          {/* Main content card */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">

            {/* Info banner */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    Define workshift patterns including time in/out, break schedules, and calculation
                    rules. Configure parameters for attendance tracking, overtime eligibility, and
                    shift-specific policies.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {[
                      'Flexible shift configurations',
                      'Break time management',
                      'Attendance calculation rules',
                      'Overtime and tardiness policies',
                    ].map((text) => (
                      <div key={text} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <span className="text-gray-600">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls row */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Create New
              </button>
              <div className="ml-auto flex items-center gap-2">
                <label className="text-gray-700 text-sm">Search:</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-sm"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-4 py-2 text-left text-gray-700 text-sm">Code ▲</th>
                    <th className="px-4 py-2 text-left text-gray-700 text-sm">Description ▲</th>
                    <th className="px-4 py-2 text-center text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-sm">
                        Loading...
                      </td>
                    </tr>
                  ) : currentData.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-sm">
                        No records found.
                      </td>
                    </tr>
                  ) : (
                    currentData.map((item) => (
                      <tr key={item.code} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">{item.code}</td>
                        <td className="px-4 py-2 text-sm">{item.description}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleDetails(item)}
                              className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                              title="View details"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => handleDelete(item.code)}
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
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-gray-500">
                Showing {filteredData.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} entries
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40"
                >
                  Previous
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded">
                  {currentPage}
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />

      {showFormModal && (
        <WorkshiftFormModal
          isEditMode={isEditMode}
          editingCode={editingCode}
          formData={formData}
          setFormData={setFormData}
          existingCodes={workshiftData.map((w) => w.code)}
          onSuccess={handleSuccess}
          onClose={() => setShowFormModal(false)}
        />
      )}

      {showDetailsModal && selectedWorkshift && (
        <WorkshiftDetailsModal
          workshift={selectedWorkshift}
          onClose={() => setShowDetailsModal(false)}
          onEdit={(item) => {          // ← add this
            setShowDetailsModal(false);
            handleEdit(item);
          }}
        />
      )}
    </div>
  );
}