import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Check, Save, Search, X, Users, Building2, Briefcase, Network, CalendarClock, Wallet, Grid, Box } from 'lucide-react';
import { CalendarPopover } from '../Modals/CalendarPopover';
import { Footer } from '../Footer/Footer';
import { ApiService, showSuccessModal, showErrorModal } from '../../services/apiService';
import apiClient from '../../services/apiClient';
import { toISO } from '../../services/utilityService';
import { RefCodeSearchModal, type RefCodeItem } from './../Modals/RefCodeSearchModal';

// ── Types ─────────────────────────────────────────────────────────────────────

interface GroupItem    { id: number; code: string; description: string; }
interface EmployeeItem { id: number; code: string; name: string; }

type TabName = 'TK Group' | 'Branch' | 'Department' | 'Division' | 'Group Schedule' | 'Pay House' | 'Section' | 'Unit';

// ── Constants ─────────────────────────────────────────────────────────────────

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

const INFO_ITEMS = [
  'Select groups and employees',
  'Filter by employee status',
  'Set date range for updates',
  'Batch update additional weekly hours',
];

const ITEMS_PER_PAGE = 10;

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapGroupItems = (data: any[], idKey: string, codeKey: string, descKey: string): GroupItem[] =>
  (Array.isArray(data) ? data : []).map(i => ({
    id:          i[idKey]   ?? i.ID          ?? i.id   ?? 0,
    code:        i[codeKey] ?? i.code        ?? '',
    description: i[descKey] ?? i.description ?? '',
  }));

const getPageNumbers = (current: number, total: number): (number | string)[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | string)[] = [];
  if (current <= 4)                { for (let i = 1; i <= 5; i++) pages.push(i); pages.push('...'); pages.push(total); }
  else if (current >= total - 3)   { pages.push(1); pages.push('...'); for (let i = total - 4; i <= total; i++) pages.push(i); }
  else { pages.push(1); pages.push('...'); for (let i = current - 1; i <= current + 1; i++) pages.push(i); pages.push('...'); pages.push(total); }
  return pages;
};

// ── Sub-components ────────────────────────────────────────────────────────────

function Pagination({
  current, total, setPage, startIdx, totalCount, label = 'entries',
}: {
  current: number; total: number; setPage: (p: number) => void;
  startIdx: number; totalCount: number; label?: string;
}) {
  return (
    <div className="flex items-center justify-between mt-3">
      <span className="text-xs text-gray-500">
        Showing {totalCount === 0 ? 0 : startIdx + 1} to {Math.min(startIdx + ITEMS_PER_PAGE, totalCount)} of {totalCount} {label}
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
}

// ── Main component ────────────────────────────────────────────────────────────

export function AdditionalHoursPerWeekPage() {
  const [activeTab,          setActiveTab]          = useState<TabName>('TK Group');
  const [statusFilter,       setStatusFilter]       = useState<'active' | 'inactive' | 'all'>('active');
  const [dateFrom,           setDateFrom]           = useState('');
  const [dateTo,             setDateTo]             = useState('');
  const [groupSearchTerm,    setGroupSearchTerm]    = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [selectedGroupsMap,  setSelectedGroupsMap]  = useState<Record<TabName, number[]>>(EMPTY_SELECTION);
  const [selectedEmployees,  setSelectedEmployees]  = useState<number[]>([]);
  const [currentGroupPage,   setCurrentGroupPage]   = useState(1);
  const [currentEmpPage,     setCurrentEmpPage]     = useState(1);
  const [isUpdating,         setIsUpdating]         = useState(false);
  const [loadingEmployees,   setLoadingEmployees]   = useState(false);

  // ── Ref Code state ──────────────────────────────────────────────────────────
  const [refCode,            setRefCode]            = useState<number>(0);
  const [refCodeLabel,       setRefCodeLabel]       = useState('');
  const [refCodeItems,       setRefCodeItems]       = useState<RefCodeItem[]>([]);
  const [refCodeLoading,     setRefCodeLoading]     = useState(false);
  const [refCodeError,       setRefCodeError]       = useState('');
  const [showRefCodeModal,   setShowRefCodeModal]   = useState(false);

  // ── Group data per tab ──────────────────────────────────────────────────────

  const [tkGroupItems,       setTKGroupItems]       = useState<GroupItem[]>([]);
  const [branchItems,        setBranchItems]        = useState<GroupItem[]>([]);
  const [departmentItems,    setDepartmentItems]    = useState<GroupItem[]>([]);
  const [divisionItems,      setDivisionItems]      = useState<GroupItem[]>([]);
  const [groupScheduleItems, setGroupScheduleItems] = useState<GroupItem[]>([]);
  const [payHouseItems,      setPayHouseItems]      = useState<GroupItem[]>([]);
  const [sectionItems,       setSectionItems]       = useState<GroupItem[]>([]);
  const [unitItems,          setUnitItems]          = useState<GroupItem[]>([]);
  const [employeeItems,      setEmployeeItems]      = useState<EmployeeItem[]>([]);

  // ── Per-tab helpers ─────────────────────────────────────────────────────────

  const selectedGroups    = selectedGroupsMap[activeTab] ?? [];
  const setSelectedGroups = (updater: number[] | ((prev: number[]) => number[])) =>
    setSelectedGroupsMap(prev => ({
      ...prev,
      [activeTab]: typeof updater === 'function' ? updater(prev[activeTab]) : updater,
    }));

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

  // ── Load all group lists once ───────────────────────────────────────────────

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
        setTKGroupItems(      mapGroupItems(tks.data,  'ID',       'groupCode', 'groupDescription'));
        setBranchItems(       mapGroupItems(bra.data,  'braID',    'braCode',   'braDesc'));
        setDepartmentItems(   mapGroupItems(dep.data,  'depID',    'depCode',   'depDesc'));
        setDivisionItems(     mapGroupItems(div.data,  'divID',    'divCode',   'divDesc'));
        setGroupScheduleItems(mapGroupItems(grp.data,  'grpSchID', 'grpCode',   'grpDesc'));
        setPayHouseItems(     mapGroupItems(pay.data,  'lineID',   'lineCode',  'lineDesc'));
        setSectionItems(      mapGroupItems(sec.data,  'secID',    'secCode',   'secDesc'));
        setUnitItems(         mapGroupItems(unit.data, 'unitID',   'unitCode',  'unitDesc'));
      } catch (err) { console.error('Failed to load group lists:', err); }
    };
    load();
  }, []);

  // ── Load Ref Codes once ─────────────────────────────────────────────────────

  useEffect(() => {
    const loadRefCodes = async () => {
      setRefCodeLoading(true);
      try {
        const res = await apiClient.get('/Utilities/GetRefCode/AdditionalHoursPerWeek');
        console.log('Loaded Ref Codes:', res.data);
        setRefCodeItems((Array.isArray(res.data) ? res.data : []).map((item: any): RefCodeItem => ({
          refCode:    item.refCode    ?? item.RefCode    ?? 0,
          day:        item.day        ?? item.Day    ?? '',
          regularDay: item.regularDay ?? item.RegularDay ?? '',
          restDay:    item.restDay    ?? item.RestDay    ?? '',
          special:    item.special    ?? item.Special    ?? '',
          legal:      item.legal      ?? item.Legal      ?? '',
        })));
      } catch (err) {
        setRefCodeError('Failed to load Ref Codes.');
        console.error(err);
      } finally {
        setRefCodeLoading(false);
      }
    };
    loadRefCodes();
  }, []);

  // ── Reset group page on tab change ─────────────────────────────────────────

  useEffect(() => { setCurrentGroupPage(1); }, [activeTab]);

  // ── Employee filter params builder ─────────────────────────────────────────

  const buildSpParams = useCallback((
    tab: TabName, selectedIds: number[], allItems: GroupItem[],
    status: 'active' | 'inactive' | 'all'
  ) => {
    const codes = allItems.filter(i => selectedIds.includes(i.id)).map(i => i.code).join(',');
    return {
      Transaction:    status === 'active' ? 'Active' : status === 'inactive' ? 'InActive' : 'All',
      GroupCodes:     tab === 'TK Group'       ? codes : '',
      Branches:       tab === 'Branch'         ? codes : '',
      Divisions:      tab === 'Division'       ? codes : '',
      Departments:    tab === 'Department'     ? codes : '',
      Sections:       tab === 'Section'        ? codes : '',
      Units:          tab === 'Unit'           ? codes : '',
      Lines:          '',
      Areas:          '',
      Locations:      '',
      GroupSchedules: tab === 'Group Schedule' ? codes : '',
    };
  }, []);

  // ── Fetch employees when group selection / status / tab changes ────────────

  const fetchFilteredEmployees = useCallback(async (
    tab: TabName, selectedIds: number[], allItems: GroupItem[],
    status: 'active' | 'inactive' | 'all'
  ) => {
    setLoadingEmployees(true);
    setCurrentEmpPage(1);
    try {
      let list: EmployeeItem[] = [];
      if (selectedIds.length === 0) {
        const res = await apiClient.get('/Maintenance/EmployeeMasterFile');
        list = (Array.isArray(res.data) ? res.data : []).map((item: any): EmployeeItem => ({
          id:   item.empID   ?? item.ID  ?? item.id  ?? 0,
          code: item.empCode ?? item.code ?? '',
          name: `${item.lName ?? ''}, ${item.fName ?? ''} ${item.mName ?? ''}`.trim(),
        }));
      } else {
        const params = buildSpParams(tab, selectedIds, allItems, status);
        const res    = await apiClient.post('/Utilities/GetFilteredEmployees', params);
        list = (Array.isArray(res.data) ? res.data : []).map((item: any): EmployeeItem => ({
          id:   item.empID   ?? item.ID     ?? item.id   ?? 0,
          code: item.empCode ?? item.EmpCode ?? item.code ?? '',
          name: `${item.lName ?? item.LName ?? ''}, ${item.fName ?? item.FName ?? ''} ${item.mName ?? item.MName ?? ''}`.trim(),
        }));
      }
      setEmployeeItems(list);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setEmployeeItems([]);
    } finally {
      setLoadingEmployees(false);
    }
  }, [buildSpParams]);

  useEffect(() => {
    const allItems = getCurrentData();
    fetchFilteredEmployees(activeTab, selectedGroups, allItems, statusFilter);
    setSelectedEmployees([]);
  }, [activeTab, selectedGroups, statusFilter]); // eslint-disable-line

  // ── Filtered + paginated data ───────────────────────────────────────────────

  const currentItems    = getCurrentData();
  const filteredGroups  = currentItems.filter(item =>
    item.code.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(groupSearchTerm.toLowerCase())
  );
  const totalGroupPages = Math.ceil(filteredGroups.length / ITEMS_PER_PAGE);
  const startGroupIndex = (currentGroupPage - 1) * ITEMS_PER_PAGE;
  const paginatedGroups = filteredGroups.slice(startGroupIndex, startGroupIndex + ITEMS_PER_PAGE);

  const filteredEmployees  = employeeItems.filter(emp =>
    emp.code.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  );
  const totalEmployeePages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const startEmpIndex      = (currentEmpPage - 1) * ITEMS_PER_PAGE;
  const paginatedEmployees = filteredEmployees.slice(startEmpIndex, startEmpIndex + ITEMS_PER_PAGE);

  // ── Selection handlers ──────────────────────────────────────────────────────

  const handleGroupToggle        = (id: number) =>
    setSelectedGroups(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const handleEmployeeToggle     = (id: number) =>
    setSelectedEmployees(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const handleSelectAllGroups    = () =>
    setSelectedGroups(selectedGroups.length === filteredGroups.length ? [] : filteredGroups.map(g => g.id));
  const handleSelectAllEmployees = () =>
    setSelectedEmployees(selectedEmployees.length === filteredEmployees.length ? [] : filteredEmployees.map(e => e.id));

  // ── Update ──────────────────────────────────────────────────────────────────

  const handleUpdate = async () => {
    if (!selectedEmployees.length) { await showErrorModal('Please select employee/s to update.'); return; }
    if (!dateFrom || !dateTo)      { await showErrorModal('Please select Date From and Date To.'); return; }

    try {
      setIsUpdating(true);

      // Map status for backend: legacy expects "Active" | "InActive" | "All"
      const statusMap = { active: 'Active', inactive: 'InActive', all: 'All' } as const;

      const payload = {
        empCodes: selectedEmployees.map(id => employeeItems.find(e => e.id === id)?.code ?? String(id)),
        dateFrom: toISO(dateFrom),
        dateTo:   toISO(dateTo),
        status:   statusMap[statusFilter],
        refCode:  refCode,
      };

      const res = await apiClient.post('/Utilities/AdditionalHoursPerWeek_byDate', payload);

      if (ApiService.isApiSuccess(res)) {
        await showSuccessModal(res.data?.message ?? 'Additional Hours Per Week successfully updated.');
        setSelectedGroupsMap({ ...EMPTY_SELECTION });
        setSelectedEmployees([]);
        setDateFrom('');
        setDateTo('');
        setRefCode(0);
        setRefCodeLabel('');
      } else {
        await showErrorModal(res.data?.message ?? 'Update failed.');
      }
    } catch (err: any) {
      await showErrorModal(err?.response?.data?.message ?? 'Failed to update records.');
    } finally {
      setIsUpdating(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Update Additional Hours Per Week</h1>
          </div>

          <div className="bg-white rounded-b-lg shadow-lg p-6">

            {/* Info banner */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-3">
                    Batch update additional hours per week for selected employee groups. Configure weekly hour adjustments across multiple employees efficiently.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {INFO_ITEMS.map(t => (
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

              {/* Left — Group list */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
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
                      {paginatedGroups.length === 0
                        ? <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-400">No items found.</td></tr>
                        : paginatedGroups.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <input type="checkbox" checked={selectedGroups.includes(item.id)}
                                onChange={() => handleGroupToggle(item.id)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.code}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.description}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
                <Pagination current={currentGroupPage} total={totalGroupPages} setPage={setCurrentGroupPage}
                  startIdx={startGroupIndex} totalCount={filteredGroups.length} />
              </div>

              {/* Right — Employees + date range */}
              <div className="space-y-6">

                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
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
                        ) : paginatedEmployees.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <input type="checkbox" checked={selectedEmployees.includes(item.id)}
                                onChange={() => handleEmployeeToggle(item.id)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.code}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination current={currentEmpPage} total={totalEmployeePages} setPage={setCurrentEmpPage}
                    startIdx={startEmpIndex} totalCount={filteredEmployees.length} />

                  {/* Status filter */}
                  <div className="mt-4 flex items-center gap-6">
                    {(['active', 'inactive', 'all'] as const).map(s => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="statusFilter" value={s}
                          checked={statusFilter === s} onChange={() => setStatusFilter(s)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                        <span className="text-sm text-gray-700">
                          {s === 'inactive' ? 'In Active' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date range + Update button */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <div className="space-y-4">

                    {/* Ref Code — above Date From, matching legacy layout */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700 w-24">Ref Code:</label>
                      <input type="text" readOnly value={refCodeLabel}
                        className="px-3 py-2 border border-gray-300 rounded bg-gray-100 text-sm w-32 cursor-default"
                        placeholder="—" />
                      <button onClick={() => setShowRefCodeModal(true)}
                        className="px-2 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        title="Search Ref Code">
                        <Search className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setRefCode(0); setRefCodeLabel(''); }}
                        disabled={!refCode}
                        className="px-2 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Clear Ref Code">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700 w-24">Date From:</label>
                      <input type="text" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32" />
                      <CalendarPopover date={dateFrom} onChange={setDateFrom} />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700 w-24">Date To:</label>
                      <input type="text" value={dateTo} onChange={e => setDateTo(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32" />
                      <CalendarPopover date={dateTo} onChange={setDateTo} />
                    </div>
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
      </div>
      <Footer />

      {/* Ref Code search modal */}
      <RefCodeSearchModal
        isOpen={showRefCodeModal}
        onClose={() => setShowRefCodeModal(false)}
        onSelect={(code, label) => { setRefCode(code); setRefCodeLabel(label); }}
        items={refCodeItems}
        loading={refCodeLoading}
        error={refCodeError}
      />
    </div>
  );
}
