import { useState, useEffect, useCallback } from 'react';
import { Check, Search, X, Calendar as CalendarIcon, Users, Building2, Briefcase, CalendarClock, Wallet, Grid, RefreshCw } from 'lucide-react';
import { CalendarPopover } from '../Modals/CalendarPopover';
import { Footer } from '../Footer/Footer';
import { ApiService, showSuccessModal, showErrorModal } from '../../services/apiService';
import apiClient from '../../services/apiClient';

interface GroupItem { id: number; code: string; description: string; }
interface EmployeeItem { id: number; code: string; name: string; }
interface RestDayRecord { id: number; from: string; to: string; restDay1: string; restDay2: string; restDay3: string; }

// Note: UpdateBatchRestDayPage uses 6 tabs (no Division, Unit)
type TabName = 'TK Group' | 'Branch' | 'Department' | 'Group Schedule' | 'Pay House' | 'Section';

const TABS: { name: TabName; icon: React.ComponentType<any> }[] = [
  { name: 'TK Group', icon: Users }, { name: 'Branch', icon: Building2 },
  { name: 'Department', icon: Briefcase }, { name: 'Group Schedule', icon: CalendarClock },
  { name: 'Pay House', icon: Wallet }, { name: 'Section', icon: Grid },
];

const EMPTY_SELECTION: Record<TabName, number[]> = {
  'TK Group': [], 'Branch': [], 'Department': [], 'Group Schedule': [], 'Pay House': [], 'Section': [],
};

const DAY_OPTIONS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function UpdateBatchRestDayPage() {
  const [activeTab,          setActiveTab]          = useState<TabName>('TK Group');
  const [statusFilter,       setStatusFilter]       = useState<'active' | 'inactive' | 'all'>('active');
  const [groupSearchTerm,    setGroupSearchTerm]    = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [restDayMode,        setRestDayMode]        = useState<'fixed' | 'variable' | 'restday-setup'>('fixed');
  const [deleteExisting,     setDeleteExisting]     = useState(false);
  const [isUpdating,         setIsUpdating]         = useState(false);
  const itemsPerPage = 10;

  // Fixed mode
  const [restDay1Fixed, setRestDay1Fixed] = useState('');
  const [restDay2Fixed, setRestDay2Fixed] = useState('');
  const [restDay3Fixed, setRestDay3Fixed] = useState('');

  // Variable mode
  const [dateFrom,         setDateFrom]         = useState('');
  const [dateTo,           setDateTo]           = useState('');
  const [restDay1Variable, setRestDay1Variable] = useState('');
  const [restDay2Variable, setRestDay2Variable] = useState('');
  const [restDay3Variable, setRestDay3Variable] = useState('');
  const [restDayRecords,   setRestDayRecords]   = useState<RestDayRecord[]>([]);

  // RestDay Setup mode
  const [refNo,        setRefNo]        = useState('');
  const [dateFromSetup, setDateFromSetup] = useState('');
  const [dateToSetup,   setDateToSetup]   = useState('');

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
  const [groupScheduleItems,  setGroupScheduleItems] = useState<GroupItem[]>([]);
  const [payHouseItems,       setPayHouseItems]      = useState<GroupItem[]>([]);
  const [sectionItems,        setSectionItems]       = useState<GroupItem[]>([]);
  const [employeeItems,       setEmployeeItems]      = useState<EmployeeItem[]>([]);
  const [loadingEmployees,    setLoadingEmployees]   = useState(false);

  useEffect(() => { setCurrentGroupPage(1); }, [activeTab]);

  useEffect(() => {
    const load = async () => {
      try {
        const [tks, bra, dep, grp, pay, sec] = await Promise.all([
          apiClient.get('/Fs/Process/TimeKeepGroupSetUp'), apiClient.get('/Fs/Employment/BranchSetUp'),
          apiClient.get('/Fs/Employment/DepartmentSetUp'), apiClient.get('/Fs/Employment/GroupSetUp'),
          apiClient.get('/Fs/Employment/PayHouseSetUp'),   apiClient.get('/Fs/Employment/SectionSetUp'),
        ]);
        const map = (data: any[], idKey: string, codeKey: string, descKey: string): GroupItem[] =>
          (Array.isArray(data) ? data : []).map(i => ({ id: i[idKey] ?? i.ID ?? i.id ?? 0, code: i[codeKey] ?? i.code ?? '', description: i[descKey] ?? i.description ?? '' }));
        setTKSGroupItems(map(tks.data,'ID','groupCode','groupDescription'));
        setBranchItems(map(bra.data,'braID','braCode','braDesc'));
        setDepartmentItems(map(dep.data,'depID','depCode','depDesc'));
        setGroupScheduleItems(map(grp.data,'grpSchID','grpCode','grpDesc'));
        setPayHouseItems(map(pay.data,'lineID','lineCode','lineDesc'));
        setSectionItems(map(sec.data,'secID','secCode','secDesc'));
      } catch (err) { console.error('Failed to load group lists:', err); }
    };
    load();
  }, []);

  const getCurrentData = useCallback((): GroupItem[] => {
    switch (activeTab) {
      case 'Branch': return branchItems; case 'Department': return departmentItems;
      case 'Group Schedule': return groupScheduleItems; case 'Pay House': return payHouseItems;
      case 'Section': return sectionItems; default: return tkGroupItems;
    }
  }, [activeTab, tkGroupItems, branchItems, departmentItems, groupScheduleItems, payHouseItems, sectionItems]);

  const buildSpParams = useCallback((tab: TabName, selectedIds: number[], allItems: GroupItem[], status: 'active' | 'inactive' | 'all') => {
    const codes = allItems.filter(i => selectedIds.includes(i.id)).map(i => i.code).join(',');
    return {
      Transaction: status === 'active' ? 'Active' : status === 'inactive' ? 'InActive' : 'All',
      GroupCodes: tab === 'TK Group' ? codes : '', Branches: tab === 'Branch' ? codes : '',
      Divisions: '', Departments: tab === 'Department' ? codes : '',
      Sections: tab === 'Section' ? codes : '', Units: '', Lines: '', Areas: '', Locations: '',
      GroupSchedules: tab === 'Group Schedule' ? codes : '',
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
      case 'Group Schedule': return 'Group Schedule Selection';
      case 'Pay House': return 'Pay House Selection';
      case 'Section': return 'Section Selection';
      default: return 'Selection';
    }
  };  

  const currentItems    = getCurrentData();
  const filteredGroups  = currentItems.filter(i => i.code.toLowerCase().includes(groupSearchTerm.toLowerCase()) || i.description.toLowerCase().includes(groupSearchTerm.toLowerCase()));
  const totalGroupPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const startGroupIndex = (currentGroupPage - 1) * itemsPerPage;
  const endGroupIndex   = startGroupIndex + itemsPerPage;
  const paginatedGroups = filteredGroups.slice(startGroupIndex, endGroupIndex);

  const filteredEmployees  = employeeItems.filter(e => e.code.toLowerCase().includes(employeeSearchTerm.toLowerCase()) || e.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()));
  const totalEmployeePages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startEmpIndex      = (currentEmpPage - 1) * itemsPerPage;
  const endEmpIndex        = startEmpIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startEmpIndex, endEmpIndex);

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

  const handleAddRecord = () => {
    if (dateFrom && dateTo) {
      setRestDayRecords(prev => [...prev, { id: Date.now(), from: dateFrom, to: dateTo, restDay1: restDay1Variable, restDay2: restDay2Variable, restDay3: restDay3Variable }]);
      setDateFrom(''); setDateTo('');
    }
  };

  const resetForm = () => { setSelectedGroupsMap({ ...EMPTY_SELECTION }); setSelectedEmployees([]); };

  const handleUpdate = async () => {
    if (!selectedEmployees.length) { await showErrorModal('Please select employee/s to update.'); return; }
    if (restDayMode === 'fixed') {
      if (restDay1Fixed === restDay2Fixed || restDay1Fixed === restDay3Fixed || restDay2Fixed === restDay3Fixed) {
        await showErrorModal('Restdays must not be equal.'); return;
      }
    } else if (restDayMode === 'variable') {
      if (!dateFrom || !dateTo) { await showErrorModal('Please select Date From and Date To.'); return; }
      if (!refNo) { await showErrorModal('Variable restday must add atleast 1 item.'); return; }
    } else if (restDayMode === 'restday-setup') {
      if (!refNo) { await showErrorModal('Reference number must not be empty.'); return; }
    }
    try {
      setIsUpdating(true);
      const payload = {
        empCodes: selectedEmployees.map(id => employeeItems.find(e => e.id === id)?.code ?? String(id)),
        restDayMode, deleteExisting, restDay1Fixed, restDay2Fixed, restDay3Fixed,
        restDayRecords, refNo, dateFromSetup, dateToSetup,
      };
      const res = await apiClient.post('/Utilities/UpdateBatchRestDay', payload);
      if (ApiService.isApiSuccess(res)) { await showSuccessModal('Successfully updated Batch Rest Day.'); resetForm(); }
    } catch { await showErrorModal('Failed to update records'); }
    finally { setIsUpdating(false); }
  };

  const renderPagination = (current: number, total: number, setPage: (p: number) => void, startIdx: number, endIdx: number, totalCount: number) => (
    <div className="flex items-center justify-between mt-3">
      <span className="text-xs text-gray-500">Showing {totalCount === 0 ? 0 : startIdx + 1} to {Math.min(endIdx, totalCount)} of {totalCount} entries</span>
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

  const DaySelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <select value={value} onChange={e => onChange(e.target.value)} className="flex-1 px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
      <option value=""></option>
      {DAY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
    </select>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Update Batch Rest Day</h1>
          </div>
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">

            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center"><CalendarIcon className="w-5 h-5 text-white" /></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-3">Update employee rest day assignments in batch. Choose between fixed, variable, or by rest day setup configuration.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {['Bulk update rest days for multiple employees','Configure fixed or variable rest day schedules','Filter by employee status','Select groups and employees'].map(t => (
                      <div key={t} className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" /><span className="text-gray-600">{t}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 flex items-center gap-1 border-b border-gray-200 flex-wrap">
              {TABS.map(tab => (
                <button key={tab.name} onClick={() => setActiveTab(tab.name)}
                  className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${activeTab === tab.name ? 'font-medium bg-blue-600 text-white -mb-px' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  <tab.icon className="w-4 h-4" />{tab.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left — Group list */}
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
                {renderPagination(currentGroupPage, totalGroupPages, setCurrentGroupPage, startGroupIndex, endGroupIndex, filteredGroups.length)}
              </div>

              {/* Right */}
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
                  {renderPagination(currentEmpPage, totalEmployeePages, setCurrentEmpPage, startEmpIndex, endEmpIndex, filteredEmployees.length)}
                  <div className="mt-4 flex items-center gap-6">
                    {(['active','inactive','all'] as const).map(s => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="statusFilter" value={s} checked={statusFilter === s} onChange={() => setStatusFilter(s)} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                        <span className="text-sm text-gray-700">{s === 'inactive' ? 'In Active' : s.charAt(0).toUpperCase() + s.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rest Day Configuration */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <div className="space-y-6">

                    {/* Fixed */}
                    <div className="border-b border-gray-200 pb-4">
                      <label className="flex items-center gap-2 cursor-pointer mb-4">
                        <input type="radio" name="restDayMode" checked={restDayMode === 'fixed'} onChange={() => setRestDayMode('fixed')} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                        <span className="text-sm text-gray-700">Fixed</span>
                      </label>
                      {restDayMode === 'fixed' && (
                        <div className="ml-6 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2"><label className="text-sm text-gray-700 whitespace-nowrap">Rest Day 1</label><DaySelect value={restDay1Fixed} onChange={setRestDay1Fixed} /></div>
                            <div className="flex items-center gap-2"><label className="text-sm text-gray-700 whitespace-nowrap">Rest Day 3</label><DaySelect value={restDay3Fixed} onChange={setRestDay3Fixed} /></div>
                          </div>
                          <div className="flex items-center gap-2"><label className="text-sm text-gray-700 whitespace-nowrap">Rest Day 2</label><DaySelect value={restDay2Fixed} onChange={setRestDay2Fixed} /></div>
                        </div>
                      )}
                    </div>

                    {/* Variable */}
                    <div className="border-b border-gray-200 pb-4">
                      <label className="flex items-center gap-2 cursor-pointer mb-4">
                        <input type="radio" name="restDayMode" checked={restDayMode === 'variable'} onChange={() => setRestDayMode('variable')} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                        <span className="text-sm text-gray-700">Variable</span>
                      </label>
                      {restDayMode === 'variable' && (
                        <div className="ml-6 space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button onClick={handleAddRecord} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">Add</button>
                            <label className="text-sm text-gray-700">Date From</label>
                            <input type="text" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 border border-gray-300 rounded text-sm w-28" />
                            <CalendarPopover date={dateFrom} onChange={setDateFrom} />
                            <label className="text-sm text-gray-700">Date To</label>
                            <input type="text" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 border border-gray-300 rounded text-sm w-28" />
                            <CalendarPopover date={dateTo} onChange={setDateTo} />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex items-center gap-1"><label className="text-sm text-gray-700 whitespace-nowrap">Rest Day 1</label><DaySelect value={restDay1Variable} onChange={setRestDay1Variable} /></div>
                            <div className="flex items-center gap-1"><label className="text-sm text-gray-700 whitespace-nowrap">Rest Day 2</label><DaySelect value={restDay2Variable} onChange={setRestDay2Variable} /></div>
                            <div className="flex items-center gap-1"><label className="text-sm text-gray-700 whitespace-nowrap">Rest Day 3</label><DaySelect value={restDay3Variable} onChange={setRestDay3Variable} /></div>
                          </div>
                          {restDayRecords.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                              <table className="w-full">
                                <thead className="bg-gray-100 border-b border-gray-200"><tr>
                                  {['From','To','Rest Day1','Rest Day2','Rest Day3'].map(h => <th key={h} className="px-3 py-2 text-left text-xs text-gray-600">{h}</th>)}
                                </tr></thead>
                                <tbody className="divide-y divide-gray-100">
                                  {restDayRecords.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50">
                                      <td className="px-3 py-2 text-sm text-gray-900">{r.from}</td>
                                      <td className="px-3 py-2 text-sm text-gray-900">{r.to}</td>
                                      <td className="px-3 py-2 text-sm text-gray-600">{r.restDay1}</td>
                                      <td className="px-3 py-2 text-sm text-gray-600">{r.restDay2}</td>
                                      <td className="px-3 py-2 text-sm text-gray-600">{r.restDay3}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* By RestDay Set Up */}
                    <div className="pb-4">
                      <label className="flex items-center gap-2 cursor-pointer mb-4">
                        <input type="radio" name="restDayMode" checked={restDayMode === 'restday-setup'} onChange={() => setRestDayMode('restday-setup')} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                        <span className="text-sm text-gray-700">By RestDay Set Up</span>
                      </label>
                      {restDayMode === 'restday-setup' && (
                        <div className="ml-6 space-y-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700">Ref No.</label>
                            <input type="text" value={refNo} onChange={e => setRefNo(e.target.value)} className="px-3 py-2 border border-gray-300 rounded text-sm w-32" />
                            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">Search</button>
                            <button onClick={() => setRefNo('')} className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"><X className="w-4 h-4" /></button>
                          </div>
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-700">Date From</label>
                              <input type="text" value={dateFromSetup} onChange={e => setDateFromSetup(e.target.value)} className="px-3 py-2 border border-gray-300 rounded text-sm w-32" />
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-700">Date To</label>
                              <input type="text" value={dateToSetup} onChange={e => setDateToSetup(e.target.value)} className="px-3 py-2 border border-gray-300 rounded text-sm w-32" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={deleteExisting} onChange={e => setDeleteExisting(e.target.checked)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-sm text-gray-700">Delete Existing Rest Day</span>
                      </label>
                      <button onClick={handleUpdate} disabled={isUpdating}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <RefreshCw className="w-4 h-4" />{isUpdating ? 'Updating…' : 'Update'}
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
    </div>
  );
}
