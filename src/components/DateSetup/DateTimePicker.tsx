import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface DateTimePickerProps {
  dateValue: string;
  timeValue: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  datePlaceholder?: string;
  timePlaceholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DateTimePicker({ 
  dateValue, 
  timeValue,
  onDateChange, 
  onTimeChange,
  datePlaceholder = "MM/DD/YYYY", 
  timePlaceholder = "HH:MM",
  className = "", 
  disabled = false 
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);

  // Parse the date string (MM/DD/YYYY) to Date object
  const parseDate = (dateStr: string): Date | undefined => {
    if (!dateStr) return undefined;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const month = parseInt(parts[0]) - 1; // Months are 0-indexed
      const day = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    return undefined;
  };

  // Format Date object to MM/DD/YYYY string
  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const selectedDate = parseDate(dateValue);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(formatDate(date));
      setOpen(false);
    }
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(e.target.value);
  };

  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTimeChange(e.target.value);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Date Input */}
      <input
        type="text"
        value={dateValue}
        onChange={handleDateInputChange}
        disabled={disabled}
        readOnly={disabled}
        className={`flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
          disabled ? 'bg-gray-50 cursor-not-allowed text-gray-500' : 'bg-white'
        }`}
        placeholder={datePlaceholder}
      />
      
      {/* Calendar Button */}
      <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={`flex items-center justify-center px-2 py-1 rounded transition-colors shadow-sm ${
              disabled 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Time Input */}
      <input
        type="text"
        value={timeValue}
        onChange={handleTimeInputChange}
        disabled={disabled}
        className={`w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
          disabled ? 'bg-gray-50 cursor-not-allowed text-gray-500' : 'bg-white'
        }`}
        placeholder={timePlaceholder}
      />
    </div>
  );
}
