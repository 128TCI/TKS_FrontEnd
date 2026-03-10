import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface WorkshiftCode {
  code: string;
  description: string;
}

interface WorkshiftVariableModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  empCode: string;
  dateFrom: string;
  dateTo: string;
  shiftCode: string;
  dailyScheduleCode: string;
  glCode: string;
  onClose: () => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onShiftCodeChange: (value: string) => void;
  onDailyScheduleCodeChange: (value: string) => void;
  onGLCodeChange: (value: string) => void;
  onSubmit: () => void;
  workshiftCodes?: WorkshiftCode[];
  workshiftCodesLoading?: boolean;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function parseDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

function formatDisplay(value: string): string {
  const d = parseDate(value);
  if (!d) return '';
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

function toISODate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

interface DatePickerProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

function DatePicker({ value, onChange, placeholder = 'Select date...' }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const selected = parseDate(value);
  const today = new Date();

  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());
  const [dayFilter, setDayFilter] = useState<number | null>(selected?.getDate() ?? null);

  useEffect(() => {
    const d = parseDate(value);
    if (d) {
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
      setDayFilter(d.getDate());
    } else {
      setDayFilter(null);
    }
  }, [value]);

  const openCalendar = () => setOpen(v => !v);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        anchorRef.current && !anchorRef.current.contains(target) &&
        calendarRef.current && !calendarRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const totalDays = daysInMonth(viewYear, viewMonth);
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();

  const handleDayClick = (day: number) => {
    setDayFilter(day);
    onChange(toISODate(viewYear, viewMonth, day));
    setOpen(false);
  };

  const handleMonthChange = (monthIdx: number) => {
    setViewMonth(monthIdx);
    if (dayFilter !== null) {
      const clamped = Math.min(dayFilter, daysInMonth(viewYear, monthIdx));
      setDayFilter(clamped);
      onChange(toISODate(viewYear, monthIdx, clamped));
    }
  };

  const handleYearChange = (year: number) => {
    setViewYear(year);
    if (dayFilter !== null) {
      const clamped = Math.min(dayFilter, daysInMonth(year, viewMonth));
      setDayFilter(clamped);
      onChange(toISODate(year, viewMonth, clamped));
    }
  };

  const handleDayDropdown = (val: string) => {
    if (val === '') { setDayFilter(null); onChange(''); return; }
    const day = parseInt(val, 10);
    setDayFilter(day);
    onChange(toISODate(viewYear, viewMonth, day));
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const years = Array.from({ length: 20 }, (_, i) => today.getFullYear() - 5 + i);

  const calendarJSX = open ? (
    <>
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 99998, background: 'rgba(0,0,0,0.4)' }}
        onMouseDown={() => setOpen(false)}
      />
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onMouseDown={() => setOpen(false)}
      >
        <div
          ref={calendarRef}
          style={{ width: 340 }}
          className="bg-white border border-gray-200 rounded-xl shadow-2xl"
          onMouseDown={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100">
            <button type="button" onClick={prevMonth} className="p-1 rounded hover:bg-gray-100 text-gray-600">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <select
              value={viewMonth}
              onChange={e => handleMonthChange(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <select
              value={dayFilter ?? ''}
              onChange={e => handleDayDropdown(e.target.value)}
              className="text-sm border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 w-16"
            >
              <option value="">Day</option>
              {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              value={viewYear}
              onChange={e => handleYearChange(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button type="button" onClick={nextMonth} className="p-1 rounded hover:bg-gray-100 text-gray-600 ml-auto">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 px-2 pt-2 pb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-500 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 px-2 pb-3 gap-y-0.5">
            {Array.from({ length: firstDow }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
              const isSelected =
                selected &&
                selected.getFullYear() === viewYear &&
                selected.getMonth() === viewMonth &&
                selected.getDate() === day;
              const isToday =
                today.getFullYear() === viewYear &&
                today.getMonth() === viewMonth &&
                today.getDate() === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`text-sm w-full aspect-square rounded-full flex items-center justify-center transition-colors
                    ${isSelected
                      ? 'bg-blue-600 text-white font-semibold'
                      : isToday
                      ? 'border border-blue-400 text-blue-600 font-semibold hover:bg-blue-50'
                      : 'text-gray-700 hover:bg-blue-50'}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  ) : null;

  return (
    <div ref={anchorRef} className="relative flex-1">
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={formatDisplay(value)}
          placeholder={placeholder}
          onClick={openCalendar}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <button
          type="button"
          onClick={openCalendar}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
        >
          <Calendar className="w-4 h-4" />
        </button>
      </div>

      {open && createPortal(calendarJSX, document.body)}
    </div>
  );
}

export function WorkshiftVariableModal({
  isOpen,
  isEditMode,
  empCode,
  dateFrom,
  dateTo,
  shiftCode,
  dailyScheduleCode,
  glCode,
  onClose,
  onDateFromChange,
  onDateToChange,
  onShiftCodeChange,
  onDailyScheduleCodeChange,
  onGLCodeChange,
  onSubmit,
  workshiftCodes = [],
  workshiftCodesLoading = false,
}: WorkshiftVariableModalProps) {
  const [showShiftCodeDialog, setShowShiftCodeDialog] = useState(false);
  const [shiftSearchTerm, setShiftSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredShiftCodes = workshiftCodes.filter(
    (ws) =>
      ws.code.toLowerCase().includes(shiftSearchTerm.toLowerCase()) ||
      ws.description.toLowerCase().includes(shiftSearchTerm.toLowerCase())
  );

  const handleShiftCodeSelect = (code: string) => {
    onShiftCodeChange(code);
    setShowShiftCodeDialog(false);
    setShiftSearchTerm('');
  };

  const handleCloseSearch = () => {
    setShowShiftCodeDialog(false);
    setShiftSearchTerm('');
  };

  return (
    <>
      {/* Main modal backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Main modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        {/* overflow-visible prevents the modal box from clipping the calendar portal */}
        <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-2xl overflow-visible">
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between rounded-t-lg">
            <h2 className="text-gray-800 text-sm font-medium">
              {isEditMode ? 'Edit' : 'Add'} Variable Workshift
            </h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-44 flex-shrink-0">Employee Code</label>
              <input
                type="text"
                value={empCode}
                disabled
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-44 flex-shrink-0">Date From</label>
              <DatePicker value={dateFrom} onChange={onDateFromChange} placeholder="Select date from..." />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-44 flex-shrink-0">Date To</label>
              <DatePicker value={dateTo} onChange={onDateToChange} placeholder="Select date to..." />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-44 flex-shrink-0">Shift Code</label>
              <input
                type="text"
                value={shiftCode}
                readOnly
                placeholder="Select shift code..."
                onClick={() => { setShiftSearchTerm(''); setShowShiftCodeDialog(true); }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                type="button"
                onClick={() => { setShiftSearchTerm(''); setShowShiftCodeDialog(true); }}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-shrink-0"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onShiftCodeChange('')}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-44 flex-shrink-0">Daily Schedule Code</label>
              <input
                type="text"
                value={dailyScheduleCode}
                onChange={(e) => onDailyScheduleCodeChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-44 flex-shrink-0">GL Code</label>
              <input
                type="text"
                value={glCode}
                onChange={(e) => onGLCodeChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                {isEditMode ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showShiftCodeDialog && createPortal(
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
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                <h2 className="text-gray-800 text-sm font-semibold">Search</h2>
                <button onClick={handleCloseSearch} className="text-gray-600 hover:text-gray-800">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3">
                <h3 className="text-blue-600 mb-2 text-sm font-semibold">Workshift Code</h3>

                <div className="flex items-center gap-2 mb-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap">Search:</label>
                  <input
                    type="text"
                    value={shiftSearchTerm}
                    onChange={(e) => setShiftSearchTerm(e.target.value)}
                    autoFocus
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Type to filter..."
                  />
                </div>

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
                      {workshiftCodesLoading ? (
                        <tr>
                          <td colSpan={2} className="px-3 py-8 text-center text-gray-500 italic">
                            Loading...
                          </td>
                        </tr>
                      ) : filteredShiftCodes.length > 0 ? (
                        filteredShiftCodes.map((ws, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                            onClick={() => handleShiftCodeSelect(ws.code)}
                          >
                            <td className="px-3 py-1.5 text-gray-900 font-medium">{ws.code}</td>
                            <td className="px-3 py-1.5 text-gray-600">{ws.description}</td>
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