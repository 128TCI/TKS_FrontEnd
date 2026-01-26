import { useState, useRef, useEffect } from 'react';
import { Check, Upload, Search, Calendar, Users, Building2, Briefcase, Award, LayoutGrid, Network } from 'lucide-react';
import { Footer } from './Footer/Footer';

interface TKGroupItem {
  id: number;
  code: string;
  description: string;
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

export function ExportNAVPage() {
  const [dateFrom, setDateFrom] = useState('5/5/2021');
  const [dateTo, setDateTo] = useState('05/05/2021');
  const [postingDate, setPostingDate] = useState('12/26/2025');
  const [activeTab, setActiveTab] = useState<'TK Group' | 'Branch' | 'Department' | 'Designation' | 'Division' | 'Section'>('TK Group');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCalendar, setShowCalendar] = useState<'dateFrom' | 'dateTo' | 'postingDate' | null>(null);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const itemsPerPage = 10;

  const tkGroupItems: TKGroupItem[] = [
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
  ];

  const branchItems: TKGroupItem[] = [
    { id: 1, code: 'BATANGAS', description: 'Batangass', selected: false },
    { id: 2, code: 'BICOL', description: 'Bicol', selected: false },
    { id: 3, code: 'BIC-DARAGA', description: 'Bicol-Daraga', selected: false },
    { id: 4, code: 'CAVITE', description: 'Cavite', selected: false },
    { id: 5, code: 'CAR', description: 'Cordillera Administrative Region', selected: false },
    { id: 6, code: 'URDANETA', description: 'DN Steel Marketing, Inc. - Urdaneta', selected: false },
    { id: 7, code: 'LAUNION', description: 'La Union', selected: false },
    { id: 8, code: 'MAIN', description: 'Main', selected: false },
    { id: 9, code: 'NCR', description: 'National Capital Region', selected: false },
    { id: 10, code: 'NUEVA', description: 'NUEVA ECIJA', selected: false },
    { id: 11, code: 'PAMPANGA', description: 'Pampanga', selected: false },
    { id: 12, code: 'PAM-BULACAN', description: 'Pampanga-Bulacan Satellite', selected: false },
    { id: 13, code: 'TARLAC', description: 'Tarlac', selected: false }
  ];

  const departmentItems: TKGroupItem[] = [
    { id: 1, code: '-', description: '-', selected: false },
    { id: 2, code: 'A', description: 'A', selected: false },
    { id: 3, code: '108', description: 'Accounting', selected: false },
    { id: 4, code: 'FNGCLRK', description: 'Accounting Clerk', selected: false },
    { id: 5, code: '330', description: 'Audit', selected: false },
    { id: 6, code: '600', description: 'Building Administration', selected: false },
    { id: 7, code: '106', description: 'Building Administration_old', selected: false },
    { id: 8, code: '134CS', description: 'CAVITE SATELLITE', selected: false },
    { id: 9, code: '231', description: 'Contract', selected: false },
    { id: 10, code: '233', description: 'Creative', selected: false },
    { id: 11, code: '112', description: 'Credit & Collection_old', selected: false },
    { id: 12, code: '420', description: 'Credit and Collection', selected: false },
    { id: 13, code: 'D', description: 'D', selected: false },
    { id: 14, code: '215', description: 'Dealers Market', selected: false },
    { id: 15, code: '132', description: 'Delivery', selected: false },
    { id: 16, code: '251', description: 'Delivery Operations', selected: false },
    { id: 17, code: '127', description: 'DNRM (Dealer)-old', selected: false },
    { id: 18, code: '220', description: 'Engineering', selected: false },
    { id: 19, code: '125', description: 'Engineering-OLD', selected: false },
    { id: 20, code: '221', description: 'Estimation', selected: false },
    { id: 21, code: '230', description: 'Executive', selected: false },
    { id: 22, code: '235', description: 'Finance', selected: false },
    { id: 23, code: '240', description: 'General Affairs', selected: false },
    { id: 24, code: '107', description: 'HR', selected: false },
    { id: 25, code: '250', description: 'Human Resources', selected: false },
    { id: 26, code: '260', description: 'Information Technology', selected: false },
    { id: 27, code: '270', description: 'Internal Audit', selected: false },
    { id: 28, code: '280', description: 'Legal', selected: false },
    { id: 29, code: '290', description: 'Logistics', selected: false },
    { id: 30, code: '300', description: 'Manufacturing', selected: false },
    { id: 31, code: '310', description: 'Marketing', selected: false },
    { id: 32, code: '320', description: 'Operations', selected: false },
    { id: 33, code: '340', description: 'Planning', selected: false },
    { id: 34, code: '350', description: 'Procurement', selected: false },
    { id: 35, code: '360', description: 'Production', selected: false },
    { id: 36, code: '370', description: 'Quality Assurance', selected: false },
    { id: 37, code: '380', description: 'Research and Development', selected: false },
    { id: 38, code: '390', description: 'Sales', selected: false },
    { id: 39, code: '400', description: 'Security', selected: false },
    { id: 40, code: '410', description: 'Supply Chain', selected: false },
    { id: 41, code: '430', description: 'Training', selected: false },
    { id: 42, code: '440', description: 'Treasury', selected: false },
    { id: 43, code: '450', description: 'Warehouse', selected: false },
    { id: 44, code: 'ACC', description: 'Accounting Department', selected: false },
    { id: 45, code: 'ADM', description: 'Administration', selected: false },
    { id: 46, code: 'CSR', description: 'Customer Service', selected: false },
    { id: 47, code: 'ENG', description: 'Engineering Department', selected: false },
    { id: 48, code: 'FIN', description: 'Finance Department', selected: false },
    { id: 49, code: 'HRD', description: 'Human Resources Department', selected: false },
    { id: 50, code: 'ITD', description: 'IT Department', selected: false },
    { id: 51, code: 'LOG', description: 'Logistics Department', selected: false },
    { id: 52, code: 'MFG', description: 'Manufacturing Department', selected: false },
    { id: 53, code: 'MKT', description: 'Marketing Department', selected: false },
    { id: 54, code: 'OPS', description: 'Operations Department', selected: false },
    { id: 55, code: 'PRD', description: 'Production Department', selected: false },
    { id: 56, code: 'QA', description: 'Quality Assurance Department', selected: false },
    { id: 57, code: 'RND', description: 'Research and Development Department', selected: false },
    { id: 58, code: 'SAL', description: 'Sales Department', selected: false },
    { id: 59, code: 'SCM', description: 'Supply Chain Management', selected: false },
    { id: 60, code: 'TRN', description: 'Training Department', selected: false },
    { id: 61, code: 'WHS', description: 'Warehouse Department', selected: false },
    { id: 62, code: 'PUR', description: 'Purchasing', selected: false },
    { id: 63, code: 'INV', description: 'Inventory', selected: false },
    { id: 64, code: 'SHP', description: 'Shipping', selected: false },
    { id: 65, code: 'REC', description: 'Receiving', selected: false },
    { id: 66, code: 'MNT', description: 'Maintenance', selected: false },
    { id: 67, code: 'FAC', description: 'Facilities', selected: false },
    { id: 68, code: 'COM', description: 'Compliance', selected: false },
    { id: 69, code: 'STR', description: 'Strategy', selected: false }
  ];

  const divisionItems: TKGroupItem[] = [
    { id: 1, code: 'a', description: 'a', selected: false },
    { id: 2, code: 'i', description: 'i', selected: false },
    { id: 3, code: 's', description: 's', selected: false },
    { id: 4, code: '-', description: '-', selected: false }
  ];

  const sectionItems: TKGroupItem[] = [
    { id: 1, code: '-', description: '-', selected: false },
    { id: 2, code: 'ACCT1', description: 'Accounting 1', selected: false },
    { id: 3, code: 'ACCT2', description: 'Accounting 2', selected: false },
    { id: 4, code: 'ACCT3', description: 'Accounting 3', selected: false },
    { id: 5, code: 'ACCT4', description: 'Accounting 4', selected: false },
    { id: 6, code: 'ACCT5', description: 'Accounting 5', selected: false },
    { id: 7, code: 'ACCT6', description: 'Accounting 6', selected: false },
    { id: 8, code: 'ACMES', description: 'ACTUAL MEASURERS', selected: false },
    { id: 9, code: 'AUDIT', description: 'AUDIT', selected: false },
    { id: 10, code: 'BATPLNT1', description: 'BATANGAS - PLANT 1', selected: false }
  ];

  const designationItems: TKGroupItem[] = [
    { id: 1, code: 'AA/RA', description: 'Accounting Analyst/Relief Assistant', selected: false },
    { id: 2, code: 'ACC/ADMSTF', description: 'Accounting/Admin Staff', selected: false },
    { id: 3, code: 'ACCLERK', description: 'Accounting Clerk', selected: false },
    { id: 4, code: 'ACCLERK-R', description: 'ACCOUNTING CLERK-RELIEVER', selected: false },
    { id: 5, code: 'ACCLRK-RLV', description: 'Accounting Clerk- Reliever', selected: false },
    { id: 6, code: 'ACCT', description: 'ACCOUNTANT', selected: false },
    { id: 7, code: 'ACHFTW', description: 'Actual Measurer, In-house Tinsmith & Welder', selected: false },
    { id: 8, code: 'ACLRK/COOR', description: 'Accounting Clerk/Coordinator', selected: false },
    { id: 9, code: 'ADM', description: 'Admin Assistant', selected: false },
    { id: 10, code: 'ADMCOOR', description: 'Building Administrative Coordinator', selected: false },
    { id: 11, code: 'ADMINCLRK', description: 'Office Administrative Clerk', selected: false },
    { id: 12, code: 'AELECTRIC', description: 'Auto/Building Electrician', selected: false },
    { id: 13, code: 'AM', description: 'Actual Measurer', selected: false },
    { id: 14, code: 'AM/SR', description: 'Actual Measurer/Service Repairman', selected: false },
    { id: 15, code: 'AMGR', description: 'Audit Manager', selected: false },
    { id: 16, code: 'AMKO', description: 'Assistant Marketing Operations Manager', selected: false },
    { id: 17, code: 'ASST-WHM', description: 'Assistant Warehouseman', selected: false },
    { id: 18, code: 'AUTOCAD', description: 'Autocad Operator', selected: false },
    { id: 19, code: 'AVP', description: 'AVP Marketing Operations', selected: false },
    { id: 20, code: 'BA', description: 'Branch Accountant', selected: false },
    { id: 21, code: 'BA-TR', description: 'Branch Accountant-Trainee', selected: false },
    { id: 22, code: 'BAPROG', description: 'BUSINESS APPLICATION PROG.', selected: false },
    { id: 23, code: 'BENDER', description: 'BENDER', selected: false },
    { id: 24, code: 'BENDMAOP', description: 'Bending Machine Operator', selected: false },
    { id: 25, code: 'BILLER', description: 'Biller', selected: false }
  ];

  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number[] }>({
    'TK Group': [],
    'Branch': [],
    'Department': [],
    'Designation': [],
    'Division': [],
    'Section': []
  });

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'TK Group':
        return tkGroupItems;
      case 'Branch':
        return branchItems;
      case 'Department':
        return departmentItems;
      case 'Designation':
        return designationItems;
      case 'Division':
        return divisionItems;
      case 'Section':
        return sectionItems;
      default:
        return tkGroupItems;
    }
  };

  const currentItems = getCurrentItems();

  const filteredItems = currentItems.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(prev => ({
      ...prev,
      [activeTab]: checked ? currentItems.map(item => item.id) : []
    }));
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    setSelectedItems(prev => ({
      ...prev,
      [activeTab]: checked
        ? [...prev[activeTab], id]
        : prev[activeTab].filter(itemId => itemId !== id)
    }));
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 rounded text-sm ${
              currentPage === i
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      // Show first few pages, ellipsis, and last page
      for (let i = 1; i <= 5; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 rounded text-sm ${
              currentPage === i
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {i}
          </button>
        );
      }
      
      if (totalPages > 6) {
        pages.push(
          <span key="ellipsis" className="px-2 text-gray-500">...</span>
        );
      }
      
      pages.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className={`px-3 py-1 rounded text-sm ${
            currentPage === totalPages
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {totalPages}
        </button>
      );
    }
    
    return pages;
  };

  const handleDateClick = (event: React.MouseEvent<HTMLInputElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setCalendarPosition({ top: rect.bottom, left: rect.left });
    setShowCalendar(event.currentTarget.name as 'dateFrom' | 'dateTo' | 'postingDate');
  };

  const handleDateChange = (date: string) => {
    if (showCalendar === 'dateFrom') {
      setDateFrom(date);
    } else if (showCalendar === 'dateTo') {
      setDateTo(date);
    } else if (showCalendar === 'postingDate') {
      setPostingDate(date);
    }
    setShowCalendar(null);
  };

  const handleDateClose = () => {
    setShowCalendar(null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Export NAV</h1>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
            {/* Information Frame */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    Export payroll and timekeeping data to NAV (Navision) accounting system. Select the date range and posting date, then choose the groups to export.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Export to NAV accounting system</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Filter by date range</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Select groups and departments</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Set posting dates</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Date Filters */}
            <div className="mb-6 bg-gray-50 rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-700">Date From</label>
                  <div className="relative flex items-center gap-1">
                    <input
                      type="text"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      onClick={handleDateClick}
                      name="dateFrom"
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                    />
                    <button
                      onClick={(e) => {
                        const inputElement = e.currentTarget.previousElementSibling as HTMLInputElement;
                        const rect = inputElement.getBoundingClientRect();
                        setCalendarPosition({ top: rect.bottom + 5, left: rect.left });
                        setShowCalendar('dateFrom');
                      }}
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-700">Date To</label>
                  <div className="relative flex items-center gap-1">
                    <input
                      type="text"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      onClick={handleDateClick}
                      name="dateTo"
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                    />
                    <button
                      onClick={(e) => {
                        const inputElement = e.currentTarget.previousElementSibling as HTMLInputElement;
                        const rect = inputElement.getBoundingClientRect();
                        setCalendarPosition({ top: rect.bottom + 5, left: rect.left });
                        setShowCalendar('dateTo');
                      }}
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-700">Posting Date</label>
                  <div className="relative flex items-center gap-1">
                    <input
                      type="text"
                      value={postingDate}
                      onChange={(e) => setPostingDate(e.target.value)}
                      onClick={handleDateClick}
                      name="postingDate"
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                    />
                    <button
                      onClick={(e) => {
                        const inputElement = e.currentTarget.previousElementSibling as HTMLInputElement;
                        const rect = inputElement.getBoundingClientRect();
                        setCalendarPosition({ top: rect.bottom + 5, left: rect.left });
                        setShowCalendar('postingDate');
                      }}
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="flex items-center gap-1 border-b border-gray-200 flex-wrap">
                <button
                  onClick={() => {
                    setActiveTab('TK Group');
                    setCurrentPage(1);
                    setSearchTerm('');
                  }}
                  className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                    activeTab === 'TK Group'
                      ? 'font-medium bg-blue-600 text-white -mb-px'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
                >
                  <Users className="w-4 h-4" />
                  TK Group
                </button>
                <button
                  onClick={() => {
                    setActiveTab('Branch');
                    setCurrentPage(1);
                    setSearchTerm('');
                  }}
                  className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                    activeTab === 'Branch'
                      ? 'font-medium bg-blue-600 text-white -mb-px'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
                >
                  <Building2 className="w-4 h-4" />
                  Branch
                </button>
                <button
                  onClick={() => {
                    setActiveTab('Department');
                    setCurrentPage(1);
                    setSearchTerm('');
                  }}
                  className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                    activeTab === 'Department'
                      ? 'font-medium bg-blue-600 text-white -mb-px'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } transition-colors`}
                >
                  <Briefcase className="w-4 h-4" />
                  Department
                </button>
                <button
                  onClick={() => {
                    setActiveTab('Designation');
                    setCurrentPage(1);
                    setSearchTerm('');
                  }}
                  className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                    activeTab === 'Designation'
                      ? 'font-medium bg-blue-600 text-white -mb-px'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
                >
                  <Award className="w-4 h-4" />
                  Designation
                </button>
                <button
                  onClick={() => {
                    setActiveTab('Division');
                    setCurrentPage(1);
                    setSearchTerm('');
                  }}
                  className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                    activeTab === 'Division'
                      ? 'font-medium bg-blue-600 text-white -mb-px'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Division
                </button>
                <button
                  onClick={() => {
                    setActiveTab('Section');
                    setCurrentPage(1);
                    setSearchTerm('');
                  }}
                  className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                    activeTab === 'Section'
                      ? 'font-medium bg-blue-600 text-white -mb-px'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
                >
                  <Network className="w-4 h-4" />
                  Section
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="mb-4 flex justify-end">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Search:</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder=""
                  className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm text-gray-700 w-12">
                        <input
                          type="checkbox"
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-4 h-4"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-sm text-gray-700 cursor-pointer">
                        Code
                        <span className="ml-1 text-gray-400">▲</span>
                      </th>
                      <th className="px-4 py-3 text-left text-sm text-gray-700 cursor-pointer">
                        Description
                        <span className="ml-1 text-gray-400">▲</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedItems[activeTab].includes(item.id)}
                            onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                            className="w-4 h-4"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.code}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {renderPageNumbers()}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
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
          value={showCalendar === 'dateFrom' ? dateFrom : showCalendar === 'dateTo' ? dateTo : postingDate}
          onChange={handleDateChange}
          onClose={handleDateClose}
          position={calendarPosition}
        />
      )}
    </div>
  );
}