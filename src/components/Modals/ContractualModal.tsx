import { X, Check, ArrowLeft } from 'lucide-react';
import { DatePicker } from '../DateSetup/DatePicker';

interface ContractualModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  dateFrom: string;
  dateTo: string;
  onClose: () => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onSubmit: () => void;
}

export function ContractualModal({
  isOpen,
  isEditMode,
  dateFrom,
  dateTo,
  onClose,
  onDateFromChange,
  onDateToChange,
  onSubmit
}: ContractualModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-10"
        onClick={onClose}
      ></div>

    {/* Modal Dialog */}
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <h2 className="text-gray-800">{isEditMode ? 'Edit Record' : 'Create New'}</h2>
            <button 
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-5">
            <h3 className="text-blue-600 mb-4">Employee Contractual</h3>

            {/* Form Fields */}
            <div className="space-y-3">
              {/* Date From */}
              <div className="flex items-center gap-2 col-span-2">
                <label className="w-40 text-gray-700">Date From :</label>
                <DatePicker
                  value={dateFrom}
                  onChange={(value) => onDateFromChange(value)}
                  className="flex-1"
                />
              </div>

              {/* Date To */}
              <div className="flex items-center gap-2 col-span-2">
                <label className="w-40 text-gray-700">Date To :</label>
                <DatePicker
                  value={dateTo}
                  onChange={(value) => onDateToChange(value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={onSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
              >
                {isEditMode ? 'Update' : 'Submit'}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
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