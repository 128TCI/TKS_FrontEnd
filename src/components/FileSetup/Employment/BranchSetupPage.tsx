import { useState, useEffect } from "react";
import { X, Search, Plus, Check, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Footer } from "../../Footer/Footer";
import { EmployeeSearchModal } from "../../Modals/EmployeeSearchModal";
import { DeviceSearchModal } from "../../Modals/DeviceSearchModal";
import apiClient from "../../../services/apiClient";
import auditTrail from '../../../services/auditTrail';
import Swal from "sweetalert2";
import { decryptData } from "../../../services/encryptionService";
import { fetchEmployees } from "../../../services/employeeService";

// Form Name
const formName = 'Branch SetUp';

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
        (p) => decryptData(p.formName) === "BranchSetup",
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
          id: branch.braID || branch.id || "",
          branchId: branch.braID || branch.id || "",
          code: branch.braCode || branch.code || "",
          description: branch.braDesc || branch.description || "",
          branchManager: branch.braMngr || branch.branchManager || "",
          branchManagerCode: branch.braMngrCode || "",
          deviceName: branch.deviceName || branch.DeviceName || "",
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

// ── Fetch group descriptions for lookup ──────────────────────────────────────
const fetchGroupDescriptions = async (): Promise<Map<string, string>> => {
  try {
    const { data } = await apiClient.get('/Fs/Process/TimeKeepGroupSetUp');
    const groups: { groupCode: string; groupDescription: string }[] = data ?? [];
    return new Map(groups.map((g) => [String(g.groupCode), g.groupDescription]));
  } catch {
    return new Map();
  }
};

// ── Fetch employees and map grpCode → groupDescription ───────────────────────
const fetchEmployeeData = async () => {
  setLoadingEmployees(true);
  setEmployeeError('');
  try {
    const [{ employees }, groupMap] = await Promise.all([
      fetchEmployees(),
      fetchGroupDescriptions(),
    ]);

    setEmployeeData(employees.map((emp) => ({
      empCode: emp.empCode || '',
      name: `${emp.lName || ''}, ${emp.fName || ''} ${emp.mName || ''}`.trim(),
      groupCode: groupMap.get(String(emp.grpCode)) || String(emp.grpCode || '') || '',
    })));
  } catch (error: any) {
    setEmployeeError(error.response?.data?.message || error.message || 'Failed to load employees');
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
        const mappedData = response.data.map((device: any) => ({
          id: device.id || "",
          code: device.code || "",
          description: device.description || "",
        }));
        setDeviceData(mappedData);
      }
    } catch (error: any) {
      setDeviceError("Failed to load devices");
    } finally {
      setLoadingDevices(false);
    }
  };

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showCreateModal) setShowCreateModal(false);
    };
    if (showCreateModal) document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [showCreateModal]);

  // ─── Company Info Validation (HRIS / Payroll Path) ───────────────────────────
  /**
   * Fetches company information and checks whether HRIS or Payroll paths are
   * configured. Returns true when the transaction is allowed to proceed.
   */
  const validateCompanyPaths = async (): Promise<boolean> => {
    try {
      const response = await apiClient.get("/Fs/System/CompanyInformation");
      const companyInfo =
        Array.isArray(response.data) ? response.data[0] : response.data;

      if (!companyInfo) {
        await Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Company Information is not properly set.",
        });
        return false;
      }

      const hrisPath = (companyInfo.hrisPath ?? "").trim();
      const payrollPath = (companyInfo.payrollPath ?? "").trim();

      if (hrisPath !== "") {
        await Swal.fire({
          icon: "error",
          title: "Not Allowed",
          text: "You are connected to HRIS. you are not allowed to do any transaction for this setup.",
        });
        return false;
      }

      if (payrollPath !== "") {
        await Swal.fire({
          icon: "error",
          title: "Not Allowed",
          text: "You are connected to Payroll. you are not allowed to do any transaction for this setup.",
        });
        return false;
      }

      return true;
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to retrieve company information.",
      });
      return false;
    }
  };
  // ─────────────────────────────────────────────────────────────────────────────

  const handleCreateNew = () => {
    setIsEditMode(false);
    setSelectedBranchIndex(null);
    setBranchId(null);
    setCode("");
    setDescription("");
    setBranchManagerCode("");
    setBranchManager("");
    setDeviceName("");
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
    // ── 1. HRIS / Payroll path check ────────────────────────────────────
    const companyPathsValid = await validateCompanyPaths();
    if (!companyPathsValid) return;

    // ── 2. Confirm deletion ──────────────────────────────────────────────
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "Confirm Delete",
      text: `Are you sure you want to delete branch ${branch.code}?`,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!confirmed.isConfirmed) return;

    // ── 3. Check if branch is used in Employee Masterfile ────────────────
    try {
      const empResponse = await apiClient.get('/Maintenance/EmployeeMasterFile');
      const employees: any[] = Array.isArray(empResponse.data)
        ? empResponse.data
        : [];

      const isUsedInMasterfile = employees.some(
        (emp: any) =>
          (emp.braCode ?? "").trim().toUpperCase() ===
          (branch.code ?? "").trim().toUpperCase(),
      );

      if (isUsedInMasterfile) {
        await Swal.fire({
          icon: "error",
          title: "Cannot Delete",
          text: "This setup is already used in Employee Masterfile.",
        });
        return;
      }
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to validate branch usage.",
      });
      return;
    }

    // ── 4. Proceed with deletion ─────────────────────────────────────────
    try {
      await apiClient.delete(`/Fs/Employment/BranchSetUp/${branch.id}`);
      await auditTrail.log({
        accessType: 'Delete',
        trans: `Deleted branch ${branch.code}`,
        messages: `Branch deleted: ${branch.code} - ${branch.description}`,
        formName,
      });
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Branch deleted successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
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
  };

  const handleSubmit = async () => {
    // ── 1. Basic required-field check ────────────────────────────────────
    if (!code.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter a Code.",
      });
      return;
    }

    // ── 2. HRIS / Payroll path check (applies to both Create and Edit) ───
    const companyPathsValid = await validateCompanyPaths();
    if (!companyPathsValid) return;

    // ── 3. Duplicate code check ──────────────────────────────────────────
    const isDuplicateCode = branchList.some((branch, index) => {
      if (isEditMode && selectedBranchIndex === index) return false;
      return branch.code.trim().toUpperCase() === code.trim().toUpperCase();
    });

    if (isDuplicateCode) {
      await Swal.fire({
        icon: "error",
        title: "Duplicate Code",
        text: "Code is already exist.",
      });
      return;
    }

    // ── 4. Duplicate description check ──────────────────────────────────
    const isDuplicateDesc = branchList.some((branch, index) => {
      if (isEditMode && selectedBranchIndex === index) return false;
      return (
        (branch.description ?? "").trim().toUpperCase() ===
        description.trim().toUpperCase()
      );
    });

    if (isDuplicateDesc) {
      await Swal.fire({
        icon: "error",
        title: "Duplicate Description",
        text: "Description is already exist.",
      });
      return;
    }

    // ── 5. Duplicate device name check (skip when deviceName is empty) ───
    if (deviceName.trim() !== "") {
      const isDuplicateDevice = branchList.some((branch, index) => {
        if (isEditMode && selectedBranchIndex === index) return false;
        return (
          (branch.deviceName ?? "").trim().toUpperCase() ===
          deviceName.trim().toUpperCase()
        );
      });

      if (isDuplicateDevice) {
        await Swal.fire({
          icon: "error",
          title: "Duplicate Device",
          text: "Device Name is already used.",
        });
        return;
      }
    }

    // ── 6. Submit ────────────────────────────────────────────────────────
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
        await auditTrail.log({
          accessType: 'Edit',
          trans: `Edited branch ${payload.braCode}`,
          messages: `Branch updated: ${payload.braCode} - ${payload.braDesc}`,
          formName,
        });
      } else {
        await apiClient.post('/Fs/Employment/BranchSetUp', payload);
        await auditTrail.log({
          accessType: 'Add',
          trans: `Added branch ${payload.braCode}`,
          messages: `Branch created: ${payload.braCode} - ${payload.braDesc}`,
          formName,
        });
      }
      await Swal.fire({
        icon: "success",
        title: "Success",
        timer: 2000,
        showConfirmButton: false,
      });
      await fetchBranchData();
      setShowCreateModal(false);
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Error", text: "An error occurred" });
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

            {/* Controls Row */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
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
                <div className="flex items-center gap-2 md:ml-auto">
                  <label className="text-gray-700 whitespace-nowrap">
                    Search:
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto border rounded-lg">
              {hasPermission("View") ? (
                <table className="w-full border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-4 py-2 text-left text-gray-700">
                        Code ▲
                      </th>
                      <th className="px-4 py-2 text-left text-gray-700">
                        Description
                      </th>
                      <th className="px-4 py-2 text-left text-gray-700">
                        Branch Manager
                      </th>
                      <th className="px-4 py-2 text-left text-gray-700">
                        Device Name
                      </th>
                      {(hasPermission("Edit") || hasPermission("Delete")) && (
                        <th className="px-4 py-2 text-left text-gray-700">
                          Actions
                        </th>
                      )}
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
                        {(hasPermission("Edit") || hasPermission("Delete")) && (
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex gap-2">
                              {hasPermission("Edit") && (
                                <button
                                  onClick={() => handleEdit(branch, index)}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
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
                                  onClick={() => handleDelete(branch)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
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
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                <div className="text-gray-600 text-sm">
                  Showing {filteredBranches.length} entries
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">
                    Previous
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded">
                    1
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Modal */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b bg-gray-50 rounded-t-2xl">
                    <h2 className="text-gray-800 text-lg">
                      {isEditMode ? "Edit Branch" : "Create New"}
                    </h2>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-4 md:p-6 overflow-y-auto space-y-4">
                    <h3 className="text-blue-600 font-semibold">
                      Branch Setup
                    </h3>

                    <div className="grid gap-4">
                      {[
                        {
                          label: "Code",
                          value: code,
                          setter: setCode,
                          max: 10,
                        },
                        {
                          label: "Description",
                          value: description,
                          setter: setDescription,
                        },
                      ].map((field) => (
                        <div
                          key={field.label}
                          className="flex flex-col sm:flex-row sm:items-center gap-2"
                        >
                          <label className="sm:w-40 text-gray-700 text-sm">
                            {field.label} :
                          </label>
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
                        <label className="sm:w-40 text-gray-700 text-sm">
                          Manager Code :
                        </label>
                        <div className="flex-1 flex gap-2">
                          <input
                            readOnly
                            value={branchManagerCode}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
                          />
                          <button
                            onClick={() => setShowBranchManagerModal(true)}
                            className="p-2 bg-green-600 text-white rounded-lg"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setBranchManager("");
                              setBranchManagerCode("");
                            }}
                            className="p-2 bg-red-600 text-white rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-40 text-gray-700 text-sm">
                          Manager Name :
                        </label>
                        <input
                          readOnly
                          value={branchManager}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
                        />
                      </div>

                      {/* Device Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-40 text-gray-700 text-sm">
                          Device Name :
                        </label>
                        <div className="flex-1 flex gap-2">
                          <input
                            readOnly
                            value={deviceName}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
                          />
                          <button
                            onClick={() => setShowDeviceNameModal(true)}
                            className="p-2 bg-green-600 text-white rounded-lg"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeviceName("")}
                            className="p-2 bg-red-600 text-white rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
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
                        {submitting
                          ? "Processing..."
                          : isEditMode
                            ? "Update"
                            : "Submit"}
                      </button>
                      <button
                        onClick={() => setShowCreateModal(false)}
                        disabled={submitting}
                        className="flex-1 min-w-[120px] px-6 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 text-sm"
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