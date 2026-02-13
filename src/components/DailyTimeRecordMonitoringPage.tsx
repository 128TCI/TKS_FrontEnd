import { useState } from 'react';
import React from 'react';
import { Calendar, Search, X, FileText, Printer, Check, Clock, Users, Building2, Briefcase, Award, Network, Grid } from 'lucide-react';
import { CalendarPopover } from './CalendarPopover';
import { Footer } from './Footer/Footer';

type TabType = 'tk-group' | 'branch' | 'department' | 'designation' | 'division' | 'section';
type StatusType = 'active' | 'inactive' | 'all';

interface RecordItem {
  id: number;
  code: string;
  description: string;
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
  const [dateFrom, setDateFrom] = useState('3/1/2020');
  const [dateTo, setDateTo] = useState('03/15/2020');
  const [sortAlphabetically, setSortAlphabetically] = useState(false);
  const [status, setStatus] = useState<StatusType>('active');
  const [employeeCode, setEmployeeCode] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('designation');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([1, 2, 3]);
  const [reportType, setReportType] = useState('Accumulation');
  const [toExcelFile, setToExcelFile] = useState(false);
  const [convertToHHMM, setConvertToHHMM] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // TK Group Data
  const tkGroupData: RecordItem[] = [
    { id: 1, code: 'BAT', description: 'BATANGAS' },
    { id: 2, code: 'DASH-TEST', description: 'CEBU' },
    { id: 3, code: 'ddfdsf', description: 'MAKATI' },
    { id: 4, code: 'PASIG', description: 'PASIG' },
    { id: 5, code: 'QC', description: 'QUEZON CITY' }
  ];

  // Branch Data
  const branchData: RecordItem[] = [
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

  // Department Data
  const departmentData: RecordItem[] = [
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
    { id: 27, code: '270', description: 'Internal Audit' }
  ];

  // Designation Data
  const designationData: RecordItem[] = [
    { id: 1, code: '2', description: 'ASSISTANT MANAGER' },
    { id: 2, code: '1', description: 'MANAGER' },
    { id: 3, code: '3', description: 'RANK AND FILE' }
  ];

  // Division Data
  const divisionData: RecordItem[] = [
    { id: 1, code: 'a', description: 'a' },
    { id: 2, code: 'i', description: 'i' },
    { id: 3, code: 's', description: 's' },
    { id: 4, code: '-', description: '-' }
  ];

  // Section Data
  const sectionData: RecordItem[] = [
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

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'tk-group':
        return tkGroupData;
      case 'branch':
        return branchData;
      case 'department':
        return departmentData;
      case 'designation':
        return designationData;
      case 'division':
        return divisionData;
      case 'section':
        return sectionData;
      default:
        return designationData;
    }
  };

  const records = getCurrentData();

  const reportData: EmployeeReport[] = [
    {
      seqNo: 1,
      empCode: 'V067',
      fullName: 'ABAD, JULIE ROSE RAMOS',
      dailyRecords: [
        { date: '1-Mar-2020', day: 'Sun', restDay: true, timeIn: '', timeOut: '', workShift: 'RestDay', noOfHrs: '0.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
        { date: '2-Mar-2020', day: 'Mon', restDay: false, timeIn: '7:07:00AM', timeOut: '5:33:00PM', workShift: '730 AM 6PM', noOfHrs: '9.05', tardiness: '0.00', undertime: '0.45', absences: '0.00', leaveWithPay: '0.00' },
        { date: '3-Mar-2020', day: 'Tue', restDay: false, timeIn: '7:11:00AM', timeOut: '5:47:00PM', workShift: '730 AM 6PM', noOfHrs: '9.28', tardiness: '0.00', undertime: '0.22', absences: '0.00', leaveWithPay: '0.00' },
        { date: '4-Mar-2020', day: 'Wed', restDay: false, timeIn: '', timeOut: '', workShift: 'RegDay', noOfHrs: '8.00', tardiness: '0.00', undertime: '0.00', absences: '1.50', leaveWithPay: '8.00' },
        { date: '5-Mar-2020', day: 'Thu', restDay: false, timeIn: '', timeOut: '', workShift: 'RegDay', noOfHrs: '8.00', tardiness: '0.00', undertime: '0.00', absences: '1.50', leaveWithPay: '8.00' },
        { date: '6-Mar-2020', day: 'Fri', restDay: false, timeIn: '', timeOut: '', workShift: '', noOfHrs: '9.50', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '9.50' },
        { date: '7-Mar-2020', day: 'Sat', restDay: false, timeIn: '', timeOut: '', workShift: 'RestDay', noOfHrs: '0.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
        { date: '8-Mar-2020', day: 'Sun', restDay: true, timeIn: '', timeOut: '', workShift: 'RestDay', noOfHrs: '0.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
        { date: '9-Mar-2020', day: 'Mon', restDay: false, timeIn: '7:12:00AM', timeOut: '5:30:00PM', workShift: '730 AM 6PM', noOfHrs: '9.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
        { date: '10-Mar-2020', day: 'Tue', restDay: false, timeIn: '7:04:00AM', timeOut: '5:32:00PM', workShift: '730 AM 6PM', noOfHrs: '9.03', tardiness: '0.00', undertime: '0.47', absences: '0.00', leaveWithPay: '0.00' },
        { date: '11-Mar-2020', day: 'Wed', restDay: false, timeIn: '6:45:00AM', timeOut: '7:30:00PM', workShift: '730 AM 6PM', noOfHrs: '9.50', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
        { date: '12-Mar-2020', day: 'Thu', restDay: false, timeIn: '7:30:00AM', timeOut: '6:00:00PM', workShift: '730 AM 6PM', noOfHrs: '9.50', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
        { date: '13-Mar-2020', day: 'Fri', restDay: false, timeIn: '7:30:00AM', timeOut: '6:00:00PM', workShift: '730 AM 6PM', noOfHrs: '9.50', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
        { date: '14-Mar-2020', day: 'Sat', restDay: false, timeIn: '', timeOut: '', workShift: 'RestDay', noOfHrs: '0.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
        { date: '15-Mar-2020', day: 'Sun', restDay: true, timeIn: '', timeOut: '', workShift: 'RestDay', noOfHrs: '0.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' }
      ],
      subtotal: {
        noOfHrs: '90.36',
        tardiness: '0.00',
        undertime: '1.14',
        absences: '3.00',
        leaveWithPay: '25.50'
      }
    },
    {
      seqNo: 2,
      empCode: 'D002',
      fullName: 'BALETE, LORENZO MAGADDON',
      dailyRecords: [
        { date: '1-Mar-2020', day: 'Sun', restDay: true, timeIn: '', timeOut: '', workShift: 'RestDay', noOfHrs: '0.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
        { date: '2-Mar-2020', day: 'Mon', restDay: false, timeIn: '9:34:00AM', timeOut: '6:49:00PM', workShift: '930AM730PM', noOfHrs: '9.00', tardiness: '0.07', undertime: '0.68', absences: '0.00', leaveWithPay: '0.00' },
        { date: '3-Mar-2020', day: 'Tue', restDay: false, timeIn: '9:32:00AM', timeOut: '7:44:00PM', workShift: '930AM730PM', noOfHrs: '9.00', tardiness: '0.03', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
        { date: '4-Mar-2020', day: 'Wed', restDay: false, timeIn: '9:41:00AM', timeOut: '6:47:00PM', workShift: '930AM730PM', noOfHrs: '9.00', tardiness: '0.18', undertime: '0.72', absences: '0.00', leaveWithPay: '0.00' },
        { date: '5-Mar-2020', day: 'Thu', restDay: false, timeIn: '9:34:00AM', timeOut: '6:00:00PM', workShift: '930AM730PM', noOfHrs: '7.50', tardiness: '0.07', undertime: '1.50', absences: '0.00', leaveWithPay: '0.00' },
        { date: '6-Mar-2020', day: 'Fri', restDay: false, timeIn: '9:30:00AM', timeOut: '8:00:00PM', workShift: '930AM730PM', noOfHrs: '9.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
        { date: '7-Mar-2020', day: 'Sat', restDay: false, timeIn: '', timeOut: '', workShift: 'RestDay', noOfHrs: '0.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
        { date: '8-Mar-2020', day: 'Sun', restDay: true, timeIn: '', timeOut: '', workShift: 'RestDay', noOfHrs: '0.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
        { date: '9-Mar-2020', day: 'Mon', restDay: false, timeIn: '9:30:00AM', timeOut: '7:30:00PM', workShift: '930AM730PM', noOfHrs: '9.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
        { date: '10-Mar-2020', day: 'Tue', restDay: false, timeIn: '8:57:00AM', timeOut: '6:57:00PM', workShift: '930AM730PM', noOfHrs: '9.00', tardiness: '0.00', undertime: '0.55', absences: '0.00', leaveWithPay: '0.00' },
        { date: '11-Mar-2020', day: 'Wed', restDay: false, timeIn: '9:30:00AM', timeOut: '7:30:00PM', workShift: '930AM730PM', noOfHrs: '9.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
        { date: '12-Mar-2020', day: 'Thu', restDay: false, timeIn: '7:30:00AM', timeOut: '6:00:00PM', workShift: '930AM730PM', noOfHrs: '9.00', tardiness: '0.00', undertime: '1.50', absences: '0.00', leaveWithPay: '0.00' },
        { date: '13-Mar-2020', day: 'Fri', restDay: false, timeIn: '7:30:00AM', timeOut: '6:00:00PM', workShift: '930AM730PM', noOfHrs: '9.00', tardiness: '0.00', undertime: '1.50', absences: '0.00', leaveWithPay: '0.00' },
        { date: '14-Mar-2020', day: 'Sat', restDay: false, timeIn: '', timeOut: '', workShift: 'RestDay', noOfHrs: '0.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' },
        { date: '15-Mar-2020', day: 'Sun', restDay: true, timeIn: '', timeOut: '', workShift: 'RestDay', noOfHrs: '0.00', tardiness: '0.00', undertime: '0.00', absences: '0.00', leaveWithPay: '0.00' }
      ],
      subtotal: {
        noOfHrs: '88.50',
        tardiness: '0.35',
        undertime: '6.45',
        absences: '0.00',
        leaveWithPay: '0.00'
      }
    }
  ];

  const tabs = [
    { id: 'tk-group', label: 'TK Group', icon: Users },
    { id: 'branch', label: 'Branch', icon: Building2 },
    { id: 'department', label: 'Department', icon: Briefcase },
    { id: 'designation', label: 'Designation', icon: Award },
    { id: 'division', label: 'Division', icon: Network },
    { id: 'section', label: 'Section', icon: Grid }
  ];

  const handleItemToggle = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === records.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(records.map(r => r.id));
    }
  };

  const handleSearch = () => {
    console.log('Searching...');
  };

  const handleClearEmployeeCode = () => {
    setEmployeeCode('');
  };

  const handleDisplay = () => {
    setShowReport(true);
  };

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
            <div className="bg-white shadow-sm border border-gray-200 p-8">
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
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
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
                              checked={status === 'active'}
                              onChange={() => setStatus('active')}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">Active</span>
                          </label>
                          <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                            <input
                              type="radio"
                              name="status"
                              checked={status === 'inactive'}
                              onChange={() => setStatus('inactive')}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">In Active</span>
                          </label>
                          <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                            <input
                              type="radio"
                              name="status"
                              checked={status === 'all'}
                              onChange={() => setStatus('all')}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">All</span>
                          </label>
                        </div>
                      </div>

                      {/* Employee Code */}
                      <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Employee Code</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={employeeCode}
                            onChange={(e) => setEmployeeCode(e.target.value)}
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter employee code"
                          />
                          <button
                            onClick={handleSearch}
                            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Search className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleClearEmployeeCode}
                            className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

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

                      {/* Checkboxes */}
                      <div className="mb-6 space-y-2">
                        <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={toExcelFile}
                            onChange={(e) => setToExcelFile(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">To Excel File</span>
                        </label>
                        <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={convertToHHMM}
                            onChange={(e) => setConvertToHHMM(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">Convert To HH:MM</span>
                        </label>
                      </div>

                      {/* Display Button */}
                      <button
                        onClick={handleDisplay}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg shadow-blue-500/30"
                      >
                        Display
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
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Search..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="p-6">
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-center" style={{ width: '50px' }}>
                              <input
                                type="checkbox"
                                checked={selectedItems.length === records.length}
                                onChange={handleSelectAll}
                                className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                              />
                            </th>
                            <th className="px-4 py-3 text-left text-gray-700">Code</th>
                            <th className="px-4 py-3 text-left text-gray-700">Description</th>
                              </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {records.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedItems.includes(item.id)}
                                  onChange={() => handleItemToggle(item.id)}
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
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-gray-600" style={{ fontSize: '0.875rem' }}>
                        Showing 1 to 3 of 3 entries
                      </p>
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          Previous
                        </button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded-lg">1</button>
                        <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          Next
                        </button>
                      </div>
                    </div>
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