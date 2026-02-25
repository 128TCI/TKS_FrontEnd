import { useState, useRef, useEffect } from 'react';
import { Calendar, RotateCcw, Check, Users, Building2, Briefcase, CalendarClock, Clock, Search, Play, CheckCircle, Wallet, Grid, Network, Box, RefreshCw } from 'lucide-react';
import { DatePicker } from '../DateSetup/DatePicker';
import { Footer } from '../Footer/Footer';
import apiClient from '../../services/apiClient';
import Swal from 'sweetalert2';
import { CalendarPopup } from '../CalendarPopup';
interface GroupItem {
  id: number;
  code: string;
  description: string;
}

interface EmployeeItem {
  id: number;
  code: string;
  name: string;
  // Org fields for tab-based filtering
  tkGroup?: string;
  branchCode?: string;
  departmentCode?: string;
  divisionCode?: string;
  groupScheduleCode?: string;
  payHouseCode?: string;
  sectionCode?: string;
  unitCode?: string;
}

// ── API Response Shapes ────────────────────────────────────────────────────────

interface PopulateAllowanceDto {
  empCode: string;
  empName?: string;
  formattedName?: string;
  allowanceCode?: string;
  date?: string;
  timeIn?: string;
  timeOut?: string;
  workshiftCode?: string;
  amount?: number;
}

interface PopulateUndertimeDto {
  empCode: string;
  empName?: string;
  formattedName?: string;
  dateFrom?: string;
  dateTo?: string;
  timeIn?: string;
  timeOut?: string;
  workShift?: string;
  workShiftCode?: string;
  undertime?: number;
  undertimeWithinGracePeriod?: number;
  actualUndertime?: number;
  remarks?: string;
  frmBreak1AndBreak3?: boolean;
  isLateFiling?: boolean;
}

interface PopulateOvertimeDto {
  empCode: string;
  empName?: string;
  formattedName?: string;
  dateFrom?: string;
  dateTo?: string;
  timeIn?: string;
  timeOut?: string;
  workShiftCode?: string;
  overtime?: number;
  otCode?: string;
  origOTCode?: string;
  reason?: string;
  remarks?: string;
  terminalID?: string;
  isLateFiling?: boolean;
}

interface PopulateNightDiffDto {
  empCode: string;
  empName?: string;
  formattedName?: string;
  dateFrom?: string;
  dateTo?: string;
  timeIn?: string;
  timeOut?: string;
  workShiftCode?: string;
  overtime?: number;
  otCode?: string;
  origOTCode?: string;
  isLateFiling?: boolean;
}

interface PopulateHolidayPayDto {
  empCode: string;
  empName?: string;
  formattedName?: string;
  dateFrom?: string;
  dateTo?: string;
  timeIn?: string;
  timeOut?: string;
  workShiftCode?: string;
  overtime?: number;
  otCode?: string;
  origOTCode?: string;
}

interface PopulateRegularWorkingHoursDto {
  empCode: string;
  empName?: string;
  formattedName?: string;
  dateIn?: string;
  dateOut?: string;
  workshiftCode?: string;
  noOfHours?: number;
  testRem?: string;
  remarks?: string;
}

interface PopulateTardinessDto {
  empCode: string;
  formattedName?: string;
  dateFrom?: string;
  dateTo?: string;
  timeIn?: string;
  timeOut?: string;
  workShift?: string;
  tardiness?: number;
  tardinessWithInGrace?: number;
  actualTardiness?: number;
  remarks?: string;
  frmBreak1AndBreak3?: boolean;
  frmBreak2?: boolean;
  isLateFiling?: boolean;
}

interface PopulateLeaveAbsencesDto {
  empCode: string;
  empName?: string;
  formattedName?: string;
  dateL?: string;
  leaveCode?: string;
  hoursLeaveAbsent?: number;
  reason?: string;
  remarks?: string;
  withPay?: boolean;
  isLateFiling?: boolean;
}

interface PopulateResult {
  isSuccessful?: boolean;
  message?: string;
  // Field names exactly as returned by the Populate API
  tardiness?: PopulateTardinessDto[];
  undertime?: PopulateUndertimeDto[];
  leaveAbsences?: PopulateLeaveAbsencesDto[];
  regularWorkingHours?: PopulateRegularWorkingHoursDto[];
  allowance?: PopulateAllowanceDto[];
  overtime?: PopulateOvertimeDto[];
  nightDiff?: PopulateNightDiffDto[];
  holidayPay?: PopulateHolidayPayDto[];
  unprodWorkHoliday?: any[];
  tardinessBelowThreshold?: PopulateTardinessDto[];
  tardinessAboveThreshold?: PopulateLeaveAbsencesDto[];
  undertimeBelowThreshold?: PopulateUndertimeDto[];
  undertimeAboveThreshold?: PopulateLeaveAbsencesDto[];
}

export function ProcessPage() {
  const [activeTab, setActiveTab] = useState<'TK Group' | 'Branch' | 'Department' | 'Division' | 'Group Schedule' | 'Pay House' | 'Section' | 'Unit'>('TK Group');
  const [dateFrom, setDateFrom] = useState('3/1/2020');
  const [dateTo, setDateTo] = useState('03/15/2020');
  const [dateApplied, setDateApplied] = useState('7/7/2021');
  const [lateFiling, setLateFiling] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [populating, setPopulating] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState('tardiness');
  const resultsRef = useRef<HTMLDivElement>(null);
  const [resultPage, setResultPage] = useState(1);
  const resultPageSize = 50;
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [currentGroupPage, setCurrentGroupPage] = useState(1);
  const [currentEmpPage, setCurrentEmpPage] = useState(1);
  const itemsPerPage = 10;
const [showDateFromCalendar, setShowDateFromCalendar] = useState(false);
const [showDateToCalendar, setShowDateToCalendar] = useState(false);
const [showDateAppliedCalendar, setShowDateAppliedCalendar] = useState(false);
  // ── Populate API result state ─────────────────────────────────────────────
  const [populateResult, setPopulateResult] = useState<PopulateResult | null>(null);
  // Full process request payload (populated data + flags) stored for Process call
  const [processPayload, setProcessPayload] = useState<any | null>(null);

  const [processOptions, setProcessOptions] = useState({
    tardiness: false,
    allowances: false,
    undertime: false,
    overtime: false,
    selectAll: false,
    leaveAbsences: false,
    nightDifferentials: false,
    regularWorking: false,
    holidayPay: false
  });

  useEffect(() => {
    setCurrentGroupPage(1);
  }, [activeTab]);

  // ── Group/Employee list states ────────────────────────────────────────────

  const [tkGroupItems, setTKSGroupItems] = useState<GroupItem[]>([]);
  const [branchItems, setBranchItems] = useState<GroupItem[]>([]);
  const [departmentItems, setDepartmentItems] = useState<GroupItem[]>([]);
  const [divisionItems, setDivisionItems] = useState<GroupItem[]>([]);
  const [groupScheduleItems, setGroupScheduleItems] = useState<GroupItem[]>([]);
  const [payHouseItems, setPayHouseItems] = useState<GroupItem[]>([]);
  const [sectionItems, setSectionItems] = useState<GroupItem[]>([]);
  const [unitItems, setUnitItems] = useState<GroupItem[]>([]);
  const [employeeItems, setEmployeeItems] = useState<EmployeeItem[]>([]);

  // ── Fetch helpers ─────────────────────────────────────────────────────────

  const fetchTKSGroupData = async (): Promise<GroupItem[]> => {
    const response = await apiClient.get('/Fs/Process/TimeKeepGroupSetUp');
    return response.data.map((item: any) => ({
      id: item.ID || item.id,
      code: item.groupCode || item.code,
      description: item.groupDescription || item.description,
    }));
  };

  const fetchBranchData = async (): Promise<GroupItem[]> => {
    const response = await apiClient.get('/Fs/Employment/BranchSetUp');
    return response.data.map((item: any) => ({
      id: item.braID || item.ID,
      code: item.braCode || item.code,
      description: item.braDesc || item.description,
    }));
  };

  const fetchDepartmentData = async (): Promise<GroupItem[]> => {
    const response = await apiClient.get('/Fs/Employment/DepartmentSetUp');
    return response.data.map((item: any) => ({
      id: item.depID || item.ID,
      code: item.depCode || item.code,
      description: item.depDesc || item.description,
    }));
  };

  const fetchDivisionData = async (): Promise<GroupItem[]> => {
    const response = await apiClient.get('/Fs/Employment/DivisionSetUp');
    return response.data.map((item: any) => ({
      id: item.divID || item.ID,
      code: item.divCode || item.code,
      description: item.divDesc || item.description,
    }));
  };

  const fetchGroupScheduleData = async (): Promise<GroupItem[]> => {
    const response = await apiClient.get('/Fs/Employment/GroupSetUp');
    const list = Array.isArray(response.data) ? response.data : [];
    return list.map((item: any) => ({
      id: item.grpSchID || item.id || item.ID,
      code: item.grpCode || item.code,
      description: item.grpDesc || item.description,
    }));
  };

  const fetchPayHouseData = async (): Promise<GroupItem[]> => {
    const response = await apiClient.get('/Fs/Employment/PayHouseSetUp');
    const list = Array.isArray(response.data) ? response.data : [];
    return list.map((item: any) => ({
      id: item.lineID ?? item.ID ?? item.id,
      code: item.lineCode ?? item.code,
      description: item.lineDesc ?? item.Description ?? item.description,
    }));
  };

  const fetchSectionData = async (): Promise<GroupItem[]> => {
    const response = await apiClient.get('/Fs/Employment/SectionSetUp');
    const list = Array.isArray(response.data) ? response.data : [];
    return list.map((item: any) => ({
      id: item.secID ?? item.ID ?? item.id,
      code: item.secCode ?? item.sectionCode ?? item.code,
      description: item.secDesc ?? item.Description ?? item.description,
    }));
  };

  const fetchUnitData = async (): Promise<GroupItem[]> => {
    const response = await apiClient.get('/Fs/Employment/UnitSetUp');
    return response.data.map((item: any) => ({
      id: item.unitID || item.ID,
      code: item.unitCode || item.code,
      description: item.unitDesc || item.description,
    }));
  };

  const fetchEmployeeData = async (): Promise<EmployeeItem[]> => {
    const response = await apiClient.get('/Maintenance/EmployeeMasterFile');
    const list = Array.isArray(response.data) ? response.data : [];
    return list.map((item: any): EmployeeItem => ({
      id: item.empID ?? item.ID ?? item.id,
      code: item.empCode || item.code || '',
      name: `${item.lName || ''}, ${item.fName || ''} ${item.mName || ''}`.trim(),
      // Capture all org grouping fields — cover common casing variants from the API
      tkGroup:           item.tkGroup       ?? item.tKGroup       ?? item.groupCode      ?? item.tkGroupCode ?? '',
      branchCode:        item.braCode       ?? item.branchCode    ?? item.branch         ?? '',
      departmentCode:    item.depCode       ?? item.departmentCode?? item.department     ?? '',
      divisionCode:      item.divCode       ?? item.divisionCode  ?? item.division       ?? '',
      groupScheduleCode: item.grpCode       ?? item.groupSchedule ?? item.grpSchCode     ?? '',
      payHouseCode:      item.lineCode      ?? item.payCode       ?? item.payHouseCode  ?? item.payHouse ?? '',
      sectionCode:       item.secCode       ?? item.sectionCode   ?? item.section        ?? '',
      unitCode:          item.unitCode      ?? item.unit          ?? '',
    }));
  };

  useEffect(() => { fetchTKSGroupData().then(setTKSGroupItems); }, []);
  useEffect(() => { fetchBranchData().then(setBranchItems); }, []);
  useEffect(() => { fetchDepartmentData().then(setDepartmentItems); }, []);
  useEffect(() => { fetchDivisionData().then(setDivisionItems); }, []);
  useEffect(() => { fetchGroupScheduleData().then(setGroupScheduleItems); }, []);
  useEffect(() => { fetchPayHouseData().then(setPayHouseItems); }, []);
  useEffect(() => { fetchSectionData().then(setSectionItems); }, []);
  useEffect(() => { fetchUnitData().then(setUnitItems); }, []);
  useEffect(() => { fetchEmployeeData().then(setEmployeeItems); }, []);

  // ── Derived data ──────────────────────────────────────────────────────────

  const getCurrentData = () => {
    switch (activeTab) {
      case 'Branch': return branchItems;
      case 'Department': return departmentItems;
      case 'Division': return divisionItems;
      case 'Group Schedule': return groupScheduleItems;
      case 'Pay House': return payHouseItems;
      case 'Section': return sectionItems;
      case 'Unit': return unitItems;
      default: return tkGroupItems;
    }
  };

  const currentItems = getCurrentData();

  const getSelectionTitle = () => {
    switch (activeTab) {
      case 'TK Group': return 'TK Group Selection';
      case 'Branch': return 'Branch Selection';
      case 'Department': return 'Department Selection';
      case 'Division': return 'Division Selection';
      case 'Group Schedule': return 'Group Schedule Selection';
      case 'Pay House': return 'Pay House Selection';
      case 'Section': return 'Section Selection';
      case 'Unit': return 'Unit Selection';
      default: return 'Selection';
    }
  };

  const filteredGroups = currentItems.filter(item =>
    item.code.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(groupSearchTerm.toLowerCase())
  );

  // ── Tab-aware employee filtering ─────────────────────────────────────────
  // Derive which org field on EmployeeItem corresponds to the active tab
  const getOrgFieldForTab = (): keyof EmployeeItem | null => {
    switch (activeTab) {
      case 'TK Group':       return 'tkGroup';
      case 'Branch':         return 'branchCode';
      case 'Department':     return 'departmentCode';
      case 'Division':       return 'divisionCode';
      case 'Group Schedule': return 'groupScheduleCode';
      case 'Pay House':      return 'payHouseCode';
      case 'Section':        return 'sectionCode';
      case 'Unit':           return 'unitCode';
      default:               return null;
    }
  };

  // Get the codes of the currently selected groups in the active tab
  const selectedGroupCodes = new Set(
    currentItems
      .filter(item => selectedGroups.includes(item.id))
      .map(item => item.code.trim().toLowerCase())
  );

  const filteredEmployees = employeeItems.filter(emp => {
    // Text search always applies
    const matchesSearch =
      emp.code.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // If no groups are selected, show all employees
    if (selectedGroupCodes.size === 0) return true;

    // Filter by the org field that matches the active tab
    const orgField = getOrgFieldForTab();
    if (!orgField) return true;
    const empOrgValue = (emp[orgField] as string | undefined)?.trim().toLowerCase() ?? '';
    return selectedGroupCodes.has(empOrgValue);
  });

  // Group Pagination
  const totalGroupPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const startGroupIndex = (currentGroupPage - 1) * itemsPerPage;
  const endGroupIndex = startGroupIndex + itemsPerPage;
  const paginatedGroups = filteredGroups.slice(startGroupIndex, endGroupIndex);

  const getGroupPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalGroupPages <= 7) {
      for (let i = 1; i <= totalGroupPages; i++) pages.push(i);
    } else {
      if (currentGroupPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...'); pages.push(totalGroupPages);
      } else if (currentGroupPage >= totalGroupPages - 3) {
        pages.push(1); pages.push('...');
        for (let i = totalGroupPages - 4; i <= totalGroupPages; i++) pages.push(i);
      } else {
        pages.push(1); pages.push('...');
        for (let i = currentGroupPage - 1; i <= currentGroupPage + 1; i++) pages.push(i);
        pages.push('...'); pages.push(totalGroupPages);
      }
    }
    return pages;
  };
const parseDate = (dateStr: string): Date | undefined => {
  if (!dateStr) return undefined;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const month = parseInt(parts[0]) - 1;
    const day = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  return undefined;
};

const formatDate = (date: Date | undefined): string => {
  if (!date) return '';
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};
  // Employee Pagination
  const totalEmployeePages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startEmployeeIndex = (currentEmpPage - 1) * itemsPerPage;
  const endEmployeeIndex = startEmployeeIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startEmployeeIndex, endEmployeeIndex);

  const getEmployeePageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalEmployeePages <= 5) return Array.from({ length: totalEmployeePages }, (_, i) => i + 1);
    pages.push(1);
    if (currentEmpPage > 3) pages.push('...');
    const start = Math.max(2, currentEmpPage - 1);
    const end = Math.min(totalEmployeePages - 1, currentEmpPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentEmpPage < totalEmployeePages - 2) pages.push('...');
    pages.push(totalEmployeePages);
    return pages;
  };

  const handleGroupToggle = (id: number) => {
    setSelectedGroups(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleEmployeeToggle = (id: number) => {
    setSelectedEmployees(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAllGroups = () => {
    if (selectedGroups.length === filteredGroups.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(filteredGroups.map(g => g.id));
    }
  };

  const handleSelectAllEmployees = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(e => e.id));
    }
  };

  const handleOptionChange = (option: keyof typeof processOptions) => {
    if (option === 'selectAll') {
      const newValue = !processOptions.selectAll;
      setProcessOptions({
        tardiness: newValue,
        allowances: newValue,
        undertime: newValue,
        overtime: newValue,
        selectAll: newValue,
        leaveAbsences: newValue,
        nightDifferentials: newValue,
        regularWorking: newValue,
        holidayPay: newValue
      });
    } else {
      setProcessOptions(prev => ({ ...prev, [option]: !prev[option] }));
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Build the list of employee codes to send.
   *  Priority: individually selected employees → all employees from selected groups. */
  const getEmpCodes = (): string[] => {
    if (selectedEmployees.length > 0) {
      return employeeItems
        .filter(e => selectedEmployees.includes(e.id))
        .map(e => e.code);
    }
    // Fall back to all employees (empty string means "all" in the old API, but the new
    // API needs an explicit list – send every loaded employee code)
    return employeeItems.map(e => e.code);
  };

const parseDateToISO = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString();
  try {
    // Handle M/D/YYYY or MM/DD/YYYY format
    if (dateStr.includes('/')) {
      const [m, d, y] = dateStr.split('/');
      const month = m.padStart(2, '0');
      const day = d.padStart(2, '0');
      return `${y}-${month}-${day}T00:00:00.000Z`;
    }
    return new Date(dateStr).toISOString();
  } catch {
    return new Date().toISOString();
  }
};

  const formatElapsed = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return { h, m, s };
  };

  // ── Populate ──────────────────────────────────────────────────────────────

  const handlePopulate = async () => {
    const empCodes = getEmpCodes();
    if (empCodes.length === 0) {
      Swal.fire({ icon: 'warning', title: 'No Employees', text: 'Please select at least one employee or group.' });
      return;
    }

    const payload = {
      dateFrom: parseDateToISO(dateFrom),
      dateTo: parseDateToISO(dateTo),
      dateApplied: parseDateToISO(dateApplied),
      empCode: '',
      empCodes,
      tardiness: processOptions.tardiness,
      undertime: processOptions.undertime,
      leaveAndAbsences: processOptions.leaveAbsences,
      regularWorkingDays: processOptions.regularWorking,
      allowances: processOptions.allowances,
      overtime: processOptions.overtime,
      nightDiff: processOptions.nightDifferentials,
      holidayPay: processOptions.holidayPay,
      unprodWorkOnHoliday: false,
      lateFiling,
      oldOvertimeProcess: false,
      oldNighDiffProcess: false,
      oldTardinessProcess: false,
      userName: 'currentUser', // replace with actual session user if available
    };

    setPopulating(true);
    setShowResults(false);
    setPopulateResult(null);
    setProcessPayload(null);

    const startTime = Date.now();

    try {
      const response = await apiClient.post('/Populate/Populate', payload);
      const elapsed = formatElapsed(Date.now() - startTime);
      const data: PopulateResult = response.data;
console.log(response);
      setPopulateResult(data);

      // Build the process payload now so it is ready when user clicks Process
      setProcessPayload({
        ...payload,
        // flags mirror populate options
        allowances: processOptions.allowances,
        undertime: processOptions.undertime,
        overtime: processOptions.overtime,
        nightDiff: processOptions.nightDifferentials,
        holidayPay: processOptions.holidayPay,
        regularWorkingDays: processOptions.regularWorking,
        tardiness: processOptions.tardiness,
        leaveAndAbsences: processOptions.leaveAbsences,
        lateFiling,
        // populated data arrays
        dataAllowance: data.allowance ?? [],
        dataUndertime: data.undertime ?? [],
        dataOvertime: data.overtime ?? [],
        dataNightDiff: data.nightDiff ?? [],
        dataHolidayPay: data.holidayPay ?? [],
        dataRegularWorkingHours: data.regularWorkingHours ?? [],
        dataTardiness: data.tardiness ?? [],
        dataLeaveAbsences: data.leaveAbsences ?? [],
        tardinessBelowThreshold: data.tardinessBelowThreshold ?? [],
        tardinessAboveThreshold: data.tardinessAboveThreshold ?? [],
        undertimeBelowThreshold: data.undertimeBelowThreshold ?? [],
        undertimeAboveThreshold: data.undertimeAboveThreshold ?? [],
      });

      setShowResults(true);
      
      setActiveResultTab('tardiness');

      await Swal.fire({
        icon: 'success',
        title: 'Done Populating',
        html: `
          <div style="text-align:center">
            <p style="font-size:1rem;color:#374151;margin-bottom:8px">Elapsed time:</p>
            <p style="font-size:1.25rem;font-weight:600;color:#1d4ed8">
              ${elapsed.h} hour(s), ${elapsed.m} minute(s) and ${elapsed.s} second(s)
            </p>
          </div>
        `,
        confirmButtonText: 'View Results',
        confirmButtonColor: '#2563eb',
      });

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'An unexpected error occurred.';
      Swal.fire({ icon: 'error', title: 'Populate Failed', text: msg });
    } finally {
      setPopulating(false);
    }
  };

  // ── Process ───────────────────────────────────────────────────────────────

  const handleProcess = async () => {
    if (!processPayload) {
      Swal.fire({ icon: 'warning', title: 'Populate First', text: 'Please run Populate before Process.' });
      return;
    }

    setProcessing(true);
    const startTime = Date.now();

    try {
      const response = await apiClient.post('/Populate/Process', processPayload);
      const elapsed = formatElapsed(Date.now() - startTime);
      const result = response.data;

      if (result?.isSuccessful === false) {
        Swal.fire({ icon: 'error', title: 'Process Error', text: result.message ?? 'Process failed.' });
      } else {
        await Swal.fire({
          icon: 'success',
          title: 'Done Processing',
          html: `
            <div style="text-align:center">
              <p style="font-size:1rem;color:#374151;margin-bottom:8px">Elapsed time:</p>
              <p style="font-size:1.25rem;font-weight:600;color:#16a34a">
                ${elapsed.h} hour(s), ${elapsed.m} minute(s) and ${elapsed.s} second(s)
              </p>
            </div>
          `,
          confirmButtonText: 'OK',
          confirmButtonColor: '#16a34a',
        });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'An unexpected error occurred.';
      Swal.fire({ icon: 'error', title: 'Process Failed', text: msg });
    } finally {
      setProcessing(false);
    }
  };

  // ── Result Tabs ───────────────────────────────────────────────────────────

  // Reset result page when switching result tabs
  useEffect(() => { setResultPage(1); }, [activeResultTab]);

  const resultTabs = [
    { id: 'tardiness', label: 'Tardiness' },
    { id: 'undertime', label: 'Undertime' },
    { id: 'leave-absences', label: 'Leave and Absences' },
    { id: 'regular-working', label: 'Regular Working Days/Hours' },
    { id: 'allowances', label: 'Allowances' },
    { id: 'overtime', label: 'Overtime' },
    { id: 'night-differentials', label: 'Night Differentials' },
    { id: 'holiday-pay', label: 'Holiday Pay' },
  ];

  // ── Result pagination helpers ─────────────────────────────────────────────
  const getActiveResultData = (): any[] => {
    if (!populateResult) return [];
    switch (activeResultTab) {
      case 'tardiness':          return populateResult.tardiness          ?? [];
      case 'undertime':          return populateResult.undertime          ?? [];
      case 'leave-absences':     return populateResult.leaveAbsences      ?? [];
      case 'regular-working':    return populateResult.regularWorkingHours?? [];
      case 'allowances':         return populateResult.allowance          ?? [];
      case 'overtime':           return populateResult.overtime           ?? [];
      case 'night-differentials':return populateResult.nightDiff          ?? [];
      case 'holiday-pay':        return populateResult.holidayPay         ?? [];
      default:                   return [];
    }
  };

  const activeResultData   = getActiveResultData();
  const totalResultPages   = Math.ceil(activeResultData.length / resultPageSize);
  const pagedResultData    = activeResultData.slice(
    (resultPage - 1) * resultPageSize,
    resultPage * resultPageSize
  );

  const getResultPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (totalResultPages <= 7) {
      for (let i = 1; i <= totalResultPages; i++) pages.push(i);
    } else if (resultPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...'); pages.push(totalResultPages);
    } else if (resultPage >= totalResultPages - 3) {
      pages.push(1); pages.push('...');
      for (let i = totalResultPages - 4; i <= totalResultPages; i++) pages.push(i);
    } else {
      pages.push(1); pages.push('...');
      for (let i = resultPage - 1; i <= resultPage + 1; i++) pages.push(i);
      pages.push('...'); pages.push(totalResultPages);
    }
    return pages;
  };

  // Helpers to display datetime strings
  const fmtDate = (v?: string) => {
    if (!v) return '';
    try { return new Date(v).toLocaleDateString(); } catch { return v; }
  };
  const fmtTime = (v?: string) => {
    if (!v) return '';
    try { return new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return v; }
  };
  const fmtNum = (v?: number) => (v !== undefined && v !== null) ? v.toFixed(4) : '';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Process Data</h1>
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
                  <p className="text-sm text-gray-700 mb-2">
                    Process employee timekeeping data by various criteria including TK Group, branch, department, and more.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {['Process by multiple organizational groups', 'Generate comprehensive attendance reports', 'Track tardiness, undertime, and overtime', 'Monitor leave and absences efficiently'].map(t => (
                      <div key={t} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex items-center gap-1 border-b border-gray-200 flex-wrap">
              {[
                { name: 'TK Group' as const, icon: Users },
                { name: 'Branch' as const, icon: Building2 },
                { name: 'Department' as const, icon: Briefcase },
                { name: 'Division' as const, icon: Network },
                { name: 'Group Schedule' as const, icon: CalendarClock },
                { name: 'Pay House' as const, icon: Wallet },
                { name: 'Section' as const, icon: Grid },
                { name: 'Unit' as const, icon: Box }
              ].map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                    activeTab === tab.name
                      ? 'font-medium bg-blue-600 text-white -mb-px'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Group Selection */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                <h3 className="text-gray-900 mb-4">{getSelectionTitle()}</h3>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={groupSearchTerm}
                    onChange={(e) => setGroupSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">
                          <input type="checkbox"
                            checked={selectedGroups.length === filteredGroups.length && filteredGroups.length > 0}
                            onChange={handleSelectAllGroups}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">Code</th>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedGroups.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <input type="checkbox"
                              checked={selectedGroups.includes(item.id)}
                              onChange={() => handleGroupToggle(item.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.code}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{item.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="text-gray-600 text-xs">
                    Showing {filteredGroups.length === 0 ? 0 : startGroupIndex + 1} to {Math.min(endGroupIndex, filteredGroups.length)} of {filteredGroups.length} entries
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setCurrentGroupPage(p => Math.max(p - 1, 1))} disabled={currentGroupPage === 1}
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50">Previous</button>
                    {getGroupPageNumbers().map((page, idx) =>
                      page === '...' ? <span key={`g-ellipsis-${idx}`} className="px-1 text-gray-500 text-xs">...</span> : (
                        <button key={page} onClick={() => setCurrentGroupPage(page as number)}
                          className={`px-2 py-1 rounded text-xs ${currentGroupPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>
                          {page}
                        </button>
                      )
                    )}
                    <button onClick={() => setCurrentGroupPage(p => Math.min(p + 1, totalGroupPages))} disabled={currentGroupPage === totalGroupPages || totalGroupPages === 0}
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50">Next</button>
                  </div>
                </div>
              </div>

              {/* Employee Selection */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900">Employees</h3>
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">{selectedEmployees.length} selected</span>
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search employees..." value={employeeSearchTerm}
                    onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">
                          <input type="checkbox"
                            checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                            onChange={handleSelectAllEmployees}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">Code</th>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">Name</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedEmployees.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <input type="checkbox"
                              checked={selectedEmployees.includes(item.id)}
                              onChange={() => handleEmployeeToggle(item.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.code}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{item.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>Showing {startEmployeeIndex + 1} to {Math.min(endEmployeeIndex, filteredEmployees.length)} of {filteredEmployees.length} entries</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCurrentEmpPage(p => Math.max(1, p - 1))} disabled={currentEmpPage === 1}
                      className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50">Previous</button>
                    {getEmployeePageNumbers().map((page, index) =>
                      typeof page === 'number' ? (
                        <button key={index} onClick={() => setCurrentEmpPage(page)}
                          className={`px-2 py-1 rounded text-xs ${currentEmpPage === page ? 'bg-blue-500 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>
                          {page}
                        </button>
                      ) : <span key={index} className="px-2">{page}</span>
                    )}
                    <button onClick={() => setCurrentEmpPage(p => Math.min(totalEmployeePages, p + 1))} disabled={currentEmpPage === totalEmployeePages}
                      className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50">Next</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Processing Options */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
              <div className="p-4 border-b border-gray-200 mb-4">
                <h2 className="text-gray-900">Processing Options</h2>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
  {/* Date From */}
  <div>
    <label className="block text-gray-700 text-sm mb-2">Date From</label>
    <div className="relative">
      <input
        type="text"
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
        placeholder="MM/DD/YYYY"
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-9"
      />
      <button
        type="button"
        onClick={() => setShowDateFromCalendar(!showDateFromCalendar)}
        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        <Calendar className="w-3.5 h-3.5" />
      </button>
      {showDateFromCalendar && (
        <CalendarPopup
          onDateSelect={(date) => { setDateFrom(date); setShowDateFromCalendar(false); }}
          onClose={() => setShowDateFromCalendar(false)}
        />
      )}
    </div>
  </div>

  {/* Date To */}
  <div>
    <label className="block text-gray-700 text-sm mb-2">Date To</label>
    <div className="relative">
      <input
        type="text"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
        placeholder="MM/DD/YYYY"
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-9"
      />
      <button
        type="button"
        onClick={() => setShowDateToCalendar(!showDateToCalendar)}
        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        <Calendar className="w-3.5 h-3.5" />
      </button>
      {showDateToCalendar && (
        <CalendarPopup
          onDateSelect={(date) => { setDateTo(date); setShowDateToCalendar(false); }}
          onClose={() => setShowDateToCalendar(false)}
        />
      )}
    </div>
  </div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
  {/* Date Applied */}
  <div>
    <label className="block text-gray-700 text-sm mb-2">Date Applied</label>
    <div className="relative">
      <input
        type="text"
        value={dateApplied}
        onChange={(e) => setDateApplied(e.target.value)}
        placeholder="MM/DD/YYYY"
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-9"
      />
      <button
        type="button"
        onClick={() => setShowDateAppliedCalendar(!showDateAppliedCalendar)}
        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        <Calendar className="w-3.5 h-3.5" />
      </button>
      {showDateAppliedCalendar && (
        <CalendarPopup
          onDateSelect={(date) => { setDateApplied(date); setShowDateAppliedCalendar(false); }}
          onClose={() => setShowDateAppliedCalendar(false)}
        />
      )}
    </div>
  </div>

  {/* Late Filing checkbox stays in the same row */}
  <div className="flex items-end">
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={lateFiling}
        onChange={(e) => setLateFiling(e.target.checked)}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <span className="text-sm text-gray-700">Include Late Filing</span>
    </label>
  </div>
</div>

              {/* Process Type Checkboxes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-center gap-2 cursor-pointer mb-3 pb-3 border-b border-blue-200">
                  <input type="checkbox" checked={processOptions.selectAll} onChange={() => handleOptionChange('selectAll')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900">Select All</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {([
                    ['tardiness', 'Tardiness'],
                    ['undertime', 'Undertime'],
                    ['overtime', 'Overtime'],
                    ['leaveAbsences', 'Leave/Absences'],
                    ['regularWorking', 'Regular Working'],
                    ['allowances', 'Allowances'],
                    ['nightDifferentials', 'Night Differential'],
                    ['holidayPay', 'Holiday Pay'],
                  ] as [keyof typeof processOptions, string][]).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={processOptions[key] as boolean} onChange={() => handleOptionChange(key)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handlePopulate}
                  disabled={populating || processing}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {populating ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" />Populating...</>
                  ) : (
                    <><Users className="w-4 h-4" />Populate</>
                  )}
                </button>
                <button
                  onClick={handleProcess}
                  disabled={populating || processing || !processPayload}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!processPayload ? 'Run Populate first' : ''}
                >
                  {processing ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" />Processing...</>
                  ) : (
                    <><Play className="w-4 h-4" />Process</>
                  )}
                </button>
              </div>
              {!processPayload && (
                <p className="text-xs text-amber-600 mt-2">ℹ️ Run <strong>Populate</strong> first to enable the Process button.</p>
              )}
            </div>

            {/* Results Section */}
            {showResults && populateResult && (
              <div ref={resultsRef} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-gray-900">Populate Results</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">Completed</span>
                </div>

                {/* Result Tabs */}
                <div className="bg-white border-b border-gray-200">
                  <div className="flex overflow-x-auto">
                    {resultTabs.map((tab) => (
                      <button key={tab.id} onClick={() => setActiveResultTab(tab.id)}
                        className={`px-4 py-3 whitespace-nowrap transition-all border-b-2 text-sm ${
                          activeResultTab === tab.id
                            ? 'border-blue-600 text-blue-600 bg-blue-50'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}>
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto bg-white">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {/* ── Tardiness ── */}
                        {activeResultTab === 'tardiness' && (
                          <>
                            <th className="px-4 py-3 text-left text-gray-600">Emp Code</th>
                            <th className="px-4 py-3 text-left text-gray-600">Name</th>
                            <th className="px-4 py-3 text-left text-gray-600">Date From</th>
                            <th className="px-4 py-3 text-left text-gray-600">Date To</th>
                            <th className="px-4 py-3 text-left text-gray-600">Time In</th>
                            <th className="px-4 py-3 text-left text-gray-600">Time Out</th>
                            <th className="px-4 py-3 text-left text-gray-600">Workshift</th>
                            <th className="px-4 py-3 text-left text-gray-600">Tardiness</th>
                            <th className="px-4 py-3 text-left text-gray-600">Within Grace</th>
                            <th className="px-4 py-3 text-left text-gray-600">Actual</th>
                          </>
                        )}
                        {/* ── Undertime ── */}
                        {activeResultTab === 'undertime' && (
                          <>
                            <th className="px-4 py-3 text-left text-gray-600">Emp Code</th>
                            <th className="px-4 py-3 text-left text-gray-600">Name</th>
                            <th className="px-4 py-3 text-left text-gray-600">Date From</th>
                            <th className="px-4 py-3 text-left text-gray-600">Date To</th>
                            <th className="px-4 py-3 text-left text-gray-600">Time In</th>
                            <th className="px-4 py-3 text-left text-gray-600">Time Out</th>
                            <th className="px-4 py-3 text-left text-gray-600">Workshift</th>
                            <th className="px-4 py-3 text-left text-gray-600">Undertime</th>
                            <th className="px-4 py-3 text-left text-gray-600">Within Grace</th>
                            <th className="px-4 py-3 text-left text-gray-600">Actual</th>
                          </>
                        )}
                        {/* ── Leave & Absences ── */}
                        {activeResultTab === 'leave-absences' && (
                          <>
                            <th className="px-4 py-3 text-left text-gray-600">Emp Code</th>
                            <th className="px-4 py-3 text-left text-gray-600">Name</th>
                            <th className="px-4 py-3 text-left text-gray-600">Date</th>
                            <th className="px-4 py-3 text-left text-gray-600">Leave Code</th>
                            <th className="px-4 py-3 text-left text-gray-600">Hours</th>
                            <th className="px-4 py-3 text-left text-gray-600">Reason</th>
                            <th className="px-4 py-3 text-left text-gray-600">Remarks</th>
                            <th className="px-4 py-3 text-left text-gray-600">With Pay</th>
                          </>
                        )}
                        {/* ── Regular Working ── */}
                        {activeResultTab === 'regular-working' && (
                          <>
                            <th className="px-4 py-3 text-left text-gray-600">Emp Code</th>
                            <th className="px-4 py-3 text-left text-gray-600">Name</th>
                            <th className="px-4 py-3 text-left text-gray-600">Date In</th>
                            <th className="px-4 py-3 text-left text-gray-600">Date Out</th>
                            <th className="px-4 py-3 text-left text-gray-600">Workshift</th>
                            <th className="px-4 py-3 text-left text-gray-600">Hours</th>
                            <th className="px-4 py-3 text-left text-gray-600">Remarks</th>
                          </>
                        )}
                        {/* ── Allowances ── */}
                        {activeResultTab === 'allowances' && (
                          <>
                            <th className="px-4 py-3 text-left text-gray-600">Emp Code</th>
                            <th className="px-4 py-3 text-left text-gray-600">Name</th>
                            <th className="px-4 py-3 text-left text-gray-600">Allowance Code</th>
                            <th className="px-4 py-3 text-left text-gray-600">Date</th>
                            <th className="px-4 py-3 text-left text-gray-600">Workshift</th>
                            <th className="px-4 py-3 text-left text-gray-600">Amount</th>
                          </>
                        )}
                        {/* ── Overtime ── */}
                        {activeResultTab === 'overtime' && (
                          <>
                            <th className="px-4 py-3 text-left text-gray-600">Emp Code</th>
                            <th className="px-4 py-3 text-left text-gray-600">Name</th>
                            <th className="px-4 py-3 text-left text-gray-600">Date From</th>
                            <th className="px-4 py-3 text-left text-gray-600">Date To</th>
                            <th className="px-4 py-3 text-left text-gray-600">Time In</th>
                            <th className="px-4 py-3 text-left text-gray-600">Time Out</th>
                            <th className="px-4 py-3 text-left text-gray-600">Workshift</th>
                            <th className="px-4 py-3 text-left text-gray-600">OT Hours</th>
                            <th className="px-4 py-3 text-left text-gray-600">OT Code</th>
                            <th className="px-4 py-3 text-left text-gray-600">Reason</th>
                            <th className="px-4 py-3 text-left text-gray-600">Remarks</th>
                          </>
                        )}
                        {/* ── Night Diff ── */}
                        {activeResultTab === 'night-differentials' && (
                          <>
                            <th className="px-4 py-3 text-left text-gray-600">Emp Code</th>
                            <th className="px-4 py-3 text-left text-gray-600">Name</th>
                            <th className="px-4 py-3 text-left text-gray-600">Date From</th>
                            <th className="px-4 py-3 text-left text-gray-600">Date To</th>
                            <th className="px-4 py-3 text-left text-gray-600">Time In</th>
                            <th className="px-4 py-3 text-left text-gray-600">Time Out</th>
                            <th className="px-4 py-3 text-left text-gray-600">Workshift</th>
                            <th className="px-4 py-3 text-left text-gray-600">ND Hours</th>
                            <th className="px-4 py-3 text-left text-gray-600">OT Code</th>
                          </>
                        )}
                        {/* ── Holiday Pay ── */}
                        {activeResultTab === 'holiday-pay' && (
                          <>
                            <th className="px-4 py-3 text-left text-gray-600">Emp Code</th>
                            <th className="px-4 py-3 text-left text-gray-600">Name</th>
                            <th className="px-4 py-3 text-left text-gray-600">Date From</th>
                            <th className="px-4 py-3 text-left text-gray-600">Date To</th>
                            <th className="px-4 py-3 text-left text-gray-600">Time In</th>
                            <th className="px-4 py-3 text-left text-gray-600">Time Out</th>
                            <th className="px-4 py-3 text-left text-gray-600">Workshift</th>
                            <th className="px-4 py-3 text-left text-gray-600">Hours</th>
                            <th className="px-4 py-3 text-left text-gray-600">OT Code</th>
                          </>
                        )}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {/* ── Tardiness rows ── */}
                      {activeResultTab === 'tardiness' && pagedResultData.map((r: any, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{r.empCode}</td>
                          <td className="px-4 py-3 text-gray-900">
  {r.empName || r.formattedName || employeeItems.find(e => e.code === r.empCode)?.name || ""}
</td>
                          <td className="px-4 py-3 text-gray-600">{fmtDate(r.dateFrom)}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtDate(r.dateTo)}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtTime(r.timeIn)}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtTime(r.timeOut)}</td>
                          <td className="px-4 py-3 text-blue-600">{r.workShift}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtNum(r.tardiness)}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtNum(r.tardinessWithInGrace)}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtNum(r.actualTardiness)}</td>
                        </tr>
                      ))}

                      {/* ── Undertime rows ── */}
                      {activeResultTab === 'undertime' && pagedResultData.map((r: any, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{r.empCode}</td>
                          <td className="px-4 py-3 text-gray-900">
  {r.empName || r.formattedName || employeeItems.find(e => e.code === r.empCode)?.name || ""}
</td>
                          <td className="px-4 py-3 text-gray-600">{fmtDate(r.dateFrom)}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtDate(r.dateTo)}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtTime(r.timeIn)}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtTime(r.timeOut)}</td>
                          <td className="px-4 py-3 text-blue-600">{r.workShift}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtNum(r.undertime)}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtNum(r.undertimeWithinGracePeriod)}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtNum(r.actualUndertime)}</td>
                        </tr>
                      ))}

                      {/* ── Leave & Absences rows ── */}
                      {activeResultTab === 'leave-absences' && pagedResultData.map((r: any, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{r.empCode}</td>
                         <td className="px-4 py-3 text-gray-900">
  {r.empName || r.formattedName || employeeItems.find(e => e.code === r.empCode)?.name || ""}
</td>
                          <td className="px-4 py-3 text-gray-600">{fmtDate(r.dateL)}</td>
                          <td className="px-4 py-3 text-gray-600">{r.leaveCode}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtNum(r.hoursLeaveAbsent)}</td>
                          <td className="px-4 py-3 text-gray-600">{r.reason}</td>
                          <td className="px-4 py-3 text-gray-600">{r.remarks}</td>
                          <td className="px-4 py-3">
                            <input type="checkbox" checked={!!r.withPay} readOnly
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded" />
                          </td>
                        </tr>
                      ))}

                      {/* ── Regular Working rows ── */}
                      {activeResultTab === 'regular-working' && pagedResultData.map((r: any, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{r.empCode}</td>
                         <td className="px-4 py-3 text-gray-900">
  {r.empName || r.formattedName || employeeItems.find(e => e.code === r.empCode)?.name || ""}
</td>
                          <td className="px-4 py-3 text-gray-600">{fmtDate(r.dateIn)}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtDate(r.dateOut)}</td>
                          <td className="px-4 py-3 text-blue-600">{r.workshiftCode}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtNum(r.noOfHours)}</td>
                          <td className="px-4 py-3 text-gray-600">{r.remarks}</td>
                        </tr>
                      ))}

                      {/* ── Allowances rows ── */}
                      {activeResultTab === 'allowances' && pagedResultData.map((r: any, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{r.empCode}</td>
                         <td className="px-4 py-3 text-gray-900">
  {r.empName || r.formattedName || employeeItems.find(e => e.code === r.empCode)?.name || ""}
</td>
                          <td className="px-4 py-3 text-gray-600">{r.allowanceCode}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtDate(r.date)}</td>
                          <td className="px-4 py-3 text-blue-600">{r.workshiftCode}</td>
                          <td className="px-4 py-3 text-gray-600">{r.amount?.toFixed(2)}</td>
                        </tr>
                      ))}

                      {/* ── Overtime rows ── */}
                      {activeResultTab === 'overtime' && pagedResultData.map((r: any, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{r.empCode}</td>
                          <td className="px-4 py-3 text-gray-900">
  {r.empName || r.formattedName || employeeItems.find(e => e.code === r.empCode)?.name || ""}
</td>
                          <td className="px-4 py-3 text-gray-600">{fmtDate(r.dateFrom)}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtDate(r.dateTo)}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtTime(r.timeIn)}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtTime(r.timeOut)}</td>
                          <td className="px-4 py-3 text-blue-600">{r.workShiftCode}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtNum(r.overtime)}</td>
                          <td className="px-4 py-3 text-gray-600">{r.otCode}</td>
                          <td className="px-4 py-3 text-gray-600">{r.reason}</td>
                          <td className="px-4 py-3 text-gray-600">{r.remarks}</td>
                        </tr>
                      ))}

                      {/* ── Night Differential rows ── */}
                      {activeResultTab === 'night-differentials' && pagedResultData.map((r: any, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{r.empCode}</td>
                          <td className="px-4 py-3 text-gray-900">
  {r.empName || r.formattedName || employeeItems.find(e => e.code === r.empCode)?.name || ""}
</td>
                          <td className="px-4 py-3 text-gray-600">{fmtDate(r.dateFrom)}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtDate(r.dateTo)}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtTime(r.timeIn)}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtTime(r.timeOut)}</td>
                          <td className="px-4 py-3 text-blue-600">{r.workShiftCode}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtNum(r.overtime)}</td>
                          <td className="px-4 py-3 text-gray-600">{r.otCode}</td>
                        </tr>
                      ))}

                      {/* ── Holiday Pay rows ── */}
                      {activeResultTab === 'holiday-pay' && pagedResultData.map((r: any, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{r.empCode}</td>
                          <td className="px-4 py-3 text-gray-900">
  {r.empName || r.formattedName || employeeItems.find(e => e.code === r.empCode)?.name || ""}
</td>
                          <td className="px-4 py-3 text-gray-600">{fmtDate(r.dateFrom)}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtDate(r.dateTo)}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtTime(r.timeIn)}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtTime(r.timeOut)}</td>
                          <td className="px-4 py-3 text-blue-600">{r.workShiftCode}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtNum(r.overtime)}</td>
                          <td className="px-4 py-3 text-gray-600">{r.otCode}</td>
                        </tr>
                      ))}

                      {/* ── Empty state ── */}
                      {activeResultData.length === 0 && (
                        <tr>
                          <td colSpan={11} className="px-4 py-12 text-center text-gray-400 text-sm">
                            No data available for this category.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Results Footer with Pagination */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-gray-500">
                    Showing{' '}
                    {activeResultData.length === 0 ? 0 : (resultPage - 1) * resultPageSize + 1}
                    {' '}–{' '}
                    {Math.min(resultPage * resultPageSize, activeResultData.length)}
                    {' '}of{' '}
                    {activeResultData.length} entries
                  </span>
                  {totalResultPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setResultPage(p => Math.max(1, p - 1))}
                        disabled={resultPage === 1}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {getResultPageNumbers().map((page, idx) =>
                        page === '...' ? (
                          <span key={`rp-ellipsis-${idx}`} className="px-1 text-gray-500 text-xs">...</span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => setResultPage(page as number)}
                            className={`px-2 py-1 rounded text-xs ${
                              resultPage === page
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                      <button
                        onClick={() => setResultPage(p => Math.min(totalResultPages, p + 1))}
                        disabled={resultPage === totalResultPages}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}