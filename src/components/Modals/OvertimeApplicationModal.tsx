import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { CalendarPopup } from '../CalendarPopup';
import { TimePicker } from '../Modals/TimePickerModal';

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

// ─── Helpers (same as RawDataPage) ───────────────────────────────────────────

const validateTimeFormat = (value: string): string => {
    const trimmed = value.trim().toUpperCase();
    if (!trimmed) return '';
    const timeRegex = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;
    if (timeRegex.test(trimmed)) {
        const match = trimmed.match(timeRegex)!;
        return `${match[1].padStart(2, '0')}:${match[2]} ${match[3].toUpperCase()}`;
    }
    return value;
};

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

    // ── Calendar / TimePicker visibility state ──
    const [showDateCalendar, setShowDateCalendar] = useState(false);
    const [showActualDateOTBeforeCalendar, setShowActualDateOTBeforeCalendar] = useState(false);
    const [showStartTimeBeforePicker, setShowStartTimeBeforePicker] = useState(false);
    const [showStartOvertimeDateCalendar, setShowStartOvertimeDateCalendar] = useState(false);
    const [showStartOvertimeTimePicker, setShowStartOvertimeTimePicker] = useState(false);

    // ESC key handler
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key !== 'Escape' || !isOpen) return;
            // Close pickers first, then modal
            if (showDateCalendar)               { setShowDateCalendar(false);               return; }
            if (showActualDateOTBeforeCalendar) { setShowActualDateOTBeforeCalendar(false); return; }
            if (showStartTimeBeforePicker)      { setShowStartTimeBeforePicker(false);      return; }
            if (showStartOvertimeDateCalendar)  { setShowStartOvertimeDateCalendar(false);  return; }
            if (showStartOvertimeTimePicker)    { setShowStartOvertimeTimePicker(false);    return; }
            onClose();
        };

        document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [
        isOpen, onClose,
        showDateCalendar, showActualDateOTBeforeCalendar,
        showStartTimeBeforePicker, showStartOvertimeDateCalendar,
        showStartOvertimeTimePicker,
    ]);

    if (!isOpen) return null;

    // ── Reusable date field renderer (same pattern as RawDataPage) ──
    const renderDateField = (
        label: string,
        value: string,
        onChange: (v: string) => void,
        showCal: boolean,
        setShowCal: (v: boolean) => void,
        labelWidth = 'w-40'
    ) => (
        <div className="flex items-center gap-2">
            <label className={`${labelWidth} text-gray-700 text-sm flex-shrink-0`}>{label} :</label>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder="MM/DD/YYYY"
                    className="w-36 px-3 py-1.5 border border-gray-300 rounded text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="button"
                    onClick={() => setShowCal(!showCal)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    <Calendar className="w-3.5 h-3.5" />
                </button>
                {showCal && (
                    <CalendarPopup
                        onDateSelect={d => { onChange(d); setShowCal(false); }}
                        onClose={() => setShowCal(false)}
                    />
                )}
            </div>
        </div>
    );

    // ── Reusable time field renderer (same pattern as RawDataPage) ──
    const renderTimeField = (
        label: string,
        value: string,
        onChange: (v: string) => void,
        showPicker: boolean,
        setShowPicker: (v: boolean) => void,
        labelWidth = 'w-40'
    ) => (
        <div className="flex items-center gap-2">
            <label className={`${labelWidth} text-gray-700 text-sm flex-shrink-0`}>{label} :</label>
            <div className="relative w-44">
                <input
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onBlur={() => onChange(validateTimeFormat(value))}
                    placeholder="HH:MM AM/PM"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="button"
                    onClick={() => setShowPicker(!showPicker)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    <Calendar className="w-3.5 h-3.5" />
                </button>
                {showPicker && (
                    <TimePicker
                        initialTime={value}
                        onTimeSelect={time => { onChange(time); setShowPicker(false); }}
                        onClose={() => setShowPicker(false)}
                    />
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Modal Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-30"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">

                    {/* Modal Header */}
                    <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between sticky top-0 z-10 rounded-t-2xl">
                        <h2 className="text-gray-800 font-semibold text-sm">
                            {isEditMode ? 'Edit Overtime' : 'Create New'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-5">
                        <h3 className="text-blue-600 font-medium mb-4">Overtime Applications</h3>

                        <div className="space-y-3">

                            {/* Emp Code — read-only */}
                            <div className="flex items-center gap-2">
                                <label className="w-40 text-gray-700 text-sm flex-shrink-0">EmpCode :</label>
                                <input
                                    type="text"
                                    value={empCode}
                                    readOnly
                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm bg-gray-50 focus:outline-none"
                                />
                            </div>

                            {/* Date */}
                            {renderDateField(
                                'Date',
                                date,
                                onDateChange,
                                showDateCalendar,
                                setShowDateCalendar
                            )}

                            {/* No. of Hours Approved */}
                            <div className="flex items-center gap-2">
                                <label className="w-40 text-gray-700 text-sm flex-shrink-0">No. of Hours Approved :</label>
                                <input
                                    type="text"
                                    value={hoursApproved}
                                    onChange={e => onHoursApprovedChange(e.target.value)}
                                    placeholder="[hh.mm]"
                                    className="w-36 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-gray-400 text-xs">[hh.mm]</span>
                            </div>

                            {/* Start Time of OT Before the Shift */}
                            <div className="flex items-center gap-2">
                                <label className="w-40 text-gray-700 text-sm flex-shrink-0">Start Time of OT Before the Shift :</label>
                                <div className="flex flex-col gap-2">
                                    {/* Actual Date In OT Before */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={actualDateInOTBefore}
                                            onChange={e => onActualDateInOTBeforeChange(e.target.value)}
                                            placeholder="MM/DD/YYYY"
                                            className="w-36 px-3 py-1.5 border border-gray-300 rounded text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowActualDateOTBeforeCalendar(!showActualDateOTBeforeCalendar)}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                        >
                                            <Calendar className="w-3.5 h-3.5" />
                                        </button>
                                        {showActualDateOTBeforeCalendar && (
                                            <CalendarPopup
                                                onDateSelect={d => { onActualDateInOTBeforeChange(d); setShowActualDateOTBeforeCalendar(false); }}
                                                onClose={() => setShowActualDateOTBeforeCalendar(false)}
                                            />
                                        )}
                                    </div>

                                    {/* Start Time Before */}
                                    <div className="relative w-44">
                                        <input
                                            type="text"
                                            value={startTimeBefore}
                                            onChange={e => onStartTimeBeforeChange(e.target.value)}
                                            onBlur={() => onStartTimeBeforeChange(validateTimeFormat(startTimeBefore))}
                                            placeholder="HH:MM AM/PM"
                                            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowStartTimeBeforePicker(!showStartTimeBeforePicker)}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                        >
                                            <Calendar className="w-3.5 h-3.5" />
                                        </button>
                                        {showStartTimeBeforePicker && (
                                            <TimePicker
                                                initialTime={startTimeBefore}
                                                onTimeSelect={time => { onStartTimeBeforeChange(time); setShowStartTimeBeforePicker(false); }}
                                                onClose={() => setShowStartTimeBeforePicker(false)}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Employee OT Information Panel */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">

                                <label className="text-gray-700 text-sm font-medium">Start Time of Overtime :</label>

                                {/* Date under Start Time of Overtime */}
                                {renderDateField(
                                    'Date',
                                    startOvertimeDate,
                                    onStartOvertimeDateChange,
                                    showStartOvertimeDateCalendar,
                                    setShowStartOvertimeDateCalendar
                                )}

                                {/* Time under Start Time of Overtime */}
                                {renderTimeField(
                                    'Time',
                                    startOvertimeTime,
                                    onStartOvertimeTimeChange,
                                    showStartOvertimeTimePicker,
                                    setShowStartOvertimeTimePicker
                                )}

                                {/* Approved OT Break Hrs */}
                                <div className="flex items-center gap-2">
                                    <label className="w-40 text-gray-700 text-sm flex-shrink-0">Approved OT Break Hrs :</label>
                                    <input
                                        type="text"
                                        value={approvedBreak}
                                        onChange={e => onApprovedBreakChange(e.target.value)}
                                        placeholder="[hh.mm]"
                                        className="w-36 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-400 text-xs">[hh.mm]</span>
                                </div>

                                {/* Reason */}
                                <div className="flex items-center gap-2">
                                    <label className="w-40 text-gray-700 text-sm flex-shrink-0">Reason :</label>
                                    <input
                                        type="text"
                                        value={reason}
                                        onChange={e => onReasonChange(e.target.value)}
                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Remarks */}
                                <div className="flex items-center gap-2">
                                    <label className="w-40 text-gray-700 text-sm flex-shrink-0">Remarks :</label>
                                    <input
                                        type="text"
                                        value={remarks}
                                        onChange={e => onRemarksChange(e.target.value)}
                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Is Late Filing */}
                                <div className="flex items-center gap-2">
                                    <label className="w-40 text-gray-700 text-sm flex-shrink-0">Is Late Filing :</label>
                                    <input
                                        type="checkbox"
                                        checked={isLateFiling}
                                        onChange={e => onIsLateFilingChange(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
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