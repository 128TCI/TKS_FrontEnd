import { useState, useEffect } from 'react';
import React from 'react';
import { Calendar, Search, X, FileText, Printer, Check, Clock, Users, Building2, Briefcase, Award, Network, Grid } from 'lucide-react';
import { CalendarPopover } from '../CalendarPopover';
import apiClient, { getLoggedInUsername} from '../../services/apiClient';
import { Footer } from '../Footer/Footer';
import Swal from 'sweetalert2';

type TabType = 'tk-group' | 'branch' | 'department' | 'designation' | 'division' | 'section';

interface GroupItem {
  id: number;
  code: string;
  description: string;
}

interface ReportFilter {
  empCode: string
  dateFr: string
  dateTo: string
  groups: string []
  departments: string []
  divisions:string []
  branch: string []
  designation: string []
  section: string []
  company: string | null
  address: string | null
  userName: string
  mode: string
  activeInActiveAll: string
  include: boolean
  option: number
  consecutiveAbsences: number
  yearsOfService: number
  minutes: number
  weekName: string
  dayType: string
  noOfFilter: number
  userGroup: string
  includeWithPay: boolean
  includeWithoutPay: boolean
  otCode: string []
  workShiftCode: string 
  instance: number
  instanceCount: number
  instanceMinutes: number
  optionTardy: number
}

interface TardinessFilter {
  empCode: string
  year: number
  month: number
  cutOffDateFrom: string
  cutOffDateTo: string
  groups: string []
  departments: string []
  divisions:string []
  branch: string []
  designation: string []
  section: string []
  activeInActiveAll: string
}

interface ExemptionReportFilter {
  empCode: string
  groups: string []
  departments: string []
  divisions:string []
  branch: string []
  designation: string []
  section: string []
  tardiness: boolean
  undertime: boolean
  nightDiffBasic: boolean
  overtime: boolean
  absences: boolean
  otherEarnAllow: boolean
  holidayPay: boolean
  activeInActiveAll: string
}

interface IncompleteLogsFilter {
  empCode: string
  dateFr: string
  dateTo: string
  groups: string []
  departments: string []
  divisions:string []
  branch: string []
  company: string 
  address: string
  designation: string []
  section: string []
  logs: boolean
  break1: boolean
  break2: boolean
  break3: boolean
  activeInActiveAll: string
}

interface LeaveAbsencesFilter {
  empCode: string
  dateFr: string
  dateTo: string
  groups: string []
  departments: string []
  divisions:string []
  branch: string []
  designation: string []
  section: string []
  company: string | null
  address: string | null
  leaveType: string | null
  leaveWithOrWPay: string
  includeLeaveAdj: boolean
  status: string
  mode: string
}

interface DailyRecord {
  date: string;
  day: string;
  restDay: boolean;
  timeIn: string;
  timeOut: string;
  workShift: string;
  noOfHrs: string;
  tardiness: string;
  undertime: string;
  absences: string;
  leaveWithPay: string;
}

interface EmployeeReport {
  seqNo: number;
  empCode: string;
  fullName: string;
  dailyRecords: DailyRecord[];
  subtotal: {
    noOfHrs: string;
    tardiness: string;
    undertime: string;
    absences: string;
    leaveWithPay: string;
  };
}

export function DailyTimeRecordMonitoringPage() {
  const [dateFrom, setDateFrom] = useState('05/15/2021');
  const [dateTo, setDateTo] = useState('05/31/2021');
  const [empCode, setEmpCode] = useState('');
  const [empName, setEmpName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [workShiftCode, setWorkshiftCode] = useState('');
  const [workShiftDesc, setWorkshiftDesc] = useState('');
  const [searchModalTerm, setSearchModalTerm] = useState('');
  const [searchGroupModalTerm, setSearchGroupModalTerm] = useState('');
  const [searchWorkshiftModalTerm, setSearchWorkshiftModalTerm] = useState('');
  const [sortAlphabetically, setSortAlphabetically] = useState(false);
  //const [status, setStatus] = useState<StatusType>('active');
  const [employeeCode, setEmployeeCode] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('tk-group');
  //const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedBranchItems, setSelectedBranchItems] = useState<string[]>([]);
  const [selectedDepItems, setSelectedDepItems] = useState<string[]>([]);
  const [selectedDesItems, setSelectedDesItems] = useState<string[]>([]);
  const [selectedDivItems, setSelectedDivItems] = useState<string[]>([]);
  const [selectedSecItems, setSelectedSecItems] = useState<string[]>([]);
  const [selectedOTItems, setSelectedOTItems] = useState<string[]>([]);
  const [currentGroupPage, setCurrentGroupPage] = useState(1);
  const [currentBranchPage, setCurrentBranchPage] = useState(1);
  const [currentDepPage, setCurrentDepPage] = useState(1);
  const [currentDesPage, setCurrentDesPage] = useState(1);
  const [currentDivPage, setCurrentDivPage] = useState(1);
  const [currentSecPage, setCurrentSecPage] = useState(1);
  const [currentEmpPage, setCurrentEmpPage] = useState(1);
  const [currentOTPage, setCurrentOTPage] = useState(1);
  const [currentUserGroupPage, setCurrentUserGroupPage] = useState(1);
  const [currentWorkshiftPage, setCurrentWorkshiftPage] = useState(1);
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [userGroupSearchTerm, setUserGroupSearchTerm] = useState('');
  const [workShiftSearchTerm, setWorkshiftSearchTerm] = useState('');
  const [overtimeSearchTerm, setOvertimeSearchTerm] = useState('');
  const [reportType, setReportType] = useState('Accumulation');
  const [toExcelFile, setToExcelFile] = useState(false);
  const [convertToHHMM, setConvertToHHMM] = useState(false);
  const [convertToRawData, setConvertToRawData] = useState(false);
  const [includeWPay, setIncludeWPay] = useState(false);
  const [includeWOutPay, setIncludeWOutPay] = useState(false);
  const [utRawData, setUTRawData] = useState(false);
  const [includeLeaveAdj, setIncludeLeaveAdj] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showGroupSearchModal, setShowGroupSearchModal] = useState(false);
  const [showShiftSearchModal, setShowShiftSearchModal] = useState(false);
  const [showOvertimeSearchModal, setShowOvertimeSearchModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [empStatus, setEmpStatus] = useState<'Active' |'InActive'| 'All'>('Active');
  const [status, setStatus] = useState<'Active' |'InActive'| 'All'>('All');
  const [mode, setMode] = useState<'Absences' |'Leave'| 'All'>('All');
  const [hrsOptions, setHrsOptions] = useState<'Per Employee' | 'Summary'>('Per Employee');
  const [tardyOptions, setTardyOptions] = useState<'Month' | 'Per Department' | 'Annual'>('Month');
  const [tardinessOptions, setTardinessOptions] = useState<'Listing' | 'Periodic'>('Listing');
  const [rawDataOptions, setRawDataOptions] = useState<'Actual' | 'Policy'>('Actual');
  const [periodOptions, setPeriodOptions] = useState<number>(1);
  const [instanceOptions, setInstanceOptions] = useState<number>(0);
  const [otOptions, setOTOptions] = useState<'Listing' | 'Summary'>('Listing');
  const [utOptions, setUTOptions] = useState<'Policy' | 'ActualTime'>('Policy');
  const [empShiftOptions, setEmpShiftOptions] = useState<'Count' | 'Listing'>('Count');
  const [noShiftOptions, setNoShiftOptions] = useState<number>(1);
  const [include, setInclude] = useState(false);
  const [dataMode, setDataMode] = useState('CompleteLogs');
  const [appMode, setAppMode] = useState('OvertimeApplication');
  const [withOrWOutPay, setWithOrWOutPay] = useState<'WithPay' |'WithOutPay'| 'All'>('All');
  const [yearsOfService, setYearsOfService] = useState('');
  const [noOfConsecutiveAbsences, setNoOfConsecutiveAbsences] = useState('');
  const [minutes, setMinutes] = useState('');
  const [weekName, setWeekName] = useState('');
  const [noOfFilter, setNoOfFilter] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const [instanceNum, setInstanceNum] = useState('');
  const [minutesNum, setMinutesNum] = useState('');

  const itemsPerPage = 10;
  const [selectedLeaveType, setSelectedLeaveType] = useState('');
  const [processOptions, setProcessOptions] = useState({
    tardiness: false,
    undertime: false,
    nightDiffBasic: false,
    overtime: false,
    absences: false,
    selectAll: false,
    otherEarnAllowances: false,
    holidayPay: false
  });

  const [logsOptions, setLogsOptions] = useState({
    incompleteLogs: false,
    logs: false,
    break1: false,
    break2: false,
    break3: false
  });

  const [getLeaveType, setGetLeaveType] = useState<Array<{
    leaveID: number;
    leaveCode: string;
    leaveDesc: string;
  }>>([]);
  const [getEmployee, setGetEmployee] = useState<Array<{ 
    empID: number; 
    empCode: string; 
    lName: string;
    fName: string;
    mName: string;
    suffix: string;
  }>>([]); 
  const [getUserGroup, setGetUserGroup] = useState<Array<{ 
    groupID: number; 
    groupName: string; 
    groupDesc: string;
  }>>([]);
  const [getWorkShift, setGetWorkShift] = useState<Array<{ 
    workShiftID: number; 
    workShiftCode: string; 
    workShiftDesc: string;
  }>>([]);
  const [tkGroupItems, setTKSGroupItems] = useState<GroupItem[]>([]);
  const [branchItems, setBranchItems] = useState<GroupItem[]>([]);
  const [departmentItems, setDepartmentItems] = useState<GroupItem[]>([]);
  const [designationItems, setDesignationItems] = useState<GroupItem[]>([]);
  const [divisionItems, setDivisionItems] = useState<GroupItem[]>([]);
  const [sectionItems, setSectionItems] = useState<GroupItem[]>([]);
  const [overtimeItems, setOvertimeItems] = useState<GroupItem[]>([]);

  const handleOptionChange = (option: keyof typeof processOptions) => {
    if (option === 'selectAll') {
      const newValue = !processOptions.selectAll;
      setProcessOptions({
        tardiness: newValue,
        undertime: newValue,
        nightDiffBasic: newValue,
        overtime: newValue,
        absences: newValue,
        selectAll: newValue,
        otherEarnAllowances: newValue,
        holidayPay: newValue
      });
    } else {
      setProcessOptions(prev => ({ ...prev, [option]: !prev[option] }));
    }
  };
  const handleLogsChange = (option: keyof typeof logsOptions) => {
  if (option === 'incompleteLogs') {
    const newValue = !logsOptions.logs;

    if (!newValue) {
      // Only when logs becomes unchecked
      setLogsOptions({
        incompleteLogs: false,
        logs: false,
        break1: false,
        break2: false,
        break3: false,
      });
    } else {
      // Just toggle logs to true (leave others unchanged)
      setLogsOptions(prev => ({
        ...prev,
        incompleteLogs: true,
      }));
    }
  } else {
    setLogsOptions(prev => ({
      ...prev,
      [option]: !prev[option],
    }));
  }
  
};

useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showSearchModal) {
          setShowSearchModal(false);
        } 
        if (showGroupSearchModal) {
          setShowGroupSearchModal(false);
        }
      }
    };

    if (showSearchModal) {
      document.addEventListener('keydown', handleEscKey);
    }
    if (showGroupSearchModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
}, [showSearchModal, showGroupSearchModal]);


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
        const items = await fetchTKSGroupData();
      setTKSGroupItems(items);
    };

      loadTKSGroup();
  }, []); 

    const fetchBranchData = async (): Promise<GroupItem[]> => {
        const response = await apiClient.get('/Fs/Employment/BranchSetUp');

        return response.data.map((item: any) => ({
            id: item.braID || item.ID,
            code: item.braCode || item.code,
            description: item.braDesc || item.description,
        }));
    };

    useEffect(() => {
        const loadBranches = async () => {
            const items = await fetchBranchData();
            setBranchItems(items);
        };

        loadBranches();
    }, []);

    const fetchDepartmentData = async (): Promise<GroupItem[]> => {
        const response = await apiClient.get('/Fs/Employment/DepartmentSetUp');

        return response.data.map((item: any) => ({
            id: item.depID || item.ID,
            code: item.depCode || item.code,
            description: item.depDesc || item.description,
        }));

    };

    useEffect(() => {
        const loadDepartments = async () => {
            const items = await fetchDepartmentData();
            setDepartmentItems(items);
        };

        loadDepartments();
    }, []
    );

    const fetchDesignationData = async (): Promise<GroupItem[]> => {
        const response = await apiClient.get('/Fs/Employment/DesignationSetUp');

        return response.data.map((item: any) => ({
            id: item.desID || item.ID,
            code: item.desCode || item.code,
            description: item.desDesc || item.description,
        }));

    };

    useEffect(() => {
        const loadDesignations = async () => {
            const items = await fetchDesignationData(); 
            setDesignationItems(items);
        };

        loadDesignations();
    }, []
    );

    const fetchDivisionData = async (): Promise<GroupItem[]> => {
        const response = await apiClient.get('/Fs/Employment/DivisionSetUp');

        return response.data.map((item: any) => ({
            id: item.divID || item.ID,
            code: item.divCode || item.code,
            description: item.divDesc || item.description,
        }));

    };

    useEffect(() => {
        const loadDivisions = async () => {
            const items = await fetchDivisionData();
            setDivisionItems(items);
        };

        loadDivisions();
    }, []
    );

    const fetchSectionData = async (): Promise<GroupItem[]> => {
        const response = await apiClient.get('/Fs/Employment/SectionSetUp');

        return response.data.map((item: any) => ({
            id: item.secID || item.ID,
            code: item.secCode || item.code,
            description: item.secDesc || item.description,
        }));

    };

    useEffect(() => {
        const loadSections = async () => {
            const items = await fetchSectionData();
            setSectionItems(items);
        };

        loadSections();
    }, []
    );
    const fetchOvertimeData = async (): Promise<GroupItem[]> => {
        const response = await apiClient.get('/Fs/Process/Overtime/OverTimeFileSetUp');

        return response.data.map((item: any) => ({
            id: item.otfid || item.OTFID || '',
            code: item.otfCode || item.OTFCode,
            description: item.description || item.Description,
        }));

    };

    useEffect(() => {
        const loadOvertime = async () => {
            const items = await fetchOvertimeData();
            setOvertimeItems(items);
        };

        loadOvertime();
    }, []
    );

    const fetchEmployee = async () => {
        //setLoading(true);
        //error;
          try {
          const response = await apiClient.get(`/Maintenance/EmployeeMasterFile/GetActive?active=${filterStatus}`);
          if (response.data) {
            const mappedData = response.data.map((getEmployee: any) => ({
              empID: getEmployee.empID || getEmployee.EmpID || '',
              empCode: getEmployee.empCode || getEmployee.EmpCode || '',
              lName: getEmployee.lName || getEmployee.LName || '',
              fName: getEmployee.fName || getEmployee.fName || '',
              mName: getEmployee.mName || getEmployee.mName || '',
              suffix: getEmployee.suffix || getEmployee.suffix || ''
            }));
            setGetEmployee(mappedData);
          }
          } catch (error: any) {
              const errorMsg = error.response?.data?.message || error.message || 'Failed to load Employees';
              //setError(errorMsg);
              console.error('Error fetching employees', error);
            } finally {
              //loading;
            }
      };
    useEffect(() => {
        fetchEmployee();
      }, [filterStatus]);

  const fetchUserGroup = async () => {
        //setLoading(true);
        //error;
          try {
          const response = await apiClient.get('/UserGroupAccessReport/GetTKUserGroup');
          if (response.data) {
            const mappedData = response.data.map((getUserGroup: any) => ({
              groupID: getUserGroup.groupID || getUserGroup.GroupID || '',
              groupName: getUserGroup.groupName || getUserGroup.GroupName || '',
              groupDesc: getUserGroup.groupDesc || getUserGroup.GroupDesc || ''
            }));
            setGetUserGroup(mappedData);
          }
          } catch (error: any) {
              const errorMsg = error.response?.data?.message || error.message || 'Failed to load User Group';
              //setError(errorMsg);
              console.error('Error fetching user group', error);
            } finally {
              //loading;
            }
      };
    useEffect(() => {
        fetchUserGroup();
      }, []);
  
  const fetchWorkShift = async () => {
        //setLoading(true);
        //error;
          try {
          const response = await apiClient.get('/CountEmployeePerShift/GetTKWorkShift');
          if (response.data) {
            const mappedData = response.data.map((getWorkShift: any) => ({
              workShiftID: getWorkShift.workShiftID || getWorkShift.WorkShiftID || '',
              workShiftCode: getWorkShift.workShiftCode || getWorkShift.WorkShiftCode || '',
              workShiftDesc: getWorkShift.workShiftDesc || getWorkShift.WorkShiftDesc || ''
            }));
            setGetWorkShift(mappedData);
          }
          } catch (error: any) {
              const errorMsg = error.response?.data?.message || error.message || 'Failed to load WorkShift';
              //setError(errorMsg);
              console.error('Error fetching Workshift', error);
            } finally {
              //loading;
            }
      };
    useEffect(() => {
        fetchWorkShift();
      }, []);
  
  const handleEmployeeSelect = (empCodeValue: string, empNameValue: string) => {
    setEmpCode(empCodeValue);
    setEmpName(empNameValue);
    setShowSearchModal(false);
    setSearchModalTerm('');
  };

  const handleGroupSelect = (groupNameValue: string, groupDescValue: string) => {
    setGroupName(groupNameValue);
    setGroupDesc(groupDescValue);
    setShowGroupSearchModal(false);
    setSearchGroupModalTerm('');
  };

  const handleWorkshiftSelect = (workShiftCodeValue: string, workShiftDescValue: string) => {
    setWorkshiftCode(workShiftCodeValue);
    setWorkshiftDesc(workShiftDescValue);
    
    setShowShiftSearchModal(false);
    setSearchWorkshiftModalTerm('');
  };


  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    //setLoading(true);
      //error;
      try {
      const response = await apiClient.get('/Fs/Process/LeaveTypeSetUp');
      if (response.data) {
        const mappedData = response.data.map((getLeaveType: any) => ({
          //deviceName: device.deviceName || device.DeviceName || ''
          leaveID: getLeaveType.leaveID || getLeaveType.ID || '',
          leaveCode: getLeaveType.leaveCode || getLeaveType.LeaveCode || '',
          leaveDesc: getLeaveType.leaveDesc || getLeaveType.LeaveDesc || '' 
        }));
        setGetLeaveType(mappedData);
      }
      } catch (error: any) {
          const errorMsg = error.response?.data?.message || error.message || 'Failed to load Leave Types';
          //setError(errorMsg);
          console.error('Error fetching Leave Types', error);
        } finally {
          //loading;
        }
  };

  const fileLinkCreate = (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const filter: ReportFilter = {
    empCode: empCode,
    dateFr: dateFrom ? new Date(dateFrom).toLocaleDateString() : '-',
    dateTo: dateTo ? new Date(dateTo).toLocaleDateString() : '-',
    groups: selectedItems.length === 0 ? [] : selectedItems.toLocaleString().split(","),
    departments: selectedDepItems.length === 0 ? [] : selectedDepItems.toLocaleString().split(","),
    divisions: selectedDivItems.length === 0 ? [] : selectedDivItems.toLocaleString().split(","),
    branch: selectedBranchItems.length === 0 ? [] : selectedBranchItems.toLocaleString().split(","),
    designation: selectedDesItems.length === 0 ? [] : selectedDesItems.toLocaleString().split(","),
    section: selectedSecItems.length === 0 ? [] : selectedSecItems.toLocaleString().split(","),
    company: "",
    address: "",
    userName: getLoggedInUsername(),
    mode: dataMode,
    activeInActiveAll: empStatus,
    include: include,
    option: noShiftOptions,
    consecutiveAbsences: Number(noOfConsecutiveAbsences),
    yearsOfService: Number(yearsOfService),
    minutes: Number(minutes),
    weekName: weekName,
    dayType: "",
    noOfFilter: Number(noOfFilter),
    userGroup: groupName,
    includeWithPay: includeWPay,
    includeWithoutPay: includeWOutPay,
    otCode: selectedOTItems.length === 0 ? [] : selectedOTItems.toLocaleString().split(","),
    workShiftCode: workShiftCode,
    instance: instanceOptions,
    instanceCount: Number(instanceNum),
    instanceMinutes: Number(minutesNum),
    optionTardy: periodOptions
  };
  const tardyFilter: TardinessFilter = {
    empCode: empCode,
    year: Number(year),
    month: Number(month),
    cutOffDateFrom: dateFrom ? new Date(dateFrom).toLocaleDateString() : '-',
    cutOffDateTo: dateTo ? new Date(dateTo).toLocaleDateString() : '-',
    groups: selectedItems.length === 0 ? [] : selectedItems.toLocaleString().split(","),
    departments: selectedDepItems.length === 0 ? [] : selectedDepItems.toLocaleString().split(","),
    divisions: selectedDivItems.length === 0 ? [] : selectedDivItems.toLocaleString().split(","),
    branch: selectedBranchItems.length === 0 ? [] : selectedBranchItems.toLocaleString().split(","),
    designation: selectedDesItems.length === 0 ? [] : selectedDesItems.toLocaleString().split(","),
    section: selectedSecItems.length === 0 ? [] : selectedSecItems.toLocaleString().split(","),
    activeInActiveAll: empStatus,
  };
  const exempFilter: ExemptionReportFilter = {
    empCode: empCode,
    groups: selectedItems.length === 0 ? [] : selectedItems.toLocaleString().split(","),
    departments: selectedDepItems.length === 0 ? [] : selectedDepItems.toLocaleString().split(","),
    divisions: selectedDivItems.length === 0 ? [] : selectedDivItems.toLocaleString().split(","),
    branch: selectedBranchItems.length === 0 ? [] : selectedBranchItems.toLocaleString().split(","),
    designation: selectedDesItems.length === 0 ? [] : selectedDesItems.toLocaleString().split(","),
    section: selectedSecItems.length === 0 ? [] : selectedSecItems.toLocaleString().split(","),
    tardiness: processOptions.tardiness,
    undertime: processOptions.undertime,
    nightDiffBasic: processOptions.nightDiffBasic,
    overtime: processOptions.overtime,
    absences: processOptions.absences,
    otherEarnAllow: processOptions.otherEarnAllowances,
    holidayPay: processOptions.holidayPay,
    activeInActiveAll: empStatus,
  };

  const incLogsFilter: IncompleteLogsFilter = {
    empCode: empCode,
    dateFr: dateFrom ? new Date(dateFrom).toLocaleDateString() : '-',
    dateTo: dateTo ? new Date(dateTo).toLocaleDateString() : '-',
    groups: selectedItems.length === 0 ? [] : selectedItems.toLocaleString().split(","),
    departments: selectedDepItems.length === 0 ? [] : selectedDepItems.toLocaleString().split(","),
    divisions: selectedDivItems.length === 0 ? [] : selectedDivItems.toLocaleString().split(","),
    branch: selectedBranchItems.length === 0 ? [] : selectedBranchItems.toLocaleString().split(","),
    company: "",
    address: "",
    designation: selectedDesItems.length === 0 ? [] : selectedDesItems.toLocaleString().split(","),
    section: selectedSecItems.length === 0 ? [] : selectedSecItems.toLocaleString().split(","),
    logs: logsOptions.logs,
    break1: logsOptions.break1,
    break2: logsOptions.break2,
    break3: logsOptions.break3,
    activeInActiveAll: empStatus,
  };

  const leaveAbsenceFilter: LeaveAbsencesFilter = {
    empCode: empCode,
    dateFr: dateFrom ? new Date(dateFrom).toLocaleDateString() : '-',
    dateTo: dateTo ? new Date(dateTo).toLocaleDateString() : '-',
    groups: selectedItems.length === 0 ? [] : selectedItems.toLocaleString().split(","),
    departments: selectedDepItems.length === 0 ? [] : selectedDepItems.toLocaleString().split(","),
    divisions: selectedDivItems.length === 0 ? [] : selectedDivItems.toLocaleString().split(","),
    branch: selectedBranchItems.length === 0 ? [] : selectedBranchItems.toLocaleString().split(","),
    designation: selectedDesItems.length === 0 ? [] : selectedDesItems.toLocaleString().split(","),
    section: selectedSecItems.length === 0 ? [] : selectedSecItems.toLocaleString().split(","),
    company: "",
    address: "",
    leaveType: selectedLeaveType,
    leaveWithOrWPay: withOrWOutPay,
    includeLeaveAdj: includeLeaveAdj,
    status: status,
    mode: mode
  };

  function useToQueryParams<T extends Record<string, any>>(obj: T): string {
  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;

    if (value instanceof Date) {
      params.append(key, value.toISOString());
    } else if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, String(v)));
    } else {
      params.append(key, String(value));
    }
  });

  return params.toString();
}

  const printReport = async () => {
    if(reportType === "Accumulation"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/AccumulationReport/PrintAccumulationReport?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "AccumulationReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Adjustment"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/AdjustmentReport/PrintAdjustment?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "AdjustmentReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Allowance"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/AllowanceReport/PrintAllowanceReport?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "AllowanceReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Application Report" && appMode === "OvertimeApplication"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/ApplicationReport/PrintOTApplicationReport?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "OvertimeApplicationReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Application Report" && appMode === "LeaveApplication"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/ApplicationReport/PrintLeaveApplicationReport?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "LeaveApplicationReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Assumed Days"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/AssumedDaysReport/PrintAssumedDays?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "AssumedDaysReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Attendance Summary"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/AttendanceSummary/PrintAttendanceSummary?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "AttendanceSummaryReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Consecutive Absences"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/ConsecutiveAbsencesReport/PrintConsecutiveAbsencesReport?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "ConsecutiveAbsencesReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Count Of Employee Per Workshift" && empShiftOptions === "Count"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/CountEmployeePerShift/PrintCountEmployeePerShift?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "CountEmployeePerShiftReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Count Of Employee Per Workshift" && empShiftOptions === "Listing"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/CountEmployeePerShift/PrintListEmployeePerShift?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "CountEmployeePerShiftReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Attendance Ratio"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/AttendanceRatio/PrintAttendanceRatio?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "AttendanceRatioReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Daily Time"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/DailyTimeReport/PrintDailyTimeReport?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "DailyTimeReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Employees Raw In And Out (From Update Rawdata)"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/EmployeeRawInAndOut/PrintEmployeeRawInAndOut?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "EmployeeRawInAndOutReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Leave And Absences" && mode === "All"){
      try{      
        const query = useToQueryParams<LeaveAbsencesFilter>(leaveAbsenceFilter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/LeaveAndAbsences/PrintLeaveAndAbsences?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "LeaveAndAbsencesReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Leave And Absences" && mode === "Absences"){
      try{      
        const query = useToQueryParams<LeaveAbsencesFilter>(leaveAbsenceFilter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/LeaveAndAbsences/PrintAbsences?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "AbsencesReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Leave And Absences" && mode === "Leave"){
      try{      
        const query = useToQueryParams<LeaveAbsencesFilter>(leaveAbsenceFilter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/LeaveAndAbsences/PrintLeave?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "LeaveReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Device Code Report"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/DeviceCodeReport/PrintDeviceCodeReport?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "DeviceCodeReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Employees Raw Data Report"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/EmployeeRawDataReport/PrintEmployeeRawDataReport?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "EmployeeRawDataReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "In And Out By Position"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/InOutByPositionReport/PrintInOutByPositionReport?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "EmployeesInAndOutReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Man Hours" && hrsOptions === "Per Employee"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/ManHoursReport/PrintManHoursPerEmployee?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "ManHoursPerEmployeeReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Man Hours" && hrsOptions === "Summary"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/ManHoursReport/PrintManHoursSummary?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "ManHoursSummaryReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Employees With No Workshift"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/EmployeeNoWorkShiftReport/PrintEmployeeNoWorkShift?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "EmployeeNoWorkShiftReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Exemption Report"){
      try{      
        const query = useToQueryParams<ExemptionReportFilter>(exempFilter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/ExemptionReport/PrintExemptionReport?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "ExemptionReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Man Hours By Division-Branch-Category-Dept-Section"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/ManHoursReport/PrintManHours?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "ManHoursDivBraCatDepSec.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "No In And Out" && logsOptions.incompleteLogs == false){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/NoInAndOut/PrintNoInAndOut?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "NoInAndOutReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "No In And Out" && (logsOptions.incompleteLogs == true && logsOptions.logs == false)){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/NoInAndOut/PrintIncompleteLogs?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "IncompleteLogsReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "No In And Out" && (logsOptions.incompleteLogs == true && logsOptions.logs == true) ){
      try{      
        const query = useToQueryParams<IncompleteLogsFilter>(incLogsFilter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/NoInAndOut/PrintIncompleteLogs?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "IncompleteLogs-NoInOutReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Overtime" && otOptions === "Listing" ){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/OvertimeReport/PrintOvertimeReport?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "OvertimeReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Overtime" && otOptions === "Summary" ){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/OvertimeReport/PrintOvertimeSummaryReport?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "OvertimeReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Perfect Attendance"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/PerfectAttendanceReport/PrintPerfectAttendance?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "PerfectAttendanceReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Questionable Entries"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/QuestEntriesReport/PrintQuestEntriesReport?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "QuestionableEntriesReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Questionable Workshifts"){
      if (!minutes || minutes.trim() === "") {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Max Minutes',
          text: 'Please enter valid Max Minutes before generating the report.'
        });
        return;
      }
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/QuestShiftReport/PrintQuestShiftReport?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "QuestionableWorkshiftReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Restday in a Week"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/RestDayWeekReport/PrintRestDayWeekReport?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "RestDayInAWeekReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Tardiness/ Overbreak/ Undertime Violation"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/ViolationReport/PrintViolationReport?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "TardyOverbreakUndertimeViolationReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Tardiness And Undertime Report"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/TardyUTReport/PrintTardyUTReport?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "TardinessAndUndertimeReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Tardiness Penalty" && tardyOptions === "Month"){
      try{      
        const query = useToQueryParams<TardinessFilter>(tardyFilter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/TardinessPenalty/PrintTardinessPenaltyPerMonth?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "TardinessPenaltyPerMonth.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Tardiness Penalty" && tardyOptions === "Per Department"){
      try{      
        const query = useToQueryParams<TardinessFilter>(tardyFilter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/TardinessPenalty/PrintTardinessPenaltyPercentage?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "TardinessPenaltyPercentage.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Tardiness Penalty" && tardyOptions === "Annual"){
      try{      
        const query = useToQueryParams<TardinessFilter>(tardyFilter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/TardinessPenalty/PrintTardinessPenaltyAnnual?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "AnnualTardinessReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Tardiness" && tardinessOptions === "Listing" && periodOptions === 0 && convertToRawData === false){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/TardinessReport/PrintTardinessReport?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "TardinessReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Tardiness" && tardinessOptions === "Listing" && periodOptions === 1 && convertToRawData === false){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/TardinessReport/PrintTardinessAfterGPeriod?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "TardinessReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Tardiness" && tardinessOptions === "Listing" && periodOptions === 2 && convertToRawData === false){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/TardinessReport/PrintTardinessWithinGPeriod?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "TardinessReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Tardiness" && tardinessOptions === "Periodic" && convertToRawData === false){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/TardinessReport/PrintTardinessPeriodic?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "TardinessPeriodicReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Tardiness" && convertToRawData === true && rawDataOptions === "Actual"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/TardinessReport/PrintTardinessRawDataActual?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "TardinessRawDataReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Tardiness" && convertToRawData === true && rawDataOptions === "Policy"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/TardinessReport/PrintTardinessRawDataReport?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "TardinessRawDataReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Timesheet"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/TimeSheetReport/PrintTimeSheetReport?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "TimeSheetReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Unauthorized Absences"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/UnauthorizedAbsences/PrintUnauthorizedAbsences?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "UnauthorizedAbsencesReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Undertime" && utRawData == false){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/UndertimeReport/PrintUndertime?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "UndertimeReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Undertime" && utOptions === "Policy"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/UndertimeReport/PrintUndertimeByPolicy?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "UndertimeByPolicyReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "Undertime" && utOptions === "ActualTime"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/UndertimeReport/PrintUndertimeByActual?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "UndertimeByActualTimeReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "User Group Access"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/UserGroupAccessReport/PrintUserGroupAccess?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "UserGroupAccessReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else if(reportType === "User TK Group Access"){
      try{      
        const query = useToQueryParams<ReportFilter>(filter);
        Swal.fire({
          icon: 'info',
          title: 'Downloading',
          text: 'Please wait while your file is being downloaded.',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const response = await apiClient.get(`/UserTKGroupAccessReport/PrintUserTKGroupAccess?${query}`, {
          responseType: 'blob'
        });
        console.log(response.headers);
        const fileName = "UserTKGroupAccessReport.xlsx";
        const mimeType = response.headers['content-type']
        const blob = new Blob([response.data], { type: mimeType });
        fileLinkCreate(blob, fileName)
        Swal.fire({
          icon: 'success',
          title: 'Done',
          text: 'Download Successful!',
          timer: 2000,
          showConfirmButton: false,
        });
     }
     finally {
     }
    }
    else{
      Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No Report Found.'
        });
    }
               
  }

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'tk-group':
        return tkGroupItems;
      case 'branch':
        return branchItems;
      case 'department':
        return departmentItems;
      case 'designation':
        return designationItems;
      case 'division':
        return divisionItems;
      case 'section':
        return sectionItems;
      default:
        return tkGroupItems;
    }
  };

  const records = getCurrentData();

  const filteredEmployees = getEmployee.filter(emp =>
    emp.empCode?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    emp.lName?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    emp.fName?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    emp.mName?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    emp.suffix?.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  );

  const filteredUserGroup = getUserGroup.filter(group =>
    group.groupName?.toLowerCase().includes(userGroupSearchTerm.toLowerCase()) ||
    group.groupDesc?.toLowerCase().includes(userGroupSearchTerm.toLowerCase())
  );

  const filteredWorkshift = getWorkShift.filter(item =>
    item.workShiftCode?.toLowerCase().includes(workShiftSearchTerm.toLowerCase()) ||
    item.workShiftDesc?.toLowerCase().includes(workShiftSearchTerm.toLowerCase())
  );

  const filteredOvertime = overtimeItems.filter(item =>
    item.code.toLowerCase().includes(overtimeSearchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(overtimeSearchTerm.toLowerCase())
  );

  const filteredGroups = tkGroupItems.filter(item =>
    item.code.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(groupSearchTerm.toLowerCase())
  );
  const filteredBranch = branchItems.filter(item =>
    item.code.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(groupSearchTerm.toLowerCase())
  );
  const filteredDep = departmentItems.filter(item =>
    item.code.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(groupSearchTerm.toLowerCase())
  );
  const filteredDes = designationItems.filter(item =>
    item.code.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(groupSearchTerm.toLowerCase())
  );
  const filteredDiv = divisionItems.filter(item =>
    item.code.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(groupSearchTerm.toLowerCase())
  );
  const filteredSec = sectionItems.filter(item =>
    item.code.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(groupSearchTerm.toLowerCase())
  );
  // Group Pagination logic
    const totalGroupPages = Math.ceil(filteredGroups.length / itemsPerPage);
    const totalBranchPages = Math.ceil(filteredBranch.length / itemsPerPage);
    const totalDepPages = Math.ceil(filteredDep.length / itemsPerPage);
    const totalDesPages = Math.ceil(filteredDes.length / itemsPerPage);
    const totalDivPages = Math.ceil(filteredDiv.length / itemsPerPage);
    const totalSecPages = Math.ceil(filteredSec.length / itemsPerPage);
    const totalOvertimePages = Math.ceil(filteredOvertime.length / itemsPerPage);

    const startGroupIndex = (currentGroupPage - 1) * itemsPerPage;
    const endGroupIndex = startGroupIndex + itemsPerPage;

    const startBranchIndex = (currentBranchPage - 1) * itemsPerPage;
    const endBranchIndex = startBranchIndex + itemsPerPage;

    const startDepIndex = (currentDepPage - 1) * itemsPerPage;
    const endDepIndex = startDepIndex + itemsPerPage;

    const startDesIndex = (currentDesPage - 1) * itemsPerPage;
    const endDesIndex = startDesIndex + itemsPerPage;

    const startDivIndex = (currentDivPage - 1) * itemsPerPage;
    const endDivIndex = startDivIndex + itemsPerPage;

    const startSecIndex = (currentSecPage - 1) * itemsPerPage;
    const endSecIndex = startSecIndex + itemsPerPage;

    const startOTIndex = (currentOTPage - 1) * itemsPerPage;
    const endOTIndex = startOTIndex + itemsPerPage;

    const paginatedGroups = filteredGroups.slice(startGroupIndex, endGroupIndex);
    const paginatedBranch = filteredBranch.slice(startBranchIndex, endBranchIndex);
    const paginatedDep = filteredDep.slice(startDepIndex, endDepIndex);
    const paginatedDes = filteredDes.slice(startDesIndex, endDesIndex);
    const paginatedDiv = filteredDiv.slice(startDivIndex, endDivIndex);
    const paginatedSec = filteredSec.slice(startSecIndex, endSecIndex);
    const paginatedOT = filteredOvertime.slice(startOTIndex, endOTIndex);
    // Get visible page numbers
    // TKSgroup page number
    const getGroupPageNumbers = () => {
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
    //Branch page number
    const getBranchPageNumbers = () => {
        const pages = [];
        if (totalBranchPages <= 7) {
            for (let i = 1; i <= totalBranchPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentBranchPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
                pages.push(totalBranchPages);
            } else if (currentBranchPage >= totalBranchPages - 3) {
                pages.push(1);
                pages.push('...');
                for (let i = totalBranchPages - 4; i <= totalBranchPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentBranchPage - 1; i <= currentBranchPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalBranchPages);
            }
        }
        return pages;
    };
    //Department page number
    const getDepPageNumbers = () => {
        const pages = [];
        if (totalDepPages <= 7) {
            for (let i = 1; i <= totalDepPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentDepPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
                pages.push(totalDepPages);
            } else if (currentDepPage >= totalDepPages - 3) {
                pages.push(1);
                pages.push('...');
                for (let i = totalDepPages - 4; i <= totalDepPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentDepPage - 1; i <= currentDepPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalDepPages);
            }
        }
        return pages;
    };
    //Designation page number
    const getDesPageNumbers = () => {
        const pages = [];
        if (totalDesPages <= 7) {
            for (let i = 1; i <= totalDesPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentDesPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
                pages.push(totalDesPages);
            } else if (currentDesPage >= totalDesPages - 3) {
                pages.push(1);
                pages.push('...');
                for (let i = totalDesPages - 4; i <= totalDesPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentDesPage - 1; i <= currentDesPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalDesPages);
            }
        }
        return pages;
    };
    //Division page number
    const getDivPageNumbers = () => {
        const pages = [];
        if (totalDivPages <= 7) {
            for (let i = 1; i <= totalDivPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentDivPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
                pages.push(totalDivPages);
            } else if (currentDivPage >= totalDivPages - 3) {
                pages.push(1);
                pages.push('...');
                for (let i = totalDivPages - 4; i <= totalDivPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentDivPage - 1; i <= currentDivPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalDivPages);
            }
        }
        return pages;
    };
    //Section page number
    const getSecPageNumbers = () => {
        const pages = [];
        if (totalSecPages <= 7) {
            for (let i = 1; i <= totalSecPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentSecPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
                pages.push(totalSecPages);
            } else if (currentSecPage >= totalSecPages - 3) {
                pages.push(1);
                pages.push('...');
                for (let i = totalSecPages - 4; i <= totalSecPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentSecPage - 1; i <= currentSecPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalSecPages);
            }
        }
        return pages;
    };
    //Overtime
    const getOTPageNumbers = () => {
        const pages = [];
        if (totalOvertimePages <= 7) {
            for (let i = 1; i <= totalOvertimePages; i++) {
                pages.push(i);
            }
        } else {
            if (currentOTPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
                pages.push(totalOvertimePages);
            } else if (currentOTPage >= totalOvertimePages - 3) {
                pages.push(1);
                pages.push('...');
                for (let i = totalOvertimePages - 4; i <= totalOvertimePages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentOTPage - 1; i <= currentOTPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalOvertimePages);
            }
        }
        return pages;
    };

  // User Group Pagination logic
    const totalUserGroupPages = Math.ceil(filteredUserGroup.length / itemsPerPage);
    const startUserGroupIndex = (currentUserGroupPage - 1) * itemsPerPage;
    const endUserGroupIndex = startUserGroupIndex + itemsPerPage;

    const paginatedUserGroup = filteredUserGroup.slice(
        (currentUserGroupPage - 1) * itemsPerPage,
        currentUserGroupPage * itemsPerPage
    );
    // Get visible page numbers
    const getUserGroupPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        if (totalUserGroupPages <= maxVisible) {
            return Array.from({ length: totalUserGroupPages }, (_, i) => i + 1);
        }
        pages.push(1);
        if (currentUserGroupPage > 3) pages.push('...');
        const start = Math.max(2, currentUserGroupPage - 1);
        const end = Math.min(totalUserGroupPages - 1, currentUserGroupPage + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        if (currentUserGroupPage < totalUserGroupPages - 2) pages.push('...');
        pages.push(totalUserGroupPages);
        return pages;
    };

    // Workshift Pagination logic
    const totalWorkshiftPages = Math.ceil(filteredWorkshift.length / itemsPerPage);
    const startWorkshiftIndex = (currentWorkshiftPage - 1) * itemsPerPage;
    const endWorkshiftIndex = startWorkshiftIndex + itemsPerPage;

    const paginatedWorkshift = filteredWorkshift.slice(
        (currentWorkshiftPage - 1) * itemsPerPage,
        currentWorkshiftPage * itemsPerPage
    );
    // Get visible page numbers
    const getWorkshiftPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        if (totalWorkshiftPages <= maxVisible) {
            return Array.from({ length: totalWorkshiftPages }, (_, i) => i + 1);
        }
        pages.push(1);
        if (currentWorkshiftPage > 3) pages.push('...');
        const start = Math.max(2, currentWorkshiftPage - 1);
        const end = Math.min(totalWorkshiftPages - 1, currentWorkshiftPage + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        if (currentWorkshiftPage < totalWorkshiftPages - 2) pages.push('...');
        pages.push(totalWorkshiftPages);
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

  

  const tabs = [
    { id: 'tk-group', label: 'TK Group', icon: Users },
    { id: 'branch', label: 'Branch', icon: Building2 },
    { id: 'department', label: 'Department', icon: Briefcase },
    { id: 'designation', label: 'Designation', icon: Award },
    { id: 'division', label: 'Division', icon: Network },
    { id: 'section', label: 'Section', icon: Grid }
  ];

  // const handleItemToggle = (id: number) => {
  //   setSelectedItems(prev =>
  //     prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
  //   );
  // };
  const handleItemToggle = (code: string) => {
    if (activeTab == 'tk-group')
    {
      setSelectedItems(prev =>
        prev.includes(code) ? prev.filter(i => i !== code) : [...prev, code]
      );
    }
    if (activeTab == 'branch')
    {
      setSelectedBranchItems(prev =>
        prev.includes(code) ? prev.filter(i => i !== code) : [...prev, code]
      );
    }
    if (activeTab == 'department')
    {
      setSelectedDepItems(prev =>
        prev.includes(code) ? prev.filter(i => i !== code) : [...prev, code]
      );
    }
    if (activeTab == 'designation')
    {
      setSelectedDesItems(prev =>
        prev.includes(code) ? prev.filter(i => i !== code) : [...prev, code]
      );
    }
    if (activeTab == 'division')
    {
      setSelectedDivItems(prev =>
        prev.includes(code) ? prev.filter(i => i !== code) : [...prev, code]
      );
    }
    if (activeTab == 'section')
    {
      setSelectedSecItems(prev =>
        prev.includes(code) ? prev.filter(i => i !== code) : [...prev, code]
      );
    }
  };

  const handleOTItemToggle = (code: string) => {
    
    setSelectedOTItems(prev =>
      prev.includes(code) ? prev.filter(i => i !== code) : [...prev, code]
    );
    
  }
  // const handleSelectAll = () => {
  //   if (selectedItems.length === records.length) {
  //     setSelectedItems([]);
  //   } 
  //   else {
  //     setSelectedItems(records.map(r => r.id));
  //   }
  // };
  const handleSelectAll = () => {
    if(activeTab == 'tk-group')
    {
      if(selectedItems.length === tkGroupItems.length){
        setSelectedItems([]);
      } else {
        setSelectedItems(tkGroupItems.map(r =>r.code));
      }
    }
    else if(activeTab == 'branch'){
      if(selectedBranchItems.length === branchItems.length){
        setSelectedBranchItems([]);
      } else {
        setSelectedBranchItems(branchItems.map(r => r.code));
      }
    }
    else if(activeTab == 'department'){
      if(selectedDepItems.length === departmentItems.length){
        setSelectedDepItems([]);
      } else {
        setSelectedDepItems(departmentItems.map(r => r.code));
      }
    }
    else if(activeTab == 'designation'){
      if(selectedDesItems.length === designationItems.length){
        setSelectedDesItems([]);
      } else {
        setSelectedDesItems(designationItems.map(r => r.code));
      }
    }
    else if(activeTab == 'division'){
      if(selectedDivItems.length === divisionItems.length){
        setSelectedDivItems([]);
      } else {
        setSelectedDivItems(divisionItems.map(r => r.code));
      }
    }
    else if(activeTab == 'section'){
      if(selectedSecItems.length === sectionItems.length){
        setSelectedSecItems([]);
      } else {
        setSelectedSecItems(sectionItems.map(r => r.code));
      }
    }
    else {
      setSelectedItems([]);
      setSelectedBranchItems([]);
      setSelectedDepItems([]);
      setSelectedDesItems([]);
      setSelectedDivItems([]);
      setSelectedSecItems([]);
    }
  }
  const handleSelectOTAll = () => {
    
    if(selectedOTItems.length === overtimeItems.length){
      setSelectedOTItems([]);
    } else{
      setSelectedOTItems(overtimeItems.map(r =>r.code));
    }
  }

  const handleSearch = () => {
    console.log('Searching...');
  };

  const handleClearEmployeeCode = () => {
    setEmployeeCode('');
  };

  // const handleDisplay = () => {
  //   setShowReport(true);
  // };

  const handlePrint = () => {
    window.print();
  };

  if (showReport) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Main Content */}
        <div className="flex-1 relative z-10 p-6">
          <div className="max-w-7xl mx-auto relative">
            {/* Print Header */}
            <div className="flex items-center justify-between mb-6 print:hidden">
              <button
                onClick={() => setShowReport(false)}
                className="px-6 py-3 bg-yellow-500 text-gray-700 rounded-xl hover:bg-yellow-600 transition-colors"
              >
                ← Back to Filters
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Printer className="w-5 h-5" />
                <span>Print Report</span>
              </button>
            </div>

            {/* Report Content */}
            {/*<div className="bg-white shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-6">
                <h1 className="text-gray-900 mb-2">Daily Time Report</h1>
                <p className="text-gray-600">Period From Mar 01, 2020 to Mar 15, 2020</p>
              </div>

              <div className="border-t-4 border-black mb-6"></div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="px-2 py-2 text-left" style={{ width: '40px' }}>Seq. No.</th>
                    <th className="px-2 py-2 text-left" style={{ width: '80px' }}>EmpCode</th>
                    <th className="px-2 py-2 text-left" style={{ width: '200px' }}>Full Name</th>
                    <th className="px-2 py-2 text-center" style={{ width: '90px' }}>IN</th>
                    <th className="px-2 py-2 text-center" style={{ width: '90px' }}>OUT</th>
                    <th className="px-2 py-2 text-center" style={{ width: '100px' }}>Work Shift</th>
                    <th className="px-2 py-2 text-right" style={{ width: '70px' }}>No of Hrs</th>
                    <th className="px-2 py-2 text-right" style={{ width: '70px' }}>Tardiness</th>
                    <th className="px-2 py-2 text-right" style={{ width: '70px' }}>Undertime</th>
                    <th className="px-2 py-2 text-right" style={{ width: '70px' }}>Absences</th>
                    <th className="px-2 py-2 text-right" style={{ width: '70px' }}>Leave With Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((employee) => (
                    <React.Fragment key={employee.empCode}>
                      <tr className="bg-gray-100">
                        <td className="px-2 py-2 align-top">{employee.seqNo}.</td>
                        <td className="px-2 py-2 align-top">{employee.empCode}</td>
                        <td className="px-2 py-2 align-top" colSpan={9}>{employee.fullName}</td>
                      </tr>
                      {employee.dailyRecords.map((record, index) => (
                        <tr key={index} className={record.restDay ? 'bg-gray-50' : ''}>
                          <td className="px-2 py-1"></td>
                          <td className="px-2 py-1 text-xs">{record.date}</td>
                          <td className="px-2 py-1 text-xs">{record.day}</td>
                          <td className="px-2 py-1 text-xs text-center">{record.timeIn}</td>
                          <td className="px-2 py-1 text-xs text-center">{record.timeOut}</td>
                          <td className="px-2 py-1 text-xs text-center">{record.workShift}</td>
                          <td className="px-2 py-1 text-xs text-right">{record.noOfHrs}</td>
                          <td className="px-2 py-1 text-xs text-right">{record.tardiness}</td>
                          <td className="px-2 py-1 text-xs text-right">{record.undertime}</td>
                          <td className="px-2 py-1 text-xs text-right">{record.absences}</td>
                          <td className="px-2 py-1 text-xs text-right">{record.leaveWithPay}</td>
                        </tr>
                      ))}
                      <tr className="border-t border-gray-300 bg-gray-200">
                        <td className="px-2 py-2" colSpan={6}>
                          <span className="text-right block">Subtotal:</span>
                        </td>
                        <td className="px-2 py-2 text-right">{employee.subtotal.noOfHrs}</td>
                        <td className="px-2 py-2 text-right">{employee.subtotal.tardiness}</td>
                        <td className="px-2 py-2 text-right">{employee.subtotal.undertime}</td>
                        <td className="px-2 py-2 text-right">{employee.subtotal.absences}</td>
                        <td className="px-2 py-2 text-right">{employee.subtotal.leaveWithPay}</td>
                      </tr>
                      <tr className="h-4"></tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>*/}
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 border-l-4 border-blue-500 rounded-lg p-4">
            <h1 className="text-white">Daily Time Record Monitoring</h1>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6">
            {/* Info Section */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-3">
                    Monitor and generate daily time record reports for employees. Filter by date range, employee status, and organizational groups.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Filter by date range</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Export to Excel format</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Multiple report types</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Print ready reports</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel - Date Range & Filters */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-gray-900 mb-6">Date Range</h3>

                      {/* Date From */}
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm mb-2">Date From</label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={dateFrom}
                              onChange={(e) => setDateFrom(e.target.value)}
                              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                          <CalendarPopover
                            date={dateFrom}
                            onChange={setDateFrom}
                          />
                        </div>
                      </div>

                      {/* Date To */}
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm mb-2">Date To</label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={dateTo}
                              onChange={(e) => setDateTo(e.target.value)}
                              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                          <CalendarPopover
                            date={dateTo}
                            onChange={setDateTo}
                          />
                        </div>
                      </div>

                      {/* Sort Alphabetically */}
                      <div className="mb-6">
                        <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={sortAlphabetically}
                            onChange={(e) => setSortAlphabetically(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">Sort Alphabetically</span>
                        </label>
                      </div>

                      {/* Status Radio Buttons */}
                      <div className="mb-6">
                        <div className="space-y-2">
                          <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                            <input
                              type="radio"
                              name="status"
                              value="Active"
                              checked={empStatus === 'Active'}
                              onChange={(e) => setEmpStatus(e.target.value as 'Active' | 'InActive' | 'All')}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">Active</span>
                          </label>
                          <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                            <input
                              type="radio"
                              name="status"
                              value="InActive"
                              checked={empStatus === 'InActive'}
                              onChange={(e) => setEmpStatus(e.target.value as 'Active' | 'InActive' | 'All')}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">In Active</span>
                          </label>
                          <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                            <input
                              type="radio"
                              name="status"
                              value="All"
                              checked={empStatus === 'All'}
                              onChange={(e) => setEmpStatus(e.target.value as 'Active' | 'InActive' | 'All')}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">All</span>
                          </label>
                        </div>
                      </div>

                      {/* Employee Code */}
                      <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Employee Code</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={empCode}
                            onChange={(e) => setEmpCode(e.target.value)}
                            className="flex-grow min-w-0 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Select Employee"
                            readOnly
                          />

                          <button
                            onClick={() => setShowSearchModal(true)}
                            className="flex-shrink-0 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Search className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => { setEmpCode(""); setEmpName(""); }}
                            className="flex-shrink-0 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        {empCode &&(<label className="block mt-2">Employee Name: {empName}</label>)}
                      </div>
                      {/* Employee List Section */}
                        {showSearchModal && (<div className="mb-6 bg-gray-50 rounded-lg border border-gray-200 p-5">
                          {/* Search Modal */}
                      
                        <>
                          {/* Modal Backdrop */}
                          <div 
                            className="fixed inset-0 bg-black/30 z-30"
                            onClick={() => setShowSearchModal(false)}
                          ></div>
                
                          {/* Modal Dialog */}
                          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                                <h3 className="text-blue-600 mb-2 text-sm">Select Employee</h3>
                
                                {/* Search Input */}
                                <div className="flex items-center gap-2 mb-3">
                                  <label className="text-gray-700 text-sm">Search:</label>
                                  <input
                                    type="text"
                                    value={employeeSearchTerm}
                                    onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  />
                                </div>
                
                                {/* Employee Table */}
                                <div className="border border-gray-200 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                  <table className="w-full border-collapse text-sm">
                                    <thead className="sticky top-0 bg-white">
                                      <tr className="bg-gray-100 border-b-2 border-gray-300">
                                        <th className="px-3 py-1.5 text-left text-gray-700 text-sm">EmpCode</th>
                                        <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Name</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {filteredEmployees.map((emp, index) => (
                                        <tr 
                                          key={emp.empCode}
                                          className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                                          onClick={() => handleEmployeeSelect(emp.empCode, emp.lName + ", " + emp.fName + " " + emp.mName)}
                                        >
                                          <td className="px-3 py-1.5">{emp.empCode}</td>
                                          <td className="px-3 py-1.5">{emp.lName}, {emp.fName} {emp.mName}</td>
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
                              </div>
                            </div>
                          </div>
                        </>
                      
                      </div>)}
                      {/* Report Type Dropdown */}
                      <div className="mb-6">
                        <select
                          value={reportType}
                          onChange={(e) => setReportType(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                        >
                          <option value="Accumulation">Accumulation</option>
                          <option value="Adjustment">Adjustment</option>
                          <option value="Allowance">Allowance</option>
                          <option value="Application Report">Application Report</option>
                          <option value="Assumed Days">Assumed Days</option>
                          <option value="Attendance Ratio">Attendance Ratio</option>
                          <option value="Attendance Summary">Attendance Summary</option>
                          <option value="Consecutive Absences">Consecutive Absences</option>
                          <option value="Count Of Employee Per Workshift">Count Of Employee Per Workshift</option>
                          <option value="Daily Time">Daily Time</option>
                          <option value="Device Code Report">Device Code Report</option>
                          <option value="Employees Raw Data Report">Employees Raw Data Report</option>
                          <option value="Employees Raw In And Out (From Update Rawdata)">Employees Raw In And Out (From Update Rawdata)</option>
                          <option value="Employees With No Workshift">Employees With No Workshift</option>
                          <option value="Exemption Report">Exemption Report</option>
                          <option value="In And Out By Position">In And Out By Position</option>
                          <option value="Leave And Absences">Leave And Absences</option>
                          <option value="Man Hours">Man Hours</option>
                          <option value="Man Hours By Division-Branch-Category-Dept-Section">Man Hours By Division-Branch-Category-Dept-Section</option>
                          <option value="No In And Out">No In And Out</option>
                          <option value="Overtime">Overtime</option>
                          <option value="Perfect Attendance">Perfect Attendance</option>
                          <option value="Questionable Entries">Questionable Entries</option>
                          <option value="Questionable Workshifts">Questionable Workshifts</option>
                          <option value="Restday in a Week">Restday in a Week</option>
                          <option value="Tardiness">Tardiness</option>
                          <option value="Tardiness/ Overbreak/ Undertime Violation">Tardiness/ Overbreak/ Undertime Violation</option>
                          <option value="Tardiness And Undertime Report">Tardiness And Undertime Report</option>
                          <option value="Tardiness Penalty">Tardiness Penalty</option>
                          <option value="Timesheet">Timesheet</option>
                          <option value="Unauthorized Absences">Unauthorized Absences</option>
                          <option value="Undertime">Undertime</option>
                          <option value="User Group Access">User Group Access</option>
                          <option value="User TK Group Access">User TK Group Access</option>
                        </select>
                      </div>
                      {/* User Group */}
                      {reportType == "User Group Access" && (<div className="mb-6">
                        <label className="block text-gray-700 mb-2">User Group</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="flex-grow min-w-0 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Select User Group"
                            readOnly
                          />

                          <button
                            onClick={() => setShowGroupSearchModal(true)}
                            className="flex-shrink-0 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Search className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => { setGroupName(""); setGroupDesc(""); }}
                            className="flex-shrink-0 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>)}
                      {/* User Group List Section */}
                        {showGroupSearchModal && (<div className="mb-6 bg-gray-50 rounded-lg border border-gray-200 p-5">
                          {/* Search Modal */}
                      
                        <>
                          {/* Modal Backdrop */}
                          <div 
                            className="fixed inset-0 bg-black/30 z-30"
                            onClick={() => setShowGroupSearchModal(false)}
                          ></div>
                
                          {/* Modal Dialog */}
                          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg shadow-2xl border border-gray-300">
                              {/* Modal Header */}
                              <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                                <h2 className="text-gray-800 text-sm">Search</h2>
                                <button 
                                  onClick={() => setShowGroupSearchModal(false)}
                                  className="text-gray-600 hover:text-gray-800"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                
                              {/* Modal Content */}
                              <div className="p-3">
                                <h3 className="text-blue-600 mb-2 text-sm">Select User Group</h3>
                
                                {/* Search Input */}
                                <div className="flex items-center gap-2 mb-3">
                                  <label className="text-gray-700 text-sm">Search:</label>
                                  <input
                                    type="text"
                                    value={userGroupSearchTerm}
                                    onChange={(e) => setUserGroupSearchTerm(e.target.value)}
                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  />
                                </div>
                
                                {/* Employee Table */}
                                <div className="border border-gray-200 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                  <table className="w-full border-collapse text-sm">
                                    <thead className="sticky top-0 bg-white">
                                      <tr className="bg-gray-100 border-b-2 border-gray-300">
                                        <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Group Name</th>
                                        <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Group Description</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {filteredUserGroup.map((emp, index) => (
                                        <tr 
                                          key={emp.groupName}
                                          className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                                          onClick={() => handleGroupSelect(emp.groupName, groupDesc)}
                                        >
                                          <td className="px-3 py-1.5">{emp.groupName}</td>
                                          <td className="px-3 py-1.5">{emp.groupDesc}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                
                                {/* Pagination */}
                                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                                <span>
                                  Showing {startUserGroupIndex + 1} to {Math.min(endUserGroupIndex, filteredUserGroup.length)} of {filteredUserGroup.length} entries
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setCurrentUserGroupPage(p => Math.max(1, p - 1))}
                                    disabled={currentUserGroupPage === 1}
                                    className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Previous
                                  </button>
                                  {getUserGroupPageNumbers().map((page, index) => (
                                    typeof page === 'number' ? (
                                      <button
                                        key={index}
                                        onClick={() => setCurrentUserGroupPage(page)}
                                        className={`px-2 py-1 rounded text-xs ${
                                          currentUserGroupPage === page
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
                                    onClick={() => setCurrentUserGroupPage(p => Math.min(totalUserGroupPages, p + 1))}
                                    disabled={currentUserGroupPage === totalUserGroupPages}
                                    className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Next
                                  </button>
                                </div>
                              </div>
                              </div>
                            </div>
                          </div>
                        </>
                      
                      </div>)}

                      {/* Checkboxes */}
                      <div className="mb-6 space-y-2">
                        {/* {reportType != "Attendance Summary" &&(<label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={toExcelFile}
                            onChange={(e) => setToExcelFile(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">To Excel File</span>
                        </label>)} */}
                        {["Leave And Absences", "Daily Time", "Attendance Summary", "Adjustment", "Assumed Days", "Overtime",
                          "Tardiness", "Unauthorized Absences", "Undertime"
                        ].includes(reportType) 
                        &&(<label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={convertToHHMM}
                            onChange={(e) => setConvertToHHMM(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">Convert To HH:MM</span>
                        </label>)}
                        {reportType == "Perfect Attendance" && (<div>
                          <label className="mb-3 flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={includeWPay}
                              onChange={(e) => setIncludeWPay(e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">Include With Pay</span>
                          </label>
                          <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={includeWOutPay}
                              onChange={(e) => setIncludeWOutPay(e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">Include Without Pay</span>
                          </label>
                        </div>)}
                        {/*Restday Options*/}
                        {reportType == "Restday in a Week" &&(<div>
                          <div className="flex items-center space-x-3 mb-4">
                            <label className="text-gray-700 text-sm">Number of Restday:</label>
                            <input
                              type="text"
                              value={noOfFilter}
                              maxLength={3}
                              inputMode="numeric"
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "").slice(0, 3);
                                setNoOfFilter(value);
                              }}
                              className="w-16 px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-center space-x-3 mb-4">
                            <label className="text-gray-700 text-sm">Start of Week:</label>
                              <select
                              value={weekName}
                              onChange={(e) => setWeekName(e.target.value)}
                              className="w-28 px-2 py-2 bg-gray border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              <option></option>
                              <option value="Monday">Monday</option>
                              <option value="Tuesday">Tuesday</option>
                              <option value="Wednesday">Wednesday</option>
                              <option value="Thursday">Thursday</option>
                              <option value="Friday">Friday</option>
                              <option value="Saturday">Saturday</option>
                              <option value="Sunday">Sunday</option>
                            </select>
                          </div>
                        </div>)}
                        {/*Tardiness Report Options*/}
                        {reportType == "Tardiness" &&(<div>
                          <span>Options</span>
                          <div className="mt-4 mb-4 flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="tardinessReportOption"
                                value="Listing"
                                disabled={convertToRawData}
                                checked={tardinessOptions === 'Listing'}
                                onChange={(e) => setTardinessOptions(e.target.value as 'Listing' | 'Periodic')}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className={`text-sm ${convertToRawData ? "text-gray-400" : "text-gray-700"}`}>
                                Listing
                              </span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="tardinessReportOption"
                                value="Periodic"
                                disabled={convertToRawData}
                                checked={tardinessOptions === 'Periodic'}
                                onChange={(e) => setTardinessOptions(e.target.value as 'Listing' | 'Periodic')}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className={`text-sm ${convertToRawData ? "text-gray-400" : "text-gray-700"}`}>
                                Periodic Tardiness
                              </span>
                            </label>
                          </div>
                          {tardinessOptions == "Periodic" && (<div className="flex items-center space-x-3 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="instancesOption"
                                value={0}
                                disabled={convertToRawData}
                                checked={instanceOptions === 0}
                                onChange={(e) => setInstanceOptions(Number(e.target.value))}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                            </label>
                            <label className={`text-sm ${convertToRawData ? "text-gray-400" : "text-gray-700 text-sm"}`}>Instance:</label>
                            <input
                              type="text"
                              value={instanceNum}
                              maxLength={20}
                              inputMode="numeric"
                              disabled={convertToRawData}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "").slice(0, 20);
                                setInstanceNum(value);
                              }}
                              className="w-16 px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="instancesOption"
                                value={1}
                                disabled={convertToRawData}
                                checked={instanceOptions === 1}
                                onChange={(e) => setInstanceOptions(Number(e.target.value))}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                            </label>
                            <label className={`text-sm ${convertToRawData ? "text-gray-400" : "text-gray-700 text-sm"}`}>No. of Minutes</label>
                            <input
                              type="text"
                              value={minutesNum}
                              maxLength={20}
                              inputMode="numeric"
                              disabled={convertToRawData}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "").slice(0, 20);
                                setMinutesNum(value);
                              }}
                              className="w-16 px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>)}
                          <div className="mt-4 mb-4 flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="gPeriodOption"
                                value={0}
                                checked={periodOptions === 0}
                                onChange={(e) => setPeriodOptions(Number(e.target.value))}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">All</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="gPeriodOption"
                                value={1}
                                checked={periodOptions === 1}
                                onChange={(e) => setPeriodOptions(Number(e.target.value))}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">After Grace Period</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="gPeriodOption"
                                value={2}
                                checked={periodOptions === 2}
                                onChange={(e) => setPeriodOptions(Number(e.target.value))}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Within Grace Period</span>
                            </label>
                          </div>
                          <div className="mb-6 space-y-2">
                            <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                              <input
                                type="checkbox"
                                checked={convertToRawData}
                                onChange={(e) => setConvertToRawData(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            <span className="text-gray-700">From Raw Data</span>
                            </label>
                          </div>
                          <div className="mt-4 mb-4 flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="rawDataOption"
                                value="Actual"
                                checked={rawDataOptions === 'Actual'}
                                onChange={(e) => setRawDataOptions(e.target.value as 'Actual' | 'Policy')}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Based on Actual Time</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="rawDataOption"
                                value="Policy"
                                checked={rawDataOptions === 'Policy'}
                                onChange={(e) => setRawDataOptions(e.target.value as 'Actual' | 'Policy')}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Based on Policy</span>
                            </label>
                          </div>
                        </div>)}
                        {/*Tardiness Penalty Options*/}
                        {reportType == "Tardiness Penalty" &&(<div>
                          <span>Options</span>
                          <div className="mt-4 mb-4 flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="tardyOption"
                                value="Month"
                                checked={tardyOptions === 'Month'}
                                onChange={(e) => setTardyOptions(e.target.value as 'Month' | 'Per Department' | 'Annual')}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Tardiness Penalty Per Month</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="tardyOption"
                                value="Per Department"
                                checked={tardyOptions === 'Per Department'}
                                onChange={(e) => setTardyOptions(e.target.value as 'Month' | 'Per Department' | 'Annual')}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Tardiness Penalty Per Department</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="tardyOption"
                                value="Annual"
                                checked={tardyOptions === 'Annual'}
                                onChange={(e) => setTardyOptions(e.target.value as 'Month' | 'Per Department' | 'Annual')}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Tardiness Penalty Annual</span>
                            </label>
                          </div>
                          <div className="flex items-center space-x-3 mb-4">
                            <label className="text-gray-700 text-sm">Year:</label>
                            <input
                              type="text"
                              value={year}
                              maxLength={5}
                              inputMode="numeric"
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "").slice(0, 5);
                                setYear(value);
                              }}
                              className="w-16 px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-center space-x-3 mb-4">
                            <label className="text-gray-700 text-sm">Month:</label>
                              <select
                              value={month}
                              onChange={(e) => setMonth(e.target.value)}
                              className="w-28 px-2 py-2 bg-gray border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              <option></option>
                              <option value="1">January</option>
                              <option value="2">February</option>
                              <option value="3">March</option>
                              <option value="4">April</option>
                              <option value="5">May</option>
                              <option value="6">June</option>
                              <option value="7">July</option>
                              <option value="8">August</option>
                              <option value="9">September</option>
                              <option value="10">October</option>
                              <option value="11">November</option>
                              <option value="12">December</option>
                            </select>
                          </div>
                        </div>)}
                        {/*Consecutive Absences*/}
                        {reportType == "Consecutive Absences" && (<div className="mb-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <label className="text-gray-700">Years of Service</label>
                            <input
                              type="text"
                              value={yearsOfService}
                              maxLength={3}
                              inputMode="numeric"
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "").slice(0, 3);
                                setYearsOfService(value);
                              }}
                              className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="flex items-center space-x-3">
                            <label className="text-gray-700">Consecutive Absences</label>
                            <input
                              type="text"
                              value={noOfConsecutiveAbsences}
                              maxLength={3}
                              inputMode="numeric"
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "").slice(0, 3);
                                setNoOfConsecutiveAbsences(value);
                              }}
                              className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>)}
                        {/*Consecutive Absences*/}
                        {reportType == "Questionable Workshifts" && (<div className="mb-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <label className="text-gray-700">Max Minutes:</label>
                            <input
                              type="text"
                              value={minutes}
                              maxLength={20}
                              inputMode="numeric"
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "").slice(0, 20);
                                setMinutes(value);
                              }}
                              className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>)}
                        {/*Undertime Checkbox */}
                        {reportType == "Undertime" && (<label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={utRawData}
                            onChange={(e) => setUTRawData(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">From Raw Data</span>
                        </label>)}
                        {/* Process Type Checkboxes */}
                        {reportType == "Exemption Report" &&(<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <label className="flex items-center gap-2 cursor-pointer mb-3 pb-3 border-b border-blue-200">
                            <input type="checkbox" checked={processOptions.selectAll} onChange={() => handleOptionChange('selectAll')}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-900">Select All</span>
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {([
                              ['tardiness', 'Tardiness'],
                              ['undertime', 'Undertime'],
                              ['nightDiffBasic', 'Night Diff Basic'],
                              ['overtime', 'Overtime'],
                              ['absences', 'Absences'],
                              ['otherEarnAllowances', 'Other Earn Allowances'],
                              ['holidayPay', 'Holiday Pay'],
                            ] as [keyof typeof processOptions, string][]).map(([key, label]) => (
                              <label key={key} className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={processOptions[key] as boolean} onChange={() => handleOptionChange(key)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{label}</span>
                              </label>
                            ))}
                          </div>
                        </div>)}
                        {/*Incomplete Logs*/}
                        {reportType == "No In And Out" &&(<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <label className="flex items-center gap-2 cursor-pointer mb-3 pb-3 border-b border-blue-200">
                            <input type="checkbox" checked={logsOptions.incompleteLogs} onChange={() => handleLogsChange('incompleteLogs')}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-900">Incomplete Logs</span>
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                            {([
                              ['logs', 'Time In and Time Out'],
                              ['break1', 'Break 1 In and Break 1 Out'],
                              ['break2', 'Break 2 In and Break 2 Out'],
                              ['break3', 'Break 3 In and Break 3 Out'],
                            ] as [keyof typeof logsOptions, string][]).map(([key, label]) => (
                              <label key={key} className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" 
                                  checked={logsOptions[key] as boolean}
                                  disabled={!logsOptions.incompleteLogs} 
                                  onChange={() => handleLogsChange(key)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{label}</span>
                              </label>
                            ))}
                          </div>
                        </div>)}
                        {/*Employee No Workshift Options*/}
                        {reportType == "Employees With No Workshift" &&(<div>
                        <span>Options</span>
                          <div className="mt-4 mb-4 flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="noShiftOption"
                                value={1}
                                checked={noShiftOptions === 1}
                                onChange={(e) => setNoShiftOptions(Number(e.target.value))}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Employee Workshift</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="noShiftOption"
                                value={2}
                                checked={noShiftOptions === 2}
                                onChange={(e) => setNoShiftOptions(Number(e.target.value))}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Raw Data</span>
                            </label>
                          </div>
                          <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={include}
                              onChange={(e) => setInclude(e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">Include Transaction with Shift</span>
                          </label>
                        </div>)}
                        {/*Undertime Raw Data Options*/}
                        {utRawData == true &&(<div>
                        <span>Options</span>
                          <div className="mt-4 mb-4 flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="utOption"
                                value="Policy"
                                checked={utOptions === 'Policy'}
                                onChange={(e) => setUTOptions(e.target.value as 'Policy' | 'ActualTime')}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Based on Policy</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="utOption"
                                value="ActualTime"
                                checked={utOptions === 'ActualTime'}
                                onChange={(e) => setUTOptions(e.target.value as 'Policy' | 'ActualTime')}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Based on Actual Time</span>
                            </label>
                          </div>
                        </div>)}
                        {/*Man Hours Options*/}
                        {reportType == "Man Hours" &&(<div>
                        <span>Options</span>
                          <div className="mt-4 mb-4 flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="hrsOption"
                                value="Per Employee"
                                checked={hrsOptions === 'Per Employee'}
                                onChange={(e) => setHrsOptions(e.target.value as 'Per Employee' | 'Summary')}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Per Employee</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="hrsOption"
                                value="Summary"
                                checked={hrsOptions === 'Summary'}
                                onChange={(e) => setHrsOptions(e.target.value as 'Per Employee' | 'Summary')}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Summary</span>
                            </label>
                          </div>
                        </div>)}
                        {reportType == "Employees Raw Data Report" &&(<div>
                          <label className="block text-gray-700 text-sm mb-2">Raw Data Type:</label>
                          <select
                          value={dataMode}
                          onChange={(e) => setDataMode(e.target.value)}
                          className="mb-4 w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          
                          <option value="CompleteLogs">Complete Logs</option>
                          <option value="IncompleteLogs">Incomplete Logs</option>
                        </select>
                        </div>)}
                        {/*Count Employee Per Shift Options*/}
                        {reportType == "Count Of Employee Per Workshift" &&(<div>
                        <span>Options</span>
                          <div className="mt-4 mb-4 flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="empShiftOption"
                                value="Count"
                                checked={empShiftOptions === 'Count'}
                                onChange={(e) => setEmpShiftOptions(e.target.value as 'Count' | 'Listing')}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Count</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="empShiftOption"
                                value="Listing"
                                checked={empShiftOptions === 'Listing'}
                                onChange={(e) => setEmpShiftOptions(e.target.value as 'Count' | 'Listing')}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">List</span>
                            </label>
                          </div>
                          {/* <button
                            onClick={() => setShowOvertimeSearchModal(true)}
                            className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 shadow-md"
                          >
                            Filter Overtime Code
                          </button> */}
                          
                        </div>)}
                        {/* Count Employees Per Shift - Workshift */}
                        {reportType == "Count Of Employee Per Workshift" && (<div className="mb-6">
                          <label className="block text-gray-700 mb-2">Workshift Code</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={workShiftCode}
                              onChange={(e) => setWorkshiftCode(e.target.value)}
                              className="flex-grow min-w-0 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              placeholder="Select Workshift"
                              readOnly
                            />

                            <button
                              onClick={() => setShowShiftSearchModal(true)}
                              className="flex-shrink-0 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Search className="w-5 h-5" />
                            </button>

                            <button
                              onClick={() => { setWorkshiftCode(""); setWorkshiftDesc(""); }}
                              className="flex-shrink-0 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>)}
                        {/* Workshift Section */}
                          {showShiftSearchModal && (<div className="mb-6 bg-gray-50 rounded-lg border border-gray-200 p-5">
                            {/* Search Modal */}
                        
                          <>
                            {/* Modal Backdrop */}
                            <div 
                              className="fixed inset-0 bg-black/30 z-30"
                              onClick={() => setShowShiftSearchModal(false)}
                            ></div>
                  
                            {/* Modal Dialog */}
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                              <div className="bg-white rounded-lg shadow-2xl border border-gray-300">
                                {/* Modal Header */}
                                <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                                  <h2 className="text-gray-800 text-sm">Search</h2>
                                  <button 
                                    onClick={() => setShowShiftSearchModal(false)}
                                    className="text-gray-600 hover:text-gray-800"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                  
                                {/* Modal Content */}
                                <div className="p-3">
                                  <h3 className="text-blue-600 mb-2 text-sm">Select Workshift</h3>
                  
                                  {/* Search Input */}
                                  <div className="flex items-center gap-2 mb-3">
                                    <label className="text-gray-700 text-sm">Search:</label>
                                    <input
                                      type="text"
                                      value={workShiftSearchTerm}
                                      onChange={(e) => setWorkshiftSearchTerm(e.target.value)}
                                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                  </div>
                  
                                  {/* Employee Table */}
                                  <div className="border border-gray-200 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    <table className="w-full border-collapse text-sm">
                                      <thead className="sticky top-0 bg-white">
                                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                                          <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Code</th>
                                          <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Description</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {filteredWorkshift.map((emp, index) => (
                                          <tr 
                                            key={emp.workShiftCode}
                                            className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                                            onClick={() => handleWorkshiftSelect(emp.workShiftCode, emp.workShiftDesc)}
                                          >
                                            <td className="px-3 py-1.5">{emp.workShiftCode}</td>
                                            <td className="px-3 py-1.5">{emp.workShiftDesc}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                  
                                  {/* Pagination */}
                                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                                  <span>
                                    Showing {startWorkshiftIndex + 1} to {Math.min(endWorkshiftIndex, filteredWorkshift.length)} of {filteredWorkshift.length} entries
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => setCurrentWorkshiftPage(p => Math.max(1, p - 1))}
                                      disabled={currentWorkshiftPage === 1}
                                      className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      Previous
                                    </button>
                                    {getWorkshiftPageNumbers().map((page, index) => (
                                      typeof page === 'number' ? (
                                        <button
                                          key={index}
                                          onClick={() => setCurrentWorkshiftPage(page)}
                                          className={`px-2 py-1 rounded text-xs ${
                                            currentWorkshiftPage === page
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
                                      onClick={() => setCurrentWorkshiftPage(p => Math.min(totalWorkshiftPages, p + 1))}
                                      disabled={currentWorkshiftPage === totalWorkshiftPages}
                                      className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      Next
                                    </button>
                                  </div>
                                </div>
                                </div>
                              </div>
                            </div>
                          </>
                        
                        </div>)}
                        {/*Overtime Options*/}
                        {reportType == "Overtime" &&(<div>
                        <span>Options</span>
                          <div className="mt-4 mb-4 flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="otOption"
                                value="Listing"
                                checked={otOptions === 'Listing'}
                                onChange={(e) => setOTOptions(e.target.value as 'Listing' | 'Summary')}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Listing</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="otOption"
                                value="Summary"
                                checked={otOptions === 'Summary'}
                                onChange={(e) => setOTOptions(e.target.value as 'Listing' | 'Summary')}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Summary</span>
                            </label>
                          </div>
                          <button
                            onClick={() => setShowOvertimeSearchModal(true)}
                            className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 shadow-md"
                          >
                            Filter Overtime Code
                          </button>
                        </div>)}
                        {/* Overtime Section */}
                        {showOvertimeSearchModal && (<div className="mb-6 bg-gray-50 rounded-lg border border-gray-200 p-5">
                          {/* Search Modal */}
                      
                        <>
                          {/* Modal Backdrop */}
                          <div 
                            className="fixed inset-0 bg-black/30 z-30"
                            onClick={() => setShowOvertimeSearchModal(false)}
                          ></div>
                
                          {/* Modal Dialog */}
                          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg shadow-2xl border border-gray-300">
                              {/* Modal Header */}
                              <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                                <h2 className="text-gray-800 text-sm">Search</h2>
                                <button 
                                  onClick={() => setShowOvertimeSearchModal(false)}
                                  className="text-gray-600 hover:text-gray-800"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                
                              {/* Modal Content */}
                              <div className="p-3">
                                <h3 className="text-blue-600 mb-2 text-sm">Select Overtime</h3>
                
                                {/* Search Input */}
                                <div className="flex items-center gap-2 mb-3">
                                  <label className="text-gray-700 text-sm">Search:</label>
                                  <input
                                    type="text"
                                    value={overtimeSearchTerm}
                                    onChange={(e) => setOvertimeSearchTerm(e.target.value)}
                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  />
                                </div>
                
                                {/* Overtime Table */}
                                <div className="border border-gray-200 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                  <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                      <tr>
                                        <th className="px-4 py-3 text-center" style={{ width: '50px' }}>
                                          <input
                                            type="checkbox"
                                            // checked={selectedItems.length === records.length}
                                            checked={selectedOTItems.length === filteredOvertime.length && filteredOvertime.length > 0}
                                            onChange={handleSelectOTAll}
                                            className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                          />
                                        </th>
                                        <th className="px-4 py-3 text-left text-gray-700">Code</th>
                                        <th className="px-4 py-3 text-left text-gray-700">Description</th>
                                          </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {paginatedOT.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                          <td className="px-4 py-3 text-center">
                                            <input
                                              type="checkbox"
                                              checked={selectedOTItems.includes(item.code)}
                                              onChange={() => handleOTItemToggle(item.code)}
                                              className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                            />
                                          </td>
                                          <td className="px-4 py-3 text-gray-900">{item.code}</td>
                                          <td className="px-4 py-3 text-gray-600">{item.description}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                
                                {/* Pagination */}
                                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                                <span>
                                  Showing {startOTIndex + 1} to {Math.min(endOTIndex, filteredOvertime.length)} of {filteredOvertime.length} entries
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setCurrentOTPage(p => Math.max(1, p - 1))}
                                    disabled={currentOTPage === 1}
                                    className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Previous
                                  </button>
                                  {getOTPageNumbers().map((page, index) => (
                                    typeof page === 'number' ? (
                                      <button
                                        key={index}
                                        onClick={() => setCurrentOTPage(page)}
                                        className={`px-2 py-1 rounded text-xs ${
                                          currentOTPage === page
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
                                    onClick={() => setCurrentOTPage(p => Math.min(totalOvertimePages, p + 1))}
                                    disabled={currentOTPage === totalOvertimePages}
                                    className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Next
                                  </button>
                                </div>
                              </div>
                              </div>
                            </div>
                          </div>
                        </>
                      
                      </div>)}
                        {reportType == "Employees Raw Data Report" &&(<div>
                          <label className="block text-gray-700 text-sm mb-2">Raw Data Type:</label>
                          <select
                          value={dataMode}
                          onChange={(e) => setDataMode(e.target.value)}
                          className="mb-4 w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          
                          <option value="CompleteLogs">Complete Logs</option>
                          <option value="IncompleteLogs">Incomplete Logs</option>
                        </select>
                        </div>)}
                        {reportType == "Application Report" &&(<div>
                          <label className="block text-gray-700 text-sm mb-2">Application Type:</label>
                          <select
                          value={appMode}
                          onChange={(e) => setAppMode(e.target.value)}
                          className="mb-4 w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          
                          <option value="OvertimeApplication">Overtime Application</option>
                          <option value="LeaveAppplication">Leave Application</option>
                        </select>
                        </div>)}
                        {reportType == "Leave And Absences" &&(<label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={includeLeaveAdj}
                            onChange={(e) => setIncludeLeaveAdj(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">Include Leave Adjustment</span>
                        </label>)}
                      </div>
                      {/* Filter Status For Leave and Absences */}
                      {reportType == "Leave And Absences" &&(<div>
                        <span>Status</span>
                        <div className="mt-4 mb-4 flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="leaveStatus"
                              value="Active"
                              checked={status === 'Active'}
                              onChange={(e) => setStatus(e.target.value as 'Active' | 'InActive' | 'All')}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Active</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="leaveStatus"
                              value="InActive"
                              checked={status === 'InActive'}
                              onChange={(e) => setStatus(e.target.value as 'Active' | 'InActive' | 'All')}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">In Active</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="leaveStatus"
                              value="All"
                              checked={status === 'All'}
                              onChange={(e) => setStatus(e.target.value as 'Active' | 'InActive' | 'All')}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">All</span>
                          </label>
                        </div>
                      </div>)}
                      {/* Filter Mode For Leave and Absences */}
                      {reportType == "Leave And Absences" &&(<div>
                        <span>Options</span>
                        <div className="mt-4 mb-4 flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="leaveMode"
                              value="Absences"
                              checked={mode === 'Absences'}
                              onChange={(e) => setMode(e.target.value as 'Absences' | 'Leave' | 'All')}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Absences</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="leaveMode"
                              value="Leave"
                              checked={mode === 'Leave'}
                              onChange={(e) => setMode(e.target.value as 'Absences' | 'Leave' | 'All')}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Leave</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="leaveMode"
                              value="All"
                              checked={mode === 'All'}
                              onChange={(e) => setMode(e.target.value as 'Absences' | 'Leave' | 'All')}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">All</span>
                          </label>
                        </div>
                        {/* Leave Type Selection */}
                        {mode == "Leave" &&(<div>
                          <label className="block text-gray-700 text-sm mb-2">Leave Type:</label>
                          <select
                            value={selectedLeaveType}
                            onChange={(e) => setSelectedLeaveType(e.target.value)}
                            className="mb-4 w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option></option>
                            {getLeaveType.map(getLeaveType => (
                              <option
                                key={getLeaveType.leaveCode}
                                value={getLeaveType.leaveCode}
                              >
                                {getLeaveType.leaveDesc}
                              </option>
                            ))}
                          </select>
                        </div>)}
                        {mode == "Leave" &&(<div className="mt-4 mb-4 flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="wPay"
                              value="WithPay"
                              checked={withOrWOutPay === 'WithPay'}
                              onChange={(e) => setWithOrWOutPay(e.target.value as 'WithPay' | 'WithOutPay' | 'All')}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">With Pay</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="wPay"
                              value="WithOutPay"
                              checked={withOrWOutPay === 'WithOutPay'}
                              onChange={(e) => setWithOrWOutPay(e.target.value as 'WithPay' | 'WithOutPay' | 'All')}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Without Pay</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="wPay"
                              value="All"
                              checked={withOrWOutPay === 'All'}
                              onChange={(e) => setWithOrWOutPay(e.target.value as 'WithPay' | 'WithOutPay' | 'All')}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">All</span>
                          </label>
                        </div>)}
                      </div>)}

                      {/* Display Button */}
                      <button
                        onClick={printReport}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg shadow-blue-500/30"
                      >
                        Download Report
                      </button>
                </div>
              </div>

              {/* Right Panel - Tabs and Table */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Tabs */}
                  <div className="mb-6 flex items-center gap-1 border-b border-gray-200 flex-wrap p-6 pb-0">
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
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Search */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-end">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-700">Search:</span>
                        <input
                          type="text"
                          value={groupSearchTerm}
                          onChange={(e) => setGroupSearchTerm(e.target.value)}
                          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Search..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="p-6">
                    {activeTab === "tk-group" && (<div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-center" style={{ width: '50px' }}>
                              <input
                                type="checkbox"
                                // checked={selectedItems.length === records.length}
                                checked={selectedItems.length === filteredGroups.length && filteredGroups.length > 0}
                                onChange={handleSelectAll}
                                className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                              />
                            </th>
                            <th className="px-4 py-3 text-left text-gray-700">Code</th>
                            <th className="px-4 py-3 text-left text-gray-700">Description</th>
                              </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {paginatedGroups.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedItems.includes(item.code)}
                                  onChange={() => handleItemToggle(item.code)}
                                  className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-3 text-gray-900">{item.code}</td>
                              <td className="px-4 py-3 text-gray-600">{item.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>)}
                    {/*branch */}
                    {activeTab === "branch" && (<div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-center" style={{ width: '50px' }}>
                              <input
                                type="checkbox"
                                // checked={selectedItems.length === records.length}
                                checked={selectedBranchItems.length === filteredBranch.length && filteredBranch.length > 0}
                                onChange={handleSelectAll}
                                className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                              />
                            </th>
                            <th className="px-4 py-3 text-left text-gray-700">Code</th>
                            <th className="px-4 py-3 text-left text-gray-700">Description</th>
                              </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {paginatedBranch.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedBranchItems.includes(item.code)}
                                  onChange={() => handleItemToggle(item.code)}
                                  className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-3 text-gray-900">{item.code}</td>
                              <td className="px-4 py-3 text-gray-600">{item.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>)}
                    {/*department */}
                    {activeTab === "department" && (<div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-center" style={{ width: '50px' }}>
                              <input
                                type="checkbox"
                                // checked={selectedItems.length === records.length}
                                checked={selectedDepItems.length === filteredDep.length && filteredDep.length > 0}
                                onChange={handleSelectAll}
                                className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                              />
                            </th>
                            <th className="px-4 py-3 text-left text-gray-700">Code</th>
                            <th className="px-4 py-3 text-left text-gray-700">Description</th>
                              </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {paginatedDep.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedDepItems.includes(item.code)}
                                  onChange={() => handleItemToggle(item.code)}
                                  className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-3 text-gray-900">{item.code}</td>
                              <td className="px-4 py-3 text-gray-600">{item.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>)}
                    {/*designation*/}
                    {activeTab === "designation" && (<div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-center" style={{ width: '50px' }}>
                              <input
                                type="checkbox"
                                // checked={selectedItems.length === records.length}
                                checked={selectedDesItems.length === filteredDes.length && filteredDes.length > 0}
                                onChange={handleSelectAll}
                                className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                              />
                            </th>
                            <th className="px-4 py-3 text-left text-gray-700">Code</th>
                            <th className="px-4 py-3 text-left text-gray-700">Description</th>
                              </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {paginatedDes.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedDesItems.includes(item.code)}
                                  onChange={() => handleItemToggle(item.code)}
                                  className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-3 text-gray-900">{item.code}</td>
                              <td className="px-4 py-3 text-gray-600">{item.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>)}
                    {/*division*/}
                    {activeTab === "division" && (<div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-center" style={{ width: '50px' }}>
                              <input
                                type="checkbox"
                                // checked={selectedItems.length === records.length}
                                checked={selectedDivItems.length === filteredDiv.length && filteredDiv.length > 0}
                                onChange={handleSelectAll}
                                className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                              />
                            </th>
                            <th className="px-4 py-3 text-left text-gray-700">Code</th>
                            <th className="px-4 py-3 text-left text-gray-700">Description</th>
                              </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {paginatedDiv.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedDivItems.includes(item.code)}
                                  onChange={() => handleItemToggle(item.code)}
                                  className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-3 text-gray-900">{item.code}</td>
                              <td className="px-4 py-3 text-gray-600">{item.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>)}
                    {/*section*/}
                    {activeTab === "section" && (<div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-center" style={{ width: '50px' }}>
                              <input
                                type="checkbox"
                                // checked={selectedItems.length === records.length}
                                checked={selectedSecItems.length === filteredSec.length && filteredSec.length > 0}
                                onChange={handleSelectAll}
                                className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                              />
                            </th>
                            <th className="px-4 py-3 text-left text-gray-700">Code</th>
                            <th className="px-4 py-3 text-left text-gray-700">Description</th>
                              </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {paginatedSec.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedSecItems.includes(item.code)}
                                  onChange={() => handleItemToggle(item.code)}
                                  className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-3 text-gray-900">{item.code}</td>
                              <td className="px-4 py-3 text-gray-600">{item.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>)}
                    {/* Pagination */}
                    {activeTab === "tk-group" &&(<div className="flex items-center justify-between mt-3">
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
                    </div>)}
                    {/*branch pagination */}
                    {activeTab === "branch" &&(<div className="flex items-center justify-between mt-3">
                      <div className="text-gray-600 text-xs">
                          Showing {filteredBranch.length === 0 ? 0 : startBranchIndex + 1} to {Math.min(endBranchIndex, filteredBranch.length)} of {filteredBranch.length} entries
                      </div>
                      <div className="flex gap-1">
                          <button
                              onClick={() => setCurrentBranchPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentBranchPage === 1}
                              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              Previous
                          </button>
                          {getBranchPageNumbers().map((page, idx) => (
                              page === '...' ? (
                                  <span key={`ellipsis-${idx}`} className="px-1 text-gray-500 text-xs">...</span>
                              ) : (
                                  <button
                                      key={page}
                                      onClick={() => setCurrentBranchPage(page as number)}
                                      className={`px-2 py-1 rounded text-xs ${currentBranchPage === page
                                              ? 'bg-blue-600 text-white'
                                              : 'border border-gray-300 hover:bg-gray-100'
                                          }`}
                                  >
                                      {page}
                                  </button>
                              )
                          ))}
                          <button
                              onClick={() => setCurrentBranchPage(prev => Math.min(prev + 1, totalBranchPages))}
                              disabled={currentBranchPage === totalBranchPages || totalBranchPages === 0}
                              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              Next
                          </button>
                      </div>
                    </div>)}
                    {/*department pagination */}
                    {activeTab === "department" &&(<div className="flex items-center justify-between mt-3">
                      <div className="text-gray-600 text-xs">
                          Showing {filteredDep.length === 0 ? 0 : startDepIndex + 1} to {Math.min(endDepIndex, filteredDep.length)} of {filteredDep.length} entries
                      </div>
                      <div className="flex gap-1">
                          <button
                              onClick={() => setCurrentDepPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentDepPage === 1}
                              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              Previous
                          </button>
                          {getDepPageNumbers().map((page, idx) => (
                              page === '...' ? (
                                  <span key={`ellipsis-${idx}`} className="px-1 text-gray-500 text-xs">...</span>
                              ) : (
                                  <button
                                      key={page}
                                      onClick={() => setCurrentDepPage(page as number)}
                                      className={`px-2 py-1 rounded text-xs ${currentDepPage === page
                                              ? 'bg-blue-600 text-white'
                                              : 'border border-gray-300 hover:bg-gray-100'
                                          }`}
                                  >
                                      {page}
                                  </button>
                              )
                          ))}
                          <button
                              onClick={() => setCurrentDepPage(prev => Math.min(prev + 1, totalDepPages))}
                              disabled={currentDepPage === totalDepPages || totalDepPages === 0}
                              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              Next
                          </button>
                      </div>
                    </div>)}
                    {/*designation pagination */}
                    {activeTab === "designation" &&(<div className="flex items-center justify-between mt-3">
                      <div className="text-gray-600 text-xs">
                          Showing {filteredDes.length === 0 ? 0 : startDesIndex + 1} to {Math.min(endDesIndex, filteredDes.length)} of {filteredDes.length} entries
                      </div>
                      <div className="flex gap-1">
                          <button
                              onClick={() => setCurrentDesPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentDesPage === 1}
                              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              Previous
                          </button>
                          {getDesPageNumbers().map((page, idx) => (
                              page === '...' ? (
                                  <span key={`ellipsis-${idx}`} className="px-1 text-gray-500 text-xs">...</span>
                              ) : (
                                  <button
                                      key={page}
                                      onClick={() => setCurrentDesPage(page as number)}
                                      className={`px-2 py-1 rounded text-xs ${currentDesPage === page
                                              ? 'bg-blue-600 text-white'
                                              : 'border border-gray-300 hover:bg-gray-100'
                                          }`}
                                  >
                                      {page}
                                  </button>
                              )
                          ))}
                          <button
                              onClick={() => setCurrentDesPage(prev => Math.min(prev + 1, totalDesPages))}
                              disabled={currentDesPage === totalDesPages || totalDesPages === 0}
                              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              Next
                          </button>
                      </div>
                    </div>)}
                    {/*division pagination */}
                    {activeTab === "division" &&(<div className="flex items-center justify-between mt-3">
                      <div className="text-gray-600 text-xs">
                          Showing {filteredDiv.length === 0 ? 0 : startDivIndex + 1} to {Math.min(endDivIndex, filteredDiv.length)} of {filteredDiv.length} entries
                      </div>
                      <div className="flex gap-1">
                          <button
                              onClick={() => setCurrentDivPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentDivPage === 1}
                              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              Previous
                          </button>
                          {getDivPageNumbers().map((page, idx) => (
                              page === '...' ? (
                                  <span key={`ellipsis-${idx}`} className="px-1 text-gray-500 text-xs">...</span>
                              ) : (
                                  <button
                                      key={page}
                                      onClick={() => setCurrentDivPage(page as number)}
                                      className={`px-2 py-1 rounded text-xs ${currentDivPage === page
                                              ? 'bg-blue-600 text-white'
                                              : 'border border-gray-300 hover:bg-gray-100'
                                          }`}
                                  >
                                      {page}
                                  </button>
                              )
                          ))}
                          <button
                              onClick={() => setCurrentDivPage(prev => Math.min(prev + 1, totalDivPages))}
                              disabled={currentDivPage === totalDivPages || totalDivPages === 0}
                              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              Next
                          </button>
                      </div>
                    </div>)}
                    {/*section pagination */}
                    {activeTab === "section" &&(<div className="flex items-center justify-between mt-3">
                      <div className="text-gray-600 text-xs">
                          Showing {filteredSec.length === 0 ? 0 : startSecIndex + 1} to {Math.min(endSecIndex, filteredSec.length)} of {filteredSec.length} entries
                      </div>
                      <div className="flex gap-1">
                          <button
                              onClick={() => setCurrentSecPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentSecPage === 1}
                              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              Previous
                          </button>
                          {getSecPageNumbers().map((page, idx) => (
                              page === '...' ? (
                                  <span key={`ellipsis-${idx}`} className="px-1 text-gray-500 text-xs">...</span>
                              ) : (
                                  <button
                                      key={page}
                                      onClick={() => setCurrentSecPage(page as number)}
                                      className={`px-2 py-1 rounded text-xs ${currentDivPage === page
                                              ? 'bg-blue-600 text-white'
                                              : 'border border-gray-300 hover:bg-gray-100'
                                          }`}
                                  >
                                      {page}
                                  </button>
                              )
                          ))}
                          <button
                              onClick={() => setCurrentSecPage(prev => Math.min(prev + 1, totalSecPages))}
                              disabled={currentSecPage === totalSecPages || totalSecPages === 0}
                              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              Next
                          </button>
                      </div>
                    </div>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}