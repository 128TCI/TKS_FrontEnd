import { useState, useEffect, useMemo } from 'react';
import { 
  Search,
  Clock,
  ClipboardList,
  Plus,
  X,
  Check,
  Pencil,
  Save,
  Edit,
  Trash2
} from 'lucide-react';
import { OvertimeApplicationModal } from '../Modals/OvertimeApplicationModal';
import { EmployeeSearchModal } from '../Modals/EmployeeSearchModal';
import { DatePicker } from '../DateSetup/DatePicker';
import { Footer } from '../Footer/Footer';
import apiClient from '../../services/apiClient';
import Swal from 'sweetalert2';

type TabType = 'overtime-applications' | 'workshift';

// Interfaces
interface Employee {
  empID: number;
  empCode: string;
  lName: string;
  fName: string;
  grpCode: string;
}

interface WorkshiftFixed {
  id: number;
  empCode: string;
  dailySched: string;
  isFixed: boolean;
}

interface WorkshiftVariable {
  id: number;
  empCode: string;
  dateFrom: string;
  dateTo: string;
  shiftCode: string;
  dailyScheduleCode: string;
  updateDate: string;
}

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
}

export function TwoShiftsEmployeeTimekeepConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('workshift');
  const [empCode, setEmpCode] = useState('');
  const [tksGroup, setTksGroup] = useState('');

  // Employee data
  const [employeeName, setEmployeeName] = useState('');
  const [payPeriod] = useState('Main Monthly');

  // Search modal state
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Employee data for search
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeError, setEmployeeError] = useState('');

  // Workshift Code Search Modal
  const [showWorkshiftCodeModal, setShowWorkshiftCodeModal] = useState(false);
  const [workshiftCodeSearchTerm, setWorkshiftCodeSearchTerm] = useState('');

  // Loading states
  const [workshiftLoading, setWorkshiftLoading] = useState(false);
  const [overtimeLoading, setOvertimeLoading] = useState(false);

  // Mock workshift code data
  const workshiftCodeData = [
    { code: '7AM4PM', description: '7:00 AM - 4:00 PM' },
    { code: '3PM12AM', description: '3:00 PM - 12:00 AM' },
    { code: '8AM5PM', description: '8:00 AM - 5:00 PM' },
    { code: '11PM8AM', description: '11:00 PM - 8:00 AM' },
    { code: 'FLEX', description: 'Flexible Schedule' }
  ];

  const filteredWorkshiftCodes = workshiftCodeData.filter(ws =>
    ws.code.toLowerCase().includes(workshiftCodeSearchTerm.toLowerCase()) ||
    ws.description.toLowerCase().includes(workshiftCodeSearchTerm.toLowerCase())
  );

  // Adapted employees for search modal
  const adaptedEmployees = useMemo(() => {
    return employees.map(emp => ({
      ...emp,
      name: `${emp.lName}, ${emp.fName}`,
      groupCode: emp.grpCode
    }));
  }, [employees]);

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
      setEmployeeName(name);
      setShowSearchModal(false);
      
      // Fetch all employee data
      await Promise.all([
        fetchWorkshiftFixed(empCodeValue),
        fetchWorkshiftVariable(empCodeValue),
        fetchOvertimeApplications(empCodeValue)
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

  const handleWorkshiftCodeSelect = (selectedCode: string) => {
    setWorkshiftShiftCode(selectedCode);
    setShowWorkshiftCodeModal(false);
  };

  // Global Edit Mode
  const [isEditMode, setIsEditMode] = useState(false);

  // Overtime Applications Modal States
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [isOvertimeEditMode, setIsOvertimeEditMode] = useState(false);
  const [currentOvertimeId, setCurrentOvertimeId] = useState<number | null>(null);
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

  // Workshift State
  const [workshiftMode, setWorkshiftMode] = useState<'fixed' | 'variable'>('variable');
  const [fixedDailySched, setFixedDailySched] = useState('');
  const [workshiftFixedData, setWorkshiftFixedData] = useState<WorkshiftFixed | null>(null);

  // Workshift Variable Modal States
  const [showWorkshiftModal, setShowWorkshiftModal] = useState(false);
  const [isWorkshiftEditMode, setIsWorkshiftEditMode] = useState(false);
  const [currentWorkshiftId, setCurrentWorkshiftId] = useState<number | null>(null);
  const [workshiftFrom, setWorkshiftFrom] = useState('');
  const [workshiftTo, setWorkshiftTo] = useState('');
  const [workshiftShiftCode, setWorkshiftShiftCode] = useState('');
  const [workshiftDailyScheduleCode, setWorkshiftDailyScheduleCode] = useState('');

  const [workshiftVariableData, setWorkshiftVariableData] = useState<WorkshiftVariable[]>([]);
  const [overtimeApplicationsData, setOvertimeApplicationsData] = useState<OvertimeApplication[]>([]);

  // ==================== API FUNCTIONS ====================

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

  // Fetch Workshift Fixed
  const fetchWorkshiftFixed = async (empCodeParam: string) => {
    if (!empCodeParam) return;
    
    setWorkshiftLoading(true);
    try {
      const response = await apiClient.get('/Maintenance/EmployeeWorkshiftFixed/2ShiftsInADay');
      
      if (response.status === 200 && response.data) {
        const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
        
        const found = allItems.find((item: any) => 
          (item.empCode?.trim() || "").toLowerCase() === empCodeParam.trim().toLowerCase()
        );
        
        if (found) {
          setWorkshiftFixedData(found);
          setFixedDailySched(found.dailySched || '');
          setWorkshiftMode('fixed');
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
      const response = await apiClient.get('/Maintenance/EmployeeWorkshiftVariable/2ShiftsInADay');
      
      if (response.status === 200 && response.data) {
        const allItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
        
        const filteredData = allItems.filter((item: any) => 
          (item.empCode?.trim() || "").toLowerCase() === empCodeParam.trim().toLowerCase()
        );
        
        if (filteredData.length > 0) {
          setWorkshiftVariableData(filteredData);
          setWorkshiftMode('variable');
        }
      }
    } catch (error: any) {
      console.error('Error fetching workshift variable:', error);
      setWorkshiftVariableData([]);
    } finally {
      setWorkshiftLoading(false);
    }
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
        response = await apiClient.post('/Maintenance/EmployeeWorkshiftFixed/2ShiftsInADay', data);
      } else {
        response = await apiClient.put(`/Maintenance/EmployeeWorkshiftFixed/2ShiftsInADay/${data.id}`, data);
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
      const response = await apiClient.post('/Maintenance/EmployeeWorkshiftVariable/2ShiftsInADay', data);
      
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
      const response = await apiClient.put(`/Maintenance/EmployeeWorkshiftVariable/2ShiftsInADay/${id}`, data);
      
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
        const response = await apiClient.delete(`/Maintenance/EmployeeWorkshiftVariable/2ShiftsInADay/${id}`);
        
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

  // Fetch Overtime Applications
  const fetchOvertimeApplications = async (empCodeParam: string) => {
    if (!empCodeParam) return;
    
    setOvertimeLoading(true);
    try {
      const response = await apiClient.get('/Maintenance/EmployeeOvertimeApplication/2ShiftsInADay');
      
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
// Helper to transform the data into the exact format the C# DTO expects
const prepareDirectPayload = (data: Partial<OvertimeApplication>, id: number = 0) => {
  return {
    ID: id, // Must match 'ID' in debugger
    EmpCode: data.empCode,
    Date: data.date ? new Date(data.date).toISOString() : null,
    NumOTHoursApproved: data.numOTHoursApproved || 0,
    EarlyOTStartTime: data.earlyOTStartTime ? new Date(data.earlyOTStartTime).toISOString() : null,
    EarlyTimeIn: data.earlyTimeIn ? new Date(data.earlyTimeIn).toISOString() : null,
    StartOTPM: data.startOTPM ? new Date(data.startOTPM).toISOString() : null,
    MinHRSOTBreak: data.minHRSOTBreak || 0,
    EarlyOTStartTimeRestHol: data.earlyOTStartTimeRestHol ? new Date(data.earlyOTStartTimeRestHol).toISOString() : null,
    Reason: data.reason || "",
    Remarks: data.remarks || "",
    ApprovedOTBreaksHrs: data.approvedOTBreaksHrs || 0,
    STOTATS: data.stotats ? new Date(data.stotats).toISOString() : null,
    IsLateFiling: data.isLateFiling ?? false,
    IsLateFilingProcessed: data.isLateFilingProcessed ?? false
  };
};

// Create Overtime Application
const createOvertimeApplication = async (data: Partial<OvertimeApplication>) => {
  setOvertimeLoading(true);
  try {
    const payload = prepareDirectPayload(data, 0);

    // Send payload directly - DO NOT wrap in { dto: payload }
    const response = await apiClient.post(
      '/Maintenance/EmployeeOvertimeApplication/2ShiftsInADay', 
      payload 
    );
    
    if (response.status === 200 || response.status === 201) {
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Overtime application created successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      await fetchOvertimeApplications(data.empCode || "");
      setShowOvertimeModal(false);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.title || error.message || 'Failed to create application';
    await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
  } finally {
    setOvertimeLoading(false);
  }
};

// Update Overtime Application
const updateOvertimeApplication = async (id: number, data: Partial<OvertimeApplication>) => {
  setOvertimeLoading(true);
  try {
    const payload = prepareDirectPayload(data, id);

    const response = await apiClient.put(
      `/Maintenance/EmployeeOvertimeApplication/2ShiftsInADay/${id}`, 
      payload
    );
    
    if (response.status === 200 || response.status === 204) {
      await Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Overtime application updated successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      await fetchOvertimeApplications(data.empCode || "");
      setShowOvertimeModal(false);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data || error.message || 'Failed to update application';
    await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
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
        const response = await apiClient.delete(`/Maintenance/EmployeeOvertimeApplication/2ShiftsInADay/${id}`);
        
        if (response.status === 200 || response.status === 204) {
          await Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Overtime application has been deleted.',
            timer: 2000,
            showConfirmButton: false,
          });
          
          await fetchOvertimeApplications(empCode);
        }
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to delete overtime application';
        await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
      } finally {
        setOvertimeLoading(false);
      }
    }
  };

  // Overtime Submit Handler
  const handleOvertimeSubmit = async () => {
    try {
      const data: Partial<OvertimeApplication> = {
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
        isLateFilingProcessed: false
      };

      if (isOvertimeEditMode && currentOvertimeId !== null) {
        await updateOvertimeApplication(currentOvertimeId, data);
      } else {
        await createOvertimeApplication(data);
      }
    } catch (error) {
      console.error('Error submitting overtime application:', error);
    }
  };

  const handleOvertimeDelete = async (id: number) => {
    await deleteOvertimeApplication(id);
  };

  // Workshift Submit Handler
  const handleWorkshiftSubmit = async () => {
    try {
      const data: Partial<WorkshiftVariable> = {
        empCode: empCode,
        dateFrom: workshiftFrom,
        dateTo: workshiftTo,
        shiftCode: workshiftShiftCode,
        dailyScheduleCode: workshiftDailyScheduleCode,
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

  const handleWorkshiftDelete = async (id: number) => {
    await deleteWorkshiftVariable(id);
  };

  // Handle Save
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

      if (activeTab === 'workshift' && workshiftMode === 'fixed') {
        await saveWorkshiftFixed();
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    setIsEditMode(false);
    if (empCode) {
      if (activeTab === 'workshift') {
        fetchWorkshiftFixed(empCode);
        fetchWorkshiftVariable(empCode);
      }
    }
  };

  // ESC key handler for modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showSearchModal) {
          setShowSearchModal(false);
        } else if (showWorkshiftCodeModal) {
          setShowWorkshiftCodeModal(false);
        } else if (showWorkshiftModal) {
          setShowWorkshiftModal(false);
        } else if (showOvertimeModal) {
          setShowOvertimeModal(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showSearchModal, showWorkshiftCodeModal, showWorkshiftModal, showOvertimeModal]);

  // Load initial data on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Load data when empCode changes
  useEffect(() => {
    if (empCode) {
      fetchWorkshiftFixed(empCode);
      fetchWorkshiftVariable(empCode);
      fetchOvertimeApplications(empCode);
    }
  }, [empCode]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'workshift':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {workshiftLoading ? (
              <div className="text-center py-8">Loading workshifts...</div>
            ) : (
              <div className="space-y-6">
                {/* Fixed Option */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="workshift-fixed"
                      checked={workshiftMode === 'fixed'}
                      onChange={() => setWorkshiftMode('fixed')}
                      disabled={!isEditMode}
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
                          disabled={!isEditMode}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      disabled={!isEditMode}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
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
                            setWorkshiftFrom('');
                            setWorkshiftTo('');
                            setWorkshiftShiftCode('');
                            setWorkshiftDailyScheduleCode('');
                            setShowWorkshiftModal(true);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>

                      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-gray-700">Date From</th>
                              <th className="px-6 py-3 text-left text-gray-700">Date To</th>
                              <th className="px-6 py-3 text-left text-gray-700">Shift Code</th>
                              <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {workshiftVariableData.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
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
                                  <td className="px-6 py-3">
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={() => {
                                          setIsWorkshiftEditMode(true);
                                          setCurrentWorkshiftId(entry.id);
                                          setWorkshiftFrom(
                                            entry.dateFrom 
                                              ? new Date(entry.dateFrom).toISOString().split('T')[0] 
                                              : ''
                                          );
                                          setWorkshiftTo(
                                            entry.dateTo 
                                              ? new Date(entry.dateTo).toISOString().split('T')[0] 
                                              : ''
                                          );
                                          setWorkshiftShiftCode(entry.shiftCode || '');
                                          setWorkshiftDailyScheduleCode(entry.dailyScheduleCode || '');
                                          setShowWorkshiftModal(true);
                                        }}
                                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <span className="text-gray-300">|</span>
                                      <button 
                                        onClick={() => handleWorkshiftDelete(entry.id)}
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
              {/* Create New Button */}
              <div>
                <button 
                  onClick={() => {
                    setIsOvertimeEditMode(false);
                    setCurrentOvertimeId(null);
                    setOvertimeDate('');
                    setOvertimeNumOTHoursApproved('');
                    setOvertimeEarlyOTStartTime('');
                    setOvertimeEarlyTimeIn('');
                    setOvertimeStartOTPM('');
                    setOvertimeMinHRSOTBreak('');
                    setOvertimeEarlyOTStartTimeRestHol('');
                    setOvertimeReason('');
                    setOvertimeRemarks('');
                    setOvertimeApprovedOTBreaksHrs('');
                    setOvertimeStotats('');
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
                {overtimeLoading ? (
                  <div className="text-center py-8">Loading overtime applications...</div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-gray-700">Date</th>
                        <th className="px-6 py-3 text-left text-gray-700">Hours Approved</th>
                        <th className="px-6 py-3 text-left text-gray-700">Reason</th>
                        <th className="px-6 py-3 text-left text-gray-700">Remarks</th>
                        <th className="px-6 py-3 text-left text-gray-700">Late Filing</th>
                        <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overtimeApplicationsData.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            No overtime applications found
                          </td>
                        </tr>
                      ) : (
                        overtimeApplicationsData.map((entry) => (
                          <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-3 text-gray-900">
                              {entry.date ? new Date(entry.date).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-3 text-gray-900">{entry.numOTHoursApproved}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.reason}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.remarks}</td>
                            <td className="px-6 py-3 text-gray-900">{entry.isLateFiling ? 'Yes' : 'No'}</td>
                            <td className="px-6 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => {
                                    setIsOvertimeEditMode(true);
                                    setCurrentOvertimeId(entry.id);
                                    setOvertimeDate(entry.date ? new Date(entry.date).toISOString().split('T')[0] : '');
                                    setOvertimeNumOTHoursApproved(entry.numOTHoursApproved?.toString() || '');
                                    setOvertimeEarlyOTStartTime(entry.earlyOTStartTime || '');
                                    setOvertimeEarlyTimeIn(entry.earlyTimeIn || '');
                                    setOvertimeStartOTPM(entry.startOTPM || '');
                                    setOvertimeMinHRSOTBreak(entry.minHRSOTBreak?.toString() || '');
                                    setOvertimeEarlyOTStartTimeRestHol(entry.earlyOTStartTimeRestHol || '');
                                    setOvertimeReason(entry.reason || '');
                                    setOvertimeRemarks(entry.remarks || '');
                                    setOvertimeApprovedOTBreaksHrs(entry.approvedOTBreaksHrs?.toString() || '');
                                    setOvertimeStotats(entry.stotats || '');
                                    setOvertimeIsLateFiling(entry.isLateFiling || false);
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
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const tabs = [
      { id: 'overtime-applications', label: 'Overtime Applications', icon: ClipboardList },
      { id: 'workshift', label: 'Workshift', icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Employee Time Keep Group Configuration [2-Shifts]</h1>
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
                    Configure work shifts and overtime applications for 2-shift employees with accurate time tracking and overtime management.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Work shift configuration (Fixed/Variable)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Overtime application tracking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

        {/* Employee Search Section */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-4">
            {/* Action Buttons with Edit Mode */}
            {activeTab === 'workshift' && (
              <>
                {!isEditMode ? (
                  <button 
                    onClick={() => setIsEditMode(true)}
                    disabled={!empCode}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={handleSave}
                      disabled={workshiftLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {workshiftLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                      onClick={handleCancel}
                      disabled={workshiftLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                )}
              </>
            )}
            {activeTab === 'overtime-applications' && (
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
                      disabled
                      placeholder="Auto-filled from selection"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <label className="text-gray-700 font-bold w-24">EmpCode</label>
                    <input
                      type="text"
                      value={empCode}
                      disabled
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
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

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-gray-300">
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

            {/* Tab Content */}
            {renderTabContent()}
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

          {/* Workshift Code Search Modal */}
          {showWorkshiftCodeModal && (
            <>
              {/* Modal Backdrop */}
              <div 
                className="fixed inset-0 bg-black/30 z-50"
                onClick={() => setShowWorkshiftCodeModal(false)}
              ></div>

                {/* Modal Dialog */}
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-60 p-4">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[110vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                    <h2 className="text-gray-800 text-sm">Search Workshift Code</h2>
                    <button 
                      onClick={() => setShowWorkshiftCodeModal(false)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-3">
                    <h3 className="text-blue-600 mb-2 text-sm">Workshift Code</h3>

                    {/* Search Input */}
                    <div className="flex items-center gap-2 mb-3">
                      <label className="text-gray-700 text-sm">Search:</label>
                      <input
                        type="text"
                        value={workshiftCodeSearchTerm}
                        onChange={(e) => setWorkshiftCodeSearchTerm(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    {/* Workshift Code Table */}
                    <div className="border border-gray-200 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <table className="w-full border-collapse text-sm">
                        <thead className="sticky top-0 bg-white">
                          <tr className="bg-gray-100 border-b-2 border-gray-300">
                            <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Code ▲</th>
                            <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredWorkshiftCodes.map((ws) => (
                            <tr 
                              key={ws.code}
                              className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                              onClick={() => handleWorkshiftCodeSelect(ws.code)}
                            >
                              <td className="px-3 py-1.5">{ws.code}</td>
                              <td className="px-3 py-1.5">{ws.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-gray-600 text-xs">
                        Showing 1 to {filteredWorkshiftCodes.length} of {workshiftCodeData.length} entries
                      </div>
                      <div className="flex gap-1">
                        <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">
                          Previous
                        </button>
                        <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs">1</button>
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

          {/* Overtime Application Modal */}
          <OvertimeApplicationModal
            isOpen={showOvertimeModal}
            isEditMode={isOvertimeEditMode}
            empCode={empCode}
            date={overtimeDate}
            hoursApproved={overtimeNumOTHoursApproved}
            actualDateInOTBefore={''}
            startTimeBefore={overtimeEarlyOTStartTime}
            startOvertimeDate={''}
            startOvertimeTime={overtimeEarlyTimeIn}
            approvedBreak={overtimeMinHRSOTBreak}
            reason={overtimeReason}
            remarks={overtimeRemarks}
            isLateFiling={overtimeIsLateFiling}
            onClose={() => setShowOvertimeModal(false)}
            onDateChange={setOvertimeDate}
            onHoursApprovedChange={setOvertimeNumOTHoursApproved}
            onActualDateInOTBeforeChange={() => {}}
            onStartTimeBeforeChange={setOvertimeEarlyOTStartTime}
            onStartOvertimeDateChange={() => {}}
            onStartOvertimeTimeChange={setOvertimeEarlyTimeIn}
            onApprovedBreakChange={setOvertimeMinHRSOTBreak}
            onReasonChange={setOvertimeReason}
            onRemarksChange={setOvertimeRemarks}
            onIsLateFilingChange={setOvertimeIsLateFiling}
            onSubmit={handleOvertimeSubmit}
          />

          {/* Workshift Variable Modal */}
          {showWorkshiftModal && (
            <>
              {/* Modal Backdrop */}
              <div 
                className="fixed inset-0 bg-black/30 z-30"
                onClick={() => setShowWorkshiftModal(false)}
              ></div>

              {/* Modal Dialog */}
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                  {/* Modal Header */}
                  <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                    <h2 className="text-gray-800">
                      {isWorkshiftEditMode ? 'Edit Workshift' : 'Create Workshift Variable'}
                    </h2>
                    <button 
                      onClick={() => setShowWorkshiftModal(false)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-5">
                    <div className="space-y-3">
                      {/* From Field */}
                      <div className="flex items-center gap-2">
                        <label className="w-32 text-gray-700 text-sm">Date From :</label>
                        <input
                          type="date"
                          value={workshiftFrom}
                          onChange={(e) => setWorkshiftFrom(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      {/* To Field */}
                      <div className="flex items-center gap-2">
                        <label className="w-32 text-gray-700 text-sm">Date To :</label>
                        <input
                          type="date"
                          value={workshiftTo}
                          onChange={(e) => setWorkshiftTo(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      {/* Shift Code Field */}
                      <div className="flex items-center gap-2">
                        <label className="w-32 text-gray-700 text-sm">Shift Code :</label>
                        <input
                          type="text"
                          value={workshiftShiftCode}
                          onChange={(e) => setWorkshiftShiftCode(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button
                          onClick={() => setShowWorkshiftCodeModal(true)}
                          className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors shadow-sm"
                          title="Search Workshift Code"
                        >
                          <Search className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Daily Schedule Code */}
                      <div className="flex items-center gap-2">
                        <label className="w-32 text-gray-700 text-sm">Daily Sched Code :</label>
                        <input
                          type="text"
                          value={workshiftDailyScheduleCode}
                          onChange={(e) => setWorkshiftDailyScheduleCode(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>

                    {/* Modal Actions */}
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleWorkshiftSubmit}
                        className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
                      >
                        {isWorkshiftEditMode ? 'Update' : 'Add'}
                      </button>
                      <button
                        onClick={() => setShowWorkshiftModal(false)}
                        className="px-5 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}