import { useState } from 'react';
import { X, Search } from 'lucide-react';

interface WorkshiftCode {
  code: string;
  description: string;
}

interface WorkshiftCodeSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (code: string) => void;
  workshiftCodes: WorkshiftCode[];
  loading: boolean;
}

export function WorkshiftCodeSearchModal({
  isOpen,
  onClose,
  onSelect,
  workshiftCodes,
  loading,
}: WorkshiftCodeSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = workshiftCodes.filter(
    (ws) =>
      ws.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ws.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (code: string) => {
    onSelect(code);
    setSearchTerm('');
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between flex-shrink-0">
            <h2 className="text-gray-800 text-sm font-semibold">Select Workshift Code</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by code or description..."
                autoFocus
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="text-center py-8 text-gray-500 text-sm">Loading workshift codes...</div>
            ) : (
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-700 border-b border-gray-200">Code</th>
                    <th className="px-4 py-2 text-left text-gray-700 border-b border-gray-200">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                        No workshift codes found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((ws, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => handleSelect(ws.code)}
                      >
                        <td className="px-4 py-2 font-medium text-blue-700">{ws.code}</td>
                        <td className="px-4 py-2 text-gray-700">{ws.description}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <p className="text-xs text-gray-500">{filtered.length} record(s) found</p>
          </div>
        </div>
      </div>
    </>
  );
}