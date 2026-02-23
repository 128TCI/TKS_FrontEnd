import { useState, useEffect } from 'react';
import { Search, Plus, X, Check, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';
import Swal from 'sweetalert2';
import apiClient from '../../../../services/apiClient';
import auditTrail from '../../../../services/auditTrail';
import { decryptData } from '../../../../services/encryptionService';

const formName = 'DTR Log Fields SetUp';
interface DTRLogField {
  id: number;
  code: string;
  description: string;
  deviceType: string;
  deviceFormat: string;
  flagCode: string;
  dateFormat: string;
  dateSeparator: string;
  empCodePos: number;
  empCodeNoOfChar: number;
  datePos: number;
  dateNoOfChar: number;
  timePos: number;
  timeNoOfChar: number;
  flagPos: number;
  flagNoOfChar: number;
  terminalPos: number;
  terminalNoOfChar: number;
  monthPos: number;
  monthNoOfChar: number;
  dayPos: number;
  dayNoOfChar: number;
  yearPos: number;
  yearNoOfChar: number;
  hourPos: number;
  hourNoOfChar: number;
  minutesPos: number;
  minutesNoOfChar: number;
  timePeriodPos: number;
  timePeriodNoOfChar: number;
  combineDateTime: boolean;
  identifierPos: number;
  identifierNoOfChar: number;
}

export function DTRLogFieldsSetupPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState<DTRLogField | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    deviceType: 'Excel File',
    deviceFormat: 'Excel Format',
    flagCode: '',
    dateFormat: 'MM DD YYYY',
    dateSeparator: '/',
    empCodePos: 0,
    empCodeNoOfChar: 0,
    datePos: 0,
    dateNoOfChar: 0,
    timePos: 0,
    timeNoOfChar: 0,
    flagPos: 0,
    flagNoOfChar: 0,
    terminalPos: 0,
    terminalNoOfChar: 0,
    monthPos: 0,
    monthNoOfChar: 0,
    dayPos: 0,
    dayNoOfChar: 0,
    yearPos: 0,
    yearNoOfChar: 0,
    hourPos: 0,
    hourNoOfChar: 0,
    minutesPos: 0,
    minutesNoOfChar: 0,
    timePeriodPos: 0,
    timePeriodNoOfChar: 0,
    combineDateTime: true,
    identifierPos: 0,
    identifierNoOfChar: 0
  });

  // DTR Log Fields List states
  const [logFields, setLogFields] = useState<DTRLogField[]>([]);
  const [loadingLogFields, setLoadingLogFields] = useState(false);
  const [logFieldsError, setLogFieldsError] = useState('');

  const itemsPerPage = 10;

  // Permissions
    const [permissions, setPermissions] = useState<Record<string, boolean>>({});
    const hasPermission = (accessType: string) => permissions[accessType] === true;
  
    useEffect(() => {
      getDTRLogsFieldsSetupPermissions();
    }, []);
  
    const getDTRLogsFieldsSetupPermissions = () => {
      const rawPayload = localStorage.getItem("loginPayload");
      if (!rawPayload) return;
  
      try {
        const parsedPayload = JSON.parse(rawPayload);
        const encryptedArray: any[] = parsedPayload.permissions || [];
  
        const branchEntries = encryptedArray.filter(
          (p) => decryptData(p.formName) === "DTRLogFieldsSetup"
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

  // Fetch DTR log fields from API
  useEffect(() => {
    fetchDTRLogFields();
  }, []);

  const fetchDTRLogFields = async () => {
    setLoadingLogFields(true);
    setLogFieldsError('');
    try {
      const response = await apiClient.get('/Fs/Process/Device/DTRLogFIeldsSetUp');
      if (response.status === 200 && response.data) {
        setLogFields(response.data);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load DTR log fields';
      setLogFieldsError(errorMsg);
      console.error('Error fetching DTR log fields:', error);
    } finally {
      setLoadingLogFields(false);
    }
  };
  
  const filteredData = logFields.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.deviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.deviceFormat.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.flagCode.toLowerCase().includes(searchTerm.toLowerCase())
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
      code: '',
      description: '',
      deviceType: 'Excel File',
      deviceFormat: 'Excel Format',
      flagCode: '',
      dateFormat: 'MM DD YYYY',
      dateSeparator: '/',
      empCodePos: 0,
      empCodeNoOfChar: 0,
      datePos: 0,
      dateNoOfChar: 0,
      timePos: 0,
      timeNoOfChar: 0,
      flagPos: 0,
      flagNoOfChar: 0,
      terminalPos: 0,
      terminalNoOfChar: 0,
      monthPos: 0,
      monthNoOfChar: 0,
      dayPos: 0,
      dayNoOfChar: 0,
      yearPos: 0,
      yearNoOfChar: 0,
      hourPos: 0,
      hourNoOfChar: 0,
      minutesPos: 0,
      minutesNoOfChar: 0,
      timePeriodPos: 0,
      timePeriodNoOfChar: 0,
      combineDateTime: true,
      identifierPos: 0,
      identifierNoOfChar: 0
    });
    setShowCreateModal(true);
  };

  const handleEdit = (item: DTRLogField) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      description: item.description,
      deviceType: item.deviceType,
      deviceFormat: item.deviceFormat,
      flagCode: item.flagCode,
      dateFormat: item.dateFormat,
      dateSeparator: item.dateSeparator,
      empCodePos: item.empCodePos,
      empCodeNoOfChar: item.empCodeNoOfChar,
      datePos: item.datePos,
      dateNoOfChar: item.dateNoOfChar,
      timePos: item.timePos,
      timeNoOfChar: item.timeNoOfChar,
      flagPos: item.flagPos,
      flagNoOfChar: item.flagNoOfChar,
      terminalPos: item.terminalPos,
      terminalNoOfChar: item.terminalNoOfChar,
      monthPos: item.monthPos,
      monthNoOfChar: item.monthNoOfChar,
      dayPos: item.dayPos,
      dayNoOfChar: item.dayNoOfChar,
      yearPos: item.yearPos,
      yearNoOfChar: item.yearNoOfChar,
      hourPos: item.hourPos,
      hourNoOfChar: item.hourNoOfChar,
      minutesPos: item.minutesPos,
      minutesNoOfChar: item.minutesNoOfChar,
      timePeriodPos: item.timePeriodPos,
      timePeriodNoOfChar: item.timePeriodNoOfChar,
      combineDateTime: item.combineDateTime,
      identifierPos: item.identifierPos,
      identifierNoOfChar: item.identifierNoOfChar
    });
    setShowEditModal(true);
  };

  const handleDelete = async (item: DTRLogField) => {
    const confirmed = await Swal.fire({
      icon: 'warning',
      title: 'Confirm Delete',
      text: `Are you sure you want to delete DTR log field "${item.code}"?`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (confirmed.isConfirmed) {
      try {
        await apiClient.delete(`/Fs/Process/Device/DTRLogFIeldsSetUp/${item.id}`);
        await auditTrail.log({
          accessType: 'Delete',
          trans: `DTR log field "${item.code}" (ID: ${item.id}) has been removed from the system`,
          messages: `Deleted DTR log field "${item.code}"`,
          formName
        });
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'DTR log field deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
        // Refresh the list
        await fetchDTRLogFields();
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to delete DTR log field';
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg,
        });
        console.error('Error deleting DTR log field:', error);
      }
    }
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate code
    if (!formData.code.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Code is required.',
      });
      return;
    }

    // Check for duplicate code
    const isDuplicate = logFields.some(field => 
      field.code.toLowerCase() === formData.code.trim().toLowerCase()
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
        id: 0,
        ...formData
      };

      await apiClient.post('/Fs/Process/Device/DTRLogFIeldsSetUp', payload);
      await auditTrail.log({
        accessType: 'Add',
        trans: `DTR log field "${formData.code}" created with details: ${JSON.stringify(formData)}`,
        messages: `Created DTR log field "${formData.code}"`,
        formName
      });
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'DTR log field created successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      // Refresh the list
      await fetchDTRLogFields();
      setShowCreateModal(false);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
      });
      console.error('Error creating DTR log field:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingItem) return;

    // Validate code
    if (!formData.code.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Code is required.',
      });
      return;
    }

    // Check for duplicate code (excluding current item)
    const isDuplicate = logFields.some(field => 
      field.id !== editingItem.id && 
      field.code.toLowerCase() === formData.code.trim().toLowerCase()
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
        id: editingItem.id,
        ...formData
      };

      await apiClient.put(`/Fs/Process/Device/DTRLogFIeldsSetUp/${editingItem.id}`, payload);
      await auditTrail.log({
        accessType: 'Edit',
        trans: `DTR log field "${formData.code}" (ID: ${editingItem.id}) updated with new values: ${JSON.stringify(formData)}`,
        messages: `Updated DTR log field "${formData.code}"`,
        formName
      });
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'DTR log field updated successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      // Refresh the list
      await fetchDTRLogFields();
      setShowEditModal(false);
      setEditingItem(null);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
      });
      console.error('Error updating DTR log field:', error);
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

  const deviceTypes = ['Excel File', 'Text File', 'DAT File', 'CSV File'];
  const deviceFormats = ['Excel Format', 'Comma Separated', 'Tab Delimited', 'Pipe Delimited'];
  const dateFormats = ['MM DD YYYY', 'DD MM YYYY', 'YYYY MM DD', 'MM/DD/YYYY', 'DD/MM/YYYY'];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">DTR Log Fields Setup</h1>
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
                    Configure field mappings for importing DTR logs from various file formats. Define data positions, formats, and separators to ensure accurate parsing of employee attendance records from external sources.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Flexible import formats</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Custom field mapping</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Date format configuration</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Multi-device support</span>
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
              {loadingLogFields ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-600 text-sm">Loading DTR log fields...</div>
                </div>
              ) : logFieldsError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 text-sm">{logFieldsError}</p>
                </div>
              ) : hasPermission('View') ? (
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Device Type</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Device Format</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Flag Code</th>
                      {(hasPermission('Edit') || hasPermission('Delete')) && ( 
                        <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900">{item.code}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.description}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.deviceType}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.deviceFormat}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.flagCode}</td>
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
                        <td colSpan={6} className="px-6 py-16 text-center">
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

      {/* Create/Edit Modal - Due to length, I'll create a separate modal component */}
      {(showCreateModal || showEditModal) && (
        <DTRLogFieldModal
          isEdit={showEditModal}
          formData={formData}
          setFormData={setFormData}
          onSubmit={showEditModal ? handleSubmitEdit : handleSubmitCreate}
          onClose={handleCloseModal}
          submitting={submitting}
          deviceTypes={deviceTypes}
          deviceFormats={deviceFormats}
          dateFormats={dateFormats}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Modal Component
interface DTRLogFieldModalProps {
  isEdit: boolean;
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  submitting: boolean;
  deviceTypes: string[];
  deviceFormats: string[];
  dateFormats: string[];
}

function DTRLogFieldModal({
  isEdit,
  formData,
  setFormData,
  onSubmit,
  onClose,
  submitting,
  deviceTypes,
  deviceFormats,
  dateFormats
}: DTRLogFieldModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0 z-10">
          <h2 className="text-gray-900">{isEdit ? 'Edit DTR Log Field' : 'Create New'}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6">
          <h3 className="text-blue-600 mb-4">DTR Log Fields Setup</h3>
          
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-gray-700 text-sm whitespace-nowrap w-32">Code :</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-gray-700 text-sm whitespace-nowrap w-32">Description :</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-gray-700 text-sm whitespace-nowrap w-32">Flag Code :</label>
                <input
                  type="text"
                  value={formData.flagCode}
                  onChange={(e) => setFormData({ ...formData, flagCode: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-gray-700 text-sm whitespace-nowrap w-36">Device Type :</label>
                <select
                  value={formData.deviceType}
                  onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {deviceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-gray-700 text-sm whitespace-nowrap w-36">Device Format :</label>
                <select
                  value={formData.deviceFormat}
                  onChange={(e) => setFormData({ ...formData, deviceFormat: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {deviceFormats.map(format => (
                    <option key={format} value={format}>{format}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-gray-700 text-sm whitespace-nowrap w-36">Date Format :</label>
                <select
                  value={formData.dateFormat}
                  onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {dateFormats.map(format => (
                    <option key={format} value={format}>{format}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-gray-700 text-sm whitespace-nowrap w-36">Date Separator :</label>
                <input
                  type="text"
                  value={formData.dateSeparator}
                  onChange={(e) => setFormData({ ...formData, dateSeparator: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-gray-700 text-sm whitespace-nowrap w-36">Combine Date/Time :</label>
                <input
                  type="checkbox"
                  checked={formData.combineDateTime}
                  onChange={(e) => setFormData({ ...formData, combineDateTime: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Position Fields */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-gray-700 mb-4 font-medium">Field Positions & Character Counts</h4>
            <div className="grid grid-cols-3 gap-4">
              {/* EmpCode */}
              <div>
                <label className="text-gray-700 text-xs mb-1 block">EmpCode Position</label>
                <input
                  type="number"
                  value={formData.empCodePos}
                  onChange={(e) => setFormData({ ...formData, empCodePos: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="text-gray-700 text-xs mb-1 block">EmpCode Chars</label>
                <input
                  type="number"
                  value={formData.empCodeNoOfChar}
                  onChange={(e) => setFormData({ ...formData, empCodeNoOfChar: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div></div>

              {/* Date */}
              <div>
                <label className="text-gray-700 text-xs mb-1 block">Date Position</label>
                <input
                  type="number"
                  value={formData.datePos}
                  onChange={(e) => setFormData({ ...formData, datePos: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="text-gray-700 text-xs mb-1 block">Date Chars</label>
                <input
                  type="number"
                  value={formData.dateNoOfChar}
                  onChange={(e) => setFormData({ ...formData, dateNoOfChar: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div></div>

              {/* Time */}
              <div>
                <label className="text-gray-700 text-xs mb-1 block">Time Position</label>
                <input
                  type="number"
                  value={formData.timePos}
                  onChange={(e) => setFormData({ ...formData, timePos: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="text-gray-700 text-xs mb-1 block">Time Chars</label>
                <input
                  type="number"
                  value={formData.timeNoOfChar}
                  onChange={(e) => setFormData({ ...formData, timeNoOfChar: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div></div>

              {/* Month/Day/Year */}
              <div>
                <label className="text-gray-700 text-xs mb-1 block">Month Position</label>
                <input
                  type="number"
                  value={formData.monthPos}
                  onChange={(e) => setFormData({ ...formData, monthPos: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="text-gray-700 text-xs mb-1 block">Month Chars</label>
                <input
                  type="number"
                  value={formData.monthNoOfChar}
                  onChange={(e) => setFormData({ ...formData, monthNoOfChar: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div></div>

              <div>
                <label className="text-gray-700 text-xs mb-1 block">Day Position</label>
                <input
                  type="number"
                  value={formData.dayPos}
                  onChange={(e) => setFormData({ ...formData, dayPos: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="text-gray-700 text-xs mb-1 block">Day Chars</label>
                <input
                  type="number"
                  value={formData.dayNoOfChar}
                  onChange={(e) => setFormData({ ...formData, dayNoOfChar: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div></div>

              <div>
                <label className="text-gray-700 text-xs mb-1 block">Year Position</label>
                <input
                  type="number"
                  value={formData.yearPos}
                  onChange={(e) => setFormData({ ...formData, yearPos: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="text-gray-700 text-xs mb-1 block">Year Chars</label>
                <input
                  type="number"
                  value={formData.yearNoOfChar}
                  onChange={(e) => setFormData({ ...formData, yearNoOfChar: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div></div>

              {/* Hour/Minutes/Period */}
              <div>
                <label className="text-gray-700 text-xs mb-1 block">Hour Position</label>
                <input
                  type="number"
                  value={formData.hourPos}
                  onChange={(e) => setFormData({ ...formData, hourPos: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="text-gray-700 text-xs mb-1 block">Hour Chars</label>
                <input
                  type="number"
                  value={formData.hourNoOfChar}
                  onChange={(e) => setFormData({ ...formData, hourNoOfChar: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div></div>

              <div>
                <label className="text-gray-700 text-xs mb-1 block">Minutes Position</label>
                <input
                  type="number"
                  value={formData.minutesPos}
                  onChange={(e) => setFormData({ ...formData, minutesPos: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="text-gray-700 text-xs mb-1 block">Minutes Chars</label>
                <input
                  type="number"
                  value={formData.minutesNoOfChar}
                  onChange={(e) => setFormData({ ...formData, minutesNoOfChar: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div></div>

              <div>
                <label className="text-gray-700 text-xs mb-1 block">Time Period Position</label>
                <input
                  type="number"
                  value={formData.timePeriodPos}
                  onChange={(e) => setFormData({ ...formData, timePeriodPos: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="text-gray-700 text-xs mb-1 block">Time Period Chars</label>
                <input
                  type="number"
                  value={formData.timePeriodNoOfChar}
                  onChange={(e) => setFormData({ ...formData, timePeriodNoOfChar: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div></div>

              {/* Flag */}
              <div>
                <label className="text-gray-700 text-xs mb-1 block">Flag Position</label>
                <input
                  type="number"
                  value={formData.flagPos}
                  onChange={(e) => setFormData({ ...formData, flagPos: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="text-gray-700 text-xs mb-1 block">Flag Chars</label>
                <input
                  type="number"
                  value={formData.flagNoOfChar}
                  onChange={(e) => setFormData({ ...formData, flagNoOfChar: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div></div>

              {/* Terminal */}
              <div>
                <label className="text-gray-700 text-xs mb-1 block">Terminal Position</label>
                <input
                  type="number"
                  value={formData.terminalPos}
                  onChange={(e) => setFormData({ ...formData, terminalPos: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="text-gray-700 text-xs mb-1 block">Terminal Chars</label>
                <input
                  type="number"
                  value={formData.terminalNoOfChar}
                  onChange={(e) => setFormData({ ...formData, terminalNoOfChar: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div></div>

              {/* Identifier */}
              <div>
                <label className="text-gray-700 text-xs mb-1 block">Identifier Position</label>
                <input
                  type="number"
                  value={formData.identifierPos}
                  onChange={(e) => setFormData({ ...formData, identifierPos: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="text-gray-700 text-xs mb-1 block">Identifier Chars</label>
                <input
                  type="number"
                  value={formData.identifierNoOfChar}
                  onChange={(e) => setFormData({ ...formData, identifierNoOfChar: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm"
            >
              {submitting ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update' : 'Submit')}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm"
            >
              Back to List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}