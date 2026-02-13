import { useState, useEffect } from 'react';
import { Search, Plus, X, Check, Edit, Trash2 } from 'lucide-react';

import { Footer } from '../../../Footer/Footer';
import Swal from 'sweetalert2';
import apiClient from '../../../../services/apiClient';
import { decryptData } from '../../../../services/encryptionService';

interface DTRFlag {
  id: number;
  flagCode: string;
  timeIn: string;
  timeOut: string;
  break1Out: string;
  break1In: string;
  break2Out: string;
  break2In: string;
  break3Out: string;
  break3In: string;
}

export function DTRFlagSetupPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState<DTRFlag | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    flagCode: '',
    timeIn: '',
    timeOut: '',
    break1Out: '',
    break1In: '',
    break2Out: '',
    break2In: '',
    break3Out: '',
    break3In: ''
  });

  // DTR Flags List states
  const [flags, setFlags] = useState<DTRFlag[]>([]);
  const [loadingFlags, setLoadingFlags] = useState(false);
  const [flagsError, setFlagsError] = useState('');

  const itemsPerPage = 10;

  // Permissions
    const [permissions, setPermissions] = useState<Record<string, boolean>>({});
    const hasPermission = (accessType: string) => permissions[accessType] === true;
  
    useEffect(() => {
      getDTRFlagSetupPermissions();
    }, []);
  
    const getDTRFlagSetupPermissions = () => {
      const rawPayload = localStorage.getItem("loginPayload");
      if (!rawPayload) return;
  
      try {
        const parsedPayload = JSON.parse(rawPayload);
        const encryptedArray: any[] = parsedPayload.permissions || [];
  
        const branchEntries = encryptedArray.filter(
          (p) => decryptData(p.formName) === "DTRFlagSetup"
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

  // Fetch DTR flags from API
  useEffect(() => {
    fetchDTRFlags();
  }, []);

  const fetchDTRFlags = async () => {
    setLoadingFlags(true);
    setFlagsError('');
    try {
      const response = await apiClient.get('/Fs/Process/Device/DTRFlagSetUp');
      if (response.status === 200 && response.data) {
        setFlags(response.data);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load DTR flags';
      setFlagsError(errorMsg);
      console.error('Error fetching DTR flags:', error);
    } finally {
      setLoadingFlags(false);
    }
  };
  
  const filteredData = flags.filter(item =>
    item.flagCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.timeIn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.timeOut?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.break1Out?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.break1In?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.break2Out?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.break2In?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.break3Out?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.break3In?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  //Reset to page 1 when search term changes
  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [searchTerm]);

  const handleCreateNew = () => {
    setFormData({
      flagCode: '',
      timeIn: '',
      timeOut: '',
      break1Out: '',
      break1In: '',
      break2Out: '',
      break2In: '',
      break3Out: '',
      break3In: ''
    });
    setShowCreateModal(true);
  };

  const handleEdit = (item: DTRFlag) => {
    setEditingItem(item);
    setFormData({
      flagCode: item.flagCode,
      timeIn: item.timeIn,
      timeOut: item.timeOut,
      break1Out: item.break1Out,
      break1In: item.break1In,
      break2Out: item.break2Out,
      break2In: item.break2In,
      break3Out: item.break3Out,
      break3In: item.break3In
    });
    setShowEditModal(true);
  };

  const handleDelete = async (item: DTRFlag) => {
    const confirmed = await Swal.fire({
      icon: 'warning',
      title: 'Confirm Delete',
      text: `Are you sure you want to delete DTR flag "${item.flagCode}"?`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (confirmed.isConfirmed) {
      try {
        await apiClient.delete(`/Fs/Process/Device/DTRFlagSetUp/${item.id}`);
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'DTR flag deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
        // Refresh the list
        await fetchDTRFlags();
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to delete DTR flag';
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg,
        });
        console.error('Error deleting DTR flag:', error);
      }
    }
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate flag code
    if (!formData.flagCode.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Flag Code is required.',
      });
      return;
    }

    // Check for duplicate flag code
    const isDuplicate = flags.some(flag => 
      flag.flagCode.toLowerCase() === formData.flagCode.trim().toLowerCase()
    );

    if (isDuplicate) {
      await Swal.fire({
        icon: 'error',
        title: 'Duplicate Flag Code',
        text: 'This flag code is already in use. Please use a different code.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: 0,
        flagCode: formData.flagCode,
        timeIn: formData.timeIn,
        timeOut: formData.timeOut,
        break1Out: formData.break1Out,
        break1In: formData.break1In,
        break2Out: formData.break2Out,
        break2In: formData.break2In,
        break3Out: formData.break3Out,
        break3In: formData.break3In
      };

      await apiClient.post('/Fs/Process/Device/DTRFlagSetUp', payload);
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'DTR flag created successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      // Refresh the list
      await fetchDTRFlags();
      setShowCreateModal(false);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
      });
      console.error('Error creating DTR flag:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingItem) return;

    // Validate flag code
    if (!formData.flagCode.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Flag Code is required.',
      });
      return;
    }

    // Check for duplicate flag code (excluding current item)
    const isDuplicate = flags.some(flag => 
      flag.id !== editingItem.id && 
      flag.flagCode.toLowerCase() === formData.flagCode.trim().toLowerCase()
    );

    if (isDuplicate) {
      await Swal.fire({
        icon: 'error',
        title: 'Duplicate Flag Code',
        text: 'This flag code is already in use. Please use a different code.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: editingItem.id,
        flagCode: formData.flagCode,
        timeIn: formData.timeIn,
        timeOut: formData.timeOut,
        break1Out: formData.break1Out,
        break1In: formData.break1In,
        break2Out: formData.break2Out,
        break2In: formData.break2In,
        break3Out: formData.break3Out,
        break3In: formData.break3In
      };

      await apiClient.put(`/Fs/Process/Device/DTRFlagSetUp/${editingItem.id}`, payload);
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'DTR flag updated successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      // Refresh the list
      await fetchDTRFlags();
      setShowEditModal(false);
      setEditingItem(null);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
      });
      console.error('Error updating DTR flag:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingItem(null);
  };

  // Handle ESC key press
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
            <h1 className="text-white">DTR Flag Setup</h1>
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
                    Configure DTR (Daily Time Record) flag codes that identify different types of attendance transactions. Map flag values from biometric devices to corresponding time log actions like clock-in, clock-out, and break periods.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Transaction identification</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Break time tracking</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Multi-flag support</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Device compatibility</span>
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
                    onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                  />
                </div>
              )}
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
              {loadingFlags ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-600 text-sm">Loading DTR flags...</div>
                </div>
              ) : flagsError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 text-sm">{flagsError}</p>
                </div>
              ) : hasPermission('View') ? (
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase whitespace-nowrap">Flag Code</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase whitespace-nowrap">Time In</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase whitespace-nowrap">Time Out</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase whitespace-nowrap">Break1 Out</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase whitespace-nowrap">Break1 In</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase whitespace-nowrap">Break2 Out</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase whitespace-nowrap">Break2 In</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase whitespace-nowrap">Break3 Out</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase whitespace-nowrap">Break3 In</th>
                      {(hasPermission('Edit') || hasPermission('Delete')) && (
                        <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase whitespace-nowrap">Actions</th>
                      )}
                      
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{item.flagCode}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{item.timeIn}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{item.timeOut}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{item.break1Out}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{item.break1In}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{item.break2Out}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{item.break2In}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{item.break3Out}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{item.break3In}</td>
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
                        <td colSpan={10} className="px-6 py-16 text-center">
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0">
              <h2 className="text-gray-900">Create New</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitCreate} className="p-6">
              <h3 className="text-blue-600 mb-4">DTR Flag Setup</h3>
              
              <div className="space-y-3">
                {/* Flag Code */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                    Flag Code :
                  </label>
                  <input
                    type="text"
                    value={formData.flagCode}
                    maxLength={10}
                    onChange={(e) => setFormData({ ...formData, flagCode: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                {/* Time In */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                    Time In :
                  </label>
                  <input
                    type="text"
                    value={formData.timeIn}
                    onChange={(e) => setFormData({ ...formData, timeIn: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Time Out */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                    Time Out :
                  </label>
                  <input
                    type="text"
                    value={formData.timeOut}
                    onChange={(e) => setFormData({ ...formData, timeOut: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Break1 Out */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                    Break1 Out :
                  </label>
                  <input
                    type="text"
                    value={formData.break1Out}
                    onChange={(e) => setFormData({ ...formData, break1Out: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Break1 In */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                    Break1 In :
                  </label>
                  <input
                    type="text"
                    value={formData.break1In}
                    onChange={(e) => setFormData({ ...formData, break1In: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Break2 Out */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                    Break2 Out :
                  </label>
                  <input
                    type="text"
                    value={formData.break2Out}
                    onChange={(e) => setFormData({ ...formData, break2Out: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Break2 In */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                    Break2 In :
                  </label>
                  <input
                    type="text"
                    value={formData.break2In}
                    onChange={(e) => setFormData({ ...formData, break2In: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Break3 Out */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                    Break3 Out :
                  </label>
                  <input
                    type="text"
                    value={formData.break3Out}
                    onChange={(e) => setFormData({ ...formData, break3Out: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Break3 In */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                    Break3 In :
                  </label>
                  <input
                    type="text"
                    value={formData.break3In}
                    onChange={(e) => setFormData({ ...formData, break3In: e.target.value })}
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
                  {submitting ? 'Submitting...' : 'Submit'}
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0">
              <h2 className="text-gray-900">Edit DTR Flag</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit} className="p-6">
              <h3 className="text-blue-600 mb-4">DTR Flag Setup</h3>
              
              <div className="space-y-3">
                {/* Flag Code */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                    Flag Code :
                  </label>
                  <input
                    type="text"
                    value={formData.flagCode}
                    maxLength={10}
                    onChange={(e) => setFormData({ ...formData, flagCode: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                {/* Time In */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                    Time In :
                  </label>
                  <input
                    type="text"
                    value={formData.timeIn}
                    onChange={(e) => setFormData({ ...formData, timeIn: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Time Out */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                    Time Out :
                  </label>
                  <input
                    type="text"
                    value={formData.timeOut}
                    onChange={(e) => setFormData({ ...formData, timeOut: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Break1 Out */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                    Break1 Out :
                  </label>
                  <input
                    type="text"
                    value={formData.break1Out}
                    onChange={(e) => setFormData({ ...formData, break1Out: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Break1 In */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                    Break1 In :
                  </label>
                  <input
                    type="text"
                    value={formData.break1In}
                    onChange={(e) => setFormData({ ...formData, break1In: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Break2 Out */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                    Break2 Out :
                  </label>
                  <input
                    type="text"
                    value={formData.break2Out}
                    onChange={(e) => setFormData({ ...formData, break2Out: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Break2 In */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                    Break2 In :
                  </label>
                  <input
                    type="text"
                    value={formData.break2In}
                    onChange={(e) => setFormData({ ...formData, break2In: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Break3 Out */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                    Break3 Out :
                  </label>
                  <input
                    type="text"
                    value={formData.break3Out}
                    onChange={(e) => setFormData({ ...formData, break3Out: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Break3 In */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-28">
                    Break3 In :
                  </label>
                  <input
                    type="text"
                    value={formData.break3In}
                    onChange={(e) => setFormData({ ...formData, break3In: e.target.value })}
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