import { useState, useRef, useEffect } from 'react';
import { Check, Upload, Download, Calendar } from 'lucide-react';
import { Footer } from './Footer/Footer';

interface TKGroupItem {
  id: number;
  code: string;
  description: string;
  selected: boolean;
}

interface EmployeeItem {
  id: number;
  code: string;
  name: string;
  selected: boolean;
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
    
    // Previous month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push(
        <div key={`prev-${i}`} className="text-center py-2 text-gray-400 text-sm">
          {prevMonthDays - i}
        </div>
      );
    }
    
    // Current month days
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
    
    // Next month days to fill the grid
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="font-medium">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <button
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-xs text-gray-600 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
    </div>
  );
}

export function PayrollDTRAllowancePage() {
  const [activeTab, setActiveTab] = useState<'TK Group' | 'Branch' | 'Department' | 'Division' | 'Group Schedule' | 'Pay House' | 'Section' | 'Unit'>('TK Group');
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [employeeCurrentPage, setEmployeeCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<'Active' | 'In Active' | 'All'>('Active');
  const [dateRangeFrom, setDateRangeFrom] = useState('5/5/2021');
  const [dateRangeTo, setDateRangeTo] = useState('05/05/2021');
  const [applyTransaction, setApplyTransaction] = useState(false);
  const [transactionDate, setTransactionDate] = useState('12/26/2025');
  const [assumedDate, setAssumedDate] = useState('');
  const [leaveWithoutPayAndAbsences, setLeaveWithoutPayAndAbsences] = useState(false);
  const [showCalendar, setShowCalendar] = useState<'dateRangeFrom' | 'dateRangeTo' | 'transactionDate' | 'assumedDate' | null>(null);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  
  const itemsPerPage = 10;

  const [tkGroupItems, setTkGroupItems] = useState<TKGroupItem[]>([
    { id: 1, code: '100', description: '-', selected: false },
    { id: 2, code: '2', description: 'Batangas Balagtas Satellite Monthly Cash', selected: false },
    { id: 3, code: '95', description: 'Batangas - Balagtas Satellite Monthly cash 2', selected: false },
    { id: 4, code: '4', description: 'Batangas Cavite Satellie Monthly Cash', selected: false },
    { id: 5, code: '5', description: 'Batangas Cavite Satellite', selected: false },
    { id: 6, code: '3', description: 'Batangas Cavite Satellite Daily Cash', selected: false },
    { id: 7, code: '6', description: 'Batangas Daily', selected: false },
    { id: 8, code: '7', description: 'Batangas Daily Cash Payroll with Paycard', selected: false },
    { id: 9, code: '8', description: 'Batangas Employees with the same employee number', selected: false },
    { id: 10, code: '11', description: 'Batangas Monthly', selected: false }
  ]);

  const [employees, setEmployees] = useState<EmployeeItem[]>([
    { id: 1, code: '000878', name: 'Last, First A', selected: false },
    { id: 2, code: '000900', name: 'Last, First A', selected: false },
    { id: 3, code: '000901', name: 'Last, First A', selected: false },
    { id: 4, code: '000903', name: 'Last, First A', selected: false },
    { id: 5, code: '000904', name: 'Last, First A', selected: false },
    { id: 6, code: '000905', name: 'Last, First A', selected: false },
    { id: 7, code: '000906', name: 'Last, First A', selected: false },
    { id: 8, code: '000907', name: 'Last, First A', selected: false },
    { id: 9, code: '000908', name: 'Last, First A', selected: false },
    { id: 10, code: '009942', name: 'Last, First A', selected: false }
  ]);

  const filteredItems = tkGroupItems.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmployees = employees.filter(emp =>
    emp.code.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const employeeTotalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (employeeCurrentPage - 1) * itemsPerPage,
    employeeCurrentPage * itemsPerPage
  );

  const handleSelectAllGroups = (checked: boolean) => {
    setTkGroupItems(items => items.map(item => ({ ...item, selected: checked })));
  };

  const handleSelectGroup = (id: number, checked: boolean) => {
    setTkGroupItems(items =>
      items.map(item => item.id === id ? { ...item, selected: checked } : item)
    );
  };

  const handleSelectAllEmployees = (checked: boolean) => {
    setEmployees(items => items.map(item => ({ ...item, selected: checked })));
  };

  const handleSelectEmployee = (id: number, checked: boolean) => {
    setEmployees(items =>
      items.map(item => item.id === id ? { ...item, selected: checked } : item)
    );
  };

  const handleDateChange = (date: string) => {
    if (showCalendar === 'dateRangeFrom') {
      setDateRangeFrom(date);
    } else if (showCalendar === 'dateRangeTo') {
      setDateRangeTo(date);
    } else if (showCalendar === 'transactionDate') {
      setTransactionDate(date);
    } else if (showCalendar === 'assumedDate') {
      setAssumedDate(date);
    }
  };

  const renderPageNumbers = (total: number, current: number, setPage: (page: number) => void) => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (total <= maxVisiblePages) {
      for (let i = 1; i <= total; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`px-3 py-1 rounded text-sm ${
              current === i
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      for (let i = 1; i <= Math.min(5, total); i++) {
        pages.push(
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`px-3 py-1 rounded text-sm ${
              current === i
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {i}
          </button>
        );
      }
      
      if (total > 6) {
        pages.push(
          <span key="ellipsis" className="px-2 text-gray-500">...</span>
        );
      }
      
      if (total > 5) {
        pages.push(
          <button
            key={total}
            onClick={() => setPage(total)}
            className={`px-3 py-1 rounded text-sm ${
              current === total
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {total}
          </button>
        );
      }
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Export DTR Allowance</h1>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
            {/* Information Frame */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    Export Daily Time Record (DTR) and allowance data for payroll processing. Select employees by group, filter by status, and configure transaction dates.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Export DTR and allowances</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Filter by employee status</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Configure date ranges</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Leave and absence options</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Left Column - Groups */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                {/* Search */}
                <div className="mb-4 flex items-center gap-3">
                  <label className="text-sm text-gray-700">Search:</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder=""
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">
                            <input
                              type="checkbox"
                              onChange={(e) => handleSelectAllGroups(e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">
                            Code
                          </th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedItems.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                checked={item.selected}
                                onChange={(e) => handleSelectGroup(item.id, e.target.checked)}
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
                </div>

                {/* Pagination */}
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} entries</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {renderPageNumbers(totalPages, currentPage, setCurrentPage)}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Employees */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                {/* Search */}
                <div className="mb-4 flex items-center gap-3">
                  <label className="text-sm text-gray-700">Search:</label>
                  <input
                    type="text"
                    value={employeeSearchTerm}
                    onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                    placeholder=""
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="mb-3 flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={activeFilter === 'Active'}
                      onChange={(e) => setActiveFilter(e.target.value as 'Active' | 'In Active' | 'All')}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={activeFilter === 'In Active'}
                      onChange={(e) => setActiveFilter(e.target.value as 'Active' | 'In Active' | 'All')}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">In Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="all"
                      checked={activeFilter === 'All'}
                      onChange={(e) => setActiveFilter(e.target.value as 'Active' | 'In Active' | 'All')}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">All</span>
                  </label>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">
                            <input
                              type="checkbox"
                              onChange={(e) => handleSelectAllEmployees(e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">
                            Code
                          </th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">
                            Name
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedEmployees.map((emp) => (
                          <tr key={emp.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                checked={emp.selected}
                                onChange={(e) => handleSelectEmployee(emp.id, e.target.checked)}
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
                </div>

                {/* Pagination */}
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>Showing {(employeeCurrentPage - 1) * itemsPerPage + 1} to {Math.min(employeeCurrentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} entries</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEmployeeCurrentPage(Math.max(1, employeeCurrentPage - 1))}
                      disabled={employeeCurrentPage === 1}
                      className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {renderPageNumbers(employeeTotalPages, employeeCurrentPage, setEmployeeCurrentPage)}
                    <button
                      onClick={() => setEmployeeCurrentPage(Math.min(employeeTotalPages, employeeCurrentPage + 1))}
                      disabled={employeeCurrentPage === employeeTotalPages}
                      className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section - Date Options and Export */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Date Range and Transaction Details */}
              <div className="space-y-6">
                {/* Date Range */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <h3 className="text-gray-900 mb-4">Date Range</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">From:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={dateRangeFrom}
                          onChange={(e) => setDateRangeFrom(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button
                          onClick={(e) => {
                            const rect = e.currentTarget.previousElementSibling?.getBoundingClientRect();
                            if (rect) {
                              setCalendarPosition({ top: rect.bottom + 5, left: rect.left });
                              setShowCalendar('dateRangeFrom');
                            }
                          }}
                          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">To:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={dateRangeTo}
                          onChange={(e) => setDateRangeTo(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button
                          onClick={(e) => {
                            const rect = e.currentTarget.previousElementSibling?.getBoundingClientRect();
                            if (rect) {
                              setCalendarPosition({ top: rect.bottom + 5, left: rect.left });
                              setShowCalendar('dateRangeTo');
                            }
                          }}
                          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Date */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <h3 className="text-gray-900 mb-4">Transaction Date</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={transactionDate}
                        onChange={(e) => setTransactionDate(e.target.value)}
                        className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button
                        onClick={(e) => {
                          const rect = e.currentTarget.previousElementSibling?.getBoundingClientRect();
                          if (rect) {
                            setCalendarPosition({ top: rect.bottom + 5, left: rect.left });
                            setShowCalendar('transactionDate');
                          }
                        }}
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={applyTransaction}
                        onChange={(e) => setApplyTransaction(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Apply</span>
                    </label>
                  </div>
                </div>

                {/* Assumed Date */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <h3 className="text-gray-900 mb-4">Assumed Date</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={assumedDate}
                      onChange={(e) => setAssumedDate(e.target.value)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      onClick={(e) => {
                        const rect = e.currentTarget.previousElementSibling?.getBoundingClientRect();
                        if (rect) {
                          setCalendarPosition({ top: rect.bottom + 5, left: rect.left });
                          setShowCalendar('assumedDate');
                        }
                      }}
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Options and Export */}
              <div className="space-y-6">
                {/* Option */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <h3 className="text-gray-900 mb-4">Option</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={leaveWithoutPayAndAbsences}
                      onChange={(e) => setLeaveWithoutPayAndAbsences(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Leave WithOut Pay And Absences</span>
                  </label>
                </div>

                {/* Export Button */}
                <div className="flex justify-end">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Popup */}
      {showCalendar && (
        <CalendarPopup
          value={
            showCalendar === 'dateRangeFrom' ? dateRangeFrom :
            showCalendar === 'dateRangeTo' ? dateRangeTo :
            showCalendar === 'transactionDate' ? transactionDate :
            assumedDate
          }
          onChange={handleDateChange}
          onClose={() => setShowCalendar(null)}
          position={calendarPosition}
        />
      )}

    </div>
  );
}