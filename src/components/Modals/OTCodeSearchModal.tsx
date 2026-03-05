import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import apiClient from '../../services/apiClient';

const PAGE_SIZE = 10;
// ── Pagination ─────────────────────────────────────────────────────────────
export function Pagination({
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

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 4) {
            for (let i = 1; i <= 5; i++) pages.push(i);
            pages.push('...');
            pages.push(totalPages);
        } else if (currentPage >= totalPages - 3) {
            pages.push(1);
            pages.push('...');
            for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push('...');
            for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
            pages.push('...');
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-between mt-3 px-2 pb-2">
            <div className="text-gray-600 text-sm">
                Showing {totalCount === 0 ? 0 : startIndex + 1} to {endIndex} of {totalCount}
            </div>

            <div className="flex gap-1">
                <button
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50"
                >
                    Previous
                </button>

                {getPageNumbers().map((page, idx) =>
                    page === '...' ? (
                        <span key={idx} className="px-2 text-sm">...</span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page as number)}
                            className={`px-3 py-1 text-sm rounded ${
                                currentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'border hover:bg-gray-100'
                            }`}
                        >
                            {page}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
interface OTCodeSearchModalProps {
    show:          boolean;
    onClose:       () => void;
    onSelect:      (code: string, description: string) => void;
    searchTerm:    string;
    setSearchTerm: (value: string) => void;
}

export function OTCodeSearchModal({
    show, onClose, onSelect, searchTerm, setSearchTerm
}: OTCodeSearchModalProps) {
    const [otCodes,     setOtCodes]     = useState<{ code: string; description: string; rate: string; defaultAmount: string }[]>([]);
    const [loading,     setLoading]     = useState(false);
    const [error,       setError]       = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (!show) return;
        fetchOtCodes();
    }, [show]);

    const fetchOtCodes = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiClient.get('/Fs/Process/Overtime/OverTimeFileSetUp');
            if (response.status === 200 && response.data) {
                const mapped = (response.data as any[]).map(ot => ({
                    code:          ot.otfCode     ?? '',
                    description:   ot.description ?? '',
                    rate:          ot.rate1       ?? '0.00',
                    defaultAmount: ot.defAmt      ?? '0.00',
                }));
                setOtCodes(mapped);
            }
        } catch (error: any) {
            setError(error.response?.data?.message || error.message || 'Failed to load OT codes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    if (!show) return null;

    const filtered  = otCodes.filter(ot =>
        ot.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ot.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <>
            <div className="fixed inset-0 bg-black/30 z-30" onClick={onClose} />
            <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg flex-shrink-0">
                        <h2 className="text-gray-800 text-sm">Search</h2>
                        <button onClick={onClose} className="text-gray-600 hover:text-gray-800"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="p-3 overflow-y-auto flex-1">
                        <h3 className="text-blue-600 mb-2 text-sm">Overtime Code</h3>
                        <div className="flex items-center justify-end gap-2 mb-3">
                            <label className="text-gray-700 text-sm">Search:</label>
                            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="w-64 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                        <div className="border border-gray-200 rounded">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                                        <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Code ▲</th>
                                        <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Description</th>
                                        <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Rate ▲</th>
                                        <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Default Amount ▲</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={4} className="px-3 py-4 text-center text-gray-500 text-sm">Loading...</td></tr>
                                    ) : error ? (
                                        <tr><td colSpan={4} className="px-3 py-4 text-center text-red-500 text-sm">{error}</td></tr>
                                    ) : paged.length === 0 ? (
                                        <tr><td colSpan={4} className="px-3 py-4 text-center text-gray-500 text-sm">No data available</td></tr>
                                    ) : (
                                        paged.map(ot => (
                                            <tr key={ot.code} className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                                                onClick={() => { onSelect(ot.code, ot.description); onClose(); }}>
                                                <td className="px-3 py-1.5">{ot.code}</td>
                                                <td className="px-3 py-1.5">{ot.description}</td>
                                                <td className="px-3 py-1.5">{ot.rate}</td>
                                                <td className="px-3 py-1.5">{ot.defaultAmount}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {!loading && !error && filtered.length > 0 && (
                        <div className="flex-shrink-0 border-t border-gray-200">
                            <Pagination currentPage={currentPage} totalCount={filtered.length} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}