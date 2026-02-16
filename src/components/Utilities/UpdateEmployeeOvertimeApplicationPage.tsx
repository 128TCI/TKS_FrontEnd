import { useState, useRef, useEffect } from 'react';
import { Clock, Calendar, Check, Search, Users, Building2, Briefcase, CalendarClock, Wallet, Grid, RefreshCw } from 'lucide-react';
import { CalendarPopover } from '../Modals/CalendarPopover';
import { Footer } from '../Footer/Footer';
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

export function UpdateEmployeeOvertimeApplicationPage() {
  const [activeTab, setActiveTab] = useState<'TK Group' | 'Branch' | 'Department' | 'Group Schedule' | 'Pay House' | 'Section'>('TK Group');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('active');
  const [allowedOTHours, setAllowedOTHours] = useState('');
  const [date, setDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const [excludeEmptRestDay, setExcludeEmptRestDay] = useState(false);
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);  
  const [currentGroupPage, setCurrentGroupPage] = useState(1);
  const [currentEmpPage, setCurrentEmpPage] = useState(1);
  const itemsPerPage = 10;

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setCurrentGroupPage(1);
  }, [activeTab]);

  // Branch List states
  const [loadingTKSGroup, setLoadingTKSGroup] = useState(false);
  const [tkGroupItems, setTKSGroupItems] = useState<GroupItem[]>([]);


  // Branch List states
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [branchItems, setBranchItems] = useState<GroupItem[]>([]);

  // Department List states
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [departmentItems, setDepartmentItems] = useState<GroupItem[]>([]);

  // GroupSchedule List states
  const [loadingGroupSchedules, setLoadingGroupSchedules] = useState(false);
  const [groupScheduleItems, setGroupScheduleItems] = useState<GroupItem[]>([]);

  // PayHouse List states
  const [loadingPayHouses, setLoadingPayHouses] = useState(false);
  const [payHouseItems, setPayHouseItems] = useState<GroupItem[]>([]);

  // Section List states
  const [loadingSections, setLoadingSections] = useState(false);
  const [sectionItems, setSectionItems] = useState<GroupItem[]>([]);

  // Employee List states
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeeItems, setEmployeeItems] = useState<EmployeeItem[]>([]);

  /*
  const tkGroupItems: GroupItem[] = [
    { id: 1, code: 'BAT', description: 'BATANGAS' },
    { id: 2, code: 'DASH-TEST', description: 'CEBU' },
    { id: 3, code: 'ddfdsf', description: 'MAKATI' },
    { id: 4, code: 'PASIG', description: 'PASIG' },
    { id: 5, code: 'QC', description: 'QUEZON CITY' }
  ];
  */
   // Fetch branch data from API
    const fetchTKSGroupData = async (): Promise<GroupItem[]> => {
    const response = await apiClient.get('/Fs/Process/TimeKeepGroupSetUp');

    return response.data.map((item: any) => ({
      id: item.ID || item.id ,
      code: item.groupCode || item.code,
      description: item.groupDescription || item.description,
    }));
  };

  useEffect(() => {
      const loadTKSGroup = async () => {
        const items = await fetchTKSGroupData(); // ✅ array
        setTKSGroupItems(items);
      }; 

      loadTKSGroup();

  }, []);

  // Fetch branch data from API
  const fetchBranchData = async (): Promise<GroupItem[]> => {
    const response = await apiClient.get('/Fs/Employment/BranchSetUp');

    return response.data.map((item: any) => ({
      id: item.braID || item.ID ,
      code: item.braCode || item.code,
      description: item.braDesc || item.description,
    }));
  };

  useEffect(() => {
    const loadBranches = async () => {
      const items = await fetchBranchData(); // ✅ array
      setBranchItems(items);
    };

    loadBranches();
  }, []);

  // Fetch department data from API
  const fetchDepartmentData = async (): Promise<GroupItem[]> => {
  const response = await apiClient.get('/Fs/Employment/DepartmentSetUp');

  return response.data.map((item: any) => ({
    id: item.depID || item.ID ,
    code: item.depCode || item.code,
    description: item.depDesc || item.description,
    }));

   };

  useEffect(() => {
    const loadDepartments = async () => {
      const items = await fetchDepartmentData(); // array
      setDepartmentItems(items);
    };

    loadDepartments();
    }, []
  );

  // Fetch groupSchedule data from API
  const fetchGroupScheduleData = async (): Promise<GroupItem[]> => {
    const response = await apiClient.get('/Fs/Employment/GroupSetUp');

    const list = Array.isArray(response.data) ? response.data : [];

    return list.map((item: any) => ({
      id: item.grpSchID || item.id || item.ID,  
      code: item.grpCode || item.code,            
      description: item.grpDesc || item.description,
    }));
  };

  useEffect(() => {
    const loadGroupSchedule = async () => {
      const items = await fetchGroupScheduleData(); 
      setGroupScheduleItems(items);
    };

    loadGroupSchedule();
    }, []
  );

  // Fetch payHouse data from API
  const fetchPayHouseData = async (): Promise<GroupItem[]> => {
    const response = await apiClient.get('/Fs/Employment/PayHouseSetUp');

    const list = Array.isArray(response.data) ? response.data : [];

    return list.map((item: any) => ({
      id: item.lineID ?? item.ID ?? item.id,
      code: item.lineCode ?? item.code,
      description: item.lineDesc ?? item.Description ?? item.description,
    }));
  };


  useEffect(() => {
    const loadPayHouses = async () => {
      const items = await fetchPayHouseData(); // ✅ array
      setPayHouseItems(items);
    };

    loadPayHouses();
    }, []
  );

  // Fetch section data from API
  const fetchSectionData = async (): Promise<GroupItem[]> => {
    const response = await apiClient.get('/Fs/Employment/SectionSetUp');

    const list = Array.isArray(response.data) ? response.data : [];

    return list.map((item: any) => ({
      id: item.secID ?? item.ID ?? item.id,
      code: item.secCode ?? item.sectionCode ?? item.code,
      description: item.secDesc ?? item.Description ?? item.description,
    }));
  };

  useEffect(() => {
    const loadSections = async () => {
      const items = await fetchSectionData(); // ✅ array
      setSectionItems(items);
    };

    loadSections();
    }, []
  );


  // Fetch employee data from API
  const fetchEmployeeData = async (): Promise<EmployeeItem[]> => {
    const response = await apiClient.get('/EmployeeMasterFile');

    const list = Array.isArray(response.data) ? response.data : [];

    return list.map((item: any): EmployeeItem => ({
      id: item.empID ?? item.ID ?? item.id,
      code: item.empCode || item.code || '',
      name: `${item.lName || ''}, ${item.fName || ''} ${item.mName || ''}`.trim(),
    
    }));
  };

  useEffect(() => {
    const loadEmployees = async () => {
      const items = await fetchEmployeeData(); // EmployeeItem[]
      setEmployeeItems(items);
    };

    loadEmployees();
    }, []
  );

  /*
  const fetchEmployeeData = async () => {
    setLoadingEmployees(true);
    setEmployeeError('');

    try {
      const response = await apiClient.get('/EmployeeMasterFile');

      if (response.status === 200 && response.data) {
      const employeeItems: EmployeeItem[] = response.data.map((item: any) => ({
        code: item.empCode || item.code || '',
        name: `${item.lName || ''}, ${item.fName || ''} ${item.mName || ''}`.trim(),
                    
      }));

        setEmployeeItems(employeeItems); // ✅ employeeItems now contains API codes
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        'Failed to load employees';

      setEmployeeError(errorMsg);
      console.error('Error fetching employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, []); 
  */

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'Branch':
        return branchItems;
      case 'Department':
        return departmentItems;
      case 'Group Schedule':
        return groupScheduleItems;
      case 'Pay House':
        return payHouseItems;
      case 'Section':
        return sectionItems;
      default:
        return tkGroupItems;
    }
    
  };

  const currentItems = getCurrentData();

  const filteredGroups = currentItems.filter(item =>
    item.code.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(groupSearchTerm.toLowerCase())
  );

  const filteredEmployees = employeeItems.filter(emp =>
        emp.code.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
        emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase())
    );

  // Group Pagination logic
  const totalGroupPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const startGroupIndex = (currentGroupPage - 1) * itemsPerPage;
  const endGroupIndex = startGroupIndex + itemsPerPage;

  const paginatedGroups = filteredGroups.slice(
    (currentGroupPage - 1) * itemsPerPage,
    currentGroupPage * itemsPerPage
  );

      // Get visible page numbers
      const getGroupPageNumbers = () => 
      {
        const pages = [];
        if (totalGroupPages <= 7) {
          for (let i = 1; i <= totalGroupPages; i++) {
            pages.push(i);
          }
        } else {
          if (currentGroupPage <= 4) {
            for (let i = 1; i <= 5; i++) pages.push(i);
            pages.push('...');
            pages.push(totalGroupPages);
          } else if (currentGroupPage >= totalGroupPages - 3) {
            pages.push(1);
            pages.push('...');
            for (let i = totalGroupPages - 4; i <= totalGroupPages; i++) pages.push(i);
          } else {
            pages.push(1);
            pages.push('...');
            for (let i = currentGroupPage - 1; i <= currentGroupPage + 1; i++) pages.push(i);
            pages.push('...');
            pages.push(totalGroupPages);
          }
        }
        return pages;
      };

  // Employee Pagination logic
  const totalEmployeePages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startEmployeeIndex = (currentEmpPage - 1) * itemsPerPage;
  const endEmployeeIndex = startEmployeeIndex + itemsPerPage;
  
  const paginatedEmployees = filteredEmployees.slice(
    (currentEmpPage - 1) * itemsPerPage,
    currentEmpPage * itemsPerPage
  );
      // Get visible page numbers
      const getEmployeePageNumbers = () => {
          const pages = [];
          const maxVisible = 5;
          if (totalEmployeePages <= maxVisible) {
              return Array.from({ length: totalEmployeePages }, (_, i) => i + 1);
          }
          pages.push(1);
          if (currentEmpPage > 3) pages.push('...');
          const start = Math.max(2, currentEmpPage - 1);
          const end = Math.min(totalEmployeePages - 1, currentEmpPage + 1);
          for (let i = start; i <= end; i++) pages.push(i);
          if (currentEmpPage < totalEmployeePages - 2) pages.push('...');
          pages.push(totalEmployeePages);
          return pages;
      };

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

  const handleUpdate = async () => {
      if (!selectedEmployees.length) {
      await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Please select employee/s to update.',
          timer: 2000,
          showConfirmButton: true,
      });
      return;
    }

    if (!date ) {
      await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Please select Date.',
          timer: 2000,
          showConfirmButton: true,
      });
      return;
    } 
    {/*}
    if (!allowedOTHours ) {
      await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Approved OT Hours cannot be empty.',
          timer: 2000,
          showConfirmButton: true,
      });
      return;
    } 
    */}
    
    try {
      setIsUpdating(true);
      await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Successfully updated Employees Overtime Application.',
          timer: 2000,
          showConfirmButton: false,
      });

      setSelectedGroups([]);
      setSelectedEmployees([]);
      setDate('');
      setAllowedOTHours('');

    } 
    catch (error) {
      console.error(error);
      alert("Failed to update records");
    } 
    finally {
      setIsUpdating(false);
    }

  };

  const handleDateClick = (event: React.MouseEvent<HTMLInputElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setCalendarPosition({ top: rect.bottom + 5, left: rect.left });
    setShowCalendar(true);
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
                        className={`px-3 py-1 rounded text-sm ${currentPage === page
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
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Update Overtime Application</h1>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
            {/* Information Frame */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    Update employee overtime application records. Select groups and employees, then set the allowed OT hours and date.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Select by TK Group, Branch, or Department</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Filter by employee status</span>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
                {/* Pagination */}
                <div className="flex items-center justify-between mt-3">
                  <div className="text-gray-600 text-xs">
                      Showing {filteredEmployees.length === 0 ? 0 : startGroupIndex + 1} to {Math.min(endGroupIndex, filteredGroups.length)} of {filteredGroups.length} entries
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setCurrentGroupPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentGroupPage === 1}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        {getGroupPageNumbers().map((page, idx) => (
                            page === '...' ? (
                                <span key={`ellipsis-${idx}`} className="px-1 text-gray-500 text-xs">...</span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => setCurrentGroupPage(page as number)}
                                    className={`px-2 py-1 rounded text-xs ${currentGroupPage === page
                                            ? 'bg-blue-600 text-white'
                                            : 'border border-gray-300 hover:bg-gray-100'
                                        }`}
                                >
                                    {page}
                                </button>
                            )
                        ))}
                        <button
                            onClick={() => setCurrentGroupPage(prev => Math.min(prev + 1, totalGroupPages))}
                            disabled={currentGroupPage === totalGroupPages || totalGroupPages === 0}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
              </div>

              {/* Right Section - Employee List */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                {/* Employee List */}
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
                {/* Pagination */}
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Showing {startEmployeeIndex + 1} to {Math.min(endEmployeeIndex, filteredEmployees.length)} of {filteredEmployees.length} entries
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentEmpPage(p => Math.max(1, p - 1))}
                      disabled={currentEmpPage === 1}
                      className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {getEmployeePageNumbers().map((page, index) => (
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
                      onClick={() => setCurrentEmpPage(p => Math.min(totalEmployeePages, p + 1))}
                      disabled={currentEmpPage === totalEmployeePages}
                      className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
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
            </div>

            {/* Bottom Section - Update Options */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
              <div className="space-y-4">
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-700">Allowed OT Hours</label>
                    <input
                      type="text"
                      value={allowedOTHours}
                      onChange={(e) => setAllowedOTHours(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-700">Date</label>
                    <div className="relative flex items-center gap-1">
                      <input
                        type="text"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        onClick={handleDateClick}
                        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                      />
                      <CalendarPopover
                          date={date}
                          onChange={setDate}
                        />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={excludeEmptRestDay}
                      onChange={(e) => setExcludeEmptRestDay(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">ExcludeEmptRestDay</span>
                  </label>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                    onClick={handleUpdate} >
                    <RefreshCw className="w-4 h-4" />
                    Update
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
          value={date}
          onChange={(newDate) => {
            setDate(newDate);
            setShowCalendar(false);
          }}
          onClose={() => setShowCalendar(false)}
          position={calendarPosition}
        />
      )}

      <Footer />
    </div>
  );
}