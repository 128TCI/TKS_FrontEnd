import { useState, useRef, useEffect } from 'react';
import { Upload, Download, Check, FileText, CheckCircle } from 'lucide-react';
import { Footer } from '../Footer/Footer';
import { TKSGroupTable } from '../TKSGroupTable';
import apiClient from '../../services/apiClient';
import * as XLSX from "xlsx";
import Swal from 'sweetalert2';

interface ImportEmployeeMasterFileDto {
  remarks: string;
  empCode: string;

  statusActive?: string | null;
  empStatCode?: string | null;
  courtesy?: string | null;
  lName?: string | null;
  fName?: string | null;
  mName?: string | null;
  nickName?: string | null;
  hAddress?: string | null;
  pAddress?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  civilStatus?: string | null;
  citizenship?: string | null;
  religion?: string | null;
  sex?: string | null;
  email?: string | null;
  weight?: string | null;
  height?: string | null;
  mobilePhone?: string | null;
  homePhone?: string | null;
  presentPhone?: string | null;
  birthPlace?: string | null;

  braCode?: string | null;
  divCode?: string | null;
  depCode?: string | null;
  secCode?: string | null;
  unitCode?: string | null;
  lineCode?: string | null;
  desCode?: string | null;
  superior?: string | null;
  grdCode?: string | null;

  sssNo?: string | null;
  philHealthNo?: string | null;
  tin?: string | null;
  gsisNo?: string | null;

  dateHired: Date;
  dateRegularized: Date;
  dateResigned: Date;
  dateSuspended: Date;
  probeStart: Date;
  probeEnd: Date;
  birthDate: Date;

  tksGroup?: string | null;
  groupSchedCode?: string | null;

  allowOTDefault?: string | null;
  tardyExemp?: string | null;
  utExempt?: string | null;
  ndExempt?: string | null;
  otExempt?: string | null;
  absenceExempt?: string | null;
  otherEarnExempt?: string | null;
  holidayExempt?: string | null;
  unproductiveExempt?: string | null;

  deviceCode?: string | null;

  fixedRestDay1?: string | null;
  fixedRestDay2?: string | null;
  fixedRestDay3?: string | null;

  dailySchedule?: string | null;
  classificationCode?: string | null;
  suffix?: string | null;
  onlineAppCode?: string | null;

  message: string;
  rowNumber: number;
  columnNumber: number;
}
interface ImportEmployeeMasterFileFormDto {
    isDeleteExistingRecord: false,
    imports: ImportEmployeeMasterFileDto[]
}
type ResponseResultDto<T> = {
    isSuccess: boolean,
    resultData: T,
    errors: string[],
    messages: string
}



export function ImportEmployeeMasterfilePage() {
  const [selectedCodes, setSelectedCodes] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileLoaded, setFileLoaded] = useState(false);
  const [deleteExisting, setDeleteExisting] = useState(false);
  const [importTKS, setImportTKS] = useState("MasterFile");
  const [tksGroupList, setTKSGroupList] = useState<Array<{ id: number; groupCode: string; groupDescription: string;}>>([]);
  const [xlsxFile, setXlsxFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [error, setError] = useState<string | null>(null);
  const [importDataResult, setImportDataResult] = useState<ImportEmployeeMasterFileDto[]>([]);
  const [form, setForm] = useState<ImportEmployeeMasterFileFormDto>({
    isDeleteExistingRecord: false,
    imports: [] as ImportEmployeeMasterFileDto[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
      error;
      try {
      const response = await apiClient.get('/Fs/Process/TimeKeepGroupSetUp/ForImportMasterFile');
      if (response.data) {
        const mappedData = response.data.map((tksGroupList: any) => ({
          id: tksGroupList.id || tksGroupList.ID || '',
          groupCode: tksGroupList.groupCode || tksGroupList.GroupCode || '',
          groupDescription: tksGroupList.groupDescription || tksGroupList.GroupDescription || ''
        }));
        setTKSGroupList(mappedData);
      }
      } catch (error: any) {
          const errorMsg = error.response?.data?.message || error.message || 'Failed to load TKS Group';
          setError(errorMsg);
          console.error('Error fetching TKSGroup:', error);
        } finally {
          loading;
        }
  };

  const handleCodeToggle = (id: number) => {
    setSelectedCodes(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedCodes.length === tksGroupList.length) {
      setSelectedCodes([]);
    } else {
      setSelectedCodes(tksGroupList.map(w => w.id));
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    
    setXlsxFile(file);  
    setFileName(file!.name);    
  };

  // const handleImport = () => {
  //   setIsProcessing(true);
  //   setProcessingProgress(0);
    
  //   // Simulate processing
  //   const interval = setInterval(() => {
  //     setProcessingProgress(prev => {
  //       if (prev >= 100) {
  //         clearInterval(interval);
  //         setIsProcessing(false);
  //         return 100;
  //       }
  //       return prev + 10;
  //     });
  //   }, 500);
  // };
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
  const downloadTemplate = async () => {
     setIsProcessing(true);
     try {
          const response = await apiClient.get(`downloads/DownloadTemplate?filename=ImportTKSMasterFile_Template.xlsx`, {
               responseType: 'blob'
          });
          const mimeType = response.headers['content-type'];
          const blob = new Blob([response.data], { type: mimeType });
          fileLinkCreate(blob, `ImportTKSMasterFile_Template.xlsx`);
     } finally {
          isProcessing;
     }
  }
const onClickImport = async ( ) => {
    if(!xlsxFile) {
      setError("Please select a file to import.");
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please select a file to import.',
      });
      return;
    }
    if(selectedCodes.length === 0){
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please select group.',
      });
      return;
    }
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("isDeleteExistingRecord", String(deleteExisting));
    formData.append("file", xlsxFile, fileName)

    try {
      const data = await apiClient.post<ResponseResultDto<ImportEmployeeMasterFileDto[]>>(`/Utilities/Import/ImportEmployeeMasterfile`, formData)
        setImportDataResult(data.data.resultData);
        if (data.data.errors.length > 0){
          console.log(data.data.errors)
          setImportDataResult([]);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.data.resultData?.[0]?.message ?? data.data.errors,
          });            
          setErrors(data.data.errors);
        }
        else{
          Swal.fire({
            icon: 'success',
            title: 'Done',
            text: 'Import done.',
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } finally {
          setIsProcessing(false);
          setFileLoaded(true);
        }
  }

  const onClickInsertUpdate = async () => {
    const param = {
      isDeleteExistingRecord: deleteExisting,
      imports: importDataResult.filter(x => !x.message) // only valid records
    }
    console.log(param);
    console.log(xlsxFile);
    try {
        const data = await apiClient.post<ResponseResultDto<ImportEmployeeMasterFileDto[]>>(`/Utilities/Import/UpdateImportEmployeeMasterfile`, param)
        setImportDataResult(data.data.resultData);
        if(data.data.errors.length > 0){
            setImportDataResult([]);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: data.data.resultData?.[0]?.message ?? data.data.errors,
            });             
            setErrors(data.data.errors);
        }
        else{
          Swal.fire({
            icon: 'success',
            title: 'Done',
            text: 'Update done.',
            timer: 2000,
            showConfirmButton: false,
          });
        }
    } finally {
        setIsProcessing(false);
    }
  }
  const totalPages = Math.ceil(importDataResult.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = importDataResult.slice(startIndex, startIndex + itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
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
            <h1 className="text-white">Import Employee Masterfile</h1>
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
                    Import employee master data in bulk. Upload Excel files to create or update employee information including personal details, employment status, department assignments, and contact information.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Import complete employee profiles</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Update existing employee records</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Download Excel templates for easy formatting</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Batch process multiple employee records</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
              {/* Left Section - TKS Group (2 columns width) */}
              <TKSGroupTable
                importTKS={importTKS}
                selectedCodes={selectedCodes}
                onToggle={handleCodeToggle}
                onSelectAll={handleSelectAll}
              />

              {/* Right Section - Import Configuration (3 columns width) */}
              <div className="lg:col-span-3 bg-gray-50 rounded-lg border border-gray-200 p-5">
                <h3 className="text-gray-900 mb-4">Import Configuration</h3>

                <div className="space-y-4">
                  {/* File Upload */}
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Excel File</label>
                    <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {xlsxFile! && (<div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>)}
                        <div>
                          <div className="text-sm text-gray-900">{fileName}</div>
                          {xlsxFile! && (<div className="text-xs text-teal-600">File loaded successfully</div>)}
                        </div>
                      </div>
                      <input
                        type="file"
                        ref={fileInput}
                        onChange={handleFileChange}
                        accept=".xlsx,.xls"
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg cursor-pointer hover:bg-teal-600 transition-colors text-sm"
                      >
                        Choose File
                      </label>
                    </div>
                  </div>

                  {/* Date Range */}
                  {/* <div className="grid grid-cols-2 gap-4">
                    <DatePickerWithButton
                      date={dateFrom}
                      onChange={setDateFrom}
                      label="From:"
                    />
                    <DatePickerWithButton
                      date={dateTo}
                      onChange={setDateTo}
                      label="To:"
                    />
                  </div> */}

                  {/* Download Template */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Download className="w-4 h-4 text-blue-600 mt-0.5" onClick={downloadTemplate}/>
                      <a href="#" className="text-sm text-blue-600 hover:text-blue-700" onClick={downloadTemplate}>
                        Download Template
                      </a>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      onClick={onClickImport}                    
                    >
                      <Upload className="w-4 h-4" onClick={onClickImport}/>
                      Import Data
                    </button>
                    <button className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      onClick={onClickInsertUpdate}
                    >
                      <CheckCircle className="w-4 h-4" onClick={onClickInsertUpdate}/>
                      Update Data
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section - Data Table */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 bg-white border-b border-gray-200">
                <h3 className="text-gray-900">Import Data Preview</h3>
              </div>
              <div className="overflow-x-auto bg-white">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Remarks</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">EmpCode</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">EmpStatusActive</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">EmpStatus</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Country</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">LastName</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">FirstName</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">MiddleName</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">NickName</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">HomeAdd</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">PresAdd</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Municipality</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Province</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">PostalCode</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">CivilStatus</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Citizenship</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Religion</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Sex</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Email</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Weight</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Height</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">MobilePhone</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">HomePhone</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">PresPhone</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">BirthPlace</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Branch</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Division</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Department</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Section</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Unit</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Line</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Position</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Superior</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">JobGrade</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">SSS</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">PHIC</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">TIN</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">DateHired</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">DateRegularized</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">DateResigned</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">DateSuspended</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">ProbeStart</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">ProbeEnd</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Birthdate</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">TKSGroup</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">GroupScheduleCode</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">AllowOTDefault</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">TardyExemp</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">UTExempt</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">NDExempt</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">OTExempt</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">AbsenceExempt</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">OtherEarnExempt</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">HolidayExempt</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">UnproductiveExempt</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">DeviceCode</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">FixedRestDay1</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">FixedRestDay2</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">FixedRestDay3</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">DailySchedule</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">ClassificationCode</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">GSISNo</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">OnlineAppCode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(currentData) && currentData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">{item.remarks}</td>                  
                      <td className="px-4 py-2">{item.empCode}</td>
                      <td className="px-4 py-2">{item.statusActive}</td>
                      <td className="px-4 py-2">{item.empStatCode}</td>
                      <td className="px-4 py-2">{item.courtesy}</td>
                      <td className="px-4 py-2">{item.lName}</td>
                      <td className="px-4 py-2">{item.fName}</td>
                      <td className="px-4 py-2">{item.mName}</td>
                      <td className="px-4 py-2">{item.suffix}</td>
                      <td className="px-4 py-2">{item.nickName}</td>
                      <td className="px-4 py-2">{item.hAddress}</td>
                      <td className="px-4 py-2">{item.pAddress}</td>
                      <td className="px-4 py-2">{item.city}</td>
                      <td className="px-4 py-2">{item.province}</td>
                      <td className="px-4 py-2">{item.postalCode}</td>
                      <td className="px-4 py-2">{item.civilStatus}</td>
                      <td className="px-4 py-2">{item.citizenship}</td>
                      <td className="px-4 py-2">{item.religion}</td>
                      <td className="px-4 py-2">{item.sex}</td>
                      <td className="px-4 py-2">{item.email}</td>
                      <td className="px-4 py-2">{item.weight}</td>
                      <td className="px-4 py-2">{item.height}</td>
                      <td className="px-4 py-2">{item.mobilePhone}</td>
                      <td className="px-4 py-2">{item.homePhone}</td>
                      <td className="px-4 py-2">{item.presentPhone}</td>
                      <td className="px-4 py-2">{item.birthPlace}</td>
                      <td className="px-4 py-2">{item.braCode}</td>
                      <td className="px-4 py-2">{item.divCode}</td>
                      <td className="px-4 py-2">{item.depCode}</td>
                      <td className="px-4 py-2">{item.secCode}</td>
                      <td className="px-4 py-2">{item.unitCode}</td>
                      <td className="px-4 py-2">{item.lineCode}</td>
                      <td className="px-4 py-2">{}</td>
                      <td className="px-4 py-2">{item.superior}</td>
                      <td className="px-4 py-2">{item.grdCode}</td>
                      <td className="px-4 py-2">{item.sssNo}</td>
                      <td className="px-4 py-2">{item.philHealthNo}</td>
                      <td className="px-4 py-2">{item.tin}</td>
                      <td className="px-4 py-2">{item.dateHired ? new Date(item.dateHired).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2">{item.dateRegularized ? new Date(item.dateRegularized).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2">{item.dateResigned ? new Date(item.dateResigned).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2">{item.dateSuspended ? new Date(item.dateSuspended).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2">{item.probeStart ? new Date(item.probeStart).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2">{item.probeEnd ? new Date(item.probeEnd).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2">{item.birthDate ? new Date(item.birthDate).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2">{item.tksGroup}</td>
                      <td className="px-4 py-2">{item.groupSchedCode}</td>
                      <td className="px-4 py-2">{item.allowOTDefault}</td>
                      <td className="px-4 py-2">{item.tardyExemp}</td>
                      <td className="px-4 py-2">{item.utExempt}</td>
                      <td className="px-4 py-2">{item.ndExempt}</td>
                      <td className="px-4 py-2">{item.otExempt}</td>
                      <td className="px-4 py-2">{item.absenceExempt}</td>
                      <td className="px-4 py-2">{item.otherEarnExempt}</td>
                      <td className="px-4 py-2">{item.holidayExempt}</td>
                      <td className="px-4 py-2">{item.unproductiveExempt}</td>
                      <td className="px-4 py-2">{item.deviceCode}</td>
                      <td className="px-4 py-2">{item.fixedRestDay1}</td>
                      <td className="px-4 py-2">{item.fixedRestDay2}</td>
                      <td className="px-4 py-2">{item.fixedRestDay3}</td>
                      <td className="px-4 py-2">{item.dailySchedule}</td>
                      <td className="px-4 py-2">{item.classificationCode}</td>
                      <td className="px-4 py-2">{item.gsisNo}</td>
                      <td className="px-4 py-2">{item.onlineAppCode}</td>
                    </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center text-xs text-gray-500 justify-between">
                {!fileLoaded &&(<span>
                  Showing {Math.min(endIndex, importDataResult.length)} of {importDataResult.length} entries
                </span>)}
                {fileLoaded &&(<span>
                  Showing {startIndex + 1} to {Math.min(endIndex, importDataResult.length)} of {importDataResult.length} entries
                </span>)}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {getPageNumbers().map((page, index) => (
                    typeof page === 'number' ? (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(page)}
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
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
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