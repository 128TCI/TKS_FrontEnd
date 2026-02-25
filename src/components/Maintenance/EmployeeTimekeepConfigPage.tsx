import { useState, useEffect, useMemo } from 'react';
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
import { LeaveApplicationModal } from '../Modals/LeaveApplicationModal';
import { OvertimeApplicationModal } from '../Modals/OvertimeApplicationModal';
import { ContractualModal } from '../Modals/ContractualModal';
import { SuspensionModal } from '../Modals/SuspensionModal';
import { EmployeeSearchModal } from '../Modals/EmployeeSearchModal';
import { GroupScheduleSearchModal } from '../Modals/GroupScheduleSearchModal';
import { DeviceCodeModal } from '../Modals/Devicecodemodal';
import { RestDayVariableModal } from '../Modals/Restdayvariablemodal';
import { Footer } from '../Footer/Footer';
import apiClient from '../../services/apiClient';
import Swal from 'sweetalert2';
import { WorkshiftVariableModal } from '../Modals/WorkShiftVariableModal';
import { ClassificationVariableModal } from '../Modals/ClassificationVariableModal';
import { DailyScheduleSearchModal } from '../Modals/DailyScheduleSearchModal';

type TabType = 'basic-config' | 'exemptions' | 'device-code' | 'rest-day' | 'workshift' | 'classification' | 'leave-applications' | 'overtime-applications' | 'contractual' | 'suspension';

interface DeviceCodeEntry {
  effectivityDate: string;
  expiryDate: string;
  code: string;
}
// Daily Schedule Interface
interface DailySchedule {
  dailyScheduleID: number;
  referenceNo: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

// Workshift Fixed Interface
interface WorkshiftFixed {
  id: number;
  empCode: string;
  dailySched: string;
  isFixed: boolean;
}

// Workshift Variable Interface
interface WorkshiftVariable {
  id: number;
  empCode: string;
  dateFrom: string;
  dateTo: string;
  shiftCode: string;
  dailyScheduleCode: string;
  updateDate: string;
  glCode: string;
}

// Classification Fixed Interface
interface ClassificationFixed {
  id: number;
  empCode: string;
  classCode: string;  // Changed from classificationCode
  isFixed: boolean;
}

// Classification Variable Interface
interface ClassificationVariable {
  id: number;
  empCode: string;
  dateFrom: string;
  dateTo: string;
  classCode: string;  // Changed from classificationCode
}
// Device Code Interface
interface DeviceCode {
  id: number;
  empCode: string;
  timeInAndOutCode: string;
  timeInAndOutPass: string;
  timeInAndOutEffectDate: string;
  timeInAndOutExpiryDate: string;
}

// Rest Day Fixed Interface
interface RestDayFixed {
  id: number;
  empCode: string;
  fixedRestDay1: string;
  fixedRestDay2: string;
  fixedRestDay3: string;
  isFixed: boolean;
}

// Rest Day Variable Interface
interface RestDayVariable {
  id: number;
  empCode: string;
  datefrom: string;
  dateTo: string;
  restDay1: string;
  restDay2: string;
  restDay3: string;
}
// Employee Interface for Search Modal
interface Employee {
  empID: number;
  empCode: string;
  lName: string;
  fName: string;
  grpCode: string;
}

// Basic Configuration Interface
interface EmployeeBasicConfig {
  id: number;
  empCode: string;
  groupCode: string;
  groupScheduleCode: string;
  allowOTDefault: boolean;
  active: boolean;
  compAllowFrRDExmpOT: boolean;
  compAllowFrHolExmpOT: boolean;
  timeAttendanceStatus: boolean;
}

// Group Schedule Interface
interface GroupSchedule {
  groupScheduleID: number;
  groupScheduleCode: string;
  groupScheduleDesc: string;
}

// Employee Exemptions Interface
interface EmployeeExemptions {
  id: number;
  empCode: string;
  tardiness: boolean;
  undertime: boolean;
  nightDiffBasic: boolean;
  overtime: boolean;
  absences: boolean;
  otherEarnAndAllow: boolean;
  holidayPay: boolean;
  unprodWorkHoliday: boolean;
}

// Leave Application Interface
interface LeaveApplication {
  id: number;
  empCode: string;
  date: string;
  hoursApprovedNum: number;
  leaveCode: string;
  period: string;
  reason: string;
  remarks: string;
  withPay: boolean;
  sssNotif: boolean;
  isProcSSSNotif: boolean;
  balanceID: string;
  isLateFiling: boolean;
  isLateFilingProcessed: boolean;
  exemptAllowFlag: boolean;
}

interface PayrollLocation {
    id: number;
    locId: number;
    locCode: string;
    locName: string;
    confidential: string;
    notedBy: string;
    preparedBy: string;
    reviewedBy: string;
    approvedBy: string;
    nonTaxAccum: number;
    header: string;
    desc1: string;
    desc2: string;
    desc3: string;
    desc4: string;
    contribFormula: string;
    contribPayPer: number;
    ins: string;
    insPayPer: number;
    pagIbig: string;
    pagPayPer: number;
    sssContrib: string;
    sssPayPer: number;
    philContrib: string;
    philPayPer: number;
    companyCode: string;
    clsCode: string;
    payCode: string;
    rateCode: string;
    noOfDays: number;
    noOfHours: number;
    totalPeriod: number;
    costCenter1: string;
    costCenter2: string;
}
// Overtime Application Interface
interface OvertimeApplication {
  id: number;
  empCode: string;
  date: string;
  numOTHoursApproved: number;
  earlyOTStartTime: string;
  earlyTimeIn: string;
  startOTPM: string;
  minHRSOTBreak: number;
  earlyOTStartTimeRestHol: string;
  reason: string;
  remarks: string;
  approvedOTBreaksHrs: number;
  stotats: string;
  isLateFiling: boolean;
  isLateFilingProcessed: boolean;
  appliedBeforeShiftDate: string;
  isOTBeforeShiftNextDay: boolean;
}

// Contractual Interface
interface Contractual {
  id: number;
  empCode: string;
  dateFr: string;
  dateTo: string;
}

// Suspension Interface
interface Suspension {
  id: number;
  empCode: string;
  dateFrom: string;
  dateTo: string;
}
export function EmployeeTimekeepConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('basic-config');
  const [empCode, setEmpCode] = useState('');
  const [tksGroup, setTksGroup] = useState('');
  const [tksGroupName, setTksGroupName] = useState('');
  const [newDeviceCode, setNewDeviceCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEffectivityDate, setNewEffectivityDate] = useState('');
  const [newExpiryDate, setNewExpiryDate] = useState('');

  // Search modal state
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showGroupScheduleModal, setShowGroupScheduleModal] = useState(false);

  // Global Edit Mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Employee data for search
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeError, setEmployeeError] = useState('');

  // Basic Configuration data
  const [basicConfigData, setBasicConfigData] = useState<EmployeeBasicConfig | null>(null);
  const [basicConfigLoading, setBasicConfigLoading] = useState(false);
  const [basicConfigError, setBasicConfigError] = useState('');

  // Group Schedule data
  const [groupSchedules, setGroupSchedules] = useState<GroupSchedule[]>([]);
  const [groupScheduleLoading, setGroupScheduleLoading] = useState(false);

  // Exemptions data
  const [exemptionsData, setExemptionsData] = useState<EmployeeExemptions | null>(null);
  const [exemptionsLoading, setExemptionsLoading] = useState(false);

  // Leave Applications Modal States
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isLeaveEditMode, setIsLeaveEditMode] = useState(false);
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

  const [overtimeHoursApproved, setOvertimeHoursApproved] = useState('');
  const [overtimeActualDateInOTBefore, setOvertimeActualDateInOTBefore] = useState('');
  const [overtimeStartTimeBefore, setOvertimeStartTimeBefore] = useState('');
  const [overtimeStartOvertimeDate, setOvertimeStartOvertimeDate] = useState('');
  const [overtimeStartOvertimeTime, setOvertimeStartOvertimeTime] = useState('');
  const [overtimeApprovedBreak, setOvertimeApprovedBreak] = useState('');
  

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

  // Leave Applications Data
  const [leaveApplicationsData, setLeaveApplicationsData] = useState<LeaveApplication[]>([]);
  const [leaveApplicationsLoading, setLeaveApplicationsLoading] = useState(false);

  // Device Code Data
  const [deviceCodeEntries, setDeviceCodeEntries] = useState<DeviceCode[]>([]);
  const [deviceCodeLoading, setDeviceCodeLoading] = useState(false);
  const [showDeviceCodeModal, setShowDeviceCodeModal] = useState(false);
  const [isDeviceCodeEditMode, setIsDeviceCodeEditMode] = useState(false);
  const [currentDeviceCodeId, setCurrentDeviceCodeId] = useState<number | null>(null);
  const [deviceCode, setDeviceCode] = useState('');
  const [devicePassword, setDevicePassword] = useState('');
  const [deviceEffectivityDate, setDeviceEffectivityDate] = useState('');
  const [deviceExpiryDate, setDeviceExpiryDate] = useState('');

 // Rest Day Data
  const [restDayLoading, setRestDayLoading] = useState(false);
  const [restDayMode, setRestDayMode] = useState<'fixed' | 'variable'>('variable');
  const [restDayFixedData, setRestDayFixedData] = useState<RestDayFixed | null>(null);
  const [restDayVariableData, setRestDayVariableData] = useState<RestDayVariable[]>([]);
  const [showRestDayModal, setShowRestDayModal] = useState(false);
  const [isRestDayEditMode, setIsRestDayEditMode] = useState(false);
  const [currentRestDayId, setCurrentRestDayId] = useState<number | null>(null);
  const [restDayDateFrom, setRestDayDateFrom] = useState('');
  const [restDayDateTo, setRestDayDateTo] = useState('');
  const [restDay1, setRestDay1] = useState('');
  const [restDay2, setRestDay2] = useState('');
  const [restDay3, setRestDay3] = useState('');

// Workshift Data
const [workshiftLoading, setWorkshiftLoading] = useState(false);
const [workshiftMode, setWorkshiftMode] = useState<'fixed' | 'variable'>('variable');
const [workshiftFixedData, setWorkshiftFixedData] = useState<WorkshiftFixed | null>(null);
const [workshiftVariableData, setWorkshiftVariableData] = useState<WorkshiftVariable[]>([]);
const [showWorkshiftModal, setShowWorkshiftModal] = useState(false);
const [isWorkshiftEditMode, setIsWorkshiftEditMode] = useState(false);
const [currentWorkshiftId, setCurrentWorkshiftId] = useState<number | null>(null);
const [workshiftDateFrom, setWorkshiftDateFrom] = useState('');
const [workshiftDateTo, setWorkshiftDateTo] = useState('');
const [workshiftShiftCode, setWorkshiftShiftCode] = useState('');
const [workshiftDailyScheduleCode, setWorkshiftDailyScheduleCode] = useState('');
const [workshiftGLCode, setWorkshiftGLCode] = useState('');
const [fixedDailySched, setFixedDailySched] = useState('');

// Daily Schedule Data
const [dailySchedules, setDailySchedules] = useState<DailySchedule[]>([]);
const [dailyScheduleLoading, setDailyScheduleLoading] = useState(false);
const [showDailyScheduleModal, setShowDailyScheduleModal] = useState(false);

// Classification Data
const [classificationLoading, setClassificationLoading] = useState(false);
const [classificationMode, setClassificationMode] = useState<'fixed' | 'variable'>('variable');
const [classificationFixedData, setClassificationFixedData] = useState<ClassificationFixed | null>(null);
const [classificationVariableData, setClassificationVariableData] = useState<ClassificationVariable[]>([]);
const [showClassificationModal, setShowClassificationModal] = useState(false);
const [isClassificationEditMode, setIsClassificationEditMode] = useState(false);
const [currentClassificationId, setCurrentClassificationId] = useState<number | null>(null);
const [classificationDateFrom, setClassificationDateFrom] = useState('');
const [classificationDateTo, setClassificationDateTo] = useState('');
const [fixedClassCode, setFixedClassCode] = useState('');
const [variableClassCode, setVariableClassCode] = useState('');

  // Overtime Data
  const [overtimeApplicationsData, setOvertimeApplicationsData] = useState<any[]>([]);
  const [overtimeLoading, setOvertimeLoading] = useState(false);

  // Contractual Data
  const [contractualData, setContractualData] = useState<{ id: number; dateFrom: string; dateTo: string }[]>([]);
  const [contractualLoading, setContractualLoading] = useState(false);

  // Suspension Data
  const [suspensionData, setSuspensionData] = useState<{ id: number; dateFrom: string; dateTo: string }[]>([]);
  const [suspensionLoading, setSuspensionLoading] = useState(false);

  // Mock data
  const employeeName = 'Last122, First A';
  const payPeriod = 'Main Monthly';

  // TKS Group Modal States
  const [showTKSGroupModal, setShowTKSGroupModal] = useState(false);
  const [tksGroupSearchTerm, setTksGroupSearchTerm] = useState('');
  const [payrollLocationData, setPayrollLocationData] = useState<PayrollLocation[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
const [overtimeDate, setOvertimeDate] = useState('');
const [overtimeNumOTHoursApproved, setOvertimeNumOTHoursApproved] = useState('');
const [overtimeEarlyOTStartTime, setOvertimeEarlyOTStartTime] = useState('');
const [overtimeEarlyTimeIn, setOvertimeEarlyTimeIn] = useState('');
const [overtimeStartOTPM, setOvertimeStartOTPM] = useState('');
const [overtimeMinHRSOTBreak, setOvertimeMinHRSOTBreak] = useState('');
const [overtimeEarlyOTStartTimeRestHol, setOvertimeEarlyOTStartTimeRestHol] = useState('');
const [overtimeReason, setOvertimeReason] = useState('');
const [overtimeRemarks, setOvertimeRemarks] = useState('');
const [overtimeApprovedOTBreaksHrs, setOvertimeApprovedOTBreaksHrs] = useState('');
const [overtimeStotats, setOvertimeStotats] = useState('');
const [overtimeIsLateFiling, setOvertimeIsLateFiling] = useState(false);
const [overtimeAppliedBeforeShiftDate, setOvertimeAppliedBeforeShiftDate] = useState('');
const [overtimeIsOTBeforeShiftNextDay, setOvertimeIsOTBeforeShiftNextDay] = useState(false);
  // ==================== API FUNCTIONS ====================
  
  const fetchData = async () => {
    setLoading(true);
    try {
        const response = await apiClient.get('/Fs/Process/PayRollLocationSetUp');
        if (response.status === 200 && response.data) {
          console.log('Payroll locations fetched successfully:', response.data);
            setPayrollLocationData(response.data);
        }
    } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to load payroll locations';
        await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
        console.error('Error fetching payroll locations:', error);
    } finally {
        setLoading(false);
    }
  };

  // Fetch Group Schedules
  const fetchGroupSchedules = async () => {
    setGroupScheduleLoading(true);
    try {
      const response = await apiClient.get('/Fs/Process/GroupScheduleSetUp');
      if (response.status === 200 && response.data) {
        setGroupSchedules(response.data);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load group schedules';
      console.error('Error fetching group schedules:', error);
      await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
    } finally {
      setGroupScheduleLoading(false);
    }
  };

  // Fetch Employees for Search Modal
  const fetchEmployees = async () => {
    setEmployeeLoading(true);
    setEmployeeError('');
    try {
      const response = await apiClient.get('/Maintenance/EmployeeMasterFile');
      if (response.status === 200 && response.data) {
        setEmployees(response.data);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load employees';
      setEmployeeError(errorMsg);
      console.error('Error fetching employees:', error);
    } finally {
      setEmployeeLoading(false);
    }
  };

  // Fetch Basic Configuration by Employee Code
  const fetchBasicConfigByEmpCode = async (empCodeParam: string) => {
    if (!empCodeParam) return;
    
    setBasicConfigLoading(true);
    setBasicConfigError('');
    try {
      const response = await apiClient.get('/Maintenance/EmployeeBasicConfiguration', {
        params: { empCode: empCodeParam }
      });
      
      if (response.status === 200 && response.data) {
        if (response.data.items && response.data.items.length > 0) {
          const config = response.data.items[0];
          setBasicConfigData(config);
          setIsCreatingNew(false);
        } else {
          setBasicConfigData(null);
          setIsCreatingNew(true);
        }
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load basic configuration';
      setBasicConfigError(errorMsg);
      console.error('Error fetching basic configuration:', error);
      
      if (error.response?.status === 404) {
        setBasicConfigData(null);
        setIsCreatingNew(true);
      }
    } finally {
      setBasicConfigLoading(false);
    }
  };

  // Fetch Exemptions by Employee Code
 const fetchExemptionsByEmpCode = async (empCodeParam: string) => {
  if (!empCodeParam) return;
  
  setExemptionsLoading(true);
  try {
    const response = await apiClient.get('/Maintenance/EmployeeExemptions');
    
    if (response.status === 200 && response.data) {
      // API returns an array directly
      const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
      
      const found = allItems.find((item: any) =>
        (item.empCode?.trim() || '').toLowerCase() === empCodeParam.trim().toLowerCase()
      );
      
      if (found) {
        console.log(found)
        setExemptionsData(found);
      } else {
        // No record found, initialize defaults for POST
        setExemptionsData({
          id: 0,
          empCode: empCodeParam,
          tardiness: false,
          undertime: false,
          nightDiffBasic: false,
          overtime: false,
          absences: false,
          otherEarnAndAllow: false,
          holidayPay: false,
          unprodWorkHoliday: false
        });
      }
    }
  } catch (error: any) {
    console.error('Error fetching exemptions:', error);
    setExemptionsData({
      id: 0,
      empCode: empCodeParam,
      tardiness: false,
      undertime: false,
      nightDiffBasic: false,
      overtime: false,
      absences: false,
      otherEarnAndAllow: false,
      holidayPay: false,
      unprodWorkHoliday: false
    });
  } finally {
    setExemptionsLoading(false);
  }
};

  // Fetch Leave Applications by Employee Code
 const fetchLeaveApplicationsByEmpCode = async (empCodeParam: string) => {
  if (!empCodeParam) return;

  setLeaveApplicationsLoading(true);
  try {
    // Backend returns all data
    const response = await apiClient.get('/Maintenance/EmployeeLeaveApplication');

    if (response.status === 200 && response.data) {
      // Access the array (assuming response.data is the list or has an .items property)
      const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);

      const filteredAndMapped = allItems
        .filter((item: any) => 
          // .trim() is essential because your sample has "000877    "
          (item.empCode?.trim() || "").toLowerCase() === empCodeParam.trim().toLowerCase()
        )
        .map((item: any) => ({
          // Mapping based on your sample JSON structure
          id: item.id,
          empCode: item.empCode?.trim() ?? '',
          leaveDate: item.date ? new Date(item.date).toLocaleDateString() : 'N/A',
          leaveCode: item.leaveCode?.trim() ?? '',
          hours: item.hoursApprovedNum ?? 0,
          reason: item.reason ?? 'No reason provided',
          remarks: item.remarks ?? '',
          withPay: item.withPay ?? false,
          isLate: item.isLateFiling ?? false,
          // You can add logic to define status if it's not in the JSON
          status: item.hoursApprovedNum > 0 ? "Approved" : "Pending" 
        }));

      setLeaveApplicationsData(filteredAndMapped);
    }
  } catch (error: any) {
    console.error('Error fetching/filtering leave applications:', error);
    setLeaveApplicationsData([]);
  } finally {
    setLeaveApplicationsLoading(false);
  }
};
  // Fetch Device Codes by Employee Code
const fetchDeviceCodeByEmpCode = async (empCodeParam: string) => {
  if (!empCodeParam) return;
  
  setDeviceCodeLoading(true);
  try {
    const response = await apiClient.get('/Maintenance/EmployeeDeviceCode');
    
    if (response.status === 200 && response.data) {
      const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
      
      const filteredData = allItems.filter((item: any) => 
        (item.empCode?.trim() || "").toLowerCase() === empCodeParam.trim().toLowerCase()
      );
      
      setDeviceCodeEntries(filteredData);
    }
  } catch (error: any) {
    console.error('Error fetching device codes:', error);
    setDeviceCodeEntries([]);
  } finally {
    setDeviceCodeLoading(false);
  }
};
// Create Device Code
const createDeviceCode = async (deviceCodeData: Partial<DeviceCode>) => {
  setDeviceCodeLoading(true);
  try {
    const response = await apiClient.post('/Maintenance/EmployeeDeviceCode', deviceCodeData);
    
    if (response.status === 200 || response.status === 201) {
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Device code created successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      await fetchDeviceCodeByEmpCode(empCode);
      setShowDeviceCodeModal(false);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to create device code';
    await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
    throw error;
  } finally {
    setDeviceCodeLoading(false);
  }
};

// Update Device Code
const updateDeviceCode = async (id: number, deviceCodeData: Partial<DeviceCode>) => {
  setDeviceCodeLoading(true);
  try {
    const response = await apiClient.put(`/Maintenance/EmployeeDeviceCode/${id}`, deviceCodeData);
    
    if (response.status === 200 || response.status === 204) {
      await Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Device code updated successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      await fetchDeviceCodeByEmpCode(empCode);
      setShowDeviceCodeModal(false);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to update device code';
    await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
    throw error;
  } finally {
    setDeviceCodeLoading(false);
  }
};

// Delete Device Code
const deleteDeviceCode = async (id: number) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  });

  if (result.isConfirmed) {
    setDeviceCodeLoading(true);
    try {
      const response = await apiClient.delete(`/Maintenance/EmployeeDeviceCode/${id}`);
      
      if (response.status === 200 || response.status === 204) {
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Device code has been deleted.',
          timer: 2000,
          showConfirmButton: false,
        });
        
        await fetchDeviceCodeByEmpCode(empCode);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete device code';
      await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
    } finally {
      setDeviceCodeLoading(false);
    }
  }
};

// Device Code Submit Handler
const handleDeviceCodeSubmit = async () => {
  try {
    const deviceCodeData: Partial<DeviceCode> = {
      empCode: empCode,
      timeInAndOutCode: deviceCode,
      timeInAndOutPass: devicePassword,
      timeInAndOutEffectDate: deviceEffectivityDate,
      timeInAndOutExpiryDate: deviceExpiryDate
    };

    if (isDeviceCodeEditMode && currentDeviceCodeId !== null) {
      await updateDeviceCode(currentDeviceCodeId, deviceCodeData);
    } else {
      await createDeviceCode(deviceCodeData);
    }
  } catch (error) {
    console.error('Error submitting device code:', error);
  }
};
// Fetch Rest Day Fixed
const fetchRestDayFixed = async (empCodeParam: string) => {
  if (!empCodeParam) return;
  
  setRestDayLoading(true);
  try {
    const response = await apiClient.get('/Maintenance/EmployeeRestDay/Fixed');
    
    if (response.status === 200 && response.data) {
      const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
      
      const found = allItems.find((item: any) => 
        (item.empCode?.trim() || "").toLowerCase() === empCodeParam.trim().toLowerCase()
      );
      
      if (found) {
        setRestDayFixedData(found);
        setRestDayMode(found.isFixed === true ? 'fixed' : 'variable');
        console.log(found)
      setRestDay1(found.fixedRestDay1?.trim() ?? '');
setRestDay2(found.fixedRestDay2?.trim() ?? '');
setRestDay3(found.fixedRestDay3?.trim() ?? '');
      }
    }
  } catch (error: any) {
    console.error('Error fetching rest day fixed:', error);
    setRestDayFixedData(null);
  } finally {
    setRestDayLoading(false);
  }
};

// Fetch Rest Day Variable
const fetchRestDayVariable = async (empCodeParam: string) => {
  if (!empCodeParam) return;
  
  setRestDayLoading(true);
  try {
    const response = await apiClient.get('/Maintenance/EmployeeRestDay/Variable');
    
    if (response.status === 200 && response.data) {
      const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
      
      const filteredData = allItems.filter((item: any) => 
        (item.empCode?.trim() || "").toLowerCase() === empCodeParam.trim().toLowerCase()
      );
      
      setRestDayVariableData(filteredData);
    }
  } catch (error: any) {
    console.error('Error fetching rest day variable:', error);
    setRestDayVariableData([]);
  } finally {
    setRestDayLoading(false);
  }
};

// Fetch Both Rest Day Types
const fetchRestDayByEmpCode = async (empCodeParam: string) => {
  await Promise.all([
    fetchRestDayFixed(empCodeParam),
    fetchRestDayVariable(empCodeParam)
  ]);
};

// Save Rest Day Fixed
const saveRestDayFixed = async () => {
  const data: Partial<RestDayFixed> = {
    id: restDayFixedData?.id || 0,
    empCode: empCode,
    fixedRestDay1: restDay1,
    fixedRestDay2: restDay2,
    fixedRestDay3: restDay3,
    isFixed: true
  };

  setRestDayLoading(true);
  try {
    let response;
    if (data.id === 0 || !data.id) {
      response = await apiClient.post('/Maintenance/EmployeeRestDay/Fixed', data);
    } else {
      response = await apiClient.put(`/Maintenance/EmployeeRestDay/Fixed/${data.id}`, data);
    }
    
    if (response.status === 200 || response.status === 201 || response.status === 204) {
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Fixed rest day saved successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      await fetchRestDayFixed(empCode);
      setIsEditMode(false);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to save fixed rest day';
    await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
  } finally {
    setRestDayLoading(false);
  }
};

// Create Rest Day Variable
const createRestDayVariable = async (data: Partial<RestDayVariable>) => {
  setRestDayLoading(true);
  try {
    const response = await apiClient.post('/Maintenance/EmployeeRestDay/Variable', data);
    
    if (response.status === 200 || response.status === 201) {
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Variable rest day created successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      await fetchRestDayVariable(empCode);
      setShowRestDayModal(false);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to create variable rest day';
    await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
  } finally {
    setRestDayLoading(false);
  }
};

// Update Rest Day Variable
const updateRestDayVariable = async (id: number, data: Partial<RestDayVariable>) => {
  setRestDayLoading(true);
  try {
    const response = await apiClient.put(`/Maintenance/EmployeeRestDay/Variable/${id}`, data);
    
    if (response.status === 200 || response.status === 204) {
      await Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Variable rest day updated successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      await fetchRestDayVariable(empCode);
      setShowRestDayModal(false);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to update variable rest day';
    await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
  } finally {
    setRestDayLoading(false);
  }
};

// Delete Rest Day Variable
const deleteRestDayVariable = async (id: number) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  });

  if (result.isConfirmed) {
    setRestDayLoading(true);
    try {
      const response = await apiClient.delete(`/Maintenance/EmployeeRestDay/Variable/${id}`);
      
      if (response.status === 200 || response.status === 204) {
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Variable rest day has been deleted.',
          timer: 2000,
          showConfirmButton: false,
        });
        
        await fetchRestDayVariable(empCode);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete variable rest day';
      await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
    } finally {
      setRestDayLoading(false);
    }
  }
};

// Rest Day Submit Handler
const handleRestDaySubmit = async () => {
  try {
    const data: Partial<RestDayVariable> = {
      empCode: empCode,
      datefrom: restDayDateFrom,
      dateTo: restDayDateTo,
      restDay1: restDay1,
      restDay2: restDay2,
      restDay3: restDay3
    };

    if (isRestDayEditMode && currentRestDayId !== null) {
      await updateRestDayVariable(currentRestDayId, data);
    } else {
      await createRestDayVariable(data);
    }
  } catch (error) {
    console.error('Error submitting rest day:', error);
  }
};

// ==================== DAILY SCHEDULE API FUNCTIONS ====================
const fetchDailySchedules = async () => {
  setDailyScheduleLoading(true);
  try {
    const response = await apiClient.get('/Fs/Process/Dailyschedule');
    if (response.status === 200 && response.data) {
      setDailySchedules(response.data);
    }
  } catch (error: any) {
    console.error('Error fetching daily schedules:', error);
  } finally {
    setDailyScheduleLoading(false);
  }
};

// ==================== WORKSHIFT API FUNCTIONS ====================

// Fetch Workshift Fixed
const fetchWorkshiftFixed = async (empCodeParam: string) => {
  if (!empCodeParam) return;
  
  setWorkshiftLoading(true);
  try {
    const response = await apiClient.get('/Maintenance/EmployeeWorkshiftFixed');
    
    if (response.status === 200 && response.data) {
      const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
      
      const found = allItems.find((item: any) => 
        (item.empCode?.trim() || "").toLowerCase() === empCodeParam.trim().toLowerCase()
      );
      
      if (found) {
        setWorkshiftFixedData(found);
        setWorkshiftMode(found.isFixed === true ? 'fixed' : 'variable');
        setFixedDailySched(found.dailySched || '');
      }
    }
  } catch (error: any) {
    console.error('Error fetching workshift fixed:', error);
    setWorkshiftFixedData(null);
  } finally {
    setWorkshiftLoading(false);
  }
};

// Fetch Workshift Variable
const fetchWorkshiftVariable = async (empCodeParam: string) => {
  if (!empCodeParam) return;
  
  setWorkshiftLoading(true);
  try {
    const response = await apiClient.get('/Maintenance/EmployeeWorkshiftVariable');
    
    if (response.status === 200 && response.data) {
      const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
      
      const filteredData = allItems.filter((item: any) => 
        (item.empCode?.trim() || "").toLowerCase() === empCodeParam.trim().toLowerCase()
      );
      
      setWorkshiftVariableData(filteredData);
    }
  } catch (error: any) {
    console.error('Error fetching workshift variable:', error);
    setWorkshiftVariableData([]);
  } finally {
    setWorkshiftLoading(false);
  }
};

// Fetch Both Workshift Types
const fetchWorkshiftByEmpCode = async (empCodeParam: string) => {
  await Promise.all([
    fetchWorkshiftFixed(empCodeParam),
    fetchWorkshiftVariable(empCodeParam)
  ]);
};

// Save Workshift Fixed
const saveWorkshiftFixed = async () => {
  const data: Partial<WorkshiftFixed> = {
    id: workshiftFixedData?.id || 0,
    empCode: empCode,
    dailySched: fixedDailySched,
    isFixed: true
  };

  setWorkshiftLoading(true);
  try {
    let response;
    if (data.id === 0 || !data.id) {
      response = await apiClient.post('/Maintenance/EmployeeWorkshiftFixed', data);
    } else {
      response = await apiClient.put(`/Maintenance/EmployeeWorkshiftFixed/${data.id}`, data);
    }
    
    if (response.status === 200 || response.status === 201 || response.status === 204) {
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Fixed workshift saved successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      await fetchWorkshiftFixed(empCode);
      setIsEditMode(false);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to save fixed workshift';
    await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
  } finally {
    setWorkshiftLoading(false);
  }
};

// Create Workshift Variable
const createWorkshiftVariable = async (data: Partial<WorkshiftVariable>) => {
  setWorkshiftLoading(true);
  try {
    const response = await apiClient.post('/Maintenance/EmployeeWorkshiftVariable', data);
    
    if (response.status === 200 || response.status === 201) {
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Variable workshift created successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      await fetchWorkshiftVariable(empCode);
      setShowWorkshiftModal(false);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to create variable workshift';
    await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
  } finally {
    setWorkshiftLoading(false);
  }
};

// Update Workshift Variable
const updateWorkshiftVariable = async (id: number, data: Partial<WorkshiftVariable>) => {
  setWorkshiftLoading(true);
  try {
    const response = await apiClient.put(`/Maintenance/EmployeeWorkshiftVariable/${id}`, data);
    
    if (response.status === 200 || response.status === 204) {
      await Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Variable workshift updated successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      await fetchWorkshiftVariable(empCode);
      setShowWorkshiftModal(false);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to update variable workshift';
    await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
  } finally {
    setWorkshiftLoading(false);
  }
};

// Delete Workshift Variable
const deleteWorkshiftVariable = async (id: number) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  });

  if (result.isConfirmed) {
    setWorkshiftLoading(true);
    try {
      const response = await apiClient.delete(`/Maintenance/EmployeeWorkshiftVariable/${id}`);
      
      if (response.status === 200 || response.status === 204) {
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Variable workshift has been deleted.',
          timer: 2000,
          showConfirmButton: false,
        });
        
        await fetchWorkshiftVariable(empCode);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete variable workshift';
      await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
    } finally {
      setWorkshiftLoading(false);
    }
  }
};

// Workshift Submit Handler
const handleWorkshiftSubmit = async () => {
  try {
    const data: Partial<WorkshiftVariable> = {
      empCode: empCode,
      dateFrom: workshiftDateFrom,
      dateTo: workshiftDateTo,
      shiftCode: workshiftShiftCode,
      dailyScheduleCode: workshiftDailyScheduleCode,
      glCode: workshiftGLCode,
      updateDate: new Date().toISOString()
    };

    if (isWorkshiftEditMode && currentWorkshiftId !== null) {
      await updateWorkshiftVariable(currentWorkshiftId, data);
    } else {
      await createWorkshiftVariable(data);
    }
  } catch (error) {
    console.error('Error submitting workshift:', error);
  }
};


// ==================== CLASSIFICATION API FUNCTIONS ====================

// Fetch Classification Fixed
const fetchClassificationFixed = async (empCodeParam: string) => {
  if (!empCodeParam) return;
  
  setClassificationLoading(true);
  try {
    const response = await apiClient.get('/Maintenance/EmployeeClassification/Fixed');  // Updated endpoint
    
    if (response.status === 200 && response.data) {
      const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
      
      const found = allItems.find((item: any) => 
        (item.empCode?.trim() || "").toLowerCase() === empCodeParam.trim().toLowerCase()
      );
      
      if (found) {
        setClassificationFixedData(found);
        setClassificationMode(found.isFixed === true ? 'fixed' : 'variable');
        setFixedClassCode(found.classCode || '');  // Changed from classificationCode
      }
    }
  } catch (error: any) {
    console.error('Error fetching classification fixed:', error);
    setClassificationFixedData(null);
  } finally {
    setClassificationLoading(false);
  }
};

// Fetch Classification Variable
const fetchClassificationVariable = async (empCodeParam: string) => {
  if (!empCodeParam) return;
  
  setClassificationLoading(true);
  try {
    const response = await apiClient.get('/Maintenance/EmployeeClassification/Variable');  // Updated endpoint
    
    if (response.status === 200 && response.data) {
      const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
      
      const filteredData = allItems.filter((item: any) => 
        (item.empCode?.trim() || "").toLowerCase() === empCodeParam.trim().toLowerCase()
      );
      
      setClassificationVariableData(filteredData);
    }
  } catch (error: any) {
    console.error('Error fetching classification variable:', error);
    setClassificationVariableData([]);
  } finally {
    setClassificationLoading(false);
  }
};

// Fetch Both Classification Types
const fetchClassificationByEmpCode = async (empCodeParam: string) => {
  await Promise.all([
    fetchClassificationFixed(empCodeParam),
    fetchClassificationVariable(empCodeParam)
  ]);
};

// Save Classification Fixed
const saveClassificationFixed = async () => {
  const data: Partial<ClassificationFixed> = {
    id: classificationFixedData?.id || 0,
    empCode: empCode,
    classCode: fixedClassCode,  // Changed from classificationCode
    isFixed: true
  };

  setClassificationLoading(true);
  try {
    let response;
    if (data.id === 0 || !data.id) {
      response = await apiClient.post('/Maintenance/EmployeeClassification/Fixed', data);  // Updated endpoint
    } else {
      response = await apiClient.put(`/Maintenance/EmployeeClassification/Fixed/${data.id}`, data);  // Updated endpoint
    }
    
    if (response.status === 200 || response.status === 201 || response.status === 204) {
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Fixed classification saved successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      await fetchClassificationFixed(empCode);
      setIsEditMode(false);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to save fixed classification';
    await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
  } finally {
    setClassificationLoading(false);
  }
};

// Create Classification Variable
const createClassificationVariable = async (data: Partial<ClassificationVariable>) => {
  setClassificationLoading(true);
  try {
    const response = await apiClient.post('/Maintenance/EmployeeClassification/Variable', data);  // Updated endpoint
    
    if (response.status === 200 || response.status === 201) {
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Variable classification created successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      await fetchClassificationVariable(empCode);
      setShowClassificationModal(false);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to create variable classification';
    await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
  } finally {
    setClassificationLoading(false);
  }
};

// Update Classification Variable
const updateClassificationVariable = async (id: number, data: Partial<ClassificationVariable>) => {
  setClassificationLoading(true);
  try {
    const response = await apiClient.put(`/Maintenance/EmployeeClassification/Variable/${id}`, data);  // Updated endpoint
    
    if (response.status === 200 || response.status === 204) {
      await Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Variable classification updated successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      await fetchClassificationVariable(empCode);
      setShowClassificationModal(false);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to update variable classification';
    await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
  } finally {
    setClassificationLoading(false);
  }
};

// Delete Classification Variable
const deleteClassificationVariable = async (id: number) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  });

  if (result.isConfirmed) {
    setClassificationLoading(true);
    try {
      const response = await apiClient.delete(`/Maintenance/EmployeeClassification/Variable/${id}`);  // Updated endpoint
      
      if (response.status === 200 || response.status === 204) {
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Variable classification has been deleted.',
          timer: 2000,
          showConfirmButton: false,
        });
        
        await fetchClassificationVariable(empCode);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete variable classification';
      await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
    } finally {
      setClassificationLoading(false);
    }
  }
};

// Classification Submit Handler
const handleClassificationSubmit = async () => {
  try {
    const data: Partial<ClassificationVariable> = {
      empCode: empCode,
      dateFrom: classificationDateFrom,
      dateTo: classificationDateTo,
      classCode: variableClassCode  // Changed from classificationCode
    };

    if (isClassificationEditMode && currentClassificationId !== null) {
      await updateClassificationVariable(currentClassificationId, data);
    } else {
      await createClassificationVariable(data);
    }
  } catch (error) {
    console.error('Error submitting classification:', error);
  }
};

// Fetch Overtime Applications by Employee Code
const fetchOvertimeApplicationsByEmpCode = async (empCodeParam: string) => {
  if (!empCodeParam) return;
  
  setOvertimeLoading(true);
  try {
    const response = await apiClient.get('/Maintenance/EmployeeOvertimeApplication');
    
    if (response.status === 200 && response.data) {
      const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);

      const filteredData = allItems.filter((item: any) => 
        (item.empCode?.trim() || "").toLowerCase() === empCodeParam.trim().toLowerCase()
      );

      setOvertimeApplicationsData(filteredData);
    }
  } catch (error: any) {
    console.error('Error fetching overtime applications:', error);
    setOvertimeApplicationsData([]);
  } finally {
    setOvertimeLoading(false);
  }
};

// Create Overtime Application
const createOvertimeApplication = async (overtimeData: Partial<OvertimeApplication>) => {
  setOvertimeLoading(true);
  try {
    const response = await apiClient.post('/Maintenance/EmployeeOvertimeApplication', overtimeData);
    
    if (response.status === 200 || response.status === 201) {
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Overtime application created successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      await fetchOvertimeApplicationsByEmpCode(empCode);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to create overtime application';
    
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMsg,
    });
    
    throw error;
  } finally {
    setOvertimeLoading(false);
  }
};

// Update Overtime Application
const updateOvertimeApplication = async (id: number, overtimeData: Partial<OvertimeApplication>) => {
  setOvertimeLoading(true);
  try {
    const response = await apiClient.put(`/Maintenance/EmployeeOvertimeApplication/${id}`, overtimeData);
    
    if (response.status === 200 || response.status === 204) {
      await Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Overtime application updated successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      await fetchOvertimeApplicationsByEmpCode(empCode);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to update overtime application';
    
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMsg,
    });
    
    throw error;
  } finally {
    setOvertimeLoading(false);
  }
};

// Delete Overtime Application
const deleteOvertimeApplication = async (id: number) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  });

  if (result.isConfirmed) {
    setOvertimeLoading(true);
    try {
      const response = await apiClient.delete(`/Maintenance/EmployeeOvertimeApplication/${id}`);
      
      if (response.status === 200 || response.status === 204) {
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Overtime application has been deleted.',
          timer: 2000,
          showConfirmButton: false,
        });
        
        await fetchOvertimeApplicationsByEmpCode(empCode);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete overtime application';
      
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
      });
    } finally {
      setOvertimeLoading(false);
    }
  }
};

// Overtime Submit Handler
const handleOvertimeSubmit = async () => {
  try {
    const overtimeData: Partial<OvertimeApplication> = {
      empCode: empCode,
      date: overtimeDate,
      numOTHoursApproved: parseFloat(overtimeNumOTHoursApproved) || 0,
      earlyOTStartTime: overtimeEarlyOTStartTime,
      earlyTimeIn: overtimeEarlyTimeIn,
      startOTPM: overtimeStartOTPM,
      minHRSOTBreak: parseFloat(overtimeMinHRSOTBreak) || 0,
      earlyOTStartTimeRestHol: overtimeEarlyOTStartTimeRestHol,
      reason: overtimeReason,
      remarks: overtimeRemarks,
      approvedOTBreaksHrs: parseFloat(overtimeApprovedOTBreaksHrs) || 0,
      stotats: overtimeStotats,
      isLateFiling: overtimeIsLateFiling,
      isLateFilingProcessed: false,
      appliedBeforeShiftDate: overtimeAppliedBeforeShiftDate,
      isOTBeforeShiftNextDay: overtimeIsOTBeforeShiftNextDay
    };

    if (isOvertimeEditMode && currentOvertimeId !== null) {
      await updateOvertimeApplication(currentOvertimeId, overtimeData);
    } else {
      await createOvertimeApplication(overtimeData);
    }
    
    setShowOvertimeModal(false);
  } catch (error) {
    console.error('Error submitting overtime application:', error);
  }
};
 // Fetch Contractual by Employee Code
const fetchContractualByEmpCode = async (empCodeParam: string) => {
  if (!empCodeParam) return;
  
  setContractualLoading(true);
  try {
    const response = await apiClient.get('/Maintenance/EmployeeContractual');
    
    if (response.status === 200 && response.data) {
      const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);

      const filteredData = allItems.filter((item: any) => 
        (item.empCode?.trim() || "").toLowerCase() === empCodeParam.trim().toLowerCase()
      );

      setContractualData(filteredData);
    }
  } catch (error: any) {
    console.error('Error fetching contractual records:', error);
    setContractualData([]);
  } finally {
    setContractualLoading(false);
  }
};

// Create Contractual
const createContractual = async (contractualData: Partial<Contractual>) => {
  setContractualLoading(true);
  try {
   const payload = {
      id: 0,
      empCode: contractualData.empCode,
      dateFr: contractualData.dateFr 
        ? new Date(contractualData.dateFr).toISOString()   // ✅ ISO format
        : null,
      dateTo: contractualData.dateTo 
        ? new Date(contractualData.dateTo).toISOString()   // ✅ ISO format
        : null,
    };
    const response = await apiClient.post('/Maintenance/EmployeeContractual', payload);
    
    if (response.status === 200 || response.status === 201) {
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Contractual record created successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      await fetchContractualByEmpCode(empCode);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to create contractual record';
    
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMsg,
    });
    
    throw error;
  } finally {
    setContractualLoading(false);
  }
};

// Update Contractual
const updateContractual = async (id: number, contractualData: Partial<Contractual>) => {
  setContractualLoading(true);
  try {
    const response = await apiClient.put(`/Maintenance/EmployeeContractual/${id}`, contractualData);
    
    if (response.status === 200 || response.status === 204) {
      await Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Contractual record updated successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      await fetchContractualByEmpCode(empCode);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to update contractual record';
    
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMsg,
    });
    
    throw error;
  } finally {
    setContractualLoading(false);
  }
};

// Delete Contractual
const deleteContractual = async (id: number) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  });

  if (result.isConfirmed) {
    setContractualLoading(true);
    try {
      const response = await apiClient.delete(`/Maintenance/EmployeeContractual/${id}`);
      
      if (response.status === 200 || response.status === 204) {
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Contractual record has been deleted.',
          timer: 2000,
          showConfirmButton: false,
        });
        
        await fetchContractualByEmpCode(empCode);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete contractual record';
      
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
      });
    } finally {
      setContractualLoading(false);
    }
  }
};

// Contractual Submit Handler
const handleContractualSubmit = async () => {
  try {
    const contractualData: Partial<Contractual> = {
      empCode: empCode,
      dateFr: contractualDateFrom,   // ✅ matches API field name
      dateTo: contractualDateTo
    };

    if (isContractualEditMode && currentContractualId !== null) {
      await updateContractual(currentContractualId, contractualData);
    } else {
      await createContractual(contractualData);
    }
    
    setShowContractualModal(false);
  } catch (error) {
    console.error('Error submitting contractual:', error);
  }
};

  // Fetch Suspension by Employee Code
const fetchSuspensionByEmpCode = async (empCodeParam: string) => {
  if (!empCodeParam) return;
  
  setSuspensionLoading(true);
  try {
    const response = await apiClient.get('/Maintenance/EmployeeSuspension');
    
    if (response.status === 200 && response.data) {
      const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);

      const filteredData = allItems.filter((item: any) => 
        (item.empCode?.trim() || "").toLowerCase() === empCodeParam.trim().toLowerCase()
      );

      setSuspensionData(filteredData);
    }
  } catch (error: any) {
    console.error('Error fetching suspension records:', error);
    setSuspensionData([]);
  } finally {
    setSuspensionLoading(false);
  }
};

// Create Suspension
const createSuspension = async (suspensionData: Partial<Suspension>) => {
  setSuspensionLoading(true);
  try {
     const payload = {
      id: 0,
      empCode: suspensionData.empCode,
      dateFrom: suspensionData.dateFrom 
        ? new Date(suspensionData.dateFrom).toISOString()  // ✅ ISO format
        : null,
      dateTo: suspensionData.dateTo 
        ? new Date(suspensionData.dateTo).toISOString()    // ✅ ISO format
        : null,
    };
    const response = await apiClient.post('/Maintenance/EmployeeSuspension', payload);
    
    if (response.status === 200 || response.status === 201) {
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Suspension record created successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      await fetchSuspensionByEmpCode(empCode);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to create suspension record';
    
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMsg,
    });
    
    throw error;
  } finally {
    setSuspensionLoading(false);
  }
};

// Update Suspension
const updateSuspension = async (id: number, suspensionData: Partial<Suspension>) => {
  setSuspensionLoading(true);
  try {
    const response = await apiClient.put(`/Maintenance/EmployeeSuspension/${id}`, suspensionData);
    
    if (response.status === 200 || response.status === 204) {
      await Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Suspension record updated successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      await fetchSuspensionByEmpCode(empCode);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to update suspension record';
    
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMsg,
    });
    
    throw error;
  } finally {
    setSuspensionLoading(false);
  }
};

// Delete Suspension
const deleteSuspension = async (id: number) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  });

  if (result.isConfirmed) {
    setSuspensionLoading(true);
    try {
      const response = await apiClient.delete(`/Maintenance/EmployeeSuspension/${id}`);
      
      if (response.status === 200 || response.status === 204) {
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Suspension record has been deleted.',
          timer: 2000,
          showConfirmButton: false,
        });
        
        await fetchSuspensionByEmpCode(empCode);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete suspension record';
      
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
      });
    } finally {
      setSuspensionLoading(false);
    }
  }
};

// Suspension Submit Handler
const handleSuspensionSubmit = async () => {
  try {
    const suspensionData: Partial<Suspension> = {
      empCode: empCode,
      dateFrom: suspensionDateFrom,
      dateTo: suspensionDateTo
    };

    if (isSuspensionEditMode && currentSuspensionId !== null) {
      await updateSuspension(currentSuspensionId, suspensionData);
    } else {
      await createSuspension(suspensionData);
    }
    
    setShowSuspensionModal(false);
  } catch (error) {
    console.error('Error submitting suspension:', error);
  }
};

  // Create Basic Configuration
  const createBasicConfig = async (configData: Partial<EmployeeBasicConfig>) => {
    setBasicConfigLoading(true);
    try {
      const response = await apiClient.post('/Maintenance/EmployeeBasicConfiguration', configData);
      
      if (response.status === 200 || response.status === 201) {
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Basic configuration created successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
        
        await fetchBasicConfigByEmpCode(empCode);
        setIsEditMode(false);
        setIsCreatingNew(false);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create basic configuration';
      
      await Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: errorMsg,
      });
      
      throw error;
    } finally {
      setBasicConfigLoading(false);
    }
  };

  // Update Basic Configuration
  const updateBasicConfig = async (id: number, configData: Partial<EmployeeBasicConfig>) => {
    setBasicConfigLoading(true);
    try {
      const payload = {
      ...configData,
      id: id,  // ✅ ADD THIS - backend requires id in body too
    };
      const response = await apiClient.put(`/Maintenance/EmployeeBasicConfiguration/${id}`, configData);
      
      if (response.status === 200 || response.status === 204) {
        await Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Basic configuration updated successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
        
        await fetchBasicConfigByEmpCode(empCode);
        setIsEditMode(false);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update basic configuration';
      
      await Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: errorMsg,
      });
      
      throw error;
    } finally {
      setBasicConfigLoading(false);
    }
  };

  // Save Exemptions
 const saveExemptions = async () => {
  if (!exemptionsData) return;
  
  setExemptionsLoading(true);
  try {
    let response;
    
    if (exemptionsData.id === 0) {
      // No existing record — POST to create
      response = await apiClient.post('/Maintenance/EmployeeExemptions', exemptionsData);
    } else {
      // Existing record found — PUT by id to avoid duplicate
      response = await apiClient.put(
        `/Maintenance/EmployeeExemptions/${exemptionsData.id}`,
        {
          id: exemptionsData.id,           // ✅ include id in body
          empCode: exemptionsData.empCode,
          tardiness: exemptionsData.tardiness,
          undertime: exemptionsData.undertime,
          nightDiffBasic: exemptionsData.nightDiffBasic,
          overtime: exemptionsData.overtime,
          absences: exemptionsData.absences,
          otherEarnAndAllow: exemptionsData.otherEarnAndAllow,
          holidayPay: exemptionsData.holidayPay,
          unprodWorkHoliday: exemptionsData.unprodWorkHoliday,
        }
      );
    }
    
    if (response.status === 200 || response.status === 201 || response.status === 204) {
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Exemptions saved successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      await fetchExemptionsByEmpCode(empCode);
      setIsEditMode(false);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to save exemptions';
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMsg,
    });
  } finally {
    setExemptionsLoading(false);
  }
};

  // Create Leave Application
  const createLeaveApplication = async (leaveData: Partial<LeaveApplication>) => {
    setLeaveApplicationsLoading(true);
    try {
      const response = await apiClient.post('/Maintenance/EmployeeLeaveApplication', leaveData);
      
      if (response.status === 200 || response.status === 201) {
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Leave application created successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
        
        await fetchLeaveApplicationsByEmpCode(empCode);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create leave application';
      
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
      });
      
      throw error;
    } finally {
      setLeaveApplicationsLoading(false);
    }
  };

  // Update Leave Application
 const updateLeaveApplication = async (id: number, leaveData: Partial<LeaveApplication>) => {
  setLeaveApplicationsLoading(true);
  try {
    // 1. Prepare a clean payload
    const payload = {
      ...leaveData,
      id: id, // Ensure ID is in the body
      // Convert empty strings to null for numeric/ID fields
      balanceID: leaveData.balanceID === "" ? null : leaveData.balanceID,
      // Ensure date is ISO format if backend is strict
      date: leaveData.date ? new Date(leaveData.date).toISOString() : null,
    };

    console.log('Sending Cleaned Payload:', payload);

    const response = await apiClient.put(`/Maintenance/EmployeeLeaveApplication/${id}`, payload);
    
    if (response.status === 200 || response.status === 204) {
      await Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Leave application updated successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      // Use the current empCode to refresh
      await fetchLeaveApplicationsByEmpCode(empCode);
    }
  } catch (error: any) {
    // Log the specific validation errors from the backend
    console.error('Backend Error Details:', error.response?.data?.errors);
    
    const errorMsg = error.response?.data?.message || error.message || 'Failed to update leave application';
    
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMsg,
    });
    
    throw error;
  } finally {
    setLeaveApplicationsLoading(false);
  }
};

  // Delete Leave Application
  const deleteLeaveApplication = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      setLeaveApplicationsLoading(true);
      try {
        const response = await apiClient.delete(`/Maintenance/EmployeeLeaveApplication/${id}`);
        
        if (response.status === 200 || response.status === 204) {
          await Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Leave application has been deleted.',
            timer: 2000,
            showConfirmButton: false,
          });
          
          await fetchLeaveApplicationsByEmpCode(empCode);
        }
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to delete leave application';
        
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg,
        });
      } finally {
        setLeaveApplicationsLoading(false);
      }
    }
  };



  // ==================== Pagination Functions ====================
  
  const filteredPayrollLocations = payrollLocationData.filter(loc =>
    (loc.locCode?.toLowerCase() || '').includes(tksGroupSearchTerm.toLowerCase()) ||
    (loc.locName?.toLowerCase() || '').includes(tksGroupSearchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPayrollLocations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayrollLocations = filteredPayrollLocations.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handleTKSGroupSelect = (locCode: string, locName: string) => {
    setTksGroup(locCode);
    setTksGroupName(locName);
    setShowTKSGroupModal(false);
    setTksGroupSearchTerm('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // ==================== ADAPTED EMPLOYEES FOR SEARCH MODAL ====================

  const adaptedEmployees = useMemo(() => {
    return employees.map(emp => ({
      ...emp,
      name: `${emp.lName}, ${emp.fName}`,
      groupCode: emp.grpCode
    }));
  }, [employees]);

  // ==================== EVENT HANDLERS ====================

  // Handle Employee Search Select
  const handleEmployeeSearchSelect = async (empCodeValue: string, name: string) => {
    try {
      const employee = employees.find(emp => emp.empCode === empCodeValue);
      
      if (!employee) {
        console.error('Employee not found:', empCodeValue);
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Employee not found',
        });
        return;
      }

      setEmpCode(empCodeValue);
      setTksGroup(employee.grpCode);
      setShowSearchModal(false);
      
      // Fetch all employee data
      await Promise.all([
        fetchBasicConfigByEmpCode(empCodeValue),
        fetchExemptionsByEmpCode(empCodeValue),
        fetchLeaveApplicationsByEmpCode(empCodeValue),
        fetchDeviceCodeByEmpCode(empCodeValue),
        fetchRestDayByEmpCode(empCodeValue),
        fetchWorkshiftByEmpCode(empCodeValue),
        fetchClassificationByEmpCode(empCodeValue),
        fetchOvertimeApplicationsByEmpCode(empCodeValue),
        fetchContractualByEmpCode(empCodeValue),
        fetchSuspensionByEmpCode(empCodeValue),
        fetchWorkshiftByEmpCode(empCodeValue),
        fetchClassificationByEmpCode(empCodeValue),
      ]);
    } catch (error) {
      console.error('Error loading employee:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load employee details',
      });
    }
  };

  // Handle Save based on active tab
  const handleSave = async () => {
    try {
      if (!empCode) {
        await Swal.fire({
          icon: 'warning',
          title: 'Warning',
          text: 'Please select an employee first',
        });
        return;
      }

      if (activeTab === 'basic-config') {
        const configData: Partial<EmployeeBasicConfig> = {
          empCode: empCode,
          groupCode: tksGroup,
          groupScheduleCode: basicConfigData?.groupScheduleCode || '',
          allowOTDefault: basicConfigData?.allowOTDefault || false,
          active: basicConfigData?.active ?? true,
          compAllowFrRDExmpOT: basicConfigData?.compAllowFrRDExmpOT || false,
          compAllowFrHolExmpOT: basicConfigData?.compAllowFrHolExmpOT || false,
          timeAttendanceStatus: basicConfigData?.timeAttendanceStatus || false
        };

        if (isCreatingNew || !basicConfigData) {
          await createBasicConfig(configData);
        } else {
          await updateBasicConfig(basicConfigData.id, configData);
        }
      } else if (activeTab === 'exemptions') {
        await saveExemptions();
      }
      else if (activeTab === 'rest-day' && restDayMode === 'fixed') {
      await saveRestDayFixed();
      }// Add these conditions in the handleSave function:
      else if (activeTab === 'workshift' && workshiftMode === 'fixed') {
        await saveWorkshiftFixed();
      }
      else if (activeTab === 'classification' && classificationMode === 'fixed') {
        await saveClassificationFixed();
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    setIsEditMode(false);
    if (empCode) {
      if (activeTab === 'basic-config') {
        fetchBasicConfigByEmpCode(empCode);
      } else if (activeTab === 'exemptions') {
        fetchExemptionsByEmpCode(empCode);
      } else if (activeTab === 'rest-day') {
  fetchRestDayByEmpCode(empCode);
}
// Add these conditions in handleCancel:
else if (activeTab === 'workshift') {
  fetchWorkshiftByEmpCode(empCode);
}
else if (activeTab === 'classification') {
  fetchClassificationByEmpCode(empCode);
}
    }
  };

  // Handle Edit
  const handleEdit = () => {
    setIsEditMode(true);
  };

  // Handle Field Changes for Basic Config
  const handleFieldChange = (field: keyof EmployeeBasicConfig, value: any) => {
    setBasicConfigData(prev => {
      if (!prev) {
        return {
          id: 0,
          empCode: empCode,
          groupCode: tksGroup,
          groupScheduleCode: '',
          allowOTDefault: false,
          active: true,
          compAllowFrRDExmpOT: false,
          compAllowFrHolExmpOT: false,
          timeAttendanceStatus: false,
          [field]: value
        };
      }
      return { ...prev, [field]: value };
    });
  };

  // Handle Exemptions Field Changes
  const handleExemptionChange = (field: keyof EmployeeExemptions, value: boolean) => {
    setExemptionsData(prev => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  // Leave Application Handlers
  const handleLeaveSubmit = async () => {
    try {
      const leaveData: Partial<LeaveApplication> = {
        empCode: empCode,
        date: leaveDate,
        hoursApprovedNum: parseFloat(leaveHoursApproved) || 0,
        leaveCode: leaveCode,
        period: leavePeriod,
        reason: leaveReason,
        remarks: leaveRemarks,
        withPay: leaveWithPay,
        sssNotif: leaveSssNotification,
        isProcSSSNotif: false,
        balanceID: '',
        isLateFiling: leaveIsLateFiling,
        isLateFilingProcessed: false,
        exemptAllowFlag: false
      };

      if (isLeaveEditMode && currentLeaveId !== 0) {
        await updateLeaveApplication(currentLeaveId, leaveData);
      } else {
        await createLeaveApplication(leaveData);
      }
      
      setShowLeaveModal(false);
    } catch (error) {
      console.error('Error submitting leave application:', error);
    }
  };

  const handleLeaveDelete = async (id: number) => {
    await deleteLeaveApplication(id);
  };

  const handleOvertimeDelete = async (id: number) => {
    await deleteOvertimeApplication(id);
  };



  const handleContractualDelete = async (id: number) => {
    await deleteContractual(id);
  };

  const handleSuspensionDelete = async (id: number) => {
    await deleteSuspension(id);
  };

 



  // ==================== USE EFFECTS ====================

  // Load initial data on mount
  useEffect(() => {
  fetchData();
  fetchEmployees();
  fetchGroupSchedules();
  fetchDailySchedules();
  }, []);

  // Load data when empCode or activeTab changes
  useEffect(() => {
    if (empCode) {
      switch (activeTab) {
        case 'basic-config':
          fetchBasicConfigByEmpCode(empCode);
          break;
        case 'exemptions':
          fetchExemptionsByEmpCode(empCode);
          break;
        case 'device-code':
          fetchDeviceCodeByEmpCode(empCode);
          break;
        case 'rest-day':
          fetchRestDayByEmpCode(empCode);
          break;
       // In the existing useEffect for activeTab, add these cases:
        case 'workshift':
          fetchWorkshiftByEmpCode(empCode);
          break;
        case 'classification':
          fetchClassificationByEmpCode(empCode);
          break;
        case 'leave-applications':
          fetchLeaveApplicationsByEmpCode(empCode);
          break;
        case 'overtime-applications':
          fetchOvertimeApplicationsByEmpCode(empCode);
          break;
        case 'contractual':
          fetchContractualByEmpCode(empCode);
          break;
        case 'suspension':
          fetchSuspensionByEmpCode(empCode);
          break;
      }
    }
  }, [empCode, activeTab]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [tksGroupSearchTerm]);

  // Handle ESC key to close modals
  useEffect(() => {
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    if (showSearchModal) {
      setShowSearchModal(false);
    } else if (showTKSGroupModal) {
      setShowTKSGroupModal(false);
    } else if (showGroupScheduleModal) {
      setShowGroupScheduleModal(false);
    } else if (showDeviceCodeModal) {
      setShowDeviceCodeModal(false);
    } else if (showRestDayModal) {
      setShowRestDayModal(false);
    } else if (showOvertimeModal) {
      setShowOvertimeModal(false);
    } else if (showContractualModal) {
      setShowContractualModal(false);
    } else if (showSuspensionModal) {
      setShowSuspensionModal(false);
    }// Add in the ESC key handling:
    else if (showWorkshiftModal) {
      setShowWorkshiftModal(false);
    } else if (showClassificationModal) {
      setShowClassificationModal(false);
    } else if (showDailyScheduleModal) {
      setShowDailyScheduleModal(false);
    }
  }
};
   if (showSearchModal || showTKSGroupModal || showGroupScheduleModal || showDeviceCodeModal || showRestDayModal || showOvertimeModal || showContractualModal || showSuspensionModal) {
  document.addEventListener('keydown', handleEscKey);
}

return () => {
  document.removeEventListener('keydown', handleEscKey);
};
}, [showSearchModal, showTKSGroupModal, showGroupScheduleModal, showDeviceCodeModal, showRestDayModal, showOvertimeModal, showContractualModal, showSuspensionModal]);

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


  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic-config':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {basicConfigLoading ? (
              <div className="text-center py-8">Loading configuration...</div>
            ) : basicConfigError ? (
              <div className="text-center py-8 text-red-600">{basicConfigError}</div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 w-80">GroupScheduleCode</label>
                  <input
                    type="text"
                    value={basicConfigData?.groupScheduleCode || ''}
                    onChange={(e) => handleFieldChange('groupScheduleCode', e.target.value)}
                    disabled
                    className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-pointer"
                    onClick={() => isEditMode && setShowGroupScheduleModal(true)}
                  />
                  {isEditMode && (
                    <button
                      onClick={() => setShowGroupScheduleModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      Browse
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 w-80">AllowOTDefault</label>
                  <input
                    type="checkbox"
                    checked={basicConfigData?.allowOTDefault || false}
                    onChange={(e) => handleFieldChange('allowOTDefault', e.target.checked)}
                    disabled={!isEditMode}
                    className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-gray-700 w-80">Active</label>
                  <input
                    type="checkbox"
                    checked={basicConfigData?.active ?? true}
                    onChange={(e) => handleFieldChange('active', e.target.checked)}
                    disabled={!isEditMode}
                    className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-gray-700 w-80">Worked Rest Day Allowance Not based on Computed OT</label>
                  <input
                    type="checkbox"
                    checked={basicConfigData?.compAllowFrRDExmpOT || false}
                    onChange={(e) => handleFieldChange('compAllowFrRDExmpOT', e.target.checked)}
                    disabled={!isEditMode}
                    className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-gray-700 w-80">Worked Holiday Allowance Not based on Computed OT</label>
                  <input
                    type="checkbox"
                    checked={basicConfigData?.compAllowFrHolExmpOT || false}
                    onChange={(e) => handleFieldChange('compAllowFrHolExmpOT', e.target.checked)}
                    disabled={!isEditMode}
                    className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-gray-700 w-80">TimeAttendanceStatus</label>
                  <input
                    type="checkbox"
                    checked={basicConfigData?.timeAttendanceStatus || false}
                    onChange={(e) => handleFieldChange('timeAttendanceStatus', e.target.checked)}
                    disabled={!isEditMode}
                    className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                  />
                </div>

                {isCreatingNew && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      No configuration found for this employee. Click Save to create a new configuration.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'exemptions':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {exemptionsLoading ? (
              <div className="text-center py-8">Loading exemptions...</div>
            ) : (
              <div className="grid grid-cols-2 gap-x-24 gap-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exemptionsData?.tardiness || false}
                    onChange={(e) => handleExemptionChange('tardiness', e.target.checked)}
                    disabled={!isEditMode}
                    className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                  />
                  <label className="text-gray-700">Tardiness</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exemptionsData?.absences || false}
                    onChange={(e) => handleExemptionChange('absences', e.target.checked)}
                    disabled={!isEditMode}
                    className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                  />
                  <label className="text-gray-700">Absences</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exemptionsData?.undertime || false}
                    onChange={(e) => handleExemptionChange('undertime', e.target.checked)}
                    disabled={!isEditMode}
                    className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                  />
                  <label className="text-gray-700">Undertime</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exemptionsData?.otherEarnAndAllow || false}
                    onChange={(e) => handleExemptionChange('otherEarnAndAllow', e.target.checked)}
                    disabled={!isEditMode}
                    className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                  />
                  <label className="text-gray-700">Other Earn And Allowance</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exemptionsData?.nightDiffBasic || false}
                    onChange={(e) => handleExemptionChange('nightDiffBasic', e.target.checked)}
                    disabled={!isEditMode}
                    className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                  />
                  <label className="text-gray-700">Night Diff Basic</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exemptionsData?.holidayPay || false}
                    onChange={(e) => handleExemptionChange('holidayPay', e.target.checked)}
                    disabled={!isEditMode}
                    className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                  />
                  <label className="text-gray-700">HolidayPay</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exemptionsData?.overtime || false}
                    onChange={(e) => handleExemptionChange('overtime', e.target.checked)}
                    disabled={!isEditMode}
                    className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                  />
                  <label className="text-gray-700">Overtime</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exemptionsData?.unprodWorkHoliday || false}
                    onChange={(e) => handleExemptionChange('unprodWorkHoliday', e.target.checked)}
                    disabled={!isEditMode}
                    className="w-4 h-4 accent-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-100"
                  />
                  <label className="text-gray-700">Unproductive Work Holiday</label>
                </div>
              </div>
            )}
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
                {leaveApplicationsLoading ? (
                  <div className="text-center py-8">Loading leave applications...</div>
                ) : (
                  <>
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-gray-700">Date</th>
                          <th className="px-6 py-3 text-left text-gray-700">Hours Approved</th>
                          <th className="px-6 py-3 text-left text-gray-700">Leave Code</th>
                          <th className="px-6 py-3 text-left text-gray-700">Period</th>
                          <th className="px-6 py-3 text-left text-gray-700">Reason</th>
                          <th className="px-6 py-3 text-left text-gray-700">Remarks</th>
                          <th className="px-6 py-3 text-left text-gray-700">With Pay</th>
                          <th className="px-6 py-3 text-left text-gray-700">SSS Notification</th>
                          <th className="px-6 py-3 text-left text-gray-700">Late Filing</th>
                          <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaveApplicationsData.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                              No leave applications found
                            </td>
                          </tr>
                        ) : (
                          leaveApplicationsData.map((entry) => (
                            <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-6 py-3 text-gray-900">{new Date(entry.date).toLocaleDateString()}</td>
                              <td className="px-6 py-3 text-gray-900">{entry.hoursApprovedNum}</td>
                              <td className="px-6 py-3 text-gray-900">{entry.leaveCode}</td>
                              <td className="px-6 py-3 text-gray-900">{entry.period}</td>
                              <td className="px-6 py-3 text-gray-900">{entry.reason}</td>
                              <td className="px-6 py-3 text-gray-900">{entry.remarks}</td>
                              <td className="px-6 py-3 text-gray-900">{entry.withPay ? 'Yes' : 'No'}</td>
                              <td className="px-6 py-3 text-gray-900">{entry.sssNotif ? 'Yes' : 'No'}</td>
                              <td className="px-6 py-3 text-gray-900">{entry.isLateFiling ? 'Yes' : 'No'}</td>
                              <td className="px-6 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  <button 
                             onClick={() => {
                              // 1. Safe Date Parsing
                              const rawDate = entry.date ? new Date(entry.date) : null;
                              const isValidDate = rawDate && !isNaN(rawDate.getTime());
                              
                              // 2. Set State Safely
                              setIsLeaveEditMode(true);
                              setCurrentLeaveId(entry.id);
                              
                              // Use the validated date or fallback to an empty string (or today's date)
                              setLeaveDate(isValidDate ? rawDate.toISOString().split('T')[0] : "");
                              
                              // Use Optional Chaining and Nullish Coalescing for everything else
                              setLeaveHoursApproved(entry.hoursApprovedNum?.toString() ?? "0");
                              setLeaveCode(entry.leaveCode?.trim() ?? ""); // Trim spaces like in your sample data
                              setLeavePeriod(entry.period ?? "");
                              setLeaveReason(entry.reason ?? "");
                              setLeaveRemarks(entry.remarks ?? "");
                              setLeaveWithPay(entry.withPay ?? false);
                              setLeaveSssNotification(entry.sssNotif ?? false);
                              setLeaveIsLateFiling(entry.isLateFiling ?? false);
                              
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
                          ))
                        )}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </div>
          </div>
        );

   // ============================================
// REPLACE THE 'device-code' CASE IN renderTabContent()
// ============================================

case 'device-code':
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {deviceCodeLoading ? (
        <div className="text-center py-8">Loading device codes...</div>
      ) : (
        <div className="space-y-6">
          {/* Add Button */}
          <div>
            <button 
              onClick={() => {
                setIsDeviceCodeEditMode(false);
                setCurrentDeviceCodeId(null);
                setDeviceCode('');
                setDevicePassword('');
                setDeviceEffectivityDate('');
                setDeviceExpiryDate('');
                setShowDeviceCodeModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Date From</th>
                  <th className="px-6 py-3 text-left text-gray-700">Date To</th>
                  <th className="px-6 py-3 text-left text-gray-700">Code</th>
                  <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deviceCodeEntries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No device codes found
                    </td>
                  </tr>
                ) : (
                  deviceCodeEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-900">
                        {entry.timeInAndOutEffectDate ? new Date(entry.timeInAndOutEffectDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-3 text-gray-900">
                        {entry.timeInAndOutExpiryDate ? new Date(entry.timeInAndOutExpiryDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-3 text-gray-900">{entry.timeInAndOutCode}</td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setIsDeviceCodeEditMode(true);
                              setCurrentDeviceCodeId(entry.id);
                              setDeviceCode(entry.timeInAndOutCode || '');
                              setDevicePassword(entry.timeInAndOutPass || '');
                              setDeviceEffectivityDate(
                                entry.timeInAndOutEffectDate 
                                  ? new Date(entry.timeInAndOutEffectDate).toISOString().split('T')[0] 
                                  : ''
                              );
                              setDeviceExpiryDate(
                                entry.timeInAndOutExpiryDate 
                                  ? new Date(entry.timeInAndOutExpiryDate).toISOString().split('T')[0] 
                                  : ''
                              );
                              setShowDeviceCodeModal(true);
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <span className="text-gray-300">|</span>
                          <button 
                            onClick={() => deleteDeviceCode(entry.id)}
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
          </div>
        </div>
      )}
    </div>
  );

// ============================================
// REPLACE THE 'rest-day' CASE IN renderTabContent()
// ============================================

case 'rest-day':
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {restDayLoading ? (
        <div className="text-center py-8">Loading rest days...</div>
      ) : (
        <div className="space-y-6">
          {/* Fixed Mode */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="rest-day-fixed"
                checked={restDayMode === 'fixed'}
                onChange={() => setRestDayMode('fixed')}
                disabled={!isEditMode}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed"
              />
              <label htmlFor="rest-day-fixed" className="text-gray-700">Fixed</label>
            </div>
            
            {restDayMode === 'fixed' && (
              <div className="ml-7 bg-gray-50 rounded-lg border border-gray-200 p-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <label className="text-gray-700 w-24">Rest Day 1</label>
                    <select
                      value={restDay1}
                      onChange={(e) => setRestDay1(e.target.value)}
                      disabled={!isEditMode}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Day</option>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-gray-700 w-24">Rest Day 2</label>
                    <select
                      value={restDay2}
                      onChange={(e) => setRestDay2(e.target.value)}
                      disabled={!isEditMode}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Day</option>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-gray-700 w-24">Rest Day 3</label>
                    <select
                      value={restDay3}
                      onChange={(e) => setRestDay3(e.target.value)}
                      disabled={!isEditMode}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Day</option>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Variable Mode */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="rest-day-variable"
                checked={restDayMode === 'variable'}
                onChange={() => setRestDayMode('variable')}
                disabled={!isEditMode}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed"
              />
              <label htmlFor="rest-day-variable" className="text-gray-700">Variable</label>
            </div>
            
            {restDayMode === 'variable' && (
              <div className="ml-7 space-y-4">
                {/* Add Button */}
                <div>
                  <button 
                    onClick={() => {
                      setIsRestDayEditMode(false);
                      setCurrentRestDayId(null);
                      setRestDayDateFrom('');
                      setRestDayDateTo('');
                      setRestDay1('');
                      setRestDay2('');
                      setRestDay3('');
                      setShowRestDayModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                {/* Variable Rest Day Table */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-gray-700">From</th>
                        <th className="px-6 py-3 text-left text-gray-700">To</th>
                        <th className="px-6 py-3 text-left text-gray-700">Rest Day 1</th>
                        <th className="px-6 py-3 text-left text-gray-700">Rest Day 2</th>
                        <th className="px-6 py-3 text-left text-gray-700">Rest Day 3</th>
                        <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restDayVariableData.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            No variable rest day records found
                          </td>
                        </tr>
                      ) : (
                        restDayVariableData.map((entry) => (
                          <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-3 text-gray-900">
                              {entry.datefrom ? new Date(entry.datefrom).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-3 text-gray-900">
                              {entry.dateTo ? new Date(entry.dateTo).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-3 text-gray-900">{entry.restDay1}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.restDay2}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.restDay3}</td>
                            <td className="px-6 py-3">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    setIsRestDayEditMode(true);
                                    setCurrentRestDayId(entry.id);
                                    setRestDayDateFrom(
                                      entry.datefrom 
                                        ? new Date(entry.datefrom).toISOString().split('T')[0] 
                                        : ''
                                    );
                                    setRestDayDateTo(
                                      entry.dateTo 
                                        ? new Date(entry.dateTo).toISOString().split('T')[0] 
                                        : ''
                                    );
                                    setRestDay1(entry.restDay1 || '');
                                    setRestDay2(entry.restDay2 || '');
                                    setRestDay3(entry.restDay3 || '');
                                    setShowRestDayModal(true);
                                  }}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <span className="text-gray-300">|</span>
                                <button 
                                  onClick={() => deleteRestDayVariable(entry.id)}
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
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );



   case 'workshift':
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {workshiftLoading ? (
        <div className="text-center py-8">Loading workshifts...</div>
      ) : (
        <div className="space-y-6">
          {/* Fixed Mode */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="workshift-fixed"
                checked={workshiftMode === 'fixed'}
                onChange={() => setWorkshiftMode('fixed')}
                disabled={!isEditMode}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed"
              />
              <label htmlFor="workshift-fixed" className="text-gray-700">Fixed</label>
            </div>
            
            {workshiftMode === 'fixed' && (
              <div className="ml-7 bg-gray-50 rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 max-w-md">
                  <label className="text-gray-700 w-32">Daily Schedule</label>
                  <input
                    type="text"
                    value={fixedDailySched}
                    disabled
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-pointer"
                    onClick={() => isEditMode && setShowDailyScheduleModal(true)}
                  />
                  {isEditMode && (
                    <button
                      onClick={() => setShowDailyScheduleModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      Search
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Variable Mode */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="workshift-variable"
                checked={workshiftMode === 'variable'}
                onChange={() => setWorkshiftMode('variable')}
                disabled={!isEditMode}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed"
              />
              <label htmlFor="workshift-variable" className="text-gray-700">Variable</label>
            </div>
            
            {workshiftMode === 'variable' && (
              <div className="ml-7 space-y-4">
                {/* Add Button */}
                <div>
                  <button 
                    onClick={() => {
                      setIsWorkshiftEditMode(false);
                      setCurrentWorkshiftId(null);
                      setWorkshiftDateFrom('');
                      setWorkshiftDateTo('');
                      setWorkshiftShiftCode('');
                      setWorkshiftDailyScheduleCode('');
                      setWorkshiftGLCode('');
                      setShowWorkshiftModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                {/* Variable Workshift Table */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-gray-700">Date From</th>
                        <th className="px-6 py-3 text-left text-gray-700">Date To</th>
                        <th className="px-6 py-3 text-left text-gray-700">Shift Code</th>
                        <th className="px-6 py-3 text-left text-gray-700">Daily Schedule Code</th>
                        <th className="px-6 py-3 text-left text-gray-700">GL Code</th>
                        <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workshiftVariableData.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            No variable workshift records found
                          </td>
                        </tr>
                      ) : (
                        workshiftVariableData.map((entry) => (
                          <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-3 text-gray-900">
                              {entry.dateFrom ? new Date(entry.dateFrom).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-3 text-gray-900">
                              {entry.dateTo ? new Date(entry.dateTo).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-3 text-gray-900">{entry.shiftCode}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.dailyScheduleCode}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.glCode}</td>
                            <td className="px-6 py-3">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    setIsWorkshiftEditMode(true);
                                    setCurrentWorkshiftId(entry.id);
                                    setWorkshiftDateFrom(
                                      entry.dateFrom 
                                        ? new Date(entry.dateFrom).toISOString().split('T')[0] 
                                        : ''
                                    );
                                    setWorkshiftDateTo(
                                      entry.dateTo 
                                        ? new Date(entry.dateTo).toISOString().split('T')[0] 
                                        : ''
                                    );
                                    setWorkshiftShiftCode(entry.shiftCode || '');
                                    setWorkshiftDailyScheduleCode(entry.dailyScheduleCode || '');
                                    setWorkshiftGLCode(entry.glCode || '');
                                    setShowWorkshiftModal(true);
                                  }}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <span className="text-gray-300">|</span>
                                <button 
                                  onClick={() => deleteWorkshiftVariable(entry.id)}
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
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

case 'classification':
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {classificationLoading ? (
        <div className="text-center py-8">Loading classifications...</div>
      ) : (
        <div className="space-y-6">
          {/* Fixed Mode */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="classification-fixed"
                checked={classificationMode === 'fixed'}
                onChange={() => setClassificationMode('fixed')}
                disabled={!isEditMode}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed"
              />
              <label htmlFor="classification-fixed" className="text-gray-700">Fixed</label>
            </div>
            
            {classificationMode === 'fixed' && (
              <div className="ml-7 bg-gray-50 rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 max-w-md">
                  <label className="text-gray-700 w-40">Classification Code</label>
                  <input
                    type="text"
                    value={fixedClassCode}
                    onChange={(e) => setFixedClassCode(e.target.value)}
                    disabled={!isEditMode}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Variable Mode */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="classification-variable"
                checked={classificationMode === 'variable'}
                onChange={() => setClassificationMode('variable')}
                disabled={!isEditMode}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed"
              />
              <label htmlFor="classification-variable" className="text-gray-700">Variable</label>
            </div>
            
            {classificationMode === 'variable' && (
              <div className="ml-7 space-y-4">
                {/* Add Button */}
                <div>
                  <button 
                    onClick={() => {
                      setIsClassificationEditMode(false);
                      setCurrentClassificationId(null);
                      setClassificationDateFrom('');
                      setClassificationDateTo('');
                      setVariableClassCode('');
                      setShowClassificationModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                {/* Variable Classification Table */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-gray-700">Date From</th>
                        <th className="px-6 py-3 text-left text-gray-700">Date To</th>
                        <th className="px-6 py-3 text-left text-gray-700">Classification Code</th>
                        <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classificationVariableData.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                            No variable classification records found
                          </td>
                        </tr>
                      ) : (
                        classificationVariableData.map((entry) => (
                          <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-3 text-gray-900">
                              {entry.dateFrom ? new Date(entry.dateFrom).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-3 text-gray-900">
                              {entry.dateTo ? new Date(entry.dateTo).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-3 text-gray-900">{entry.classCode}</td>
                            <td className="px-6 py-3">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    setIsClassificationEditMode(true);
                                    setCurrentClassificationId(entry.id);
                                    setClassificationDateFrom(
                                      entry.dateFrom 
                                        ? new Date(entry.dateFrom).toISOString().split('T')[0] 
                                        : ''
                                    );
                                    setClassificationDateTo(
                                      entry.dateTo 
                                        ? new Date(entry.dateTo).toISOString().split('T')[0] 
                                        : ''
                                    );
                                    setVariableClassCode(entry.classCode || '');
                                    setShowClassificationModal(true);
                                  }}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <span className="text-gray-300">|</span>
                                <button 
                                  onClick={() => deleteClassificationVariable(entry.id)}
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
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
      case 'overtime-applications':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-6">
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

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {overtimeLoading ? (
                  <div className="text-center py-8">Loading overtime applications...</div>
                ) : (
                  <>
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-gray-700">Date</th>
                          <th className="px-6 py-3 text-left text-gray-700">Hours Approved</th>
                          <th className="px-6 py-3 text-left text-gray-700">Start Time OT Before</th>
                          <th className="px-6 py-3 text-left text-gray-700">Approved OT Break</th>
                          <th className="px-6 py-3 text-left text-gray-700">Reason</th>
                          <th className="px-6 py-3 text-left text-gray-700">Remarks</th>
                          <th className="px-6 py-3 text-left text-gray-700">Late Filing</th>
                          <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overtimeApplicationsData.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                              No overtime applications found
                            </td>
                          </tr>
                        ) : (
                          overtimeApplicationsData.map((entry) => (
                            <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-6 py-3 text-gray-900">{entry.date}</td>
                              <td className="px-6 py-3 text-gray-900">{entry.hoursApproved}</td>
                              <td className="px-6 py-3 text-gray-900">{entry.startTimeOTBefore}</td>
                              <td className="px-6 py-3 text-gray-900">{entry.approvedOTBreak}</td>
                              <td className="px-6 py-3 text-gray-900">{entry.reason}</td>
                              <td className="px-6 py-3 text-gray-900">{entry.remarks}</td>
                              <td className="px-6 py-3 text-gray-900">{entry.isLateFiling ? 'Yes' : 'No'}</td>
                              <td className="px-6 py-3">
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => {
                                      setIsOvertimeEditMode(true);
                                      setCurrentOvertimeId(entry.id);
                                      setOvertimeDate(entry.date);
                                      setOvertimeHoursApproved(entry.hoursApproved);
                                      setOvertimeActualDateInOTBefore(entry.actualDateInOTBefore);
                                      setOvertimeStartTimeBefore(entry.startTimeOTBefore);
                                      setOvertimeStartOvertimeDate(entry.startOvertimeDate);
                                      setOvertimeStartOvertimeTime(entry.startOvertimeTime);
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
                          ))
                        )}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 'contractual':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-6">
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

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {contractualLoading ? (
                  <div className="text-center py-8">Loading contractual records...</div>
                ) : (
                  <>
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-gray-700">Date From</th>
                          <th className="px-6 py-3 text-left text-gray-700">Date To</th>
                          <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contractualData.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                              No contractual records found
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
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 'suspension':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-6">
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

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {suspensionLoading ? (
                  <div className="text-center py-8">Loading suspension records...</div>
                ) : (
                  <>
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-gray-700">Date From</th>
                          <th className="px-6 py-3 text-left text-gray-700">Date To</th>
                          <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {suspensionData.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                              No suspension records found
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
                  </>
                )}
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
                    <div className="flex items-center gap-2">
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
                        onClick={handleEdit}
                        disabled={!empCode || (!basicConfigData && !isCreatingNew && activeTab === 'basic-config') || (activeTab === 'exemptions' && !exemptionsData)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={handleSave}
                          disabled={basicConfigLoading || exemptionsLoading}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {(basicConfigLoading || exemptionsLoading) ? 'Saving...' : 'Save'}
                        </button>
                        <button 
                          onClick={handleCancel}
                          disabled={basicConfigLoading || exemptionsLoading}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
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
              <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <label className="text-gray-700 font-bold w-32 flex-shrink-0">TKS Group</label>
                    <div 
                      onClick={() => setShowTKSGroupModal(true)}
                      className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      {tksGroup ? (
                        <span className="text-sm font-medium text-gray-900 truncate block">{tksGroup}</span>
                      ) : (
                        <span className="text-gray-400 text-sm">Select...</span>
                      )}
                    </div>
                    <button 
                      onClick={() => setShowTKSGroupModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 flex-shrink-0"
                    >
                      <Search className="w-4 h-4" />
                      Browse
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-gray-700 font-bold w-32 flex-shrink-0">Location Name</label>
                    <input
                      type="text"
                      value={tksGroupName}
                      disabled
                      placeholder="Auto-filled from selection"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-gray-700 font-bold w-32 flex-shrink-0">EmpCode</label>
                    <input
                      type="text"
                      value={empCode}
                      onChange={(e) => setEmpCode(e.target.value)}
                      disabled
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                    />
                    <button 
                      onClick={() => setShowSearchModal(true)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 flex-shrink-0"
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

            {/* TKS Group Modal */}
            {showTKSGroupModal && (
              <>
                <div 
                  className="fixed inset-0 bg-black/50 z-40"
                  onClick={() => setShowTKSGroupModal(false)}
                ></div>

                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-3xl max-h-[90vh] overflow-hidden">
                    <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                      <h2 className="text-gray-800 text-sm">Select TKS Group</h2>
                      <button 
                        onClick={() => setShowTKSGroupModal(false)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-3 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 50px)' }}>
                      <h3 className="text-blue-600 mb-2 text-sm">Payroll Location</h3>

                      <div className="flex items-center gap-2 mb-3">
                        <label className="text-gray-700 text-sm">Search:</label>
                        <input
                          type="text"
                          value={tksGroupSearchTerm}
                          onChange={(e) => setTksGroupSearchTerm(e.target.value)}
                          placeholder="Search by code or name..."
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      {loading ? (
                        <div className="text-center py-8 text-gray-500">
                          Loading payroll locations...
                        </div>
                      ) : (
                        <>
                          <div className="border border-gray-200 rounded overflow-hidden">
                            <table className="w-full border-collapse text-sm">
                              <thead className="bg-white">
                                <tr className="bg-gray-100 border-b-2 border-gray-300">
                                  <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Location Code</th>
                                  <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Location Name</th>
                                  <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Company Code</th>
                                </tr>
                              </thead>
                              <tbody>
                                {currentPayrollLocations.length === 0 ? (
                                  <tr>
                                    <td colSpan={3} className="px-3 py-8 text-center text-gray-500">
                                      No payroll locations found
                                    </td>
                                  </tr>
                                ) : (
                                  currentPayrollLocations.map((loc) => (
                                    <tr 
                                      key={loc.id}
                                      className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                                      onClick={() => handleTKSGroupSelect(loc.locCode, loc.locName)}
                                    >
                                      <td className="px-3 py-1.5">{loc.locCode}</td>
                                      <td className="px-3 py-1.5">{loc.locName}</td>
                                      <td className="px-3 py-1.5">{loc.companyCode}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="text-gray-600 text-xs">
                              Showing {filteredPayrollLocations.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredPayrollLocations.length)} of {filteredPayrollLocations.length} entries
                            </div>
                            <div className="flex gap-1">
                              <button 
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Previous
                              </button>
                              
                              {getPageNumbers().map((page, index) => (
                                typeof page === 'number' ? (
                                  <button
                                    key={index}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-2 py-1 rounded text-xs ${
                                      currentPage === page
                                        ? 'bg-blue-600 text-white'
                                        : 'border border-gray-300 hover:bg-gray-100'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                ) : (
                                  <span key={index} className="px-2 py-1 text-xs text-gray-500">
                                    {page}
                                  </span>
                                )
                              ))}
                              
                              <button 
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Tab Content */}
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Employee Search Modal */}
      <EmployeeSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelect={handleEmployeeSearchSelect}
        employees={adaptedEmployees}
        loading={employeeLoading}
        error={employeeError}
      />

      {/* Group Schedule Search Modal */}
      <GroupScheduleSearchModal
        isOpen={showGroupScheduleModal}
        onClose={() => setShowGroupScheduleModal(false)}
        onSelect={(code) => handleFieldChange('groupScheduleCode', code)}
        groupSchedules={groupSchedules}
        loading={groupScheduleLoading}
      />

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
{/* Device Code Modal */}
<DeviceCodeModal
  isOpen={showDeviceCodeModal}
  isEditMode={isDeviceCodeEditMode}
  empCode={empCode}
  code={deviceCode}
  password={devicePassword}
  effectivityDate={deviceEffectivityDate}
  expiryDate={deviceExpiryDate}
  onClose={() => setShowDeviceCodeModal(false)}
  onCodeChange={setDeviceCode}
  onPasswordChange={setDevicePassword}
  onEffectivityDateChange={setDeviceEffectivityDate}
  onExpiryDateChange={setDeviceExpiryDate}
  onSubmit={handleDeviceCodeSubmit}
/>

{/* Rest Day Variable Modal */}
<RestDayVariableModal
  isOpen={showRestDayModal}
  isEditMode={isRestDayEditMode}
  empCode={empCode}
  dateFrom={restDayDateFrom}
  dateTo={restDayDateTo}
  restDay1={restDay1}
  restDay2={restDay2}
  restDay3={restDay3}
  onClose={() => setShowRestDayModal(false)}
  onDateFromChange={setRestDayDateFrom}
  onDateToChange={setRestDayDateTo}
  onRestDay1Change={setRestDay1}
  onRestDay2Change={setRestDay2}
  onRestDay3Change={setRestDay3}
  onSubmit={handleRestDaySubmit}
/>
{/* Daily Schedule Search Modal */}
<DailyScheduleSearchModal
  isOpen={showDailyScheduleModal}
  onClose={() => setShowDailyScheduleModal(false)}
  onSelect={(referenceNo) => setFixedDailySched(referenceNo)}
  dailySchedules={dailySchedules}
  loading={dailyScheduleLoading}
/>

{/* Workshift Variable Modal */}
<WorkshiftVariableModal
  isOpen={showWorkshiftModal}
  isEditMode={isWorkshiftEditMode}
  empCode={empCode}
  dateFrom={workshiftDateFrom}
  dateTo={workshiftDateTo}
  shiftCode={workshiftShiftCode}
  dailyScheduleCode={workshiftDailyScheduleCode}
  glCode={workshiftGLCode}
  onClose={() => setShowWorkshiftModal(false)}
  onDateFromChange={setWorkshiftDateFrom}
  onDateToChange={setWorkshiftDateTo}
  onShiftCodeChange={setWorkshiftShiftCode}
  onDailyScheduleCodeChange={setWorkshiftDailyScheduleCode}
  onGLCodeChange={setWorkshiftGLCode}
  onSubmit={handleWorkshiftSubmit}
/>

{/* Classification Variable Modal */}
// Update the modal import at the end (before Footer)
<ClassificationVariableModal
  isOpen={showClassificationModal}
  isEditMode={isClassificationEditMode}
  empCode={empCode}
  dateFrom={classificationDateFrom}
  dateTo={classificationDateTo}
  classificationCode={variableClassCode}  // This stays the same in props
  onClose={() => setShowClassificationModal(false)}
  onDateFromChange={setClassificationDateFrom}
  onDateToChange={setClassificationDateTo}
  onClassificationCodeChange={setVariableClassCode}  // This stays the same in props
  onSubmit={handleClassificationSubmit}
/>
      <Footer />
    </div>
  );
}