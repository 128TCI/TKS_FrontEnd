import { useState, useEffect } from 'react';
import { X, Search, Plus, Check, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../Footer/Footer';
import { EmployeeSearchModal } from '../../Modals/EmployeeSearchModal';
import { DeviceSearchModal } from '../../Modals/DeviceSearchModal';
import apiClient from '../../../services/apiClient';
import Swal from 'sweetalert2';

export function BranchSetupPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBranchIndex, setSelectedBranchIndex] = useState<number | null>(null);
  
  // Form fields
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [branchManagerCode, setBranchManagerCode] = useState('');
  const [branchManager, setBranchManager] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [branchId, setBranchId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Modal state
  const [showBranchManagerModal, setShowBranchManagerModal] = useState(false);
  const [showDeviceNameModal, setShowDeviceNameModal] = useState(false);

  // Branch List states
  const [branchList, setBranchList] = useState<Array<{ id?: string; code: string; description: string; branchManager: string; branchManagerCode: string; deviceName: string }>>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [branchError, setBranchError] = useState('');

  // API Data states
  const [employeeData, setEmployeeData] = useState<Array<{ empCode: string; name: string; groupCode: string }>>([]);
  const [deviceData, setDeviceData] = useState<Array<{ deviceID: string; deviceName: string }>>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [employeeError, setEmployeeError] = useState('');
  const [deviceError, setDeviceError] = useState('');

  // Fetch branch data from API
  useEffect(() => {
    fetchBranchData();
  }, []);

  const fetchBranchData = async () => {
    setLoadingBranches(true);
    setBranchError('');
    try {
      const response = await apiClient.get('/Fs/Employment/BranchSetUp');
      if (response.status === 200 && response.data) {
        // Map API response to expected format
        const mappedData = response.data.map((branch: any) => ({
          branchId: branch.braID || branch.id || '',
          code: branch.braCode || branch.code || '',
          description: branch.braDesc || branch.description || '',
          branchManager: branch.braMngr || branch.branchManager || '',
          branchManagerCode: branch.braMngrCode || '',
          deviceName: branch.deviceName || branch.DeviceName || '',
        }));
        setBranchList(mappedData);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load branches';
      setBranchError(errorMsg);
      console.error('Error fetching branches:', error);
    } finally {
      setLoadingBranches(false);
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

  // Fetch device data from API
  useEffect(() => {
    fetchDeviceData();
  }, []);

  const fetchDeviceData = async () => {
    setLoadingDevices(true);
    setDeviceError('');
    try {
      const response = await apiClient.get('/Device/GetAll');
      if (response.status === 200 && response.data) {
        // Map API response to expected format
        const mappedData = response.data.map((device: any) => ({
          deviceID: device.deviceCode || device.code || '',
          deviceName: device.deviceName || device.name || ''
        }));
        setDeviceData(mappedData);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load devices';
      setDeviceError(errorMsg);
      console.error('Error fetching devices:', error);
    } finally {
      setLoadingDevices(false);
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
    setSelectedBranchIndex(null);
    // Clear form
    setCode('');
    setDescription('');
    setBranchManagerCode('');
    setBranchManager('');
    setDeviceName('');
    setShowCreateModal(true);
  };

  const handleEdit = (branch: any, index: number) => {
    setIsEditMode(true);
    setSelectedBranchIndex(index);
    setBranchId(branch.branchId);
    setCode(branch.code);
    setDescription(branch.description);
    setBranchManagerCode(branch.branchManagerCode);
    setBranchManager(branch.branchManager);
    setDeviceName(branch.deviceName);
    setShowCreateModal(true);
  };

  const handleDelete = async (branch: any) => {
    const confirmed = await Swal.fire({
      icon: 'warning',
      title: 'Confirm Delete',
      text: `Are you sure you want to delete branch ${branch.code}?`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (confirmed.isConfirmed) {
      try {
        await apiClient.delete(`/Fs/Employment/BranchSetUp/${branch.id}`);
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Branch deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
        // Refresh the branch list
        await fetchBranchData();
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to delete branch';
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg,
        });
        console.error('Error deleting branch:', error);
      }
    }
  };

  const handleSubmit = async () => {
    // Validate code
    if (!code.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter a Code.',
      });
      return;
    }
            // Check for duplicate code (only when creating new or changing code during edit)
            const isDuplicate = branchList.some((branch, index) => {
              // When editing, exclude the current record from duplicate check
              if (isEditMode && selectedBranchIndex === index) {
                return false;
              }
              return branch.code.toLowerCase() === code.trim().toLowerCase();
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
        braID: isEditMode && branchId ? parseInt(branchId) : 0,
        braCode: code,
        braDesc: description,
        braMngr: branchManager || null,
        braMngrCode: branchManagerCode || '',
        deviceName: deviceName || null
      };

      if (isEditMode && selectedBranchIndex !== null) {
        // Update existing record via PUT
        const id = branchId;
        await apiClient.put(`/Fs/Employment/BranchSetUp/${id}`, payload);
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Branch updated successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
        // Refresh the branch list
        await fetchBranchData();
      } else {
        // Create new record via POST
        await apiClient.post('/Fs/Employment/BranchSetUp', payload);
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Branch created successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
        // Refresh the branch list
        await fetchBranchData();
      }

      // Close modal and reset form
      setShowCreateModal(false);
      setCode('');
      setDescription('');
      setBranchManagerCode('');
      setBranchManager('');
      setDeviceName('');
      setIsEditMode(false);
      setSelectedBranchIndex(null);
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

  const handleBranchManagerSelect = (empCode: string, name: string) => {
    setBranchManagerCode(empCode);
    setBranchManager(name);
    setShowBranchManagerModal(false);
  };

  const handleDeviceNameSelect = (deviceID: string, deviceName: string) => {
    setDeviceName(deviceName);
    setShowDeviceNameModal(false);
  };

  const filteredBranches = branchList.filter(branch =>
    branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.branchManager.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.deviceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Branch Setup</h1>
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
                    Manage branch locations with branch manager assignments and device configurations for comprehensive organizational structure and time tracking across multiple business locations.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Branch code and description management</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Branch manager assignment</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Device name configuration</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Multi-location tracking</span>
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
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-4 py-2 text-left text-gray-700">Code ▲</th>
                    <th className="px-4 py-2 text-left text-gray-700">Description</th>
                    <th className="px-4 py-2 text-left text-gray-700">Branch Manager</th>
                    <th className="px-4 py-2 text-left text-gray-700">Device Name</th>
                    <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBranches.map((branch, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">{branch.code}</td>
                      <td className="px-4 py-2">{branch.description}</td>
                      <td className="px-4 py-2">{branch.branchManager}</td>
                      <td className="px-4 py-2">{branch.deviceName}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(branch, index)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleDelete(branch.code)}
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
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-gray-600">
                Showing 1 to {filteredBranches.length} of {filteredBranches.length} entries
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
                  Previous
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
              <>
                {/* Modal Dialog */}
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                      <h2 className="text-gray-800">{isEditMode ? 'Edit Branch' : 'Create New'}</h2>
                      <button 
                        onClick={() => setShowCreateModal(false)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-4">
                      <h3 className="text-blue-600 mb-3">Branch Setup</h3>

                      {/* Form Fields */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <label className="w-40 text-gray-700 text-sm">Code :</label>
                          <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="w-40 text-gray-700 text-sm">Description :</label>
                          <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="w-40 text-gray-700 text-sm">Branch Manager Code :</label>
                          <input
                            type="text"
                            value={branchManagerCode}
                            onChange={(e) => setBranchManagerCode(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            readOnly
                          />
                          <button
                            onClick={() => setShowBranchManagerModal(true)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setBranchManagerCode('');
                              setBranchManager('');
                            }}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="w-40 text-gray-700 text-sm">Branch Manager :</label>
                          <input
                            type="text"
                            value={branchManager}
                            readOnly
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded bg-gray-50 text-sm"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="w-40 text-gray-700 text-sm">Device Name :</label>
                          <input
                            type="text"
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            readOnly
                          />
                          <button
                            onClick={() => setShowDeviceNameModal(true)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeviceName('')}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Modal Actions */}
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={handleSubmit}
                          disabled={submitting}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? 'Processing...' : (isEditMode ? 'Update' : 'Submit')}
                        </button>
                        <button
                          onClick={() => setShowCreateModal(false)}
                          disabled={submitting}
                          className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
              isOpen={showBranchManagerModal}
              onClose={() => setShowBranchManagerModal(false)}
              onSelect={handleBranchManagerSelect}
              employees={employeeData}
              loading={loadingEmployees}
              error={employeeError}
            />

            {/* Device Search Modal - Reusable Component */}
            <DeviceSearchModal
              isOpen={showDeviceNameModal}
              onClose={() => setShowDeviceNameModal(false)}
              onSelect={handleDeviceNameSelect}
              devices={deviceData}
              loading={loadingDevices}
              error={deviceError}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}