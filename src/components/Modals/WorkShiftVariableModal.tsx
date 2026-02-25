import { X } from 'lucide-react';

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
  onSubmit
}: WorkshiftVariableModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-2xl">
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <h2 className="text-gray-800 text-sm">
              {isEditMode ? 'Edit' : 'Add'} Variable Workshift
            </h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-40">Employee Code</label>
              <input
                type="text"
                value={empCode}
                disabled
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-40">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-40">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-40">Shift Code</label>
              <input
                type="text"
                value={shiftCode}
                onChange={(e) => onShiftCodeChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-40">Daily Schedule Code</label>
              <input
                type="text"
                value={dailyScheduleCode}
                onChange={(e) => onDailyScheduleCodeChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-40">GL Code</label>
              <input
                type="text"
                value={glCode}
                onChange={(e) => onGLCodeChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isEditMode ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}