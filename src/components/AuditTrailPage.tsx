import { useState, useRef, useEffect } from 'react';
import { FileText, Check, Search, X, ChevronUp, ChevronDown, Calendar, Clock, RotateCcw, Download } from 'lucide-react';
import { Footer } from './Footer/Footer';
import { UserSearchModal } from '../components/Modals/UserSearchModal';
import { FormNameSearchModal } from '../components/Modals/FormNameSearchModal';
 
import apiClient from '../services/apiClient';
interface AuditLog {
  id: number;
  date: string;
  user: string;
  pcName: string;
  formName: string;
  accessType: string;
  activity: string;
  message: string;
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

interface TimePickerPopupProps {
  value: string;
  onChange: (time: string) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

function TimePickerPopup({ value, onChange, onClose, position }: TimePickerPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [hours, setHours] = useState('10');
  const [minutes, setMinutes] = useState('00');
  const [seconds, setSeconds] = useState('00');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleOk = () => {
    const timeString = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    onChange(timeString);
    onClose();
  };

  return (
    <div
      ref={popupRef}
      className="absolute bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50"
      style={{ top: position.top, left: position.left, width: '200px' }}
    >
      <div className="mb-3">
        <label className="block text-xs text-gray-600 mb-2">Time</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="23"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-14 px-2 py-1 border border-gray-300 rounded text-sm text-center"
            placeholder="HH"
          />
          <span className="text-gray-600">:</span>
          <input
            type="number"
            min="0"
            max="59"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="w-14 px-2 py-1 border border-gray-300 rounded text-sm text-center"
            placeholder="MM"
          />
          <span className="text-gray-600">:</span>
          <input
            type="number"
            min="0"
            max="59"
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
            className="w-14 px-2 py-1 border border-gray-300 rounded text-sm text-center"
            placeholder="SS"
          />
        </div>
      </div>
      <button
        onClick={handleOk}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
      >
        OK
      </button>
    </div>
  );
}

export function AuditTrailPage() {
  const [dateFrom, setDateFrom] = useState('12/26/2025');
  const [timeFrom, setTimeFrom] = useState('10:00:00');
  const [dateTo, setDateTo] = useState('12/26/2025');
  const [timeTo, setTimeTo] = useState('10:00:00');
  const [formNameFilter, setFormNameFilter] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [sortField, setSortField] = useState<keyof AuditLog>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showCalendar, setShowCalendar] = useState<'dateFrom' | 'dateTo' | null>(null);
  const [showTimePicker, setShowTimePicker] = useState<'timeFrom' | 'timeTo' | null>(null);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const [timePickerPosition, setTimePickerPosition] = useState({ top: 0, left: 0 });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 100;
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isFormNameModalOpen, setIsFormNameModalOpen] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    if (isFiltered) {
      fetchAuditTrailFiltered(page);
    } else {
      fetchAuditTrail(page);
    }
  }, [page, isFiltered]);
  const fetchAuditTrail = async (pageNumber = 0) => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.get(
        `/AuditTrail/GetAuditTrail/All?page=${pageNumber}&pageSize=${pageSize}`
      );

      if (response.status === 200 && response.data) {
        const mappedData: AuditLog[] = response.data.data.map((item: any) => ({
          id: item.id || 0,
          date: item.date || '',
          user: item.userId || '',
          pcName: item.machine || '',
          formName: item.formName || '',
          accessType: item.accessType || '',
          activity: item.trans || '',
          message: item.messages || ''
        }));

        setFilteredLogs(mappedData);
        setTotalCount(response.data.totalCount);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch audit trail');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditTrailFiltered = async (pageNumber = 0) => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        DateFrom: new Date(`${dateFrom} ${timeFrom}`),
        DateTo: new Date(`${dateTo} ${timeTo}`),
        FormName: formNameFilter || '',
        UserId: userFilter || '',
        Activity: activityFilter || '',
        DisplayStart: pageNumber * pageSize,
        DisplayLength: pageSize
      };


      const response = await apiClient.post(
        '/AuditTrail/GetAuditTrail/Filtered',
        payload
      );

      if (response.status === 200 && response.data) {
        const mappedData: AuditLog[] = response.data.data.map((item: any) => ({
          id: item.id || 0,
          date: item.date || '',
          user: item.userId || '',
          pcName: item.machine || '',
          formName: item.formName || '',
          accessType: item.accessType || '',
          activity: item.trans || '',
          message: item.messages || ''
        }));

        setFilteredLogs(mappedData);
        setTotalCount(response.data.totalCount);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search audit trail');
    } finally {
      setLoading(false);
    }
  };

const handleSearch = async () => {
  setIsFiltered(true);

  if (page === 0) {
    await fetchAuditTrailFiltered(0);
  } else {
    setPage(0);
  }
};


  const handleReset = () => {
    setDateFrom('12/26/2025');
    setTimeFrom('10:00:00');
    setDateTo('12/26/2025');
    setTimeTo('10:00:00');
    setFormNameFilter('');
    setActivityFilter('');
    setUserFilter('');
    setIsFiltered(false);
    setPage(0);
  };

  const handleSort = (field: keyof AuditLog) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: keyof AuditLog }) => {
    if (sortField !== field) {
      return (
        <div className="ml-1 flex flex-col">
          <ChevronUp className="w-3 h-3 text-gray-400" />
          <ChevronDown className="w-3 h-3 text-gray-400 -mt-1" />
        </div>
      );
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1" />
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Audit Trail</h1>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
            {/* Information Frame */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    Monitor and review all system activities including user logins, form access, data modifications, and administrative actions. Filter by date range, user, form, or activity type.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Track all user activities and access logs</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Filter by date range, user, or activity type</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Monitor data modifications and changes</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Export audit reports for compliance</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Filters */}
            <div className="mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Date Range */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Date From</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          readOnly
                        />
                        <button
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setCalendarPosition({ top: rect.bottom, left: rect.left });
                            setShowCalendar('dateFrom');
                          }}
                          className="absolute top-0 right-0 p-2 bg-gray-200 text-gray-500 rounded hover:bg-gray-300 transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Time From</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={timeFrom}
                          onChange={(e) => setTimeFrom(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          readOnly
                        />
                        <button
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTimePickerPosition({ top: rect.bottom, left: rect.left });
                            setShowTimePicker('timeFrom');
                          }}
                          className="absolute top-0 right-0 p-2 bg-gray-200 text-gray-500 rounded hover:bg-gray-300 transition-colors"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Date To</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          readOnly
                        />
                        <button
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setCalendarPosition({ top: rect.bottom, left: rect.left });
                            setShowCalendar('dateTo');
                          }}
                          className="absolute top-0 right-0 p-2 bg-gray-200 text-gray-500 rounded hover:bg-gray-300 transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Time To</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={timeTo}
                          onChange={(e) => setTimeTo(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          readOnly
                        />
                        <button
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTimePickerPosition({ top: rect.bottom, left: rect.left });
                            setShowTimePicker('timeTo');
                          }}
                          className="absolute top-0 right-0 p-2 bg-gray-200 text-gray-500 rounded hover:bg-gray-300 transition-colors"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Filters */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <div className="space-y-4">
                    {/* Form Name Filter */}
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Form Name</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={formNameFilter}
                          onChange={(e) => setFormNameFilter(e.target.value)}
                          placeholder="FormName"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button
                          onClick={() => setIsFormNameModalOpen(true)} 
                          className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setFormNameFilter('')}
                          className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Activity Filter */}
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Activity</label>
                      <input
                        type="text"
                        value={activityFilter}
                        onChange={(e) => setActivityFilter(e.target.value)}
                        placeholder="Activity"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    {/* User Filter */}
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">User</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={userFilter}
                          onChange={(e) => setUserFilter(e.target.value)}
                          placeholder="Users"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button
                          onClick={() => setIsUserModalOpen(true)} 
                          className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setUserFilter('')}
                          className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  onClick={() => alert('Export functionality would be implemented here')}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </div>

            {/* Audit Trail Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">
                        <button
                          onClick={() => handleSort('date')}
                          className="flex items-center hover:text-gray-900"
                        >
                          Date
                          <SortIcon field="date" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">
                        <button
                          onClick={() => handleSort('user')}
                          className="flex items-center hover:text-gray-900"
                        >
                          User
                          <SortIcon field="user" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">
                        <button
                          onClick={() => handleSort('pcName')}
                          className="flex items-center hover:text-gray-900"
                        >
                          PC Name
                          <SortIcon field="pcName" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">
                        <button
                          onClick={() => handleSort('formName')}
                          className="flex items-center hover:text-gray-900"
                        >
                          Form Name
                          <SortIcon field="formName" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">
                        <button
                          onClick={() => handleSort('accessType')}
                          className="flex items-center hover:text-gray-900"
                        >
                          Access Type
                          <SortIcon field="accessType" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">
                        <button
                          onClick={() => handleSort('activity')}
                          className="flex items-center hover:text-gray-900"
                        >
                          Activity
                          <SortIcon field="activity" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {(() => {
                              const parsed = new Date(log.date);
                              if (isNaN(parsed.getTime())) return '-';
                              return new Intl.DateTimeFormat('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              }).format(parsed);
                            })()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{log.user}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{log.pcName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{log.formName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{log.accessType}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{log.activity}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{log.message}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-gray-500 text-sm">
                          No data available in table
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Showing {page * pageSize + 1} to {Math.min(page * pageSize + filteredLogs.length, totalCount)} of {totalCount} entries
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                    className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs"
                  >
                    Previous
                  </button>

                  <button
                    onClick={() => setPage(prev => prev + 1)}
                    className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs"
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
          value={showCalendar === 'dateFrom' ? dateFrom : dateTo}
          onChange={(date) => {
            if (showCalendar === 'dateFrom') {
              setDateFrom(date);
            } else {
              setDateTo(date);
            }
            setShowCalendar(null);
          }}
          onClose={() => setShowCalendar(null)}
          position={calendarPosition}
        />
      )}

      {/* Time Picker Popup */}
      {showTimePicker && (
        <TimePickerPopup
          value={showTimePicker === 'timeFrom' ? timeFrom : timeTo}
          onChange={(time) => {
            if (showTimePicker === 'timeFrom') {
              setTimeFrom(time);
            } else {
              setTimeTo(time);
            }
            setShowTimePicker(null);
          }}
          onClose={() => setShowTimePicker(null)}
          position={timePickerPosition}
        />
      )}
      {/* User Search Popup */}
      <UserSearchModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSelect={(id, username) => {
          setUserFilter(username);  // populate the input
          setIsUserModalOpen(false);    // close modal
        }}
      />
      <FormNameSearchModal
        isOpen={isFormNameModalOpen}
        onClose={() => setIsFormNameModalOpen(false)}
        onSelect={(name) => {
          setFormNameFilter(name);        // populate the input with the selected form name
          setIsFormNameModalOpen(false);  // close modal
        }}
      />
    </div>
  );
}