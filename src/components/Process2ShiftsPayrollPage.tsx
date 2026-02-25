import { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle,
  Clock,
  Users,
  Building2,
  Layers,
  CalendarDays,
  Wallet,
  Filter,
  Check
} from 'lucide-react';
import { DatePicker } from './DateSetup/DatePicker';
import { Footer } from './Footer/Footer';

type TabType = 'tk-group' | 'branch' | 'department' | 'division' | 'group-schedule' | 'pay-house' | 'section' | 'unit';

interface CodeItem {
  id: number;
  code: string;
  description: string;
}

interface Employee {
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

export function Process2ShiftsPayrollPage() {
  const [activeTab, setActiveTab] = useState<TabType>('tk-group');
  const [searchCode, setSearchCode] = useState('');
  const [searchEmployee, setSearchEmployee] = useState('');
  const [selectedCodes, setSelectedCodes] = useState<number[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
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

  const codes: CodeItem[] = [
    { id: 1, code: 'BAT', description: 'BATANGAS' },
    { id: 2, code: 'DASH-TEST', description: 'CEBU' },
    { id: 3, code: 'ddfdsf', description: 'MAKATI' },
    { id: 4, code: 'PASIG', description: 'PASIG' },
    { id: 5, code: 'QC', description: 'QUEZON CITY' }
  ];

  const branchData: CodeItem[] = [
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
  ];

  const groupScheduleData: CodeItem[] = [
    { id: 1, code: 'a', description: 'a' },
    { id: 2, code: 'ab', description: 'ab' }
  ];

  const departmentData: CodeItem[] = [
    { id: 1, code: '-', description: '-' },
    { id: 2, code: 'A', description: 'A' },
    { id: 3, code: '108', description: 'Accounting' },
    { id: 4, code: 'FNGCLRK', description: 'Accounting Clerk' },
    { id: 5, code: '330', description: 'Audit' },
    { id: 6, code: '600', description: 'Building Administration' },
    { id: 7, code: '106', description: 'Building Administration_old' },
    { id: 8, code: '134CS', description: 'CAVITE SATELLITE' },
    { id: 9, code: '231', description: 'Contract' },
    { id: 10, code: '233', description: 'Creative' },
    { id: 11, code: '112', description: 'Credit & Collection_old' },
    { id: 12, code: '420', description: 'Credit and Collection' },
    { id: 13, code: 'D', description: 'D' },
    { id: 14, code: '215', description: 'Dealers Market' },
    { id: 15, code: '132', description: 'Delivery' },
    { id: 16, code: '251', description: 'Delivery Operations' },
    { id: 17, code: '127', description: 'DNRM (Dealer)-old' },
    { id: 18, code: '220', description: 'Engineering' },
    { id: 19, code: '125', description: 'Engineering-OLD' },
    { id: 20, code: '221', description: 'Estimation' },
    { id: 21, code: '230', description: 'Executive' },
    { id: 22, code: '235', description: 'Finance' },
    { id: 23, code: '240', description: 'General Affairs' },
    { id: 24, code: '107', description: 'HR' },
    { id: 25, code: '250', description: 'Human Resources' },
    { id: 26, code: '260', description: 'Information Technology' },
    { id: 27, code: '270', description: 'Internal Audit' },
    { id: 28, code: '280', description: 'Legal' },
    { id: 29, code: '290', description: 'Logistics' },
    { id: 30, code: '300', description: 'Manufacturing' },
    { id: 31, code: '310', description: 'Marketing' },
    { id: 32, code: '320', description: 'Operations' },
    { id: 33, code: '340', description: 'Planning' },
    { id: 34, code: '350', description: 'Procurement' },
    { id: 35, code: '360', description: 'Production' },
    { id: 36, code: '370', description: 'Quality Assurance' },
    { id: 37, code: '380', description: 'Research and Development' },
    { id: 38, code: '390', description: 'Sales' },
    { id: 39, code: '400', description: 'Security' },
    { id: 40, code: '410', description: 'Supply Chain' },
    { id: 41, code: '430', description: 'Training' },
    { id: 42, code: '440', description: 'Treasury' },
    { id: 43, code: '450', description: 'Warehouse' },
    { id: 44, code: 'ACC', description: 'Accounting Department' },
    { id: 45, code: 'ADM', description: 'Administration' },
    { id: 46, code: 'CSR', description: 'Customer Service' },
    { id: 47, code: 'ENG', description: 'Engineering Department' },
    { id: 48, code: 'FIN', description: 'Finance Department' },
    { id: 49, code: 'HRD', description: 'Human Resources Department' },
    { id: 50, code: 'ITD', description: 'IT Department' },
    { id: 51, code: 'LOG', description: 'Logistics Department' },
    { id: 52, code: 'MFG', description: 'Manufacturing Department' },
    { id: 53, code: 'MKT', description: 'Marketing Department' },
    { id: 54, code: 'OPS', description: 'Operations Department' },
    { id: 55, code: 'PRD', description: 'Production Department' },
    { id: 56, code: 'QA', description: 'Quality Assurance Department' },
    { id: 57, code: 'RND', description: 'Research and Development Department' },
    { id: 58, code: 'SAL', description: 'Sales Department' },
    { id: 59, code: 'SCM', description: 'Supply Chain Management' },
    { id: 60, code: 'TRN', description: 'Training Department' },
    { id: 61, code: 'WHS', description: 'Warehouse Department' },
    { id: 62, code: 'PUR', description: 'Purchasing' },
    { id: 63, code: 'INV', description: 'Inventory' },
    { id: 64, code: 'SHP', description: 'Shipping' },
    { id: 65, code: 'REC', description: 'Receiving' },
    { id: 66, code: 'MNT', description: 'Maintenance' },
    { id: 67, code: 'FAC', description: 'Facilities' },
    { id: 68, code: 'COM', description: 'Compliance' },
    { id: 69, code: 'STR', description: 'Strategy' }
  ];

  const divisionData: CodeItem[] = [
    { id: 1, code: 'a', description: 'a' },
    { id: 2, code: 'i', description: 'i' },
    { id: 3, code: 's', description: 's' },
    { id: 4, code: '-', description: '-' }
  ];

  const payHouseData: CodeItem[] = [
    { id: 1, code: '-', description: '-' },
    { id: 2, code: 'ACCT1', description: 'Accounting 1' },
    { id: 3, code: 'ACCT2', description: 'Accounting 2' },
    { id: 4, code: 'ACCT3', description: 'Accounting 3' },
    { id: 5, code: 'ACCT4', description: 'Accounting 4' },
    { id: 6, code: 'ACCT5', description: 'Accounting 5' },
    { id: 7, code: 'ACCT6', description: 'Accounting 6' },
    { id: 8, code: 'ACMES', description: 'ACTUAL MEASURERS' },
    { id: 9, code: 'AUDIT', description: 'AUDIT' },
    { id: 10, code: 'BATPLNT1', description: 'BATANGAS - PLANT 1' },
    { id: 11, code: 'BATPLNT2', description: 'BATANGAS - PLANT 2' },
    { id: 12, code: 'BATPLNT3', description: 'BATANGAS - PLANT 3' },
    { id: 13, code: 'BICDARA', description: 'BICOL - DARAGA' },
    { id: 14, code: 'BICOL', description: 'BICOL' },
    { id: 15, code: 'BILLING', description: 'BILLING' },
    { id: 16, code: 'BIZDEV', description: 'BUSINESS DEVELOPMENT' },
    { id: 17, code: 'BLDGADM', description: 'BUILDING ADMINISTRATION' },
    { id: 18, code: 'BRANCH', description: 'BRANCH' },
    { id: 19, code: 'CAR', description: 'CAR' },
    { id: 20, code: 'CASHIER', description: 'CASHIER' },
    { id: 21, code: 'CAVITE', description: 'CAVITE' },
    { id: 22, code: 'CAVSAT', description: 'CAVITE SATELLITE' },
    { id: 23, code: 'COLTN', description: 'COLLECTION' },
    { id: 24, code: 'COMDEV', description: 'COMMERCIAL DEVELOPMENT' },
    { id: 25, code: 'COMPLY', description: 'COMPLIANCE' },
    { id: 26, code: 'CONSTRU', description: 'CONSTRUCTION' },
    { id: 27, code: 'CONTR', description: 'CONTRACT' },
    { id: 28, code: 'CREDIT', description: 'CREDIT' },
    { id: 29, code: 'CUSTSER', description: 'CUSTOMER SERVICE' },
    { id: 30, code: 'DELIVERY', description: 'DELIVERY' },
    { id: 31, code: 'DESIGN', description: 'DESIGN' },
    { id: 32, code: 'DISTRI', description: 'DISTRIBUTION' },
    { id: 33, code: 'DNRM', description: 'DNRM' },
    { id: 34, code: 'ENGR', description: 'ENGINEERING' },
    { id: 35, code: 'ESTIM', description: 'ESTIMATION' },
    { id: 36, code: 'EXEC', description: 'EXECUTIVE' },
    { id: 37, code: 'FACIL', description: 'FACILITIES' },
    { id: 38, code: 'FIN', description: 'FINANCE' },
    { id: 39, code: 'FLEET', description: 'FLEET' },
    { id: 40, code: 'GENAF', description: 'GENERAL AFFAIRS' },
    { id: 41, code: 'HR', description: 'HUMAN RESOURCES' },
    { id: 42, code: 'INFRA', description: 'INFRASTRUCTURE' },
    { id: 43, code: 'INSTAL', description: 'INSTALLATION' },
    { id: 44, code: 'INVENT', description: 'INVENTORY' },
    { id: 45, code: 'IT', description: 'INFORMATION TECHNOLOGY' },
    { id: 46, code: 'LAUNION', description: 'LA UNION' },
    { id: 47, code: 'LEGAL', description: 'LEGAL' },
    { id: 48, code: 'LOGIS', description: 'LOGISTICS' },
    { id: 49, code: 'MAIN', description: 'MAIN' },
    { id: 50, code: 'MAINT', description: 'MAINTENANCE' },
    { id: 51, code: 'MANUF', description: 'MANUFACTURING' },
    { id: 52, code: 'MARKET', description: 'MARKETING' },
    { id: 53, code: 'MECHANIC', description: 'MECHANICS' },
    { id: 54, code: 'NCR', description: 'NCR' },
    { id: 55, code: 'NUEVA', description: 'NUEVA ECIJA' },
    { id: 56, code: 'OPERAT', description: 'OPERATIONS' },
    { id: 57, code: 'PAMPANG', description: 'PAMPANGA' },
    { id: 58, code: 'PAMBUL', description: 'PAMPANGA-BULACAN' },
    { id: 59, code: 'PAYROLL', description: 'PAYROLL' },
    { id: 60, code: 'PLAN', description: 'PLANNING' },
    { id: 61, code: 'PLANT1', description: 'PLANT 1' },
    { id: 62, code: 'PLANT2', description: 'PLANT 2' },
    { id: 63, code: 'PLANT3', description: 'PLANT 3' },
    { id: 64, code: 'PROCUR', description: 'PROCUREMENT' },
    { id: 65, code: 'PROD', description: 'PRODUCTION' },
    { id: 66, code: 'PROJMAN', description: 'PROJECT MANAGEMENT' },
    { id: 67, code: 'PROPDEV', description: 'PROPERTY DEVELOPMENT' },
    { id: 68, code: 'PURCHAS', description: 'PURCHASING' },
    { id: 69, code: 'QA', description: 'QUALITY ASSURANCE' },
    { id: 70, code: 'QC', description: 'QUALITY CONTROL' },
    { id: 71, code: 'RECEIV', description: 'RECEIVING' },
    { id: 72, code: 'RECRUIT', description: 'RECRUITMENT' },
    { id: 73, code: 'RETAIL', description: 'RETAIL' },
    { id: 74, code: 'RND', description: 'RESEARCH AND DEVELOPMENT' },
    { id: 75, code: 'SAFE', description: 'SAFETY' },
    { id: 76, code: 'SALES', description: 'SALES' },
    { id: 77, code: 'SECUR', description: 'SECURITY' },
    { id: 78, code: 'SHIP', description: 'SHIPPING' },
    { id: 79, code: 'STORE', description: 'STORE' },
    { id: 80, code: 'SUPPLY', description: 'SUPPLY CHAIN' },
    { id: 81, code: 'TARLAC', description: 'TARLAC' },
    { id: 82, code: 'TECH', description: 'TECHNICAL' },
    { id: 83, code: 'TRAIN', description: 'TRAINING' },
    { id: 84, code: 'TRANSP', description: 'TRANSPORT' },
    { id: 85, code: 'TREAS', description: 'TREASURY' },
    { id: 86, code: 'URDANET', description: 'URDANETA' },
    { id: 87, code: 'WAREHS', description: 'WAREHOUSE' },
    { id: 88, code: 'WELD', description: 'WELDING' },
    { id: 89, code: 'WHOUSE1', description: 'WAREHOUSE 1' },
    { id: 90, code: 'WHOUSE2', description: 'WAREHOUSE 2' },
    { id: 91, code: 'ADMIN1', description: 'ADMINISTRATION 1' },
    { id: 92, code: 'ADMIN2', description: 'ADMINISTRATION 2' },
    { id: 93, code: 'SALES1', description: 'SALES TEAM 1' },
    { id: 94, code: 'SALES2', description: 'SALES TEAM 2' },
    { id: 95, code: 'SALES3', description: 'SALES TEAM 3' },
    { id: 96, code: 'MARKET1', description: 'MARKETING TEAM 1' },
    { id: 97, code: 'MARKET2', description: 'MARKETING TEAM 2' },
    { id: 98, code: 'PROD1', description: 'PRODUCTION TEAM 1' },
    { id: 99, code: 'PROD2', description: 'PRODUCTION TEAM 2' },
    { id: 100, code: 'QUAL1', description: 'QUALITY TEAM 1' },
    { id: 101, code: 'QUAL2', description: 'QUALITY TEAM 2' },
    { id: 102, code: 'TECH1', description: 'TECHNICAL TEAM 1' },
    { id: 103, code: 'TECH2', description: 'TECHNICAL TEAM 2' },
    { id: 104, code: 'SUPPORT1', description: 'SUPPORT TEAM 1' },
    { id: 105, code: 'SUPPORT2', description: 'SUPPORT TEAM 2' },
    { id: 106, code: 'OPS1', description: 'OPERATIONS TEAM 1' },
    { id: 107, code: 'OPS2', description: 'OPERATIONS TEAM 2' },
    { id: 108, code: 'LOG1', description: 'LOGISTICS TEAM 1' },
    { id: 109, code: 'LOG2', description: 'LOGISTICS TEAM 2' },
    { id: 110, code: 'FLEET1', description: 'FLEET TEAM 1' }
  ];

  const sectionData: CodeItem[] = [
    { id: 1, code: '-', description: '-' },
    { id: 2, code: 'ACCT1', description: 'Accounting 1' },
    { id: 3, code: 'ACCT2', description: 'Accounting 2' },
    { id: 4, code: 'ACCT3', description: 'Accounting 3' },
    { id: 5, code: 'ACCT4', description: 'Accounting 4' },
    { id: 6, code: 'ACCT5', description: 'Accounting 5' },
    { id: 7, code: 'ACCT6', description: 'Accounting 6' },
    { id: 8, code: 'ACMES', description: 'ACTUAL MEASURERS' },
    { id: 9, code: 'AUDIT', description: 'AUDIT' },
    { id: 10, code: 'BATPLNT1', description: 'BATANGAS - PLANT 1' }
  ];

  const unitData: CodeItem[] = [
    { id: 1, code: '-', description: '-' },
    { id: 2, code: 'UNIT 1', description: 'UNIT1' }
  ];

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'branch':
        return branchData;
      case 'department':
        return departmentData;
      case 'division':
        return divisionData;
      case 'group-schedule':
        return groupScheduleData;
      case 'pay-house':
        return payHouseData;
      case 'section':
        return sectionData;
      case 'unit':
        return unitData;
      default:
        return codes;
    }
  };

  const currentData = getCurrentData();

  // Get selection title based on active tab
  const getSelectionTitle = () => {
    switch (activeTab) {
      case 'tk-group':
        return 'TK Group Selection';
      case 'branch':
        return 'Branch Selection';
      case 'department':
        return 'Department Selection';
      case 'division':
        return 'Division Selection';
      case 'group-schedule':
        return 'Group Schedule Selection';
      case 'pay-house':
        return 'Pay House Selection';
      case 'section':
        return 'Section Selection';
      case 'unit':
        return 'Unit Selection';
      default:
        return 'Selection';
    }
  };

  const employees: Employee[] = [
    { id: 1, code: 'V067', name: 'ABAD, JULIE ROSE RAMOS' },
    { id: 2, code: 'D002', name: 'BALETE, LORENZO MAGADDON' },
    { id: 3, code: 'Z563', name: 'CANILLA, ARVIN SERRANO' },
    { id: 4, code: '2021002', name: 'DELA CRUZ 2, JUAN 2 A 2' },
    { id: 5, code: '2021003', name: 'DELA CRUZ 3, JUAN 3 A 3' },
    { id: 6, code: '20210101A', name: 'DELA CRUZ, JUAN A' },
    { id: 7, code: 'M034', name: 'ESQUILLO, HECTOR RIVERA' },
    { id: 8, code: 'X058', name: 'LIM, SAMUEL ADONIS' },
    { id: 9, code: 'Z440', name: 'MARTINEZ, RACHEL IMUS' },
    { id: 10, code: 'L007', name: 'ONG, KEVIN UMALI' }
  ];

  const tardinessData: TardinessData[] = [];
  const resultData: ResultData[] = [];
  const nightDifferentialData: NightDifferentialData[] = [];
  const leaveAbsenceData: LeaveAbsenceData[] = [];
  const regularWorkingData: RegularWorkingData[] = [];
  const overtimeData: OvertimeData[] = [];

  const tabs = [
    { id: 'tk-group', label: 'TK Group', icon: Users },
    { id: 'branch', label: 'Branch', icon: Building2 },
    { id: 'department', label: 'Department', icon: Layers },
    { id: 'division', label: 'Division', icon: Filter },
    { id: 'group-schedule', label: 'Group Schedule', icon: CalendarDays },
    { id: 'pay-house', label: 'Pay House', icon: Wallet },
    { id: 'section', label: 'Section', icon: Filter },
    { id: 'unit', label: 'Unit', icon: Building2 }
  ];

  const resultTabs = [
    { id: 'tardiness', label: 'Tardiness' },
    { id: 'undertime', label: 'Undertime' },
    { id: 'overtime', label: 'Overtime' },
    { id: 'night-differentials', label: 'Night Differentials' },
    { id: 'leave-absences', label: 'Leave/Absences' },
    { id: 'regular-working', label: 'Regular Working' },
    { id: 'allowances', label: 'Allowances' },
    { id: 'holiday-pay', label: 'Holiday Pay' }
  ];

  const handleSelectAllCodes = () => {
    if (selectedCodes.length === currentData.length) {
      setSelectedCodes([]);
    } else {
      setSelectedCodes(currentData.map(item => item.id));
    }
  };

  const handleSelectCode = (id: number) => {
    if (selectedCodes.includes(id)) {
      setSelectedCodes(selectedCodes.filter(codeId => codeId !== id));
    } else {
      setSelectedCodes([...selectedCodes, id]);
    }
  };

  const handleSelectAllEmployees = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp.id));
    }
  };

  const handleSelectEmployee = (id: number) => {
    if (selectedEmployees.includes(id)) {
      setSelectedEmployees(selectedEmployees.filter(empId => empId !== id));
    } else {
      setSelectedEmployees([...selectedEmployees, id]);
    }
  };

  const handleProcess = () => {
    setProcessing(true);
    setShowResults(false);

    setTimeout(() => {
      const elapsed = { hours: 0, minutes: 0, seconds: 3 };
      setElapsedTime(elapsed);
      setProcessing(false);
      setShowSuccessModal(true);
      setShowResults(true);
    }, 3000);
  };

  const handleProcessOptionChange = (option: string) => {
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
      setProcessOptions(prev => {
        const newOptions = { ...prev, [option]: !prev[option as keyof typeof prev] };
        const allSelected = newOptions.tardiness && newOptions.allowances && 
                          newOptions.undertime && newOptions.overtime && 
                          newOptions.leaveAbsences && newOptions.nightDifferentials &&
                          newOptions.regularWorking && newOptions.holidayPay;
        newOptions.selectAll = allSelected;
        return newOptions;
      });
    }
  };

  // Clear selections when tab changes
  useEffect(() => {
    setSelectedCodes([]);
  }, [activeTab]);

  const filteredCodes = currentData.filter(item =>
    item.code.toLowerCase().includes(searchCode.toLowerCase()) ||
    item.description.toLowerCase().includes(searchCode.toLowerCase())
  );

  const filteredEmployees = employees.filter(emp =>
    emp.code.toLowerCase().includes(searchEmployee.toLowerCase()) ||
    emp.name.toLowerCase().includes(searchEmployee.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Processing 2 Shifts In A Day</h1>
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

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex items-center gap-1 border-b border-gray-200 flex-wrap">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Side - Code Selection */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
            <h3 className="text-gray-900 mb-4">{getSelectionTitle()}</h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search code or description..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedCodes.length === currentData.length && currentData.length > 0}
                        onChange={handleSelectAllCodes}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-gray-700">Code</th>
                    <th className="px-4 py-3 text-left text-gray-700">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCodes.slice(0, 10).map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedCodes.includes(item.id)}
                          onChange={() => handleSelectCode(item.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-900">{item.code}</td>
                      <td className="px-4 py-3 text-gray-600">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <span>Showing 1 to {Math.min(10, filteredCodes.length)} of {filteredCodes.length} entries</span>
                <div className="flex items-center gap-1">
                  <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-100">‹</button>
                  <button className="w-6 h-6 flex items-center justify-center rounded bg-blue-500 text-white">1</button>
                  <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-100">›</button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Employee Selection */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
            <h3 className="text-gray-900 mb-4">Employee Selection</h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search employee..."
                value={searchEmployee}
                onChange={(e) => setSearchEmployee(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.length === employees.length}
                        onChange={handleSelectAllEmployees}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-gray-700">Code</th>
                    <th className="px-4 py-3 text-left text-gray-700">Name</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(emp.id)}
                          onChange={() => handleSelectEmployee(emp.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-900">{emp.code}</td>
                      <td className="px-4 py-3 text-gray-600">{emp.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <span>Showing {filteredEmployees.length} of {employees.length} entries</span>
                <div className="flex items-center gap-1">
                  <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-100">‹</button>
                  <button className="w-6 h-6 flex items-center justify-center rounded bg-blue-500 text-white">1</button>
                  <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-100">›</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range and Process Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 pt-0">
          {/* Date Selection */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-700 mb-2">Date From</label>
                <DatePicker value={dateFrom} onChange={setDateFrom} />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-700 mb-2">Date To</label>
                <DatePicker value={dateTo} onChange={setDateTo} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Date Applied</label>
              <DatePicker value={dateApplied} onChange={setDateApplied} />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="lateFiling"
                checked={lateFiling}
                onChange={(e) => setLateFiling(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="lateFiling" className="text-sm text-gray-700">
                Include Late Filing
              </label>
            </div>
          </div>

          {/* Process Options */}
          <div>
            <h3 className="text-gray-900 mb-3 text-sm">Process Options</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={processOptions.selectAll}
                  onChange={() => handleProcessOptionChange('selectAll')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Select All</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={processOptions.tardiness}
                  onChange={() => handleProcessOptionChange('tardiness')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Tardiness</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={processOptions.undertime}
                  onChange={() => handleProcessOptionChange('undertime')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Undertime</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={processOptions.overtime}
                  onChange={() => handleProcessOptionChange('overtime')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Overtime</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={processOptions.nightDifferentials}
                  onChange={() => handleProcessOptionChange('nightDifferentials')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Night Differentials</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={processOptions.leaveAbsences}
                  onChange={() => handleProcessOptionChange('leaveAbsences')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Leave/Absences</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={processOptions.regularWorking}
                  onChange={() => handleProcessOptionChange('regularWorking')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Regular Working</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={processOptions.allowances}
                  onChange={() => handleProcessOptionChange('allowances')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Allowances</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={processOptions.holidayPay}
                  onChange={() => handleProcessOptionChange('holidayPay')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Holiday Pay</span>
              </label>
            </div>
          </div>
        </div>

        {/* Process Button */}
        <div className="px-6 pb-6">
          <button
            onClick={handleProcess}
            disabled={processing}
            className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Process Data</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {showResults && (
        <div ref={resultsRef} className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-gray-900">Processing Results</h2>
          </div>

          <div className="border-b border-gray-200 overflow-x-auto">
            <div className="flex min-w-max">
              {resultTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveResultTab(tab.id)}
                  className={`px-6 py-3 text-sm whitespace-nowrap transition-all ${
                    activeResultTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-gray-700">Employee Code</th>
                  <th className="px-4 py-3 text-left text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-gray-700">
                    {activeResultTab === 'leave-absences' ? 'Date' : 
                     (activeResultTab === 'night-differentials' || activeResultTab === 'overtime') ? 'Date From' : 'Date In'}
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700">
                    {activeResultTab === 'leave-absences' ? 'Leave Code' : 
                     (activeResultTab === 'night-differentials' || activeResultTab === 'overtime') ? 'Date To' : 'Date Out'}
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700">
                    {activeResultTab === 'leave-absences' ? 'Hours' : 
                     (activeResultTab === 'overtime') ? 'No. OT Hours Approved' : 'Time In'}
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700">
                    {activeResultTab === 'leave-absences' ? 'Reason' : 
                     (activeResultTab === 'overtime') ? 'TK Group' : 'Time Out'}
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700">
                    {activeResultTab === 'leave-absences' ? 'Remarks' : 
                     (activeResultTab === 'overtime') ? 'Reason' : 'Workshift Code'}
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700">
                    {activeResultTab === 'tardiness' ? 'Tardiness' : 
                     activeResultTab === 'undertime' ? 'Undertime' : 
                     activeResultTab === 'night-differentials' ? 'Overtime' :
                     activeResultTab === 'regular-working' ? 'Hours' :
                     activeResultTab === 'overtime' ? 'Remarks' :
                     activeResultTab === 'leave-absences' ? 'With Pay' : 'Value'}
                  </th>
                  {(activeResultTab === 'tardiness' || activeResultTab === 'undertime') && (
                    <>
                      <th className="px-4 py-3 text-left text-gray-700">
                        {activeResultTab === 'tardiness' ? 'Tardiness Within Grace' : 'Undertime Within Grace'}
                      </th>
                      <th className="px-4 py-3 text-left text-gray-700">
                        {activeResultTab === 'tardiness' ? 'Actual Tardiness' : 'Actual Undertime'}
                      </th>
                    </>
                  )}
                  {activeResultTab === 'night-differentials' && (
                    <th className="px-4 py-3 text-left text-gray-700">OT Code</th>
                  )}
                  {activeResultTab === 'regular-working' && (
                    <th className="px-4 py-3 text-left text-gray-700">Remarks</th>
                  )}
                  {activeResultTab === 'overtime' && (
                    <>
                      <th className="px-4 py-3 text-left text-gray-700">OT Time Before Shift</th>
                      <th className="px-4 py-3 text-left text-gray-700">Break No. OT Hours Approved</th>
                      <th className="px-4 py-3 text-left text-gray-700">Start Time OT Overtime</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-gray-500">
                    No data available - Process data for two shifts to view results
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <span className="text-xs text-gray-500">Showing 0 entries</span>
            <div className="flex items-center gap-1">
              <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs">‹</button>
              <button className="w-6 h-6 flex items-center justify-center rounded bg-blue-500 text-white text-xs">1</button>
              <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs">›</button>
            </div>
          </div>
        </div>
      )}

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