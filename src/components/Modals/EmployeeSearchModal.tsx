import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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
    const itemsPerPage = 20;

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, onClose]);

    // Reset search when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setCurrentPage(1);
        }
    }, [isOpen]);

    const filteredEmployees = employees.filter(emp =>
        emp.empCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.groupCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

    // Get visible page numbers
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
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
            {/* Modal Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 z-30"
                onClick={onClose}
            ></div>

            {/* Modal Dialog */}
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                        <h2 className="text-gray-800 text-sm">Search</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-3">
                        <h3 className="text-blue-600 mb-2 text-sm">Employee Code</h3>

                        {/* Search Input */}
                        <div className="flex items-center gap-2 mb-3">
                            <label className="text-gray-700 text-sm">Search:</label>
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

                        {/* Error Message */}
                        {error && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded mb-3">
                                <p className="text-red-700 text-xs">{error}</p>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-gray-600 text-sm">Loading employees...</div>
                            </div>
                        ) : (
                            <div className="border border-gray-200 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <table className="w-full border-collapse text-sm">
                                    <thead className="sticky top-0 bg-white">
                                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                                            <th className="px-3 py-1.5 text-left text-gray-700 text-sm">EmpCode ▲</th>
                                            <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Name</th>
                                            <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Group Code</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedEmployees.length > 0 ? (
                                            paginatedEmployees.map((emp) => (
                                                <tr
                                                    key={emp.empCode}
                                                    className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                                                    onClick={() => {
                                                        onSelect(emp.empCode, emp.name);
                                                        onClose();
                                                    }}
                                                >
                                                    <td className="px-3 py-1.5">{emp.empCode}</td>
                                                    <td className="px-3 py-1.5">{emp.name}</td>
                                                    <td className="px-3 py-1.5">{emp.groupCode}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="px-3 py-4 text-center text-gray-500 text-sm">
                                                    No employees found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-3">
                            <div className="text-gray-600 text-xs">
                                Showing {filteredEmployees.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} entries
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                {getPageNumbers().map((page, idx) => (
                                    page === '...' ? (
                                        <span key={`ellipsis-${idx}`} className="px-1 text-gray-500 text-xs">...</span>
                                    ) : (
                                        <button
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
                                    )
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
