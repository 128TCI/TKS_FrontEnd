import { useState, useEffect } from 'react';
import { 
  Search,
  Settings,
  FileX,
  Smartphone,
  Calendar,
  Clock,
  Tag,
  FileText,
  ClipboardList,
  FileSignature,
  PauseCircle,
  Pencil,
  Plus,
  X,
  Check,
  Save,
  Edit,
  Trash,
  Trash2
} from 'lucide-react';
import { LeaveApplicationModal } from './Modals/LeaveApplicationModal';
import { OvertimeApplicationModal } from './Modals//OvertimeApplicationModal';
import { ContractualModal } from './Modals/ContractualModal';
import { SuspensionModal } from './Modals/SuspensionModal';
import { Footer } from './Footer/Footer';

type TabType = 'basic-config' | 'exemptions' | 'device-code' | 'rest-day' | 'workshift' | 'classification' | 'leave-applications' | 'overtime-applications' | 'contractual' | 'suspension';

interface DeviceCodeEntry {
  effectivityDate: string;
  expiryDate: string;
  code: string;
}

export function EmployeeTimekeepConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('basic-config');
  const [empCode, setEmpCode] = useState('000877');
  const [tksGroup, setTksGroup] = useState('45');
  const [newDeviceCode, setNewDeviceCode] = useState('155');
  const [newPassword, setNewPassword] = useState('');
  const [newEffectivityDate, setNewEffectivityDate] = useState('');
  const [newExpiryDate, setNewExpiryDate] = useState('');

  // Search modal state
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchModalTerm, setSearchModalTerm] = useState('');

  // Global Edit Mode
  const [isEditMode, setIsEditMode] = useState(false);

  // Leave Applications Modal States
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isLeaveEditMode, setIsLeaveEditMode] = useState(true);
  const [currentLeaveId, setCurrentLeaveId] = useState<number>(0);
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveHoursApproved, setLeaveHoursApproved] = useState('');
  const [leaveCode, setLeaveCode] = useState('');
  const [leavePeriod, setLeavePeriod] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveRemarks, setLeaveRemarks] = useState('');
  const [leaveWithPay, setLeaveWithPay] = useState(false);
  const [leaveSssNotification, setLeaveSssNotification] = useState(false);
  const [leaveIsLateFiling, setLeaveIsLateFiling] = useState(false);

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

  // Contractual Modal States
  const [showContractualModal, setShowContractualModal] = useState(false);
  const [isContractualEditMode, setIsContractualEditMode] = useState(false);
  const [currentContractualId, setCurrentContractualId] = useState<number | null>(null);
  const [contractualDateFrom, setContractualDateFrom] = useState('');
  const [contractualDateTo, setContractualDateTo] = useState('');

  // Suspension Modal States
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [isSuspensionEditMode, setIsSuspensionEditMode] = useState(false);
  const [currentSuspensionId, setCurrentSuspensionId] = useState<number | null>(null);
  const [suspensionDateFrom, setSuspensionDateFrom] = useState('');
  const [suspensionDateTo, setSuspensionDateTo] = useState('');

  // Mock data
  const employeeName = 'Last122, First A';
  const payPeriod = 'Main Monthly';
  const deviceCodeEntries: DeviceCodeEntry[] = [];

  // Sample employee data for search modal
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

  // Handle ESC key to close modal (excluding leave modal as it handles ESC internally)
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showSearchModal) {
          setShowSearchModal(false);
        } else if (showOvertimeModal) {
          setShowOvertimeModal(false);
        } else if (showContractualModal) {
          setShowContractualModal(false);
        } else if (showSuspensionModal) {
          setShowSuspensionModal(false);
        }
      }
    };

    if (showSearchModal || showOvertimeModal || showContractualModal || showSuspensionModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showSearchModal, showOvertimeModal, showContractualModal, showSuspensionModal]);

  // Filter employees based on search term
  const filteredEmployees = employeeData.filter(emp =>
    emp.empCode.toLowerCase().includes(searchModalTerm.toLowerCase()) ||
    emp.name.toLowerCase().includes(searchModalTerm.toLowerCase()) ||
    emp.groupCode.toLowerCase().includes(searchModalTerm.toLowerCase())
  );

  // Handle employee selection from modal
  const handleEmployeeSelect = (empCodeValue: string, groupCodeValue: string) => {
    setEmpCode(empCodeValue);
    setTksGroup(groupCodeValue);
    setShowSearchModal(false);
    setSearchModalTerm('');
  };

  // Leave Application Handlers
  const handleLeaveSubmit = () => {
    if (isLeaveEditMode) {
      // Edit existing entry
      setLeaveApplicationsData(prev => prev.map(item => 
        item.id === currentLeaveId ? {
          id: currentLeaveId,
          date: leaveDate,
          hoursApproved: leaveHoursApproved,
          leaveCode: leaveCode,
          period: leavePeriod,
          reason: leaveReason,
          remarks: leaveRemarks,
          withPay: leaveWithPay,
          sssNotification: leaveSssNotification,
          isLateFiling: leaveIsLateFiling
        } : item
      ));
    } else {
      // Add new entry
      const newId = leaveApplicationsData.length > 0 
        ? Math.max(...leaveApplicationsData.map(item => item.id)) + 1 
        : 1;
      setLeaveApplicationsData(prev => [...prev, {
        id: newId,
        date: leaveDate,
        hoursApproved: leaveHoursApproved,
        leaveCode: leaveCode,
        period: leavePeriod,
        reason: leaveReason,
        remarks: leaveRemarks,
        withPay: leaveWithPay,
        sssNotification: leaveSssNotification,
        isLateFiling: leaveIsLateFiling
      }]);
    }
    setShowLeaveModal(false);
  };

  const handleLeaveDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this leave application?')) {
      setLeaveApplicationsData(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleOvertimeDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this overtime application?')) {
      setOvertimeApplicationsData(prev => prev.filter(item => item.id !== id));
    }
  };

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

  const handleContractualDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this contractual record?')) {
      setContractualData(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSuspensionDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this suspension record?')) {
      setSuspensionData(prev => prev.filter(item => item.id !== id));
    }
  };

  // Contractual Submit Handler
  const handleContractualSubmit = () => {
    if (isContractualEditMode && currentContractualId !== null) {
      // Edit existing entry
      setContractualData(prev => prev.map(item => 
        item.id === currentContractualId ? {
          id: currentContractualId,
          dateFrom: contractualDateFrom,
          dateTo: contractualDateTo
        } : item
      ));
    } else {
      // Add new entry
      const newId = contractualData.length > 0 
        ? Math.max(...contractualData.map(item => item.id)) + 1 
        : 1;
      setContractualData(prev => [...prev, {
        id: newId,
        dateFrom: contractualDateFrom,
        dateTo: contractualDateTo
      }]);
    }
    setShowContractualModal(false);
  };

  // Suspension Submit Handler
  const handleSuspensionSubmit = () => {
    if (isSuspensionEditMode && currentSuspensionId !== null) {
      // Edit existing entry
      setSuspensionData(prev => prev.map(item => 
        item.id === currentSuspensionId ? {
          id: currentSuspensionId,
          dateFrom: suspensionDateFrom,
          dateTo: suspensionDateTo
        } : item
      ));
    } else {
      // Add new entry
      const newId = suspensionData.length > 0 
        ? Math.max(...suspensionData.map(item => item.id)) + 1 
        : 1;
      setSuspensionData(prev => [...prev, {
        id: newId,
        dateFrom: suspensionDateFrom,
        dateTo: suspensionDateTo
      }]);
    }
    setShowSuspensionModal(false);
  };

  const tabs = [
    { id: 'basic-config', label: 'Basic Configuration', icon: Settings },
    { id: 'exemptions', label: 'Exemptions', icon: FileX },
    { id: 'device-code', label: 'Device Code', icon: Smartphone },
    { id: 'rest-day', label: 'Rest Day', icon: Calendar },
    { id: 'workshift', label: 'Workshift', icon: Clock },
    { id: 'classification', label: 'Classification', icon: Tag },
    { id: 'leave-applications', label: 'Leave Applications', icon: FileText },
    { id: 'overtime-applications', label: 'Overtime Applications', icon: ClipboardList },
    { id: 'contractual', label: 'Contractual', icon: FileSignature },
    { id: 'suspension', label: 'Suspension', icon: PauseCircle }
  ];

  // Get header title based on active tab
  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'basic-config':
        return 'Employee Basic Configuration';
      case 'exemptions':
        return 'Employee Exemptions';
      case 'device-code':
        return 'Employee Device Code';
      case 'rest-day':
        return 'Employee Rest Day';
      case 'workshift':
        return 'Employee Workshift';
      case 'classification':
        return 'Employee Classification';
      case 'leave-applications':
        return 'Employee Leave Applications';
      case 'overtime-applications':
        return 'Employee Overtime Applications';
      case 'contractual':
        return 'Employee Contractual';
      case 'suspension':
        return 'Employee Suspension';
      default:
        return 'Employee Timekeep Configuration';
    }
  };

  const [basicConfig, setBasicConfig] = useState({
    groupScheduleCode: '',
    allowOTDefault: false,
    active: true,
    workedRestDay: true,
    workedHoliday: false,
    timeAttendanceStatus: false
  });

  const [exemptions, setExemptions] = useState({
    tardiness: false,
    undertime: false,
    nightDiffBasic: false,
    overtime: false,
    absences: false,
    otherEarnAndAllowance: false,
    holidayPay: false
  });

  const [restDayMode, setRestDayMode] = useState<'fixed' | 'variable'>('variable');
  const [fixedRestDays, setFixedRestDays] = useState({
    restDay1: '',
    restDay2: '',
    restDay3: ''
  });

  const [workshiftMode, setWorkshiftMode] = useState<'fixed' | 'variable'>('variable');
  const [fixedDailySched, setFixedDailySched] = useState('');

  const [classificationMode, setClassificationMode] = useState<'fixed' | 'variable'>('variable');
  const [fixedClassificationCode, setFixedClassificationCode] = useState('');

  const [exemptionsMode, setExemptionsMode] = useState<'fixed' | 'variable'>('variable');

  const restDayVariableData = [
    { from: '1/1/2021', to: '12/31/2022', restDay1: 'Saturday', restDay2: 'Sunday', restDay3: '' }
  ];

  const workshiftVariableData = [
    { from: '11/2/2025', to: '11/29/2028', shiftCode: '7AM4PM', glCode: 'GLCODE1' },
    { from: '11/1/2025', to: '11/1/2025', shiftCode: '3PM12AM', glCode: 'GL1' },
    { from: '10/1/2025', to: '10/2/2025', shiftCode: '8AM5PM', glCode: '' }
  ];

  const classificationVariableData: { from: string; to: string; classificationCode: string }[] = [];

  const [leaveApplicationsData, setLeaveApplicationsData] = useState([
    { id: 1, date: '12/2/2022', hoursApproved: '0.01', leaveCode: 'HL', period: '', reason: '', remarks: '', withPay: false, sssNotification: false, isLateFiling: false },
    { id: 2, date: '12/2/2022', hoursApproved: '9.00', leaveCode: 'VL', period: '', reason: 'test', remarks: '', withPay: false, sssNotification: false, isLateFiling: false }
  ]);

  const [overtimeApplicationsData, setOvertimeApplicationsData] = useState([
    { id: 1, date: '11/14/2025', hoursApproved: '1.00', actualDateInOTBefore: '11/14/2025', startTimeOTBefore: '9:00 PM', startOvertimeDate: '11/14/2025', startOvertimeTime: '10:00 PM', approvedOTBreak: '', reason: 'a', remarks: '', isLateFiling: false },
    { id: 2, date: '11/14/2025', hoursApproved: '1.00', actualDateInOTBefore: '11/14/2025', startTimeOTBefore: '9:00 PM', startOvertimeDate: '11/14/2025', startOvertimeTime: '10:00 PM', approvedOTBreak: '', reason: 'a', remarks: '', isLateFiling: false },
    { id: 3, date: '11/14/2025', hoursApproved: '1.00', actualDateInOTBefore: '11/14/2025', startTimeOTBefore: '9:00 PM', startOvertimeDate: '11/14/2025', startOvertimeTime: '10:00 PM', approvedOTBreak: '', reason: 'a', remarks: '', isLateFiling: false }
  ]);

  const [contractualData, setContractualData] = useState<{ id: number; dateFrom: string; dateTo: string }[]>([
    { id: 1, dateFrom: '12/1/2025', dateTo: '12/31/2025' }
  ]);

  const [suspensionData, setSuspensionData] = useState<{ id: number; dateFrom: string; dateTo: string }[]>([
    { id: 1, dateFrom: '1/1/2026', dateTo: '6/30/2026' }
  ]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic-config':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-center gap-3">
                <label className="text-gray-700 w-80">GroupScheduleCode</label>
                <input
                  type="text"
                  value={basicConfig.groupScheduleCode}
                  onChange={(e) => setBasicConfig({...basicConfig, groupScheduleCode: e.target.value})}
                  disabled={!isEditMode}
                  className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <label className="text-gray-700 w-80">AllowOTDefault</label>
                <input
                  type="checkbox"
                  checked={basicConfig.allowOTDefault}
                  onChange={(e) => setBasicConfig({...basicConfig, allowOTDefault: e.target.checked})}
                  disabled={!isEditMode}
                  className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-gray-700 w-80">Active</label>
                <input
                  type="checkbox"
                  checked={basicConfig.active}
                  onChange={(e) => setBasicConfig({...basicConfig, active: e.target.checked})}
                  disabled={!isEditMode}
                  className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-gray-700 w-80">Worked Rest Day Allowance Not based on Computed OT</label>
                <input
                  type="checkbox"
                  checked={basicConfig.workedRestDay}
                  onChange={(e) => setBasicConfig({...basicConfig, workedRestDay: e.target.checked})}
                  disabled={!isEditMode}
                  className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-gray-700 w-80">Worked Holiday Allowance Not based on Computed OT</label>
                <input
                  type="checkbox"
                  checked={basicConfig.workedHoliday}
                  onChange={(e) => setBasicConfig({...basicConfig, workedHoliday: e.target.checked})}
                  disabled={!isEditMode}
                  className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-gray-700 w-80">TimeAttendanceStatus</label>
                <input
                  type="checkbox"
                  checked={basicConfig.timeAttendanceStatus}
                  onChange={(e) => setBasicConfig({...basicConfig, timeAttendanceStatus: e.target.checked})}
                  disabled={!isEditMode}
                  className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                />
              </div>
            </div>
          </div>
        );

      case 'exemptions':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-2 gap-x-24 gap-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exemptions.tardiness}
                  onChange={(e) => setExemptions({...exemptions, tardiness: e.target.checked})}
                  disabled={!isEditMode}
                  className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                />
                <label className="text-gray-700">Tardiness</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exemptions.absences}
                  onChange={(e) => setExemptions({...exemptions, absences: e.target.checked})}
                  disabled={!isEditMode}
                  className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                />
                <label className="text-gray-700">Absences</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exemptions.undertime}
                  onChange={(e) => setExemptions({...exemptions, undertime: e.target.checked})}
                  disabled={!isEditMode}
                  className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                />
                <label className="text-gray-700">Undertime</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exemptions.otherEarnAndAllowance}
                  onChange={(e) => setExemptions({...exemptions, otherEarnAndAllowance: e.target.checked})}
                  disabled={!isEditMode}
                  className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                />
                <label className="text-gray-700">Other Earn And Allowance</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exemptions.nightDiffBasic}
                  onChange={(e) => setExemptions({...exemptions, nightDiffBasic: e.target.checked})}
                  disabled={!isEditMode}
                  className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                />
                <label className="text-gray-700">Night Diff Basic</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exemptions.holidayPay}
                  onChange={(e) => setExemptions({...exemptions, holidayPay: e.target.checked})}
                  disabled={!isEditMode}
                  className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                />
                <label className="text-gray-700">HolidayPay</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exemptions.overtime}
                  onChange={(e) => setExemptions({...exemptions, overtime: e.target.checked})}
                  disabled={!isEditMode}
                  className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                />
                <label className="text-gray-700">Overtime</label>
              </div>
            </div>
          </div>
        );

      case 'device-code':
        return (
          <div className="space-y-6">
            {/* Input Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4">
                    <label className="text-gray-700 w-32">Code</label>
                    <input
                      type="text"
                      value={newDeviceCode}
                      onChange={(e) => setNewDeviceCode(e.target.value)}
                      disabled={!isEditMode}
                      className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="text-gray-700 w-32">Effectivity Date</label>
                    <input
                      type="date"
                      value={newEffectivityDate}
                      onChange={(e) => setNewEffectivityDate(e.target.value)}
                      disabled={!isEditMode}
                      className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4">
                    <label className="text-gray-700 w-32">Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={!isEditMode}
                      className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="text-gray-700 w-32">Expiry Date</label>
                    <input
                      type="date"
                      value={newExpiryDate}
                      onChange={(e) => setNewExpiryDate(e.target.value)}
                      disabled={!isEditMode}
                      className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-700">
                      Effectivity Date
                      <span className="ml-2 text-blue-500">▲</span>
                    </th>
                    <th className="px-6 py-3 text-left text-gray-700">
                      Expiry Date
                      <span className="ml-2 text-gray-400">▼</span>
                    </th>
                    <th className="px-6 py-3 text-left text-gray-700">
                      Code
                      <span className="ml-2 text-gray-400">▼</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deviceCodeEntries.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    deviceCodeEntries.map((entry, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-3 text-gray-900">{entry.effectivityDate}</td>
                        <td className="px-6 py-3 text-gray-900">{entry.expiryDate}</td>
                        <td className="px-6 py-3 text-gray-900">{entry.code}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              
              {/* Pagination */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                  Previous
                </button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                  Next
                </button>
              </div>
            </div>
          </div>
        );

      case 'rest-day':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-6">
              {/* Fixed Option */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="rest-day-fixed"
                    checked={restDayMode === 'fixed'}
                    onChange={() => setRestDayMode('fixed')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="rest-day-fixed" className="text-gray-700">Fixed</label>
                </div>
                
                {restDayMode === 'fixed' && (
                  <div className="ml-7 bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="flex items-center gap-3">
                        <label className="text-gray-700 w-24">Rest Day 1</label>
                        <input
                          type="text"
                          value={fixedRestDays.restDay1}
                          onChange={(e) => setFixedRestDays({...fixedRestDays, restDay1: e.target.value})}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-gray-700 w-24">Rest Day 3</label>
                        <input
                          type="text"
                          value={fixedRestDays.restDay3}
                          onChange={(e) => setFixedRestDays({...fixedRestDays, restDay3: e.target.value})}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-gray-700 w-24">Rest Day 2</label>
                        <input
                          type="text"
                          value={fixedRestDays.restDay2}
                          onChange={(e) => setFixedRestDays({...fixedRestDays, restDay2: e.target.value})}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Variable Option */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="rest-day-variable"
                    checked={restDayMode === 'variable'}
                    onChange={() => setRestDayMode('variable')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="rest-day-variable" className="text-gray-700">Variable</label>
                </div>
                
                {restDayMode === 'variable' && (
                  <div className="ml-7 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-gray-700">
                            From
                            <span className="ml-2 text-blue-500">▲</span>
                          </th>
                          <th className="px-6 py-3 text-left text-gray-700">
                            To
                            <span className="ml-2 text-gray-400">▼</span>
                          </th>
                          <th className="px-6 py-3 text-left text-gray-700">
                            Fix Rest Day 1
                            <span className="ml-2 text-gray-400">▼</span>
                          </th>
                          <th className="px-6 py-3 text-left text-gray-700">
                            Fix Rest Day 2
                            <span className="ml-2 text-gray-400">▼</span>
                          </th>
                          <th className="px-6 py-3 text-left text-gray-700">
                            Fix Rest Day 3
                            <span className="ml-2 text-gray-400">▼</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {restDayVariableData.map((entry, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-3 text-gray-900">{entry.from}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.to}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.restDay1}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.restDay2}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.restDay3}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Pagination */}
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-sm text-gray-600">Showing 1 to 1 of 1 entries</span>
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
                )}
              </div>
            </div>
          </div>
        );

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
                  <div className="ml-7 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-gray-700">
                            From
                            <span className="ml-2 text-blue-500">▲</span>
                          </th>
                          <th className="px-6 py-3 text-left text-gray-700">
                            To
                            <span className="ml-2 text-gray-400">▼</span>
                          </th>
                          <th className="px-6 py-3 text-left text-gray-700">
                            Shift Code
                            <span className="ml-2 text-gray-400">▼</span>
                          </th>
                          <th className="px-6 py-3 text-left text-gray-700">
                            GL Code
                            <span className="ml-2 text-gray-400">▼</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {workshiftVariableData.map((entry, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-3 text-gray-900">{entry.from}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.to}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.shiftCode}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.glCode}</td>
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
                )}
              </div>
            </div>
          </div>
        );

      case 'classification':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-6">
              {/* Fixed Option */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="classification-fixed"
                    checked={classificationMode === 'fixed'}
                    onChange={() => setClassificationMode('fixed')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="classification-fixed" className="text-gray-700">Fixed</label>
                </div>
                
                {classificationMode === 'fixed' && (
                  <div className="ml-7 bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 max-w-md">
                      <label className="text-gray-700 w-40">Classification Code</label>
                      <input
                        type="text"
                        value={fixedClassificationCode}
                        onChange={(e) => setFixedClassificationCode(e.target.value)}
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
                    id="classification-variable"
                    checked={classificationMode === 'variable'}
                    onChange={() => setClassificationMode('variable')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="classification-variable" className="text-gray-700">Variable</label>
                </div>
                
                {classificationMode === 'variable' && (
                  <div className="ml-7 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-gray-700">
                            From
                            <span className="ml-2 text-blue-500">▲</span>
                          </th>
                          <th className="px-6 py-3 text-left text-gray-700">
                            To
                            <span className="ml-2 text-gray-400">▼</span>
                          </th>
                          <th className="px-6 py-3 text-left text-gray-700">
                            Classification Code
                            <span className="ml-2 text-gray-400">▼</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {classificationVariableData.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                              No data available in table
                            </td>
                          </tr>
                        ) : (
                          classificationVariableData.map((entry, index) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-6 py-3 text-gray-900">{entry.from}</td>
                              <td className="px-6 py-3 text-gray-900">{entry.to}</td>
                              <td className="px-6 py-3 text-gray-900">{entry.classificationCode}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                    
                    {/* Pagination */}
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
                      <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                        Previous
                      </button>
                      <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'leave-applications':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-6">
              {/* Create New Button */}
              <div>
                <button 
                  onClick={() => {
                    setIsLeaveEditMode(false);
                    setCurrentLeaveId(0);
                    setLeaveDate('');
                    setLeaveHoursApproved('');
                    setLeaveCode('');
                    setLeavePeriod('');
                    setLeaveReason('');
                    setLeaveRemarks('');
                    setLeaveWithPay(false);
                    setLeaveSssNotification(false);
                    setLeaveIsLateFiling(false);
                    setShowLeaveModal(true);
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
                        Leave Code
                        <span className="ml-2 text-gray-400">▼</span>
                      </th>
                      <th className="px-6 py-3 text-left text-gray-700">
                        Period
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
                        With Pay
                        <span className="ml-2 text-gray-400">▼</span>
                      </th>
                      <th className="px-6 py-3 text-left text-gray-700">
                        SSS Notification
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
                    {leaveApplicationsData.map((entry) => (
                      <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-3 text-gray-900">{entry.date}</td>
                        <td className="px-6 py-3 text-gray-900">{entry.hoursApproved}</td>
                        <td className="px-6 py-3 text-gray-900">{entry.leaveCode}</td>
                        <td className="px-6 py-3 text-gray-900">{entry.period}</td>
                        <td className="px-6 py-3 text-gray-900">{entry.reason}</td>
                        <td className="px-6 py-3 text-gray-900">{entry.remarks}</td>
                        <td className="px-6 py-3 text-gray-900">{entry.withPay ? 'Yes' : 'No'}</td>
                        <td className="px-6 py-3 text-gray-900">{entry.sssNotification ? 'Yes' : 'No'}</td>
                        <td className="px-6 py-3 text-gray-900">{entry.isLateFiling ? 'Yes' : 'No'}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => {
                                setIsLeaveEditMode(true);
                                setCurrentLeaveId(entry.id);
                                setLeaveDate(entry.date);
                                setLeaveHoursApproved(entry.hoursApproved);
                                setLeaveCode(entry.leaveCode);
                                setLeavePeriod(entry.period);
                                setLeaveReason(entry.reason);
                                setLeaveRemarks(entry.remarks);
                                setLeaveWithPay(entry.withPay);
                                setLeaveSssNotification(entry.sssNotification);
                                setLeaveIsLateFiling(entry.isLateFiling);
                                setShowLeaveModal(true);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <span className="text-gray-300">|</span>
                            <button 
                              onClick={() => handleLeaveDelete(entry.id)}
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
                  <span className="text-sm text-gray-600">Showing 1 to 2 of 2 entries</span>
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
                        <td className="px-6 py-3 text-gray-900">{entry.startTimeOT}</td>
                        <td className="px-6 py-3 text-gray-900">{entry.isLateFiling ? 'Yes' : 'No'}</td>
                        <td className="px-6 py-3">
                          <div className="flex gap-2">
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
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
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

      case 'contractual':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-6">
              {/* Create New Button */}
              <div>
                <button 
                  onClick={() => {
                    setIsContractualEditMode(false);
                    setCurrentContractualId(null);
                    setContractualDateFrom('');
                    setContractualDateTo('');
                    setShowContractualModal(true);
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
                        Date From
                        <span className="ml-2 text-blue-500">▲</span>
                      </th>
                      <th className="px-6 py-3 text-left text-gray-700">
                        Date To
                        <span className="ml-2 text-gray-400">▼</span>
                      </th>
                      <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contractualData.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                          No data available in table
                        </td>
                      </tr>
                    ) : (
                      contractualData.map((entry) => (
                        <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-6 py-3 text-gray-900">{entry.dateFrom}</td>
                          <td className="px-6 py-3 text-gray-900">{entry.dateTo}</td>
                          <td className="px-6 py-3">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  setIsContractualEditMode(true);
                                  setCurrentContractualId(entry.id);
                                  setContractualDateFrom(entry.dateFrom);
                                  setContractualDateTo(entry.dateTo);
                                  setShowContractualModal(true);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <span className="text-gray-300">|</span>
                              <button 
                                onClick={() => handleContractualDelete(entry.id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                
                {/* Pagination */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-sm text-gray-600">Showing 1 to 1 of 1 entries</span>
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

      case 'suspension':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-6">
              {/* Create New Button */}
              <div>
                <button 
                  onClick={() => {
                    setIsSuspensionEditMode(false);
                    setCurrentSuspensionId(null);
                    setSuspensionDateFrom('');
                    setSuspensionDateTo('');
                    setShowSuspensionModal(true);
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
                        Date From
                        <span className="ml-2 text-blue-500">▲</span>
                      </th>
                      <th className="px-6 py-3 text-left text-gray-700">
                        Date To
                        <span className="ml-2 text-gray-400">▼</span>
                      </th>
                      <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suspensionData.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                          No data available in table
                        </td>
                      </tr>
                    ) : (
                      suspensionData.map((entry) => (
                        <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-6 py-3 text-gray-900">{entry.dateFrom}</td>
                          <td className="px-6 py-3 text-gray-900">{entry.dateTo}</td>
                          <td className="px-6 py-3">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  setIsSuspensionEditMode(true);
                                  setCurrentSuspensionId(entry.id);
                                  setSuspensionDateFrom(entry.dateFrom);
                                  setSuspensionDateTo(entry.dateTo);
                                  setShowSuspensionModal(true);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <span className="text-gray-300">|</span>
                              <button 
                                onClick={() => handleSuspensionDelete(entry.id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                
                {/* Pagination */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-sm text-gray-600">Showing 1 to 1 of 1 entries</span>
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
        <h1 className="text-white">{getHeaderTitle()}</h1>
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
                Configure comprehensive employee timekeeping settings including basic information, exemptions, device codes, rest days, work shifts, classifications, and leave/overtime applications for accurate time tracking.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Employee timekeeping configuration</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Device code management</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Work shift and rest day setup</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Leave and overtime tracking</span>
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

        {/* Tab Navigation */}
        <div className="mb-6 flex items-center gap-1 border-b border-gray-200 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                activeTab === tab.id
                  ? 'text-white bg-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
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
                      {filteredEmployees.map((emp, index) => (
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
                    Showing 1 to 10 of 1,658 entries
                  </div>
                  <div className="flex gap-1">
                    <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">
                      Previous
                    </button>
                    <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs">1</button>
                    <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">2</button>
                    <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">3</button>
                    <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">4</button>
                    <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">5</button>
                    <span className="px-1 text-gray-500 text-xs">...</span>
                    <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">166</button>
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

      {/* Leave Application Modal */}
      <LeaveApplicationModal
        isOpen={showLeaveModal}
        isEditMode={isLeaveEditMode}
        empCode={empCode}
        date={leaveDate}
        hoursApproved={leaveHoursApproved}
        leaveCode={leaveCode}
        period={leavePeriod}
        reason={leaveReason}
        remarks={leaveRemarks}
        withPay={leaveWithPay}
        sssNotification={leaveSssNotification}
        isLateFiling={leaveIsLateFiling}
        onClose={() => setShowLeaveModal(false)}
        onDateChange={setLeaveDate}
        onHoursApprovedChange={setLeaveHoursApproved}
        onLeaveCodeChange={setLeaveCode}
        onPeriodChange={setLeavePeriod}
        onReasonChange={setLeaveReason}
        onRemarksChange={setLeaveRemarks}
        onWithPayChange={setLeaveWithPay}
        onSssNotificationChange={setLeaveSssNotification}
        onIsLateFilingChange={setLeaveIsLateFiling}
        onSubmit={handleLeaveSubmit}
      />

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

      {/* Contractual Modal */}
      <ContractualModal
        isOpen={showContractualModal}
        isEditMode={isContractualEditMode}
        dateFrom={contractualDateFrom}
        dateTo={contractualDateTo}
        onClose={() => setShowContractualModal(false)}
        onDateFromChange={setContractualDateFrom}
        onDateToChange={setContractualDateTo}
        onSubmit={handleContractualSubmit}
      />

      {/* Suspension Modal */}
      <SuspensionModal
        isOpen={showSuspensionModal}
        isEditMode={isSuspensionEditMode}
        dateFrom={suspensionDateFrom}
        dateTo={suspensionDateTo}
        onClose={() => setShowSuspensionModal(false)}
        onDateFromChange={setSuspensionDateFrom}
        onDateToChange={setSuspensionDateTo}
        onSubmit={handleSuspensionSubmit}
      />
    </div>
   </div>


      {/* Footer */}
      <Footer />
    </div>
  );
}