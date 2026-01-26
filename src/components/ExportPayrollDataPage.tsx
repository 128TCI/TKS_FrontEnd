import { useState } from 'react';
import { Search, Users, Building2, Briefcase, Award, LayoutGrid, Network, Layers, CalendarDays, Wallet, Upload, Download, Check } from 'lucide-react';
import { CalendarPopover } from './CalendarPopover';
import { Footer } from './Footer/Footer';

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

type TabType = 'TK Group' | 'Branch' | 'Department' | 'Division' | 'Group Schedule' | 'Pay House' | 'Section' | 'Unit';
type StatusType = 'active' | 'inactive' | 'all';

export function ExportPayrollDataPage() {
  const [activeTab, setActiveTab] = useState<TabType>('TK Group');
  const [searchCode, setSearchCode] = useState('');
  const [searchEmployee, setSearchEmployee] = useState('');
  const [currentCodePage, setCurrentCodePage] = useState(1);
  const [currentEmployeePage, setCurrentEmployeePage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusType>('active');
  const [dateFrom, setDateFrom] = useState('5/5/2021');
  const [dateTo, setDateTo] = useState('05/05/2021');
  const [transactionDate, setTransactionDate] = useState('12/26/2025');
  const [applyTransactionDate, setApplyTransactionDate] = useState(false);
  const [assumedDate, setAssumedDate] = useState('');
  const [computePer, setComputePer] = useState<'date' | 'sum'>('date');
  const [computeAs, setComputeAs] = useState<'perfect' | 'net'>('perfect');
  const [exportTo, setExportTo] = useState<'sql' | 'text'>('sql');
  
  const itemsPerPage = 10;

  const [processOptions, setProcessOptions] = useState({
    lates: false,
    overtime: false,
    otherEarnings: false,
    undertime: false,
    leaveAbsences: false,
    daysAndHours: false,
    selectAll: false
  });

  // TK Group Data
  const tkGroupData: CodeItem[] = [
    { id: 1, code: 'BAT', description: 'BATANGAS' },
    { id: 2, code: 'DASH-TEST', description: 'CEBU' },
    { id: 3, code: 'ddfdsf', description: 'MAKATI' },
    { id: 4, code: 'PASIG', description: 'PASIG' },
    { id: 5, code: 'QC', description: 'QUEZON CITY' }
  ];

  // Branch Data
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

  // Group Schedule Data
  const groupScheduleData: CodeItem[] = [
    { id: 1, code: 'a', description: 'a' },
    { id: 2, code: 'ab', description: 'ab' }
  ];

  // Department Data
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

  // Division Data
  const divisionData: CodeItem[] = [
    { id: 1, code: 'a', description: 'a' },
    { id: 2, code: 'i', description: 'i' },
    { id: 3, code: 's', description: 's' },
    { id: 4, code: '-', description: '-' }
  ];

  // Pay House Data
  const payHouseData: CodeItem[] = [
    { id: 1, code: '-', description: '-' },
    { id: 2, code: 'a', description: 'a' },
    { id: 3, code: 'i', description: 'i' },
    { id: 4, code: 's', description: 's' }
  ];

  // Section Data
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

  // Unit Data
  const unitData: CodeItem[] = [
    { id: 1, code: '-', description: '-' },
    { id: 2, code: 'UNIT 1', description: 'UNIT1' }
  ];

  const employees: Employee[] = [
    { id: 1, code: '000878', name: 'Last, First A' },
    { id: 2, code: '000900', name: 'Last, First A' },
    { id: 3, code: '000901', name: 'Last, First A' },
    { id: 4, code: '000903', name: 'Last, First A' },
    { id: 5, code: '000904', name: 'Last, First A' },
    { id: 6, code: '000905', name: 'Last, First A' },
    { id: 7, code: '000906', name: 'Last, First A' },
    { id: 8, code: '000907', name: 'Last, First A' },
    { id: 9, code: '000908', name: 'Last, First A' },
    { id: 10, code: '000942', name: 'Last, First A' }
  ];

  const [selectedCodes, setSelectedCodes] = useState<number[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'Branch':
        return branchData;
      case 'Department':
        return departmentData;
      case 'Division':
        return divisionData;
      case 'Group Schedule':
        return groupScheduleData;
      case 'Pay House':
        return payHouseData;
      case 'Section':
        return sectionData;
      case 'Unit':
        return unitData;
      default:
        return tkGroupData;
    }
  };

  const currentItems = getCurrentData();

  const filteredCodes = currentItems.filter(item =>
    item.code.toLowerCase().includes(searchCode.toLowerCase()) ||
    item.description.toLowerCase().includes(searchCode.toLowerCase())
  );

  const filteredEmployees = employees.filter(emp =>
    emp.code.toLowerCase().includes(searchEmployee.toLowerCase()) ||
    emp.name.toLowerCase().includes(searchEmployee.toLowerCase())
  );

  const totalCodePages = Math.ceil(filteredCodes.length / itemsPerPage);
  const totalEmployeePages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const paginatedCodes = filteredCodes.slice(
    (currentCodePage - 1) * itemsPerPage,
    currentCodePage * itemsPerPage
  );

  const paginatedEmployees = filteredEmployees.slice(
    (currentEmployeePage - 1) * itemsPerPage,
    currentEmployeePage * itemsPerPage
  );

  const handleSelectAllCodes = (checked: boolean) => {
    setSelectedCodes(checked ? currentItems.map(item => item.id) : []);
  };

  const handleSelectCode = (id: number, checked: boolean) => {
    setSelectedCodes(prev =>
      checked ? [...prev, id] : prev.filter(itemId => itemId !== id)
    );
  };

  const handleSelectAllEmployees = (checked: boolean) => {
    setSelectedEmployees(checked ? employees.map(emp => emp.id) : []);
  };

  const handleSelectEmployee = (id: number, checked: boolean) => {
    setSelectedEmployees(prev =>
      checked ? [...prev, id] : prev.filter(empId => empId !== id)
    );
  };

  const handleSelectAllProcesses = (checked: boolean) => {
    setProcessOptions({
      lates: checked,
      overtime: checked,
      otherEarnings: checked,
      undertime: checked,
      leaveAbsences: checked,
      daysAndHours: checked,
      selectAll: checked
    });
  };

  const renderCodePageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalCodePages <= maxVisible) {
      for (let i = 1; i <= totalCodePages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentCodePage(i)}
            className={`px-3 py-1 rounded text-sm ${
              currentCodePage === i
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      for (let i = 1; i <= 5; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentCodePage(i)}
            className={`px-3 py-1 rounded text-sm ${
              currentCodePage === i
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {i}
          </button>
        );
      }
      
      if (totalCodePages > 6) {
        pages.push(<span key="ellipsis" className="px-2 text-gray-500">...</span>);
      }
      
      pages.push(
        <button
          key={totalCodePages}
          onClick={() => setCurrentCodePage(totalCodePages)}
          className={`px-3 py-1 rounded text-sm ${
            currentCodePage === totalCodePages
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          {totalCodePages}
        </button>
      );
    }
    
    return pages;
  };

  const renderEmployeePageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalEmployeePages <= maxVisible) {
      for (let i = 1; i <= totalEmployeePages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentEmployeePage(i)}
            className={`px-3 py-1 rounded text-sm ${
              currentEmployeePage === i
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      for (let i = 1; i <= 5; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentEmployeePage(i)}
            className={`px-3 py-1 rounded text-sm ${
              currentEmployeePage === i
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {i}
          </button>
        );
      }
      
      if (totalEmployeePages > 6) {
        pages.push(<span key="ellipsis" className="px-2 text-gray-500">...</span>);
      }
      
      pages.push(
        <button
          key={totalEmployeePages}
          onClick={() => setCurrentEmployeePage(totalEmployeePages)}
          className={`px-3 py-1 rounded text-sm ${
            currentEmployeePage === totalEmployeePages
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          {totalEmployeePages}
        </button>
      );
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Export Payroll Data</h1>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
            {/* Info Section */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-3">
                    Export payroll and timekeeping data to external systems. Select the date range and transaction date, then choose the groups to export.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Export to SQL or Text File</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Filter by date range</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Select groups and departments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Set transaction dates</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="flex items-center gap-1 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('TK Group')}
                  className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                    activeTab === 'TK Group'
                      ? 'font-medium bg-blue-600 text-white -mb-px'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
                >
                  <Users className="w-4 h-4" />
                  TK Group
                </button>
                <button
                  onClick={() => setActiveTab('Branch')}
                  className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                    activeTab === 'Branch'
                      ? 'font-medium bg-blue-600 text-white -mb-px'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
                >
                  <Building2 className="w-4 h-4" />
                  Branch
                </button>
                <button
                  onClick={() => setActiveTab('Department')}
                  className={`px-4 py-2.5 text-sm transition-all flex items-center gap-2 rounded-t-lg ${
                    activeTab === 'Department'
                      ? 'font-medium bg-blue-600 text-white -mb-px'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
                >
                  <Briefcase className="w-4 h-4" />
                  Department
                </button>
                <button
                  onClick={() => setActiveTab('Division')}
                  className={`px-4 py-2.5 text-sm transition-all flex items-center gap-2 rounded-t-lg ${
                    activeTab === 'Division'
                      ? 'font-medium bg-blue-600 text-white -mb-px'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Division
                </button>
                <button
                  onClick={() => setActiveTab('Group Schedule')}
                  className={`px-4 py-2.5 text-sm transition-all flex items-center gap-2 rounded-t-lg ${
                    activeTab === 'Group Schedule'
                      ? 'font-medium bg-blue-600 text-white -mb-px'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
                >
                  <CalendarDays className="w-4 h-4" />
                  Group Schedule
                </button>
                <button
                  onClick={() => setActiveTab('Pay House')}
                  className={`px-4 py-2.5 text-sm transition-all flex items-center gap-2 rounded-t-lg ${
                    activeTab === 'Pay House'
                      ? 'font-medium bg-blue-600 text-white -mb-px'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
                >
                  <Wallet className="w-4 h-4" />
                  Pay House
                </button>
                <button
                  onClick={() => setActiveTab('Section')}
                  className={`px-4 py-2.5 text-sm transition-all flex items-center gap-2 rounded-t-lg ${
                    activeTab === 'Section'
                      ? 'font-medium bg-blue-600 text-white -mb-px'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
                >
                  <Network className="w-4 h-4" />
                  Section
                </button>
                <button
                  onClick={() => setActiveTab('Unit')}
                  className={`px-4 py-2.5 text-sm transition-all flex items-center gap-2 rounded-t-lg ${
                    activeTab === 'Unit'
                      ? 'font-medium bg-blue-600 text-white -mb-px'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } transition-colors`}
                >
                  <Layers className="w-4 h-4" />
                  Unit
                </button>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Left Column - Code Selection */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <label className="text-sm text-gray-700">Search:</label>
                  <input
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    placeholder=""
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">
                            <input
                              type="checkbox"
                              onChange={(e) => handleSelectAllCodes(e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">
                            Code
                          </th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedCodes.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                checked={selectedCodes.includes(item.id)}
                                onChange={(e) => handleSelectCode(item.id, e.target.checked)}
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
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>Showing {(currentCodePage - 1) * itemsPerPage + 1} to {Math.min(currentCodePage * itemsPerPage, filteredCodes.length)} of {filteredCodes.length} entries</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentCodePage(Math.max(1, currentCodePage - 1))}
                      disabled={currentCodePage === 1}
                      className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {renderCodePageNumbers()}
                    <button
                      onClick={() => setCurrentCodePage(Math.min(totalCodePages, currentCodePage + 1))}
                      disabled={currentCodePage === totalCodePages}
                      className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Employee Selection */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <label className="text-sm text-gray-700">Search:</label>
                  <input
                    type="text"
                    value={searchEmployee}
                    onChange={(e) => setSearchEmployee(e.target.value)}
                    placeholder=""
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="mb-3 flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={statusFilter === 'active'}
                      onChange={(e) => setStatusFilter(e.target.value as StatusType)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={statusFilter === 'inactive'}
                      onChange={(e) => setStatusFilter(e.target.value as StatusType)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">In Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="all"
                      checked={statusFilter === 'all'}
                      onChange={(e) => setStatusFilter(e.target.value as StatusType)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">All</span>
                  </label>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">
                            <input
                              type="checkbox"
                              onChange={(e) => handleSelectAllEmployees(e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">
                            Code
                          </th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">
                            Name
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedEmployees.map((emp) => (
                          <tr key={emp.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                checked={selectedEmployees.includes(emp.id)}
                                onChange={(e) => handleSelectEmployee(emp.id, e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">{emp.code}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{emp.name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>Showing {(currentEmployeePage - 1) * itemsPerPage + 1} to {Math.min(currentEmployeePage * itemsPerPage, filteredEmployees.length)} of 704 entries</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentEmployeePage(Math.max(1, currentEmployeePage - 1))}
                      disabled={currentEmployeePage === 1}
                      className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {renderEmployeePageNumbers()}
                    <button
                      onClick={() => setCurrentEmployeePage(Math.min(totalEmployeePages, currentEmployeePage + 1))}
                      disabled={currentEmployeePage === totalEmployeePages}
                      className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Two Column Layout for Options and Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Date and Settings */}
              <div className="space-y-6">
                {/* Date Range */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <h3 className="text-gray-900 mb-4">Date Range</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">From:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <CalendarPopover
                          date={dateFrom}
                          onChange={setDateFrom}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">To:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <CalendarPopover
                          date={dateTo}
                          onChange={setDateTo}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Date */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <h3 className="text-gray-900 mb-4">Transaction Date</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={transactionDate}
                        onChange={(e) => setTransactionDate(e.target.value)}
                        className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <CalendarPopover
                        date={transactionDate}
                        onChange={setTransactionDate}
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={applyTransactionDate}
                        onChange={(e) => setApplyTransactionDate(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Apply</span>
                    </label>
                  </div>
                </div>

                {/* Assumed Date */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <h3 className="text-gray-900 mb-4">Assumed Date</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={assumedDate}
                      onChange={(e) => setAssumedDate(e.target.value)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <CalendarPopover
                      date={assumedDate}
                      onChange={setAssumedDate}
                    />
                  </div>
                </div>

                {/* Compute Per */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <h3 className="text-gray-900 mb-4">Compute Per</h3>
                  <div className="flex items-center gap-8">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="computePer"
                        value="date"
                        checked={computePer === 'date'}
                        onChange={() => setComputePer('date')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Date</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="computePer"
                        value="sum"
                        checked={computePer === 'sum'}
                        onChange={() => setComputePer('sum')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Sum Per Cut Off</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column - Options and Email Status */}
              <div className="space-y-6">
                {/* Option Section */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <h3 className="text-gray-900 mb-4">Option</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={processOptions.lates}
                        onChange={(e) => setProcessOptions({ ...processOptions, lates: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Lates</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={processOptions.undertime}
                        onChange={(e) => setProcessOptions({ ...processOptions, undertime: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Undertime</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={processOptions.overtime}
                        onChange={(e) => setProcessOptions({ ...processOptions, overtime: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Overtime</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={processOptions.leaveAbsences}
                        onChange={(e) => setProcessOptions({ ...processOptions, leaveAbsences: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Leave And Absences</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={processOptions.otherEarnings}
                        onChange={(e) => setProcessOptions({ ...processOptions, otherEarnings: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Other Earnings</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={processOptions.daysAndHours}
                        onChange={(e) => setProcessOptions({ ...processOptions, daysAndHours: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Days and No. of Hrs Worked</span>
                    </label>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={processOptions.selectAll}
                      onChange={(e) => handleSelectAllProcesses(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Select All Processes</span>
                  </label>
                </div>

                {/* Email Status */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <h3 className="text-gray-900 mb-4">Email Status</h3>
                  <div className="h-20"></div>
                </div>

                {/* Compute As */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <h3 className="text-gray-900 mb-4">Compute As [Applies To Daily Paid Only]</h3>
                  <div className="flex items-center gap-8">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="computeAs"
                        value="perfect"
                        checked={computeAs === 'perfect'}
                        onChange={() => setComputeAs('perfect')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Perfect Hours</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="computeAs"
                        value="net"
                        checked={computeAs === 'net'}
                        onChange={() => setComputeAs('net')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Net Of Unworked w/o pay Hours</span>
                    </label>
                  </div>
                </div>

                {/* Export To */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <h3 className="text-gray-900 mb-4">Export To</h3>
                  <div className="flex items-center gap-8">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="exportTo"
                        value="sql"
                        checked={exportTo === 'sql'}
                        onChange={() => setExportTo('sql')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">SQL</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="exportTo"
                        value="text"
                        checked={exportTo === 'text'}
                        onChange={() => setExportTo('text')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Text File</span>
                    </label>
                  </div>
                </div>

                {/* Export Button */}
                <div className="flex justify-end">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}