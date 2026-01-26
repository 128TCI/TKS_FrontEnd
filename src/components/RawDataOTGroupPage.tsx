import { useState } from 'react';
import { 
  Search, 
  Calendar, 
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Clock
} from 'lucide-react';
import { DatePicker } from './DateSetup/DatePicker';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';

interface OTRecord {
  empCode: string;
  empName: string;
  workshiftCode: string;
  actualDateIn: string;
  dateIn: string;
  timeIn: string;
  dateOut: string;
  timeOut: string;
  dayType: string;
}

export function RawDataOTGroupPage() {
  const [dateFrom, setDateFrom] = useState('3/1/2020');
  const [dateTo, setDateTo] = useState('03/15/2020');
  const [viewMode, setViewMode] = useState<'all' | 'specific'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<OTRecord | null>(null);
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);
  
  // Form fields
  const [empCode, setEmpCode] = useState('');
  const [workshiftCode, setWorkshiftCode] = useState('');
  const [actualDateIn, setActualDateIn] = useState('');
  const [dateIn, setDateIn] = useState('');
  const [timeIn, setTimeIn] = useState('');
  const [dateOut, setDateOut] = useState('');
  const [timeOut, setTimeOut] = useState('');

  const records: OTRecord[] = [
    {
      empCode: 'Z1047',
      empName: 'PERLITA, MANALO LUCAS',
      workshiftCode: '730AM08PM',
      actualDateIn: '3/2/2020',
      dateIn: '3/2/2020',
      timeIn: '7:00 PM',
      dateOut: '3/2/2020',
      timeOut: '9:58 PM',
      dayType: 'RegDay'
    }
  ];

  const handleEdit = (record: OTRecord) => {
    setSelectedRecord(record);
    setEmpCode(record.empCode);
    setWorkshiftCode(record.workshiftCode);
    setActualDateIn(record.actualDateIn);
    setDateIn(record.dateIn);
    setTimeIn(record.timeIn);
    setDateOut(record.dateOut);
    setTimeOut(record.timeOut);
    setShowEditModal(true);
  };

  const handleCreateNew = () => {
    setEmpCode('');
    setWorkshiftCode('');
    setActualDateIn('');
    setDateIn('');
    setTimeIn('');
    setDateOut('');
    setTimeOut('');
    setShowCreateModal(true);
  };

  const handleSubmit = () => {
    console.log('Submitting form...');
    setShowCreateModal(false);
    setShowEditModal(false);
  };

  const handleDelete = (empCode: string) => {
    if (confirm(`Are you sure you want to delete record for ${empCode}?`)) {
      console.log('Deleting:', empCode);
    }
  };

  // Parse date string (M/D/YYYY) to Date object
  const parseDate = (dateStr: string): Date | undefined => {
    if (!dateStr) return undefined;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const month = parseInt(parts[0]) - 1; // Months are 0-indexed
      const day = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    return undefined;
  };

  // Format Date object to M/D/YYYY string
  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleDateFromSelect = (date: Date | undefined) => {
    if (date) {
      setDateFrom(formatDate(date));
      setDateFromOpen(false);
    }
  };

  const handleDateToSelect = (date: Date | undefined) => {
    if (date) {
      setDateTo(formatDate(date));
      setDateToOpen(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Raw Data OT Gap</h1>
        <p className="text-gray-600">Manage overtime gap records and adjustments</p>
      </div>

      <div className="space-y-6">
        {/* Controls Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Create New & View Mode */}
            <div className="lg:col-span-4">
              <button
                onClick={handleCreateNew}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all shadow-lg shadow-orange-500/30 mb-4"
              >
                <Plus className="w-5 h-5" />
                <span>Create New</span>
              </button>

              <div className="space-y-2">
                <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="radio"
                    name="viewMode"
                    checked={viewMode === 'all'}
                    onChange={() => setViewMode('all')}
                    className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-gray-700">All Records</span>
                </label>
                <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="radio"
                    name="viewMode"
                    checked={viewMode === 'specific'}
                    onChange={() => setViewMode('specific')}
                    className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-gray-700">Specific Records</span>
                </label>
              </div>
            </div>

            {/* Date Range */}
            <div className="lg:col-span-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Date From</label>
                  <div className="flex gap-0">
                    <div className="relative flex-1">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                      <input
                        type="text"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="MM/DD/YYYY"
                      />
                    </div>
                    <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-r-xl hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={parseDate(dateFrom)}
                          onSelect={handleDateFromSelect}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Date To</label>
                  <div className="flex gap-0">
                    <div className="relative flex-1">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                      <input
                        type="text"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="MM/DD/YYYY"
                      />
                    </div>
                    <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-r-xl hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={parseDate(dateTo)}
                          onSelect={handleDateToSelect}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="lg:col-span-3 flex items-end">
              <button className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors">
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">OT Gap Records</h3>
            <span className="text-gray-600" style={{ fontSize: '0.875rem' }}>
              Showing {records.length} {records.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-700 whitespace-nowrap" style={{ fontSize: '0.875rem' }}>Actions</th>
                    <th className="px-4 py-3 text-left text-gray-700 whitespace-nowrap" style={{ fontSize: '0.875rem' }}>Employee Code</th>
                    <th className="px-4 py-3 text-left text-gray-700 whitespace-nowrap" style={{ fontSize: '0.875rem' }}>Employee Name</th>
                    <th className="px-4 py-3 text-left text-gray-700 whitespace-nowrap" style={{ fontSize: '0.875rem' }}>Workshift Code</th>
                    <th className="px-4 py-3 text-left text-gray-700 whitespace-nowrap" style={{ fontSize: '0.875rem' }}>Actual Date-In</th>
                    <th className="px-4 py-3 text-left text-gray-700 whitespace-nowrap" style={{ fontSize: '0.875rem' }}>Date-In</th>
                    <th className="px-4 py-3 text-left text-gray-700 whitespace-nowrap" style={{ fontSize: '0.875rem' }}>Time-In</th>
                    <th className="px-4 py-3 text-left text-gray-700 whitespace-nowrap" style={{ fontSize: '0.875rem' }}>Date-Out</th>
                    <th className="px-4 py-3 text-left text-gray-700 whitespace-nowrap" style={{ fontSize: '0.875rem' }}>Time-Out</th>
                    <th className="px-4 py-3 text-left text-gray-700 whitespace-nowrap" style={{ fontSize: '0.875rem' }}>DayType</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {records.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-1.5 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleDelete(record.empCode)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-900">{record.empCode}</td>
                      <td className="px-4 py-3 text-gray-900">{record.empName}</td>
                      <td className="px-4 py-3 text-gray-600">{record.workshiftCode}</td>
                      <td className="px-4 py-3 text-gray-600">{record.actualDateIn}</td>
                      <td className="px-4 py-3 text-gray-600">{record.dateIn}</td>
                      <td className="px-4 py-3 text-gray-600">{record.timeIn}</td>
                      <td className="px-4 py-3 text-gray-600">{record.dateOut}</td>
                      <td className="px-4 py-3 text-gray-600">{record.timeOut}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg" style={{ fontSize: '0.75rem' }}>
                          {record.dayType}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-gray-600" style={{ fontSize: '0.875rem' }}>
              Showing 1 to {records.length} of {records.length} {records.length === 1 ? 'entry' : 'entries'}
            </p>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Previous
              </button>
              <button className="px-3 py-1 bg-orange-600 text-white rounded-lg">1</button>
              <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-gray-900">
                {showEditModal ? 'Edit Record' : 'Create New Record'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Employee Code */}
              <div>
                <label className="block text-gray-700 mb-2">Employee Code</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={empCode}
                    onChange={(e) => setEmpCode(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter employee code"
                  />
                  <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Workshift Code */}
              <div>
                <label className="block text-gray-700 mb-2">WorkShift Code</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={workshiftCode}
                    onChange={(e) => setWorkshiftCode(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter workshift code"
                  />
                  <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Actual Date In */}
              <div>
                <label className="block text-gray-700 mb-2">Actual Date In</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={actualDateIn}
                    onChange={(e) => setActualDateIn(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="MM/DD/YYYY"
                  />
                </div>
              </div>

              {/* Date In */}
              <div>
                <label className="block text-gray-700 mb-2">Date In</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={dateIn}
                    onChange={(e) => setDateIn(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="MM/DD/YYYY"
                  />
                </div>
              </div>

              {/* Time In */}
              <div>
                <label className="block text-gray-700 mb-2">Time In</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={timeIn}
                    onChange={(e) => setTimeIn(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="HH:MM AM/PM"
                  />
                </div>
              </div>

              {/* Date Out */}
              <div>
                <label className="block text-gray-700 mb-2">Date Out</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={dateOut}
                    onChange={(e) => setDateOut(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="MM/DD/YYYY"
                  />
                </div>
              </div>

              {/* Time Out */}
              <div>
                <label className="block text-gray-700 mb-2">Time Out</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={timeOut}
                    onChange={(e) => setTimeOut(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="HH:MM AM/PM"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all shadow-lg shadow-orange-500/30"
              >
                <Save className="w-4 h-4" />
                <span>Submit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}