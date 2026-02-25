import { useState, useEffect } from 'react';
import { Search, Plus, X, Check, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../Footer/Footer';
import { decryptData } from '../../../services/encryptionService';

import Swal from 'sweetalert2';
import apiClient from '../../../services/apiClient';
import auditTrail from '../../../services/auditTrail';

const formName = 'Group Schedule SetUp';
interface GroupSchedule {
  groupScheduleID: number;
  groupScheduleCode: string;
  groupScheduleDesc: string;
}

export function GroupScheduleSetupPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState<GroupSchedule | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    groupScheduleCode: '',
    groupScheduleDesc: ''
  });

  // API Data States
  const [schedules, setSchedules] = useState<GroupSchedule[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');

  // Fetch group schedules from API
  useEffect(() => {
    fetchGroupSchedules();
  }, []);

  const fetchGroupSchedules = async () => {
    setLoadingData(true);
    setDataError('');
    try {
      const response = await apiClient.get('/Fs/Process/GroupScheduleSetUp');
      if (response.status === 200 && response.data) {
        setSchedules(response.data);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load group schedules';
      setDataError(errorMsg);
      console.error('Error fetching group schedules:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const itemsPerPage = 10;

  // Permissions
    const [permissions, setPermissions] = useState<Record<string, boolean>>({});
    const hasPermission = (accessType: string) => permissions[accessType] === true;
  
    useEffect(() => {
      getGroupSchedSetupPermissions();
    }, []);
  
    const getGroupSchedSetupPermissions = () => {
      const rawPayload = localStorage.getItem("loginPayload");
      if (!rawPayload) return;
  
      try {
        const parsedPayload = JSON.parse(rawPayload);
        const encryptedArray: any[] = parsedPayload.permissions || [];
  
        const branchEntries = encryptedArray.filter(
          (p) => decryptData(p.formName) === "GroupScheduleSetUp"
        );
  
        // Build a map: { Add: true, Edit: true, ... }
        const permMap: Record<string, boolean> = {};
        branchEntries.forEach((p) => {
          const accessType = decryptData(p.accessTypeName);
          if (accessType) permMap[accessType] = true;
        });
  
        setPermissions(permMap);
  
      } catch (e) {
        console.error("Error parsing or decrypting payload", e);
      }
    };
  
  const filteredData = schedules.filter(item =>
    item.groupScheduleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.groupScheduleDesc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleCreateNew = () => {
    setFormData({
      groupScheduleCode: '',
      groupScheduleDesc: ''
    });
    setEditingItem(null);
    setShowCreateModal(true);
  };

  const handleEdit = (item: GroupSchedule) => {
    setEditingItem(item);
    setFormData({
      groupScheduleCode: item.groupScheduleCode,
      groupScheduleDesc: item.groupScheduleDesc
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (item: GroupSchedule) => {
    const confirmed = await Swal.fire({
      icon: 'warning',
      title: 'Confirm Delete',
      text: `Are you sure you want to delete "${item.groupScheduleCode} - ${item.groupScheduleDesc}"?`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (confirmed.isConfirmed) {
      try {
        await apiClient.delete(`/Fs/Process/GroupScheduleSetUp/${item.groupScheduleID}`);
        await auditTrail.log({
          accessType: 'Delete',
          trans: `Deleted Group Schedule "${item.groupScheduleCode} - ${item.groupScheduleDesc}"`,
          messages: 'Group schedule deleted successfully',
          formName,
        });
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Group schedule deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
        await fetchGroupSchedules();
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to delete group schedule';
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg,
        });
        console.error('Error deleting group schedule:', error);
      }
    }
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.groupScheduleCode.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Code is required.',
      });
      return;
    }

    // Check for duplicate code
    const isDuplicate = schedules.some(item => 
      item.groupScheduleCode.toLowerCase() === formData.groupScheduleCode.trim().toLowerCase()
    );

    if (isDuplicate) {
      await Swal.fire({
        icon: 'error',
        title: 'Duplicate Code',
        text: 'This group schedule code is already in use. Please use a different code.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        groupScheduleID: 0,
        groupScheduleCode: formData.groupScheduleCode,
        groupScheduleDesc: formData.groupScheduleDesc
      };

      await apiClient.post('/Fs/Process/GroupScheduleSetUp', payload);
      await auditTrail.log({
        accessType: 'Add',
        trans: `Created Group Schedule "${payload.groupScheduleCode} - ${payload.groupScheduleDesc}"`,
        messages: 'Group schedule created successfully',
        formName,
      });
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Group schedule created successfully.',
        timer: 2000,
        showConfirmButton: false,
      });

      await fetchGroupSchedules();
      setShowCreateModal(false);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
      });
      console.error('Error creating group schedule:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingItem) return;

    // Validate required fields
    if (!formData.groupScheduleCode.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Code is required.',
      });
      return;
    }

    // Check for duplicate code (excluding current item)
    const isDuplicate = schedules.some(item => 
      item.groupScheduleID !== editingItem.groupScheduleID && 
      item.groupScheduleCode.toLowerCase() === formData.groupScheduleCode.trim().toLowerCase()
    );

    if (isDuplicate) {
      await Swal.fire({
        icon: 'error',
        title: 'Duplicate Code',
        text: 'This group schedule code is already in use. Please use a different code.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        groupScheduleID: editingItem.groupScheduleID,
        groupScheduleCode: formData.groupScheduleCode,
        groupScheduleDesc: formData.groupScheduleDesc
      };

      await apiClient.put(`/Fs/Process/GroupScheduleSetUp/${editingItem.groupScheduleID}`, payload);
      await auditTrail.log({
        accessType: 'Edit',
        trans: `Updated Group Schedule "${payload.groupScheduleCode} - ${payload.groupScheduleDesc}"`,
        messages: 'Group schedule updated successfully',
        formName,
      });
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Group schedule updated successfully.',
        timer: 2000,
        showConfirmButton: false,
      });

      await fetchGroupSchedules();
      setShowCreateModal(false);
      setEditingItem(null);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
      });
      console.error('Error updating group schedule:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (editingItem) {
      handleSubmitEdit(e);
    } else {
      handleSubmitCreate(e);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingItem(null);
  };

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showCreateModal) {
          setShowCreateModal(false);
          setEditingItem(null);
        }
      }
    };

    if (showCreateModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showCreateModal]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Group Schedule Setup</h1>
          </div>

          {/* Content Container */}
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
                  <p className="text-sm text-gray-700 mb-2">
                    Create and manage group schedule codes and descriptions for organizing employee schedules. Group schedules allow you to efficiently manage multiple employees with similar shift patterns.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Define group schedule codes</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Custom schedule descriptions</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Efficient schedule management</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Team-based organization</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Controls */}
            {(hasPermission('Add') && hasPermission('View')) && (
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              {hasPermission('Add') && (
                <button
                  onClick={handleCreateNew}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create New
                </button>
              )}
              {hasPermission('View') && (
              <div className="flex items-center gap-2">
                <label className="text-gray-700 text-sm">Search:</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                />
              </div>)}
            </div>)}

            {/* Table */}
            {hasPermission('View') ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Description</th>
                    {(hasPermission('Edit') || hasPermission('Delete')) && (
                      <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.groupScheduleID} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">{item.groupScheduleCode}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.groupScheduleDesc}</td>
                        {(hasPermission('Edit') || hasPermission('Delete')) && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {hasPermission('Edit') && (
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Edit"
                              >
                                  <Edit className="w-4 h-4" />
                              </button>
                            )}
                            {hasPermission("Edit") && hasPermission("Delete") && (
                                <span className="text-gray-300">|</span>
                            )}
                            {hasPermission('Delete') && (
                              <button
                                onClick={() => handleDelete(item)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Delete"
                              >
                                  <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>)}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-16 text-center">
                        <div className="text-gray-500">No data available in table</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>) : (
              <div className="text-center py-10 text-gray-500">
                  You do not have permission to view this list.
              </div>
            )}

            {/* Pagination */}
            {hasPermission('View') && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Showing {filteredData.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages || 1, prev + 1))}
                  disabled={currentPage >= totalPages || filteredData.length === 0}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>)}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
              <h2 className="text-gray-900">{editingItem ? 'Edit' : 'Create New'}</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <h3 className="text-blue-600 mb-4">Group Schedule Setup</h3>
              
              <div className="space-y-3">
                {/* Code */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Code :
                  </label>
                  <input
                    type="text"
                    value={formData.groupScheduleCode}
                    onChange={(e) => setFormData({ ...formData, groupScheduleCode: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                {/* Description */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Description :
                  </label>
                  <input
                    type="text"
                    value={formData.groupScheduleDesc}
                    onChange={(e) => setFormData({ ...formData, groupScheduleDesc: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm"
                >
                  {submitting ? (editingItem ? 'Updating...' : 'Submitting...') : (editingItem ? 'Update' : 'Submit')}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm"
                >
                  Back to List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}