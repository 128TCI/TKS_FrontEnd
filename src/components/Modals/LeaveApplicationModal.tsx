import { X, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface LeaveCode {
  code: string;
  description: string;
}

interface LeaveApplicationModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  empCode: string;
  date: string;
  hoursApproved: string;
  leaveCode: string;
  period: string;
  reason: string;
  remarks: string;
  withPay: boolean;
  sssNotification: boolean;
  isLateFiling: boolean;
  onClose: () => void;
  onDateChange: (value: string) => void;
  onHoursApprovedChange: (value: string) => void;
  onLeaveCodeChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onRemarksChange: (value: string) => void;
  onWithPayChange: (value: boolean) => void;
  onSssNotificationChange: (value: boolean) => void;
  onIsLateFilingChange: (value: boolean) => void;
  onSubmit: () => void;
  // ── NEW: Leave code lookup ──
  leaveCodes?: LeaveCode[];
  leaveCodesLoading?: boolean;
}

export function LeaveApplicationModal({
  isOpen,
  isEditMode,
  empCode,
  date,
  hoursApproved,
  leaveCode,
  period,
  reason,
  remarks,
  withPay,
  sssNotification,
  isLateFiling,
  onClose,
  onDateChange,
  onHoursApprovedChange,
  onLeaveCodeChange,
  onPeriodChange,
  onReasonChange,
  onRemarksChange,
  onWithPayChange,
  onSssNotificationChange,
  onIsLateFilingChange,
  onSubmit,
  leaveCodes = [],
  leaveCodesLoading = false,
}: LeaveApplicationModalProps) {
  const [showLeaveCodeDialog, setShowLeaveCodeDialog] = useState(false);
  const [leaveCodeSearchTerm, setLeaveCodeSearchTerm] = useState('');

  // Handle ESC key — only close main modal if search dialog is not open
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !showLeaveCodeDialog) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, showLeaveCodeDialog, onClose]);

  if (!isOpen) return null;

  const filteredLeaveCodes = (Array.isArray(leaveCodes) ? leaveCodes : []).filter(
    (lc) =>
      (lc.code?.toLowerCase() || '').includes(leaveCodeSearchTerm.toLowerCase()) ||
      (lc.description?.toLowerCase() || '').includes(leaveCodeSearchTerm.toLowerCase())
  );

  const handleLeaveCodeSelect = (code: string) => {
    onLeaveCodeChange(code);
    setShowLeaveCodeDialog(false);
    setLeaveCodeSearchTerm('');
  };

  const handleCloseSearch = () => {
    setShowLeaveCodeDialog(false);
    setLeaveCodeSearchTerm('');
  };

  return (
    <>
      {/* Main Modal Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-30" onClick={onClose} />

      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">

          {/* Header */}
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <h2 className="text-gray-800">{isEditMode ? 'Edit Leave' : 'Create New'}</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="text-blue-600 mb-4">Leave Applications</h3>

            <div className="space-y-3">

              {/* EmpCode */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">EmpCode :</label>
                <input
                  type="text"
                  value={empCode}
                  readOnly
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-100"
                />
              </div>

              {/* Date */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Date :</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* No of Hours Approved */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">No of Hours Approved :</label>
                <input
                  type="text"
                  value={hoursApproved}
                  onChange={(e) => onHoursApprovedChange(e.target.value)}
                  className="w-32 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="[hh.mm]"
                />
                <span className="text-gray-500 text-sm">[hh.mm]</span>
              </div>

              {/* LeaveCode — same pattern as Shift Code in WorkshiftVariableModal */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">LeaveCode :</label>
                <input
                  type="text"
                  value={leaveCode}
                  readOnly
                  placeholder="Select leave code..."
                  onClick={() => { setLeaveCodeSearchTerm(''); setShowLeaveCodeDialog(true); }}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded bg-gray-50 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => { setLeaveCodeSearchTerm(''); setShowLeaveCodeDialog(true); }}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-shrink-0"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onLeaveCodeChange('')}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Period */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Period :</label>
                <select
                  value={period}
                  onChange={(e) => onPeriodChange(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value=""></option>
                  <option value="1ST HALF">1ST HALF</option>
                  <option value="2ND HALF">2ND HALF</option>
                  <option value="WITHIN THE SHIFT">WITHIN THE SHIFT</option>
                </select>
              </div>

              {/* Reason */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Reason :</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => onReasonChange(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Remarks */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Remarks :</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => onRemarksChange(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* With Pay */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">With Pay :</label>
                <input
                  type="checkbox"
                  checked={withPay}
                  onChange={(e) => onWithPayChange(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>

              {/* SSS Notification */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">SSS Notification :</label>
                <input
                  type="checkbox"
                  checked={sssNotification}
                  onChange={(e) => onSssNotificationChange(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>

              {/* Is Late Filing */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Is Late Filing :</label>
                <input
                  type="checkbox"
                  checked={isLateFiling}
                  onChange={(e) => onIsLateFilingChange(e.target.checked)}
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

      {/* ── Leave Code Search Dialog — portaled to document.body, same as WorkshiftVariableModal ── */}
      {showLeaveCodeDialog && createPortal(
        <>
          <div
            className="fixed inset-0 bg-black/50"
            style={{ zIndex: 99998 }}
            onClick={handleCloseSearch}
          />
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 99999 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">

              {/* Dialog Header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                <h2 className="text-gray-800 text-sm font-semibold">Search</h2>
                <button onClick={handleCloseSearch} className="text-gray-600 hover:text-gray-800">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3">
                <h3 className="text-blue-600 mb-2 text-sm font-semibold">Leave Code</h3>

                {/* Search Input */}
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap">Search:</label>
                  <input
                    type="text"
                    value={leaveCodeSearchTerm}
                    onChange={(e) => setLeaveCodeSearchTerm(e.target.value)}
                    autoFocus
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Type to filter..."
                  />
                </div>

                {/* Table */}
                <div
                  className="border border-gray-200 rounded overflow-hidden"
                  style={{ maxHeight: '400px', overflowY: 'auto' }}
                >
                  <table className="w-full border-collapse text-sm">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="bg-gray-100 border-b-2 border-gray-300">
                        <th className="px-3 py-1.5 text-left text-gray-700 text-sm font-semibold">Code</th>
                        <th className="px-3 py-1.5 text-left text-gray-700 text-sm font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {leaveCodesLoading ? (
                        <tr>
                          <td colSpan={2} className="px-3 py-8 text-center text-gray-500 italic">
                            Loading...
                          </td>
                        </tr>
                      ) : filteredLeaveCodes.length > 0 ? (
                        filteredLeaveCodes.map((lc, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                            onClick={() => handleLeaveCodeSelect(lc.code)}
                          >
                            <td className="px-3 py-1.5 text-gray-900 font-medium">{lc.code}</td>
                            <td className="px-3 py-1.5 text-gray-600">{lc.description}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="px-3 py-8 text-center text-gray-500 italic">
                            No entries found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}