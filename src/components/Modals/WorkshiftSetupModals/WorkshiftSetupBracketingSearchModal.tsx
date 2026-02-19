import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import apiClient from '../../../services/apiClient';

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------
const ENDPOINTS = {
  tardiness: '/Fs/Process/Tardiness/TardinessSetup',
  undertime:  '/Fs/Process/Tardiness/UnderTimeSetup',
} as const;

// ---------------------------------------------------------------------------
// Matches TardinessSetupDTO / UnderTimeSetupDTO exactly.
// ASP.NET default serialization → camelCase: id, late, equivalent, bracketCode
// ---------------------------------------------------------------------------
interface BracketRow {
  id:          number;
  late:        number;    // decimal in DB — minutes late threshold
  equivalent:  number | null;  // decimal? in DB — deduction equivalent
  bracketCode: string;   // ← this is what gets written into the workshift form
}

interface WorkshiftBracketingSearchModalProps {
  searchType: 'tardiness' | 'undertime';
  onSelect:   (bracketCode: string) => void;
  onClose:    () => void;
}

export function WorkshiftBracketingSearchModal({
  searchType,
  onSelect,
  onClose,
}: WorkshiftBracketingSearchModalProps) {
  const [data,      setData]      = useState<BracketRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [query,     setQuery]     = useState('');

  // ── Fetch on open ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setData([]);
      try {
        const res = await apiClient.get(ENDPOINTS[searchType]);

        if (!cancelled) {
          // Handle both plain array and { data: [...] } wrapper
          const rows: BracketRow[] =
            Array.isArray(res.data)       ? res.data      :
            Array.isArray(res.data?.data) ? res.data.data :
            [];
          setData(rows);
        }
      } catch (err) {
        console.error(`Failed to fetch ${searchType} bracketing data:`, err);
        if (!cancelled) setError('Failed to load data. Please try again.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [searchType]);

  const ITEMS_PER_PAGE = 25;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filter changes
  const filtered = data.filter((row) => {
    if (query === '') return true;
    const q = query.toLowerCase();
    return (
      row.bracketCode.toLowerCase().includes(q) ||
      String(row.late).includes(q)              ||
      String(row.equivalent ?? '').includes(q)
    );
  });

  // Reset to page 1 whenever query changes
  useEffect(() => { setCurrentPage(1); }, [query]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex  = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const title = searchType === 'tardiness' ? 'Tardiness Bracketing' : 'Undertime Bracketing';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-[9999]" onClick={onClose} />

      {/* Dialog */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-lg shadow-2xl border border-gray-300 max-w-sm pointer-events-auto">

          {/* Header */}
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between rounded-t-lg">
            <h2 className="text-gray-800 font-medium">Search — {title}</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5">

            {/* Search */}
            <div className="flex items-center gap-3 mb-4">
              <label className="text-gray-700 text-sm shrink-0">Search:</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Search by bracket code, late, or equivalent..."
                autoFocus
              />
            </div>

            {/* Table */}
            <div className="border border-gray-300 rounded overflow-hidden">
              <div className="overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 border-b border-gray-300 w-10">
                        #
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 border-b border-gray-300">
                        Bracket Code
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 border-b border-gray-300">
                        Late
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 border-b border-gray-300">
                        Equivalent
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading {title}...
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-red-500 text-sm">
                          {error}
                        </td>
                      </tr>
                    ) : currentData.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-sm">
                          {data.length === 0 ? 'No records found.' : 'No results match your search.'}
                        </td>
                      </tr>
                    ) : (
                      currentData.map((row, index) => (
                        <tr
                          key={row.id}
                          onClick={() => onSelect(row.bracketCode)}
                          className={`cursor-pointer transition-colors hover:bg-blue-50 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                          title={`Select: ${row.bracketCode}`}
                        >
                          <td className="px-4 py-2 border-b border-gray-200 text-xs text-gray-400">
                            {row.id}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200 text-sm font-semibold text-blue-700">
                            {row.bracketCode}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200 text-sm text-gray-700">
                            {row.late}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200 text-sm text-gray-700">
                            {row.equivalent ?? '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-gray-500">
                Showing {filtered.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} of {filtered.length} entries
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40"
                >
                  Previous
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded">
                  {currentPage}
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40"
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