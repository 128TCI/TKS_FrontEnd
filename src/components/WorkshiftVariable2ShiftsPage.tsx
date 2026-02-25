import { useState } from 'react';
import { ChevronDown, Upload, Calendar, Search, Download, FileText, Check } from 'lucide-react';
import { DatePickerWithButton } from './DateSetup/DatePickerWithButton';
import { Footer } from './Footer/Footer';
import { TKSGroupTable } from './TKSGroupTable';
import { tksGroupData } from '../data/tksGroupData';

export function WorkshiftVariable2ShiftsPage() {
  const [selectedCodes, setSelectedCodes] = useState<number[]>([2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const [fileName, setFileName] = useState('Copy of I - Workshift.xlsx');
  const [fileLoaded, setFileLoaded] = useState(true);
  const [dateFrom, setDateFrom] = useState('3/1/2020');
  const [dateTo, setDateTo] = useState('03/15/2020');
  const [deleteExisting, setDeleteExisting] = useState(false);
  const [importType, setImportType] = useState('workshift-variable');

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
            <h1 className="text-white">Import Workshift Variable 2 Shifts In A Day</h1>
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
                        <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-gray-900">{fileName}</div>
                          <div className="text-xs text-teal-600">File loaded successfully</div>
                        </div>
                      </div>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".xlsx,.xls"
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg cursor-pointer hover:bg-teal-600 transition-colors text-sm"
                      >
                        Change File
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
                      <a href="#" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                        <Download className="w-3 h-3" />
                        Download Template (Workshift Variable)
                      </a>
                      <a href="#" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                        <Download className="w-3 h-3" />
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
                    <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Import Data
                    </button>
                    <button className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
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
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <FileText className="w-16 h-16 text-gray-300" />
                          <div>
                            <div className="text-gray-900">No data available</div>
                            <div className="text-sm text-gray-500 mt-1">Select a worksheet to preview import data</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500">Showing 0 entries</span>
                <div className="flex items-center gap-1">
                  <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs">‹</button>
                  <button className="w-6 h-6 flex items-center justify-center rounded bg-blue-500 text-white text-xs">1</button>
                  <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs">›</button>
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