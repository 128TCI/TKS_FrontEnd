import { useState, useEffect } from 'react';
import { 
  Search,
  Clock,
  ClipboardList,
  Plus,
  X,
  Check,
  Pencil,
  Save,
  ArrowLeft,
  Building2,
  Calendar,
  Edit,
  Trash2
} from 'lucide-react';
import { OvertimeApplicationModal } from './Modals/OvertimeApplicationModal';
import { DatePicker } from './DateSetup/DatePicker';
import { Footer } from './Footer/Footer';

type TabType = 'overtime-applications' | 'workshift';

export function TwoShiftsEmployeeTimekeepConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('workshift');
  const [empCode, setEmpCode] = useState('000877');
  const [tksGroup, setTksGroup] = useState('45');

  // Employee data
  const employeeName = 'Last122, First A';
  const payPeriod = 'Main Monthly';

  // Search modal state
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchModalTerm, setSearchModalTerm] = useState('');

  // Workshift Code Search Modal
  const [showWorkshiftCodeModal, setShowWorkshiftCodeModal] = useState(false);
  const [workshiftCodeSearchTerm, setWorkshiftCodeSearchTerm] = useState('');

  // Mock employee data
  const employeeData = [
    { empCode: '000877', name: 'Last122, First A', groupCode: '45' },
    { empCode: '000878', name: 'Last, First A', groupCode: '45' },
    { empCode: '000900', name: 'Last, First A', groupCode: '109' },
    { empCode: '000901', name: 'Last, First A', groupCode: '109' },
    { empCode: '000902', name: 'Last, First III A', groupCode: '45' },
    { empCode: '000903', name: 'Last, First A', groupCode: '45' },
    { empCode: '000904', name: 'Last, First A', groupCode: '45' },
    { empCode: '000905', name: 'Last, First A', groupCode: '45' },
    { empCode: '000906', name: 'Last, First A', groupCode: '45' },
    { empCode: '000907', name: 'Last, First A', groupCode: '45' },
  ];

  // Mock workshift code data
  const workshiftCodeData = [
    { code: '7AM4PM', description: '7:00 AM - 4:00 PM' },
    { code: '3PM12AM', description: '3:00 PM - 12:00 AM' },
    { code: '8AM5PM', description: '8:00 AM - 5:00 PM' },
    { code: '11PM8AM', description: '11:00 PM - 8:00 AM' },
    { code: 'FLEX', description: 'Flexible Schedule' }
  ];

  const filteredEmployees = employeeData.filter(emp => 
    emp.empCode.includes(searchModalTerm) || 
    emp.name.toLowerCase().includes(searchModalTerm.toLowerCase())
  );

  const filteredWorkshiftCodes = workshiftCodeData.filter(ws =>
    ws.code.toLowerCase().includes(workshiftCodeSearchTerm.toLowerCase()) ||
    ws.description.toLowerCase().includes(workshiftCodeSearchTerm.toLowerCase())
  );

  const handleEmployeeSelect = (selectedEmpCode: string, selectedGroupCode: string) => {
    setEmpCode(selectedEmpCode);
    setTksGroup(selectedGroupCode);
    setShowSearchModal(false);
  };

  const handleWorkshiftCodeSelect = (selectedCode: string) => {
    setWorkshiftShiftCode(selectedCode);
    setShowWorkshiftCodeModal(false);
  };

  // Global Edit Mode
  const [isEditMode, setIsEditMode] = useState(false);

  // Overtime Applications Modal States
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [isOvertimeEditMode, setIsOvertimeEditMode] = useState(false);
  const [currentOvertimeId, setCurrentOvertimeId] = useState<number | null>(null);
  const [overtimeDate, setOvertimeDate] = useState('');
  const [overtimeHoursApproved, setOvertimeHoursApproved] = useState('');
  const [overtimeActualDateInOTBefore, setOvertimeActualDateInOTBefore] = useState('');
  const [overtimeStartTimeBefore, setOvertimeStartTimeBefore] = useState('');
  const [overtimeStartOvertimeDate, setOvertimeStartOvertimeDate] = useState('');
  const [overtimeStartOvertimeTime, setOvertimeStartOvertimeTime] = useState('');
  const [overtimeApprovedBreak, setOvertimeApprovedBreak] = useState('');
  const [overtimeReason, setOvertimeReason] = useState('');
  const [overtimeRemarks, setOvertimeRemarks] = useState('');
  const [overtimeIsLateFiling, setOvertimeIsLateFiling] = useState(false);

  // Workshift State
  const [workshiftMode, setWorkshiftMode] = useState<'fixed' | 'variable'>('variable');
  const [fixedDailySched, setFixedDailySched] = useState('');

  // Workshift Variable Modal States
  const [showWorkshiftModal, setShowWorkshiftModal] = useState(false);
  const [isWorkshiftEditMode, setIsWorkshiftEditMode] = useState(false);
  const [currentWorkshiftId, setCurrentWorkshiftId] = useState<number | null>(null);
  const [workshiftFrom, setWorkshiftFrom] = useState('');
  const [workshiftFromTime, setWorkshiftFromTime] = useState('');
  const [workshiftTo, setWorkshiftTo] = useState('');
  const [workshiftToTime, setWorkshiftToTime] = useState('');
  const [workshiftShiftCode, setWorkshiftShiftCode] = useState('');
  const [workshiftGLCode, setWorkshiftGLCode] = useState('');

  const [workshiftVariableData, setWorkshiftVariableData] = useState([
    { id: 1, from: '11/2/2025', to: '11/29/2028', shiftCode: '7AM4PM', glCode: 'GLCODE1' },
    { id: 2, from: '11/1/2025', to: '11/1/2025', shiftCode: '3PM12AM', glCode: 'GL1' },
    { id: 3, from: '10/1/2025', to: '10/2/2025', shiftCode: '8AM5PM', glCode: '' }
  ]);

  const [overtimeApplicationsData, setOvertimeApplicationsData] = useState([
    { id: 1, date: '11/14/2025', hoursApproved: '1.00', actualDateInOTBefore: '11/14/2025', startTimeOTBefore: '9:00 PM', startOvertimeDate: '11/14/2025', startOvertimeTime: '10:00 PM', approvedOTBreak: '', reason: 'a', remarks: '', isLateFiling: false },
    { id: 2, date: '11/14/2025', hoursApproved: '1.00', actualDateInOTBefore: '11/14/2025', startTimeOTBefore: '9:00 PM', startOvertimeDate: '11/14/2025', startOvertimeTime: '10:00 PM', approvedOTBreak: '', reason: 'a', remarks: '', isLateFiling: false },
    { id: 3, date: '11/14/2025', hoursApproved: '1.00', actualDateInOTBefore: '11/14/2025', startTimeOTBefore: '9:00 PM', startOvertimeDate: '11/14/2025', startOvertimeTime: '10:00 PM', approvedOTBreak: '', reason: 'a', remarks: '', isLateFiling: false }
  ]);

  // Branch data
  const [branchData] = useState([
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
  ]);

  // Group Schedule data  
  const [groupScheduleData] = useState([
    { id: 1, code: 'a', description: 'a' },
    { id: 2, code: 'ab', description: 'ab' }
  ]);
  const [groupScheduleSearchTerm, setGroupScheduleSearchTerm] = useState('');

  const filteredGroupSchedule = groupScheduleData.filter(item =>
    item.code.toLowerCase().includes(groupScheduleSearchTerm.toLowerCase()) || 
    item.description.toLowerCase().includes(groupScheduleSearchTerm.toLowerCase())
  );


  // Overtime Submit Handler
  const handleOvertimeSubmit = () => {
    if (isOvertimeEditMode && currentOvertimeId !== null) {
      // Edit existing entry
      setOvertimeApplicationsData(prev => prev.map(item => 
        item.id === currentOvertimeId ? {
          id: currentOvertimeId,
          date: overtimeDate,
          hoursApproved: overtimeHoursApproved,
          actualDateInOTBefore: overtimeActualDateInOTBefore,
          startTimeOTBefore: overtimeStartTimeBefore,
          startOvertimeDate: overtimeStartOvertimeDate,
          startOvertimeTime: overtimeStartOvertimeTime,
          approvedOTBreak: overtimeApprovedBreak,
          reason: overtimeReason,
          remarks: overtimeRemarks,
          isLateFiling: overtimeIsLateFiling
        } : item
      ));
    } else {
      // Add new entry
      const newId = overtimeApplicationsData.length > 0 
        ? Math.max(...overtimeApplicationsData.map(item => item.id)) + 1 
        : 1;
      setOvertimeApplicationsData(prev => [...prev, {
        id: newId,
        date: overtimeDate,
        hoursApproved: overtimeHoursApproved,
        actualDateInOTBefore: overtimeActualDateInOTBefore,
        startTimeOTBefore: overtimeStartTimeBefore,
        startOvertimeDate: overtimeStartOvertimeDate,
        startOvertimeTime: overtimeStartOvertimeTime,
        approvedOTBreak: overtimeApprovedBreak,
        reason: overtimeReason,
        remarks: overtimeRemarks,
        isLateFiling: overtimeIsLateFiling
      }]);
    }
    setShowOvertimeModal(false);
  };

  const handleOvertimeDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this overtime record?')) {
      setOvertimeApplicationsData(prev => prev.filter(item => item.id !== id));
    }
  };

  // Workshift Submit Handler
  const handleWorkshiftSubmit = () => {
    if (isWorkshiftEditMode && currentWorkshiftId !== null) {
      // Edit existing entry
      setWorkshiftVariableData(prev => prev.map(item => 
        item.id === currentWorkshiftId ? {
          id: currentWorkshiftId,
          from: workshiftFrom,
          to: workshiftTo,
          shiftCode: workshiftShiftCode,
          glCode: workshiftGLCode
        } : item
      ));
    } else {
      // Add new entry
      const newId = workshiftVariableData.length > 0 
        ? Math.max(...workshiftVariableData.map(item => item.id)) + 1 
        : 1;
      setWorkshiftVariableData(prev => [...prev, {
        id: newId,
        from: workshiftFrom,
        to: workshiftTo,
        shiftCode: workshiftShiftCode,
        glCode: workshiftGLCode
      }]);
    }
    setShowWorkshiftModal(false);
  };

  const handleWorkshiftDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this workshift record?')) {
      setWorkshiftVariableData(prev => prev.filter(item => item.id !== id));
    }
  };

  // ESC key handler for modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showSearchModal) {
          setShowSearchModal(false);
        } else if (showWorkshiftCodeModal) {
          setShowWorkshiftCodeModal(false);
        } else if (showWorkshiftModal) {
          setShowWorkshiftModal(false);
        } else if (showOvertimeModal) {
          setShowOvertimeModal(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showSearchModal, showWorkshiftCodeModal, showWorkshiftModal, showOvertimeModal]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'workshift':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-6">
              {/* Fixed Option */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="workshift-fixed"
                    checked={workshiftMode === 'fixed'}
                    onChange={() => setWorkshiftMode('fixed')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="workshift-fixed" className="text-gray-700">Fixed</label>
                </div>
                
                {workshiftMode === 'fixed' && (
                  <div className="ml-7 bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 max-w-md">
                      <label className="text-gray-700 w-24">DailySched</label>
                      <input
                        type="text"
                        value={fixedDailySched}
                        onChange={(e) => setFixedDailySched(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Variable Option */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="workshift-variable"
                    checked={workshiftMode === 'variable'}
                    onChange={() => setWorkshiftMode('variable')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="workshift-variable" className="text-gray-700">Variable</label>
                </div>
                
                {workshiftMode === 'variable' && (
                  <div className="ml-7 space-y-4">

                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-100 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-gray-700">
                              Date From
                              <span className="ml-2 text-blue-500">▲</span>
                            </th>
                            <th className="px-6 py-3 text-left text-gray-700">
                              Date To
                              <span className="ml-2 text-gray-400">▼</span>
                            </th>
                            <th className="px-6 py-3 text-left text-gray-700">
                              Shift Code
                              <span className="ml-2 text-gray-400">▼</span>
                            </th>
                            <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {workshiftVariableData.map((entry) => (
                            <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-6 py-3 text-gray-900">{entry.from}</td>
                              <td className="px-6 py-3 text-gray-900">{entry.to}</td>
                              <td className="px-6 py-3 text-gray-900">{entry.shiftCode}</td>
                              <td className="px-6 py-3">
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => {
                                      setIsWorkshiftEditMode(true);
                                      setCurrentWorkshiftId(entry.id);
                                      setWorkshiftFrom(entry.from);
                                      setWorkshiftTo(entry.to);
                                      setWorkshiftShiftCode(entry.shiftCode);
                                      setShowWorkshiftModal(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-700 hover:underline text-sm"
                                  >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <span className="text-gray-300">|</span>
                                <button 
                                  onClick={() => handleWorkshiftDelete(entry.id)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {/* Pagination */}
                      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-sm text-gray-600">Showing 1 to 3 of 3 entries</span>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                            Previous
                          </button>
                          <button className="px-3 py-2 bg-blue-600 text-white rounded">
                            1
                          </button>
                          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'overtime-applications':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-6">
              {/* Create New Button */}
              <div>
                <button 
                  onClick={() => {
                    setIsOvertimeEditMode(false);
                    setCurrentOvertimeId(null);
                    setOvertimeDate('');
                    setOvertimeHoursApproved('');
                    setOvertimeActualDateInOTBefore('');
                    setOvertimeStartTimeBefore('');
                    setOvertimeStartOvertimeDate('');
                    setOvertimeStartOvertimeTime('');
                    setOvertimeApprovedBreak('');
                    setOvertimeReason('');
                    setOvertimeRemarks('');
                    setOvertimeIsLateFiling(false);
                    setShowOvertimeModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create New
                </button>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-700">
                        Date
                        <span className="ml-2 text-blue-500">▲</span>
                      </th>
                      <th className="px-6 py-3 text-left text-gray-700">
                        Hours Approved
                        <span className="ml-2 text-gray-400">▼</span>
                      </th>
                      <th className="px-6 py-3 text-left text-gray-700">
                        Start Time OT Before
                        <span className="ml-2 text-gray-400">▼</span>
                      </th>
                      <th className="px-6 py-3 text-left text-gray-700">
                        Approved OT Break
                        <span className="ml-2 text-gray-400">▼</span>
                      </th>
                      <th className="px-6 py-3 text-left text-gray-700">
                        Reason
                        <span className="ml-2 text-gray-400">▼</span>
                      </th>
                      <th className="px-6 py-3 text-left text-gray-700">
                        Remarks
                        <span className="ml-2 text-gray-400">▼</span>
                      </th>
                      <th className="px-6 py-3 text-left text-gray-700">
                        Start Time OT
                        <span className="ml-2 text-gray-400">▼</span>
                      </th>
                      <th className="px-6 py-3 text-left text-gray-700">
                        Late Filing
                        <span className="ml-2 text-gray-400">▼</span>
                      </th>
                      <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overtimeApplicationsData.map((entry) => (
                      <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-3 text-gray-900">{entry.date}</td>
                        <td className="px-6 py-3 text-gray-900">{entry.hoursApproved}</td>
                        <td className="px-6 py-3 text-gray-900">{entry.startTimeOTBefore}</td>
                        <td className="px-6 py-3 text-gray-900">{entry.approvedOTBreak}</td>
                        <td className="px-6 py-3 text-gray-900">{entry.reason}</td>
                        <td className="px-6 py-3 text-gray-900">{entry.remarks}</td>
                        <td className="px-6 py-3 text-gray-900">{entry.startOvertimeTime}</td>
                        <td className="px-6 py-3 text-gray-900">{entry.isLateFiling ? 'Yes' : 'No'}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => {
                                setIsOvertimeEditMode(true);
                                setCurrentOvertimeId(entry.id);
                                setOvertimeDate(entry.date);
                                setOvertimeHoursApproved(entry.hoursApproved);
                                setOvertimeActualDateInOTBefore(entry.actualDateInOTBefore || '');
                                setOvertimeStartTimeBefore(entry.startTimeOTBefore);
                                setOvertimeStartOvertimeDate(entry.startOvertimeDate || '');
                                setOvertimeStartOvertimeTime(entry.startOvertimeTime || '');
                                setOvertimeApprovedBreak(entry.approvedOTBreak);
                                setOvertimeReason(entry.reason);
                                setOvertimeRemarks(entry.remarks);
                                setOvertimeIsLateFiling(entry.isLateFiling);
                                setShowOvertimeModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-700 hover:underline text-sm"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <span className="text-gray-300">|</span>
                            <button 
                              onClick={() => handleOvertimeDelete(entry.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Pagination */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-sm text-gray-600">Showing 1 to 3 of 3 entries</span>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                      Previous
                    </button>
                    <button className="px-3 py-2 bg-blue-600 text-white rounded">
                      1
                    </button>
                    <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const tabs = [
      { id: 'overtime-applications', label: 'Overtime Applications', icon: ClipboardList },
      { id: 'workshift', label: 'Workshift', icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Employee Time Keep Group Configuration [2-Shifts]</h1>
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
                    Configure work shifts and overtime applications for 2-shift employees with accurate time tracking and overtime management.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Work shift configuration (Fixed/Variable)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Overtime application tracking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

        {/* Employee Search Section */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-4">
            {/* Action Buttons with Edit Mode */}
            {!['leave-applications', 'overtime-applications', 'contractual', 'suspension'].includes(activeTab) && (
              <>
                {!isEditMode ? (
                  <button 
                    onClick={() => setIsEditMode(true)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        // Save logic would go here
                        setIsEditMode(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button 
                      onClick={() => setIsEditMode(false)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                )}
              </>
            )}
            {['leave-applications', 'overtime-applications', 'contractual', 'suspension'].includes(activeTab) && (
              <div className="px-4 py-2">&nbsp;</div>
            )}
          </div>
          
          {/* Employee Search Section */}
          <div className="mb-6 space-y-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <label className="text-gray-700 font-bold w-24">TKS Group</label>
                    <input
                    type="text"
                    value={tksGroup}
                    onChange={(e) => setTksGroup(e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <label className="text-gray-700 font-bold w-24">EmpCode</label>
                    <input
                    type="text"
                   value={empCode}
                    onChange={(e) => setEmpCode(e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                    onClick={() => setShowSearchModal(true)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                    <Search className="w-4 h-4" />
                    Search
                    </button>
                </div>
             </div>
          </div>

          {/* Employee Info Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-blue-700 mb-1">{employeeName}</div>
            <div className="text-blue-600">{payPeriod}</div>
          </div>
        </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-gray-300">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                  activeTab === tab.id
                    ? 'font-medium bg-blue-600 text-white -mb-px'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {renderTabContent()}
          </div>

          {/* Search Modal */}
          {showSearchModal && (
            <>
              {/* Modal Backdrop */}
              <div 
                className="fixed inset-0 bg-black/30 z-30"
                onClick={() => setShowSearchModal(false)}
              ></div>

              {/* Modal Dialog */}
              <div className="fixed left-1/2 transform -translate-x-1/2 z-40 w-full max-w-3xl px-4" style={{ top: '255px' }}>
                <div className="bg-white rounded-lg shadow-2xl border border-gray-300">
                  {/* Modal Header */}
                  <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                    <h2 className="text-gray-800 text-sm">Search</h2>
                    <button 
                      onClick={() => setShowSearchModal(false)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-3">
                    <h3 className="text-blue-600 mb-2 text-sm">Employee Code</h3>

                    {/* Search Input */}
                    <div className="flex items-center gap-2 mb-3">
                      <label className="text-gray-700 text-sm">Search:</label>
                      <input
                        type="text"
                        value={searchModalTerm}
                        onChange={(e) => setSearchModalTerm(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    {/* Employee Table */}
                    <div className="border border-gray-200 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <table className="w-full border-collapse text-sm">
                        <thead className="sticky top-0 bg-white">
                          <tr className="bg-gray-100 border-b-2 border-gray-300">
                            <th className="px-3 py-1.5 text-left text-gray-700 text-sm">EmpCode ▲</th>
                            <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Name</th>
                            <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Group Code</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEmployees.map((emp) => (
                            <tr 
                              key={emp.empCode}
                              className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                              onClick={() => handleEmployeeSelect(emp.empCode, emp.groupCode)}
                            >
                              <td className="px-3 py-1.5">{emp.empCode}</td>
                              <td className="px-3 py-1.5">{emp.name}</td>
                              <td className="px-3 py-1.5">{emp.groupCode}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-gray-600 text-xs">
                        Showing 1 to {filteredEmployees.length} of {employeeData.length} entries
                      </div>
                      <div className="flex gap-1">
                        <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">
                          Previous
                        </button>
                        <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs">1</button>
                        <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Workshift Code Search Modal */}
          {showWorkshiftCodeModal && (
            <>
              {/* Modal Backdrop */}
              <div 
                className="fixed inset-0 bg-black/30 z-10"
                onClick={() => setShowWorkshiftCodeModal(false)}
              ></div>

                {/* Modal Dialog */}
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[110vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                    <h2 className="text-gray-800 text-sm">Search Workshift Code</h2>
                    <button 
                      onClick={() => setShowWorkshiftCodeModal(false)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-3">
                    <h3 className="text-blue-600 mb-2 text-sm">Workshift Code</h3>

                    {/* Search Input */}
                    <div className="flex items-center gap-2 mb-3">
                      <label className="text-gray-700 text-sm">Search:</label>
                      <input
                        type="text"
                        value={workshiftCodeSearchTerm}
                        onChange={(e) => setWorkshiftCodeSearchTerm(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    {/* Workshift Code Table */}
                    <div className="border border-gray-200 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <table className="w-full border-collapse text-sm">
                        <thead className="sticky top-0 bg-white">
                          <tr className="bg-gray-100 border-b-2 border-gray-300">
                            <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Code ▲</th>
                            <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredWorkshiftCodes.map((ws) => (
                            <tr 
                              key={ws.code}
                              className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                              onClick={() => handleWorkshiftCodeSelect(ws.code)}
                            >
                              <td className="px-3 py-1.5">{ws.code}</td>
                              <td className="px-3 py-1.5">{ws.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-gray-600 text-xs">
                        Showing 1 to {filteredWorkshiftCodes.length} of {workshiftCodeData.length} entries
                      </div>
                      <div className="flex gap-1">
                        <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">
                          Previous
                        </button>
                        <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs">1</button>
                        <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Overtime Application Modal */}
          <OvertimeApplicationModal
            isOpen={showOvertimeModal}
            isEditMode={isOvertimeEditMode}
            empCode={empCode}
            date={overtimeDate}
            hoursApproved={overtimeHoursApproved}
            actualDateInOTBefore={overtimeActualDateInOTBefore}
            startTimeBefore={overtimeStartTimeBefore}
            startOvertimeDate={overtimeStartOvertimeDate}
            startOvertimeTime={overtimeStartOvertimeTime}
            approvedBreak={overtimeApprovedBreak}
            reason={overtimeReason}
            remarks={overtimeRemarks}
            isLateFiling={overtimeIsLateFiling}
            onClose={() => setShowOvertimeModal(false)}
            onDateChange={setOvertimeDate}
            onHoursApprovedChange={setOvertimeHoursApproved}
            onActualDateInOTBeforeChange={setOvertimeActualDateInOTBefore}
            onStartTimeBeforeChange={setOvertimeStartTimeBefore}
            onStartOvertimeDateChange={setOvertimeStartOvertimeDate}
            onStartOvertimeTimeChange={setOvertimeStartOvertimeTime}
            onApprovedBreakChange={setOvertimeApprovedBreak}
            onReasonChange={setOvertimeReason}
            onRemarksChange={setOvertimeRemarks}
            onIsLateFilingChange={setOvertimeIsLateFiling}
            onSubmit={handleOvertimeSubmit}
          />

          {/* Workshift Variable Modal */}
          {showWorkshiftModal && (
            <>
              {/* Modal Backdrop */}
              <div 
                className="fixed inset-0 bg-black/30 z-30"
                onClick={() => setShowWorkshiftModal(false)}
              ></div>

              {/* Modal Dialog */}
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                  {/* Modal Header */}
                  <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                    <h2 className="text-gray-800">
                      {isWorkshiftEditMode ? 'Edit Workshift' : 'Create Workshift Variable'}
                    </h2>
                    <button 
                      onClick={() => setShowWorkshiftModal(false)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-5">
                    <div className="space-y-3">
                      {/* From Field */}
                      <div className="flex items-center gap-2">
                        <label className="w-24 text-gray-700 text-sm">From</label>
                        <DatePicker
                          value={workshiftFrom}
                          onChange={setWorkshiftFrom}
                          placeholder="MM/DD/YYYY"
                          className="flex-1"
                        />
                      </div>

                      {/* To Field */}
                      <div className="flex items-center gap-2">
                        <label className="w-24 text-gray-700 text-sm">To</label>
                        <DatePicker
                          value={workshiftTo}
                          onChange={setWorkshiftTo}
                          placeholder="MM/DD/YYYY"
                          className="flex-1"
                        />
                      </div>

                      {/* Shift Code Field */}
                      <div className="flex items-center gap-2">
                        <label className="w-24 text-gray-700 text-sm">Shift Code</label>
                        <input
                          type="text"
                          value={workshiftShiftCode}
                          onChange={(e) => setWorkshiftShiftCode(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button
                          onClick={() => setShowWorkshiftCodeModal(true)}
                          className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors shadow-sm"
                          title="Search Workshift Code"
                        >
                          <Search className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Modal Actions */}
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleWorkshiftSubmit}
                        className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => setShowWorkshiftModal(false)}
                        className="px-5 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
                      >
                        Back to List
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}