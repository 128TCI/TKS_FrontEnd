import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RefCodeItem {
  refCode:    number;
  day:        string;
  regularDay: string;
  restDay:    string;
  special:    string;
  legal:      string;
  paidLeave?: boolean; // BE: tbl_AddOTWeek.PaidLeave (bit) — drives leave deduction in ComputeOTadd
}

interface RefCodeSearchModalProps {
  isOpen:        boolean;
  onClose:       () => void;
  onSelect:      (refCode: number, label: string) => void;
  items:         RefCodeItem[];
  loading:       boolean;
  error:         string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RefCodeSearchModal({
  isOpen, onClose, onSelect, items, loading, error,
}: RefCodeSearchModalProps) {
  const [searchTerm,   setSearchTerm]   = useState('');
  const [currentPage,  setCurrentPage]  = useState(1);
  const itemsPerPage = 20;

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Reset on open
  useEffect(() => {
    if (isOpen) { setSearchTerm(''); setCurrentPage(1); }
  }, [isOpen]);

  const filteredItems = items.filter(item =>
    String(item.refCode).includes(searchTerm) ||
    item.day.toLowerCase().includes(searchTerm.toLowerCase())        ||
    item.regularDay.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.restDay.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages     = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex     = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | string)[] = [1];
    if (currentPage > 3)              pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end   = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-30" onClick={onClose} />

      {/* Dialog */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
            <h2 className="text-gray-800 text-sm font-medium">Search</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-3">
            <h3 className="text-blue-600 mb-2 text-sm font-medium">Additional OT Hours Per Week</h3>

            {/* Search input */}
            <div className="flex items-center gap-2 mb-3">
              <label className="text-gray-700 text-sm">Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Search by ref code, day name, OT code..."
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded mb-3">
                <p className="text-red-700 text-xs">{error}</p>
              </div>
            )}

            {/* Table */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-600 text-sm">Loading Ref Codes…</div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-3 py-1.5 text-left text-gray-700 text-xs">Reference No.</th>
                      <th className="px-3 py-1.5 text-left text-gray-700 text-xs">Day</th>
                      <th className="px-3 py-1.5 text-left text-gray-700 text-xs">Regular Day</th>
                      <th className="px-3 py-1.5 text-left text-gray-700 text-xs">Rest Day</th>
                      <th className="px-3 py-1.5 text-left text-gray-700 text-xs">Special</th>
                      <th className="px-3 py-1.5 text-left text-gray-700 text-xs">Legal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.length > 0 ? paginatedItems.map(item => (
                      <tr
                        key={item.refCode}
                        className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                        onClick={() => {
                          // Label: "1 — Monday" so user sees both the code and the day name
                          const label = item.day
                            ? `${item.refCode} — ${item.day}`
                            : String(item.refCode);
                          onSelect(item.refCode, label);
                          onClose();
                        }}
                      >
                        <td className="px-3 py-1.5 text-gray-900">{item.refCode}</td>
                        <td className="px-3 py-1.5 text-gray-700">{item.day}</td>
                        <td className="px-3 py-1.5 text-gray-700">{item.regularDay}</td>
                        <td className="px-3 py-1.5 text-gray-700">{item.restDay}</td>
                        <td className="px-3 py-1.5 text-gray-700">{item.special}</td>
                        <td className="px-3 py-1.5 text-gray-700">{item.legal}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="px-3 py-4 text-center text-gray-500 text-sm">
                          No ref codes found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between mt-3">
              <span className="text-gray-600 text-xs">
                Showing {filteredItems.length === 0 ? 0 : startIndex + 1} to{' '}
                {Math.min(startIndex + itemsPerPage, filteredItems.length)} of{' '}
                {filteredItems.length} entries
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {getPageNumbers().map((page, idx) =>
                  page === '...'
                    ? <span key={`e-${idx}`} className="px-1 text-gray-500 text-xs">...</span>
                    : <button
                        key={page}
                        onClick={() => setCurrentPage(page as number)}
                        className={`px-2 py-1 rounded text-xs ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                )}
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}