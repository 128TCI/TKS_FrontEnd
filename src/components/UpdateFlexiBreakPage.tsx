import { useState, useRef, useEffect } from 'react';
import { Calendar, AlertCircle, Check, Save, RotateCcw, Users, Building2, Briefcase, Network, CalendarClock, Wallet, Grid, Box } from 'lucide-react';
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

interface CalendarPopupProps {
  value: string;
  onChange: (date: string) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

function CalendarPopup({ value, onChange, onClose, position }: CalendarPopupProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const month = currentMonth.getMonth() + 1;
    const year = currentMonth.getFullYear();
    const formattedDate = `${month}/${day}/${year}`;
    onChange(formattedDate);
    onClose();
  };

  const renderDays = () => {
    const days = [];
    const prevMonthDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
    
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push(
        <div key={`prev-${i}`} className="text-center py-2 text-gray-400 text-sm">
          {prevMonthDays - i}
        </div>
      );
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className="text-center py-2 text-sm cursor-pointer hover:bg-blue-100 rounded transition-colors"
        >
          {day}
        </div>
      );
    }
    
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push(
        <div key={`next-${day}`} className="text-center py-2 text-gray-400 text-sm">
          {day}
        </div>
      );
    }
    
    return days;
  };

  return (
    <div
      ref={popupRef}
      className="absolute bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50"
      style={{ top: position.top, left: position.left, width: '280px' }}
    >
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="font-medium">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-xs text-gray-600 font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
    </div>
  );
}

export function UpdateFlexiBreakPage() {
  const [activeTab, setActiveTab] = useState<'TK Group' | 'Branch' | 'Department' | 'Division' | 'Group Schedule' | 'Pay House' | 'Section' | 'Unit'>('TK Group');
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [currentGroupPage, setCurrentGroupPage] = useState(1);
  const [currentEmpPage, setCurrentEmpPage] = useState(1);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('January');
  const [noOfTardiness, setNoOfTardiness] = useState('');
  const [gracePeriod, setGracePeriod] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('active');
  const [showCalendar, setShowCalendar] = useState<'year' | 'dateFrom' | 'dateTo' | null>(null);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const itemsPerPage = 10;

  const tkGroupData: GroupItem[] = [
    { id: 1, code: '100', description: '-' },
    { id: 2, code: '2', description: 'Batangas Balagtas Satellite Monthly Cash' },
    { id: 3, code: '95', description: 'Batangas - Balagtas Satellite Monthly cash 2' },
    { id: 4, code: '4', description: 'Batangas Cavite Satellite Monthly Cash' },
    { id: 5, code: '5', description: 'Batangas Cavite Satellite' },
    { id: 6, code: '3', description: 'Batangas Cavite Satellite Daily Cash' },
    { id: 7, code: '6', description: 'Batangas Daily' },
    { id: 8, code: '7', description: 'Batangas Daily Cash Payroll with Paycard' },
    { id: 9, code: '8', description: 'Batangas Employees with the same employee number' },
    { id: 10, code: '11', description: 'Batangas Monthly' }
  ];

  const branchData: GroupItem[] = [
    { id: 1, code: 'BATANGAS', description: 'Batangass' },
    { id: 2, code: 'BICOL', description: 'Bicol' },
    { id: 3, code: 'CAVITE', description: 'Cavite' },
    { id: 4, code: 'MAIN', description: 'Main' },
    { id: 5, code: 'NCR', description: 'National Capital Region' }
  ];

  const departmentData: GroupItem[] = [
    { id: 1, code: '-', description: '-' },
    { id: 2, code: '108', description: 'Accounting' },
    { id: 3, code: '330', description: 'Audit' },
    { id: 4, code: '107', description: 'HR' },
    { id: 5, code: '250', description: 'Human Resources' }
  ];

  const divisionData: GroupItem[] = [
    { id: 1, code: '-', description: '-' },
    { id: 2, code: 'ADMIN', description: 'Administrative' },
    { id: 3, code: 'OPS', description: 'Operations' }
  ];

  const groupScheduleData: GroupItem[] = [
    { id: 1, code: 'a', description: 'a' },
    { id: 2, code: 'ab', description: 'ab' }
  ];

  const payHouseData: GroupItem[] = [
    { id: 1, code: '-', description: '-' },
    { id: 2, code: 'a', description: 'a' },
    { id: 3, code: 'i', description: 'i' }
  ];

  const sectionData: GroupItem[] = [
    { id: 1, code: '-', description: '-' },
    { id: 2, code: 'ACCT1', description: 'Accounting 1' },
    { id: 3, code: 'ACMES', description: 'ACTUAL MEASURERS' }
  ];

  const unitData: GroupItem[] = [
    { id: 1, code: '-', description: '-' },
    { id: 2, code: 'UNIT1', description: 'Unit 1' },
    { id: 3, code: 'UNIT2', description: 'Unit 2' }
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'Branch':
        return branchData;
      case 'Department':
        return departmentData;
      case 'Division':
        return divisionData;
      case 'Group Schedule':
        return groupScheduleData;
      case 'Pay House':
        return payHouseData;
      case 'Section':
        return sectionData;
      case 'Unit':
        return unitData;
      default:
        return tkGroupData;
    }
  };

  const groupItems = getCurrentData();

  const employeeItems: EmployeeItem[] = [
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

  const filteredGroups = groupItems.filter(item =>
    item.code.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(groupSearchTerm.toLowerCase())
  );

  const filteredEmployees = employeeItems.filter(item =>
    item.code.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    item.name.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  );

  const totalGroupPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const totalEmpPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const paginatedGroups = filteredGroups.slice(
    (currentGroupPage - 1) * itemsPerPage,
    currentGroupPage * itemsPerPage
  );

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

  const handleSelectAllGroups = () => {
    if (selectedGroups.length === filteredGroups.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(filteredGroups.map(g => g.id));
    }
  };

  const handleSelectAllEmployees = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(e => e.id));
    }
  };

  const handleCalendarClick = (field: 'year' | 'dateFrom' | 'dateTo', event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setCalendarPosition({
      top: rect.bottom + 5,
      left: rect.left
    });
    setShowCalendar(field);
  };

  const handleDateChange = (date: string) => {
    if (showCalendar === 'year') {
      setYear(date);
    } else if (showCalendar === 'dateFrom') {
      setDateFrom(date);
    } else if (showCalendar === 'dateTo') {
      setDateTo(date);
    }
  };

  const renderPageNumbers = (currentPage: number, totalPages: number, setPage: (page: number) => void) => {
    const pages = [];
    for (let i = 1; i <= Math.min(5, totalPages); i++) {
      pages.push(i);
    }
    
    if (totalPages > 6) {
      pages.push('...' as any);
      pages.push(totalPages);
    }
    
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage(Math.max(1, currentPage - 1))}
          className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 text-sm"
        >
          Previous
        </button>
        {pages.map((page, index) => (
          typeof page === 'number' ? (
            <button
              key={index}
              onClick={() => setPage(page)}
              className={`px-3 py-1 rounded text-sm ${
                currentPage === page
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
          onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
          className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 text-sm"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Update Flexi Break Utility</h1>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
            {/* Information Box */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-3">
                    Update flexible break configurations for selected employees. Apply customized break time policies and manage break hour allocations based on workshift requirements.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Select groups and employees</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Filter by employee status</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Set date range for updates</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Batch update flexi break settings</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex items-center gap-1 border-b border-gray-200 flex-wrap">
              {[
                { name: 'TK Group' as const, icon: Users },
                { name: 'Branch' as const, icon: Building2 },
                { name: 'Department' as const, icon: Briefcase },
                { name: 'Division' as const, icon: Network },
                { name: 'Group Schedule' as const, icon: CalendarClock },
                { name: 'Pay House' as const, icon: Wallet },
                { name: 'Section' as const, icon: Grid },
                { name: 'Unit' as const, icon: Box }
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Section - Group List */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <label className="text-sm text-gray-700">Search:</label>
                  <input
                    type="text"
                    value={groupSearchTerm}
                    onChange={(e) => setGroupSearchTerm(e.target.value)}
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
                            onChange={handleSelectAllGroups}
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
                  <span>Showing 1 to 10 of 114 entries</span>
                  {renderPageNumbers(currentGroupPage, totalGroupPages, setCurrentGroupPage)}
                </div>
              </div>

              {/* Right Section - Employee List and Options */}
              <div className="space-y-6">
                {/* Employee List */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <label className="text-sm text-gray-700">Search:</label>
                    <input
                      type="text"
                      value={employeeSearchTerm}
                      onChange={(e) => setEmployeeSearchTerm(e.target.value)}
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
                              onChange={handleSelectAllEmployees}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">Code</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">Name</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedEmployees.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                checked={selectedEmployees.includes(item.id)}
                                onChange={() => handleEmployeeToggle(item.id)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.code}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>Showing 1 to 10 of 704 entries</span>
                    {renderPageNumbers(currentEmpPage, totalEmpPages, setCurrentEmpPage)}
                  </div>

                  {/* Status Filter */}
                  <div className="mt-4 flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="statusFilter"
                        value="active"
                        checked={statusFilter === 'active'}
                        onChange={() => setStatusFilter('active')}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="statusFilter"
                        value="inactive"
                        checked={statusFilter === 'inactive'}
                        onChange={() => setStatusFilter('inactive')}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">In Active</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="statusFilter"
                        value="all"
                        checked={statusFilter === 'all'}
                        onChange={() => setStatusFilter('all')}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">All</span>
                    </label>
                  </div>
                </div>

                {/* Date Range Section */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700 w-24">Date From:</label>
                      <input
                        type="text"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                      />
                      <button
                        onClick={(e) => {
                          const rect = e.currentTarget.previousElementSibling?.getBoundingClientRect();
                          if (rect) {
                            setCalendarPosition({ top: rect.bottom + 5, left: rect.left });
                            setShowCalendar('dateFrom');
                          }
                        }}
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700 w-24">Date To:</label>
                      <input
                        type="text"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                      />
                      <button
                        onClick={(e) => {
                          const rect = e.currentTarget.previousElementSibling?.getBoundingClientRect();
                          if (rect) {
                            setCalendarPosition({ top: rect.bottom + 5, left: rect.left });
                            setShowCalendar('dateTo');
                          }
                        }}
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <button className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm flex items-center gap-2">
                        <Save className="w-4 h-4" />
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

      {/* Calendar Popup */}
      {showCalendar && (
        <CalendarPopup
          value={showCalendar === 'year' ? year : showCalendar === 'dateFrom' ? dateFrom : dateTo}
          onChange={handleDateChange}
          onClose={() => setShowCalendar(null)}
          position={calendarPosition}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
