import { useState, useEffect, useCallback } from 'react';
import { Clock, Check, Save, Users, Building2, Briefcase, CalendarClock, Wallet, Grid } from 'lucide-react';
import { CalendarPopover } from '../Modals/CalendarPopover';
import { ApiService, showSuccessModal, showErrorModal } from '../../services/apiService';
import { Footer } from '../Footer/Footer';
import apiClient from '../../services/apiClient';

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

type TabName = 'TK Group' | 'Branch' | 'Department' | 'Group Schedule' | 'Pay House' | 'Section';

const TABS: { name: TabName; icon: React.ComponentType<any> }[] = [
  { name: 'TK Group',       icon: Users       },
  { name: 'Branch',         icon: Building2   },
  { name: 'Department',     icon: Briefcase   },
  { name: 'Group Schedule', icon: CalendarClock },
  { name: 'Pay House',      icon: Wallet      },
  { name: 'Section',        icon: Grid        },
];

const EMPTY_SELECTION: Record<TabName, number[]> = {
  'TK Group': [], 'Branch': [], 'Department': [],
  'Group Schedule': [], 'Pay House': [], 'Section': [],
};

export function ProcessOvertimeCutoffPage() {
  const [activeTab,          setActiveTab]          = useState<TabName>('TK Group');
  const [dateFrom,           setDateFrom]           = useState('');
  const [dateTo,             setDateTo]             = useState('');
  const [overtimeDate,       setOvertimeDate]       = useState('');
  const [statusFilter,       setStatusFilter]       = useState<'active' | 'inactive' | 'all'>('active');
  const [groupSearchTerm,    setGroupSearchTerm]    = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [isUpdating,         setIsUpdating]         = useState(false);
  const itemsPerPage = 10;

  // Per-tab group selection
  const [selectedGroupsMap, setSelectedGroupsMap] = useState<Record<TabName, number[]>>(EMPTY_SELECTION);
  const selectedGroups = selectedGroupsMap[activeTab] ?? [];
  const setSelectedGroups = (u: number[] | ((p: number[]) => number[])) =>
    setSelectedGroupsMap(prev => ({ ...prev, [activeTab]: typeof u === 'function' ? u(prev[activeTab]) : u }));

  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [currentGroupPage,  setCurrentGroupPage]  = useState(1);
  const [currentEmpPage,    setCurrentEmpPage]    = useState(1);

  // Group data per tab
  const [tkGroupItems,       setTKSGroupItems]      = useState<GroupItem[]>([]);
  const [branchItems,        setBranchItems]        = useState<GroupItem[]>([]);
  const [departmentItems,    setDepartmentItems]    = useState<GroupItem[]>([]);
  const [groupScheduleItems, setGroupScheduleItems] = useState<GroupItem[]>([]);
  const [payHouseItems,      setPayHouseItems]      = useState<GroupItem[]>([]);
  const [sectionItems,       setSectionItems]       = useState<GroupItem[]>([]);

  // Employee list
  const [employeeItems,    setEmployeeItems]    = useState<EmployeeItem[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Reset group page when tab changes
  useEffect(() => { setCurrentGroupPage(1); }, [activeTab]);

  // Load all group lists in parallel
  useEffect(() => {
    const load = async () => {
      try {
        const [tks, bra, dep, grp, pay, sec] = await Promise.all([
          apiClient.get('/Fs/Process/TimeKeepGroupSetUp'),
          apiClient.get('/Fs/Employment/BranchSetUp'),
          apiClient.get('/Fs/Employment/DepartmentSetUp'),
          apiClient.get('/Fs/Employment/GroupSetUp'),
          apiClient.get('/Fs/Employment/PayHouseSetUp'),
          apiClient.get('/Fs/Employment/SectionSetUp'),
        ]);
        const mp = (data: any[], idK: string, cK: string, dK: string): GroupItem[] =>
          (Array.isArray(data) ? data : []).map(i => ({
            id:          i[idK]  ?? i.ID  ?? i.id  ?? 0,
            code:        i[cK]   ?? i.code        ?? '',
            description: i[dK]   ?? i.description ?? '',
          }));
        setTKSGroupItems(mp(tks.data, 'ID',      'groupCode', 'groupDescription'));
        setBranchItems(  mp(bra.data, 'braID',   'braCode',   'braDesc'));
        setDepartmentItems(mp(dep.data, 'depID', 'depCode',   'depDesc'));
        setGroupScheduleItems(mp(grp.data, 'grpSchID', 'grpCode', 'grpDesc'));
        setPayHouseItems(mp(pay.data, 'lineID',  'lineCode',  'lineDesc'));
        setSectionItems( mp(sec.data, 'secID',   'secCode',   'secDesc'));
      } catch (err) { console.error('Failed to load group lists:', err); }
    };
    load();
  }, []);

  // Resolve current tab's data
  const getCurrentData = useCallback((): GroupItem[] => {
    switch (activeTab) {
      case 'Branch':         return branchItems;
      case 'Department':     return departmentItems;
      case 'Group Schedule': return groupScheduleItems;
      case 'Pay House':      return payHouseItems;
      case 'Section':        return sectionItems;
      default:               return tkGroupItems;
    }
  }, [activeTab, tkGroupItems, branchItems, departmentItems, groupScheduleItems, payHouseItems, sectionItems]);

  // Build SP params for filtered employee fetch
  const buildSpParams = useCallback((tab: TabName, ids: number[], items: GroupItem[], status: string) => {
    const codes = items.filter(i => ids.includes(i.id)).map(i => i.code).join(',');
    return {
      Transaction:    status === 'active' ? 'Active' : status === 'inactive' ? 'InActive' : 'All',
      GroupCodes:     tab === 'TK Group'       ? codes : '',
      Branches:       tab === 'Branch'         ? codes : '',
      Divisions:      '',
      Departments:    tab === 'Department'     ? codes : '',
      Sections:       tab === 'Section'        ? codes : '',
      Units:          '',
      Lines:          '',
      Areas:          '',
      Locations:      '',
      GroupSchedules: tab === 'Group Schedule' ? codes : '',
    };
  }, []);

  // Fetch employees — filtered if groups selected, all otherwise
  const fetchFilteredEmployees = useCallback(async (
    tab: TabName, ids: number[], items: GroupItem[], status: string
  ) => {
    setLoadingEmployees(true);
    setCurrentEmpPage(1);
    try {
      if (ids.length === 0) {
        const res = await apiClient.get('/Maintenance/EmployeeMasterFile');
        setEmployeeItems((Array.isArray(res.data) ? res.data : []).map((e: any): EmployeeItem => ({
          id:   e.empID ?? e.ID ?? e.id ?? 0,
          code: e.empCode ?? e.code ?? '',
          name: `${e.lName ?? ''}, ${e.fName ?? ''} ${e.mName ?? ''}`.trim(),
        })));
      } else {
        const res = await apiClient.post('/Utilities/GetFilteredEmployees', buildSpParams(tab, ids, items, status));
        setEmployeeItems((Array.isArray(res.data) ? res.data : []).map((e: any): EmployeeItem => ({
          id:   e.empID   ?? e.ID    ?? e.id   ?? 0,
          code: e.empCode ?? e.EmpCode ?? e.code ?? '',
          name: `${e.lName ?? e.LName ?? ''}, ${e.fName ?? e.FName ?? ''} ${e.mName ?? e.MName ?? ''}`.trim(),
        })));
      }
    } catch { setEmployeeItems([]); }
    finally { setLoadingEmployees(false); }
  }, [buildSpParams]);

  // Re-fetch employees when tab, selected groups, or status changes
  useEffect(() => {
    fetchFilteredEmployees(activeTab, selectedGroups, getCurrentData(), statusFilter);
    setSelectedEmployees([]);
  }, [activeTab, selectedGroups, statusFilter]); // eslint-disable-line

  // Derived filtered + paginated data
  const currentItems   = getCurrentData();
  const filteredGroups = currentItems.filter(item =>
    item.code.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(groupSearchTerm.toLowerCase())
  );
  const filteredEmployees = employeeItems.filter(emp =>
    emp.code.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  );

  const totalGroupPages    = Math.ceil(filteredGroups.length    / itemsPerPage);
  const totalEmployeePages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startGroupIndex    = (currentGroupPage - 1) * itemsPerPage;
  const startEmployeeIndex = (currentEmpPage   - 1) * itemsPerPage;
  const paginatedGroups    = filteredGroups.slice(startGroupIndex, startGroupIndex + itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(startEmployeeIndex, startEmployeeIndex + itemsPerPage);

  const getPageNumbers = (current: number, total: number): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (total <= 7) { for (let i = 1; i <= total; i++) pages.push(i); return pages; }
    if (current <= 4)           { for (let i = 1; i <= 5; i++) pages.push(i); pages.push('...'); pages.push(total); }
    else if (current >= total - 3) { pages.push(1); pages.push('...'); for (let i = total - 4; i <= total; i++) pages.push(i); }
    else { pages.push(1); pages.push('...'); for (let i = current - 1; i <= current + 1; i++) pages.push(i); pages.push('...'); pages.push(total); }
    return pages;
  };

  const handleGroupToggle        = (id: number) => setSelectedGroups(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const handleEmployeeToggle     = (id: number) => setSelectedEmployees(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const handleSelectAllGroups    = () => setSelectedGroups(selectedGroups.length === filteredGroups.length ? [] : filteredGroups.map(g => g.id));
  const handleSelectAllEmployees = () => setSelectedEmployees(selectedEmployees.length === filteredEmployees.length ? [] : filteredEmployees.map(e => e.id));

  const resetForm = () => {
    setSelectedGroupsMap({ ...EMPTY_SELECTION });
    setSelectedEmployees([]);
    setDateFrom('');
    setDateTo('');
    setOvertimeDate('');
  };

  const handleUpdate = async () => {
    if (!selectedEmployees.length) { await showErrorModal('Please select employee/s to update.'); return; }
    if (!dateFrom || !dateTo)      { await showErrorModal('Please select Date From and Date To.'); return; }
    if (!overtimeDate)             { await showErrorModal('Please select Overtime Date.'); return; }

    try {
      setIsUpdating(true);
      const payload = {
        empCodes: selectedEmployees.map(id => employeeItems.find(e => e.id === id)?.code ?? String(id)),
        DateFrom: new Date(dateFrom).toISOString(),
        DateTo:   new Date(dateTo).toISOString(),
        OTDate:   new Date(overtimeDate).toISOString(),
      };

      const res = await apiClient.post('/Utilities/ProcessOvertimeCutoff_Update', payload);
      if (ApiService.isApiSuccess(res)) {
        await showSuccessModal('Process Overtime Per Cut-Off successfully updated.');
        resetForm();
      }
    } catch (error: any) {
      console.error(error);
      await showErrorModal('Failed to update records');
    } finally {
      setIsUpdating(false);
    }
  };

  const renderPagination = (
    current: number, total: number, setPage: (p: number) => void,
    startIdx: number, totalCount: number
  ) => (
    <div className="flex items-center justify-between mt-3">
      <span className="text-xs text-gray-500">
        Showing {totalCount === 0 ? 0 : startIdx + 1} to {Math.min(startIdx + itemsPerPage, totalCount)} of {totalCount} entries
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage(Math.max(1, current - 1))} disabled={current === 1}
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
        {getPageNumbers(current, total).map((page, idx) =>
          page === '...'
            ? <span key={`e-${idx}`} className="px-1 text-gray-500 text-xs">...</span>
            : <button key={page} onClick={() => setPage(page as number)}
                className={`px-2 py-1 rounded text-xs ${current === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>
                {page}
              </button>
        )}
        <button onClick={() => setPage(Math.min(total, current + 1))} disabled={current === total || total === 0}
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">

          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Process Overtime Per Cut-Off</h1>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">

            {/* Information Box */}
            <div className="mb-6 bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-3">
                    Process overtime hours based on specified cut-off dates for selected employee groups. Configure overtime processing efficiently within defined date ranges.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {['Select groups and employees','Define date range and overtime date','Specify overtime cut-off','Update to apply processing'].map(t => (
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
                  <tab.icon className="w-4 h-4" />{tab.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Left — Group list */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <label className="text-sm text-gray-700">Search:</label>
                  <input type="text" value={groupSearchTerm}
                    onChange={e => setGroupSearchTerm(e.target.value)}
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
                            <input type="checkbox" checked={selectedGroups.includes(item.id)}
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
                {renderPagination(currentGroupPage, totalGroupPages, setCurrentGroupPage, startGroupIndex, filteredGroups.length)}
              </div>

              {/* Right — Employee list + date fields */}
              <div className="space-y-6">

                {/* Employee list */}
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
                        {loadingEmployees
                          ? <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-400">Loading employees…</td></tr>
                          : paginatedEmployees.length === 0
                            ? <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-400">No employees found.</td></tr>
                            : paginatedEmployees.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-2">
                                    <input type="checkbox" checked={selectedEmployees.includes(item.id)}
                                      onChange={() => handleEmployeeToggle(item.id)}
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900">{item.code}</td>
                                  <td className="px-4 py-2 text-sm text-gray-600">{item.name}</td>
                                </tr>
                              ))
                        }
                      </tbody>
                    </table>
                  </div>
                  {renderPagination(currentEmpPage, totalEmployeePages, setCurrentEmpPage, startEmployeeIndex, filteredEmployees.length)}

                  {/* Status filter */}
                  <div className="mt-4 flex items-center gap-6">
                    {(['active','inactive','all'] as const).map(s => (
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

                {/* Date Range */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700 w-32">Date From:</label>
                    <input type="text" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32" />
                    <CalendarPopover date={dateFrom} onChange={setDateFrom} />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700 w-32">Date To:</label>
                    <input type="text" value={dateTo} onChange={e => setDateTo(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32" />
                    <CalendarPopover date={dateTo} onChange={setDateTo} />
                  </div>
                </div>

                {/* Overtime Date + Update */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700 w-32">Overtime Date:</label>
                    <input type="text" value={overtimeDate} onChange={e => setOvertimeDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32" />
                    <CalendarPopover date={overtimeDate} onChange={setOvertimeDate} />
                  </div>
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button onClick={handleUpdate} disabled={isUpdating}
                      className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      <Save className="w-4 h-4" />{isUpdating ? 'Updating…' : 'Update'}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
