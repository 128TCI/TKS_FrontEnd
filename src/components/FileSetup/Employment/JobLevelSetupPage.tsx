import { useState, useEffect } from "react";
import { X, Search, Plus, Check, Edit, Trash2 } from "lucide-react";
import apiClient from "../../../services/apiClient";
import auditTrail from '../../../services/auditTrail';
import { Footer } from "../../Footer/Footer";
import { EmployeeSearchModal } from "../../Modals/EmployeeSearchModal";
import { DeviceSearchModal } from "../../Modals/DeviceSearchModal";
import Swal from "sweetalert2";
import { decryptData } from "../../../services/encryptionService";
  // Form Name
  const formName = 'Job Level SetUp';
export function JobLevelSetupPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedLevelIndex, setSelectedLevelIndex] = useState<number | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // Form fields
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [description, setDescription] = useState("");
  const [jobLevelId, setJobLevelId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Job Level List states
  const [levelList, setLevelList] = useState<
    Array<{ id: string; code: string; description: string }>
  >([]);
  const [loadingJobLevels, setLoadingJobLevels] = useState(false);
  const [jobLevelError, setJobLevelError] = useState("");

  // Permissions
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const hasPermission = (accessType: string) =>
    permissions[accessType] === true;

  useEffect(() => {
    getJobLevelSetupPermissions();
  }, []);

  const getJobLevelSetupPermissions = () => {
    const rawPayload = localStorage.getItem("loginPayload");
    if (!rawPayload) return;

    try {
      const parsedPayload = JSON.parse(rawPayload);
      const encryptedArray: any[] = parsedPayload.permissions || [];

      const branchEntries = encryptedArray.filter(
        (p) => decryptData(p.formName) === "JobLevelSetup",
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
        const mappedData = response.data.map((joblevel: any) => ({
          id: joblevel.jobLevelID || "",
          code: joblevel.jobLevelCode || "",
          description: joblevel.jobLevelDesc || "",
        }));
        setLevelList(mappedData);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to load job level";
      setJobLevelError(errorMsg);
      console.error("Error fetching job level:", error);
    } finally {
      setLoadingJobLevels(false);
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
    setSelectedLevelIndex(null);
    setJobLevelId(null);
    // Clear form
    setCode("");
    setCodeError("");
    setDescription("");
    setShowCreateModal(true);
  };

  const handleEdit = (joblevel: any, index: number) => {
    setIsEditMode(true);
    setSelectedLevelIndex(index);
    setJobLevelId(joblevel.id || null);
    setCode(joblevel.code);
    setCodeError("");
    setDescription(joblevel.description);
    setShowCreateModal(true);
  };

  const handleDelete = async (joblevel: any) => {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "Confirm Delete",
      text: `Are you sure you want to delete joblevel ${joblevel.code}?`,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (confirmed.isConfirmed) {
      try {
        await apiClient.delete(
          `/Fs/Employment/JobLevelSetUp/${joblevel.divID}`,
        );
        await auditTrail.log({
            accessType: 'Delete',
            trans: `Deleted job level ${joblevel.code}`,
            messages: `Job Level deleted: ${joblevel.code} - ${joblevel.jobLevelDesc}`,
            formName,
        });
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Job Level deleted successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        // Refresh the job level list
        await fetchJobLevelData();
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Failed to delete job level";
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMsg,
        });
        console.error("Error deleting job level:", error);
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
    const isDuplicate = levelList.some((level, index) => {
      // When editing, exclude the current record from duplicate check
      if (isEditMode && selectedLevelIndex === index) {
        return false;
      }
      return level.code.toLowerCase() === code.trim().toLowerCase();
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
        jobLevelID: isEditMode && jobLevelId ? parseInt(jobLevelId) : 0,
        jobLevelCode: code,
        jobLevelDesc: description,
      };

      if (isEditMode && jobLevelId) {
        // Update existing record via PUT
        await apiClient.put(
          `/Fs/Employment/JobLevelSetUp/${jobLevelId}`,
          payload,
        );
        await auditTrail.log({
            accessType: 'Edit',
            trans: `Edited job level ${payload.jobLevelCode}`,
            messages: `Job Level updated: ${payload.jobLevelCode} - ${payload.jobLevelDesc}`,
            formName,
        });       
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Job Level updated successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        // Refresh the job level list
        await fetchJobLevelData();
      } else {
        // Create new record via POST
        await apiClient.post("/Fs/Employment/JobLevelSetUp", payload);
        await auditTrail.log({
            accessType: 'Add',
            trans: `Added job level ${payload.jobLevelCode}`,
            messages: `Job Level created: ${payload.jobLevelCode} - ${payload.jobLevelDesc}`,
            formName,
        });
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Job Level created successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        // Refresh the job level list
        await fetchJobLevelData();
      }

      // Close modal and reset form
      setShowCreateModal(false);
      setCode("");
      setCodeError("");
      setDescription("");
      setJobLevelId(null);
      setIsEditMode(false);
      setSelectedLevelIndex(null);
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

  const filteredLevels = levelList.filter(
    (level) =>
      level.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      level.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  // Pagination logic
  const totalPages = Math.ceil(filteredLevels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLevels = filteredLevels.slice(startIndex, endIndex);

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
            <h1 className="text-white">Job Level Setup</h1>
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
                    Define job level classifications for organizational
                    hierarchy management including staff levels, managerial
                    positions, and executive roles for effective workforce
                    structure.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Job level code management
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Position level description
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Hierarchy classification system
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Organizational level tracking
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
              {loadingJobLevels ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-600 text-sm">
                    Loading job levels...
                  </div>
                </div>
              ) : jobLevelError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 text-sm">{jobLevelError}</p>
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

                      {(hasPermission("Edit") || hasPermission("Delete")) && (
                        <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLevels.map((level, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-2">{level.code}</td>
                        <td className="px-4 py-2">{level.description}</td>
                        {(hasPermission("Edit") || hasPermission("Delete")) && (
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex gap-2">
                              {hasPermission("Edit") && (
                                <button
                                  onClick={() => handleEdit(level, index)}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                              {(hasPermission("Edit") ||
                                hasPermission("Delete")) && (
                                <span className="text-gray-300">|</span>
                              )}
                              {hasPermission("Delete") && (
                                <button
                                  onClick={() => handleDelete(level.code)}
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
                  Showing {filteredLevels.length === 0 ? 0 : startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredLevels.length)} of{" "}
                  {filteredLevels.length} entries
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
                    <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                      <h2 className="text-gray-800">
                        {isEditMode ? "Edit Job Level" : "Create New"}
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
                      <h3 className="text-blue-600 mb-3">Job Level Setup</h3>

                      {/* Form Fields */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">
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
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
