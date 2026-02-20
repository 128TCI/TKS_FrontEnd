import { X, ChevronUp, ChevronDown } from 'lucide-react';

interface WorkshiftTimePickerModalProps {
  selectedHour: number;
  selectedMinute: number;
  selectedPeriod: 'AM' | 'PM';
  onHourIncrement: () => void;
  onHourDecrement: () => void;
  onMinuteIncrement: () => void;
  onMinuteDecrement: () => void;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
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
  onHourChange,
  onMinuteChange,
  onPeriodChange,
  onConfirm,
  onClose,
}: WorkshiftTimePickerModalProps) {

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    if (val >= 1 && val <= 12) onHourChange(val);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    if (val >= 0 && val <= 59) onMinuteChange(val);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/25 z-[9999]" onClick={onClose} />

      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-56 pointer-events-auto">

          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select Time</span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
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
              <span className={`ml-2 text-sm font-bold px-1.5 py-0.5 rounded ${
                selectedPeriod === 'AM' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'
              }`}>
                {selectedPeriod}
              </span>
            </div>

            {/* Spinners row */}
            <div className="flex items-center justify-center gap-2">

              {/* Hour spinner */}
              <div className="flex flex-col items-center gap-0.5">
                <button onClick={onHourIncrement}
                  className="w-9 h-7 flex items-center justify-center rounded-md bg-gray-100 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                  <ChevronUp className="w-4 h-4" />
                </button>

                {/* ← direct editable input */}
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={String(selectedHour).padStart(2, '0')}
                  onChange={handleHourChange}
                  className="w-9 h-8 text-center text-base font-mono font-semibold bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={onHourDecrement}
                  className="w-9 h-7 flex items-center justify-center rounded-md bg-gray-100 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                  <ChevronDown className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-400 mt-0.5">HR</span>
              </div>

              <span className="text-lg font-mono text-gray-400 pb-5">:</span>

              {/* Minute spinner */}
              <div className="flex flex-col items-center gap-0.5">
                <button onClick={onMinuteIncrement}
                  className="w-9 h-7 flex items-center justify-center rounded-md bg-gray-100 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                  <ChevronUp className="w-4 h-4" />
                </button>

                {/* ← direct editable input */}
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={String(selectedMinute).padStart(2, '0')}
                  onChange={handleMinuteChange}
                  className="w-9 h-8 text-center text-base font-mono font-semibold bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={onMinuteDecrement}
                  className="w-9 h-7 flex items-center justify-center rounded-md bg-gray-100 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                  <ChevronDown className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-400 mt-0.5">MIN</span>
              </div>

              {/* AM / PM toggle */}
              <div className="flex flex-col gap-1 ml-1 pb-5">
              <button
              onClick={() => onPeriodChange('AM')}
              className={`w-10 h-7 text-xs font-bold rounded-md transition-all border ${
                selectedPeriod === 'AM'
                  ? 'bg-blue-500 text-white border-blue-600'
                  : 'bg-white text-black border-gray-300 hover:bg-gray-100'
              }`}>
              AM
              </button>
              <button
              onClick={() => onPeriodChange('PM')}
              className={`w-10 h-7 text-xs font-bold rounded-md transition-all border ${
                selectedPeriod === 'PM'
                  ? 'bg-blue-500 text-white border-blue-600'
                  : 'bg-white text-black border-gray-300 hover:bg-gray-100'
              }`}>
              PM
              </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <button onClick={onConfirm}
                className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-semibold">
                OK
              </button>
              <button onClick={onClose}
                className="flex-1 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-xs font-semibold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}