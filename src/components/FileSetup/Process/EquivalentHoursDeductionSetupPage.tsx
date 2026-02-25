import { useState, useEffect } from 'react';
import { Search, Plus, X, Check, ArrowLeft, UserX, LogIn, LogOut, PlayCircle, PauseCircle, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../Footer/Footer';
import { decryptData } from '../../../services/encryptionService';
import Swal from 'sweetalert2';
import apiClient from '../../../services/apiClient';
import auditTrail from '../../../services/auditTrail';

const formName = 'Equivalent Hours Deduction SetUp';
interface DeductionItem {
  id: number;
  code: string;
  desc: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

type DeductionType = 'absent' | 'no-login' | 'no-logout' | 'no-break2-out' | 'no-break2-in';

const API_ENDPOINTS = {
  'absent': '/Fs/Process/Device/EquivHoursDeductionSetUp/ForAbsent',
  'no-login': '/Fs/Process/Device/EquivHoursDeductionSetUp/ForNoLogin',
  'no-logout': '/Fs/Process/Device/EquivHoursDeductionSetUp/ForNoLogout',
  'no-break2-out': '/Fs/Process/Device/EquivHoursDeductionSetUp/ForNoBreak2Out',
  'no-break2-in': '/Fs/Process/Device/EquivHoursDeductionSetUp/ForNoBreak2In'
};

export function EquivalentHoursDeductionSetupPage() {
  const [activeTab, setActiveTab] = useState<DeductionType>('absent');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState<DeductionItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    id: 0,
    code: '',
    desc: '',
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: ''
  });

  // Separate data for each tab
  const [absentData, setAbsentData] = useState<DeductionItem[]>([]);
  const [noLoginData, setNoLoginData] = useState<DeductionItem[]>([]);
  const [noLogoutData, setNoLogoutData] = useState<DeductionItem[]>([]);
  const [noBreak2OutData, setNoBreak2OutData] = useState<DeductionItem[]>([]);
  const [noBreak2InData, setNoBreak2InData] = useState<DeductionItem[]>([]);

  // Loading states for each tab
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');

  const itemsPerPage = 10;

  // Fetch data when component mounts or tab changes
  useEffect(() => {
    fetchDeductionData();
  }, [activeTab]);

  const fetchDeductionData = async () => {
    setLoadingData(true);
    setDataError('');
    try {
      const endpoint = API_ENDPOINTS[activeTab];
      const response = await apiClient.get(endpoint);
      if (response.status === 200 && response.data) {
        setCurrentData(response.data);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load deduction data';
      setDataError(errorMsg);
      console.error('Error fetching deduction data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Get current data based on active tab
  const getCurrentData = (): DeductionItem[] => {
    switch (activeTab) {
      case 'absent': return absentData;
      case 'no-login': return noLoginData;
      case 'no-logout': return noLogoutData;
      case 'no-break2-out': return noBreak2OutData;
      case 'no-break2-in': return noBreak2InData;
      default: return [];
    }
  };

  const setCurrentData = (data: DeductionItem[]) => {
    switch (activeTab) {
      case 'absent': setAbsentData(data); break;
      case 'no-login': setNoLoginData(data); break;
      case 'no-logout': setNoLogoutData(data); break;
      case 'no-break2-out': setNoBreak2OutData(data); break;
      case 'no-break2-in': setNoBreak2InData(data); break;
    }
  };

  const currentData = getCurrentData();
  
  const filteredData = currentData.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchTerm.toLowerCase())
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
      id: 0,
      code: '',
      desc: '',
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    });
    setEditingItem(null);
    setShowCreateModal(true);
  };

  const handleEdit = (item: DeductionItem) => {
    setEditingItem(item);
    setFormData({
      id: item.id,
      code: item.code,
      desc: item.desc,
      monday: item.monday.toString(),
      tuesday: item.tuesday.toString(),
      wednesday: item.wednesday.toString(),
      thursday: item.thursday.toString(),
      friday: item.friday.toString(),
      saturday: item.saturday.toString(),
      sunday: item.sunday.toString()
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (item: DeductionItem) => {
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
        const endpoint = API_ENDPOINTS[activeTab];
        await apiClient.delete(`${endpoint}/${item.id}`);
        await auditTrail.log({
          accessType: 'Delete',
          trans: `Deleted Deduction Item "${item.code} - ${item.desc}"`,
          messages: `Deduction item deleted successfully`,
          formName,
        });
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Deduction item deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
        await fetchDeductionData();
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to delete deduction item';
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg,
        });
        console.error('Error deleting deduction item:', error);
      }
    }
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.code.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Code is required.',
      });
      return;
    }

    // Check for duplicate code
    const isDuplicate = currentData.some(item => 
      item.code.toLowerCase() === formData.code.trim().toLowerCase()
    );

    if (isDuplicate) {
      await Swal.fire({
        icon: 'error',
        title: 'Duplicate Code',
        text: 'This deduction code is already in use. Please use a different code.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: 0,
        code: formData.code,
        desc: formData.desc,
        monday: parseFloat(formData.monday) || 0,
        tuesday: parseFloat(formData.tuesday) || 0,
        wednesday: parseFloat(formData.wednesday) || 0,
        thursday: parseFloat(formData.thursday) || 0,
        friday: parseFloat(formData.friday) || 0,
        saturday: parseFloat(formData.saturday) || 0,
        sunday: parseFloat(formData.sunday) || 0
      };

      const endpoint = API_ENDPOINTS[activeTab];
      await apiClient.post(endpoint, payload);
      await auditTrail.log({
        accessType: 'Add',
        trans: `Created Deduction Item "${payload.code} - ${payload.desc}"`,
        messages: `Deduction item created successfully`,
        formName,
      });
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Deduction item created successfully.',
        timer: 2000,
        showConfirmButton: false,
      });

      await fetchDeductionData();
      setShowCreateModal(false);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
      });
      console.error('Error creating deduction item:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingItem) return;

    // Validate required fields
    if (!formData.code.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Code is required.',
      });
      return;
    }

    // Check for duplicate code (excluding current item)
    const isDuplicate = currentData.some(item => 
      item.id !== editingItem.id && 
      item.code.toLowerCase() === formData.code.trim().toLowerCase()
    );

    if (isDuplicate) {
      await Swal.fire({
        icon: 'error',
        title: 'Duplicate Code',
        text: 'This deduction code is already in use. Please use a different code.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: editingItem.id,
        code: formData.code,
        desc: formData.desc,
        monday: parseFloat(formData.monday) || 0,
        tuesday: parseFloat(formData.tuesday) || 0,
        wednesday: parseFloat(formData.wednesday) || 0,
        thursday: parseFloat(formData.thursday) || 0,
        friday: parseFloat(formData.friday) || 0,
        saturday: parseFloat(formData.saturday) || 0,
        sunday: parseFloat(formData.sunday) || 0
      };

      const endpoint = API_ENDPOINTS[activeTab];
      await apiClient.put(`${endpoint}/${payload.id}`, payload);
      await auditTrail.log({
        accessType: 'Edit',
        trans: `Updated Deduction Item "${payload.code} - ${payload.desc}"`,
        messages: `Deduction item updated successfully`,
        formName,
      });
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Deduction item updated successfully.',
        timer: 2000,
        showConfirmButton: false,
      });

      await fetchDeductionData();
      setShowCreateModal(false);
      setEditingItem(null);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
      });
      console.error('Error updating deduction item:', error);
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

  const tabs = [
    { id: 'absent' as DeductionType, label: 'For Absent', icon: UserX },
    { id: 'no-login' as DeductionType, label: 'For No Login', icon: LogIn },
    { id: 'no-logout' as DeductionType, label: 'For No Logout', icon: LogOut },
    { id: 'no-break2-out' as DeductionType, label: 'For No Break2 Out', icon: PlayCircle },
    { id: 'no-break2-in' as DeductionType, label: 'For No Break2 In', icon: PauseCircle }
  ];

  // Permissions
    const [permissions, setPermissions] = useState<Record<string, boolean>>({});
    const hasPermission = (accessType: string) => permissions[accessType] === true;
  
    useEffect(() => {
      getEquivalentHoursDeductionSetUpPermissions();
    }, []);
  
    const getEquivalentHoursDeductionSetUpPermissions = () => {
      const rawPayload = localStorage.getItem("loginPayload");
      if (!rawPayload) return;
  
      try {
        const parsedPayload = JSON.parse(rawPayload);
        const encryptedArray: any[] = parsedPayload.permissions || [];
  
        const branchEntries = encryptedArray.filter(
          (p) => decryptData(p.formName) === "EquivHoursDeduction"
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
    
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Equivalent Hours Deduction Setup</h1>
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
                    Configure equivalent hours deduction for various attendance scenarios including absences, missing login/logout, and break violations. Set specific deduction hours for each day of the week to ensure accurate timekeeping calculations.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Day-specific deduction configurations</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Multiple deduction scenarios</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Flexible hours calculation</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Accurate attendance tracking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            {hasPermission('View') && (
            <div className="flex gap-1 mb-6 border-b border-gray-200">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                    setSearchTerm('');
                  }}
                  className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                    activeTab === tab.id
                      ? 'font-medium bg-blue-600 text-white -mb-px'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } transition-colors`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                  )}
                </button>
              ))}
            </div>)}

            {/* Top Controls */}
            {(hasPermission('View') && hasPermission('Edit')) && (
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

              <div className="flex items-center gap-2">
                <label className="text-gray-700 text-sm">Search:</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                />
              </div>
            </div>)}

            {/* Table */}
            {hasPermission('View') ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Monday</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Tuesday</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Wednesday</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Thursday</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Friday</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Saturday</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Sunday</th>
                    {(hasPermission('Edit') || hasPermission('Delete')) && (
                    <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase">Actions</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">{item.code}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.monday}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.tuesday}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.wednesday}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.thursday}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.friday}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.saturday}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.sunday}</td>
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
                                onClick={() => handleDelete(item.id)}
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
              <h3 className="text-blue-600 mb-4">Equivalent Hours Deduction</h3>
              
              <div className="space-y-3">
                {/* Code */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Code :
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    maxLength={10}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
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
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Monday */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Monday :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.monday}
                    onChange={(e) => setFormData({ ...formData, monday: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Tuesday */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Tuesday :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.tuesday}
                    onChange={(e) => setFormData({ ...formData, tuesday: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Wednesday */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Wednesday :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.wednesday}
                    onChange={(e) => setFormData({ ...formData, wednesday: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Thursday */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Thursday :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.thursday}
                    onChange={(e) => setFormData({ ...formData, thursday: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Friday */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Friday :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.friday}
                    onChange={(e) => setFormData({ ...formData, friday: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Saturday */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Saturday :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.saturday}
                    onChange={(e) => setFormData({ ...formData, saturday: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Sunday */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Sunday :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sunday}
                    onChange={(e) => setFormData({ ...formData, sunday: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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