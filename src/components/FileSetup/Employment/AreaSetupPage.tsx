import { useState, useEffect } from "react";
import { X, Search, Plus, Check, ArrowLeft, Edit, Trash2 } from "lucide-react";
import apiClient from "../../../services/apiClient";
import auditTrail from '../../../services/auditTrail'; 
import { Footer } from "../../Footer/Footer";
import { EmployeeSearchModal } from "../../Modals/EmployeeSearchModal";
import { DeviceSearchModal } from "../../Modals/DeviceSearchModal";
import Swal from "sweetalert2";
import { decryptData } from "../../../services/encryptionService";

const formName = 'Area SetUp';
export function AreaSetupPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAreaIndex, setSelectedAreaIndex] = useState<number | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // Form fields
  const [areaCode, setAreaCode] = useState("");
  const [areaCodeError, setAreaCodeError] = useState("");
  const [description, setDescription] = useState("");
  const [headCode, setHeadCode] = useState("");
  const [head, setHead] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [areaId, setAreaId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal state
  const [showHeadCodeModal, setShowHeadCodeModal] = useState(false);
  const [showDeviceNameModal, setShowDeviceNameModal] = useState(false);

  // API Data states
  const [employeeData, setEmployeeData] = useState<
    Array<{ empCode: string; name: string; groupCode: string }>
  >([]);
  const [deviceData, setDeviceData] = useState<
    Array<{ id: number; code: string; description: string }>
  >([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [employeeError, setEmployeeError] = useState("");
  const [deviceError, setDeviceError] = useState("");

  // Area List states
  const [areaList, setAreaList] = useState<
    Array<{
      id: string;
      code: string;
      description: string;
      head: string;
      headCode: string;
      deviceName: string;
    }>
  >([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [areaError, setAreaError] = useState("");

  // Permissions
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const hasPermission = (accessType: string) =>
    permissions[accessType] === true;

  useEffect(() => {
    getAreaSetupPermissions();
  }, []);

  const getAreaSetupPermissions = () => {
    const rawPayload = localStorage.getItem("loginPayload");
    if (!rawPayload) return;

    try {
      const parsedPayload = JSON.parse(rawPayload);
      const encryptedArray: any[] = parsedPayload.permissions || [];

      const branchEntries = encryptedArray.filter(
        (p) => decryptData(p.formName) === "AreaSetUp",
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

  // Fetch area data from API
  useEffect(() => {
    fetchAreaData();
    fetchEmployeeData();
    fetchDeviceData();
  }, []);

  const fetchAreaData = async () => {
    setLoadingAreas(true);
    setAreaError("");
    try {
      const response = await apiClient.get("/Fs/EmploymentAreaSetUp");
      if (response.status === 200 && response.data) {
        // Map API response to expected format
        const mappedData = response.data.map((area: any) => ({
          id: area.id || area.ID || "",
          code: area.areaCode || area.AreaCode || "",
          description: area.areaDesc || area.AreaDesc || "",
          head: area.head || area.Head || "",
          headCode: area.headCode || area.HeadCode || "",
          deviceName: area.deviceName || area.DeviceName || "",
        }));
        setAreaList(mappedData);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to load areas";
      setAreaError(errorMsg);
      console.error("Error fetching areas:", error);
    } finally {
      setLoadingAreas(false);
    }
  };

  const fetchEmployeeData = async () => {
    setLoadingEmployees(true);
    setEmployeeError("");
    try {
      const response = await apiClient.get("/Maintenance/EmployeeMasterFile");
      if (response.status === 200 && response.data) {
        // Map API response to expected format
        const mappedData = response.data.map((emp: any) => ({
          empCode: emp.empCode || emp.code || "",
          name: `${emp.lName || ""}, ${emp.fName || ""} ${emp.mName || ""}`.trim(),
          groupCode: emp.grpCode || "",
        }));
        setEmployeeData(mappedData);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to load employees";
      setEmployeeError(errorMsg);
      console.error("Error fetching employees:", error);
    } finally {
      setLoadingEmployees(false);
    }
  };

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
    setSelectedAreaIndex(null);
    setAreaId(null);
    // Clear form
    setAreaCode("");
    setAreaCodeError("");
    setDescription("");
    setHeadCode("");
    setHead("");
    setDeviceName("");
    setShowCreateModal(true);
  };

  const handleEdit = (area: any, index: number) => {
    setIsEditMode(true);
    setSelectedAreaIndex(index);
    setAreaId(area.id || null);
    setAreaCode(area.code);
    setAreaCodeError("");
    setDescription(area.description);
    setHeadCode(area.headCode);
    setHead(area.head);
    setDeviceName(area.deviceName);
    setShowCreateModal(true);
  };

  const handleDelete = async (area: any) => {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "Confirm Delete",
      text: `Are you sure you want to delete area ${area.code}?`,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (confirmed.isConfirmed) {
      try {
        await apiClient.delete(`/Fs/EmploymentAreaSetUp/${area.id}`);
        await auditTrail.log({
            accessType: 'Delete',
            trans: `Deleted area ${area.areaCode}`,
            messages: `Area deleted: ${area.areaCode} - ${area.areaDesc}`,
            formName,
        });
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Area deleted successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        // Refresh the area list
        await fetchAreaData();
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Failed to delete area";
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMsg,
        });
        console.error("Error deleting area:", error);
      }
    }
  };

  const handleAreaCodeChange = (value: string) => {
    setAreaCode(value);
    if (value.length > 10) {
      setAreaCodeError("Area Code maximum 10 characters");
    } else {
      setAreaCodeError("");
    }
  };

  const handleSubmit = async () => {
    // Validate area code - must not be empty and must be max 10 characters
    if (!areaCode.trim() || areaCode.length > 10) {
      await Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Area Code must be between 1 and 10 characters.",
      });
      return;
    }
    // Check for duplicate code (only when creating new or changing code during edit)
    const isDuplicate = areaList.some((area, index) => {
      // When editing, exclude the current record from duplicate check
      if (isEditMode && selectedAreaIndex === index) {
        return false;
      }
      return area.code.toLowerCase() === areaCode.trim().toLowerCase();
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
        id: isEditMode && areaId ? parseInt(areaId) : 0,
        areaCode: areaCode,
        areaDesc: description,
        head: head,
        headCode: headCode,
        deviceName: deviceName,
      };

      if (isEditMode && areaId) {
        // Update existing record via PUT
        await apiClient.put(`/Fs/EmploymentAreaSetUp/${areaId}`, payload);
        await auditTrail.log({
            accessType: 'Edit',
            trans: `Edited area ${payload.areaCode}`,
            messages: `Area updated: ${payload.areaCode} - ${payload.areaDesc}`,
            formName,
        });
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Area updated successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        // Refresh the area list
        await fetchAreaData();
      } else {
        // Create new record via POST
        await apiClient.post("/Fs/EmploymentAreaSetUp", payload);
        await auditTrail.log({
            accessType: 'Add',
            trans: `Added area ${payload.areaCode}`,
            messages: `Area created: ${payload.areaCode} - ${payload.areaDesc}`,
            formName,
        });
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Area created successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        // Refresh the area list
        await fetchAreaData();
      }

      // Close modal and reset form
      setShowCreateModal(false);
      setAreaCode("");
      setAreaCodeError("");
      setDescription("");
      setHeadCode("");
      setHead("");
      setDeviceName("");
      setAreaId(null);
      setIsEditMode(false);
      setSelectedAreaIndex(null);
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

  const handleHeadCodeSelect = (empCode: string, name: string) => {
    setHeadCode(empCode);
    setHead(name);
    setShowHeadCodeModal(false);
  };

  const handleDeviceNameSelect = (deviceID: string, deviceName: string) => {
    setDeviceName(deviceName);
    setShowDeviceNameModal(false);
  };

  const filteredAreas = areaList.filter(
    (area) =>
      area.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.head.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.deviceName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredAreas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAreas = filteredAreas.slice(startIndex, endIndex);

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
            <h1 className="text-white">Area Setup</h1>
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
                    Configure organizational areas with department heads and
                    device assignments for efficient workforce management and
                    time tracking across different locations.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Area code and description management
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Department head assignment
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
                        Centralized area tracking
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-4 mb-6">
              {(hasPermission("Add") || hasPermission("View")) && (
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
              {loadingAreas ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-600 text-sm">Loading areas...</div>
                </div>
              ) : areaError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 text-sm">{areaError}</p>
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
                        Head
                      </th>
                      <th className="px-4 py-2 text-left text-gray-700">
                        Device Name
                      </th>
                      {(hasPermission("Edit") || hasPermission("View")) && (
                        <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAreas.map((area, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-2">{area.code}</td>
                        <td className="px-4 py-2">{area.description}</td>
                        <td className="px-4 py-2">{area.head}</td>
                        <td className="px-4 py-2">{area.deviceName}</td>
                        {(hasPermission("Edit") || hasPermission("Delete")) && (
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex gap-2">
                              {hasPermission("Edit") && (
                                <button
                                  onClick={() => handleEdit(area, index)}
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
                                  onClick={() => handleDelete(area)}
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
                  Showing {filteredAreas.length === 0 ? 0 : startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredAreas.length)} of{" "}
                  {filteredAreas.length} entries
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
                      <h2 className="text-gray-800">
                        {isEditMode ? "Edit Area" : "Create New"}
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
                      <h3 className="text-blue-600 mb-3">Area Setup</h3>

                      {/* Form Fields */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">
                            Area Code :
                          </label>
                          <input
                            type="text"
                            value={areaCode}
                            onChange={(e) =>
                              handleAreaCodeChange(e.target.value)
                            }
                            maxLength={10}
                            className={`flex-1 px-3 py-1.5 border rounded focus:outline-none focus:ring-2 text-sm ${
                              areaCodeError
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:ring-blue-500"
                            }`}
                          />
                        </div>
                        {areaCodeError && (
                          <p className="ml-32 text-red-500 text-xs mt-1">
                            {areaCodeError}
                          </p>
                        )}

                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">
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
                          <label className="w-32 text-gray-700 text-sm">
                            Head Code :
                          </label>
                          <input
                            type="text"
                            value={headCode}
                            maxLength={10}
                            onChange={(e) => setHeadCode(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            readOnly
                          />
                          <button
                            onClick={() => setShowHeadCodeModal(true)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setHeadCode("");
                              setHead("");
                            }}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">
                            Head :
                          </label>
                          <input
                            type="text"
                            value={head}
                            readOnly
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded bg-gray-50 text-sm"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">
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
                          disabled={submitting}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm"
                        >
                          {submitting
                            ? "Saving..."
                            : isEditMode
                              ? "Update"
                              : "Submit"}
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
              isOpen={showHeadCodeModal}
              onClose={() => setShowHeadCodeModal(false)}
              onSelect={handleHeadCodeSelect}
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