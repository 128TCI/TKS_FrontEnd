import { useState, useEffect, useCallback } from 'react';
import { Send, Check, Users, Building2, Briefcase, Network, CalendarClock, Wallet, Grid, Box } from 'lucide-react';
import { CalendarPopover } from '../Modals/CalendarPopover';
import { Footer } from '../Footer/Footer';
import { ApiService, showSuccessModal, showErrorModal } from '../../services/apiService';
import apiClient from '../../services/apiClient';

interface GroupItem { id: number; code: string; description: string; }
interface EmployeeItem { id: number; code: string; name: string; }

type TabName = 'TK Group' | 'Branch' | 'Department' | 'Division' | 'Group Schedule' | 'Pay House' | 'Section' | 'Unit';

const TABS: { name: TabName; icon: React.ComponentType<any> }[] = [
  { name: 'TK Group', icon: Users }, { name: 'Branch', icon: Building2 },
  { name: 'Department', icon: Briefcase }, { name: 'Division', icon: Network },
  { name: 'Group Schedule', icon: CalendarClock }, { name: 'Pay House', icon: Wallet },
  { name: 'Section', icon: Grid }, { name: 'Unit', icon: Box },
];

const EMPTY_SELECTION: Record<TabName, number[]> = {
  'TK Group': [], 'Branch': [], 'Department': [], 'Division': [],
  'Group Schedule': [], 'Pay House': [], 'Section': [], 'Unit': [],
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const EMPTY_OPTIONS = {
  tardiness: false, otherEarnings: false, noOfDaysWork: false, selectAll: false,
  undertime: false, overtime: false, leaveAndAbsences: false, lateFiling: false,
};

export function PostProcessedTimekeepingPage() {
  const [activeTab,          setActiveTab]          = useState<TabName>('TK Group');
  const [statusFilter,       setStatusFilter]       = useState<'active' | 'inactive' | 'all'>('active');
  const [dateFrom,           setDateFrom]           = useState('');
  const [dateTo,             setDateTo]             = useState('');
  const [year,               setYear]               = useState('');
  const [month,              setMonth]              = useState('January');
  const [noOfTardiness,      setNoOfTardiness]      = useState('');
  const [gracePeriod,        setGracePeriod]        = useState('');
  const [groupSearchTerm,    setGroupSearchTerm]    = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [options,            setOptions]            = useState(EMPTY_OPTIONS);
  const [isUpdating,         setIsUpdating]         = useState(false);
  const itemsPerPage = 10;

  const [selectedGroupsMap, setSelectedGroupsMap] = useState<Record<TabName, number[]>>(EMPTY_SELECTION);
  const selectedGroups = selectedGroupsMap[activeTab] ?? [];
  const setSelectedGroups = (updater: number[] | ((prev: number[]) => number[])) =>
    setSelectedGroupsMap(prev => ({ ...prev, [activeTab]: typeof updater === 'function' ? updater(prev[activeTab]) : updater }));

  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [currentGroupPage,  setCurrentGroupPage]  = useState(1);
  const [currentEmpPage,    setCurrentEmpPage]    = useState(1);

  const [tkGroupItems,        setTKSGroupItems]      = useState<GroupItem[]>([]);
  const [branchItems,         setBranchItems]        = useState<GroupItem[]>([]);
  const [departmentItems,     setDepartmentItems]    = useState<GroupItem[]>([]);
  const [divisionItems,       setDivisionItems]      = useState<GroupItem[]>([]);
  const [groupScheduleItems,  setGroupScheduleItems] = useState<GroupItem[]>([]);
  const [payHouseItems,       setPayHouseItems]      = useState<GroupItem[]>([]);
  const [sectionItems,        setSectionItems]       = useState<GroupItem[]>([]);
  const [unitItems,           setUnitItems]          = useState<GroupItem[]>([]);
  const [employeeItems,       setEmployeeItems]      = useState<EmployeeItem[]>([]);
  const [loadingEmployees,    setLoadingEmployees]   = useState(false);

  useEffect(() => { setCurrentGroupPage(1); }, [activeTab]);

  useEffect(() => {
    const load = async () => {
      try {
        const [tks, bra, dep, div, grp, pay, sec, unit] = await Promise.all([
          apiClient.get('/Fs/Process/TimeKeepGroupSetUp'), apiClient.get('/Fs/Employment/BranchSetUp'),
          apiClient.get('/Fs/Employment/DepartmentSetUp'), apiClient.get('/Fs/Employment/DivisionSetUp'),
          apiClient.get('/Fs/Employment/GroupSetUp'),      apiClient.get('/Fs/Employment/PayHouseSetUp'),
          apiClient.get('/Fs/Employment/SectionSetUp'),    apiClient.get('/Fs/Employment/UnitSetUp'),
        ]);
        const map = (data: any[], idKey: string, codeKey: string, descKey: string): GroupItem[] =>
          (Array.isArray(data) ? data : []).map(i => ({ id: i[idKey] ?? i.ID ?? i.id ?? 0, code: i[codeKey] ?? i.code ?? '', description: i[descKey] ?? i.description ?? '' }));
        setTKSGroupItems(map(tks.data,'ID','groupCode','groupDescription'));
        setBranchItems(map(bra.data,'braID','braCode','braDesc'));
        setDepartmentItems(map(dep.data,'depID','depCode','depDesc'));
        setDivisionItems(map(div.data,'divID','divCode','divDesc'));
        setGroupScheduleItems(map(grp.data,'grpSchID','grpCode','grpDesc'));
        setPayHouseItems(map(pay.data,'lineID','lineCode','lineDesc'));
        setSectionItems(map(sec.data,'secID','secCode','secDesc'));
        setUnitItems(map(unit.data,'unitID','unitCode','unitDesc'));
      } catch (err) { console.error('Failed to load group lists:', err); }
    };
    load();
  }, []);

  const getCurrentData = useCallback((): GroupItem[] => {
    switch (activeTab) {
      case 'Branch': return branchItems; case 'Department': return departmentItems;
      case 'Division': return divisionItems; case 'Group Schedule': return groupScheduleItems;
      case 'Pay House': return payHouseItems; case 'Section': return sectionItems;
      case 'Unit': return unitItems; default: return tkGroupItems;
    }
  }, [activeTab, tkGroupItems, branchItems, departmentItems, divisionItems, groupScheduleItems, payHouseItems, sectionItems, unitItems]);

  const buildSpParams = useCallback((tab: TabName, selectedIds: number[], allItems: GroupItem[], status: 'active' | 'inactive' | 'all') => {
    const codes = allItems.filter(i => selectedIds.includes(i.id)).map(i => i.code).join(',');
    return {
      Transaction: status === 'active' ? 'Active' : status === 'inactive' ? 'InActive' : 'All',
      GroupCodes: tab === 'TK Group' ? codes : '', Branches: tab === 'Branch' ? codes : '',
      Divisions: tab === 'Division' ? codes : '', Departments: tab === 'Department' ? codes : '',
      Sections: tab === 'Section' ? codes : '', Units: tab === 'Unit' ? codes : '',
      Lines: '', Areas: '', Locations: '', GroupSchedules: tab === 'Group Schedule' ? codes : '',
    };
  }, []);

  const fetchFilteredEmployees = useCallback(async (tab: TabName, selectedIds: number[], allItems: GroupItem[], status: 'active' | 'inactive' | 'all') => {
    setLoadingEmployees(true); setCurrentEmpPage(1);
    try {
      if (selectedIds.length === 0) {
        const res = await apiClient.get('/Maintenance/EmployeeMasterFile');
        setEmployeeItems((Array.isArray(res.data) ? res.data : []).map((item: any): EmployeeItem => ({
          id: item.empID ?? item.ID ?? item.id ?? 0, code: item.empCode ?? item.code ?? '',
          name: `${item.lName ?? ''}, ${item.fName ?? ''} ${item.mName ?? ''}`.trim(),
        })));
      } else {
        const res = await apiClient.post('/Utilities/GetFilteredEmployees', buildSpParams(tab, selectedIds, allItems, status));
        setEmployeeItems((Array.isArray(res.data) ? res.data : []).map((item: any): EmployeeItem => ({
          id: item.empID ?? item.ID ?? item.id ?? 0, code: item.empCode ?? item.EmpCode ?? item.code ?? '',
          name: `${item.lName ?? item.LName ?? ''}, ${item.fName ?? item.FName ?? ''} ${item.mName ?? item.MName ?? ''}`.trim(),
        })));
      }
    } catch { setEmployeeItems([]); } finally { setLoadingEmployees(false); }
  }, [buildSpParams]);

  useEffect(() => {
    fetchFilteredEmployees(activeTab, selectedGroups, getCurrentData(), statusFilter);
    setSelectedEmployees([]);
  }, [activeTab, selectedGroups, statusFilter]); // eslint-disable-line

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
    
  const currentItems    = getCurrentData();
  const filteredGroups  = currentItems.filter(i => i.code.toLowerCase().includes(groupSearchTerm.toLowerCase()) || i.description.toLowerCase().includes(groupSearchTerm.toLowerCase()));
  const totalGroupPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const startGroupIndex = (currentGroupPage - 1) * itemsPerPage;
  const paginatedGroups = filteredGroups.slice(startGroupIndex, startGroupIndex + itemsPerPage);

  const filteredEmployees  = employeeItems.filter(e => e.code.toLowerCase().includes(employeeSearchTerm.toLowerCase()) || e.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()));
  const totalEmployeePages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startEmpIndex      = (currentEmpPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startEmpIndex, startEmpIndex + itemsPerPage);

  const getPageNumbers = (current: number, total: number) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | string)[] = [];
    if (current <= 4) { for (let i = 1; i <= 5; i++) pages.push(i); pages.push('...'); pages.push(total); }
    else if (current >= total - 3) { pages.push(1); pages.push('...'); for (let i = total - 4; i <= total; i++) pages.push(i); }
    else { pages.push(1); pages.push('...'); for (let i = current - 1; i <= current + 1; i++) pages.push(i); pages.push('...'); pages.push(total); }
    return pages;
  };

  const handleGroupToggle        = (id: number) => setSelectedGroups(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const handleEmployeeToggle     = (id: number) => setSelectedEmployees(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const handleSelectAllGroups    = () => setSelectedGroups(selectedGroups.length === filteredGroups.length ? [] : filteredGroups.map(g => g.id));
  const handleSelectAllEmployees = () => setSelectedEmployees(selectedEmployees.length === filteredEmployees.length ? [] : filteredEmployees.map(e => e.id));

  const handleOptionChange = (option: keyof typeof EMPTY_OPTIONS) => {
    if (option === 'selectAll') {
      const newValue = !options.selectAll;
      setOptions({ tardiness: newValue, otherEarnings: newValue, noOfDaysWork: newValue, selectAll: newValue,
        undertime: newValue, overtime: newValue, leaveAndAbsences: newValue, lateFiling: newValue });
    } else {
      setOptions(prev => ({ ...prev, [option]: !prev[option] }));
    }
  };

  const resetForm = () => {
    setSelectedGroupsMap({ ...EMPTY_SELECTION });
    setSelectedEmployees([]);
    setDateFrom(''); setDateTo('');
    setOptions({ ...EMPTY_OPTIONS });
  };

  const handlePost = async () => {
    if (!selectedEmployees.length) { await showErrorModal('Please select employee/s to update.'); return; }
    if (!dateFrom || !dateTo)      { await showErrorModal('Please select Date From and Date To.'); return; }
    if (!Object.values(options).some(Boolean)) { await showErrorModal('Please check atleast 1 transaction to post.'); return; }
    try {
      setIsUpdating(true);
      const payload = {
        empCodes: selectedEmployees.map(id => employeeItems.find(e => e.id === id)?.code ?? String(id)),
        dateFrom: new Date(dateFrom).toISOString(),
        dateTo:   new Date(dateTo).toISOString(),
        year, month, noOfTardiness, gracePeriod,
        updateOptions: options,
      };
      const res = await apiClient.post('/Utilities/PostProcessedTimekeeping', payload);
      if (ApiService.isApiSuccess(res)) { await showSuccessModal('Successfully posted processed timekeeping.'); resetForm(); }
    } catch { await showErrorModal('Failed to update records'); }
    finally { setIsUpdating(false); }
  };

  const renderPagination = (current: number, total: number, setPage: (p: number) => void, startIdx: number, totalCount: number) => (
    <div className="flex items-center justify-between mt-3">
      <span className="text-xs text-gray-500">Showing {totalCount === 0 ? 0 : startIdx + 1} to {Math.min(startIdx + itemsPerPage, totalCount)} of {totalCount} entries</span>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage(Math.max(1, current - 1))} disabled={current === 1} className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
        {getPageNumbers(current, total).map((page, idx) =>
          page === '...' ? <span key={`e-${idx}`} className="px-1 text-gray-500 text-xs">...</span>
          : <button key={page} onClick={() => setPage(page as number)} className={`px-2 py-1 rounded text-xs ${current === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>{page}</button>
        )}
        <button onClick={() => setPage(Math.min(total, current + 1))} disabled={current === total || total === 0} className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
      </div>
    </div>
  );

  const OPTIONS_LIST: { key: keyof typeof EMPTY_OPTIONS; label: string }[] = [
    { key: 'tardiness',       label: 'Tardiness'         },
    { key: 'leaveAndAbsences',label: 'Leave and Absences'},
    { key: 'lateFiling',      label: 'Allowances'        },
    { key: 'undertime',       label: 'Undertime'         },
    { key: 'noOfDaysWork',    label: 'No. Of Days Work'  },
    { key: 'overtime',        label: 'Overtime'          },
    { key: 'selectAll',       label: 'Select All'        },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Post Processed Timekeeping</h1>
          </div>
          <div className="bg-white rounded-b-lg shadow-lg p-6">

            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center"><Send className="w-5 h-5 text-white" /></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-3">Post processed timekeeping records for selected employee groups. Select transaction types and date range before posting.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {['Select groups and employees','Choose transaction types to post','Set date range and period','Post to finalize records'].map(t => (
                      <div key={t} className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" /><span className="text-gray-600">{t}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 flex items-center gap-1 border-b border-gray-200 flex-wrap">
              {TABS.map(tab => (
                <button key={tab.name} onClick={() => setActiveTab(tab.name)}
                  className={`px-4 py-2 text-sm flex items-center gap-2 rounded-t-lg transition-colors ${activeTab === tab.name ? 'font-medium bg-blue-600 text-white -mb-px' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  <tab.icon className="w-4 h-4" />{tab.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900">{getSelectionTitle()}</h3>
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">{selectedGroups.length} selected</span>
                </div>                  
                <div className="mb-4 flex items-center gap-3">
                  <label className="text-sm text-gray-700">Search:</label>
                  <input type="text" value={groupSearchTerm} onChange={e => { setGroupSearchTerm(e.target.value); setCurrentGroupPage(1); }} className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200"><tr>
                      <th className="px-4 py-2 text-left text-xs text-gray-600"><input type="checkbox" checked={selectedGroups.length === filteredGroups.length && filteredGroups.length > 0} onChange={handleSelectAllGroups} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /></th>
                      <th className="px-4 py-2 text-left text-xs text-gray-600">Code</th>
                      <th className="px-4 py-2 text-left text-xs text-gray-600">Description</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedGroups.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2"><input type="checkbox" checked={selectedGroups.includes(item.id)} onChange={() => handleGroupToggle(item.id)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /></td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.code}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{item.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {renderPagination(currentGroupPage, totalGroupPages, setCurrentGroupPage, startGroupIndex, filteredGroups.length)}
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900">Employees</h3>
                    <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">{selectedEmployees.length} selected</span>
                  </div>                   
                  <div className="mb-4 flex items-center gap-3">
                    <label className="text-sm text-gray-700">Search:</label>
                    <input type="text" value={employeeSearchTerm} onChange={e => { setEmployeeSearchTerm(e.target.value); setCurrentEmpPage(1); }} className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200"><tr>
                        <th className="px-4 py-2 text-left text-xs text-gray-600"><input type="checkbox" checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0} onChange={handleSelectAllEmployees} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /></th>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">Code</th>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">Name</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-100">
                        {loadingEmployees ? (<tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-400">Loading employees…</td></tr>)
                        : paginatedEmployees.length === 0 ? (<tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-400">No employees found.</td></tr>)
                        : paginatedEmployees.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2"><input type="checkbox" checked={selectedEmployees.includes(item.id)} onChange={() => handleEmployeeToggle(item.id)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /></td>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.code}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {renderPagination(currentEmpPage, totalEmployeePages, setCurrentEmpPage, startEmpIndex, filteredEmployees.length)}
                  <div className="mt-4 flex items-center gap-6">
                    {(['active','inactive','all'] as const).map(s => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="statusFilter" value={s} checked={statusFilter === s} onChange={() => setStatusFilter(s)} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                        <span className="text-sm text-gray-700">{s === 'inactive' ? 'In Active' : s.charAt(0).toUpperCase() + s.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Period fields */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700 w-20">Year:</label>
                      <input type="text" value={year} onChange={e => setYear(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700 w-20">Month:</label>
                      <select value={month} onChange={e => setMonth(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700 w-20 whitespace-nowrap">No. Of Tardiness:</label>
                      <input type="text" value={noOfTardiness} onChange={e => setNoOfTardiness(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700 w-20">Grace Period:</label>
                      <input type="text" value={gracePeriod} onChange={e => setGracePeriod(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700 w-20">Date From:</label>
                    <input type="text" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32" />
                    <CalendarPopover date={dateFrom} onChange={setDateFrom} />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700 w-20">Date To:</label>
                    <input type="text" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32" />
                    <CalendarPopover date={dateTo} onChange={setDateTo} />
                  </div>
                </div>

                {/* Options */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <h2 className="text-gray-700 mb-4">Option</h2>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-8">
                    {OPTIONS_LIST.map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={options[key]} onChange={() => handleOptionChange(key)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
                    <button onClick={handlePost} disabled={isUpdating}
                      className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      <Send className="w-4 h-4" />{isUpdating ? 'Posting…' : 'Post'}
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
