import { useState, useEffect } from "react";
import { X, Plus, Check, ArrowLeft } from "lucide-react";
import { ClipboardList, Clock, Users, Edit, Trash2 } from "lucide-react";
import { decryptData } from "../../../../services/encryptionService";
import apiClient from "../../../../services/apiClient";
import Swal from "sweetalert2";

interface TableEntry {
  id: number;
  time: string;
  equivalent: string;
  bracketCode: string;
}

interface BracketData {
  Tardiness: TableEntry[];
  Undertime: TableEntry[];
  Accumulation: TableEntry[];
}

export function TardinessUndertimeAccumulationTableSetupPage() {
  const [activeTab, setActiveTab] = useState<
    "Tardiness" | "Undertime" | "Accumulation"
  >("Tardiness");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [bracketCodeList, setBracketCodeList] = useState<
    { id: string; bracketCode: string; description: string; flag: string }[]
  >([]);
  const [loadingBracketCode, setLoadingBracketCode] = useState(false);
  const [bracketCodeError, setBracketCodeError] = useState("");
  const [selectedBracketCode, setSelectedBracketCode] = useState(
    bracketCodeList[0]?.bracketCode || "",
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [originalData, setOriginalData] = useState<{
    late: string;
    equivalent: string;
    bracketCode: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    late: "",
    equivalent: "",
    bracketCode: "",
  });

  const [bracketData, setBracketData] = useState<BracketData>({
    Tardiness: [],
    Undertime: [],
    Accumulation: [],
  });

  const flagMapText: Record<string, string> = {
    A: "Active",
    I: "Inactive",
    // add more if needed
  };

  useEffect(() => {
    fetchBracketData("Tardiness");
    fetchBracketData("Undertime");
    fetchBracketData("Accumulation");
    fetchBracketCodes();
  }, []);

  const fetchBracketData = async (tab: keyof BracketData) => {
    try {
      const urlMap = {
        Tardiness: "/Fs/Process/Tardiness/TardinessSetup",
        Undertime: "/Fs/Process/Tardiness/UnderTimeSetup",
        Accumulation: "/Fs/Process/Tardiness/AccumulateSetup",
      };

      const response = await apiClient.get(urlMap[tab]);

      if (response.status === 200 && response.data) {
        // Map API response to TableEntry
        const mappedData: TableEntry[] = response.data.map((item: any) => ({
          id: item.id,
          time: item.late,
          equivalent: item.equivalent,
          bracketCode: item.bracketCode || item.code || "",
        }));

        setBracketData((prev) => ({ ...prev, [tab]: mappedData }));
      }
    } catch (err) {
      console.error(`Failed to fetch ${tab} data:`, err);
    }
  };
  const fetchBracketCodes = async () => {
    setLoadingBracketCode(true);
    setBracketCodeError("");
    try {
      const response = await apiClient.get(
        "/Fs/Process/Tardiness/BracketCodeSetup",
      );

      if (response.status === 200 && response.data) {
        const mappedData = response.data.map((item: any) => ({
          id: item.id?.toString() || "",
          bracketCode: item.bracketCode || item.code || "",
          description: item.description || item.Description || "",
          flag: item.flag?.toString() || "0",
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

  const itemsPerPage = 25;
  const currentData = bracketData[activeTab].filter(
    (item) => item.bracketCode === selectedBracketCode,
  );
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = currentData.slice(startIndex, endIndex);

  // Get field label based on active tab
  const getFieldLabel = () => {
    if (activeTab === "Accumulation") {
      return "Late/Undertime";
    }
    if (activeTab === "Tardiness") {
      return "Late";
    }
    return "Undertime";
  };

  // Get modal title based on active tab
  const getModalTitle = () => {
    if (activeTab === "Accumulation") {
      return "Accumulate Setup";
    }
    if (activeTab === "Tardiness") {
      return "Tardiness Setup";
    }
    return "Undertime Setup";
  };

  // Permissions
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const hasPermission = (accessType: string) =>
    permissions[accessType] === true;

  useEffect(() => {
    getTardinessAndUndertimeTableSetUpPermissions();
  }, []);

  const getTardinessAndUndertimeTableSetUpPermissions = () => {
    const rawPayload = localStorage.getItem("loginPayload");
    if (!rawPayload) return;

    try {
      const parsedPayload = JSON.parse(rawPayload);
      const encryptedArray: any[] = parsedPayload.permissions || [];

      const branchEntries = encryptedArray.filter(
        (p) => decryptData(p.formName) === "TardinessAndUndertimeTableSetUp",
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

  // Get table column label based on active tab
  const getTableColumnLabel = () => {
    if (activeTab === "Accumulation") {
      return "Tardiness/Undertime";
    }
    return activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
  };

  const baseUrlMap = {
    Tardiness: "/Fs/Process/Tardiness/TardinessSetup",
    Undertime: "/Fs/Process/Tardiness/UnderTimeSetup",
    Accumulation: "/Fs/Process/Tardiness/AccumulateSetup",
  };

  const handleCreateNew = () => {
    // Filter bracket codes based on active tab
    const filteredBrackets = bracketCodeList.filter((item) => {
      if (activeTab === "Tardiness") return item.flag === "1";
      if (activeTab === "Undertime") return item.flag === "2";
      if (activeTab === "Accumulation") return item.flag === "3";
      return false;
    });

    // Default to the currently selected bracket or first in filtered list
    const defaultBracketCode =
      selectedBracketCode || filteredBrackets[0]?.bracketCode || "";

    setFormData({
      late: "",
      equivalent: "",
      bracketCode: defaultBracketCode,
    });
    setIsEditMode(false);
    setEditingId(null);
    setShowCreateModal(true);
  };

  const handleEdit = (item: TableEntry) => {
    const normalizedData = {
      late: String(item.time ?? ""),
      equivalent: String(item.equivalent ?? ""),
      bracketCode: String(item.bracketCode ?? ""),
    };

    setFormData(normalizedData);
    setOriginalData(normalizedData);
    setEditingId(item.id);
    setIsEditMode(true);
    setShowCreateModal(true);
  };

  const handleDelete = async (entryId: number) => {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "Confirm Delete",
      text: "Are you sure you want to delete this entry?",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!confirmed.isConfirmed) return;

    try {
      const baseUrl = baseUrlMap[activeTab]; // use the same map as handleSubmit
      const response = await apiClient.delete(`${baseUrl}/${entryId}`);

      if (response.status >= 200 && response.status < 300) {
        // Remove from state immediately
        setBracketData((prev) => ({
          ...prev,
          [activeTab]: prev[activeTab].filter((item) => item.id !== entryId),
        }));

        await Swal.fire({
          icon: "success",
          title: "Deleted",
          text: "Entry deleted successfully.",
          timer: 2000,
          showConfirmButton: false,
        });

        await fetchBracketData(activeTab); // refresh
      }
    } catch (error: any) {
      console.error("Delete error:", error);

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Failed to delete entry.",
      });
    }
  };


  const handleSubmit = async () => {
    const lateValue = String(formData.late ?? "").trim();
    const equivalentValue = String(formData.equivalent ?? "").trim();
    const bracketValue = String(
      formData.bracketCode || selectedBracketCode || "",
    ).trim();

    // ✅ Validation
    if (!lateValue) {
      await Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter a time value.",
      });
      return;
    }

    if (!equivalentValue) {
      await Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter an equivalent value.",
      });
      return;
    }

    // ✅ Prevent update if no changes were made
    if (
      isEditMode &&
      originalData &&
      lateValue === originalData.late &&
      equivalentValue === originalData.equivalent &&
      bracketValue === originalData.bracketCode
    ) {
      await Swal.fire({
        icon: "info",
        title: "No Changes",
        text: "No changes were made.",
      });
      return;
    }

    try {
      const baseUrl = baseUrlMap[activeTab];

      const payload = {
        id: editingId ?? 0,
        late: lateValue,
        equivalent: equivalentValue,
        bracketCode: bracketValue,
      };

      if (isEditMode && editingId) {
        await apiClient.put(`${baseUrl}/${editingId}`, payload);

        await Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Entry updated successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await apiClient.post(baseUrl, payload);

        await Swal.fire({
          icon: "success",
          title: "Created",
          text: "Entry added successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
      }

      await fetchBracketData(activeTab);

      // ✅ Reset state
      setShowCreateModal(false);
      setFormData({
        late: "",
        equivalent: "",
        bracketCode: selectedBracketCode,
      });
      setIsEditMode(false);
      setEditingId(null);
      setOriginalData(null);
    } catch (error: any) {
      console.error("Submit error:", error);

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Failed to submit entry.",
      });
    }
  };

  // Handle time input formatting (hh.mm)
  const handleTimeInput = (value: string, field: "late" | "equivalent") => {
    // Allow only numbers and dots
    const cleaned = value.replace(/[^\d.]/g, "");
    setFormData({ ...formData, [field]: cleaned });
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

  // Update selected bracket when tab changes
  useEffect(() => {
    const firstBracket = bracketCodeList.find((item) => {
      if (activeTab === "Tardiness") return item.flag === "1";
      if (activeTab === "Undertime") return item.flag === "2";
      if (activeTab === "Accumulation") return item.flag === "3";
      return false;
    });
    setSelectedBracketCode(firstBracket?.bracketCode || "");
    setCurrentPage(1);
  }, [activeTab, bracketCodeList]);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
        <h1 className="text-white">Bracketing Table Setup</h1>
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
                Configure bracketing tables for tardiness, undertime, and
                accumulation calculations. Define time ranges and their
                equivalent values for automated deduction processing.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">
                    Tardiness brackets and equivalents
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">
                    Undertime calculation tables
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Accumulation thresholds</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Time-to-value mapping</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-300">
          {[
            { name: "Tardiness" as const, icon: Users },
            { name: "Undertime" as const, icon: Clock },
            { name: "Accumulation" as const, icon: ClipboardList },
          ].map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                activeTab === tab.name
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-blue-50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
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
            <select
              value={selectedBracketCode}
              onChange={(e) => setSelectedBracketCode(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white w-auto min-w-[150px]"
            >
              {loadingBracketCode ? (
                <option>Loading...</option>
              ) : bracketCodeError ? (
                <option>{bracketCodeError}</option>
              ) : (
                bracketCodeList
                  .filter((item) => {
                    if (activeTab === "Tardiness") return item.flag === "1";
                    if (activeTab === "Undertime") return item.flag === "2";
                    if (activeTab === "Accumulation") return item.flag === "3";
                    return false;
                  })
                  .map((option) => (
                    <option key={option.id} value={option.bracketCode}>
                      {option.description}
                    </option>
                  ))
              )}
            </select>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-4 py-2 text-left text-gray-700">
                  {getTableColumnLabel()} [hh.mm]{" "}
                  <span className="text-blue-500">▲</span>
                </th>
                <th className="px-4 py-2 text-left text-gray-700">
                  Equivalent [hh.mm]
                </th>
                <th className="px-4 py-2 text-center text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No data available in table
                  </td>
                </tr>
              ) : hasPermission("View") ? (
                paginatedData.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2">{item.time}</td>
                    <td className="px-4 py-2">{item.equivalent}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center gap-2">
                        {hasPermission("Edit") && (
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {hasPermission("Edit") && hasPermission("Delete") && (
                          <span className="text-gray-300">|</span>
                        )}
                        {hasPermission("Delete") && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">
                  You do not have permission to view this list.
                </div>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {hasPermission("View") && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-gray-600">
              Showing {currentData.length === 0 ? 0 : startIndex + 1} to{" "}
              {Math.min(endIndex, currentData.length)} of {currentData.length}{" "}
              entries
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                  <h3 className="text-blue-600 mb-4">{getModalTitle()}</h3>

                  {/* Form Fields */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="w-40 text-gray-700 text-sm">
                        {getFieldLabel()} :
                      </label>
                      <input
                        type="text"
                        value={formData.late}
                        onChange={(e) =>
                          handleTimeInput(e.target.value, "late")
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-40 text-gray-700 text-sm">
                        Equivalent :
                      </label>
                      <input
                        type="text"
                        value={formData.equivalent}
                        onChange={(e) =>
                          handleTimeInput(e.target.value, "equivalent")
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-40 text-gray-700 text-sm">
                        {activeTab === "Tardiness"
                          ? "BracketCode"
                          : "Bracket Code"}{" "}
                        :
                      </label>
                      <select
                        value={formData.bracketCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bracketCode: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                      >
                        {loadingBracketCode ? (
                          <option>Loading...</option>
                        ) : bracketCodeError ? (
                          <option>{bracketCodeError}</option>
                        ) : (
                          // Filter based on activeTab
                          bracketCodeList
                            .filter((item) => {
                              if (activeTab === "Tardiness")
                                return item.flag === "1";
                              if (activeTab === "Undertime")
                                return item.flag === "2";
                              if (activeTab === "Accumulation")
                                return item.flag === "3";
                              return false;
                            })
                            .map((option) => (
                              <option
                                key={option.id}
                                value={option.bracketCode}
                              >
                                {option.description}
                              </option>
                            ))
                        )}
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
    </div>
  );
}
