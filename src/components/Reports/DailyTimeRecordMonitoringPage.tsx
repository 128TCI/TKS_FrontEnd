import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import { Calendar, Search, X, Printer, Check, Clock, Users, Building2, Briefcase, Award, Network, Grid } from 'lucide-react';
import { CalendarPopover } from '../CalendarPopover';
import apiClient from '../../services/apiClient';
import { Footer } from '../Footer/Footer';
import Swal from 'sweetalert2';
import { EmployeeSearchModal } from '../Modals/EmployeeSearchModal';

// ── Types ──────────────────────────────────────────────────────────────────────

type TabType       = 'tk-group' | 'branch' | 'department' | 'designation' | 'division' | 'section';
type StatusType    = 'Active' | 'InActive' | 'All';
type ModeType      = 'Absences' | 'Leave' | 'All';
type HrsOptionType = 'Per Employee' | 'Summary';
type PayType       = 'WithPay' | 'WithOutPay' | 'All';

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

interface ReportFilter {
  empCode:           string;
  dateFr:            string;
  dateTo:            string;
  groups:            string[];
  departments:       string[];
  divisions:         string[];
  branch:            string[];
  designation:       string[];
  section:           string[];
  company:           string;
  address:           string;
  userName:          string;
  mode:              string;
  activeInActiveAll: string;
}

interface LeaveAbsencesFilter {
  empCode:         string;
  dateFr:          string;
  dateTo:          string;
  groups:          string[];
  departments:     string[];
  divisions:       string[];
  branch:          string[];
  designation:     string[];
  section:         string[];
  company:         string;
  address:         string;
  leaveType:       string;
  leaveWithOrWPay: string;
  includeLeaveAdj: boolean;
  status:          string;
  mode:            string;
}

interface DailyRecord {
  date: string; day: string; restDay: boolean;
  timeIn: string; timeOut: string; workShift: string;
  noOfHrs: string; tardiness: string; undertime: string;
  absences: string; leaveWithPay: string;
}

interface EmployeeReport {
  seqNo: number; empCode: string; fullName: string;
  dailyRecords: DailyRecord[];
  subtotal: { noOfHrs: string; tardiness: string; undertime: string; absences: string; leaveWithPay: string };
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
      params.append(key, String(value));
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
    empCode,
    dateFr:          formatDate(dateFrom),
    dateTo:          formatDate(dateTo),
    groups:          idsToCodeList(selectedMap['tk-group'],    tkGroupItems),
    departments:     idsToCodeList(selectedMap['department'],  departmentItems),
    divisions:       idsToCodeList(selectedMap['division'],    divisionItems),
    branch:          idsToCodeList(selectedMap['branch'],      branchItems),
    designation:     idsToCodeList(selectedMap['designation'], designationItems),
    section:         idsToCodeList(selectedMap['section'],     sectionItems),
    company:         '',
    address:         '',
    leaveType:       selectedLeaveType,
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

  // ── Report view ────────────────────────────────────────────────────────────
  if (showReport) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 relative z-10 p-6">
          <div className="max-w-7xl mx-auto relative">
            <div className="flex items-center justify-between mb-6 print:hidden">
              <button
                onClick={() => setShowReport(false)}
                className="px-6 py-3 bg-yellow-500 text-gray-700 rounded-xl hover:bg-yellow-600 transition-colors"
              >
                ← Back to Filters
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Printer className="w-5 h-5" />
                <span>Print Report</span>
              </button>
            </div>
            <div className="bg-white shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-6">
                <h1 className="text-gray-900 mb-2">Daily Time Report</h1>
                <p className="text-gray-600">Period From Mar 01, 2020 to Mar 15, 2020</p>
              </div>
              <div className="border-t-4 border-black mb-6" />
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="px-2 py-2 text-left w-10">Seq. No.</th>
                    <th className="px-2 py-2 text-left w-20">EmpCode</th>
                    <th className="px-2 py-2 text-left w-48">Full Name</th>
                    <th className="px-2 py-2 text-center w-24">IN</th>
                    <th className="px-2 py-2 text-center w-24">OUT</th>
                    <th className="px-2 py-2 text-center w-28">Work Shift</th>
                    <th className="px-2 py-2 text-right w-20">No of Hrs</th>
                    <th className="px-2 py-2 text-right w-20">Tardiness</th>
                    <th className="px-2 py-2 text-right w-20">Undertime</th>
                    <th className="px-2 py-2 text-right w-20">Absences</th>
                    <th className="px-2 py-2 text-right w-20">Leave With Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_REPORT_DATA.map(employee => (
                    <React.Fragment key={employee.empCode}>
                      <tr className="bg-gray-100">
                        <td className="px-2 py-2 align-top">{employee.seqNo}.</td>
                        <td className="px-2 py-2 align-top">{employee.empCode}</td>
                        <td className="px-2 py-2 align-top" colSpan={9}>{employee.fullName}</td>
                      </tr>
                      {employee.dailyRecords.map((record, idx) => (
                        <tr key={idx} className={record.restDay ? 'bg-gray-50' : ''}>
                          <td className="px-2 py-1" />
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
                        <td className="px-2 py-2 text-right" colSpan={6}>Subtotal:</td>
                        <td className="px-2 py-2 text-right">{employee.subtotal.noOfHrs}</td>
                        <td className="px-2 py-2 text-right">{employee.subtotal.tardiness}</td>
                        <td className="px-2 py-2 text-right">{employee.subtotal.undertime}</td>
                        <td className="px-2 py-2 text-right">{employee.subtotal.absences}</td>
                        <td className="px-2 py-2 text-right">{employee.subtotal.leaveWithPay}</td>
                      </tr>
                      <tr className="h-4" />
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>*/}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Main view ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">

          {/* Page Header */}
          <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 border-l-4 border-blue-500 rounded-lg p-4">
            <h1 className="text-white">Daily Time Record Monitoring</h1>
          </div>

          <div className="bg-white rounded-b-lg shadow-lg p-6">

            {/* Info Banner */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-3">
                    Monitor and generate daily time record reports for employees. Filter by date range, employee status, and organizational groups.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {['Filter by date range', 'Export to Excel format', 'Multiple report types', 'Print ready reports'].map(text => (
                      <div key={text} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* ── Left Panel ─────────────────────────────────────────────── */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-gray-900 mb-6">Date Range</h3>

                  {/* Date From */}
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm mb-2">Date From</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="MM/DD/YYYY"
                        />
                      </div>
                      <CalendarPopover date={dateFrom} onChange={setDateFrom} />
                    </div>
                  </div>

                  {/* Date To */}
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm mb-2">Date To</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text" value={dateTo} onChange={e => setDateTo(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="MM/DD/YYYY"
                        />
                      </div>
                      <CalendarPopover date={dateTo} onChange={setDateTo} />
                    </div>
                  </div>

                  {/* Sort Alphabetically */}
                  <div className="mb-6">
                    <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox" checked={sortAlphabetically}
                        onChange={e => setSortAlphabetically(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">Sort Alphabetically</span>
                    </label>
                  </div>

                  {/* Employee Status */}
                  <div className="mb-6 space-y-2">
                    {(['Active', 'InActive', 'All'] as StatusType[]).map(s => (
                      <label key={s} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                        <input
                          type="radio" name="empStatus" value={s}
                          checked={empStatus === s} onChange={() => setEmpStatus(s)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{s === 'InActive' ? 'In Active' : s}</span>
                      </label>
                    ))}
                  </div>

                  {/* Employee Code */}
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Employee Code</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text" value={empCode} readOnly
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        placeholder="Enter employee code"
                      />
                      <button
                        onClick={() => setShowSearchModal(true)}
                        className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Search className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => { setEmpCode(''); setEmpName(''); }}
                        className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    {empCode && (
                      <p className="mt-2 text-sm text-gray-600">Employee Name: {empName}</p>
                    )}
                  </div>

                  {/* Report Type */}
                  <div className="mb-6">
                    <select
                      value={reportType} onChange={e => setReportType(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 appearance-none cursor-pointer"
                    >
                      {[
                        'Accumulation', 'Adjustment', 'Allowance', 'Application Report', 'Assumed Days',
                        'Attendance Ratio', 'Attendance Summary', 'Consecutive Absences',
                        'Count Of Employee Per Workshift', 'Daily Time', 'Device Code Report',
                        'Employees Raw Data Report', 'Employees Raw In And Out (From Update Rawdata)',
                        'Employees With No Workshift', 'Exemption Report', 'In And Out By Position',
                        'Leave And Absences', 'Man Hours',
                        'Man Hours By Division-Branch-Category-Dept-Section', 'No In And Out',
                        'Overtime', 'Perfect Attendance', 'Questionable Entries', 'Questionable Workshifts',
                        'Restday in a Week', 'Tardiness', 'Tardiness/ Overbreak/ Undertime Violation',
                        'Tardiness And Undertime Report', 'Tardiness Penalty', 'Timesheet',
                        'Unauthorized Absences', 'Undertime', 'User Group Access', 'User TK Group Access',
                      ].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  {/* Convert to HH:MM */}
                  {REPORT_TYPES_WITH_HHMM.includes(reportType) && (
                    <label className="flex items-center space-x-3 p-3 mb-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox" checked={convertToHHMM}
                        onChange={e => setConvertToHHMM(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">Convert To HH:MM</span>
                    </label>
                  )}

                  {/* Man Hours options */}
                  {reportType === 'Man Hours' && (
                    <div className="mb-4">
                      <span className="text-sm text-gray-700">Options</span>
                      <div className="mt-2 flex items-center gap-4">
                        {(['Per Employee', 'Summary'] as HrsOptionType[]).map(o => (
                          <label key={o} className="flex items-center gap-2 cursor-pointer">
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
                                type="radio" name="leaveStatus" value={s}
                                checked={status === s} onChange={() => setStatus(s)}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{s === 'InActive' ? 'In Active' : s}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className="text-sm text-gray-700">Options</span>
                        <div className="mt-2 flex items-center gap-4">
                          {(['Absences', 'Leave', 'All'] as ModeType[]).map(m => (
                            <label key={m} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio" name="leaveMode" value={m}
                                checked={mode === m} onChange={() => setMode(m)}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{m}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {mode === 'Leave' && (
                        <>
                          <div className="mb-4">
                            <label className="block text-gray-700 text-sm mb-2">Leave Type:</label>
                            <select
                              value={selectedLeaveType} onChange={e => setSelectedLeaveType(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              <option value="" />
                              {leaveTypes.map(lt => (
                                <option key={lt.leaveCode} value={lt.leaveCode}>{lt.leaveDesc}</option>
                              ))}
                            </select>
                          </div>
                          <div className="mb-4 flex items-center gap-4">
                            {(['WithPay', 'WithOutPay', 'All'] as PayType[]).map(p => (
                              <label key={p} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio" name="wPay" value={p}
                                  checked={withOrWOutPay === p} onChange={() => setWithOrWOutPay(p)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                  {p === 'WithPay' ? 'With Pay' : p === 'WithOutPay' ? 'Without Pay' : 'All'}
                                </span>
                              </label>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {/* Download Button */}
                  <button
                    onClick={printReport}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg shadow-blue-500/30"
                  >
                    Download Report
                  </button>
                </div>
              </div>

              {/* ── Right Panel ────────────────────────────────────────────── */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                  {/* Tabs */}
                  <div className="flex items-center gap-1 border-b border-gray-200 flex-wrap p-6 pb-0">
                    {TABS.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm flex items-center gap-2 rounded-t-lg transition-colors ${
                          activeTab === tab.id
                            ? 'font-medium bg-blue-600 text-white -mb-px'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Table + Search + Pagination */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <label className="text-sm text-gray-700">Search:</label>
                      <input
                        type="text" value={groupSearchTerm}
                        onChange={e => setGroupSearchTerm(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search..."
                      />
                    </div>
                    {renderGroupTable()}
                    {renderPagination()}
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Employee Search Modal */}
      <EmployeeSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelect={(code, name) => { setEmpCode(code); setEmpName(name); }}
        employees={modalEmployees}
        loading={loadingEmployees}
        error={employeeError}
      />

      <Footer />
    </div>
  );
}
