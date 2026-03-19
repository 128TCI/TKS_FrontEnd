import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Calendar, Check, Users, Building2, Briefcase, CalendarClock,
  Wallet, Grid, Network, Box, Play, Search,
} from 'lucide-react';
import { Footer } from '../Footer/Footer';
import Swal from 'sweetalert2';
import { CalendarPopup } from '../CalendarPopup';
import { fetchEmployees as fetchEmployeesService } from '../../services/employeeService';
import apiClient, { getLoggedInUsername } from '../../services/apiClient';

// ── Types ─────────────────────────────────────────────────────────────────────

interface GroupItem  { id: number; code: string; description: string; }
interface EmployeeItem {
  id: number; code: string; name: string;
  tkGroup?: string; branchCode?: string; departmentCode?: string;
  divisionCode?: string; groupScheduleCode?: string; payHouseCode?: string;
  sectionCode?: string; unitCode?: string;
}

interface PopulateTardinessDto       { empCode: string; formattedName?: string; empName?: string; dateFrom?: string; dateTo?: string; timeIn?: string; timeOut?: string; workShift?: string; tardiness?: number; tardinessWithInGrace?: number; actualTardiness?: number; remarks?: string; frmBreak1AndBreak3?: boolean; frmBreak2?: boolean; isLateFiling?: boolean; }
interface PopulateUndertimeDto       { empCode: string; empName?: string; formattedName?: string; dateFrom?: string; dateTo?: string; timeIn?: string; timeOut?: string; workShift?: string; workShiftCode?: string; undertime?: number; undertimeWithinGracePeriod?: number; actualUndertime?: number; remarks?: string; frmBreak1AndBreak3?: boolean; isLateFiling?: boolean; }
interface PopulateLeaveAbsencesDto   { empCode: string; empName?: string; formattedName?: string; dateL?: string; leaveCode?: string; hoursLeaveAbsent?: number; reason?: string; remarks?: string; withPay?: boolean; isLateFiling?: boolean; }
interface PopulateRegularWorkingHoursDto { empCode: string; empName?: string; formattedName?: string; dateIn?: string; dateOut?: string; workshiftCode?: string; noOfHours?: number; remarks?: string; }
interface PopulateAllowanceDto       { empCode: string; empName?: string; formattedName?: string; allowanceCode?: string; date?: string; timeIn?: string; timeOut?: string; workshiftCode?: string; amount?: number; }
interface PopulateOvertimeDto        { empCode: string; empName?: string; formattedName?: string; dateFrom?: string; dateTo?: string; timeIn?: string; timeOut?: string; workShiftCode?: string; overtime?: number; otCode?: string; origOTCode?: string; reason?: string; remarks?: string; terminalID?: string; isLateFiling?: boolean; otSeq?: string; restDay24HrsFlag?: string; restDay24HrsStart?: string; }
interface PopulateNightDiffDto       { empCode: string; empName?: string; formattedName?: string; dateFrom?: string; dateTo?: string; timeIn?: string; timeOut?: string; workShiftCode?: string; overtime?: number; otCode?: string; origOTCode?: string; isLateFiling?: boolean; }
interface PopulateHolidayPayDto      { empCode: string; empName?: string; formattedName?: string; dateFrom?: string; dateTo?: string; timeIn?: string; timeOut?: string; workShiftCode?: string; overtime?: number; otCode?: string; origOTCode?: string; terminalID?: string; absentAfterHoliday?: string; }

interface PopulateResult {
  isSuccessful?: boolean; message?: string;
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

type ActiveTab = 'TK Group' | 'Branch' | 'Department' | 'Division' | 'Group Schedule' | 'Pay House' | 'Section' | 'Unit';

// ── Helpers ───────────────────────────────────────────────────────────────────

const parseDateToISO = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString();
  try {
    if (dateStr.includes('/')) {
      const [m, d, y] = dateStr.split('/');
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T00:00:00.000Z`;
    }
    return new Date(dateStr).toISOString();
  } catch { return new Date().toISOString(); }
};

const fmtElapsed = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return { h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
};

const fmtDate = (v?: string) => { if (!v) return ''; try { return new Date(v).toLocaleDateString(); } catch { return v ?? ''; } };
const fmtTime = (v?: string) => { if (!v) return ''; try { return new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return v ?? ''; } };
const fmtNum  = (v?: number) => (v != null) ? v.toFixed(4) : '';

// ── Component ─────────────────────────────────────────────────────────────────

export function ProcessPage() {
  // ── Tab / filter state ────────────────────────────────────────────────────
  const [activeTab, setActiveTab]       = useState<ActiveTab>('TK Group');
  const [statusFilter]                  = useState<'active' | 'inactive' | 'all'>('active');

  // ── Date state ────────────────────────────────────────────────────────────
  const today = new Date();
  const todayStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
  const [dateFrom,    setDateFrom]    = useState(todayStr);
  const [dateTo,      setDateTo]      = useState(todayStr);
  const [dateApplied, setDateApplied] = useState(todayStr);
  const [lateFiling,  setLateFiling]  = useState(false);
  const [showDateFromCal,    setShowDateFromCal]    = useState(false);
  const [showDateToCal,      setShowDateToCal]      = useState(false);
  const [showDateAppliedCal, setShowDateAppliedCal] = useState(false);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [populating,       setPopulating]       = useState(false);
  const [processing,       setProcessing]       = useState(false);
  const [showResults,      setShowResults]      = useState(false);
  const [activeResultTab,  setActiveResultTab]  = useState('tardiness');
  const [resultPage,       setResultPage]       = useState(1);
  const [resultSearchTerm, setResultSearchTerm] = useState('');
  const [groupSearchTerm,  setGroupSearchTerm]  = useState('');
  const [empSearchTerm,    setEmpSearchTerm]    = useState('');
  const [currentGroupPage, setCurrentGroupPage] = useState(1);
  const [currentEmpPage,   setCurrentEmpPage]   = useState(1);
  const resultPageSize = 50;
  const itemsPerPage   = 10;
  const resultsRef     = useRef<HTMLDivElement>(null);

  // ── Live elapsed timer ────────────────────────────────────────────────────
  const [elapsedMs,     setElapsedMs]     = useState(0);
  const [timerRunning,  setTimerRunning]  = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const startTimer = () => {
    startTimeRef.current = Date.now();
    setElapsedMs(0);
    setTimerRunning(true);
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 500);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerRunning(false);
    return Date.now() - startTimeRef.current;
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── Group / employee lists ────────────────────────────────────────────────
  const [tkGroupItems,       setTKSGroupItems]       = useState<GroupItem[]>([]);
  const [branchItems,        setBranchItems]         = useState<GroupItem[]>([]);
  const [departmentItems,    setDepartmentItems]     = useState<GroupItem[]>([]);
  const [divisionItems,      setDivisionItems]       = useState<GroupItem[]>([]);
  const [groupScheduleItems, setGroupScheduleItems]  = useState<GroupItem[]>([]);
  const [payHouseItems,      setPayHouseItems]       = useState<GroupItem[]>([]);
  const [sectionItems,       setSectionItems]        = useState<GroupItem[]>([]);
  const [unitItems,          setUnitItems]           = useState<GroupItem[]>([]);
  const [employeeItems,      setEmployeeItems]       = useState<EmployeeItem[]>([]);
  const [loadingEmployees,   setLoadingEmployees]    = useState(false);
  const allEmployeesRef = useRef<EmployeeItem[]>([]);

  // ── Selection state ───────────────────────────────────────────────────────
  const [selectedGroupsMap, setSelectedGroupsMap] = useState<Record<string, number[]>>({
    'TK Group': [], 'Branch': [], 'Department': [], 'Division': [],
    'Group Schedule': [], 'Pay House': [], 'Section': [], 'Unit': [],
  });
  const selectedGroups = selectedGroupsMap[activeTab] ?? [];
  const setSelectedGroups = (updater: number[] | ((prev: number[]) => number[])) =>
    setSelectedGroupsMap(prev => ({
      ...prev,
      [activeTab]: typeof updater === 'function' ? updater(prev[activeTab] ?? []) : updater,
    }));
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

  // ── Process options ───────────────────────────────────────────────────────
  const [processOptions, setProcessOptions] = useState({
    tardiness: false, allowances: false, undertime: false, overtime: false,
    selectAll: false, leaveAbsences: false, nightDifferentials: false,
    regularWorking: false, holidayPay: false,
  });

  // ── Result data ───────────────────────────────────────────────────────────
  const [populateResult, setPopulateResult] = useState<PopulateResult | null>(null);
  const [processPayload, setProcessPayload] = useState<any | null>(null);

  // ── Fetch helpers ─────────────────────────────────────────────────────────

  const fetchTKSGroupData = async (): Promise<GroupItem[]> => {
    const userName = getLoggedInUsername();
    const url = userName && userName !== 'Guest'
      ? `/Fs/Process/TimeKeepGroupSetUp/by-user?userName=${encodeURIComponent(userName)}`
      : `/Fs/Process/TimeKeepGroupSetUp`;
    const res = await apiClient.get(url);
    return (res.data ?? []).map((i: any) => ({
      id: i.ID ?? i.id, code: i.groupCode ?? i.code ?? '', description: i.groupDescription ?? i.description ?? '',
    })).filter((i: GroupItem) => i.id !== 0);
  };

  const fetchGroupData = async (url: string, idKey: string, codeKey: string, descKey: string): Promise<GroupItem[]> => {
    const res = await apiClient.get(url);
    return (Array.isArray(res.data) ? res.data : []).map((i: any) => ({
      id: i[idKey] ?? i.ID ?? i.id,
      code: i[codeKey] ?? i.code ?? '',
      description: i[descKey] ?? i.description ?? '',
    }));
  };

  const fetchEmployeeData = async (status: 'active' | 'inactive' | 'all' = 'all'): Promise<EmployeeItem[]> => {
    const { employees } = await fetchEmployeesService();
    return employees
      .filter((i: any) => status === 'all' ? true : status === 'active' ? i.active === true : i.active === false)
      .map((i: any): EmployeeItem => ({
        id:                i.empID        ?? i.ID   ?? i.id,
        code:              i.empCode      || i.code || '',
        name:              `${i.lName || ''}, ${i.fName || ''} ${i.mName || ''}`.trim(),
        tkGroup:           i.tksGroupCode ?? i.tkGroup        ?? i.groupCode      ?? '',
        branchCode:        i.braCode      ?? i.branchCode     ?? i.branch         ?? '',
        departmentCode:    i.depCode      ?? i.departmentCode ?? i.department     ?? '',
        divisionCode:      i.divCode      ?? i.divisionCode   ?? i.division       ?? '',
        groupScheduleCode: i.grpCode      ?? i.groupSchedule  ?? i.grpSchCode     ?? '',
        payHouseCode:      i.lineCode     ?? i.payCode        ?? i.payHouseCode   ?? i.payHouse ?? '',
        sectionCode:       i.secCode      ?? i.sectionCode    ?? i.section        ?? '',
        unitCode:          i.unitCode     ?? i.unit           ?? '',
      }));
  };

  // ── Initial fetches ───────────────────────────────────────────────────────
  useEffect(() => { fetchTKSGroupData().then(setTKSGroupItems); }, []);
  useEffect(() => { fetchGroupData('/Fs/Employment/BranchSetUp',     'braID',   'braCode',   'braDesc').then(setBranchItems); }, []);
  useEffect(() => { fetchGroupData('/Fs/Employment/DepartmentSetUp', 'depID',   'depCode',   'depDesc').then(setDepartmentItems); }, []);
  useEffect(() => { fetchGroupData('/Fs/Employment/DivisionSetUp',   'divID',   'divCode',   'divDesc').then(setDivisionItems); }, []);
  useEffect(() => { fetchGroupData('/Fs/Employment/GroupSetUp',      'grpSchID','grpCode',   'grpDesc').then(setGroupScheduleItems); }, []);
  useEffect(() => { fetchGroupData('/Fs/Employment/PayHouseSetUp',   'lineID',  'lineCode',  'lineDesc').then(setPayHouseItems); }, []);
  useEffect(() => { fetchGroupData('/Fs/Employment/SectionSetUp',    'secID',   'secCode',   'secDesc').then(setSectionItems); }, []);
  useEffect(() => { fetchGroupData('/Fs/Employment/UnitSetUp',       'unitID',  'unitCode',  'unitDesc').then(setUnitItems); }, []);

  useEffect(() => {
    setLoadingEmployees(true);
    fetchEmployeeData('active').then(data => {
      allEmployeesRef.current = data;
      setEmployeeItems(data);
    }).finally(() => setLoadingEmployees(false));
  }, []);

  // ── Derived helpers ───────────────────────────────────────────────────────
  const getCurrentData = useCallback((): GroupItem[] => {
    switch (activeTab) {
      case 'Branch':         return branchItems;
      case 'Department':     return departmentItems;
      case 'Division':       return divisionItems;
      case 'Group Schedule': return groupScheduleItems;
      case 'Pay House':      return payHouseItems;
      case 'Section':        return sectionItems;
      case 'Unit':           return unitItems;
      default:               return tkGroupItems;
    }
  }, [activeTab, tkGroupItems, branchItems, departmentItems, divisionItems,
      groupScheduleItems, payHouseItems, sectionItems, unitItems]);

  const applyGroupFilter = useCallback((
    all: EmployeeItem[], tab: ActiveTab, selectedIds: number[], allItems: GroupItem[]
  ): EmployeeItem[] => {
    if (selectedIds.length === 0) return all;
    const codes = allItems.filter(g => selectedIds.includes(g.id)).map(g => g.code);
    return all.filter(emp => {
      switch (tab) {
        case 'TK Group':       return codes.includes(emp.tkGroup           ?? '');
        case 'Branch':         return codes.includes(emp.branchCode        ?? '');
        case 'Department':     return codes.includes(emp.departmentCode    ?? '');
        case 'Division':       return codes.includes(emp.divisionCode      ?? '');
        case 'Group Schedule': return codes.includes(emp.groupScheduleCode ?? '');
        case 'Pay House':      return codes.includes(emp.payHouseCode      ?? '');
        case 'Section':        return codes.includes(emp.sectionCode       ?? '');
        case 'Unit':           return codes.includes(emp.unitCode          ?? '');
        default:               return true;
      }
    });
  }, []);

  useEffect(() => {
    setSelectedEmployees([]);
    setEmployeeItems(applyGroupFilter(allEmployeesRef.current, activeTab, selectedGroups, getCurrentData()));
  }, [activeTab, selectedGroups]); // eslint-disable-line

  useEffect(() => {
    setLoadingEmployees(true);
    fetchEmployeeData(statusFilter).then(data => {
      allEmployeesRef.current = data;
      setEmployeeItems(applyGroupFilter(data, activeTab, selectedGroups, getCurrentData()));
    }).finally(() => setLoadingEmployees(false));
  }, [statusFilter]); // eslint-disable-line

  useEffect(() => { setResultPage(1); setResultSearchTerm(''); }, [activeResultTab]);
  useEffect(() => { setResultPage(1); }, [resultSearchTerm]);

  // ── Filtered lists ────────────────────────────────────────────────────────
  const currentItems      = getCurrentData();
  const filteredGroups    = currentItems.filter(i =>
    i.code.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
    i.description.toLowerCase().includes(groupSearchTerm.toLowerCase()));
  const filteredEmployees = employeeItems.filter(e =>
    e.code.toLowerCase().includes(empSearchTerm.toLowerCase()) ||
    e.name.toLowerCase().includes(empSearchTerm.toLowerCase()));

  // ── Pagination helpers ────────────────────────────────────────────────────
  const totalGroupPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const paginatedGroups = filteredGroups.slice((currentGroupPage - 1) * itemsPerPage, currentGroupPage * itemsPerPage);

  const totalEmpPages   = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmps   = filteredEmployees.slice((currentEmpPage - 1) * itemsPerPage, currentEmpPage * itemsPerPage);

  const makePageNums = (total: number, current: number): (number | string)[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | string)[] = [];
    if (current <= 4) { for (let i = 1; i <= 5; i++) pages.push(i); pages.push('...'); pages.push(total); }
    else if (current >= total - 3) { pages.push(1); pages.push('...'); for (let i = total - 4; i <= total; i++) pages.push(i); }
    else { pages.push(1); pages.push('...'); for (let i = current - 1; i <= current + 1; i++) pages.push(i); pages.push('...'); pages.push(total); }
    return pages;
  };

  // ── Selection handlers ────────────────────────────────────────────────────
  const handleGroupToggle     = (id: number) => setSelectedGroups(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  const handleEmployeeToggle  = (id: number) => setSelectedEmployees(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  const handleSelectAllGroups = () => setSelectedGroups(selectedGroups.length === filteredGroups.length ? [] : filteredGroups.map(g => g.id));
  const handleSelectAllEmps   = () => setSelectedEmployees(selectedEmployees.length === filteredEmployees.length ? [] : filteredEmployees.map(e => e.id));

  const handleOptionChange = (option: keyof typeof processOptions) => {
    if (option === 'selectAll') {
      const v = !processOptions.selectAll;
      setProcessOptions({ tardiness: v, allowances: false, undertime: v, overtime: v, selectAll: v, leaveAbsences: v, nightDifferentials: v, regularWorking: false, holidayPay: v });
    } else {
      setProcessOptions(p => ({ ...p, [option]: !p[option] }));
    }
  };

  const getEmpCodes = (): string[] => {
    if (selectedEmployees.length > 0)
      return employeeItems.filter(e => selectedEmployees.includes(e.id)).map(e => e.code);
    if (selectedGroups.length > 0)
      return employeeItems.map(e => e.code);
    return [];
  };

  // ── Payload fill helpers ──────────────────────────────────────────────────
  const resolveName = (r: any) =>
    r.empName || r.formattedName || employeeItems.find(e => e.code === r.empCode)?.name || r.empCode || '';

  const fillTardiness = (arr: any[] | undefined) => (arr ?? []).map((r: any) => ({
    empCode: r.empCode ?? '', formattedName: resolveName(r),
    dateFrom: r.dateFrom ?? null, dateTo: r.dateTo ?? null,
    timeIn: r.timeIn ?? null, timeOut: r.timeOut ?? null,
    workShift: r.workShift ?? '', tardiness: r.tardiness ?? 0,
    tardinessWithInGrace: r.tardinessWithInGrace ?? 0, actualTardiness: r.actualTardiness ?? 0,
    remarks: r.remarks ?? '', frmBreak1AndBreak3: r.frmBreak1AndBreak3 ?? false,
    frmBreak2: r.frmBreak2 ?? false, isLateFiling: r.isLateFiling ?? false,
  }));

  const fillUndertime = (arr: any[] | undefined) => (arr ?? []).map((r: any) => ({
    empCode: r.empCode ?? '', empName: resolveName(r), formattedName: r.formattedName ?? '',
    dateFrom: r.dateFrom ?? null, dateTo: r.dateTo ?? null,
    timeIn: r.timeIn ?? null, timeOut: r.timeOut ?? null,
    workShift: r.workShift ?? '', workShiftCode: r.workShiftCode ?? '',
    undertime: r.undertime ?? 0, undertimeWithinGracePeriod: r.undertimeWithinGracePeriod ?? 0,
    actualUndertime: r.actualUndertime ?? 0, remarks: r.remarks ?? '',
    frmBreak1AndBreak3: r.frmBreak1AndBreak3 ?? false, isLateFiling: r.isLateFiling ?? false,
  }));

  const fillOvertime = (arr: any[] | undefined) => (arr ?? []).map((r: any) => ({
    empCode: r.empCode ?? '', empName: resolveName(r), formattedName: r.formattedName ?? '',
    dateFrom: r.dateFrom ?? null, dateTo: r.dateTo ?? null,
    timeIn: r.timeIn ?? null, timeOut: r.timeOut ?? null,
    workShiftCode: r.workShiftCode ?? '', overtime: r.overtime ?? 0,
    otCode: r.otCode ?? '', origOTCode: r.origOTCode ?? '',
    reason: r.reason ?? '', remarks: r.remarks ?? '', terminalID: r.terminalID ?? '',
    isLateFiling: r.isLateFiling ?? false, otSeq: r.otSeq ?? '',
    restDay24HrsFlag: r.restDay24HrsFlag ?? '', restDay24HrsStart: r.restDay24HrsStart ?? '',
  }));

  const fillNightDiff = (arr: any[] | undefined) => (arr ?? []).map((r: any) => ({
    empCode: r.empCode ?? '', empName: resolveName(r), formattedName: r.formattedName ?? '',
    dateFrom: r.dateFrom ?? null, dateTo: r.dateTo ?? null,
    timeIn: r.timeIn ?? null, timeOut: r.timeOut ?? null,
    workShiftCode: r.workShiftCode ?? '', overtime: r.overtime ?? 0,
    otCode: r.otCode ?? '', origOTCode: r.origOTCode ?? '', isLateFiling: r.isLateFiling ?? false,
  }));

  const fillHolidayPay = (arr: any[] | undefined) => (arr ?? []).map((r: any) => ({
    empCode: r.empCode ?? '', empName: resolveName(r), formattedName: r.formattedName ?? '',
    dateFrom: r.dateFrom ?? null, dateTo: r.dateTo ?? null,
    timeIn: r.timeIn ?? null, timeOut: r.timeOut ?? null,
    workShiftCode: r.workShiftCode ?? '', overtime: r.overtime ?? 0,
    otCode: r.otCode ?? '', origOTCode: r.origOTCode ?? '',
    terminalID: r.terminalID ?? '', absentAfterHoliday: r.absentAfterHoliday ?? '',
  }));

  const fillAllowance = (arr: any[] | undefined) => (arr ?? []).map((r: any) => ({
    empCode: r.empCode ?? '', empName: resolveName(r), formattedName: r.formattedName ?? '',
    allowanceCode: r.allowanceCode ?? '', date: r.date ?? null,
    timeIn: r.timeIn ?? null, timeOut: r.timeOut ?? null,
    workshiftCode: r.workshiftCode ?? '', amount: r.amount ?? 0,
  }));

  const fillRegWH = (arr: any[] | undefined) => (arr ?? []).map((r: any) => ({
    empCode: r.empCode ?? '', empName: resolveName(r), formattedName: r.formattedName ?? '',
    dateIn: r.dateIn ?? null, dateOut: r.dateOut ?? null,
    workshiftCode: r.workshiftCode ?? '', noOfHours: r.noOfHours ?? 0, remarks: r.remarks ?? '',
  }));

  const fillLeaveAbsences = (arr: any[] | undefined) => (arr ?? []).map((r: any) => ({
    empCode: r.empCode ?? '', empName: resolveName(r), formattedName: r.formattedName ?? '',
    dateL: r.dateL ?? null, leaveCode: r.leaveCode ?? '',
    hoursLeaveAbsent: r.hoursLeaveAbsent ?? 0, reason: r.reason ?? '',
    remarks: r.remarks ?? '', withPay: r.withPay ?? false, isLateFiling: r.isLateFiling ?? false,
  }));

  // ── Populate ──────────────────────────────────────────────────────────────

  const handlePopulate = async () => {
    const empCodes = getEmpCodes();
    if (empCodes.length === 0) {
      Swal.fire({ icon: 'warning', title: 'No Selection', text: 'Please select at least one group or employee before populating.' });
      return;
    }

    const anyChecked = Object.entries(processOptions)
      .filter(([k]) => k !== 'selectAll')
      .some(([, v]) => v);
    if (!anyChecked) {
      Swal.fire({ icon: 'warning', title: 'Nothing Selected', text: 'Please select at least one process option.' });
      return;
    }

    const payload = {
      dateFrom:            parseDateToISO(dateFrom),
      dateTo:              parseDateToISO(dateTo),
      dateApplied:         parseDateToISO(dateApplied),
      empCode:             '',
      empCodes,
      tardiness:           processOptions.tardiness,
      undertime:           processOptions.undertime,
      leaveAndAbsences:    processOptions.leaveAbsences,
      regularWorkingDays:  processOptions.regularWorking,
      allowances:          processOptions.allowances,
      overtime:            processOptions.overtime,
      nightDiff:           processOptions.nightDifferentials,
      holidayPay:          processOptions.holidayPay,
      unprodWorkOnHoliday: false,
      lateFiling,
      oldOvertimeProcess:  false,
      oldNighDiffProcess:  false,
      oldTardinessProcess: false,
      userName:            getLoggedInUsername() || 'currentUser',
    };

    setPopulating(true);
    setShowResults(false);
    setPopulateResult(null);
    setProcessPayload(null);
    startTimer();

    // ── Swal with live elapsed timer ──────────────────────────────────────
    Swal.fire({
      title: 'Populating...',
      html: `
        <p style="color:#6b7280;margin-bottom:12px">
          Processing <strong>${empCodes.length}</strong> employee(s) — please wait.
        </p>
        <div style="font-size:2rem;font-weight:700;color:#2563eb;font-variant-numeric:tabular-nums" id="swal-timer">
          0:00:00
        </div>
        <p style="color:#9ca3af;font-size:0.75rem;margin-top:6px">elapsed time</p>
      `,
      allowOutsideClick: false,
      allowEscapeKey:    false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
        // Update the in-dialog timer every second
        const start = Date.now();
        const interval = setInterval(() => {
          const el = document.getElementById('swal-timer');
          if (!el) { clearInterval(interval); return; }
          const s = Math.floor((Date.now() - start) / 1000);
          const h = Math.floor(s / 3600);
          const m = Math.floor((s % 3600) / 60);
          const sec = s % 60;
          el.textContent = `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
        }, 1000);
        // Store so we can clear it
        (window as any).__swalTimerInterval = interval;
      },
      willClose: () => {
        clearInterval((window as any).__swalTimerInterval);
      },
    });

    try {
      console.log(payload)
      // 30-minute explicit timeout — prevents axios default cutting off long populates
      const response = await apiClient.post('/Populate/Populate', payload, {
        timeout: 30 * 60 * 1000,
      });

      const totalMs = stopTimer();
      const elapsed = fmtElapsed(totalMs);
      const data: PopulateResult = response.data;

      if (!data?.isSuccessful && data?.message) {
        Swal.fire({ icon: 'error', title: 'Populate Failed', text: data.message });
        return;
      }

      setPopulateResult(data);

      setProcessPayload({
        ...payload,
        dataAllowance:           fillAllowance(data.allowance),
        dataUndertime:           fillUndertime(data.undertime),
        dataOvertime:            fillOvertime(data.overtime),
        dataNightDiff:           fillNightDiff(data.nightDiff),
        dataHolidayPay:          fillHolidayPay(data.holidayPay),
        dataRegularWorkingHours: fillRegWH(data.regularWorkingHours),
        dataTardiness:           fillTardiness(data.tardiness),
        dataLeaveAbsences:       fillLeaveAbsences(data.leaveAbsences),
        tardinessBelowThreshold: fillTardiness(data.tardinessBelowThreshold),
        tardinessAboveThreshold: fillLeaveAbsences(data.tardinessAboveThreshold),
        undertimeBelowThreshold: fillUndertime(data.undertimeBelowThreshold),
        undertimeAboveThreshold: fillLeaveAbsences(data.undertimeAboveThreshold),
      });

      setShowResults(true);
      setActiveResultTab('tardiness');

      await Swal.fire({
        icon: 'success',
        title: 'Done Populating',
        html: `
          <div style="text-align:center">
            <p style="color:#6b7280;margin-bottom:8px">Elapsed time:</p>
            <p style="font-size:1.4rem;font-weight:700;color:#2563eb">
              ${elapsed.h}h ${elapsed.m}m ${elapsed.s}s
            </p>
            <p style="color:#6b7280;font-size:0.8rem;margin-top:6px">
              ${empCodes.length} employee(s) processed
            </p>
          </div>
        `,
        confirmButtonText:  'View Results',
        confirmButtonColor: '#2563eb',
      });

      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

    } catch (err: any) {
      stopTimer();
      const isTimeout = err?.code === 'ECONNABORTED' || err?.message?.includes('timeout');
      const msg = isTimeout
        ? 'The request timed out. The server is still processing — check the results in a few moments or increase the timeout.'
        : err?.response?.data?.message ?? err?.message ?? 'An unexpected error occurred.';
      Swal.fire({ icon: 'error', title: isTimeout ? 'Request Timed Out' : 'Populate Failed', text: msg });
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
    startTimer();

    Swal.fire({
      title: 'Processing...',
      html: `
        <p style="color:#6b7280;margin-bottom:12px">Saving data to database — please wait.</p>
        <div style="font-size:2rem;font-weight:700;color:#16a34a;font-variant-numeric:tabular-nums" id="swal-timer">
          0:00:00
        </div>
        <p style="color:#9ca3af;font-size:0.75rem;margin-top:6px">elapsed time</p>
      `,
      allowOutsideClick: false,
      allowEscapeKey:    false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
        const start = Date.now();
        const interval = setInterval(() => {
          const el = document.getElementById('swal-timer');
          if (!el) { clearInterval(interval); return; }
          const s = Math.floor((Date.now() - start) / 1000);
          const h = Math.floor(s / 3600);
          const m = Math.floor((s % 3600) / 60);
          const sec = s % 60;
          el.textContent = `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
        }, 1000);
        (window as any).__swalTimerInterval = interval;
      },
      willClose: () => { clearInterval((window as any).__swalTimerInterval); },
    });

    try {
      const response = await apiClient.post('/Populate/Process', processPayload, {
        timeout: 30 * 60 * 1000,
      });

      const totalMs = stopTimer();
      const elapsed = fmtElapsed(totalMs);
      const result  = response.data;

      if (result?.isSuccessful === false) {
        Swal.fire({ icon: 'error', title: 'Process Error', text: result.message ?? 'Process failed.' });
      } else {
        await Swal.fire({
          icon: 'success',
          title: 'Done Processing',
          html: `
            <div style="text-align:center">
              <p style="color:#6b7280;margin-bottom:8px">Elapsed time:</p>
              <p style="font-size:1.4rem;font-weight:700;color:#16a34a">
                ${elapsed.h}h ${elapsed.m}m ${elapsed.s}s
              </p>
            </div>
          `,
          confirmButtonText:  'OK',
          confirmButtonColor: '#16a34a',
        });
        // Clear payload so Process cannot be run twice
        setProcessPayload(null);
      }
    } catch (err: any) {
      stopTimer();
      const isTimeout = err?.code === 'ECONNABORTED' || err?.message?.includes('timeout');
      const msg = isTimeout
        ? 'The request timed out. The data may have been saved — please verify before re-processing.'
        : err?.response?.data?.message ?? err?.message ?? 'An unexpected error occurred.';
      Swal.fire({ icon: 'error', title: isTimeout ? 'Request Timed Out' : 'Process Failed', text: msg });
    } finally {
      setProcessing(false);
    }
  };

  // ── Result data ───────────────────────────────────────────────────────────
  const resultTabs = [
    { id: 'tardiness',           label: 'Tardiness' },
    { id: 'undertime',           label: 'Undertime' },
    { id: 'leave-absences',      label: 'Leave and Absences' },
    { id: 'regular-working',     label: 'Regular Working Days/Hours' },
    { id: 'allowances',          label: 'Allowances' },
    { id: 'overtime',            label: 'Overtime' },
    { id: 'night-differentials', label: 'Night Differentials' },
    { id: 'holiday-pay',         label: 'Holiday Pay' },
  ];

  const getActiveResultData = (): any[] => {
    if (!populateResult) return [];
    switch (activeResultTab) {
      case 'tardiness':           return populateResult.tardiness           ?? [];
      case 'undertime':           return populateResult.undertime           ?? [];
      case 'leave-absences':      return populateResult.leaveAbsences       ?? [];
      case 'regular-working':     return populateResult.regularWorkingHours ?? [];
      case 'allowances':          return populateResult.allowance           ?? [];
      case 'overtime':            return populateResult.overtime            ?? [];
      case 'night-differentials': return populateResult.nightDiff           ?? [];
      case 'holiday-pay':         return populateResult.holidayPay          ?? [];
      default:                    return [];
    }
  };

  const activeResultData   = getActiveResultData();
  const filteredResultData = activeResultData.filter((r: any) => {
    if (!resultSearchTerm.trim()) return true;
    const term = resultSearchTerm.toLowerCase();
    return Object.values(r).some(v => v != null && String(v).toLowerCase().includes(term));
  });
  const totalResultPages = Math.ceil(filteredResultData.length / resultPageSize);
  const pagedResultData  = filteredResultData.slice((resultPage - 1) * resultPageSize, resultPage * resultPageSize);

  // ── Live timer display (outside Swal) ─────────────────────────────────────
  const { h: th, m: tm, s: ts } = fmtElapsed(elapsedMs);
  const timerDisplay = `${th}:${String(tm).padStart(2,'0')}:${String(ts).padStart(2,'0')}`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg flex items-center justify-between">
            <h1 className="text-white">Process Data</h1>
            {/* Live timer shown while populating/processing */}
            {timerRunning && (
              <div className="bg-white/20 rounded-lg px-4 py-2 text-right">
                <div className="text-xs text-blue-100">Elapsed</div>
                <div className="text-xl font-bold font-mono">{timerDisplay}</div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-b-lg shadow-lg p-6">

            {/* Info Banner */}
            <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 flex items-start gap-3">
              <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700 mb-2">Process employee timekeeping data by TK Group, branch, department, and more.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
                  {['Process by multiple organizational groups', 'Generate comprehensive attendance reports',
                    'Track tardiness, undertime, and overtime',  'Monitor leave and absences efficiently'].map(t => (
                    <div key={t} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-600">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-1 border-b border-gray-200 flex-wrap">
              {([
                { name: 'TK Group'       as const, icon: Users },
                { name: 'Branch'         as const, icon: Building2 },
                { name: 'Department'     as const, icon: Briefcase },
                { name: 'Division'       as const, icon: Network },
                { name: 'Group Schedule' as const, icon: CalendarClock },
                { name: 'Pay House'      as const, icon: Wallet },
                { name: 'Section'        as const, icon: Grid },
                { name: 'Unit'           as const, icon: Box },
              ] as { name: ActiveTab; icon: any }[]).map(tab => (
                <button key={tab.name} onClick={() => setActiveTab(tab.name)}
                  className={`px-4 py-2 text-sm flex items-center gap-2 rounded-t-lg transition-colors ${
                    activeTab === tab.name ? 'bg-blue-600 text-white font-medium -mb-px' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  <tab.icon className="w-4 h-4" />{tab.name}
                </button>
              ))}
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

              {/* Group Selection */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-900">{activeTab} Selection</h3>
                  <span className="px-2.5 py-1 bg-teal-100 text-teal-700 rounded-full text-xs">{selectedGroups.length} selected</span>
                </div>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search..." value={groupSearchTerm}
                    onChange={e => { setGroupSearchTerm(e.target.value); setCurrentGroupPage(1); }}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left">
                          <input type="checkbox"
                            checked={selectedGroups.length === filteredGroups.length && filteredGroups.length > 0}
                            onChange={handleSelectAllGroups}
                            className="w-4 h-4 text-blue-600 rounded" />
                        </th>
                        <th className="px-3 py-2 text-left text-xs text-gray-600">Code</th>
                        <th className="px-3 py-2 text-left text-xs text-gray-600">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedGroups.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <input type="checkbox" checked={selectedGroups.includes(item.id)}
                              onChange={() => handleGroupToggle(item.id)}
                              className="w-4 h-4 text-blue-600 rounded" />
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">{item.code}</td>
                          <td className="px-3 py-2 text-sm text-gray-600">{item.description}</td>
                        </tr>
                      ))}
                      {paginatedGroups.length === 0 && (
                        <tr><td colSpan={3} className="px-3 py-6 text-center text-sm text-gray-400">No items found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{filteredGroups.length} entries</span>
                  <div className="flex gap-1">
                    <button onClick={() => setCurrentGroupPage(p => Math.max(1, p - 1))} disabled={currentGroupPage === 1}
                      className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100 disabled:opacity-40">‹</button>
                    {makePageNums(totalGroupPages, currentGroupPage).map((p, i) =>
                      p === '...' ? <span key={i} className="px-1 text-gray-400 text-xs">…</span>
                      : <button key={i} onClick={() => setCurrentGroupPage(p as number)}
                          className={`px-2 py-1 rounded text-xs ${currentGroupPage === p ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>{p}</button>
                    )}
                    <button onClick={() => setCurrentGroupPage(p => Math.min(totalGroupPages, p + 1))} disabled={currentGroupPage >= totalGroupPages || totalGroupPages === 0}
                      className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100 disabled:opacity-40">›</button>
                  </div>
                </div>
              </div>

              {/* Employee Selection */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-900">Employees</h3>
                  <span className="px-2.5 py-1 bg-teal-100 text-teal-700 rounded-full text-xs">{selectedEmployees.length} selected</span>
                </div>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search employees..." value={empSearchTerm}
                    onChange={e => { setEmpSearchTerm(e.target.value); setCurrentEmpPage(1); }}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left">
                          <input type="checkbox"
                            checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                            onChange={handleSelectAllEmps}
                            className="w-4 h-4 text-blue-600 rounded" />
                        </th>
                        <th className="px-3 py-2 text-left text-xs text-gray-600">Code</th>
                        <th className="px-3 py-2 text-left text-xs text-gray-600">Name</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loadingEmployees
                        ? <tr><td colSpan={3} className="px-3 py-8 text-center text-sm text-gray-400">Loading…</td></tr>
                        : paginatedEmps.length === 0
                        ? <tr><td colSpan={3} className="px-3 py-8 text-center text-sm text-gray-400">No employees found.</td></tr>
                        : paginatedEmps.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2">
                              <input type="checkbox" checked={selectedEmployees.includes(item.id)}
                                onChange={() => handleEmployeeToggle(item.id)}
                                className="w-4 h-4 text-blue-600 rounded" />
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900">{item.code}</td>
                            <td className="px-3 py-2 text-sm text-gray-600">{item.name}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{filteredEmployees.length} entries</span>
                  <div className="flex gap-1">
                    <button onClick={() => setCurrentEmpPage(p => Math.max(1, p - 1))} disabled={currentEmpPage === 1}
                      className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100 disabled:opacity-40">‹</button>
                    {makePageNums(totalEmpPages, currentEmpPage).map((p, i) =>
                      p === '...' ? <span key={i} className="px-1 text-gray-400 text-xs">…</span>
                      : <button key={i} onClick={() => setCurrentEmpPage(p as number)}
                          className={`px-2 py-1 rounded text-xs ${currentEmpPage === p ? 'bg-blue-500 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>{p}</button>
                    )}
                    <button onClick={() => setCurrentEmpPage(p => Math.min(totalEmpPages, p + 1))} disabled={currentEmpPage >= totalEmpPages}
                      className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100 disabled:opacity-40">›</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Processing Options */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
              <h2 className="text-gray-900 mb-4 pb-3 border-b border-gray-200">Processing Options</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Date From */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Date From</label>
                  <div className="relative">
                    <input type="text" value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="MM/DD/YYYY"
                      className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="button" onClick={() => setShowDateFromCal(v => !v)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600">
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                    {showDateFromCal && <CalendarPopup onDateSelect={d => { setDateFrom(d); setShowDateFromCal(false); }} onClose={() => setShowDateFromCal(false)} />}
                  </div>
                </div>
                {/* Date To */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Date To</label>
                  <div className="relative">
                    <input type="text" value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="MM/DD/YYYY"
                      className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="button" onClick={() => setShowDateToCal(v => !v)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600">
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                    {showDateToCal && <CalendarPopup onDateSelect={d => { setDateTo(d); setShowDateToCal(false); }} onClose={() => setShowDateToCal(false)} />}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Date Applied */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Date Applied</label>
                  <div className="relative">
                    <input type="text" value={dateApplied} onChange={e => setDateApplied(e.target.value)} placeholder="MM/DD/YYYY"
                      className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="button" onClick={() => setShowDateAppliedCal(v => !v)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600">
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                    {showDateAppliedCal && <CalendarPopup onDateSelect={d => { setDateApplied(d); setShowDateAppliedCal(false); }} onClose={() => setShowDateAppliedCal(false)} />}
                  </div>
                </div>
                {/* Late Filing */}
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={lateFiling} onChange={e => setLateFiling(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                    <span className="text-sm text-gray-700">Include Late Filing</span>
                  </label>
                </div>
              </div>

              {/* Process Checkboxes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-center gap-2 cursor-pointer mb-3 pb-3 border-b border-blue-200">
                  <input type="checkbox" checked={processOptions.selectAll} onChange={() => handleOptionChange('selectAll')}
                    className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm font-medium text-gray-900">Select All</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {([
                    ['tardiness',          'Tardiness'],
                    ['undertime',          'Undertime'],
                    ['overtime',           'Overtime'],
                    ['leaveAbsences',      'Leave / Absences'],
                    ['regularWorking',     'Regular Working Days'],
                    ['allowances',         'Allowances'],
                    ['nightDifferentials', 'Night Differential'],
                    ['holidayPay',         'Holiday Pay'],
                  ] as [keyof typeof processOptions, string][]).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={processOptions[key] as boolean} onChange={() => handleOptionChange(key)}
                        className="w-4 h-4 text-blue-600 rounded" />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                <button onClick={handlePopulate} disabled={populating || processing}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <Users className="w-4 h-4" />
                  {populating ? 'Populating…' : 'Populate'}
                </button>
                <button onClick={handleProcess} disabled={populating || processing || !processPayload}
                  title={!processPayload ? 'Run Populate first' : ''}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <Play className="w-4 h-4" />
                  {processing ? 'Processing…' : 'Process'}
                </button>

                {/* Inline elapsed during operation */}
                {timerRunning && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-sm text-amber-700 font-mono font-semibold">{timerDisplay}</span>
                    <span className="text-xs text-amber-600">{populating ? 'populating' : 'processing'}</span>
                  </div>
                )}
              </div>

              {!processPayload && !populating && (
                <p className="text-xs text-amber-600 mt-2">ℹ️ Run <strong>Populate</strong> first to enable the Process button.</p>
              )}
              {processPayload && !processing && (
                <p className="text-xs text-green-600 mt-2">✓ Populate complete. Review the results below, then click <strong>Process</strong> to save.</p>
              )}
            </div>

            {/* Results */}
            {showResults && populateResult && (
              <div ref={resultsRef} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-gray-900">Populate Results</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Completed</span>
                </div>

                {/* Result Tabs */}
                <div className="bg-white border-b border-gray-200 overflow-x-auto">
                  <div className="flex">
                    {resultTabs.map(tab => {
                      const count = getActiveResultData().length;
                      return (
                        <button key={tab.id} onClick={() => setActiveResultTab(tab.id)}
                          className={`px-4 py-3 whitespace-nowrap text-sm border-b-2 transition-all ${
                            activeResultTab === tab.id
                              ? 'border-blue-600 text-blue-600 bg-blue-50'
                              : 'border-transparent text-gray-600 hover:bg-gray-50'
                          }`}>
                          {tab.label}
                          {activeResultTab === tab.id && count > 0 && (
                            <span className="ml-1.5 px-1.5 py-0.5 bg-blue-600 text-white rounded-full text-xs">{count}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Search */}
                <div className="bg-white border-b border-gray-200 px-4 py-2">
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search results…" value={resultSearchTerm}
                      onChange={e => setResultSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-8 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {resultSearchTerm && (
                      <button onClick={() => setResultSearchTerm('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto bg-white">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                      <tr>
                        {activeResultTab === 'tardiness'           && <><th className="px-4 py-3 text-left text-gray-600">Emp Code</th><th className="px-4 py-3 text-left text-gray-600">Name</th><th className="px-4 py-3 text-left text-gray-600">Date From</th><th className="px-4 py-3 text-left text-gray-600">Date To</th><th className="px-4 py-3 text-left text-gray-600">Time In</th><th className="px-4 py-3 text-left text-gray-600">Time Out</th><th className="px-4 py-3 text-left text-gray-600">Workshift</th><th className="px-4 py-3 text-left text-gray-600">Tardiness</th><th className="px-4 py-3 text-left text-gray-600">Within Grace</th><th className="px-4 py-3 text-left text-gray-600">Actual</th></>}
                        {activeResultTab === 'undertime'           && <><th className="px-4 py-3 text-left text-gray-600">Emp Code</th><th className="px-4 py-3 text-left text-gray-600">Name</th><th className="px-4 py-3 text-left text-gray-600">Date From</th><th className="px-4 py-3 text-left text-gray-600">Date To</th><th className="px-4 py-3 text-left text-gray-600">Time In</th><th className="px-4 py-3 text-left text-gray-600">Time Out</th><th className="px-4 py-3 text-left text-gray-600">Workshift</th><th className="px-4 py-3 text-left text-gray-600">Undertime</th><th className="px-4 py-3 text-left text-gray-600">Within Grace</th><th className="px-4 py-3 text-left text-gray-600">Actual</th></>}
                        {activeResultTab === 'leave-absences'      && <><th className="px-4 py-3 text-left text-gray-600">Emp Code</th><th className="px-4 py-3 text-left text-gray-600">Name</th><th className="px-4 py-3 text-left text-gray-600">Date</th><th className="px-4 py-3 text-left text-gray-600">Leave Code</th><th className="px-4 py-3 text-left text-gray-600">Hours</th><th className="px-4 py-3 text-left text-gray-600">Reason</th><th className="px-4 py-3 text-left text-gray-600">Remarks</th><th className="px-4 py-3 text-left text-gray-600">With Pay</th></>}
                        {activeResultTab === 'regular-working'     && <><th className="px-4 py-3 text-left text-gray-600">Emp Code</th><th className="px-4 py-3 text-left text-gray-600">Name</th><th className="px-4 py-3 text-left text-gray-600">Date In</th><th className="px-4 py-3 text-left text-gray-600">Date Out</th><th className="px-4 py-3 text-left text-gray-600">Workshift</th><th className="px-4 py-3 text-left text-gray-600">Hours</th><th className="px-4 py-3 text-left text-gray-600">Remarks</th></>}
                        {activeResultTab === 'allowances'          && <><th className="px-4 py-3 text-left text-gray-600">Emp Code</th><th className="px-4 py-3 text-left text-gray-600">Name</th><th className="px-4 py-3 text-left text-gray-600">Allowance Code</th><th className="px-4 py-3 text-left text-gray-600">Date</th><th className="px-4 py-3 text-left text-gray-600">Workshift</th><th className="px-4 py-3 text-left text-gray-600">Amount</th></>}
                        {activeResultTab === 'overtime'            && <><th className="px-4 py-3 text-left text-gray-600">Emp Code</th><th className="px-4 py-3 text-left text-gray-600">Name</th><th className="px-4 py-3 text-left text-gray-600">Date From</th><th className="px-4 py-3 text-left text-gray-600">Date To</th><th className="px-4 py-3 text-left text-gray-600">Time In</th><th className="px-4 py-3 text-left text-gray-600">Time Out</th><th className="px-4 py-3 text-left text-gray-600">Workshift</th><th className="px-4 py-3 text-left text-gray-600">OT Hours</th><th className="px-4 py-3 text-left text-gray-600">OT Code</th><th className="px-4 py-3 text-left text-gray-600">Reason</th><th className="px-4 py-3 text-left text-gray-600">Remarks</th></>}
                        {activeResultTab === 'night-differentials' && <><th className="px-4 py-3 text-left text-gray-600">Emp Code</th><th className="px-4 py-3 text-left text-gray-600">Name</th><th className="px-4 py-3 text-left text-gray-600">Date From</th><th className="px-4 py-3 text-left text-gray-600">Date To</th><th className="px-4 py-3 text-left text-gray-600">Time In</th><th className="px-4 py-3 text-left text-gray-600">Time Out</th><th className="px-4 py-3 text-left text-gray-600">Workshift</th><th className="px-4 py-3 text-left text-gray-600">ND Hours</th><th className="px-4 py-3 text-left text-gray-600">OT Code</th></>}
                        {activeResultTab === 'holiday-pay'         && <><th className="px-4 py-3 text-left text-gray-600">Emp Code</th><th className="px-4 py-3 text-left text-gray-600">Name</th><th className="px-4 py-3 text-left text-gray-600">Date From</th><th className="px-4 py-3 text-left text-gray-600">Date To</th><th className="px-4 py-3 text-left text-gray-600">Time In</th><th className="px-4 py-3 text-left text-gray-600">Time Out</th><th className="px-4 py-3 text-left text-gray-600">Workshift</th><th className="px-4 py-3 text-left text-gray-600">Hours</th><th className="px-4 py-3 text-left text-gray-600">OT Code</th></>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pagedResultData.map((r: any, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 text-gray-900 font-medium">{r.empCode}</td>
                          <td className="px-4 py-2.5 text-gray-700">{r.empName || r.formattedName || ''}</td>
                          {activeResultTab === 'tardiness'           && <><td className="px-4 py-2.5 text-gray-600">{fmtDate(r.dateFrom)}</td><td className="px-4 py-2.5 text-gray-600">{fmtDate(r.dateTo)}</td><td className="px-4 py-2.5 text-gray-600">{fmtTime(r.timeIn)}</td><td className="px-4 py-2.5 text-gray-600">{fmtTime(r.timeOut)}</td><td className="px-4 py-2.5 text-blue-600">{r.workShift}</td><td className="px-4 py-2.5 text-gray-600">{fmtNum(r.tardiness)}</td><td className="px-4 py-2.5 text-gray-600">{fmtNum(r.tardinessWithInGrace)}</td><td className="px-4 py-2.5 text-gray-600">{fmtNum(r.actualTardiness)}</td></>}
                          {activeResultTab === 'undertime'           && <><td className="px-4 py-2.5 text-gray-600">{fmtDate(r.dateFrom)}</td><td className="px-4 py-2.5 text-gray-600">{fmtDate(r.dateTo)}</td><td className="px-4 py-2.5 text-gray-600">{fmtTime(r.timeIn)}</td><td className="px-4 py-2.5 text-gray-600">{fmtTime(r.timeOut)}</td><td className="px-4 py-2.5 text-blue-600">{r.workShift}</td><td className="px-4 py-2.5 text-gray-600">{fmtNum(r.undertime)}</td><td className="px-4 py-2.5 text-gray-600">{fmtNum(r.undertimeWithinGracePeriod)}</td><td className="px-4 py-2.5 text-gray-600">{fmtNum(r.actualUndertime)}</td></>}
                          {activeResultTab === 'leave-absences'      && <><td className="px-4 py-2.5 text-gray-600">{fmtDate(r.dateL)}</td><td className="px-4 py-2.5 text-gray-600">{r.leaveCode}</td><td className="px-4 py-2.5 text-gray-600">{fmtNum(r.hoursLeaveAbsent)}</td><td className="px-4 py-2.5 text-gray-600">{r.reason}</td><td className="px-4 py-2.5 text-gray-600">{r.remarks}</td><td className="px-4 py-2.5"><input type="checkbox" checked={!!r.withPay} readOnly className="w-4 h-4 text-blue-600 rounded" /></td></>}
                          {activeResultTab === 'regular-working'     && <><td className="px-4 py-2.5 text-gray-600">{fmtDate(r.dateIn)}</td><td className="px-4 py-2.5 text-gray-600">{fmtDate(r.dateOut)}</td><td className="px-4 py-2.5 text-blue-600">{r.workshiftCode}</td><td className="px-4 py-2.5 text-gray-600">{fmtNum(r.noOfHours)}</td><td className="px-4 py-2.5 text-gray-600">{r.remarks}</td></>}
                          {activeResultTab === 'allowances'          && <><td className="px-4 py-2.5 text-gray-600">{r.allowanceCode}</td><td className="px-4 py-2.5 text-gray-600">{fmtDate(r.date)}</td><td className="px-4 py-2.5 text-blue-600">{r.workshiftCode}</td><td className="px-4 py-2.5 text-gray-600">{r.amount?.toFixed(2)}</td></>}
                          {activeResultTab === 'overtime'            && <><td className="px-4 py-2.5 text-gray-600">{fmtDate(r.dateFrom)}</td><td className="px-4 py-2.5 text-gray-600">{fmtDate(r.dateTo)}</td><td className="px-4 py-2.5 text-gray-600">{fmtTime(r.timeIn)}</td><td className="px-4 py-2.5 text-gray-600">{fmtTime(r.timeOut)}</td><td className="px-4 py-2.5 text-blue-600">{r.workShiftCode}</td><td className="px-4 py-2.5 text-gray-600">{fmtNum(r.overtime)}</td><td className="px-4 py-2.5 text-gray-600">{r.otCode}</td><td className="px-4 py-2.5 text-gray-600">{r.reason}</td><td className="px-4 py-2.5 text-gray-600">{r.remarks}</td></>}
                          {activeResultTab === 'night-differentials' && <><td className="px-4 py-2.5 text-gray-600">{fmtDate(r.dateFrom)}</td><td className="px-4 py-2.5 text-gray-600">{fmtDate(r.dateTo)}</td><td className="px-4 py-2.5 text-gray-600">{fmtTime(r.timeIn)}</td><td className="px-4 py-2.5 text-gray-600">{fmtTime(r.timeOut)}</td><td className="px-4 py-2.5 text-blue-600">{r.workShiftCode}</td><td className="px-4 py-2.5 text-gray-600">{fmtNum(r.overtime)}</td><td className="px-4 py-2.5 text-gray-600">{r.otCode}</td></>}
                          {activeResultTab === 'holiday-pay'         && <><td className="px-4 py-2.5 text-gray-600">{fmtDate(r.dateFrom)}</td><td className="px-4 py-2.5 text-gray-600">{fmtDate(r.dateTo)}</td><td className="px-4 py-2.5 text-gray-600">{fmtTime(r.timeIn)}</td><td className="px-4 py-2.5 text-gray-600">{fmtTime(r.timeOut)}</td><td className="px-4 py-2.5 text-blue-600">{r.workShiftCode}</td><td className="px-4 py-2.5 text-gray-600">{fmtNum(r.overtime)}</td><td className="px-4 py-2.5 text-gray-600">{r.otCode}</td></>}
                        </tr>
                      ))}
                      {pagedResultData.length === 0 && (
                        <tr><td colSpan={11} className="px-4 py-12 text-center text-gray-400 text-sm">No data for this category.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-gray-500">
                    {filteredResultData.length === 0 ? 'No entries' : `${(resultPage - 1) * resultPageSize + 1}–${Math.min(resultPage * resultPageSize, filteredResultData.length)} of ${filteredResultData.length} entries`}
                    {resultSearchTerm && ` (filtered from ${activeResultData.length})`}
                  </span>
                  {totalResultPages > 1 && (
                    <div className="flex gap-1">
                      <button onClick={() => setResultPage(p => Math.max(1, p - 1))} disabled={resultPage === 1}
                        className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100 disabled:opacity-40">‹</button>
                      {makePageNums(totalResultPages, resultPage).map((p, i) =>
                        p === '...' ? <span key={i} className="px-1 text-gray-400 text-xs">…</span>
                        : <button key={i} onClick={() => setResultPage(p as number)}
                            className={`px-2 py-1 rounded text-xs ${resultPage === p ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>{p}</button>
                      )}
                      <button onClick={() => setResultPage(p => Math.min(totalResultPages, p + 1))} disabled={resultPage >= totalResultPages}
                        className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100 disabled:opacity-40">›</button>
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