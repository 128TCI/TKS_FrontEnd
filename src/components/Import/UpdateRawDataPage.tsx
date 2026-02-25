import { useState, useEffect, useRef } from 'react';
import { Upload, Download, Check, Eye, CheckCircle } from 'lucide-react';
import { DatePickerWithButton } from '../DateSetup/DatePickerWithButton';
import { Footer } from '../Footer/Footer';
import { TKSGroupTable } from '../TKSGroupTable';
import { tksGroupData } from '../../data/tksGroupData';
import apiClient from '../../services/apiClient';
import { Search, Trash2, X, TableOfContents } from 'lucide-react';
import Swal from 'sweetalert2';
import * as XLSX from "xlsx";

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

export function UpdateRawDataPage() {
  const [empCode, setEmpCode] = useState<string[]>([]);
  const [empName, setEmpName] = useState('');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [sheetData, setSheetData] = useState<any[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<number[]>([]);
  const [selectedEmpCodes, setSelectedEmpCodes] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('10/01/2025');
  const [dateTo, setDateTo] = useState('11/16/2025');
  const [xlsxFile, setXlsxFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [enableDeviceCode, setEnableDeviceCode] = useState(true);
  const [doNotIncludeResigned, setDoNotIncludeResigned] = useState(true);
  const [consolidateDTR, setConsolidateDTR] = useState(true);
  const [uploadLogsOnline, setUploadLogsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteExistingLogs, setDeleteExistingLogs] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [device, setDevice] = useState<Array<{ deviceName: string;}>>([]);
  const [importDataResult, setImportDataResult] = useState<ImportLogsFromDeviceDto[]>([]);
  const [getEmployee, setGetEmployee] = useState<Array<{ 
    empID: number; 
    empCode: string; 
    lName: string;
    fName: string;
    mName: string;
    suffix: string;
  }>>([]);
  const [getRawData, setGetRawData] = useState<Array<{ 
    id: number
    empCode: string
    lName: string
    fName: string
    mName: string
    suffix: string
    rawDateIn: string
    workShiftCode: string
    workShiftDesc: string
    dayType: string
    rawTimeIn: string
    rawBreak1In: string
    rawBreak1Out: string
    rawBreak2In: string
    rawBreak2Out: string
    rawBreak3In: string
    rawBreak3Out: string
    rawTimeOut: string
    rawDateOut: string
    rawOTApproved: boolean
    rawRemarks: string
    entryFlag: string
    terminalID: string
    dayTypeDOLE: string
    aprOTTime: string
  }>>([]);
  const [fileName, setFileName] = useState('');
  const [fileLoaded, setFileLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'1' | '0' | ''>('1');
  const [tksGroupList, setTKSGroupList] = useState<Array<{ id: number; groupCode: string; groupDescription: string;}>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchModalTerm, setSearchModalTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredEmployees = getEmployee.filter(emp =>
    emp.empCode?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    emp.lName?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    emp.fName?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    emp.mName?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    emp.suffix?.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  );

  const handleEmployeeSelect = (empCodeValue: string, empNameValue: string) => {
    //setEmpCode(empCodeValue);
    setEmpName(empNameValue);
    setShowSearchModal(false);
    setSearchModalTerm('');
  };

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

  // useEffect(() => {
  //   fetchRawData();
  // }, []);

  const fetchRawData = async () => {
    setEmpCode(selectedEmpCodes);
    setLoading(true);
      error;
      try {
      const response = await apiClient.get(`/Import/LogsFromDevice/GetRawData?rawDateInFrom=${dateFrom}&rawDateInTo=${dateTo}&empCode=${selectedEmpCodes}`);
      if (response.data) {
        const mappedData = response.data.map((rawData: any) => ({
          id: rawData.id || rawData.Id || '',
          empCode: rawData.empCode || rawData.EmpCode || '',
          lName: rawData.lName || rawData.LName || '',
          fName: rawData.fName || rawData.FName || '',
          mName: rawData.mName || rawData.MName || '',
          suffix: rawData.suffix || rawData.Suffix || '',
          rawDateIn: rawData.rawDateIn || rawData.RawDateIn || '',
          workShiftCode: rawData.workShiftCode || rawData.WorkShiftCode || '',
          workShiftDesc: rawData.workShiftDesc || rawData.WorkShiftDesc || '',
          dayType: rawData.dayType || rawData.DayType || '',
          rawTimeIn: rawData.rawTimeIn || rawData.RawTimeIn || '',
          rawBreak1In: rawData.rawBreak1In || rawData.RawBreak1In || '',
          rawBreak1Out: rawData.rawBreak1Out || rawData.RawBreak1Out || '',
          rawBreak2In: rawData.rawBreak2In || rawData.RawBreak2In || '',
          rawBreak2Out: rawData.rawBreak2Out || rawData.RawBreak2Out || '',
          rawBreak3In: rawData.rawBreak3In || rawData.RawBreak3In || '',
          rawBreak3Out: rawData.rawBreak3Out || rawData.RawBreak3Out || '',
          rawTimeOut: rawData.rawTimeOut || rawData.RawTimeOut || '',
          rawDateOut: rawData.rawDateOut || rawData.RawDateOut || '',
          rawOTApproved: rawData.rawOTApproved || rawData.RawOTApproved || '',
          rawRemarks: rawData.rawRemarks || rawData.RawRemarks || '',
          entryFlag: rawData.entryFlag || rawData.EntryFlag || '',
          terminalID: rawData.terminalID || rawData.TerminalID || '',
          dayTypeDOLE: rawData.dayTypeDOLE || rawData.DayTypeDOLE || '',
          aprOTTime: rawData.aprOTTime || rawData.AprOTTime || ''
        }));
        setGetRawData(mappedData);
        console.log(empCode)
        console.log(dateFrom, dateTo)
        console.log(getRawData);
      }
      } catch (error: any) {
          const errorMsg = error.response?.data?.message || error.message || 'Failed to Load Data';
          setError(errorMsg);
          console.error('Error fetching data', error);
        } finally {
          loading;
        }
  };

  useEffect(() => {
      fetchTKSData();
    }, []);
  
    const fetchTKSData = async () => {
      setLoading(true);
        error;
        try {
        const response = await apiClient.get('/Fs/Process/TimeKeepGroupSetUp');
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

  useEffect(() => {
    fetchEmployee();
  }, [filterStatus]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredEmployees.slice(startIndex, endIndex);

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

  const fetchEmployee = async () => {
    setLoading(true);
      error;
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
          setError(errorMsg);
          console.error('Error fetching employees', error);
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

  const handleCodeToggle = (id: number) => {
    setSelectedCodes(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleEmpCodeToggle = (empCode: string) => {
    setSelectedEmpCodes(prev => 
      prev.includes(empCode) ? prev.filter(i => i !== empCode) : [...prev, empCode]
    );
  };

  const handleSelectAll = () => {
    if (selectedCodes.length === tksGroupData.length) {
      setSelectedCodes([]);
    } else {
      setSelectedCodes(tksGroupData.map(w => w.id));
    }
  };
  const onSelectAll = () => {
    if (selectedEmpCodes.length === getEmployee.length) {
      setSelectedEmpCodes([]);
    } else {
      setSelectedEmpCodes(getEmployee.map(w => w.empCode));
    }
  };

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
  useEffect(() => {
    console.log("sheetData updated:", sheetData);
  }, [sheetData]);
  
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
     setIsProcessing(true);
     try {
          const response = await apiClient.get(`downloads/DownloadTemplate?filename=DTR_Excel_Format.xls`, {
               responseType: 'blob'
          });
          const mimeType = response.headers['content-type'];
          const blob = new Blob([response.data], { type: mimeType });
          fileLinkCreate(blob, `DTR_Excel_Format.xls`);
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
              <TKSGroupTable
                selectedCodes={selectedCodes}
                onToggle={handleCodeToggle}
                onSelectAll={handleSelectAll}
              />

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
                      <option></option>
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
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consolidateDTR}
                        onChange={(e) => setConsolidateDTR(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Consolidate DTR</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={doNotIncludeResigned}
                        onChange={(e) => setDoNotIncludeResigned(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Do Not Include Resigned Employees</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={uploadLogsOnline}
                        onChange={(e) => setUploadLogsOnline(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Upload logs from Online System only</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={deleteExistingLogs}
                        onChange={(e) => setDeleteExistingLogs(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Delete Existing Logs of the Device</span>
                    </label>
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
                    <button className="px-6 py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Import
                    </button>
                    {/* <button className="px-6 py-2.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      View Logs
                    </button> */}
                    <button className="px-6 py-2.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
                    onClick={fetchRawData}
                    >
                      <TableOfContents className="w-4 h-4" />
                      View Logs
                    </button>
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
            <div className="mb-6 bg-gray-50 rounded-lg border border-gray-200 p-5">
              <h3 className="text-gray-900 mb-4">Employee Selection</h3>

              {/* Search */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm mb-2">Search:</label>
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={employeeSearchTerm}
                  onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              {/* Search Modal */}
           

              {/* Employee Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs text-gray-600">
                        <input type="checkbox" 
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={selectedEmpCodes.length === getEmployee.length} 
                        onChange={onSelectAll}
                        />
                      </th>
                      <th className="px-4 py-2 text-left text-xs text-gray-600">Code</th>
                      <th className="px-4 py-2 text-left text-xs text-gray-600">Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentData.map((employee) => (
                      <tr key={employee.empID} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          {/* <input type="checkbox" 
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /> */}
                          <input
                            type="checkbox"
                            checked={selectedEmpCodes.includes(employee.empCode)}
                            onChange={() => handleEmpCodeToggle(employee.empCode)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        
                        <td className="px-4 py-2 text-sm text-gray-900">{employee.empCode}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {employee.lName + ', ' + employee.fName + ' ' + employee.mName + ' ' + employee.suffix}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        {!getEmployee &&(<span>
          Showing {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} entries
        </span>)}
        {getEmployee &&(<span>
          Showing {startIndex + 1} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} entries
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

              {/* Filter Status */}
              <div className="mt-4 flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="1"
                    checked={filterStatus === '1'}
                    onChange={(e) => setFilterStatus(e.target.value as '1' | '0' | '')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="0"
                    checked={filterStatus === '0'}
                    onChange={(e) => setFilterStatus(e.target.value as '1' | '0' | '')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">In Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value=""
                    checked={filterStatus === ''}
                    onChange={(e) => setFilterStatus(e.target.value as '1' | '0' | '')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">All</span>
                </label>
              </div>
            </div>

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
                    {Array.isArray(getRawData) && getRawData.map((item, index) => (
                    <tr key={index}>                  
                      <td className="px-4 py-2">{item.empCode}</td>
                      <td className="px-4 py-2">{item.lName}, {item.fName} {item.mName} {item.suffix}</td>
                      <td className="px-4 py-2">{item.rawDateIn ? new Date(item.rawDateIn).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2">{item.rawTimeIn ? new Date(item.rawTimeIn).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2">{item.entryFlag}</td>
                    </tr>
                    ))}
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