import { X, ChevronUp, ChevronDown } from 'lucide-react';

interface WorkshiftTimePickerModalProps {
  selectedHour: number;
  selectedMinute: number;
  selectedPeriod: 'AM' | 'PM';
  onHourIncrement: () => void;
  onHourDecrement: () => void;
  onMinuteIncrement: () => void;
  onMinuteDecrement: () => void;
  onPeriodChange: (period: 'AM' | 'PM') => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function WorkshiftTimePickerModal({
  selectedHour,
  selectedMinute,
  selectedPeriod,
  onHourIncrement,
  onHourDecrement,
  onMinuteIncrement,
  onMinuteDecrement,
  onPeriodChange,
  onConfirm,
  onClose,
}: WorkshiftTimePickerModalProps) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/25 z-[9999]" onClick={onClose} />

      {/* Dialog — compact, centered */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-56 pointer-events-auto">

          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select Time</span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Picker body */}
          <div className="px-3 py-3">

            {/* Time display preview */}
            <div className="text-center mb-3">
              <span className="text-2xl font-mono font-semibold text-blue-600 tracking-widest">
                {String(selectedHour).padStart(2, '0')}
                <span className="text-gray-400 mx-0.5">:</span>
                {String(selectedMinute).padStart(2, '0')}
              </span>
              <span
                className={`ml-2 text-sm font-bold px-1.5 py-0.5 rounded ${
                  selectedPeriod === 'AM'
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-indigo-100 text-indigo-600'
                }`}
              >
                {selectedPeriod}
              </span>
            </div>

            {/* Spinners row */}
            <div className="flex items-center justify-center gap-2">

              {/* Hour spinner */}
              <div className="flex flex-col items-center gap-0.5">
                <button
                  onClick={onHourIncrement}
                  className="w-9 h-7 flex items-center justify-center rounded-md bg-gray-100 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <div className="w-9 h-8 flex items-center justify-center text-base font-mono font-semibold bg-white border border-gray-200 rounded-md">
                  {String(selectedHour).padStart(2, '0')}
                </div>
                <button
                  onClick={onHourDecrement}
                  className="w-9 h-7 flex items-center justify-center rounded-md bg-gray-100 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-400 mt-0.5">HR</span>
              </div>

              <span className="text-lg font-mono text-gray-400 pb-5">:</span>

              {/* Minute spinner */}
              <div className="flex flex-col items-center gap-0.5">
                <button
                  onClick={onMinuteIncrement}
                  className="w-9 h-7 flex items-center justify-center rounded-md bg-gray-100 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <div className="w-9 h-8 flex items-center justify-center text-base font-mono font-semibold bg-white border border-gray-200 rounded-md">
                  {String(selectedMinute).padStart(2, '0')}
                </div>
                <button
                  onClick={onMinuteDecrement}
                  className="w-9 h-7 flex items-center justify-center rounded-md bg-gray-100 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-400 mt-0.5">MIN</span>
              </div>

              {/* AM / PM toggle */}
              <div className="flex flex-col gap-1 ml-1 pb-5">
                {(['AM', 'PM'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => onPeriodChange(p)}
                    className={`w-10 h-7 text-xs font-bold rounded-md transition-colors ${
                      selectedPeriod === p
                        ? p === 'AM'
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-indigo-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={onConfirm}
                className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-semibold"
              >
                OK
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-xs font-semibold"
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