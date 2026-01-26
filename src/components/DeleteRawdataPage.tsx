import { useState, useRef, useEffect } from 'react';
import { Calendar, Trash2, Users, Building2, Briefcase, Award, LayoutGrid, Network, AlertTriangle, Check } from 'lucide-react';
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

export function DeleteRawdataPage() {
  const [activeTab, setActiveTab] = useState<'TK Group' | 'Branch' | 'Department' | 'Division' | 'Group Schedule' | 'Pay House' | 'Section' | 'Unit'>('TK Group');
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [currentGroupPage, setCurrentGroupPage] = useState(1);
  const [currentEmpPage, setCurrentEmpPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('5/5/2021');
  const [dateTo, setDateTo] = useState('05/05/2021');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('active');
  const [showCalendar, setShowCalendar] = useState<'dateFrom' | 'dateTo' | null>(null);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const itemsPerPage = 10;

  const tkGroupData: GroupItem[] = [
    { id: 1, code: 'BAT', description: 'BATANGAS' },
    { id: 2, code: 'DASH-TEST', description: 'CEBU' },
    { id: 3, code: 'ddfdsf', description: 'MAKATI' },
    { id: 4, code: 'PASIG', description: 'PASIG' },
    { id: 5, code: 'QC', description: 'QUEZON CITY' }
  ];

  const branchData: GroupItem[] = [
    { id: 1, code: 'BATANGAS', description: 'Batangass' },
    { id: 2, code: 'BICOL', description: 'Bicol' },
    { id: 3, code: 'BIC-DARAGA', description: 'Bicol-Daraga' },
    { id: 4, code: 'CAVITE', description: 'Cavite' },
    { id: 5, code: 'CAR', description: 'Cordillera Administrative Region' },
    { id: 6, code: 'URDANETA', description: 'DN Steel Marketing, Inc. - Urdaneta' },
    { id: 7, code: 'LAUNION', description: 'La Union' },
    { id: 8, code: 'MAIN', description: 'Main' },
    { id: 9, code: 'NCR', description: 'National Capital Region' },
    { id: 10, code: 'NUEVA', description: 'NUEVA ECIJA' },
    { id: 11, code: 'PAMPANGA', description: 'Pampanga' },
    { id: 12, code: 'PAM-BULACAN', description: 'Pampanga-Bulacan Satellite' },
    { id: 13, code: 'TARLAC', description: 'Tarlac' }
  ];

  const departmentData: GroupItem[] = [
    { id: 1, code: '-', description: '-' },
    { id: 2, code: 'A', description: 'A' },
    { id: 3, code: '108', description: 'Accounting' },
    { id: 4, code: 'FNGCLRK', description: 'Accounting Clerk' },
    { id: 5, code: '330', description: 'Audit' },
    { id: 6, code: '600', description: 'Building Administration' },
    { id: 7, code: '106', description: 'Building Administration_old' },
    { id: 8, code: '134CS', description: 'CAVITE SATELLITE' },
    { id: 9, code: '231', description: 'Contract' },
    { id: 10, code: '233', description: 'Creative' },
    { id: 11, code: '112', description: 'Credit & Collection_old' },
    { id: 12, code: '420', description: 'Credit and Collection' },
    { id: 13, code: 'D', description: 'D' },
    { id: 14, code: '215', description: 'Dealers Market' },
    { id: 15, code: '132', description: 'Delivery' },
    { id: 16, code: '251', description: 'Delivery Operations' },
    { id: 17, code: '127', description: 'DNRM (Dealer)-old' },
    { id: 18, code: '220', description: 'Engineering' },
    { id: 19, code: '125', description: 'Engineering-OLD' },
    { id: 20, code: '221', description: 'Estimation' },
    { id: 21, code: '230', description: 'Executive' },
    { id: 22, code: '235', description: 'Finance' },
    { id: 23, code: '240', description: 'General Affairs' },
    { id: 24, code: '107', description: 'HR' },
    { id: 25, code: '250', description: 'Human Resources' },
    { id: 26, code: '260', description: 'Information Technology' },
    { id: 27, code: '270', description: 'Internal Audit' },
    { id: 28, code: '280', description: 'Legal' },
    { id: 29, code: '290', description: 'Logistics' },
    { id: 30, code: '300', description: 'Manufacturing' },
    { id: 31, code: '310', description: 'Marketing' },
    { id: 32, code: '320', description: 'Operations' },
    { id: 33, code: '340', description: 'Planning' },
    { id: 34, code: '350', description: 'Procurement' },
    { id: 35, code: '360', description: 'Production' },
    { id: 36, code: '370', description: 'Quality Assurance' },
    { id: 37, code: '380', description: 'Research and Development' },
    { id: 38, code: '390', description: 'Sales' },
    { id: 39, code: '400', description: 'Security' },
    { id: 40, code: '410', description: 'Supply Chain' },
    { id: 41, code: '430', description: 'Training' },
    { id: 42, code: '440', description: 'Treasury' },
    { id: 43, code: '450', description: 'Warehouse' },
    { id: 44, code: 'ACC', description: 'Accounting Department' },
    { id: 45, code: 'ADM', description: 'Administration' },
    { id: 46, code: 'CSR', description: 'Customer Service' },
    { id: 47, code: 'ENG', description: 'Engineering Department' },
    { id: 48, code: 'FIN', description: 'Finance Department' },
    { id: 49, code: 'HRD', description: 'Human Resources Department' },
    { id: 50, code: 'ITD', description: 'IT Department' },
    { id: 51, code: 'LOG', description: 'Logistics Department' },
    { id: 52, code: 'MFG', description: 'Manufacturing Department' },
    { id: 53, code: 'MKT', description: 'Marketing Department' },
    { id: 54, code: 'OPS', description: 'Operations Department' },
    { id: 55, code: 'PRD', description: 'Production Department' },
    { id: 56, code: 'QA', description: 'Quality Assurance Department' },
    { id: 57, code: 'RND', description: 'Research and Development Department' },
    { id: 58, code: 'SAL', description: 'Sales Department' },
    { id: 59, code: 'SCM', description: 'Supply Chain Management' },
    { id: 60, code: 'TRN', description: 'Training Department' },
    { id: 61, code: 'WHS', description: 'Warehouse Department' },
    { id: 62, code: 'PUR', description: 'Purchasing' },
    { id: 63, code: 'INV', description: 'Inventory' },
    { id: 64, code: 'SHP', description: 'Shipping' },
    { id: 65, code: 'REC', description: 'Receiving' },
    { id: 66, code: 'MNT', description: 'Maintenance' },
    { id: 67, code: 'FAC', description: 'Facilities' },
    { id: 68, code: 'COM', description: 'Compliance' },
    { id: 69, code: 'STR', description: 'Strategy' }
  ];

  const divisionData: GroupItem[] = [
    { id: 1, code: 'a', description: 'a' },
    { id: 2, code: 'i', description: 'i' },
    { id: 3, code: 's', description: 's' },
    { id: 4, code: '-', description: '-' }
  ];

  const groupScheduleData: GroupItem[] = [
    { id: 1, code: 'a', description: 'a' },
    { id: 2, code: 'ab', description: 'ab' }
  ];

  const payHouseData: GroupItem[] = [
    { id: 1, code: '-', description: '-' },
    { id: 2, code: 'a', description: 'a' },
    { id: 3, code: 'i', description: 'i' },
    { id: 4, code: 's', description: 's' }
  ];

  const sectionData: GroupItem[] = [
    { id: 1, code: '-', description: '-' },
    { id: 2, code: 'ACCT1', description: 'Accounting 1' },
    { id: 3, code: 'ACCT2', description: 'Accounting 2' },
    { id: 4, code: 'ACCT3', description: 'Accounting 3' },
    { id: 5, code: 'ACCT4', description: 'Accounting 4' },
    { id: 6, code: 'ACCT5', description: 'Accounting 5' },
    { id: 7, code: 'ACCT6', description: 'Accounting 6' },
    { id: 8, code: 'ACMES', description: 'ACTUAL MEASURERS' },
    { id: 9, code: 'AUDIT', description: 'AUDIT' },
    { id: 10, code: 'BATPLNT1', description: 'BATANGAS - PLANT 1' }
  ];

  const unitData: GroupItem[] = [
    { id: 1, code: '-', description: '-' },
    { id: 2, code: 'UNIT 1', description: 'UNIT1' }
  ];

  // Get current data based on active tab
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

  const handleCalendarClick = (field: 'dateFrom' | 'dateTo', event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setCalendarPosition({
      top: rect.bottom + 5,
      left: rect.left
    });
    setShowCalendar(field);
  };

  const handleDateChange = (date: string) => {
    if (showCalendar === 'dateFrom') {
      setDateFrom(date);
    } else if (showCalendar === 'dateTo') {
      setDateTo(date);
    }
  };

  const getTabIcon = () => {
    switch (activeTab) {
      case 'TK Group': return Users;
      case 'Branch': return Building2;
      case 'Department': return Briefcase;
      case 'Division': return Award;
      case 'Group Schedule': return LayoutGrid;
      case 'Pay House': return Network;
      default: return Users;
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
          className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs"
        >
          Previous
        </button>
        {pages.map((page, index) => (
          typeof page === 'number' ? (
            <button
              key={index}
              onClick={() => setPage(page)}
              className={`px-2 py-1 rounded text-xs ${
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
          className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs"
        >
          Next
        </button>
      </div>
    );
  };

  const handleDelete = () => {
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    console.log('Delete raw data confirmed');
    setShowDeleteConfirmModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmModal(false);
  };

  // Handle ESC key for Delete Confirmation modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDeleteConfirmModal) {
        setShowDeleteConfirmModal(false);
      }
    };

    if (showDeleteConfirmModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showDeleteConfirmModal]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Delete Records in Raw Data</h1>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
            {/* Information Box */}
            <div className="mb-6 bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-3">
                    Permanently delete raw attendance data for selected employee groups. Remove unprocessed time records from the system efficiently within a specified date range.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Select groups and date range to delete</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Filter by employee status</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Review selected records carefully</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Deletion is permanent and cannot be undone</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex items-center gap-1 border-b border-gray-200">
              {(['TK Group', 'Branch', 'Department', 'Division', 'Group Schedule', 'Pay House', 'Section', 'Unit'] as const).map((tab) => {
                const getIcon = () => {
                  switch (tab) {
                    case 'TK Group': return Users;
                    case 'Branch': return Building2;
                    case 'Department': return Briefcase;
                    case 'Division': return Award;
                    case 'Group Schedule': return LayoutGrid;
                    case 'Pay House': return Network;
                    case 'Section': return Briefcase;
                    case 'Unit': return LayoutGrid;
                    default: return Users;
                  }
                };
                const Icon = getIcon();
                
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                      activeTab === tab
                        ? 'font-medium bg-blue-600 text-white -mb-px'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab}
                  </button>
                );
              })}
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

                {/* Date Range */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <h2 className="text-gray-700 mb-4">Date Range</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-700 w-16">From:</label>
                      <input
                        type="text"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                      />
                      <button
                        onClick={(e) => handleCalendarClick('dateFrom', e)}
                        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-700 w-16">To:</label>
                      <input
                        type="text"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                      />
                      <button
                        onClick={(e) => handleCalendarClick('dateTo', e)}
                        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200">
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

                {/* Warning Note */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm text-red-800 mb-2">Note</h3>
                      <p className="text-sm text-red-700">
                        This Process assumes that you really don't need the data in RAW DATA. You will not be able to UNDO the deletion after doing this process. You should could re-import again the DTR files.
                      </p>
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
          value={showCalendar === 'dateFrom' ? dateFrom : dateTo}
          onChange={handleDateChange}
          onClose={() => setShowCalendar(null)}
          position={calendarPosition}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            {/* Modal Header */}
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
              <h2 className="text-gray-800">localhost:54096 says</h2>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-gray-800 mb-6">Are you sure you want to delete?</p>
              
              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleConfirmDelete}
                  className="px-8 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm"
                >
                  OK
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}