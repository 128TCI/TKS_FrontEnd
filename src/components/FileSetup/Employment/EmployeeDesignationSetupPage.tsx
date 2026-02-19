import { useState, useEffect } from "react";
import { X, Search, Plus, Check, Edit, Trash2 } from "lucide-react";
import apiClient from "../../../services/apiClient";
import auditTrail from '../../../services/auditTrail';
import { Footer } from "../../Footer/Footer";
import { EmployeeSearchModal } from "../../Modals/EmployeeSearchModal";
import { DeviceSearchModal } from "../../Modals/DeviceSearchModal";
import Swal from "sweetalert2";
import { decryptData } from "../../../services/encryptionService";

export function EmployeeDesignationSetupPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [jobLevelSearchTerm, setJobLevelSearchTerm] = useState("");
  const [showDeviceNameSearchModal, setShowDeviceNameSearchModal] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDesignationIndex, setSelectedDesignationIndex] = useState<
    number | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // Form fields
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [description, setDescription] = useState("");
  const [jobLevelCode, setJobLevelCode] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [designationId, setDesignationId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal state
  const [showJobLevelModal, setShowJobLevelModal] = useState(false);
  const [showDeviceNameModal, setShowDeviceNameModal] = useState(false);

  // Device List states
  const [deviceData, setDeviceData] = useState<
    Array<{ id: number; code: string; description: string }>
  >([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [deviceError, setDeviceError] = useState("");
  // Job Level List states
  const [levelList, setLevelList] = useState<
    Array<{ id: string; code: string; description: string }>
  >([]);
  const [loadingJobLevels, setLoadingJobLevels] = useState(false);
  const [jobLevelError, setJobLevelError] = useState("");

  // Designation List states
  const [designationList, setDesignationList] = useState<
    Array<{
      id: string;
      code: string;
      description: string;
      jobLevelCode: string;
      deviceName: string;
    }>
  >([]);
  const [loadingDesignation, setLoadingDesignation] = useState(false);
  const [designationError, setDesignationError] = useState("");

  //Permissions
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const hasPermission = (accessType: string) =>
    permissions[accessType] === true;

  // Form Name
  const formName = 'Employee Designation Setup';

  useEffect(() => {
    getEmployeeDesignationSetupPermissions();
  }, []);

  const getEmployeeDesignationSetupPermissions = () => {
    const rawPayload = localStorage.getItem("loginPayload");
    if (!rawPayload) return;

    try {
      const parsedPayload = JSON.parse(rawPayload);
      const encryptedArray: any[] = parsedPayload.permissions || [];

      const branchEntries = encryptedArray.filter(
        (p) => decryptData(p.formName) === "EmployeeDesignationSetup",
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

  // Fetch job level data from API
  useEffect(() => {
    fetchJobLevelData();
  }, []);

  const fetchJobLevelData = async () => {
    setLoadingJobLevels(true);
    setJobLevelError("");
    try {
      const response = await apiClient.get("/Fs/Employment/JobLevelSetUp");
      if (response.status === 200 && response.data) {
        // Map API response to expected format
        const mappedData = response.data.map((division: any) => ({
          id: division.jobLevelID || "",
          code: division.jobLevelCode || "",
          description: division.jobLevelDesc || "",
        }));
        setLevelList(mappedData);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to load divisions";
      setJobLevelError(errorMsg);
      console.error("Error fetching divisions:", error);
    } finally {
      setLoadingJobLevels(false);
    }
  };
  // Fetch division data from API
  useEffect(() => {
    fetchDesignationData();
  }, []);

  const fetchDesignationData = async () => {
    setLoadingDesignation(true);
    setDesignationError("");
    try {
      const response = await apiClient.get("/Fs/Employment/DesignationSetUp");
      if (response.status === 200 && response.data) {
        // Map API response to expected format
        const mappedData = response.data.map((division: any) => ({
          id: division.desID || "",
          code: division.desCode || "",
          description: division.desDesc || "",
          jobLevelCode: division.jobLevelCode || "",
          deviceName: division.deviceName || "",
        }));
        setDesignationList(mappedData);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to load divisions";
      setDesignationError(errorMsg);
      console.error("Error fetching Designation:", error);
    } finally {
      setLoadingDesignation(false);
    }
  };
  // Fetch device data from API
  useEffect(() => {
    fetchDeviceData();
  }, []);

  const fetchDeviceData = async () => {
    setLoadingDevices(true);
    setDeviceError("");
    try {
      const response = await apiClient.get(
        "/Fs/Process/Device/BorrowedDeviceName",
      );
      if (response.status === 200 && response.data) {
        // Map API response to expected format
        const mappedData = response.data.map((device: any) => ({
          id: device.id || "",
          code: device.code || "",
          description: device.description || "",
        }));
        setDeviceData(mappedData);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to load devices";
      setDeviceError(errorMsg);
      console.error("Error fetching devices:", error);
    } finally {
      setLoadingDevices(false);
    }
  };

  // Handle ESC key to close create modal only
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showCreateModal) {
        setShowCreateModal(false);
      }
    };

    if (showCreateModal) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [showCreateModal]);

  const handleCreateNew = () => {
    setIsEditMode(false);
    setSelectedDesignationIndex(null);
    setDesignationId(null);
    // Clear form
    setCode("");
    setCodeError("");
    setDescription("");
    setJobLevelCode("");
    setDeviceName("");
    setShowCreateModal(true);
  };

  const handleEdit = (designation: any, index: number) => {
    setIsEditMode(true);
    setSelectedDesignationIndex(index);
    setDesignationId(designation.id || null);
    setCode(designation.code);
    setCodeError("");
    setDescription(designation.description);
    setJobLevelCode(designation.jobLevelCode);
    setDeviceName(designation.deviceName);
    setShowCreateModal(true);
  };

  const handleDelete = async (designation: any) => {
    console.log(designation);
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "Confirm Delete",
      text: `Are you sure you want to delete designation ${designation.code}?`,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (confirmed.isConfirmed) {
      try {
        await apiClient.delete(`/Fs/Employment/Designation/${designation.id}`);
        await auditTrail.log({
            accessType: 'Delete',
            trans: `Deleted designation ${designation.code}`,
            messages: `Designation deleted: ${designation.code} - ${designation.description}`,
            formName,
        });
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Designation deleted successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        // Refresh the designation list
        await fetchDesignationData();
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Failed to delete designation";
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMsg,
        });
        console.error("Error deleting designation:", error);
      }
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    if (value.length > 10) {
      setCodeError("Code maximum 10 characters");
    } else {
      setCodeError("");
    }
  };

  const handleSubmit = async () => {
    // Validate code - must not be empty and must be max 10 characters
    if (!code.trim() || code.length > 10) {
      await Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Code must be between 1 and 10 characters.",
      });
      return;
    }
    // Check for duplicate code (only when creating new or changing code during edit)
    const isDuplicate = designationList.some((designation, index) => {
      // When editing, exclude the current record from duplicate check
      if (isEditMode && selectedDesignationIndex === index) {
        return false;
      }
      return designation.code.toLowerCase() === code.trim().toLowerCase();
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
        desID: isEditMode && designationId ? parseInt(designationId) : 0,
        desCode: code,
        desDesc: description,
        jobLevelCode: jobLevelCode,
        deviceName: deviceName,
      };

      if (isEditMode && designationId) {
        // Update existing record via PUT
        await apiClient.put(
          `/Fs/Employment/DesignationSetUp/${designationId}`,
          payload,
        );
        await auditTrail.log({
            accessType: 'Edit',
            trans: `Edited designation ${payload.desCode}`,
            messages: `Designation updated: ${payload.desCode} - ${payload.desDesc}`,
            formName,
        });
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Designation updated successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        // Refresh the designation list
        await fetchDesignationData();
      } else {
        // Create new record via POST
        await apiClient.post("/Fs/Employment/DesignationSetUp", payload);
        await auditTrail.log({
            accessType: 'Add',
            trans: `Added designation ${payload.desCode}`,
            messages: `Designation created: ${payload.desCode} - ${payload.desDesc}`,
            formName,
        });
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Designation created successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        // Refresh the designation list
        await fetchDesignationData();
      }

      // Close modal and reset form
      setShowCreateModal(false);
      setCode("");
      setCodeError("");
      setDescription("");
      setJobLevelCode("");
      setDeviceName("");
      setDesignationId(null);
      setIsEditMode(false);
      setSelectedDesignationIndex(null);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || error.message || "An error occurred";
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMsg,
      });
      console.error("Error submitting form:", error);
    } finally {
      setSubmitting(false);
    }
  };
  const handleJobLevelSelect = (empCode: string, name: string) => {
    setJobLevelCode(empCode);
    setShowJobLevelModal(false);
  };

  const handleDeviceNameSelect = (deviceID: string, deviceName: string) => {
    setDeviceName(deviceName);
    setShowDeviceNameModal(false);
  };
  const filteredDesignations = designationList.filter(
    (designation) =>
      designation.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      designation.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      designation.jobLevelCode
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      designation.deviceName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredJobLevels = levelList.filter(
    (jobLevel) =>
      jobLevel.code.toLowerCase().includes(jobLevelSearchTerm.toLowerCase()) ||
      jobLevel.description
        .toLowerCase()
        .includes(jobLevelSearchTerm.toLowerCase()),
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredDesignations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDesignations = filteredDesignations.slice(
    startIndex,
    endIndex,
  );

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
            <h1 className="text-white">Designation Setup</h1>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
            {/* Information Frame */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
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
                    Configure employee designation codes and descriptions for
                    job positions, linking them to job level classifications and
                    device assignments for comprehensive employee role
                    management.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Designation code management
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Job level code assignment
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Position description tracking
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Device name configuration
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-4 mb-6">
              {hasPermission("Add") && hasPermission("View") && (
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                  onClick={handleCreateNew}
                >
                  <Plus className="w-4 h-4" />
                  Create New
                </button>
              )}
              {hasPermission("View") && (
                <div className="ml-auto flex items-center gap-2">
                  <label className="text-gray-700">Search:</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>
              )}
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              {loadingDesignation ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-600 text-sm">
                    Loading designations...
                  </div>
                </div>
              ) : designationError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 text-sm">{designationError}</p>
                </div>
              ) : hasPermission("View") ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-4 py-2 text-left text-gray-700">
                        Code ▲
                      </th>
                      <th className="px-4 py-2 text-left text-gray-700">
                        Description
                      </th>
                      <th className="px-4 py-2 text-left text-gray-700">
                        Job Level Code
                      </th>
                      <th className="px-4 py-2 text-left text-gray-700">
                        Device Name
                      </th>

                      {(hasPermission("Edit") || hasPermission("Delete")) && (
                        <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDesignations.map((designation, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-2">{designation.code}</td>
                        <td className="px-4 py-2">{designation.description}</td>
                        <td className="px-4 py-2">
                          {designation.jobLevelCode}
                        </td>
                        <td className="px-4 py-2">{designation.deviceName}</td>

                        {(hasPermission("Edit") || hasPermission("Delete")) && (
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex gap-2">
                              {hasPermission("Edit") && (
                                <button
                                  onClick={() => handleEdit(designation, index)}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                              {hasPermission("Edit") &&
                                hasPermission("Delete") && (
                                  <span className="text-gray-300">|</span>
                                )}
                              {hasPermission("Delete") && (
                                <button
                                  onClick={() => handleDelete(designation)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                  title="Delete"
                                >
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
                <div className="text-center py-10 text-gray-500">
                  You do not have permission to view this list.
                </div>
              )}
            </div>

            {/* Pagination */}
            {hasPermission("View") && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-gray-600">
                  Showing{" "}
                  {filteredDesignations.length === 0 ? 0 : startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredDesignations.length)} of{" "}
                  {filteredDesignations.length} entries
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
              <>
                {/* Modal Dialog */}
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                      <h2 className="text-gray-800">
                        {isEditMode ? "Edit Designation" : "Create New"}
                      </h2>
                      <button
                        onClick={() => setShowCreateModal(false)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-4">
                      <h3 className="text-blue-600 mb-3">Designation Setup</h3>

                      {/* Form Fields */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <label className="w-36 text-gray-700 text-sm">
                            Code :
                          </label>
                          <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="w-36 text-gray-700 text-sm">
                            Description :
                          </label>
                          <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="w-36 text-gray-700 text-sm">
                            Job Level Code :
                          </label>
                          <input
                            type="text"
                            value={jobLevelCode}
                            onChange={(e) => setJobLevelCode(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            readOnly
                          />
                          <button
                            onClick={() => setShowJobLevelModal(true)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setJobLevelCode("")}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="w-36 text-gray-700 text-sm">
                            Device Name :
                          </label>
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
                            onClick={() => setDeviceName("")}
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
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
                        >
                          {isEditMode ? "Update" : "Submit"}
                        </button>
                        <button
                          onClick={() => setShowCreateModal(false)}
                          className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
                        >
                          Back to List
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Job Level Search Modal */}
            {showJobLevelModal && (
              <>
                {/* Modal Backdrop */}
                <div
                  className="fixed inset-0 bg-black/30 z-30"
                  onClick={() => setShowJobLevelModal(false)}
                ></div>

                {/* Modal Dialog */}
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[110vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                      <h2 className="text-gray-800">Search</h2>
                      <button
                        onClick={() => setShowJobLevelModal(false)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-4 flex-1 overflow-y-auto">
                      <h3 className="text-blue-600 mb-3">Job Level Code</h3>

                      {/* Search Field */}
                      <div className="flex items-center gap-2 mb-4">
                        <label className="text-gray-700 text-sm">Search:</label>
                        <input
                          type="text"
                          value={jobLevelSearchTerm}
                          onChange={(e) =>
                            setJobLevelSearchTerm(e.target.value)
                          }
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      {/* Job Level Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100 border-b-2 border-gray-300">
                              <th className="px-4 py-2 text-left text-gray-700 text-sm">
                                Code ▲
                              </th>
                              <th className="px-4 py-2 text-left text-gray-700 text-sm">
                                Description
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredJobLevels.map((jobLevel, index) => (
                              <tr
                                key={index}
                                onClick={() =>
                                  handleJobLevelSelect(
                                    jobLevel.code,
                                    jobLevel.description,
                                  )
                                }
                                className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                              >
                                <td className="px-4 py-2 text-sm">
                                  {jobLevel.code}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  {jobLevel.description}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Info */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-gray-600 text-sm">
                          Showing 1 to {filteredJobLevels.length} of{" "}
                          {filteredJobLevels.length} entries
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-sm">
                            Previous
                          </button>
                          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                            1
                          </button>
                          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-sm">
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

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

      {/* Footer */}
      <Footer />
    </div>
  );
}
