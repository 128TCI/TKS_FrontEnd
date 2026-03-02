import { useState } from 'react';
import { X, Search } from 'lucide-react';

interface ClassificationCode {
  classId: number;
  classCode: string;
  classDesc: string;
}

interface ClassificationVariableModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  empCode: string;
  dateFrom: string;
  dateTo: string;
  classificationCode: string;
  onClose: () => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClassificationCodeChange: (value: string) => void;
  onSubmit: () => void;
  classificationCodes?: ClassificationCode[];
  classificationCodesLoading?: boolean;
}

export function ClassificationVariableModal({
  isOpen,
  isEditMode,
  empCode,
  dateFrom,
  dateTo,
  classificationCode,
  onClose,
  onDateFromChange,
  onDateToChange,
  onClassificationCodeChange,
  onSubmit,
  classificationCodes = [],
  classificationCodesLoading = false,
}: ClassificationVariableModalProps) {
  const [showClassCodeDialog, setShowClassCodeDialog] = useState(false);
  const [classSearchTerm, setClassSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredCodes = classificationCodes.filter(
    (cls) =>
      cls.classCode.toLowerCase().includes(classSearchTerm.toLowerCase()) ||
      cls.classDesc.toLowerCase().includes(classSearchTerm.toLowerCase())
  );

  const handleClassCodeSelect = (code: string) => {
    onClassificationCodeChange(code);
    setShowClassCodeDialog(false);
    setClassSearchTerm('');
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
              {isEditMode ? 'Edit' : 'Add'} Variable Classification
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

            {/* Classification Code with Search button */}
            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-44 flex-shrink-0">Classification Code</label>
              <input
                type="text"
                value={classificationCode}
                readOnly
                placeholder="Select classification code..."
                onClick={() => setShowClassCodeDialog(true)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => { setClassSearchTerm(''); setShowClassCodeDialog(true); }}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-shrink-0"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onClassificationCodeChange('')}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
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

      {/* ── Classification Code Search Dialog — matches SearchModal style from AllowancePerClassification ── */}
      {showClassCodeDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            {/* Dialog Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
              <h2 className="text-gray-800 text-sm font-semibold">Search</h2>
              <button
                onClick={() => { setShowClassCodeDialog(false); setClassSearchTerm(''); }}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3">
              <h3 className="text-blue-600 mb-2 text-sm font-semibold">Classification Code</h3>

              {/* Search Input */}
              <div className="flex items-center gap-2 mb-3">
                <label className="text-gray-700 text-sm whitespace-nowrap">Search:</label>
                <input
                  type="text"
                  value={classSearchTerm}
                  onChange={(e) => setClassSearchTerm(e.target.value)}
                  autoFocus
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Type to filter..."
                />
              </div>

              {/* Table */}
              <div className="border border-gray-200 rounded overflow-hidden" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-3 py-1.5 text-left text-gray-700 text-sm font-semibold">Code</th>
                      <th className="px-3 py-1.5 text-left text-gray-700 text-sm font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {classificationCodesLoading ? (
                      <tr>
                        <td colSpan={2} className="px-3 py-8 text-center text-gray-500 italic">
                          Loading...
                        </td>
                      </tr>
                    ) : filteredCodes.length > 0 ? (
                      filteredCodes.map((cls, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                          onClick={() => handleClassCodeSelect(cls.classCode)}
                        >
                          <td className="px-3 py-1.5 text-gray-900 font-medium">{cls.classCode}</td>
                          <td className="px-3 py-1.5 text-gray-600">{cls.classDesc}</td>
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
      )}
    </>
  );
}