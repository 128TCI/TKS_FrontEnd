import { X, Search, Calendar, Clock, Check, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CalendarPopup } from '../CalendarPopup';
import { TimePicker } from '../Modals/TimePickerModal';
interface LeaveTypeSearchModalProps {
  show: boolean;
  onClose: () => void;
  onSelect: (code: string, description: string) => void; 
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export function LeaveTypeSearchModal({
  show,
  onClose,
  onSelect,
  searchTerm,
  setSearchTerm
}: LeaveTypeSearchModalProps) {
  if (!show) return null;

  // Sample leave type data
  const leaveTypeData = [
    { code: 'BL', description: 'Birthday Leave' },
    { code: 'HL', description: 'Home Leave' },
    { code: 'PL', description: 'Paternity Leave' },
    { code: 'SL', description: 'Sick Leave' },
    { code: 'SPL', description: 'Solo Parent Leave' },
    { code: 'VL', description: 'Vacation Leave' },
    { code: 'WN', description: 'Leave with notice' },
  ];

  const filteredLeaveTypes = leaveTypeData.filter(lt =>
    lt.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lt.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-30"
        onClick={onClose}
      ></div>

      {/* Modal Dialog */}
      <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[110vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0">
            <h2 className="text-gray-800 text-sm">Search</h2>
            <button 
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-3">
            <h3 className="text-blue-600 mb-2 text-sm">Leave Type</h3>

            {/* Search Input */}
            <div className="flex items-center justify-end gap-2 mb-3">
              <label className="text-gray-700 text-sm">Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Leave Type Table */}
            <div className="border border-gray-200 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="w-full border-collapse text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Code ▲</th>
                    <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Description ▲</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaveTypes.map((lt) => (
                    <tr 
                      key={lt.code}
                      className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                      onClick={() => {
                        onSelect(lt.code, lt.description);
                        onClose();
                      }}
                    >
                      <td className="px-3 py-1.5">{lt.code}</td>
                      <td className="px-3 py-1.5">{lt.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-3">
              <div className="text-gray-600 text-xs">
                Showing 1 to 7 of 7 entries
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
  );
}

// Workshift Search Modal Component
interface WorkshiftSearchModalProps {
  show: boolean;
  onClose: () => void;
  onSelect: (code: string, description: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export function WorkshiftSearchModal({
  show,
  onClose,
  onSelect,
  searchTerm,
  setSearchTerm
}: WorkshiftSearchModalProps) {
  if (!show) return null;

  // Sample workshift data
  const workshiftData = [
    { code: 'WS001', description: 'Regular Shift' },
    { code: 'WS002', description: 'Night Shift' },
    { code: 'WS003', description: 'Swing Shift' },
    { code: 'WS004', description: 'Morning Shift' },
    { code: 'WS005', description: 'Evening Shift' },
  ];

  const filteredWorkshifts = workshiftData.filter(ws =>
    ws.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ws.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-30"
        onClick={onClose}
      ></div>

      {/* Modal Dialog */}
      <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[110vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0">
            <h2 className="text-gray-800 text-sm">Search</h2>
            <button 
              onClick={onClose}
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Workshift Table */}
            <div className="border border-gray-200 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="w-full border-collapse text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Code ▲</th>
                    <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkshifts.map((ws) => (
                    <tr 
                      key={ws.code}
                      className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                      onClick={() => {
                        onSelect(ws.code, ws.description);
                        onClose();
                      }}
                    >
                      <td className="px-3 py-1.5">{ws.code}</td>
                      <td className="px-3 py-1.5">{ws.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// OT Code Search Modal Component
interface OTCodeSearchModalProps {
  show: boolean;
  onClose: () => void;
  onSelect: (code: string, description: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export function OTCodeSearchModal({
  show,
  onClose,
  onSelect,
  searchTerm,
  setSearchTerm
}: OTCodeSearchModalProps) {
  if (!show) return null;

  // Sample OT code data
  const otCodeData = [
    { code: 'ADJ_PAY', description: 'Adjustment', rate: '100.00', defaultAmount: '0.00' },
    { code: 'ATESTOT1', description: 'TEST OT 11', rate: '123.00', defaultAmount: '0.00' },
    { code: 'BASC_RATE', description: 'Basic Rate', rate: '100.00', defaultAmount: '0.00' },
    { code: 'HOLIDAY', description: 'Unworked Holiday Pay', rate: '100.00', defaultAmount: '0.00' },
    { code: 'HOLMON', description: 'Holiday Monthly', rate: '0.00', defaultAmount: '0.00' },
    { code: 'ND_BASIC', description: 'Night Differential Basic Rate', rate: '10.00', defaultAmount: '0.00' },
    { code: 'ND_LHF8', description: 'ND Legal Holiday First 8 Hours', rate: '20.00', defaultAmount: '0.00' },
    { code: 'ND_LHRDF8', description: 'ND Legal Holiday falls on Rest Day First 8 Hours', rate: '26.00', defaultAmount: '0.00' },
    { code: 'ND_LHRDX8', description: 'ND Legal Holiday falls on Rest Day Excess of 8 Hours', rate: '33.80', defaultAmount: '0.00' },
    { code: 'ND_LHX8', description: 'ND Legal Holiday Excess of 8 Hours', rate: '26.00', defaultAmount: '0.00' },
  ];

  const filteredOTCodes = otCodeData.filter(ot =>
    ot.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ot.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-30"
        onClick={onClose}
      ></div>

      {/* Modal Dialog */}
      <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[110vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0">
            <h2 className="text-gray-800 text-sm">Search</h2>
            <button 
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-3">
            <h3 className="text-blue-600 mb-2 text-sm">Overtime Code</h3>

            {/* Search Input */}
            <div className="flex items-center justify-end gap-2 mb-3">
              <label className="text-gray-700 text-sm">Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* OT Code Table */}
            <div className="border border-gray-200 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="w-full border-collapse text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Code ▲</th>
                    <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Description</th>
                    <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Rate ▲</th>
                    <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Default Amount ▲</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOTCodes.map((ot) => (
                    <tr 
                      key={ot.code}
                      className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                      onClick={() => {
                        onSelect(ot.code, ot.description);
                        onClose();
                      }}
                    >
                      <td className="px-3 py-1.5">{ot.code}</td>
                      <td className="px-3 py-1.5">{ot.description}</td>
                      <td className="px-3 py-1.5">{ot.rate}</td>
                      <td className="px-3 py-1.5">{ot.defaultAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-3">
              <div className="text-gray-600 text-xs">
                Showing 1 to 10 of 68 entries
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
                <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">6</button>
                <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">7</button>
                <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface AdvancedModalProps {
  show: boolean;
  onClose: () => void;
  isEditMode: boolean;
  empCode: string;
  setEmpCode: (value: string) => void;
  transactionDate: string;
  setTransactionDate: (value: string) => void;
  transactionType: string;
  setTransactionType: (value: string) => void;
  noOfHours: string;
  setNoOfHours: (value: string) => void;
  overtimeCode: string;
  setOvertimeCode: (value: string) => void;
  onSubmit: () => void;
}

export function AdvancedModal({
  show,
  onClose,
  isEditMode,
  empCode,
  setEmpCode,
  transactionDate,
  setTransactionDate,
  transactionType,
  setTransactionType,
  noOfHours,
  setNoOfHours,
  overtimeCode,
  setOvertimeCode,
  onSubmit
}: AdvancedModalProps) {
  if (!show) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-10"
        onClick={onClose}
      ></div>

      {/* Modal Dialog */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <h2 className="text-gray-800">{isEditMode ? 'Edit Record' : 'Create New'}</h2>
            <button 
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4">
            <h3 className="text-blue-600 mb-3">Overtime</h3>
            
            {/* Form Fields */}
            <div className="space-y-3">
              {/* Employee Code */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">EmpCode :</label>
                <input
                  type="text"
                  value={empCode}
                  onChange={(e) => setEmpCode(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Transaction Date */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Transaction Date :</label>
                <input
                  type="text"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Transaction Type */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Transaction Type :</label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value=""></option>
                  <option value="Tardiness">Tardiness</option>
                  <option value="Overtime">Overtime</option>
                  <option value="Undertime">Undertime</option>
                  <option value="Leave and Absences">Leave and Absences</option>
                </select>
              </div>

              {/* No of Hours */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">No of Hours :</label>
                <input
                  type="text"
                  value={noOfHours}
                  onChange={(e) => setNoOfHours(e.target.value)}
                  className="w-32 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="[hh.mm]"
                />
                <span className="text-gray-500 text-xs">[hh.mm]</span>
              </div>

              {/* Overtime Code */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Overtime Code :</label>
                <input
                  type="text"
                  value={overtimeCode}
                  onChange={(e) => setOvertimeCode(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Search className="w-4 h-4" />
                </button>
                <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={onSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
              >
              {isEditMode ? 'Update' : 'Submit'}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface AdjustmentModalProps {
  show: boolean;
  onClose: () => void;
  isEditMode: boolean;
  empCode: string;
  setEmpCode: (value: string) => void;
  transactionDate: string;
  setTransactionDate: (value: string) => void;
  transactionType: string;
  setTransactionType: (value: string) => void;
  leaveType: string;
  setLeaveType: (value: string) => void;
  overtimeCode: string;
  setOvertimeCode: (value: string) => void;
  noOfHours: string;
  setNoOfHours: (value: string) => void;
  adjustType: string;
  setAdjustType: (value: string) => void;
  remarks: string;
  setRemarks: (value: string) => void;
  isLateFiling: boolean;
  setIsLateFiling: (value: boolean) => void;
  isLateFilingActualDate: string;
  setIsLateFilingActualDate: (value: string) => void;
  borrowedDeviceName: string;
  setBorrowedDeviceName: (value: string) => void;
  onSubmit: () => void;
}

export function AdjustmentModal({
  show,
  onClose,
  isEditMode,
  empCode,
  setEmpCode,
  transactionDate,
  setTransactionDate,
  transactionType,
  setTransactionType,
  leaveType,
  setLeaveType,
  overtimeCode,
  setOvertimeCode,
  noOfHours,
  setNoOfHours,
  adjustType,
  setAdjustType,
  remarks,
  setRemarks,
  isLateFiling,
  setIsLateFiling,
  isLateFilingActualDate,
  setIsLateFilingActualDate,
  borrowedDeviceName,
  setBorrowedDeviceName,
  onSubmit
}: AdjustmentModalProps) {
  if (!show) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-10"
        onClick={onClose}
      ></div>

      {/* Modal Dialog */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <h2 className="text-gray-800">{isEditMode ? 'Edit Record' : 'Create New'}</h2>
            <button 
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4">
            <h3 className="text-blue-600 mb-3">Adjustments</h3>
            
              {/* Form Fields */}
              <div className="space-y-3">
                  {/* Employee Code */}
                  <div className="flex items-center gap-2">
                    <label className="w-40 text-gray-700">EmpCode :</label>
                    <input
                      type="text"
                      value={empCode}
                      onChange={(e) => setEmpCode(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Transaction Date */}
                  <div className="flex items-center gap-2">
                    <label className="w-40 text-gray-700">Transaction Date :</label>
                    <input
                      type="text"
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Transaction Type */}
                  <div className="flex items-center gap-2">
                    <label className="w-40 text-gray-700">Transaction Type :</label>
                    <select
                      value={transactionType}
                      onChange={(e) => setTransactionType(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value=""></option>
                      <option value="Tardiness">Tardiness</option>
                      <option value="Overtime">Overtime</option>
                      <option value="Undertime">Undertime</option>
                      <option value="Leave and Absences">Leave and Absences</option>
                    </select>
                  </div>

                  {/* Leave Type */}
                  <div className="flex items-center gap-2">
                    <label className="w-40 text-gray-700">Leave Type :</label>
                    <input
                      type="text"
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Overtime Code */}
                  <div className="flex items-center gap-2">
                    <label className="w-40 text-gray-700">Overtime Code :</label>
                    <input
                      type="text"
                      value={overtimeCode}
                      onChange={(e) => setOvertimeCode(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <Search className="w-4 h-4" />
                    </button>
                    <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* No Of Hours */}
                  <div className="flex items-center gap-2">
                    <label className="w-40 text-gray-700">No Of Hours :</label>
                    <input
                      type="text"
                      value={noOfHours}
                      onChange={(e) => setNoOfHours(e.target.value)}
                      className="w-32 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="[hh.mm]"
                    />
                    <span className="text-gray-500 text-xs">[hh.mm]</span>
                  </div>

                  {/* Adjust Type */}
                  <div className="flex items-center gap-2">
                    <label className="w-40 text-gray-700">Adjust Type :</label>
                    <select
                      value={adjustType}
                      onChange={(e) => setAdjustType(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value=""></option>
                      <option value="Tardiness">Tardiness</option>
                      <option value="Overtime">Overtime</option>
                      <option value="Undertime">Undertime</option>
                      <option value="Leave and Absences">Leave and Absences</option>
                    </select>
                  </div>

                  {/* Remarks */}
                  <div className="flex items-center gap-2">
                    <label className="w-40 text-gray-700">Remarks :</label>
                    <input
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* IsLateFiling */}
                  <div className="flex items-center gap-2">
                    <label className="w-40 text-gray-700">IsLateFiling :</label>
                    <input
                      type="checkbox"
                      checked={isLateFiling}
                      onChange={(e) => setIsLateFiling(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  {/* IsLateFilingActualDate */}
                  <div className="flex items-center gap-2">
                    <label className="w-44 text-gray-700">IsLateFilingActualDate :</label>
                    <input
                      type="text"
                      value={isLateFilingActualDate}
                      onChange={(e) => setIsLateFilingActualDate(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Borrowed Device Name */}
                  <div className="flex items-center gap-2">
                    <label className="w-44 text-gray-700">Borrowed Device Name :</label>
                    <input
                      type="text"
                      value={borrowedDeviceName}
                      onChange={(e) => setBorrowedDeviceName(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <Search className="w-4 h-4" />
                    </button>
                    <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
              </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={onSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
              >
              {isEditMode ? 'Update' : 'Submit'}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface OtherEarningsModalProps {
  show: boolean;
  onClose: () => void;
  isEditMode: boolean;
  empCode: string;
  setEmpCode: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  allowanceCode: string;
  setAllowanceCode: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  remarks: string;
  setRemarks: (value: string) => void;
  onSubmit: () => void;
}

export function OtherEarningsModal({
  show,
  onClose,
  isEditMode,
  empCode,
  setEmpCode,
  date,
  setDate,
  allowanceCode,
  setAllowanceCode,
  description,
  setDescription,
  amount,
  setAmount,
  remarks,
  setRemarks,
  onSubmit
}: OtherEarningsModalProps) {
  if (!show) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-10"
        onClick={onClose}
      ></div>

      {/* Modal Dialog */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <h2 className="text-gray-800">{isEditMode ? 'Edit Record' : 'Create New'}</h2>
            <button 
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4">
            <h3 className="text-blue-600 mb-3">Overtime</h3>
            
            {/* Form Fields */}
            <div className="space-y-3">
              {/* Employee Code */}
             {/* Employee Code */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">EmpCode :</label>
                <input
                  type="text"
                  value={empCode}
                  onChange={(e) => setEmpCode(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Date */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Date :</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Allowance Code */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">AllowanceCode :</label>
                <input
                  type="text"
                  value={allowanceCode}
                  onChange={(e) => setAllowanceCode(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Search className="w-4 h-4" />
                </button>
                <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Description :</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Amount */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Amount :</label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Remarks */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Remarks :</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={onSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
              >
                {isEditMode ? 'Update' : 'Submit'}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Undertime Modal Component
interface UndertimeModalProps {
  show: boolean;
  onClose: () => void;
  isEditMode: boolean;
  empCode: string;
  setEmpCode: (value: string) => void;
  dateFrom: string;
  setDateFrom: (value: string) => void;
  dateTo: string;
  setDateTo: (value: string) => void;
  timeIn: string;
  setTimeIn: (value: string) => void;
  timeOut: string;
  setTimeOut: (value: string) => void;
  workshiftCode: string;
  setWorkshiftCode: (value: string) => void;
  undertime: string;
  setUndertime: (value: string) => void;
  undertimeWithinGracePeriod: string;
  setUndertimeWithinGracePeriod: (value: string) => void;
  actualUndertime: string;
  setActualUndertime: (value: string) => void;
  remarks: string;
  setRemarks: (value: string) => void;
  onSubmit: () => void;
  onWorkshiftSearch: () => void;
}

export function UndertimeModal({
  show,
  onClose,
  isEditMode,
  empCode,
  setEmpCode,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  timeIn,
  setTimeIn,
  timeOut,
  setTimeOut,
  workshiftCode,
  setWorkshiftCode,
  undertime,
  setUndertime,
  undertimeWithinGracePeriod,
  setUndertimeWithinGracePeriod,
  actualUndertime,
  setActualUndertime,
  remarks,
  setRemarks,
  onSubmit,
  onWorkshiftSearch
}: UndertimeModalProps) {
  if (!show) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-10"
        onClick={onClose}
      ></div>

      {/* Modal Dialog */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <h2 className="text-gray-800">{isEditMode ? 'Edit Record' : 'Create New'}</h2>
            <button 
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4">
            <h3 className="text-blue-600 mb-3">Undertime</h3>
            
              {/* Form Fields */}
              <div className="space-y-3">
                  {/* Employee Code */}
                  <div className="flex items-center gap-2">
                    <label className="w-40 text-gray-700">EmpCode :</label>
                    <input
                      type="text"
                      value={empCode}
                      onChange={(e) => setEmpCode(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

              {/* Date From */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Date From :</label>
                <input
                  type="text"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Date To */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Date To :</label>
                <input
                  type="text"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Time In */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Time In :</label>
                <input
                  type="text"
                  value={timeIn}
                  onChange={(e) => setTimeIn(e.target.value)}
                  className="w-28 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Time Out */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Time Out :</label>
                <input
                  type="text"
                  value={timeOut}
                  onChange={(e) => setTimeOut(e.target.value)}
                  className="w-28 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Workshift Code */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Workshift Code :</label>
                <input
                  type="text"
                  value={workshiftCode}
                  onChange={(e) => setWorkshiftCode(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button 
                  onClick={onWorkshiftSearch}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setWorkshiftCode('')}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Undertime */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Undertime :</label>
                <input
                  type="text"
                  value={undertime}
                  onChange={(e) => setUndertime(e.target.value)}
                  className="w-28 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="[hh.mm]"
                />
                <span className="text-gray-500 text-sm">[hh.mm]</span>
              </div>

              {/* Undertime Within GracePeriod */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Undertime Within GracePeriod :</label>
                <input
                  type="text"
                  value={undertimeWithinGracePeriod}
                  onChange={(e) => setUndertimeWithinGracePeriod(e.target.value)}
                  className="w-28 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="[hh.mm]"
                />
                <span className="text-gray-500 text-sm">[hh.mm]</span>
              </div>

              {/* ActualUndertime */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">ActualUndertime :</label>
                <input
                  type="text"
                  value={actualUndertime}
                  onChange={(e) => setActualUndertime(e.target.value)}
                  className="w-28 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="[hh.mm]"
                />
                <span className="text-gray-500 text-sm">[hh.mm]</span>
              </div>

              {/* Remarks */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Remarks :</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={onSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
              >
              {isEditMode ? 'Update' : 'Submit'}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Overtime Modal Component
interface OvertimeModalProps {
  show: boolean;
  onClose: () => void;
  isEditMode: boolean;
  empCode: string;
  setEmpCode: (value: string) => void;
  dateFrom: string;
  setDateFrom: (value: string) => void;
  dateTo: string;
  setDateTo: (value: string) => void;
  timeIn: string;
  setTimeIn: (value: string) => void;
  timeOut: string;
  setTimeOut: (value: string) => void;
  workshiftCode: string;
  setWorkshiftCode: (value: string) => void;
  overtime: string;
  setOvertime: (value: string) => void;
  otCode: string;
  setOtCode: (value: string) => void;
  reason: string;
  setReason: (value: string) => void;
  remarks: string;
  setRemarks: (value: string) => void;
  onSubmit: () => void;
  onWorkshiftSearch: () => void;
  onOTCodeSearch: () => void;
}

export function OvertimeModal({
  show,
  onClose,
  isEditMode,
  empCode,
  setEmpCode,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  timeIn,
  setTimeIn,
  timeOut,
  setTimeOut,
  workshiftCode,
  setWorkshiftCode,
  overtime,
  setOvertime,
  otCode,
  setOtCode,
  reason,
  setReason,
  remarks,
  setRemarks,
  onSubmit,
  onWorkshiftSearch,
  onOTCodeSearch
}: OvertimeModalProps) {
  if (!show) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-10"
        onClick={onClose}
      ></div>

      {/* Modal Dialog */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <h2 className="text-gray-800">{isEditMode ? 'Edit Record' : 'Create New'}</h2>
            <button 
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4">
            <h3 className="text-blue-600 mb-3">Overtime</h3>
            
            {/* Form Fields */}
            <div className="space-y-3">
              {/* Employee Code */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">EmpCode :</label>
                <input
                  type="text"
                  value={empCode}
                  onChange={(e) => setEmpCode(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* DateFrom */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">DateFrom :</label>
                <input
                  type="text"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* DateTo */}
              <div className="flex items-center gap-2 col-span-2">
                <label className="w-40 text-gray-700">DateTo :</label>
                <input
                  type="text"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* TimeIn */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">TimeIn :</label>
                <input
                  type="text"
                  value={timeIn}
                  onChange={(e) => setTimeIn(e.target.value)}
                  className="w-28 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* TimeOut */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">TimeOut :</label>
                <input
                  type="text"
                  value={timeOut}
                  onChange={(e) => setTimeOut(e.target.value)}
                  className="w-28 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* WorkshiftCode */}
              <div className="flex items-center gap-2 col-span-2">
                <label className="w-40 text-gray-700">WorkshiftCode :</label>
                <input
                  type="text"
                  value={workshiftCode}
                  onChange={(e) => setWorkshiftCode(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button 
                  onClick={onWorkshiftSearch}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setWorkshiftCode('')}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Overtime */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Overtime :</label>
                <input
                  type="text"
                  value={overtime}
                  onChange={(e) => setOvertime(e.target.value)}
                  className="w-28 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="[hh.mm]"
                />
                <span className="text-gray-500 text-sm">[hh.mm]</span>
              </div>

              {/* OTCode */}
              <div className="flex items-center gap-2 col-span-2">
                <label className="w-40 text-gray-700">OTCode :</label>
                <input
                  type="text"
                  value={otCode}
                  onChange={(e) => setOtCode(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button 
                  onClick={onOTCodeSearch}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setOtCode('')}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Reason */}
              <div className="flex items-center gap-2 col-span-2">
                <label className="w-40 text-gray-700">Reason :</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Remarks */}
              <div className="flex items-center gap-2 col-span-2">
                <label className="w-40 text-gray-700">Remarks :</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={onSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
              >
                {isEditMode ? 'Update' : 'Submit'}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}



// Leave and Absences Modal Component
interface LeaveAbsencesModalProps {
  show: boolean;
  onClose: () => void;
  isEditMode: boolean;
  empCode: string;
  setEmpCode: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  hoursLeaveAbsent: string;
  setHoursLeaveAbsent: (value: string) => void;
  leaveCode: string;
  setLeaveCode: (value: string) => void;
  leaveDescription: string;
  setLeaveDescription: (value: string) => void;
  reason: string;
  setReason: (value: string) => void;
  remarks: string;
  setRemarks: (value: string) => void;
  withPay: boolean;
  setWithPay: (value: boolean) => void;
  exemptForAllowanceDeduction: boolean;
  setExemptForAllowanceDeduction: (value: boolean) => void;
  onSubmit: () => void;
  onLeaveCodeSearch: () => void;
}

export function LeaveAbsencesModal({
  show,
  onClose,
  isEditMode,
  empCode,
  setEmpCode,
  date,
  setDate,
  hoursLeaveAbsent,
  setHoursLeaveAbsent,
  leaveCode,
  setLeaveCode,
  leaveDescription,
  setLeaveDescription,
  reason,
  setReason,
  remarks,
  setRemarks,
  withPay,
  setWithPay,
  exemptForAllowanceDeduction,
  setExemptForAllowanceDeduction,
  onSubmit,
  onLeaveCodeSearch
}: LeaveAbsencesModalProps) {
  if (!show) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-10"
        onClick={onClose}
      ></div>

      {/* Modal Dialog */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
          {/* Modal Header */}
                  <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <h2 className="text-gray-800">{isEditMode ? 'Edit Record' : 'Create New'}</h2>
            <button 
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4">
            <h3 className="text-blue-600 mb-3">Processed Leaves And Absences</h3>
            
            {/* Form Fields */}
            <div className="space-y-3">
              {/* EmpCode */}
              <div className="flex items-center gap-2 col-span-2">
                <label className="w-56 text-gray-700">EmpCode :</label>
                <input
                  type="text"
                  value={empCode}
                  onChange={(e) => setEmpCode(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 col-span-2">
                <label className="w-56 text-gray-700">Date :</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Hours LeaveAbsent */}
              <div className="flex items-center gap-2 col-span-2">
                <label className="w-56 text-gray-700">Hours LeaveAbsent :</label>
                <input
                  type="text"
                  value={hoursLeaveAbsent}
                  onChange={(e) => setHoursLeaveAbsent(e.target.value)}
                  className="w-32 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="[hh.mm]"
                />
                <span className="text-gray-500 text-sm">[hh.mm]</span>
              </div>

              {/* Leave Code */}
              <div className="flex items-center gap-2 col-span-2">
                <label className="w-56 text-gray-700">Leave Code :</label>
                <input
                  type="text"
                  value={leaveCode}
                  onChange={(e) => setLeaveCode(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button 
                  onClick={onLeaveCodeSearch}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setLeaveCode('')}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Leave Description */}
              <div className="flex items-center gap-2 col-span-2">
                <label className="w-56 text-gray-700">Leave Description :</label>
                <input
                  type="text"
                  value={leaveDescription}
                  onChange={(e) => setLeaveDescription(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Reason */}
              <div className="flex items-center gap-2 col-span-2">
                <label className="w-56 text-gray-700">Reason :</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Remarks */}
              <div className="flex items-center gap-2 col-span-2">
                <label className="w-56 text-gray-700">Remarks :</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* With Pay */}
              <div className="flex items-center gap-2 col-span-2">
                <label className="w-56 text-gray-700">With Pay :</label>
                <input
                  type="checkbox"
                  checked={withPay}
                  onChange={(e) => setWithPay(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>

              {/* Exempt for Allowance Deduction */}
              <div className="flex items-center gap-2 col-span-2">
                <label className="w-56 text-gray-700">Exempt for Allowance Deduction :</label>
                <input
                  type="checkbox"
                  checked={exemptForAllowanceDeduction}
                  onChange={(e) => setExemptForAllowanceDeduction(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={onSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
              >
                {isEditMode ? 'Update' : 'Submit'}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface NoOfHoursModalProps {
  show: boolean;
  onClose: () => void;
  isEditMode: boolean;
  empCode: string;
  setEmpCode: (value: string) => void;
  workshiftCode: string;
  setWorkshiftCode: (value: string) => void;
  dateIn: string;
  setDateIn: (value: string) => void;
  dateOut: string;
  setDateOut: (value: string) => void;
  noOfHours: string;
  setNoOfHours: (value: string) => void;
  onSubmit: () => void;
  onWorkshiftSearch: () => void;
}

export function NoOfHoursModal({
  show,
  onClose,
  isEditMode,
  empCode,
  setEmpCode,
  workshiftCode,
  setWorkshiftCode,
  dateIn,
  setDateIn,
  dateOut,
  setDateOut,
  noOfHours,
  setNoOfHours,
  onSubmit,
  onWorkshiftSearch
}: NoOfHoursModalProps) {
  const [showDateInCalendar,  setShowDateInCalendar]  = useState(false);
  const [showDateOutCalendar, setShowDateOutCalendar] = useState(false);
  const [showTimeInPicker,    setShowTimeInPicker]    = useState(false);
  const [showTimeOutPicker,   setShowTimeOutPicker]   = useState(false);

  const splitDateTime = (value: string) => {
    const parts = value.trim().split(' ');
    return { datePart: parts[0] ?? '', timePart: parts.length > 1 ? parts.slice(1).join(' ') : '' };
  };

  const closeAllPickers = () => {
    setShowDateInCalendar(false);
    setShowDateOutCalendar(false);
    setShowTimeInPicker(false);
    setShowTimeOutPicker(false);
  };

  useEffect(() => {
    if (!show) closeAllPickers();
  }, [show]);

  const handleDateInSelect = (pickedDate: string) => {
    const { timePart } = splitDateTime(dateIn);
    setDateIn(timePart ? `${pickedDate} ${timePart}` : pickedDate);
    setShowDateInCalendar(false);
  };

  const handleDateOutSelect = (pickedDate: string) => {
    const { timePart } = splitDateTime(dateOut);
    setDateOut(timePart ? `${pickedDate} ${timePart}` : pickedDate);
    setShowDateOutCalendar(false);
  };

  const handleTimeInSelect = (pickedTime: string) => {
    const { datePart } = splitDateTime(dateIn);
    setDateIn(datePart ? `${datePart} ${pickedTime}` : pickedTime);
    setShowTimeInPicker(false);
  };

  const handleTimeOutSelect = (pickedTime: string) => {
    const { datePart } = splitDateTime(dateOut);
    setDateOut(datePart ? `${datePart} ${pickedTime}` : pickedTime);
    setShowTimeOutPicker(false);
  };

  if (!show) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-10" onClick={onClose} />

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">

          {/* Header */}
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <h2 className="text-gray-800">{isEditMode ? 'Edit Record' : 'Create New'}</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            <h3 className="text-blue-600 mb-3">Adjustments</h3>
            <div className="space-y-3">

              {/* EmpCode */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">EmpCode :</label>
                <input type="text" value={empCode} onChange={(e) => setEmpCode(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>

              {/* Workshift */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Workshift Code :</label>
                <input type="text" value={workshiftCode} onChange={(e) => setWorkshiftCode(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <button onClick={onWorkshiftSearch} className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Search className="w-4 h-4" />
                </button>
                <button onClick={() => setWorkshiftCode('')} className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Date In */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Date In :</label>
                <input type="text" value={dateIn} onChange={(e) => setDateIn(e.target.value)}
                  placeholder="MM/DD/YYYY HH:MM AM"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <button onClick={() => { closeAllPickers(); setShowDateInCalendar(v => !v); }}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Calendar className="w-4 h-4" />
                </button>
                <button onClick={() => { closeAllPickers(); setShowTimeInPicker(v => !v); }}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Clock className="w-4 h-4" />
                </button>
                <button onClick={() => setDateIn('')} className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Date Out */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Date Out :</label>
                <input type="text" value={dateOut} onChange={(e) => setDateOut(e.target.value)}
                  placeholder="MM/DD/YYYY HH:MM AM"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <button onClick={() => { closeAllPickers(); setShowDateOutCalendar(v => !v); }}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Calendar className="w-4 h-4" />
                </button>
                <button onClick={() => { closeAllPickers(); setShowTimeOutPicker(v => !v); }}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Clock className="w-4 h-4" />
                </button>
                <button onClick={() => setDateOut('')} className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* No. Of Hours */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">No. Of Hours :</label>
                <input type="text" value={noOfHours} onChange={(e) => setNoOfHours(e.target.value)}
                  className="w-32 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="[hh.mm]" />
                <span className="text-gray-500 text-sm">[hh.mm]</span>
              </div>

            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={onSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                {isEditMode ? 'Update' : 'Submit'}
              </button>
              <button onClick={onClose} className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm">
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDateInCalendar && createPortal(
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
          <CalendarPopup onDateSelect={handleDateInSelect} onClose={() => setShowDateInCalendar(false)} />
        </div>,
        document.body
      )}

      {showTimeInPicker && createPortal(
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
          <TimePicker onTimeSelect={handleTimeInSelect} onClose={() => setShowTimeInPicker(false)}
            initialTime={splitDateTime(dateIn).timePart} />
        </div>,
        document.body
      )}

      {showDateOutCalendar && createPortal(
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
          <CalendarPopup onDateSelect={handleDateOutSelect} onClose={() => setShowDateOutCalendar(false)} />
        </div>,
        document.body
      )}

      {showTimeOutPicker && createPortal(
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
          <TimePicker onTimeSelect={handleTimeOutSelect} onClose={() => setShowTimeOutPicker(false)}
            initialTime={splitDateTime(dateOut).timePart} />
        </div>,
        document.body
      )}
    </>
  );
}

// ─── Tardiness Modal Component ───────────────────────────────────────────────
interface TardinessModalProps {
    show:                               boolean;
    onClose:                            () => void;
    isEditMode:                         boolean;
    // ── Identity ──────────────────────────────────────────────────────────────
    empCode:                            string;
    setEmpCode:                         (v: string)  => void;
    dateFrom:                           string;
    setDateFrom:                        (v: string)  => void;
    dateTo:                             string;
    setDateTo:                          (v: string)  => void;
    timeIn:                             string;
    setTimeIn:                          (v: string)  => void;
    timeOut:                            string;
    setTimeOut:                         (v: string)  => void;
    workShiftCode:                      string;
    setWorkShiftCode:                   (v: string)  => void;
    onWorkshiftSearch:                  () => void;
    tardiness:                          string;
    setTardiness:                       (v: string)  => void;
    tardinessHHMM:                      string;
    setTardinessHHMM:                   (v: string)  => void;
    tardinessWithinGracePeriod:         string;
    setTardinessWithinGracePeriod:      (v: string)  => void;
    tardinessWithinGracePeriodHHMM:     string;
    setTardinessWithinGracePeriodHHMM:  (v: string)  => void;
    actualTardiness:                    string;
    setActualTardiness:                 (v: string)  => void;
    actualTardinessHHMM:                string;
    setActualTardinessHHMM:             (v: string)  => void;
    // ── Misc ──────────────────────────────────────────────────────────────────
    remarks:                            string;
    setRemarks:                         (v: string)  => void;
    groupCode:                          string;
    setGroupCode:                       (v: string)  => void;
    offSetOTFlag:                       boolean;
    setOffSetOTFlag:                    (v: boolean) => void;
    exemptionRpt:                       string;
    setExemptionRpt:                    (v: string)  => void;
    glCode:                             string;
    setGLCode:                          (v: string)  => void;
    // ── Actions ───────────────────────────────────────────────────────────────
    onSubmit:                           () => void;
}

export function TardinessModal({
    show,
    onClose,
    isEditMode,
    empCode,           setEmpCode,
    dateFrom,          setDateFrom,
    dateTo,            setDateTo,
    timeIn,            setTimeIn,
    timeOut,           setTimeOut,
    workShiftCode,     setWorkShiftCode,   onWorkshiftSearch,
    tardiness,         setTardiness,
    tardinessHHMM,     setTardinessHHMM,
    tardinessWithinGracePeriod,         setTardinessWithinGracePeriod,
    tardinessWithinGracePeriodHHMM,     setTardinessWithinGracePeriodHHMM,
    actualTardiness,   setActualTardiness,
    actualTardinessHHMM, setActualTardinessHHMM,
    remarks,           setRemarks,
    groupCode,         setGroupCode,
    offSetOTFlag,      setOffSetOTFlag,
    exemptionRpt,      setExemptionRpt,
    glCode,            setGLCode,
    onSubmit,
}: TardinessModalProps) {

    // ── Calendar / Time picker visibility ─────────────────────────────────────
    const [showDateFromCalendar, setShowDateFromCalendar] = useState(false);
    const [showDateToCalendar,   setShowDateToCalendar]   = useState(false);
    const [showTimeInPicker,     setShowTimeInPicker]     = useState(false);
    const [showTimeOutPicker,    setShowTimeOutPicker]    = useState(false);


    const splitDateTime = (value: string) => {
        const parts = value.trim().split(' ');
        return {
            datePart: parts[0] ?? '',
            timePart: parts.length > 1 ? parts.slice(1).join(' ') : '',
        };
    };

    const closeAllPickers = () => {
        setShowDateFromCalendar(false);
        setShowDateToCalendar(false);
        setShowTimeInPicker(false);
        setShowTimeOutPicker(false);
    };

    useEffect(() => {
        if (!show) closeAllPickers();
    }, [show]);

    // ── DateFrom handlers ─────────────────────────────────────────────────────
    const handleDateFromSelect = (picked: string) => {
        const { timePart } = splitDateTime(dateFrom);
        setDateFrom(timePart ? `${picked} ${timePart}` : picked);
        setShowDateFromCalendar(false);
    };

    // ── DateTo handlers ───────────────────────────────────────────────────────
    const handleDateToSelect = (picked: string) => {
        const { timePart } = splitDateTime(dateTo);
        setDateTo(timePart ? `${picked} ${timePart}` : picked);
        setShowDateToCalendar(false);
    };

    const handleTimeInSelect  = (picked: string) => { setTimeIn(picked);  setShowTimeInPicker(false);  };
    const handleTimeOutSelect = (picked: string) => { setTimeOut(picked); setShowTimeOutPicker(false); };

    if (!show) return null;

    // ── Shared input class ────────────────────────────────────────────────────
    const inputCls  = "flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
    const shortCls  = "w-32 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
    const iconBtn   = (color: string) =>
        `px-3 py-1.5 ${color} text-white rounded-lg transition-colors`;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 z-10" onClick={onClose} />

            {/* Dialog */}
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">

                    {/* Header */}
                    <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                        <h2 className="text-gray-800">
                            {isEditMode ? 'Edit Record' : 'Create New'}
                        </h2>
                        <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-4">
                        <h3 className="text-blue-600 mb-3">Processed Tardiness</h3>

                        <div className="space-y-3">

                            {/* EmpCode */}
                            <div className="flex items-center gap-2">
                                <label className="w-56 text-gray-700">EmpCode :</label>
                                <input
                                    type="text"
                                    value={empCode}
                                    onChange={(e) => setEmpCode(e.target.value)}
                                    className={inputCls}
                                />
                            </div>

                            {/* Date From */}
                            <div className="flex items-center gap-2">
                                <label className="w-56 text-gray-700">Date From :</label>
                                <input
                                    type="text"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    placeholder="MM/DD/YYYY"
                                    className={inputCls}
                                />
                                <button
                                    onClick={() => { closeAllPickers(); setShowDateFromCalendar(v => !v); }}
                                    className={iconBtn('bg-blue-600 hover:bg-blue-700')}
                                >
                                    <Calendar className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setDateFrom('')}
                                    className={iconBtn('bg-red-600 hover:bg-red-700')}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Date To */}
                            <div className="flex items-center gap-2">
                                <label className="w-56 text-gray-700">Date To :</label>
                                <input
                                    type="text"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    placeholder="MM/DD/YYYY"
                                    className={inputCls}
                                />
                                <button
                                    onClick={() => { closeAllPickers(); setShowDateToCalendar(v => !v); }}
                                    className={iconBtn('bg-blue-600 hover:bg-blue-700')}
                                >
                                    <Calendar className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setDateTo('')}
                                    className={iconBtn('bg-red-600 hover:bg-red-700')}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Time In */}
                            <div className="flex items-center gap-2">
                                <label className="w-56 text-gray-700">Time In :</label>
                                <input
                                    type="text"
                                    value={timeIn}
                                    onChange={(e) => setTimeIn(e.target.value)}
                                    placeholder="HH:MM AM/PM"
                                    className={inputCls}
                                />
                                <button
                                    onClick={() => { closeAllPickers(); setShowTimeInPicker(v => !v); }}
                                    className={iconBtn('bg-blue-600 hover:bg-blue-700')}
                                >
                                    <Clock className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setTimeIn('')}
                                    className={iconBtn('bg-red-600 hover:bg-red-700')}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Time Out */}
                            <div className="flex items-center gap-2">
                                <label className="w-56 text-gray-700">Time Out :</label>
                                <input
                                    type="text"
                                    value={timeOut}
                                    onChange={(e) => setTimeOut(e.target.value)}
                                    placeholder="HH:MM AM/PM"
                                    className={inputCls}
                                />
                                <button
                                    onClick={() => { closeAllPickers(); setShowTimeOutPicker(v => !v); }}
                                    className={iconBtn('bg-blue-600 hover:bg-blue-700')}
                                >
                                    <Clock className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setTimeOut('')}
                                    className={iconBtn('bg-red-600 hover:bg-red-700')}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Workshift Code */}
                            <div className="flex items-center gap-2">
                                <label className="w-56 text-gray-700">Workshift Code :</label>
                                <input
                                    type="text"
                                    value={workShiftCode}
                                    onChange={(e) => setWorkShiftCode(e.target.value)}
                                    className={inputCls}
                                />
                                <button
                                    onClick={onWorkshiftSearch}
                                    className={iconBtn('bg-green-600 hover:bg-green-700')}
                                >
                                    <Search className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setWorkShiftCode('')}
                                    className={iconBtn('bg-red-600 hover:bg-red-700')}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Tardiness */}
                            <div className="flex items-center gap-2">
                                <label className="w-56 text-gray-700">Tardiness :</label>
                                <input
                                    type="text"
                                    value={tardiness}
                                    onChange={(e) => setTardiness(e.target.value)}
                                    placeholder="[hh.mm]"
                                    className={shortCls}
                                />
                                <span className="text-gray-500 text-sm">[hh.mm]</span>
                            </div>

                            {/* Tardiness HHMM */}
                            <div className="flex items-center gap-2">
                                <label className="w-56 text-gray-700">Tardiness HHMM :</label>
                                <input
                                    type="text"
                                    value={tardinessHHMM}
                                    onChange={(e) => setTardinessHHMM(e.target.value)}
                                    placeholder="[hh.mm]"
                                    className={shortCls}
                                />
                                <span className="text-gray-500 text-sm">[hh.mm]</span>
                            </div>

                            {/* Tardiness Within Grace Period */}
                            <div className="flex items-center gap-2">
                                <label className="w-56 text-gray-700">Tardiness Within Grace Period :</label>
                                <input
                                    type="text"
                                    value={tardinessWithinGracePeriod}
                                    onChange={(e) => setTardinessWithinGracePeriod(e.target.value)}
                                    placeholder="[hh.mm]"
                                    className={shortCls}
                                />
                                <span className="text-gray-500 text-sm">[hh.mm]</span>
                            </div>

                            {/* Tardiness Within Grace Period HHMM */}
                            <div className="flex items-center gap-2">
                                <label className="w-56 text-gray-700">Grace Period HHMM :</label>
                                <input
                                    type="text"
                                    value={tardinessWithinGracePeriodHHMM}
                                    onChange={(e) => setTardinessWithinGracePeriodHHMM(e.target.value)}
                                    placeholder="[hh.mm]"
                                    className={shortCls}
                                />
                                <span className="text-gray-500 text-sm">[hh.mm]</span>
                            </div>

                            {/* Actual Tardiness */}
                            <div className="flex items-center gap-2">
                                <label className="w-56 text-gray-700">Actual Tardiness :</label>
                                <input
                                    type="text"
                                    value={actualTardiness}
                                    onChange={(e) => setActualTardiness(e.target.value)}
                                    placeholder="[hh.mm]"
                                    className={shortCls}
                                />
                                <span className="text-gray-500 text-sm">[hh.mm]</span>
                            </div>

                            {/* Actual Tardiness HHMM */}
                            <div className="flex items-center gap-2">
                                <label className="w-56 text-gray-700">Actual Tardiness HHMM :</label>
                                <input
                                    type="text"
                                    value={actualTardinessHHMM}
                                    onChange={(e) => setActualTardinessHHMM(e.target.value)}
                                    placeholder="[hh.mm]"
                                    className={shortCls}
                                />
                                <span className="text-gray-500 text-sm">[hh.mm]</span>
                            </div>

                            {/* Remarks */}
                            <div className="flex items-center gap-2">
                                <label className="w-56 text-gray-700">Remarks :</label>
                                <input
                                    type="text"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className={inputCls}
                                />
                            </div>

                            {/* Group Code */}
                            <div className="flex items-center gap-2">
                                <label className="w-56 text-gray-700">Group Code :</label>
                                <input
                                    type="text"
                                    value={groupCode}
                                    onChange={(e) => setGroupCode(e.target.value)}
                                    className={inputCls}
                                />
                            </div>

                            {/* Offset OT Flag */}
                            <div className="flex items-center gap-2">
                                <label className="w-56 text-gray-700">Offset OT Flag :</label>
                                <input
                                    type="checkbox"
                                    checked={offSetOTFlag}
                                    onChange={(e) => setOffSetOTFlag(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                            </div>

                            {/* Exemption Rpt */}
                            <div className="flex items-center gap-2">
                                <label className="w-56 text-gray-700">Exemption Rpt :</label>
                                <select
                                    value={exemptionRpt}
                                    onChange={(e) => setExemptionRpt(e.target.value)}
                                    className={inputCls}
                                >
                                    <option value=""></option>
                                    <option value="Approved">Approved</option>
                                    <option value="Disapproved">Disapproved</option>
                                    <option value="Disapproved by HR">Disapproved by HR</option>
                                </select>
                            </div>

                            {/* GL Code */}
                            <div className="flex items-center gap-2">
                                <label className="w-56 text-gray-700">GL Code :</label>
                                <input
                                    type="text"
                                    value={glCode}
                                    onChange={(e) => setGLCode(e.target.value)}
                                    className={inputCls}
                                    disabled={isEditMode}
                                    title={isEditMode ? 'GL Code cannot be changed after creation' : ''}
                                />
                            </div>

                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={onSubmit}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
                            >
                                {isEditMode ? 'Update' : 'Submit'}
                            </button>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
                            >
                                Back to List
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Portals ────────────────────────────────────────────────────── */}

            {showDateFromCalendar && createPortal(
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
                    <CalendarPopup
                        onDateSelect={handleDateFromSelect}
                        onClose={() => setShowDateFromCalendar(false)}
                    />
                </div>,
                document.body
            )}

            {showDateToCalendar && createPortal(
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
                    <CalendarPopup
                        onDateSelect={handleDateToSelect}
                        onClose={() => setShowDateToCalendar(false)}
                    />
                </div>,
                document.body
            )}

            {showTimeInPicker && createPortal(
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
                    <TimePicker
                        onTimeSelect={handleTimeInSelect}
                        onClose={() => setShowTimeInPicker(false)}
                        initialTime={timeIn}
                    />
                </div>,
                document.body
            )}

            {showTimeOutPicker && createPortal(
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
                    <TimePicker
                        onTimeSelect={handleTimeOutSelect}
                        onClose={() => setShowTimeOutPicker(false)}
                        initialTime={timeOut}
                    />
                </div>,
                document.body
            )}
        </>
    );
}