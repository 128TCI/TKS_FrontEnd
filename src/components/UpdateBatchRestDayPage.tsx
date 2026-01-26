import { useState } from 'react';
import { Check, Search, X, Calendar as CalendarIcon, Users, Building2, Briefcase, CalendarClock, Wallet, Grid, RefreshCw } from 'lucide-react';
import { Footer } from './Footer/Footer';

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

interface RestDayRecord {
  id: number;
  from: string;
  to: string;
  restDay1: string;
  restDay2: string;
  restDay3: string;
}

export function UpdateBatchRestDayPage() {
  const [activeTab, setActiveTab] = useState<'TK Group' | 'Branch' | 'Department' | 'Group Schedule' | 'Pay House' | 'Section'>('TK Group');
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [currentGroupPage, setCurrentGroupPage] = useState(1);
  const [currentEmpPage, setCurrentEmpPage] = useState(1);
  const [restDayMode, setRestDayMode] = useState<'fixed' | 'variable' | 'restday-setup'>('fixed');
  const [deleteExisting, setDeleteExisting] = useState(false);
  
  // Fixed mode states
  const [restDay1Fixed, setRestDay1Fixed] = useState('');
  const [restDay2Fixed, setRestDay2Fixed] = useState('');
  const [restDay3Fixed, setRestDay3Fixed] = useState('');
  
  // Variable mode states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [restDay1Variable, setRestDay1Variable] = useState('');
  const [restDay2Variable, setRestDay2Variable] = useState('');
  const [restDay3Variable, setRestDay3Variable] = useState('');
  const [restDayRecords, setRestDayRecords] = useState<RestDayRecord[]>([]);
  
  // By RestDay Set Up states
  const [refNo, setRefNo] = useState('');
  const [dateFromSetup, setDateFromSetup] = useState('');
  const [dateToSetup, setDateToSetup] = useState('');
  
  const itemsPerPage = 10;

  const tkGroupItems: GroupItem[] = [
    { id: 1, code: '100', description: '-' },
    { id: 2, code: '2', description: 'Batangas Balagtas Satellite Monthly Cash' },
    { id: 3, code: '95', description: 'Batangas - Balagtas Satellite Monthly cash 2' },
    { id: 4, code: '4', description: 'Batangas Cavite Satellie Monthly Cash' },
    { id: 5, code: '5', description: 'Batangas Cavite Satellite' },
    { id: 6, code: '3', description: 'Batangas Cavite Satellite Daily Cash' },
    { id: 7, code: '6', description: 'Batangas Daily' },
    { id: 8, code: '7', description: 'Batangas Daily Cash Payroll with Paycard' },
    { id: 9, code: '8', description: 'Batangas Employees with the same employee number' },
    { id: 10, code: '11', description: 'Batangas Monthly' }
  ];

  const branchItems: GroupItem[] = [
    { id: 1, code: 'BATANGAS', description: 'Batangass' },
    { id: 2, code: 'BICOL', description: 'Bicol' },
    { id: 3, code: 'BIC-DARAGA', description: 'Bicol-Daraga' },
    { id: 4, code: 'CAVITE', description: 'Cavite' },
    { id: 5, code: 'CAR', description: 'Cordillera Administrative Region' }
  ];

  const departmentItems: GroupItem[] = [
    { id: 1, code: '-', description: '-' },
    { id: 2, code: 'A', description: 'A' },
    { id: 3, code: '108', description: 'Accounting' },
    { id: 4, code: 'FNGCLRK', description: 'Accounting Clerk' },
    { id: 5, code: '330', description: 'Audit' }
  ];

  const employees: EmployeeItem[] = [
    { id: 1, code: '000878', name: 'Last, First A' },
    { id: 2, code: '000900', name: 'Last, First A' },
    { id: 3, code: '000901', name: 'Last, First A' },
    { id: 4, code: '000903', name: 'Last, First A' },
    { id: 5, code: '000904', name: 'Last, First A' },
    { id: 6, code: '000905', name: 'Last, First A' },
    { id: 7, code: '000906', name: 'Last, First A' },
    { id: 8, code: '000907', name: 'Last, First A' },
    { id: 9, code: '000908', name: 'Last, First A' },
    { id: 10, code: '000942', name: 'Last, First A' }
  ];

  const dayOptions = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'Branch':
        return branchItems;
      case 'Department':
        return departmentItems;
      default:
        return tkGroupItems;
    }
  };

  const currentItems = getCurrentData();

  const filteredGroups = currentItems.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmployees = employees.filter(emp =>
    emp.code.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.name.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  const totalGroupPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const paginatedGroups = filteredGroups.slice(
    (currentGroupPage - 1) * itemsPerPage,
    currentGroupPage * itemsPerPage
  );

  const totalEmpPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentEmpPage - 1) * itemsPerPage,
    currentEmpPage * itemsPerPage
  );

  const handleGroupToggle = (id: number) => {
    setSelectedGroups(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleEmployeeToggle = (id: number) => {
    setSelectedEmployees(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleGroupSelectAll = () => {
    if (selectedGroups.length === filteredGroups.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(filteredGroups.map(g => g.id));
    }
  };

  const handleEmployeeSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(e => e.id));
    }
  };

  const handleAddRecord = () => {
    if (dateFrom && dateTo) {
      const newRecord: RestDayRecord = {
        id: Date.now(),
        from: dateFrom,
        to: dateTo,
        restDay1: restDay1Variable,
        restDay2: restDay2Variable,
        restDay3: restDay3Variable
      };
      setRestDayRecords([...restDayRecords, newRecord]);
      setDateFrom('');
      setDateTo('');
    }
  };

  const renderPageNumbers = (totalPages: number, currentPage: number) => {
    const pages = [];
    for (let i = 1; i <= Math.min(5, totalPages); i++) {
      pages.push(i);
    }
    
    if (totalPages > 6) {
      pages.push('...' as any);
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Update Batch Rest Day</h1>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
            {/* Information Frame */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    Update employee rest day assignments in batch. Choose between fixed, variable, or by rest day setup configuration.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Bulk update rest days for multiple employees</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Configure fixed or variable rest day schedules</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="flex items-center gap-1 border-b border-gray-200 flex-wrap">
                {[
                  { name: 'TK Group' as const, icon: Users },
                  { name: 'Branch' as const, icon: Building2 },
                  { name: 'Department' as const, icon: Briefcase },
                  { name: 'Group Schedule' as const, icon: CalendarClock },
                  { name: 'Pay House' as const, icon: Wallet },
                  { name: 'Section' as const, icon: Grid }
                ].map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                      activeTab === tab.name
                        ? 'font-medium bg-blue-600 text-white -mb-px'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Section - Group List */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <label className="text-sm text-gray-700">Search:</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">
                          <input
                            type="checkbox"
                            checked={selectedGroups.length === filteredGroups.length && filteredGroups.length > 0}
                            onChange={handleGroupSelectAll}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">Code</th>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedGroups.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
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

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>Showing 1 to 10 of {filteredGroups.length} entries</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentGroupPage(Math.max(1, currentGroupPage - 1))}
                      className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs"
                    >
                      Previous
                    </button>
                    {renderPageNumbers(totalGroupPages, currentGroupPage).map((page, index) => (
                      typeof page === 'number' ? (
                        <button
                          key={index}
                          onClick={() => setCurrentGroupPage(page)}
                          className={`px-2 py-1 rounded text-xs ${
                            currentGroupPage === page
                              ? 'bg-blue-500 text-white'
                              : 'border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      ) : (
                        <span key={index} className="px-2">
                          {page}
                        </span>
                      )
                    ))}
                    <button
                      onClick={() => setCurrentGroupPage(Math.min(totalGroupPages, currentGroupPage + 1))}
                      className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Section - Employee List and Form */}
              <div className="space-y-6">
                {/* Employee List */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <label className="text-sm text-gray-700">Search:</label>
                    <input
                      type="text"
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">
                            <input
                              type="checkbox"
                              checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                              onChange={handleEmployeeSelectAll}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">Code</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">Name</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedEmployees.map((emp) => (
                          <tr key={emp.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                checked={selectedEmployees.includes(emp.id)}
                                onChange={() => handleEmployeeToggle(emp.id)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">{emp.code}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{emp.name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>Showing 1 to 10 of 1,653 entries</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentEmpPage(Math.max(1, currentEmpPage - 1))}
                        className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs"
                      >
                        Previous
                      </button>
                      {renderPageNumbers(totalEmpPages, currentEmpPage).map((page, index) => (
                        typeof page === 'number' ? (
                          <button
                            key={index}
                            onClick={() => setCurrentEmpPage(page)}
                            className={`px-2 py-1 rounded text-xs ${
                              currentEmpPage === page
                                ? 'bg-blue-500 text-white'
                                : 'border border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        ) : (
                          <span key={index} className="px-2">
                            {page}
                          </span>
                        )
                      ))}
                      <button
                        onClick={() => setCurrentEmpPage(Math.min(totalEmpPages, currentEmpPage + 1))}
                        className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>

                {/* Rest Day Configuration */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <div className="space-y-6">
                    {/* Fixed Option */}
                    <div className="border-b border-gray-200 pb-4">
                      <label className="flex items-center gap-2 cursor-pointer mb-4">
                        <input
                          type="radio"
                          name="restDayMode"
                          checked={restDayMode === 'fixed'}
                          onChange={() => setRestDayMode('fixed')}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Fixed</span>
                      </label>
                      
                      {restDayMode === 'fixed' && (
                        <div className="ml-6 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-700 whitespace-nowrap">Rest Day 1</label>
                              <select
                                value={restDay1Fixed}
                                onChange={(e) => setRestDay1Fixed(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                <option value=""></option>
                                {dayOptions.map(day => (
                                  <option key={day} value={day}>{day}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-700 whitespace-nowrap">Rest Day 3</label>
                              <select
                                value={restDay3Fixed}
                                onChange={(e) => setRestDay3Fixed(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                <option value=""></option>
                                {dayOptions.map(day => (
                                  <option key={day} value={day}>{day}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700 whitespace-nowrap">Rest Day 2</label>
                            <select
                              value={restDay2Fixed}
                              onChange={(e) => setRestDay2Fixed(e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-40"
                            >
                              <option value=""></option>
                              {dayOptions.map(day => (
                                <option key={day} value={day}>{day}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Variable Option */}
                    <div className="border-b border-gray-200 pb-4">
                      <label className="flex items-center gap-2 cursor-pointer mb-4">
                        <input
                          type="radio"
                          name="restDayMode"
                          checked={restDayMode === 'variable'}
                          onChange={() => setRestDayMode('variable')}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Variable</span>
                      </label>
                      
                      {restDayMode === 'variable' && (
                        <div className="ml-6 space-y-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleAddRecord}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                            >
                              Add
                            </button>
                            <label className="text-sm text-gray-700">Date From</label>
                            <input
                              type="text"
                              value={dateFrom}
                              onChange={(e) => setDateFrom(e.target.value)}
                              placeholder="MM/DD/YYYY"
                              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                            />
                            <label className="text-sm text-gray-700">Date To</label>
                            <input
                              type="text"
                              value={dateTo}
                              onChange={(e) => setDateTo(e.target.value)}
                              placeholder="MM/DD/YYYY"
                              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                            />
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex items-center gap-1">
                              <label className="text-sm text-gray-700 whitespace-nowrap">Rest Day 1</label>
                              <select
                                value={restDay1Variable}
                                onChange={(e) => setRestDay1Variable(e.target.value)}
                                className="flex-1 px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                <option value=""></option>
                                {dayOptions.map(day => (
                                  <option key={day} value={day}>{day}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <label className="text-sm text-gray-700 whitespace-nowrap">Rest Day 2</label>
                              <select
                                value={restDay2Variable}
                                onChange={(e) => setRestDay2Variable(e.target.value)}
                                className="flex-1 px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                <option value=""></option>
                                {dayOptions.map(day => (
                                  <option key={day} value={day}>{day}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <label className="text-sm text-gray-700 whitespace-nowrap">Rest Day 3</label>
                              <select
                                value={restDay3Variable}
                                onChange={(e) => setRestDay3Variable(e.target.value)}
                                className="flex-1 px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                <option value=""></option>
                                {dayOptions.map(day => (
                                  <option key={day} value={day}>{day}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          {restDayRecords.length > 0 && (
                            <div className="mt-4 bg-white border border-gray-200 rounded-lg overflow-hidden">
                              <table className="w-full">
                                <thead className="bg-gray-100 border-b border-gray-200">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs text-gray-600">From</th>
                                    <th className="px-3 py-2 text-left text-xs text-gray-600">To</th>
                                    <th className="px-3 py-2 text-left text-xs text-gray-600">Rest Day1</th>
                                    <th className="px-3 py-2 text-left text-xs text-gray-600">Rest Day2</th>
                                    <th className="px-3 py-2 text-left text-xs text-gray-600">Rest Day3</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {restDayRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50">
                                      <td className="px-3 py-2 text-sm text-gray-900">{record.from}</td>
                                      <td className="px-3 py-2 text-sm text-gray-900">{record.to}</td>
                                      <td className="px-3 py-2 text-sm text-gray-600">{record.restDay1}</td>
                                      <td className="px-3 py-2 text-sm text-gray-600">{record.restDay2}</td>
                                      <td className="px-3 py-2 text-sm text-gray-600">{record.restDay3}</td>
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
                        <input
                          type="radio"
                          name="restDayMode"
                          checked={restDayMode === 'restday-setup'}
                          onChange={() => setRestDayMode('restday-setup')}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">By RestDay Set Up</span>
                      </label>
                      
                      {restDayMode === 'restday-setup' && (
                        <div className="ml-6 space-y-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700">Ref No.</label>
                            <input
                              type="text"
                              value={refNo}
                              onChange={(e) => setRefNo(e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                            />
                            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
                              Search
                            </button>
                            <button className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-700">Date From</label>
                              <input
                                type="text"
                                value={dateFromSetup}
                                onChange={(e) => setDateFromSetup(e.target.value)}
                                placeholder="MM/DD/YYYY"
                                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                              />
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-700">Date To</label>
                              <input
                                type="text"
                                value={dateToSetup}
                                onChange={(e) => setDateToSetup(e.target.value)}
                                placeholder="MM/DD/YYYY"
                                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Delete Existing and Update Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={deleteExisting}
                          onChange={(e) => setDeleteExisting(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Delete Existing Rest Day</span>
                      </label>
                      
                      <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Update
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