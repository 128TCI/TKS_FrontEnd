import { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Pencil, Trash2, Search, Check, X, Save, User, Briefcase, Upload, Camera } from 'lucide-react';
import { Footer } from '../Footer/Footer';
import { InlineDatePicker } from '../InlineDatePicker';
import apiClient from '../../services/apiClient';
import Swal from 'sweetalert2';
import { EmployeeSearchModal } from '../Modals/EmployeeSearchModal';


type TabType = 'employment' | 'personal';

// Types
interface Employee {
  empID: number;
  empCode: string;
  empStatCode: string;
  courtesy: string;
  lName: string;
  fName: string;
  mName: string;
  nickName: string;
  hAddress: string;
  pAddress: string;
  city: string;
  province: string;
  postalCode: string;
  civilStatus: string;
  citizenship: string;
  religion: string;
  sex: string;
  email: string;
  weight: string;
  height: string;
  mobilePhone: string;
  homePhone: string;
  presentPhone: string;
  dateHired: string | null;
  dateRegularized: string | null;
  dateResigned: string | null;
  dateSuspended: string | null;
  probeStart: string | null;
  probeEnd: string | null;
  suspend: boolean;
  separated: boolean;
  birthDate: string | null;
  age: number;
  birthPlace: string;
  unionMember: boolean;
  agency: boolean;
  divCode: string;
  depCode: string;
  secCode: string;
  grpCode: string;
  braCode: string;
  subAcctCode: string;
  desCode: string;
  shiftCode: string;
  superior: string;
  grdCode: string;
  clsCode: string;
  payCode: string;
  locId: number;
  rateCode: string;
  taxID: number;
  taxCode: string;
  bankAccount: string;
  bankCode: string;
  sssNo: string;
  pHilHealthNo: string;
  pagIbigNo: string;
  tin: string;
  pagibigCode: string;
  photo: string;
  photoBytes?: string;  // ← ADD THIS LINE
  catCode: string;
  unitCode: string;
  contractual: boolean;
  areaCode: string;
  locCode: string;
  gsisNo: string;
  suffix: string;
  onlineAppCode: string;
}

interface Branch {
  branchId: string;
  code: string;
  description: string;
  branchManager: string;
  branchManagerCode: string;
  deviceName: string;
}

interface Division {
  id: string;
  code: string;
  description: string;
  head: string;
  headCode: string;
  deviceName: string;
}
interface Department {
  departmentId: string;
  code: string;
  departmentCode: string;
  departmentHeadCode: string;
  description: string;
  divisionCode: string;
  head: string;
  deviceName: string;
  head1: string;
  email1: string;
  head2: string;
  email2: string;
}

interface Section {
  id: string;
  code: string;
  description: string;
  head: string;
  headCode: string;
  deviceName: string;
}

interface Unit {
  id: string;
  code: string;
  description: string;
  head: string;
  position: string;
  deviceName: string;
}

interface PayHouse {
  id: string;
  code: string;
  description: string;
  head: string;
  headCode: string;
  position: string;
  deviceName: string;
}

interface Area {
  id: string;
  code: string;
  description: string;
  head: string;
  headCode: string;
  deviceName: string;
}

interface Location {
  id: string;
  code: string;
  description: string;
  head: string;
  headCode: string;
  acctCode: string;
  createdBy: string;
  createdDate: string;
  editedBy: string;
  editedDate: string;
  deviceName: string;
}

interface OnlineApproval {
  id: string;
  code: string;
  description: string;
  head: string;
  headCode: string;
  deviceName: string;
  createdBy: string;
  createdDate: string;
  editedBy: string;
  editedDate: string;
}

interface JobLevel {
  id: string;
  code: string;
  description: string;
}

interface EmpStatus {
  code: string;
  description: string;
}

export function EmployeeMasterFilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('employment');
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showEmpStatModal, setShowEmpStatModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showDivisionModal, setShowDivisionModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showPayHouseModal, setShowPayHouseModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showOnlineApprovalModal, setShowOnlineApprovalModal] = useState(false);
  const [showJobLevelModal, setShowJobLevelModal] = useState(false);
  
  // Employee data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeError, setEmployeeError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [empStatSearchTerm, setEmpStatSearchTerm] = useState('');
  
  // Photo upload state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Lookup data
  const [branchList, setBranchList] = useState<Branch[]>([]);
  const [divisionList, setDivisionList] = useState<Division[]>([]);
  const [departmentList, setDepartmentList] = useState<Department[]>([]);
  const [sectionList, setSectionList] = useState<Section[]>([]);
  const [unitList, setUnitList] = useState<Unit[]>([]);
  const [payHouseList, setPayHouseList] = useState<PayHouse[]>([]);
  const [areaList, setAreaList] = useState<Area[]>([]);
  const [locationList, setLocationList] = useState<Location[]>([]);
  const [onlineApprovalList, setOnlineApprovalList] = useState<OnlineApproval[]>([]);
  const [jobLevelList, setJobLevelList] = useState<JobLevel[]>([]);
  const [empStatusList, setEmpStatusList] = useState<EmpStatus[]>([]);
  
  // Loading states
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingPayHouses, setLoadingPayHouses] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingOnlineApprovals, setLoadingOnlineApprovals] = useState(false);
  const [loadingJobLevels, setLoadingJobLevels] = useState(false);
  const [loadingEmpStatuses, setLoadingEmpStatuses] = useState(false);
  
  // Errors
  const [branchError, setBranchError] = useState('');
  const [divisionError, setDivisionError] = useState('');
  const [departmentError, setDepartmentError] = useState('');
  const [sectionError, setSectionError] = useState('');
  const [unitError, setUnitError] = useState('');
  const [payHouseError, setPayHouseError] = useState('');
  const [areaError, setAreaError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [onlineApprovalError, setOnlineApprovalError] = useState('');
  const [jobLevelError, setJobLevelError] = useState('');
  const [empStatusError, setEmpStatusError] = useState('');
  
  const [formData, setFormData] = useState({
    empID: 0,
    empCode: '',
    empStatCode: '',
    courtesy: '',
    lastName: '',
    firstName: '',
    middleName: '',
    suffix: '',
    dateHired: '',
    regularized: '',
    probeStart: '',
    probeEnd: '',
    dateResigned: '',
    suspended: '',
    suspend: false,
    separated: false,
    contractual: false,
    sss: '',
    pagibig: '',
    philhealth: '',
    tin: '',
    gsisNo: '',
    branch: '',
    branchCode: '',
    division: '',
    divisionCode: '',
    department: '',
    departmentCode: '', // Add this
    section: '',
    sectionCode: '',
    unit: '',
    unitCode: '',
    payHouse: '',
    payHouseCode: '',
    area: '',
    areaCode: '',
    location: '',
    locationCode: '',
    onlineApplication: '',
    onlineAppCode: '',
    designation: '',
    jobLevel: '',
    jobLevelCode: '',
    // Personal Information
    homeAddress: '',
    presentAddress: '',
    city: '',
    province: '',
    postalCode: '',
    mobilePhone: '',
    presentPhone: '',
    homePhone: '',
    civilStatus: '',
    citizenship: '',
    religion: '',
    weight: '0',
    height: '0',
    gender: 'M',
    email: '',
    birthDate: '',
    age: '0',
    birthPlace: ''
  });

  // ==================== API FUNCTIONS ====================
  
  // Employee CRUD
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

  const fetchEmployeeById = async (id: number) => {
    setEmployeeLoading(true);
    setEmployeeError('');
    try {
      const response = await apiClient.get(`/Maintenance/EmployeeMasterFile/${id}`);
      if (response.status === 200 && response.data) {
        setCurrentEmployee(response.data);
        return response.data;
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load employee';
      setEmployeeError(errorMsg);
      console.error('Error fetching employee:', error);
    } finally {
      setEmployeeLoading(false);
    }
  };

  const searchEmployees = async (searchTerm: string) => {
    setEmployeeLoading(true);
    setEmployeeError('');
    try {
      const response = await apiClient.get('/Maintenance/EmployeeMasterFile', {
        params: { search: searchTerm }
      });
      if (response.status === 200 && response.data) {
        setEmployees(response.data);
        return response.data;
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to search employees';
      setEmployeeError(errorMsg);
      console.error('Error searching employees:', error);
    } finally {
      setEmployeeLoading(false);
    }
  };

const createEmployee = async (employeeData: any) => {
  setEmployeeLoading(true);
  setEmployeeError('');
  try {
    const bodyFormData = new FormData();

// Add photo if selected
if (photoFile) {
  bodyFormData.append('Photo', photoFile);
}

Object.keys(employeeData).forEach((key) => {
      const value = employeeData[key];
      if (value !== null && value !== undefined) {
        if (value instanceof Date) {
          bodyFormData.append(key, value.toISOString());
        } else {
          bodyFormData.append(key, value.toString());
        }
      }
    });

    const response = await apiClient.post(
      '/Maintenance/EmployeeMasterFile', 
      bodyFormData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    if (response.status === 200 || response.status === 201) {
      await fetchEmployees();
      
      // --- Success Alert ---
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Employee created successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
// Clear photo state
setPhotoFile(null);
setPhotoPreview('');
      return response.data;
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to create employee';
    setEmployeeError(errorMsg);
    
    // --- Error Alert ---
    await Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: errorMsg,
    });

    throw error;
  } finally {
    setEmployeeLoading(false);
  }
};

const updateEmployee = async (id: number, apiData: any) => {
  setEmployeeLoading(true);
  try {
    // 1. Double check: Backend usually requires URL ID to match Body ID
    if (apiData.EmpID && Number(apiData.EmpID) !== id) {
       console.error("ID Mismatch: URL has " + id + " but Body has " + apiData.EmpID);
    }

    // 2. Create FormData object for [FromForm] compatibility
   // 2. Create FormData object for [FromForm] compatibility
const bodyFormData = new FormData();

// Add photo if a new one was selected - use lowercase 'photo' to match API field
if (photoFile) {
  bodyFormData.append('photo', photoFile);
}

// 3. Append to FormData (Ensures PascalCase keys from apiData are preserved)
Object.keys(apiData).forEach((key) => {
      const value = apiData[key];
      if (value !== null && value !== undefined) {
        // Handle dates if they are objects, otherwise stringify
        if (value instanceof Date) {
          bodyFormData.append(key, value.toISOString());
        } else {
          bodyFormData.append(key, value.toString());
        }
      }
    });

    const response = await apiClient.put(
      `/Maintenance/EmployeeMasterFile/${id}`, 
      bodyFormData,
      {
        headers: { "Content-Type": "multipart/form-data" }
      }
    );

    if (response.status === 200 || response.status === 204) {
      await fetchEmployees();
      
      // --- Success Alert ---
      await Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Employee record has been updated successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
setPhotoFile(null);
      return response.data;
    }
  } catch (error: any) {
    console.error('Error updating employee:', error);
    const errorMsg = error.response?.data?.message || error.message || 'An error occurred during update.';

    // --- Error Alert ---
    await Swal.fire({
      icon: 'error',
      title: 'Update Failed',
      text: errorMsg,
    });

    throw error;
  } finally {
    setEmployeeLoading(false);
  }
};

  const deleteEmployee = async (id: number) => {
    setEmployeeLoading(true);
    setEmployeeError('');
    try {
      const response = await apiClient.delete(`/Maintenance/EmployeeMasterFile/${id}`);
      if (response.status === 200 || response.status === 204) {
        await fetchEmployees();
        setCurrentEmployee(null);
        return true;
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete employee';
      setEmployeeError(errorMsg);
      console.error('Error deleting employee:', error);
      throw error;
    } finally {
      setEmployeeLoading(false);
    }
  };

  // Lookup fetch functions
  const fetchBranchData = async () => {
    setLoadingBranches(true);
    setBranchError('');
    try {
      const response = await apiClient.get('/Fs/Employment/BranchSetUp');
      if (response.status === 200 && response.data) {
        const mappedData = response.data.map((branch: any) => ({
          branchId: branch.braID || branch.id || '',
          code: branch.braCode || branch.code || '',
          description: branch.braDesc || branch.description || '',
          branchManager: branch.braMngr || branch.branchManager || '',
          branchManagerCode: branch.braMngrCode || '',
          deviceName: branch.deviceName || branch.DeviceName || '',
        }));
        setBranchList(mappedData);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load branches';
      setBranchError(errorMsg);
      console.error('Error fetching branches:', error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const fetchDivisionData = async () => {
    setLoadingDivisions(true);
    setDivisionError('');
    try {
      const response = await apiClient.get('/Fs/Employment/DivisionSetUp');
      if (response.status === 200 && response.data) {
        const mappedData = response.data.map((division: any) => ({
          id: division.divID || '',
          code: division.divCode || '',
          description: division.divDesc || '',
          head: division.divHead || '',
          headCode: division.divHeadCode || '',
          deviceName: division.deviceName || '',
        }));
        setDivisionList(mappedData);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load divisions';
      setDivisionError(errorMsg);
      console.error('Error fetching divisions:', error);
    } finally {
      setLoadingDivisions(false);
    }
  };
const fetchDepartmentData = async () => {
  setLoadingDepartments(true);
  setDepartmentError('');
  try {
    const response = await apiClient.get('/Fs/Employment/DepartmentSetUp');
    if (response.status === 200 && response.data) {
      const mappedData = response.data.map((dept: any) => ({
        departmentId: dept.depID || '',
        code: dept.depCode || '',
        departmentCode: dept.depCode || '',
        departmentHeadCode: dept.depHeadCode || '',
        description: dept.depDesc || '',
        divisionCode: dept.divCode || '',
        head: dept.depHead || '',
        deviceName: dept.deviceName || '',
        head1: dept.head1 || '',
        email1: dept.email1 || '',
        head2: dept.head2 || '',
        email2: dept.email2 || ''
      }));
      setDepartmentList(mappedData);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to load departments';
    setDepartmentError(errorMsg);
    console.error('Error fetching departments:', error);
  } finally {
    setLoadingDepartments(false);
  }
};
  const fetchSectionData = async () => {
    setLoadingSections(true);
    setSectionError('');
    try {
      const response = await apiClient.get('/Fs/Employment/SectionSetUp');
      if (response.status === 200 && response.data) {
        const mappedData = response.data.map((section: any) => ({
          id: section.secID || section.id || '',
          code: section.secCode || section.code || '',
          description: section.secDesc || section.description || '',
          head: section.secHead || section.head || '',
          headCode: section.secHeadCode || section.headCode || '',
          deviceName: section.deviceName || '',
        }));
        setSectionList(mappedData);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load sections';
      setSectionError(errorMsg);
      console.error('Error fetching sections:', error);
    } finally {
      setLoadingSections(false);
    }
  };

  const fetchUnitData = async () => {
    setLoadingUnits(true);
    setUnitError('');
    try {
      const response = await apiClient.get('/Fs/Employment/UnitSetUp');
      if (response.status === 200 && response.data) {
        const mappedData = response.data.map((unit: any) => ({
          id: unit.unitID || '',
          code: unit.unitCode || '',
          description: unit.unitDesc || '',
          head: unit.head || '',
          position: unit.position || '',
          deviceName: unit.deviceName || '',
        }));
        setUnitList(mappedData);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load units';
      setUnitError(errorMsg);
      console.error('Error fetching units:', error);
    } finally {
      setLoadingUnits(false);
    }
  };

  const fetchPayHouseData = async () => {
    setLoadingPayHouses(true);
    setPayHouseError('');
    try {
      const response = await apiClient.get('/Fs/Employment/PayHouseSetUp');
      if (response.status === 200 && response.data) {
        const mappedData = response.data.map((payHouse: any) => ({
          id: payHouse.lineID || '',
          code: payHouse.lineCode || '',
          description: payHouse.lineDesc || '',
          head: payHouse.head || '',
          headCode: payHouse.headCode || '',
          position: payHouse.position || '',
          deviceName: payHouse.deviceName || '',
        }));
        setPayHouseList(mappedData);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load pay houses';
      setPayHouseError(errorMsg);
      console.error('Error fetching pay houses:', error);
    } finally {
      setLoadingPayHouses(false);
    }
  };

  const fetchAreaData = async () => {
    setLoadingAreas(true);
    setAreaError('');
    try {
      const response = await apiClient.get('/Fs/EmploymentAreaSetUp');
      if (response.status === 200 && response.data) {
        const mappedData = response.data.map((area: any) => ({
          id: area.id || area.ID || '',
          code: area.areaCode || area.AreaCode || '',
          description: area.areaDesc || area.AreaDesc || '',
          head: area.head || area.Head || '',
          headCode: area.headCode || area.HeadCode || '',
          deviceName: area.deviceName || area.DeviceName || '',
        }));
        setAreaList(mappedData);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load areas';
      setAreaError(errorMsg);
      console.error('Error fetching areas:', error);
    } finally {
      setLoadingAreas(false);
    }
  };

  const fetchLocationData = async () => {
    setLoadingLocations(true);
    setLocationError('');
    try {
      const response = await apiClient.get('/Fs/Employment/LocationSetUp');
      if (response.status === 200 && response.data) {
        const mappedData = response.data.map((location: any) => ({
          id: location.locID || '',
          code: location.locationCode || '',
          description: location.locationDesc || '',
          head: location.head || '',
          headCode: location.headCode || '',
          acctCode: location.acctCode || '',
          createdBy: location.createdBy || '',
          createdDate: location.createdDate || '',
          editedBy: location.editedBy || '',
          editedDate: location.editedDate || '',
          deviceName: location.deviceName || '',
        }));
        setLocationList(mappedData);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load locations';
      setLocationError(errorMsg);
      console.error('Error fetching locations:', error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchOnlineApprovalData = async () => {
    setLoadingOnlineApprovals(true);
    setOnlineApprovalError('');
    try {
      const response = await apiClient.get('/Fs/Employment/OnlineApprovalSetUp');
      if (response.status === 200 && response.data) {
        const mappedData = response.data.map((approval: any) => ({
          id: approval.id || '',
          code: approval.onlineAppCode || '',
          description: approval.onlineAppDesc || '',
          head: approval.onlineAppMngr || '',
          headCode: approval.onlineAppMngr || '',
          deviceName: approval.deviceName || '',
          createdBy: approval.createdBy || '',
          createdDate: approval.createdDate || '',
          editedBy: approval.editedBy || '',
          editedDate: approval.editedDate || '',
        }));
        setOnlineApprovalList(mappedData);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load online approvals';
      setOnlineApprovalError(errorMsg);
      console.error('Error fetching online approvals:', error);
    } finally {
      setLoadingOnlineApprovals(false);
    }
  };

  const fetchJobLevelData = async () => {
    setLoadingJobLevels(true);
    setJobLevelError('');
    try {
      const response = await apiClient.get('/Fs/Employment/JobLevelSetUp');
      if (response.status === 200 && response.data) {
        const mappedData = response.data.map((jobLevel: any) => ({
          id: jobLevel.jobLevelID || '',
          code: jobLevel.jobLevelCode || '',
          description: jobLevel.jobLevelDesc || '',
        }));
        setJobLevelList(mappedData);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load job levels';
      setJobLevelError(errorMsg);
      console.error('Error fetching job levels:', error);
    } finally {
      setLoadingJobLevels(false);
    }
  };

  const fetchEmpStatusData = async () => {
    setLoadingEmpStatuses(true);
    setEmpStatusError('');
    try {
      const response = await apiClient.get('/Fs/Employment/JobLevelSetUp');
            if (response.status === 200 && response.data) {
                // Map API response to expected format
                const mappedData = response.data.map((division: any) => ({
                    id: division.jobLevelID || '',
                    code: division.jobLevelCode || '',
                    description: division.jobLevelDesc || '',
                }));
                setEmpStatusList(mappedData);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load employee statuses';
      setEmpStatusError(errorMsg);
      console.error('Error fetching employee statuses:', error);
    } finally {
      setLoadingEmpStatuses(false);
    }
  };

  // ==================== HELPER FUNCTIONS ====================
  
  const convertFormDataToAPI = (): Partial<Employee> => {
    return {
      empID: formData.empID,
      empCode: formData.empCode,
      empStatCode: formData.empStatCode,
      courtesy: formData.courtesy,
      lName: formData.lastName,
      fName: formData.firstName,
      mName: formData.middleName,
      suffix: formData.suffix,
      dateHired: formData.dateHired || null,
      dateRegularized: formData.regularized || null,
      probeStart: formData.probeStart || null,
      probeEnd: formData.probeEnd || null,
      dateResigned: formData.dateResigned || null,
      dateSuspended: formData.suspended || null,
      suspend: formData.suspend,
      separated: formData.separated,
      contractual: formData.contractual,
      sssNo: formData.sss,
      pagIbigNo: formData.pagibig,
      pHilHealthNo: formData.philhealth,
      tin: formData.tin,
      gsisNo: formData.gsisNo,
      braCode: formData.branchCode,
      divCode: formData.divisionCode,
      depCode: formData.departmentCode,
      secCode: formData.sectionCode,
      unitCode: formData.unitCode,
      payCode: formData.payHouseCode,
      areaCode: formData.areaCode,
      locCode: formData.locationCode,
      onlineAppCode: formData.onlineAppCode,
      desCode: formData.designation,
      grdCode: formData.jobLevelCode,
      hAddress: formData.homeAddress,
      pAddress: formData.presentAddress,
      city: formData.city,
      province: formData.province,
      postalCode: formData.postalCode,
      mobilePhone: formData.mobilePhone,
      presentPhone: formData.presentPhone,
      homePhone: formData.homePhone,
      civilStatus: formData.civilStatus,
      citizenship: formData.citizenship,
      religion: formData.religion,
      weight: formData.weight,
      height: formData.height,
      sex: formData.gender,
      email: formData.email,
      birthDate: formData.birthDate || null,
      age: parseInt(formData.age) || 0,
      birthPlace: formData.birthPlace,
      unionMember: false,
      agency: false,
      subAcctCode: '',
      shiftCode: '',
      superior: '',
      clsCode: '',
      locId: 0,
      rateCode: '',
      taxID: 0,
      taxCode: '',
      bankAccount: '',
      bankCode: '',
      pagibigCode: '',
      photo: '',
      catCode: '',
      nickName: '',
    };
  };

  const convertAPIToFormData = (employee: Employee) => {
    setFormData({
      empID: employee.empID,
      empCode: employee.empCode,
      empStatCode: employee.empStatCode,
      courtesy: employee.courtesy,
      lastName: employee.lName,
      firstName: employee.fName,
      middleName: employee.mName,
      suffix: employee.suffix,
      dateHired: employee.dateHired || '',
      regularized: employee.dateRegularized || '',
      probeStart: employee.probeStart || '',
      probeEnd: employee.probeEnd || '',
      dateResigned: employee.dateResigned || '',
      suspended: employee.dateSuspended || '',
      suspend: employee.suspend,
      separated: employee.separated,
      contractual: employee.contractual,
      sss: employee.sssNo,
      pagibig: employee.pagIbigNo,
      philhealth: employee.pHilHealthNo,
      tin: employee.tin,
      gsisNo: employee.gsisNo,
      branch: branchList.find(b => b.code === employee.braCode)?.description || '',
      branchCode: employee.braCode,
      division: divisionList.find(d => d.code === employee.divCode)?.description || '',
      divisionCode: employee.divCode,
      department: departmentList.find(d => d.code === employee.depCode)?.description || '',
      departmentCode: employee.depCode,
      section: sectionList.find(s => s.code === employee.secCode)?.description || '',
      sectionCode: employee.secCode,
      unit: unitList.find(u => u.code === employee.unitCode)?.description || '',
      unitCode: employee.unitCode,
      payHouse: payHouseList.find(p => p.code === employee.payCode)?.description || '',
      payHouseCode: employee.payCode,
      area: areaList.find(a => a.code === employee.areaCode)?.description || '',
      areaCode: employee.areaCode,
      location: locationList.find(l => l.code === employee.locCode)?.description || '',
      locationCode: employee.locCode,
      onlineApplication: onlineApprovalList.find(o => o.code === employee.onlineAppCode)?.description || '',
      onlineAppCode: employee.onlineAppCode,
      designation: employee.desCode,
      jobLevel: jobLevelList.find(j => j.code === employee.grdCode)?.description || '',
      jobLevelCode: employee.grdCode,
      homeAddress: employee.hAddress,
      presentAddress: employee.pAddress,
      city: employee.city,
      province: employee.province,
      postalCode: employee.postalCode,
      mobilePhone: employee.mobilePhone,
      presentPhone: employee.presentPhone,
      homePhone: employee.homePhone,
      civilStatus: employee.civilStatus,
      citizenship: employee.citizenship,
      religion: employee.religion,
      weight: employee.weight,
      height: employee.height,
      gender: employee.sex,
      email: employee.email,
      birthDate: employee.birthDate || '',
      age: employee.age.toString(),
      birthPlace: employee.birthPlace,
    });
  // Set photo preview if employee has photoBytes
if (employee.photo || (employee as any).photoBytes) {
  const photoData = (employee as any).photoBytes || employee.photo;
  
  // Check if photo already has data:image prefix (base64)
  if (photoData.startsWith('data:image')) {
    setPhotoPreview(photoData);
  } 
  // If it's just a base64 string without prefix, add it
  else {
    setPhotoPreview(`data:image/jpeg;base64,${photoData}`);
  }
} else {
  setPhotoPreview('');
}
setPhotoFile(null);
  };
// Photo handling functions
const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        text: 'Please select an image file (JPG, PNG, etc.)',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'Please select an image smaller than 5MB',
      });
      return;
    }

    setPhotoFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
};

const handleRemovePhoto = () => {
  setPhotoFile(null);
  setPhotoPreview('');
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};

const handlePhotoClick = () => {
  if (isEditing) {
    fileInputRef.current?.click();
  }
};
  // ==================== EVENT HANDLERS ====================
  
  const handleCreateNew = () => {
    setIsEditing(true);
    setIsCreatingNew(true);
    setPhotoFile(null);
setPhotoPreview('');
    setFormData({
      empID: 0,
      empCode: '',
      empStatCode: '',
      courtesy: '',
      lastName: '',
      firstName: '',
      middleName: '',
      suffix: '',
      dateHired: '',
      regularized: '',
      probeStart: '',
      probeEnd: '',
      dateResigned: '',
      suspended: '',
      suspend: false,
      separated: false,
      contractual: false,
      sss: '',
      pagibig: '',
      philhealth: '',
      tin: '',
      gsisNo: '',
      branch: '',
      branchCode: '',
      division: '',
      divisionCode: '',
      department: '',
      departmentCode: '',
      section: '',
      sectionCode: '',
      unit: '',
      unitCode: '',
      payHouse: '',
      payHouseCode: '',
      area: '',
      areaCode: '',
      location: '',
      locationCode: '',
      onlineApplication: '',
      onlineAppCode: '',
      designation: '',
      jobLevel: '',
      jobLevelCode: '',
      homeAddress: '',
      presentAddress: '',
      city: '',
      province: '',
      postalCode: '',
      mobilePhone: '',
      presentPhone: '',
      homePhone: '',
      civilStatus: '',
      citizenship: '',
      religion: '',
      weight: '0',
      height: '0',
      gender: 'M',
      email: '',
      birthDate: '',
      age: '0',
      birthPlace: ''
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const apiData = convertFormDataToAPI();
      
      if (isCreatingNew) {
        await createEmployee(apiData);
        
      } else {
        await updateEmployee(formData.empID, apiData);
      
      }
      
      setIsEditing(false);
      setIsCreatingNew(false);
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Failed to save employee. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreatingNew(false);
    if (currentEmployee && !isCreatingNew) {
      convertAPIToFormData(currentEmployee);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteEmployee(formData.empID);
      alert('Employee deleted successfully!');
      setShowDeleteConfirmModal(false);
      handleCreateNew();
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee. Please try again.');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmModal(false);
  };

  const handleSearch = () => {
    setShowSearchModal(true);
  };
const adaptedEmployees = useMemo(() => {
  return employees.map(emp => ({
    ...emp,
    name: `${emp.lName}, ${emp.fName}`,
    groupCode: emp.grpCode
  }));
}, [employees]);
const handleEmployeeSearchSelect = async (empCode: string, name: string) => {
  try {
    const employee = employees.find(emp => emp.empCode === empCode);
    
    if (!employee) {
      console.error('Employee not found:', empCode);
      alert('Employee not found');
      return;
    }

    const fullEmployee = await fetchEmployeeById(employee.empID);
    if (fullEmployee) {
      convertAPIToFormData(fullEmployee);
    }
    setShowSearchModal(false);
  } catch (error) {
    console.error('Error loading employee:', error);
    alert('Failed to load employee details');
  }
};

  const handleSearchInput = async (value: string) => {
    setSearchTerm(value);
    if (value.length >= 2) {
      await searchEmployees(value);
    } else if (value.length === 0) {
      await fetchEmployees();
    }
  };

  // ==================== USEEFFECT HOOKS ====================
  
  // Load all data on mount
  useEffect(() => {
    fetchEmployees();
    fetchBranchData();
    fetchDivisionData();
    fetchDepartmentData();
    fetchSectionData();
    fetchUnitData();
    fetchPayHouseData();
    fetchAreaData();
    fetchLocationData();
    fetchOnlineApprovalData();
    fetchJobLevelData();
    fetchEmpStatusData();
  }, []);

  // Handle ESC key for modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showSearchModal) setShowSearchModal(false);
        if (showEmpStatModal) setShowEmpStatModal(false);
        if (showDeleteConfirmModal) setShowDeleteConfirmModal(false);
        if (showBranchModal) setShowBranchModal(false);
        if (showDivisionModal) setShowDivisionModal(false);
        if (showDepartmentModal) setShowDepartmentModal(false);
        if (showSectionModal) setShowSectionModal(false);
        if (showUnitModal) setShowUnitModal(false);
        if (showPayHouseModal) setShowPayHouseModal(false);
        if (showAreaModal) setShowAreaModal(false);
        if (showLocationModal) setShowLocationModal(false);
        if (showOnlineApprovalModal) setShowOnlineApprovalModal(false);
        if (showJobLevelModal) setShowJobLevelModal(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showSearchModal, showEmpStatModal, showDeleteConfirmModal, showBranchModal, showDivisionModal,showDepartmentModal, showSectionModal, showUnitModal, showPayHouseModal, showAreaModal, showLocationModal, showOnlineApprovalModal, showJobLevelModal]);

  // ==================== FILTERED DATA ====================
  
  const filteredEmployees = employees.filter(emp => 
    emp.empCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${emp.lName}, ${emp.fName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmpStatuses = empStatusList.filter(status =>
    status.code.toLowerCase().includes(empStatSearchTerm.toLowerCase()) ||
    status.description.toLowerCase().includes(empStatSearchTerm.toLowerCase())
  );

  // ==================== RENDER ====================
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Employee Master File</h1>
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
                    Manage employee records including personal information, employment details, organizational assignments, and government ID numbers. This master file serves as the central repository for all employee data.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Employment and organizational information</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Personal details and contact information</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Government IDs (SSS, PAG-IBIG, PhilHealth, TIN)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Status tracking and employment history</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {employeeError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{employeeError}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-6">
              {!isCreatingNew && !isEditing && (
                <button 
                  onClick={handleCreateNew}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create New
                </button>
              )}
              {!isEditing ? (
                <button 
                  onClick={handleEdit}
                  disabled={formData.empID === 0}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleSave}
                    disabled={employeeLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {employeeLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={handleCancel}
                    disabled={employeeLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              )}
              {!isCreatingNew && !isEditing && (
                <>
                  <button 
                    onClick={handleDelete}
                    disabled={formData.empID === 0}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                  <button 
                    onClick={handleSearch}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </button>
                </>
              )}
            </div>

            {/* Employee Info Display */}
            <div className="mb-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                {/* Employee Code and Status */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-700 font-bold text-sm mb-2">Emp. Code</label>
                    <input
                      type="text"
                      value={formData.empCode}
                      onChange={(e) => setFormData({...formData, empCode: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 text-blue-700 font-bold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold text-sm mb-2">Emp. Stat Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.empStatCode}
                        onChange={(e) => setFormData({...formData, empStatCode: e.target.value})}
                        disabled={!isEditing}
                        className="flex-1 px-4 py-2 text-blue-700 font-bold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                      />
                      {isEditing && (
                        <button 
                          onClick={() => setShowEmpStatModal(true)}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-700 font-bold text-sm mb-2">Courtesy</label>
                    <select
                      value={formData.courtesy}
                      onChange={(e) => setFormData({...formData, courtesy: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 text-blue-700 font-bold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                    >
                      <option value="">Select...</option>
                      <option value="Engr">Engr (Engineer)</option>
                      <option value="Dr">Dr (Doctor)</option>
                      <option value="Mr">Mr (Mister)</option>
                      <option value="Mrs">Mrs (Mrs)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold text-sm mb-2">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 text-blue-700 font-bold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold text-sm mb-2">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 text-blue-700 font-bold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold text-sm mb-2">Middle Name</label>
                    <input
                      type="text"
                      value={formData.middleName}
                      onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 text-blue-700 font-bold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold text-sm mb-2">Suffix</label>
                    <input
                      type="text"
                      value={formData.suffix}
                      onChange={(e) => setFormData({...formData, suffix: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 text-blue-700 font-bold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex items-center gap-1 border-b border-gray-200 flex-wrap">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('employment')}
                  className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                    activeTab === 'employment'
                      ? 'font-medium bg-blue-600 text-white -mb-px'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } transition-colors`}
                >
                  <Briefcase className="w-4 h-4" />
                  Employment Information
                </button>
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                    activeTab === 'personal'
                      ? 'font-medium bg-blue-600 text-white -mb-px'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } transition-colors`}
                >
                  <User className="w-4 h-4" />
                  Personal Information
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'employment' && (
              <div className="space-y-6">
                {/* Position Section */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-gray-900 mb-4">Position</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-gray-700 font-bold text-sm mb-2">Designation</label>
                      <input
                        type="text"
                        value={formData.designation}
                        onChange={(e) => setFormData({...formData, designation: e.target.value})}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold text-sm mb-2">Job Level</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.jobLevel}
                          onChange={(e) => setFormData({...formData, jobLevel: e.target.value})}
                          disabled={!isEditing}
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                        {isEditing && (
                          <>
                            <button 
                              onClick={() => setShowJobLevelModal(true)}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Search className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setFormData({...formData, jobLevel: '', jobLevelCode: ''})}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employment Dates Section */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-gray-900 mb-4">Employment Dates</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="block text-gray-700 font-bold text-sm mb-2">Date Hired</label>
                        <InlineDatePicker
                          date={formData.dateHired}
                          onChange={(date) => setFormData({...formData, dateHired: date})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold text-sm mb-2">Regularized</label>
                        <InlineDatePicker
                          date={formData.regularized}
                          onChange={(date) => setFormData({...formData, regularized: date})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="flex items-center h-[42px]">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.contractual}
                            onChange={(e) => setFormData({...formData, contractual: e.target.checked})}
                            disabled={!isEditing}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">Contractual</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="block text-gray-700 font-bold text-sm mb-2">Probe Start</label>
                        <InlineDatePicker
                          date={formData.probeStart}
                          onChange={(date) => setFormData({...formData, probeStart: date})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold text-sm mb-2">Probe End</label>
                        <InlineDatePicker
                          date={formData.probeEnd}
                          onChange={(date) => setFormData({...formData, probeEnd: date})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="flex items-center h-[42px]">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.separated}
                            onChange={(e) => setFormData({...formData, separated: e.target.checked})}
                            disabled={!isEditing}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">Separated</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="block text-gray-700 font-bold text-sm mb-2">Date Resigned</label>
                        <InlineDatePicker
                          date={formData.dateResigned}
                          onChange={(date) => setFormData({...formData, dateResigned: date})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold text-sm mb-2">Suspended</label>
                        <InlineDatePicker
                          date={formData.suspended}
                          onChange={(date) => setFormData({...formData, suspended: date})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="flex items-center h-[42px]">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.suspend}
                            onChange={(e) => setFormData({...formData, suspend: e.target.checked})}
                            disabled={!isEditing}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">Suspend</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Government IDs Section */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-gray-900 mb-4">Government IDs</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-700 font-bold text-sm mb-2">SSS</label>
                        <input
                          type="text"
                          value={formData.sss}
                          onChange={(e) => setFormData({...formData, sss: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold text-sm mb-2">PAG-IBIG</label>
                        <input
                          type="text"
                          value={formData.pagibig}
                          onChange={(e) => setFormData({...formData, pagibig: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold text-sm mb-2">Philhealth</label>
                        <input
                          type="text"
                          value={formData.philhealth}
                          onChange={(e) => setFormData({...formData, philhealth: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-700 font-bold text-sm mb-2">TIN</label>
                        <input
                          type="text"
                          value={formData.tin}
                          onChange={(e) => setFormData({...formData, tin: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold text-sm mb-2">GSIS/No</label>
                        <input
                          type="text"
                          value={formData.gsisNo}
                          onChange={(e) => setFormData({...formData, gsisNo: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organizational Assignment Section */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-gray-900 mb-4">Organizational Assignment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 font-bold text-sm mb-2">Branch</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.branch}
                          disabled
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                        {isEditing && (
                          <>
                            <button 
                              onClick={() => setShowBranchModal(true)}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Search className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setFormData({...formData, branch: '', branchCode: ''})}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold text-sm mb-2">Division</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.division}
                          disabled
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                        {isEditing && (
                          <>
                            <button 
                              onClick={() => setShowDivisionModal(true)}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Search className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setFormData({...formData, division: '', divisionCode: ''})}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  <div>
  <label className="block text-gray-700 font-bold text-sm mb-2">Department</label>
  <div className="flex gap-2">
    <input
      type="text"
      value={formData.department}
      disabled
      className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
    />
    {isEditing && (
      <>
        <button 
          onClick={() => setShowDepartmentModal(true)}
          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setFormData({...formData, department: '', departmentCode: ''})}
          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </>
    )}
  </div>
</div>
                    <div>
                      <label className="block text-gray-700 font-bold text-sm mb-2">Section</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.section}
                          disabled
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                        {isEditing && (
                          <>
                            <button 
                              onClick={() => setShowSectionModal(true)}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Search className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setFormData({...formData, section: '', sectionCode: ''})}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold text-sm mb-2">Unit</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.unit}
                          disabled
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                        {isEditing && (
                          <>
                            <button 
                              onClick={() => setShowUnitModal(true)}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Search className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setFormData({...formData, unit: '', unitCode: ''})}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold text-sm mb-2">Pay House</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.payHouse}
                          disabled
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                        {isEditing && (
                          <>
                            <button 
                              onClick={() => setShowPayHouseModal(true)}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Search className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setFormData({...formData, payHouse: '', payHouseCode: ''})}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold text-sm mb-2">Area</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.area}
                          disabled
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                        {isEditing && (
                          <>
                            <button 
                              onClick={() => setShowAreaModal(true)}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Search className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setFormData({...formData, area: '', areaCode: ''})}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold text-sm mb-2">Location</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.location}
                          disabled
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                        {isEditing && (
                          <>
                            <button 
                              onClick={() => setShowLocationModal(true)}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Search className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setFormData({...formData, location: '', locationCode: ''})}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold text-sm mb-2">Online Application</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.onlineApplication}
                          disabled
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                        {isEditing && (
                          <>
                            <button 
                              onClick={() => setShowOnlineApprovalModal(true)}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Search className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setFormData({...formData, onlineApplication: '', onlineAppCode: ''})}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Address & Contact Information */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Address Section */}
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="text-gray-900 mb-4">Address Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Home Address</label>
                          <textarea
                            value={formData.homeAddress}
                            onChange={(e) => setFormData({...formData, homeAddress: e.target.value})}
                            disabled={!isEditing}
                            rows={3}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Present Address</label>
                          <textarea
                            value={formData.presentAddress}
                            onChange={(e) => setFormData({...formData, presentAddress: e.target.value})}
                            disabled={!isEditing}
                            rows={3}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 resize-none"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-gray-700 font-bold text-sm mb-2">City</label>
                            <input
                              type="text"
                              value={formData.city}
                              onChange={(e) => setFormData({...formData, city: e.target.value})}
                              disabled={!isEditing}
                              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-bold text-sm mb-2">Province</label>
                            <input
                              type="text"
                              value={formData.province}
                              onChange={(e) => setFormData({...formData, province: e.target.value})}
                              disabled={!isEditing}
                              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-bold text-sm mb-2">Postal Code</label>
                            <input
                              type="text"
                              value={formData.postalCode}
                              onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                              disabled={!isEditing}
                              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="text-gray-900 mb-4">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Mobile Phone</label>
                          <input
                            type="text"
                            value={formData.mobilePhone}
                            onChange={(e) => setFormData({...formData, mobilePhone: e.target.value})}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Present Phone</label>
                          <input
                            type="text"
                            value={formData.presentPhone}
                            onChange={(e) => setFormData({...formData, presentPhone: e.target.value})}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Home Phone</label>
                          <input
                            type="text"
                            value={formData.homePhone}
                            onChange={(e) => setFormData({...formData, homePhone: e.target.value})}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Personal Details */}
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="text-gray-900 mb-4">Personal Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Civil Status</label>
                          <input
                            type="text"
                            value={formData.civilStatus}
                            onChange={(e) => setFormData({...formData, civilStatus: e.target.value})}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Citizenship</label>
                          <input
                            type="text"
                            value={formData.citizenship}
                            onChange={(e) => setFormData({...formData, citizenship: e.target.value})}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Religion</label>
                          <input
                            type="text"
                            value={formData.religion}
                            onChange={(e) => setFormData({...formData, religion: e.target.value})}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-700 font-bold text-sm mb-2">Weight</label>
                            <input
                              type="text"
                              value={formData.weight}
                              onChange={(e) => setFormData({...formData, weight: e.target.value})}
                              disabled={!isEditing}
                              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-bold text-sm mb-2">Height</label>
                            <input
                              type="text"
                              value={formData.height}
                              onChange={(e) => setFormData({...formData, height: e.target.value})}
                              disabled={!isEditing}
                              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Gender</label>
                          <input
                            type="text"
                            value={formData.gender}
                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Email</label>
                          <input
                            type="text"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Birth Date</label>
                          <InlineDatePicker
                            date={formData.birthDate}
                            onChange={(date) => setFormData({...formData, birthDate: date})}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Age</label>
                          <input
                            type="text"
                            value={formData.age}
                            onChange={(e) => setFormData({...formData, age: e.target.value})}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Birth Place</label>
                          <input
                            type="text"
                            value={formData.birthPlace}
                            onChange={(e) => setFormData({...formData, birthPlace: e.target.value})}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Photo */}
                {/* Right Column - Photo */}
<div className="space-y-6">
  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
    <h3 className="text-gray-900 mb-4">Photo</h3>
    
    {/* Hidden file input */}
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      onChange={handlePhotoSelect}
      disabled={!isEditing}
      className="hidden"
    />

    {/* Photo Display Area */}
    <div 
      className={`relative flex items-center justify-center w-full h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg border-2 border-dashed border-blue-300 overflow-hidden ${
        isEditing ? 'cursor-pointer hover:border-blue-500 transition-colors' : ''
      }`}
      onClick={handlePhotoClick}
    >
      {photoPreview ? (
        <>
          <img
            src={photoPreview}
            alt="Employee"
            className="w-full h-full object-cover"
          />
          {isEditing && (
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
              <div className="opacity-0 hover:opacity-100 transition-opacity">
                <Camera className="w-12 h-12 text-white" />
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-blue-400">
          <User className="w-32 h-32 mb-2" />
          {isEditing && (
            <p className="text-sm text-blue-600">Click to upload photo</p>
          )}
        </div>
      )}
    </div>

    {/* Photo Controls */}
    {isEditing && (
      <div className="mt-4 space-y-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {photoPreview ? 'Change Photo' : 'Upload Photo'}
        </button>
        
        {(photoPreview || photoFile) && (
          <button
            type="button"
            onClick={handleRemovePhoto}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Remove Photo
          </button>
        )}

        <p className="text-xs text-gray-500 text-center mt-2">
          Max size: 5MB • Formats: JPG, PNG, GIF
        </p>
      </div>
    )}
  </div>
</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* ==================== MODALS ==================== */}
      
<EmployeeSearchModal
  isOpen={showSearchModal}
  onClose={() => setShowSearchModal(false)}
  onSelect={handleEmployeeSearchSelect}
  employees={adaptedEmployees}
  loading={employeeLoading}
  error={employeeError}
/>

      {/* Emp Stat Code Modal */}
      {showEmpStatModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden pointer-events-auto">
            <div className="bg-gray-200 px-4 py-3 flex items-center justify-between border-b border-gray-300">
              <h2 className="text-gray-800">Search Employee Status</h2>
              <button
                onClick={() => setShowEmpStatModal(false)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[calc(85vh-60px)] overflow-y-auto">
              <h3 className="text-blue-600 mb-4">Emp Stat Code</h3>

              <div className="flex items-center gap-2 mb-4">
                <label className="text-gray-700">Search:</label>
                <input
                  type="text"
                  value={empStatSearchTerm}
                  onChange={(e) => setEmpStatSearchTerm(e.target.value)}
                  placeholder="Type status code or description..."
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {loadingEmpStatuses ? (
                <div className="text-center py-8">Loading employee statuses...</div>
              ) : empStatusError ? (
                <div className="text-center py-8 text-red-600">{empStatusError}</div>
              ) : (
                <>
                  <div className="border border-gray-300 rounded overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-300">
                          <th className="px-4 py-2 text-left text-gray-700">Code</th>
                          <th className="px-4 py-2 text-left text-gray-700">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEmpStatuses.length > 0 ? (
                          filteredEmpStatuses.map((status, index) => (
                            <tr
                              key={status.code}
                              className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              }`}
                              onClick={() => {
                                setFormData({...formData, empStatCode: status.code});
                                setShowEmpStatModal(false);
                                setEmpStatSearchTerm('');
                              }}
                            >
                              <td className="px-4 py-2 text-gray-800">{status.code}</td>
                              <td className="px-4 py-2 text-gray-800">{status.description}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                              No employee statuses found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between mt-4 text-sm text-gray-700">
                    <div>Showing {filteredEmpStatuses.length} status(es)</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
{/* Branch Modal */}
{showBranchModal && (
  <>
    <div 
      className="fixed inset-0 z-[99] bg-black bg-opacity-50"
      onClick={() => setShowBranchModal(false)}
    />
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden pointer-events-auto">
        <div className="bg-gray-200 px-4 py-3 flex items-center justify-between border-b border-gray-300">
          <h2 className="text-gray-800">Search Branch</h2>
          <button
            onClick={() => setShowBranchModal(false)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(85vh-60px)] overflow-y-auto">
          <h3 className="text-blue-600 mb-4">Branch</h3>

          {loadingBranches ? (
            <div className="text-center py-8">Loading branches...</div>
          ) : branchError ? (
            <div className="text-center py-8 text-red-600">{branchError}</div>
          ) : (
            <div className="border border-gray-300 rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="px-4 py-2 text-left text-gray-700">Code</th>
                    <th className="px-4 py-2 text-left text-gray-700">Description</th>
                    <th className="px-4 py-2 text-left text-gray-700">Manager</th>
                  </tr>
                </thead>
                <tbody>
                  {branchList.length > 0 ? (
                    branchList.map((branch, index) => (
                      <tr
                        key={branch.branchId}
                        className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                        onClick={() => {
                          setFormData({
                            ...formData, 
                            branch: branch.description,
                            branchCode: branch.code
                          });
                          setShowBranchModal(false);
                        }}
                      >
                        <td className="px-4 py-2 text-gray-800">{branch.code}</td>
                        <td className="px-4 py-2 text-gray-800">{branch.description}</td>
                        <td className="px-4 py-2 text-gray-800">{branch.branchManager}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                        No branches found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  </>
)}

{/* Division Modal */}
{showDivisionModal && (
  <>
    <div 
      className="fixed inset-0 z-[99] bg-black bg-opacity-50"
      onClick={() => setShowDivisionModal(false)}
    />
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden pointer-events-auto">
        <div className="bg-gray-200 px-4 py-3 flex items-center justify-between border-b border-gray-300">
          <h2 className="text-gray-800">Search Division</h2>
          <button
            onClick={() => setShowDivisionModal(false)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(85vh-60px)] overflow-y-auto">
          <h3 className="text-blue-600 mb-4">Division</h3>

          {loadingDivisions ? (
            <div className="text-center py-8">Loading divisions...</div>
          ) : divisionError ? (
            <div className="text-center py-8 text-red-600">{divisionError}</div>
          ) : (
            <div className="border border-gray-300 rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="px-4 py-2 text-left text-gray-700">Code</th>
                    <th className="px-4 py-2 text-left text-gray-700">Description</th>
                    <th className="px-4 py-2 text-left text-gray-700">Head</th>
                  </tr>
                </thead>
                <tbody>
                  {divisionList.length > 0 ? (
                    divisionList.map((division, index) => (
                      <tr
                        key={division.id}
                        className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                        onClick={() => {
                          setFormData({
                            ...formData, 
                            division: division.description,
                            divisionCode: division.code
                          });
                          setShowDivisionModal(false);
                        }}
                      >
                        <td className="px-4 py-2 text-gray-800">{division.code}</td>
                        <td className="px-4 py-2 text-gray-800">{division.description}</td>
                        <td className="px-4 py-2 text-gray-800">{division.head}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                        No divisions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  </>
)}
{/* Department Modal */}
{showDepartmentModal && (
  <>
    <div 
      className="fixed inset-0 z-[99] bg-black bg-opacity-50"
      onClick={() => setShowDepartmentModal(false)}
    />
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden pointer-events-auto">
        <div className="bg-gray-200 px-4 py-3 flex items-center justify-between border-b border-gray-300">
          <h2 className="text-gray-800">Search Department</h2>
          <button
            onClick={() => setShowDepartmentModal(false)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(85vh-60px)] overflow-y-auto">
          <h3 className="text-blue-600 mb-4">Department</h3>

          {loadingDepartments ? (
            <div className="text-center py-8">Loading departments...</div>
          ) : departmentError ? (
            <div className="text-center py-8 text-red-600">{departmentError}</div>
          ) : (
            <div className="border border-gray-300 rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="px-4 py-2 text-left text-gray-700">Code</th>
                    <th className="px-4 py-2 text-left text-gray-700">Description</th>
                    <th className="px-4 py-2 text-left text-gray-700">Head</th>
                    <th className="px-4 py-2 text-left text-gray-700">Division</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentList.length > 0 ? (
                    departmentList.map((dept, index) => (
                      <tr
                        key={dept.departmentId}
                        className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                        onClick={() => {
                          setFormData({
                            ...formData, 
                            department: dept.description,
                            departmentCode: dept.code
                          });
                          setShowDepartmentModal(false);
                        }}
                      >
                        <td className="px-4 py-2 text-gray-800">{dept.code}</td>
                        <td className="px-4 py-2 text-gray-800">{dept.description}</td>
                        <td className="px-4 py-2 text-gray-800">{dept.head}</td>
                        <td className="px-4 py-2 text-gray-800">{dept.divisionCode}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        No departments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  </>
)}
{/* Section Modal */}
{showSectionModal && (
  <>
    <div 
      className="fixed inset-0 z-[99] bg-black bg-opacity-50"
      onClick={() => setShowSectionModal(false)}
    />
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden pointer-events-auto">
        <div className="bg-gray-200 px-4 py-3 flex items-center justify-between border-b border-gray-300">
          <h2 className="text-gray-800">Search Section</h2>
          <button
            onClick={() => setShowSectionModal(false)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(85vh-60px)] overflow-y-auto">
          <h3 className="text-blue-600 mb-4">Section</h3>

          {loadingSections ? (
            <div className="text-center py-8">Loading sections...</div>
          ) : sectionError ? (
            <div className="text-center py-8 text-red-600">{sectionError}</div>
          ) : (
            <div className="border border-gray-300 rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="px-4 py-2 text-left text-gray-700">Code</th>
                    <th className="px-4 py-2 text-left text-gray-700">Description</th>
                    <th className="px-4 py-2 text-left text-gray-700">Head</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionList.length > 0 ? (
                    sectionList.map((section, index) => (
                      <tr
                        key={section.id}
                        className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                        onClick={() => {
                          setFormData({
                            ...formData, 
                            section: section.description,
                            sectionCode: section.code
                          });
                          setShowSectionModal(false);
                        }}
                      >
                        <td className="px-4 py-2 text-gray-800">{section.code}</td>
                        <td className="px-4 py-2 text-gray-800">{section.description}</td>
                        <td className="px-4 py-2 text-gray-800">{section.head}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                        No sections found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  </>
)}

{/* Unit Modal */}
{showUnitModal && (
  <>
    <div 
      className="fixed inset-0 z-[99] bg-black bg-opacity-50"
      onClick={() => setShowUnitModal(false)}
    />
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden pointer-events-auto">
        <div className="bg-gray-200 px-4 py-3 flex items-center justify-between border-b border-gray-300">
          <h2 className="text-gray-800">Search Unit</h2>
          <button
            onClick={() => setShowUnitModal(false)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(85vh-60px)] overflow-y-auto">
          <h3 className="text-blue-600 mb-4">Unit</h3>

          {loadingUnits ? (
            <div className="text-center py-8">Loading units...</div>
          ) : unitError ? (
            <div className="text-center py-8 text-red-600">{unitError}</div>
          ) : (
            <div className="border border-gray-300 rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="px-4 py-2 text-left text-gray-700">Code</th>
                    <th className="px-4 py-2 text-left text-gray-700">Description</th>
                    <th className="px-4 py-2 text-left text-gray-700">Head</th>
                  </tr>
                </thead>
                <tbody>
                  {unitList.length > 0 ? (
                    unitList.map((unit, index) => (
                      <tr
                        key={unit.id}
                        className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                        onClick={() => {
                          setFormData({
                            ...formData, 
                            unit: unit.description,
                            unitCode: unit.code
                          });
                          setShowUnitModal(false);
                        }}
                      >
                        <td className="px-4 py-2 text-gray-800">{unit.code}</td>
                        <td className="px-4 py-2 text-gray-800">{unit.description}</td>
                        <td className="px-4 py-2 text-gray-800">{unit.head}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                        No units found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  </>
)}

{/* Pay House Modal */}
{showPayHouseModal && (
  <>
    <div 
      className="fixed inset-0 z-[99] bg-black bg-opacity-50"
      onClick={() => setShowPayHouseModal(false)}
    />
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden pointer-events-auto">
        <div className="bg-gray-200 px-4 py-3 flex items-center justify-between border-b border-gray-300">
          <h2 className="text-gray-800">Search Pay House</h2>
          <button
            onClick={() => setShowPayHouseModal(false)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(85vh-60px)] overflow-y-auto">
          <h3 className="text-blue-600 mb-4">Pay House</h3>

          {loadingPayHouses ? (
            <div className="text-center py-8">Loading pay houses...</div>
          ) : payHouseError ? (
            <div className="text-center py-8 text-red-600">{payHouseError}</div>
          ) : (
            <div className="border border-gray-300 rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="px-4 py-2 text-left text-gray-700">Code</th>
                    <th className="px-4 py-2 text-left text-gray-700">Description</th>
                    <th className="px-4 py-2 text-left text-gray-700">Head</th>
                  </tr>
                </thead>
                <tbody>
                  {payHouseList.length > 0 ? (
                    payHouseList.map((payHouse, index) => (
                      <tr
                        key={payHouse.id}
                        className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                        onClick={() => {
                          setFormData({
                            ...formData, 
                            payHouse: payHouse.description,
                            payHouseCode: payHouse.code
                          });
                          setShowPayHouseModal(false);
                        }}
                      >
                        <td className="px-4 py-2 text-gray-800">{payHouse.code}</td>
                        <td className="px-4 py-2 text-gray-800">{payHouse.description}</td>
                        <td className="px-4 py-2 text-gray-800">{payHouse.head}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                        No pay houses found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  </>
)}

{/* Area Modal */}
{showAreaModal && (
  <>
    <div 
      className="fixed inset-0 z-[99] bg-black bg-opacity-50"
      onClick={() => setShowAreaModal(false)}
    />
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden pointer-events-auto">
        <div className="bg-gray-200 px-4 py-3 flex items-center justify-between border-b border-gray-300">
          <h2 className="text-gray-800">Search Area</h2>
          <button
            onClick={() => setShowAreaModal(false)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(85vh-60px)] overflow-y-auto">
          <h3 className="text-blue-600 mb-4">Area</h3>

          {loadingAreas ? (
            <div className="text-center py-8">Loading areas...</div>
          ) : areaError ? (
            <div className="text-center py-8 text-red-600">{areaError}</div>
          ) : (
            <div className="border border-gray-300 rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="px-4 py-2 text-left text-gray-700">Code</th>
                    <th className="px-4 py-2 text-left text-gray-700">Description</th>
                    <th className="px-4 py-2 text-left text-gray-700">Head</th>
                  </tr>
                </thead>
                <tbody>
                  {areaList.length > 0 ? (
                    areaList.map((area, index) => (
                      <tr
                        key={area.id}
                        className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                        onClick={() => {
                          setFormData({
                            ...formData, 
                            area: area.description,
                            areaCode: area.code
                          });
                          setShowAreaModal(false);
                        }}
                      >
                        <td className="px-4 py-2 text-gray-800">{area.code}</td>
                        <td className="px-4 py-2 text-gray-800">{area.description}</td>
                        <td className="px-4 py-2 text-gray-800">{area.head}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                        No areas found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  </>
)}

{/* Location Modal */}
{showLocationModal && (
  <>
    <div 
      className="fixed inset-0 z-[99] bg-black bg-opacity-50"
      onClick={() => setShowLocationModal(false)}
    />
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden pointer-events-auto">
        <div className="bg-gray-200 px-4 py-3 flex items-center justify-between border-b border-gray-300">
          <h2 className="text-gray-800">Search Location</h2>
          <button
            onClick={() => setShowLocationModal(false)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(85vh-60px)] overflow-y-auto">
          <h3 className="text-blue-600 mb-4">Location</h3>

          {loadingLocations ? (
            <div className="text-center py-8">Loading locations...</div>
          ) : locationError ? (
            <div className="text-center py-8 text-red-600">{locationError}</div>
          ) : (
            <div className="border border-gray-300 rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="px-4 py-2 text-left text-gray-700">Code</th>
                    <th className="px-4 py-2 text-left text-gray-700">Description</th>
                    <th className="px-4 py-2 text-left text-gray-700">Head</th>
                  </tr>
                </thead>
                <tbody>
                  {locationList.length > 0 ? (
                    locationList.map((location, index) => (
                      <tr
                        key={location.id}
                        className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                        onClick={() => {
                          setFormData({
                            ...formData, 
                            location: location.description,
                            locationCode: location.code
                          });
                          setShowLocationModal(false);
                        }}
                      >
                        <td className="px-4 py-2 text-gray-800">{location.code}</td>
                        <td className="px-4 py-2 text-gray-800">{location.description}</td>
                        <td className="px-4 py-2 text-gray-800">{location.head}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                        No locations found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  </>
)}

{/* Online Approval Modal */}
{showOnlineApprovalModal && (
  <>
    <div 
      className="fixed inset-0 z-[99] bg-black bg-opacity-50"
      onClick={() => setShowOnlineApprovalModal(false)}
    />
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden pointer-events-auto">
        <div className="bg-gray-200 px-4 py-3 flex items-center justify-between border-b border-gray-300">
          <h2 className="text-gray-800">Search Online Approval</h2>
          <button
            onClick={() => setShowOnlineApprovalModal(false)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(85vh-60px)] overflow-y-auto">
          <h3 className="text-blue-600 mb-4">Online Approval</h3>

          {loadingOnlineApprovals ? (
            <div className="text-center py-8">Loading online approvals...</div>
          ) : onlineApprovalError ? (
            <div className="text-center py-8 text-red-600">{onlineApprovalError}</div>
          ) : (
            <div className="border border-gray-300 rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="px-4 py-2 text-left text-gray-700">Code</th>
                    <th className="px-4 py-2 text-left text-gray-700">Description</th>
                    <th className="px-4 py-2 text-left text-gray-700">Manager</th>
                  </tr>
                </thead>
                <tbody>
                  {onlineApprovalList.length > 0 ? (
                    onlineApprovalList.map((approval, index) => (
                      <tr
                        key={approval.id}
                        className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                        onClick={() => {
                          setFormData({
                            ...formData, 
                            onlineApplication: approval.description,
                            onlineAppCode: approval.code
                          });
                          setShowOnlineApprovalModal(false);
                        }}
                      >
                        <td className="px-4 py-2 text-gray-800">{approval.code}</td>
                        <td className="px-4 py-2 text-gray-800">{approval.description}</td>
                        <td className="px-4 py-2 text-gray-800">{approval.head}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                        No online approvals found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  </>
)}

{/* Job Level Modal */}
{showJobLevelModal && (
  <>
    <div 
      className="fixed inset-0 z-[99] bg-black bg-opacity-50"
      onClick={() => setShowJobLevelModal(false)}
    />
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden pointer-events-auto">
        <div className="bg-gray-200 px-4 py-3 flex items-center justify-between border-b border-gray-300">
          <h2 className="text-gray-800">Search Job Level</h2>
          <button
            onClick={() => setShowJobLevelModal(false)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(85vh-60px)] overflow-y-auto">
          <h3 className="text-blue-600 mb-4">Job Level</h3>

          {loadingJobLevels ? (
            <div className="text-center py-8">Loading job levels...</div>
          ) : jobLevelError ? (
            <div className="text-center py-8 text-red-600">{jobLevelError}</div>
          ) : (
            <div className="border border-gray-300 rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="px-4 py-2 text-left text-gray-700">Code</th>
                    <th className="px-4 py-2 text-left text-gray-700">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {jobLevelList.length > 0 ? (
                    jobLevelList.map((jobLevel, index) => (
                      <tr
                        key={jobLevel.id}
                        className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                        onClick={() => {
                          setFormData({
                            ...formData, 
                            jobLevel: jobLevel.description,
                            jobLevelCode: jobLevel.code
                          });
                          setShowJobLevelModal(false);
                        }}
                      >
                        <td className="px-4 py-2 text-gray-800">{jobLevel.code}</td>
                        <td className="px-4 py-2 text-gray-800">{jobLevel.description}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                        No job levels found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  </>
)}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
              <h2 className="text-gray-800">Confirm Delete</h2>
            </div>

            <div className="p-6">
              <p className="text-gray-800 mb-6">Are you sure you want to delete this employee?</p>
              
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleConfirmDelete}
                  className="px-8 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm"
                >
                  OK
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
