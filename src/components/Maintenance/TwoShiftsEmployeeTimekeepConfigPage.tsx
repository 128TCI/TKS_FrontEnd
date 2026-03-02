import { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Clock,
  ClipboardList,
  Plus,
  X,
  Check,
  Pencil,
  Save,
  Edit,
  Trash2,
  Calendar,
  Loader2,
} from 'lucide-react';
import { OvertimeApplicationModal } from '../Modals/OvertimeApplicationModal';
import { EmployeeSearchModal } from '../Modals/EmployeeSearchModal';
import { CalendarPopup } from '../CalendarPopup';
import { Footer } from '../Footer/Footer';
import apiClient from '../../services/apiClient';
import Swal from 'sweetalert2';

type TabType = 'overtime-applications' | 'workshift';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Employee {
  empID: number;
  empCode: string;
  lName: string;
  fName: string;
  grpCode: string;
}

interface WorkshiftFixed {
  id: number;
  empCode: string;
  dailySched: string;
  isFixed: boolean;
}

interface WorkshiftVariable {
  id: number;
  empCode: string;
  dateFrom: string;
  dateTo: string;
  shiftCode: string;
  dailyScheduleCode: string;
  updateDate: string;
}

interface OvertimeApplication {
  id: number;
  empCode: string;
  date: string;
  numOTHoursApproved: number;
  earlyOTStartTime: string;
  earlyTimeIn: string;
  startOTPM: string;
  minHRSOTBreak: number;
  earlyOTStartTimeRestHol: string;
  reason: string;
  remarks: string;
  approvedOTBreaksHrs: number;
  stotats: string;
  isLateFiling: boolean;
  isLateFilingProcessed: boolean;
}

interface WorkshiftCode {
  code: string;
  description: string;
}

interface DailySchedule {
  dailyScheduleID: number;
  referenceNo: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

// ─── Date / Time Helpers ──────────────────────────────────────────────────────

/** MM/DD/YYYY or M/D/YYYY → ISO midnight UTC. Returns null if empty. */
const safeDateToISO = (dateStr: string): string | null => {
  if (!dateStr || !dateStr.trim()) return null;
  try {
    const s = dateStr.trim();
    if (s.includes('/')) {
      const parts = s.split('/');
      if (parts.length === 3) {
        const m = parts[0].padStart(2, '0');
        const d = parts[1].padStart(2, '0');
        const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        return `${y}-${m}-${d}T00:00:00.000Z`;
      }
    }
    const parsed = new Date(s);
    if (!isNaN(parsed.getTime())) return parsed.toISOString();
    return null;
  } catch {
    return null;
  }
};

/**
 * "HH:MM AM/PM" → "1900-01-01THH:MM:00.000Z"
 * SQL Server uses 1900-01-01 as base date for time-only smalldatetime columns.
 * Returns null if empty or unparseable.
 */
const safeTimeToISO = (timeStr: string): string | null => {
  if (!timeStr || !timeStr.trim()) return null;
  try {
    const upper = timeStr.trim().toUpperCase();
    const match = upper.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const mins = match[2];
    const period = match[3];

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return `1900-01-01T${String(hours).padStart(2, '0')}:${mins}:00.000Z`;
  } catch {
    return null;
  }
};

/** ISO → MM/DD/YYYY */
const isoToDisplay = (iso: string): string => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const y = d.getUTCFullYear();
    return `${m}/${day}/${y}`;
  } catch {
    return '';
  }
};

/** ISO time → "HH:MM AM/PM" for display in TimePicker */
const isoTimeToDisplay = (iso: string): string => {
  if (!iso || !iso.trim()) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    let hours = d.getUTCHours();
    const mins = String(d.getUTCMinutes()).padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    return `${String(hours).padStart(2, '0')}:${mins} ${period}`;
  } catch {
    return '';
  }
};

/** MM/DD/YYYY → ISO midnight (for workshift variable) */
const mmddyyyyToISO = (s: string): string => {
  if (!s) return new Date().toISOString();
  try {
    if (s.includes('/')) {
      const [m, d, y] = s.split('/');
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T00:00:00.000Z`;
    }
    return new Date(s).toISOString();
  } catch {
    return new Date().toISOString();
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

export function TwoShiftsEmployeeTimekeepConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('workshift');
  const [empCode, setEmpCode] = useState('');
  const [tksGroup, setTksGroup] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [payPeriod] = useState('Main Monthly');

  // ── Employee search ──
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeError, setEmployeeError] = useState('');

  // ── Global Edit Mode ──
  const [isEditMode, setIsEditMode] = useState(false);

  // ── Loading ──
  const [workshiftLoading, setWorkshiftLoading] = useState(false);
  const [overtimeLoading, setOvertimeLoading] = useState(false);

  // ── Workshift State ──
  const [workshiftMode, setWorkshiftMode] = useState<'fixed' | 'variable'>('variable');
  const [fixedDailySched, setFixedDailySched] = useState('');
  const [workshiftFixedData, setWorkshiftFixedData] = useState<WorkshiftFixed | null>(null);

  // ── Workshift Fixed – Daily Schedule Search ──
  const [showDailyScheduleModal, setShowDailyScheduleModal] = useState(false);
  const [dailySchedules, setDailySchedules] = useState<DailySchedule[]>([]);
  const [dailyScheduleLoading, setDailyScheduleLoading] = useState(false);
  const [dailyScheduleSearchTerm, setDailyScheduleSearchTerm] = useState('');

  // ── Workshift Variable Modal ──
  const [showWorkshiftModal, setShowWorkshiftModal] = useState(false);
  const [isWorkshiftEditMode, setIsWorkshiftEditMode] = useState(false);
  const [currentWorkshiftId, setCurrentWorkshiftId] = useState<number | null>(null);

  const [workshiftFrom, setWorkshiftFrom] = useState('');
  const [workshiftTo, setWorkshiftTo] = useState('');
  const [showWorkshiftFromCalendar, setShowWorkshiftFromCalendar] = useState(false);
  const [showWorkshiftToCalendar, setShowWorkshiftToCalendar] = useState(false);
  const [workshiftShiftCode, setWorkshiftShiftCode] = useState('');

  const [workshiftVariableData, setWorkshiftVariableData] = useState<WorkshiftVariable[]>([]);

  // ── Workshift Code Search (portal) ──
  const [workshiftCodes, setWorkshiftCodes] = useState<WorkshiftCode[]>([]);
  const [workshiftCodesLoading, setWorkshiftCodesLoading] = useState(false);
  const [showWorkshiftCodeModal, setShowWorkshiftCodeModal] = useState(false);
  const [workshiftCodeSearchTerm, setWorkshiftCodeSearchTerm] = useState('');

  // ── Overtime Modal ──
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [isOvertimeEditMode, setIsOvertimeEditMode] = useState(false);
  const [currentOvertimeId, setCurrentOvertimeId] = useState<number | null>(null);

  // All overtime form fields — fully wired up
  const [overtimeDate, setOvertimeDate] = useState('');                         // Date field (MM/DD/YYYY)
  const [overtimeNumOTHoursApproved, setOvertimeNumOTHoursApproved] = useState('');
  const [overtimeActualDateInOTBefore, setOvertimeActualDateInOTBefore] = useState(''); // ← FIX: was hardcoded ""
  const [overtimeEarlyOTStartTime, setOvertimeEarlyOTStartTime] = useState('');         // Start Time of OT Before the Shift (time)
  const [overtimeStartOvertimeDate, setOvertimeStartOvertimeDate] = useState('');       // ← FIX: was hardcoded ""
  const [overtimeEarlyTimeIn, setOvertimeEarlyTimeIn] = useState('');                   // Start Time of Overtime (time)
  const [overtimeStartOTPM, setOvertimeStartOTPM] = useState('');
  const [overtimeMinHRSOTBreak, setOvertimeMinHRSOTBreak] = useState('');
  const [overtimeEarlyOTStartTimeRestHol, setOvertimeEarlyOTStartTimeRestHol] = useState('');
  const [overtimeReason, setOvertimeReason] = useState('');
  const [overtimeRemarks, setOvertimeRemarks] = useState('');
  const [overtimeApprovedOTBreaksHrs, setOvertimeApprovedOTBreaksHrs] = useState('');
  const [overtimeStotats, setOvertimeStotats] = useState('');
  const [overtimeIsLateFiling, setOvertimeIsLateFiling] = useState(false);

  const [overtimeApplicationsData, setOvertimeApplicationsData] = useState<OvertimeApplication[]>([]);

  // ─────────────────────────────────────────────────────────────────────────
  // GUARD
  // ─────────────────────────────────────────────────────────────────────────

  const requireEmpCode = async (): Promise<boolean> => {
    if (!empCode) {
      await Swal.fire({
        icon: 'warning',
        title: 'Employee Code Required',
        text: 'Please select an employee first before creating a record.',
      });
      return false;
    }
    return true;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RESET OVERTIME FORM
  // ─────────────────────────────────────────────────────────────────────────

  const resetOvertimeForm = () => {
    setOvertimeDate('');
    setOvertimeNumOTHoursApproved('');
    setOvertimeActualDateInOTBefore('');
    setOvertimeEarlyOTStartTime('');
    setOvertimeStartOvertimeDate('');
    setOvertimeEarlyTimeIn('');
    setOvertimeStartOTPM('');
    setOvertimeMinHRSOTBreak('');
    setOvertimeEarlyOTStartTimeRestHol('');
    setOvertimeReason('');
    setOvertimeRemarks('');
    setOvertimeApprovedOTBreaksHrs('');
    setOvertimeStotats('');
    setOvertimeIsLateFiling(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // DATA FETCHING
  // ─────────────────────────────────────────────────────────────────────────

  const fetchEmployees = async () => {
    setEmployeeLoading(true);
    setEmployeeError('');
    try {
      const response = await apiClient.get('/Maintenance/EmployeeMasterFile');
      if (response.status === 200 && response.data) {
        setEmployees(response.data);
      }
    } catch (error: any) {
      setEmployeeError(error.response?.data?.message || error.message || 'Failed to load employees');
    } finally {
      setEmployeeLoading(false);
    }
  };

  const fetchWorkshiftCodes = useCallback(async () => {
    setWorkshiftCodesLoading(true);
    try {
      const response = await apiClient.get('/Fs/Process/WorkshiftSetUp');
      if (response.status === 200 && response.data) {
        const list = response.data.data || [];
        setWorkshiftCodes(list.map((w: any) => ({
          code: w.code || '',
          description: w.description || '',
        })));
      }
    } catch (err) {
      console.error('Error fetching workshift codes:', err);
    } finally {
      setWorkshiftCodesLoading(false);
    }
  }, []);

  const fetchDailySchedules = useCallback(async () => {
    setDailyScheduleLoading(true);
    try {
      const response = await apiClient.get('/Fs/Process/DailyScheduleSetUp');
      if (response.status === 200 && response.data) {
        const list = response.data.data || [];
        setDailySchedules(list.map((s: any) => ({
          dailyScheduleID: s.dailyScheduleID || 0,
          referenceNo: s.referenceNo || '',
          monday: s.monday || '',
          tuesday: s.tuesday || '',
          wednesday: s.wednesday || '',
          thursday: s.thursday || '',
          friday: s.friday || '',
          saturday: s.saturday || '',
          sunday: s.sunday || '',
        })));
      }
    } catch (err) {
      console.error('Error fetching daily schedules:', err);
    } finally {
      setDailyScheduleLoading(false);
    }
  }, []);

  const fetchWorkshiftFixed = async (ec: string) => {
    if (!ec) return;
    setWorkshiftLoading(true);
    try {
      const response = await apiClient.get('/Maintenance/EmployeeWorkshiftFixed/2ShiftsInADay');
      if (response.status === 200 && response.data) {
        const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
        const found = allItems.find((item: any) =>
          (item.empCode?.trim() || '').toLowerCase() === ec.trim().toLowerCase()
        );
        if (found) {
          setWorkshiftFixedData(found);
          setFixedDailySched(found.dailySched || '');
          setWorkshiftMode('fixed');
        }
      }
    } catch {
      setWorkshiftFixedData(null);
    } finally {
      setWorkshiftLoading(false);
    }
  };

  const fetchWorkshiftVariable = async (ec: string) => {
    if (!ec) return;
    setWorkshiftLoading(true);
    try {
      const response = await apiClient.get('/Maintenance/EmployeeWorkshiftVariable/2ShiftsInADay');
      if (response.status === 200 && response.data) {
        const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
        const filtered = allItems.filter((item: any) =>
          (item.empCode?.trim() || '').toLowerCase() === ec.trim().toLowerCase()
        );
        if (filtered.length > 0) {
          setWorkshiftVariableData(filtered);
          setWorkshiftMode('variable');
        }
      }
    } catch {
      setWorkshiftVariableData([]);
    } finally {
      setWorkshiftLoading(false);
    }
  };

  const fetchOvertimeApplications = async (ec: string) => {
    if (!ec) return;
    setOvertimeLoading(true);
    try {
      const response = await apiClient.get('/Maintenance/EmployeeOvertimeApplication/2ShiftsInADay');
      if (response.status === 200 && response.data) {
        const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
        setOvertimeApplicationsData(allItems.filter((item: any) =>
          (item.empCode?.trim() || '').toLowerCase() === ec.trim().toLowerCase()
        ));
      }
    } catch {
      setOvertimeApplicationsData([]);
    } finally {
      setOvertimeLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SAVE WORKSHIFT FIXED
  // ─────────────────────────────────────────────────────────────────────────

  const saveWorkshiftFixed = async () => {
    const data: Partial<WorkshiftFixed> = {
      id: workshiftFixedData?.id || 0,
      empCode,
      dailySched: fixedDailySched,
      isFixed: true,
    };
    setWorkshiftLoading(true);
    try {
      let response;
      if (!data.id) {
        response = await apiClient.post('/Maintenance/EmployeeWorkshiftFixed/2ShiftsInADay', data);
      } else {
        response = await apiClient.put(`/Maintenance/EmployeeWorkshiftFixed/2ShiftsInADay/${data.id}`, data);
      }
      if ([200, 201, 204].includes(response.status)) {
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Fixed workshift saved successfully.', timer: 2000, showConfirmButton: false });
        await fetchWorkshiftFixed(empCode);
        setIsEditMode(false);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to save fixed workshift' });
    } finally {
      setWorkshiftLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // WORKSHIFT VARIABLE CRUD
  // ─────────────────────────────────────────────────────────────────────────

  const createWorkshiftVariable = async (data: Partial<WorkshiftVariable>) => {
    setWorkshiftLoading(true);
    try {
      const response = await apiClient.post('/Maintenance/EmployeeWorkshiftVariable/2ShiftsInADay', data);
      if ([200, 201].includes(response.status)) {
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Variable workshift created successfully.', timer: 2000, showConfirmButton: false });
        await fetchWorkshiftVariable(empCode);
        setShowWorkshiftModal(false);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to create variable workshift' });
    } finally {
      setWorkshiftLoading(false);
    }
  };

  const updateWorkshiftVariable = async (id: number, data: Partial<WorkshiftVariable>) => {
    setWorkshiftLoading(true);
    try {
      const response = await apiClient.put(`/Maintenance/EmployeeWorkshiftVariable/2ShiftsInADay/${id}`, data);
      if ([200, 204].includes(response.status)) {
        await Swal.fire({ icon: 'success', title: 'Updated!', text: 'Variable workshift updated successfully.', timer: 2000, showConfirmButton: false });
        await fetchWorkshiftVariable(empCode);
        setShowWorkshiftModal(false);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to update variable workshift' });
    } finally {
      setWorkshiftLoading(false);
    }
  };

  const deleteWorkshiftVariable = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });
    if (result.isConfirmed) {
      setWorkshiftLoading(true);
      try {
        const response = await apiClient.delete(`/Maintenance/EmployeeWorkshiftVariable/2ShiftsInADay/${id}`);
        if ([200, 204].includes(response.status)) {
          await Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Variable workshift has been deleted.', timer: 2000, showConfirmButton: false });
          await fetchWorkshiftVariable(empCode);
        }
      } catch (error: any) {
        await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to delete variable workshift' });
      } finally {
        setWorkshiftLoading(false);
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // OVERTIME CRUD
  // ─────────────────────────────────────────────────────────────────────────

  const prepareOvertimePayload = (data: Partial<OvertimeApplication>, id = 0) => ({
    ID: id,
    EmpCode: data.empCode,
    Date:                    safeDateToISO(data.date || ''),
    NumOTHoursApproved:      data.numOTHoursApproved || 0,
    EarlyOTStartTime:        safeTimeToISO(data.earlyOTStartTime || ''),
    EarlyTimeIn:             safeTimeToISO(data.earlyTimeIn || ''),
    StartOTPM:               safeTimeToISO(data.startOTPM || ''),
    MinHRSOTBreak:           data.minHRSOTBreak || 0,
    EarlyOTStartTimeRestHol: safeTimeToISO(data.earlyOTStartTimeRestHol || ''),
    Reason:                  data.reason || '',
    Remarks:                 data.remarks || '',
    ApprovedOTBreaksHrs:     data.approvedOTBreaksHrs || 0,
    STOTATS:                 safeTimeToISO(data.stotats || ''),
    IsLateFiling:            data.isLateFiling ?? false,
    IsLateFilingProcessed:   data.isLateFilingProcessed ?? false,
  });

  const createOvertimeApplication = async (data: Partial<OvertimeApplication>) => {
    setOvertimeLoading(true);
    try {
      const response = await apiClient.post(
        '/Maintenance/EmployeeOvertimeApplication/2ShiftsInADay',
        prepareOvertimePayload(data)
      );
      if ([200, 201].includes(response.status)) {
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Overtime application created successfully.', timer: 2000, showConfirmButton: false });
        await fetchOvertimeApplications(data.empCode || '');
        setShowOvertimeModal(false);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.title || error.message || 'Failed to create application' });
    } finally {
      setOvertimeLoading(false);
    }
  };

  const updateOvertimeApplication = async (id: number, data: Partial<OvertimeApplication>) => {
    setOvertimeLoading(true);
    try {
      const response = await apiClient.put(
        `/Maintenance/EmployeeOvertimeApplication/2ShiftsInADay/${id}`,
        prepareOvertimePayload(data, id)
      );
      if ([200, 204].includes(response.status)) {
        await Swal.fire({ icon: 'success', title: 'Updated!', text: 'Overtime application updated successfully.', timer: 2000, showConfirmButton: false });
        await fetchOvertimeApplications(data.empCode || '');
        setShowOvertimeModal(false);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data || error.message || 'Failed to update application' });
    } finally {
      setOvertimeLoading(false);
    }
  };

  const deleteOvertimeApplication = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });
    if (result.isConfirmed) {
      setOvertimeLoading(true);
      try {
        const response = await apiClient.delete(`/Maintenance/EmployeeOvertimeApplication/2ShiftsInADay/${id}`);
        if ([200, 204].includes(response.status)) {
          await Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Overtime application has been deleted.', timer: 2000, showConfirmButton: false });
          await fetchOvertimeApplications(empCode);
        }
      } catch (error: any) {
        await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to delete overtime application' });
      } finally {
        setOvertimeLoading(false);
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SUBMIT HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  const handleOvertimeSubmit = async () => {
    const data: Partial<OvertimeApplication> = {
      empCode,
      date:                    overtimeDate,
      numOTHoursApproved:      parseFloat(overtimeNumOTHoursApproved) || 0,
      earlyOTStartTime:        overtimeEarlyOTStartTime,
      earlyTimeIn:             overtimeEarlyTimeIn,
      startOTPM:               overtimeStartOTPM,
      minHRSOTBreak:           parseFloat(overtimeMinHRSOTBreak) || 0,
      earlyOTStartTimeRestHol: overtimeEarlyOTStartTimeRestHol,
      reason:                  overtimeReason,
      remarks:                 overtimeRemarks,
      approvedOTBreaksHrs:     parseFloat(overtimeApprovedOTBreaksHrs) || 0,
      stotats:                 overtimeStotats,
      isLateFiling:            overtimeIsLateFiling,
      isLateFilingProcessed:   false,
    };

    if (isOvertimeEditMode && currentOvertimeId !== null) {
      await updateOvertimeApplication(currentOvertimeId, data);
    } else {
      await createOvertimeApplication(data);
    }
  };

  const handleWorkshiftSubmit = async () => {
    const data: Partial<WorkshiftVariable> = {
      empCode,
      dateFrom:          workshiftFrom ? mmddyyyyToISO(workshiftFrom) : '',
      dateTo:            workshiftTo   ? mmddyyyyToISO(workshiftTo)   : '',
      shiftCode:         workshiftShiftCode,
      dailyScheduleCode: '',
      updateDate:        new Date().toISOString(),
    };
    if (isWorkshiftEditMode && currentWorkshiftId !== null) {
      await updateWorkshiftVariable(currentWorkshiftId, data);
    } else {
      await createWorkshiftVariable(data);
    }
  };

  const handleSave = async () => {
    if (!empCode) {
      await Swal.fire({ icon: 'warning', title: 'Warning', text: 'Please select an employee first' });
      return;
    }
    if (activeTab === 'workshift' && workshiftMode === 'fixed') {
      await saveWorkshiftFixed();
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    if (empCode) {
      fetchWorkshiftFixed(empCode);
      fetchWorkshiftVariable(empCode);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // EMPLOYEE SELECT
  // ─────────────────────────────────────────────────────────────────────────

  const adaptedEmployees = useMemo(() => employees.map(emp => ({
    ...emp,
    name: `${emp.lName}, ${emp.fName}`,
    groupCode: emp.grpCode,
  })), [employees]);

  const handleEmployeeSearchSelect = async (empCodeValue: string, name: string) => {
    try {
      const employee = employees.find(emp => emp.empCode === empCodeValue);
      if (!employee) {
        await Swal.fire({ icon: 'error', title: 'Error', text: 'Employee not found' });
        return;
      }
      setEmpCode(empCodeValue);
      setTksGroup(employee.grpCode);
      setEmployeeName(name);
      setShowSearchModal(false);
      await Promise.all([
        fetchWorkshiftFixed(empCodeValue),
        fetchWorkshiftVariable(empCodeValue),
        fetchOvertimeApplications(empCodeValue),
      ]);
    } catch {
      await Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load employee details' });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchEmployees();
    fetchWorkshiftCodes();
    fetchDailySchedules();
  }, []);

  useEffect(() => {
    if (empCode) {
      fetchWorkshiftFixed(empCode);
      fetchWorkshiftVariable(empCode);
      fetchOvertimeApplications(empCode);
    }
  }, [empCode]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (showSearchModal)        { setShowSearchModal(false);        return; }
      if (showWorkshiftCodeModal) { setShowWorkshiftCodeModal(false); return; }
      if (showDailyScheduleModal) { setShowDailyScheduleModal(false); return; }
      if (showWorkshiftModal)     { setShowWorkshiftModal(false);     return; }
      if (showOvertimeModal)      { setShowOvertimeModal(false); }
    };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [showSearchModal, showWorkshiftCodeModal, showDailyScheduleModal, showWorkshiftModal, showOvertimeModal]);

  // ─────────────────────────────────────────────────────────────────────────
  // FILTERED LISTS
  // ─────────────────────────────────────────────────────────────────────────

  const filteredWorkshiftCodes = workshiftCodes.filter(ws =>
    ws.code.toLowerCase().includes(workshiftCodeSearchTerm.toLowerCase()) ||
    ws.description.toLowerCase().includes(workshiftCodeSearchTerm.toLowerCase())
  );

  const filteredDailySchedules = dailySchedules.filter(ds =>
    ds.referenceNo.toLowerCase().includes(dailyScheduleSearchTerm.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────────────────────
  // TAB CONTENT
  // ─────────────────────────────────────────────────────────────────────────

  const renderTabContent = () => {
    switch (activeTab) {

      case 'workshift':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {workshiftLoading ? (
              <div className="flex items-center justify-center py-8 gap-2 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading workshifts...
              </div>
            ) : (
              <div className="space-y-6">
                {/* Fixed */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input type="radio" id="workshift-fixed"
                      checked={workshiftMode === 'fixed'}
                      onChange={() => setWorkshiftMode('fixed')}
                      disabled={!isEditMode}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="workshift-fixed" className="text-gray-700">Fixed</label>
                  </div>
                  {workshiftMode === 'fixed' && (
                    <div className="ml-7 bg-gray-50 rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center gap-3 max-w-lg">
                        <label className="text-gray-700 w-36 flex-shrink-0">Daily Schedule</label>
                        <input type="text" value={fixedDailySched} readOnly disabled={!isEditMode}
                          placeholder="Select daily schedule..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-pointer focus:outline-none"
                          onClick={() => isEditMode && setShowDailyScheduleModal(true)}
                        />
                        {isEditMode && (
                          <button onClick={() => setShowDailyScheduleModal(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 flex-shrink-0">
                            <Search className="w-4 h-4" /> Search
                          </button>
                        )}
                        {isEditMode && fixedDailySched && (
                          <button onClick={() => setFixedDailySched('')}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex-shrink-0">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Variable */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input type="radio" id="workshift-variable"
                      checked={workshiftMode === 'variable'}
                      onChange={() => setWorkshiftMode('variable')}
                      disabled={!isEditMode}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="workshift-variable" className="text-gray-700">Variable</label>
                  </div>
                  {workshiftMode === 'variable' && (
                    <div className="ml-7 space-y-4">
                      <button
                        onClick={async () => {
                          if (!(await requireEmpCode())) return;
                          setIsWorkshiftEditMode(false);
                          setCurrentWorkshiftId(null);
                          setWorkshiftFrom(''); setWorkshiftTo(''); setWorkshiftShiftCode('');
                          setShowWorkshiftModal(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <Plus className="w-4 h-4" /> Add
                      </button>
                      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-gray-700">Date From</th>
                              <th className="px-6 py-3 text-left text-gray-700">Date To</th>
                              <th className="px-6 py-3 text-left text-gray-700">Shift Code</th>
                              <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {workshiftVariableData.length === 0 ? (
                              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No variable workshift records found</td></tr>
                            ) : (
                              workshiftVariableData.map(entry => (
                                <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="px-6 py-3 text-gray-900">{isoToDisplay(entry.dateFrom)}</td>
                                  <td className="px-6 py-3 text-gray-900">{isoToDisplay(entry.dateTo)}</td>
                                  <td className="px-6 py-3 text-gray-900">{entry.shiftCode}</td>
                                  <td className="px-6 py-3">
                                    <div className="flex gap-2">
                                      <button onClick={() => {
                                        setIsWorkshiftEditMode(true);
                                        setCurrentWorkshiftId(entry.id);
                                        setWorkshiftFrom(isoToDisplay(entry.dateFrom));
                                        setWorkshiftTo(isoToDisplay(entry.dateTo));
                                        setWorkshiftShiftCode(entry.shiftCode || '');
                                        setShowWorkshiftModal(true);
                                      }} className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors">
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <span className="text-gray-300">|</span>
                                      <button onClick={() => deleteWorkshiftVariable(entry.id)}
                                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'overtime-applications':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-6">
              <div>
                <button
                  onClick={async () => {
                    if (!(await requireEmpCode())) return;
                    setIsOvertimeEditMode(false);
                    setCurrentOvertimeId(null);
                    resetOvertimeForm();
                    setShowOvertimeModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Create New
                </button>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {overtimeLoading ? (
                  <div className="flex items-center justify-center py-8 gap-2 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading overtime applications...
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-gray-700">Date</th>
                        <th className="px-6 py-3 text-left text-gray-700">Hours Approved</th>
                        <th className="px-6 py-3 text-left text-gray-700">Reason</th>
                        <th className="px-6 py-3 text-left text-gray-700">Remarks</th>
                        <th className="px-6 py-3 text-left text-gray-700">Late Filing</th>
                        <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overtimeApplicationsData.length === 0 ? (
                        <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No overtime applications found</td></tr>
                      ) : (
                        overtimeApplicationsData.map(entry => (
                          <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-3 text-gray-900">{entry.date ? isoToDisplay(entry.date) : 'N/A'}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.numOTHoursApproved}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.reason}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.remarks}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.isLateFiling ? 'Yes' : 'No'}</td>
                            <td className="px-6 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setIsOvertimeEditMode(true);
                                    setCurrentOvertimeId(entry.id);
                                    // ── Populate all fields correctly ──
                                    setOvertimeDate(isoToDisplay(entry.date));
                                    setOvertimeNumOTHoursApproved(entry.numOTHoursApproved?.toString() || '');
                                    // earlyOTStartTime is time-only stored as 1900-01-01T...
                                    // the date portion came from earlyOTStartTime's date part
                                    setOvertimeActualDateInOTBefore(isoToDisplay(entry.earlyOTStartTime));
                                    setOvertimeEarlyOTStartTime(isoTimeToDisplay(entry.earlyOTStartTime));
                                    // earlyTimeIn is Start Time of Overtime
                                    setOvertimeStartOvertimeDate(isoToDisplay(entry.earlyTimeIn));
                                    setOvertimeEarlyTimeIn(isoTimeToDisplay(entry.earlyTimeIn));
                                    setOvertimeStartOTPM(isoTimeToDisplay(entry.startOTPM));
                                    setOvertimeMinHRSOTBreak(entry.minHRSOTBreak?.toString() || '');
                                    setOvertimeEarlyOTStartTimeRestHol(isoTimeToDisplay(entry.earlyOTStartTimeRestHol));
                                    setOvertimeReason(entry.reason || '');
                                    setOvertimeRemarks(entry.remarks || '');
                                    setOvertimeApprovedOTBreaksHrs(entry.approvedOTBreaksHrs?.toString() || '');
                                    setOvertimeStotats(isoTimeToDisplay(entry.stotats));
                                    setOvertimeIsLateFiling(entry.isLateFiling || false);
                                    setShowOvertimeModal(true);
                                  }}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <span className="text-gray-300">|</span>
                                <button onClick={() => deleteOvertimeApplication(entry.id)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const tabs = [
    { id: 'overtime-applications', label: 'Overtime Applications', icon: ClipboardList },
    { id: 'workshift',             label: 'Workshift',             icon: Clock },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">

          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Employee Time Keep Group Configuration [2-Shifts]</h1>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">

            {/* Info Banner */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    Configure work shifts and overtime applications for 2-shift employees with accurate time tracking and overtime management.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Work shift configuration (Fixed/Variable)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Overtime application tracking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Search Section */}
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-4">
                {activeTab === 'workshift' && (
                  <>
                    {!isEditMode ? (
                      <button onClick={() => setIsEditMode(true)} disabled={!empCode}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        <Pencil className="w-4 h-4" /> Edit
                      </button>
                    ) : (
                      <>
                        <button onClick={handleSave} disabled={workshiftLoading}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50">
                          <Save className="w-4 h-4" /> {workshiftLoading ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={handleCancel} disabled={workshiftLoading}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50">
                          <X className="w-4 h-4" /> Cancel
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="mb-6 space-y-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <label className="text-gray-700 font-bold w-24">TKS Group</label>
                    <input type="text" value={tksGroup} disabled placeholder="Auto-filled from selection"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-gray-700 font-bold w-24">EmpCode</label>
                    <input type="text" value={empCode} disabled
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" />
                    <button onClick={() => setShowSearchModal(true)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                      <Search className="w-4 h-4" /> Search
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-blue-700 mb-1">
                  {employeeName || <span className="text-blue-400 italic">No employee selected</span>}
                </div>
                <div className="text-blue-600">{payPeriod}</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-gray-300">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                    activeTab === tab.id
                      ? 'font-medium bg-blue-600 text-white -mb-px'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {renderTabContent()}

          </div>

          {/* Employee Search Modal */}
          <EmployeeSearchModal
            isOpen={showSearchModal}
            onClose={() => setShowSearchModal(false)}
            onSelect={handleEmployeeSearchSelect}
            employees={adaptedEmployees}
            loading={employeeLoading}
            error={employeeError}
          />

          {/* ── Overtime Modal — ALL fields fully wired ── */}
          <OvertimeApplicationModal
            isOpen={showOvertimeModal}
            isEditMode={isOvertimeEditMode}
            empCode={empCode}
            // Date field
            date={overtimeDate}
            onDateChange={setOvertimeDate}
            // Hours approved
            hoursApproved={overtimeNumOTHoursApproved}
            onHoursApprovedChange={setOvertimeNumOTHoursApproved}
            // Start Time of OT Before the Shift — date + time
            actualDateInOTBefore={overtimeActualDateInOTBefore}
            onActualDateInOTBeforeChange={setOvertimeActualDateInOTBefore}
            startTimeBefore={overtimeEarlyOTStartTime}
            onStartTimeBeforeChange={setOvertimeEarlyOTStartTime}
            // Start Time of Overtime — date + time
            startOvertimeDate={overtimeStartOvertimeDate}
            onStartOvertimeDateChange={setOvertimeStartOvertimeDate}
            startOvertimeTime={overtimeEarlyTimeIn}
            onStartOvertimeTimeChange={setOvertimeEarlyTimeIn}
            // Approved break, reason, remarks, late filing
            approvedBreak={overtimeMinHRSOTBreak}
            onApprovedBreakChange={setOvertimeMinHRSOTBreak}
            reason={overtimeReason}
            onReasonChange={setOvertimeReason}
            remarks={overtimeRemarks}
            onRemarksChange={setOvertimeRemarks}
            isLateFiling={overtimeIsLateFiling}
            onIsLateFilingChange={setOvertimeIsLateFiling}
            onClose={() => setShowOvertimeModal(false)}
            onSubmit={handleOvertimeSubmit}
          />

        </div>
      </div>

      {/* Workshift Variable Modal */}
      {showWorkshiftModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowWorkshiftModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                <h2 className="text-gray-800 font-semibold">
                  {isWorkshiftEditMode ? 'Edit Workshift Variable' : 'Create Workshift Variable'}
                </h2>
                <button onClick={() => setShowWorkshiftModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {/* Date From */}
                <div className="flex items-center gap-3">
                  <label className="w-28 text-gray-700 text-sm flex-shrink-0">Date From :</label>
                  <div className="relative flex-1">
                    <input type="text" value={workshiftFrom} onChange={e => setWorkshiftFrom(e.target.value)}
                      placeholder="MM/DD/YYYY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="button" onClick={() => setShowWorkshiftFromCalendar(!showWorkshiftFromCalendar)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600">
                      <Calendar className="w-4 h-4" />
                    </button>
                    {showWorkshiftFromCalendar && (
                      <div className="absolute top-full left-0 mt-1 z-50">
                        <CalendarPopup
                          onDateSelect={d => { setWorkshiftFrom(d); setShowWorkshiftFromCalendar(false); }}
                          onClose={() => setShowWorkshiftFromCalendar(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>
                {/* Date To */}
                <div className="flex items-center gap-3">
                  <label className="w-28 text-gray-700 text-sm flex-shrink-0">Date To :</label>
                  <div className="relative flex-1">
                    <input type="text" value={workshiftTo} onChange={e => setWorkshiftTo(e.target.value)}
                      placeholder="MM/DD/YYYY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="button" onClick={() => setShowWorkshiftToCalendar(!showWorkshiftToCalendar)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600">
                      <Calendar className="w-4 h-4" />
                    </button>
                    {showWorkshiftToCalendar && (
                      <div className="absolute top-full left-0 mt-1 z-50">
                        <CalendarPopup
                          onDateSelect={d => { setWorkshiftTo(d); setShowWorkshiftToCalendar(false); }}
                          onClose={() => setShowWorkshiftToCalendar(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>
                {/* Shift Code */}
                <div className="flex items-center gap-3">
                  <label className="w-28 text-gray-700 text-sm flex-shrink-0">Shift Code :</label>
                  <input type="text" value={workshiftShiftCode} readOnly
                    placeholder="Select shift code..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 cursor-pointer focus:outline-none"
                    onClick={() => { setWorkshiftCodeSearchTerm(''); setShowWorkshiftCodeModal(true); }}
                  />
                  <button onClick={() => { setWorkshiftCodeSearchTerm(''); setShowWorkshiftCodeModal(true); }}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-shrink-0">
                    <Search className="w-4 h-4" />
                  </button>
                  <button onClick={() => setWorkshiftShiftCode('')}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Actions */}
                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <button onClick={handleWorkshiftSubmit} disabled={workshiftLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-60">
                    {workshiftLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isWorkshiftEditMode ? 'Update' : 'Add'}
                  </button>
                  <button onClick={() => setShowWorkshiftModal(false)}
                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Workshift Code Search Modal */}
      {showWorkshiftCodeModal && createPortal(
        <>
          <div className="fixed inset-0 bg-black/40" style={{ zIndex: 99998 }}
            onClick={() => { setShowWorkshiftCodeModal(false); setWorkshiftCodeSearchTerm(''); }} />
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                <h2 className="text-gray-800 text-sm font-semibold">Search Workshift Code</h2>
                <button onClick={() => { setShowWorkshiftCodeModal(false); setWorkshiftCodeSearchTerm(''); }}
                  className="text-gray-600 hover:text-gray-800"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-3">
                <h3 className="text-blue-600 mb-2 text-sm font-semibold">Workshift Code</h3>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap">Search:</label>
                  <input type="text" value={workshiftCodeSearchTerm}
                    onChange={e => setWorkshiftCodeSearchTerm(e.target.value)}
                    autoFocus placeholder="Type to filter..."
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="border border-gray-200 rounded overflow-hidden" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table className="w-full border-collapse text-sm">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="bg-gray-100 border-b-2 border-gray-300">
                        <th className="px-3 py-1.5 text-left text-gray-700 font-semibold">Code</th>
                        <th className="px-3 py-1.5 text-left text-gray-700 font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {workshiftCodesLoading ? (
                        <tr><td colSpan={2} className="px-4 py-6 text-center text-gray-500 italic">
                          <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Loading...
                        </td></tr>
                      ) : filteredWorkshiftCodes.length === 0 ? (
                        <tr><td colSpan={2} className="px-3 py-8 text-center text-gray-500 italic">No entries found</td></tr>
                      ) : (
                        filteredWorkshiftCodes.map(ws => (
                          <tr key={ws.code} className="hover:bg-blue-50 cursor-pointer"
                            onClick={() => { setWorkshiftShiftCode(ws.code); setShowWorkshiftCodeModal(false); setWorkshiftCodeSearchTerm(''); }}>
                            <td className="px-3 py-1.5 font-medium text-gray-900">{ws.code}</td>
                            <td className="px-3 py-1.5 text-gray-600">{ws.description}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Daily Schedule Search Modal */}
      {showDailyScheduleModal && createPortal(
        <>
          <div className="fixed inset-0 bg-black/40" style={{ zIndex: 99998 }}
            onClick={() => { setShowDailyScheduleModal(false); setDailyScheduleSearchTerm(''); }} />
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
                <h2 className="text-gray-800 font-semibold">Select Daily Schedule</h2>
                <button onClick={() => { setShowDailyScheduleModal(false); setDailyScheduleSearchTerm(''); }}
                  className="text-gray-500 hover:text-gray-800"><X className="w-5 h-5" /></button>
              </div>
              <div className="px-6 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap">Search:</label>
                  <input type="text" value={dailyScheduleSearchTerm}
                    onChange={e => setDailyScheduleSearchTerm(e.target.value)}
                    autoFocus placeholder="Search by reference number..."
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                {dailyScheduleLoading ? (
                  <div className="flex items-center justify-center py-10 gap-2 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading schedules...
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-white border-b border-gray-200">
                      <tr>
                        {['Reference No', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(h => (
                          <th key={h} className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredDailySchedules.length === 0 ? (
                        <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500 italic">No schedules found</td></tr>
                      ) : (
                        filteredDailySchedules.map(ds => (
                          <tr key={ds.dailyScheduleID} className="hover:bg-blue-50 cursor-pointer"
                            onClick={() => { setFixedDailySched(ds.referenceNo); setShowDailyScheduleModal(false); setDailyScheduleSearchTerm(''); }}>
                            <td className="px-4 py-3 font-medium text-gray-900">{ds.referenceNo}</td>
                            <td className="px-4 py-3 text-gray-600">{ds.monday}</td>
                            <td className="px-4 py-3 text-gray-600">{ds.tuesday}</td>
                            <td className="px-4 py-3 text-gray-600">{ds.wednesday}</td>
                            <td className="px-4 py-3 text-gray-600">{ds.thursday}</td>
                            <td className="px-4 py-3 text-gray-600">{ds.friday}</td>
                            <td className="px-4 py-3 text-gray-600">{ds.saturday}</td>
                            <td className="px-4 py-3 text-gray-600">{ds.sunday}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      <Footer />
    </div>
  );
}