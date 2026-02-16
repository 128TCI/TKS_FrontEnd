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

    // Generate year options (from 1900 to current year + 10)
    const years = [];
    const currentYearNow = new Date().getFullYear();
    for (let year = 1900; year <= currentYearNow + 10; year++) {
        years.push(year);
    }

    // Generate day options based on current month
    const daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);
    const days = [];
    for (let day = 1; day <= daysInCurrentMonth; day++) {
        days.push(day);
    }

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

    const handleMonthChange = (month: number) => {
        setCurrentMonth(month);
    };

    const handleYearChange = (year: number) => {
        setCurrentYear(year);
    };

    const handleDayChange = (day: number) => {
        const formattedDate = `${currentMonth + 1}/${day}/${currentYear}`;
        onDateSelect(formattedDate);
        onClose();
    };

    const handleDateClick = (day: number) => {
        const formattedDate = `${currentMonth + 1}/${day}/${currentYear}`;
        onDateSelect(formattedDate);
        onClose();
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const calendarDays = [];

        // Previous month days
        const prevMonthDays = firstDay;
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const daysInPrevMonth = getDaysInMonth(prevMonth, prevMonthYear);

        for (let i = prevMonthDays - 1; i >= 0; i--) {
            calendarDays.push(
                <div key={`prev-${i}`} className="text-center py-2 text-gray-400 text-sm">
                    {daysInPrevMonth - i}
                </div>
            );
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            calendarDays.push(
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
        const remainingDays = 42 - calendarDays.length;
        for (let day = 1; day <= remainingDays; day++) {
            calendarDays.push(
                <div key={`next-${day}`} className="text-center py-2 text-gray-400 text-sm">
                    {day}
                </div>
            );
        }

        return calendarDays;
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Calendar Popup */}
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50" style={{ width: '320px' }}>
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
                    <div className="flex items-center gap-2">
                        <select
                            value={currentMonth}
                            onChange={(e) => handleMonthChange(Number(e.target.value))}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
                        >
                            {monthNames.map((month, index) => (
                                <option key={month} value={index}>
                                    {month}
                                </option>
                            ))}
                        </select>
                        <select
                            onChange={(e) => handleDayChange(Number(e.target.value))}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 w-16"
                        >
                            <option value="">Day</option>
                            {days.map((day) => (
                                <option key={day} value={day}>
                                    {day}
                                </option>
                            ))}
                        </select>
                        <select
                            value={currentYear}
                            onChange={(e) => handleYearChange(Number(e.target.value))}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
                        >
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
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