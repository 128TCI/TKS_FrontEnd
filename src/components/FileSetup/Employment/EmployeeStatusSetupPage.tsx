import { useState, useEffect } from 'react';
import { X, Plus, Check, Edit, Trash2 } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import auditTrail from '../../../services/auditTrail';
import { Footer } from '../../Footer/Footer';
import Swal from 'sweetalert2';

export function EmployeeStatusSetupPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStatusIndex, setSelectedStatusIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form fields
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Data states
  const [statusList, setStatusList] = useState<Array<{ id: number; code: string; description: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
    
  // Form Name
  const formName = 'Employee Status Setup';
    
  // Fetch data from API
  useEffect(() => {
    fetchStatusData();
  }, []);

  const fetchStatusData = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const response = await apiClient.get('/Fs/Employment/EmployeeStatusSetUp');
      if (response.status === 200 && response.data) {
        const mappedData = response.data.map((item: any) => ({
          id: item.empStatID,
          code: item.empStatCode || '',
          description: item.empStatDesc || '',
        }));
        setStatusList(mappedData);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to load statuses';
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showCreateModal) {
        setShowCreateModal(false);
      }
    };
    if (showCreateModal) document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showCreateModal]);

  const handleCreateNew = () => {
    setIsEditMode(false);
    setStatusId(null);
    setCode('');
    setDescription('');
    setShowCreateModal(true);
  };

  const handleEdit = (status: any, index: number) => {
    setIsEditMode(true);
    setSelectedStatusIndex(index);
    setStatusId(status.id);
    setCode(status.code);
    setDescription(status.description);
    setShowCreateModal(true);
  };

  const handleDelete = async (status: any) => {
    const confirmed = await Swal.fire({
      icon: 'warning',
      title: 'Confirm Delete',
      text: `Are you sure you want to delete status ${status.code}?`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
    });

    if (confirmed.isConfirmed) {
      try {
        await apiClient.delete(`/Fs/Employment/EmployeeStatusSetUp/${status.id}`);
        await auditTrail.log({
            accessType: 'Delete',
            trans: `Deleted status ${status.code}`,
            messages: `Status deleted: ${status.code} - ${status.description}`,
            formName,
        });
        await Swal.fire({ icon: 'success', title: 'Deleted', text: 'Status deleted successfully.', timer: 1500, showConfirmButton: false });
        fetchStatusData();
      } catch (error: any) {
        Swal.fire('Error', error.response?.data?.message || 'Failed to delete', 'error');
      }
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      Swal.fire('Warning', 'Please enter a Code.', 'warning');
      return;
    }
    // Check for duplicate code (only when creating new or changing code during edit)
                const isDuplicate = statusList.some((status, index) => {
                  // When editing, exclude the current record from duplicate check
                  if (isEditMode && selectedStatusIndex === index) {
                    return false;
                  }
                  return status.code.toLowerCase() === code.trim().toLowerCase();
                });
            
                if (isDuplicate) {
                  await Swal.fire({
                    icon: 'error',
                    title: 'Duplicate Code',
                    text: 'This code is already in use. Please use a different code.',
                  });
                  return;
                }
    setSubmitting(true);
    try {
      const payload = {
        empStatID: isEditMode && statusId ? statusId : 0,
        empStatCode: code,
        empStatDesc: description,
      };

      if (isEditMode && statusId) {
        await apiClient.put(`/Fs/Employment/EmployeeStatusSetUp/${statusId}`, payload);
        await auditTrail.log({
            accessType: 'Edit',
            trans: `Edited status ${payload.empStatCode}`,
            messages: `Status updated: ${payload.empStatCode} - ${payload.empStatDesc}`,
            formName,
        });
        await Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Employee Status updated successfully.',
            timer: 2000,
            showConfirmButton: false,
        });
      } else {
        await apiClient.post('/Fs/Employment/EmployeeStatusSetUp', payload);
        await auditTrail.log({
            accessType: 'Add',
            trans: `Added status ${payload.empStatCode}`,
            messages: `Status created: ${payload.empStatCode} - ${payload.empStatDesc}`,
            formName,
        });
        await Swal.fire({
            icon: 'success',
            title: 'Success',
            text: `Status ${isEditMode ? 'updated' : 'created'} successfully.`,
            timer: 1500,
            showConfirmButton: false,
        });
      }

      await Swal.fire({ icon: 'success', title: 'Success', text: `Status ${isEditMode ? 'updated' : 'created'} successfully.`, timer: 1500, showConfirmButton: false });
      setShowCreateModal(false);
      fetchStatusData();
    } catch (error: any) {
      Swal.fire('Error', error.response?.data?.message || 'An error occurred', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStatuses = statusList.filter(s =>
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredStatuses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStatuses = filteredStatuses.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Original Header Design */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Employee Status Setup</h1>
          </div>

          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
            {/* Information Frame */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">Define employee status classifications for tracking employment types.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5" /><span className="text-gray-600">Employment status code management</span></div>
                    <div className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5" /><span className="text-gray-600">Status description tracking</span></div>
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
                <Plus className="w-4 h-4" /> Create New
              </button>
              <div className="ml-auto flex items-center gap-2">
                <label className="text-gray-700">Search:</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-10 text-gray-500">Loading statuses...</div>
              ) : fetchError ? (
                <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded">{fetchError}</div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-4 py-2 text-left text-gray-700">Code ▲</th>
                      <th className="px-4 py-2 text-left text-gray-700">Description</th>
                      <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStatuses.map((status, index) => (
                      <tr key={status.id || index} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-2">{status.code}</td>
                        <td className="px-4 py-2">{status.description}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(status, index)} className="p-1 text-blue-600 hover:bg-blue-100 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(status)} className="p-1 text-red-600 hover:bg-red-100 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-gray-600">
                Showing {filteredStatuses.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStatuses.length)} of {filteredStatuses.length} entries
              </div>
              <div className="flex gap-2">
                <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                >Previous</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button 
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}
                    >{page}</button>
                ))}
                <button 
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                >Next</button>
              </div>
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
              <>
                <div className="fixed inset-0 bg-black/30 z-10" onClick={() => !submitting && setShowCreateModal(false)}></div>
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                    <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                      <h2 className="text-gray-800">{isEditMode ? 'Edit Employee Status' : 'Create New'}</h2>
                      <button onClick={() => setShowCreateModal(false)} className="text-gray-600 hover:text-gray-800"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="p-4">
                      <h3 className="text-blue-600 mb-3">Employee Status Setup</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">Code :</label>
                          <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">Description :</label>
                          <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <button 
                          onClick={handleSubmit} 
                          disabled={submitting}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
                        >
                          {submitting ? 'Processing...' : isEditMode ? 'Update' : 'Submit'}
                        </button>
                        <button onClick={() => setShowCreateModal(false)} className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm">
                          Back to List
                        </button>
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