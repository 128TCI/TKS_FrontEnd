import { useState, useEffect, useRef } from 'react';
import { Upload, Download, Check, Eye, CheckCircle } from 'lucide-react';
import { DatePickerWithButton } from '../DateSetup/DatePickerWithButton';
import { Footer } from '../Footer/Footer';
import { TKSGroupTable } from '../TKSGroupTable';
import { tksGroupData } from '../../data/tksGroupData';
import apiClient from '../../services/apiClient';
import { Search, Trash2, X } from 'lucide-react';
import * as XLSX from "xlsx";
import Swal from 'sweetalert2';

interface ImportLogsFromDeviceDto {
  message: string;
  rowNumber: number
  columnNumber: number
  empCode: string
    //empName: string;
  rawDateIn: Date | string 
  workShiftCode: string
  dayType: string
  rawTimeIn: Date | string
  rawBreak1In: Date | string
  rawBreak1Out: Date | string
  rawBreak2In: Date | string
  rawBreak2Out: Date | string
  rawBreak3In: Date | string
  rawBreak3Out: Date | string
  rawTimeOut: Date | string
  rawDateOut: Date | string
  rawOTApproved: boolean
  id: number
  terminalID: string
}

type ResponseResultDto<T> = {
    isSuccess: boolean,
    resultData: T,
    errors: string[],
    messages: string
}


export function ImportLogsFromDeviceV2Page() {
  const [empCode, setEmpCode] = useState('');
  const [empName, setEmpName] = useState('');
  const [empID, setEmpID] = useState<number>();
  //const [selectedCodes, setSelectedCodes] = useState<number[]>([2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const [dateFrom, setDateFrom] = useState('3/1/2020');
  const [dateTo, setDateTo] = useState('03/15/2020');
  const [xlsxFile, setXlsxFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [sheetData, setSheetData] = useState<any[]>([]);
  //const [consolidateDTR, setConsolidateDTR] = useState(false);
  const [enableDeviceCode, setEnableDeviceCode] = useState(false);
  const [doNotIncludeResigned, setDoNotIncludeResigned] = useState(false);
  //const [uploadLogsOnline, setUploadLogsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteExistingLogs, setDeleteExistingLogs] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState('B3-TFT-U_DATFILE');
  const [device, setDevice] = useState<Array<{ deviceName: string;}>>([]);
  const [fileName, setFileName] = useState('');
  const [fileLoaded, setFileLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'1' | '0' | ''>('');
  const [currentEmpPage, setCurrentEmpPage] = useState(1);
  const itemsPerPage = 10;
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchModalTerm, setSearchModalTerm] = useState('');
  const [importDataResult, setImportDataResult] = useState<ImportLogsFromDeviceDto[]>([]);
  const [getEmployee, setGetEmployee] = useState<Array<{ 
      empID: number; 
      empCode: string; 
      lName: string;
      fName: string;
      mName: string;
      suffix: string;
    }>>([]);

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

  const filteredEmployees = getEmployee.filter(emp =>
    emp.empCode?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    emp.lName?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    emp.fName?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    emp.mName?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    emp.suffix?.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  );

  const handleEmployeeSelect = (empIDValue: number, empCodeValue: string, empNameValue: string) => {
    setEmpID(empIDValue);
    setEmpCode(empCodeValue);
    setEmpName(empNameValue);
    setShowSearchModal(false);
    setSearchModalTerm('');
  };

  console.log(empID);
   useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
      error;
      try {
      const response = await apiClient.get('/Fs/Process/Device/DeviceTypeSetUp');
      if (response.data) {
        const mappedData = response.data.map((device: any) => ({
          deviceName: device.deviceName || device.DeviceName || ''
        }));
        setDevice(mappedData);
      }
      } catch (error: any) {
          const errorMsg = error.response?.data?.message || error.message || 'Failed to Devices';
          setError(errorMsg);
          console.error('Error fetching Devices', error);
        } finally {
          loading;
        }
  };

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showSearchModal) {
          setShowSearchModal(false);
        } 
      }
    };

    if (showSearchModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showSearchModal]);

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     setFileName(file.name);
  //     setFileLoaded(true);
  //   }
  // };
  const getDefaultSheetName = (sheetNames: string[]) => {
    return sheetNames.includes("EXCELDTR")
      ? "EXCELDTR"
      : sheetNames[0];
    };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      if (!file) return;
    
      setXlsxFile(file);
      setFileName(file.name);
    
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result;
        if (!data) return;
    
        const workbook = XLSX.read(data, { type: "array", cellDates: true});
    
        const sheetNames = workbook.SheetNames;
        const defaultSheet = getDefaultSheetName(sheetNames);
    
        const worksheet = workbook.Sheets[defaultSheet];
        const sheetData = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
        });
    
        setWorkbook(workbook);
        setSheetNames(workbook.SheetNames);
        setSelectedSheet(defaultSheet);
        setSheetData(sheetData);
    
        console.log("Sheets:", workbook.SheetNames);
        console.log(sheetData);
      };
    
        reader.readAsArrayBuffer(file);
    };
    const handleSheetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const sheetName = e.target.value;
      setSelectedSheet(sheetName);
    
      if (!workbook) return;
    
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, {
        defval: "", // prevent undefined cells
      });
    
        setSheetData(data);
        //console.log(data);
        //setForm(data);
    };
  const createXlsxFileFromSheetData = (
    sheetData: any[],
    sheetName: string
  ): File => {
    const worksheet = XLSX.utils.json_to_sheet(sheetData);
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
  
  return new File([buffer], `${sheetName}.xlsx`, {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  };
  useEffect(() => {
    if (!sheetData.length || !selectedSheet) return;
  
    const file = createXlsxFileFromSheetData(sheetData, selectedSheet);
    setXlsxFile(file);
  }, [sheetData, selectedSheet]);
  
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
     //setIsProcessing(true);
     try {
          const response = await apiClient.get(`downloads/DownloadTemplate?filename=DTR_Excel_Format.xls`, {
               responseType: 'blob'
          });
          const mimeType = response.headers['content-type'];
          const blob = new Blob([response.data], { type: mimeType });
          fileLinkCreate(blob, `DTR_Excel_Format.xls`);
     } finally {
          //isProcessing;
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
    if(!dateFrom || !dateTo){
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please select date.',
      });
      return;
    }
    //setIsProcessing(true);
    const formData = new FormData();
    formData.append("dateFrom", dateFrom);
    formData.append("dateTo", dateTo);
    //formData.append("isDeleteExistingRecord", String(deleteExisting));
    //formData.append("listNotEqual", String(listNotEqual));
    formData.append("file", xlsxFile, fileName)
    console.log(xlsxFile);
    try {
      const data = await apiClient.post<ResponseResultDto<ImportLogsFromDeviceDto[]>>(`/Import/LogsFromDevice/ImportLogsFromDevice`, formData)
        setImportDataResult(data.data.resultData);
        if (data.data.errors.length > 0){
          console.log(data.data.errors)
          setImportDataResult([]);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.data.resultData?.[0]?.message ?? data.data.errors,
          });            
          //setErrors(data.data.errors);
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
          //setIsProcessing(false);
          setFileLoaded(true);
        }
  }

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Import Logs From Device</h1>
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
                    Import employee attendance logs directly from biometric devices. Upload device log files to batch process time-in and time-out records for multiple employees.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Import device logs by date range</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Consolidate daily time records automatically</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">View and validate logs before processing</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Filter by device and employee status</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
              {/* Left Section - TKS Group (2 columns width) */}
              {/* <TKSGroupTable
                selectedCodes={selectedCodes}
                onToggle={handleCodeToggle}
                onSelectAll={handleSelectAll}
              /> */}

              {/* Right Section - Import Configuration (3 columns width) */}
              <div className="lg:col-span-3 bg-gray-50 rounded-lg border border-gray-200 p-5">
                <h3 className="text-gray-900 mb-4">Import Configuration</h3>

                <div className="space-y-4">
                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
                  {/* Device Selection */}
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Device:</label>
                    <select
                      value={selectedDevice}
                      onChange={(e) => setSelectedDevice(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {device.map(device => (
                        <option
                          key={device.deviceName}
                          value={device.deviceName}
                        >
                          {device.deviceName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-2 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableDeviceCode}
                        onChange={(e) => setEnableDeviceCode(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Enable Device Code</span>
                    </label>
                  </div>
                  {selectedDevice === "Excel Format" && (<div>
                    <label className="block text-gray-700 text-sm mb-2">Worksheet:</label>
                    <select
                      value={selectedSheet}
                      onChange={handleSheetChange}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    > 
                      {sheetNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>)}
                  {selectedDevice === "Excel Format" && (<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Download className="w-4 h-4 text-blue-600 mt-0.5" onClick={downloadTemplate}/>
                      <a href="#" className="text-sm text-blue-600 hover:text-blue-700" onClick={downloadTemplate}>
                        Download Template
                      </a>
                    </div>
                  </div>)}
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">File Name:</label>
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
                  <div className="grid grid-cols-2 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={doNotIncludeResigned}
                        onChange={(e) => setDoNotIncludeResigned(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Do Not Include Resigned Employees</span>
                    </label>
                    <div className="flex items-center gap-3">
                      {/* <label className="text-gray-700 font-bold w-24">EmpCode</label> */}
                        <input
                          type="text"
                          value={empName}
                          onChange={(e) => setEmpCode(e.target.value)}
                          className="w-36 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly
                        />
                        <button 
                          onClick={() => setShowSearchModal(true)}
                          className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                        <button 
                          //onClick={handleDelete}
                          onClick={() => {setEmpCode(""), setEmpName("")}}
                          className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                  </div>            

                  {/* File Upload
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">File Name:</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".dat,.txt"
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="px-4 py-2 bg-gray-600 text-white rounded cursor-pointer hover:bg-gray-700 transition-colors text-sm"
                      >
                        Choose Files
                      </label>
                      <span className="text-sm text-gray-600">
                        {fileName || 'No file chosen'}
                      </span>
                    </div>
                  </div> */}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button className="px-6 py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                      onClick={onClickImport}
                    >
                      <Upload className="w-4 h-4" onClick={onClickImport}/>
                      Import
                    </button>
                    {/* <button className="px-6 py-2.5 bg-purple-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      View Logs
                    </button> */}
                    <button className="px-6 py-2.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Validate
                    </button>
                    <button className="px-6 py-2.5 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors flex items-center gap-2">
                      <CheckCircle className="w-4 h-4"/>
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Employee List Section */}
            {showSearchModal && (<div className="mb-6 bg-gray-50 rounded-lg border border-gray-200 p-5">
              {/* Search Modal */}
           
             <>
               {/* Modal Backdrop */}
               <div 
                 className="fixed inset-0 bg-black/30 z-30"
                 onClick={() => setShowSearchModal(false)}
               ></div>
     
               {/* Modal Dialog */}
               <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                 <div className="bg-white rounded-lg shadow-2xl border border-gray-300">
                   {/* Modal Header */}
                   <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                     <h2 className="text-gray-800 text-sm">Search</h2>
                     <button 
                       onClick={() => setShowSearchModal(false)}
                       className="text-gray-600 hover:text-gray-800"
                     >
                       <X className="w-4 h-4" />
                     </button>
                   </div>
     
                   {/* Modal Content */}
                   <div className="p-3">
                     <h3 className="text-blue-600 mb-2 text-sm">Select Employee</h3>
     
                     {/* Search Input */}
                     <div className="flex items-center gap-2 mb-3">
                       <label className="text-gray-700 text-sm">Search:</label>
                       <input
                         type="text"
                         value={employeeSearchTerm}
                         onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                         className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                       />
                     </div>
     
                     {/* Employee Table */}
                     <div className="border border-gray-200 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                       <table className="w-full border-collapse text-sm">
                         <thead className="sticky top-0 bg-white">
                           <tr className="bg-gray-100 border-b-2 border-gray-300">
                             {/* <th className="px-3 py-1.5 text-left text-gray-700 text-sm">EmpCode ▲</th> */}
                             <th className="px-3 py-1.5 text-left text-gray-700 text-sm">EmpCode</th>
                             <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Name</th>
                           </tr>
                         </thead>
                         <tbody>
                           {filteredEmployees.map((emp, index) => (
                             <tr 
                               key={emp.empCode}
                               className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                               onClick={() => handleEmployeeSelect(emp.empID, emp.empCode, emp.lName + ", " + emp.fName + " " + emp.mName)}
                             >
                               <td className="px-3 py-1.5">{emp.empCode}</td>
                               <td className="px-3 py-1.5">{emp.lName}, {emp.fName} {emp.mName}</td>
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
               </div>
             </>
           
          </div>)}

            {/* Bottom Section - Log Preview Table */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 bg-white border-b border-gray-200">
                <h3 className="text-gray-900">Import Preview</h3>
              </div>
              <div className="overflow-x-auto bg-white">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Employee Code</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Name</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Date In</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Time In</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Actual Date/Time In</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Date Out</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Time Out</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Flag</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Break1Out</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Break1In</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Break2Out</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Break3Out</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Break3In</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Workshift</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={14} className="px-4 py-12 text-center text-gray-500 text-sm">
                        No data available in table
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500">Showing 0 entries</span>
                <div className="flex items-center gap-1">
                  <button className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs">Previous</button>
                  <button className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs">Next</button>
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