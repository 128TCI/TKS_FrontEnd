import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Upload, Calendar, Search, Download, FileText, Check, CheckCircle } from 'lucide-react';
import { DatePickerWithButton } from '../DateSetup/DatePickerWithButton';
import { Footer } from '../Footer/Footer';
import { TKSGroupTable} from '../TKSGroupTable';
import apiClient from '../../services/apiClient';
import Swal from 'sweetalert2';
import * as XLSX from "xlsx";

interface ImportWorkshiftRestdayDto {
    message: string;
    rowNumber: number
    columnNumber: number
    empCode: string
    employeeName: string;
    dateFrom: Date | string | null
    dateTo: Date | string | null
    workshiftCode: string
    restDay: string;
}
interface ImportWorkshiftRestdayFormDto {
    dateFrom: "",
    dateTo: "",
    isDeleteExistingRecord: false,
    imports: ImportWorkshiftRestdayDto[]
}
type ResponseResultDto<T> = {
    isSuccess: boolean,
    resultData: T,
    errors: string[],
    messages: string
}

export function WorkshiftVariablePage() {
  const [selectedCodes, setSelectedCodes] = useState<number[]>([]);
  const [fileName, setFileName] = useState('');
  const [fileLoaded, setFileLoaded] = useState(false);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [deleteExisting, setDeleteExisting] = useState(false);
  const [importType, setImportType] = useState('workshift-variable');
  const [tksGroupList, setTKSGroupList] = useState<Array<{ id: number; groupCode: string; groupDescription: string;}>>([]);
  const [xlsxFile, setXlsxFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [error, setError] = useState<string | null>(null);
  const [importDataResult, setImportDataResult] = useState<ImportWorkshiftRestdayDto[]>([]);
  
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    if (!file) return;

    setXlsxFile(file);  
    setFileName(file!.name);
  };

  const [isProcessing, setIsProcessing] = useState(false);
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
          const response = await apiClient.get(`downloads/DownloadTemplate?filename=ImportWorkShift_Template_Variable.xlsx`, {
               responseType: 'blob'
          });
          const mimeType = response.headers['content-type'];
          const blob = new Blob([response.data], { type: mimeType });
          fileLinkCreate(blob, `ImportWorkShift_Template_Variable.xlsx`);
     } finally {
          isProcessing;
     }
  }
  const downloadRDTemplate = async () => {
     setIsProcessing(true);
     try {
          const response = await apiClient.get(`downloads/DownloadTemplate?filename=ImportWorkshiftWithRestDay_Template.xlsx`, {
               responseType: 'blob'
          });
          const mimeType = response.headers['content-type'];
          const blob = new Blob([response.data], { type: mimeType });
          fileLinkCreate(blob, `ImportWorkshiftWithRestDay_Template.xlsx`);
     } finally {
          setIsProcessing(false);
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
    //setForm(dateFrom, dateTo, selectedCodes, );
    //setError("");
    //setIsProcessing(true);
    // setForm(prev => ({
    //   ...prev,
    //   groupCode: selectedCodes.map(code => ({
    //   groupCode: code,
    //   })),
    // }));

    const formData = new FormData();
    formData.append("dateFrom", dateFrom);
    formData.append("dateTo", dateTo);
    //formData.append("groupCode", JSON.stringify(form.groupCode));
    //formData.append("isDeleteExistingRecord", form.isDeleteExistingRecord.toString());
    formData.append("isDeleteExistingRecord", String(deleteExisting));
    formData.append("file", xlsxFile, fileName)

    console.log(dateFrom, dateTo)

    if(importType == "workshift-variable"){
      try {
        const data = await apiClient.post<ResponseResultDto<ImportWorkshiftRestdayDto[]>>(`/Utilities/Import/ImportWorkshiftVariable`, formData)
        //importDataResult.value = data.resultData || [];
        setImportDataResult(data.data.resultData);
        if (data.data.errors.length > 0){
            //errors.value = data.errors;
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
    else if(importType == "workshift-restday"){
    try {
        const data = await apiClient.post<ResponseResultDto<ImportWorkshiftRestdayDto[]>>(`/Utilities/ImportRestDay/ImportRestDay`, formData)
        setImportDataResult(data.data.resultData);
        if(data.data.errors.length > 0){
            setImportDataResult([]);
            await Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: data.data.resultData[0].message,
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
          //setIsProcessing(false);
          setFileLoaded(true);
        }

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
    try {
        const data = await apiClient.post<ResponseResultDto<ImportWorkshiftRestdayDto[]>>(`/Utilities/ImportRestDay/UpdateWorkshiftRestDay`, param)
        setImportDataResult(data.data.resultData);
        if(data.data.errors.length > 0){
            setImportDataResult([]);
            await Swal.fire({
              icon: 'error',
              title: 'Error',
              text: data.data.messages,
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
  console.log(importType);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Import Workshift Variable</h1>
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
                    Batch import workshift schedules and rest day assignments for employees. Upload Excel files to configure work schedules across multiple employee groups efficiently.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Import workshift schedules by date range</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Configure rest days for employee groups</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Download Excel templates for easy formatting</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Update existing records or import new data</span>
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

                  {/* Import Type */}
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Import Type</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 bg-white border-2 border-blue-500 rounded-lg cursor-pointer">
                        <input
                          type="radio"
                          name="importType"
                          value="workshift-variable"
                          checked={importType === 'workshift-variable'}
                          onChange={(e) => setImportType(e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Workshift Variable</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="importType"
                          value="workshift-restday"
                          checked={importType === 'workshift-restday'}
                          onChange={(e) => setImportType(e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Workshift with Restday</span>
                      </label>
                    </div>
                  </div>

                  {/* Download Templates */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <Download className="w-4 h-4 text-blue-600 mt-0.5" />
                      <span className="text-sm text-gray-700">Download Templates:</span>
                    </div>
                    <div className="ml-6 space-y-1">
                      <a href="#" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                        onClick={downloadTemplate}
                      >
                        <Download className="w-3 h-3" onClick={downloadTemplate}/>
                        Download Template (Workshift Variable)
                      </a>
                      <a href="#" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                        onClick={downloadRDTemplate}
                      >
                        <Download className="w-3 h-3" onClick={downloadRDTemplate}/>
                        Download Template (Workshift w/ Rest Day)
                      </a>
                    </div>
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
                        <div className="text-sm text-gray-900">Delete Existing Workshift and RestDay</div>
                        <div className="text-xs text-gray-600 mt-1">Remove all existing workshift and rest day records before importing new data</div>
                      </div>
                    </label>
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
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Workshift</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">TKSGroup</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(currentData) && currentData.map((item, index) => (
                    <tr key={index}>                   
                      <td className="px-4 py-2">{item.empCode}</td>
                      <td className="px-4 py-2">{item.employeeName}</td>
                      <td className="px-4 py-2">{item.dateFrom ? new Date(item.dateFrom).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2">{item.dateTo ? new Date(item.dateTo).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2">{item.workshiftCode}</td>
                      <td className="px-4 py-2">{selectedCodes}</td>
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