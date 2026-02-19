import { useState, useEffect } from "react";
import { X, Search, Plus, Check, Edit, Trash2 } from "lucide-react";
import apiClient from "../../../services/apiClient";
import auditTrail from '../../../services/auditTrail';
import { Footer } from "../../Footer/Footer";
import { EmployeeSearchModal } from "../../Modals/EmployeeSearchModal";
import { DeviceSearchModal } from "../../Modals/DeviceSearchModal";
import Swal from "sweetalert2";
import { decryptData } from "../../../services/encryptionService";

export function PayHouseSetupPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPayHouseIndex, setSelectedPayHouseIndex] = useState<
    number | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // Form fields
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [description, setDescription] = useState("");
  const [headCode, setHeadCode] = useState("");
  const [head, setHead] = useState("");
  const [position, setPosition] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [payHouseId, setPayHouseId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal state
  const [showHeadModal, setShowHeadModal] = useState(false);
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

  // Permissions
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const hasPermission = (accessType: string) =>
    permissions[accessType] === true;
    
  // Form Name
  const formName = 'Pay House Setup';
    
  useEffect(() => {
    getPayHouseSetupPermissions();
  }, []);

  const getPayHouseSetupPermissions = () => {
    const rawPayload = localStorage.getItem("loginPayload");
    if (!rawPayload) return;

    try {
      const parsedPayload = JSON.parse(rawPayload);
      const encryptedArray: any[] = parsedPayload.permissions || [];

      const branchEntries = encryptedArray.filter(
        (p) => decryptData(p.formName) === "LineSetUp",
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

  // Pay House List states
  const [payHouseList, setPayHouseList] = useState<
    Array<{
      id: string;
      code: string;
      description: string;
      head: string;
      headCode: string;
      position: string;
      deviceName: string;
    }>
  >([]);
  const [loadingPayHouses, setLoadingPayHouses] = useState(false);
  const [payHouseError, setPayHouseError] = useState("");

  // Fetch pay house data from API
  useEffect(() => {
    fetchPayHouseData();
  }, []);

  const fetchPayHouseData = async () => {
    setLoadingPayHouses(true);
    setPayHouseError("");
    try {
      const response = await apiClient.get("/Fs/Employment/PayHouseSetUp");
      if (response.status === 200 && response.data) {
        // Map API response to expected format
        const mappedData = response.data.map((payHouse: any) => ({
          id: payHouse.lineID || "",
          code: payHouse.lineCode || "",
          description: payHouse.lineDesc || "",
          head: payHouse.head || "",
          headCode: payHouse.headCode || "",
          position: payHouse.position || "",
          deviceName: payHouse.deviceName || "",
        }));
        setPayHouseList(mappedData);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to load pay houses";
      setPayHouseError(errorMsg);
      console.error("Error fetching pay houses:", error);
    } finally {
      setLoadingPayHouses(false);
    }
  };

  // Fetch employee data from API
  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    setLoadingEmployees(true);
    setEmployeeError("");
    try {
      const response = await apiClient.get('/Maintenance/EmployeeMasterFile');
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
    setSelectedPayHouseIndex(null);
    setPayHouseId(null);
    // Clear form
    setCode("");
    setCodeError("");
    setDescription("");
    setHeadCode("");
    setHead("");
    setPosition("");
    setDeviceName("");
    setShowCreateModal(true);
  };

  const handleEdit = (payHouse: any, index: number) => {
    setIsEditMode(true);
    setSelectedPayHouseIndex(index);
    setPayHouseId(payHouse.id || null);
    setCode(payHouse.code);
    setCodeError("");
    setDescription(payHouse.description);
    setHeadCode(payHouse.headCode);
    setHead(payHouse.head);
    setPosition(payHouse.position);
    setDeviceName(payHouse.deviceName);
    setShowCreateModal(true);
  };

  const handleDelete = async (payHouse: any) => {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "Confirm Delete",
      text: `Are you sure you want to delete pay house ${payHouse.code}?`,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (confirmed.isConfirmed) {
      try {
        await apiClient.delete(`/Fs/Employment/PayHouseSetUp/${payHouse.id}`);
        await auditTrail.log({
            accessType: 'Delete',
            trans: `Deleted pay house ${payHouse.code}`,
            messages: `Pay house deleted: ${payHouse.code} - ${payHouse.lineDesc}`,
            formName,
        });
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Pay house deleted successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        // Refresh the pay house list
        await fetchPayHouseData();
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Failed to delete pay house";
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMsg,
        });
        console.error("Error deleting pay house:", error);
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
    const isDuplicate = payHouseList.some((payHouse, index) => {
      // When editing, exclude the current record from duplicate check
      if (isEditMode && selectedPayHouseIndex === index) {
        return false;
      }
      return payHouse.code.toLowerCase() === code.trim().toLowerCase();
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
        lineID: isEditMode && payHouseId ? parseInt(payHouseId) : 0,
        lineCode: code,
        lineDesc: description,
        head: head,
        headCode: headCode,
        position: position,
        deviceName: deviceName,
      };

      if (isEditMode && payHouseId) {
        // Update existing record via PUT
        await apiClient.put(
          `/Fs/Employment/PayHouseSetUp/${payHouseId}`,
          payload,
        );
        await auditTrail.log({
            accessType: 'Edit',
            trans: `Edited pay house ${payload.lineCode}`,
            messages: `Pay house updated: ${payload.lineCode} - ${payload.lineDesc}`,
            formName,
        });
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Pay house updated successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        // Refresh the pay house list
        await fetchPayHouseData();
      } else {
        // Create new record via POST
        await apiClient.post("/Fs/Employment/PayHouseSetUp", payload);
        await auditTrail.log({
            accessType: 'Add',
            trans: `Added pay house ${payload.lineCode}`,
            messages: `Pay house created: ${payload.lineCode} - ${payload.lineDesc}`,
            formName,
        });
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Pay house created successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        // Refresh the pay house list
        await fetchPayHouseData();
      }

      // Close modal and reset form
      setShowCreateModal(false);
      setCode("");
      setCodeError("");
      setDescription("");
      setHeadCode("");
      setHead("");
      setPosition("");
      setDeviceName("");
      setPayHouseId(null);
      setIsEditMode(false);
      setSelectedPayHouseIndex(null);
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

  const handleHeadSelect = (empCode: string, name: string) => {
    setHeadCode(empCode);
    setHead(name);
    setShowHeadModal(false);
  };

  const handleDeviceNameSelect = (deviceID: string, deviceName: string) => {
    setDeviceName(deviceName);
    setShowDeviceNameModal(false);
  };

  const filteredPayHouses = payHouseList.filter(
    (payHouse) =>
      payHouse.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payHouse.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payHouse.head.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payHouse.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payHouse.deviceName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredPayHouses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayHouses = filteredPayHouses.slice(startIndex, endIndex);

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
            <h1 className="text-white">Pay House Setup</h1>
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
                    Manage pay house classifications with assigned heads and
                    device configurations for effective payroll processing and
                    timekeeping management across different payment groups and
                    locations.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Pay house code and description
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Pay house head assignment
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
                        Payroll group organization
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
              {loadingPayHouses ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-600 text-sm">
                    Loading pay houses...
                  </div>
                </div>
              ) : payHouseError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 text-sm">{payHouseError}</p>
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
                        Position
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
                    {paginatedPayHouses.map((payHouse, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-2">{payHouse.code}</td>
                        <td className="px-4 py-2">{payHouse.description}</td>
                        <td className="px-4 py-2">{payHouse.head}</td>
                        <td className="px-4 py-2">{payHouse.position}</td>
                        <td className="px-4 py-2">{payHouse.deviceName}</td>
                        {(hasPermission("Edit") || hasPermission("Delete")) && (
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex gap-2">
                              {hasPermission("Edit") && (
                                <button
                                  onClick={() => handleEdit(payHouse, index)}
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
                                  onClick={() => handleDelete(payHouse)}
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
                  Showing {filteredPayHouses.length === 0 ? 0 : startIndex + 1}{" "}
                  to {Math.min(endIndex, filteredPayHouses.length)} of{" "}
                  {filteredPayHouses.length} entries
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
                        {isEditMode ? "Edit Pay House" : "Create New"}
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
                      <h3 className="text-blue-600 mb-3">Pay House Setup</h3>

                      {/* Form Fields */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">
                            Code :
                          </label>
                          <input
                            type="text"
                            value={code}
                            onChange={(e) => handleCodeChange(e.target.value)}
                            maxLength={10}
                            className={`flex-1 px-3 py-1.5 border rounded focus:outline-none focus:ring-2 text-sm ${
                              codeError
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:ring-blue-500"
                            }`}
                          />
                        </div>
                        {codeError && (
                          <p className="ml-32 text-red-500 text-xs mt-1">
                            {codeError}
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
                            Position :
                          </label>
                          <input
                            type="text"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
              isOpen={showHeadModal}
              onClose={() => setShowHeadModal(false)}
              onSelect={handleHeadSelect}
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

      {/* Footer */}
      <Footer />
    </div>
  );
}
