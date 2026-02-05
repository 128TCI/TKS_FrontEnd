import { useState, useRef, useEffect } from 'react';
import { Calendar, CalendarDays, RefreshCw } from 'lucide-react';
import { CalendarPopover } from '../Modals/CalendarPopover';
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

export function UpdateDaytypeRawdataPage() {
  const [dateFrom, setDateFrom] = useState('5/5/2021');
  const [dateTo, setDateTo] = useState('05/05/2021');
  const [dayTypeOption, setDayTypeOption] = useState<'dateIn' | 'dateOut'>('dateIn');
  const [showCalendar, setShowCalendar] = useState<'dateFrom' | 'dateTo' | null>(null);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [updateOption, setUpdateOption] = useState<'attendance' | 'contract'>('contract');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isUpdating, setIsUpdating] = useState(false);

   // TKSGroup List states
   const [loadingTKSGroup, setLoadingTKSGroup] = useState(false);
   const [tkGroupItems, setTKSGroupItems] = useState<GroupItem[]>([]);
 
   // Fetch TKSGroup data from API
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

  const filteredItems = tkGroupItems.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = tkGroupItems.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );


 // Status Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedStatus = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleUpdate = async () => {
     if (!selectedItems.length) {
      await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Please select TK Group item/s.',
          timer: 2000,
          showConfirmButton: true,
      });
      return;
    }

    if (!dateFrom || !dateTo) {
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please select Date From and Date To.',
            timer: 2000,
            showConfirmButton: true,
        });
        return;
      }

    try {
      setIsUpdating(true);
      await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Successfully updated Raw Day Type.',
          timer: 2000,
          showConfirmButton: false,
      });

      setSelectedItems([]);
    } 
    catch (error) {
      console.error(error);
      alert("Failed to update records");
    } 
    finally {
      setIsUpdating(false);
    }

    /*
    (id: number, checked: boolean) => {
    setSelectedItems(prev =>
      checked ? [...prev, id] : prev.filter(itemId => itemId !== id)
    );

    if (searchTerm.length === 0) {
      alert("Please select at least one TKgroup item.");
      return;

    }

    setLoading(true);

    try {
      await batchUpdateEmployees(selectedItems);
      alert("Update successful!");
    } catch (err) {
      alert("Error updating TKGroup status");
    } finally {
      setLoading(false);
    }
    */
  };
      
  const handleGroupToggle = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const paginatedItem = filteredGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

      // Get visible page numbers
      const getStatusPageNumbers = () => 
      {
        const pages = [];
        if (totalPages <= 7) {
          for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          if (currentPage <= 4) {
            for (let i = 1; i <= 5; i++) pages.push(i);
            pages.push('...');
            pages.push(totalPages);
          } else if (currentPage >= totalPages - 3) {
            pages.push(1);
            pages.push('...');
            for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
          } else {
            pages.push(1);
            pages.push('...');
            for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
            pages.push('...');
            pages.push(totalPages);
          }
        }
        return pages;
      };  

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? tkGroupItems.map(item => item.id) : []);
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    setSelectedItems(prev =>
      checked ? [...prev, id] : prev.filter(itemId => itemId !== id)
    );
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

  const renderPageNumbers = () => {
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
            <h1 className="text-white">Update Raw Day Type</h1>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
            {/* Information Frame */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    Update day type in raw data for selected groups within a specified date range.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0">ℹ</div>
                      <span className="text-gray-600">Select groups and date range</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0">ℹ</div>
                      <span className="text-gray-600">Choose day type option before update</span>
                    </div>
                  </div>
                </div>
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
                            checked={selectedItems.length === tkGroupItems.length}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">Code</th>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedItem.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={(e) => handleSelectItem(item.id, e.target.checked)}
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
                    Showing {filteredItems.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredItems.length)} of {filteredItems.length} entries
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        {getStatusPageNumbers().map((page, idx) => (
                            page === '...' ? (
                                <span key={`ellipsis-${idx}`} className="px-1 text-gray-500 text-xs">...</span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page as number)}
                                    className={`px-2 py-1 rounded text-xs ${currentPage === page
                                            ? 'bg-blue-600 text-white'
                                            : 'border border-gray-300 hover:bg-gray-100'
                                        }`}
                                >
                                    {page}
                                </button>
                            )
                        ))}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
              </div>

              {/* Right Section - Options */}
              <div className="space-y-6">
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
                      <CalendarPopover
                          date={dateFrom}
                          onChange={setDateFrom}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-700 w-16">To:</label>
                      <input
                        type="text"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                      />
                      <CalendarPopover
                          date={dateTo}
                          onChange={setDateTo}
                        />
                    </div>
                  </div>
                </div>

                {/* Option Section */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <h2 className="text-gray-700 mb-4">Option</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="dayTypeOption"
                          value="dateIn"
                          checked={dayTypeOption === 'dateIn'}
                          onChange={() => setDayTypeOption('dateIn')}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Day Type [Date In]</span>
                      </label>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="dayTypeOption"
                          value="dateOut"
                          checked={dayTypeOption === 'dateOut'}
                          onChange={() => setDayTypeOption('dateOut')}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Day Type [Date Out]</span>
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

      {/* Footer */}
      <Footer />
    </div>
  );
}