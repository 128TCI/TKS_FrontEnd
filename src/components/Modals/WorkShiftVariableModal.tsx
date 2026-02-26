import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Search } from 'lucide-react';

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
        <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-2xl">
          {/* Header */}
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <h2 className="text-gray-800 text-sm font-medium">
              {isEditMode ? 'Edit' : 'Add'} Variable Workshift
            </h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Employee Code */}
            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-44 flex-shrink-0">Employee Code</label>
              <input
                type="text"
                value={empCode}
                disabled
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>

            {/* Date From */}
            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-44 flex-shrink-0">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date To */}
            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-44 flex-shrink-0">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Shift Code with Search + Clear buttons */}
            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-44 flex-shrink-0">Shift Code</label>
              <input
                type="text"
                value={shiftCode}
                readOnly
                placeholder="Select shift code..."
                onClick={() => { setShiftSearchTerm(''); setShowShiftCodeDialog(true); }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            {/* Daily Schedule Code */}
            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-44 flex-shrink-0">Daily Schedule Code</label>
              <input
                type="text"
                value={dailyScheduleCode}
                onChange={(e) => onDailyScheduleCodeChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* GL Code */}
            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-44 flex-shrink-0">GL Code</label>
              <input
                type="text"
                value={glCode}
                onChange={(e) => onGLCodeChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Footer Buttons */}
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

      {/* ── Search dialog portaled to document.body — fully escapes parent stacking context ── */}
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
              {/* Dialog Header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                <h2 className="text-gray-800 text-sm font-semibold">Search</h2>
                <button onClick={handleCloseSearch} className="text-gray-600 hover:text-gray-800">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3">
                <h3 className="text-blue-600 mb-2 text-sm font-semibold">Workshift Code</h3>

                {/* Search Input */}
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

                {/* Table */}
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