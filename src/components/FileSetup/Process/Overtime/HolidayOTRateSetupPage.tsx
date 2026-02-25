import { useState, useEffect } from "react";
import {
  Plus,  Pencil,  Trash2,
  Save,  XCircle,  ArrowUpDown,
  Check,  Search,  X,} from "lucide-react";
import { Footer } from "../../../Footer/Footer";
import Swal from "sweetalert2";
import apiClient from "../../../../services/apiClient";
import auditTrail from '../../../../services/auditTrail';
import { decryptData } from "../../../../services/encryptionService";

const formName = 'Holiday OT Rate SetUp';
interface HolidayOTRate {
  id: number;
  code: string;
  desc: string;
  withintheShift: string;
  aftetheShift: string;
  withintheShiftwithND: string;
  aftertheShiftwithND: string;
  withintheShiftandRestday: string;
  aftertheShiftandRestday: string;
  withintheShiftandRestdaywithND: string;
  aftertheShiftandRestdaywithND: string;
  unworkedHolidayPay: string;
  unworkedHolidayPayRestday: string;
  holidayType: string;
  unprodWorkHolidayRegDay: string;
  unprodWorkHolidayRestDay: string;
  otPremiumWithintheShiftwithND: string;
  otPremiumAftertheShiftwithND: string;
  otPremiumWithintheShiftandRestdaywithND: string;
  otPremiumAftertheShiftandRestdaywithND: string;
  eqOTCodeWinShf: string;
  eqOTCodeWinShfRest: string;
  eqOTCodeAftrShfForNoOfHrs: string;
  eqOTCodeAftrShfRDForNoOfHrs: string;
  eqOTCodeAftrShfNDForNoOfHrs: string;
  eqOTCodeAftrShfRDNDForNoOfHrs: string;
}

interface OTCode {
  otfid: number;
  otfCode: string;
  earnCode: string;
  rate1: number;
  rate2: number;
  defAmt: number;
  incPayslip: string;
  incColaOT: string;
  incColaBasic: string;
  description: string;
  isExemptionRpt: boolean;
}

const HOLIDAY_OPTIONS = [
  { code: "Legal1", label: "Legal Holiday" },
  { code: "Special1", label: "Special Holiday" },
  { code: "Calamity1", label: "Calamity" },
  { code: "NoGrace1", label: "No Grace Period" },
  { code: "Early1", label: "Early Dismissal" },
  { code: "2LEGHOL", label: "Double Legal Holiday" },
  { code: "SPH2", label: "Special Holiday 2" },
  { code: "NonWrk1", label: "Non-Working Holiday" },
];

export function HolidayOTRateSetupPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showOTSearchModal, setShowOTSearchModal] = useState(false);
  const [searchField, setSearchField] = useState("");
  const [otSearchQuery, setOtSearchQuery] = useState("");
  const [otSearchPage, setOtSearchPage] = useState(1);

  const [existingRecords, setExistingRecords] = useState<HolidayOTRate[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");

  // OT Codes from API
  const [otCodesData, setOTCodesData] = useState<OTCode[]>([]);
  const [loadingOTCodes, setLoadingOTCodes] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    desc: "",
    holidayType: "",
    withintheShift: "",
    withintheShiftwithND: "",
    otPremiumWithintheShiftwithND: "",
    aftetheShift: "",
    aftertheShiftwithND: "",
    otPremiumAftertheShiftwithND: "",
    withintheShiftandRestday: "",
    withintheShiftandRestdaywithND: "",
    otPremiumWithintheShiftandRestdaywithND: "",
    aftertheShiftandRestday: "",
    aftertheShiftandRestdaywithND: "",
    otPremiumAftertheShiftandRestdaywithND: "",
    unworkedHolidayPay: "",
    unworkedHolidayPayRestday: "",
    unprodWorkHolidayRegDay: "",
    unprodWorkHolidayRestDay: "",
    eqOTCodeWinShf: "",
    eqOTCodeWinShfRest: "",
    eqOTCodeAftrShfForNoOfHrs: "",
    eqOTCodeAftrShfRDForNoOfHrs: "",
    eqOTCodeAftrShfNDForNoOfHrs: "",
    eqOTCodeAftrShfRDNDForNoOfHrs: "",
  });

  // Fetch holiday OT rates from API
  useEffect(() => {
    fetchHolidayOTRates();
  }, []);

  const fetchHolidayOTRates = async () => {
    setLoadingData(true);
    setDataError("");
    try {
      const response = await apiClient.get(
        "/Fs/Process/Overtime/HolidayOTRateSetUp",
      );
      if (response.status === 200 && response.data) {
        setExistingRecords(response.data);
        if (response.data.length > 0) {
          setSelectedRow(0);
          loadFormData(response.data[0]);
        }
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to load holiday OT rates";
      setDataError(errorMsg);
      console.error("Error fetching holiday OT rates:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchOTCodes = async () => {
    setLoadingOTCodes(true);
    try {
      const response = await apiClient.get(
        "/Fs/Process/Overtime/OverTimeFileSetUp",
      );
      if (response.status === 200 && response.data) {
        setOTCodesData(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching OT codes:", error);
    } finally {
      setLoadingOTCodes(false);
    }
  };

  const filteredOTCodes = otCodesData.filter(
    (item) =>
      item.otfCode.toLowerCase().includes(otSearchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(otSearchQuery.toLowerCase()),
  );

  const otItemsPerPage = 10;
  const otTotalPages = Math.ceil(filteredOTCodes.length / otItemsPerPage);
  const otStartIndex = (otSearchPage - 1) * otItemsPerPage;
  const otEndIndex = otStartIndex + otItemsPerPage;
  const currentOTCodes = filteredOTCodes.slice(otStartIndex, otEndIndex);

  // Permissions
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const hasPermission = (accessType: string) =>
    permissions[accessType] === true;

  useEffect(() => {
    getHolidayOTRatesSetUpPermissions();
  }, []);

  const getHolidayOTRatesSetUpPermissions = () => {
    const rawPayload = localStorage.getItem("loginPayload");
    if (!rawPayload) return;

    try {
      const parsedPayload = JSON.parse(rawPayload);
      const encryptedArray: any[] = parsedPayload.permissions || [];

      const branchEntries = encryptedArray.filter(
        (p) => decryptData(p.formName) === "HolidayOTRatesSetUp",
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

  const loadFormData = (record: HolidayOTRate) => {
    setFormData({
      code: record.code,
      desc: record.desc,
      holidayType: record.holidayType,
      withintheShift: record.withintheShift,
      withintheShiftwithND: record.withintheShiftwithND,
      otPremiumWithintheShiftwithND: record.otPremiumWithintheShiftwithND,
      aftetheShift: record.aftetheShift,
      aftertheShiftwithND: record.aftertheShiftwithND,
      otPremiumAftertheShiftwithND: record.otPremiumAftertheShiftwithND,
      withintheShiftandRestday: record.withintheShiftandRestday,
      withintheShiftandRestdaywithND: record.withintheShiftandRestdaywithND,
      otPremiumWithintheShiftandRestdaywithND:
        record.otPremiumWithintheShiftandRestdaywithND,
      aftertheShiftandRestday: record.aftertheShiftandRestday,
      aftertheShiftandRestdaywithND: record.aftertheShiftandRestdaywithND,
      otPremiumAftertheShiftandRestdaywithND:
        record.otPremiumAftertheShiftandRestdaywithND,
      unworkedHolidayPay: record.unworkedHolidayPay,
      unworkedHolidayPayRestday: record.unworkedHolidayPayRestday,
      unprodWorkHolidayRegDay: record.unprodWorkHolidayRegDay,
      unprodWorkHolidayRestDay: record.unprodWorkHolidayRestDay,
      eqOTCodeWinShf: record.eqOTCodeWinShf,
      eqOTCodeWinShfRest: record.eqOTCodeWinShfRest,
      eqOTCodeAftrShfForNoOfHrs: record.eqOTCodeAftrShfForNoOfHrs,
      eqOTCodeAftrShfRDForNoOfHrs: record.eqOTCodeAftrShfRDForNoOfHrs,
      eqOTCodeAftrShfNDForNoOfHrs: record.eqOTCodeAftrShfNDForNoOfHrs,
      eqOTCodeAftrShfRDNDForNoOfHrs: record.eqOTCodeAftrShfRDNDForNoOfHrs,
    });
  };

  const handleOpenSearch = (field: string) => {
    setSearchField(field);
    setOtSearchQuery("");
    setOtSearchPage(1);
    fetchOTCodes();
    setShowOTSearchModal(true);
  };

  const handleSelectOTCode = (code: string) => {
    setFormData((prev) => ({ ...prev, [searchField]: code }));
    setShowOTSearchModal(false);
  };

  const handleClearField = (field: string) => {
    setFormData((prev) => ({ ...prev, [field]: "" }));
  };

  const handleEdit = () => {
    if (selectedRow === null) {
      Swal.fire({
        icon: "warning",
        title: "No Record Selected",
        text: "Please select a record to edit.",
      });
      return;
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.code.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Code is required.",
      });
      return;
    }
    if (!formData.desc.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Description is required.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: selectedRow !== null ? existingRecords[selectedRow].id : 0,
        code: formData.code,
        desc: formData.desc,
        withintheShift: formData.withintheShift,
        aftetheShift: formData.aftetheShift,
        withintheShiftwithND: formData.withintheShiftwithND,
        aftertheShiftwithND: formData.aftertheShiftwithND,
        withintheShiftandRestday: formData.withintheShiftandRestday,
        aftertheShiftandRestday: formData.aftertheShiftandRestday,
        withintheShiftandRestdaywithND: formData.withintheShiftandRestdaywithND,
        aftertheShiftandRestdaywithND: formData.aftertheShiftandRestdaywithND,
        unworkedHolidayPay: formData.unworkedHolidayPay,
        unworkedHolidayPayRestday: formData.unworkedHolidayPayRestday,
        holidayType: formData.holidayType,
        unprodWorkHolidayRegDay: formData.unprodWorkHolidayRegDay,
        unprodWorkHolidayRestDay: formData.unprodWorkHolidayRestDay,
        otPremiumWithintheShiftwithND: formData.otPremiumWithintheShiftwithND,
        otPremiumAftertheShiftwithND: formData.otPremiumAftertheShiftwithND,
        otPremiumWithintheShiftandRestdaywithND:
          formData.otPremiumWithintheShiftandRestdaywithND,
        otPremiumAftertheShiftandRestdaywithND:
          formData.otPremiumAftertheShiftandRestdaywithND,
        eqOTCodeWinShf: formData.eqOTCodeWinShf,
        eqOTCodeWinShfRest: formData.eqOTCodeWinShfRest,
        eqOTCodeAftrShfForNoOfHrs: formData.eqOTCodeAftrShfForNoOfHrs,
        eqOTCodeAftrShfRDForNoOfHrs: formData.eqOTCodeAftrShfRDForNoOfHrs,
        eqOTCodeAftrShfNDForNoOfHrs: formData.eqOTCodeAftrShfNDForNoOfHrs,
        eqOTCodeAftrShfRDNDForNoOfHrs: formData.eqOTCodeAftrShfRDNDForNoOfHrs,
      };

      if (selectedRow !== null && existingRecords[selectedRow]) {
        await apiClient.put(
          `/Fs/Process/Overtime/HolidayOTRateSetUp/${existingRecords[selectedRow].id}`,
          payload,
        );
        await auditTrail.log({
          accessType: "Edit",
          trans: `Updated Holiday OT rate "${formData.code} - ${formData.desc}"`,
          messages: `Holiday OT rate "${formData.code} - ${formData.desc}" updated`,
          formName
        });
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Holiday OT rate updated successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await apiClient.post(
          "/Fs/Process/Overtime/HolidayOTRateSetUp",
          payload,
        );
        await auditTrail.log({
          accessType: "Add",
          trans: `Created Holiday OT rate "${formData.code} - ${formData.desc}"`,
          messages: `Holiday OT rate "${formData.code} - ${formData.desc}" created`,
          formName
        });
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Holiday OT rate created successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
      }

      await fetchHolidayOTRates();
      setIsEditing(false);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || error.message || "An error occurred";
      await Swal.fire({ icon: "error", title: "Error", text: errorMsg });
      console.error("Error saving holiday OT rate:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (selectedRow !== null && existingRecords[selectedRow]) {
      loadFormData(existingRecords[selectedRow]);
    }
  };

  const handleCreateNew = () => {
    setIsEditing(true);
    setSelectedRow(null);
    setFormData({
      code: "",
      desc: "",
      holidayType: "",
      withintheShift: "",
      withintheShiftwithND: "",
      otPremiumWithintheShiftwithND: "",
      aftetheShift: "",
      aftertheShiftwithND: "",
      otPremiumAftertheShiftwithND: "",
      withintheShiftandRestday: "",
      withintheShiftandRestdaywithND: "",
      otPremiumWithintheShiftandRestdaywithND: "",
      aftertheShiftandRestday: "",
      aftertheShiftandRestdaywithND: "",
      otPremiumAftertheShiftandRestdaywithND: "",
      unworkedHolidayPay: "",
      unworkedHolidayPayRestday: "",
      unprodWorkHolidayRegDay: "",
      unprodWorkHolidayRestDay: "",
      eqOTCodeWinShf: "",
      eqOTCodeWinShfRest: "",
      eqOTCodeAftrShfForNoOfHrs: "",
      eqOTCodeAftrShfRDForNoOfHrs: "",
      eqOTCodeAftrShfNDForNoOfHrs: "",
      eqOTCodeAftrShfRDNDForNoOfHrs: "",
    });
  };

  const handleDelete = async () => {
    if (selectedRow === null || !existingRecords[selectedRow]) {
      await Swal.fire({
        icon: "warning",
        title: "No Record Selected",
        text: "Please select a record to delete.",
      });
      return;
    }

    const record = existingRecords[selectedRow];
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "Confirm Delete",
      text: `Are you sure you want to delete holiday OT rate "${record.code} - ${record.desc}"?`,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (confirmed.isConfirmed) {
      try {
        await apiClient.delete(
          `/Fs/Process/Overtime/HolidayOTRateSetUp/${record.id}`,
        );
        await auditTrail.log({
          accessType: "Delete",
          trans: `Deleted Holiday OT rate "${record.code} - ${record.desc}"`,
          messages: `Holiday OT rate "${record.code} - ${record.desc}" removed`,
          formName
        });
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Holiday OT rate deleted successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        await fetchHolidayOTRates();
        setSelectedRow(null);
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Failed to delete holiday OT rate";
        await Swal.fire({ icon: "error", title: "Error", text: errorMsg });
        console.error("Error deleting holiday OT rate:", error);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRowClick = (index: number) => {
    if (!isEditing) {
      setSelectedRow(index);
      const record = existingRecords[index];
      loadFormData(record);
    }
  };

  // Render field with search button
  const renderFieldWithSearch = (
    label: string,
    field: keyof typeof formData,
    required: boolean = false,
  ) => (
    <div>
      <label className="block text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={formData[field]}
          readOnly
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-default"
        />
        <button
          type="button"
          onClick={() => handleOpenSearch(field)}
          disabled={!isEditing}
          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => handleClearField(field)}
          disabled={!isEditing}
          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showOTSearchModal) {
        setShowOTSearchModal(false);
      }
    };
    if (showOTSearchModal) {
      document.addEventListener("keydown", handleEscKey);
    }
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [showOTSearchModal]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Holiday OT Rate Setup</h1>
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
                    Define overtime rate codes and premium calculations for
                    holidays. Configure rates for regular shifts, night
                    differential, rest days, and their combinations to ensure
                    accurate holiday pay computations.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {[
                      "Within shift and after shift OT rates",
                      "Night differential premium calculations",
                      "Rest day combination rates",
                      "Unworked holiday pay configuration",
                    ].map((t) => (
                      <div key={t} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {hasPermission("View") && (
              <div className="flex items-center gap-3 mb-6">
                {/* Create New - Add Permission */}
                {!isEditing && hasPermission("Add") && (
                  <button
                    onClick={handleCreateNew}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Create New
                  </button>
                )}

                {/* Edit / Save / Cancel - Edit Permission */}
                {hasPermission("Edit") &&
                  (!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={submitting}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <Save className="w-4 h-4" />
                        {submitting ? "Saving..." : "Save"}
                      </button>

                      <button
                        onClick={handleCancel}
                        disabled={submitting}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <XCircle className="w-4 h-4" /> Cancel
                      </button>
                    </>
                  ))}

                {/* Delete - Delete Permission */}
                {!isEditing && hasPermission("Delete") && (
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                )}
              </div>
            )}
            {hasPermission("View") ? (
              <>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                  {loadingData ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-gray-600 text-sm">
                        Loading holiday OT rates...
                      </div>
                    </div>
                  ) : dataError ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-700 text-sm">{dataError}</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left">
                              <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors">
                                Code{" "}
                                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                              </button>
                            </th>
                            <th className="px-6 py-3 text-left">
                              <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors">
                                Description{" "}
                                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                              </button>
                            </th>
                            <th className="px-6 py-3 text-left">
                              <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors">
                                Holiday Type{" "}
                                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                              </button>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {existingRecords.length > 0 ? (
                            existingRecords.map((record, index) => (
                              <tr
                                key={record.id}
                                onClick={() => handleRowClick(index)}
                                className={`cursor-pointer transition-colors ${selectedRow === index ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"}`}
                              >
                                <td className="px-6 py-3 text-gray-900">
                                  {record.code}
                                </td>
                                <td className="px-6 py-3 text-gray-900">
                                  {record.desc}
                                </td>
                                <td className="px-6 py-3 text-gray-900">
                                  {record.holidayType}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={3}
                                className="px-6 py-8 text-center text-gray-500"
                              >
                                No records found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="space-y-5">
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.code}
                          maxLength={10}
                          onChange={(e) =>
                            handleInputChange("code", e.target.value)
                          }
                          disabled={!isEditing}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                        />
                      </div>
                      {renderFieldWithSearch(
                        "Within the Shift",
                        "withintheShift",
                        true,
                      )}
                      {renderFieldWithSearch(
                        "After the Shift",
                        "aftetheShift",
                        true,
                      )}
                      {renderFieldWithSearch(
                        "Within the Shift and Restday",
                        "withintheShiftandRestday",
                        true,
                      )}
                      {renderFieldWithSearch(
                        "After the Shift and Restday",
                        "aftertheShiftandRestday",
                        true,
                      )}
                      {renderFieldWithSearch(
                        "Unworked Holiday Pay",
                        "unworkedHolidayPay",
                        true,
                      )}
                      {renderFieldWithSearch(
                        "Unworked Holiday Pay (Restday)",
                        "unworkedHolidayPayRestday",
                        true,
                      )}
                    </div>

                    {/* Middle Column */}
                    <div className="space-y-5">
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.desc}
                          onChange={(e) =>
                            handleInputChange("desc", e.target.value)
                          }
                          disabled={!isEditing}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                        />
                      </div>
                      {renderFieldWithSearch(
                        "Within the Shift With ND",
                        "withintheShiftwithND",
                        true,
                      )}
                      {renderFieldWithSearch(
                        "After the Shift With ND",
                        "aftertheShiftwithND",
                        true,
                      )}
                      {renderFieldWithSearch(
                        "Within the Shift and Restday with ND",
                        "withintheShiftandRestdaywithND",
                        true,
                      )}
                      {renderFieldWithSearch(
                        "After the Shift and Restday with ND",
                        "aftertheShiftandRestdaywithND",
                        true,
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-5">
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Holiday Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.holidayType}
                          onChange={(e) =>
                            handleInputChange("holidayType", e.target.value)
                          }
                          disabled={!isEditing}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                        >
                          <option value="">Select Holiday Type</option>
                          {HOLIDAY_OPTIONS.map((option) => (
                            <option key={option.code} value={option.code}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {renderFieldWithSearch(
                        "OT Premium Within the Shift with ND",
                        "otPremiumWithintheShiftwithND",
                        true,
                      )}
                      {renderFieldWithSearch(
                        "OT Premium After the Shift with ND",
                        "otPremiumAftertheShiftwithND",
                        true,
                      )}
                      {renderFieldWithSearch(
                        "OT Premium Within the Shift and Restday with ND",
                        "otPremiumWithintheShiftandRestdaywithND",
                        true,
                      )}
                      {renderFieldWithSearch(
                        "OT Premium After the Shift and Restday with ND",
                        "otPremiumAftertheShiftandRestdaywithND",
                        true,
                      )}
                      {renderFieldWithSearch(
                        "Equivalent OT Code of Within in the Shift",
                        "eqOTCodeWinShf",
                      )}
                      {renderFieldWithSearch(
                        "Equivalent OT Code of Within in the Shift and Rest Day",
                        "eqOTCodeWinShfRest",
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <h3 className="text-gray-900 mb-6">
                    Equivalent OT Code for No of Hrs
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {renderFieldWithSearch(
                      "After The Shift",
                      "eqOTCodeAftrShfForNoOfHrs",
                    )}
                    {renderFieldWithSearch(
                      "After The Shift and Rest Day",
                      "eqOTCodeAftrShfRDForNoOfHrs",
                    )}
                    {renderFieldWithSearch(
                      "After The Shift With ND",
                      "eqOTCodeAftrShfNDForNoOfHrs",
                    )}
                    {renderFieldWithSearch(
                      "After The Shift and Rest Day With ND",
                      "eqOTCodeAftrShfRDNDForNoOfHrs",
                    )}
                  </div>
                </div>

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Note:</span> Fields marked
                    with <span className="text-red-500">*</span> are required.
                    Holiday OT rates are used to calculate overtime premiums for
                    employees working during holidays.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-gray-500">
                You do not have permission to view this list.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* OT Code Search Modal */}
      {showOTSearchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg flex-shrink-0">
              <h2 className="text-gray-900">Overtime Code</h2>
              <button
                onClick={() => setShowOTSearchModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-3 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2 justify-end">
                <label className="text-gray-700 text-sm">Search:</label>
                <input
                  type="text"
                  value={otSearchQuery}
                  onChange={(e) => setOtSearchQuery(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loadingOTCodes ? (
                <div className="py-8 text-center text-gray-500 text-sm">
                  Loading OT codes...
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-100 border-b-2 border-gray-300 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-700 text-sm">
                        Code ▲
                      </th>
                      <th className="px-4 py-2 text-left text-gray-700 text-sm">
                        Description ▲
                      </th>
                      <th className="px-4 py-2 text-right text-gray-700 text-sm">
                        Rate ▲
                      </th>
                      <th className="px-4 py-2 text-right text-gray-700 text-sm">
                        Default Amount ▲
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOTCodes.length > 0 ? (
                      currentOTCodes.map((item) => (
                        <tr
                          key={item.otfid}
                          onClick={() => handleSelectOTCode(item.otfCode)}
                          className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                        >
                          <td className="px-4 py-2 text-sm text-blue-600 font-medium">
                            {item.otfCode}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {item.description}
                          </td>
                          <td className="px-4 py-2 text-sm text-right">
                            {item.rate1.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-sm text-right">
                            {item.defAmt.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-8 text-center text-gray-500 text-sm"
                        >
                          No OT codes found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="text-gray-600 text-sm">
                  Showing {otStartIndex + 1} to{" "}
                  {Math.min(otEndIndex, filteredOTCodes.length)} of{" "}
                  {filteredOTCodes.length} entries
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setOtSearchPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={otSearchPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-sm"
                  >
                    Previous
                  </button>
                  {Array.from(
                    { length: Math.min(5, otTotalPages) },
                    (_, i) => i + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setOtSearchPage(page)}
                      className={`px-3 py-1 rounded text-sm ${otSearchPage === page ? "bg-blue-600 text-white" : "border border-gray-300 hover:bg-gray-100"}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setOtSearchPage((prev) =>
                        Math.min(otTotalPages, prev + 1),
                      )
                    }
                    disabled={otSearchPage === otTotalPages}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
