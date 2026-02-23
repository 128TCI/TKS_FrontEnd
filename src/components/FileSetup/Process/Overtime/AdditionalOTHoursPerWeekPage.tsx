import { useState, useEffect } from "react";
import {  Plus,  Pencil,  Trash2,
          Save,  XCircle,  ArrowUpDown,
          Check,  X,  Search,} from "lucide-react";
import { Footer } from "../../../Footer/Footer";
import { decryptData } from "../../../../services/encryptionService";
import auditTrail from '../../../../services/auditTrail';
const formName = 'Additional OT Hours Per Week SetUp'

interface OTHoursPerDay {
  id: number;
  noOfHours: number;
  equivalentHours: number;
}

interface OTHoursPerWeek {
  id: number;
  noOfHoursPerWeek: number;
  equivalentHoursPerWeek: number;
}

export function AdditionalOTHoursPerWeekPage() {
  const [referenceCode, setReferenceCode] = useState("1");
  const [selectedRow, setSelectedRow] = useState<number | null>(0);
  const [showAddPerDayModal, setShowAddPerDayModal] = useState(false);
  const [showAddPerWeekModal, setShowAddPerWeekModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showReferenceSearchModal, setShowReferenceSearchModal] =
    useState(false);
  const [searchCurrentPage, setSearchCurrentPage] = useState(1);
  const [referenceSearchPage, setReferenceSearchPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedField, setSelectedField] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  const itemsPerPage = 10;

  // Permissions
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const hasPermission = (accessType: string) =>
    permissions[accessType] === true;

  useEffect(() => {
    getAdditionalOTHoursPerWeekPermissions();
  }, []);

  const getAdditionalOTHoursPerWeekPermissions = () => {
    const rawPayload = localStorage.getItem("loginPayload");
    if (!rawPayload) return;

    try {
      const parsedPayload = JSON.parse(rawPayload);
      const encryptedArray: any[] = parsedPayload.permissions || [];

      const branchEntries = encryptedArray.filter(
        (p) => decryptData(p.formName) === "AdditionalOTHoursPerWeek",
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

  const [otHoursPerDay, setOtHoursPerDay] = useState<OTHoursPerDay[]>([
    { id: 1, noOfHours: 1, equivalentHours: 1 },
  ]);

  const [otHoursPerWeek, setOtHoursPerWeek] = useState<OTHoursPerWeek[]>([
    { id: 1, noOfHoursPerWeek: 1, equivalentHoursPerWeek: 1 },
  ]);

  const [scheduleData, setScheduleData] = useState({
    day: "Monday",
    regularDay: "ATESTOT1",
    restDay: "",
    legalHoliday: "",
    specialNational: "",
  });

  const [newPerDay, setNewPerDay] = useState({
    noOfHours: "",
    equivalentHours: "",
  });

  const [newPerWeek, setNewPerWeek] = useState({
    noOfHoursPerWeek: "",
    equivalentHoursPerWeek: "",
  });

  const [leaveIsConsideredAsWorked, setLeaveIsConsideredAsWorked] =
    useState(false);

  // OT Codes data for search modal
  const otCodes = [
    { code: "ADJ_PAY", description: "Adjustment", amt: 0.0, rate: 100.0 },
    { code: "ATESTOT1", description: "TEST OT 11", amt: 0.0, rate: 123.0 },
    { code: "BASC_RATE", description: "Basic Rate", amt: 0.0, rate: 100.0 },
    {
      code: "HOLIDAY",
      description: "Unworked Holiday Pay",
      amt: 0.0,
      rate: 100.0,
    },
    { code: "HOLMON", description: "Holiday Monthly", amt: 0.0, rate: 0.0 },
    {
      code: "ND2LHF8",
      description: "Double regular holiday, night shift",
      amt: 0.0,
      rate: 30.0,
    },
    {
      code: "ND2LHRDF8",
      description: "Double regular holiday, rest day, night shift",
      amt: 0.0,
      rate: 39.0,
    },
    {
      code: "ND2LHRDX8",
      description: "Double regular holiday, rest day, night shift, overtime",
      amt: 0.0,
      rate: 50.7,
    },
    {
      code: "ND2LHX8",
      description: "Double regular holiday, night shift overtime",
      amt: 0.0,
      rate: 39.0,
    },
    {
      code: "ND_BASIC",
      description: "Night Differential Basic Rate",
      amt: 0.0,
      rate: 10.0,
    },
    {
      code: "NDLHF8",
      description: "Legal holiday night shift",
      amt: 0.0,
      rate: 20.0,
    },
    {
      code: "NDLHRDF8",
      description: "Legal holiday rest day night shift",
      amt: 0.0,
      rate: 26.0,
    },
    {
      code: "NDLHRDX8",
      description: "Legal holiday rest day night shift overtime",
      amt: 0.0,
      rate: 33.8,
    },
    {
      code: "NDLHX8",
      description: "Legal holiday night shift overtime",
      amt: 0.0,
      rate: 26.0,
    },
    {
      code: "NDRDX8",
      description: "Rest day night shift overtime",
      amt: 0.0,
      rate: 16.9,
    },
    {
      code: "NDREG",
      description: "Night Differential Regular",
      amt: 0.0,
      rate: 10.0,
    },
    {
      code: "NDSHF8",
      description: "Special holiday night shift",
      amt: 0.0,
      rate: 13.0,
    },
    {
      code: "NDSHRDF8",
      description: "Special holiday rest day night shift",
      amt: 0.0,
      rate: 16.9,
    },
    {
      code: "NDSHRDX8",
      description: "Special holiday rest day night shift overtime",
      amt: 0.0,
      rate: 21.97,
    },
    {
      code: "NDSHX8",
      description: "Special holiday night shift overtime",
      amt: 0.0,
      rate: 16.9,
    },
    {
      code: "NDWRKX8",
      description: "Night shift overtime",
      amt: 0.0,
      rate: 13.75,
    },
    {
      code: "OT2LHF8",
      description: "Double regular holiday",
      amt: 0.0,
      rate: 260.0,
    },
    {
      code: "OT2LHRDF8",
      description: "Double regular holiday rest day",
      amt: 0.0,
      rate: 338.0,
    },
    {
      code: "OT2LHRDX8",
      description: "Double regular holiday rest day overtime",
      amt: 0.0,
      rate: 439.4,
    },
    {
      code: "OT2LHX8",
      description: "Double regular holiday overtime",
      amt: 0.0,
      rate: 338.0,
    },
    { code: "OTLHF8", description: "Legal holiday", amt: 0.0, rate: 200.0 },
    {
      code: "OTLHRDF8",
      description: "Legal holiday rest day",
      amt: 0.0,
      rate: 260.0,
    },
    {
      code: "OTLHRDX8",
      description: "Legal holiday rest day overtime",
      amt: 0.0,
      rate: 338.0,
    },
    {
      code: "OTLHX8",
      description: "Legal holiday overtime",
      amt: 0.0,
      rate: 260.0,
    },
    { code: "OTRDX8", description: "Rest day overtime", amt: 0.0, rate: 169.0 },
  ];

  const totalPages = Math.ceil(otCodes.length / itemsPerPage);
  const startIndex = (searchCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOTCodes = otCodes.slice(startIndex, endIndex);

  const handleOpenSearchModal = (field: string) => {
    setSelectedField(field);
    setShowSearchModal(true);
    setSearchCurrentPage(1);
  };

  const handleSelectOTCode = (code: string) => {
    if (selectedField === "regularDay") {
      setScheduleData({ ...scheduleData, regularDay: code });
    } else if (selectedField === "restDay") {
      setScheduleData({ ...scheduleData, restDay: code });
    } else if (selectedField === "legalHoliday") {
      setScheduleData({ ...scheduleData, legalHoliday: code });
    } else if (selectedField === "specialNational") {
      setScheduleData({ ...scheduleData, specialNational: code });
    }
    setShowSearchModal(false);
  };

  const handleCreateNew = () => {
    // Create new reference code
    const newCode = (parseInt(referenceCode) + 1).toString();
    setReferenceCode(newCode);
    setOtHoursPerDay([]);
    setOtHoursPerWeek([]);
    setScheduleData({
      day: "Monday",
      regularDay: "",
      restDay: "",
      legalHoliday: "",
      specialNational: "",
    });
    setLeaveIsConsideredAsWorked(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Save logic here
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset/cancel logic here
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this record?")) {
      // Delete logic
    }
  };

  const handleSearch = () => {
    setShowReferenceSearchModal(true);
    setReferenceSearchPage(1);
    setSearchQuery("");
  };

  const handleAddPerDay = () => {
    if (newPerDay.noOfHours && newPerDay.equivalentHours) {
      const newId =
        otHoursPerDay.length > 0
          ? Math.max(...otHoursPerDay.map((d) => d.id)) + 1
          : 1;
      setOtHoursPerDay([
        ...otHoursPerDay,
        {
          id: newId,
          noOfHours: parseFloat(newPerDay.noOfHours),
          equivalentHours: parseFloat(newPerDay.equivalentHours),
        },
      ]);
      setNewPerDay({ noOfHours: "", equivalentHours: "" });
      setShowAddPerDayModal(false);
    }
  };

  const handleAddPerWeek = () => {
    if (newPerWeek.noOfHoursPerWeek && newPerWeek.equivalentHoursPerWeek) {
      const newId =
        otHoursPerWeek.length > 0
          ? Math.max(...otHoursPerWeek.map((d) => d.id)) + 1
          : 1;
      setOtHoursPerWeek([
        ...otHoursPerWeek,
        {
          id: newId,
          noOfHoursPerWeek: parseFloat(newPerWeek.noOfHoursPerWeek),
          equivalentHoursPerWeek: parseFloat(newPerWeek.equivalentHoursPerWeek),
        },
      ]);
      setNewPerWeek({ noOfHoursPerWeek: "", equivalentHoursPerWeek: "" });
      setShowAddPerWeekModal(false);
    }
  };

  const handleRowClick = (index: number) => {
    setSelectedRow(index);
  };

  // Handle ESC key press to close modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showSearchModal) {
          setShowSearchModal(false);
        } else if (showReferenceSearchModal) {
          setShowReferenceSearchModal(false);
        } else if (showAddPerDayModal) {
          setShowAddPerDayModal(false);
        } else if (showAddPerWeekModal) {
          setShowAddPerWeekModal(false);
        }
      }
    };

    if (
      showSearchModal ||
      showReferenceSearchModal ||
      showAddPerDayModal ||
      showAddPerWeekModal
    ) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [
    showSearchModal,
    showReferenceSearchModal,
    showAddPerDayModal,
    showAddPerWeekModal,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Additional OT Hours Per Week</h1>
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
                    Configure additional overtime hours tracking per week. Set
                    up hourly equivalents for both daily and weekly overtime
                    schedules, and define overtime rate codes for different
                    scenarios including regular days, rest days, and holidays.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Daily and weekly OT hour tracking
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Equivalent hours configuration
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Day-specific OT rate codes
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Leave as worked time option
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reference Code and Action Buttons */}
            {hasPermission("View") && (
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <label className="text-gray-700">Reference Code:</label>
                  <input
                    type="text"
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setReferenceCode("")}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 mb-6">
                  {!isEditing && hasPermission("Add") && (
                    <button
                      onClick={handleCreateNew}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Create New
                    </button>
                  )}
                  {!isEditing && hasPermission("Edit") && (
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                  )}

                  {isEditing && hasPermission("Edit") && (
                    <>
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>

                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Main Grid Layout */}
            {hasPermission('View') ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Section - Tables */}
                <div className="lg:col-span-2 space-y-6">
                  {/* OT Hours Per Day Table */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left">
                              <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors">
                                No. Of Hours
                                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                              </button>
                            </th>
                            <th className="px-6 py-3 text-left">
                              <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors">
                                Equivalent Hours
                                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                              </button>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {otHoursPerDay.map((record, index) => (
                            <tr
                              key={record.id}
                              onClick={() => handleRowClick(index)}
                              className={`cursor-pointer transition-colors ${
                                selectedRow === index
                                  ? "bg-blue-50 hover:bg-blue-100"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <td className="px-6 py-3 text-gray-900">
                                {record.noOfHours}
                              </td>
                              <td className="px-6 py-3 text-gray-900">
                                {record.equivalentHours}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                      <button
                        onClick={() => setShowAddPerDayModal(true)}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Entry
                      </button>
                    </div>
                  </div>

                  {/* OT Hours Per Week Table */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left">
                              <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors">
                                No Of Hours Per Week
                                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                              </button>
                            </th>
                            <th className="px-6 py-3 text-left">
                              <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors">
                                Equivalent Hours Per Week
                                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                              </button>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {otHoursPerWeek.map((record) => (
                            <tr
                              key={record.id}
                              className="hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <td className="px-6 py-3 text-gray-900">
                                {record.noOfHoursPerWeek}
                              </td>
                              <td className="px-6 py-3 text-gray-900">
                                {record.equivalentHoursPerWeek}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                      <button
                        onClick={() => setShowAddPerWeekModal(true)}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Entry
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Section - Schedule Configuration */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-gray-900 mb-4">
                    Schedule of additional hours per week
                  </h3>

                  <div className="space-y-4">
                    {/* Day */}
                    <div>
                      <label className="block text-gray-700 mb-2 text-sm">
                        Day
                      </label>
                      <select
                        value={scheduleData.day}
                        onChange={(e) =>
                          setScheduleData({
                            ...scheduleData,
                            day: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option>Monday</option>
                        <option>Tuesday</option>
                        <option>Wednesday</option>
                        <option>Thursday</option>
                        <option>Friday</option>
                        <option>Saturday</option>
                        <option>Sunday</option>
                      </select>
                    </div>

                    {/* Overtime rate basis section */}
                    <div className="pt-2">
                      <p className="text-gray-700 text-sm mb-3">
                        Overtime rate basis for additional hours per week
                      </p>

                      {/* Regular Day */}
                      <div className="mb-3">
                        <label className="block text-gray-700 mb-1 text-sm">
                          Regular Day
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={scheduleData.regularDay}
                            onChange={(e) =>
                              setScheduleData({
                                ...scheduleData,
                                regularDay: e.target.value,
                              })
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            readOnly
                          />
                          <button
                            onClick={() => handleOpenSearchModal("regularDay")}
                            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                          >
                            ...
                          </button>
                        </div>
                      </div>

                      {/* Rest Day */}
                      <div className="mb-3">
                        <label className="block text-gray-700 mb-1 text-sm">
                          Rest Day
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={scheduleData.restDay}
                            onChange={(e) =>
                              setScheduleData({
                                ...scheduleData,
                                restDay: e.target.value,
                              })
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            readOnly
                          />
                          <button
                            onClick={() => handleOpenSearchModal("restDay")}
                            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                          >
                            ...
                          </button>
                        </div>
                      </div>

                      {/* Legal Holiday */}
                      <div className="mb-3">
                        <label className="block text-gray-700 mb-1 text-sm">
                          Legal Holiday
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={scheduleData.legalHoliday}
                            onChange={(e) =>
                              setScheduleData({
                                ...scheduleData,
                                legalHoliday: e.target.value,
                              })
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            readOnly
                          />
                          <button
                            onClick={() =>
                              handleOpenSearchModal("legalHoliday")
                            }
                            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                          >
                            ...
                          </button>
                        </div>
                      </div>

                      {/* Special National */}
                      <div className="mb-4">
                        <label className="block text-gray-700 mb-1 text-sm">
                          Special National
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={scheduleData.specialNational}
                            onChange={(e) =>
                              setScheduleData({
                                ...scheduleData,
                                specialNational: e.target.value,
                              })
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            readOnly
                          />
                          <button
                            onClick={() =>
                              handleOpenSearchModal("specialNational")
                            }
                            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                          >
                            ...
                          </button>
                        </div>
                      </div>

                      {/* Leave checkbox */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="leaveWorked"
                          checked={leaveIsConsideredAsWorked}
                          onChange={(e) =>
                            setLeaveIsConsideredAsWorked(e.target.checked)
                          }
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="leaveWorked"
                          className="text-gray-700 text-sm"
                        >
                          Leave is Considered as part of worked rendered
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                  You do not have permission to view this list.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add OT Hours Per Day Modal */}
      {showAddPerDayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h2 className="text-blue-600">AddOTHrsPerDay</h2>
              <button
                onClick={() => setShowAddPerDayModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">No of Hours</label>
                <input
                  type="number"
                  value={newPerDay.noOfHours}
                  onChange={(e) =>
                    setNewPerDay({ ...newPerDay, noOfHours: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Equivalent Hours
                </label>
                <input
                  type="number"
                  value={newPerDay.equivalentHours}
                  onChange={(e) =>
                    setNewPerDay({
                      ...newPerDay,
                      equivalentHours: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <button
                onClick={handleAddPerDay}
                className="px-6 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddPerDayModal(false)}
                className="px-6 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add OT Hours Per Week Modal */}
      {showAddPerWeekModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h2 className="text-blue-600">AddOTHrsPerWeek</h2>
              <button
                onClick={() => setShowAddPerWeekModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">No of Hours</label>
                <input
                  type="number"
                  value={newPerWeek.noOfHoursPerWeek}
                  onChange={(e) =>
                    setNewPerWeek({
                      ...newPerWeek,
                      noOfHoursPerWeek: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Equivalent Hours
                </label>
                <input
                  type="number"
                  value={newPerWeek.equivalentHoursPerWeek}
                  onChange={(e) =>
                    setNewPerWeek({
                      ...newPerWeek,
                      equivalentHoursPerWeek: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <button
                onClick={handleAddPerWeek}
                className="px-6 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddPerWeekModal(false)}
                className="px-6 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h2 className="text-blue-600">Search OT Codes</h2>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors">
                          Code
                          <ArrowUpDown className="w-4 h-4 text-gray-400" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors">
                          Description
                          <ArrowUpDown className="w-4 h-4 text-gray-400" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors">
                          Rate
                          <ArrowUpDown className="w-4 h-4 text-gray-400" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors">
                          Action
                          <ArrowUpDown className="w-4 h-4 text-gray-400" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentOTCodes.map((record) => (
                      <tr
                        key={record.code}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-3 text-gray-900">
                          {record.code}
                        </td>
                        <td className="px-6 py-3 text-gray-900">
                          {record.description}
                        </td>
                        <td className="px-6 py-3 text-gray-900">
                          {record.rate}
                        </td>
                        <td className="px-6 py-3 text-gray-900">
                          <button
                            onClick={() => handleSelectOTCode(record.code)}
                            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Add Entry
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => setSearchCurrentPage(searchCurrentPage - 1)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  disabled={searchCurrentPage === 1}
                >
                  Previous
                </button>
                <span className="text-gray-700">
                  Page {searchCurrentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setSearchCurrentPage(searchCurrentPage + 1)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  disabled={searchCurrentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <button
                onClick={() => setShowSearchModal(false)}
                className="px-6 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reference Search Modal (for Search button) */}
      {showReferenceSearchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg flex-shrink-0">
              <div className="flex items-center gap-3 flex-1">
                <label className="text-gray-700">Search:</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by code or description..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowReferenceSearchModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-3"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors">
                          OT Code
                          <ArrowUpDown className="w-4 h-4 text-gray-400" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors">
                          Description
                          <ArrowUpDown className="w-4 h-4 text-gray-400" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors">
                          Def Amt
                          <ArrowUpDown className="w-4 h-4 text-gray-400" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors">
                          Rate
                          <ArrowUpDown className="w-4 h-4 text-gray-400" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {otCodes
                      .filter(
                        (code) =>
                          searchQuery === "" ||
                          code.code
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          code.description
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                      )
                      .slice(
                        (referenceSearchPage - 1) * itemsPerPage,
                        referenceSearchPage * itemsPerPage,
                      )
                      .map((record) => (
                        <tr
                          key={record.code}
                          onClick={() => {
                            setReferenceCode(record.code);
                            setShowReferenceSearchModal(false);
                          }}
                          className="hover:bg-blue-50 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-3 text-gray-900">
                            {record.code}
                          </td>
                          <td className="px-6 py-3 text-gray-900">
                            {record.description}
                          </td>
                          <td className="px-6 py-3 text-gray-900">
                            {record.amt.toFixed(2)}
                          </td>
                          <td className="px-6 py-3 text-gray-900">
                            {record.rate.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex items-center justify-center gap-2 mb-3">
                <button
                  onClick={() =>
                    setReferenceSearchPage(Math.max(1, referenceSearchPage - 1))
                  }
                  disabled={referenceSearchPage === 1}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {[
                  ...Array(
                    Math.min(
                      7,
                      Math.ceil(
                        otCodes.filter(
                          (code) =>
                            searchQuery === "" ||
                            code.code
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            code.description
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()),
                        ).length / itemsPerPage,
                      ),
                    ),
                  ),
                ].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setReferenceSearchPage(idx + 1)}
                    className={`px-3 py-2 rounded transition-colors ${
                      referenceSearchPage === idx + 1
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setReferenceSearchPage(referenceSearchPage + 1)
                  }
                  disabled={
                    referenceSearchPage >=
                    Math.ceil(
                      otCodes.filter(
                        (code) =>
                          searchQuery === "" ||
                          code.code
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          code.description
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                      ).length / itemsPerPage,
                    )
                  }
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="flex items-center justify-start">
                <button
                  onClick={() => setShowReferenceSearchModal(false)}
                  className="px-6 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
