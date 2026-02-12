import { useState, useEffect, useMemo } from 'react';
import { X, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface Employee {
    empCode: string;
    name: string;
    groupCode: string;
}

interface EmployeeSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (empCode: string, name: string) => void;
    employees: Employee[];
    loading: boolean;
    error: string;
}

type SortConfig = {
    key: keyof Employee;
    direction: 'asc' | 'desc';
} | null;

export function EmployeeSearchModal({
    isOpen,
    onClose,
    onSelect,
    employees,
    loading,
    error
}: EmployeeSearchModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const itemsPerPage = 20;

    // Handle ESC key
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [isOpen, onClose]);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setCurrentPage(1);
            setSortConfig(null);
        }
    }, [isOpen]);

    // 1. Filter Logic
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const search = searchTerm.toLowerCase();
            return (
                (emp.empCode?.toLowerCase() || "").includes(search) ||
                (emp.name?.toLowerCase() || "").includes(search) ||
                (emp.groupCode?.toLowerCase() || "").includes(search)
            );
        });
    }, [employees, searchTerm]);

    // 2. Sort Logic
    const sortedEmployees = useMemo(() => {
        let sortableItems = [...filteredEmployees];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = (a[sortConfig.key] || "").toString().toLowerCase();
                const bValue = (b[sortConfig.key] || "").toString().toLowerCase();

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredEmployees, sortConfig]);

    const requestSort = (key: keyof Employee) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // 3. Pagination Logic
    const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedEmployees = sortedEmployees.slice(startIndex, startIndex + itemsPerPage);

    // Helper for Sort Icons
    const getSortIcon = (key: keyof Employee) => {
        if (!sortConfig || sortConfig.key !== key) return <ChevronsUpDown className="w-3 h-3 ml-1 opacity-30" />;
        return sortConfig.direction === 'asc' 
            ? <ChevronUp className="w-3 h-3 ml-1 text-blue-600" /> 
            : <ChevronDown className="w-3 h-3 ml-1 text-blue-600" />;
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        if (totalPages <= maxVisible) return Array.from({ length: totalPages }, (_, i) => i + 1);
        pages.push(1);
        if (currentPage > 3) pages.push('...');
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        if (currentPage < totalPages - 2) pages.push('...');
        pages.push(totalPages);
        return pages;
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/30 z-30" onClick={onClose}></div>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                        <h2 className="text-gray-800 text-sm font-medium">Employee Search</h2>
                        <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <label className="text-gray-700 text-sm font-medium">Search:</label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Search by code, name, or group..."
                            />
                        </div>

                        {error && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded mb-3">
                                <p className="text-red-700 text-xs">{error}</p>
                            </div>
                        )}

                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-gray-600 text-sm">Loading employees...</div>
                            </div>
                        ) : (
                            <div className="border border-gray-200 rounded overflow-hidden">
                                <table className="w-full border-collapse text-sm">
                                    <thead className="bg-gray-100">
                                        <tr className="border-b-2 border-gray-300">
                                            {(['empCode', 'name', 'groupCode'] as const).map((key) => (
                                                <th 
                                                    key={key}
                                                    onClick={() => requestSort(key)}
                                                    className="px-3 py-2 text-left text-gray-700 text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors select-none"
                                                >
                                                    <div className="flex items-center">
                                                        {key === 'empCode' ? 'Emp Code' : key === 'groupCode' ? 'Group Code' : 'Name'}
                                                        {getSortIcon(key)}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {paginatedEmployees.length > 0 ? (
                                            paginatedEmployees.map((emp) => (
                                                <tr
                                                    key={emp.empCode}
                                                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                                                    onClick={() => {
                                                        onSelect(emp.empCode, emp.name);
                                                        onClose();
                                                    }}
                                                >
                                                    <td className="px-3 py-2 font-medium">{emp.empCode}</td>
                                                    <td className="px-3 py-2">{emp.name}</td>
                                                    <td className="px-3 py-2">{emp.groupCode}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="px-3 py-8 text-center text-gray-500">
                                                    No employees found matching "{searchTerm}"
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination Footer */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-gray-500 text-xs">
                                Showing {sortedEmployees.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedEmployees.length)} of {sortedEmployees.length} entries
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                {getPageNumbers().map((page, idx) => (
                                    page === '...' ? (
                                        <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-500 text-xs">...</span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page as number)}
                                            className={`px-3 py-1 rounded text-xs transition-colors ${
                                                currentPage === page
                                                    ? 'bg-blue-600 text-white font-bold'
                                                    : 'border border-gray-300 hover:bg-gray-100'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
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