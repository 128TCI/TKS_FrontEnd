import { useState, useRef, useEffect } from 'react';
import { Calendar, AlertCircle, Check, Save, Upload, RotateCcw, Users, Building2, Briefcase, Network, CalendarClock, Wallet, Grid, Box } from 'lucide-react';
import { Footer } from '../Footer/Footer';
import apiClient from '../../services/apiClient';
import Swal from 'sweetalert2';

interface GroupItem {
    id: number;
    code: string;
    description: string;
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
  const [activeTab, setActiveTab] = useState<'TK Group' | 'Branch' | 'Department' | 'Group Schedule' | 'Pay House' | 'Section'>('TK Group');    
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const [showCalendar, setShowCalendar] = useState<'year' | 'dateFrom' | 'dateTo' | 'dateFrom' | 'postingDate' |null>(null);
  const [dateFrom, setDateFrom] = useState('5/5/2021');
  const [dateTo, setDateTo] = useState('05/05/2021');
  const [postingDate, setPostingDate] = useState('12/26/2025');
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [currentGroupPage, setCurrentGroupPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
     setCurrentGroupPage(1);
     //setSelectedGroups([]); // optional but recommended    
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

    const handleGroupToggle = (id: number) => {
        setSelectedGroups(prev =>
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
                {[
                    { name: 'TK Group' as const, icon: Users },
                    { name: 'Branch' as const, icon: Building2 },
                    { name: 'Department' as const, icon: Briefcase },
                    { name: 'Group Schedule' as const, icon: CalendarClock },
                    { name: 'Pay House' as const, icon: Wallet },
                    { name: 'Section' as const, icon: Grid },
                ].map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${activeTab === tab.name
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-blue-50'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.name}
                    </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="mb-4 flex justify-end">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Search:</label>
                <input
                  type="text"
                  value={groupSearchTerm}
                  onChange={(e) => setGroupSearchTerm(e.target.value)}
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
                          onChange={handleSelectAllGroups}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                    {paginatedGroups.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedGroups.includes(item.id)}
                            onChange={(e) => handleGroupToggle(item.id)}
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
                <div className="flex items-center justify-between mt-3">
                  <div className="text-gray-600 text-xs">
                      Showing {filteredGroups.length === 0 ? 0 : startGroupIndex + 1} to {Math.min(endGroupIndex, filteredGroups.length)} of {filteredGroups.length} entries
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