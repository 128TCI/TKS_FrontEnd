import { useState, useRef, useEffect } from 'react';
import { Check, Search, X, Calendar as CalendarIcon, Users, Building2, Briefcase, CalendarClock, Wallet, Grid, RefreshCw } from 'lucide-react';
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

interface RestDayRecord {
  id: number;
  from: string;
  to: string;
  restDay1: string;
  restDay2: string;
  restDay3: string;
}

export function UpdateBatchRestDayPage() {
  const [activeTab, setActiveTab] = useState<'TK Group' | 'Branch' | 'Department' | 'Group Schedule' | 'Pay House' | 'Section'>('TK Group');
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [currentGroupPage, setCurrentGroupPage] = useState(1);
  const [currentEmpPage, setCurrentEmpPage] = useState(1);
  const [restDayMode, setRestDayMode] = useState<'fixed' | 'variable' | 'restday-setup'>('fixed');
  const [deleteExisting, setDeleteExisting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isUpdating, setIsUpdating] = useState(false);

  // Fixed mode states
  const [restDay1Fixed, setRestDay1Fixed] = useState('');
  const [restDay2Fixed, setRestDay2Fixed] = useState('');
  const [restDay3Fixed, setRestDay3Fixed] = useState('');
  
  // Variable mode states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [restDay1Variable, setRestDay1Variable] = useState('');
  const [restDay2Variable, setRestDay2Variable] = useState('');
  const [restDay3Variable, setRestDay3Variable] = useState('');
  const [restDayRecords, setRestDayRecords] = useState<RestDayRecord[]>([]);
  
  // By RestDay Set Up states
  const [refNo, setRefNo] = useState('');
  const [dateFromSetup, setDateFromSetup] = useState('');
  const [dateToSetup, setDateToSetup] = useState('');

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

  // GroupSchedule List states
  const [loadingGroupSchedules, setLoadingGroupSchedules] = useState(false);
  const [groupScheduleItems, setGroupScheduleItems] = useState<GroupItem[]>([]);

  // PayHouse List states
  const [loadingPayHouses, setLoadingPayHouses] = useState(false);
  const [payHouseItems, setPayHouseItems] = useState<GroupItem[]>([]);

  // Section List states
  const [loadingSections, setLoadingSections] = useState(false);
  const [sectionItems, setSectionItems] = useState<GroupItem[]>([]);

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

  const dayOptions = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'Branch':
        return branchItems;
      case 'Department':
        return departmentItems;
      case 'Group Schedule':
        return groupScheduleItems;
      case 'Pay House':
        return payHouseItems;
      case 'Section':
        return sectionItems;
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
      const getGroupPageNumbers = () => 
      {
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

  const handleUpdate = async () => {
     if (!selectedEmployees.length) {
      await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Please select employee/s to update.',
          timer: 2000,
          showConfirmButton: true,
      });
      return;
    }

    if(restDayMode == 'fixed')
    {
      if (restDay1Fixed == restDay2Fixed || restDay1Fixed == restDay3Fixed || restDay2Fixed == restDay3Fixed) {
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Restdays must not be equal.',
            timer: 2000,
            showConfirmButton: true,
        });
        return;
      }
    }
    else if(restDayMode == 'variable')
    {
      if (!dateFrom || !dateTo) {
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please select Date From and Date To.',
            timer: 2000,
            showConfirmButton: true,
        });
        return;
      }
      if (refNo.length === 0) {
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Variable restday must add atleast 1 item.',
            timer: 2000,
            showConfirmButton: true,
        });
        return;
      }
    }
    else if(restDayMode == 'restday-setup')
    {
      if (refNo.length === 0) {
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Reference number must not be empty.',
            timer: 2000,
            showConfirmButton: true,
        });
        return;
      }
    }
 


    try {
      setIsUpdating(true);
      await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Successfully updated Batch Rest Day.',
          timer: 2000,
          showConfirmButton: false,
      });

      setSelectedGroups([]);
      setSelectedEmployees([]);

    } 
    catch (error) {
      console.error(error);
      alert("Failed to update records");
    } 
    finally {
      setIsUpdating(false);
    }
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

  const handleAddRecord = () => {
    if (dateFrom && dateTo) {
      const newRecord: RestDayRecord = {
        id: Date.now(),
        from: dateFrom,
        to: dateTo,
        restDay1: restDay1Variable,
        restDay2: restDay2Variable,
        restDay3: restDay3Variable
      };
      setRestDayRecords([...restDayRecords, newRecord]);
      setDateFrom('');
      setDateTo('');
    }
  };

  const renderPageNumbers = (totalPages: number, currentPage: number) => {
    const pages = [];
    for (let i = 1; i <= Math.min(5, totalPages); i++) {
      pages.push(i);
    }
    
    if (totalPages > 6) {
      pages.push('...' as any);
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Update Batch Rest Day</h1>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
            {/* Information Frame */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    Update employee rest day assignments in batch. Choose between fixed, variable, or by rest day setup configuration.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Bulk update rest days for multiple employees</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Configure fixed or variable rest day schedules</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="flex items-center gap-1 border-b border-gray-200 flex-wrap">
                {[
                  { name: 'TK Group' as const, icon: Users },
                  { name: 'Branch' as const, icon: Building2 },
                  { name: 'Department' as const, icon: Briefcase },
                  { name: 'Group Schedule' as const, icon: CalendarClock },
                  { name: 'Pay House' as const, icon: Wallet },
                  { name: 'Section' as const, icon: Grid }
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Section - Group List */}
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

              {/* Right Section - Employee List and Form */}
              <div className="space-y-6">
                {/* Employee List */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <label className="text-sm text-gray-700">Search:</label>
                    <input
                      type="text"
                      value={employeeSearchTerm}
                      onChange={(e) => setEmployeeSearchTerm(e.target.value)}
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
                        {paginatedEmployees.map((emp) => (
                          <tr key={emp.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                checked={selectedEmployees.includes(emp.id)}
                                onChange={() => handleEmployeeToggle(emp.id)}
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

                {/* Rest Day Configuration */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <div className="space-y-6">
                    {/* Fixed Option */}
                    <div className="border-b border-gray-200 pb-4">
                      <label className="flex items-center gap-2 cursor-pointer mb-4">
                        <input
                          type="radio"
                          name="restDayMode"
                          checked={restDayMode === 'fixed'}
                          onChange={() => setRestDayMode('fixed')}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Fixed</span>
                      </label>
                      
                      {restDayMode === 'fixed' && (
                        <div className="ml-6 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-700 whitespace-nowrap">Rest Day 1</label>
                              <select
                                value={restDay1Fixed}
                                onChange={(e) => setRestDay1Fixed(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                <option value=""></option>
                                {dayOptions.map(day => (
                                  <option key={day} value={day}>{day}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-700 whitespace-nowrap">Rest Day 3</label>
                              <select
                                value={restDay3Fixed}
                                onChange={(e) => setRestDay3Fixed(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                <option value=""></option>
                                {dayOptions.map(day => (
                                  <option key={day} value={day}>{day}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700 whitespace-nowrap">Rest Day 2</label>
                            <select
                              value={restDay2Fixed}
                              onChange={(e) => setRestDay2Fixed(e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-40"
                            >
                              <option value=""></option>
                              {dayOptions.map(day => (
                                <option key={day} value={day}>{day}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Variable Option */}
                    <div className="border-b border-gray-200 pb-4">
                      <label className="flex items-center gap-2 cursor-pointer mb-4">
                        <input
                          type="radio"
                          name="restDayMode"
                          checked={restDayMode === 'variable'}
                          onChange={() => setRestDayMode('variable')}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Variable</span>
                      </label>
                      
                      {restDayMode === 'variable' && (
                        <div className="ml-6 space-y-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleAddRecord}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                            >
                              Add
                            </button>
                            <label className="text-sm text-gray-700">Date From</label>
                            <input
                              readOnly
                              type="text"
                              value={dateFrom}
                              onChange={(e) => setDateFrom(e.target.value)}
                              placeholder="MM/DD/YYYY"
                              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                            />
                            <CalendarPopover
                              date={dateFrom}
                              onChange={setDateFrom}
                            />
                            <label className="text-sm text-gray-700">Date To</label>
                            <input
                              readOnly
                              type="text"
                              value={dateTo}
                              onChange={(e) => setDateTo(e.target.value)}
                              placeholder="MM/DD/YYYY"
                              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                            />
                            <CalendarPopover
                              date={dateTo}
                              onChange={setDateTo}
                            />                            
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex items-center gap-1">
                              <label className="text-sm text-gray-700 whitespace-nowrap">Rest Day 1</label>
                              <select
                                value={restDay1Variable}
                                onChange={(e) => setRestDay1Variable(e.target.value)}
                                className="flex-1 px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                <option value=""></option>
                                {dayOptions.map(day => (
                                  <option key={day} value={day}>{day}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <label className="text-sm text-gray-700 whitespace-nowrap">Rest Day 2</label>
                              <select
                                value={restDay2Variable}
                                onChange={(e) => setRestDay2Variable(e.target.value)}
                                className="flex-1 px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                <option value=""></option>
                                {dayOptions.map(day => (
                                  <option key={day} value={day}>{day}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <label className="text-sm text-gray-700 whitespace-nowrap">Rest Day 3</label>
                              <select
                                value={restDay3Variable}
                                onChange={(e) => setRestDay3Variable(e.target.value)}
                                className="flex-1 px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                <option value=""></option>
                                {dayOptions.map(day => (
                                  <option key={day} value={day}>{day}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          {restDayRecords.length > 0 && (
                            <div className="mt-4 bg-white border border-gray-200 rounded-lg overflow-hidden">
                              <table className="w-full">
                                <thead className="bg-gray-100 border-b border-gray-200">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs text-gray-600">From</th>
                                    <th className="px-3 py-2 text-left text-xs text-gray-600">To</th>
                                    <th className="px-3 py-2 text-left text-xs text-gray-600">Rest Day1</th>
                                    <th className="px-3 py-2 text-left text-xs text-gray-600">Rest Day2</th>
                                    <th className="px-3 py-2 text-left text-xs text-gray-600">Rest Day3</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {restDayRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50">
                                      <td className="px-3 py-2 text-sm text-gray-900">{record.from}</td>
                                      <td className="px-3 py-2 text-sm text-gray-900">{record.to}</td>
                                      <td className="px-3 py-2 text-sm text-gray-600">{record.restDay1}</td>
                                      <td className="px-3 py-2 text-sm text-gray-600">{record.restDay2}</td>
                                      <td className="px-3 py-2 text-sm text-gray-600">{record.restDay3}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* By RestDay Set Up */}
                    <div className="pb-4">
                      <label className="flex items-center gap-2 cursor-pointer mb-4">
                        <input
                          type="radio"
                          name="restDayMode"
                          checked={restDayMode === 'restday-setup'}
                          onChange={() => setRestDayMode('restday-setup')}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">By RestDay Set Up</span>
                      </label>
                      
                      {restDayMode === 'restday-setup' && (
                        <div className="ml-6 space-y-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700">Ref No.</label>
                            <input
                              type="text"
                              value={refNo}
                              onChange={(e) => setRefNo(e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                            />
                            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
                              Search
                            </button>
                            <button className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-700">Date From</label>
                              <input
                                type="text"
                                value={dateFromSetup}
                                onChange={(e) => setDateFromSetup(e.target.value)}
                                placeholder="MM/DD/YYYY"
                                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                              />
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-700">Date To</label>
                              <input
                                type="text"
                                value={dateToSetup}
                                onChange={(e) => setDateToSetup(e.target.value)}
                                placeholder="MM/DD/YYYY"
                                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Delete Existing and Update Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={deleteExisting}
                          onChange={(e) => setDeleteExisting(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Delete Existing Rest Day</span>
                      </label>
                      
                      <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                        onClick={handleUpdate} >
                        <RefreshCw className="w-4 h-4" />
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}