import { useState, useEffect, useMemo } from 'react';
import { 
  Search,
  Settings,
  FileX,
  Smartphone,
  Calendar,
  Clock,
  Tag,
  FileText,
  ClipboardList,
  FileSignature,
  PauseCircle,
  Pencil,
  Plus,
  X,
  Check,
  Save,
  Edit,
  Trash2
} from 'lucide-react';
import { LeaveApplicationModal } from '../Modals/LeaveApplicationModal';
import { OvertimeApplicationModal } from '../Modals/OvertimeApplicationModal';
import { ContractualModal } from '../Modals/ContractualModal';
import { SuspensionModal } from '../Modals/SuspensionModal';
import { EmployeeSearchModal } from '../Modals/EmployeeSearchModal';
import { GroupScheduleSearchModal } from '../Modals/GroupScheduleSearchModal';
import { DeviceCodeModal } from '../Modals/Devicecodemodal';
import { RestDayVariableModal } from '../Modals/Restdayvariablemodal';
import { Footer } from '../Footer/Footer';
import apiClient from '../../services/apiClient';
import Swal from 'sweetalert2';
import { WorkshiftVariableModal } from '../Modals/WorkShiftVariableModal';
import { ClassificationVariableModal } from '../Modals/ClassificationVariableModal';
import { DailyScheduleSearchModal } from '../Modals/DailyScheduleSearchModal';
import { WorkshiftCodeSearchModal } from '../Modals/WorkshiftCodeSearchModal';
import { ClassificationCodeSearchModal } from '../Modals/ClassificationCodeSearchModal';
import { fetchEmployees as fetchEmployeesService } from '../../services/employeeService';

type TabType =
  | 'basic-config'
  | 'exemptions'
  | 'device-code'
  | 'rest-day'
  | 'workshift'
  | 'classification'
  | 'leave-applications'
  | 'overtime-applications'
  | 'contractual'
  | 'suspension';

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
  glCode: string;
}

interface ClassificationFixed {
  id: number;
  empCode: string;
  classCode: string;
  isFixed: boolean;
}

interface ClassificationVariable {
  id: number;
  empCode: string;
  dateFrom: string;
  dateTo: string;
  classCode: string;
}

interface DeviceCode {
  id: number;
  empCode: string;
  timeInAndOutCode: string;
  timeInAndOutPass: string;
  timeInAndOutEffectDate: string;
  timeInAndOutExpiryDate: string;
}

interface RestDayFixed {
  id: number;
  empCode: string;
  fixedRestDay1: string;
  fixedRestDay2: string;
  fixedRestDay3: string;
  isFixed: boolean;
}

interface RestDayVariable {
  id: number;
  empCode: string;
  datefrom: string;
  dateTo: string;
  restDay1: string;
  restDay2: string;
  restDay3: string;
}

interface Employee {
  empID: number;
  empCode: string;
  lName: string;
  fName: string;
  grpCode: string;
}

interface EmployeeBasicConfig {
  id: number;
  empCode: string;
  groupCode: string;
  groupScheduleCode: string;
  allowOTDefault: boolean;
  active: boolean;
  compAllowFrRDExmpOT: boolean;
  compAllowFrHolExmpOT: boolean;
  timeAttendanceStatus: boolean;
}

interface GroupSchedule {
  groupScheduleID: number;
  groupScheduleCode: string;
  groupScheduleDesc: string;
}

interface EmployeeExemptions {
  id: number;
  empCode: string;
  tardiness: boolean;
  undertime: boolean;
  nightDiffBasic: boolean;
  overtime: boolean;
  absences: boolean;
  otherEarnAndAllow: boolean;
  holidayPay: boolean;
  unprodWorkHoliday: boolean;
}

interface LeaveApplication {
  id: number;
  empCode: string;
  date: string;
  hoursApprovedNum: number;
  leaveCode: string;
  period: string;
  reason: string;
  remarks: string;
  withPay: boolean;
  sssNotif: boolean;
  isProcSSSNotif: boolean;
  balanceID: string;
  isLateFiling: boolean;
  isLateFilingProcessed: boolean;
  exemptAllowFlag: boolean;
}

interface PayrollLocation {
  id: number;
  locId: number;
  locCode: string;
  locName: string;
  confidential: string;
  notedBy: string;
  preparedBy: string;
  reviewedBy: string;
  approvedBy: string;
  nonTaxAccum: number;
  header: string;
  desc1: string;
  desc2: string;
  desc3: string;
  desc4: string;
  contribFormula: string;
  contribPayPer: number;
  ins: string;
  insPayPer: number;
  pagIbig: string;
  pagPayPer: number;
  sssContrib: string;
  sssPayPer: number;
  philContrib: string;
  philPayPer: number;
  companyCode: string;
  clsCode: string;
  payCode: string;
  rateCode: string;
  noOfDays: number;
  noOfHours: number;
  totalPeriod: number;
  costCenter1: string;
  costCenter2: string;
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
  appliedBeforeShiftDate: string;
  isOTBeforeShiftNextDay: boolean;
}

interface Contractual {
  id: number;
  empCode: string;
  dateFr: string;
  dateTo: string;
}

interface Suspension {
  id: number;
  empCode: string;
  dateFrom: string;
  dateTo: string;
}

interface WorkshiftCode {
  code: string;
  description: string;
}

interface ClassificationCodeItem {
  classId: number;
  classCode: string;
  classDesc: string;
}

interface LeaveCode {
  code: string;
  description: string;
}

// ── Date helpers ─────────────────────────────────────────────────────────────

/**
 * Convert any date string to a local-midnight ISO string (YYYY-MM-DDTHH:mm:ss.000Z
 * using LOCAL date so no timezone subtraction occurs).
 * Handles: "yyyy-MM-dd", "M/D/YYYY", ISO strings.
 */
const toLocalISOString = (dateStr: string): string | null => {
  if (!dateStr) return null;
  try {
    let y: number, m: number, d: number;

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      [y, m, d] = dateStr.split('-').map(Number);
    } else if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      m = Number(parts[0]);
      d = Number(parts[1]);
      y = Number(parts[2]);
    } else {
      const dt = new Date(dateStr);
      y = dt.getFullYear();
      m = dt.getMonth() + 1;
      d = dt.getDate();
    }

    const pad = (n: number) => String(n).padStart(2, '0');
    return `${y}-${pad(m)}-${pad(d)}T12:00:00.000Z`;
  } catch {
    return null;
  }
};

/**
 * Format any date string / ISO to "M/D/YYYY" for display.
 */
const formatDate = (dateStr: string): string => {
  if (!dateStr) return 'N/A';
  try {
    let y: number, m: number, d: number;
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const parts = dateStr.substring(0, 10).split('-');
      y = Number(parts[0]);
      m = Number(parts[1]);
      d = Number(parts[2]);
    } else {
      const dt = new Date(dateStr);
      if (isNaN(dt.getTime())) return 'N/A';
      y = dt.getUTCFullYear();
      m = dt.getUTCMonth() + 1;
      d = dt.getUTCDate();
    }
    return `${m}/${d}/${y}`;
  } catch {
    return 'N/A';
  }
};

/**
 * Convert ISO/date string → "yyyy-MM-dd" for <input type="date"> or modal state.
 */
const toInputDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    if (/^\d{4}-\d{2}-\d{2}T/.test(dateStr)) return dateStr.substring(0, 10);
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      const m = parts[0].padStart(2, '0');
      const d = parts[1].padStart(2, '0');
      const y = parts[2];
      return `${y}-${m}-${d}`;
    }
    const dt = new Date(dateStr);
    if (isNaN(dt.getTime())) return '';
    const y = dt.getUTCFullYear();
    const mo = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const da = String(dt.getUTCDate()).padStart(2, '0');
    return `${y}-${mo}-${da}`;
  } catch {
    return '';
  }
};

// ─────────────────────────────────────────────────────────────────────────────

export function EmployeeTimekeepConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('basic-config');
  const [empCode, setEmpCode] = useState('');
  const [tksGroup, setTksGroup] = useState('');
  const [tksGroupName, setTksGroupName] = useState('');
  const [originalGroupCode, setOriginalGroupCode] = useState('');

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showGroupScheduleModal, setShowGroupScheduleModal] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeError, setEmployeeError] = useState('');

  const [basicConfigData, setBasicConfigData] = useState<EmployeeBasicConfig | null>(null);
  const [basicConfigLoading, setBasicConfigLoading] = useState(false);
  const [basicConfigError, setBasicConfigError] = useState('');

  const [groupSchedules, setGroupSchedules] = useState<GroupSchedule[]>([]);
  const [groupScheduleLoading, setGroupScheduleLoading] = useState(false);

  const [exemptionsData, setExemptionsData] = useState<EmployeeExemptions | null>(null);
  const [exemptionsLoading, setExemptionsLoading] = useState(false);

  // Leave
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isLeaveEditMode, setIsLeaveEditMode] = useState(false);
  const [currentLeaveId, setCurrentLeaveId] = useState<number>(0);
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveHoursApproved, setLeaveHoursApproved] = useState('');
  const [leaveCode, setLeaveCode] = useState('');
  const [leavePeriod, setLeavePeriod] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveRemarks, setLeaveRemarks] = useState('');
  const [leaveWithPay, setLeaveWithPay] = useState(false);
  const [leaveSssNotification, setLeaveSssNotification] = useState(false);
  const [leaveIsLateFiling, setLeaveIsLateFiling] = useState(false);
  const [leaveCodes, setLeaveCodes] = useState<LeaveCode[]>([]);
  const [leaveCodesLoading, setLeaveCodesLoading] = useState(false);

  // Overtime
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [isOvertimeEditMode, setIsOvertimeEditMode] = useState(false);
  const [currentOvertimeId, setCurrentOvertimeId] = useState<number | null>(null);
  const [overtimeDate, setOvertimeDate] = useState('');
  const [overtimeNumOTHoursApproved, setOvertimeNumOTHoursApproved] = useState('');
  const [overtimeEarlyOTStartTime, setOvertimeEarlyOTStartTime] = useState('');
  const [overtimeEarlyTimeIn, setOvertimeEarlyTimeIn] = useState('');
  const [overtimeStartOTPM, setOvertimeStartOTPM] = useState('');
  const [overtimeMinHRSOTBreak, setOvertimeMinHRSOTBreak] = useState('');
  const [overtimeEarlyOTStartTimeRestHol, setOvertimeEarlyOTStartTimeRestHol] = useState('');
  const [overtimeReason, setOvertimeReason] = useState('');
  const [overtimeRemarks, setOvertimeRemarks] = useState('');
  const [overtimeApprovedOTBreaksHrs, setOvertimeApprovedOTBreaksHrs] = useState('');
  const [overtimeStotats, setOvertimeStotats] = useState('');
  const [overtimeIsLateFiling, setOvertimeIsLateFiling] = useState(false);
  const [overtimeAppliedBeforeShiftDate, setOvertimeAppliedBeforeShiftDate] = useState('');
  const [overtimeIsOTBeforeShiftNextDay, setOvertimeIsOTBeforeShiftNextDay] = useState(false);
  const [overtimeHoursApproved, setOvertimeHoursApproved] = useState('');
  const [overtimeActualDateInOTBefore, setOvertimeActualDateInOTBefore] = useState('');
  const [overtimeStartTimeBefore, setOvertimeStartTimeBefore] = useState('');
  const [overtimeStartOvertimeDate, setOvertimeStartOvertimeDate] = useState('');
  const [overtimeStartOvertimeTime, setOvertimeStartOvertimeTime] = useState('');
  const [overtimeApprovedBreak, setOvertimeApprovedBreak] = useState('');

  // Contractual
  const [showContractualModal, setShowContractualModal] = useState(false);
  const [isContractualEditMode, setIsContractualEditMode] = useState(false);
  const [currentContractualId, setCurrentContractualId] = useState<number | null>(null);
  const [contractualDateFrom, setContractualDateFrom] = useState('');
  const [contractualDateTo, setContractualDateTo] = useState('');

  // Suspension
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [isSuspensionEditMode, setIsSuspensionEditMode] = useState(false);
  const [currentSuspensionId, setCurrentSuspensionId] = useState<number | null>(null);
  const [suspensionDateFrom, setSuspensionDateFrom] = useState('');
  const [suspensionDateTo, setSuspensionDateTo] = useState('');

  // Leave Applications Data
  const [leaveApplicationsData, setLeaveApplicationsData] = useState<LeaveApplication[]>([]);
  const [leaveApplicationsLoading, setLeaveApplicationsLoading] = useState(false);

  // Device Code
  const [deviceCodeEntries, setDeviceCodeEntries] = useState<DeviceCode[]>([]);
  const [deviceCodeLoading, setDeviceCodeLoading] = useState(false);
  const [showDeviceCodeModal, setShowDeviceCodeModal] = useState(false);
  const [isDeviceCodeEditMode, setIsDeviceCodeEditMode] = useState(false);
  const [currentDeviceCodeId, setCurrentDeviceCodeId] = useState<number | null>(null);
  const [deviceCode, setDeviceCode] = useState('');
  const [devicePassword, setDevicePassword] = useState('');
  const [deviceEffectivityDate, setDeviceEffectivityDate] = useState('');
  const [deviceExpiryDate, setDeviceExpiryDate] = useState('');

  // Rest Day
  const [restDayLoading, setRestDayLoading] = useState(false);
  const [restDayMode, setRestDayMode] = useState<'fixed' | 'variable'>('variable');
  const [restDayFixedData, setRestDayFixedData] = useState<RestDayFixed | null>(null);
  const [restDayVariableData, setRestDayVariableData] = useState<RestDayVariable[]>([]);
  const [showRestDayModal, setShowRestDayModal] = useState(false);
  const [isRestDayEditMode, setIsRestDayEditMode] = useState(false);
  const [currentRestDayId, setCurrentRestDayId] = useState<number | null>(null);
  const [restDayDateFrom, setRestDayDateFrom] = useState('');
  const [restDayDateTo, setRestDayDateTo] = useState('');
  const [restDay1, setRestDay1] = useState('');
  const [restDay2, setRestDay2] = useState('');
  const [restDay3, setRestDay3] = useState('');

  // Workshift
  const [workshiftLoading, setWorkshiftLoading] = useState(false);
  const [workshiftMode, setWorkshiftMode] = useState<'fixed' | 'variable'>('variable');
  const [workshiftFixedData, setWorkshiftFixedData] = useState<WorkshiftFixed | null>(null);
  const [workshiftVariableData, setWorkshiftVariableData] = useState<WorkshiftVariable[]>([]);
  const [showWorkshiftModal, setShowWorkshiftModal] = useState(false);
  const [isWorkshiftEditMode, setIsWorkshiftEditMode] = useState(false);
  const [currentWorkshiftId, setCurrentWorkshiftId] = useState<number | null>(null);
  const [workshiftDateFrom, setWorkshiftDateFrom] = useState('');
  const [workshiftDateTo, setWorkshiftDateTo] = useState('');
  const [workshiftShiftCode, setWorkshiftShiftCode] = useState('');
  const [fixedDailySched, setFixedDailySched] = useState('');
  const [workshiftCodes, setWorkshiftCodes] = useState<WorkshiftCode[]>([]);
  const [workshiftCodesLoading, setWorkshiftCodesLoading] = useState(false);
  const [showWorkshiftCodeModal, setShowWorkshiftCodeModal] = useState(false);

  // Daily Schedule
  const [dailySchedules, setDailySchedules] = useState<DailySchedule[]>([]);
  const [dailyScheduleLoading, setDailyScheduleLoading] = useState(false);
  const [showDailyScheduleModal, setShowDailyScheduleModal] = useState(false);

  // Classification
  const [classificationLoading, setClassificationLoading] = useState(false);
  const [classificationMode, setClassificationMode] = useState<'fixed' | 'variable'>('variable');
  const [classificationFixedData, setClassificationFixedData] = useState<ClassificationFixed | null>(null);
  const [classificationVariableData, setClassificationVariableData] = useState<ClassificationVariable[]>([]);
  const [showClassificationModal, setShowClassificationModal] = useState(false);
  const [isClassificationEditMode, setIsClassificationEditMode] = useState(false);
  const [currentClassificationId, setCurrentClassificationId] = useState<number | null>(null);
  const [classificationDateFrom, setClassificationDateFrom] = useState('');
  const [classificationDateTo, setClassificationDateTo] = useState('');
  const [fixedClassCode, setFixedClassCode] = useState('');
  const [variableClassCode, setVariableClassCode] = useState('');
  const [classificationCodes, setClassificationCodes] = useState<ClassificationCodeItem[]>([]);
  const [classificationCodesLoading, setClassificationCodesLoading] = useState(false);
  const [showClassificationCodeModal, setShowClassificationCodeModal] = useState(false);
  // true = search was opened from Fixed panel; false = from Variable modal
  const [isFixedCodeSearch, setIsFixedCodeSearch] = useState(false);

  // Overtime data
  const [overtimeApplicationsData, setOvertimeApplicationsData] = useState<any[]>([]);
  const [overtimeLoading, setOvertimeLoading] = useState(false);

  // Contractual data
  const [contractualData, setContractualData] = useState<{ id: number; dateFrom: string; dateTo: string }[]>([]);
  const [contractualLoading, setContractualLoading] = useState(false);

  // Suspension data
  const [suspensionData, setSuspensionData] = useState<{ id: number; dateFrom: string; dateTo: string }[]>([]);
  const [suspensionLoading, setSuspensionLoading] = useState(false);

  const employeeName = 'Last122, First A';
  const payPeriod = 'Main Monthly';

  // TKS Group Modal
  const [showTKSGroupModal, setShowTKSGroupModal] = useState(false);
  const [tksGroupSearchTerm, setTksGroupSearchTerm] = useState('');
  const [payrollLocationData, setPayrollLocationData] = useState<PayrollLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [groupDescMap, setGroupDescMap] = useState<Map<string, string>>(new Map());

  // ── Per-tab pagination (20 rows per page) ──────────────────────────────────
  const TAB_PAGE_SIZE = 20;
  const [deviceCodePage, setDeviceCodePage]           = useState(1);
  const [restDayVarPage, setRestDayVarPage]           = useState(1);
  const [workshiftVarPage, setWorkshiftVarPage]       = useState(1);
  const [classVarPage, setClassVarPage]               = useState(1);
  const [leavePage, setLeavePage]                     = useState(1);
  const [overtimePage, setOvertimePage]               = useState(1);
  const [contractualPage, setContractualPage]         = useState(1);
  const [suspensionPage, setSuspensionPage]           = useState(1);

  // ==================== API FUNCTIONS ====================

  const fetchGroupDescriptions = async (): Promise<Map<string, string>> => {
    try {
      const { data } = await apiClient.get('/Fs/Process/TimeKeepGroupSetUp');
      const groups: { groupCode: string; groupDescription: string }[] = data ?? [];
      return new Map(groups.map((g) => [String(g.groupCode), g.groupDescription]));
    } catch {
      return new Map();
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/Fs/Process/PayRollLocationSetUp');
      if (response.status === 200 && response.data) setPayrollLocationData(response.data);
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to load payroll locations' });
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupSchedules = async () => {
    setGroupScheduleLoading(true);
    try {
      const response = await apiClient.get('/Fs/Process/GroupScheduleSetUp');
      if (response.status === 200 && response.data) setGroupSchedules(response.data);
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to load group schedules' });
    } finally {
      setGroupScheduleLoading(false);
    }
  };

  const fetchEmployees = async () => {
    setEmployeeLoading(true);
    setEmployeeError('');
    try {
      const { employees } = await fetchEmployeesService();
      setEmployees(employees);
    } catch (error: any) {
      setEmployeeError(error.response?.data?.message || error.message || 'Failed to load employees');
    } finally {
      setEmployeeLoading(false);
    }
  };

  const fetchWorkshiftCodes = async () => {
    setWorkshiftCodesLoading(true);
    try {
      const response = await apiClient.get('/Fs/Process/WorkshiftSetUp');
      if (response.status === 200 && response.data) {
        setWorkshiftCodes((response.data.data || []).map((w: any) => ({ code: w.code || '', description: w.description || '' })));
      }
    } catch (err) {
      console.error('Error fetching workshift codes:', err);
    } finally {
      setWorkshiftCodesLoading(false);
    }
  };

  const fetchClassificationCodes = async () => {
    setClassificationCodesLoading(true);
    try {
      const response = await apiClient.get('/Fs/Process/AllowanceAndEarnings/ClassificationSetUp');
      if (response.status === 200 && response.data) {
        setClassificationCodes(Array.isArray(response.data) ? response.data : (response.data.data || []));
      }
    } catch (err) {
      console.error('Error fetching classification codes:', err);
    } finally {
      setClassificationCodesLoading(false);
    }
  };

  const fetchLeaveCodes = async () => {
    setLeaveCodesLoading(true);
    try {
      const response = await apiClient.get('/Fs/Process/LeaveTypeSetUp');
      if (response.status === 200 && response.data) {
        setLeaveCodes(response.data.map((item: any) => ({ code: item.leaveCode || '', description: item.leaveDesc || '' })));
      }
    } catch (err) {
      console.error('Error fetching leave codes:', err);
    } finally {
      setLeaveCodesLoading(false);
    }
  };

  const fetchBasicConfigByEmpCode = async (empCodeParam: string) => {
    if (!empCodeParam) return;
    setBasicConfigLoading(true);
    setBasicConfigError('');
    try {
      const response = await apiClient.get('/Maintenance/EmployeeBasicConfiguration', { params: { empCode: empCodeParam } });
      if (response.status === 200 && response.data) {
        if (response.data.items && response.data.items.length > 0) {
          const config = response.data.items[0];
          setBasicConfigData(config);
          setOriginalGroupCode(config.groupCode ?? '');
          setIsCreatingNew(false);
        } else {
          setBasicConfigData(null);
          setOriginalGroupCode('');
          setIsCreatingNew(true);
        }
      }
    } catch (error: any) {
      setBasicConfigError(error.response?.data?.message || error.message || 'Failed to load basic configuration');
      if (error.response?.status === 404) { setBasicConfigData(null); setOriginalGroupCode(''); setIsCreatingNew(true); }
    } finally {
      setBasicConfigLoading(false);
    }
  };

  const fetchExemptionsByEmpCode = async (empCodeParam: string) => {
    if (!empCodeParam) return;
    setExemptionsLoading(true);
    try {
      const response = await apiClient.get('/Maintenance/EmployeeExemptions');
      if (response.status === 200 && response.data) {
        const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
        const found = allItems.find((item: any) => (item.empCode?.trim() || '').toLowerCase() === empCodeParam.trim().toLowerCase());
        setExemptionsData(found || { id: 0, empCode: empCodeParam, tardiness: false, undertime: false, nightDiffBasic: false, overtime: false, absences: false, otherEarnAndAllow: false, holidayPay: false, unprodWorkHoliday: false });
      }
    } catch {
      setExemptionsData({ id: 0, empCode: empCodeParam, tardiness: false, undertime: false, nightDiffBasic: false, overtime: false, absences: false, otherEarnAndAllow: false, holidayPay: false, unprodWorkHoliday: false });
    } finally {
      setExemptionsLoading(false);
    }
  };

  const fetchLeaveApplicationsByEmpCode = async (empCodeParam: string) => {
    if (!empCodeParam) return;
    setLeaveApplicationsLoading(true);
    try {
      const response = await apiClient.get('/Maintenance/EmployeeLeaveApplication');
      if (response.status === 200 && response.data) {
        const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
        setLeaveApplicationsData(
          allItems
            .filter((item: any) => (item.empCode?.trim() || '').toLowerCase() === empCodeParam.trim().toLowerCase())
            .map((item: any) => ({
              id: item.id, empCode: item.empCode?.trim() ?? '', date: item.date ?? '',
              hoursApprovedNum: item.hoursApprovedNum ?? 0, leaveCode: item.leaveCode?.trim() ?? '',
              period: item.period ?? '', reason: item.reason ?? '', remarks: item.remarks ?? '',
              withPay: item.withPay ?? false, sssNotif: item.sssNotif ?? false,
              isProcSSSNotif: item.isProcSSSNotif ?? false, balanceID: item.balanceID ?? '',
              isLateFiling: item.isLateFiling ?? false, isLateFilingProcessed: item.isLateFilingProcessed ?? false,
              exemptAllowFlag: item.exemptAllowFlag ?? false,
            }))
        );
      }
    } catch { setLeaveApplicationsData([]); } finally { setLeaveApplicationsLoading(false); }
  };

  const fetchDeviceCodeByEmpCode = async (empCodeParam: string) => {
    if (!empCodeParam) return;
    setDeviceCodeLoading(true);
    try {
      const response = await apiClient.get('/Maintenance/EmployeeDeviceCode');
      if (response.status === 200 && response.data) {
        const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
        setDeviceCodeEntries(allItems.filter((item: any) => (item.empCode?.trim() || '').toLowerCase() === empCodeParam.trim().toLowerCase()));
      }
    } catch { setDeviceCodeEntries([]); } finally { setDeviceCodeLoading(false); }
  };

  const createDeviceCode = async (data: Partial<DeviceCode>) => {
    setDeviceCodeLoading(true);
    try {
      const response = await apiClient.post('/Maintenance/EmployeeDeviceCode', data);
      if (response.status === 200 || response.status === 201) {
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Device code created successfully.', timer: 2000, showConfirmButton: false });
        await fetchDeviceCodeByEmpCode(empCode);
        setShowDeviceCodeModal(false);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to create device code' });
      throw error;
    } finally { setDeviceCodeLoading(false); }
  };

  const updateDeviceCode = async (id: number, data: Partial<DeviceCode>) => {
    setDeviceCodeLoading(true);
    try {
      const response = await apiClient.put(`/Maintenance/EmployeeDeviceCode/${id}`, data);
      if (response.status === 200 || response.status === 204) {
        await Swal.fire({ icon: 'success', title: 'Updated!', text: 'Device code updated successfully.', timer: 2000, showConfirmButton: false });
        await fetchDeviceCodeByEmpCode(empCode);
        setShowDeviceCodeModal(false);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to update device code' });
      throw error;
    } finally { setDeviceCodeLoading(false); }
  };

  const deleteDeviceCode = async (id: number) => {
    const result = await Swal.fire({ title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, delete it!' });
    if (result.isConfirmed) {
      setDeviceCodeLoading(true);
      try {
        const response = await apiClient.delete(`/Maintenance/EmployeeDeviceCode/${id}`);
        if (response.status === 200 || response.status === 204) {
          await Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Device code has been deleted.', timer: 2000, showConfirmButton: false });
          await fetchDeviceCodeByEmpCode(empCode);
        }
      } catch (error: any) {
        await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to delete device code' });
      } finally { setDeviceCodeLoading(false); }
    }
  };

  const handleDeviceCodeSubmit = async () => {
    try {
      const payload: Partial<DeviceCode> = {
        id: isDeviceCodeEditMode && currentDeviceCodeId !== null ? currentDeviceCodeId : 0,
        empCode,
        timeInAndOutCode: deviceCode,
        timeInAndOutPass: devicePassword,
        timeInAndOutEffectDate: toLocalISOString(deviceEffectivityDate) ?? '',
        timeInAndOutExpiryDate: toLocalISOString(deviceExpiryDate) ?? '',
      };
      if (isDeviceCodeEditMode && currentDeviceCodeId !== null) {
        await updateDeviceCode(currentDeviceCodeId, payload);
      } else {
        await createDeviceCode(payload);
      }
    } catch (error) {
      console.error('Error submitting device code:', error);
    }
  };

  // ── Rest Day ────────────────────────────────────────────────────────────────

  const fetchRestDayFixed = async (empCodeParam: string) => {
    if (!empCodeParam) return;
    setRestDayLoading(true);
    try {
      const response = await apiClient.get('/Maintenance/EmployeeRestDay/Fixed');
      if (response.status === 200 && response.data) {
        const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
        const found = allItems.find((item: any) => (item.empCode?.trim() || '').toLowerCase() === empCodeParam.trim().toLowerCase());
        if (found) {
          setRestDayFixedData(found);
          setRestDayMode(found.isFixed === true ? 'fixed' : 'variable');
          setRestDay1(found.fixedRestDay1?.trim() ?? '');
          setRestDay2(found.fixedRestDay2?.trim() ?? '');
          setRestDay3(found.fixedRestDay3?.trim() ?? '');
        }
      }
    } catch { setRestDayFixedData(null); } finally { setRestDayLoading(false); }
  };

  const fetchRestDayVariable = async (empCodeParam: string) => {
    if (!empCodeParam) return;
    setRestDayLoading(true);
    try {
      const response = await apiClient.get('/Maintenance/EmployeeRestDay/Variable');
      if (response.status === 200 && response.data) {
        const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
        setRestDayVariableData(allItems.filter((item: any) => (item.empCode?.trim() || '').toLowerCase() === empCodeParam.trim().toLowerCase()));
      }
    } catch { setRestDayVariableData([]); } finally { setRestDayLoading(false); }
  };

  const fetchRestDayByEmpCode = async (empCodeParam: string) => {
    await Promise.all([fetchRestDayFixed(empCodeParam), fetchRestDayVariable(empCodeParam)]);
  };

  const saveRestDayFixed = async () => {
    const data: Partial<RestDayFixed> = { id: restDayFixedData?.id || 0, empCode, fixedRestDay1: restDay1, fixedRestDay2: restDay2, fixedRestDay3: restDay3, isFixed: true };
    setRestDayLoading(true);
    try {
      const response = data.id === 0 || !data.id
        ? await apiClient.post('/Maintenance/EmployeeRestDay/Fixed', data)
        : await apiClient.put(`/Maintenance/EmployeeRestDay/Fixed/${data.id}`, data);
      if (response.status === 200 || response.status === 201 || response.status === 204) {
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Fixed rest day saved successfully.', timer: 2000, showConfirmButton: false });
        await fetchRestDayFixed(empCode);
        setIsEditMode(false);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to save fixed rest day' });
    } finally { setRestDayLoading(false); }
  };

  // ── FIX: RestDay Variable — flat body, no { dto } wrapper.
  //   Field names match Swagger exactly: datefrom (lowercase), dateTo (camelCase).
  //   Dates sent as ISO strings via toLocalISOString to prevent 400.
  const createRestDayVariable = async (data: Partial<RestDayVariable>) => {
    setRestDayLoading(true);
    try {
      const payload = {
        id: 0,
        empCode: data.empCode,
        datefrom: toLocalISOString(data.datefrom ?? '') ?? null,
        dateTo:   toLocalISOString(data.dateTo   ?? '') ?? null,
        restDay1: data.restDay1 || null,
        restDay2: data.restDay2 || null,
        restDay3: data.restDay3 || null,
      };
      const response = await apiClient.post('/Maintenance/EmployeeRestDay/Variable', payload);
      if (response.status === 200 || response.status === 201) {
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Variable rest day created successfully.', timer: 2000, showConfirmButton: false });
        await fetchRestDayVariable(empCode);
        setShowRestDayModal(false);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to create variable rest day' });
    } finally { setRestDayLoading(false); }
  };

  // ── FIX: RestDay Variable UPDATE — flat body, no { dto } wrapper.
  const updateRestDayVariable = async (id: number, data: Partial<RestDayVariable>) => {
    setRestDayLoading(true);
    try {
      const payload = {
        id,
        empCode: data.empCode,
        datefrom: toLocalISOString(data.datefrom ?? '') ?? null,
        dateTo:   toLocalISOString(data.dateTo   ?? '') ?? null,
        restDay1: data.restDay1 || null,
        restDay2: data.restDay2 || null,
        restDay3: data.restDay3 || null,
      };
      const response = await apiClient.put(`/Maintenance/EmployeeRestDay/Variable/${id}`, payload);
      if (response.status === 200 || response.status === 204) {
        await Swal.fire({ icon: 'success', title: 'Updated!', text: 'Variable rest day updated successfully.', timer: 2000, showConfirmButton: false });
        await fetchRestDayVariable(empCode);
        setShowRestDayModal(false);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to update variable rest day' });
    } finally { setRestDayLoading(false); }
  };

  const deleteRestDayVariable = async (id: number) => {
    const result = await Swal.fire({ title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, delete it!' });
    if (result.isConfirmed) {
      setRestDayLoading(true);
      try {
        const response = await apiClient.delete(`/Maintenance/EmployeeRestDay/Variable/${id}`);
        if (response.status === 200 || response.status === 204) {
          await Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Variable rest day has been deleted.', timer: 2000, showConfirmButton: false });
          await fetchRestDayVariable(empCode);
        }
      } catch (error: any) {
        await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to delete variable rest day' });
      } finally { setRestDayLoading(false); }
    }
  };

  const handleRestDaySubmit = async () => {
    try {
      const data: Partial<RestDayVariable> = {
        empCode,
        datefrom: restDayDateFrom,
        dateTo: restDayDateTo,
        restDay1,
        restDay2,
        restDay3,
      };
      if (isRestDayEditMode && currentRestDayId !== null) {
        await updateRestDayVariable(currentRestDayId, data);
      } else {
        await createRestDayVariable(data);
      }
    } catch (error) { console.error('Error submitting rest day:', error); }
  };

  // ── Daily Schedules ─────────────────────────────────────────────────────────

  const fetchDailySchedules = async () => {
    setDailyScheduleLoading(true);
    try {
      const response = await apiClient.get('/Fs/Process/DailyScheduleSetUp');
      if (response.status === 200 && response.data) {
        setDailySchedules((response.data.data || []).map((s: any) => ({
          dailyScheduleID: s.dailyScheduleID || 0, referenceNo: s.referenceNo || '',
          monday: s.monday || '', tuesday: s.tuesday || '', wednesday: s.wednesday || '',
          thursday: s.thursday || '', friday: s.friday || '', saturday: s.saturday || '', sunday: s.sunday || '',
        })));
      }
    } catch (error: any) { console.error('Error fetching daily schedules:', error); } finally { setDailyScheduleLoading(false); }
  };

  // ── Workshift ───────────────────────────────────────────────────────────────

  const fetchWorkshiftFixed = async (empCodeParam: string) => {
    if (!empCodeParam) return;
    setWorkshiftLoading(true);
    try {
      const response = await apiClient.get('/Maintenance/EmployeeWorkshiftFixed');
      if (response.status === 200 && response.data) {
        const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
        const found = allItems.find((item: any) => (item.empCode?.trim() || '').toLowerCase() === empCodeParam.trim().toLowerCase());
        if (found) { setWorkshiftFixedData(found); setWorkshiftMode(found.isFixed === true ? 'fixed' : 'variable'); setFixedDailySched(found.dailySched || ''); }
      }
    } catch { setWorkshiftFixedData(null); } finally { setWorkshiftLoading(false); }
  };

  const fetchWorkshiftVariable = async (empCodeParam: string) => {
    if (!empCodeParam) return;
    setWorkshiftLoading(true);
    try {
      const response = await apiClient.get('/Maintenance/EmployeeWorkshiftVariable');
      if (response.status === 200 && response.data) {
        const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
        setWorkshiftVariableData(allItems.filter((item: any) => (item.empCode?.trim() || '').toLowerCase() === empCodeParam.trim().toLowerCase()));
      }
    } catch { setWorkshiftVariableData([]); } finally { setWorkshiftLoading(false); }
  };

  const fetchWorkshiftByEmpCode = async (empCodeParam: string) => {
    await Promise.all([fetchWorkshiftFixed(empCodeParam), fetchWorkshiftVariable(empCodeParam)]);
  };

  const saveWorkshiftFixed = async () => {
    const data: Partial<WorkshiftFixed> = { id: workshiftFixedData?.id || 0, empCode, dailySched: fixedDailySched, isFixed: true };
    setWorkshiftLoading(true);
    try {
      const response = data.id === 0 || !data.id
        ? await apiClient.post('/Maintenance/EmployeeWorkshiftFixed', data)
        : await apiClient.put(`/Maintenance/EmployeeWorkshiftFixed/${data.id}`, data);
      if (response.status === 200 || response.status === 201 || response.status === 204) {
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Fixed workshift saved successfully.', timer: 2000, showConfirmButton: false });
        await fetchWorkshiftFixed(empCode);
        setIsEditMode(false);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to save fixed workshift' });
    } finally { setWorkshiftLoading(false); }
  };

  // ── FIX: Workshift Variable CREATE — flat body, dates as ISO strings.
  //   Field names: dateFrom, dateTo (both camelCase matching Workshift DTO).
  const createWorkshiftVariable = async (data: Partial<WorkshiftVariable>) => {
    setWorkshiftLoading(true);
    try {
      const payload = {
        id: 0,
        empCode: data.empCode,
        dateFrom:   toLocalISOString(data.dateFrom   ?? '') ?? null,
        dateTo:     toLocalISOString(data.dateTo     ?? '') ?? null,
        shiftCode:  data.shiftCode  || null,
        updateDate: new Date().toISOString(),
      };
      const response = await apiClient.post('/Maintenance/EmployeeWorkshiftVariable', payload);
      if (response.status === 200 || response.status === 201) {
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Variable workshift created successfully.', timer: 2000, showConfirmButton: false });
        await fetchWorkshiftVariable(empCode);
        setShowWorkshiftModal(false);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to create variable workshift' });
    } finally { setWorkshiftLoading(false); }
  };

  // ── FIX: Workshift Variable UPDATE — flat body, dates as ISO strings.
  const updateWorkshiftVariable = async (id: number, data: Partial<WorkshiftVariable>) => {
    setWorkshiftLoading(true);
    try {
      const payload = {
        id,
        empCode: data.empCode,
        dateFrom:   toLocalISOString(data.dateFrom   ?? '') ?? null,
        dateTo:     toLocalISOString(data.dateTo     ?? '') ?? null,
        shiftCode:  data.shiftCode  || null,
        updateDate: new Date().toISOString(),
      };
      const response = await apiClient.put(`/Maintenance/EmployeeWorkshiftVariable/${id}`, payload);
      if (response.status === 200 || response.status === 204) {
        await Swal.fire({ icon: 'success', title: 'Updated!', text: 'Variable workshift updated successfully.', timer: 2000, showConfirmButton: false });
        await fetchWorkshiftVariable(empCode);
        setShowWorkshiftModal(false);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to update variable workshift' });
    } finally { setWorkshiftLoading(false); }
  };

  const deleteWorkshiftVariable = async (id: number) => {
    const result = await Swal.fire({ title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, delete it!' });
    if (result.isConfirmed) {
      setWorkshiftLoading(true);
      try {
        const response = await apiClient.delete(`/Maintenance/EmployeeWorkshiftVariable/${id}`);
        if (response.status === 200 || response.status === 204) {
          await Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Variable workshift has been deleted.', timer: 2000, showConfirmButton: false });
          await fetchWorkshiftVariable(empCode);
        }
      } catch (error: any) {
        await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to delete variable workshift' });
      } finally { setWorkshiftLoading(false); }
    }
  };

  const handleWorkshiftSubmit = async () => {
    try {
      const data: Partial<WorkshiftVariable> = {
        empCode,
        dateFrom:  workshiftDateFrom,
        dateTo:    workshiftDateTo,
        shiftCode: workshiftShiftCode,
      };
      if (isWorkshiftEditMode && currentWorkshiftId !== null) {
        await updateWorkshiftVariable(currentWorkshiftId, data);
      } else {
        await createWorkshiftVariable(data);
      }
    } catch (error) { console.error('Error submitting workshift:', error); }
  };

  // ── Classification ──────────────────────────────────────────────────────────

  const fetchClassificationFixed = async (empCodeParam: string) => {
    if (!empCodeParam) return;
    setClassificationLoading(true);
    try {
      const response = await apiClient.get('/Maintenance/EmployeeClassification/Fixed');
      if (response.status === 200 && response.data) {
        const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
        const found = allItems.find((item: any) => (item.empCode?.trim() || '').toLowerCase() === empCodeParam.trim().toLowerCase());
        if (found) { setClassificationFixedData(found); setClassificationMode(found.isFixed === true ? 'fixed' : 'variable'); setFixedClassCode(found.classCode || ''); }
      }
    } catch { setClassificationFixedData(null); } finally { setClassificationLoading(false); }
  };

  const fetchClassificationVariable = async (empCodeParam: string) => {
    if (!empCodeParam) return;
    setClassificationLoading(true);
    try {
      const response = await apiClient.get('/Maintenance/EmployeeClassification/Variable');
      if (response.status === 200 && response.data) {
        const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
        setClassificationVariableData(allItems.filter((item: any) => (item.empCode?.trim() || '').toLowerCase() === empCodeParam.trim().toLowerCase()));
      }
    } catch { setClassificationVariableData([]); } finally { setClassificationLoading(false); }
  };

  const fetchClassificationByEmpCode = async (empCodeParam: string) => {
    await Promise.all([fetchClassificationFixed(empCodeParam), fetchClassificationVariable(empCodeParam)]);
  };

  const saveClassificationFixed = async () => {
    const data: Partial<ClassificationFixed> = { id: classificationFixedData?.id || 0, empCode, classCode: fixedClassCode, isFixed: true };
    setClassificationLoading(true);
    try {
      const response = data.id === 0 || !data.id
        ? await apiClient.post('/Maintenance/EmployeeClassification/Fixed', data)
        : await apiClient.put(`/Maintenance/EmployeeClassification/Fixed/${data.id}`, data);
      if (response.status === 200 || response.status === 201 || response.status === 204) {
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Fixed classification saved successfully.', timer: 2000, showConfirmButton: false });
        await fetchClassificationFixed(empCode);
        setIsEditMode(false);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to save fixed classification' });
    } finally { setClassificationLoading(false); }
  };

  // ── FIX: Classification Variable CREATE — flat body, dates as ISO strings.
  //   Field names: dateFrom, dateTo (both camelCase matching Classification DTO).
  const createClassificationVariable = async (data: Partial<ClassificationVariable>) => {
    setClassificationLoading(true);
    try {
      const payload = {
        id: 0,
        empCode: data.empCode,
        dateFrom:  toLocalISOString(data.dateFrom  ?? '') ?? null,
        dateTo:    toLocalISOString(data.dateTo    ?? '') ?? null,
        classCode: data.classCode || null,
      };
      const response = await apiClient.post('/Maintenance/EmployeeClassification/Variable', payload);
      if (response.status === 200 || response.status === 201) {
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Variable classification created successfully.', timer: 2000, showConfirmButton: false });
        await fetchClassificationVariable(empCode);
        setShowClassificationModal(false);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to create variable classification' });
    } finally { setClassificationLoading(false); }
  };

  // ── FIX: Classification Variable UPDATE — flat body, dates as ISO strings.
  const updateClassificationVariable = async (id: number, data: Partial<ClassificationVariable>) => {
    setClassificationLoading(true);
    try {
      const payload = {
        id,
        empCode: data.empCode,
        dateFrom:  toLocalISOString(data.dateFrom  ?? '') ?? null,
        dateTo:    toLocalISOString(data.dateTo    ?? '') ?? null,
        classCode: data.classCode || null,
      };
      const response = await apiClient.put(`/Maintenance/EmployeeClassification/Variable/${id}`, payload);
      if (response.status === 200 || response.status === 204) {
        await Swal.fire({ icon: 'success', title: 'Updated!', text: 'Variable classification updated successfully.', timer: 2000, showConfirmButton: false });
        await fetchClassificationVariable(empCode);
        setShowClassificationModal(false);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to update variable classification' });
    } finally { setClassificationLoading(false); }
  };

  const deleteClassificationVariable = async (id: number) => {
    const result = await Swal.fire({ title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, delete it!' });
    if (result.isConfirmed) {
      setClassificationLoading(true);
      try {
        const response = await apiClient.delete(`/Maintenance/EmployeeClassification/Variable/${id}`);
        if (response.status === 200 || response.status === 204) {
          await Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Variable classification has been deleted.', timer: 2000, showConfirmButton: false });
          await fetchClassificationVariable(empCode);
        }
      } catch (error: any) {
        await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to delete variable classification' });
      } finally { setClassificationLoading(false); }
    }
  };

  const handleClassificationSubmit = async () => {
    if (!variableClassCode || variableClassCode.trim() === '') {
      await Swal.fire({ icon: 'warning', title: 'Validation', text: 'Please select a Classification Code before saving.' });
      return;
    }
    try {
      const data: Partial<ClassificationVariable> = {
        empCode,
        dateFrom: classificationDateFrom,
        dateTo:   classificationDateTo,
        classCode: variableClassCode,
      };
      if (isClassificationEditMode && currentClassificationId !== null) {
        await updateClassificationVariable(currentClassificationId, data);
      } else {
        await createClassificationVariable(data);
      }
    } catch (error) { console.error('Error submitting classification:', error); }
  };

  // ── Overtime ────────────────────────────────────────────────────────────────

  const fetchOvertimeApplicationsByEmpCode = async (empCodeParam: string) => {
    if (!empCodeParam) return;
    setOvertimeLoading(true);
    try {
      const response = await apiClient.get('/Maintenance/EmployeeOvertimeApplication');
      if (response.status === 200 && response.data) {
        const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
        setOvertimeApplicationsData(
          allItems
            .filter((item: any) => (item.empCode?.trim() || '').toLowerCase() === empCodeParam.trim().toLowerCase())
            .map((item: any) => ({
              id: item.id, empCode: item.empCode ?? '', date: item.date ?? '',
              numOTHoursApproved: item.numOTHoursApproved ?? 0, earlyOTStartTime: item.earlyOTStartTime ?? '',
              earlyTimeIn: item.earlyTimeIn ?? '', startOTPM: item.startOTPM ?? '',
              minHRSOTBreak: item.minHRSOTBreak ?? 0, earlyOTStartTimeRestHol: item.earlyOTStartTimeRestHol ?? '',
              reason: item.reason ?? '', remarks: item.remarks ?? '',
              approvedOTBreaksHrs: item.approvedOTBreaksHrs ?? 0, stotats: item.stotats ?? '',
              isLateFiling: item.isLateFiling ?? false, isLateFilingProcessed: item.isLateFilingProcessed ?? false,
              appliedBeforeShiftDate: item.appliedBeforeShiftDate ?? '', isOTBeforeShiftNextDay: item.isOTBeforeShiftNextDay ?? false,
            }))
        );
      }
    } catch { setOvertimeApplicationsData([]); } finally { setOvertimeLoading(false); }
  };

  const createOvertimeApplication = async (data: Partial<OvertimeApplication>) => {
    setOvertimeLoading(true);
    try {
      const response = await apiClient.post('/Maintenance/EmployeeOvertimeApplication', data);
      if (response.status === 200 || response.status === 201) {
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Overtime application created successfully.', timer: 2000, showConfirmButton: false });
        await fetchOvertimeApplicationsByEmpCode(empCode);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to create overtime application' });
      throw error;
    } finally { setOvertimeLoading(false); }
  };

  const updateOvertimeApplication = async (id: number, data: Partial<OvertimeApplication>) => {
    setOvertimeLoading(true);
    try {
      const response = await apiClient.put(`/Maintenance/EmployeeOvertimeApplication/${id}`, data);
      if (response.status === 200 || response.status === 204) {
        await Swal.fire({ icon: 'success', title: 'Updated!', text: 'Overtime application updated successfully.', timer: 2000, showConfirmButton: false });
        await fetchOvertimeApplicationsByEmpCode(empCode);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to update overtime application' });
      throw error;
    } finally { setOvertimeLoading(false); }
  };

  const deleteOvertimeApplication = async (id: number) => {
    const result = await Swal.fire({ title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, delete it!' });
    if (result.isConfirmed) {
      setOvertimeLoading(true);
      try {
        const response = await apiClient.delete(`/Maintenance/EmployeeOvertimeApplication/${id}`);
        if (response.status === 200 || response.status === 204) {
          await Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Overtime application has been deleted.', timer: 2000, showConfirmButton: false });
          await fetchOvertimeApplicationsByEmpCode(empCode);
        }
      } catch (error: any) {
        await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to delete overtime application' });
      } finally { setOvertimeLoading(false); }
    }
  };

  const timeToISOString = (timeStr: string): string | null => {
    if (!timeStr || timeStr.trim() === '') return null;
    try {
      if (timeStr.includes('T')) return timeStr;
      const today = new Date();
      const base = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const dt = new Date(`${base}T${timeStr}`);
      return isNaN(dt.getTime()) ? null : dt.toISOString();
    } catch {
      return null;
    }
  };

  const handleOvertimeSubmit = async () => {
    try {
      const payload = {
        id:                      isOvertimeEditMode && currentOvertimeId !== null ? currentOvertimeId : 0,
        empCode,
        date:                    toLocalISOString(overtimeDate) ?? new Date().toISOString(),
        numOTHoursApproved:      parseFloat(overtimeNumOTHoursApproved) || 0,
        earlyOTStartTime:        timeToISOString(overtimeEarlyOTStartTime),
        earlyTimeIn:             timeToISOString(overtimeEarlyTimeIn),
        startOTPM:               timeToISOString(overtimeStartOTPM),
        minHRSOTBreak:           parseFloat(overtimeMinHRSOTBreak) || 0,
        earlyOTStartTimeRestHol: timeToISOString(overtimeEarlyOTStartTimeRestHol),
        reason:                  overtimeReason  || '',
        remarks:                 overtimeRemarks || '',
        approvedOTBreaksHrs:     parseFloat(overtimeApprovedOTBreaksHrs) || 0,
        stotats:                 timeToISOString(overtimeStotats),
        isLateFiling:            overtimeIsLateFiling          ?? false,
        isLateFilingProcessed:   false,
        appliedBeforeShiftDate:  overtimeAppliedBeforeShiftDate
          ? (toLocalISOString(overtimeAppliedBeforeShiftDate) ?? null)
          : null,
        isOTBeforeShiftNextDay:  overtimeIsOTBeforeShiftNextDay ?? false,
      };

      if (isOvertimeEditMode && currentOvertimeId !== null) {
        await updateOvertimeApplication(currentOvertimeId, payload as any);
      } else {
        await createOvertimeApplication(payload as any);
      }
      setShowOvertimeModal(false);
    } catch (error) { console.error('Error submitting overtime application:', error); }
  };

  // ── Contractual ─────────────────────────────────────────────────────────────

  const fetchContractualByEmpCode = async (empCodeParam: string) => {
    if (!empCodeParam) return;
    setContractualLoading(true);
    try {
      const response = await apiClient.get('/Maintenance/EmployeeContractual');
      if (response.status === 200 && response.data) {
        const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
        setContractualData(
          allItems
            .filter((item: any) => (item.empCode?.trim() || '').toLowerCase() === empCodeParam.trim().toLowerCase())
            .map((item: any) => ({
              id: item.id,
              dateFrom: item.dateFr || item.dateFrom || '',
              dateTo: item.dateTo || '',
            }))
        );
      }
    } catch { setContractualData([]); } finally { setContractualLoading(false); }
  };

  const createContractual = async (data: Partial<Contractual>) => {
    setContractualLoading(true);
    try {
      const payload = {
        id: 0,
        empCode: data.empCode,
        dateFr: data.dateFr ? toLocalISOString(data.dateFr) : null,
        dateTo: data.dateTo ? toLocalISOString(data.dateTo) : null,
      };
      const response = await apiClient.post('/Maintenance/EmployeeContractual', payload);
      if (response.status === 200 || response.status === 201) {
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Contractual record created successfully.', timer: 2000, showConfirmButton: false });
        await fetchContractualByEmpCode(empCode);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to create contractual record' });
      throw error;
    } finally { setContractualLoading(false); }
  };

  const updateContractual = async (id: number, data: Partial<Contractual>) => {
    setContractualLoading(true);
    try {
      const payload = {
        id,
        empCode: data.empCode,
        dateFr: data.dateFr ? toLocalISOString(data.dateFr) : null,
        dateTo: data.dateTo ? toLocalISOString(data.dateTo) : null,
      };
      const response = await apiClient.put(`/Maintenance/EmployeeContractual/${id}`, payload);
      if (response.status === 200 || response.status === 204) {
        await Swal.fire({ icon: 'success', title: 'Updated!', text: 'Contractual record updated successfully.', timer: 2000, showConfirmButton: false });
        await fetchContractualByEmpCode(empCode);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to update contractual record' });
      throw error;
    } finally { setContractualLoading(false); }
  };

  const deleteContractual = async (id: number) => {
    const result = await Swal.fire({ title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, delete it!' });
    if (result.isConfirmed) {
      setContractualLoading(true);
      try {
        const response = await apiClient.delete(`/Maintenance/EmployeeContractual/${id}`);
        if (response.status === 200 || response.status === 204) {
          await Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Contractual record has been deleted.', timer: 2000, showConfirmButton: false });
          await fetchContractualByEmpCode(empCode);
        }
      } catch (error: any) {
        await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to delete contractual record' });
      } finally { setContractualLoading(false); }
    }
  };

  const handleContractualSubmit = async () => {
    try {
      const data: Partial<Contractual> = { empCode, dateFr: contractualDateFrom, dateTo: contractualDateTo };
      if (isContractualEditMode && currentContractualId !== null) {
        await updateContractual(currentContractualId, data);
      } else {
        await createContractual(data);
      }
      setShowContractualModal(false);
    } catch (error) { console.error('Error submitting contractual:', error); }
  };

  // ── Suspension ──────────────────────────────────────────────────────────────

  const fetchSuspensionByEmpCode = async (empCodeParam: string) => {
    if (!empCodeParam) return;
    setSuspensionLoading(true);
    try {
      const response = await apiClient.get('/Maintenance/EmployeeSuspension');
      if (response.status === 200 && response.data) {
        const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
        setSuspensionData(
          allItems
            .filter((item: any) => (item.empCode?.trim() || '').toLowerCase() === empCodeParam.trim().toLowerCase())
            .map((item: any) => ({ id: item.id, dateFrom: item.dateFrom || '', dateTo: item.dateTo || '' }))
        );
      }
    } catch { setSuspensionData([]); } finally { setSuspensionLoading(false); }
  };

  const createSuspension = async (data: Partial<Suspension>) => {
    setSuspensionLoading(true);
    try {
      const payload = {
        id: 0,
        empCode: data.empCode,
        dateFrom: data.dateFrom ? toLocalISOString(data.dateFrom) : null,
        dateTo: data.dateTo ? toLocalISOString(data.dateTo) : null,
      };
      const response = await apiClient.post('/Maintenance/EmployeeSuspension', payload);
      if (response.status === 200 || response.status === 201) {
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Suspension record created successfully.', timer: 2000, showConfirmButton: false });
        await fetchSuspensionByEmpCode(empCode);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to create suspension record' });
      throw error;
    } finally { setSuspensionLoading(false); }
  };

  const updateSuspension = async (id: number, data: Partial<Suspension>) => {
    setSuspensionLoading(true);
    try {
      const payload = {
        id,
        empCode: data.empCode,
        dateFrom: data.dateFrom ? toLocalISOString(data.dateFrom) : null,
        dateTo: data.dateTo ? toLocalISOString(data.dateTo) : null,
      };
      const response = await apiClient.put(`/Maintenance/EmployeeSuspension/${id}`, payload);
      if (response.status === 200 || response.status === 204) {
        await Swal.fire({ icon: 'success', title: 'Updated!', text: 'Suspension record updated successfully.', timer: 2000, showConfirmButton: false });
        await fetchSuspensionByEmpCode(empCode);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to update suspension record' });
      throw error;
    } finally { setSuspensionLoading(false); }
  };

  const deleteSuspension = async (id: number) => {
    const result = await Swal.fire({ title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, delete it!' });
    if (result.isConfirmed) {
      setSuspensionLoading(true);
      try {
        const response = await apiClient.delete(`/Maintenance/EmployeeSuspension/${id}`);
        if (response.status === 200 || response.status === 204) {
          await Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Suspension record has been deleted.', timer: 2000, showConfirmButton: false });
          await fetchSuspensionByEmpCode(empCode);
        }
      } catch (error: any) {
        await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to delete suspension record' });
      } finally { setSuspensionLoading(false); }
    }
  };

  const handleSuspensionSubmit = async () => {
    try {
      const data: Partial<Suspension> = { empCode, dateFrom: suspensionDateFrom, dateTo: suspensionDateTo };
      if (isSuspensionEditMode && currentSuspensionId !== null) {
        await updateSuspension(currentSuspensionId, data);
      } else {
        await createSuspension(data);
      }
      setShowSuspensionModal(false);
    } catch (error) { console.error('Error submitting suspension:', error); }
  };

  // ── Basic Config Save/Update ────────────────────────────────────────────────

  const createBasicConfig = async (configData: Partial<EmployeeBasicConfig>) => {
    setBasicConfigLoading(true);
    try {
      const response = await apiClient.post('/Maintenance/EmployeeBasicConfiguration', configData);
      if (response.status === 200 || response.status === 201) {
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Basic configuration created successfully.', timer: 2000, showConfirmButton: false });
        await fetchBasicConfigByEmpCode(empCode);
        setIsEditMode(false);
        setIsCreatingNew(false);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Oops...', text: error.response?.data?.message || error.message || 'Failed to create basic configuration' });
      throw error;
    } finally { setBasicConfigLoading(false); }
  };

  const updateBasicConfig = async (id: number, configData: Partial<EmployeeBasicConfig>) => {
    setBasicConfigLoading(true);
    try {
      const response = await apiClient.put(`/Maintenance/EmployeeBasicConfiguration/${id}`, configData);
      if (response.status === 200 || response.status === 204) {
        await Swal.fire({ icon: 'success', title: 'Updated!', text: 'Basic configuration updated successfully.', timer: 2000, showConfirmButton: false });
        await fetchBasicConfigByEmpCode(empCode);
        setIsEditMode(false);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Update Failed', text: error.response?.data?.message || error.message || 'Failed to update basic configuration' });
      throw error;
    } finally { setBasicConfigLoading(false); }
  };

  const saveExemptions = async () => {
    if (!exemptionsData) return;
    setExemptionsLoading(true);
    try {
      let response;
      if (exemptionsData.id === 0) {
        response = await apiClient.post('/Maintenance/EmployeeExemptions', exemptionsData);
      } else {
        response = await apiClient.put(`/Maintenance/EmployeeExemptions/${exemptionsData.id}`, { ...exemptionsData });
      }
      if (response.status === 200 || response.status === 201 || response.status === 204) {
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Exemptions saved successfully.', timer: 2000, showConfirmButton: false });
        await fetchExemptionsByEmpCode(empCode);
        setIsEditMode(false);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to save exemptions' });
    } finally { setExemptionsLoading(false); }
  };

  // ── Leave Application ───────────────────────────────────────────────────────

  const createLeaveApplication = async (leaveData: Partial<LeaveApplication>) => {
    setLeaveApplicationsLoading(true);
    try {
      const response = await apiClient.post('/Maintenance/EmployeeLeaveApplication', leaveData);
      if (response.status === 200 || response.status === 201) {
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Leave application created successfully.', timer: 2000, showConfirmButton: false });
        await fetchLeaveApplicationsByEmpCode(empCode);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to create leave application' });
      throw error;
    } finally { setLeaveApplicationsLoading(false); }
  };

  const updateLeaveApplication = async (id: number, leaveData: Partial<LeaveApplication>) => {
    setLeaveApplicationsLoading(true);
    try {
      const payload = { ...leaveData, id, balanceID: leaveData.balanceID === '' ? null : leaveData.balanceID, date: leaveData.date ? toLocalISOString(leaveData.date) : null };
      const response = await apiClient.put(`/Maintenance/EmployeeLeaveApplication/${id}`, payload);
      if (response.status === 200 || response.status === 204) {
        await Swal.fire({ icon: 'success', title: 'Updated!', text: 'Leave application updated successfully.', timer: 2000, showConfirmButton: false });
        await fetchLeaveApplicationsByEmpCode(empCode);
      }
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to update leave application' });
      throw error;
    } finally { setLeaveApplicationsLoading(false); }
  };

  const deleteLeaveApplication = async (id: number) => {
    const result = await Swal.fire({ title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, delete it!' });
    if (result.isConfirmed) {
      setLeaveApplicationsLoading(true);
      try {
        const response = await apiClient.delete(`/Maintenance/EmployeeLeaveApplication/${id}`);
        if (response.status === 200 || response.status === 204) {
          await Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Leave application has been deleted.', timer: 2000, showConfirmButton: false });
          await fetchLeaveApplicationsByEmpCode(empCode);
        }
      } catch (error: any) {
        await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to delete leave application' });
      } finally { setLeaveApplicationsLoading(false); }
    }
  };

  const handleLeaveSubmit = async () => {
    try {
      const leaveData: Partial<LeaveApplication> = {
        empCode,
        date: toLocalISOString(leaveDate) ?? '',
        hoursApprovedNum: parseFloat(leaveHoursApproved) || 0,
        leaveCode,
        period: leavePeriod && leavePeriod.trim() !== '' ? leavePeriod : null as any,
        reason: leaveReason,
        remarks: leaveRemarks,
        withPay: leaveWithPay,
        sssNotif: leaveSssNotification,
        isProcSSSNotif: false,
        balanceID: null as any,
        isLateFiling: leaveIsLateFiling,
        isLateFilingProcessed: false,
        exemptAllowFlag: false,
      };
      if (isLeaveEditMode && currentLeaveId !== 0) {
        await updateLeaveApplication(currentLeaveId, leaveData);
      } else {
        await createLeaveApplication(leaveData);
      }
      setShowLeaveModal(false);
    } catch (error) { console.error('Error submitting leave application:', error); }
  };

  // ── Pagination ─────────────────────────────────────────────────────────────

  const filteredPayrollLocations = payrollLocationData.filter(loc =>
    (loc.locCode?.toLowerCase() || '').includes(tksGroupSearchTerm.toLowerCase()) ||
    (loc.locName?.toLowerCase() || '').includes(tksGroupSearchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPayrollLocations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayrollLocations = filteredPayrollLocations.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push('...'); pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1); pages.push('...');
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1); pages.push('...');
      pages.push(currentPage - 1); pages.push(currentPage); pages.push(currentPage + 1);
      pages.push('...'); pages.push(totalPages);
    }
    return pages;
  };

  const handleTKSGroupSelect = (locCode: string, locName: string) => {
    setTksGroup(locCode);
    setTksGroupName(locName);
    setShowTKSGroupModal(false);
    setTksGroupSearchTerm('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePreviousPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const adaptedEmployees = useMemo(() => {
    return employees.map(emp => ({
      ...emp,
      name: `${emp.lName}, ${emp.fName}`,
      groupCode: groupDescMap.get(String((emp as any).tksGroupCode ?? '')) ?? (emp as any).tksGroupCode ?? emp.grpCode ?? '',
    }));
  }, [employees, groupDescMap]);

  // Reset all tab pages when employee changes
  useEffect(() => {
    setDeviceCodePage(1);
    setRestDayVarPage(1);
    setWorkshiftVarPage(1);
    setClassVarPage(1);
    setLeavePage(1);
    setOvertimePage(1);
    setContractualPage(1);
    setSuspensionPage(1);
  }, [empCode]);

  // ── Reusable pagination helper ─────────────────────────────────────────────
  const paginate = <T,>(data: T[], page: number): T[] => {
    const start = (page - 1) * TAB_PAGE_SIZE;
    return data.slice(start, start + TAB_PAGE_SIZE);
  };

  const PaginationBar = ({
    total,
    page,
    onPage,
  }: {
    total: number;
    page: number;
    onPage: (p: number) => void;
  }) => {
    const totalPg = Math.ceil(total / TAB_PAGE_SIZE);
    if (totalPg <= 1) return null;

    const pages: (number | string)[] = [];
    if (totalPg <= 7) {
      for (let i = 1; i <= totalPg; i++) pages.push(i);
    } else if (page <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...'); pages.push(totalPg);
    } else if (page >= totalPg - 3) {
      pages.push(1); pages.push('...');
      for (let i = totalPg - 4; i <= totalPg; i++) pages.push(i);
    } else {
      pages.push(1); pages.push('...');
      pages.push(page - 1); pages.push(page); pages.push(page + 1);
      pages.push('...'); pages.push(totalPg);
    }

    const start = (page - 1) * TAB_PAGE_SIZE + 1;
    const end   = Math.min(page * TAB_PAGE_SIZE, total);

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white">
        <span className="text-xs text-gray-500">
          Showing {total > 0 ? start : 0}–{end} of {total} entries
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onPage(page - 1)}
            disabled={page === 1}
            className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {pages.map((p, i) =>
            typeof p === 'number' ? (
              <button
                key={i}
                onClick={() => onPage(p)}
                className={`px-2 py-1 text-xs rounded ${
                  page === p
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            ) : (
              <span key={i} className="px-2 py-1 text-xs text-gray-400">…</span>
            )
          )}
          <button
            onClick={() => onPage(page + 1)}
            disabled={page === totalPg}
            className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const handleEmployeeSearchSelect = async (empCodeValue: string, name: string) => {
    try {
      const employee = employees.find(emp => emp.empCode === empCodeValue);
      if (!employee) {
        await Swal.fire({ icon: 'error', title: 'Error', text: 'Employee not found' });
        return;
      }

      setEmpCode(empCodeValue);

      const empTksGroup: string =
        (employee as any).tksGroupCode?.trim() ||
        employee.grpCode?.trim() ||
        '';

      if (empTksGroup) {
        setTksGroup(empTksGroup);
        const matchedLoc = payrollLocationData.find(
          loc => (loc.locCode?.trim() || '').toLowerCase() === empTksGroup.toLowerCase()
        );
        setTksGroupName(matchedLoc?.locName ?? '');
      }

      setShowSearchModal(false);
      await Promise.all([
        fetchBasicConfigByEmpCode(empCodeValue),
        fetchExemptionsByEmpCode(empCodeValue),
        fetchLeaveApplicationsByEmpCode(empCodeValue),
        fetchDeviceCodeByEmpCode(empCodeValue),
        fetchRestDayByEmpCode(empCodeValue),
        fetchWorkshiftByEmpCode(empCodeValue),
        fetchClassificationByEmpCode(empCodeValue),
        fetchOvertimeApplicationsByEmpCode(empCodeValue),
        fetchContractualByEmpCode(empCodeValue),
        fetchSuspensionByEmpCode(empCodeValue),
      ]);
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load employee details' });
    }
  };

  const validateCompanyPaths = async (): Promise<boolean> => {
    try {
      const response = await apiClient.get('/Fs/System/CompanyInformation');
      const companyInfo = Array.isArray(response.data) ? response.data[0] : response.data;
      if (!companyInfo) { await Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Company Information is not properly set.' }); return false; }
      const hrisPath = (companyInfo.hrisPath ?? '').trim();
      if (hrisPath !== '') { await Swal.fire({ icon: 'error', title: 'Not Allowed', text: 'You are connected to HRIS. you are not allowed to do any transaction for this setup.' }); return false; }
      return true;
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to retrieve company information.' });
      return false;
    }
  };

  const handleSave = async () => {
    try {
      if (!empCode) { await Swal.fire({ icon: 'warning', title: 'Warning', text: 'Please select an employee first' }); return; }

      if (activeTab === 'basic-config') {
        const companyPathsValid = await validateCompanyPaths();
        if (!companyPathsValid) return;

        if (basicConfigData?.groupScheduleCode && basicConfigData.groupScheduleCode.trim() !== '') {
          const groupScheduleExists = groupSchedules.some(gs => gs.groupScheduleCode.trim() === basicConfigData.groupScheduleCode.trim());
          if (!groupScheduleExists) { await Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Group Schedule does not exist in Group Schedule SetUp.' }); return; }
        }

        if (!isCreatingNew && basicConfigData) {
          const orig = originalGroupCode.trim().toUpperCase();
          const current = tksGroup.trim().toUpperCase();
          if (orig !== current) { await Swal.fire({ icon: 'error', title: 'Not Allowed', text: 'You are connected to HRIS. You are not allowed to change TK Group.' }); return; }
        }

        if (!empCode.trim() || !tksGroup.trim()) { await Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Employee Code / Group Code does not exist in Setup.' }); return; }

        const configData: Partial<EmployeeBasicConfig> = {
          id: basicConfigData?.id,
          empCode,
          groupCode: tksGroup,
          groupScheduleCode: basicConfigData?.groupScheduleCode || '',
          allowOTDefault: basicConfigData?.allowOTDefault || false,
          active: basicConfigData?.active ?? true,
          compAllowFrRDExmpOT: basicConfigData?.compAllowFrRDExmpOT || false,
          compAllowFrHolExmpOT: basicConfigData?.compAllowFrHolExmpOT || false,
          timeAttendanceStatus: basicConfigData?.timeAttendanceStatus || false,
        };

        if (isCreatingNew || !basicConfigData) {
          await createBasicConfig(configData);
        } else {
          await updateBasicConfig(basicConfigData.id, configData);
        }

      } else if (activeTab === 'exemptions') {
        await saveExemptions();
      } else if (activeTab === 'rest-day') {
        if (restDayMode === 'fixed') {
          await saveRestDayFixed();
        } else {
          await Swal.fire({ icon: 'info', title: 'Variable Mode', text: 'Use the Add/Edit buttons in the table to manage variable rest day entries.' });
        }
      } else if (activeTab === 'workshift') {
        if (workshiftMode === 'fixed') {
          await saveWorkshiftFixed();
        } else {
          await Swal.fire({ icon: 'info', title: 'Variable Mode', text: 'Use the Add/Edit buttons in the table to manage variable workshift entries.' });
        }
      } else if (activeTab === 'classification') {
        if (classificationMode === 'fixed') {
          await saveClassificationFixed();
        } else {
          await Swal.fire({ icon: 'info', title: 'Variable Mode', text: 'Use the Add/Edit buttons in the table to manage variable classification entries.' });
        }
      }
    } catch (error) { console.error('Error saving:', error); }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    if (empCode) {
      if (activeTab === 'basic-config') fetchBasicConfigByEmpCode(empCode);
      else if (activeTab === 'exemptions') fetchExemptionsByEmpCode(empCode);
      else if (activeTab === 'rest-day') fetchRestDayByEmpCode(empCode);
      else if (activeTab === 'workshift') fetchWorkshiftByEmpCode(empCode);
      else if (activeTab === 'classification') fetchClassificationByEmpCode(empCode);
    }
  };

  const handleEdit = () => setIsEditMode(true);

  const handleFieldChange = (field: keyof EmployeeBasicConfig, value: any) => {
    setBasicConfigData(prev => {
      if (!prev) return { id: 0, empCode, groupCode: tksGroup, groupScheduleCode: '', allowOTDefault: false, active: true, compAllowFrRDExmpOT: false, compAllowFrHolExmpOT: false, timeAttendanceStatus: false, [field]: value };
      return { ...prev, [field]: value };
    });
  };

  const handleExemptionChange = (field: keyof EmployeeExemptions, value: boolean) => {
    setExemptionsData(prev => { if (!prev) return null; return { ...prev, [field]: value }; });
  };

  const handleLeaveDelete = async (id: number) => await deleteLeaveApplication(id);
  const handleOvertimeDelete = async (id: number) => await deleteOvertimeApplication(id);
  const handleContractualDelete = async (id: number) => await deleteContractual(id);
  const handleSuspensionDelete = async (id: number) => await deleteSuspension(id);

  // ==================== USE EFFECTS ====================

  useEffect(() => {
    fetchData();
    fetchEmployees();
    fetchGroupSchedules();
    fetchDailySchedules();
    fetchWorkshiftCodes();
    fetchClassificationCodes();
    fetchLeaveCodes();
    fetchGroupDescriptions().then(setGroupDescMap);
  }, []);

  useEffect(() => {
    if (empCode) {
      switch (activeTab) {
        case 'basic-config': fetchBasicConfigByEmpCode(empCode); break;
        case 'exemptions': fetchExemptionsByEmpCode(empCode); break;
        case 'device-code': fetchDeviceCodeByEmpCode(empCode); break;
        case 'rest-day': fetchRestDayByEmpCode(empCode); break;
        case 'workshift': fetchWorkshiftByEmpCode(empCode); break;
        case 'classification': fetchClassificationByEmpCode(empCode); break;
        case 'leave-applications': fetchLeaveApplicationsByEmpCode(empCode); break;
        case 'overtime-applications': fetchOvertimeApplicationsByEmpCode(empCode); break;
        case 'contractual': fetchContractualByEmpCode(empCode); break;
        case 'suspension': fetchSuspensionByEmpCode(empCode); break;
      }
    }
  }, [empCode, activeTab]);

  useEffect(() => { setCurrentPage(1); }, [tksGroupSearchTerm]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showSearchModal) setShowSearchModal(false);
        else if (showTKSGroupModal) setShowTKSGroupModal(false);
        else if (showGroupScheduleModal) setShowGroupScheduleModal(false);
        else if (showDeviceCodeModal) setShowDeviceCodeModal(false);
        else if (showRestDayModal) setShowRestDayModal(false);
        else if (showOvertimeModal) setShowOvertimeModal(false);
        else if (showContractualModal) setShowContractualModal(false);
        else if (showSuspensionModal) setShowSuspensionModal(false);
        else if (showWorkshiftModal) setShowWorkshiftModal(false);
        else if (showClassificationModal) setShowClassificationModal(false);
        else if (showDailyScheduleModal) setShowDailyScheduleModal(false);
        else if (showWorkshiftCodeModal) setShowWorkshiftCodeModal(false);
        else if (showClassificationCodeModal) setShowClassificationCodeModal(false);
      }
    };
    const anyOpen = showSearchModal || showTKSGroupModal || showGroupScheduleModal || showDeviceCodeModal || showRestDayModal || showOvertimeModal || showContractualModal || showSuspensionModal || showWorkshiftCodeModal || showClassificationCodeModal;
    if (anyOpen) document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showSearchModal, showTKSGroupModal, showGroupScheduleModal, showDeviceCodeModal, showRestDayModal, showOvertimeModal, showContractualModal, showSuspensionModal, showWorkshiftCodeModal, showClassificationCodeModal]);

  // ==================== TABS ====================

  const tabs = [
    { id: 'basic-config', label: 'Basic Configuration', icon: Settings },
    { id: 'exemptions', label: 'Exemptions', icon: FileX },
    { id: 'device-code', label: 'Device Code', icon: Smartphone },
    { id: 'rest-day', label: 'Rest Day', icon: Calendar },
    { id: 'workshift', label: 'Workshift', icon: Clock },
    { id: 'classification', label: 'Classification', icon: Tag },
    { id: 'leave-applications', label: 'Leave Applications', icon: FileText },
    { id: 'overtime-applications', label: 'Overtime Applications', icon: ClipboardList },
    { id: 'contractual', label: 'Contractual', icon: FileSignature },
    { id: 'suspension', label: 'Suspension', icon: PauseCircle },
  ];

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'basic-config': return 'Employee Basic Configuration';
      case 'exemptions': return 'Employee Exemptions';
      case 'device-code': return 'Employee Device Code';
      case 'rest-day': return 'Employee Rest Day';
      case 'workshift': return 'Employee Workshift';
      case 'classification': return 'Employee Classification';
      case 'leave-applications': return 'Employee Leave Applications';
      case 'overtime-applications': return 'Employee Overtime Applications';
      case 'contractual': return 'Employee Contractual';
      case 'suspension': return 'Employee Suspension';
      default: return 'Employee Timekeep Configuration';
    }
  };

  // ==================== TAB CONTENT ====================

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic-config':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {basicConfigLoading ? (
              <div className="text-center py-8">Loading configuration...</div>
            ) : basicConfigError ? (
              <div className="text-center py-8 text-red-600">{basicConfigError}</div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 w-80">GroupScheduleCode</label>
                  <input type="text" value={basicConfigData?.groupScheduleCode || ''} onChange={(e) => handleFieldChange('groupScheduleCode', e.target.value)} disabled className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-pointer" onClick={() => isEditMode && setShowGroupScheduleModal(true)} />
                  {isEditMode && (
                    <button onClick={() => setShowGroupScheduleModal(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                      <Search className="w-4 h-4" />Browse
                    </button>
                  )}
                </div>
                {[
                  { field: 'allowOTDefault', label: 'AllowOTDefault' },
                  { field: 'active', label: 'Active' },
                  { field: 'compAllowFrRDExmpOT', label: 'Worked Rest Day Allowance Not based on Computed OT' },
                  { field: 'compAllowFrHolExmpOT', label: 'Worked Holiday Allowance Not based on Computed OT' },
                  { field: 'timeAttendanceStatus', label: 'TimeAttendanceStatus' },
                ].map(({ field, label }) => (
                  <div key={field} className="flex items-center gap-3">
                    <label className="text-gray-700 w-80">{label}</label>
                    <input type="checkbox" checked={(basicConfigData as any)?.[field] ?? (field === 'active')} onChange={(e) => handleFieldChange(field as keyof EmployeeBasicConfig, e.target.checked)} disabled={!isEditMode} className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100" />
                  </div>
                ))}
                {isCreatingNew && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">No configuration found for this employee. Click Save to create a new configuration.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'exemptions':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {exemptionsLoading ? (
              <div className="text-center py-8">Loading exemptions...</div>
            ) : (
              <div className="grid grid-cols-2 gap-x-24 gap-y-4">
                {[
                  { field: 'tardiness', label: 'Tardiness' },
                  { field: 'absences', label: 'Absences' },
                  { field: 'undertime', label: 'Undertime' },
                  { field: 'otherEarnAndAllow', label: 'Other Earn And Allowance' },
                  { field: 'nightDiffBasic', label: 'Night Diff Basic' },
                  { field: 'holidayPay', label: 'HolidayPay' },
                  { field: 'overtime', label: 'Overtime' },
                  { field: 'unprodWorkHoliday', label: 'Unproductive Work Holiday' },
                ].map(({ field, label }) => (
                  <div key={field} className="flex items-center gap-2">
                    <input type="checkbox" checked={(exemptionsData as any)?.[field] || false} onChange={(e) => handleExemptionChange(field as keyof EmployeeExemptions, e.target.checked)} disabled={!isEditMode} className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100" />
                    <label className="text-gray-700">{label}</label>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'leave-applications':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-6">
              <div>
                <button onClick={() => { setIsLeaveEditMode(false); setCurrentLeaveId(0); setLeaveDate(''); setLeaveHoursApproved(''); setLeaveCode(''); setLeavePeriod(''); setLeaveReason(''); setLeaveRemarks(''); setLeaveWithPay(false); setLeaveSssNotification(false); setLeaveIsLateFiling(false); setShowLeaveModal(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                  <Plus className="w-4 h-4" />Create New
                </button>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {leaveApplicationsLoading ? (
                  <div className="text-center py-8">Loading leave applications...</div>
                ) : (
                  <>
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          {['Date','Hours Approved','Leave Code','Period','Reason','Remarks','With Pay','SSS Notification','Late Filing','Actions'].map(h => (
                            <th key={h} className="px-6 py-3 text-left text-gray-700">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {leaveApplicationsData.length === 0 ? (
                          <tr><td colSpan={10} className="px-6 py-8 text-center text-gray-500">No leave applications found</td></tr>
                        ) : paginate(leaveApplicationsData, leavePage).map((entry) => (
                          <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-3 text-gray-900">{formatDate(entry.date)}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.hoursApprovedNum}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.leaveCode}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.period}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.reason}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.remarks}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.withPay ? 'Yes' : 'No'}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.sssNotif ? 'Yes' : 'No'}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.isLateFiling ? 'Yes' : 'No'}</td>
                            <td className="px-6 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => { setIsLeaveEditMode(true); setCurrentLeaveId(entry.id); setLeaveDate(toInputDate(entry.date)); setLeaveHoursApproved(entry.hoursApprovedNum?.toString() ?? '0'); setLeaveCode(entry.leaveCode?.trim() ?? ''); setLeavePeriod(entry.period ?? ''); setLeaveReason(entry.reason ?? ''); setLeaveRemarks(entry.remarks ?? ''); setLeaveWithPay(entry.withPay ?? false); setLeaveSssNotification(entry.sssNotif ?? false); setLeaveIsLateFiling(entry.isLateFiling ?? false); setShowLeaveModal(true); }} className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <span className="text-gray-300">|</span>
                                <button onClick={() => handleLeaveDelete(entry.id)} className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <PaginationBar total={leaveApplicationsData.length} page={leavePage} onPage={setLeavePage} />
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 'device-code':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {deviceCodeLoading ? (
              <div className="text-center py-8">Loading device codes...</div>
            ) : (
              <div className="space-y-6">
                <div>
                  <button onClick={() => { setIsDeviceCodeEditMode(false); setCurrentDeviceCodeId(null); setDeviceCode(''); setDevicePassword(''); setDeviceEffectivityDate(''); setDeviceExpiryDate(''); setShowDeviceCodeModal(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                    <Plus className="w-4 h-4" />Add
                  </button>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        {['Date From','Date To','Code','Actions'].map(h => <th key={h} className="px-6 py-3 text-left text-gray-700">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {deviceCodeEntries.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No device codes found</td></tr>
                      ) : paginate(deviceCodeEntries, deviceCodePage).map((entry) => (
                        <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-6 py-3 text-gray-900">{formatDate(entry.timeInAndOutEffectDate)}</td>
                          <td className="px-6 py-3 text-gray-900">{formatDate(entry.timeInAndOutExpiryDate)}</td>
                          <td className="px-6 py-3 text-gray-900">{entry.timeInAndOutCode}</td>
                          <td className="px-6 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => { setIsDeviceCodeEditMode(true); setCurrentDeviceCodeId(entry.id); setDeviceCode(entry.timeInAndOutCode || ''); setDevicePassword(entry.timeInAndOutPass || ''); setDeviceEffectivityDate(toInputDate(entry.timeInAndOutEffectDate)); setDeviceExpiryDate(toInputDate(entry.timeInAndOutExpiryDate)); setShowDeviceCodeModal(true); }} className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                              <span className="text-gray-300">|</span>
                              <button onClick={() => deleteDeviceCode(entry.id)} className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <PaginationBar total={deviceCodeEntries.length} page={deviceCodePage} onPage={setDeviceCodePage} />
                </div>
              </div>
            )}
          </div>
        );

      case 'rest-day':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {restDayLoading ? (
              <div className="text-center py-8">Loading rest days...</div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input type="radio" id="rest-day-fixed" checked={restDayMode === 'fixed'} onChange={() => setRestDayMode('fixed')} disabled={!isEditMode} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed" />
                    <label htmlFor="rest-day-fixed" className="text-gray-700">Fixed</label>
                  </div>
                  {restDayMode === 'fixed' && (
                    <div className="ml-7 bg-gray-50 rounded-lg border border-gray-200 p-6">
                      <div className="grid grid-cols-3 gap-6">
                        {[{ val: restDay1, set: setRestDay1, label: 'Rest Day 1' }, { val: restDay2, set: setRestDay2, label: 'Rest Day 2' }, { val: restDay3, set: setRestDay3, label: 'Rest Day 3' }].map(({ val, set, label }) => (
                          <div key={label} className="flex items-center gap-3">
                            <label className="text-gray-700 w-24">{label}</label>
                            <select value={val} onChange={(e) => set(e.target.value)} disabled={!isEditMode} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed">
                              <option value="">Select Day</option>
                              {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input type="radio" id="rest-day-variable" checked={restDayMode === 'variable'} onChange={() => setRestDayMode('variable')} disabled={!isEditMode} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed" />
                    <label htmlFor="rest-day-variable" className="text-gray-700">Variable</label>
                  </div>
                  {restDayMode === 'variable' && (
                    <div className="ml-7 space-y-4">
                      <button onClick={() => { setIsRestDayEditMode(false); setCurrentRestDayId(null); setRestDayDateFrom(''); setRestDayDateTo(''); setRestDay1(''); setRestDay2(''); setRestDay3(''); setShowRestDayModal(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                        <Plus className="w-4 h-4" />Add
                      </button>
                      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>{['From','To','Rest Day 1','Rest Day 2','Rest Day 3','Actions'].map(h => <th key={h} className="px-6 py-3 text-left text-gray-700">{h}</th>)}</tr>
                          </thead>
                          <tbody>
                            {restDayVariableData.length === 0 ? (
                              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No variable rest day records found</td></tr>
                            ) : paginate(restDayVariableData, restDayVarPage).map((entry) => (
                              <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-6 py-3 text-gray-900">{formatDate(entry.datefrom)}</td>
                                <td className="px-6 py-3 text-gray-900">{formatDate(entry.dateTo)}</td>
                                <td className="px-6 py-3 text-gray-900">{entry.restDay1}</td>
                                <td className="px-6 py-3 text-gray-900">{entry.restDay2}</td>
                                <td className="px-6 py-3 text-gray-900">{entry.restDay3}</td>
                                <td className="px-6 py-3">
                                  <div className="flex gap-2">
                                    <button onClick={() => { setIsRestDayEditMode(true); setCurrentRestDayId(entry.id); setRestDayDateFrom(toInputDate(entry.datefrom)); setRestDayDateTo(toInputDate(entry.dateTo)); setRestDay1(entry.restDay1 || ''); setRestDay2(entry.restDay2 || ''); setRestDay3(entry.restDay3 || ''); setShowRestDayModal(true); }} className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors">
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <span className="text-gray-300">|</span>
                                    <button onClick={() => deleteRestDayVariable(entry.id)} className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <PaginationBar total={restDayVariableData.length} page={restDayVarPage} onPage={setRestDayVarPage} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'workshift':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {workshiftLoading ? (
              <div className="text-center py-8">Loading workshifts...</div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input type="radio" id="workshift-fixed" checked={workshiftMode === 'fixed'} onChange={() => setWorkshiftMode('fixed')} disabled={!isEditMode} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed" />
                    <label htmlFor="workshift-fixed" className="text-gray-700">Fixed</label>
                  </div>
                  {workshiftMode === 'fixed' && (
                    <div className="ml-7 bg-gray-50 rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center gap-3 max-w-md">
                        <label className="text-gray-700 w-32">Daily Schedule</label>
                        <input type="text" value={fixedDailySched} disabled className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-pointer" onClick={() => isEditMode && setShowDailyScheduleModal(true)} />
                        {isEditMode && (
                          <button onClick={() => setShowDailyScheduleModal(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                            <Search className="w-4 h-4" />Search
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input type="radio" id="workshift-variable" checked={workshiftMode === 'variable'} onChange={() => setWorkshiftMode('variable')} disabled={!isEditMode} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed" />
                    <label htmlFor="workshift-variable" className="text-gray-700">Variable</label>
                  </div>
                  {workshiftMode === 'variable' && (
                    <div className="ml-7 space-y-4">
                      <button onClick={() => { setIsWorkshiftEditMode(false); setCurrentWorkshiftId(null); setWorkshiftDateFrom(''); setWorkshiftDateTo(''); setWorkshiftShiftCode(''); setShowWorkshiftModal(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                        <Plus className="w-4 h-4" />Add
                      </button>
                      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>{['Date From','Date To','Shift Code','Actions'].map(h => <th key={h} className="px-6 py-3 text-left text-gray-700">{h}</th>)}</tr>
                          </thead>
                          <tbody>
                            {workshiftVariableData.length === 0 ? (
                              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No variable workshift records found</td></tr>
                            ) : paginate(workshiftVariableData, workshiftVarPage).map((entry) => (
                              <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-6 py-3 text-gray-900">{formatDate(entry.dateFrom)}</td>
                                <td className="px-6 py-3 text-gray-900">{formatDate(entry.dateTo)}</td>
                                <td className="px-6 py-3 text-gray-900">{entry.shiftCode}</td>
                                <td className="px-6 py-3">
                                  <div className="flex gap-2">
                                    <button onClick={() => { setIsWorkshiftEditMode(true); setCurrentWorkshiftId(entry.id); setWorkshiftDateFrom(toInputDate(entry.dateFrom)); setWorkshiftDateTo(toInputDate(entry.dateTo)); setWorkshiftShiftCode(entry.shiftCode || ''); setShowWorkshiftModal(true); }} className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors">
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <span className="text-gray-300">|</span>
                                    <button onClick={() => deleteWorkshiftVariable(entry.id)} className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <PaginationBar total={workshiftVariableData.length} page={workshiftVarPage} onPage={setWorkshiftVarPage} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'classification':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {classificationLoading ? (
              <div className="text-center py-8">Loading classifications...</div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input type="radio" id="classification-fixed" checked={classificationMode === 'fixed'} onChange={() => setClassificationMode('fixed')} disabled={!isEditMode} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed" />
                    <label htmlFor="classification-fixed" className="text-gray-700">Fixed</label>
                  </div>
                  {classificationMode === 'fixed' && (
                    <div className="ml-7 bg-gray-50 rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center gap-3 max-w-lg">
                        <label className="text-gray-700 w-40 flex-shrink-0">Classification Code</label>
                        <input type="text" value={fixedClassCode} disabled className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-pointer" onClick={() => { if (isEditMode) { fetchClassificationCodes(); setIsFixedCodeSearch(true); setShowClassificationCodeModal(true); } }} />
                        {isEditMode && (
                          <button onClick={() => { fetchClassificationCodes(); setIsFixedCodeSearch(true); setShowClassificationCodeModal(true); }} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 flex-shrink-0">
                            <Search className="w-4 h-4" />Browse
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input type="radio" id="classification-variable" checked={classificationMode === 'variable'} onChange={() => setClassificationMode('variable')} disabled={!isEditMode} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed" />
                    <label htmlFor="classification-variable" className="text-gray-700">Variable</label>
                  </div>
                  {classificationMode === 'variable' && (
                    <div className="ml-7 space-y-4">
                      <button onClick={() => { setIsClassificationEditMode(false); setCurrentClassificationId(null); setClassificationDateFrom(''); setClassificationDateTo(''); setVariableClassCode(''); setShowClassificationModal(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                        <Plus className="w-4 h-4" />Add
                      </button>
                      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>{['Date From','Date To','Classification Code','Actions'].map(h => <th key={h} className="px-6 py-3 text-left text-gray-700">{h}</th>)}</tr>
                          </thead>
                          <tbody>
                            {classificationVariableData.length === 0 ? (
                              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No variable classification records found</td></tr>
                            ) : paginate(classificationVariableData, classVarPage).map((entry) => (
                              <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-6 py-3 text-gray-900">{formatDate(entry.dateFrom)}</td>
                                <td className="px-6 py-3 text-gray-900">{formatDate(entry.dateTo)}</td>
                                <td className="px-6 py-3 text-gray-900">{entry.classCode}</td>
                                <td className="px-6 py-3">
                                  <div className="flex gap-2">
                                    <button onClick={() => { setIsClassificationEditMode(true); setCurrentClassificationId(entry.id); setClassificationDateFrom(toInputDate(entry.dateFrom)); setClassificationDateTo(toInputDate(entry.dateTo)); setVariableClassCode(entry.classCode || ''); setShowClassificationModal(true); }} className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors">
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <span className="text-gray-300">|</span>
                                    <button onClick={() => deleteClassificationVariable(entry.id)} className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <PaginationBar total={classificationVariableData.length} page={classVarPage} onPage={setClassVarPage} />
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
                <button onClick={() => { setIsOvertimeEditMode(false); setCurrentOvertimeId(null); setOvertimeDate(''); setOvertimeNumOTHoursApproved(''); setOvertimeEarlyOTStartTime(''); setOvertimeEarlyTimeIn(''); setOvertimeStartOTPM(''); setOvertimeMinHRSOTBreak(''); setOvertimeEarlyOTStartTimeRestHol(''); setOvertimeReason(''); setOvertimeRemarks(''); setOvertimeApprovedOTBreaksHrs(''); setOvertimeStotats(''); setOvertimeIsLateFiling(false); setOvertimeAppliedBeforeShiftDate(''); setOvertimeIsOTBeforeShiftNextDay(false); setShowOvertimeModal(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                  <Plus className="w-4 h-4" />Create New
                </button>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {overtimeLoading ? (
                  <div className="text-center py-8">Loading overtime applications...</div>
                ) : (
                  <>
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>{['Date','Hours Approved','Early OT Start','Early Time In','Start OT PM','Approved OT Breaks Hrs','Reason','Remarks','Late Filing','Actions'].map(h => <th key={h} className="px-6 py-3 text-left text-gray-700">{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {overtimeApplicationsData.length === 0 ? (
                          <tr><td colSpan={10} className="px-6 py-8 text-center text-gray-500">No overtime applications found</td></tr>
                        ) : paginate(overtimeApplicationsData, overtimePage).map((entry) => (
                          <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-3 text-gray-900">{formatDate(entry.date)}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.numOTHoursApproved}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.earlyOTStartTime}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.earlyTimeIn}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.startOTPM}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.approvedOTBreaksHrs}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.reason}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.remarks}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.isLateFiling ? 'Yes' : 'No'}</td>
                            <td className="px-6 py-3">
                              <div className="flex gap-2">
                                <button onClick={() => { setIsOvertimeEditMode(true); setCurrentOvertimeId(entry.id); setOvertimeDate(toInputDate(entry.date)); setOvertimeNumOTHoursApproved(entry.numOTHoursApproved?.toString() ?? ''); setOvertimeEarlyOTStartTime(entry.earlyOTStartTime ?? ''); setOvertimeEarlyTimeIn(entry.earlyTimeIn ?? ''); setOvertimeStartOTPM(entry.startOTPM ?? ''); setOvertimeMinHRSOTBreak(entry.minHRSOTBreak?.toString() ?? ''); setOvertimeEarlyOTStartTimeRestHol(entry.earlyOTStartTimeRestHol ?? ''); setOvertimeReason(entry.reason ?? ''); setOvertimeRemarks(entry.remarks ?? ''); setOvertimeApprovedOTBreaksHrs(entry.approvedOTBreaksHrs?.toString() ?? ''); setOvertimeStotats(entry.stotats ?? ''); setOvertimeIsLateFiling(entry.isLateFiling ?? false); setOvertimeAppliedBeforeShiftDate(toInputDate(entry.appliedBeforeShiftDate)); setOvertimeIsOTBeforeShiftNextDay(entry.isOTBeforeShiftNextDay ?? false); setShowOvertimeModal(true); }} className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <span className="text-gray-300">|</span>
                                <button onClick={() => handleOvertimeDelete(entry.id)} className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <PaginationBar total={overtimeApplicationsData.length} page={overtimePage} onPage={setOvertimePage} />
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 'contractual':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-6">
              <div>
                <button onClick={() => { setIsContractualEditMode(false); setCurrentContractualId(null); setContractualDateFrom(''); setContractualDateTo(''); setShowContractualModal(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                  <Plus className="w-4 h-4" />Create New
                </button>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {contractualLoading ? (
                  <div className="text-center py-8">Loading contractual records...</div>
                ) : (
                  <>
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>{['Date From','Date To','Actions'].map(h => <th key={h} className="px-6 py-3 text-left text-gray-700">{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {contractualData.length === 0 ? (
                          <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No contractual records found</td></tr>
                        ) : paginate(contractualData, contractualPage).map((entry) => (
                          <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-3 text-gray-900">{formatDate(entry.dateFrom)}</td>
                            <td className="px-6 py-3 text-gray-900">{formatDate(entry.dateTo)}</td>
                            <td className="px-6 py-3">
                              <div className="flex gap-2">
                                <button onClick={() => { setIsContractualEditMode(true); setCurrentContractualId(entry.id); setContractualDateFrom(toInputDate(entry.dateFrom)); setContractualDateTo(toInputDate(entry.dateTo)); setShowContractualModal(true); }} className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <span className="text-gray-300">|</span>
                                <button onClick={() => handleContractualDelete(entry.id)} className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <PaginationBar total={contractualData.length} page={contractualPage} onPage={setContractualPage} />
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 'suspension':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-6">
              <div>
                <button onClick={() => { setIsSuspensionEditMode(false); setCurrentSuspensionId(null); setSuspensionDateFrom(''); setSuspensionDateTo(''); setShowSuspensionModal(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                  <Plus className="w-4 h-4" />Create New
                </button>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {suspensionLoading ? (
                  <div className="text-center py-8">Loading suspension records...</div>
                ) : (
                  <>
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>{['Date From','Date To','Actions'].map(h => <th key={h} className="px-6 py-3 text-left text-gray-700">{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {suspensionData.length === 0 ? (
                          <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No suspension records found</td></tr>
                        ) : paginate(suspensionData, suspensionPage).map((entry) => (
                          <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-3 text-gray-900">{formatDate(entry.dateFrom)}</td>
                            <td className="px-6 py-3 text-gray-900">{formatDate(entry.dateTo)}</td>
                            <td className="px-6 py-3">
                              <div className="flex gap-2">
                                <button onClick={() => { setIsSuspensionEditMode(true); setCurrentSuspensionId(entry.id); setSuspensionDateFrom(toInputDate(entry.dateFrom)); setSuspensionDateTo(toInputDate(entry.dateTo)); setShowSuspensionModal(true); }} className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <span className="text-gray-300">|</span>
                                <button onClick={() => handleSuspensionDelete(entry.id)} className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <PaginationBar total={suspensionData.length} page={suspensionPage} onPage={setSuspensionPage} />
                  </>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">

          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">{getHeaderTitle()}</h1>
          </div>

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
                  <p className="text-sm text-gray-700 mb-2">Configure comprehensive employee timekeeping settings including basic information, exemptions, device codes, rest days, work shifts, classifications, and leave/overtime applications for accurate time tracking.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {['Employee timekeeping configuration','Device code management','Work shift and rest day setup','Leave and overtime tracking'].map(t => (
                      <div key={t} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-4">
                {!['leave-applications','overtime-applications','contractual','suspension'].includes(activeTab) && (
                  <>
                    {!isEditMode ? (
                      <button onClick={handleEdit} disabled={!empCode || (!basicConfigData && !isCreatingNew && activeTab === 'basic-config') || (activeTab === 'exemptions' && !exemptionsData)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        <Pencil className="w-4 h-4" />Edit
                      </button>
                    ) : (
                      <>
                        <button onClick={handleSave} disabled={basicConfigLoading || exemptionsLoading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50">
                          <Save className="w-4 h-4" />{(basicConfigLoading || exemptionsLoading) ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={handleCancel} disabled={basicConfigLoading || exemptionsLoading} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50">
                          <X className="w-4 h-4" />Cancel
                        </button>
                      </>
                    )}
                  </>
                )}
                {['leave-applications','overtime-applications','contractual','suspension'].includes(activeTab) && <div className="px-4 py-2">&nbsp;</div>}
              </div>

              {/* Employee Search Section */}
              <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <label className="text-gray-700 font-bold w-32 flex-shrink-0">TKS Group</label>
                    <div className={`flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg bg-white ${isEditMode ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed bg-gray-100'} transition-colors`}
                      onClick={() => isEditMode && setShowTKSGroupModal(true)}>
                      {tksGroup ? <span className="text-sm font-medium text-gray-900 truncate block">{tksGroup}</span> : <span className="text-gray-400 text-sm">Select...</span>}
                    </div>
                    <button
                      onClick={() => setShowTKSGroupModal(true)}
                      disabled={!isEditMode}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Search className="w-4 h-4" />Browse
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-gray-700 font-bold w-32 flex-shrink-0">Location Name</label>
                    <input type="text" value={tksGroupName} disabled placeholder="Auto-filled from selection" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-sm" />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-gray-700 font-bold w-32 flex-shrink-0">EmpCode</label>
                    <input type="text" value={empCode} onChange={(e) => setEmpCode(e.target.value)} disabled className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100" />
                    <button onClick={() => setShowSearchModal(true)} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 flex-shrink-0">
                      <Search className="w-4 h-4" />Search
                    </button>
                  </div>
                </div>
              </div>

              {/* Employee Info Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-blue-700 mb-1">{employeeName}</div>
                <div className="text-blue-600">{payPeriod}</div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mb-6 flex items-center gap-1 border-b border-gray-200 flex-wrap">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)} className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${activeTab === tab.id ? 'text-white bg-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TKS Group Modal */}
            {showTKSGroupModal && (
              <>
                <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowTKSGroupModal(false)} />
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-3xl max-h-[90vh] overflow-hidden">
                    <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                      <h2 className="text-gray-800 text-sm">Select TKS Group</h2>
                      <button onClick={() => setShowTKSGroupModal(false)} className="text-gray-600 hover:text-gray-800"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="p-3 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 50px)' }}>
                      <h3 className="text-blue-600 mb-2 text-sm">Payroll Location</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <label className="text-gray-700 text-sm">Search:</label>
                        <input type="text" value={tksGroupSearchTerm} onChange={(e) => setTksGroupSearchTerm(e.target.value)} placeholder="Search by code or name..." className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      </div>
                      {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading payroll locations...</div>
                      ) : (
                        <>
                          <div className="border border-gray-200 rounded overflow-hidden">
                            <table className="w-full border-collapse text-sm">
                              <thead>
                                <tr className="bg-gray-100 border-b-2 border-gray-300">
                                  <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Location Code</th>
                                  <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Location Name</th>
                                  <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Company Code</th>
                                </tr>
                              </thead>
                              <tbody>
                                {currentPayrollLocations.length === 0 ? (
                                  <tr><td colSpan={3} className="px-3 py-8 text-center text-gray-500">No payroll locations found</td></tr>
                                ) : currentPayrollLocations.map((loc) => (
                                  <tr key={loc.id} className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer" onClick={() => handleTKSGroupSelect(loc.locCode, loc.locName)}>
                                    <td className="px-3 py-1.5">{loc.locCode}</td>
                                    <td className="px-3 py-1.5">{loc.locName}</td>
                                    <td className="px-3 py-1.5">{loc.companyCode}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="text-gray-600 text-xs">Showing {filteredPayrollLocations.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredPayrollLocations.length)} of {filteredPayrollLocations.length} entries</div>
                            <div className="flex gap-1">
                              <button onClick={handlePreviousPage} disabled={currentPage === 1} className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                              {getPageNumbers().map((page, index) => (
                                typeof page === 'number' ? (
                                  <button key={index} onClick={() => handlePageChange(page)} className={`px-2 py-1 rounded text-xs ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>{page}</button>
                                ) : (
                                  <span key={index} className="px-2 py-1 text-xs text-gray-500">{page}</span>
                                )
                              ))}
                              <button onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0} className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Tab Content */}
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* ── All Modals ── */}

      <EmployeeSearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} onSelect={handleEmployeeSearchSelect} employees={adaptedEmployees} loading={employeeLoading} error={employeeError} />

      <GroupScheduleSearchModal isOpen={showGroupScheduleModal} onClose={() => setShowGroupScheduleModal(false)} onSelect={(code) => handleFieldChange('groupScheduleCode', code)} groupSchedules={groupSchedules} loading={groupScheduleLoading} />

      <LeaveApplicationModal
        isOpen={showLeaveModal}
        isEditMode={isLeaveEditMode}
        empCode={empCode}
        date={leaveDate}
        hoursApproved={leaveHoursApproved}
        leaveCode={leaveCode}
        period={leavePeriod}
        reason={leaveReason}
        remarks={leaveRemarks}
        withPay={leaveWithPay}
        sssNotification={leaveSssNotification}
        isLateFiling={leaveIsLateFiling}
        onClose={() => setShowLeaveModal(false)}
        onDateChange={setLeaveDate}
        onHoursApprovedChange={setLeaveHoursApproved}
        onLeaveCodeChange={setLeaveCode}
        onPeriodChange={setLeavePeriod}
        onReasonChange={setLeaveReason}
        onRemarksChange={setLeaveRemarks}
        onWithPayChange={setLeaveWithPay}
        onSssNotificationChange={setLeaveSssNotification}
        onIsLateFilingChange={setLeaveIsLateFiling}
        onSubmit={handleLeaveSubmit}
        leaveCodes={leaveCodes}
        leaveCodesLoading={leaveCodesLoading}
      />

      <OvertimeApplicationModal
        isOpen={showOvertimeModal}
        isEditMode={isOvertimeEditMode}
        empCode={empCode}
        date={overtimeDate}
        hoursApproved={overtimeHoursApproved}
        actualDateInOTBefore={overtimeActualDateInOTBefore}
        startTimeBefore={overtimeStartTimeBefore}
        startOvertimeDate={overtimeStartOvertimeDate}
        startOvertimeTime={overtimeStartOvertimeTime}
        approvedBreak={overtimeApprovedBreak}
        reason={overtimeReason}
        remarks={overtimeRemarks}
        isLateFiling={overtimeIsLateFiling}
        onClose={() => setShowOvertimeModal(false)}
        onDateChange={setOvertimeDate}
        onHoursApprovedChange={setOvertimeHoursApproved}
        onActualDateInOTBeforeChange={setOvertimeActualDateInOTBefore}
        onStartTimeBeforeChange={setOvertimeStartTimeBefore}
        onStartOvertimeDateChange={setOvertimeStartOvertimeDate}
        onStartOvertimeTimeChange={setOvertimeStartOvertimeTime}
        onApprovedBreakChange={setOvertimeApprovedBreak}
        onReasonChange={setOvertimeReason}
        onRemarksChange={setOvertimeRemarks}
        onIsLateFilingChange={setOvertimeIsLateFiling}
        onSubmit={handleOvertimeSubmit}
      />

      <ContractualModal
        isOpen={showContractualModal}
        isEditMode={isContractualEditMode}
        dateFrom={contractualDateFrom}
        dateTo={contractualDateTo}
        onClose={() => setShowContractualModal(false)}
        onDateFromChange={setContractualDateFrom}
        onDateToChange={setContractualDateTo}
        onSubmit={handleContractualSubmit}
      />

      <SuspensionModal
        isOpen={showSuspensionModal}
        isEditMode={isSuspensionEditMode}
        dateFrom={suspensionDateFrom}
        dateTo={suspensionDateTo}
        onClose={() => setShowSuspensionModal(false)}
        onDateFromChange={setSuspensionDateFrom}
        onDateToChange={setSuspensionDateTo}
        onSubmit={handleSuspensionSubmit}
      />

      <DeviceCodeModal
        isOpen={showDeviceCodeModal}
        isEditMode={isDeviceCodeEditMode}
        empCode={empCode}
        code={deviceCode}
        password={devicePassword}
        effectivityDate={deviceEffectivityDate}
        expiryDate={deviceExpiryDate}
        onClose={() => setShowDeviceCodeModal(false)}
        onCodeChange={setDeviceCode}
        onPasswordChange={setDevicePassword}
        onEffectivityDateChange={setDeviceEffectivityDate}
        onExpiryDateChange={setDeviceExpiryDate}
        onSubmit={handleDeviceCodeSubmit}
      />

      <RestDayVariableModal
        isOpen={showRestDayModal}
        isEditMode={isRestDayEditMode}
        empCode={empCode}
        dateFrom={restDayDateFrom}
        dateTo={restDayDateTo}
        restDay1={restDay1}
        restDay2={restDay2}
        restDay3={restDay3}
        onClose={() => setShowRestDayModal(false)}
        onDateFromChange={setRestDayDateFrom}
        onDateToChange={setRestDayDateTo}
        onRestDay1Change={setRestDay1}
        onRestDay2Change={setRestDay2}
        onRestDay3Change={setRestDay3}
        onSubmit={handleRestDaySubmit}
      />

      <DailyScheduleSearchModal
        isOpen={showDailyScheduleModal}
        onClose={() => setShowDailyScheduleModal(false)}
        onSelect={(referenceNo) => setFixedDailySched(referenceNo)}
        dailySchedules={dailySchedules}
        loading={dailyScheduleLoading}
      />

      <WorkshiftVariableModal
        isOpen={showWorkshiftModal}
        isEditMode={isWorkshiftEditMode}
        empCode={empCode}
        dateFrom={workshiftDateFrom}
        dateTo={workshiftDateTo}
        shiftCode={workshiftShiftCode}
        onClose={() => setShowWorkshiftModal(false)}
        onDateFromChange={setWorkshiftDateFrom}
        onDateToChange={setWorkshiftDateTo}
        onShiftCodeChange={setWorkshiftShiftCode}
        onSubmit={handleWorkshiftSubmit}
        workshiftCodes={workshiftCodes}
        workshiftCodesLoading={workshiftCodesLoading}
      />

      <WorkshiftCodeSearchModal
        isOpen={showWorkshiftCodeModal}
        onClose={() => setShowWorkshiftCodeModal(false)}
        onSelect={(code) => { setWorkshiftShiftCode(code); setShowWorkshiftCodeModal(false); }}
        workshiftCodes={workshiftCodes}
        loading={workshiftCodesLoading}
      />

      <ClassificationVariableModal
        isOpen={showClassificationModal}
        isEditMode={isClassificationEditMode}
        empCode={empCode}
        dateFrom={classificationDateFrom}
        dateTo={classificationDateTo}
        classificationCode={variableClassCode}
        onClose={() => setShowClassificationModal(false)}
        onDateFromChange={setClassificationDateFrom}
        onDateToChange={setClassificationDateTo}
        onClassificationCodeChange={setVariableClassCode}
        onSubmit={handleClassificationSubmit}
        onOpenCodeSearch={() => { fetchClassificationCodes(); setIsFixedCodeSearch(false); setShowClassificationCodeModal(true); }}
        classificationCodes={classificationCodes}
        classificationCodesLoading={classificationCodesLoading}
      />

      <ClassificationCodeSearchModal
        isOpen={showClassificationCodeModal}
        onClose={() => setShowClassificationCodeModal(false)}
        onSelect={(code) => { if (isFixedCodeSearch) { setFixedClassCode(code); } else { setVariableClassCode(code); } setShowClassificationCodeModal(false); }}
        classificationCodes={classificationCodes}
        loading={classificationCodesLoading}
      />

      <Footer />
    </div>
  );
}