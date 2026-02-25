import { useState, useEffect, useRef } from 'react';
import { Upload, Download, Check, Eye, CheckCircle } from 'lucide-react';
import { DatePickerWithButton } from '../DateSetup/DatePickerWithButton';
import { Footer } from '../Footer/Footer';
import { TKSGroupTable } from '../TKSGroupTable';
import { tksGroupData } from '../../data/tksGroupData';
import apiClient from '../../services/apiClient';
import { Search, Trash2, X } from 'lucide-react';

export function ImportLogsFromDeviceV2Page() {
  const [empCode, setEmpCode] = useState('');
  const [empName, setEmpName] = useState('');
  const [selectedCodes, setSelectedCodes] = useState<number[]>([2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const [dateFrom, setDateFrom] = useState('3/1/2020');
  const [dateTo, setDateTo] = useState('03/15/2020');
  const [xlsxFile, setXlsxFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
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
  const [filterStatus, setFilterStatus] = useState<'active' | 'inactive' | 'all'>('active');

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchModalTerm, setSearchModalTerm] = useState('');

  const employees = [
    { id: 1, code: '001', name: 'Juan Dela Cruz' },
    { id: 2, code: '002', name: 'Maria Santos' },
    { id: 3, code: '003', name: 'Pedro Reyes' },
    { id: 4, code: '004', name: 'Ana Garcia' },
    { id: 5, code: '005', name: 'Jose Hernandez' },
    { id: 6, code: '006', name: 'Carmen Lopez' },
    { id: 7, code: '007', name: 'Miguel Torres' },
    { id: 8, code: '008', name: 'Isabel Ramirez' },
    { id: 9, code: '009', name: 'Carlos Flores' },
    { id: 10, code: '010', name: 'Rosa Morales' }
  ];

  const filteredEmployees = employees.filter(emp =>
    emp.code.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  );

  const handleEmployeeSelect = (empCodeValue: string, empNameValue: string) => {
    setEmpCode(empCodeValue);
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

  const handleSelectAll = () => {
    if (selectedCodes.length === tksGroupData.length) {
      setSelectedCodes([]);
    } else {
      setSelectedCodes(tksGroupData.map(w => w.id));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileLoaded(true);
    }
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
                    <button className="px-6 py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
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
                         value={searchModalTerm}
                         onChange={(e) => setSearchModalTerm(e.target.value)}
                         className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                       />
                     </div>
     
                     {/* Employee Table */}
                     <div className="border border-gray-200 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                       <table className="w-full border-collapse text-sm">
                         <thead className="sticky top-0 bg-white">
                           <tr className="bg-gray-100 border-b-2 border-gray-300">
                             <th className="px-3 py-1.5 text-left text-gray-700 text-sm">EmpCode ▲</th>
                             <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Name</th>
                             <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Group Code</th>
                           </tr>
                         </thead>
                         <tbody>
                           {filteredEmployees.map((emp, index) => (
                             <tr 
                               key={emp.code}
                               className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                               onClick={() => handleEmployeeSelect(emp.code, emp.name)}
                             >
                               <td className="px-3 py-1.5">{emp.id}</td>
                               <td className="px-3 py-1.5">{emp.name}</td>
                               <td className="px-3 py-1.5">{emp.code}</td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
     
                     {/* Pagination */}
                     <div className="flex items-center justify-between mt-3">
                       <div className="text-gray-600 text-xs">
                         Showing 1 to 10 of 1,658 entries
                       </div>
                       <div className="flex gap-1">
                         <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">
                           Previous
                         </button>
                         <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs">1</button>
                         <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">2</button>
                         <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">3</button>
                         <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">4</button>
                         <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">5</button>
                         <span className="px-1 text-gray-500 text-xs">...</span>
                         <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">166</button>
                         <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">
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