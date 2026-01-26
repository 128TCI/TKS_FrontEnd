import { useState } from 'react';

interface CalendarPopupProps {
    onDateSelect: (date: string) => void;
    onClose: () => void;
}

export function CalendarPopup({ onDateSelect, onClose }: CalendarPopupProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleDateClick = (day: number) => {
        const formattedDate = `${currentMonth + 1}/${day}/${currentYear}`;
        onDateSelect(formattedDate);
        onClose();
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const days = [];

        // Previous month days
        const prevMonthDays = firstDay;
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const daysInPrevMonth = getDaysInMonth(prevMonth, prevMonthYear);

        for (let i = prevMonthDays - 1; i >= 0; i--) {
            days.push(
                <div key={`prev-${i}`} className="text-center py-2 text-gray-400 text-sm">
                    {daysInPrevMonth - i}
                </div>
            );
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(
                <div
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className="text-center py-2 text-sm hover:bg-blue-100 cursor-pointer rounded"
                >
                    {day}
                </div>
            );
        }

        // Next month days
        const remainingDays = 42 - days.length;
        for (let day = 1; day <= remainingDays; day++) {
            days.push(
                <div key={`next-${day}`} className="text-center py-2 text-gray-400 text-sm">
                    {day}
                </div>
            );
        }

        return days;
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Calendar Popup */}
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50" style={{ width: '280px' }}>
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-3">
                    <button
                        onClick={handlePrevMonth}
                        type="button"
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="text-sm font-medium">
                        {monthNames[currentMonth]} {currentYear}
                    </div>
                    <button
                        onClick={handleNextMonth}
                        type="button"
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Day Headers */}
                    <div className="text-center text-xs font-medium text-gray-600 py-1">Su</div>
                    <div className="text-center text-xs font-medium text-gray-600 py-1">Mo</div>
                    <div className="text-center text-xs font-medium text-gray-600 py-1">Tu</div>
                    <div className="text-center text-xs font-medium text-gray-600 py-1">We</div>
                    <div className="text-center text-xs font-medium text-gray-600 py-1">Th</div>
                    <div className="text-center text-xs font-medium text-gray-600 py-1">Fr</div>
                    <div className="text-center text-xs font-medium text-gray-600 py-1">Sa</div>

                    {/* Calendar Days */}
                    {renderCalendar()}
                </div>
            </div>
        </>
    );
}
