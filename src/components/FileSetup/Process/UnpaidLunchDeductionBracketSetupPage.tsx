import { useState, useEffect, useRef } from 'react';
import { X, Plus, Check, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../Footer/Footer';


interface LunchDeduction {
    overtime: string;
    lunchDeduction: string;
}

export function UnpaidLunchDeductionBracketSetupPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const firstInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        overtime: '',
        lunchDeduction: ''
    });

    // Sample data - Unpaid Lunch Deduction Bracket records
    const [deductionData, setDeductionData] = useState<LunchDeduction[]>([]);

    // Helper function to format time input (hh:mm)
    const formatTimeInput = (value: string): string => {
        // Remove all non-numeric characters except colon
        let cleaned = value.replace(/[^\d:]/g, '');

        // Remove any colons
        let numbers = cleaned.replace(/:/g, '');

        // Limit to 4 digits
        numbers = numbers.slice(0, 4);

        // Format as hh:mm
        if (numbers.length >= 3) {
            return numbers.slice(0, 2) + ':' + numbers.slice(2);
        } else if (numbers.length >= 1) {
            return numbers;
        }
        return '';
    };

    const filteredData = deductionData.filter(item =>
        item.overtime.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lunchDeduction.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination for main table
    const itemsPerPage = 25;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);

    const handleCreateNew = () => {
        setFormData({
            overtime: '',
            lunchDeduction: ''
        });
        setIsEditMode(false);
        setEditingIndex(null);
        setShowCreateModal(true);
    };

    const handleEdit = (item: LunchDeduction, index: number) => {
        setFormData({
            overtime: item.overtime,
            lunchDeduction: item.lunchDeduction
        });
        setEditingIndex(index);
        setIsEditMode(true);
        setShowCreateModal(true);
    };

    const handleDelete = (index: number) => {
        if (confirm(`Are you sure you want to delete workshift "${index}"?`)) {
            setDeductionData(prevData => prevData.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = () => {
        // Validate required fields
        if (!formData.overtime.trim()) {
            alert('Please enter Overtime hours.');
            return;
        }

        if (!formData.lunchDeduction.trim()) {
            alert('Please enter Lunch Deduction hours.');
            return;
        }

        if (isEditMode && editingIndex !== null) {
            // Update existing record
            setDeductionData(prevData =>
                prevData.map((item, index) =>
                    index === editingIndex
                        ? { overtime: formData.overtime, lunchDeduction: formData.lunchDeduction }
                        : item
                )
            );
        } else {
            // Add new record
            setDeductionData(prevData => [...prevData, {
                overtime: formData.overtime,
                lunchDeduction: formData.lunchDeduction
            }]);
        }

        // Close modal and reset form
        setShowCreateModal(false);
        setIsEditMode(false);
        setEditingIndex(null);
    };

    // Handle ESC key press to close modals
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (showCreateModal) {
                    setShowCreateModal(false);
                }
            }
        };

        if (showCreateModal) {
            document.addEventListener('keydown', handleEscKey);
            // Auto-focus the first input field when modal opens
            setTimeout(() => {
                firstInputRef.current?.focus();
            }, 100);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showCreateModal]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
                        <h1 className="text-white">Unpaid Lunch Deduction Bracket Setup</h1>
                    </div>

                    {/* Content Container */}
                    <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
                        {/* Information Frame */}
                        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-700 mb-2">
                                        Define unpaid lunch deduction brackets based on overtime hours worked. Configure automatic lunch break deductions that apply when employees exceed specified overtime thresholds.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Overtime-based deductions</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Automated lunch calculations</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Time-based brackets</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Flexible deduction rules</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Controls Row */}
                        <div className="flex items-center gap-4 mb-6">
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                                onClick={handleCreateNew}
                            >
                                <Plus className="w-4 h-4" />
                                Create New
                            </button>
                            <div className="ml-auto flex items-center gap-2">
                                <label className="text-gray-700">Search:</label>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                                        <th className="px-4 py-2 text-left text-gray-700">Overtime [hh:mm] ▲</th>
                                        <th className="px-4 py-2 text-left text-gray-700">Lunch Deduction [hh:mm]</th>
                                        <th className="px-4 py-2 text-center text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                                                No data available in table
                                            </td>
                                        </tr>
                                    ) : (
                                        currentData.map((item, index) => (
                                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-4 py-2">{item.overtime}</td>
                                                <td className="px-4 py-2">{item.lunchDeduction}</td>
                                                <td className="px-4 py-2">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(item, startIndex + index)}
                                                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <span className="text-gray-300">|</span>
                                                        <button
                                                            onClick={() => handleDelete(startIndex + index)}
                                                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-gray-600">
                                Showing {filteredData.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                <button
                                    className="px-3 py-1 bg-blue-600 text-white rounded"
                                >
                                    {currentPage}
                                </button>
                                <button
                                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                >
                                    Next
                                </button>
                            </div>
                        </div>

                        {/* Create/Edit Modal */}
                            {showCreateModal && (
                              <>
                                {/* Modal Dialog */}
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                                    {/* Modal Header */}
                                        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                                            <h2 className="text-gray-800">{isEditMode ? 'Edit' : 'Create New'}</h2>
                                            <button
                                                onClick={() => setShowCreateModal(false)}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Modal Content */}
                                        <div className="p-4">
                                            <h3 className="text-blue-600 mb-4">Unpaid Lunch Deduction Bracket Setup</h3>

                                            {/* Form Fields */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <label className="w-40 text-gray-700 text-sm">OTHours :</label>
                                                    <input
                                                        type="text"
                                                        value={formData.overtime}
                                                        onChange={(e) => setFormData({ ...formData, overtime: formatTimeInput(e.target.value) })}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                        placeholder="[hh:mm]"
                                                        ref={firstInputRef}
                                                    />
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <label className="w-40 text-gray-700 text-sm">Lunch Deduction :</label>
                                                    <input
                                                        type="text"
                                                        value={formData.lunchDeduction}
                                                        onChange={(e) => setFormData({ ...formData, lunchDeduction: formatTimeInput(e.target.value) })}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                        placeholder="[hh:mm]"
                                                    />
                                                </div>
                                            </div>

                                            {/* Modal Actions */}
                                            <div className="flex gap-3 mt-6">
                                                <button
                                                    onClick={handleSubmit}
                                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
                                                >
                                                    {isEditMode ? 'Update' : 'Submit'}
                                                </button>
                                                <button
                                                    onClick={() => setShowCreateModal(false)}
                                                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
                                                >
                                                    Back to List
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}