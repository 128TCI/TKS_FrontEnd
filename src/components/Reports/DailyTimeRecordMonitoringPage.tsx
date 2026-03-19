import { useState, useEffect } from 'react';
import { Calendar, Search, X, Check, Clock, Users, Building2, Briefcase, Award, Network, Grid } from 'lucide-react';
import { CalendarPopover } from '../CalendarPopover';
import apiClient, { getLoggedInUsername } from '../../services/apiClient';
import { Footer } from '../Footer/Footer';
import Swal from 'sweetalert2';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabType = 'tk-group' | 'branch' | 'department' | 'designation' | 'division' | 'section';

interface GroupItem {
  id: number;
  code: string;
  description: string;
}

interface Employee {
  empID: number;
  empCode: string;
  lName: string;
  fName: string;
  mName: string;
  suffix: string;
}

interface UserGroup {
  groupID: number;
  groupName: string;
  groupDesc: string;
}

interface WorkShift {
  workShiftID: number;
  workShiftCode: string;
  workShiftDesc: string;
}

interface LeaveType {
  leaveID: number;
  leaveCode: string;
  leaveDesc: string;
}

interface ReportFilter {
  empCode: string;
  dateFr: string;
  dateTo: string;
  groups: string[];
  departments: string[];
  divisions: string[];
  branch: string[];
  designation: string[];
  section: string[];
  company: string | null;
  address: string | null;
  userName: string;
  mode: string;
  activeInActiveAll: string;
  include: boolean;
  option: number;
  consecutiveAbsences: number;
  yearsOfService: number;
  minutes: number;
  weekName: string;
  dayType: string;
  noOfFilter: number;
  userGroup: string;
  includeWithPay: boolean;
  includeWithoutPay: boolean;
  otCode: string[];
  workShiftCode: string;
  instance: number;
  instanceCount: number;
  instanceMinutes: number;
  optionTardy: number;
  sortAlphabetically: boolean;
  convertToHHMM: boolean;
}

interface TardinessFilter {
  empCode: string;
  year: number;
  month: number;
  cutOffDateFrom: string;
  cutOffDateTo: string;
  groups: string[];
  departments: string[];
  divisions: string[];
  branch: string[];
  designation: string[];
  section: string[];
  activeInActiveAll: string;
  sortAlphabetically: boolean;
}

interface ExemptionReportFilter {
  empCode: string;
  groups: string[];
  departments: string[];
  divisions: string[];
  branch: string[];
  designation: string[];
  section: string[];
  tardiness: boolean;
  undertime: boolean;
  nightDiffBasic: boolean;
  overtime: boolean;
  absences: boolean;
  otherEarnAllow: boolean;
  holidayPay: boolean;
  activeInActiveAll: string;
  sortAlphabetically: boolean;
}

interface IncompleteLogsFilter {
  empCode: string;
  dateFr: string;
  dateTo: string;
  groups: string[];
  departments: string[];
  divisions: string[];
  branch: string[];
  company: string;
  address: string;
  designation: string[];
  section: string[];
  logs: boolean;
  break1: boolean;
  break2: boolean;
  break3: boolean;
  activeInActiveAll: string;
  sortAlphabetically: boolean;
}

interface LeaveAbsencesFilter {
  empCode: string;
  dateFr: string;
  dateTo: string;
  groups: string[];
  departments: string[];
  divisions: string[];
  branch: string[];
  designation: string[];
  section: string[];
  company: string | null;
  address: string | null;
  leaveType: string | null;
  leaveWithOrWPay: string;
  includeLeaveAdj: boolean;
  status: string;
  mode: string;
  sortAlphabetically: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function toCSV(arr: string[]) {
  return arr.length === 0 ? [] : arr.toLocaleString().split(',');
}

const ITEMS_PER_PAGE = 10;

function paginate<T>(arr: T[], page: number): T[] {
  return arr.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
}

function buildPageNumbers(total: number, current: number): (number | '...')[] {
  const pages: (number | '...')[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push('...'); pages.push(total);
  } else if (current >= total - 3) {
    pages.push(1); pages.push('...');
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1); pages.push('...');
    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
    pages.push('...'); pages.push(total);
  }
  return pages;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface PaginationProps {
  total: number;
  current: number;
  onChange: (p: number) => void;
  startIdx: number;
  endIdx: number;
}

function Pagination({ total, current, onChange, startIdx, endIdx }: PaginationProps) {
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  return (
    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
      <span>Showing {total === 0 ? 0 : startIdx + 1} to {Math.min(endIdx, total)} of {total} entries</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(Math.max(1, current - 1))} disabled={current === 1}
          className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
          Previous
        </button>
        {buildPageNumbers(totalPages, current).map((page, idx) =>
          page === '...' ? (
            <span key={`e-${idx}`} className="px-2">...</span>
          ) : (
            <button key={page} onClick={() => onChange(page as number)}
              className={`px-2 py-1 rounded ${current === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>
              {page}
            </button>
          )
        )}
        <button onClick={() => onChange(Math.min(totalPages, current + 1))} disabled={current === totalPages || totalPages === 0}
          className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
          Next
        </button>
      </div>
    </div>
  );
}

interface SearchModalProps {
  title: string;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  onClose: () => void;
  children: React.ReactNode;
  pagination?: React.ReactNode;
}

function SearchModal({ title, searchTerm, onSearchChange, onClose, children, pagination }: SearchModalProps) {
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-30" onClick={onClose} />
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl border border-gray-300 min-w-[500px]">
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <h2 className="text-gray-800 text-sm font-medium">{title}</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <label className="text-gray-700 text-sm shrink-0">Search:</label>
              <input type="text" value={searchTerm} onChange={e => onSearchChange(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div className="border border-gray-200 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {children}
            </div>
            {pagination}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Report config ─────────────────────────────────────────────────────────────
// Maps report conditions to { endpoint, filename }

interface ReportEndpoint {
  endpoint: string;
  filename: string;
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function DailyTimeRecordMonitoringPage() {

  // Date
  const [dateFrom, setDateFrom] = useState('05/15/2021');
  const [dateTo, setDateTo] = useState('05/31/2021');

  // Employee
  const [empCode, setEmpCode] = useState('');
  const [empName, setEmpName] = useState('');

  // User Group
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');

  // Workshift
  const [workShiftCode, setWorkshiftCode] = useState('');
  const [workShiftDesc, setWorkshiftDesc] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('tk-group');

  // Selections
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedBranchItems, setSelectedBranchItems] = useState<string[]>([]);
  const [selectedDepItems, setSelectedDepItems] = useState<string[]>([]);
  const [selectedDesItems, setSelectedDesItems] = useState<string[]>([]);
  const [selectedDivItems, setSelectedDivItems] = useState<string[]>([]);
  const [selectedSecItems, setSelectedSecItems] = useState<string[]>([]);
  const [selectedOTItems, setSelectedOTItems] = useState<string[]>([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState('');

  // Pagination
  const [currentGroupPage, setCurrentGroupPage] = useState(1);
  const [currentBranchPage, setCurrentBranchPage] = useState(1);
  const [currentDepPage, setCurrentDepPage] = useState(1);
  const [currentDesPage, setCurrentDesPage] = useState(1);
  const [currentDivPage, setCurrentDivPage] = useState(1);
  const [currentSecPage, setCurrentSecPage] = useState(1);
  const [currentEmpPage, setCurrentEmpPage] = useState(1);
  const [currentOTPage, setCurrentOTPage] = useState(1);
  const [currentUserGroupPage, setCurrentUserGroupPage] = useState(1);
  const [currentWorkshiftPage, setCurrentWorkshiftPage] = useState(1);

  // Search terms
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [userGroupSearchTerm, setUserGroupSearchTerm] = useState('');
  const [workShiftSearchTerm, setWorkshiftSearchTerm] = useState('');
  const [overtimeSearchTerm, setOvertimeSearchTerm] = useState('');

  // Modals
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showGroupSearchModal, setShowGroupSearchModal] = useState(false);
  const [showShiftSearchModal, setShowShiftSearchModal] = useState(false);
  const [showOvertimeSearchModal, setShowOvertimeSearchModal] = useState(false);

  // Report options
  const [reportType, setReportType] = useState('Accumulation');
  const [sortAlphabetically, setSortAlphabetically] = useState(false);
  const [convertToHHMM, setConvertToHHMM] = useState(false);
  const [convertToRawData, setConvertToRawData] = useState(false);
  const [convertLeaveToRawData, setConvertLeaveToRawData] = useState(false);
  const [includeWPay, setIncludeWPay] = useState(false);
  const [includeWOutPay, setIncludeWOutPay] = useState(false);
  const [utRawData, setUTRawData] = useState(false);
  const [includeLeaveAdj, setIncludeLeaveAdj] = useState(false);
  const [include, setInclude] = useState(false);

  // Statuses / Modes
  const [empStatus, setEmpStatus] = useState<'Active' | 'InActive' | 'All'>('Active');
  const [status, setStatus] = useState<'Active' | 'InActive' | 'All'>('All');
  const [mode, setMode] = useState<'Absences' | 'Leave' | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState('');
  const [withOrWOutPay, setWithOrWOutPay] = useState<'WithPay' | 'WithOutPay' | 'All'>('All');

  // Sub-options
  const [hrsOptions, setHrsOptions] = useState<'Per Employee' | 'Summary'>('Per Employee');
  const [tardyOptions, setTardyOptions] = useState<'Month' | 'Per Department' | 'Annual'>('Month');
  const [tardinessOptions, setTardinessOptions] = useState<'Listing' | 'Periodic'>('Listing');
  const [rawDataOptions, setRawDataOptions] = useState<'Actual' | 'Policy'>('Actual');
  const [rawDataLeaveOptions, setRawDataLeaveOptions] = useState<'Policy' | 'Actual'>('Policy');
  const [periodOptions, setPeriodOptions] = useState<number>(1);
  const [instanceOptions, setInstanceOptions] = useState<number>(0);
  const [otOptions, setOTOptions] = useState<'Listing' | 'Summary'>('Listing');
  const [utOptions, setUTOptions] = useState<'Policy' | 'ActualTime'>('Policy');
  const [empShiftOptions, setEmpShiftOptions] = useState<'Count' | 'Listing'>('Count');
  const [noShiftOptions, setNoShiftOptions] = useState<number>(1);
  const [dataMode, setDataMode] = useState('CompleteLogs');
  const [appMode, setAppMode] = useState('OvertimeApplication');

  // Number inputs
  const [yearsOfService, setYearsOfService] = useState('');
  const [noOfConsecutiveAbsences, setNoOfConsecutiveAbsences] = useState('');
  const [minutes, setMinutes] = useState('');
  const [weekName, setWeekName] = useState('');
  const [noOfFilter, setNoOfFilter] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [instanceNum, setInstanceNum] = useState('');
  const [minutesNum, setMinutesNum] = useState('');

  // Checkbox groups
  const [processOptions, setProcessOptions] = useState({
    tardiness: false, undertime: false, nightDiffBasic: false,
    overtime: false, absences: false, selectAll: false,
    otherEarnAllowances: false, holidayPay: false,
  });

  const [logsOptions, setLogsOptions] = useState({
    incompleteLogs: false, logs: false, break1: false, break2: false, break3: false,
  });

  // Data
  const [getLeaveType, setGetLeaveType] = useState<LeaveType[]>([]);
  const [getEmployee, setGetEmployee] = useState<Employee[]>([]);
  const [getUserGroup, setGetUserGroup] = useState<UserGroup[]>([]);
  const [getWorkShift, setGetWorkShift] = useState<WorkShift[]>([]);
  const [tkGroupItems, setTKSGroupItems] = useState<GroupItem[]>([]);
  const [branchItems, setBranchItems] = useState<GroupItem[]>([]);
  const [departmentItems, setDepartmentItems] = useState<GroupItem[]>([]);
  const [designationItems, setDesignationItems] = useState<GroupItem[]>([]);
  const [divisionItems, setDivisionItems] = useState<GroupItem[]>([]);
  const [sectionItems, setSectionItems] = useState<GroupItem[]>([]);
  const [overtimeItems, setOvertimeItems] = useState<GroupItem[]>([]);

  // ─── Fetch helpers ──────────────────────────────────────────────────────────

  const fetchGroupItems = async (url: string, mapFn: (item: any) => GroupItem): Promise<GroupItem[]> => {
    const res = await apiClient.get(url);
    return res.data.map(mapFn);
  };

  useEffect(() => {
    fetchGroupItems('/Fs/Process/TimeKeepGroupSetUp', item => ({
      id: item.ID || item.id,
      code: item.groupCode || item.code,
      description: item.groupDescription || item.description,
    })).then(setTKSGroupItems);
  }, []);

  useEffect(() => {
    fetchGroupItems('/Fs/Employment/BranchSetUp', item => ({
      id: item.braID || item.ID,
      code: item.braCode || item.code,
      description: item.braDesc || item.description,
    })).then(setBranchItems);
  }, []);

  useEffect(() => {
    fetchGroupItems('/Fs/Employment/DepartmentSetUp', item => ({
      id: item.depID || item.ID,
      code: item.depCode || item.code,
      description: item.depDesc || item.description,
    })).then(setDepartmentItems);
  }, []);

  useEffect(() => {
    fetchGroupItems('/Fs/Employment/DesignationSetUp', item => ({
      id: item.desID || item.ID,
      code: item.desCode || item.code,
      description: item.desDesc || item.description,
    })).then(setDesignationItems);
  }, []);

  useEffect(() => {
    fetchGroupItems('/Fs/Employment/DivisionSetUp', item => ({
      id: item.divID || item.ID,
      code: item.divCode || item.code,
      description: item.divDesc || item.description,
    })).then(setDivisionItems);
  }, []);

  useEffect(() => {
    fetchGroupItems('/Fs/Employment/SectionSetUp', item => ({
      id: item.secID || item.ID,
      code: item.secCode || item.code,
      description: item.secDesc || item.description,
    })).then(setSectionItems);
  }, []);

  useEffect(() => {
    fetchGroupItems('/Fs/Process/Overtime/OverTimeFileSetUp', item => ({
      id: item.otfid || item.OTFID || '',
      code: item.otfCode || item.OTFCode,
      description: item.description || item.Description,
    })).then(setOvertimeItems);
  }, []);

  useEffect(() => {
    apiClient.get(`/Maintenance/EmployeeMasterFile/GetActive?active=${filterStatus}`)
      .then(res => setGetEmployee(res.data.map((e: any) => ({
        empID: e.empID || e.EmpID || '',
        empCode: e.empCode || e.EmpCode || '',
        lName: e.lName || e.LName || '',
        fName: e.fName || e.FName || '',
        mName: e.mName || e.MName || '',
        suffix: e.suffix || e.Suffix || '',
      })))
      ).catch(console.error);
  }, [filterStatus]);

  useEffect(() => {
    apiClient.get('/UserGroupAccessReport/GetTKUserGroup')
      .then(res => setGetUserGroup(res.data.map((g: any) => ({
        groupID: g.groupID || g.GroupID || '',
        groupName: g.groupName || g.GroupName || '',
        groupDesc: g.groupDesc || g.GroupDesc || '',
      })))).catch(console.error);
  }, []);

  useEffect(() => {
    apiClient.get('/CountEmployeePerShift/GetTKWorkShift')
      .then(res => setGetWorkShift(res.data.map((w: any) => ({
        workShiftID: w.workShiftID || w.WorkShiftID || '',
        workShiftCode: w.workShiftCode || w.WorkShiftCode || '',
        workShiftDesc: w.workShiftDesc || w.WorkShiftDesc || '',
      })))).catch(console.error);
  }, []);

  useEffect(() => {
    apiClient.get('/Fs/Process/LeaveTypeSetUp')
      .then(res => setGetLeaveType(res.data.map((l: any) => ({
        leaveID: l.leaveID || l.ID || '',
        leaveCode: l.leaveCode || l.LeaveCode || '',
        leaveDesc: l.leaveDesc || l.LeaveDesc || '',
      })))).catch(console.error);
  }, []);

  // ─── Escape key ────────────────────────────────────────────────────────────

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSearchModal(false);
        setShowGroupSearchModal(false);
        setShowShiftSearchModal(false);
        setShowOvertimeSearchModal(false);
      }
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, []);

  // ─── Filter builders ───────────────────────────────────────────────────────

  const buildBaseFilter = (): ReportFilter => ({
    empCode: empCode,
    dateFr: dateFrom ? new Date(dateFrom).toLocaleDateString() : '-',
    dateTo: dateTo ? new Date(dateTo).toLocaleDateString() : '-',
    groups: toCSV(selectedItems),
    departments: toCSV(selectedDepItems),
    divisions: toCSV(selectedDivItems),
    branch: toCSV(selectedBranchItems),
    designation: toCSV(selectedDesItems),
    section: toCSV(selectedSecItems),
    company: '', address: '',
    userName: getLoggedInUsername(),
    mode: dataMode,
    activeInActiveAll: empStatus,
    include: include,
    option: noShiftOptions,
    consecutiveAbsences: Number(noOfConsecutiveAbsences),
    yearsOfService: Number(yearsOfService),
    minutes: Number(minutes),
    weekName: weekName, dayType: '',
    noOfFilter: Number(noOfFilter),
    userGroup: groupName,
    includeWithPay: includeWPay,
    includeWithoutPay: includeWOutPay,
    otCode: toCSV(selectedOTItems),
    workShiftCode: workShiftCode,
    instance: instanceOptions,
    instanceCount: Number(instanceNum),
    instanceMinutes: Number(minutesNum),
    optionTardy: periodOptions,
    sortAlphabetically: sortAlphabetically,
    convertToHHMM: convertToHHMM,
  });

  const buildTardyFilter = (): TardinessFilter => ({
    empCode, year: Number(year), month: Number(month),
    cutOffDateFrom: dateFrom ? new Date(dateFrom).toLocaleDateString() : '-',
    cutOffDateTo: dateTo ? new Date(dateTo).toLocaleDateString() : '-',
    groups: toCSV(selectedItems),
    departments: toCSV(selectedDepItems),
    divisions: toCSV(selectedDivItems),
    branch: toCSV(selectedBranchItems),
    designation: toCSV(selectedDesItems),
    section: toCSV(selectedSecItems),
    activeInActiveAll: empStatus,
    sortAlphabetically: sortAlphabetically,
  });

  const buildExempFilter = (): ExemptionReportFilter => ({
    empCode: empCode,
    groups: toCSV(selectedItems),
    departments: toCSV(selectedDepItems),
    divisions: toCSV(selectedDivItems),
    branch: toCSV(selectedBranchItems),
    designation: toCSV(selectedDesItems),
    section: toCSV(selectedSecItems),
    tardiness: processOptions.tardiness,
    undertime: processOptions.undertime,
    nightDiffBasic: processOptions.nightDiffBasic,
    overtime: processOptions.overtime,
    absences: processOptions.absences,
    otherEarnAllow: processOptions.otherEarnAllowances,
    holidayPay: processOptions.holidayPay,
    activeInActiveAll: empStatus,
    sortAlphabetically: sortAlphabetically,
  });

  const buildIncLogsFilter = (): IncompleteLogsFilter => ({
    empCode: empCode,
    dateFr: dateFrom ? new Date(dateFrom).toLocaleDateString() : '-',
    dateTo: dateTo ? new Date(dateTo).toLocaleDateString() : '-',
    groups: toCSV(selectedItems),
    departments: toCSV(selectedDepItems),
    divisions: toCSV(selectedDivItems),
    branch: toCSV(selectedBranchItems),
    company: '', address: '',
    designation: toCSV(selectedDesItems),
    section: toCSV(selectedSecItems),
    logs: logsOptions.logs,
    break1: logsOptions.break1,
    break2: logsOptions.break2,
    break3: logsOptions.break3,
    activeInActiveAll: empStatus,
    sortAlphabetically,
  });

  const buildLeaveAbsenceFilter = (): LeaveAbsencesFilter => ({
    empCode: empCode,
    dateFr: dateFrom ? new Date(dateFrom).toLocaleDateString() : '-',
    dateTo: dateTo ? new Date(dateTo).toLocaleDateString() : '-',
    groups: toCSV(selectedItems),
    departments: toCSV(selectedDepItems),
    divisions: toCSV(selectedDivItems),
    branch: toCSV(selectedBranchItems),
    designation: toCSV(selectedDesItems),
    section: toCSV(selectedSecItems),
    company: '', address: '',
    leaveType: selectedLeaveType,
    leaveWithOrWPay: withOrWOutPay,
    includeLeaveAdj: includeLeaveAdj,
    status: status,
    mode: mode,
    sortAlphabetically: sortAlphabetically,
  });

  // ─── Download helper ───────────────────────────────────────────────────────

  const downloadReport = async (endpoint: string, filename: string, query: string) => {
    Swal.fire({
      icon: 'info', title: 'Downloading',
      text: 'Please wait while your file is being downloaded.',
      showConfirmButton: false, allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      const response = await apiClient.get(`${endpoint}?${query}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = filename;
      document.body.appendChild(link); link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      Swal.fire({ icon: 'success', title: 'Done', text: 'Download Successful!', timer: 2000, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Download failed.' });
    }
  };

  // ─── Print report ──────────────────────────────────────────────────────────

  const printReport = async () => {
    const f = buildBaseFilter();
    const tf = buildTardyFilter();
    const ef = buildExempFilter();
    const incF = buildIncLogsFilter();
    const lvF = buildLeaveAbsenceFilter();
    const q = toQueryParams(f);
    const tq = toQueryParams(tf);
    const eq = toQueryParams(ef);
    const iq = toQueryParams(incF);
    const lq = toQueryParams(lvF);

    // All report branches defined declaratively
    const branches: Array<{ condition: boolean; endpoint: string; filename: string; query: string }> = [
      { condition: reportType === 'Accumulation', endpoint: '/AccumulationReport/PrintAccumulationReport', filename: 'AccumulationReport.xlsx', query: q },
      { condition: reportType === 'Adjustment', endpoint: '/AdjustmentReport/PrintAdjustment', filename: 'AdjustmentReport.xlsx', query: q },
      { condition: reportType === 'Allowance', endpoint: '/AllowanceReport/PrintAllowanceReport', filename: 'AllowanceReport.xlsx', query: q },
      { condition: reportType === 'Application Report' && appMode === 'OvertimeApplication', endpoint: '/ApplicationReport/PrintOTApplicationReport', filename: 'OvertimeApplicationReport.xlsx', query: q },
      { condition: reportType === 'Application Report' && appMode === 'LeaveApplication', endpoint: '/ApplicationReport/PrintLeaveApplicationReport', filename: 'LeaveApplicationReport.xlsx', query: q },
      { condition: reportType === 'Assumed Days', endpoint: '/AssumedDaysReport/PrintAssumedDays', filename: 'AssumedDaysReport.xlsx', query: q },
      { condition: reportType === 'Attendance Ratio', endpoint: '/AttendanceRatio/PrintAttendanceRatio', filename: 'AttendanceRatioReport.xlsx', query: q },
      { condition: reportType === 'Attendance Summary', endpoint: '/AttendanceSummary/PrintAttendanceSummary', filename: 'AttendanceSummaryReport.xlsx', query: q },
      { condition: reportType === 'Consecutive Absences', endpoint: '/ConsecutiveAbsencesReport/PrintConsecutiveAbsencesReport', filename: 'ConsecutiveAbsencesReport.xlsx', query: q },
      { condition: reportType === 'Count Of Employee Per Workshift' && empShiftOptions === 'Count', endpoint: '/CountEmployeePerShift/PrintCountEmployeePerShift', filename: 'CountEmployeePerShiftReport.xlsx', query: q },
      { condition: reportType === 'Count Of Employee Per Workshift' && empShiftOptions === 'Listing', endpoint: '/CountEmployeePerShift/PrintListEmployeePerShift', filename: 'CountEmployeePerShiftReport.xlsx', query: q },
      { condition: reportType === 'Daily Time', endpoint: '/DailyTimeReport/PrintDailyTimeReport', filename: 'DailyTimeReport.xlsx', query: q },
      { condition: reportType === 'Device Code Report', endpoint: '/DeviceCodeReport/PrintDeviceCodeReport', filename: 'DeviceCodeReport.xlsx', query: q },
      { condition: reportType === 'Employees Raw Data Report', endpoint: '/EmployeeRawDataReport/PrintEmployeeRawDataReport', filename: 'EmployeeRawDataReport.xlsx', query: q },
      { condition: reportType === 'Employees Raw In And Out (From Update Rawdata)', endpoint: '/EmployeeRawInAndOut/PrintEmployeeRawInAndOut', filename: 'EmployeeRawInAndOutReport.xlsx', query: q },
      { condition: reportType === 'Employees With No Workshift', endpoint: '/EmployeeNoWorkShiftReport/PrintEmployeeNoWorkShift', filename: 'EmployeeNoWorkShiftReport.xlsx', query: q },
      { condition: reportType === 'Exemption Report', endpoint: '/ExemptionReport/PrintExemptionReport', filename: 'ExemptionReport.xlsx', query: eq },
      { condition: reportType === 'In And Out By Position', endpoint: '/InOutByPositionReport/PrintInOutByPositionReport', filename: 'EmployeesInAndOutReport.xlsx', query: q },
      { condition: reportType === 'Leave And Absences' && mode === 'All' && !convertLeaveToRawData, endpoint: '/LeaveAndAbsences/PrintLeaveAndAbsences', filename: 'LeaveAndAbsencesReport.xlsx', query: lq },
      { condition: reportType === 'Leave And Absences' && mode === 'Absences' && !convertLeaveToRawData, endpoint: '/LeaveAndAbsences/PrintAbsences', filename: 'AbsencesReport.xlsx', query: lq },
      { condition: reportType === 'Leave And Absences' && mode === 'Leave' && !convertLeaveToRawData, endpoint: '/LeaveAndAbsences/PrintLeave', filename: 'LeaveReport.xlsx', query: lq },
      { condition: reportType === 'Leave And Absences' && convertLeaveToRawData && rawDataLeaveOptions === 'Policy', endpoint: '/LeaveAndAbsences/PrintLeaveByPolicy', filename: 'LeaveAndAbsencesByPolicyReport.xlsx', query: q },
      { condition: reportType === 'Leave And Absences' && convertLeaveToRawData && rawDataLeaveOptions === 'Actual', endpoint: '/LeaveAndAbsences/PrintLeaveByActual', filename: 'LeaveAndAbsencesByActualTimeReport.xlsx', query: q },
      { condition: reportType === 'Man Hours' && hrsOptions === 'Per Employee', endpoint: '/ManHoursReport/PrintManHoursPerEmployee', filename: 'ManHoursPerEmployeeReport.xlsx', query: q },
      { condition: reportType === 'Man Hours' && hrsOptions === 'Summary', endpoint: '/ManHoursReport/PrintManHoursSummary', filename: 'ManHoursSummaryReport.xlsx', query: q },
      { condition: reportType === 'Man Hours By Division-Branch-Category-Dept-Section', endpoint: '/ManHoursReport/PrintManHours', filename: 'ManHoursDivBraCatDepSec.xlsx', query: q },
      { condition: reportType === 'No In And Out' && !logsOptions.incompleteLogs, endpoint: '/NoInAndOut/PrintNoInAndOut', filename: 'NoInAndOutReport.xlsx', query: q },
      { condition: reportType === 'No In And Out' && logsOptions.incompleteLogs && !logsOptions.logs, endpoint: '/NoInAndOut/PrintIncompleteLogs', filename: 'IncompleteLogsReport.xlsx', query: q },
      { condition: reportType === 'No In And Out' && logsOptions.incompleteLogs && logsOptions.logs, endpoint: '/NoInAndOut/PrintIncompleteNoInAndOut', filename: 'IncompleteLogs-NoInOutReport.xlsx', query: iq },
      { condition: reportType === 'Overtime' && otOptions === 'Listing', endpoint: '/OvertimeReport/PrintOvertimeReport', filename: 'OvertimeReport.xlsx', query: q },
      { condition: reportType === 'Overtime' && otOptions === 'Summary', endpoint: '/OvertimeReport/PrintOvertimeSummaryReport', filename: 'OvertimeReport.xlsx', query: q },
      { condition: reportType === 'Perfect Attendance', endpoint: '/PerfectAttendanceReport/PrintPerfectAttendance', filename: 'PerfectAttendanceReport.xlsx', query: q },
      { condition: reportType === 'Questionable Entries', endpoint: '/QuestEntriesReport/PrintQuestEntriesReport', filename: 'QuestionableEntriesReport.xlsx', query: q },
      { condition: reportType === 'Questionable Workshifts', endpoint: '/QuestShiftReport/PrintQuestShiftReport', filename: 'QuestionableWorkshiftReport.xlsx', query: q },
      { condition: reportType === 'Restday in a Week', endpoint: '/RestDayWeekReport/PrintRestDayWeekReport', filename: 'RestDayInAWeekReport.xlsx', query: q },
      { condition: reportType === 'Tardiness' && tardinessOptions === 'Listing' && periodOptions === 0 && !convertToRawData, endpoint: '/TardinessReport/PrintTardinessReport', filename: 'TardinessReport.xlsx', query: q },
      { condition: reportType === 'Tardiness' && tardinessOptions === 'Listing' && periodOptions === 1 && !convertToRawData, endpoint: '/TardinessReport/PrintTardinessAfterGPeriod', filename: 'TardinessReport.xlsx', query: q },
      { condition: reportType === 'Tardiness' && tardinessOptions === 'Listing' && periodOptions === 2 && !convertToRawData, endpoint: '/TardinessReport/PrintTardinessWithinGPeriod', filename: 'TardinessReport.xlsx', query: q },
      { condition: reportType === 'Tardiness' && tardinessOptions === 'Periodic' && !convertToRawData, endpoint: '/TardinessReport/PrintTardinessPeriodic', filename: 'TardinessPeriodicReport.xlsx', query: q },
      { condition: reportType === 'Tardiness' && convertToRawData && rawDataOptions === 'Actual', endpoint: '/TardinessReport/PrintTardinessRawDataActual', filename: 'TardinessRawDataReport.xlsx', query: q },
      { condition: reportType === 'Tardiness' && convertToRawData && rawDataOptions === 'Policy', endpoint: '/TardinessReport/PrintTardinessRawDataReport', filename: 'TardinessRawDataReport.xlsx', query: q },
      { condition: reportType === 'Tardiness/ Overbreak/ Undertime Violation', endpoint: '/ViolationReport/PrintViolationReport', filename: 'TardyOverbreakUndertimeViolationReport.xlsx', query: q },
      { condition: reportType === 'Tardiness And Undertime Report', endpoint: '/TardyUTReport/PrintTardyUTReport', filename: 'TardinessAndUndertimeReport.xlsx', query: q },
      { condition: reportType === 'Tardiness Penalty' && tardyOptions === 'Month', endpoint: '/TardinessPenalty/PrintTardinessPenaltyPerMonth', filename: 'TardinessPenaltyPerMonth.xlsx', query: tq },
      { condition: reportType === 'Tardiness Penalty' && tardyOptions === 'Per Department', endpoint: '/TardinessPenalty/PrintTardinessPenaltyPercentage', filename: 'TardinessPenaltyPercentage.xlsx', query: tq },
      { condition: reportType === 'Tardiness Penalty' && tardyOptions === 'Annual', endpoint: '/TardinessPenalty/PrintTardinessPenaltyAnnual', filename: 'AnnualTardinessReport.xlsx', query: tq },
      { condition: reportType === 'Timesheet', endpoint: '/TimeSheetReport/PrintTimeSheetReport', filename: 'TimeSheetReport.xlsx', query: q },
      { condition: reportType === 'Unauthorized Absences', endpoint: '/UnauthorizedAbsences/PrintUnauthorizedAbsences', filename: 'UnauthorizedAbsencesReport.xlsx', query: q },
      { condition: reportType === 'Undertime' && !utRawData, endpoint: '/UndertimeReport/PrintUndertime', filename: 'UndertimeReport.xlsx', query: q },
      { condition: reportType === 'Undertime' && utRawData && utOptions === 'Policy', endpoint: '/UndertimeReport/PrintUndertimeByPolicy', filename: 'UndertimeByPolicyReport.xlsx', query: q },
      { condition: reportType === 'Undertime' && utRawData && utOptions === 'ActualTime', endpoint: '/UndertimeReport/PrintUndertimeByActual', filename: 'UndertimeByActualTimeReport.xlsx', query: q },
      { condition: reportType === 'User Group Access', endpoint: '/UserGroupAccessReport/PrintUserGroupAccess', filename: 'UserGroupAccessReport.xlsx', query: q },
      { condition: reportType === 'User TK Group Access', endpoint: '/UserTKGroupAccessReport/PrintUserTKGroupAccess', filename: 'UserTKGroupAccessReport.xlsx', query: q },
    ];

    if (reportType === 'Questionable Workshifts' && (!minutes || minutes.trim() === '')) {
      Swal.fire({ icon: 'warning', title: 'Invalid Max Minutes', text: 'Please enter valid Max Minutes before generating the report.' });
      return;
    }

    const match = branches.find(b => b.condition);
    if (match) {
      await downloadReport(match.endpoint, match.filename, match.query);
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No Report Found.' });
    }
  };

  // ─── Selection helpers ─────────────────────────────────────────────────────

  const tabItemMap: Record<TabType, { items: GroupItem[]; selected: string[]; setSelected: (v: string[]) => void }> = {
    'tk-group': { items: tkGroupItems, selected: selectedItems, setSelected: setSelectedItems },
    'branch': { items: branchItems, selected: selectedBranchItems, setSelected: setSelectedBranchItems },
    'department': { items: departmentItems, selected: selectedDepItems, setSelected: setSelectedDepItems },
    'designation': { items: designationItems, selected: selectedDesItems, setSelected: setSelectedDesItems },
    'division': { items: divisionItems, selected: selectedDivItems, setSelected: setSelectedDivItems },
    'section': { items: sectionItems, selected: selectedSecItems, setSelected: setSelectedSecItems },
  };

  const handleItemToggle = (code: string) => {
    const { selected, setSelected } = tabItemMap[activeTab];
    setSelected(selected.includes(code) ? selected.filter(i => i !== code) : [...selected, code]);
  };

  const handleSelectAll = () => {
    const { items, selected, setSelected } = tabItemMap[activeTab];
    setSelected(selected.length === items.length ? [] : items.map(r => r.code));
  };

  const handleOTItemToggle = (code: string) =>
    setSelectedOTItems(prev => prev.includes(code) ? prev.filter(i => i !== code) : [...prev, code]);

  const handleSelectOTAll = () =>
    setSelectedOTItems(selectedOTItems.length === overtimeItems.length ? [] : overtimeItems.map(r => r.code));

  const handleOptionChange = (option: keyof typeof processOptions) => {
    if (option === 'selectAll') {
      const newValue = !processOptions.selectAll;
      setProcessOptions({ tardiness: newValue, undertime: newValue, nightDiffBasic: newValue, overtime: newValue, absences: newValue, selectAll: newValue, otherEarnAllowances: newValue, holidayPay: newValue });
    } else {
      setProcessOptions(prev => ({ ...prev, [option]: !prev[option] }));
    }
  };

  const handleLogsChange = (option: keyof typeof logsOptions) => {
    if (option === 'incompleteLogs') {
      const newValue = !logsOptions.logs;
      setLogsOptions(newValue ? { ...logsOptions, incompleteLogs: true } : { incompleteLogs: false, logs: false, break1: false, break2: false, break3: false });
    } else {
      setLogsOptions(prev => ({ ...prev, [option]: !prev[option] }));
    }
  };

  // ─── Filtered + paginated data ─────────────────────────────────────────────

  const search = (items: GroupItem[]) =>
    items.filter(i =>
      i.code.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
      i.description.toLowerCase().includes(groupSearchTerm.toLowerCase())
    );

  const filteredGroups = search(tkGroupItems);
  const filteredBranch = search(branchItems);
  const filteredDep = search(departmentItems);
  const filteredDes = search(designationItems);
  const filteredDiv = search(divisionItems);
  const filteredSec = search(sectionItems);
  const filteredOvertime = overtimeItems.filter(i =>
    i.code.toLowerCase().includes(overtimeSearchTerm.toLowerCase()) ||
    i.description.toLowerCase().includes(overtimeSearchTerm.toLowerCase())
  );
  const filteredEmployees = getEmployee.filter(e =>
    [e.empCode, e.lName, e.fName, e.mName, e.suffix]
      .some(f => f?.toLowerCase().includes(employeeSearchTerm.toLowerCase()))
  );
  const filteredUserGroup = getUserGroup.filter(g =>
    g.groupName?.toLowerCase().includes(userGroupSearchTerm.toLowerCase()) ||
    g.groupDesc?.toLowerCase().includes(userGroupSearchTerm.toLowerCase())
  );
  const filteredWorkshift = getWorkShift.filter(w =>
    w.workShiftCode?.toLowerCase().includes(workShiftSearchTerm.toLowerCase()) ||
    w.workShiftDesc?.toLowerCase().includes(workShiftSearchTerm.toLowerCase())
  );

  const tabFilteredMap: Record<TabType, GroupItem[]> = {
    'tk-group': filteredGroups, 'branch': filteredBranch, 'department': filteredDep,
    'designation': filteredDes, 'division': filteredDiv, 'section': filteredSec,
  };
  const tabPageMap: Record<TabType, number> = {
    'tk-group': currentGroupPage, 'branch': currentBranchPage, 'department': currentDepPage,
    'designation': currentDesPage, 'division': currentDivPage, 'section': currentSecPage,
  };
  const tabSetPageMap: Record<TabType, (p: number) => void> = {
    'tk-group': setCurrentGroupPage, 'branch': setCurrentBranchPage, 'department': setCurrentDepPage,
    'designation': setCurrentDesPage, 'division': setCurrentDivPage, 'section': setCurrentSecPage,
  };

  const currentTabFiltered = tabFilteredMap[activeTab];
  const currentTabPage = tabPageMap[activeTab];
  const currentTabSetPage = tabSetPageMap[activeTab];
  const paginatedTabItems = paginate(currentTabFiltered, currentTabPage);
  const currentTabSelected = tabItemMap[activeTab].selected;

  const paginatedEmployees = paginate(filteredEmployees, currentEmpPage);
  const paginatedUserGroup = paginate(filteredUserGroup, currentUserGroupPage);
  const paginatedWorkshift = paginate(filteredWorkshift, currentWorkshiftPage);
  const paginatedOT = paginate(filteredOvertime, currentOTPage);

  const startTabIdx = (currentTabPage - 1) * ITEMS_PER_PAGE;
  const startEmpIdx = (currentEmpPage - 1) * ITEMS_PER_PAGE;
  const startUGIdx = (currentUserGroupPage - 1) * ITEMS_PER_PAGE;
  const startWSIdx = (currentWorkshiftPage - 1) * ITEMS_PER_PAGE;
  const startOTIdx = (currentOTPage - 1) * ITEMS_PER_PAGE;

  // ─── Tabs config ───────────────────────────────────────────────────────────

  const tabs = [
    { id: 'tk-group' as TabType, label: 'TK Group', icon: Users },
    { id: 'branch' as TabType, label: 'Branch', icon: Building2 },
    { id: 'department' as TabType, label: 'Department', icon: Briefcase },
    { id: 'designation' as TabType, label: 'Designation', icon: Award },
    { id: 'division' as TabType, label: 'Division', icon: Network },
    { id: 'section' as TabType, label: 'Section', icon: Grid },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto">

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
                    {['Filter by date range', 'Export to Excel format', 'Multiple report types', 'Print ready reports'].map(t => (
                      <div key={t} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* ── Left Panel ── */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
                  <h3 className="text-gray-900">Filters</h3>

                  {/* Date From */}
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Date From</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="MM/DD/YYYY" />
                      </div>
                      <CalendarPopover date={dateFrom} onChange={setDateFrom} />
                    </div>
                  </div>

                  {/* Date To */}
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Date To</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" value={dateTo} onChange={e => setDateTo(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="MM/DD/YYYY" />
                      </div>
                      <CalendarPopover date={dateTo} onChange={setDateTo} />
                    </div>
                  </div>

                  {/* Sort Alphabetically */}
                  <CheckboxLabel label="Sort Alphabetically" checked={sortAlphabetically} onChange={e => setSortAlphabetically(e.target.checked)} />

                  {/* Employee Status */}
                  <div className="space-y-2">
                    {(['Active', 'InActive', 'All'] as const).map(v => (
                      <label key={v} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                        <input type="radio" name="empStatus" value={v} checked={empStatus === v}
                          onChange={e => setEmpStatus(e.target.value as typeof empStatus)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500" />
                        <span className="text-gray-700">{v === 'InActive' ? 'In Active' : v}</span>
                      </label>
                    ))}
                  </div>

                  {/* Employee Code */}
                  <div>
                    <label className="block text-gray-700 mb-2">Employee Code</label>
                    <div className="flex items-center gap-2">
                      <input type="text" value={empCode} readOnly placeholder="Select Employee"
                        className="flex-grow min-w-0 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                      <button onClick={() => setShowSearchModal(true)} className="flex-shrink-0 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <Search className="w-5 h-5" />
                      </button>
                      <button onClick={() => { setEmpCode(''); setEmpName(''); }} className="flex-shrink-0 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    {empCode && <p className="mt-2 text-sm text-gray-600">Employee Name: <span className="font-medium">{empName}</span></p>}
                  </div>

                  {/* Report Type */}
                  <div>
                    <select value={reportType} onChange={e => setReportType(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
                      {[
                        'Accumulation', 'Adjustment', 'Allowance', 'Application Report', 'Assumed Days',
                        'Attendance Ratio', 'Attendance Summary', 'Consecutive Absences',
                        'Count Of Employee Per Workshift', 'Daily Time', 'Device Code Report',
                        'Employees Raw Data Report', 'Employees Raw In And Out (From Update Rawdata)',
                        'Employees With No Workshift', 'Exemption Report', 'In And Out By Position',
                        'Leave And Absences', 'Man Hours', 'Man Hours By Division-Branch-Category-Dept-Section',
                        'No In And Out', 'Overtime', 'Perfect Attendance', 'Questionable Entries',
                        'Questionable Workshifts', 'Restday in a Week', 'Tardiness',
                        'Tardiness/ Overbreak/ Undertime Violation', 'Tardiness And Undertime Report',
                        'Tardiness Penalty', 'Timesheet', 'Unauthorized Absences', 'Undertime',
                        'User Group Access', 'User TK Group Access',
                      ].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  {/* ── Conditional report options ── */}

                  {/* User Group (for User Group Access) */}
                  {reportType === 'User Group Access' && (
                    <div>
                      <label className="block text-gray-700 mb-2">User Group</label>
                      <div className="flex items-center gap-2">
                        <input type="text" value={groupName} readOnly placeholder="Select User Group"
                          className="flex-grow min-w-0 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button onClick={() => setShowGroupSearchModal(true)} className="flex-shrink-0 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                          <Search className="w-5 h-5" />
                        </button>
                        <button onClick={() => { setGroupName(''); setGroupDesc(''); }} className="flex-shrink-0 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Convert to HH:MM */}
                  {['Leave And Absences', 'Daily Time', 'Attendance Summary', 'Adjustment', 'Assumed Days', 'Overtime', 'Tardiness', 'Unauthorized Absences', 'Undertime'].includes(reportType) && (
                    <CheckboxLabel label="Convert To HH:MM" checked={convertToHHMM} onChange={e => setConvertToHHMM(e.target.checked)} />
                  )}

                  {/* Perfect Attendance options */}
                  {reportType === 'Perfect Attendance' && (
                    <div className="space-y-2">
                      <CheckboxLabel label="Include With Pay" checked={includeWPay} onChange={e => setIncludeWPay(e.target.checked)} />
                      <CheckboxLabel label="Include Without Pay" checked={includeWOutPay} onChange={e => setIncludeWOutPay(e.target.checked)} />
                    </div>
                  )}

                  {/* Restday in a Week */}
                  {reportType === 'Restday in a Week' && (
                    <div className="space-y-4">
                      <NumericInput label="Number of Restday:" value={noOfFilter} maxLength={3} onChange={setNoOfFilter} width="w-16" />
                      <div className="flex items-center space-x-3">
                        <label className="text-gray-700 text-sm">Start of Week:</label>
                        <select value={weekName} onChange={e => setWeekName(e.target.value)}
                          className="px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                          <option></option>
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Tardiness options */}
                  {reportType === 'Tardiness' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Options</span>
                        <div className="mt-2 flex items-center gap-4">
                          {(['Listing', 'Periodic'] as const).map(v => (
                            <RadioLabel key={v} name="tardinessOpt" value={v} checked={tardinessOptions === v}
                              disabled={convertToRawData} onChange={() => setTardinessOptions(v)}
                              label={v === 'Periodic' ? 'Periodic Tardiness' : v} />
                          ))}
                        </div>
                      </div>
                      {tardinessOptions === 'Periodic' && (
                        <div className="flex flex-wrap items-center gap-3">
                          <RadioLabel name="instancesOpt" value="0" checked={instanceOptions === 0} disabled={convertToRawData} onChange={() => setInstanceOptions(0)} label="" />
                          <span className={`text-sm ${convertToRawData ? 'text-gray-400' : 'text-gray-700'}`}>Instance:</span>
                          <input type="text" value={instanceNum} maxLength={20} disabled={convertToRawData}
                            onChange={e => setInstanceNum(e.target.value.replace(/\D/g, '').slice(0, 20))}
                            className="w-16 px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                          <RadioLabel name="instancesOpt" value="1" checked={instanceOptions === 1} disabled={convertToRawData} onChange={() => setInstanceOptions(1)} label="" />
                          <span className={`text-sm ${convertToRawData ? 'text-gray-400' : 'text-gray-700'}`}>No. of Minutes</span>
                          <input type="text" value={minutesNum} maxLength={20} disabled={convertToRawData}
                            onChange={e => setMinutesNum(e.target.value.replace(/\D/g, '').slice(0, 20))}
                            className="w-16 px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-4">
                        {([0, 1, 2] as const).map((v, i) => (
                          <RadioLabel key={v} name="gPeriodOpt" value={String(v)} checked={periodOptions === v}
                            onChange={() => setPeriodOptions(v)}
                            label={['All', 'After Grace Period', 'Within Grace Period'][i]} />
                        ))}
                      </div>
                      <CheckboxLabel label="From Raw Data" checked={convertToRawData} onChange={e => setConvertToRawData(e.target.checked)} />
                      {convertToRawData && (
                        <div className="flex items-center gap-4">
                          {(['Actual', 'Policy'] as const).map(v => (
                            <RadioLabel key={v} name="rawDataOpt" value={v} checked={rawDataOptions === v}
                              onChange={() => setRawDataOptions(v)}
                              label={v === 'Actual' ? 'Based on Actual Time' : 'Based on Policy'} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tardiness Penalty */}
                  {reportType === 'Tardiness Penalty' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Options</span>
                        <div className="mt-2 flex flex-wrap gap-4">
                          {([['Month', 'Tardiness Penalty Per Month'], ['Per Department', 'Tardiness Penalty Per Department'], ['Annual', 'Tardiness Penalty Annual']] as const).map(([v, label]) => (
                            <RadioLabel key={v} name="tardyOpt" value={v} checked={tardyOptions === v} onChange={() => setTardyOptions(v as typeof tardyOptions)} label={label} />
                          ))}
                        </div>
                      </div>
                      <NumericInput label="Year:" value={year} maxLength={4} onChange={setYear} width="w-20" />
                      <div className="flex items-center space-x-3">
                        <label className="text-gray-700 text-sm">Month:</label>
                        <select value={month} onChange={e => setMonth(e.target.value)}
                          className="px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                          <option></option>
                          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                            <option key={m} value={i + 1}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Consecutive Absences */}
                  {reportType === 'Consecutive Absences' && (
                    <div className="space-y-4">
                      <NumericInput label="Years of Service:" value={yearsOfService} maxLength={3} onChange={setYearsOfService} width="w-16" />
                      <NumericInput label="Consecutive Absences:" value={noOfConsecutiveAbsences} maxLength={3} onChange={setNoOfConsecutiveAbsences} width="w-16" />
                    </div>
                  )}

                  {/* Questionable Workshifts */}
                  {reportType === 'Questionable Workshifts' && (
                    <NumericInput label="Max Minutes:" value={minutes} maxLength={20} onChange={setMinutes} width="w-16" />
                  )}

                  {/* Undertime */}
                  {reportType === 'Undertime' && (
                    <CheckboxLabel label="From Raw Data" checked={utRawData} onChange={e => setUTRawData(e.target.checked)} />
                  )}
                  {utRawData && (
                    <div className="flex items-center gap-4">
                      {(['Policy', 'ActualTime'] as const).map(v => (
                        <RadioLabel key={v} name="utOpt" value={v} checked={utOptions === v}
                          onChange={() => setUTOptions(v)} label={v === 'Policy' ? 'Based on Policy' : 'Based on Actual Time'} />
                      ))}
                    </div>
                  )}

                  {/* Exemption Report */}
                  {reportType === 'Exemption Report' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <label className="flex items-center gap-2 cursor-pointer mb-3 pb-3 border-b border-blue-200">
                        <input type="checkbox" checked={processOptions.selectAll} onChange={() => handleOptionChange('selectAll')}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-sm text-gray-900">Select All</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {([['tardiness', 'Tardiness'], ['undertime', 'Undertime'], ['nightDiffBasic', 'Night Diff Basic'], ['overtime', 'Overtime'], ['absences', 'Absences'], ['otherEarnAllowances', 'Other Earn Allowances'], ['holidayPay', 'Holiday Pay']] as [keyof typeof processOptions, string][]).map(([key, label]) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={processOptions[key] as boolean} onChange={() => handleOptionChange(key)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <span className="text-sm text-gray-700">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No In And Out / Incomplete Logs */}
                  {reportType === 'No In And Out' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <label className="flex items-center gap-2 cursor-pointer mb-3 pb-3 border-b border-blue-200">
                        <input type="checkbox" checked={logsOptions.incompleteLogs} onChange={() => handleLogsChange('incompleteLogs')}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-sm text-gray-900">Incomplete Logs</span>
                      </label>
                      <div className="space-y-2">
                        {([['logs', 'Time In and Time Out'], ['break1', 'Break 1 In and Break 1 Out'], ['break2', 'Break 2 In and Break 2 Out'], ['break3', 'Break 3 In and Break 3 Out']] as [keyof typeof logsOptions, string][]).map(([key, label]) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={logsOptions[key] as boolean} disabled={!logsOptions.incompleteLogs} onChange={() => handleLogsChange(key)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <span className="text-sm text-gray-700">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Employees With No Workshift */}
                  {reportType === 'Employees With No Workshift' && (
                    <div className="space-y-3">
                      <span className="text-sm font-medium text-gray-700">Options</span>
                      <div className="flex items-center gap-4">
                        <RadioLabel name="noShiftOpt" value="1" checked={noShiftOptions === 1} onChange={() => setNoShiftOptions(1)} label="Employee Workshift" />
                        <RadioLabel name="noShiftOpt" value="2" checked={noShiftOptions === 2} onChange={() => setNoShiftOptions(2)} label="Raw Data" />
                      </div>
                      <CheckboxLabel label="Include Transaction with Shift" checked={include} onChange={e => setInclude(e.target.checked)} />
                    </div>
                  )}

                  {/* Man Hours */}
                  {reportType === 'Man Hours' && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-700">Options</span>
                      <div className="flex items-center gap-4">
                        <RadioLabel name="hrsOpt" value="Per Employee" checked={hrsOptions === 'Per Employee'} onChange={() => setHrsOptions('Per Employee')} label="Per Employee" />
                        <RadioLabel name="hrsOpt" value="Summary" checked={hrsOptions === 'Summary'} onChange={() => setHrsOptions('Summary')} label="Summary" />
                      </div>
                    </div>
                  )}

                  {/* Count Of Employee Per Workshift */}
                  {reportType === 'Count Of Employee Per Workshift' && (
                    <div className="space-y-3">
                      <span className="text-sm font-medium text-gray-700">Options</span>
                      <div className="flex items-center gap-4">
                        <RadioLabel name="empShiftOpt" value="Count" checked={empShiftOptions === 'Count'} onChange={() => setEmpShiftOptions('Count')} label="Count" />
                        <RadioLabel name="empShiftOpt" value="Listing" checked={empShiftOptions === 'Listing'} onChange={() => setEmpShiftOptions('Listing')} label="List" />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Workshift Code</label>
                        <div className="flex items-center gap-2">
                          <input type="text" value={workShiftCode} readOnly placeholder="Select Workshift"
                            className="flex-grow min-w-0 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          <button onClick={() => setShowShiftSearchModal(true)} className="flex-shrink-0 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <Search className="w-5 h-5" />
                          </button>
                          <button onClick={() => { setWorkshiftCode(''); setWorkshiftDesc(''); }} className="flex-shrink-0 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Overtime */}
                  {reportType === 'Overtime' && (
                    <div className="space-y-3">
                      <span className="text-sm font-medium text-gray-700">Options</span>
                      <div className="flex items-center gap-4">
                        <RadioLabel name="otOpt" value="Listing" checked={otOptions === 'Listing'} onChange={() => setOTOptions('Listing')} label="Listing" />
                        <RadioLabel name="otOpt" value="Summary" checked={otOptions === 'Summary'} onChange={() => setOTOptions('Summary')} label="Summary" />
                      </div>
                      <button onClick={() => setShowOvertimeSearchModal(true)}
                        className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all shadow-md">
                        Filter Overtime Code
                      </button>
                    </div>
                  )}

                  {/* Employees Raw Data Report */}
                  {reportType === 'Employees Raw Data Report' && (
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Raw Data Type:</label>
                      <select value={dataMode} onChange={e => setDataMode(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                        <option value="CompleteLogs">Complete Logs</option>
                        <option value="IncompleteLogs">Incomplete Logs</option>
                      </select>
                    </div>
                  )}

                  {/* Application Report */}
                  {reportType === 'Application Report' && (
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Application Type:</label>
                      <select value={appMode} onChange={e => setAppMode(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                        <option value="OvertimeApplication">Overtime Application</option>
                        <option value="LeaveApplication">Leave Application</option>
                      </select>
                    </div>
                  )}

                  {/* Leave And Absences */}
                  {reportType === 'Leave And Absences' && (
                    <div className="space-y-4">
                      <CheckboxLabel label="Include Leave Adjustment" checked={includeLeaveAdj} onChange={e => setIncludeLeaveAdj(e.target.checked)} />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Status</span>
                        <div className="mt-2 flex items-center gap-4">
                          {(['Active', 'InActive', 'All'] as const).map(v => (
                            <RadioLabel key={v} name="leaveStatus" value={v} checked={status === v}
                              onChange={() => setStatus(v)} label={v === 'InActive' ? 'In Active' : v} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Options</span>
                        <div className="mt-2 flex items-center gap-4">
                          {(['Absences', 'Leave', 'All'] as const).map(v => (
                            <RadioLabel key={v} name="leaveMode" value={v} checked={mode === v}
                              onChange={() => setMode(v)} label={v} />
                          ))}
                        </div>
                      </div>
                      {mode === 'Leave' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-gray-700 text-sm mb-2">Leave Type:</label>
                            <select value={selectedLeaveType} onChange={e => setSelectedLeaveType(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                              <option></option>
                              {getLeaveType.map(l => <option key={l.leaveCode} value={l.leaveCode}>{l.leaveDesc}</option>)}
                            </select>
                          </div>
                          <div className="flex items-center gap-4">
                            {(['WithPay', 'WithOutPay', 'All'] as const).map(v => (
                              <RadioLabel key={v} name="wPayOpt" value={v} checked={withOrWOutPay === v}
                                onChange={() => setWithOrWOutPay(v)}
                                label={v === 'WithPay' ? 'With Pay' : v === 'WithOutPay' ? 'Without Pay' : 'All'} />
                            ))}
                          </div>
                        </div>
                      )}
                      <CheckboxLabel label="From Raw Data" checked={convertLeaveToRawData} onChange={e => setConvertLeaveToRawData(e.target.checked)} />
                      {convertLeaveToRawData && (
                        <div className="flex items-center gap-4">
                          {(['Policy', 'Actual'] as const).map(v => (
                            <RadioLabel key={v} name="rawDataLeaveOpt" value={v} checked={rawDataLeaveOptions === v}
                              onChange={() => setRawDataLeaveOptions(v)}
                              label={v === 'Policy' ? 'Based on Policy' : 'Based on Actual Time'} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Download Button */}
                  <button onClick={printReport}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg shadow-blue-500/30">
                    Download Report
                  </button>
                </div>
              </div>

              {/* ── Right Panel ── */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                  {/* Tabs */}
                  <div className="flex items-center gap-1 border-b border-gray-200 flex-wrap p-6 pb-0">
                    {tabs.map(tab => (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm flex items-center gap-2 rounded-t-lg transition-colors ${activeTab === tab.id ? 'font-medium bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}>
                        <tab.icon className="w-4 h-4" />{tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Search */}
                  <div className="p-6 border-b border-gray-200 flex justify-end">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-700">Search:</span>
                      <input type="text" value={groupSearchTerm} onChange={e => setGroupSearchTerm(e.target.value)}
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Search..." />
                    </div>
                  </div>

                  {/* Table */}
                  <div className="p-6">
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-center w-12">
                              <input type="checkbox"
                                checked={currentTabSelected.length === currentTabFiltered.length && currentTabFiltered.length > 0}
                                onChange={handleSelectAll}
                                className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer" />
                            </th>
                            <th className="px-4 py-3 text-left text-gray-700">Code</th>
                            <th className="px-4 py-3 text-left text-gray-700">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {paginatedTabItems.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-center">
                                <input type="checkbox"
                                  checked={currentTabSelected.includes(item.code)}
                                  onChange={() => handleItemToggle(item.code)}
                                  className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer" />
                              </td>
                              <td className="px-4 py-3 text-gray-900">{item.code}</td>
                              <td className="px-4 py-3 text-gray-600">{item.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Pagination
                      total={currentTabFiltered.length}
                      current={currentTabPage}
                      onChange={currentTabSetPage}
                      startIdx={startTabIdx}
                      endIdx={startTabIdx + ITEMS_PER_PAGE}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}

      {/* Employee Search Modal */}
      {showSearchModal && (
        <SearchModal title="Select Employee" searchTerm={employeeSearchTerm}
          onSearchChange={v => { setEmployeeSearchTerm(v); setCurrentEmpPage(1); }}
          onClose={() => { setShowSearchModal(false); setEmployeeSearchTerm(''); }}
          pagination={
            <Pagination total={filteredEmployees.length} current={currentEmpPage} onChange={setCurrentEmpPage}
              startIdx={startEmpIdx} endIdx={startEmpIdx + ITEMS_PER_PAGE} />
          }>
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-3 py-1.5 text-left text-gray-700">EmpCode</th>
                <th className="px-3 py-1.5 text-left text-gray-700">Name</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.map(emp => (
                <tr key={emp.empCode} className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                  onClick={() => { setEmpCode(emp.empCode); setEmpName(`${emp.lName}, ${emp.fName} ${emp.mName}`); setShowSearchModal(false); setEmployeeSearchTerm(''); }}>
                  <td className="px-3 py-1.5">{emp.empCode}</td>
                  <td className="px-3 py-1.5">{emp.lName}, {emp.fName} {emp.mName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SearchModal>
      )}

      {/* User Group Search Modal */}
      {showGroupSearchModal && (
        <SearchModal title="Select User Group" searchTerm={userGroupSearchTerm}
          onSearchChange={v => { setUserGroupSearchTerm(v); setCurrentUserGroupPage(1); }}
          onClose={() => { setShowGroupSearchModal(false); setUserGroupSearchTerm(''); }}
          pagination={
            <Pagination total={filteredUserGroup.length} current={currentUserGroupPage} onChange={setCurrentUserGroupPage}
              startIdx={startUGIdx} endIdx={startUGIdx + ITEMS_PER_PAGE} />
          }>
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-3 py-1.5 text-left text-gray-700">Group Name</th>
                <th className="px-3 py-1.5 text-left text-gray-700">Description</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUserGroup.map(g => (
                <tr key={g.groupName} className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                  onClick={() => { setGroupName(g.groupName); setGroupDesc(g.groupDesc); setShowGroupSearchModal(false); setUserGroupSearchTerm(''); }}>
                  <td className="px-3 py-1.5">{g.groupName}</td>
                  <td className="px-3 py-1.5">{g.groupDesc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SearchModal>
      )}

      {/* Workshift Search Modal */}
      {showShiftSearchModal && (
        <SearchModal title="Select Workshift" searchTerm={workShiftSearchTerm}
          onSearchChange={v => { setWorkshiftSearchTerm(v); setCurrentWorkshiftPage(1); }}
          onClose={() => { setShowShiftSearchModal(false); setWorkshiftSearchTerm(''); }}
          pagination={
            <Pagination total={filteredWorkshift.length} current={currentWorkshiftPage} onChange={setCurrentWorkshiftPage}
              startIdx={startWSIdx} endIdx={startWSIdx + ITEMS_PER_PAGE} />
          }>
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-3 py-1.5 text-left text-gray-700">Code</th>
                <th className="px-3 py-1.5 text-left text-gray-700">Description</th>
              </tr>
            </thead>
            <tbody>
              {paginatedWorkshift.map(w => (
                <tr key={w.workShiftCode} className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                  onClick={() => { setWorkshiftCode(w.workShiftCode); setWorkshiftDesc(w.workShiftDesc); setShowShiftSearchModal(false); setWorkshiftSearchTerm(''); }}>
                  <td className="px-3 py-1.5">{w.workShiftCode}</td>
                  <td className="px-3 py-1.5">{w.workShiftDesc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SearchModal>
      )}

      {/* Overtime Search Modal */}
      {showOvertimeSearchModal && (
        <SearchModal title="Select Overtime" searchTerm={overtimeSearchTerm}
          onSearchChange={v => { setOvertimeSearchTerm(v); setCurrentOTPage(1); }}
          onClose={() => { setShowOvertimeSearchModal(false); setOvertimeSearchTerm(''); }}
          pagination={
            <Pagination total={filteredOvertime.length} current={currentOTPage} onChange={setCurrentOTPage}
              startIdx={startOTIdx} endIdx={startOTIdx + ITEMS_PER_PAGE} />
          }>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-center w-12">
                  <input type="checkbox"
                    checked={selectedOTItems.length === filteredOvertime.length && filteredOvertime.length > 0}
                    onChange={handleSelectOTAll}
                    className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer" />
                </th>
                <th className="px-4 py-3 text-left text-gray-700">Code</th>
                <th className="px-4 py-3 text-left text-gray-700">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedOT.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-center">
                    <input type="checkbox"
                      checked={selectedOTItems.includes(item.code)}
                      onChange={() => handleOTItemToggle(item.code)}
                      className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer" />
                  </td>
                  <td className="px-4 py-3 text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-gray-600">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SearchModal>
      )}

      <Footer />
    </div>
  );
}

// ─── Small shared sub-components ─────────────────────────────────────────────

function CheckboxLabel({ label, checked, onChange }: { label: string; checked: boolean; onChange: React.ChangeEventHandler<HTMLInputElement> }) {
  return (
    <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
      <input type="checkbox" checked={checked} onChange={onChange}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
      <span className="text-gray-700 text-sm">{label}</span>
    </label>
  );
}

function RadioLabel({ name, value, checked, onChange, label, disabled }: {
  name: string; value: string; checked: boolean;
  onChange: () => void; label: string; disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="radio" name={name} value={value} checked={checked} disabled={disabled}
        onChange={onChange} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
      {label && <span className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>{label}</span>}
    </label>
  );
}

function NumericInput({ label, value, maxLength, onChange, width }: {
  label: string; value: string; maxLength: number; onChange: (v: string) => void; width: string;
}) {
  return (
    <div className="flex items-center space-x-3">
      <label className="text-gray-700 text-sm shrink-0">{label}</label>
      <input type="text" value={value} maxLength={maxLength} inputMode="numeric"
        onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, maxLength))}
        className={`${width} px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`} />
    </div>
  );
}
