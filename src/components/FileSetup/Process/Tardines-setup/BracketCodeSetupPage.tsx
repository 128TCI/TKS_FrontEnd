import { useState, useEffect } from "react";
import { X, Plus, Check, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Footer } from "../../../Footer/Footer";
import { decryptData } from "../../../../services/encryptionService";
import apiClient from "../../../../services/apiClient";
import auditTrail from '../../../../services/auditTrail';
import Swal from "sweetalert2";

const formName = 'Bracket Code SetUp';
interface BracketCode {
  code: string;
  description: string;
  flag: string;
}

export function BracketCodeSetupPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  

  // Bracket Code List
  const [bracketCodeList, setBracketCodeList] = useState<
    Array<{
      id: string;
      bracketCode: string;
      description: string;
      flag: string;
    }>
  >([]);

  // Form fields
  const [bracketCode, setBracketCode] = useState("");
  const [description, setDescription] = useState("");
  const [flag, setFlag] = useState("ACCUMULATE");
  const [codeBracketError, setCodeError] = useState("");
  const [brackeCodetId, setBracketCodeId] = useState<string | null>(null);

  // Loading & error
  const [loading, setLoadingBracketCode] = useState(false);
  const [error, setBracketCodeError] = useState("");

  // Fetch bracket codes from API
  useEffect(() => {
    fetchBracketCodes();
  }, []);

  const fetchBracketCodes = async () => {
    setLoadingBracketCode(true);
    setBracketCodeError("");
    try {
      const response = await apiClient.get(
        "/Fs/Process/Tardiness/BracketCodeSetup",
      );

      if (response.status === 200 && response.data) {
        // Map API response to expected format
        const mappedData = response.data.map((item: any) => ({
          id: item.id?.toString() || "",
          bracketCode: item.bracketCode || item.code || "",
          description: item.description || item.Description || "",
          flag: flagMapText[item.flag] || "UNKNOWN",
        }));

        setBracketCodeList(mappedData);
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to load bracket codes";
      setBracketCodeError(errorMsg);
      console.error("Error fetching bracket codes:", err);
    } finally {
      setLoadingBracketCode(false);
    }
  };

  const flagOptions = ["TARDINESS", "UNDERTIME", "ACCUMULATE",];

  const flagMap: Record<string, number> = {
    TARDINESS: 1,
    UNDERTIME: 2,
    ACCUMULATE: 3,
  };

  const flagMapText: Record<number, string> = {
    1: "TARDINESS",
    2: "UNDERTIME",
    3: "ACCUMULATE",
  };


  const filteredData = bracketCodeList.filter((item) => {
    const code = String(item.bracketCode ?? "").toLowerCase();
    const desc = String(item.description ?? "").toLowerCase();
    const flg = String(item.flag ?? "").toLowerCase();
    const search = searchQuery.toLowerCase();

    return (
      code.includes(search) || desc.includes(search) || flg.includes(search)
    );
  });

  useEffect(() => {
    fetchBracketCodes();
  }, []);

  // Pagination for main table
  const itemsPerPage = 25;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Permissions
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const hasPermission = (accessType: string) =>
    permissions[accessType] === true;

  useEffect(() => {
    getBracketCodeSetupPermissions();
  }, []);

  const getBracketCodeSetupPermissions = () => {
    const rawPayload = localStorage.getItem("loginPayload");
    if (!rawPayload) return;

    try {
      const parsedPayload = JSON.parse(rawPayload);
      const encryptedArray: any[] = parsedPayload.permissions || [];

      const branchEntries = encryptedArray.filter(
        (p) => decryptData(p.formName) === "BracketCodeSetup",
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

  const handleCreateNew = () => {
    setIsEditMode(false);
    setSelectedIndex(null);
    setBracketCodeId(null);

    // Clear form fields
    setBracketCode("");
    setDescription("");
    setCodeError("");

    setShowCreateModal(true);
  };

  const handleEdit = (item: any, index: number) => {
    setIsEditMode(true);
    setSelectedIndex(index);
    setBracketCodeId(item.id ?? null);

    setBracketCode(item.bracketCode ?? "");
    setDescription(item.description ?? "");
    setFlag(item.flag ?? "ACCUMULATE");
    setCodeError("");

    setShowCreateModal(true);
  };

  const handleDelete = async (item: any) => {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "Confirm Delete",
      text: `Are you sure you want to delete allowance bracket code ${item.bracketCode}?`,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!confirmed.isConfirmed) return;

    try {
      setSubmitting(true);

      await apiClient.delete(
        `/Fs/Process/Tardiness/BracketCodeSetup/${item.id}`,
      );
      await auditTrail.log({
        accessType: "Delete",
        trans: `Deleted allowance bracket code "${item.bracketCode}"`,
        messages: `Allowance bracket "${item.bracketCode}" removed`,
        formName,
      });
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Allowance bracket code deleted successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      await fetchBracketCodes();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete allowance bracket code";

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMsg,
      });

      console.error("Delete error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!bracketCode.trim() || bracketCode.length > 10) {
      setCodeError("Code must be between 1 and 10 characters.");

      await Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Code must be between 1 and 10 characters.",
      });
      return;
    }

    if (!description.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Description is required.",
      });
      return;
    }

    // Duplicate check
    const isDuplicate = bracketCodeList.some((item, index) => {
      if (isEditMode && selectedIndex === index) return false;

      return (
        item.bracketCode.toLowerCase() === bracketCode.trim().toLowerCase()
      );
    });

    if (isDuplicate) {
      await Swal.fire({
        icon: "error",
        title: "Duplicate Code",
        text: "This code is already in use.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        id: isEditMode && brackeCodetId ? parseInt(brackeCodetId) : 0,
        bracketCode: bracketCode.trim(),
        description: description.trim(),
        flag: flagMap[flag],
      };
      console.log(payload);
      if (isEditMode && brackeCodetId) {
        await apiClient.put(
          `/Fs/Process/Tardiness/BracketCodeSetup/${payload.id}`,
          payload,
        );
        await auditTrail.log({
          accessType: "Edit",
          trans: `Updated allowance bracket code "${payload.bracketCode}"`,
          messages: `Allowance bracket "${payload.bracketCode}" updated`,
          formName,
        });
        await Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Allowance bracket code updated successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await apiClient.post("/Fs/Process/Tardiness/BracketCodeSetup", payload);
        await auditTrail.log({
          accessType: "Add",
          trans: `Created allowance bracket code "${payload.bracketCode}"`,
          messages: `Allowance bracket "${payload.bracketCode}" created`,
          formName,
        });
        await Swal.fire({
          icon: "success",
          title: "Created",
          text: "Allowance bracket code created successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
      }

      await fetchBracketCodes();

      // Reset form
      setShowCreateModal(false);
      setBracketCode("");
      setDescription("");
      setCodeError("");
      setBracketCodeId(null);
      setIsEditMode(false);
      setSelectedIndex(null);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMsg,
      });

      console.error("Submit error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle ESC key press to close modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showCreateModal) {
          setShowCreateModal(false);
        }
      }
    };

    if (showCreateModal) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [showCreateModal]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Bracket Code Setup</h1>
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
                    Define bracket codes for tardiness, undertime, and
                    accumulation tracking. Configure how different types of time
                    deductions are categorized and flagged in the system.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Tardiness tracking codes
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Undertime categorization
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Accumulation brackets
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Custom deduction flags
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Row */}
            {hasPermission("View") && (
              <div className="flex items-center gap-4 mb-6">
                {hasPermission("Add") && (
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
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : bracketCodeList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No data available in table
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
                        Flag
                      </th>
                      {(hasPermission("Edit") || hasPermission("Delete")) && (
                        <th className="px-4 py-2 text-center text-gray-700">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((item, index) => {
                      // Calculate the actual index in full bracketData for delete/edit
                      const globalIndex = startIndex + index;

                      return (
                        <tr
                          key={item.bracketCode}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="px-4 py-2">{item.bracketCode}</td>
                          <td className="px-4 py-2">{item.description}</td>
                          <td className="px-4 py-2">{item.flag}</td>
                          {(hasPermission("Edit") ||
                            hasPermission("Delete")) && (
                            <td className="px-4 py-2">
                              <div className="flex items-center justify-center gap-2">
                                {hasPermission("Edit") && (
                                  <button
                                    onClick={() =>
                                      handleEdit(item, globalIndex)
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
                                    onClick={() => handleDelete(item)}
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
                      );
                    })}
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
                  Showing {filteredData.length === 0 ? 0 : startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredData.length)} of{" "}
                  {filteredData.length} entries
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded">
                    {currentPage}
                  </button>
                  <button
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages || totalPages === 0}
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
                        {isEditMode ? "Edit" : "Create New"}
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
                      <h3 className="text-blue-600 mb-4">Bracket Code Setup</h3>

                      {/* Form Fields */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">
                            Code :
                          </label>
                          <input
                            type="text"
                            value={bracketCode}
                            onChange={(e) => setBracketCode(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Enter code"
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
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Enter description"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">
                            Flag :
                          </label>
                          <select
                            value={flag}
                            onChange={(e) => setFlag(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            {flagOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Modal Actions */}
                      <div className="flex gap-3 mt-6">
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

          {/* CSS Animations */}
          <style>{`
            @keyframes blob {
              0% {
                transform: translate(0px, 0px) scale(1);
              }
              33% {
                transform: translate(30px, -50px) scale(1.1);
              }
              66% {
                transform: translate(-20px, 20px) scale(0.9);
              }
              100% {
                transform: translate(0px, 0px) scale(1);
              }
            }
            .animate-blob {
              animation: blob 7s infinite;
            }
            .animation-delay-2000 {
              animation-delay: 2s;
            }
            .animation-delay-4000 {
              animation-delay: 4s;
            }
          `}</style>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
