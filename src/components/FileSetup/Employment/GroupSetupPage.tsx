import { useState, useEffect } from 'react';
import { X, Search, Plus, Check, Edit, Trash2 } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import auditTrail from '../../../services/auditTrail';
import { Footer } from '../../Footer/Footer';
import { EmployeeSearchModal } from '../../Modals/EmployeeSearchModal';
import Swal from 'sweetalert2';

export function GroupSetupPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // Form fields
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [description, setDescription] = useState('');
  const [headCode, setHeadCode] = useState('');
  const [head, setHead] = useState('');
  const [groupId, setGroupId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal state
  const [showHeadModal, setShowHeadModal] = useState(false);

  // API Data states
  const [employeeData, setEmployeeData] = useState<Array<{ empCode: string; name: string; groupCode: string }>>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeeError, setEmployeeError] = useState('');

  // Group List states
  const [groupList, setGroupList] = useState<Array<{ id: string; code: string; description: string; head: string; headCode: string }>>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupError, setGroupError] = useState('');
    
  // Form Name
  const formName = 'Group Setup';
    
  // Fetch group data from API
  useEffect(() => {
    fetchGroupData();
  }, []);

  const fetchGroupData = async () => {
    setLoadingGroups(true);
    setGroupError('');
    try {
      const response = await apiClient.get('/Fs/Employment/GroupSetUp');
      if (response.status === 200 && response.data) {
        // Map API response to expected format
        const mappedData = response.data.map((group: any) => ({
          id: group.id || '',
          code: group.grpCode || '',
          description: group.grpDesc || '',
          head: group.grpHead || '',
          headCode: group.grpHeadCode || '',
        }));
        setGroupList(mappedData);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load groups';
      setGroupError(errorMsg);
      console.error('Error fetching groups:', error);
    } finally {
      setLoadingGroups(false);
    }
  };

  // Fetch employee data from API
  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    setLoadingEmployees(true);
    setEmployeeError('');
    try {
      const response = await apiClient.get('/EmployeeMasterFile');
      if (response.status === 200 && response.data) {
        // Map API response to expected format
        const mappedData = response.data.map((emp: any) => ({
          empCode: emp.empCode || emp.code || '',
          name: `${emp.lName || ''}, ${emp.fName || ''} ${emp.mName || ''}`.trim(),
          groupCode: emp.grpCode || ''
        }));
        setEmployeeData(mappedData);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load employees';
      setEmployeeError(errorMsg);
      console.error('Error fetching employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Handle ESC key to close create modal only
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showCreateModal) {
        setShowCreateModal(false);
      }
    };

    if (showCreateModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showCreateModal]);

  const handleCreateNew = () => {
    setIsEditMode(false);
    setSelectedGroupIndex(null);
    setGroupId(null);
    // Clear form
    setCode('');
    setCodeError('');
    setDescription('');
    setHeadCode('');
    setHead('');
    setShowCreateModal(true);
  };

  const handleEdit = (group: any, index: number) => {
    setIsEditMode(true);
    setSelectedGroupIndex(index);
    setGroupId(group.id || null);
    setCode(group.code);
    setCodeError('');
    setDescription(group.description);
    setHeadCode(group.headCode);
    setHead(group.head);
    setShowCreateModal(true);
  };

  const handleDelete = async (group: any) => {
    const confirmed = await Swal.fire({
      icon: 'warning',
      title: 'Confirm Delete',
      text: `Are you sure you want to delete group ${group.code}?`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (confirmed.isConfirmed) {
      try {
        await apiClient.delete(`/Fs/Employment/GroupSetUp/${group.id}`);
        await auditTrail.log({
            accessType: 'Delete',
            trans: `Deleted group ${group.code}`,
            messages: `Group deleted: ${group.code} - ${group.description}`,
            formName,
        });
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Group deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
        // Refresh the group list
        await fetchGroupData();
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to delete group';
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg,
        });
        console.error('Error deleting group:', error);
      }
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    if (value.length > 10) {
      setCodeError('Code maximum 10 characters');
    } else {
      setCodeError('');
    }
  };

  const handleSubmit = async () => {
    // Validate code - must not be empty and must be max 10 characters
    if (!code.trim() || code.length > 10) {
      await Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Code must be between 1 and 10 characters.',
      });
      return;
    }
// Check for duplicate code (only when creating new or changing code during edit)
                const isDuplicate = groupList.some((group, index) => {
                  // When editing, exclude the current record from duplicate check
                  if (isEditMode && selectedGroupIndex === index) {
                    return false;
                  }
                  return group.code.toLowerCase() === code.trim().toLowerCase();
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
        id: isEditMode && groupId ? parseInt(groupId) : 0,
        grpCode: code,
        grpDesc: description,
        grpHead: head,
        grpHeadCode: headCode,
      };
      console.log('Submitting payload:', payload);
      if (isEditMode && groupId) {
        // Update existing record via PUT
        await apiClient.put(`/Fs/Employment/GroupSetUp/${groupId}`, payload);
        await auditTrail.log({
            accessType: 'Edit',
            trans: `Edited group ${payload.grpCode}`,
            messages: `Group updated: ${payload.grpCode} - ${payload.grpDesc}`,
            formName,
        });
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Group updated successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
        // Refresh the group list
        await fetchGroupData();
      } else {
        // Create new record via POST
        await apiClient.post('/Fs/Employment/GroupSetUp', payload);
        await auditTrail.log({
            accessType: 'Add',
            trans: `Added group ${payload.grpCode}`,
            messages: `Group created: ${payload.grpCode} - ${payload.grpDesc}`,
            formName,
        });
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Group created successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
        // Refresh the group list
        await fetchGroupData();
      }

      // Close modal and reset form
      setShowCreateModal(false);
      setCode('');
      setCodeError('');
      setDescription('');
      setHeadCode('');
      setHead('');
      setGroupId(null);
      setIsEditMode(false);
      setSelectedGroupIndex(null);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
      });
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleHeadSelect = (empCode: string, name: string) => {
    setHeadCode(empCode);
    setHead(name);
    setShowHeadModal(false);
  };

  const filteredGroups = groupList.filter(group =>
    group.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.head.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGroups = filteredGroups.slice(startIndex, endIndex);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Group Setup</h1>
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
                    Configure work groups with designated group heads for effective team organization and time tracking management across different employee teams and units.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Group code and description management</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Group head assignment</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Team organization tracking</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Workforce grouping system</span>
                    </div>
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              {loadingGroups ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-600 text-sm">Loading groups...</div>
                </div>
              ) : groupError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 text-sm">{groupError}</p>
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-4 py-2 text-left text-gray-700">Code ▲</th>
                      <th className="px-4 py-2 text-left text-gray-700">Description</th>
                      <th className="px-4 py-2 text-left text-gray-700">Head</th>
                      <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedGroups.map((group, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-2">{group.code}</td>
                        <td className="px-4 py-2">{group.description}</td>
                        <td className="px-4 py-2">{group.head}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(group, index)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => handleDelete(group)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
                Showing {filteredGroups.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredGroups.length)} of {filteredGroups.length} entries
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
              <>
                {/* Modal Backdrop */}
                <div 
                  className="fixed inset-0 bg-black/30 z-10"
                  onClick={() => setShowCreateModal(false)}
                ></div>

                {/* Modal Dialog */}
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                      <h2 className="text-gray-800">{isEditMode ? 'Edit Group' : 'Create New'}</h2>
                      <button 
                        onClick={() => setShowCreateModal(false)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-4">
                      <h3 className="text-blue-600 mb-3">Group Setup</h3>

                      {/* Form Fields */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">Code :</label>
                          <input
                            type="text"
                            value={code}
                            onChange={(e) => handleCodeChange(e.target.value)}
                            maxLength={10}
                            className={`flex-1 px-3 py-1.5 border rounded focus:outline-none focus:ring-2 text-sm ${
                              codeError 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-gray-300 focus:ring-blue-500'
                            }`}
                          />
                        </div>
                        {codeError && (
                          <p className="ml-32 text-red-500 text-xs mt-1">{codeError}</p>
                        )}

                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">Description :</label>
                          <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">Head Code :</label>
                          <input
                            type="text"
                            value={headCode}
                            onChange={(e) => setHeadCode(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            readOnly
                          />
                          <button
                            onClick={() => setShowHeadModal(true)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setHeadCode('');
                              setHead('');
                            }}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">Head :</label>
                          <input
                            type="text"
                            value={head}
                            readOnly
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded bg-gray-50 text-sm"
                          />
                        </div>
                      </div>

                      {/* Modal Actions */}
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={handleSubmit}
                          disabled={submitting}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm"
                        >
                          {submitting ? 'Saving...' : (isEditMode ? 'Update' : 'Submit')}
                        </button>
                        <button
                          onClick={() => setShowCreateModal(false)}
                          disabled={submitting}
                          className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm"
                        >
                          Back to List
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Employee Search Modal - Reusable Component */}
            <EmployeeSearchModal
              isOpen={showHeadModal}
              onClose={() => setShowHeadModal(false)}
              onSelect={handleHeadSelect}
              employees={employeeData}
              loading={loadingEmployees}
              error={employeeError}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}