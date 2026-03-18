import { X, Search, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CalendarPopup } from '../CalendarPopup';

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
  leaveCodes?: LeaveCode[];
  leaveCodesLoading?: boolean;
}

export function LeaveApplicationModal({
  isOpen, isEditMode, empCode,
  date, hoursApproved, leaveCode, period, reason, remarks,
  withPay, sssNotification, isLateFiling,
  onClose, onDateChange, onHoursApprovedChange, onLeaveCodeChange,
  onPeriodChange, onReasonChange, onRemarksChange,
  onWithPayChange, onSssNotificationChange, onIsLateFilingChange,
  onSubmit,
  leaveCodes = [], leaveCodesLoading = false,
}: LeaveApplicationModalProps) {

  const [showDateCal,         setShowDateCal]         = useState(false);
  const [showLeaveCodeDialog, setShowLeaveCodeDialog] = useState(false);
  const [leaveCodeSearchTerm, setLeaveCodeSearchTerm] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !isOpen) return;
      if (showDateCal)         { setShowDateCal(false);         return; }
      if (showLeaveCodeDialog) { setShowLeaveCodeDialog(false); return; }
      onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, showDateCal, showLeaveCodeDialog, onClose]);

  if (!isOpen) return null;

  const filteredLeaveCodes = (Array.isArray(leaveCodes) ? leaveCodes : []).filter(lc =>
    (lc.code?.toLowerCase()        || '').includes(leaveCodeSearchTerm.toLowerCase()) ||
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
      <div className="fixed inset-0 bg-black/50 z-30" onClick={onClose} />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">

          {/* Header */}
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between sticky top-0 z-10 rounded-t-2xl">
            <h2 className="text-gray-800 font-semibold text-sm">
              {isEditMode ? 'Edit Leave' : 'Create New'}
            </h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5">
            <h3 className="text-blue-600 font-medium mb-4">Leave Applications</h3>

            <div className="space-y-3">

              {/* EmpCode */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700 text-sm flex-shrink-0">EmpCode :</label>
                <input type="text" value={empCode} readOnly
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm bg-gray-100 focus:outline-none" />
              </div>

              {/* Date — CalendarPopup same as OvertimeApplicationModal */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700 text-sm flex-shrink-0">Date :</label>
                <div className="relative">
                  <input type="text" value={date}
                    onChange={e => onDateChange(e.target.value)}
                    placeholder="MM/DD/YYYY"
                    className="w-36 px-3 py-1.5 border border-gray-300 rounded text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button type="button"
                    onClick={() => setShowDateCal(v => !v)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    <Calendar className="w-3.5 h-3.5" />
                  </button>
                  {showDateCal && (
                    <CalendarPopup
                      onDateSelect={d => { onDateChange(d); setShowDateCal(false); }}
                      onClose={() => setShowDateCal(false)} />
                  )}
                </div>
              </div>

              {/* No of Hours Approved */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700 text-sm flex-shrink-0">No of Hours Approved :</label>
                <input type="text" value={hoursApproved}
                  onChange={e => onHoursApprovedChange(e.target.value)}
                  placeholder="[hh.mm]"
                  className="w-32 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <span className="text-gray-500 text-xs">[hh.mm]</span>
              </div>

              {/* Leave Code */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700 text-sm flex-shrink-0">LeaveCode :</label>
                <input type="text" value={leaveCode} readOnly
                  placeholder="Select leave code..."
                  onClick={() => { setLeaveCodeSearchTerm(''); setShowLeaveCodeDialog(true); }}
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm bg-gray-50 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <button type="button"
                  onClick={() => { setLeaveCodeSearchTerm(''); setShowLeaveCodeDialog(true); }}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-shrink-0">
                  <Search className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => onLeaveCodeChange('')}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Period */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700 text-sm flex-shrink-0">Period :</label>
                <select value={period} onChange={e => onPeriodChange(e.target.value)}
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value=""></option>
                  <option value="1ST HALF">1ST HALF</option>
                  <option value="2ND HALF">2ND HALF</option>
                  <option value="WITHIN THE SHIFT">WITHIN THE SHIFT</option>
                </select>
              </div>

              {/* Reason */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700 text-sm flex-shrink-0">Reason :</label>
                <input type="text" value={reason} onChange={e => onReasonChange(e.target.value)}
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>

              {/* Remarks */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700 text-sm flex-shrink-0">Remarks :</label>
                <input type="text" value={remarks} onChange={e => onRemarksChange(e.target.value)}
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>

              {/* With Pay */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700 text-sm flex-shrink-0">With Pay :</label>
                <input type="checkbox" checked={withPay} onChange={e => onWithPayChange(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              </div>

              {/* SSS Notification */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700 text-sm flex-shrink-0">SSS Notification :</label>
                <input type="checkbox" checked={sssNotification} onChange={e => onSssNotificationChange(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              </div>

              {/* Is Late Filing */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700 text-sm flex-shrink-0">Is Late Filing :</label>
                <input type="checkbox" checked={isLateFiling} onChange={e => onIsLateFilingChange(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              </div>

            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              <button onClick={onSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm">
                {isEditMode ? 'Update' : 'Submit'}
              </button>
              <button onClick={onClose}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-sm text-sm">
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Code Search Portal */}
      {showLeaveCodeDialog && createPortal(
        <>
          <div className="fixed inset-0 bg-black/50" style={{ zIndex: 99998 }} onClick={handleCloseSearch} />
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                <h2 className="text-gray-800 text-sm font-semibold">Search Leave Code</h2>
                <button onClick={handleCloseSearch} className="text-gray-600 hover:text-gray-800">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3">
                <h3 className="text-blue-600 mb-2 text-sm font-semibold">Leave Code</h3>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap">Search:</label>
                  <input type="text" value={leaveCodeSearchTerm}
                    onChange={e => setLeaveCodeSearchTerm(e.target.value)}
                    autoFocus placeholder="Type to filter..."
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div className="border border-gray-200 rounded overflow-hidden" style={{ maxHeight: 400, overflowY: 'auto' }}>
                  <table className="w-full border-collapse text-sm">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="bg-gray-100 border-b-2 border-gray-300">
                        <th className="px-3 py-1.5 text-left text-gray-700 font-semibold">Code</th>
                        <th className="px-3 py-1.5 text-left text-gray-700 font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {leaveCodesLoading ? (
                        <tr><td colSpan={2} className="px-3 py-8 text-center text-gray-500 italic">Loading...</td></tr>
                      ) : filteredLeaveCodes.length > 0 ? (
                        filteredLeaveCodes.map((lc, idx) => (
                          <tr key={idx} className="hover:bg-blue-50 cursor-pointer"
                            onClick={() => handleLeaveCodeSelect(lc.code)}>
                            <td className="px-3 py-1.5 text-gray-900 font-medium">{lc.code}</td>
                            <td className="px-3 py-1.5 text-gray-600">{lc.description}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={2} className="px-3 py-8 text-center text-gray-500 italic">No entries found</td></tr>
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