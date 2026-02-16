import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

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

export function RestDayVariableModal({
  isOpen,
  isEditMode,
  empCode,
  dateFrom,
  dateTo,
  restDay1,
  restDay2,
  restDay3,
  onClose,
  onDateFromChange,
  onDateToChange,
  onRestDay1Change,
  onRestDay2Change,
  onRestDay3Change,
  onSubmit
}: RestDayVariableModalProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const dayOptions = [
    { value: '', label: 'Select Day' },
    { value: 'Monday', label: 'Monday' },
    { value: 'Tuesday', label: 'Tuesday' },
    { value: 'Wednesday', label: 'Wednesday' },
    { value: 'Thursday', label: 'Thursday' },
    { value: 'Friday', label: 'Friday' },
    { value: 'Saturday', label: 'Saturday' },
    { value: 'Sunday', label: 'Sunday' }
  ];

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      ></div>

      {/* Modal Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <h2 className="text-gray-800">{isEditMode ? 'Edit Variable Rest Day' : 'Add Variable Rest Day'}</h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-5">
            <h3 className="text-blue-600 mb-4">Variable Rest Day Information</h3>

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

              {/* Date From */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Date From :</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => onDateFromChange(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Date To */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Date To :</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => onDateToChange(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Rest Day 1 */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Rest Day 1 :</label>
                <select
                  value={restDay1}
                  onChange={(e) => onRestDay1Change(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {dayOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Rest Day 2 */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Rest Day 2 :</label>
                <select
                  value={restDay2}
                  onChange={(e) => onRestDay2Change(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {dayOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Rest Day 3 */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Rest Day 3 :</label>
                <select
                  value={restDay3}
                  onChange={(e) => onRestDay3Change(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {dayOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={onSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
              >
                {isEditMode ? 'Update' : 'Add'}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}