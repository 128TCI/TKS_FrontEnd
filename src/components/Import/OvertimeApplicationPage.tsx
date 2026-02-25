import { useState, useRef, useEffect } from 'react';
import { Upload, Download, Check, FileText, CheckCircle } from 'lucide-react';
import { DatePickerWithButton } from '../DateSetup/DatePickerWithButton';
import { Footer } from '../Footer/Footer';
import { TKSGroupTable } from '../TKSGroupTable';
import apiClient from '../../services/apiClient';
import * as XLSX from "xlsx";
import Swal from 'sweetalert2';

interface ImportOvertimeApplicationDto {
  message: string;
  rowNumber: number
  columnNumber: number
  empCode: string 
  empName: string  
  dateFrom: Date | string | null
  dateTo: Date | string | null
  numOTHoursApproved: number
  earlyOTStartTime: Date | string | null
  earlyTimeIn: Date | string | null
  startOTPM: Date | string | null
  minHRSOTBreak: number
  earlyOTStartTimeRestHol: Date | string | null
  tksGroup: string
  reason: string
  remarks: string
  approvedOTBreaksHrs: number
  stotats: Date | string | null
  isLateFiling: boolean
  isLateFilingProcessed: boolean
  appliedBeforeShiftDate: Date | string | null

}
interface ImportOvertimeApplicationFormDto {
    dateFrom: "",
    dateTo: "",
    isDeleteExistingRecord: false,
    imports: ImportOvertimeApplicationDto[]
}

type ResponseResultDto<T> = {
    isSuccess: boolean,
    resultData: T,
    errors: string[],
    messages: string
}

export function OvertimeApplicationPage() {
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [sheetData, setSheetData] = useState<any[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileLoaded, setFileLoaded] = useState(false);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [deleteExisting, setDeleteExisting] = useState(false);
  const [tksGroupList, setTKSGroupList] = useState<Array<{ id: number; groupCode: string; groupDescription: string;}>>([]);
  const [xlsxFile, setXlsxFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [error, setError] = useState<string | null>(null);
  const [importDataResult, setImportDataResult] = useState<ImportOvertimeApplicationDto[]>([]);
  const [form, setForm] = useState<ImportOvertimeApplicationFormDto>({
    dateFrom: "",
    dateTo: "",
    isDeleteExistingRecord: false,
    imports: [] as ImportOvertimeApplicationDto[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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

  const getDefaultSheetName = (sheetNames: string[]) => {
    return sheetNames.includes("OvertimeApplication")
      ? "OvertimeApplication"
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
          const response = await apiClient.get(`downloads/DownloadTemplate?filename=ImportOTApp_Template.xlsx`, {
               responseType: 'blob'
          });
          const mimeType = response.headers['content-type'];
          const blob = new Blob([response.data], { type: mimeType });
          fileLinkCreate(blob, `ImportOTApp_Template.xlsx`);
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
    if(!dateFrom || !dateTo){
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please select date.',
      });
      return;
    }
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("dateFrom", dateFrom);
    formData.append("dateTo", dateTo);
    formData.append("isDeleteExistingRecord", String(deleteExisting));
    formData.append("file", xlsxFile, fileName)

    try {
      const data = await apiClient.post<ResponseResultDto<ImportOvertimeApplicationDto[]>>(`/Utilities/Import/ImportOvertimeApplication`, formData)
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
      } finally {
          setIsProcessing(false);
          setFileLoaded(true);
        }
  }
  function addOneDay(dateStr: string) {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1); // Add 1 day
    return date.toISOString();
  }
  const onClickInsertUpdate = async () => {
    const param = {
      dateFrom: addOneDay(dateFrom),
      dateTo: addOneDay(dateTo),
      isDeleteExistingRecord: deleteExisting,
      imports: importDataResult.filter(x => !x.message) // only valid records
    }
    console.log(param, dateFrom, dateTo);
    console.log(xlsxFile);
    try {
        const data = await apiClient.post<ResponseResultDto<ImportOvertimeApplicationDto[]>>(`/Utilities/Import/UpdateImportOvertimeApplication`, param)
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
            <h1 className="text-white">Import Overtime Application</h1>
            <p className="text-white opacity-90 text-sm mt-1">Import and manage overtime applications for employees</p>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6">
            {/* Info Section */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-3">
                    Import overtime application records from Excel or CSV files. Select the TKS groups and date range to process overtime applications.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Import from Excel/CSV files</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Filter by date range</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Select TKS groups</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Download template format</span>
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
                  {/* Excel File */}
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
                  <div>
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
                  </div>

                   {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <DatePickerWithButton
                      date={dateFrom}
                      onChange={setDateFrom}
                      label="Date From"
                    />
                    <DatePickerWithButton
                      date={dateTo}
                      onChange={setDateTo}
                      label="Date To"
                    />
                  </div>

                  {/* Delete Existing Warning */}
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        id="delete-existing"
                        checked={deleteExisting}
                        onChange={(e) => setDeleteExisting(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                      />
                      <div>
                        <div className="text-sm text-gray-900">Delete Existing Overtime Application</div>
                        <div className="text-xs text-gray-600 mt-1">Remove all existing overtime records before importing new data</div>
                      </div>
                    </label>
                  </div>

                  {/* List Not Equal Info */}
                  {/* <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        id="list-not-equal"
                        checked={false}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                      />
                      <div>
                        <div className="text-sm text-gray-900">List Not Equal</div>
                        <div className="text-xs text-gray-600 mt-1">Show only records with discrepancies or mismatches</div>
                      </div>
                    </label>
                  </div> */}

                  {/* Need a template */}
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

            {/* Bottom Section - Import Preview */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-gray-900">Import Preview</h3>
                {fileLoaded && (
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs">
                    File loaded
                  </span>
                )}
              </div>
              <div className="overflow-x-auto bg-white">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">EmpCode</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">EmpName</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">DateFrom</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">DateTo</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">NumOTHoursApproved</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">TKSGroup</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Reason</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Remarks</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">OTTimeBeforeShift</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">BreakNumOTHoursApproved</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">StartTimeOfOvertime</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">IsLateFiling</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">ActualDateInOTBeforeShift</th>
                    </tr>
                  </thead>
                  <tbody>
                   {Array.isArray(currentData) && currentData.map((item, index) => (
                    <tr key={index}>                   
                      <td className="px-4 py-2">{item.empCode}</td>
                      <td className="px-4 py-2">{item.empName}</td>
                      <td className="px-4 py-2">{item.dateFrom ? new Date(item.dateFrom).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2">{item.dateTo ? new Date(item.dateTo).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2">{item.numOTHoursApproved}</td>
                      <td className="px-4 py-2">{item.tksGroup}</td>
                      <td className="px-4 py-2">{item.reason}</td>
                      <td className="px-4 py-2">{item.remarks}</td>
                      <td className="px-4 py-2">{item.appliedBeforeShiftDate ? new Date(item.appliedBeforeShiftDate).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2">{item.approvedOTBreaksHrs}</td>
                      <td className="px-4 py-2">{item.earlyOTStartTime ? new Date(item.earlyOTStartTime).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2">{item.isLateFiling}</td>
                      <td className="px-4 py-2">{item.appliedBeforeShiftDate ? new Date(item.appliedBeforeShiftDate).toLocaleDateString() : '-'}</td>
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