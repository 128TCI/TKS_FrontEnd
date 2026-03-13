import { useState, useEffect } from 'react';
import {
  Calendar, Check, Upload, Download,
  Users, Building2, Briefcase, Network,
  CalendarClock, Wallet, Grid, Box, Search,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { CalendarPopup } from '../CalendarPopup';
import { fetchEmployees as fetchEmployeesService } from '../../services/employeeService';
import apiClient, { getLoggedInUsername } from '../../services/apiClient';
import { Footer } from '../Footer/Footer';
// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface GroupItem {
  id: number;
  code: string;
  description: string;
}

interface EmployeeItem {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  tkGroup: string;
  branchCode: string;
  departmentCode: string;
  divisionCode: string;
  groupScheduleCode: string;
  payHouseCode: string;
  sectionCode: string;
  unitCode: string;
}

type ActiveFilter = 'all' | 'active' | 'inactive';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function safeId(...candidates: any[]): number {
  for (const c of candidates) {
    const n = Number(c);
    if (c !== null && c !== undefined && c !== '' && !isNaN(n) && n > 0) return n;
  }
  return 0;
}

const todayStr = () => {
  const t = new Date();
  return `${t.getMonth() + 1}/${t.getDate()}/${t.getFullYear()}`;
};

const ITEMS_PER_PAGE = 10;

function parseDateStr(str: string): Date | null {
  const p = str?.trim().split('/');
  if (p?.length !== 3) return null;
  const [m, d, y] = p.map(Number);
  if (isNaN(m) || isNaN(d) || isNaN(y)) return null;
  const dt = new Date(y, m - 1, d);
  return isNaN(dt.getTime()) ? null : dt;
}

function toDateString(dateStr: string): string {
  const parts = dateStr.trim().split('/');
  if (parts.length !== 3) return '';
  const [m, d, y] = parts.map(Number);
  if (isNaN(m) || isNaN(d) || isNaN(y)) return '';
  return `${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')}/${y}`;
}

function getPageNumbers(total: number, current: number): (number | string)[] {
  const pages: (number | string)[] = [];
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

// ─────────────────────────────────────────────────────────────────────────────
// DateInputField
// ─────────────────────────────────────────────────────────────────────────────
interface DateInputFieldProps {
  label: string;
  value: string;
  onChange: (d: string) => void;
}

function DateInputField({ label, value, onChange }: DateInputFieldProps) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <label className="block text-gray-700 text-sm mb-2">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="MM/DD/YYYY"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-9"
        />
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <Calendar className="w-3.5 h-3.5" />
        </button>
        {open && (
          <div className="absolute top-full left-0 mt-1 z-[9999]">
            <CalendarPopup
              onDateSelect={date => { onChange(date); setOpen(false); }}
              onClose={() => setOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PaginationRow
// ─────────────────────────────────────────────────────────────────────────────
function PaginationRow({ total, current, setPage, start, end, count }: {
  total: number; current: number; setPage: (p: number) => void;
  start: number; end: number; count: number;
}) {
  return (
    <div className="flex items-center justify-between mt-3">
      <div className="text-gray-600 text-xs">
        Showing {count === 0 ? 0 : start + 1} to {Math.min(end, count)} of {count} entries
      </div>
      <div className="flex gap-1">
        <button type="button" onClick={() => setPage(Math.max(current - 1, 1))} disabled={current === 1}
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50">
          Previous
        </button>
        {getPageNumbers(total, current).map((page, idx) =>
          page === '...'
            ? <span key={`e${idx}`} className="px-1 text-gray-500 text-xs">...</span>
            : (
              <button key={page} type="button" onClick={() => setPage(page as number)}
                className={`px-2 py-1 rounded text-xs ${current === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>
                {page}
              </button>
            )
        )}
        <button type="button" onClick={() => setPage(Math.min(current + 1, total))} disabled={current === total || total === 0}
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50">
          Next
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
type FilterTab = 'TK Group' | 'Branch' | 'Department' | 'Division' | 'Group Schedule' | 'Pay House' | 'Section' | 'Unit';

const FILTER_TABS: { name: FilterTab; icon: React.ElementType }[] = [
  { name: 'TK Group',       icon: Users        },
  { name: 'Branch',         icon: Building2    },
  { name: 'Department',     icon: Briefcase    },
  { name: 'Division',       icon: Network      },
  { name: 'Group Schedule', icon: CalendarClock },
  { name: 'Pay House',      icon: Wallet       },
  { name: 'Section',        icon: Grid         },
  { name: 'Unit',           icon: Box          },
];

export function PayrollDTRAllowancePage() {

  // ── Date fields ───────────────────────────────────────────────────────────
  const [dateFrom,         setDateFrom]         = useState(todayStr);
  const [dateTo,           setDateTo]           = useState(todayStr);
  const [transactionDate,  setTransactionDate]  = useState(todayStr);
  const [assumedDate,      setAssumedDate]      = useState('');
  const [applyTransaction, setApplyTransaction] = useState(false);
  const [leaveWithoutPay,  setLeaveWithoutPay]  = useState(false);
  const [isExporting,      setIsExporting]      = useState(false);

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<FilterTab>('TK Group');

  // ── Group/Employee list states ────────────────────────────────────────────
  const [tkGroupItems,       setTKGroupItems]       = useState<GroupItem[]>([]);
  const [branchItems,        setBranchItems]        = useState<GroupItem[]>([]);
  const [departmentItems,    setDepartmentItems]    = useState<GroupItem[]>([]);
  const [divisionItems,      setDivisionItems]      = useState<GroupItem[]>([]);
  const [groupScheduleItems, setGroupScheduleItems] = useState<GroupItem[]>([]);
  const [payHouseItems,      setPayHouseItems]      = useState<GroupItem[]>([]);
  const [sectionItems,       setSectionItems]       = useState<GroupItem[]>([]);
  const [unitItems,          setUnitItems]          = useState<GroupItem[]>([]);
  const [employeeItems,      setEmployeeItems]      = useState<EmployeeItem[]>([]);
  const [loadingEmployees,   setLoadingEmployees]   = useState(false);

  const [selectedGroups,    setSelectedGroups]    = useState<number[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

  const [groupSearchTerm,    setGroupSearchTerm]    = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [currentGroupPage,   setCurrentGroupPage]   = useState(1);
  const [currentEmpPage,     setCurrentEmpPage]     = useState(1);
  const [activeFilter,       setActiveFilter]       = useState<ActiveFilter>('active');

  useEffect(() => { setCurrentGroupPage(1); setGroupSearchTerm(''); }, [activeTab]);
  useEffect(() => { setCurrentEmpPage(1); }, [activeFilter, employeeSearchTerm]);

  // ── Fetch helpers ─────────────────────────────────────────────────────────
const fetchTKGroupData = async (): Promise<GroupItem[]> => {
  const userName = getLoggedInUsername();
  const url = userName && userName !== 'Guest'
    ? `/Fs/Process/TimeKeepGroupSetUp/by-user?userName=${encodeURIComponent(userName)}`
    : `/Fs/Process/TimeKeepGroupSetUp`;

  const res = await apiClient.get(url);
  return (res.data ?? []).map((i: any) => ({
    id: safeId(i.ID, i.id, i.groupID),
    code: i.groupCode ?? i.code ?? '',
    description: i.groupDescription ?? i.description ?? '',
  })).filter((i: GroupItem) => i.id !== 0);
};

  const fetchBranchData = async (): Promise<GroupItem[]> => {
    const res = await apiClient.get('/Fs/Employment/BranchSetUp');
    return (res.data ?? []).map((i: any) => ({
      id: safeId(i.braID, i.ID, i.id),
      code: i.braCode ?? i.code ?? '',
      description: i.braDesc ?? i.description ?? '',
    })).filter((i: GroupItem) => i.id !== 0);
  };

  const fetchDepartmentData = async (): Promise<GroupItem[]> => {
    const res = await apiClient.get('/Fs/Employment/DepartmentSetUp');
    return (res.data ?? []).map((i: any) => ({
      id: safeId(i.depID, i.ID, i.id),
      code: i.depCode ?? i.code ?? '',
      description: i.depDesc ?? i.description ?? '',
    })).filter((i: GroupItem) => i.id !== 0);
  };

  const fetchDivisionData = async (): Promise<GroupItem[]> => {
    const res = await apiClient.get('/Fs/Employment/DivisionSetUp');
    return (res.data ?? []).map((i: any) => ({
      id: safeId(i.divID, i.ID, i.id),
      code: i.divCode ?? i.code ?? '',
      description: i.divDesc ?? i.description ?? '',
    })).filter((i: GroupItem) => i.id !== 0);
  };

  const fetchGroupScheduleData = async (): Promise<GroupItem[]> => {
    const res = await apiClient.get('/Fs/Employment/GroupSetUp');
    return (Array.isArray(res.data) ? res.data : []).map((i: any) => ({
      id: safeId(i.grpSchID, i.id, i.ID),
      code: i.grpCode ?? i.code ?? '',
      description: i.grpDesc ?? i.description ?? '',
    })).filter((i: GroupItem) => i.id !== 0);
  };

  const fetchPayHouseData = async (): Promise<GroupItem[]> => {
    const res = await apiClient.get('/Fs/Employment/PayHouseSetUp');
    return (Array.isArray(res.data) ? res.data : []).map((i: any) => ({
      id: safeId(i.phID, i.payHouseID, i.payhouseID, i.PayHouseID, i.PhID, i.lineID, i.ID, i.id),
      code: i.phCode ?? i.payHouseCode ?? i.payhouseCode ?? i.lineCode ?? i.code ?? '',
      description: i.phDesc ?? i.payHouseDesc ?? i.payhouseDesc ?? i.phName ?? i.lineDesc ?? i.description ?? '',
    })).filter((i: GroupItem) => i.id !== 0);
  };

  const fetchSectionData = async (): Promise<GroupItem[]> => {
    const res = await apiClient.get('/Fs/Employment/SectionSetUp');
    return (Array.isArray(res.data) ? res.data : []).map((i: any) => ({
      id: safeId(i.secID, i.ID, i.id),
      code: i.secCode ?? i.sectionCode ?? i.code ?? '',
      description: i.secDesc ?? i.Description ?? i.description ?? '',
    })).filter((i: GroupItem) => i.id !== 0);
  };

  const fetchUnitData = async (): Promise<GroupItem[]> => {
    const res = await apiClient.get('/Fs/Employment/UnitSetUp');
    return (res.data ?? []).map((i: any) => ({
      id: safeId(i.unitID, i.ID, i.id),
      code: i.unitCode ?? i.code ?? '',
      description: i.unitDesc ?? i.description ?? '',
    })).filter((i: GroupItem) => i.id !== 0);
  };

const fetchEmployeeData = async (): Promise<EmployeeItem[]> => {
    const [{ employees }, configRes] = await Promise.all([
        fetchEmployeesService(),
        apiClient.get('/Maintenance/EmployeeBasicConfiguration'),
    ]);

    const configItems = Array.isArray(configRes.data)
        ? configRes.data
        : Array.isArray(configRes.data?.items)
            ? configRes.data.items
            : [];

    const activeMap = new Map<string, boolean>();
    configItems.forEach((c: any) => {
        const code = (c.empCode ?? c.code ?? '').toString().toLowerCase().trim();
        if (code) activeMap.set(code, Boolean(c.active ?? c.isActive ?? true));
    });

    return employees.map((i: any): EmployeeItem => {
        const empCode = (i.empCode ?? i.code ?? '').toString().trim();

        const isActive = activeMap.has(empCode.toLowerCase())
            ? activeMap.get(empCode.toLowerCase())!
            : i.status !== undefined
                ? (typeof i.status === 'string'
                    ? i.status.toLowerCase() === 'active'
                    : Boolean(i.status))
                : Boolean(i.isActive ?? i.empStatus ?? true);

        return {
            id:                safeId(i.empID, i.ID, i.id),
            code:              empCode,
            name:              `${i.lName ?? ''}, ${i.fName ?? ''} ${i.mName ?? ''}`.trim().replace(/,\s*$/, ''),
            tkGroup:           i.tksGroupCode ?? i.tkGroup ?? i.tKGroup ?? i.groupCode ?? i.tkGroupCode ?? '',
            branchCode:        i.braCode      ?? i.branchCode     ?? i.branch          ?? '',
            departmentCode:    i.depCode      ?? i.departmentCode ?? i.department      ?? '',
            divisionCode:      i.divCode      ?? i.divisionCode   ?? i.division        ?? '',
            groupScheduleCode: i.grpCode      ?? i.groupSchedule  ?? i.grpSchCode      ?? '',
            payHouseCode:      i.lineCode     ?? i.phCode         ?? i.payCode         ?? i.payHouseCode ?? i.payHouse ?? '',
            sectionCode:       i.secCode      ?? i.sectionCode    ?? i.section         ?? '',
            unitCode:          i.unitCode     ?? i.unit           ?? '',
            isActive,
        };
    });
};
  useEffect(() => { fetchTKGroupData().then(setTKGroupItems).catch(() => {}); }, []);
  useEffect(() => { fetchBranchData().then(setBranchItems).catch(() => {}); }, []);
  useEffect(() => { fetchDepartmentData().then(setDepartmentItems).catch(() => {}); }, []);
  useEffect(() => { fetchDivisionData().then(setDivisionItems).catch(() => {}); }, []);
  useEffect(() => { fetchGroupScheduleData().then(setGroupScheduleItems).catch(() => {}); }, []);
  useEffect(() => { fetchPayHouseData().then(setPayHouseItems).catch(() => {}); }, []);
  useEffect(() => { fetchSectionData().then(setSectionItems).catch(() => {}); }, []);
  useEffect(() => { fetchUnitData().then(setUnitItems).catch(() => {}); }, []);
  useEffect(() => {
    setLoadingEmployees(true);
    fetchEmployeeData().then(setEmployeeItems).catch(() => {}).finally(() => setLoadingEmployees(false));
  }, []);

  // ── Derived: active tab items ─────────────────────────────────────────────
  const getCurrentData = (): GroupItem[] => {
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
  };

  const getSelectionTitle = (): string => {
    switch (activeTab) {
      case 'TK Group':       return 'TK Group Selection';
      case 'Branch':         return 'Branch Selection';
      case 'Department':     return 'Department Selection';
      case 'Division':       return 'Division Selection';
      case 'Group Schedule': return 'Group Schedule Selection';
      case 'Pay House':      return 'Pay House Selection';
      case 'Section':        return 'Section Selection';
      case 'Unit':           return 'Unit Selection';
      default:               return 'Selection';
    }
  };

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

  const currentItems = getCurrentData();

  const selectedGroupCodes = new Set(
    currentItems
      .filter(item => selectedGroups.includes(item.id))
      .map(item => item.code.trim().toLowerCase())
  );

  const filteredGroups = currentItems.filter(item =>
    item.code.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(groupSearchTerm.toLowerCase())
  );

  const filteredEmployees = employeeItems.filter(emp => {
    if (activeFilter === 'active'   && !emp.isActive) return false;
    if (activeFilter === 'inactive' &&  emp.isActive) return false;
    const matchesSearch =
      emp.code.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedGroupCodes.size === 0) return true;
    const orgField = getOrgFieldForTab();
    if (!orgField) return true;
    const empOrgValue = (emp[orgField] as string | undefined)?.trim().toLowerCase() ?? '';
    return selectedGroupCodes.has(empOrgValue);
  });

  const activeCount   = employeeItems.filter(e => e.isActive).length;
  const inactiveCount = employeeItems.filter(e => !e.isActive).length;

  // ── Group pagination ───────────────────────────────────────────────────────
  const totalGroupPages  = Math.ceil(filteredGroups.length / ITEMS_PER_PAGE);
  const startGroupIndex  = (currentGroupPage - 1) * ITEMS_PER_PAGE;
  const endGroupIndex    = startGroupIndex + ITEMS_PER_PAGE;
  const paginatedGroups  = filteredGroups.slice(startGroupIndex, endGroupIndex);

  // ── Employee pagination ────────────────────────────────────────────────────
  const totalEmployeePages  = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const startEmployeeIndex  = (currentEmpPage - 1) * ITEMS_PER_PAGE;
  const endEmployeeIndex    = startEmployeeIndex + ITEMS_PER_PAGE;
  const paginatedEmployees  = filteredEmployees.slice(startEmployeeIndex, endEmployeeIndex);

  // ── Selection handlers ────────────────────────────────────────────────────
  const handleGroupToggle = (id: number) => {
    if (!id) return;
    setSelectedGroups(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAllGroups = () => {
    setSelectedGroups(
      selectedGroups.length === filteredGroups.length
        ? []
        : filteredGroups.filter(g => g.id !== 0).map(g => g.id)
    );
  };

  const handleEmployeeToggle = (id: number) => {
    if (!id) return;
    setSelectedEmployees(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAllEmployees = () => {
    setSelectedEmployees(
      selectedEmployees.length === filteredEmployees.length
        ? []
        : filteredEmployees.filter(e => e.id !== 0).map(e => e.id)
    );
  };

  // ── Export — background job with progress polling ─────────────────────────
  const handleExport = async () => {
    if (selectedEmployees.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Validation', text: 'Please select at least one employee.' }); return;
    }
    if (!dateFrom) {
      Swal.fire({ icon: 'warning', title: 'Validation', text: 'Please select Date From.' }); return;
    }
    if (!dateTo) {
      Swal.fire({ icon: 'warning', title: 'Validation', text: 'Please select Date To.' }); return;
    }
    if (!leaveWithoutPay) {
      Swal.fire({ icon: 'warning', title: 'Validation', text: 'Please check "Leave Without Pay And Absences" under Option to proceed.' }); return;
    }
    if (applyTransaction && !transactionDate) {
      Swal.fire({ icon: 'warning', title: 'Validation', text: 'Transaction Date is required.' }); return;
    }

    const dfParsed = parseDateStr(dateFrom);
    const dtParsed = parseDateStr(dateTo);
    if (dfParsed && dtParsed && dfParsed > dtParsed) {
      Swal.fire({ icon: 'warning', title: 'Validation', text: 'Date From cannot be greater than Date To.' }); return;
    }

    if (assumedDate) {
      const dtAssumed = parseDateStr(assumedDate);
      if (dtParsed && dtAssumed && dtParsed >= dtAssumed) {
        Swal.fire({ icon: 'warning', title: 'Validation', text: 'Assumed Date should not be less than or equal to Date To.' }); return;
      }
    }

    const empCodes = employeeItems
      .filter(e => selectedEmployees.includes(e.id))
      .map(e => e.code);

    const requestBody = {
      EmpCodes:             empCodes,
      DateFrom:             toDateString(dateFrom),
      DateTo:               toDateString(dateTo),
      LeaveAndAbsences:     leaveWithoutPay,
      ApplyTransactionDate: applyTransaction,
      TransactionDate:      applyTransaction ? toDateString(transactionDate) : null,
      AssumedDate:          assumedDate ? toDateString(assumedDate) : null,
      ExportTo:             'SQL',
    };

    setIsExporting(true);

    // Show initial progress Swal
    Swal.fire({
      title: 'Exporting...',
      html: `
        <p id="swal-msg" style="font-size:14px;color:#374151;margin-bottom:10px;">
          Starting export for ${empCodes.length} employee(s)...
        </p>
        <div style="background:#e5e7eb;border-radius:9999px;height:10px;overflow:hidden;">
          <div id="swal-bar"
            style="background:#2563eb;height:10px;border-radius:9999px;width:0%;transition:width 0.4s ease;">
          </div>
        </div>
        <p id="swal-pct" style="font-size:12px;color:#6b7280;margin-top:6px;">0%</p>
      `,
      allowOutsideClick: false,
      allowEscapeKey:    false,
      showConfirmButton: false,
    });

    try {
      // ── Step 1: POST to start export → returns jobId INSTANTLY ───────────
      const { data } = await apiClient.post('/ExportPayrollAllow/export', requestBody);
      const jobId: string = data.jobId;

      // ── Step 2: Poll GET /status/{jobId} every 2 seconds ─────────────────
      await new Promise<void>((resolve, reject) => {
        const interval = setInterval(async () => {
          try {
            const { data: status } = await apiClient.get(
              `/ExportPayrollAllow/status/${jobId}`
            );

            // Update progress bar and message in the Swal
            const msg = document.getElementById('swal-msg');
            const bar = document.getElementById('swal-bar');
            const pct = document.getElementById('swal-pct');
            if (msg) msg.textContent = status.message;
            if (bar) bar.style.width = `${status.percent}%`;
            if (pct) pct.textContent = `${status.percent}%`;

            if (status.status === 'done') {
              clearInterval(interval);
              resolve();
            } else if (status.status === 'failed') {
              clearInterval(interval);
              reject(new Error(status.error ?? 'Export failed.'));
            }
          } catch (pollErr) {
            clearInterval(interval);
            reject(pollErr);
          }
        }, 2000); // poll every 2 seconds
      });

      // ── Done ─────────────────────────────────────────────────────────────
      Swal.fire({
        icon:              'success',
        title:             'Export Successful',
        text:              'DTR Allowance data has been exported successfully.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#2563eb',
      });

    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'An unexpected error occurred.';
      Swal.fire({ icon: 'error', title: 'Export Failed', text: msg });
    } finally {
      setIsExporting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">

          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Export DTR Allowance</h1>
          </div>

          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">

            {/* Info Banner */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    Export Daily Time Record (DTR) and allowance data for payroll processing.
                    Select employees using the filters below, configure date ranges, and set transaction options.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {[
                      'Export DTR and allowances',
                      'Filter by TK Group, Branch, Department, and more',
                      'Configure date ranges and transaction options',
                      'Leave and absence options',
                    ].map(t => (
                      <div key={t} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Tabs ── */}
            <div className="mb-6 flex items-center gap-1 border-b border-gray-200 flex-wrap">
              {FILTER_TABS.map(tab => (
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

            {/* ── Selection Grid ── */}
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
                    onChange={e => setGroupSearchTerm(e.target.value)}
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
                      {paginatedGroups.length === 0 ? (
                        <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-400">No records found.</td></tr>
                      ) : paginatedGroups.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleGroupToggle(item.id)}>
                          <td className="px-4 py-2" onClick={e => e.stopPropagation()}>
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
                <PaginationRow
                  total={totalGroupPages} current={currentGroupPage} setPage={setCurrentGroupPage}
                  start={startGroupIndex} end={endGroupIndex} count={filteredGroups.length}
                />
              </div>

              {/* Employee Selection */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900">Employees</h3>
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                    {selectedEmployees.length} selected
                  </span>
                </div>

                {/* Active / Inactive filter toggle */}
                <div className="flex items-center gap-1 mb-3 p-1 bg-gray-200 rounded-lg w-fit">
                  {(
                    [
                      { key: 'all',      label: 'All',      count: employeeItems.length },
                      { key: 'active',   label: 'Active',   count: activeCount          },
                      { key: 'inactive', label: 'Inactive', count: inactiveCount        },
                    ] as { key: ActiveFilter; label: string; count: number }[]
                  ).map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setActiveFilter(opt.key)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                        activeFilter === opt.key
                          ? opt.key === 'active'
                            ? 'bg-green-500 text-white shadow-sm'
                            : opt.key === 'inactive'
                            ? 'bg-red-400 text-white shadow-sm'
                            : 'bg-white text-gray-700 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {opt.label}
                      <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                        activeFilter === opt.key
                          ? 'bg-white bg-opacity-30 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {opt.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={employeeSearchTerm}
                    onChange={e => { setEmployeeSearchTerm(e.target.value); setCurrentEmpPage(1); }}
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
                        <th className="px-4 py-2 text-left text-xs text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loadingEmployees ? (
                        <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">
                          <div className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                            Loading employees...
                          </div>
                        </td></tr>
                      ) : paginatedEmployees.length === 0 ? (
                        <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">No records found.</td></tr>
                      ) : paginatedEmployees.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleEmployeeToggle(item.id)}>
                          <td className="px-4 py-2" onClick={e => e.stopPropagation()}>
                            <input type="checkbox"
                              checked={selectedEmployees.includes(item.id)}
                              onChange={() => handleEmployeeToggle(item.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.code}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{item.name}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                                item.isActive ? 'bg-green-500' : 'bg-red-400'
                              }`} />
                              {item.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationRow
                  total={totalEmployeePages} current={currentEmpPage} setPage={setCurrentEmpPage}
                  start={startEmployeeIndex} end={endEmployeeIndex} count={filteredEmployees.length}
                />
              </div>
            </div>

            {/* ── Export Options ── */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
              <div className="p-4 border-b border-gray-200 mb-4">
                <h2 className="text-gray-900">Export Options</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <DateInputField label="Date From" value={dateFrom} onChange={setDateFrom} />
                <DateInputField label="Date To"   value={dateTo}   onChange={setDateTo} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <DateInputField label="Transaction Date" value={transactionDate} onChange={setTransactionDate} />
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={applyTransaction}
                      onChange={e => setApplyTransaction(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">Apply Transaction Date</span>
                  </label>
                </div>
                <DateInputField label="Assumed Date" value={assumedDate} onChange={setAssumedDate} />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Option</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={leaveWithoutPay}
                    onChange={e => setLeaveWithoutPay(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">Leave Without Pay And Absences</span>
                </label>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={isExporting}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  {isExporting ? 'Exporting...' : 'Export'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 