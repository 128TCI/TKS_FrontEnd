import { useState, useEffect } from "react";
import { X, Search, Plus, Check, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Footer } from "../../Footer/Footer";
import { EmployeeSearchModal } from "../../Modals/EmployeeSearchModal";
import { DeviceSearchModal } from "../../Modals/DeviceSearchModal";
import apiClient from "../../../services/apiClient";
import Swal from "sweetalert2";
import { decryptData } from "../../../services/encryptionService";

export function BranchSetupPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBranchIndex, setSelectedBranchIndex] = useState<number | null>(
    null,
  );

  // Form fields
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [branchManagerCode, setBranchManagerCode] = useState("");
  const [branchManager, setBranchManager] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [branchId, setBranchId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal state
  const [showBranchManagerModal, setShowBranchManagerModal] = useState(false);
  const [showDeviceNameModal, setShowDeviceNameModal] = useState(false);

  // Branch List states
  const [branchList, setBranchList] = useState<
    Array<{
      id?: string;
      code: string;
      description: string;
      branchManager: string;
      branchManagerCode: string;
      deviceName: string;
    }>
  >([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [branchError, setBranchError] = useState("");

  // API Data states
  const [employeeData, setEmployeeData] = useState<Array<{ empCode: string; name: string; groupCode: string }>>([]);
  const [deviceData, setDeviceData] = useState<Array<{ id: number ;code: string; description: string }>>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [employeeError, setEmployeeError] = useState("");
  const [deviceError, setDeviceError] = useState("");

  // Permissions
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const hasPermission = (accessType: string) =>
    permissions[accessType] === true;

  useEffect(() => {
    getEmployeeStatusPermissions();
  }, []);

  const getEmployeeStatusPermissions = () => {
    const rawPayload = localStorage.getItem("loginPayload");
    if (!rawPayload) return;

    try {
      const parsedPayload = JSON.parse(rawPayload);
      const encryptedArray: any[] = parsedPayload.permissions || [];

      const branchEntries = encryptedArray.filter(
        (p) => decryptData(p.formName) === "EmployeeStatusSetUp",
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

  useEffect(() => {
    getBranchPermissions();
  }, []);

  const getBranchPermissions = () => {
    const rawPayload = localStorage.getItem("loginPayload");
    if (!rawPayload) return;

    try {
      const parsedPayload = JSON.parse(rawPayload);
      const encryptedArray: any[] = parsedPayload.permissions || [];

      const branchEntries = encryptedArray.filter(
        (p) => decryptData(p.formName) === "BranchSetup",
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

  // Fetch branch data from API
  useEffect(() => {
    getBranchPermissions();
    fetchBranchData();
    fetchEmployeeData();
    fetchDeviceData();
  }, []);

  const getBranchPermissions = () => {
    const rawPayload = localStorage.getItem("loginPayload");
    if (!rawPayload) return;
    try {
      const parsedPayload = JSON.parse(rawPayload);
      const encryptedArray: any[] = parsedPayload.permissions || [];
      const branchEntries = encryptedArray.filter(
        (p) => decryptData(p.formName) === "BranchSetup"
      );
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

  const fetchBranchData = async () => {
    setLoadingBranches(true);
    setBranchError("");
    try {
      const response = await apiClient.get("/Fs/Employment/BranchSetUp");
      if (response.status === 200 && response.data) {
        const mappedData = response.data.map((branch: any) => ({
          id: branch.braID || branch.id || '',
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
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to load branches";
      setBranchError(errorMsg);
    } finally {
      setLoadingBranches(false);
    }
  };

  const fetchEmployeeData = async () => {
    setLoadingEmployees(true);
    setEmployeeError("");
    try {
      const response = await apiClient.get('/Maintenance/EmployeeMasterFile');
      if (response.status === 200 && response.data) {
        const mappedData = response.data.map((emp: any) => ({
          empCode: emp.empCode || emp.code || "",
          name: `${emp.lName || ""}, ${emp.fName || ""} ${emp.mName || ""}`.trim(),
          groupCode: emp.grpCode || "",
        }));
        setEmployeeData(mappedData);
      }
    } catch (error: any) {
      setEmployeeError('Failed to load employees');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchDeviceData = async () => {
    setLoadingDevices(true);
    setDeviceError("");
    try {
      const response = await apiClient.get('/Fs/Process/Device/BorrowedDeviceName');
      if (response.status === 200 && response.data) {
        const mappedData = response.data.map((device: any) => ({
          id: device.id || '',
          code: device.code || '',
          description: device.description || ''
        }));
        setDeviceData(mappedData);
      }
    } catch (error: any) {
      setDeviceError('Failed to load devices');
    } finally {
      setLoadingDevices(false);
    }
  };

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showCreateModal) setShowCreateModal(false);
    };
    if (showCreateModal) document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showCreateModal]);

  const handleCreateNew = () => {
    setIsEditMode(false);
    setSelectedBranchIndex(null);
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
      icon: "warning",
      title: "Confirm Delete",
      text: `Are you sure you want to delete branch ${branch.code}?`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Delete',
    });
    if (confirmed.isConfirmed) {
      try {
        await apiClient.delete(`/Fs/Employment/BranchSetUp/${branch.id}`);
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Branch deleted successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        // Refresh the branch list
        await fetchBranchData();
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Failed to delete branch";
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMsg,
        });
        console.error("Error deleting branch:", error);
      }
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter a Code.",
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
        icon: "error",
        title: "Duplicate Code",
        text: "This code is already in use. Please use a different code.",
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
        braMngrCode: branchManagerCode || "",
        deviceName: deviceName || null,
      };

      if (isEditMode) {
        await apiClient.put(`/Fs/Employment/BranchSetUp/${branchId}`, payload);
      } else {
        await apiClient.post('/Fs/Employment/BranchSetUp', payload);
      }
      await Swal.fire({ icon: 'success', title: 'Success', timer: 2000, showConfirmButton: false });
      await fetchBranchData();
      setShowCreateModal(false);
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'An error occurred' });
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

  const filteredBranches = branchList.filter(
    (branch) =>
      branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.branchManager.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.deviceName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 md:px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white text-lg md:text-xl">Branch Setup</h1>
          </div>

          <div className="bg-white rounded-b-lg shadow-lg p-4 md:p-6 relative">
            {/* Info Frame */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex flex-col md:flex-row items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    Manage branch locations with branch manager assignments and
                    device configurations for comprehensive organizational
                    structure and time tracking across multiple business
                    locations.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Branch code and description management
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Branch manager assignment
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Device name configuration
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Multi-location tracking
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Row - Stacked on mobile */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              {hasPermission("Add") && (
                <button 
                  className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  onClick={handleCreateNew}
                >
                  <Plus className="w-4 h-4" />
                  Create New
                </button>
              )}
              <div className="md:ml-auto flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
                <label className="text-gray-700 whitespace-nowrap">Search:</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Table Container - Scrollable on small screens */}
            <div className="overflow-x-auto border rounded-lg">
              {hasPermission("View") ? (
                <table className="w-full border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-4 py-2 text-left text-gray-700">Code ▲</th>
                      <th className="px-4 py-2 text-left text-gray-700">Description</th>
                      <th className="px-4 py-2 text-left text-gray-700">Branch Manager</th>
                      <th className="px-4 py-2 text-left text-gray-700">Device Name</th>
                      {(hasPermission("Edit") || hasPermission("Delete")) && (
                        <th className="px-4 py-2 text-left text-gray-700">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBranches.map((branch, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-2">{branch.code}</td>
                        <td className="px-4 py-2">{branch.description}</td>
                        <td className="px-4 py-2">{branch.branchManager}</td>
                        <td className="px-4 py-2">{branch.deviceName}</td>
                        {(hasPermission("Edit") || hasPermission("Delete")) && (
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex gap-2">
                              {hasPermission("Edit") && (
                                <button onClick={() => handleEdit(branch, index)} className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                              {hasPermission("Delete") && (
                                <button onClick={() => handleDelete(branch)} className="p-1 text-red-600 hover:bg-red-100 rounded">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-10 text-gray-500">Access denied.</div>
              )}
            </div>

            {/* Pagination - Column on mobile */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
              <div className="text-gray-600 text-sm">
                Showing {filteredBranches.length} entries
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">Previous</button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">Next</button>
              </div>
            )}

            {/* Modal - Better sizing for mobile */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b bg-gray-50 rounded-t-2xl">
                    <h2 className="text-gray-800 text-lg">{isEditMode ? 'Edit Branch' : 'Create New'}</h2>
                    <button onClick={() => setShowCreateModal(false)} className="text-gray-600"><X className="w-5 h-5" /></button>
                  </div>

                  {/* Body */}
                  <div className="p-4 md:p-6 overflow-y-auto space-y-4">
                    <h3 className="text-blue-600 font-semibold">Branch Setup</h3>
                    
                    {/* Responsive Form Rows */}
                    <div className="grid gap-4">
                      {[
                        { label: 'Code', value: code, setter: setCode, max: 10 },
                        { label: 'Description', value: description, setter: setDescription }
                      ].map((field) => (
                        <div key={field.label} className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <label className="sm:w-40 text-gray-700 text-sm">{field.label} :</label>
                          <input
                            type="text"
                            maxLength={field.max}
                            value={field.value}
                            onChange={(e) => field.setter(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                      ))}

                      {/* Manager Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-40 text-gray-700 text-sm">Manager Code :</label>
                        <div className="flex-1 flex gap-2">
                          <input readOnly value={branchManagerCode} className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm" />
                          <button onClick={() => setShowBranchManagerModal(true)} className="p-2 bg-green-600 text-white rounded-lg"><Search className="w-4 h-4" /></button>
                          <button onClick={() => {setBranchManager(''); setBranchManagerCode('');}} className="p-2 bg-red-600 text-white rounded-lg"><X className="w-4 h-4" /></button>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-40 text-gray-700 text-sm">Manager Name :</label>
                        <input readOnly value={branchManager} className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm" />
                      </div>

                      {/* Device Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-40 text-gray-700 text-sm">Device Name :</label>
                        <div className="flex-1 flex gap-2">
                          <input readOnly value={deviceName} className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm" />
                          <button onClick={() => setShowDeviceNameModal(true)} className="p-2 bg-green-600 text-white rounded-lg"><Search className="w-4 h-4" /></button>
                          <button onClick={() => setDeviceName('')} className="p-2 bg-red-600 text-white rounded-lg"><X className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                      <button 
                        onClick={handleSubmit} 
                        disabled={submitting} 
                        className="flex-1 min-w-[120px] px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                      >
                        {submitting ? 'Processing...' : (isEditMode ? 'Update' : 'Submit')}
                      </button>
                      <button 
                        onClick={() => setShowCreateModal(false)} 
                        className="flex-1 min-w-[120px] px-6 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
                      >
                        Back to List
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <EmployeeSearchModal
              isOpen={showBranchManagerModal}
              onClose={() => setShowBranchManagerModal(false)}
              onSelect={handleBranchManagerSelect}
              employees={employeeData}
              loading={loadingEmployees}
              error={employeeError}
            />

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
