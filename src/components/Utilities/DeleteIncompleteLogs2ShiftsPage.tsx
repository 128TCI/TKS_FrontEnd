import { useState, useEffect } from 'react';
import { Users, Building2, Briefcase, Network, CalendarClock, Wallet, Trash2 } from 'lucide-react';
import { Footer } from '../Footer/Footer';
import { CalendarPopover } from '../Modals/CalendarPopover';
import apiClient from '../../services/apiClient';
import Swal from 'sweetalert2';

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

type TabName = 'TK Group' | 'Branch' | 'Department' | 'Division' | 'Group Schedule' | 'Pay House';

export function DeleteIncompleteLogs2ShiftsPage() {
  const formName = 'Delete Incomplete Logs 2 Shifts In A Day';

  // Tab state
  const [activeTab, setActiveTab] = useState<TabName>('TK Group');

  // Group data per tab
  const [tkGroupItems, setTKGroupItems] = useState<GroupItem[]>([]);
  const [branchItems, setBranchItems] = useState<GroupItem[]>([]);
  const [departmentItems, setDepartmentItems] = useState<GroupItem[]>([]);
  const [divisionItems, setDivisionItems] = useState<GroupItem[]>([]);
  const [groupScheduleItems, setGroupScheduleItems] = useState<GroupItem[]>([]);
  const [payHouseItems, setPayHouseItems] = useState<GroupItem[]>([]);

  // Employee data
  const [employeeItems, setEmployeeItems] = useState<EmployeeItem[]>([]);

  // Selection state
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

  // Search state
  const [groupSearch, setGroupSearch] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');

  // Pagination
  const [currentGroupPage, setCurrentGroupPage] = useState(1);
  const [currentEmpPage, setCurrentEmpPage] = useState(1);
  const itemsPerPage = 10;

  // Date range
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Status filter
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('active');

  // Reset group page when tab changes
  useEffect(() => {
    setCurrentGroupPage(1);
    setGroupSearch('');
  }, [activeTab]);

  // --- Data Fetching ---
  useEffect(() => {
    apiClient.get('/Fs/Process/TimeKeepGroupSetUp').then(res =>
      setTKGroupItems(res.data.map((item: any) => ({
        id: item.ID || item.id,
        code: item.groupCode || item.code,
        description: item.groupDescription || item.description,
      })))
    ).catch(console.error);
  }, []);

  useEffect(() => {
    apiClient.get('/Fs/Employment/BranchSetUp').then(res =>
      setBranchItems(res.data.map((item: any) => ({
        id: item.braID || item.ID,
        code: item.braCode || item.code,
        description: item.braDesc || item.description,
      })))
    ).catch(console.error);
  }, []);

  useEffect(() => {
    apiClient.get('/Fs/Employment/DepartmentSetUp').then(res =>
      setDepartmentItems(res.data.map((item: any) => ({
        id: item.depID || item.ID,
        code: item.depCode || item.code,
        description: item.depDesc || item.description,
      })))
    ).catch(console.error);
  }, []);

  useEffect(() => {
    apiClient.get('/Fs/Employment/DivisionSetUp').then(res =>
      setDivisionItems(res.data.map((item: any) => ({
        id: item.divID || item.ID,
        code: item.divCode || item.code,
        description: item.divDesc || item.description,
      })))
    ).catch(console.error);
  }, []);

  useEffect(() => {
    apiClient.get('/Fs/Employment/GroupSetUp').then(res => {
      const list = Array.isArray(res.data) ? res.data : [];
      setGroupScheduleItems(list.map((item: any) => ({
        id: item.grpSchID || item.id || item.ID,
        code: item.grpCode || item.code,
        description: item.grpDesc || item.description,
      })));
    }).catch(console.error);
  }, []);

  useEffect(() => {
    apiClient.get('/Fs/Employment/PayHouseSetUp').then(res => {
      const list = Array.isArray(res.data) ? res.data : [];
      setPayHouseItems(list.map((item: any) => ({
        id: item.lineID ?? item.ID ?? item.id,
        code: item.lineCode ?? item.code,
        description: item.lineDesc ?? item.Description ?? item.description,
      })));
    }).catch(console.error);
  }, []);

  useEffect(() => {
    apiClient.get('/Maintenance/EmployeeMasterFile').then(res => {
      const list = Array.isArray(res.data) ? res.data : [];
      setEmployeeItems(list.map((item: any) => ({
        id: item.empID ?? item.ID ?? item.id,
        code: item.empCode || item.code || '',
        name: `${item.lName || ''}, ${item.fName || ''} ${item.mName || ''}`.trim(),
      })));
    }).catch(console.error);
  }, []);

  // --- Current tab data ---
  const getCurrentData = (): GroupItem[] => {
    switch (activeTab) {
      case 'Branch': return branchItems;
      case 'Department': return departmentItems;
      case 'Division': return divisionItems;
      case 'Group Schedule': return groupScheduleItems;
      case 'Pay House': return payHouseItems;
      default: return tkGroupItems;
    }
  };

  const currentItems = getCurrentData();

  const filteredGroups = currentItems.filter(item =>
    item.code.toLowerCase().includes(groupSearch.toLowerCase()) ||
    item.description.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const filteredEmployees = employeeItems.filter(emp =>
    emp.code.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.name.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  // Group pagination
  const totalGroupPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const startGroupIndex = (currentGroupPage - 1) * itemsPerPage;
  const endGroupIndex = startGroupIndex + itemsPerPage;
  const paginatedGroups = filteredGroups.slice(startGroupIndex, endGroupIndex);

  // Employee pagination
  const totalEmpPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startEmpIndex = (currentEmpPage - 1) * itemsPerPage;
  const endEmpIndex = startEmpIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startEmpIndex, endEmpIndex);

  // Page number helpers
  const getPageNumbers = (current: number, total: number) => {
    const pages: (number | string)[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      }
    }
    return pages;
  };

  // Selection handlers
  const handleGroupToggle = (id: number) =>
    setSelectedGroups(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleEmpToggle = (id: number) =>
    setSelectedEmployees(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleSelectAllGroups = () =>
    setSelectedGroups(selectedGroups.length === filteredGroups.length ? [] : filteredGroups.map(g => g.id));

  const handleSelectAllEmployees = () =>
    setSelectedEmployees(selectedEmployees.length === filteredEmployees.length ? [] : filteredEmployees.map(e => e.id));

  // Delete handler
  const handleDelete = async () => {
    if (!selectedEmployees.length) {
      await Swal.fire({ icon: 'error', title: 'Error', text: 'Please select employee(s) to delete.', timer: 2000, showConfirmButton: true });
      return;
    }
    if (!dateFrom || !dateTo) {
      await Swal.fire({ icon: 'error', title: 'Error', text: 'Please select Date From and Date To.', timer: 2000, showConfirmButton: true });
      return;
    }

    const confirm = await Swal.fire({
      icon: 'warning',
      title: 'Confirm Delete',
      text: 'Are you sure you want to delete the selected records? This action cannot be undone.',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });

    if (!confirm.isConfirmed) return;

    try {
      await Swal.fire({ icon: 'success', title: 'Deleted', text: 'Records successfully deleted.', timer: 2000, showConfirmButton: false });
      setSelectedGroups([]);
      setSelectedEmployees([]);
      setDateFrom('');
      setDateTo('');
    } catch (error) {
      console.error(error);
      alert('Failed to delete records.');
    }
  };

  // Pagination renderer
  const renderPagination = (
    current: number,
    total: number,
    setPage: (p: number) => void,
    startIdx: number,
    endIdx: number,
    filteredCount: number
  ) => (
    <div className="flex items-center justify-between mt-3">
      <div className="text-gray-600 text-xs">
        Showing {filteredCount === 0 ? 0 : startIdx + 1} to {Math.min(endIdx, filteredCount)} of {filteredCount} entries
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => setPage(Math.max(current - 1, 1))}
          disabled={current === 1}
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {getPageNumbers(current, total).map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-gray-500 text-xs self-center">...</span>
          ) : (
            <button
              key={page}
              onClick={() => setPage(page as number)}
              className={`px-2 py-1 rounded text-xs ${current === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => setPage(Math.min(current + 1, total))}
          disabled={current === total || total === 0}
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );

  const tabs: { name: TabName; icon: React.ElementType }[] = [
    { name: 'TK Group', icon: Users },
    { name: 'Branch', icon: Building2 },
    { name: 'Department', icon: Briefcase },
    { name: 'Division', icon: Network },
    { name: 'Group Schedule', icon: CalendarClock },
    { name: 'Pay House', icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 p-6 relative z-0">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">{formName}</h1>
          </div>

          {/* Content */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative z-10">

            {/* Tabs */}
            <div className="mb-6 flex items-center gap-1 border-b border-gray-200 flex-wrap">
              {tabs.map(tab => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`px-4 py-2 text-sm flex items-center gap-2 rounded-t-lg transition-colors ${
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left — Group Table */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <label className="text-sm text-gray-700">Search:</label>
                  <input
                    type="text"
                    value={groupSearch}
                    onChange={e => { setGroupSearch(e.target.value); setCurrentGroupPage(1); }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">
                          <input
                            type="checkbox"
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
                      {paginatedGroups.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleGroupToggle(item.id)}>
                          <td className="px-4 py-2" onClick={e => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedGroups.includes(item.id)}
                              onChange={() => handleGroupToggle(item.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.code}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{item.description}</td>
                        </tr>
                      ))}
                      {paginatedGroups.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-400">No records found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {renderPagination(currentGroupPage, totalGroupPages, setCurrentGroupPage, startGroupIndex, endGroupIndex, filteredGroups.length)}
              </div>

              {/* Right — Employee Table + Date Range */}
              <div className="space-y-6">
                {/* Employee Table */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <label className="text-sm text-gray-700">Search:</label>
                    <input
                      type="text"
                      value={employeeSearch}
                      onChange={e => { setEmployeeSearch(e.target.value); setCurrentEmpPage(1); }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg overflow-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">
                            <input
                              type="checkbox"
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
                        {paginatedEmployees.map(emp => (
                          <tr key={emp.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleEmpToggle(emp.id)}>
                            <td className="px-4 py-2" onClick={e => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedEmployees.includes(emp.id)}
                                onChange={() => handleEmpToggle(emp.id)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                              />
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">{emp.code}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{emp.name}</td>
                          </tr>
                        ))}
                        {paginatedEmployees.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-400">No records found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {renderPagination(currentEmpPage, totalEmpPages, setCurrentEmpPage, startEmpIndex, endEmpIndex, filteredEmployees.length)}

                  {/* Status Filter */}
                  <div className="mt-4 flex items-center gap-6">
                    {(['active', 'inactive', 'all'] as const).map(val => (
                      <label key={val} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="statusFilter"
                          value={val}
                          checked={statusFilter === val}
                          onChange={() => setStatusFilter(val)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {val === 'inactive' ? 'In Active' : val.charAt(0).toUpperCase() + val.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <h2 className="text-gray-700 mb-4">Date Range</h2>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700 whitespace-nowrap">From:</label>
                      <input
                        placeholder="MM/DD/YY"
                        type="text"
                        value={dateFrom}
                        onChange={e => setDateFrom(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                      />
                      <CalendarPopover date={dateFrom} onChange={setDateFrom} />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700 whitespace-nowrap">To:</label>
                      <input
                        placeholder="MM/DD/YY"
                        type="text"
                        value={dateTo}
                        onChange={e => setDateTo(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                      />
                      <CalendarPopover date={dateTo} onChange={setDateTo} />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
                    <button
                      className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
                      onClick={handleDelete}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
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