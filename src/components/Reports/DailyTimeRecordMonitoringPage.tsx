import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import { Calendar, Search, X, Printer, Check, Clock, Users, Building2, Briefcase, Award, Network, Grid } from 'lucide-react';
import { CalendarPopover } from '../CalendarPopover';
import apiClient from '../../services/apiClient';
import { Footer } from '../Footer/Footer';
import Swal from 'sweetalert2';
import { EmployeeSearchModal } from '../Modals/EmployeeSearchModal';

// ── Types ──────────────────────────────────────────────────────────────────────

type TabType       = 'tk-group' | 'branch' | 'department' | 'designation' | 'division' | 'section';
type StatusType    = 'Active' | 'InActive' | 'All';
type ModeType      = 'Absences' | 'Leave' | 'All';
type HrsOptionType = 'Per Employee' | 'Summary';
type PayType       = 'WithPay' | 'WithOutPay' | 'All';

interface GroupItem {
  id: number;
  code: string;
  description: string;
}

interface EmployeeItem {
  id:                number;
  code:              string;
  name:              string;
  tkGroup:           string;
  branchCode:        string;
  departmentCode:    string;
  divisionCode:      string;
  groupScheduleCode: string;
  payHouseCode:      string;
  sectionCode:       string;
  unitCode:          string;
}

interface LeaveTypeItem {
  leaveID:   number;
  leaveCode: string;
  leaveDesc: string;
}

interface ReportFilter {
  empCode:           string;
  dateFr:            string;
  dateTo:            string;
  groups:            string[];
  departments:       string[];
  divisions:         string[];
  branch:            string[];
  designation:       string[];
  section:           string[];
  company:           string;
  address:           string;
  userName:          string;
  mode:              string;
  activeInActiveAll: string;
}

interface LeaveAbsencesFilter {
  empCode:         string;
  dateFr:          string;
  dateTo:          string;
  groups:          string[];
  departments:     string[];
  divisions:       string[];
  branch:          string[];
  designation:     string[];
  section:         string[];
  company:         string;
  address:         string;
  leaveType:       string;
  leaveWithOrWPay: string;
  includeLeaveAdj: boolean;
  status:          string;
  mode:            string;
}

interface DailyRecord {
  date: string; day: string; restDay: boolean;
  timeIn: string; timeOut: string; workShift: string;
  noOfHrs: string; tardiness: string; undertime: string;
  absences: string; leaveWithPay: string;
}

interface EmployeeReport {
  seqNo: number; empCode: string; fullName: string;
  dailyRecords: DailyRecord[];
  subtotal: { noOfHrs: string; tardiness: string; undertime: string; absences: string; leaveWithPay: string };
}

// ── Constants ──────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

const TABS: { id: TabType; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'tk-group',    label: 'TK Group',    icon: Users     },
  { id: 'branch',      label: 'Branch',      icon: Building2 },
  { id: 'department',  label: 'Department',  icon: Briefcase },
  { id: 'designation', label: 'Designation', icon: Award     },
  { id: 'division',    label: 'Division',    icon: Network   },
  { id: 'section',     label: 'Section',     icon: Grid      },
];

const REPORT_TYPES_WITH_HHMM = [
  'Leave And Absences', 'Daily Time', 'Attendance Summary',
  'Adjustment', 'Assumed Days', 'Overtime', 'Tardiness',
  'Unauthorized Absences', 'Undertime',
];

const REPORT_MAP: Record<string, { endpoint: string; fileName: string }> = {
  'Attendance Summary':                             { endpoint: '/AttendanceSummary/PrintAttendanceSummary',         fileName: 'AttendanceSummaryReport.xlsx'       },
  'Daily Time':                                     { endpoint: '/DailyTimeReport/PrintDailyTimeReport',             fileName: 'DailyTimeReport.xlsx'               },
  'Employees Raw In And Out (From Update Rawdata)': { endpoint: '/EmployeeRawInAndOut/PrintEmployeeRawInAndOut',     fileName: 'EmployeeRawInAndOutReport.xlsx'      },
  'Device Code Report':                             { endpoint: '/DeviceCodeReport/PrintDeviceCodeReport',           fileName: 'DeviceCodeReport.xlsx'              },
  'Employees Raw Data Report':                      { endpoint: '/EmployeeRawDataReport/PrintEmployeeRawDataReport', fileName: 'EmployeeRawDataReport.xlsx'         },
  'In And Out By Position':                         { endpoint: '/InOutByPositionReport/PrintInOutByPositionReport', fileName: 'EmployeesInAndOutReport.xlsx'       },
};

const LEAVE_MODE_MAP: Record<ModeType, { endpoint: string; fileName: string }> = {
  All:      { endpoint: '/LeaveAndAbsences/PrintLeaveAndAbsences', fileName: 'LeaveAndAbsencesReport.xlsx' },
  Absences: { endpoint: '/LeaveAndAbsences/PrintAbsences',         fileName: 'AbsencesReport.xlsx'         },
  Leave:    { endpoint: '/LeaveAndAbsences/PrintLeave',            fileName: 'LeaveReport.xlsx'            },
};

const MAN_HOURS_MAP: Record<HrsOptionType, { endpoint: string; fileName: string }> = {
  'Per Employee': { endpoint: '/ManHoursReport/PrintManHoursPerEmployee', fileName: 'ManHoursPerEmployeeReport.xlsx' },
  'Summary':      { endpoint: '/ManHoursReport/PrintManHoursSummary',     fileName: 'ManHoursSummaryReport.xlsx'     },
};

const SAMPLE_REPORT_DATA: EmployeeReport[] = [
  {
    seqNo: 1, empCode: 'V067', fullName: 'ABAD, JULIE ROSE RAMOS',
    dailyRecords: [
      { date: '1-Mar-2020',  day: 'Sun', restDay: true,  timeIn: '',          timeOut: '',          workShift: 'RestDay',    noOfHrs: '0.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
      { date: '2-Mar-2020',  day: 'Mon', restDay: false, timeIn: '7:07:00AM', timeOut: '5:33:00PM', workShift: '730 AM 6PM', noOfHrs: '9.05', tardiness: '0.00', undertime: '0.45', absences: '0.00', leaveWithPay: '0.00' },
      { date: '3-Mar-2020',  day: 'Tue', restDay: false, timeIn: '7:11:00AM', timeOut: '5:47:00PM', workShift: '730 AM 6PM', noOfHrs: '9.28', tardiness: '0.00', undertime: '0.22', absences: '0.00', leaveWithPay: '0.00' },
      { date: '4-Mar-2020',  day: 'Wed', restDay: false, timeIn: '',          timeOut: '',          workShift: 'RegDay',     noOfHrs: '8.00', tardiness: '0.00', undertime: '0.00', absences: '1.50', leaveWithPay: '8.00' },
      { date: '5-Mar-2020',  day: 'Thu', restDay: false, timeIn: '',          timeOut: '',          workShift: 'RegDay',     noOfHrs: '8.00', tardiness: '0.00', undertime: '0.00', absences: '1.50', leaveWithPay: '8.00' },
      { date: '6-Mar-2020',  day: 'Fri', restDay: false, timeIn: '',          timeOut: '',          workShift: '',           noOfHrs: '9.50', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '9.50' },
      { date: '7-Mar-2020',  day: 'Sat', restDay: false, timeIn: '',          timeOut: '',          workShift: 'RestDay',    noOfHrs: '0.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
      { date: '8-Mar-2020',  day: 'Sun', restDay: true,  timeIn: '',          timeOut: '',          workShift: 'RestDay',    noOfHrs: '0.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
      { date: '9-Mar-2020',  day: 'Mon', restDay: false, timeIn: '7:12:00AM', timeOut: '5:30:00PM', workShift: '730 AM 6PM', noOfHrs: '9.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
      { date: '10-Mar-2020', day: 'Tue', restDay: false, timeIn: '7:04:00AM', timeOut: '5:32:00PM', workShift: '730 AM 6PM', noOfHrs: '9.03', tardiness: '0.00', undertime: '0.47', absences: '0.00', leaveWithPay: '0.00' },
      { date: '11-Mar-2020', day: 'Wed', restDay: false, timeIn: '6:45:00AM', timeOut: '7:30:00PM', workShift: '730 AM 6PM', noOfHrs: '9.50', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
      { date: '12-Mar-2020', day: 'Thu', restDay: false, timeIn: '7:30:00AM', timeOut: '6:00:00PM', workShift: '730 AM 6PM', noOfHrs: '9.50', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
      { date: '13-Mar-2020', day: 'Fri', restDay: false, timeIn: '7:30:00AM', timeOut: '6:00:00PM', workShift: '730 AM 6PM', noOfHrs: '9.50', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
      { date: '14-Mar-2020', day: 'Sat', restDay: false, timeIn: '',          timeOut: '',          workShift: 'RestDay',    noOfHrs: '0.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
      { date: '15-Mar-2020', day: 'Sun', restDay: true,  timeIn: '',          timeOut: '',          workShift: 'RestDay',    noOfHrs: '0.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
    ],
    subtotal: { noOfHrs: '90.36', tardiness: '0.00', undertime: '1.14', absences: '3.00', leaveWithPay: '25.50' },
  },
  {
    seqNo: 2, empCode: 'D002', fullName: 'BALETE, LORENZO MAGADDON',
    dailyRecords: [
      { date: '1-Mar-2020',  day: 'Sun', restDay: true,  timeIn: '',          timeOut: '',          workShift: 'RestDay',    noOfHrs: '0.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
      { date: '2-Mar-2020',  day: 'Mon', restDay: false, timeIn: '9:34:00AM', timeOut: '6:49:00PM', workShift: '930AM730PM', noOfHrs: '9.00', tardiness: '0.07', undertime: '0.68', absences: '0.00', leaveWithPay: '0.00' },
      { date: '3-Mar-2020',  day: 'Tue', restDay: false, timeIn: '9:32:00AM', timeOut: '7:44:00PM', workShift: '930AM730PM', noOfHrs: '9.00', tardiness: '0.03', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
      { date: '4-Mar-2020',  day: 'Wed', restDay: false, timeIn: '9:41:00AM', timeOut: '6:47:00PM', workShift: '930AM730PM', noOfHrs: '9.00', tardiness: '0.18', undertime: '0.72', absences: '0.00', leaveWithPay: '0.00' },
      { date: '5-Mar-2020',  day: 'Thu', restDay: false, timeIn: '9:34:00AM', timeOut: '6:00:00PM', workShift: '930AM730PM', noOfHrs: '7.50', tardiness: '0.07', undertime: '1.50', absences: '0.00', leaveWithPay: '0.00' },
      { date: '6-Mar-2020',  day: 'Fri', restDay: false, timeIn: '9:30:00AM', timeOut: '8:00:00PM', workShift: '930AM730PM', noOfHrs: '9.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
      { date: '7-Mar-2020',  day: 'Sat', restDay: false, timeIn: '',          timeOut: '',          workShift: 'RestDay',    noOfHrs: '0.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
      { date: '8-Mar-2020',  day: 'Sun', restDay: true,  timeIn: '',          timeOut: '',          workShift: 'RestDay',    noOfHrs: '0.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
      { date: '9-Mar-2020',  day: 'Mon', restDay: false, timeIn: '9:30:00AM', timeOut: '7:30:00PM', workShift: '930AM730PM', noOfHrs: '9.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
      { date: '10-Mar-2020', day: 'Tue', restDay: false, timeIn: '8:57:00AM', timeOut: '6:57:00PM', workShift: '930AM730PM', noOfHrs: '9.00', tardiness: '0.00', undertime: '0.55', absences: '0.00', leaveWithPay: '0.00' },
      { date: '11-Mar-2020', day: 'Wed', restDay: false, timeIn: '9:30:00AM', timeOut: '7:30:00PM', workShift: '930AM730PM', noOfHrs: '9.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
      { date: '12-Mar-2020', day: 'Thu', restDay: false, timeIn: '7:30:00AM', timeOut: '6:00:00PM', workShift: '930AM730PM', noOfHrs: '9.00', tardiness: '0.00', undertime: '1.50', absences: '0.00', leaveWithPay: '0.00' },
      { date: '13-Mar-2020', day: 'Fri', restDay: false, timeIn: '7:30:00AM', timeOut: '6:00:00PM', workShift: '930AM730PM', noOfHrs: '9.00', tardiness: '0.00', undertime: '1.50', absences: '0.00', leaveWithPay: '0.00' },
      { date: '14-Mar-2020', day: 'Sat', restDay: false, timeIn: '',          timeOut: '',          workShift: 'RestDay',    noOfHrs: '0.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
      { date: '15-Mar-2020', day: 'Sun', restDay: true,  timeIn: '',          timeOut: '',          workShift: 'RestDay',    noOfHrs: '0.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
    ],
    subtotal: { noOfHrs: '88.50', tardiness: '0.35', undertime: '6.45', absences: '0.00', leaveWithPay: '0.00' },
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function toQueryParams<T extends Record<string, any>>(obj: T): string {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    if (value instanceof Date) {
      params.append(key, value.toISOString());
    } else if (Array.isArray(value)) {
      value.forEach(v => params.append(key, String(v)));
    } else {
      params.append(key, String(value));
    }
  });
  return params.toString();
}

function triggerDownload(blob: Blob, fileName: string): void {
  const url  = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = fileName;
  document.body.appendChild(link); link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

function idsToCodeList(ids: number[], items: GroupItem[]): string[] {
  if (ids.length === 0) return [];
  return items.filter(i => ids.includes(i.id)).map(i => i.code);
}

// ── Component ──────────────────────────────────────────────────────────────────

export function DailyTimeRecordMonitoringPage() {

  // ── Date / employee ───────────────────────────────────────────────────────
  const [dateFrom, setDateFrom] = useState('05/24/2021');
  const [dateTo,   setDateTo]   = useState('05/24/2021');
  const [empCode,  setEmpCode]  = useState('');
  const [empName,  setEmpName]  = useState('');

  // ── UI ────────────────────────────────────────────────────────────────────
  const [showReport,         setShowReport]         = useState(false);
  const [showSearchModal,    setShowSearchModal]    = useState(false);
  const [sortAlphabetically, setSortAlphabetically] = useState(false);

  // ── Report options ────────────────────────────────────────────────────────
  const [reportType,        setReportType]        = useState('Accumulation');
  const [convertToHHMM,     setConvertToHHMM]     = useState(false);
  const [includeLeaveAdj,   setIncludeLeaveAdj]   = useState(false);
  const [empStatus,         setEmpStatus]         = useState<StatusType>('Active');
  const [status,            setStatus]            = useState<StatusType>('All');
  const [mode,              setMode]              = useState<ModeType>('All');
  const [hrsOptions,        setHrsOptions]        = useState<HrsOptionType>('Per Employee');
  const [dataMode,          setDataMode]          = useState('CompleteLogs');
  const [withOrWOutPay,     setWithOrWOutPay]     = useState<PayType>('All');
  const [selectedLeaveType, setSelectedLeaveType] = useState('');

  // ── Tab / group selection ─────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabType>('tk-group');

  // Per-tab selected IDs — each tab keeps its own selections independently
  const [selectedMap, setSelectedMap] = useState<Record<TabType, number[]>>({
    'tk-group': [], 'branch': [], 'department': [],
    'designation': [], 'division': [], 'section': [],
  });
  const selectedIds    = selectedMap[activeTab];
  const setSelectedIds = (updater: number[] | ((prev: number[]) => number[])) =>
    setSelectedMap(prev => ({
      ...prev,
      [activeTab]: typeof updater === 'function' ? updater(prev[activeTab]) : updater,
    }));

  // ── Group pagination ──────────────────────────────────────────────────────
  const [groupPage,       setGroupPage]       = useState(1);
  const [groupSearchTerm, setGroupSearchTerm] = useState('');

  useEffect(() => { setGroupPage(1); }, [activeTab]);

  // ── Data ──────────────────────────────────────────────────────────────────
  const [tkGroupItems,     setTKGroupItems]     = useState<GroupItem[]>([]);
  const [branchItems,      setBranchItems]      = useState<GroupItem[]>([]);
  const [departmentItems,  setDepartmentItems]  = useState<GroupItem[]>([]);
  const [designationItems, setDesignationItems] = useState<GroupItem[]>([]);
  const [divisionItems,    setDivisionItems]    = useState<GroupItem[]>([]);
  const [sectionItems,     setSectionItems]     = useState<GroupItem[]>([]);
  const [employeeItems,    setEmployeeItems]    = useState<EmployeeItem[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeeError,    setEmployeeError]    = useState('');
  const [leaveTypes,       setLeaveTypes]       = useState<LeaveTypeItem[]>([]);

  // ── Group fetch helpers ────────────────────────────────────────────────────
  const mapGroup = (data: any[], idKey: string, codeKey: string, descKey: string): GroupItem[] =>
    (Array.isArray(data) ? data : []).map(i => ({
      id:          i[idKey]   ?? i.ID   ?? i.id   ?? 0,
      code:        i[codeKey] ?? i.code ?? '',
      description: i[descKey] ?? i.description ?? '',
    }));

  const fetchTKGroupData     = async () => mapGroup((await apiClient.get('/Fs/Process/TimeKeepGroupSetUp')).data,  'ID',    'groupCode', 'groupDescription');
  const fetchBranchData      = async () => mapGroup((await apiClient.get('/Fs/Employment/BranchSetUp')).data,      'braID', 'braCode',   'braDesc');
  const fetchDepartmentData  = async () => mapGroup((await apiClient.get('/Fs/Employment/DepartmentSetUp')).data,  'depID', 'depCode',   'depDesc');
  const fetchDesignationData = async () => mapGroup((await apiClient.get('/Fs/Employment/DesignationSetUp')).data, 'desID', 'desCode',   'desDesc');
  const fetchDivisionData    = async () => mapGroup((await apiClient.get('/Fs/Employment/DivisionSetUp')).data,    'divID', 'divCode',   'divDesc');
  const fetchSectionData     = async () => mapGroup((await apiClient.get('/Fs/Employment/SectionSetUp')).data,     'secID', 'secCode',   'secDesc');

  useEffect(() => { fetchTKGroupData().then(setTKGroupItems).catch(console.error); },         []);
  useEffect(() => { fetchBranchData().then(setBranchItems).catch(console.error); },           []);
  useEffect(() => { fetchDepartmentData().then(setDepartmentItems).catch(console.error); },   []);
  useEffect(() => { fetchDesignationData().then(setDesignationItems).catch(console.error); }, []);
  useEffect(() => { fetchDivisionData().then(setDivisionItems).catch(console.error); },       []);
  useEffect(() => { fetchSectionData().then(setSectionItems).catch(console.error); },         []);

  // ── Employee fetch ─────────────────────────────────────────────────────────
  // Uses the GetActive endpoint so Active / InActive / All is filtered server-side,
  // matching the original fetchEmployee behaviour.
  const fetchEmployeeData = async (status: StatusType): Promise<EmployeeItem[]> => {
    const response = await apiClient.get(`/Maintenance/EmployeeMasterFile/GetActive?active=${status}`);
    const list = Array.isArray(response.data) ? response.data : [];
    return list.map((item: any): EmployeeItem => ({
      id:                item.empID            ?? item.ID              ?? item.id              ?? 0,
      code:              item.empCode          || item.code            || '',
      name:              `${item.lName || ''}, ${item.fName || ''} ${item.mName || ''}`.trim(),
      tkGroup:           item.tkGroup          ?? item.tKGroup         ?? item.groupCode       ?? item.tkGroupCode ?? '',
      branchCode:        item.braCode          ?? item.branchCode      ?? item.branch          ?? '',
      departmentCode:    item.depCode          ?? item.departmentCode  ?? item.department      ?? '',
      divisionCode:      item.divCode          ?? item.divisionCode    ?? item.division        ?? '',
      groupScheduleCode: item.grpCode          ?? item.groupSchedule   ?? item.grpSchCode      ?? '',
      payHouseCode:      item.lineCode         ?? item.payCode         ?? item.payHouseCode    ?? item.payHouse ?? '',
      sectionCode:       item.secCode          ?? item.sectionCode     ?? item.section         ?? '',
      unitCode:          item.unitCode         ?? item.unit            ?? '',
    }));
  };

  const fetchFilteredEmployees = useCallback(async (status: StatusType) => {
    setLoadingEmployees(true);
    setEmployeeError('');
    try {
      setEmployeeItems(await fetchEmployeeData(status));
    } catch (err) {
      console.error('Error fetching employees', err);
      setEmployeeError('Failed to load employees.');
    } finally {
      setLoadingEmployees(false);
    }
  }, []); // eslint-disable-line

  // Re-fetch whenever empStatus changes (Active / InActive / All)
  useEffect(() => { fetchFilteredEmployees(empStatus); }, [empStatus]); // eslint-disable-line

  // ── Leave types fetch ──────────────────────────────────────────────────────
  useEffect(() => {
    apiClient.get('/Fs/Process/LeaveTypeSetUp')
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : [];
        setLeaveTypes(list.map((l: any): LeaveTypeItem => ({
          leaveID:   l.leaveID   ?? l.ID        ?? 0,
          leaveCode: l.leaveCode ?? l.LeaveCode ?? '',
          leaveDesc: l.leaveDesc ?? l.LeaveDesc ?? '',
        })));
      })
      .catch(err => console.error('Error fetching leave types', err));
  }, []);

  // ── Derived: current tab items ────────────────────────────────────────────
  const getCurrentItems = (): GroupItem[] => {
    switch (activeTab) {
      case 'branch':      return branchItems;
      case 'department':  return departmentItems;
      case 'designation': return designationItems;
      case 'division':    return divisionItems;
      case 'section':     return sectionItems;
      default:            return tkGroupItems;
    }
  };

  const currentItems    = getCurrentItems();
  const filteredGroups  = currentItems.filter(item =>
    item.code.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(groupSearchTerm.toLowerCase())
  );
  const totalGroupPages = Math.ceil(filteredGroups.length / ITEMS_PER_PAGE);
  const startGroupIdx   = (groupPage - 1) * ITEMS_PER_PAGE;
  const paginatedGroups = filteredGroups.slice(startGroupIdx, startGroupIdx + ITEMS_PER_PAGE);

  // ── Client-side employee filter (status + selected tab group codes) ────────
  const selectedCodes = new Set(
    currentItems.filter(i => selectedIds.includes(i.id)).map(i => i.code)
  );

  const filteredEmployees: EmployeeItem[] = employeeItems.filter(emp => {
    if (selectedIds.length === 0) return true;
    switch (activeTab) {
      case 'tk-group':    return selectedCodes.has(emp.tkGroup);
      case 'branch':      return selectedCodes.has(emp.branchCode);
      case 'department':  return selectedCodes.has(emp.departmentCode);
      case 'designation': return selectedCodes.has(emp.groupScheduleCode);
      case 'division':    return selectedCodes.has(emp.divisionCode);
      case 'section':     return selectedCodes.has(emp.sectionCode);
      default:            return true;
    }
  });

  // Map to the shape expected by EmployeeSearchModal
  const modalEmployees = filteredEmployees.map(emp => ({
    empCode:   emp.code,
    name:      emp.name,
    groupCode: emp.tkGroup,
  }));

  // ── Group selection handlers ───────────────────────────────────────────────
  const handleItemToggle = (id: number) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleSelectAll = () => {
    const allIds = filteredGroups.map(r => r.id);
    setSelectedIds(prev => prev.length === allIds.length ? [] : allIds);
  };

  // ── Report filter payloads ─────────────────────────────────────────────────
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : '-';

  const baseFilter: ReportFilter = {
    empCode,
    dateFr:            formatDate(dateFrom),
    dateTo:            formatDate(dateTo),
    groups:            idsToCodeList(selectedMap['tk-group'],    tkGroupItems),
    departments:       idsToCodeList(selectedMap['department'],  departmentItems),
    divisions:         idsToCodeList(selectedMap['division'],    divisionItems),
    branch:            idsToCodeList(selectedMap['branch'],      branchItems),
    designation:       idsToCodeList(selectedMap['designation'], designationItems),
    section:           idsToCodeList(selectedMap['section'],     sectionItems),
    company:           '',
    address:           '',
    userName:          '128TCI',
    mode:              dataMode,
    activeInActiveAll: empStatus,
  };

  const leaveAbsenceFilter: LeaveAbsencesFilter = {
    empCode,
    dateFr:          formatDate(dateFrom),
    dateTo:          formatDate(dateTo),
    groups:          idsToCodeList(selectedMap['tk-group'],    tkGroupItems),
    departments:     idsToCodeList(selectedMap['department'],  departmentItems),
    divisions:       idsToCodeList(selectedMap['division'],    divisionItems),
    branch:          idsToCodeList(selectedMap['branch'],      branchItems),
    designation:     idsToCodeList(selectedMap['designation'], designationItems),
    section:         idsToCodeList(selectedMap['section'],     sectionItems),
    company:         '',
    address:         '',
    leaveType:       selectedLeaveType,
    leaveWithOrWPay: withOrWOutPay,
    includeLeaveAdj,
    status,
    mode,
  };

  // ── Download helpers ───────────────────────────────────────────────────────
  const showDownloading = () => Swal.fire({
    icon: 'info', title: 'Downloading',
    text: 'Please wait while your file is being downloaded.',
    showConfirmButton: false, allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  const downloadBlob = async (endpoint: string, fileName: string, query: string) => {
    showDownloading();
    const res = await apiClient.get(`${endpoint}?${query}`, { responseType: 'blob' });
    triggerDownload(new Blob([res.data], { type: res.headers['content-type'] }), fileName);
    Swal.fire({ icon: 'success', title: 'Done', text: 'Download Successful!', timer: 2000, showConfirmButton: false });
  };

  const printReport = async () => {
    try {
      if (reportType === 'Leave And Absences') {
        const { endpoint, fileName } = LEAVE_MODE_MAP[mode];
        return await downloadBlob(endpoint, fileName, toQueryParams(leaveAbsenceFilter));
      }
      if (reportType === 'Man Hours') {
        const { endpoint, fileName } = MAN_HOURS_MAP[hrsOptions];
        return await downloadBlob(endpoint, fileName, toQueryParams(baseFilter));
      }
      const entry = REPORT_MAP[reportType];
      if (entry) return await downloadBlob(entry.endpoint, entry.fileName, toQueryParams(baseFilter));
      Swal.fire({ icon: 'error', title: 'Error', text: 'No Report Found.' });
    } catch (err) {
      console.error('Report download failed', err);
    }
  };

  // ── Render helpers ─────────────────────────────────────────────────────────
  const renderGroupTable = () => (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-center w-12">
              <input
                type="checkbox"
                checked={selectedIds.length === filteredGroups.length && filteredGroups.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
            </th>
            <th className="px-4 py-3 text-left text-gray-700">Code</th>
            <th className="px-4 py-3 text-left text-gray-700">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {paginatedGroups.map(item => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => handleItemToggle(item.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
              </td>
              <td className="px-4 py-3 text-gray-900">{item.code}</td>
              <td className="px-4 py-3 text-gray-600">{item.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPagination = () => {
    if (totalGroupPages === 0) return null;
    return (
      <div className="flex items-center justify-between mt-3">
        <span className="text-gray-600 text-xs">
          Showing {filteredGroups.length === 0 ? 0 : startGroupIdx + 1} to{' '}
          {Math.min(startGroupIdx + ITEMS_PER_PAGE, filteredGroups.length)} of {filteredGroups.length} entries
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setGroupPage(p => Math.max(p - 1, 1))}
            disabled={groupPage === 1}
            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {getPageNumbers(groupPage, totalGroupPages).map((page, idx) =>
            page === '...' ? (
              <span key={`e-${idx}`} className="px-1 text-gray-500 text-xs">...</span>
            ) : (
              <button
                key={page}
                onClick={() => setGroupPage(page as number)}
                className={`px-2 py-1 rounded text-xs ${
                  groupPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            )
          )}
          <button
            onClick={() => setGroupPage(p => Math.min(p + 1, totalGroupPages))}
            disabled={groupPage === totalGroupPages}
            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  // ── Report view ────────────────────────────────────────────────────────────
  if (showReport) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 relative z-10 p-6">
          <div className="max-w-7xl mx-auto relative">
            <div className="flex items-center justify-between mb-6 print:hidden">
              <button
                onClick={() => setShowReport(false)}
                className="px-6 py-3 bg-yellow-500 text-gray-700 rounded-xl hover:bg-yellow-600 transition-colors"
              >
                ← Back to Filters
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Printer className="w-5 h-5" />
                <span>Print Report</span>
              </button>
            </div>
            <div className="bg-white shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-6">
                <h1 className="text-gray-900 mb-2">Daily Time Report</h1>
                <p className="text-gray-600">Period From Mar 01, 2020 to Mar 15, 2020</p>
              </div>
              <div className="border-t-4 border-black mb-6" />
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="px-2 py-2 text-left w-10">Seq. No.</th>
                    <th className="px-2 py-2 text-left w-20">EmpCode</th>
                    <th className="px-2 py-2 text-left w-48">Full Name</th>
                    <th className="px-2 py-2 text-center w-24">IN</th>
                    <th className="px-2 py-2 text-center w-24">OUT</th>
                    <th className="px-2 py-2 text-center w-28">Work Shift</th>
                    <th className="px-2 py-2 text-right w-20">No of Hrs</th>
                    <th className="px-2 py-2 text-right w-20">Tardiness</th>
                    <th className="px-2 py-2 text-right w-20">Undertime</th>
                    <th className="px-2 py-2 text-right w-20">Absences</th>
                    <th className="px-2 py-2 text-right w-20">Leave With Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_REPORT_DATA.map(employee => (
                    <React.Fragment key={employee.empCode}>
                      <tr className="bg-gray-100">
                        <td className="px-2 py-2 align-top">{employee.seqNo}.</td>
                        <td className="px-2 py-2 align-top">{employee.empCode}</td>
                        <td className="px-2 py-2 align-top" colSpan={9}>{employee.fullName}</td>
                      </tr>
                      {employee.dailyRecords.map((record, idx) => (
                        <tr key={idx} className={record.restDay ? 'bg-gray-50' : ''}>
                          <td className="px-2 py-1" />
                          <td className="px-2 py-1 text-xs">{record.date}</td>
                          <td className="px-2 py-1 text-xs">{record.day}</td>
                          <td className="px-2 py-1 text-xs text-center">{record.timeIn}</td>
                          <td className="px-2 py-1 text-xs text-center">{record.timeOut}</td>
                          <td className="px-2 py-1 text-xs text-center">{record.workShift}</td>
                          <td className="px-2 py-1 text-xs text-right">{record.noOfHrs}</td>
                          <td className="px-2 py-1 text-xs text-right">{record.tardiness}</td>
                          <td className="px-2 py-1 text-xs text-right">{record.undertime}</td>
                          <td className="px-2 py-1 text-xs text-right">{record.absences}</td>
                          <td className="px-2 py-1 text-xs text-right">{record.leaveWithPay}</td>
                        </tr>
                      ))}
                      <tr className="border-t border-gray-300 bg-gray-200">
                        <td className="px-2 py-2 text-right" colSpan={6}>Subtotal:</td>
                        <td className="px-2 py-2 text-right">{employee.subtotal.noOfHrs}</td>
                        <td className="px-2 py-2 text-right">{employee.subtotal.tardiness}</td>
                        <td className="px-2 py-2 text-right">{employee.subtotal.undertime}</td>
                        <td className="px-2 py-2 text-right">{employee.subtotal.absences}</td>
                        <td className="px-2 py-2 text-right">{employee.subtotal.leaveWithPay}</td>
                      </tr>
                      <tr className="h-4" />
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Main view ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">

          {/* Page Header */}
          <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 border-l-4 border-blue-500 rounded-lg p-4">
            <h1 className="text-white">Daily Time Record Monitoring</h1>
          </div>

          <div className="bg-white rounded-b-lg shadow-lg p-6">

            {/* Info Banner */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-3">
                    Monitor and generate daily time record reports for employees. Filter by date range, employee status, and organizational groups.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {['Filter by date range', 'Export to Excel format', 'Multiple report types', 'Print ready reports'].map(text => (
                      <div key={text} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* ── Left Panel ─────────────────────────────────────────────── */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-gray-900 mb-6">Date Range</h3>

                  {/* Date From */}
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm mb-2">Date From</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="MM/DD/YYYY"
                        />
                      </div>
                      <CalendarPopover date={dateFrom} onChange={setDateFrom} />
                    </div>
                  </div>

                  {/* Date To */}
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm mb-2">Date To</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text" value={dateTo} onChange={e => setDateTo(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="MM/DD/YYYY"
                        />
                      </div>
                      <CalendarPopover date={dateTo} onChange={setDateTo} />
                    </div>
                  </div>

                  {/* Sort Alphabetically */}
                  <div className="mb-6">
                    <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox" checked={sortAlphabetically}
                        onChange={e => setSortAlphabetically(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">Sort Alphabetically</span>
                    </label>
                  </div>

                  {/* Employee Status */}
                  <div className="mb-6 space-y-2">
                    {(['Active', 'InActive', 'All'] as StatusType[]).map(s => (
                      <label key={s} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                        <input
                          type="radio" name="empStatus" value={s}
                          checked={empStatus === s} onChange={() => setEmpStatus(s)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{s === 'InActive' ? 'In Active' : s}</span>
                      </label>
                    ))}
                  </div>

                  {/* Employee Code */}
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Employee Code</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text" value={empCode} readOnly
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        placeholder="Enter employee code"
                      />
                      <button
                        onClick={() => setShowSearchModal(true)}
                        className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Search className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => { setEmpCode(''); setEmpName(''); }}
                        className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    {empCode && (
                      <p className="mt-2 text-sm text-gray-600">Employee Name: {empName}</p>
                    )}
                  </div>

                  {/* Report Type */}
                  <div className="mb-6">
                    <select
                      value={reportType} onChange={e => setReportType(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 appearance-none cursor-pointer"
                    >
                      {[
                        'Accumulation', 'Adjustment', 'Allowance', 'Application Report', 'Assumed Days',
                        'Attendance Ratio', 'Attendance Summary', 'Consecutive Absences',
                        'Count Of Employee Per Workshift', 'Daily Time', 'Device Code Report',
                        'Employees Raw Data Report', 'Employees Raw In And Out (From Update Rawdata)',
                        'Employees With No Workshift', 'Exemption Report', 'In And Out By Position',
                        'Leave And Absences', 'Man Hours',
                        'Man Hours By Division-Branch-Category-Dept-Section', 'No In And Out',
                        'Overtime', 'Perfect Attendance', 'Questionable Entries', 'Questionable Workshifts',
                        'Restday in a Week', 'Tardiness', 'Tardiness/ Overbreak/ Undertime Violation',
                        'Tardiness And Undertime Report', 'Tardiness Penalty', 'Timesheet',
                        'Unauthorized Absences', 'Undertime', 'User Group Access', 'User TK Group Access',
                      ].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  {/* Convert to HH:MM */}
                  {REPORT_TYPES_WITH_HHMM.includes(reportType) && (
                    <label className="flex items-center space-x-3 p-3 mb-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox" checked={convertToHHMM}
                        onChange={e => setConvertToHHMM(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">Convert To HH:MM</span>
                    </label>
                  )}

                  {/* Man Hours options */}
                  {reportType === 'Man Hours' && (
                    <div className="mb-4">
                      <span className="text-sm text-gray-700">Options</span>
                      <div className="mt-2 flex items-center gap-4">
                        {(['Per Employee', 'Summary'] as HrsOptionType[]).map(o => (
                          <label key={o} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio" name="hrsOption" value={o}
                              checked={hrsOptions === o} onChange={() => setHrsOptions(o)}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{o}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Raw Data Type */}
                  {reportType === 'Employees Raw Data Report' && (
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm mb-2">Raw Data Type:</label>
                      <select
                        value={dataMode} onChange={e => setDataMode(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="CompleteLogs">Complete Logs</option>
                        <option value="IncompleteLogs">Incomplete Logs</option>
                      </select>
                    </div>
                  )}

                  {/* Leave And Absences options */}
                  {reportType === 'Leave And Absences' && (
                    <>
                      <label className="flex items-center space-x-3 p-3 mb-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                        <input
                          type="checkbox" checked={includeLeaveAdj}
                          onChange={e => setIncludeLeaveAdj(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">Include Leave Adjustment</span>
                      </label>

                      <div className="mb-4">
                        <span className="text-sm text-gray-700">Status</span>
                        <div className="mt-2 flex items-center gap-4">
                          {(['Active', 'InActive', 'All'] as StatusType[]).map(s => (
                            <label key={s} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio" name="leaveStatus" value={s}
                                checked={status === s} onChange={() => setStatus(s)}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{s === 'InActive' ? 'In Active' : s}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className="text-sm text-gray-700">Options</span>
                        <div className="mt-2 flex items-center gap-4">
                          {(['Absences', 'Leave', 'All'] as ModeType[]).map(m => (
                            <label key={m} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio" name="leaveMode" value={m}
                                checked={mode === m} onChange={() => setMode(m)}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{m}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {mode === 'Leave' && (
                        <>
                          <div className="mb-4">
                            <label className="block text-gray-700 text-sm mb-2">Leave Type:</label>
                            <select
                              value={selectedLeaveType} onChange={e => setSelectedLeaveType(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              <option value="" />
                              {leaveTypes.map(lt => (
                                <option key={lt.leaveCode} value={lt.leaveCode}>{lt.leaveDesc}</option>
                              ))}
                            </select>
                          </div>
                          <div className="mb-4 flex items-center gap-4">
                            {(['WithPay', 'WithOutPay', 'All'] as PayType[]).map(p => (
                              <label key={p} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio" name="wPay" value={p}
                                  checked={withOrWOutPay === p} onChange={() => setWithOrWOutPay(p)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                  {p === 'WithPay' ? 'With Pay' : p === 'WithOutPay' ? 'Without Pay' : 'All'}
                                </span>
                              </label>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {/* Download Button */}
                  <button
                    onClick={printReport}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg shadow-blue-500/30"
                  >
                    Download Report
                  </button>
                </div>
              </div>

              {/* ── Right Panel ────────────────────────────────────────────── */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                  {/* Tabs */}
                  <div className="flex items-center gap-1 border-b border-gray-200 flex-wrap p-6 pb-0">
                    {TABS.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm flex items-center gap-2 rounded-t-lg transition-colors ${
                          activeTab === tab.id
                            ? 'font-medium bg-blue-600 text-white -mb-px'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Table + Search + Pagination */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <label className="text-sm text-gray-700">Search:</label>
                      <input
                        type="text" value={groupSearchTerm}
                        onChange={e => setGroupSearchTerm(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search..."
                      />
                    </div>
                    {renderGroupTable()}
                    {renderPagination()}
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Employee Search Modal */}
      <EmployeeSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelect={(code, name) => { setEmpCode(code); setEmpName(name); }}
        employees={modalEmployees}
        loading={loadingEmployees}
        error={employeeError}
      />

      <Footer />
    </div>
  );
}
