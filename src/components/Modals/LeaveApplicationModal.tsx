import { X, Check, ArrowLeft, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LeaveCodeSearchModal } from './LeaveCodeSearchModal';
import { DatePicker } from '../DateSetup/DatePicker';

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
    onSubmit
}: LeaveApplicationModalProps) {
    const [showLeaveCodeSearch, setShowLeaveCodeSearch] = useState(false);

    // Handle ESC key to close modal (only if search modal is not open)
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen && !showLeaveCodeSearch) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, showLeaveCodeSearch, onClose]);

    if (!isOpen) return null;

    return (
        <>
            {/* Modal Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 z-30"
                onClick={onClose}
            ></div>

            {/* Modal Dialog */}
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                        <h2 className="text-gray-800">{isEditMode ? 'Edit Leave' : 'Create New'}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-5">
                        <h3 className="text-blue-600 mb-4">Leave Applications</h3>

                        {/* Form Fields */}
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

                            {/* LeaveCode */}
                            <div className="flex items-center gap-2">
                                <label className="w-40 text-gray-700">LeaveCode :</label>
                                <input
                                    type="text"
                                    value={leaveCode}
                                    onChange={(e) => onLeaveCodeChange(e.target.value)}
                                    className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    onClick={() => setShowLeaveCodeSearch(true)}>
                                    <Search className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onLeaveCodeChange('')}
                                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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

            {/* Leave Code Search Modal */}
            <LeaveCodeSearchModal
                isOpen={showLeaveCodeSearch}
                onClose={() => setShowLeaveCodeSearch(false)}
                onSelect={onLeaveCodeChange} 
                leaveCodeItems={[]} 
                loading={false} 
                error={''}            
            />
        </>
    );
}