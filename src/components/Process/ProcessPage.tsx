import { useState, useRef, useEffect } from 'react';
import { Calendar, RotateCcw, Check, Users, Building2, Briefcase, CalendarClock, Clock, Search, Play, CheckCircle, Wallet, Grid, Network, Box, RefreshCw } from 'lucide-react';
import { DatePicker } from '../DateSetup/DatePicker';
import { Footer } from '../Footer/Footer';
import apiClient from '../../services/apiClient';
import Swal from 'sweetalert2';

interface GroupItem {
  id: number;
  code: string;
  description: string;
}

interface EmployeeItem {
  id: number;
  code: string;
  name: string;
}

interface ProcessingResult {
  success: boolean;
  elapsedTime: string;
}

interface ResultData {
  employeeCode: string;
  name: string;
  dateIn: string;
  dateOut: string;
  timeIn: string;
  timeOut: string;
  workshiftCode: string;
  undertime: string;
  undertimeWithinGrace: string;
  actualUndertime: string;
}

interface NightDifferentialData {
  employeeCode: string;
  name: string;
  dateFrom: string;
  dateTo: string;
  timeIn: string;
  timeOut: string;
  workshiftCode: string;
  overtime: string;
  otCode: string;
}

interface LeaveAbsenceData {
  employeeCode: string;
  name: string;
  date: string;
  leaveCode: string;
  hours: string;
  reason: string;
  remarks: string;
  withPay: boolean;
}

interface TardinessData {
  employeeCode: string;
  name: string;
  dateIn: string;
  dateOut: string;
  timeIn: string;
  timeOut: string;
  workshiftCode: string;
  tardiness: string;
  tardinessWithinGrace: string;
  actualTardiness: string;
}

interface RegularWorkingData {
  employeeCode: string;
  name: string;
  dateIn: string;
  dateOut: string;
  timeIn: string;
  timeOut: string;
  workshiftCode: string;
  hours: string;
  remarks: string;
}

interface OvertimeData {
  employeeCode: string;
  name: string;
  dateFrom: string;
  dateTo: string;
  numOTHoursApproved: string;
  tkGroup: string;
  reason: string;
  remarks: string;
  otTimeBeforeShift: string;
  breakNumOTHoursApproved: string;
  startTimeOTOvertime: string;
}

export function ProcessPage() {
  const [activeTab, setActiveTab] = useState<'TK Group' | 'Branch' | 'Department' | 'Division' | 'Group Schedule' | 'Pay House' | 'Section' | 'Unit'>('TK Group');
  const [dateFrom, setDateFrom] = useState('3/1/2020');
  const [dateTo, setDateTo] = useState('03/15/2020');
  const [dateApplied, setDateApplied] = useState('7/7/2021');
  const [lateFiling, setLateFiling] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState('tardiness');
  const [elapsedTime, setElapsedTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const resultsRef = useRef<HTMLDivElement>(null);
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);  
  const [currentGroupPage, setCurrentGroupPage] = useState(1);
  const [currentEmpPage, setCurrentEmpPage] = useState(1);
  const itemsPerPage = 10;  

  const [processOptions, setProcessOptions] = useState({
    tardiness: false,
    allowances: false,
    undertime: false,
    overtime: false,
    selectAll: false,
    leaveAbsences: false,
    nightDifferentials: false,
    regularWorking: false,
    holidayPay: false
  });

  useEffect(() => {
    setCurrentGroupPage(1);
    //setSelectedGroups([]); // optional but recommended
    }, 
    [activeTab]
  );

  // TKSGroup List states
  const [loadingTKSGroup, setLoadingTKSGroup] = useState(false);
  const [tkGroupItems, setTKSGroupItems] = useState<GroupItem[]>([]);

  // Branch List states
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [branchItems, setBranchItems] = useState<GroupItem[]>([]);

  // Department List states
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [departmentItems, setDepartmentItems] = useState<GroupItem[]>([]);

  // Division List states
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [divisionItems, setDivisionItems] = useState<GroupItem[]>([]);

  // GroupSchedule List states
  const [loadingGroupSchedules, setLoadingGroupSchedules] = useState(false);
  const [groupScheduleItems, setGroupScheduleItems] = useState<GroupItem[]>([]);

  // PayHouse List states
  const [loadingPayHouses, setLoadingPayHouses] = useState(false);
  const [payHouseItems, setPayHouseItems] = useState<GroupItem[]>([]);

  // Section List states
  const [loadingSections, setLoadingSections] = useState(false);
  const [sectionItems, setSectionItems] = useState<GroupItem[]>([]);

  // Unit List states
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [unitItems, setUnitItems] = useState<GroupItem[]>([]);

  // Employee List states
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeeItems, setEmployeeItems] = useState<EmployeeItem[]>([]);
  const [EmployeeError, setEmployeeError] = useState('');

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

  // Fetch branch data from API
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
            const items = await fetchBranchData(); // ✅ array
            setBranchItems(items);
        };

        loadBranches();
    }, []);

    // Fetch department data from API
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
            const items = await fetchDepartmentData(); // array
            setDepartmentItems(items);
        };

        loadDepartments();
    }, []
    );

     // Fetch division data from API
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
            const items = await fetchDivisionData(); // array
            setDivisionItems(items);
        };

        loadDivisions();
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

    // Fetch unit data from API
    const fetchUnitData = async (): Promise<GroupItem[]> => {
        const response = await apiClient.get('/Fs/Employment/UnitSetUp');

        return response.data.map((item: any) => ({
            id: item.unitID || item.ID,
            code: item.unitCode || item.code,
            description: item.unitDesc || item.description,
        }));

    };

    useEffect(() => {
        const loadUnits = async () => {
            const items = await fetchUnitData(); // array
            setUnitItems(items);
        };

        loadUnits();
    }, []
    );

    // Fetch employee data from API
    const fetchEmployeeData = async (): Promise<EmployeeItem[]> => {
        const response = await apiClient.get('/EmployeeMasterFile');

        const list = Array.isArray(response.data) ? response.data : [];

        return list.map((item: any): EmployeeItem => ({
            id: item.empID ?? item.ID ?? item.id,
            code: item.empCode || item.code || '',
            name: `${item.lName || ''}, ${item.fName || ''} ${item.mName || ''}`.trim(),

        }));
    };

    useEffect(() => {
        const loadEmployees = async () => {
            const items = await fetchEmployeeData(); // EmployeeItem[]
            setEmployeeItems(items);
        };

        loadEmployees();
    }, []
    );

    // Get current data based on active tab
    const getCurrentData = () => {
        switch (activeTab) {
            case 'Branch':
                return branchItems;
            case 'Department':
                return departmentItems;
            case 'Division':
                return divisionItems;    
            case 'Group Schedule':
                return groupScheduleItems;
            case 'Pay House':
                return payHouseItems;
            case 'Section':
                return sectionItems;
            case 'Unit':
                return unitItems;    
            default:
                return tkGroupItems;
        }

    };

    const currentItems = getCurrentData();

  // Get selection title based on active tab
  const getSelectionTitle = () => {
    switch (activeTab) {
      case 'TK Group':
        return 'TK Group Selection';
      case 'Branch':
        return 'Branch Selection';
      case 'Department':
        return 'Department Selection';
      case 'Division':
        return 'Division Selection';
      case 'Group Schedule':
        return 'Group Schedule Selection';
      case 'Pay House':
        return 'Pay House Selection';
      case 'Section':
        return 'Section Selection';
      case 'Unit':
        return 'Unit Selection';
      default:
        return 'Selection';
    }
  };

     const filteredGroups = currentItems.filter(item =>
        item.code.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(groupSearchTerm.toLowerCase())
    );

    const filteredEmployees = employeeItems.filter(emp =>
        emp.code.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
        emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase())
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

  const handleGroupToggle = (id: number) => {
    setSelectedGroups(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleEmployeeToggle = (id: number) => {
    setSelectedEmployees(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const resultData: ResultData[] = [
    {
      employeeCode: 'D002',
      name: 'BALETE, LORENZO MAGADDON',
      dateIn: '3/2/2020',
      dateOut: '3/2/2020',
      timeIn: '9:34 AM',
      timeOut: '6:49 PM',
      workshiftCode: '930AM730PM',
      undertime: '0.6800',
      undertimeWithinGrace: '0.00',
      actualUndertime: '0.6800'
    },
    {
      employeeCode: 'D002',
      name: 'BALETE, LORENZO MAGADDON',
      dateIn: '3/4/2020',
      dateOut: '3/4/2020',
      timeIn: '9:41 AM',
      timeOut: '6:47 PM',
      workshiftCode: '930AM730PM',
      undertime: '0.7200',
      undertimeWithinGrace: '0.00',
      actualUndertime: '0.7200'
    },
    {
      employeeCode: 'D002',
      name: 'BALETE, LORENZO MAGADDON',
      dateIn: '3/5/2020',
      dateOut: '3/5/2020',
      timeIn: '9:34 AM',
      timeOut: '6:00 PM',
      workshiftCode: '930AM730PM',
      undertime: '1.5000',
      undertimeWithinGrace: '0.00',
      actualUndertime: '1.5000'
    },
    {
      employeeCode: 'D002',
      name: 'BALETE, LORENZO MAGADDON',
      dateIn: '3/10/2020',
      dateOut: '3/10/2020',
      timeIn: '8:57 AM',
      timeOut: '6:57 PM',
      workshiftCode: '930AM730PM',
      undertime: '0.5500',
      undertimeWithinGrace: '0.00',
      actualUndertime: '0.5500'
    },
    {
      employeeCode: 'D002',
      name: 'BALETE, LORENZO MAGADDON',
      dateIn: '3/12/2020',
      dateOut: '3/12/2020',
      timeIn: '7:30 AM',
      timeOut: '6:00 PM',
      workshiftCode: '930AM730PM',
      undertime: '1.5000',
      undertimeWithinGrace: '0.00',
      actualUndertime: '1.5000'
    },
    {
      employeeCode: 'D002',
      name: 'BALETE, LORENZO MAGADDON',
      dateIn: '3/13/2020',
      dateOut: '3/13/2020',
      timeIn: '7:30 AM',
      timeOut: '6:00 PM',
      workshiftCode: '930AM730PM',
      undertime: '1.5000',
      undertimeWithinGrace: '0.00',
      actualUndertime: '1.5000'
    },
    {
      employeeCode: 'L007',
      name: 'ONG, KEVIN UMALI',
      dateIn: '3/2/2020',
      dateOut: '3/2/2020',
      timeIn: '8:27 AM',
      timeOut: '6:30 PM',
      workshiftCode: '930AM730PM',
      undertime: '1.0000',
      undertimeWithinGrace: '0.00',
      actualUndertime: '1.0000'
    },
    {
      employeeCode: 'L007',
      name: 'ONG, KEVIN UMALI',
      dateIn: '3/11/2020',
      dateOut: '3/11/2020',
      timeIn: '6:05 AM',
      timeOut: '6:00 PM',
      workshiftCode: '930AM730PM',
      undertime: '1.5000',
      undertimeWithinGrace: '0.00',
      actualUndertime: '1.5000'
    },
    {
      employeeCode: 'L007',
      name: 'ONG, KEVIN UMALI',
      dateIn: '3/12/2020',
      dateOut: '3/12/2020',
      timeIn: '7:30 AM',
      timeOut: '6:00 PM',
      workshiftCode: '930AM730PM',
      undertime: '1.5000',
      undertimeWithinGrace: '0.00',
      actualUndertime: '1.5000'
    },
    {
      employeeCode: 'L007',
      name: 'ONG, KEVIN UMALI',
      dateIn: '3/13/2020',
      dateOut: '3/13/2020',
      timeIn: '7:30 AM',
      timeOut: '6:00 PM',
      workshiftCode: '930AM730PM',
      undertime: '1.5000',
      undertimeWithinGrace: '0.00',
      actualUndertime: '1.5000'
    },
    {
      employeeCode: 'M034',
      name: 'ESQUILLO, HECTOR RIVERA',
      dateIn: '3/12/2020',
      dateOut: '3/12/2020',
      timeIn: '7:30 AM',
      timeOut: '6:00 PM',
      workshiftCode: '9AM7PM',
      undertime: '1.0000',
      undertimeWithinGrace: '0.00',
      actualUndertime: '1.0000'
    },
    {
      employeeCode: 'M034',
      name: 'ESQUILLO, HECTOR RIVERA',
      dateIn: '3/13/2020',
      dateOut: '3/13/2020',
      timeIn: '7:30 AM',
      timeOut: '6:00 PM',
      workshiftCode: '9AM7PM',
      undertime: '1.0000',
      undertimeWithinGrace: '0.00',
      actualUndertime: '1.0000'
    },
    {
      employeeCode: 'V067',
      name: 'ABAD, JULIE ROSE RAMOS',
      dateIn: '3/2/2020',
      dateOut: '3/2/2020',
      timeIn: '7:07 AM',
      timeOut: '5:33 PM',
      workshiftCode: '730AM06PM',
      undertime: '0.4500',
      undertimeWithinGrace: '0.00',
      actualUndertime: '0.4500'
    },
    {
      employeeCode: 'V067',
      name: 'ABAD, JULIE ROSE RAMOS',
      dateIn: '3/6/2020',
      dateOut: '3/6/2020',
      timeIn: '7:11 AM',
      timeOut: '5:47 PM',
      workshiftCode: '730AM06PM',
      undertime: '0.2200',
      undertimeWithinGrace: '0.00',
      actualUndertime: '0.2200'
    },
    {
      employeeCode: 'Z1047',
      name: 'PERLITA, MANALO LUCAS',
      dateIn: '3/9/2020',
      dateOut: '3/9/2020',
      timeIn: '7:53 AM',
      timeOut: '3:07 PM',
      workshiftCode: '730AM06PM',
      undertime: '2.8800',
      undertimeWithinGrace: '0.00',
      actualUndertime: '2.8800'
    },
    {
      employeeCode: 'Z1399',
      name: 'REYES, CANDIDO SALES',
      dateIn: '3/3/2020',
      dateOut: '3/3/2020',
      timeIn: '7:30 AM',
      timeOut: '5:32 PM',
      workshiftCode: '9AM7PM',
      undertime: '1.4700',
      undertimeWithinGrace: '0.00',
      actualUndertime: '1.4700'
    },
    {
      employeeCode: 'Z1399',
      name: 'REYES, CANDIDO SALES',
      dateIn: '3/4/2020',
      dateOut: '3/4/2020',
      timeIn: '7:29 AM',
      timeOut: '5:32 PM',
      workshiftCode: '9AM7PM',
      undertime: '1.4700',
      undertimeWithinGrace: '0.00',
      actualUndertime: '1.4700'
    },
    {
      employeeCode: 'Z1399',
      name: 'REYES, CANDIDO SALES',
      dateIn: '3/10/2020',
      dateOut: '3/10/2020',
      timeIn: '7:24 AM',
      timeOut: '5:33 PM',
      workshiftCode: '9AM7PM',
      undertime: '1.4500',
      undertimeWithinGrace: '0.00',
      actualUndertime: '1.4500'
    },
    {
      employeeCode: 'Z1399',
      name: 'REYES, CANDIDO SALES',
      dateIn: '3/2/2020',
      dateOut: '3/2/2020',
      timeIn: '7:27 AM',
      timeOut: '5:34 PM',
      workshiftCode: '9AM7PM',
      undertime: '1.4300',
      undertimeWithinGrace: '0.00',
      actualUndertime: '1.4300'
    },
    {
      employeeCode: 'Y082',
      name: 'VILLANUEVA, KEILYN TOLENTINO',
      dateIn: '3/5/2020',
      dateOut: '3/5/2020',
      timeIn: '6:54 AM',
      timeOut: '5:34 PM',
      workshiftCode: '9AM7PM',
      undertime: '1.4300',
      undertimeWithinGrace: '0.00',
      actualUndertime: '1.4300'
    },
    {
      employeeCode: 'Z1399',
      name: 'REYES, CANDIDO SALES',
      dateIn: '3/5/2020',
      dateOut: '3/5/2020',
      timeIn: '7:30 AM',
      timeOut: '5:35 PM',
      workshiftCode: '9AM7PM',
      undertime: '1.4200',
      undertimeWithinGrace: '0.00',
      actualUndertime: '1.4200'
    },
    {
      employeeCode: 'Z1399',
      name: 'REYES, CANDIDO SALES',
      dateIn: '3/9/2020',
      dateOut: '3/9/2020',
      timeIn: '7:23 AM',
      timeOut: '5:35 PM',
      workshiftCode: '9AM7PM',
      undertime: '1.4200',
      undertimeWithinGrace: '0.00',
      actualUndertime: '1.4200'
    }
  ];

  const nightDifferentialData: NightDifferentialData[] = [
    {
      employeeCode: 'Z553',
      name: 'CANILLA, ARVIN SERRANO',
      dateFrom: '3/2/2020',
      dateTo: '3/3/2020',
      timeIn: '10:05 PM',
      timeOut: '7:48 AM',
      workshiftCode: '10PM6AM',
      overtime: '7.92',
      otCode: 'NDF8'
    },
    {
      employeeCode: 'Z553',
      name: 'CANILLA, ARVIN SERRANO',
      dateFrom: '3/3/2020',
      dateTo: '3/4/2020',
      timeIn: '9:35 PM',
      timeOut: '7:52 AM',
      workshiftCode: '10PM6AM',
      overtime: '8.00',
      otCode: 'NDF8'
    },
    {
      employeeCode: 'Z553',
      name: 'CANILLA, ARVIN SERRANO',
      dateFrom: '3/4/2020',
      dateTo: '3/5/2020',
      timeIn: '10:11 PM',
      timeOut: '7:38 AM',
      workshiftCode: '10PM6AM',
      overtime: '7.82',
      otCode: 'NDF8'
    },
    {
      employeeCode: 'Z553',
      name: 'CANILLA, ARVIN SERRANO',
      dateFrom: '3/5/2020',
      dateTo: '3/6/2020',
      timeIn: '9:55 PM',
      timeOut: '7:34 AM',
      workshiftCode: '10PM6AM',
      overtime: '8.00',
      otCode: 'NDF8'
    },
    {
      employeeCode: 'Z553',
      name: 'CANILLA, ARVIN SERRANO',
      dateFrom: '3/6/2020',
      dateTo: '3/7/2020',
      timeIn: '9:44 PM',
      timeOut: '8:10 AM',
      workshiftCode: '10PM6AM',
      overtime: '8.00',
      otCode: 'NDF8'
    },
    {
      employeeCode: 'Z553',
      name: 'CANILLA, ARVIN SERRANO',
      dateFrom: '3/9/2020',
      dateTo: '3/10/2020',
      timeIn: '10:18 PM',
      timeOut: '6:40 AM',
      workshiftCode: '10PM6AM',
      overtime: '7.70',
      otCode: 'NDF8'
    },
    {
      employeeCode: 'Z553',
      name: 'CANILLA, ARVIN SERRANO',
      dateFrom: '3/10/2020',
      dateTo: '3/11/2020',
      timeIn: '10:01 PM',
      timeOut: '6:08 AM',
      workshiftCode: '10PM6AM',
      overtime: '7.98',
      otCode: 'NDF8'
    },
    {
      employeeCode: 'Z553',
      name: 'CANILLA, ARVIN SERRANO',
      dateFrom: '3/11/2020',
      dateTo: '3/12/2020',
      timeIn: '10:06 PM',
      timeOut: '6:09 AM',
      workshiftCode: '10PM6AM',
      overtime: '7.90',
      otCode: 'NDF8'
    },
    {
      employeeCode: 'Z553',
      name: 'CANILLA, ARVIN SERRANO',
      dateFrom: '3/12/2020',
      dateTo: '3/13/2020',
      timeIn: '9:55 PM',
      timeOut: '6:07 AM',
      workshiftCode: '10PM6AM',
      overtime: '8.00',
      otCode: 'NDF8'
    },
    {
      employeeCode: 'Z553',
      name: 'CANILLA, ARVIN SERRANO',
      dateFrom: '3/13/2020',
      dateTo: '3/14/2020',
      timeIn: '8:00 PM',
      timeOut: '6:00 PM',
      workshiftCode: '10PM6AM',
      overtime: '8.00',
      otCode: 'NDF8'
    }
  ];

  const leaveAbsenceData: LeaveAbsenceData[] = [
    {
      employeeCode: 'M034',
      name: 'ESQUILLO, HECTOR RIVERA',
      date: '3/3/2020',
      leaveCode: '',
      hours: '9.00',
      reason: '',
      remarks: 'No Log Out',
      withPay: false
    },
    {
      employeeCode: 'M034',
      name: 'ESQUILLO, HECTOR RIVERA',
      date: '3/9/2020',
      leaveCode: '',
      hours: '9.00',
      reason: '',
      remarks: 'No Log Out',
      withPay: false
    },
    {
      employeeCode: 'V067',
      name: 'ABAD, JULIE ROSE RAMOS',
      date: '3/4/2020',
      leaveCode: 'BL',
      hours: '8.00',
      reason: '',
      remarks: 'Charged to Leave :',
      withPay: true
    },
    {
      employeeCode: 'V067',
      name: 'ABAD, JULIE ROSE RAMOS',
      date: '3/4/2020',
      leaveCode: '',
      hours: '1.50',
      reason: '',
      remarks: 'Absent - No Leave Application',
      withPay: false
    },
    {
      employeeCode: 'V067',
      name: 'ABAD, JULIE ROSE RAMOS',
      date: '3/5/2020',
      leaveCode: '',
      hours: '1.50',
      reason: '',
      remarks: 'Absent - No Leave Application',
      withPay: false
    },
    {
      employeeCode: 'V067',
      name: 'ABAD, JULIE ROSE RAMOS',
      date: '3/5/2020',
      leaveCode: 'BL',
      hours: '8.00',
      reason: '',
      remarks: 'Charged to Leave :',
      withPay: true
    },
    {
      employeeCode: 'V067',
      name: 'ABAD, JULIE ROSE RAMOS',
      date: '3/6/2020',
      leaveCode: 'VL',
      hours: '9.50',
      reason: '',
      remarks: 'Charged to Leave :',
      withPay: true
    },
    {
      employeeCode: 'Y082',
      name: 'VILLANUEVA, KEILYN TOLENTINO',
      date: '3/9/2020',
      leaveCode: '',
      hours: '9.00',
      reason: '',
      remarks: 'No Log Out',
      withPay: false
    },
    {
      employeeCode: 'Y082',
      name: 'VILLANUEVA, KEILYN TOLENTINO',
      date: '3/2/2020',
      leaveCode: 'SL',
      hours: '9.00',
      reason: '',
      remarks: 'Charged to Leave :',
      withPay: true
    },
    {
      employeeCode: 'Z1047',
      name: 'PERLITA, MANALO LUCAS',
      date: '3/4/2020',
      leaveCode: '',
      hours: '9.50',
      reason: '',
      remarks: 'No Log Out',
      withPay: false
    },
    {
      employeeCode: 'Z1047',
      name: 'PERLITA, MANALO LUCAS',
      date: '3/10/2020',
      leaveCode: '',
      hours: '9.50',
      reason: '',
      remarks: 'No Log Out',
      withPay: false
    },
    {
      employeeCode: 'Z1399',
      name: 'REYES, CANDIDO SALES',
      date: '3/12/2020',
      leaveCode: '',
      hours: '9.00',
      reason: '',
      remarks: 'No Log Out',
      withPay: false
    }
  ];

  const tardinessData: TardinessData[] = [
    { employeeCode: '128001', name: 'TOLENTINO, KEILYN 11 MALANA', dateIn: '3/2/2020', dateOut: '3/2/2020', timeIn: '8:01 AM', timeOut: '7:00 PM', workshiftCode: '8AM5PM', tardiness: '0.02', tardinessWithinGrace: '0.02', actualTardiness: '0.02' },
    { employeeCode: 'D002', name: 'BALETE, LORENZO MAGADDON', dateIn: '3/2/2020', dateOut: '3/2/2020', timeIn: '9:34 AM', timeOut: '6:49 PM', workshiftCode: '930AM730PM', tardiness: '0.07', tardinessWithinGrace: '0.00', actualTardiness: '0.07' },
    { employeeCode: 'D002', name: 'BALETE, LORENZO MAGADDON', dateIn: '3/3/2020', dateOut: '3/3/2020', timeIn: '9:32 AM', timeOut: '7:44 PM', workshiftCode: '930AM730PM', tardiness: '0.03', tardinessWithinGrace: '0.00', actualTardiness: '0.03' },
    { employeeCode: 'D002', name: 'BALETE, LORENZO MAGADDON', dateIn: '3/4/2020', dateOut: '3/4/2020', timeIn: '9:41 AM', timeOut: '6:47 PM', workshiftCode: '930AM730PM', tardiness: '0.18', tardinessWithinGrace: '0.00', actualTardiness: '0.18' },
    { employeeCode: 'D002', name: 'BALETE, LORENZO MAGADDON', dateIn: '3/5/2020', dateOut: '3/5/2020', timeIn: '9:34 AM', timeOut: '6:00 PM', workshiftCode: '930AM730PM', tardiness: '0.07', tardinessWithinGrace: '0.00', actualTardiness: '0.07' },
    { employeeCode: 'M034', name: 'ESQUILLO, HECTOR RIVERA', dateIn: '3/6/2020', dateOut: '3/6/2020', timeIn: '12:44 PM', timeOut: '7:54 PM', workshiftCode: '9AM7PM', tardiness: '3.00', tardinessWithinGrace: '0.00', actualTardiness: '3.00' },
    { employeeCode: 'Z1047', name: 'PERLITA, MANALO LUCAS', dateIn: '3/2/2020', dateOut: '3/2/2020', timeIn: '7:44 AM', timeOut: '9:58 PM', workshiftCode: '730AM06PM', tardiness: '0.23', tardinessWithinGrace: '0.00', actualTardiness: '0.23' },
    { employeeCode: 'Z1047', name: 'PERLITA, MANALO LUCAS', dateIn: '3/6/2020', dateOut: '3/6/2020', timeIn: '7:43 AM', timeOut: '9:26 PM', workshiftCode: '730AM06PM', tardiness: '0.22', tardinessWithinGrace: '0.00', actualTardiness: '0.22' },
    { employeeCode: 'Z1047', name: 'PERLITA, MANALO LUCAS', dateIn: '3/9/2020', dateOut: '3/9/2020', timeIn: '7:53 AM', timeOut: '3:07 PM', workshiftCode: '730AM06PM', tardiness: '0.38', tardinessWithinGrace: '0.00', actualTardiness: '0.38' },
    { employeeCode: 'Z1399', name: 'REYES, CANDIDO SALES', dateIn: '3/11/2020', dateOut: '3/11/2020', timeIn: '9:21 AM', timeOut: '7:30 PM', workshiftCode: '9AM7PM', tardiness: '0.35', tardinessWithinGrace: '0.00', actualTardiness: '0.35' },
    { employeeCode: 'Z553', name: 'CANILLA, ARVIN SERRANO', dateIn: '3/2/2020', dateOut: '3/3/2020', timeIn: '10:05 PM', timeOut: '7:48 AM', workshiftCode: '10PM6AM', tardiness: '0.00', tardinessWithinGrace: '0.08', actualTardiness: '0.08' },
    { employeeCode: 'Z553', name: 'CANILLA, ARVIN SERRANO', dateIn: '3/4/2020', dateOut: '3/5/2020', timeIn: '10:11 PM', timeOut: '7:38 AM', workshiftCode: '10PM6AM', tardiness: '0.01', tardinessWithinGrace: '0.17', actualTardiness: '0.18' },
    { employeeCode: 'Z553', name: 'CANILLA, ARVIN SERRANO', dateIn: '3/9/2020', dateOut: '3/10/2020', timeIn: '10:18 PM', timeOut: '6:40 AM', workshiftCode: '10PM6AM', tardiness: '0.13', tardinessWithinGrace: '0.17', actualTardiness: '0.30' },
    { employeeCode: 'Z553', name: 'CANILLA, ARVIN SERRANO', dateIn: '3/10/2020', dateOut: '3/11/2020', timeIn: '10:01 PM', timeOut: '6:08 AM', workshiftCode: '10PM6AM', tardiness: '0.00', tardinessWithinGrace: '0.02', actualTardiness: '0.02' }
  ];

  const regularWorkingData: RegularWorkingData[] = [
    { employeeCode: '128001', name: 'TOLENTINO, KEILYN 11 MALANA', dateIn: '3/2/2020', dateOut: '3/2/2020', timeIn: '8:01 AM', timeOut: '7:00 PM', workshiftCode: '8AM5PM', hours: '9.00', remarks: '' },
    { employeeCode: 'D002', name: 'BALETE, LORENZO MAGADDON', dateIn: '3/2/2020', dateOut: '3/2/2020', timeIn: '9:34 AM', timeOut: '6:49 PM', workshiftCode: '930AM730PM', hours: '9.00', remarks: '' },
    { employeeCode: 'D002', name: 'BALETE, LORENZO MAGADDON', dateIn: '3/3/2020', dateOut: '3/3/2020', timeIn: '9:32 AM', timeOut: '7:44 PM', workshiftCode: '930AM730PM', hours: '9.00', remarks: '' },
    { employeeCode: 'D002', name: 'BALETE, LORENZO MAGADDON', dateIn: '3/4/2020', dateOut: '3/4/2020', timeIn: '9:41 AM', timeOut: '6:47 PM', workshiftCode: '930AM730PM', hours: '9.00', remarks: '' },
    { employeeCode: 'D002', name: 'BALETE, LORENZO MAGADDON', dateIn: '3/5/2020', dateOut: '3/5/2020', timeIn: '9:34 AM', timeOut: '6:00 PM', workshiftCode: '930AM730PM', hours: '7.50', remarks: '' },
    { employeeCode: 'L007', name: 'ONG, KEVIN UMALI', dateIn: '3/2/2020', dateOut: '3/2/2020', timeIn: '8:27 AM', timeOut: '6:30 PM', workshiftCode: '930AM730PM', hours: '9.00', remarks: '' },
    { employeeCode: 'M034', name: 'ESQUILLO, HECTOR RIVERA', dateIn: '3/2/2020', dateOut: '3/2/2020', timeIn: '8:45 AM', timeOut: '7:15 PM', workshiftCode: '9AM7PM', hours: '9.00', remarks: '' },
    { employeeCode: 'V067', name: 'ABAD, JULIE ROSE RAMOS', dateIn: '3/2/2020', dateOut: '3/2/2020', timeIn: '7:07 AM', timeOut: '5:33 PM', workshiftCode: '730AM06PM', hours: '9.50', remarks: '' },
    { employeeCode: 'V067', name: 'ABAD, JULIE ROSE RAMOS', dateIn: '3/3/2020', dateOut: '3/3/2020', timeIn: '7:05 AM', timeOut: '6:02 PM', workshiftCode: '730AM06PM', hours: '9.50', remarks: '' },
    { employeeCode: 'V067', name: 'ABAD, JULIE ROSE RAMOS', dateIn: '3/6/2020', dateOut: '3/6/2020', timeIn: '7:11 AM', timeOut: '5:47 PM', workshiftCode: '730AM06PM', hours: '9.50', remarks: '' },
    { employeeCode: 'Y082', name: 'VILLANUEVA, KEILYN TOLENTINO', dateIn: '3/3/2020', dateOut: '3/3/2020', timeIn: '8:45 AM', timeOut: '7:00 PM', workshiftCode: '9AM7PM', hours: '9.00', remarks: '' },
    { employeeCode: 'Y082', name: 'VILLANUEVA, KEILYN TOLENTINO', dateIn: '3/4/2020', dateOut: '3/4/2020', timeIn: '8:52 AM', timeOut: '6:58 PM', workshiftCode: '9AM7PM', hours: '9.00', remarks: '' },
    { employeeCode: 'Y082', name: 'VILLANUEVA, KEILYN TOLENTINO', dateIn: '3/5/2020', dateOut: '3/5/2020', timeIn: '6:54 AM', timeOut: '5:34 PM', workshiftCode: '9AM7PM', hours: '9.00', remarks: '' },
    { employeeCode: 'Z1047', name: 'PERLITA, MANALO LUCAS', dateIn: '3/2/2020', dateOut: '3/2/2020', timeIn: '7:44 AM', timeOut: '9:58 PM', workshiftCode: '730AM06PM', hours: '9.50', remarks: '' },
    { employeeCode: 'Z1047', name: 'PERLITA, MANALO LUCAS', dateIn: '3/3/2020', dateOut: '3/3/2020', timeIn: '7:29 AM', timeOut: '6:32 PM', workshiftCode: '730AM06PM', hours: '9.50', remarks: '' },
    { employeeCode: 'Z1399', name: 'REYES, CANDIDO SALES', dateIn: '3/2/2020', dateOut: '3/2/2020', timeIn: '7:27 AM', timeOut: '5:34 PM', workshiftCode: '9AM7PM', hours: '9.00', remarks: '' },
    { employeeCode: 'Z1399', name: 'REYES, CANDIDO SALES', dateIn: '3/3/2020', dateOut: '3/3/2020', timeIn: '7:30 AM', timeOut: '5:32 PM', workshiftCode: '9AM7PM', hours: '9.00', remarks: '' },
    { employeeCode: 'Z553', name: 'CANILLA, ARVIN SERRANO', dateIn: '3/2/2020', dateOut: '3/3/2020', timeIn: '10:05 PM', timeOut: '7:48 AM', workshiftCode: '10PM6AM', hours: '8.00', remarks: '' },
    { employeeCode: 'Z553', name: 'CANILLA, ARVIN SERRANO', dateIn: '3/3/2020', dateOut: '3/4/2020', timeIn: '9:35 PM', timeOut: '7:52 AM', workshiftCode: '10PM6AM', hours: '8.00', remarks: '' }
  ];

  const overtimeData: OvertimeData[] = [
    { employeeCode: 'D002', name: 'BALETE, LORENZO MAGADDON', dateFrom: '3/3/2020', dateTo: '3/3/2020', numOTHoursApproved: '1.00', tkGroup: 'CEBU', reason: 'Project Deadline', remarks: '', otTimeBeforeShift: '0.00', breakNumOTHoursApproved: '0.00', startTimeOTOvertime: '7:30 PM' },
    { employeeCode: '128001', name: 'TOLENTINO, KEILYN 11 MALANA', dateFrom: '3/2/2020', dateTo: '3/2/2020', numOTHoursApproved: '2.00', tkGroup: 'MAKATI', reason: 'Month-end Processing', remarks: '', otTimeBeforeShift: '0.00', breakNumOTHoursApproved: '0.00', startTimeOTOvertime: '5:00 PM' },
    { employeeCode: 'V067', name: 'ABAD, JULIE ROSE RAMOS', dateFrom: '3/3/2020', dateTo: '3/3/2020', numOTHoursApproved: '0.50', tkGroup: 'MAKATI', reason: 'Training', remarks: '', otTimeBeforeShift: '0.00', breakNumOTHoursApproved: '0.00', startTimeOTOvertime: '6:00 PM' },
    { employeeCode: 'Z1047', name: 'PERLITA, MANALO LUCAS', dateFrom: '3/2/2020', dateTo: '3/2/2020', numOTHoursApproved: '3.50', tkGroup: 'CEBU', reason: 'Inventory', remarks: '', otTimeBeforeShift: '0.00', breakNumOTHoursApproved: '0.00', startTimeOTOvertime: '6:00 PM' },
    { employeeCode: 'Z1047', name: 'PERLITA, MANALO LUCAS', dateFrom: '3/3/2020', dateTo: '3/3/2020', numOTHoursApproved: '0.50', tkGroup: 'CEBU', reason: 'Inventory', remarks: '', otTimeBeforeShift: '0.00', breakNumOTHoursApproved: '0.00', startTimeOTOvertime: '6:00 PM' },
    { employeeCode: 'Y082', name: 'VILLANUEVA, KEILYN TOLENTINO', dateFrom: '3/3/2020', dateTo: '3/3/2020', numOTHoursApproved: '1.00', tkGroup: 'PASIG', reason: 'Urgent Task', remarks: '', otTimeBeforeShift: '0.00', breakNumOTHoursApproved: '0.00', startTimeOTOvertime: '7:00 PM' }
  ];

  const resultTabs = [
    { id: 'tardiness', label: 'Tardiness' },
    { id: 'undertime', label: 'Undertime' },
    { id: 'leave-absences', label: 'Leave and Absences' },
    { id: 'regular-working', label: 'Regular Working Days/Hours' },
    { id: 'allowances', label: 'Allowances' },
    { id: 'overtime', label: 'Overtime' },
    { id: 'night-differentials', label: 'Night Differentials' },
    { id: 'holiday-pay', label: 'Holiday Pay' }
  ];


  const handleSelectAllGroups = () => {
    if (selectedGroups.length === filteredGroups.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(filteredGroups.map(g => g.id));
    }
  };

  const handleSelectAllEmployees = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(e => e.id));
    }
  };

  const handleOptionChange = (option: keyof typeof processOptions) => {
    if (option === 'selectAll') {
      const newValue = !processOptions.selectAll;
      setProcessOptions({
        tardiness: newValue,
        allowances: newValue,
        undertime: newValue,
        overtime: newValue,
        selectAll: newValue,
        leaveAbsences: newValue,
        nightDifferentials: newValue,
        regularWorking: newValue,
        holidayPay: newValue
      });
    } else {
      setProcessOptions(prev => ({
        ...prev,
        [option]: !prev[option]
      }));
    }
  };

  const handlePopulate = () => {
    const startTime = Date.now();
    setProcessing(true);
    
    // Simulate population/processing
    setTimeout(() => {
      const endTime = Date.now();
      const totalSeconds = Math.floor((endTime - startTime) / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      setElapsedTime({ hours, minutes, seconds });
      setProcessing(false);
      setShowSuccessModal(true);
      setShowResults(true);
    }, 9000); // 9 seconds to match the example
  };

  const handleProcess = async () => {
    setProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setProcessing(false);
      setShowResults(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Process Data</h1>
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
                Process employee timekeeping data by various criteria including TK Group, branch, department, and more. Generate comprehensive reports for tardiness, undertime, overtime, leave, and other attendance metrics.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Process by multiple organizational groups</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Generate comprehensive attendance reports</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Track tardiness, undertime, and overtime</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Monitor leave and absences efficiently</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center gap-1 border-b border-gray-200 flex-wrap">
          {[
            { name: 'TK Group' as const, icon: Users },
            { name: 'Branch' as const, icon: Building2 },
            { name: 'Department' as const, icon: Briefcase },
            { name: 'Division' as const, icon: Network },
            { name: 'Group Schedule' as const, icon: CalendarClock },
            { name: 'Pay House' as const, icon: Wallet },
            { name: 'Section' as const, icon: Grid },
            { name: 'Unit' as const, icon: Box }
          ].map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                activeTab === tab.name
                  ? 'font-medium bg-blue-600 text-white -mb-px'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } transition-colors`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Side - Code Selection */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
            <h3 className="text-gray-900 mb-4">{getSelectionTitle()}</h3>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={groupSearchTerm}
                onChange={(e) => setGroupSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={selectedGroups.length === filteredGroups.length && filteredGroups.length > 0}
                        onChange={handleSelectAllGroups}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-2 text-left text-xs text-gray-600">Code</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-600">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedGroups.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedGroups.includes(item.id)}
                          onChange={() => handleGroupToggle(item.id)}
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
                    Showing {filteredEmployees.length === 0 ? 0 : startGroupIndex + 1} to {Math.min(endGroupIndex, filteredGroups.length)} of {filteredGroups.length} entries
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

          {/* Right Side - Employee Selection */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Employees</h3>
              <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                {selectedEmployees.length} selected
              </span>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={employeeSearchTerm}
                onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                        onChange={handleSelectAllEmployees}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-2 text-left text-xs text-gray-600">Code</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-600">Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedEmployees.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(item.id)}
                          onChange={() => handleEmployeeToggle(item.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.code}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{item.name}</td>
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

        {/* Processing Options */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-gray-900">Processing Results</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Date Range */}
            <div className="flex-1 gap-3">
              <label className="block text-gray-700 text-sm mb-2">Date From</label>
              <DatePicker value={dateFrom} onChange={setDateFrom} />
            </div>
            <div className="flex-1 gap-3">
              <label className="block text-gray-700 text-sm mb-2">Date To</label>
              <DatePicker value={dateTo} onChange={setDateTo} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex-1 gap-3">
              <label className="block text-gray-700 text-sm mb-2">Date Applied</label>
              <DatePicker value={dateApplied} onChange={setDateApplied} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lateFiling}
                  onChange={(e) => setLateFiling(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Include Late Filing</span>
              </label>
            </div>
          </div>

          {/* Process Type Checkboxes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-center gap-2 cursor-pointer mb-3 pb-3 border-b border-blue-200">
              <input
                type="checkbox"
                checked={processOptions.selectAll}
                onChange={() => handleOptionChange('selectAll')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-900">Select All</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={processOptions.tardiness}
                  onChange={() => handleOptionChange('tardiness')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Tardiness</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={processOptions.undertime}
                  onChange={() => handleOptionChange('undertime')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Undertime</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={processOptions.overtime}
                  onChange={() => handleOptionChange('overtime')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Overtime</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={processOptions.leaveAbsences}
                  onChange={() => handleOptionChange('leaveAbsences')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Leave/Absences</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={processOptions.regularWorking}
                  onChange={() => handleOptionChange('regularWorking')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Regular Working</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={processOptions.allowances}
                  onChange={() => handleOptionChange('allowances')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Allowances</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={processOptions.nightDifferentials}
                  onChange={() => handleOptionChange('nightDifferentials')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Night Differential</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={processOptions.holidayPay}
                  onChange={() => handleOptionChange('holidayPay')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Holiday Pay</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button 
              onClick={handlePopulate}
              disabled={processing}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Populating...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  Populate
                </>
              )}
            </button>
            <button 
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Process
            </button>
          </div>
        </div>

        {/* Results Section */}
        {showResults && (
          <div ref={resultsRef} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-gray-900">Populate Results</h3>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                Completed
              </span>
            </div>

            {/* Result Tabs */}
            <div className="bg-white border-b border-gray-200">
              <div className="flex overflow-x-auto">
                {resultTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveResultTab(tab.id)}
                    className={`px-4 py-3 whitespace-nowrap transition-all border-b-2 text-sm ${
                      activeResultTab === tab.id
                        ? 'border-blue-600 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto bg-white">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {activeResultTab === 'tardiness' && (
                      <>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Employee Code</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Name</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Date In</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Date Out</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Time In</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Time Out</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Workshift</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Tardiness</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Within Grace</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Actual</th>
                      </>
                    )}
                    {activeResultTab === 'undertime' && (
                      <>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Employee Code</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Name</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Date In</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Date Out</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Time In</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Time Out</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Workshift</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Undertime</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Within Grace</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Actual</th>
                      </>
                    )}
                    {activeResultTab === 'night-differentials' && (
                      <>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Employee Code</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Name</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Date From</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Date To</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Time In</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Time Out</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Workshift</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Overtime</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">OT Code</th>
                      </>
                    )}
                    {activeResultTab === 'leave-absences' && (
                      <>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Employee Code</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Name</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Date</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Leave Code</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Hours</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Reason</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Remarks</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">With Pay</th>
                      </>
                    )}
                    {activeResultTab === 'regular-working' && (
                      <>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Employee Code</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Name</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Date In</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Date Out</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Time In</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Time Out</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Workshift</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Hours</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Remarks</th>
                      </>
                    )}
                    {activeResultTab === 'overtime' && (
                      <>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Employee Code</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Name</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Date From</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Date To</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">OT Hours</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">TK Group</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Reason</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Remarks</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Before Shift</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Break OT</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Start Time</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeResultTab === 'tardiness' && tardinessData.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-900">{record.employeeCode}</td>
                      <td className="px-4 py-3 text-gray-900">{record.name}</td>
                      <td className="px-4 py-3 text-gray-600">{record.dateIn}</td>
                      <td className="px-4 py-3 text-gray-600">{record.dateOut}</td>
                      <td className="px-4 py-3 text-gray-600">{record.timeIn}</td>
                      <td className="px-4 py-3 text-gray-600">{record.timeOut}</td>
                      <td className="px-4 py-3">
                        <span className="text-blue-600">{record.workshiftCode}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{record.tardiness}</td>
                      <td className="px-4 py-3 text-gray-600">{record.tardinessWithinGrace}</td>
                      <td className="px-4 py-3 text-gray-600">{record.actualTardiness}</td>
                    </tr>
                  ))}
                  {activeResultTab === 'undertime' && resultData.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-900">{record.employeeCode}</td>
                      <td className="px-4 py-3 text-gray-900">{record.name}</td>
                      <td className="px-4 py-3 text-gray-600">{record.dateIn}</td>
                      <td className="px-4 py-3 text-gray-600">{record.dateOut}</td>
                      <td className="px-4 py-3 text-gray-600">{record.timeIn}</td>
                      <td className="px-4 py-3 text-gray-600">{record.timeOut}</td>
                      <td className="px-4 py-3">
                        <span className="text-blue-600">{record.workshiftCode}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{record.undertime}</td>
                      <td className="px-4 py-3 text-gray-600">{record.undertimeWithinGrace}</td>
                      <td className="px-4 py-3 text-gray-600">{record.actualUndertime}</td>
                    </tr>
                  ))}
                  {activeResultTab === 'night-differentials' && nightDifferentialData.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-900">{record.employeeCode}</td>
                      <td className="px-4 py-3 text-gray-900">{record.name}</td>
                      <td className="px-4 py-3 text-gray-600">{record.dateFrom}</td>
                      <td className="px-4 py-3 text-gray-600">{record.dateTo}</td>
                      <td className="px-4 py-3 text-gray-600">{record.timeIn}</td>
                      <td className="px-4 py-3 text-gray-600">{record.timeOut}</td>
                      <td className="px-4 py-3">
                        <span className="text-blue-600">{record.workshiftCode}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{record.overtime}</td>
                      <td className="px-4 py-3 text-gray-600">{record.otCode}</td>
                    </tr>
                  ))}
                  {activeResultTab === 'leave-absences' && leaveAbsenceData.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-900">{record.employeeCode}</td>
                      <td className="px-4 py-3 text-gray-900">{record.name}</td>
                      <td className="px-4 py-3 text-gray-600">{record.date}</td>
                      <td className="px-4 py-3 text-gray-600">{record.leaveCode}</td>
                      <td className="px-4 py-3 text-gray-600">{record.hours}</td>
                      <td className="px-4 py-3 text-gray-600">{record.reason}</td>
                      <td className="px-4 py-3 text-gray-600">{record.remarks}</td>
                      <td className="px-4 py-3">
                        <input 
                          type="checkbox" 
                          checked={record.withPay} 
                          disabled
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                        />
                      </td>
                    </tr>
                  ))}
                  {activeResultTab === 'regular-working' && regularWorkingData.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-900">{record.employeeCode}</td>
                      <td className="px-4 py-3 text-gray-900">{record.name}</td>
                      <td className="px-4 py-3 text-gray-600">{record.dateIn}</td>
                      <td className="px-4 py-3 text-gray-600">{record.dateOut}</td>
                      <td className="px-4 py-3 text-gray-600">{record.timeIn}</td>
                      <td className="px-4 py-3 text-gray-600">{record.timeOut}</td>
                      <td className="px-4 py-3">
                        <span className="text-blue-600">{record.workshiftCode}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{record.hours}</td>
                      <td className="px-4 py-3 text-gray-600">{record.remarks}</td>
                    </tr>
                  ))}
                  {activeResultTab === 'overtime' && overtimeData.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-900">{record.employeeCode}</td>
                      <td className="px-4 py-3 text-gray-900">{record.name}</td>
                      <td className="px-4 py-3 text-gray-600">{record.dateFrom}</td>
                      <td className="px-4 py-3 text-gray-600">{record.dateTo}</td>
                      <td className="px-4 py-3 text-gray-600">{record.numOTHoursApproved}</td>
                      <td className="px-4 py-3 text-gray-600">{record.tkGroup}</td>
                      <td className="px-4 py-3 text-gray-600">{record.reason}</td>
                      <td className="px-4 py-3 text-gray-600">{record.remarks}</td>
                      <td className="px-4 py-3 text-gray-600">{record.otTimeBeforeShift}</td>
                      <td className="px-4 py-3 text-gray-600">{record.breakNumOTHoursApproved}</td>
                      <td className="px-4 py-3 text-gray-600">{record.startTimeOTOvertime}</td>
                    </tr>
                  ))}
                  {(activeResultTab === 'allowances' || activeResultTab === 'holiday-pay') && (
                    <tr>
                      <td colSpan={11} className="px-4 py-12 text-center text-gray-500">
                        No data available for this category
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Showing {
                  activeResultTab === 'tardiness' ? tardinessData.length :
                  activeResultTab === 'undertime' ? resultData.length :
                  activeResultTab === 'night-differentials' ? nightDifferentialData.length :
                  activeResultTab === 'leave-absences' ? leaveAbsenceData.length :
                  activeResultTab === 'regular-working' ? regularWorkingData.length :
                  activeResultTab === 'overtime' ? overtimeData.length : 0
                } entries
              </span>
              <div className="flex items-center gap-1">
                <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs">‹</button>
                <button className="w-6 h-6 flex items-center justify-center rounded bg-blue-500 text-white text-xs">1</button>
                <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs">›</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full pointer-events-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-gray-900 mb-2">Done Populating.</h2>
              <p className="text-gray-700 mb-6">
                Elapsed time: {elapsedTime.hours} hour(s), {elapsedTime.minutes} minute(s) and {elapsedTime.seconds} second(s)
              </p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setTimeout(() => {
                    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Results
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
