import { useState, useRef, useEffect } from 'react';
import { Search, Users, Building2, Briefcase, Award, LayoutGrid, Network, Layers, CalendarDays, Wallet, Upload, Download, Check } from 'lucide-react';
import { CalendarPopover } from '../Modals/CalendarPopover';
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

type TabType = 'TK Group' | 'Branch' | 'Department' | 'Division' | 'Group Schedule' | 'Pay House' | 'Section' | 'Unit';
type StatusType = 'active' | 'inactive' | 'all';

export function ExportPayrollDataPage() {
  const [activeTab, setActiveTab] = useState<TabType>('TK Group');
  const [statusFilter, setStatusFilter] = useState<StatusType>('active');
  const [dateFrom, setDateFrom] = useState('5/5/2021');
  const [dateTo, setDateTo] = useState('05/05/2021');
  const [transactionDate, setTransactionDate] = useState('12/26/2025');
  const [applyTransactionDate, setApplyTransactionDate] = useState(false);
  const [assumedDate, setAssumedDate] = useState('');
  const [computePer, setComputePer] = useState<'date' | 'sum'>('date');
  const [computeAs, setComputeAs] = useState<'perfect' | 'net'>('perfect');
  const [exportTo, setExportTo] = useState<'sql' | 'text'>('sql');
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);  
  const [currentGroupPage, setCurrentGroupPage] = useState(1);
  const [currentEmpPage, setCurrentEmpPage] = useState(1);
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

  const renderPageNumbers = (currentPage: number, totalPages: number, setPage: (page: number) => void) => {
    const pages = [];
    for (let i = 1; i <= Math.min(5, totalPages); i++) {
      pages.push(i);
    }
    
    if (totalPages > 5) {
      pages.push('...' as any);
      pages.push(totalPages);
    }
    
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage(Math.max(1, currentPage - 1))}
          className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs"
        >
          Previous
        </button>
        {pages.map((page, index) => (
          typeof page === 'number' ? (
            <button
              key={index}
              onClick={() => setPage(page)}
              className={`px-2 py-1 rounded text-xs ${
                currentPage === page
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
          onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
          className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs"
        >
          Next
        </button>
      </div>
    );
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
              {/* Left Column - Group Item Selection */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <label className="text-sm text-gray-700">Search:</label>
                  <input
                    type="text"
                    value={groupSearchTerm}
                    onChange={(e) => setGroupSearchTerm(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

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

              {/* Right Column - Employee Selection */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <label className="text-sm text-gray-700">Search:</label>
                  <input
                    type="text"
                    value={employeeSearchTerm}
                    onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                    placeholder=""
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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

                  {/* Status Filter */}
                  <div className="mt-4 flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="statusFilter"
                        value="active"
                        checked={statusFilter === 'active'}
                        onChange={() => setStatusFilter('active')}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="statusFilter"
                        value="inactive"
                        checked={statusFilter === 'inactive'}
                        onChange={() => setStatusFilter('inactive')}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">In Active</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="statusFilter"
                        value="all"
                        checked={statusFilter === 'all'}
                        onChange={() => setStatusFilter('all')}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">All</span>
                    </label>
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