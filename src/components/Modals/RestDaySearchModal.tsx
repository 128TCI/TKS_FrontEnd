import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import apiClient from '../../services/apiClient';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RestDayItem {
    id:              number;
    referenceNo:     string;
    defRestDay1_WK1: string | null;
    defRestDay2_WK1: string | null;
    defRestDay3_WK1: string | null;
    defRestDay1_WK2: string | null;
    defRestDay2_WK2: string | null;
    defRestDay3_WK2: string | null;
}

interface RestDaySearchModalProps {
    isOpen:   boolean;
    onClose:  () => void;
    onSelect: (referenceNo: string) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 20;

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({
    currentPage,
    totalCount,
    pageSize,
    onPageChange,
}: {
    currentPage:  number;
    totalCount:   number;
    pageSize:     number;
    onPageChange: (page: number) => void;
}) {
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex   = Math.min(startIndex + pageSize, totalCount);

    const getPageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 4) {
            for (let i = 1; i <= 5; i++) pages.push(i);
            pages.push('...'); pages.push(totalPages);
        } else if (currentPage >= totalPages - 3) {
            pages.push(1); pages.push('...');
            for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1); pages.push('...');
            for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
            pages.push('...'); pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-between mt-3 px-2 pb-2">
            <div className="text-gray-600 text-xs">
                Showing {totalCount === 0 ? 0 : startIndex + 1} to {endIndex} of {totalCount}
            </div>
            <div className="flex gap-1">
                <button onClick={() => onPageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}
                    className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
                    Previous
                </button>
                {getPageNumbers().map((page, idx) =>
                    page === '...'
                        ? <span key={`e-${idx}`} className="px-1 text-gray-500 text-xs">...</span>
                        : <button key={page} onClick={() => onPageChange(page as number)}
                            className={`px-2 py-1 rounded text-xs ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>
                            {page}
                          </button>
                )}
                <button onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}
                    className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
                    Next
                </button>
            </div>
        </div>
    );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RestDaySearchModal({ isOpen, onClose, onSelect }: RestDaySearchModalProps) {
    const [searchQuery,   setSearchQuery]   = useState('');
    const [searchInput,   setSearchInput]   = useState('');   // controlled input, committed on Enter/Search
    const [currentPage,   setCurrentPage]   = useState(1);
    const [rows,          setRows]          = useState<RestDayItem[]>([]);
    const [totalRecords,  setTotalRecords]  = useState(0);
    const [isLoading,     setIsLoading]     = useState(false);
    const [error,         setError]         = useState('');

    // ── Fetch (server-side paging + filtering) ────────────────────────────────
    const fetchRestDays = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const start    = (currentPage - 1) * ITEMS_PER_PAGE;
            const response = await apiClient.get('/Fs/Process/RestDaySetUp', {
                params: { referenceNo: searchQuery, start, length: ITEMS_PER_PAGE },
            });

            // Support both { data, totalCount } envelope and plain array
            if (Array.isArray(response.data)) {
                setRows(response.data.map(mapItem));
                setTotalRecords(response.data.length);
            } else {
                setRows((response.data.data ?? []).map(mapItem));
                setTotalRecords(response.data.totalCount ?? 0);
            }
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Failed to load rest day setups.');
            setRows([]);
            setTotalRecords(0);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchQuery]);

    // ── Re-fetch when page or committed search query changes ──────────────────
    useEffect(() => {
        if (!isOpen) return;
        fetchRestDays();
    }, [isOpen, currentPage, searchQuery]); // eslint-disable-line

    // ── Reset state when modal opens ──────────────────────────────────────────
    useEffect(() => {
        if (isOpen) {
            setSearchInput('');
            setSearchQuery('');
            setCurrentPage(1);
            setRows([]);
            setTotalRecords(0);
            setError('');
        }
    }, [isOpen]);

    // ── ESC key ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Commit the search — resets to page 1 and fires a new fetch
    const handleSearch = () => {
        setCurrentPage(1);
        setSearchQuery(searchInput.trim());
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 z-30" onClick={onClose} />

            {/* Dialog */}
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                        <h2 className="text-gray-800 text-sm">Search</h2>
                        <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-3">
                        <h3 className="text-blue-600 mb-2 text-sm">Rest Day Setup</h3>

                        {/* Search input */}
                        <div className="flex items-center gap-2 mb-3">
                            <label className="text-gray-700 text-sm">Search:</label>
                            <input
                                type="text"
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                                className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Search by reference no…"
                            />
                            <button onClick={handleSearch}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors">
                                Search
                            </button>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded mb-3">
                                <p className="text-red-700 text-xs">{error}</p>
                            </div>
                        )}

                        {/* Table */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-gray-600 text-sm">Loading rest day setups…</div>
                            </div>
                        ) : (
                            <div className="border border-gray-200 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <table className="w-full border-collapse text-sm">
                                    <thead className="sticky top-0 bg-white">
                                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                                            <th className="px-3 py-1.5 text-left text-gray-700" rowSpan={2}>Code</th>
                                            <th className="px-3 py-1.5 text-center text-gray-700 border-l border-gray-300" colSpan={3}>Week 1</th>
                                            <th className="px-3 py-1.5 text-center text-gray-700 border-l border-gray-300" colSpan={3}>Week 2</th>
                                        </tr>
                                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                                            {['Day 1', 'Day 2', 'Day 3', 'Day 1', 'Day 2', 'Day 3'].map((d, i) => (
                                                <th key={i} className="px-3 py-1.5 text-left text-gray-700 border-l border-gray-300">{d}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.length > 0 ? rows.map(item => (
                                            <tr key={item.id}
                                                className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                                                onClick={() => { onSelect(item.referenceNo); onClose(); }}>
                                                <td className="px-3 py-1.5">{item.referenceNo}</td>
                                                <td className="px-3 py-1.5 border-l border-gray-200">{item.defRestDay1_WK1 ?? ''}</td>
                                                <td className="px-3 py-1.5 border-l border-gray-200">{item.defRestDay2_WK1 ?? ''}</td>
                                                <td className="px-3 py-1.5 border-l border-gray-200">{item.defRestDay3_WK1 ?? ''}</td>
                                                <td className="px-3 py-1.5 border-l border-gray-200">{item.defRestDay1_WK2 ?? ''}</td>
                                                <td className="px-3 py-1.5 border-l border-gray-200">{item.defRestDay2_WK2 ?? ''}</td>
                                                <td className="px-3 py-1.5 border-l border-gray-200">{item.defRestDay3_WK2 ?? ''}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={7} className="px-3 py-4 text-center text-gray-500 text-sm">No records found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <Pagination
                            currentPage={currentPage}
                            totalCount={totalRecords}
                            pageSize={ITEMS_PER_PAGE}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

// ── Response mapper ───────────────────────────────────────────────────────────

function mapItem(item: any): RestDayItem {
    return {
        id:              item.rdID         ?? item.ID    ?? item.id    ?? 0,
        referenceNo:     item.referenceNo  ?? item.refNo ?? item.code  ?? '',
        defRestDay1_WK1: item.defRestDay1_WK1 ?? null,
        defRestDay2_WK1: item.defRestDay2_WK1 ?? null,
        defRestDay3_WK1: item.defRestDay3_WK1 ?? null,
        defRestDay1_WK2: item.defRestDay1_WK2 ?? null,
        defRestDay2_WK2: item.defRestDay2_WK2 ?? null,
        defRestDay3_WK2: item.defRestDay3_WK2 ?? null,
    };
}