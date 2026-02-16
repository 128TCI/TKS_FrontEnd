import { useState, useEffect } from "react";
import { X, Search, Plus, Check, Edit, Trash2 } from "lucide-react";
import { Footer } from "../../Footer/Footer";
import { EmployeeSearchModal } from "../../Modals/EmployeeSearchModal";
import { DeviceSearchModal } from "../../Modals/DeviceSearchModal";
import apiClient from "../../../services/apiClient";
import Swal from "sweetalert2";
import { decryptData } from "../../../services/encryptionService";

// Division Search Modal Component
function DivisionSearchModal({
  isOpen,
  onClose,
  onSelect,
  divisions,
  loading,
  error,
}: any) {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredDivisions = divisions.filter(
    (div: any) =>
      div.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      div.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-30" onClick={onClose}></div>
      <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[110vh] overflow-y-auto">
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <h2 className="text-gray-800 text-sm">Search</h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3">
            <h3 className="text-blue-600 mb-2 text-sm">Division Code</h3>

            <div className="flex items-center gap-2 mb-3">
              <label className="text-gray-700 text-sm">Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div
              className="border border-gray-200 rounded"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              <table className="w-full border-collapse text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-3 py-1.5 text-left text-gray-700 text-sm">
                      Code ▲
                    </th>
                    <th className="px-3 py-1.5 text-left text-gray-700 text-sm">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-3 py-8 text-center text-gray-500 text-sm"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-3 py-8 text-center text-red-500 text-sm"
                      >
                        {error}
                      </td>
                    </tr>
                  ) : filteredDivisions.length > 0 ? (
                    filteredDivisions.map((division: any) => (
                      <tr
                        key={division.code}
                        className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                        onClick={() =>
                          onSelect(division.code, division.description)
                        }
                      >
                        <td className="px-3 py-1.5">{division.code}</td>
                        <td className="px-3 py-1.5">{division.description}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-3 py-8 text-center text-gray-500 text-sm"
                      >
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="text-gray-600 text-xs">
                Showing 1 to {filteredDivisions.length} of{" "}
                {filteredDivisions.length} entries
              </div>
              <div className="flex gap-1">
                <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">
                  Previous
                </button>
                <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                  1
                </button>
                <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function DepartmentSetupPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDepartmentIndex, setSelectedDepartmentIndex] = useState<
    number | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Form fields
  const [departmentCode, setDepartmentCode] = useState("");
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [divisionCode, setDivisionCode] = useState("");
  const [departmentHeadCode, setDepartmentHeadCode] = useState("");
  const [departmentHead, setDepartmentHead] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [head1, setHead1] = useState("");
  const [email1, setEmail1] = useState("");
  const [head2, setHead2] = useState("");
  const [email2, setEmail2] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Modal state
  const [showDivisionCodeModal, setShowDivisionCodeModal] = useState(false);
  const [showDepartmentHeadModal, setShowDepartmentHeadModal] = useState(false);
  const [showDeviceNameModal, setShowDeviceNameModal] = useState(false);

  // Department List states
  const [departmentList, setDepartmentList] = useState<Array<any>>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [departmentError, setDepartmentError] = useState("");

  // API Data states
  const [divisionData, setDivisionData] = useState<
    Array<{ code: string; description: string }>
  >([]);
  const [employeeData, setEmployeeData] = useState<
    Array<{ empCode: string; name: string; groupCode: string }>
  >([]);
  const [deviceData, setDeviceData] = useState<
    Array<{ id: number; code: string; description: string }>
  >([]);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [divisionError, setDivisionError] = useState("");
  const [employeeError, setEmployeeError] = useState("");
  const [deviceError, setDeviceError] = useState("");

  // Permissions
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const hasPermission = (accessType: string) =>
    permissions[accessType] === true;

  useEffect(() => {
    getDepartmentSetupPermissions();
  }, []);

  const getDepartmentSetupPermissions = () => {
    const rawPayload = localStorage.getItem("loginPayload");
    if (!rawPayload) return;

    try {
      const parsedPayload = JSON.parse(rawPayload);
      const encryptedArray: any[] = parsedPayload.permissions || [];

      const branchEntries = encryptedArray.filter(
        (p) => decryptData(p.formName) === "DepartmentSetUp",
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

  // Fetch department data from API
  useEffect(() => {
    fetchDepartmentData();
  }, []);

  const fetchDepartmentData = async () => {
    setLoadingDepartments(true);
    setDepartmentError("");
    try {
      const response = await apiClient.get("/Fs/Employment/DepartmentSetUp");
      if (response.status === 200 && response.data) {
        const mappedData = response.data.map((dept: any) => ({
          departmentId: dept.depID || "",
          code: dept.depCode || "",
          departmentCode: dept.depCode || "",
          departmentHeadCode: dept.depHeadCode || "",
          description: dept.depDesc || "",
          divisionCode: dept.divCode || "",
          head: dept.depHead || "",
          deviceName: dept.deviceName || "",
          head1: dept.head1 || "",
          email1: dept.email1 || "",
          head2: dept.head2 || "",
          email2: dept.email2 || "",
        }));
        setDepartmentList(mappedData);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to load departments";
      setDepartmentError(errorMsg);
      console.error("Error fetching departments:", error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  // Fetch division data from API
  useEffect(() => {
    fetchDivisionData();
  }, []);

  const fetchDivisionData = async () => {
    setLoadingDivisions(true);
    setDivisionError("");
    try {
      const response = await apiClient.get("/Fs/Employment/DivisionSetUp");
      if (response.status === 200 && response.data) {
        const mappedData = response.data.map((div: any) => ({
          code: div.divCode || div.code || "",
          description: div.divDesc || div.description || "",
        }));
        setDivisionData(mappedData);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to load divisions";
      setDivisionError(errorMsg);
      console.error("Error fetching divisions:", error);
    } finally {
      setLoadingDivisions(false);
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
    setSelectedDepartmentIndex(null);
    setDepartmentCode("");
    setDescription("");
    setDivisionCode("");
    setDepartmentHeadCode("");
    setDepartmentHead("");
    setDeviceName("");
    setHead1("");
    setEmail1("");
    setHead2("");
    setEmail2("");
    setShowCreateModal(true);
  };

  const handleEdit = (department: any, index: number) => {
    setIsEditMode(true);
    setDepartmentId(department.departmentId);
    setSelectedDepartmentIndex(index);
    setDepartmentCode(department.code);
    setDepartmentHeadCode(department.departmentHeadCode);
    setDescription(department.description);
    setDivisionCode(department.divisionCode);
    setDepartmentHead(department.head);
    setDeviceName(department.deviceName);
    setHead1(department.head1);
    setEmail1(department.email1);
    setHead2(department.head2);
    setEmail2(department.email2);
    setShowCreateModal(true);
  };

  const handleDelete = async (department: any) => {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "Confirm Delete",
      text: `Are you sure you want to delete department ${department.departmentId}?`,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (confirmed.isConfirmed) {
      try {
        await apiClient.delete(
          `/Fs/Employment/DepartmentSetUp/${department.id}`,
        );
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Department deleted successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        await fetchDepartmentData();
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Failed to delete department";
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMsg,
        });
        console.error("Error deleting department:", error);
      }
    }
  };

  const handleSubmit = async () => {
    if (!departmentCode.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter a Department Code.",
      });
      return;
    }
    // Check for duplicate code (only when creating new or changing code during edit)
    const isDuplicate = departmentList.some((department, index) => {
      // When editing, exclude the current record from duplicate check
      if (isEditMode && selectedDepartmentIndex === index) {
        return false;
      }
      return (
        department.code.toLowerCase() === departmentCode.trim().toLowerCase()
      );
    });

    if (isDuplicate) {
      await Swal.fire({
        icon: "error",
        title: "Duplicate Code",
        text: "This code is already in use. Please use a different code.",
      });
      return;
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email1.trim() && !emailRegex.test(email1)) {
      await Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter a valid email address for Email 1.",
      });
      return;
    }

    if (email2.trim() && !emailRegex.test(email2)) {
      await Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter a valid email address for Email 2.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        depID: isEditMode && departmentId ? parseInt(departmentId) : 0,
        depCode: departmentCode,
        depDesc: description,
        divCode: divisionCode || null,
        depHead: departmentHead || null,
        depHeadCode: departmentHeadCode || "",
        deviceName: deviceName || null,
        head1: head1 || null,
        email1: email1 || null,
        head2: head2 || null,
        email2: email2 || null,
      };

      if (isEditMode && selectedDepartmentIndex !== null) {
        await apiClient.put(
          `/Fs/Employment/DepartmentSetUp/${payload.depID}`,
          payload,
        );
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Department updated successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        await fetchDepartmentData();
      } else {
        await apiClient.post("/Fs/Employment/DepartmentSetUp", payload);
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Department created successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        await fetchDepartmentData();
      }

      setShowCreateModal(false);
      setDepartmentCode("");
      setDescription("");
      setDivisionCode("");
      setDepartmentHeadCode("");
      setDepartmentHead("");
      setDeviceName("");
      setHead1("");
      setEmail1("");
      setHead2("");
      setEmail2("");
      setIsEditMode(false);
      setSelectedDepartmentIndex(null);
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

  const handleDivisionCodeSelect = (code: string, desc: string) => {
    setDivisionCode(desc);
    setShowDivisionCodeModal(false);
  };

  const handleDepartmentHeadSelect = (empCode: string, name: string) => {
    setDepartmentHeadCode(empCode);
    setDepartmentHead(name);
    setShowDepartmentHeadModal(false);
  };

  const handleDeviceNameSelect = (deviceID: string, deviceName: string) => {
    setDeviceName(deviceName);
    setShowDeviceNameModal(false);
  };

  const filteredDepartments = departmentList.filter(
    (dept) =>
      dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.divisionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.head.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.head1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.email1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.head2.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.email2.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDepartments = filteredDepartments.slice(startIndex, endIndex);

  // Get visible page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Department Setup</h1>
          </div>

          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
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
                    Configure organizational departments with division
                    assignments, department head information, device
                    configurations, and contact details for effective management
                    and communication across business units.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Department code and description management
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Division and department head assignment
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
                        Contact information and email management
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Rows */}
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

            {/* Department Table */}
            <div className="overflow-x-auto">
              {hasPermission("View") ? (
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
                        Division Code
                      </th>
                      <th className="px-4 py-2 text-left text-gray-700">
                        Head
                      </th>
                      <th className="px-4 py-2 text-left text-gray-700">
                        Device Name
                      </th>
                      <th className="px-4 py-2 text-left text-gray-700">
                        Head 1
                      </th>
                      <th className="px-4 py-2 text-left text-gray-700">
                        Email 1
                      </th>
                      <th className="px-4 py-2 text-left text-gray-700">
                        Head 2
                      </th>
                      <th className="px-4 py-2 text-left text-gray-700">
                        Email 2
                      </th>

                      {(hasPermission("Edit") || hasPermission("Delete")) && (
                        <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedDepartments.map((department, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-2">{department.code}</td>
                        <td className="px-4 py-2">{department.description}</td>
                        <td className="px-4 py-2">{department.divisionCode}</td>
                        <td className="px-4 py-2">{department.head}</td>
                        <td className="px-4 py-2">{department.deviceName}</td>
                        <td className="px-4 py-2">{department.head1}</td>
                        <td className="px-4 py-2">{department.email1}</td>
                        <td className="px-4 py-2">{department.head2}</td>
                        <td className="px-4 py-2">{department.email2}</td>

                        {(hasPermission("Edit") || hasPermission("Delete")) && (
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex gap-2">
                              {hasPermission("Edit") && (
                                <button
                                  onClick={() =>
                                    handleEdit(department, startIndex + index)
                                  }
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
                                  onClick={() => handleDelete(department)}
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
                <div className="text-gray-600 text-sm">
                  Showing{" "}
                  {filteredDepartments.length === 0 ? 0 : startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredDepartments.length)} of{" "}
                  {filteredDepartments.length} entries
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Previous
                  </button>
                  {getPageNumbers().map((page, idx) =>
                    page === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-2 flex items-center text-gray-500 text-sm"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page as number)}
                        className={`px-4 py-2 rounded text-sm font-medium ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
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
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {showCreateModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                  <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                    <h2 className="text-gray-800">
                      {isEditMode ? "Edit Department" : "Create New"}
                    </h2>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-4">
                    <h3 className="text-blue-600 mb-3">Department Setup</h3>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <label className="w-40 text-gray-700 text-sm">
                          Department Code :
                        </label>
                        <input
                          type="text"
                          value={departmentCode}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Limit to 10 characters at HTML level
                            if (value.length <= 10) {
                              setDepartmentCode(value);
                            }
                          }}
                          maxLength={10}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="w-40 text-gray-700 text-sm">
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
                        <label className="w-40 text-gray-700 text-sm">
                          Division Code :
                        </label>
                        <input
                          type="text"
                          value={divisionCode}
                          onChange={(e) => setDivisionCode(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          readOnly
                        />
                        <button
                          onClick={() => setShowDivisionCodeModal(true)}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDivisionCode("")}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="w-40 text-gray-700 text-sm">
                          Department Head Code :
                        </label>
                        <input
                          type="text"
                          value={departmentHeadCode}
                          onChange={(e) =>
                            setDepartmentHeadCode(e.target.value)
                          }
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          readOnly
                        />
                        <button
                          onClick={() => setShowDepartmentHeadModal(true)}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDepartmentHeadCode("");
                            setDepartmentHead("");
                          }}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="w-40 text-gray-700 text-sm">
                          Department Head :
                        </label>
                        <input
                          type="text"
                          value={departmentHead}
                          readOnly
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded bg-gray-50 text-sm"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="w-40 text-gray-700 text-sm">
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

                      <div className="flex items-center gap-3">
                        <label className="w-40 text-gray-700 text-sm">
                          Head 1 :
                        </label>
                        <input
                          type="text"
                          value={head1}
                          onChange={(e) => setHead1(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="w-40 text-gray-700 text-sm">
                          Email 1 :
                        </label>
                        <input
                          type="email"
                          value={email1}
                          onChange={(e) => setEmail1(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="w-40 text-gray-700 text-sm">
                          Head 2 :
                        </label>
                        <input
                          type="text"
                          value={head2}
                          onChange={(e) => setHead2(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="w-40 text-gray-700 text-sm">
                          Email 2 :
                        </label>
                        <input
                          type="email"
                          value={email2}
                          onChange={(e) => setEmail2(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Back to List
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DivisionSearchModal
              isOpen={showDivisionCodeModal}
              onClose={() => setShowDivisionCodeModal(false)}
              onSelect={handleDivisionCodeSelect}
              divisions={divisionData}
              loading={loadingDivisions}
              error={divisionError}
            />

            <EmployeeSearchModal
              isOpen={showDepartmentHeadModal}
              onClose={() => setShowDepartmentHeadModal(false)}
              onSelect={handleDepartmentHeadSelect}
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
