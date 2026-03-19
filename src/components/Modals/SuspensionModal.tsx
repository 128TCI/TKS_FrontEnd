import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { CalendarPopup } from '../CalendarPopup';

interface SuspensionModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  dateFrom: string;
  dateTo: string;
  onClose: () => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onSubmit: () => void;
}

export function SuspensionModal({
  isOpen,
  isEditMode,
  dateFrom,
  dateTo,
  onClose,
  onDateFromChange,
  onDateToChange,
  onSubmit,
}: SuspensionModalProps) {
  const [showDateFromCalendar, setShowDateFromCalendar] = useState(false);
  const [showDateToCalendar, setShowDateToCalendar] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

          {/* Header */}
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-gray-800 font-semibold text-sm">
              {isEditMode ? 'Edit Suspension' : 'Create New'}
            </h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="text-blue-600 font-medium mb-4">Suspension</h3>

            <div className="space-y-4">

              {/* Date From */}
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700 text-sm flex-shrink-0">Date From :</label>
                <div className="relative">
                  <input
                    type="text"
                    value={dateFrom}
                    onChange={e => onDateFromChange(e.target.value)}
                    placeholder="MM/DD/YYYY"
                    className="w-40 px-3 py-1.5 border border-gray-300 rounded text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => { setShowDateFromCalendar(!showDateFromCalendar); setShowDateToCalendar(false); }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </button>
                  {showDateFromCalendar && (
                    <CalendarPopup
                      onDateSelect={d => { onDateFromChange(d); setShowDateFromCalendar(false); }}
                      onClose={() => setShowDateFromCalendar(false)}
                    />
                  )}
                </div>
              </div>

              {/* Date To */}
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700 text-sm flex-shrink-0">Date To :</label>
                <div className="relative">
                  <input
                    type="text"
                    value={dateTo}
                    onChange={e => onDateToChange(e.target.value)}
                    placeholder="MM/DD/YYYY"
                    className="w-40 px-3 py-1.5 border border-gray-300 rounded text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => { setShowDateToCalendar(!showDateToCalendar); setShowDateFromCalendar(false); }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </button>
                  {showDateToCalendar && (
                    <CalendarPopup
                      onDateSelect={d => { onDateToChange(d); setShowDateToCalendar(false); }}
                      onClose={() => setShowDateToCalendar(false)}
                    />
                  )}
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={onSubmit}
                className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm shadow-sm"
              >
                {isEditMode ? 'Update' : 'Submit'}
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors text-sm shadow-sm"
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