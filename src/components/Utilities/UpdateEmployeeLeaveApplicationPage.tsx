import { useState, useEffect, useCallback } from 'react';
import { Check, Search, X, Save, Users, Building2, Briefcase, Network, CalendarClock, Wallet, Grid, Box, RefreshCw } from 'lucide-react';
import { CalendarPopover } from '../Modals/CalendarPopover';
import { LeaveCodeSearchModal } from './../Modals/LeaveCodeSearchModal';
import { Footer } from '../Footer/Footer';
import { ApiService, showSuccessModal, showErrorModal } from '../../services/apiService';
import apiClient from '../../services/apiClient';
import { toISO } from '../../services/utilityService';

// ── Types ─────────────────────────────────────────────────────────────────────

interface GroupItem {
  id: number;
  code: string;
  description: string;
}

interface EmployeeItem {
  id: number;
  code: string;
  name: string;
}

// Matches LeaveCodeSearchModal's expected shape
interface LeaveCode {
  leaveID: number;
  leaveCode: string;
  leaveDesc: string;
}

// ── Tab config ────────────────────────────────────────────────────────────────

type TabName = 'TK Group' | 'Branch' | 'Department' | 'Division' | 'Group Schedule' | 'Pay House' | 'Section' | 'Unit';

const TABS: { name: TabName; icon: React.ComponentType<any> }[] = [
  { name: 'TK Group',        icon: Users         },
  { name: 'Branch',          icon: Building2     },
  { name: 'Department',      icon: Briefcase     },
  { name: 'Division',        icon: Network       },
  { name: 'Group Schedule',  icon: CalendarClock },
  { name: 'Pay House',       icon: Wallet        },
  { name: 'Section',         icon: Grid          },
  { name: 'Unit',            icon: Box           },
];

const EMPTY_SELECTION: Record<TabName, number[]> = {
  'TK Group': [], 'Branch': [], 'Department': [], 'Division': [],
  'Group Schedule': [], 'Pay House': [], 'Section': [], 'Unit': [],
};

const ITEMS_PER_PAGE = 10;

// ── Component ─────────────────────────────────────────────────────────────────

export function UpdateEmployeeLeaveApplicationPage() {

  // ── Tab + filter state ────────────────────────────────────────────────────
  const [activeTab,          setActiveTab]          = useState<TabName>('TK Group');
  const [statusFilter,       setStatusFilter]       = useState<'active' | 'inactive' | 'all'>('active');
  const [groupSearchTerm,    setGroupSearchTerm]    = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');

  // ── Per-tab group selections ──────────────────────────────────────────────
  const [selectedGroupsMap, setSelectedGroupsMap] = useState<Record<TabName, number[]>>(EMPTY_SELECTION);
  const selectedGroups = selectedGroupsMap[activeTab] ?? [];
  const setSelectedGroups = (updater: number[] | ((prev: number[]) => number[])) => {
    setSelectedGroupsMap(prev => ({
      ...prev,
      [activeTab]: typeof updater === 'function' ? updater(prev[activeTab]) : updater,
    }));
  };

  // ── Employee selection + pagination ──────────────────────────────────────
  const [selectedEmployees,  setSelectedEmployees]  = useState<number[]>([]);
  const [currentGroupPage,   setCurrentGroupPage]   = useState(1);
  const [currentEmpPage,     setCurrentEmpPage]     = useState(1);
  const [isUpdating,         setIsUpdating]         = useState(false);

  // ── Group list states ─────────────────────────────────────────────────────
  const [tkGroupItems,       setTKSGroupItems]      = useState<GroupItem[]>([]);
  const [branchItems,        setBranchItems]        = useState<GroupItem[]>([]);
  const [departmentItems,    setDepartmentItems]    = useState<GroupItem[]>([]);
  const [divisionItems,      setDivisionItems]      = useState<GroupItem[]>([]);
  const [groupScheduleItems, setGroupScheduleItems] = useState<GroupItem[]>([]);
  const [payHouseItems,      setPayHouseItems]      = useState<GroupItem[]>([]);
  const [sectionItems,       setSectionItems]       = useState<GroupItem[]>([]);
  const [unitItems,          setUnitItems]          = useState<GroupItem[]>([]);

  // ── Employee list states ──────────────────────────────────────────────────
  const [employeeItems,      setEmployeeItems]      = useState<EmployeeItem[]>([]);
  const [loadingEmployees,   setLoadingEmployees]   = useState(false);

  // ── Form fields ───────────────────────────────────────────────────────────
  const [dateFrom,        setDateFrom]        = useState('');
  const [dateTo,          setDateTo]          = useState('');
  const [period,          setPeriod]          = useState('');
  const [numberOfHours,   setNumberOfHours]   = useState('');
  const [withPay,         setWithPay]         = useState(false);
  const [sssNotification, setSssNotification] = useState(false);

  // ── Leave code state ──────────────────────────────────────────────────────
  const [leaveCode,          setLeaveCode]          = useState('');
  const [leaveCodeItems,     setLeaveCodeItems]     = useState<LeaveCode[]>([]);
  const [loadingLeaveCodes,  setLoadingLeaveCodes]  = useState(false);
  const [leaveCodeError,     setLeaveCodeError]     = useState('');
  const [showLeaveCodeModal, setShowLeaveCodeModal] = useState(false);

  // ── Reset group page on tab change ────────────────────────────────────────
  useEffect(() => { setCurrentGroupPage(1); }, [activeTab]);

  // ── Load all group lists on mount ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [tks, bra, dep, div, grp, pay, sec, unit] = await Promise.all([
          apiClient.get('/Fs/Process/TimeKeepGroupSetUp'),
          apiClient.get('/Fs/Employment/BranchSetUp'),
          apiClient.get('/Fs/Employment/DepartmentSetUp'),
          apiClient.get('/Fs/Employment/DivisionSetUp'),
          apiClient.get('/Fs/Employment/GroupSetUp'),
          apiClient.get('/Fs/Employment/PayHouseSetUp'),
          apiClient.get('/Fs/Employment/SectionSetUp'),
          apiClient.get('/Fs/Employment/UnitSetUp'),
        ]);
        const map = (data: any[], idKey: string, codeKey: string, descKey: string): GroupItem[] =>
          (Array.isArray(data) ? data : []).map(i => ({
            id:          i[idKey]   ?? i.ID   ?? i.id   ?? 0,
            code:        i[codeKey] ?? i.code ?? '',
            description: i[descKey] ?? i.description ?? '',
          }));
        setTKSGroupItems(     map(tks.data,  'ID',       'groupCode',  'groupDescription'));
        setBranchItems(       map(bra.data,  'braID',    'braCode',    'braDesc'));
        setDepartmentItems(   map(dep.data,  'depID',    'depCode',    'depDesc'));
        setDivisionItems(     map(div.data,  'divID',    'divCode',    'divDesc'));
        setGroupScheduleItems(map(grp.data,  'grpSchID', 'grpCode',    'grpDesc'));
        setPayHouseItems(     map(pay.data,  'lineID',   'lineCode',   'lineDesc'));
        setSectionItems(      map(sec.data,  'secID',    'secCode',    'secDesc'));
        setUnitItems(         map(unit.data, 'unitID',   'unitCode',   'unitDesc'));
      } catch (err) {
        console.error('Failed to load group lists:', err);
      }
    };
    load();
  }, []);

  // ── Load leave codes on mount ─────────────────────────────────────────────
  useEffect(() => {
    const loadLeaveCodes = async () => {
      setLoadingLeaveCodes(true);
      setLeaveCodeError('');
      try {
        const response = await apiClient.get('/Fs/Process/LeaveTypeSetUp');
        const list = Array.isArray(response.data) ? response.data : [];
        setLeaveCodeItems(list.map((item: any): LeaveCode => ({
          leaveID:   item.leaveID   ?? item.ID  ?? 0,
          leaveCode: item.leaveCode ?? item.code ?? '',
          leaveDesc: item.leaveDesc ?? item.description ?? '',
        })));
      } catch (err: any) {
        setLeaveCodeError(err?.response?.data?.message ?? 'Failed to load leave codes.');
      } finally {
        setLoadingLeaveCodes(false);
      }
    };
    loadLeaveCodes();
  }, []);

  // ── Get current tab's group data ──────────────────────────────────────────
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

  // ── Build SP params for filtered employee fetch ───────────────────────────
  const buildSpParams = useCallback((
    tab: TabName, selectedIds: number[], allItems: GroupItem[],
    status: 'active' | 'inactive' | 'all'
  ) => {
    const selectedCodes = allItems
      .filter(i => selectedIds.includes(i.id))
      .map(i => i.code)
      .join(',');
    return {
      Transaction:    status === 'active' ? 'Active' : status === 'inactive' ? 'InActive' : 'All',
      GroupCodes:     tab === 'TK Group'       ? selectedCodes : '',
      Branches:       tab === 'Branch'         ? selectedCodes : '',
      Divisions:      tab === 'Division'       ? selectedCodes : '',
      Departments:    tab === 'Department'     ? selectedCodes : '',
      Sections:       tab === 'Section'        ? selectedCodes : '',
      Units:          tab === 'Unit'           ? selectedCodes : '',
      Lines:          '',
      Areas:          '',
      Locations:      '',
      GroupSchedules: tab === 'Group Schedule' ? selectedCodes : '',
    };
  }, []);

  // ── Fetch employees:
  //    no groups selected → GET /Maintenance/EmployeeMasterFile
  //    groups selected    → POST /Utilities/GetFilteredEmployees
  const fetchFilteredEmployees = useCallback(async (
    tab: TabName, selectedIds: number[], allItems: GroupItem[],
    status: 'active' | 'inactive' | 'all'
  ) => {
    setLoadingEmployees(true);
    setCurrentEmpPage(1);
    try {
      if (selectedIds.length === 0) {
        const response = await apiClient.get('/Maintenance/EmployeeMasterFile');
        const list = Array.isArray(response.data) ? response.data : [];
        setEmployeeItems(list.map((item: any): EmployeeItem => ({
          id:   item.empID   ?? item.ID   ?? item.id  ?? 0,
          code: item.empCode ?? item.code ?? '',
          name: `${item.lName ?? ''}, ${item.fName ?? ''} ${item.mName ?? ''}`.trim(),
        })));
      } else {
        const params = buildSpParams(tab, selectedIds, allItems, status);
        const response = await apiClient.post('/Utilities/GetFilteredEmployees', params);
        const list = Array.isArray(response.data) ? response.data : [];
        setEmployeeItems(list.map((item: any): EmployeeItem => ({
          id:   item.empID   ?? item.ID   ?? item.id  ?? 0,
          code: item.empCode ?? item.EmpCode ?? item.code ?? '',
          name: `${item.lName ?? item.LName ?? ''}, ${item.fName ?? item.FName ?? ''} ${item.mName ?? item.MName ?? ''}`.trim(),
        })));
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setEmployeeItems([]);
    } finally {
      setLoadingEmployees(false);
    }
  }, [buildSpParams]);

  // ── Re-fetch employees when tab / selection / status changes ──────────────
  useEffect(() => {
    const allItems = getCurrentData();
    fetchFilteredEmployees(activeTab, selectedGroups, allItems, statusFilter);
    setSelectedEmployees([]);
  }, [activeTab, selectedGroups, statusFilter]); // eslint-disable-line

  // ── Selection title ───────────────────────────────────────────────────────
  const getSelectionTitle = () => {
    const titles: Record<TabName, string> = {
      'TK Group': 'TK Group Selection', 'Branch': 'Branch Selection',
      'Department': 'Department Selection', 'Division': 'Division Selection',
      'Group Schedule': 'Group Schedule Selection', 'Pay House': 'Pay House Selection',
      'Section': 'Section Selection', 'Unit': 'Unit Selection',
    };
    return titles[activeTab] ?? 'Selection';
  };

  // ── Filtered + paginated groups ───────────────────────────────────────────
  const currentItems   = getCurrentData();
  const filteredGroups = currentItems.filter(item =>
    item.code.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(groupSearchTerm.toLowerCase())
  );
  const totalGroupPages = Math.ceil(filteredGroups.length / ITEMS_PER_PAGE);
  const startGroupIndex = (currentGroupPage - 1) * ITEMS_PER_PAGE;
  const paginatedGroups = filteredGroups.slice(startGroupIndex, startGroupIndex + ITEMS_PER_PAGE);

  // ── Filtered + paginated employees ────────────────────────────────────────
  const filteredEmployees = employeeItems.filter(emp =>
    emp.code.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  );
  const totalEmployeePages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const startEmpIndex      = (currentEmpPage - 1) * ITEMS_PER_PAGE;
  const paginatedEmployees = filteredEmployees.slice(startEmpIndex, startEmpIndex + ITEMS_PER_PAGE);

  // ── Pagination page numbers ───────────────────────────────────────────────
  const getPageNumbers = (current: number, total: number): (number | string)[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | string)[] = [];
    if (current <= 4) {
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
  };

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleGroupToggle        = (id: number) =>
    setSelectedGroups(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const handleEmployeeToggle     = (id: number) =>
    setSelectedEmployees(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const handleSelectAllGroups    = () =>
    setSelectedGroups(selectedGroups.length === filteredGroups.length ? [] : filteredGroups.map(g => g.id));
  const handleSelectAllEmployees = () =>
    setSelectedEmployees(selectedEmployees.length === filteredEmployees.length ? [] : filteredEmployees.map(e => e.id));

  const handleLeaveCodeSelect = (code: string) => {
    setLeaveCode(code);
    setShowLeaveCodeModal(false);
  };

  const resetForm = () => {
    setSelectedGroupsMap({ ...EMPTY_SELECTION });
    setSelectedEmployees([]);
    setDateFrom('');
    setDateTo('');
    setLeaveCode('');
    setNumberOfHours('');
    setPeriod('');
    setWithPay(false);
    setSssNotification(false);
  };

  const handleUpdate = async () => {
    if (!selectedEmployees.length)                   { await showErrorModal('Please select employee/s to update.'); return; }
    if (!leaveCode)                                  { await showErrorModal('Leave code should not be empty.'); return; }
    if (!numberOfHours || Number(numberOfHours) < 1) { await showErrorModal('Number of hours must be greater than 0.'); return; }
    if (!dateFrom || !dateTo)                        { await showErrorModal('Please select Date From and Date To.'); return; }

    try {
      setIsUpdating(true);
      const payload = {
        empCode:         selectedEmployees.map(id => employeeItems.find(e => e.id === id)?.code ?? String(id)),
        dateFrom:        toISO(dateFrom),
        dateTo:          toISO(dateTo),
        numberOfHours:   parseFloat(numberOfHours),
        leaveCode,
        period,
        withPay,
        sssNotification,

      };
      const res = await apiClient.post('/Utilities/UpdateEmployeeLeaveApplication', payload);
      if (ApiService.isApiSuccess(res)) {
        await showSuccessModal(res.data?.message ?? 'Successfully updated Employees Leave Application.');
        resetForm();
      } else {
        await showErrorModal(res.data?.message ?? 'Failed to update Employees Leave Application.');
      }
    } catch (err: any) {
      await showErrorModal(err?.response?.data?.message ?? 'Failed to update records.');
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Pagination renderer ───────────────────────────────────────────────────
  const renderPagination = (
    current: number, total: number, setPage: (p: number) => void,
    startIdx: number, endIdx: number, totalCount: number
  ) => (
    <div className="flex items-center justify-between mt-3">
      <span className="text-xs text-gray-500">
        Showing {totalCount === 0 ? 0 : startIdx + 1} to {Math.min(endIdx, totalCount)} of {totalCount} entries
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage(Math.max(1, current - 1))} disabled={current === 1}
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
          Previous
        </button>
        {getPageNumbers(current, total).map((page, idx) =>
          page === '...'
            ? <span key={`e-${idx}`} className="px-1 text-gray-500 text-xs">...</span>
            : <button key={page} onClick={() => setPage(page as number)}
                className={`px-2 py-1 rounded text-xs ${current === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>
                {page}
              </button>
        )}
        <button onClick={() => setPage(Math.min(total, current + 1))} disabled={current === total || total === 0}
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
          Next
        </button>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Update Employee Leave Application</h1>
          </div>

          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">

            {/* Info box */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Save className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-3">
                    Update employee leave applications. Select groups and employees, configure leave details including hours, period, and leave type.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {['Bulk update leave applications', 'Configure leave hours and periods',
                      'Filter by employee status', 'Select by TK Group, Branch, or Department'].map(t => (
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
              {TABS.map(tab => (
                <button key={tab.name} onClick={() => setActiveTab(tab.name)}
                  className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                    activeTab === tab.name
                      ? 'font-medium bg-blue-600 text-white -mb-px'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* ── Left: Group list ─────────────────────────────────────── */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900">{getSelectionTitle()}</h3>
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">{selectedGroups.length} selected</span>
                </div>
                <div className="mb-4 flex items-center gap-3">
                  <label className="text-sm text-gray-700">Search:</label>
                  <input type="text" value={groupSearchTerm}
                    onChange={e => { setGroupSearchTerm(e.target.value); setCurrentGroupPage(1); }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">
                          <input type="checkbox"
                            checked={selectedGroups.length === filteredGroups.length && filteredGroups.length > 0}
                            onChange={handleSelectAllGroups}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">Code</th>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedGroups.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <input type="checkbox"
                              checked={selectedGroups.includes(item.id)}
                              onChange={() => handleGroupToggle(item.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.code}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{item.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {renderPagination(currentGroupPage, totalGroupPages, setCurrentGroupPage,
                  startGroupIndex, startGroupIndex + ITEMS_PER_PAGE, filteredGroups.length)}
              </div>

              {/* ── Right: Employee list + form ──────────────────────────── */}
              <div className="space-y-6">

                {/* Employee list */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900">Employees</h3>
                    <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">{selectedEmployees.length} selected</span>
                  </div>
                  <div className="mb-4 flex items-center gap-3">
                    <label className="text-sm text-gray-700">Search:</label>
                    <input type="text" value={employeeSearchTerm}
                      onChange={e => { setEmployeeSearchTerm(e.target.value); setCurrentEmpPage(1); }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">
                            <input type="checkbox"
                              checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                              onChange={handleSelectAllEmployees}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          </th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">Code</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">Name</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {loadingEmployees ? (
                          <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-400">Loading employees…</td></tr>
                        ) : paginatedEmployees.length === 0 ? (
                          <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-400">No employees found.</td></tr>
                        ) : paginatedEmployees.map(emp => (
                          <tr key={emp.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <input type="checkbox"
                                checked={selectedEmployees.includes(emp.id)}
                                onChange={() => handleEmployeeToggle(emp.id)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">{emp.code}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{emp.name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {renderPagination(currentEmpPage, totalEmployeePages, setCurrentEmpPage,
                    startEmpIndex, startEmpIndex + ITEMS_PER_PAGE, filteredEmployees.length)}

                  {/* Status filter */}
                  <div className="mt-4 flex items-center gap-6">
                    {(['active', 'inactive', 'all'] as const).map(s => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="statusFilter" value={s}
                          checked={statusFilter === s} onChange={() => setStatusFilter(s)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                        <span className="text-sm text-gray-700 capitalize">
                          {s === 'inactive' ? 'In Active' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Form fields */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 space-y-4">

                  {/* Number of Hours + Period */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700 whitespace-nowrap">Number Of Hours [hh:mm]</label>
                      <input type="text" value={numberOfHours}
                        onChange={e => setNumberOfHours(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-20" />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700">Period</label>
                      <select value={period} onChange={e => setPeriod(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                        <option value=""></option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>

                  {/* Leave Code */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="text-sm text-gray-700">Leave Code</label>
                    <input type="text" value={leaveCode}
                      onChange={e => setLeaveCode(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-40" />
                    <button type="button"
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      onClick={() => setShowLeaveCodeModal(true)}>
                      <Search className="w-4 h-4" />
                    </button>
                    <button type="button"
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      onClick={() => setLeaveCode('')}>
                      <X className="w-4 h-4" />
                    </button>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={withPay} onChange={e => setWithPay(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-700">With Pay</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={sssNotification} onChange={e => setSssNotification(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-700">SSS Notification</span>
                    </label>
                  </div>

                  {/* Date Range */}
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700">Date From</label>
                      <input readOnly type="text" value={dateFrom}
                        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32" />
                      <CalendarPopover date={dateFrom} onChange={setDateFrom} />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700">Date To</label>
                      <input readOnly type="text" value={dateTo}
                        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32" />
                      <CalendarPopover date={dateTo} onChange={setDateTo} />
                    </div>
                  </div>

                  {/* Update button */}
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button onClick={handleUpdate} disabled={isUpdating}
                      className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      <Save className="w-4 h-4" />
                      {isUpdating ? 'Updating…' : 'Update'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <LeaveCodeSearchModal
        isOpen={showLeaveCodeModal}
        onClose={() => setShowLeaveCodeModal(false)}
        onSelect={handleLeaveCodeSelect}
        leaveCodeItems={leaveCodeItems}
        loading={loadingLeaveCodes}
        error={leaveCodeError}
      />
    </div>
  );
}
