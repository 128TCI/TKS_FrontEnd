import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  XCircle,
  Check,
  X,
  Search,
  Loader2,
  Save,
} from "lucide-react";
import { Footer } from "../../../Footer/Footer";
import { decryptData } from "../../../../services/encryptionService";
import Swal from "sweetalert2";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface OTHoursPerDay {
  id: number;
  refCode: string;
  noHours: string;
  equalHours: string;
}

interface OTHoursPerWeek {
  id: number;
  refCode: string;
  noHoursPerWeek: string;
  equalHoursPerWeek: string;
}

interface OTWeekSchedule {
  id?: number;
  refCode: string;
  day: string;
  regularDay: string;
  restDay: string;
  legal: string;
  special: string;
  paidLeave: boolean;
}

interface OTFileSetup {
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

// ─── API Base ─────────────────────────────────────────────────────────────────

import apiClient from '../../../../services/apiClient';

// ─── API Functions ────────────────────────────────────────────────────────────

// OT File Setup (Search modal)
const fetchOTFileCodes = async (): Promise<OTFileSetup[]> => {
  const res = await apiClient.get('/Fs/Process/Overtime/OverTimeFileSetUp');
  return res.data ?? [];
};

// Per Day
const fetchAllPerDay = async (): Promise<OTHoursPerDay[]> => {
  const res = await apiClient.get('/AdditonalOTHoursPerWeek/PerDay');
  return res.data ?? [];
};

const createPerDay = async (body: Omit<OTHoursPerDay, 'id'>): Promise<OTHoursPerDay> => {
  // Ensure refCode is always sent as string and trimmed
  const payload = {
    ...body,
    refCode: String(body.refCode).trim()
  };
  const res = await apiClient.post('/AdditonalOTHoursPerWeek/PerDay', payload);
  return res.data;
};

const updatePerDay = async (id: number, body: OTHoursPerDay): Promise<OTHoursPerDay> => {
  // Ensure refCode is always sent as string and trimmed
  const payload = {
    ...body,
    refCode: String(body.refCode).trim()
  };
  const res = await apiClient.put(`/AdditonalOTHoursPerWeek/PerDay/${id}`, payload);
  return res.data;
};

const deletePerDay = async (id: number): Promise<void> => {
  await apiClient.delete(`/AdditonalOTHoursPerWeek/PerDay/${id}`);
};

// Per Week
const fetchAllPerWeek = async (): Promise<OTHoursPerWeek[]> => {
  const res = await apiClient.get('/AdditonalOTHoursPerWeek/PerWeek');
  return res.data ?? [];
};

const createPerWeek = async (body: Omit<OTHoursPerWeek, 'id'>): Promise<OTHoursPerWeek> => {
  // Ensure refCode is always sent as string and trimmed
  const payload = {
    ...body,
    refCode: String(body.refCode).trim()
  };
  const res = await apiClient.post('/AdditonalOTHoursPerWeek/PerWeek', payload);
  return res.data;
};

const updatePerWeek = async (id: number, body: OTHoursPerWeek): Promise<OTHoursPerWeek> => {
  // Ensure refCode is always sent as string and trimmed
  const payload = {
    ...body,
    refCode: String(body.refCode).trim()
  };
  const res = await apiClient.put(`/AdditonalOTHoursPerWeek/PerWeek/${id}`, payload);
  return res.data;
};

const deletePerWeek = async (id: number): Promise<void> => {
  await apiClient.delete(`/AdditonalOTHoursPerWeek/PerWeek/${id}`);
};

// OT Week Schedule
const fetchAllOTWeekSchedule = async (): Promise<OTWeekSchedule[]> => {
  const res = await apiClient.get('/AdditonalOTHoursPerWeek/OTWeek');
  return res.data ?? [];
};

const saveOTWeek = async (body: OTWeekSchedule): Promise<OTWeekSchedule> => {
  // Ensure refCode is always sent as string and trimmed
  const payload = {
    ...body,
    refCode: String(body.refCode || "").trim()
  };
  const res = await apiClient.post('/AdditonalOTHoursPerWeek/OTWeek', payload);
  return res.data;
};

const updateOTWeek = async (refCode: string, body: OTWeekSchedule): Promise<OTWeekSchedule> => {
  // Ensure refCode is always sent as string and trimmed
  const payload = {
    ...body,
    refCode: String(body.refCode).trim()
  };
  const res = await apiClient.put(`/AdditonalOTHoursPerWeek/OTWeek/${refCode.trim()}`, payload);
  return res.data;
};

// Fetch ALL OTWeek records (for reference browse modal) — reuses fetchAllOTWeekSchedule
const fetchAllOTWeek = fetchAllOTWeekSchedule;

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdditionalOTHoursPerWeekPage() {
  const [referenceCode, setReferenceCode] = useState("");
  const [selectedPerDayRow, setSelectedPerDayRow] = useState<number | null>(null);
  const [selectedPerWeekRow, setSelectedPerWeekRow] = useState<number | null>(null);

  // Modal visibility
  const [showAddPerDayModal, setShowAddPerDayModal] = useState(false);
  const [showAddPerWeekModal, setShowAddPerWeekModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showReferenceSearchModal, setShowReferenceSearchModal] = useState(false);

  // Edit row modals
  const [editPerDayRow, setEditPerDayRow] = useState<OTHoursPerDay | null>(null);
  const [editPerWeekRow, setEditPerWeekRow] = useState<OTHoursPerWeek | null>(null);

  // Search
  const [searchCurrentPage, setSearchCurrentPage] = useState(1);
  const [referenceSearchPage, setReferenceSearchPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedField, setSelectedField] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  // API data
  const [otFileCodes, setOtFileCodes] = useState<OTFileSetup[]>([]);
  const [otWeekList, setOtWeekList] = useState<OTWeekSchedule[]>([]);
  const [otHoursPerDay, setOtHoursPerDay] = useState<OTHoursPerDay[]>([]);
  const [otHoursPerWeek, setOtHoursPerWeek] = useState<OTHoursPerWeek[]>([]);
  const [scheduleData, setScheduleData] = useState<OTWeekSchedule>({
    refCode: "",
    day: "Monday",
    regularDay: "",
    restDay: "",
    legal: "",
    special: "",
    paidLeave: false,
  });

  // Loading states
  const [loadingData, setLoadingData] = useState(false);
  const [loadingOTCodes, setLoadingOTCodes] = useState(false);
  const [loadingRefModal, setLoadingRefModal] = useState(false);
  const [savingOTWeek, setSavingOTWeek] = useState(false);
  const [savingPerDay, setSavingPerDay] = useState(false);
  const [savingPerWeek, setSavingPerWeek] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Add form state
  const [newPerDay, setNewPerDay] = useState({ noHours: "", equalHours: "" });
  const [newPerWeek, setNewPerWeek] = useState({ noHoursPerWeek: "", equalHoursPerWeek: "" });

  const itemsPerPage = 10;

  // Permissions
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const hasPermission = (accessType: string) => permissions[accessType] === true;

  // ─── Init ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    getPermissions();
  }, []);

  const getPermissions = () => {
    const rawPayload = localStorage.getItem("loginPayload");
    if (!rawPayload) return;
    try {
      const parsedPayload = JSON.parse(rawPayload);
      const encryptedArray: any[] = parsedPayload.permissions || [];
      const branchEntries = encryptedArray.filter(
        (p) => decryptData(p.formName) === "AdditionalOTHoursPerWeek"
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

  // ─── Load data by reference code ────────────────────────────────────────────

  const loadDataForRef = useCallback(async (refCode: string) => {
    if (!refCode) return;
    setLoadingData(true);
    try {
      const [perDayData, perWeekData, otWeekData] = await Promise.allSettled([
        fetchAllPerDay(),
        fetchAllPerWeek(),
        fetchAllOTWeekSchedule(),
      ]);

      // Filter client-side by refCode (as string, trimmed)
      const trimmedRefCode = refCode.trim();
      
      if (perDayData.status === "fulfilled") {
        const filtered = (perDayData.value ?? []).filter((r) => String(r.refCode).trim() === trimmedRefCode);
        setOtHoursPerDay(filtered);
        console.log("Looking for refCode:", trimmedRefCode);
        console.log("Per Day - All data:", perDayData.value);
        console.log("Per Day - Filtered:", filtered);
      } else {
        setOtHoursPerDay([]);
      }

      if (perWeekData.status === "fulfilled") {
        const allData = perWeekData.value ?? [];
        console.log("Per Week - All data:", allData);
        console.log("Per Week - Looking for refCode:", trimmedRefCode, "type:", typeof trimmedRefCode);
        allData.forEach(r => {
          console.log("  - Record refCode:", r.refCode, "trimmed:", String(r.refCode).trim(), "type:", typeof r.refCode, "matches:", String(r.refCode).trim() === trimmedRefCode);
        });
        const filtered = allData.filter((r) => String(r.refCode).trim() === trimmedRefCode);
        setOtHoursPerWeek(filtered);
        console.log("Per Week - Filtered:", filtered);
      } else {
        setOtHoursPerWeek([]);
      }

      if (otWeekData.status === "fulfilled") {
        const match = (otWeekData.value ?? []).find(
          (r) => String(r.refCode).trim() === trimmedRefCode
        );
        if (match) {
          setScheduleData(match);
        } else {
          setScheduleData({
            refCode: trimmedRefCode,
            day: "Monday",
            regularDay: "",
            restDay: "",
            legal: "",
            special: "",
            paidLeave: false,
          });
        }
      } else {
        setScheduleData({
          refCode: trimmedRefCode,
          day: "Monday",
          regularDay: "",
          restDay: "",
          legal: "",
          special: "",
          paidLeave: false,
        });
      }

      setSelectedPerDayRow(null);
      setSelectedPerWeekRow(null);
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || err.message || "Failed to load data" });
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Load OT file codes for search modal
  const loadOTFileCodes = async () => {
    if (otFileCodes.length > 0) return;
    setLoadingOTCodes(true);
    try {
      const data = await fetchOTFileCodes();
      setOtFileCodes(data ?? []);
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || err.message || "Failed to load OT codes" });
    } finally {
      setLoadingOTCodes(false);
    }
  };

  // ─── Modal search handlers ────────────────────────────────────────────────

  const handleOpenSearchModal = (field: string) => {
    setSelectedField(field);
    setSearchQuery("");
    setSearchCurrentPage(1);
    setShowSearchModal(true);
    loadOTFileCodes();
  };

  const handleSelectOTCode = (code: string) => {
    setScheduleData((prev) => ({ ...prev, [selectedField === "regularDay" ? "regularDay"
      : selectedField === "restDay" ? "restDay"
      : selectedField === "legalHoliday" ? "legal"
      : "special"]: code }));
    setShowSearchModal(false);
  };

  // ─── CRUD: Reference ──────────────────────────────────────────────────────

  const handleCreateNew = () => {
    setReferenceCode("");
    setOtHoursPerDay([]);
    setOtHoursPerWeek([]);
    setScheduleData({
      refCode: "",
      day: "Monday",
      regularDay: "",
      restDay: "",
      legal: "",
      special: "",
      paidLeave: false,
    });
    setIsEditing(true);
  };

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    setSavingOTWeek(true);
    try {
      // If referenceCode exists and has a value, it's an update, otherwise it's new
      const isNew = !referenceCode || referenceCode.trim() === "";

      let savedRefCode: string;

      if (isNew) {
        // CREATE MODE - Use POST for all records
        const payload: OTWeekSchedule = { ...scheduleData, refCode: "" };
        const response = await saveOTWeek(payload);
        savedRefCode = response.refCode;
        setReferenceCode(savedRefCode);
        setScheduleData(response);

        // Create all per-day records with POST (including those with temporary IDs)
        if (otHoursPerDay.length > 0) {
          const updatedPerDay = await Promise.all(
            otHoursPerDay.map((row) =>
              createPerDay({ refCode: savedRefCode, noHours: row.noHours, equalHours: row.equalHours })
            )
          );
          setOtHoursPerDay(updatedPerDay);
        }

        // Create all per-week records with POST (including those with temporary IDs)
        if (otHoursPerWeek.length > 0) {
          const updatedPerWeek = await Promise.all(
            otHoursPerWeek.map((row) =>
              createPerWeek({ refCode: savedRefCode, noHoursPerWeek: row.noHoursPerWeek, equalHoursPerWeek: row.equalHoursPerWeek })
            )
          );
          setOtHoursPerWeek(updatedPerWeek);
        }
      } else {
        // UPDATE MODE - Use PUT for existing records, POST for new ones (with temporary IDs)
        const payload: OTWeekSchedule = { ...scheduleData, refCode: referenceCode };
        const response = await updateOTWeek(referenceCode, payload);
        setScheduleData(response);
        
        // Handle per-day records
        if (otHoursPerDay.length > 0) {
          const updatedPerDay = await Promise.all(
            otHoursPerDay.map((row) => {
              // If ID is negative (temporary), create new; otherwise update existing
              if (row.id < 0) {
                return createPerDay({ refCode: referenceCode, noHours: row.noHours, equalHours: row.equalHours });
              } else {
                return updatePerDay(row.id, row);
              }
            })
          );
          setOtHoursPerDay(updatedPerDay);
        }

        // Handle per-week records
        if (otHoursPerWeek.length > 0) {
          const updatedPerWeek = await Promise.all(
            otHoursPerWeek.map((row) => {
              // If ID is negative (temporary), create new; otherwise update existing
              if (row.id < 0) {
                return createPerWeek({ refCode: referenceCode, noHoursPerWeek: row.noHoursPerWeek, equalHoursPerWeek: row.equalHoursPerWeek });
              } else {
                return updatePerWeek(row.id, row);
              }
            })
          );
          setOtHoursPerWeek(updatedPerWeek);
        }
      }

      Swal.fire({ icon: "success", title: "Saved", text: "Record saved successfully.", timer: 1800, showConfirmButton: false });
      setIsEditing(false);
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || err.message || "Failed to save" });
    } finally {
      setSavingOTWeek(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadDataForRef(referenceCode);
  };

  const handleSearch = async () => {
    setShowReferenceSearchModal(true);
    setReferenceSearchPage(1);
    setSearchQuery("");
    setLoadingRefModal(true);
    try {
      const data = await fetchAllOTWeek();
      setOtWeekList(data ?? []);
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || err.message || "Failed to load records" });
    } finally {
      setLoadingRefModal(false);
    }
  };

  // ─── CRUD: Per Day ────────────────────────────────────────────────────────

  const handleAddPerDay = async () => {
    if (!newPerDay.noHours || !newPerDay.equalHours) return;
    
    // If in edit mode and no refCode yet, add to local state (will be saved when main record is saved)
    const refCode = scheduleData.refCode || referenceCode || "";
    
    if (refCode === "" && isEditing) {
      // Add to local state without API call - will be saved when main record is saved
      const tempId = -(otHoursPerDay.length + 1); // temporary negative ID
      setOtHoursPerDay((prev) => [...prev, { 
        id: tempId, 
        refCode: "", 
        noHours: newPerDay.noHours, 
        equalHours: newPerDay.equalHours 
      }]);
      setNewPerDay({ noHours: "", equalHours: "" });
      setShowAddPerDayModal(false);
      return;
    }
    
    // If refCode exists, save directly to API
    setSavingPerDay(true);
    try {
      const created = await createPerDay({ refCode: refCode, noHours: newPerDay.noHours, equalHours: newPerDay.equalHours });
      setOtHoursPerDay((prev) => [...prev, created]);
      setNewPerDay({ noHours: "", equalHours: "" });
      setShowAddPerDayModal(false);
      Swal.fire({ icon: "success", title: "Added", text: "Entry added successfully.", timer: 1500, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || err.message || "Failed to add entry" });
    } finally {
      setSavingPerDay(false);
    }
  };

  const handleUpdatePerDay = async () => {
    if (!editPerDayRow) return;
    setSavingPerDay(true);
    try {
      const updated = await updatePerDay(editPerDayRow.id, editPerDayRow);
      setOtHoursPerDay((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setEditPerDayRow(null);
      Swal.fire({ icon: "success", title: "Updated", text: "Entry updated successfully.", timer: 1500, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || err.message || "Failed to update" });
    } finally {
      setSavingPerDay(false);
    }
  };

  const handleDeletePerDay = async (id: number) => {
    // If it's a temporary ID (negative), just remove from local state
    if (id < 0) {
      setOtHoursPerDay((prev) => prev.filter((r) => r.id !== id));
      return;
    }
    
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete Entry",
      text: "Are you sure you want to delete this entry? This action cannot be undone.",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    setDeletingId(id);
    try {
      await deletePerDay(id);
      setOtHoursPerDay((prev) => prev.filter((r) => r.id !== id));
      Swal.fire({ icon: "success", title: "Deleted", text: "Entry deleted successfully.", timer: 1500, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || err.message || "Failed to delete" });
    } finally {
      setDeletingId(null);
    }
  };

  // ─── CRUD: Per Week ───────────────────────────────────────────────────────

  const handleAddPerWeek = async () => {
    if (!newPerWeek.noHoursPerWeek || !newPerWeek.equalHoursPerWeek) return;
    
    // If in edit mode and no refCode yet, add to local state (will be saved when main record is saved)
    const refCode = scheduleData.refCode || referenceCode || "";
    
    if (refCode === "" && isEditing) {
      // Add to local state without API call - will be saved when main record is saved
      const tempId = -(otHoursPerWeek.length + 1); // temporary negative ID
      setOtHoursPerWeek((prev) => [...prev, { 
        id: tempId, 
        refCode: "", 
        noHoursPerWeek: newPerWeek.noHoursPerWeek, 
        equalHoursPerWeek: newPerWeek.equalHoursPerWeek 
      }]);
      setNewPerWeek({ noHoursPerWeek: "", equalHoursPerWeek: "" });
      setShowAddPerWeekModal(false);
      return;
    }
    
    // If refCode exists, save directly to API
    setSavingPerWeek(true);
    try {
      const created = await createPerWeek({ refCode: refCode, noHoursPerWeek: newPerWeek.noHoursPerWeek, equalHoursPerWeek: newPerWeek.equalHoursPerWeek });
      setOtHoursPerWeek((prev) => [...prev, created]);
      setNewPerWeek({ noHoursPerWeek: "", equalHoursPerWeek: "" });
      setShowAddPerWeekModal(false);
      Swal.fire({ icon: "success", title: "Added", text: "Entry added successfully.", timer: 1500, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || err.message || "Failed to add entry" });
    } finally {
      setSavingPerWeek(false);
    }
  };

  const handleUpdatePerWeek = async () => {
    if (!editPerWeekRow) return;
    setSavingPerWeek(true);
    try {
      const updated = await updatePerWeek(editPerWeekRow.id, editPerWeekRow);
      setOtHoursPerWeek((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setEditPerWeekRow(null);
      Swal.fire({ icon: "success", title: "Updated", text: "Entry updated successfully.", timer: 1500, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || err.message || "Failed to update" });
    } finally {
      setSavingPerWeek(false);
    }
  };

  const handleDeletePerWeek = async (id: number) => {
    // If it's a temporary ID (negative), just remove from local state
    if (id < 0) {
      setOtHoursPerWeek((prev) => prev.filter((r) => r.id !== id));
      return;
    }
    
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete Entry",
      text: "Are you sure you want to delete this entry? This action cannot be undone.",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    setDeletingId(id);
    try {
      await deletePerWeek(id);
      setOtHoursPerWeek((prev) => prev.filter((r) => r.id !== id));
      Swal.fire({ icon: "success", title: "Deleted", text: "Entry deleted successfully.", timer: 1500, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || err.message || "Failed to delete" });
    } finally {
      setDeletingId(null);
    }
  };

  // ─── ESC key handler ──────────────────────────────────────────────────────

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (showSearchModal) setShowSearchModal(false);
      else if (showReferenceSearchModal) setShowReferenceSearchModal(false);
      else if (showAddPerDayModal) { setShowAddPerDayModal(false); setNewPerDay({ noHours: "", equalHours: "" }); }
      else if (editPerDayRow) setEditPerDayRow(null);
      else if (showAddPerWeekModal) { setShowAddPerWeekModal(false); setNewPerWeek({ noHoursPerWeek: "", equalHoursPerWeek: "" }); }
      else if (editPerWeekRow) setEditPerWeekRow(null);
    };
    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [showSearchModal, showReferenceSearchModal, showAddPerDayModal, showAddPerWeekModal, editPerDayRow, editPerWeekRow]);

  // ─── Computed: OT Code search modal pagination ────────────────────────────

  const totalSearchPages = Math.ceil(otFileCodes.length / itemsPerPage);
  const currentOTCodes = otFileCodes.slice(
    (searchCurrentPage - 1) * itemsPerPage,
    searchCurrentPage * itemsPerPage
  );

  // ─── Render ───────────────────────────────────────────────────────────────

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
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    Configure additional overtime hours tracking per week. Set up hourly equivalents for both daily and weekly overtime schedules, and define overtime rate codes for different scenarios including regular days, rest days, and holidays.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {[
                      "Daily and weekly OT hour tracking",
                      "Equivalent hours configuration",
                      "Day-specific OT rate codes",
                      "Leave as worked time option",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Reference Code and Action Buttons */}
            {hasPermission("View") && (
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <label className="text-gray-700">Reference Code:</label>
                  <input
                    type="text"
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        referenceCode.trim()
                          ? loadDataForRef(referenceCode.trim())
                          : handleSearch();
                      }
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                    placeholder="Ref Code"
                  />
                  <button
                    onClick={() =>
                      referenceCode.trim()
                        ? loadDataForRef(referenceCode.trim())
                        : handleSearch()
                    }
                    disabled={loadingData}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                    title={referenceCode.trim() ? "Filter by ref code" : "Browse all records"}
                  >
                    {loadingData ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setReferenceCode("");
                      setOtHoursPerDay([]);
                      setOtHoursPerWeek([]);
                      setScheduleData({
                        refCode: "",
                        day: "Monday",
                        regularDay: "",
                        restDay: "",
                        legal: "",
                        special: "",
                        paidLeave: false,
                      });
                      setIsEditing(false);
                    }}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    title="Clear"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
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
                  {isEditing && (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={savingOTWeek}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60"
                      >
                        {savingOTWeek ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {(referenceCode && referenceCode.trim() !== "") || scheduleData.id ? "Update" : "Save"}
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

            {/* Loading overlay */}
            {loadingData && (
              <div className="flex items-center justify-center py-16 text-gray-400 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-sm">Loading data for ref {referenceCode}…</span>
              </div>
            )}

            {/* Main Grid */}
            {hasPermission("View") && !loadingData ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ─── Left: Tables ─────────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-6">
                  {/* OT Hours Per Day Table */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700">OT Hours Per Day</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-gray-700 text-sm">No. Of Hours</th>
                            <th className="px-6 py-3 text-left text-gray-700 text-sm">Equivalent Hours</th>
                            {(hasPermission("Edit") || hasPermission("Delete")) && (
                              <th className="px-4 py-3 text-center text-gray-700 text-sm w-24">Actions</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {otHoursPerDay.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="px-6 py-6 text-center text-gray-400 text-sm">
                                No entries. Click "Add Entry" to get started.
                              </td>
                            </tr>
                          ) : (
                            otHoursPerDay.map((record, index) => (
                              <tr
                                key={record.id}
                                onClick={() => setSelectedPerDayRow(index)}
                                className={`cursor-pointer transition-colors ${
                                  selectedPerDayRow === index ? "bg-blue-50" : "hover:bg-gray-50"
                                }`}
                              >
                                <td className="px-6 py-3 text-gray-900 text-sm">{record.noHours}</td>
                                <td className="px-6 py-3 text-gray-900 text-sm">{record.equalHours}</td>
                                {(hasPermission("Edit") || hasPermission("Delete")) && (
                                  <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      {hasPermission("Edit") && (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); setEditPerDayRow({ ...record }); }}
                                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                          title="Edit"
                                        >
                                          <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                      {hasPermission("Delete") && (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleDeletePerDay(record.id); }}
                                          disabled={deletingId === record.id}
                                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                                          title="Delete"
                                        >
                                          {deletingId === record.id ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          ) : (
                                            <Trash2 className="w-3.5 h-3.5" />
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    {hasPermission("Add") && (
                      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                        <button
                          onClick={() => setShowAddPerDayModal(true)}
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add Entry
                        </button>
                      </div>
                    )}
                  </div>

                  {/* OT Hours Per Week Table */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700">OT Hours Per Week</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-gray-700 text-sm">No. Of Hours Per Week</th>
                            <th className="px-6 py-3 text-left text-gray-700 text-sm">Equivalent Hours Per Week</th>
                            {(hasPermission("Edit") || hasPermission("Delete")) && (
                              <th className="px-4 py-3 text-center text-gray-700 text-sm w-24">Actions</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {otHoursPerWeek.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="px-6 py-6 text-center text-gray-400 text-sm">
                                No entries. Click "Add Entry" to get started.
                              </td>
                            </tr>
                          ) : (
                            otHoursPerWeek.map((record, index) => (
                              <tr
                                key={record.id}
                                onClick={() => setSelectedPerWeekRow(index)}
                                className={`cursor-pointer transition-colors ${
                                  selectedPerWeekRow === index ? "bg-blue-50" : "hover:bg-gray-50"
                                }`}
                              >
                                <td className="px-6 py-3 text-gray-900 text-sm">{record.noHoursPerWeek}</td>
                                <td className="px-6 py-3 text-gray-900 text-sm">{record.equalHoursPerWeek}</td>
                                {(hasPermission("Edit") || hasPermission("Delete")) && (
                                  <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      {hasPermission("Edit") && (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); setEditPerWeekRow({ ...record }); }}
                                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                          title="Edit"
                                        >
                                          <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                      {hasPermission("Delete") && (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleDeletePerWeek(record.id); }}
                                          disabled={deletingId === record.id}
                                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                                          title="Delete"
                                        >
                                          {deletingId === record.id ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          ) : (
                                            <Trash2 className="w-3.5 h-3.5" />
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    {hasPermission("Add") && (
                      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                        <button
                          onClick={() => setShowAddPerWeekModal(true)}
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add Entry
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── Right: Schedule Configuration ────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-gray-900 mb-4 text-sm font-semibold">
                    Schedule of additional hours per week
                  </h3>
                  <div className="space-y-4">
                    {/* Day */}
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Day</label>
                      <select
                        value={scheduleData.day}
                        disabled={!isEditing}
                        onChange={(e) => setScheduleData({ ...scheduleData, day: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                      >
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                          <option key={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-2">
                      <p className="text-gray-700 text-sm mb-3 font-medium">
                        Overtime rate basis for additional hours per week
                      </p>

                      {/* Regular Day */}
                      {(["regularDay", "restDay", "legal", "special"] as const).map((field) => {
                        const labels: Record<string, string> = {
                          regularDay: "Regular Day",
                          restDay: "Rest Day",
                          legal: "Legal Holiday",
                          special: "Special National",
                        };
                        const modalField = field === "legal" ? "legalHoliday" : field === "special" ? "specialNational" : field;
                        return (
                          <div className="mb-3" key={field}>
                            <label className="block text-gray-700 mb-1 text-sm">{labels[field]}</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={scheduleData[field]}
                                readOnly
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 cursor-not-allowed"
                              />
                              <button
                                disabled={!isEditing}
                                onClick={() => handleOpenSearchModal(modalField)}
                                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                …
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Leave checkbox */}
                      <div className="flex items-center gap-2 mt-4">
                        <input
                          type="checkbox"
                          id="leaveWorked"
                          checked={scheduleData.paidLeave}
                          disabled={!isEditing}
                          onChange={(e) => setScheduleData({ ...scheduleData, paidLeave: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                        />
                        <label htmlFor="leaveWorked" className="text-gray-700 text-sm">
                          Leave is Considered as part of worked rendered
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : !loadingData ? (
              <div className="text-center py-10 text-gray-500">
                You do not have permission to view this list.
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ─── Add / Edit OT Hours Per Day Modal ───────────────────────────────── */}
      {(showAddPerDayModal || editPerDayRow) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Sticky Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0 z-10">
              <h2 className="text-gray-900 font-semibold text-base">
                {editPerDayRow ? "Edit" : "Create New"}
              </h2>
              <button
                onClick={() => { setShowAddPerDayModal(false); setEditPerDayRow(null); setNewPerDay({ noHours: "", equalHours: "" }); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => { e.preventDefault(); editPerDayRow ? handleUpdatePerDay() : handleAddPerDay(); }}
              className="p-6"
            >
              <h3 className="text-blue-600 font-medium mb-4 text-sm">OT Hours Per Day</h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-40">No of Hours :</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editPerDayRow ? editPerDayRow.noHours : newPerDay.noHours}
                    onChange={(e) =>
                      editPerDayRow
                        ? setEditPerDayRow({ ...editPerDayRow, noHours: e.target.value })
                        : setNewPerDay({ ...newPerDay, noHours: e.target.value })
                    }
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="e.g. 8"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-40">Equivalent Hours :</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editPerDayRow ? editPerDayRow.equalHours : newPerDay.equalHours}
                    onChange={(e) =>
                      editPerDayRow
                        ? setEditPerDayRow({ ...editPerDayRow, equalHours: e.target.value })
                        : setNewPerDay({ ...newPerDay, equalHours: e.target.value })
                    }
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="e.g. 8"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={savingPerDay}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm"
                >
                  {savingPerDay && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editPerDayRow ? "Update" : "Submit"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddPerDayModal(false); setEditPerDayRow(null); setNewPerDay({ noHours: "", equalHours: "" }); }}
                  disabled={savingPerDay}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm"
                >
                  Back to List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Add / Edit OT Hours Per Week Modal ──────────────────────────────── */}
      {(showAddPerWeekModal || editPerWeekRow) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Sticky Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0 z-10">
              <h2 className="text-gray-900 font-semibold text-base">
                {editPerWeekRow ? "Edit" : "Create New"}
              </h2>
              <button
                onClick={() => { setShowAddPerWeekModal(false); setEditPerWeekRow(null); setNewPerWeek({ noHoursPerWeek: "", equalHoursPerWeek: "" }); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => { e.preventDefault(); editPerWeekRow ? handleUpdatePerWeek() : handleAddPerWeek(); }}
              className="p-6"
            >
              <h3 className="text-blue-600 font-medium mb-4 text-sm">OT Hours Per Week</h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-48">No of Hours Per Week :</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editPerWeekRow ? editPerWeekRow.noHoursPerWeek : newPerWeek.noHoursPerWeek}
                    onChange={(e) =>
                      editPerWeekRow
                        ? setEditPerWeekRow({ ...editPerWeekRow, noHoursPerWeek: e.target.value })
                        : setNewPerWeek({ ...newPerWeek, noHoursPerWeek: e.target.value })
                    }
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="e.g. 40"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-48">Equivalent Hours Per Week :</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editPerWeekRow ? editPerWeekRow.equalHoursPerWeek : newPerWeek.equalHoursPerWeek}
                    onChange={(e) =>
                      editPerWeekRow
                        ? setEditPerWeekRow({ ...editPerWeekRow, equalHoursPerWeek: e.target.value })
                        : setNewPerWeek({ ...newPerWeek, equalHoursPerWeek: e.target.value })
                    }
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="e.g. 40"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={savingPerWeek}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm"
                >
                  {savingPerWeek && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editPerWeekRow ? "Update" : "Submit"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddPerWeekModal(false); setEditPerWeekRow(null); setNewPerWeek({ noHoursPerWeek: "", equalHoursPerWeek: "" }); }}
                  disabled={savingPerWeek}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm"
                >
                  Back to List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── OT Code Search Modal (for schedule fields) ───────────────────────── */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg flex-shrink-0">
              <div className="flex items-center gap-3 flex-1">
                <h2 className="text-blue-600 text-sm font-semibold whitespace-nowrap">Search OT Codes</h2>
                <div className="relative flex-1 max-w-xs ml-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setSearchCurrentPage(1); }}
                    placeholder="Filter by code or description…"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    autoFocus
                  />
                </div>
              </div>
              <button onClick={() => setShowSearchModal(false)} className="text-gray-400 hover:text-gray-600 ml-3 flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto p-0">
              {loadingOTCodes ? (
                <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  <span className="text-sm">Loading OT codes…</span>
                </div>
              ) : (() => {
                  const filtered = otFileCodes.filter(
                    (c) =>
                      searchQuery === "" ||
                      c.otfCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.earnCode.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  const totalPgs = Math.ceil(filtered.length / itemsPerPage);
                  const paged = filtered.slice(
                    (searchCurrentPage - 1) * itemsPerPage,
                    searchCurrentPage * itemsPerPage
                  );
                  return (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                              <th className="px-4 py-3 text-left text-gray-600 font-medium whitespace-nowrap">OT Code</th>
                              <th className="px-4 py-3 text-left text-gray-600 font-medium">Description</th>
                              <th className="px-4 py-3 text-left text-gray-600 font-medium whitespace-nowrap">Earn Code</th>
                              <th className="px-4 py-3 text-right text-gray-600 font-medium whitespace-nowrap">Rate 1</th>
                              <th className="px-4 py-3 text-right text-gray-600 font-medium whitespace-nowrap">Rate 2</th>
                              <th className="px-4 py-3 text-right text-gray-600 font-medium whitespace-nowrap">Def Amt</th>
                              <th className="px-4 py-3 text-center text-gray-600 font-medium whitespace-nowrap">Inc Payslip</th>
                              <th className="px-4 py-3 text-center text-gray-600 font-medium whitespace-nowrap">Inc Cola OT</th>
                              <th className="px-4 py-3 text-center text-gray-600 font-medium whitespace-nowrap">Inc Cola Basic</th>
                              <th className="px-4 py-3 text-center text-gray-600 font-medium whitespace-nowrap">Exemption</th>
                              <th className="px-4 py-3 text-center text-gray-600 font-medium">Select</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {paged.length === 0 ? (
                              <tr>
                                <td colSpan={11} className="px-4 py-10 text-center text-gray-400">
                                  No OT codes match your search.
                                </td>
                              </tr>
                            ) : (
                              paged.map((record) => (
                                <tr
                                  key={record.otfid}
                                  onClick={() => handleSelectOTCode(record.otfCode)}
                                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                                >
                                  <td className="px-4 py-2.5 font-medium text-blue-700 whitespace-nowrap">
                                    {record.otfCode}
                                  </td>
                                  <td className="px-4 py-2.5 text-gray-800">{record.description}</td>
                                  <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{record.earnCode}</td>
                                  <td className="px-4 py-2.5 text-right text-gray-800 whitespace-nowrap">
                                    {record.rate1.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-2.5 text-right text-gray-800 whitespace-nowrap">
                                    {record.rate2.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-2.5 text-right text-gray-800 whitespace-nowrap">
                                    {record.defAmt.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-2.5 text-center text-gray-600">{record.incPayslip}</td>
                                  <td className="px-4 py-2.5 text-center text-gray-600">{record.incColaOT}</td>
                                  <td className="px-4 py-2.5 text-center text-gray-600">{record.incColaBasic}</td>
                                  <td className="px-4 py-2.5 text-center">
                                    {record.isExemptionRpt ? (
                                      <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 rounded-full">
                                        <Check className="w-3 h-3 text-green-600" />
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-100 rounded-full">
                                        <X className="w-3 h-3 text-gray-400" />
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2.5 text-center">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleSelectOTCode(record.otfCode); }}
                                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
                                    >
                                      Select
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {totalPgs > 1 && (
                        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50">
                          <span className="text-xs text-gray-500">
                            Showing {((searchCurrentPage - 1) * itemsPerPage) + 1}–{Math.min(searchCurrentPage * itemsPerPage, filtered.length)} of {filtered.length} records
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSearchCurrentPage((p) => Math.max(1, p - 1))}
                              disabled={searchCurrentPage === 1}
                              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-40 text-xs"
                            >
                              Previous
                            </button>
                            {Array.from({ length: Math.min(7, totalPgs) }, (_, i) => i + 1).map((pg) => (
                              <button
                                key={pg}
                                onClick={() => setSearchCurrentPage(pg)}
                                className={`px-3 py-1.5 rounded text-xs transition-colors ${
                                  searchCurrentPage === pg
                                    ? "bg-blue-600 text-white"
                                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                {pg}
                              </button>
                            ))}
                            <button
                              onClick={() => setSearchCurrentPage((p) => Math.min(totalPgs, p + 1))}
                              disabled={searchCurrentPage >= totalPgs}
                              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-40 text-xs"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()
              }
            </div>

            {/* Footer */}
            <div className="flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg flex-shrink-0">
              <button
                onClick={() => setShowSearchModal(false)}
                className="px-6 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Reference Browse Modal ───────────────────────────────────────────── */}
      {showReferenceSearchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg flex-shrink-0">
              <h2 className="text-gray-900 font-semibold text-sm">Additional OT per Week</h2>
              <button
                onClick={() => setShowReferenceSearchModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search bar */}
            <div className="flex items-center justify-end gap-3 px-6 py-3 border-b border-gray-100 flex-shrink-0">
              <label className="text-gray-600 text-sm">Search:</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setReferenceSearchPage(1); }}
                autoFocus
                className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-52"
              />
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              {loadingRefModal ? (
                <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  <span className="text-sm">Loading…</span>
                </div>
              ) : (() => {
                  const filtered = otWeekList.filter(
                    (r) =>
                      searchQuery === "" ||
                      String(r.refCode).includes(searchQuery) ||
                      r.day.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      r.regularDay.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      r.restDay.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      r.legal.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      r.special.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  const totalPgs = Math.ceil(filtered.length / itemsPerPage);
                  const paged = filtered.slice(
                    (referenceSearchPage - 1) * itemsPerPage,
                    referenceSearchPage * itemsPerPage
                  );

                  return (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                              <th className="px-4 py-3 text-left text-gray-700 font-semibold whitespace-nowrap">
                                Ref Code
                              </th>
                              <th className="px-4 py-3 text-left text-gray-700 font-semibold whitespace-nowrap">
                                Day
                              </th>
                              <th className="px-4 py-3 text-left text-gray-700 font-semibold whitespace-nowrap">
                                Regular Day
                              </th>
                              <th className="px-4 py-3 text-left text-gray-700 font-semibold whitespace-nowrap">
                                Rest Day
                              </th>
                              <th className="px-4 py-3 text-left text-gray-700 font-semibold whitespace-nowrap">
                                Legal
                              </th>
                              <th className="px-4 py-3 text-left text-gray-700 font-semibold whitespace-nowrap">
                                Special
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {paged.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                                  {otWeekList.length === 0 ? "No records found." : "No results match your search."}
                                </td>
                              </tr>
                            ) : (
                              paged.map((record) => (
                                <tr
                                  key={record.refCode}
                                  onClick={() => {
                                    const refCodeStr = String(record.refCode);
                                    setReferenceCode(refCodeStr);
                                    setShowReferenceSearchModal(false);
                                    loadDataForRef(refCodeStr);
                                  }}
                                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                                >
                                  <td className="px-4 py-3 text-gray-900 font-medium">{record.refCode}</td>
                                  <td className="px-4 py-3 text-gray-700">{record.day}</td>
                                  <td className="px-4 py-3 text-gray-700">{record.regularDay}</td>
                                  <td className="px-4 py-3 text-gray-700">{record.restDay}</td>
                                  <td className="px-4 py-3 text-gray-700">{record.legal}</td>
                                  <td className="px-4 py-3 text-gray-700">{record.special}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {totalPgs > 1 && (
                        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50">
                          <span className="text-xs text-gray-500">
                            Showing {Math.min((referenceSearchPage - 1) * itemsPerPage + 1, filtered.length)}–{Math.min(referenceSearchPage * itemsPerPage, filtered.length)} of {filtered.length} records
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setReferenceSearchPage((p) => Math.max(1, p - 1))}
                              disabled={referenceSearchPage === 1}
                              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-40 text-xs"
                            >
                              Previous
                            </button>
                            {Array.from({ length: Math.min(7, totalPgs) }, (_, i) => i + 1).map((pg) => (
                              <button
                                key={pg}
                                onClick={() => setReferenceSearchPage(pg)}
                                className={`px-3 py-1.5 rounded text-xs transition-colors ${
                                  referenceSearchPage === pg
                                    ? "bg-blue-500 text-white"
                                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                {pg}
                              </button>
                            ))}
                            <button
                              onClick={() => setReferenceSearchPage((p) => Math.min(totalPgs, p + 1))}
                              disabled={referenceSearchPage >= totalPgs}
                              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-40 text-xs"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()
              }
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-gray-200 px-6 py-3 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setShowReferenceSearchModal(false)}
                className="px-6 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}