import { X, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CalendarPopup } from '../CalendarPopup';

interface RestDayVariableModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  empCode: string;
  dateFrom: string;
  dateTo: string;
  restDay1: string;
  restDay2: string;
  restDay3: string;
  onClose: () => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onRestDay1Change: (value: string) => void;
  onRestDay2Change: (value: string) => void;
  onRestDay3Change: (value: string) => void;
  onSubmit: () => void;
}

const DAY_OPTIONS = [
  { value: '',          label: 'Select Day'  },
  { value: 'Monday',    label: 'Monday'      },
  { value: 'Tuesday',   label: 'Tuesday'     },
  { value: 'Wednesday', label: 'Wednesday'   },
  { value: 'Thursday',  label: 'Thursday'    },
  { value: 'Friday',    label: 'Friday'      },
  { value: 'Saturday',  label: 'Saturday'    },
  { value: 'Sunday',    label: 'Sunday'      },
];

export function RestDayVariableModal({
  isOpen, isEditMode, empCode,
  dateFrom, dateTo, restDay1, restDay2, restDay3,
  onClose, onDateFromChange, onDateToChange,
  onRestDay1Change, onRestDay2Change, onRestDay3Change,
  onSubmit,
}: RestDayVariableModalProps) {

  const [showDateFromCal, setShowDateFromCal] = useState(false);
  const [showDateToCal,   setShowDateToCal]   = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !isOpen) return;
      if (showDateFromCal) { setShowDateFromCal(false); return; }
      if (showDateToCal)   { setShowDateToCal(false);   return; }
      onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, showDateFromCal, showDateToCal, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-30" onClick={onClose} />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">

          {/* Header */}
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between sticky top-0 z-10 rounded-t-2xl">
            <h2 className="text-gray-800 font-semibold text-sm">
              {isEditMode ? 'Edit Variable Rest Day' : 'Add Variable Rest Day'}
            </h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5">
            <h3 className="text-blue-600 font-medium mb-4">Variable Rest Day Information</h3>

            <div className="space-y-3">

              {/* EmpCode */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700 text-sm flex-shrink-0">EmpCode :</label>
                <input type="text" value={empCode} readOnly
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm bg-gray-100 focus:outline-none" />
              </div>

              {/* Date From */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700 text-sm flex-shrink-0">Date From :</label>
                <div className="relative">
                  <input type="text" value={dateFrom}
                    onChange={e => onDateFromChange(e.target.value)}
                    placeholder="MM/DD/YYYY"
                    className="w-36 px-3 py-1.5 border border-gray-300 rounded text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button type="button"
                    onClick={() => setShowDateFromCal(v => !v)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    <Calendar className="w-3.5 h-3.5" />
                  </button>
                  {showDateFromCal && (
                    <CalendarPopup
                      onDateSelect={d => { onDateFromChange(d); setShowDateFromCal(false); }}
                      onClose={() => setShowDateFromCal(false)} />
                  )}
                </div>
              </div>

              {/* Date To */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700 text-sm flex-shrink-0">Date To :</label>
                <div className="relative">
                  <input type="text" value={dateTo}
                    onChange={e => onDateToChange(e.target.value)}
                    placeholder="MM/DD/YYYY"
                    className="w-36 px-3 py-1.5 border border-gray-300 rounded text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button type="button"
                    onClick={() => setShowDateToCal(v => !v)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    <Calendar className="w-3.5 h-3.5" />
                  </button>
                  {showDateToCal && (
                    <CalendarPopup
                      onDateSelect={d => { onDateToChange(d); setShowDateToCal(false); }}
                      onClose={() => setShowDateToCal(false)} />
                  )}
                </div>
              </div>

              {/* Rest Day 1 */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700 text-sm flex-shrink-0">Rest Day 1 :</label>
                <select value={restDay1} onChange={e => onRestDay1Change(e.target.value)}
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                  {DAY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* Rest Day 2 */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700 text-sm flex-shrink-0">Rest Day 2 :</label>
                <select value={restDay2} onChange={e => onRestDay2Change(e.target.value)}
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                  {DAY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* Rest Day 3 */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700 text-sm flex-shrink-0">Rest Day 3 :</label>
                <select value={restDay3} onChange={e => onRestDay3Change(e.target.value)}
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                  {DAY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              <button onClick={onSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm">
                {isEditMode ? 'Update' : 'Add'}
              </button>
              <button onClick={onClose}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-sm text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}