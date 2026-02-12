import { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';

interface TimePickerProps {
    onTimeSelect: (time: string) => void;
    onClose: () => void;
    initialTime?: string;
}

export function TimePicker({ onTimeSelect, onClose, initialTime = '' }: TimePickerProps) {
    const [hours, setHours] = useState('12');
    const [minutes, setMinutes] = useState('00');
    const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

    useEffect(() => {
        // Parse initial time if provided
        if (initialTime) {
            const match = initialTime.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
            if (match) {
                setHours(match[1].padStart(2, '0'));
                setMinutes(match[2]);
                setPeriod(match[3].toUpperCase() as 'AM' | 'PM');
            }
        }
    }, [initialTime]);

    const handleConfirm = () => {
        const formattedTime = `${hours.padStart(2, '0')}:${minutes} ${period}`;
        onTimeSelect(formattedTime);
        onClose();
    };

    const hourOptions = Array.from({ length: 12 }, (_, i) => {
        const h = i + 1;
        return h.toString().padStart(2, '0');
    });

    const minuteOptions = Array.from({ length: 60 }, (_, i) => {
        return i.toString().padStart(2, '0');
    });

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/20 z-40"
                onClick={onClose}
            />
            
            {/* Picker Modal */}
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 w-80">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 rounded-t-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-white" />
                        <h3 className="text-sm font-semibold text-white">Select Time</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Time Display */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-center gap-2 text-4xl font-bold text-gray-800">
                        <span className="bg-white px-4 py-2 rounded-lg shadow-sm min-w-[70px] text-center">
                            {hours}
                        </span>
                        <span className="text-gray-400">:</span>
                        <span className="bg-white px-4 py-2 rounded-lg shadow-sm min-w-[70px] text-center">
                            {minutes}
                        </span>
                        <span className="bg-white px-4 py-2 rounded-lg shadow-sm min-w-[70px] text-center text-2xl">
                            {period}
                        </span>
                    </div>
                </div>

                {/* Selectors */}
                <div className="p-4">
                    <div className="grid grid-cols-3 gap-3">
                        {/* Hours Dropdown */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                                Hour
                            </label>
                            <div className="relative">
                                <select
                                    value={hours}
                                    onChange={(e) => setHours(e.target.value)}
                                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-semibold appearance-none bg-white cursor-pointer hover:border-gray-300 transition-colors"
                                >
                                    {hourOptions.map(h => (
                                        <option key={h} value={h}>{h}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Minutes Dropdown */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                                Minute
                            </label>
                            <div className="relative">
                                <select
                                    value={minutes}
                                    onChange={(e) => setMinutes(e.target.value)}
                                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-semibold appearance-none bg-white cursor-pointer hover:border-gray-300 transition-colors"
                                >
                                    {minuteOptions.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* AM/PM Toggle */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                                Period
                            </label>
                            <div className="flex flex-col gap-1">
                                <button
                                    type="button"
                                    onClick={() => setPeriod('AM')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                                        period === 'AM'
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    AM
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPeriod('PM')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                                        period === 'PM'
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    PM
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Select Buttons */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                            Quick Select
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { label: '9:00 AM', h: '09', m: '00', p: 'AM' },
                                { label: '12:00 PM', h: '12', m: '00', p: 'PM' },
                                { label: '1:00 PM', h: '01', m: '00', p: 'PM' },
                                { label: '5:00 PM', h: '05', m: '00', p: 'PM' },
                            ].map(({ label, h, m, p }) => (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => {
                                        setHours(h);
                                        setMinutes(m);
                                        setPeriod(p as 'AM' | 'PM');
                                    }}
                                    className="px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="px-4 pb-4 flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold shadow-sm"
                    >
                        OK
                    </button>
                </div>
            </div>
        </>
    );
}