import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Calendar } from 'lucide-react';
import { CalendarPopup } from '../CalendarPopup';

interface ClassificationCodeItem {
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
  onOpenCodeSearch?: () => void;
  classificationCodes?: ClassificationCodeItem[];
  classificationCodesLoading?: boolean;
}

export function ClassificationVariableModal({
  isOpen, isEditMode, empCode,
  dateFrom, dateTo, classificationCode,
  onClose, onDateFromChange, onDateToChange, onClassificationCodeChange,
  onSubmit,
  onOpenCodeSearch,
  classificationCodes = [], classificationCodesLoading = false,
}: ClassificationVariableModalProps) {

  const [showDateFromCal,  setShowDateFromCal]  = useState(false);
  const [showDateToCal,    setShowDateToCal]    = useState(false);
  const [showCodeDialog,   setShowCodeDialog]   = useState(false);
  const [codeSearchTerm,   setCodeSearchTerm]   = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !isOpen) return;
      if (showDateFromCal) { setShowDateFromCal(false); return; }
      if (showDateToCal)   { setShowDateToCal(false);   return; }
      if (showCodeDialog)  { setShowCodeDialog(false);  return; }
      onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, showDateFromCal, showDateToCal, showCodeDialog, onClose]);

  if (!isOpen) return null;

  const filteredCodes = classificationCodes.filter(c =>
    c.classCode.toLowerCase().includes(codeSearchTerm.toLowerCase()) ||
    c.classDesc.toLowerCase().includes(codeSearchTerm.toLowerCase())
  );

  const handleOpenSearch = () => {
    setCodeSearchTerm('');
    setShowCodeDialog(true);
    onOpenCodeSearch?.();
  };

  const handleCodeSelect = (code: string) => {
    onClassificationCodeChange(code);
    setShowCodeDialog(false);
    setCodeSearchTerm('');
  };

  const handleCloseSearch = () => {
    setShowCodeDialog(false);
    setCodeSearchTerm('');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-30" onClick={onClose} />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">

          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between sticky top-0 z-10 rounded-t-2xl">
            <h2 className="text-gray-800 font-semibold text-sm">
              {isEditMode ? 'Edit Variable Classification' : 'Add Variable Classification'}
            </h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5">
            <h3 className="text-blue-600 font-medium mb-4">Variable Classification Information</h3>

            <div className="space-y-3">

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

              {/* Classification Code */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700 text-sm flex-shrink-0">Classification Code :</label>
                <input type="text" value={classificationCode} readOnly
                  placeholder="Select classification code..."
                  onClick={handleOpenSearch}
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm bg-gray-50 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <button type="button" onClick={handleOpenSearch}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-shrink-0">
                  <Search className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => onClassificationCodeChange('')}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={onSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm">
                {isEditMode ? 'Update' : 'Save'}
              </button>
              <button onClick={onClose}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-sm text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCodeDialog && createPortal(
        <>
          <div className="fixed inset-0 bg-black/50" style={{ zIndex: 99998 }} onClick={handleCloseSearch} />
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                <h2 className="text-gray-800 text-sm font-semibold">Search Classification Code</h2>
                <button onClick={handleCloseSearch} className="text-gray-600 hover:text-gray-800">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3">
                <h3 className="text-blue-600 mb-2 text-sm font-semibold">Classification Code</h3>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap">Search:</label>
                  <input type="text" value={codeSearchTerm}
                    onChange={e => setCodeSearchTerm(e.target.value)}
                    autoFocus placeholder="Type to filter..."
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div className="border border-gray-200 rounded overflow-hidden" style={{ maxHeight: 400, overflowY: 'auto' }}>
                  <table className="w-full border-collapse text-sm">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="bg-gray-100 border-b-2 border-gray-300">
                        <th className="px-3 py-1.5 text-left text-gray-700 font-semibold">Code</th>
                        <th className="px-3 py-1.5 text-left text-gray-700 font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {classificationCodesLoading ? (
                        <tr><td colSpan={2} className="px-3 py-8 text-center text-gray-500 italic">Loading...</td></tr>
                      ) : filteredCodes.length > 0 ? (
                        filteredCodes.map((c, idx) => (
                          <tr key={idx} className="hover:bg-blue-50 cursor-pointer"
                            onClick={() => handleCodeSelect(c.classCode)}>
                            <td className="px-3 py-1.5 text-gray-900 font-medium">{c.classCode}</td>
                            <td className="px-3 py-1.5 text-gray-600">{c.classDesc}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={2} className="px-3 py-8 text-center text-gray-500 italic">No entries found</td></tr>
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