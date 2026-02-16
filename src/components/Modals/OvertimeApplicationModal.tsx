import { X, Check, ArrowLeft } from 'lucide-react';
import { DatePicker } from '../DateSetup/DatePicker';
import { useEffect } from 'react';

interface OvertimeApplicationModalProps {
    isOpen: boolean;
    isEditMode: boolean;
    empCode: string;
    date: string;
    hoursApproved: string;
    actualDateInOTBefore: string;
    startTimeBefore: string;
    startOvertimeDate: string;
    startOvertimeTime: string;
    approvedBreak: string;
    reason: string;
    remarks: string;
    isLateFiling: boolean;
    onClose: () => void;
    onDateChange: (value: string) => void;
    onHoursApprovedChange: (value: string) => void;
    onActualDateInOTBeforeChange: (value: string) => void;
    onStartTimeBeforeChange: (value: string) => void;
    onStartOvertimeDateChange: (value: string) => void;
    onStartOvertimeTimeChange: (value: string) => void;
    onApprovedBreakChange: (value: string) => void;
    onReasonChange: (value: string) => void;
    onRemarksChange: (value: string) => void;
    onIsLateFilingChange: (value: boolean) => void;
    onSubmit: () => void;
}

export function OvertimeApplicationModal({
    isOpen,
    isEditMode,
    empCode,
    date,
    hoursApproved,
    actualDateInOTBefore,
    startTimeBefore,
    startOvertimeDate,
    startOvertimeTime,
    approvedBreak,
    reason,
    remarks,
    isLateFiling,
    onClose,
    onDateChange,
    onHoursApprovedChange,
    onActualDateInOTBeforeChange,
    onStartTimeBeforeChange,
    onStartOvertimeDateChange,
    onStartOvertimeTimeChange,
    onApprovedBreakChange,
    onReasonChange,
    onRemarksChange,
    onIsLateFilingChange,
    onSubmit
}: OvertimeApplicationModalProps) {
    // ESC key handler
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [isOpen, onClose]);

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
                        <h2 className="text-gray-800">{isEditMode ? 'Edit Overtime' : 'Create New'}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-5">
                        <h3 className="text-blue-600 mb-4">Overtime Applications</h3>

                        {/* Form Fields */}
                        <div className="space-y-3">
                            {/* Emp Code */}
                            <div className="flex items-center gap-2">
                                <label className="w-40 text-gray-700">EmpCode :</label>
                                <input
                                    type="text"
                                    value={empCode}
                                    readOnly
                                    className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            {/* Date */}
                            <div className="flex items-center gap-2">
                                <label className="w-40 text-gray-700">Date :</label>
                                <DatePicker
                                    value={date}
                                    onChange={onDateChange}
                                    className="flex-1 text-small"
                                />
                            </div>

                            {/* Hours Approved */}
                            <div className="flex items-center gap-2">
                                <label className="w-40 text-gray-700">No. of Hours Approved :</label>
                                <input
                                    type="text"
                                    value={hoursApproved}
                                    onChange={(e) => onHoursApprovedChange(e.target.value)}
                                    className="w-40 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="[hh.mm]"
                                />
                                <span className="text-gray-500 text-sm">[hh.mm]</span>
                            </div>

                            {/* Start Time of OT Before the Shift */}
                            <div className="flex items-center gap-2">
                                <label className="w-40 text-gray-700">Start Time of OT Before the Shift :</label>
                                <DatePicker
                                    value={date}
                                    onChange={onDateChange}
                                    className="flex-1 text-small"
                                />
                            </div>

                            {/* Employee OT Information */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                                {/* Start Time of Overtime - Header */}
                                <div>
                                    <label className="text-gray-700">Start Time of Overtime :</label>
                                </div>

                                {/* Date under Start Time of Overtime */}
                                <div className="flex items-center gap-2">
                                    <label className="w-40 text-gray-700">Date :</label>
                                    <DatePicker
                                        value={startOvertimeDate}
                                        onChange={onStartOvertimeDateChange}
                                        className="flex-1"
                                    />
                                </div>

                                {/* Time under Start Time of Overtime */}
                                <div className="flex items-center gap-2">
                                    <label className="w-40 text-gray-700">Time:</label>
                                    <input
                                        type="text"
                                        value={startOvertimeTime}
                                        onChange={(e) => onStartOvertimeTimeChange(e.target.value)}
                                        className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="HH:MM"
                                    />
                                </div>

                                {/* Approved OT Break Hrs */}
                                <div className="flex items-center gap-2">
                                    <label className="w-40 text-gray-700 text-sm">Approved OT Break Hrs :</label>
                                    <input
                                        type="text"
                                        value={approvedBreak}
                                        onChange={(e) => onApprovedBreakChange(e.target.value)}
                                        className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="[hh.mm]"
                                    />
                                    <span className="text-gray-500 text-sm">[hh.mm]</span>
                                </div>

                                {/* Reason */}
                                <div className="flex items-center gap-2">
                                    <label className="w-40 text-gray-700">Reason :</label>
                                    <input
                                        type="text"
                                        value={reason}
                                        onChange={(e) => onReasonChange(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                {/* Remarks */}
                                <div className="flex items-center gap-2">
                                    <label className="w-40 text-gray-700">Remarks :</label>
                                    <input
                                        type="text"
                                        value={remarks}
                                        onChange={(e) => onRemarksChange(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                        </div>

                        {/* Modal Actions */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={onSubmit}
                                className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
                            >
                                {isEditMode ? 'Update' : 'Submit'}
                            </button>
                            <button
                                onClick={onClose}
                                className="px-5 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
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