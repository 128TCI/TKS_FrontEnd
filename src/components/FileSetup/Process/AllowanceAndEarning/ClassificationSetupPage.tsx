import { useState, useEffect } from 'react';
import { Search, Plus, X, Check, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';
import apiClient from '../../../../services/apiClient';
import Swal from 'sweetalert2';
import { decryptData } from '../../../../services/encryptionService';

interface Classification {
  id: string;
  code: string;
  description: string;
}

export function ClassificationSetupPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({ code: '', description: '' });
  const [editingItem, setEditingItem] = useState<Classification | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [codeError, setCodeError] = useState('');

  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const itemsPerPage = 100;

  // Permissions
    const [permissions, setPermissions] = useState<Record<string, boolean>>({});
    const hasPermission = (accessType: string) => permissions[accessType] === true;
  
    useEffect(() => {
      getClassificationSetupPermissions();
    }, []);
  
    const getClassificationSetupPermissions = () => {
      const rawPayload = localStorage.getItem("loginPayload");
      if (!rawPayload) return;
  
      try {
        const parsedPayload = JSON.parse(rawPayload);
        const encryptedArray: any[] = parsedPayload.permissions || [];
  
        const branchEntries = encryptedArray.filter(
          (p) => decryptData(p.formName) === "ClassificationSetUp"
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

  // Fetch classification data from API
  useEffect(() => {
    fetchClassificationData();
  }, []);

  const fetchClassificationData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/Fs/Process/AllowanceAndEarnings/ClassificationSetUp');
      if (response.status === 200 && response.data) {
        // Map API response to expected format
        const mappedData = response.data.map((classification: any) => ({
          id: classification.classId || '',
          code: classification.classCode || '',
          description: classification.classDesc || '',
        }));
        setClassifications(mappedData);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load classifications';
      setError(errorMsg);
      console.error('Error fetching classifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredData = classifications.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleCreateNew = () => {
    setFormData({ code: '', description: '' });
    setCodeError('');
    setShowCreateModal(true);
  };

  const handleEdit = (item: Classification) => {
    setEditingItem(item);
    setFormData({ code: item.code, description: item.description });
    setCodeError('');
    setShowEditModal(true);
  };

  const handleDelete = async (item: Classification) => {
    const confirmed = await Swal.fire({
      icon: 'warning',
      title: 'Confirm Delete',
      text: `Are you sure you want to delete classification ${item.code}?`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (confirmed.isConfirmed) {
      try {
        await apiClient.delete(`/Fs/Process/AllowanceAndEarnings/ClassificationSetUp/${item.id}`);
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Classification deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
        // Refresh the classification list
        await fetchClassificationData();
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to delete classification';
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg,
        });
        console.error('Error deleting classification:', error);
      }
    }
  };

  const handleCodeChange = (value: string) => {
    setFormData({ ...formData, code: value });
    if (value.length > 10) {
      setCodeError('Code maximum 10 characters');
    } else {
      setCodeError('');
    }
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate code - must not be empty and must be max 10 characters
    if (!formData.code.trim() || formData.code.length > 10) {
      await Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Code must be between 1 and 10 characters.',
      });
      return;
    }

    // Check for duplicate code
    const isDuplicate = classifications.some(
      (classification) => classification.code.toLowerCase() === formData.code.trim().toLowerCase()
    );

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
        classId: 0,
        classCode: formData.code,
        classDesc: formData.description,
      };

      await apiClient.post('/Fs/Process/AllowanceAndEarnings/ClassificationSetUp', payload);
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Classification created successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      // Refresh the classification list
      await fetchClassificationData();
      
      // Close modal and reset form
      setShowCreateModal(false);
      setFormData({ code: '', description: '' });
      setCodeError('');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
      });
      console.error('Error creating classification:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingItem) return;

    // Validate code - must not be empty and must be max 10 characters
    if (!formData.code.trim() || formData.code.length > 10) {
      await Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Code must be between 1 and 10 characters.',
      });
      return;
    }

    // Check for duplicate code (excluding current item)
    const isDuplicate = classifications.some(
      (classification) =>
        classification.id !== editingItem.id &&
        classification.code.toLowerCase() === formData.code.trim().toLowerCase()
    );

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
        classId: parseInt(editingItem.id),
        classCode: formData.code,
        classDesc: formData.description,
      };

      await apiClient.put(`/Fs/Process/AllowanceAndEarnings/ClassificationSetUp/${editingItem.id}`, payload);
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Classification updated successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      // Refresh the classification list
      await fetchClassificationData();
      
      // Close modal and reset form
      setShowEditModal(false);
      setEditingItem(null);
      setFormData({ code: '', description: '' });
      setCodeError('');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
      });
      console.error('Error updating classification:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingItem(null);
    setFormData({ code: '', description: '' });
    setCodeError('');
  };

  // Handle ESC key press with hierarchy
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showCreateModal) {
          setShowCreateModal(false);
        } else if (showEditModal) {
          setShowEditModal(false);
          setEditingItem(null);
        }
      }
    };

    if (showCreateModal || showEditModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showCreateModal, showEditModal]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Classification Setup</h1>
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
                    Define and manage employee classification categories for organizing and categorizing employees based on job types, employment status, or other organizational criteria.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Custom classification codes</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Flexible categorization structure</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Employee grouping support</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Payroll integration ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Controls */}
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              {(hasPermission('Add') && hasPermission('View')) && (
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
              </div>
              )}
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-600 text-sm">Loading classifications...</div>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              ) : hasPermission('View') ? (
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Description</th>
                      <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900">{item.code}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.description}</td>
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
                          </td>
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
                </table> ) : (
                  <div className="text-center py-10 text-gray-500">
                    You do not have permission to view this list.
                  </div>
              )}
            </div>

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

      {/* Create New Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
              <h2 className="text-gray-900">Create New Classification</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitCreate} className="p-6">
              <h3 className="text-blue-600 mb-6">Classification Setup</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                    Code :
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      maxLength={10}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                        codeError 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      required
                    />
                    {codeError && (
                      <p className="text-red-500 text-xs mt-1">{codeError}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                    Description :
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm"
                >
                  {submitting ? 'Saving...' : 'Submit'}
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

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
              <h2 className="text-gray-900">Edit Classification</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit} className="p-6">
              <h3 className="text-blue-600 mb-6">Classification Setup</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                    Code :
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      maxLength={10}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                        codeError 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      required
                    />
                    {codeError && (
                      <p className="text-red-500 text-xs mt-1">{codeError}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                    Description :
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm"
                >
                  {submitting ? 'Updating...' : 'Update'}
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