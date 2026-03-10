import { useState, useEffect } from "react";
import { Upload, Download, Check, FileText } from "lucide-react";
import { DatePickerWithButton } from "../components/DateSetup/DatePickerWithButton";
import { Footer } from "../components/Footer/Footer";
import { TKSGroupTable } from "../components/TKSGroupTable";
import { tksGroupData } from "../data/tksGroupData";
import * as XLSX from "xlsx";
import apiClient from "../services/apiClient";
import Swal from "sweetalert2";
import { decryptData } from "../services/encryptionService";

interface ImportOvertimeApplication2ShiftsDto {
  id: number;
  empCode: string;
  empName?: string;
  dateFrom?: string | Date | null;
  dateTo?: string | Date | null;
  numOTHoursApproved: number;
  earlyOTStartTime?: string | Date | null;
  earlyTimeIn?: string | Date | null;
  startOTPM?: string | Date | null;
  minHRSOTBreak?: number;
  earlyOTStartTimeRestHol?: string | Date | null;
  reason?: string;
  remarks?: string;
  approvedOTBreaksHrs?: number;
  stotats?: string | Date | null;
  isLateFiling: boolean;
  isLateFilingProcessed: boolean;
  appliedBeforeShiftDate?: string | Date | null;
  tksGroup?: string;
  message?: string;
  rowNumber?: number;
  columnNumber?: number;
}

interface ImportOvertimeApplication2ShiftsFormDto {
  dateFrom?: string | null;
  dateTo?: string | null;
  isDeleteExistingRecord: boolean;
  imports: ImportOvertimeApplication2ShiftsDto[];
}

type ResponseResultDto<T> = {
  isSuccess: boolean;
  resultData: T;
  errors: string[];
  messages: string;
};

export function OvertimeApplication2ShiftsPage() {
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [sheetData, setSheetData] = useState<any[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<number[]>([]);
  const [xlsxFile, setXlsxFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileLoaded, setFileLoaded] = useState(false);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [deleteExisting, setDeleteExisting] = useState(false);
  const [tksGroupList, setTKSGroupList] = useState<
    { id: number; groupCode: string; groupDescription: string }[]
  >([]);
  const [importDataResult, setImportDataResult] = useState<
    ImportOvertimeApplication2ShiftsDto[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [fileInputKey, setFileInputKey] = useState(0);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(importDataResult.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = importDataResult.slice(startIndex, endIndex);
  const [errors, setErrors] = useState<string[]>([]);

  const fetchTKSGroups = async () => {
    try {
      const response = await apiClient.get("/Fs/Process/TimeKeepGroupSetUp"); // endpoint may differ
      if (response.data) {
        const mapped = response.data.map((x: any) => ({
          id: x.id,
          groupCode: x.groupCode,
          groupDescription: x.groupDescription,
        }));
        setTKSGroupList(mapped);
      }
    } catch (err: any) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchTKSGroups();
  }, []);

  const handleCodeToggle = (id: number) => {
    setSelectedCodes((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedCodes.length === tksGroupList.length) {
      setSelectedCodes([]);
    } else {
      setSelectedCodes(tksGroupList.map((w) => w.id));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportDataResult([]);
    setErrors([]);
    setFileLoaded(false);
    setWorkbook(null);
    setSheetData([]);
    setSheetNames([]);
    setSelectedSheet("");
    setFileInputKey((prev) => prev + 1);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;

      const blob = new Blob([data as ArrayBuffer], { type: file.type });
      const memoryFile = new File([blob], file.name, { type: file.type });
      setXlsxFile(memoryFile);

      const wb = XLSX.read(data, { type: "array", cellDates: true });
      const names = wb.SheetNames;
      const defaultSheet = names.includes("OvertimeApplication2Shifts")
        ? "OvertimeApplication2Shifts"
        : names[0];
      const ws = wb.Sheets[defaultSheet];
      const jsonData = XLSX.utils.sheet_to_json(ws, { defval: "" });

      setWorkbook(wb);
      setSheetNames(names);
      setSelectedSheet(defaultSheet);
      setSheetData(jsonData);
      setFileLoaded(true);
    };
    reader.readAsArrayBuffer(file);
  };
  const fileLinkCreate = (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
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
      const response = await apiClient.get(
        `downloads/DownloadTemplate?filename=ImportOTApp_Template.xlsx`,
        {
          responseType: "blob",
        },
      );
      const mimeType = response.headers["content-type"];
      const blob = new Blob([response.data], { type: mimeType });
      fileLinkCreate(blob, `ImportOTApp2Shifts_Template.xlsx`);
    } finally {
      setIsProcessing(false); // ✅ fixed: was just `isProcessing` (no-op)
    }
  };

  const handleSheetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sheetName = e.target.value;
    setSelectedSheet(sheetName);
    if (!workbook) return;

    const ws = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(ws, { defval: "" });
    setSheetData(jsonData);
  };

  const onClickImport = async () => {
    if (!xlsxFile || selectedCodes.length === 0 || !dateFrom || !dateTo) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please select file, TKS group and dates",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("dateFrom", new Date(dateFrom).toISOString());
      formData.append("dateTo", new Date(dateTo).toISOString());
      formData.append("isDeleteExistingRecord", String(deleteExisting));
      formData.append("tksGroupIds", JSON.stringify(selectedCodes));
      formData.append("file", xlsxFile, fileName);

      const res = await apiClient.post<
        ResponseResultDto<ImportOvertimeApplication2ShiftsDto[]>
      >("/Utilities/Import/ImportOTApplication2Shifts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.errors.length > 0) {
        setImportDataResult([]);
        setErrors(res.data.errors);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.data.errors.join(", "),
        });
      } else {
        setImportDataResult(res.data.resultData || []);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "File imported successfully",
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Import Failed",
        text:
          error.response?.data?.errors?.join(", ") ||
          error.message ||
          "Something went wrong",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onClickInsertUpdate = async () => {
    if (!importDataResult.length) {
      Swal.fire({
        icon: "warning",
        title: "No Data",
        text: "There is no imported data to update",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const payload: ImportOvertimeApplication2ShiftsFormDto = {
        dateFrom: new Date(dateFrom).toISOString(),
        dateTo: new Date(dateTo).toISOString(),
        isDeleteExistingRecord: deleteExisting,
        imports: importDataResult.filter((x) => !x.message),
      };

      const res = await apiClient.post<
        ResponseResultDto<ImportOvertimeApplication2ShiftsDto[]>
      >("/Utilities/Import/UpdateOTApplication2Shifts", payload);

      if (res.data.errors.length > 0) {
        setImportDataResult([]);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.data.errors.join(", "),
        });
      } else {
        setImportDataResult(res.data.resultData);
        Swal.fire({
          icon: "success",
          title: "Update Success",
          text: "Overtime applications updated successfully",
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message || "Something went wrong",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">
              Import Overtime Application 2 Shifts In A Day
            </h1>
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
                    Import overtime application records from Excel or CSV files.
                    Select the TKS groups and date range to process overtime
                    applications.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">
                        Import from Excel/CSV files
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">
                        Filter by date range
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">
                        Select TKS groups
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">
                        Download template format
                      </span>
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
                    <label className="block text-gray-700 text-sm mb-2">
                      Excel File
                    </label>
                    <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-gray-900">
                            {fileName}
                          </div>
                          <div className="text-xs text-teal-600">
                            File loaded successfully
                          </div>
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

                  <div>
                    <label className="block text-gray-700 text-sm mb-2">
                      Worksheet:
                    </label>
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
                    <div>
                      <DatePickerWithButton
                        date={dateFrom}
                        onChange={setDateFrom}
                        label="Date From"
                      />
                    </div>
                    <div>
                      <DatePickerWithButton
                        date={dateTo}
                        onChange={setDateTo}
                        label="Date To"
                      />
                    </div>
                  </div>

                  {/* Delete Existing Warning */}
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        id="delete-existing"
                        checked={deleteExisting}
                        onChange={(e) => {
                          setDeleteExisting(e.target.checked);
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                      />
                      <div>
                        <div className="text-sm text-gray-900">
                          Delete Existing Overtime Application
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Remove all existing overtime records before importing
                          new data
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* List Not Equal Info
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
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
                      <Download
                        className="w-4 h-4 text-blue-600 mt-0.5 cursor-pointer"
                        onClick={downloadTemplate}
                      />
                      <a
                        href="#"
                        className="text-sm text-blue-600 hover:text-blue-700"
                        onClick={(e) => {
                          e.preventDefault();
                          downloadTemplate();
                        }}
                      >
                        Download Template
                      </a>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      onClick={onClickImport}
                    >
                      <Upload className="w-4 h-4" />
                      Import Data
                    </button>
                    <button
                      className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      onClick={onClickInsertUpdate}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
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
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  Ready to import
                </span>
              </div>
              <div className="overflow-x-auto bg-white">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">
                        EmpCode
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">
                        EmpName
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">
                        DateFrom
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">
                        DateTo
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">
                        NumOTHoursApproved
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">
                        TKSGroup
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">
                        Reason
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">
                        Remarks
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">
                        OTTimeBeforeShift
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">
                        BreakNumOTHoursApproved
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">
                        StartTimeOfOvertime
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">
                        Is Late Filing
                      </th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="px-4 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <FileText className="w-16 h-16 text-gray-300" />
                            <div>
                              <div className="text-gray-900">
                                No data available
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                Upload and select a file to preview import data
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentData.map((item, idx) => (
                        <tr
                          key={idx}
                          className={`border-b border-gray-200 ${item.message ? "bg-red-50" : ""}`}
                        >
                          <td className="px-4 py-2 text-sm">{item.empCode}</td>
                          <td className="px-4 py-2 text-sm">
                            {decryptData(item.empName ?? "")}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {item.dateFrom
                              ? new Date(item.dateFrom).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {item.dateTo
                              ? new Date(item.dateTo).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {item.numOTHoursApproved}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {item.tksGroup || "-"}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {item.reason || "-"}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {item.remarks || "-"}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {item.appliedBeforeShiftDate
                              ? new Date(
                                  item.appliedBeforeShiftDate,
                                ).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {item.approvedOTBreaksHrs || "-"}
                          </td>
                          <td className="px-4 py-2 text-time">
                            {item.earlyOTStartTime
                              ? new Date(
                                  item.earlyOTStartTime,
                                ).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {item.isLateFiling ? "Yes" : "No"}
                          </td>
                          <td className="px-4 py-2 text-sm text-red-500">
                            {item.message || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-6 h-6 flex items-center justify-center rounded text-xs ${
                        currentPage === p
                          ? "bg-blue-500 text-white"
                          : "border border-gray-300 bg-white hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs"
                >
                  ›
                </button>
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
