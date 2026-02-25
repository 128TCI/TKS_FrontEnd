import { useState, useEffect } from 'react';
import { X, Plus, Check, Clock, ChevronUp, ChevronDown, Search, ArrowLeft, Info, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';

interface Workshift {
  code: string;
  description: string;
  timeIn: string;
  break1Out: string;
  break1In: string;
  break2Out: string;
  break2In: string;
  break3Out: string;
  break3In: string;
  timeOut: string;
  halfOfShift: string;
  midnightShift: boolean;
  shift12AMOnwards: boolean;
  flexibleWorkshift: boolean;
  flexibleBaseOnWorkshift: boolean;
  flexibleBreak: boolean;
  maxAllowableBreak2: string;
  inExcessAllowableBreak2ForFlexiBreak: boolean;
  computeAsTardiness: boolean;
  computeAsUndertime: boolean;
  standardHours: string;
  hoursForAbsent: string;
  hoursForNoLogin: string;
  hoursForNoLogout: string;
  hoursForNoBreak2Out: string;
  hoursForNoBreak2In: string;
  paidUnworkedHoliday: string;
  minHoursToCompleteShift: string;
  completeShiftWithUndertime: boolean;
  loginTimeConsiderAbsent: string;
  allowFlexibleTimeIn: string;
  brkRoundUpNearest: string;
  hoursForOTCode: string;
  requiredHours: string;
  requiredHoursPayIfPaidLeave: string;
  secondShiftForRawData: boolean;
  deductBreak1Overbreak: boolean;
  flexibleBreak1: boolean;
  deductBreak3Overbreak: boolean;
  flexibleBreak3: boolean;
  combineBreak1And3: boolean;
  computeAsTardinessCombine: boolean;
  computeAsUndertimeCombine: boolean;
  tardiness: string;
  undertime: string;
}

export function WorkshiftSetupPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const [timePickerField, setTimePickerField] = useState<string>('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchType, setSearchType] = useState<'tardiness' | 'undertime'>('tardiness');
  const [bracketingSearch, setBracketingSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCode, setEditingCode] = useState('');
  const [selectedWorkshift, setSelectedWorkshift] = useState<Workshift | null>(null);
  
  // Time picker state
  const [selectedHour, setSelectedHour] = useState(3);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('PM');

  // Helper function to format time input (hh:mm)
  const formatTimeInput = (value: string): string => {
    // Remove all non-numeric characters except colon
    let cleaned = value.replace(/[^\d:]/g, '');
    
    // Remove any colons
    let numbers = cleaned.replace(/:/g, '');
    
    // Limit to 4 digits
    numbers = numbers.slice(0, 4);
    
    // Format as hh:mm
    if (numbers.length >= 3) {
      return numbers.slice(0, 2) + ':' + numbers.slice(2);
    } else if (numbers.length >= 1) {
      return numbers;
    }
    return '';
  };

  // Helper function to format time input with AM/PM (HH:mm TT)
  const formatTimeWithPeriod = (value: string): string => {
    // Remove existing formatting
    let cleaned = value.replace(/[^\d:APMapm\s]/g, '');
    
    // Extract numbers only
    let numbers = cleaned.replace(/[^\d]/g, '');
    
    // Extract period (AM/PM) if exists
    let period = '';
    const upperValue = value.toUpperCase();
    if (upperValue.includes('AM')) {
      period = 'AM';
    } else if (upperValue.includes('PM')) {
      period = 'PM';
    }
    
    // Limit to 4 digits (HHmm)
    numbers = numbers.slice(0, 4);
    
    // Format as HH:mm
    let formatted = '';
    if (numbers.length >= 3) {
      let hours = numbers.slice(0, 2);
      let minutes = numbers.slice(2, 4);
      
      // Validate hours (01-12)
      let hourNum = parseInt(hours);
      if (hourNum > 12) hours = '12';
      if (hourNum === 0) hours = '01';
      
      // Validate minutes (00-59)
      let minNum = parseInt(minutes);
      if (minNum > 59) minutes = '59';
      
      formatted = hours + ':' + minutes;
    } else if (numbers.length >= 1) {
      formatted = numbers;
    }
    
    // Add period if exists
    if (formatted && period) {
      return formatted + ' ' + period;
    }
    return formatted;
  };

  // Bracketing data
  const bracketingData = [
    { code: 'TARDY', description: 'Tardiness Bracket', flag: 'TARDINESS' },
    { code: 'UNDER', description: 'Undertime Bracket', flag: 'UNDERTIME' },
    { code: 'COMBO', description: 'Combined Bracket', flag: 'COMBINED' }
  ];

  const [formData, setFormData] = useState<Workshift>({
    code: '',
    description: '',
    timeIn: '03:00 PM',
    break1Out: '',
    break1In: '',
    break2Out: '',
    break2In: '',
    break3Out: '',
    break3In: '',
    timeOut: '12:00 AM',
    halfOfShift: '',
    midnightShift: false,
    shift12AMOnwards: false,
    flexibleWorkshift: false,
    flexibleBaseOnWorkshift: false,
    flexibleBreak: false,
    maxAllowableBreak2: '',
    inExcessAllowableBreak2ForFlexiBreak: false,
    computeAsTardiness: false,
    computeAsUndertime: false,
    standardHours: '8.00',
    hoursForAbsent: '8.00',
    hoursForNoLogin: '4.00',
    hoursForNoLogout: '4.00',
    hoursForNoBreak2Out: '',
    hoursForNoBreak2In: '',
    paidUnworkedHoliday: '8.00',
    minHoursToCompleteShift: '0.00',
    completeShiftWithUndertime: false,
    loginTimeConsiderAbsent: '',
    allowFlexibleTimeIn: '',
    brkRoundUpNearest: '',
    hoursForOTCode: '',
    requiredHours: '',
    requiredHoursPayIfPaidLeave: '0.00',
    secondShiftForRawData: false,
    deductBreak1Overbreak: false,
    flexibleBreak1: false,
    deductBreak3Overbreak: false,
    flexibleBreak3: false,
    combineBreak1And3: false,
    computeAsTardinessCombine: false,
    computeAsUndertimeCombine: false,
    tardiness: '',
    undertime: ''
  });

  // Sample data - Workshift records
  const [workshiftData, setWorkshiftData] = useState<Workshift[]>([
    { 
      code: '3PM12AM', 
      description: '3PM TO 12AM',
      timeIn: '03:00 PM',
      break1Out: '',
      break1In: '',
      break2Out: '',
      break2In: '',
      break3Out: '',
      break3In: '',
      timeOut: '12:00 AM',
      halfOfShift: '',
      midnightShift: false,
      shift12AMOnwards: false,
      flexibleWorkshift: false,
      flexibleBaseOnWorkshift: false,
      flexibleBreak: false,
      maxAllowableBreak2: '',
      inExcessAllowableBreak2ForFlexiBreak: false,
      computeAsTardiness: false,
      computeAsUndertime: false,
      standardHours: '8.00',
      hoursForAbsent: '8.00',
      hoursForNoLogin: '4.00',
      hoursForNoLogout: '4.00',
      hoursForNoBreak2Out: '',
      hoursForNoBreak2In: '',
      paidUnworkedHoliday: '8.00',
      minHoursToCompleteShift: '0.00',
      completeShiftWithUndertime: false,
      loginTimeConsiderAbsent: '',
      allowFlexibleTimeIn: '',
      brkRoundUpNearest: '',
      hoursForOTCode: '',
      requiredHours: '',
      requiredHoursPayIfPaidLeave: '0.00',
      secondShiftForRawData: false,
      deductBreak1Overbreak: false,
      flexibleBreak1: false,
      deductBreak3Overbreak: false,
      flexibleBreak3: false,
      combineBreak1And3: false,
      computeAsTardinessCombine: false,
      computeAsUndertimeCombine: false,
      tardiness: '',
      undertime: ''
    },
    { 
      code: '6AM3PM', 
      description: '6AM3PM',
      timeIn: '06:00 AM',
      break1Out: '',
      break1In: '',
      break2Out: '',
      break2In: '',
      break3Out: '',
      break3In: '',
      timeOut: '03:00 PM',
      halfOfShift: '',
      midnightShift: false,
      shift12AMOnwards: false,
      flexibleWorkshift: false,
      flexibleBaseOnWorkshift: false,
      flexibleBreak: false,
      maxAllowableBreak2: '',
      inExcessAllowableBreak2ForFlexiBreak: false,
      computeAsTardiness: false,
      computeAsUndertime: false,
      standardHours: '8.00',
      hoursForAbsent: '8.00',
      hoursForNoLogin: '4.00',
      hoursForNoLogout: '4.00',
      hoursForNoBreak2Out: '',
      hoursForNoBreak2In: '',
      paidUnworkedHoliday: '8.00',
      minHoursToCompleteShift: '0.00',
      completeShiftWithUndertime: false,
      loginTimeConsiderAbsent: '',
      allowFlexibleTimeIn: '',
      brkRoundUpNearest: '',
      hoursForOTCode: '',
      requiredHours: '',
      requiredHoursPayIfPaidLeave: '0.00',
      secondShiftForRawData: false,
      deductBreak1Overbreak: false,
      flexibleBreak1: false,
      deductBreak3Overbreak: false,
      flexibleBreak3: false,
      combineBreak1And3: false,
      computeAsTardinessCombine: false,
      computeAsUndertimeCombine: false,
      tardiness: '',
      undertime: ''
    },
    { 
      code: '6PM3AM', 
      description: '6PM3AM',
      timeIn: '06:00 PM',
      break1Out: '',
      break1In: '',
      break2Out: '',
      break2In: '',
      break3Out: '',
      break3In: '',
      timeOut: '03:00 AM',
      halfOfShift: '',
      midnightShift: false,
      shift12AMOnwards: false,
      flexibleWorkshift: false,
      flexibleBaseOnWorkshift: false,
      flexibleBreak: false,
      maxAllowableBreak2: '',
      inExcessAllowableBreak2ForFlexiBreak: false,
      computeAsTardiness: false,
      computeAsUndertime: false,
      standardHours: '8.00',
      hoursForAbsent: '8.00',
      hoursForNoLogin: '4.00',
      hoursForNoLogout: '4.00',
      hoursForNoBreak2Out: '',
      hoursForNoBreak2In: '',
      paidUnworkedHoliday: '8.00',
      minHoursToCompleteShift: '0.00',
      completeShiftWithUndertime: false,
      loginTimeConsiderAbsent: '',
      allowFlexibleTimeIn: '',
      brkRoundUpNearest: '',
      hoursForOTCode: '',
      requiredHours: '',
      requiredHoursPayIfPaidLeave: '0.00',
      secondShiftForRawData: false,
      deductBreak1Overbreak: false,
      flexibleBreak1: false,
      deductBreak3Overbreak: false,
      flexibleBreak3: false,
      combineBreak1And3: false,
      computeAsTardinessCombine: false,
      computeAsUndertimeCombine: false,
      tardiness: '',
      undertime: ''
    }
  ]);

  const filteredData = workshiftData.filter(item => 
    item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination for main table
  const itemsPerPage = 25;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleCreateNew = () => {
    setFormData({
      code: '',
      description: '',
      timeIn: '03:00 PM',
      break1Out: '',
      break1In: '',
      break2Out: '',
      break2In: '',
      break3Out: '',
      break3In: '',
      timeOut: '12:00 AM',
      halfOfShift: '',
      midnightShift: false,
      shift12AMOnwards: false,
      flexibleWorkshift: false,
      flexibleBaseOnWorkshift: false,
      flexibleBreak: false,
      maxAllowableBreak2: '',
      inExcessAllowableBreak2ForFlexiBreak: false,
      computeAsTardiness: false,
      computeAsUndertime: false,
      standardHours: '8.00',
      hoursForAbsent: '8.00',
      hoursForNoLogin: '4.00',
      hoursForNoLogout: '4.00',
      hoursForNoBreak2Out: '',
      hoursForNoBreak2In: '',
      paidUnworkedHoliday: '8.00',
      minHoursToCompleteShift: '0.00',
      completeShiftWithUndertime: false,
      loginTimeConsiderAbsent: '',
      allowFlexibleTimeIn: '',
      brkRoundUpNearest: '',
      hoursForOTCode: '',
      requiredHours: '',
      requiredHoursPayIfPaidLeave: '0.00',
      secondShiftForRawData: false,
      deductBreak1Overbreak: false,
      flexibleBreak1: false,
      deductBreak3Overbreak: false,
      flexibleBreak3: false,
      combineBreak1And3: false,
      computeAsTardinessCombine: false,
      computeAsUndertimeCombine: false,
      tardiness: '',
      undertime: ''
    });
    setIsEditMode(false);
    setShowCreateModal(true);
  };

  const handleEdit = (item: Workshift) => {
    setFormData({ ...item });
    setEditingCode(item.code);
    setIsEditMode(true);
    setShowCreateModal(true);
  };

  const handleDetails = (item: Workshift) => {
    setSelectedWorkshift(item);
    setShowDetailsModal(true);
  };

  const handleDelete = (code: string) => {
    if (confirm(`Are you sure you want to delete workshift "${code}"?`)) {
      setWorkshiftData(prevData => prevData.filter(item => item.code !== code));
    }
  };

  const handleSubmit = () => {
    // Validate code
    if (!formData.code.trim()) {
      alert('Please enter a Code.');
      return;
    }

    if (!formData.description.trim()) {
      alert('Please enter a Description.');
      return;
    }

    if (isEditMode) {
      // Update existing record
      setWorkshiftData(prevData => 
        prevData.map(item => 
          item.code === editingCode ? { ...formData } : item
        )
      );
    } else {
      // Check if code already exists
      if (workshiftData.some(item => item.code === formData.code)) {
        alert('A Workshift with this Code already exists.');
        return;
      }

      // Add new record
      setWorkshiftData(prevData => [...prevData, { ...formData }]);
    }

    // Close modal and reset form
    setShowCreateModal(false);
    setIsEditMode(false);
    setEditingCode('');
  };

  const handleOpenTimePicker = (field: string) => {
    // Fields that use hh:mm format (duration) instead of HH:MM AM/PM (time of day)
    const durationFields = ['loginTimeConsiderAbsent', 'allowFlexibleTimeIn'];
    
    // Parse existing time value if available
    const currentValue = formData[field as keyof Workshift] as string;
    if (currentValue) {
      if (durationFields.includes(field)) {
        // Parse 24-hour format (hh:mm)
        const timeParts = currentValue.match(/(\d+):(\d+)/);
        if (timeParts) {
          const hour24 = parseInt(timeParts[1]);
          const minute = parseInt(timeParts[2]);
          
          // Convert to 12-hour format for the picker
          let hour12 = hour24;
          let period: 'AM' | 'PM' = 'AM';
          
          if (hour24 === 0) {
            hour12 = 12;
            period = 'AM';
          } else if (hour24 === 12) {
            hour12 = 12;
            period = 'PM';
          } else if (hour24 > 12) {
            hour12 = hour24 - 12;
            period = 'PM';
          } else {
            hour12 = hour24;
            period = 'AM';
          }
          
          setSelectedHour(hour12);
          setSelectedMinute(minute);
          setSelectedPeriod(period);
        }
      } else {
        // Parse 12-hour format with AM/PM
        const timeParts = currentValue.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeParts) {
          setSelectedHour(parseInt(timeParts[1]));
          setSelectedMinute(parseInt(timeParts[2]));
          setSelectedPeriod(timeParts[3].toUpperCase() as 'AM' | 'PM');
        }
      }
    }
    setTimePickerField(field);
    setShowTimePickerModal(true);
  };

  const handleTimeSelect = () => {
    // Fields that should use hh:mm format (duration) instead of HH:MM AM/PM (time of day)
    const durationFields = ['loginTimeConsiderAbsent', 'allowFlexibleTimeIn'];
    
    let formattedTime: string;
    if (durationFields.includes(timePickerField)) {
      // Convert to 24-hour format for duration fields (hh:mm)
      let hour24 = selectedHour;
      if (selectedPeriod === 'PM' && selectedHour !== 12) {
        hour24 = selectedHour + 12;
      } else if (selectedPeriod === 'AM' && selectedHour === 12) {
        hour24 = 0;
      }
      formattedTime = `${String(hour24).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
    } else {
      // Use 12-hour format with AM/PM for time of day fields
      formattedTime = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')} ${selectedPeriod}`;
    }
    
    setFormData({
      ...formData,
      [timePickerField]: formattedTime
    });
    setShowTimePickerModal(false);
  };

  const incrementHour = () => {
    setSelectedHour(prev => prev === 12 ? 1 : prev + 1);
  };

  const decrementHour = () => {
    setSelectedHour(prev => prev === 1 ? 12 : prev - 1);
  };

  const incrementMinute = () => {
    setSelectedMinute(prev => prev === 59 ? 0 : prev + 1);
  };

  const decrementMinute = () => {
    setSelectedMinute(prev => prev === 0 ? 59 : prev - 1);
  };

  const handleOpenSearch = (type: 'tardiness' | 'undertime') => {
    setSearchType(type);
    setBracketingSearch('');
    setShowSearchModal(true);
  };

  const handleSelectBracketing = (code: string) => {
    if (searchType === 'tardiness') {
      setFormData({ ...formData, tardiness: code });
    } else {
      setFormData({ ...formData, undertime: code });
    }
    setShowSearchModal(false);
  };

  const handleClearBracketing = (type: 'tardiness' | 'undertime') => {
    if (type === 'tardiness') {
      setFormData({ ...formData, tardiness: '' });
    } else {
      setFormData({ ...formData, undertime: '' });
    }
  };

  // Handle ESC key press to close modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showSearchModal) {
          setShowSearchModal(false);
        } else if (showTimePickerModal) {
          setShowTimePickerModal(false);
        } else if (showCreateModal) {
          setShowCreateModal(false);
        } else if (showDetailsModal) {
          setShowDetailsModal(false);
        }
      }
    };

    if (showCreateModal || showDetailsModal || showTimePickerModal || showSearchModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showCreateModal, showDetailsModal, showTimePickerModal, showSearchModal]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Workshift Setup</h1>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
            {/* Information Frame */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    Define workshift patterns including time in/out, break schedules, and calculation rules. Configure parameters for attendance tracking, overtime eligibility, and shift-specific policies.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Flexible shift configurations</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Break time management</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Attendance calculation rules</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Overtime and tardiness policies</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-4 mb-6">
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                onClick={handleCreateNew}
              >
                <Plus className="w-4 h-4" />
                Create New
              </button>
              <div className="ml-auto flex items-center gap-2">
                <label className="text-gray-700">Search:</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-4 py-2 text-left text-gray-700">Code ▲</th>
                    <th className="px-4 py-2 text-left text-gray-700">Description ▲</th>
                    <th className="px-4 py-2 text-center text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-2">{item.code}</td>
                      <td className="px-4 py-2">{item.description}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={() => handleDetails(item)}
                                className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                            >
                                <Info className="w-4 h-4" />
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                                onClick={() => handleEdit(item)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                                onClick={() => handleDelete(item.code)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
              </div>
              <div className="flex gap-2">
                <button 
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded">
                  {currentPage}
                </button>
                <button 
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
              <>
                {/* Modal Backdrop */}
                <div 
                  className="fixed inset-0 bg-black/30 z-10"
                  onClick={() => setShowCreateModal(false)}
                ></div>

                {/* Modal Dialog - Scrollable */}
                <div className="fixed inset-0 z-20 overflow-y-auto">
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center pt-4 px-4 pb-20">
                    <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-4xl my-4">
                      {/* Modal Header */}
                      <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between sticky top-0 z-10">
                        <h2 className="text-gray-800">{isEditMode ? 'Edit' : 'Create New'}</h2>
                        <button 
                          onClick={() => setShowCreateModal(false)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Modal Content */}
                      <div className="p-6">
                        <h3 className="text-blue-600 mb-4">Workshift Setup</h3>

                        {/* Two Column Layout */}
                        <div className="grid grid-cols-2 gap-6">
                          {/* Left Column */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <label className="w-32 text-gray-700 text-sm">Code :</label>
                              <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                disabled={isEditMode}
                              />
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-32 text-gray-700 text-sm">Description :</label>
                              <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-32 text-gray-700 text-sm">Time In :</label>
                              <input
                                type="text"
                                value={formData.timeIn}
                                onChange={(e) => setFormData({ ...formData, timeIn: formatTimeWithPeriod(e.target.value) })}
                                className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="HH:mm TT"
                              />
                              <button
                                type="button"
                                onClick={() => handleOpenTimePicker('timeIn')}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                              >
                                <Clock className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-32 text-gray-700 text-sm">Break1 Out :</label>
                              <input
                                type="text"
                                value={formData.break1Out}
                                onChange={(e) => setFormData({ ...formData, break1Out: formatTimeWithPeriod(e.target.value) })}
                                className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="HH:mm TT"
                              />
                              <button
                                type="button"
                                onClick={() => handleOpenTimePicker('break1Out')}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                              >
                                <Clock className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-32 text-gray-700 text-sm">Break1 In :</label>
                              <input
                                type="text"
                                value={formData.break1In}
                                onChange={(e) => setFormData({ ...formData, break1In: formatTimeWithPeriod(e.target.value) })}
                                className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="HH:mm TT"
                              />
                              <button
                                type="button"
                                onClick={() => handleOpenTimePicker('break1In')}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                              >
                                <Clock className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-32 text-gray-700 text-sm">Break2 Out :</label>
                              <input
                                type="text"
                                value={formData.break2Out}
                                onChange={(e) => setFormData({ ...formData, break2Out: formatTimeWithPeriod(e.target.value) })}
                                className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="HH:mm TT"
                              />
                              <button
                                type="button"
                                onClick={() => handleOpenTimePicker('break2Out')}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                              >
                                <Clock className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-32 text-gray-700 text-sm">Break2 In :</label>
                              <input
                                type="text"
                                value={formData.break2In}
                                onChange={(e) => setFormData({ ...formData, break2In: formatTimeWithPeriod(e.target.value) })}
                                className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="HH:mm TT"
                              />
                              <button
                                type="button"
                                onClick={() => handleOpenTimePicker('break2In')}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                              >
                                <Clock className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-32 text-gray-700 text-sm">Break3 Out :</label>
                              <input
                                type="text"
                                value={formData.break3Out}
                                onChange={(e) => setFormData({ ...formData, break3Out: formatTimeWithPeriod(e.target.value) })}
                                className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="HH:mm TT"
                              />
                              <button
                                type="button"
                                onClick={() => handleOpenTimePicker('break3Out')}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                              >
                                <Clock className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-32 text-gray-700 text-sm">Break3 In :</label>
                              <input
                                type="text"
                                value={formData.break3In}
                                onChange={(e) => setFormData({ ...formData, break3In: formatTimeWithPeriod(e.target.value) })}
                                className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="HH:mm TT"
                              />
                              <button
                                type="button"
                                onClick={() => handleOpenTimePicker('break3In')}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                              >
                                <Clock className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-32 text-gray-700 text-sm">Time Out :</label>
                              <input
                                type="text"
                                value={formData.timeOut}
                                onChange={(e) => setFormData({ ...formData, timeOut: formatTimeWithPeriod(e.target.value) })}
                                className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="HH:mm TT"
                              />
                              <button
                                type="button"
                                onClick={() => handleOpenTimePicker('timeOut')}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                              >
                                <Clock className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-32 text-gray-700 text-sm">Half of Shift :</label>
                              <input
                                type="text"
                                value={formData.halfOfShift}
                                onChange={(e) => setFormData({ ...formData, halfOfShift: formatTimeWithPeriod(e.target.value) })}
                                className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="HH:mm TT"
                              />
                              <button
                                type="button"
                                onClick={() => handleOpenTimePicker('halfOfShift')}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                              >
                                <Clock className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>

                            {/* Checkboxes Section */}
                            <div className="border border-gray-300 rounded p-3 space-y-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="midnightShift"
                                  checked={formData.midnightShift}
                                  onChange={(e) => setFormData({ ...formData, midnightShift: e.target.checked })}
                                  className="w-4 h-4"
                                />
                                <label htmlFor="midnightShift" className="text-sm text-gray-700">Midnight Shift</label>
                              </div>

                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="shift12AMOnwards"
                                  checked={formData.shift12AMOnwards}
                                  onChange={(e) => setFormData({ ...formData, shift12AMOnwards: e.target.checked })}
                                  className="w-4 h-4"
                                />
                                <label htmlFor="shift12AMOnwards" className="text-sm text-gray-700">Shift that fall on 12:00AM onwards</label>
                              </div>

                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="flexibleWorkshift"
                                  checked={formData.flexibleWorkshift}
                                  onChange={(e) => setFormData({ ...formData, flexibleWorkshift: e.target.checked })}
                                  className="w-4 h-4"
                                />
                                <label htmlFor="flexibleWorkshift" className="text-sm text-gray-700">Flexible Workshift</label>
                              </div>

                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="flexibleBaseOnWorkshift"
                                  checked={formData.flexibleBaseOnWorkshift}
                                  onChange={(e) => setFormData({ ...formData, flexibleBaseOnWorkshift: e.target.checked })}
                                  className="w-4 h-4"
                                />
                                <label htmlFor="flexibleBaseOnWorkshift" className="text-sm text-gray-700">Flexible Base on Workshift</label>
                              </div>

                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="flexibleBreak"
                                  checked={formData.flexibleBreak}
                                  onChange={(e) => setFormData({ ...formData, flexibleBreak: e.target.checked })}
                                  className="w-4 h-4"
                                />
                                <label htmlFor="flexibleBreak" className="text-sm text-gray-700">Flexible Break</label>
                              </div>

                              <div className="flex items-center gap-3 ml-4">
                                <label className="text-sm text-gray-700 whitespace-nowrap">Maximum Allowable Break2</label>
                                <input
                                  type="text"
                                  value={formData.maxAllowableBreak2}
                                  onChange={(e) => setFormData({ ...formData, maxAllowableBreak2: formatTimeInput(e.target.value) })}
                                  className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  placeholder="[hh:mm]"
                                />
                              </div>

                              <div className="flex items-center gap-2 ml-4">
                                <input
                                  type="checkbox"
                                  id="inExcessAllowableBreak2ForFlexiBreak"
                                  checked={formData.inExcessAllowableBreak2ForFlexiBreak}
                                  onChange={(e) => setFormData({ ...formData, inExcessAllowableBreak2ForFlexiBreak: e.target.checked })}
                                  className="w-4 h-4"
                                />
                                <label htmlFor="inExcessAllowableBreak2ForFlexiBreak" className="text-sm text-gray-700">In Excess of Allowable Break2 for Flexi Break</label>
                              </div>

                              <div className="ml-8 space-y-1">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    id="computeAsTardiness"
                                    name="excessCompute"
                                    checked={formData.computeAsTardiness}
                                    onChange={(e) => setFormData({ ...formData, computeAsTardiness: e.target.checked, computeAsUndertime: false })}
                                    className="w-4 h-4"
                                  />
                                  <label htmlFor="computeAsTardiness" className="text-sm text-gray-700">Compute as Tardiness</label>
                                </div>

                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    id="computeAsUndertime"
                                    name="excessCompute"
                                    checked={formData.computeAsUndertime}
                                    onChange={(e) => setFormData({ ...formData, computeAsUndertime: e.target.checked, computeAsTardiness: false })}
                                    className="w-4 h-4"
                                  />
                                  <label htmlFor="computeAsUndertime" className="text-sm text-gray-700">Compute as Undertime</label>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right Column */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <label className="w-56 text-gray-700 text-sm">No. of Hrs. Standard Time :</label>
                              <input
                                type="text"
                                value={formData.standardHours}
                                onChange={(e) => setFormData({ ...formData, standardHours: formatTimeInput(e.target.value) })}
                                className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                              <span className="text-xs text-gray-500">[hh:mm]</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-56 text-gray-700 text-sm">No. of Hrs. For Absent :</label>
                              <input
                                type="text"
                                value={formData.hoursForAbsent}
                                onChange={(e) => setFormData({ ...formData, hoursForAbsent: formatTimeInput(e.target.value) })}
                                className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                              <span className="text-xs text-gray-500">[hh:mm]</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-56 text-gray-700 text-sm">No. of Hrs. For No Login :</label>
                              <input
                                type="text"
                                value={formData.hoursForNoLogin}
                                onChange={(e) => setFormData({ ...formData, hoursForNoLogin: formatTimeInput(e.target.value) })}
                                className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                              <span className="text-xs text-gray-500">[hh:mm]</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-56 text-gray-700 text-sm">No. of Hrs. For No Logout :</label>
                              <input
                                type="text"
                                value={formData.hoursForNoLogout}
                                onChange={(e) => setFormData({ ...formData, hoursForNoLogout: formatTimeInput(e.target.value) })}
                                className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                              <span className="text-xs text-gray-500">[hh:mm]</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-56 text-gray-700 text-sm">No. of Hrs. For No Break 2 Out :</label>
                              <input
                                type="text"
                                value={formData.hoursForNoBreak2Out}
                                onChange={(e) => setFormData({ ...formData, hoursForNoBreak2Out: formatTimeInput(e.target.value) })}
                                className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                              <span className="text-xs text-gray-500">[hh:mm]</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-56 text-gray-700 text-sm">No. of Hrs. For No Break2 In :</label>
                              <input
                                type="text"
                                value={formData.hoursForNoBreak2In}
                                onChange={(e) => setFormData({ ...formData, hoursForNoBreak2In: formatTimeInput(e.target.value) })}
                                className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                              <span className="text-xs text-gray-500">[hh:mm]</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-56 text-gray-700 text-sm">For Paid Unworked Holiday :</label>
                              <input
                                type="text"
                                value={formData.paidUnworkedHoliday}
                                onChange={(e) => setFormData({ ...formData, paidUnworkedHoliday: formatTimeInput(e.target.value) })}
                                className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                              <span className="text-xs text-gray-500">[hh:mm]</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-56 text-gray-700 text-sm">Min. Hours To Complete a Shift :</label>
                              <input
                                type="text"
                                value={formData.minHoursToCompleteShift}
                                onChange={(e) => setFormData({ ...formData, minHoursToCompleteShift: formatTimeInput(e.target.value) })}
                                className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                              <span className="text-xs text-gray-500">[hh:mm]</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="completeShiftWithUndertime"
                                checked={formData.completeShiftWithUndertime}
                                onChange={(e) => setFormData({ ...formData, completeShiftWithUndertime: e.target.checked })}
                                className="w-4 h-4"
                              />
                              <label htmlFor="completeShiftWithUndertime" className="text-sm text-gray-700">Complete a Shift with Undertime</label>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-56 text-gray-700 text-sm">Login Time To Consider as Absent :</label>
                              <input
                                type="text"
                                value={formData.loginTimeConsiderAbsent}
                                onChange={(e) => setFormData({ ...formData, loginTimeConsiderAbsent: formatTimeWithPeriod(e.target.value) })}
                                className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="HH:mm TT"
                              />
                              <button
                                type="button"
                                onClick={() => handleOpenTimePicker('loginTimeConsiderAbsent')}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors flex-shrink-0"
                              >
                                <Clock className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-56 text-gray-700 text-sm">Allow. Flexible Time In :</label>
                              <input
                                type="text"
                                value={formData.allowFlexibleTimeIn}
                                onChange={(e) => setFormData({ ...formData, allowFlexibleTimeIn: formatTimeWithPeriod(e.target.value) })}
                                className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="HH:mm TT"
                              />
                              <button
                                type="button"
                                onClick={() => handleOpenTimePicker('allowFlexibleTimeIn')}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors flex-shrink-0"
                              >
                                <Clock className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-56 text-gray-700 text-sm">Brk Round Up to the Nearest Hr/Min :</label>
                              <input
                                type="text"
                                value={formData.brkRoundUpNearest}
                                onChange={(e) => setFormData({ ...formData, brkRoundUpNearest: formatTimeInput(e.target.value) })}
                                className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="[hh:mm]"
                              />
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-56 text-gray-700 text-sm">No of Hrs for OT Code :</label>
                              <input
                                type="text"
                                value={formData.hoursForOTCode}
                                onChange={(e) => setFormData({ ...formData, hoursForOTCode: formatTimeInput(e.target.value) })}
                                className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                              <span className="text-xs text-gray-500">[hh:mm]</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-56 text-gray-700 text-sm">Required No of Hrs. :</label>
                              <input
                                type="text"
                                value={formData.requiredHours}
                                onChange={(e) => setFormData({ ...formData, requiredHours: formatTimeInput(e.target.value) })}
                                className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                              <span className="text-xs text-gray-500">[hh:mm]</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-56 text-gray-700 text-sm">Required Hours w/ Pay if w/ Paid Leave :</label>
                              <input
                                type="text"
                                value={formData.requiredHoursPayIfPaidLeave}
                                onChange={(e) => setFormData({ ...formData, requiredHoursPayIfPaidLeave: formatTimeInput(e.target.value) })}
                                className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                              <span className="text-xs text-gray-500">[hh:mm]</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="secondShiftForRawData"
                                checked={formData.secondShiftForRawData}
                                onChange={(e) => setFormData({ ...formData, secondShiftForRawData: e.target.checked })}
                                className="w-4 h-4"
                              />
                              <label htmlFor="secondShiftForRawData" className="text-sm text-gray-700">2nd Shift For RawData</label>
                            </div>

                            {/* Break 1 and Break 3 Sections */}
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div className="border border-gray-300 rounded p-3">
                                <h4 className="text-sm text-gray-700 mb-2">Break 1</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      id="deductBreak1Overbreak"
                                      checked={formData.deductBreak1Overbreak}
                                      onChange={(e) => setFormData({ ...formData, deductBreak1Overbreak: e.target.checked })}
                                      className="w-4 h-4"
                                    />
                                    <label htmlFor="deductBreak1Overbreak" className="text-xs text-gray-700">Deduct Break1 Overbreak</label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      id="flexibleBreak1"
                                      checked={formData.flexibleBreak1}
                                      onChange={(e) => setFormData({ ...formData, flexibleBreak1: e.target.checked })}
                                      className="w-4 h-4"
                                    />
                                    <label htmlFor="flexibleBreak1" className="text-xs text-gray-700">Flexible Break1</label>
                                  </div>
                                </div>
                              </div>

                              <div className="border border-gray-300 rounded p-3">
                                <h4 className="text-sm text-gray-700 mb-2">Break 3</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      id="deductBreak3Overbreak"
                                      checked={formData.deductBreak3Overbreak}
                                      onChange={(e) => setFormData({ ...formData, deductBreak3Overbreak: e.target.checked })}
                                      className="w-4 h-4"
                                    />
                                    <label htmlFor="deductBreak3Overbreak" className="text-xs text-gray-700">Deduct Break3 Overbreak</label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      id="flexibleBreak3"
                                      checked={formData.flexibleBreak3}
                                      onChange={(e) => setFormData({ ...formData, flexibleBreak3: e.target.checked })}
                                      className="w-4 h-4"
                                    />
                                    <label htmlFor="flexibleBreak3" className="text-xs text-gray-700">Flexible Break3</label>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Combine Break1 and Break3 Section */}
                            <div className="border border-gray-300 rounded p-3 mt-4">
                              <div className="flex items-center gap-2 mb-2">
                                <input
                                  type="checkbox"
                                  id="combineBreak1And3"
                                  checked={formData.combineBreak1And3}
                                  onChange={(e) => setFormData({ ...formData, combineBreak1And3: e.target.checked })}
                                  className="w-4 h-4"
                                />
                                <label htmlFor="combineBreak1And3" className="text-sm text-gray-700">Combine Break1 and Break3</label>
                              </div>
                              <div className="ml-6 space-y-1">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    id="computeAsTardinessCombine"
                                    name="combineCompute"
                                    checked={formData.computeAsTardinessCombine}
                                    onChange={(e) => setFormData({ ...formData, computeAsTardinessCombine: e.target.checked, computeAsUndertimeCombine: false })}
                                    className="w-4 h-4"
                                  />
                                  <label htmlFor="computeAsTardinessCombine" className="text-xs text-gray-700">Compute as Tardiness Combine</label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    id="computeAsUndertimeCombine"
                                    name="combineCompute"
                                    checked={formData.computeAsUndertimeCombine}
                                    onChange={(e) => setFormData({ ...formData, computeAsUndertimeCombine: e.target.checked, computeAsTardinessCombine: false })}
                                    className="w-4 h-4"
                                  />
                                  <label htmlFor="computeAsUndertimeCombine" className="text-xs text-gray-700">Compute as Undertime Combine</label>
                                </div>
                              </div>
                            </div>

                            {/* Bracketing Section */}
                            <div className="border border-gray-300 rounded p-3 mt-4">
                              <h4 className="text-sm text-gray-700 mb-3">Bracketing</h4>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <label className="w-24 text-xs text-gray-700">Tardiness :</label>
                                  <input
                                    type="text"
                                    value={formData.tardiness}
                                    onChange={(e) => setFormData({ ...formData, tardiness: e.target.value })}
                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSearch('tardiness')}
                                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                  >
                                    <Search className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleClearBracketing('tardiness')}
                                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="w-24 text-xs text-gray-700">Undertime :</label>
                                  <input
                                    type="text"
                                    value={formData.undertime}
                                    onChange={(e) => setFormData({ ...formData, undertime: e.target.value })}
                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSearch('undertime')}
                                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                  >
                                    <Search className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleClearBracketing('undertime')}
                                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                          <button
                            onClick={handleSubmit}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
                          >
                            {isEditMode ? 'Update' : 'Submit'}
                          </button>
                          <button
                            onClick={() => setShowCreateModal(false)}
                            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
                          >
                            Back to List
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedWorkshift && (
              <>
                {/* Modal Backdrop */}
                <div 
                  className="fixed inset-0 bg-black/30 z-10"
                  onClick={() => setShowDetailsModal(false)}
                ></div>
                  {/* Modal Dialog */}
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center pt-4 px-4 pb-20">
                    <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-4xl my-4">
                      {/* Modal Header */}
                      <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between sticky top-0 z-10">
                        <h2 className="text-gray-800">Details</h2>
                        <button 
                          onClick={() => setShowDetailsModal(false)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Modal Content - Read Only */}
                      <div className="p-6">
                        <h3 className="text-blue-600 mb-4">Workshift Setup</h3>

                        {/* Two Column Layout */}
                        <div className="grid grid-cols-2 gap-6">
                          {/* Left Column */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <label className="w-32 text-gray-700 text-sm">Code :</label>
                              <div className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-sm">{selectedWorkshift.code}</div>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-32 text-gray-700 text-sm">Description :</label>
                              <div className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-sm">{selectedWorkshift.description}</div>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-32 text-gray-700 text-sm">Time In :</label>
                              <div className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-sm">{selectedWorkshift.timeIn}</div>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-32 text-gray-700 text-sm">Break1 Out :</label>
                              <div className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-sm">{selectedWorkshift.break1Out}</div>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-32 text-gray-700 text-sm">Break1 In :</label>
                              <div className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-sm">{selectedWorkshift.break1In}</div>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-32 text-gray-700 text-sm">Break2 Out :</label>
                              <div className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-sm">{selectedWorkshift.break2Out}</div>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-32 text-gray-700 text-sm">Break2 In :</label>
                              <div className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-sm">{selectedWorkshift.break2In}</div>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-32 text-gray-700 text-sm">Break3 Out :</label>
                              <div className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-sm">{selectedWorkshift.break3Out}</div>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-32 text-gray-700 text-sm">Break3 In :</label>
                              <div className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-sm">{selectedWorkshift.break3In}</div>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-32 text-gray-700 text-sm">Time Out :</label>
                              <div className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-sm">{selectedWorkshift.timeOut}</div>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-32 text-gray-700 text-sm">Half of Shift :</label>
                              <div className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-sm">{selectedWorkshift.halfOfShift}</div>
                            </div>

                            {/* Checkboxes Display */}
                            <div className="border border-gray-300 rounded p-3 space-y-2 bg-gray-50">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked={selectedWorkshift.midnightShift} disabled className="w-4 h-4" />
                                <label className="text-sm text-gray-700">Midnight Shift</label>
                              </div>
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked={selectedWorkshift.shift12AMOnwards} disabled className="w-4 h-4" />
                                <label className="text-sm text-gray-700">Shift that fall on 12:00AM onwards</label>
                              </div>
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked={selectedWorkshift.flexibleWorkshift} disabled className="w-4 h-4" />
                                <label className="text-sm text-gray-700">Flexible Workshift</label>
                              </div>
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked={selectedWorkshift.flexibleBaseOnWorkshift} disabled className="w-4 h-4" />
                                <label className="text-sm text-gray-700">Flexible Base on Workshift</label>
                              </div>
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked={selectedWorkshift.flexibleBreak} disabled className="w-4 h-4" />
                                <label className="text-sm text-gray-700">Flexible Break</label>
                              </div>
                            </div>
                          </div>

                          {/* Right Column */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <label className="w-56 text-gray-700 text-sm">No. of Hrs. Standard Time :</label>
                              <div className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-sm">{selectedWorkshift.standardHours}</div>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-56 text-gray-700 text-sm">No. of Hrs. For Absent :</label>
                              <div className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-sm">{selectedWorkshift.hoursForAbsent}</div>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-56 text-gray-700 text-sm">No. of Hrs. For No Login :</label>
                              <div className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-sm">{selectedWorkshift.hoursForNoLogin}</div>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-56 text-gray-700 text-sm">No. of Hrs. For No Logout :</label>
                              <div className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-sm">{selectedWorkshift.hoursForNoLogout}</div>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-56 text-gray-700 text-sm">For Paid Unworked Holiday :</label>
                              <div className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-sm">{selectedWorkshift.paidUnworkedHoliday}</div>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-56 text-gray-700 text-sm">Min. Hours To Complete a Shift :</label>
                              <div className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-sm">{selectedWorkshift.minHoursToCompleteShift}</div>
                            </div>

                            <div className="flex items-center gap-2">
                              <input type="checkbox" checked={selectedWorkshift.completeShiftWithUndertime} disabled className="w-4 h-4" />
                              <label className="text-sm text-gray-700">Complete a Shift with Undertime</label>
                            </div>
                          </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => setShowDetailsModal(false)}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
              </>
            )}

            {/* Time Picker Modal */}
            {showTimePickerModal && (
              <>
                {/* Modal Backdrop */}
                <div 
                  className="fixed inset-0 bg-black/30 z-30"
                  onClick={() => setShowTimePickerModal(false)}
                ></div>

                {/* Modal Dialog */}
                <div className="fixed inset-0 z-40 flex items-center justify-center w-full max-w-lg px-4">
                  <div className="relative bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-xs">
                    {/* Modal Header */}
                    <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                      <h2 className="text-gray-800 text-sm">Select Time</h2>
                      <button 
                        onClick={() => setShowTimePickerModal(false)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Time Picker Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-center gap-4">
                        {/* Hour Section */}
                        <div className="flex flex-col items-center">
                          <button
                            onClick={incrementHour}
                            className="w-12 h-10 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                          >
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          </button>
                          <div className="w-16 h-16 flex items-center justify-center my-2 text-2xl font-mono">
                            {String(selectedHour).padStart(2, '0')}
                          </div>
                          <button
                            onClick={decrementHour}
                            className="w-12 h-10 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                          >
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>

                        {/* Colon */}
                        <div className="text-2xl font-mono mb-2">:</div>

                        {/* Minute Section */}
                        <div className="flex flex-col items-center">
                          <button
                            onClick={incrementMinute}
                            className="w-12 h-10 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                          >
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          </button>
                          <div className="w-16 h-16 flex items-center justify-center my-2 text-2xl font-mono">
                            {String(selectedMinute).padStart(2, '0')}
                          </div>
                          <button
                            onClick={decrementMinute}
                            className="w-12 h-10 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                          >
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>

                        {/* AM/PM Section */}
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setSelectedPeriod('AM')}
                            className={`px-6 py-3 rounded transition-colors ${
                              selectedPeriod === 'AM' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            AM
                          </button>
                          <button
                            onClick={() => setSelectedPeriod('PM')}
                            className={`px-6 py-3 rounded transition-colors ${
                              selectedPeriod === 'PM' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            PM
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={handleTimeSelect}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                        >
                          OK
                        </button>
                        <button
                          onClick={() => setShowTimePickerModal(false)}
                          className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Search Modal for Bracketing */}
            {showSearchModal && (
              <>
                {/* Modal Backdrop */}
                <div 
                  className="fixed inset-0 bg-black/30 z-30"
                  onClick={() => setShowSearchModal(false)}
                ></div>

                {/* Modal Dialog */}
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                  <div className="relative bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-2xl">
                    {/* Modal Header */}
                    <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                      <h2 className="text-gray-800">Search</h2>
                      <button 
                        onClick={() => setShowSearchModal(false)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6">
                      <h3 className="text-blue-600 mb-4">
                        {searchType === 'tardiness' ? 'Tardiness Bracketing' : 'Undertime Bracketing'}
                      </h3>

                      {/* Search Input */}
                      <div className="flex items-center gap-3 mb-4">
                        <label className="text-gray-700">Search:</label>
                        <input
                          type="text"
                          value={bracketingSearch}
                          onChange={(e) => setBracketingSearch(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Search by code, description, or flag..."
                        />
                      </div>

                      {/* Table */}
                      <div className="border border-gray-300 rounded overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left border-b border-gray-300">Code</th>
                              <th className="px-4 py-2 text-left border-b border-gray-300">Description</th>
                              <th className="px-4 py-2 text-left border-b border-gray-300">Flag</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bracketingData
                              .filter(item => 
                                bracketingSearch === '' || 
                                item.code.toLowerCase().includes(bracketingSearch.toLowerCase()) ||
                                item.description.toLowerCase().includes(bracketingSearch.toLowerCase()) ||
                                item.flag.toLowerCase().includes(bracketingSearch.toLowerCase())
                              )
                              .map((item, index) => (
                                <tr 
                                  key={item.code}
                                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 cursor-pointer`}
                                  onClick={() => handleSelectBracketing(item.code)}
                                >
                                  <td className="px-4 py-2 border-b border-gray-200">{item.code}</td>
                                  <td className="px-4 py-2 border-b border-gray-200">{item.description}</td>
                                  <td className="px-4 py-2 border-b border-gray-200">{item.flag}</td>
                                </tr>
                              ))
                            }
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Info */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                        <div className="text-gray-600 text-sm">
                          Showing 1 to {bracketingData.filter(item => 
                            bracketingSearch === '' || 
                            item.code.toLowerCase().includes(bracketingSearch.toLowerCase()) ||
                            item.description.toLowerCase().includes(bracketingSearch.toLowerCase()) ||
                            item.flag.toLowerCase().includes(bracketingSearch.toLowerCase())
                          ).length} of {bracketingData.length} entries
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
                            Previous
                          </button>
                          <button className="px-3 py-1 bg-blue-600 text-white rounded">
                            1
                          </button>
                          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* CSS Animations */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
