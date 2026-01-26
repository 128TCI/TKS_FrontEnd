import { useState, useEffect } from 'react';
import { X, Search, Check, Plus, ArrowLeft, Info, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';

interface RegularOvertimeRecord {
    code: string;
    description: string;
    afterShift?: string;
    withinShiftWithND?: string;
    afterShiftWithND?: string;
    otPremiumAfterShift?: string;
}

interface OTCode {
    code: string;
    description: string;
    rate: number;
    defaultAmount: number;
}

export function RegularOvertimeSetupPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchField, setSearchField] = useState('');
    const [otSearchQuery, setOtSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [otSearchPage, setOtSearchPage] = useState(1);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingCode, setEditingCode] = useState('');
    const [selectedRecord, setSelectedRecord] = useState<RegularOvertimeRecord | null>(null);

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        afterShift: '',
        withinShiftWithND: '',
        afterShiftWithND: '',
        otPremiumAfterShift: '128T_ROT'
    });

    // Sample data - Regular Overtime records
    const [regularOvertimeData, setRegularOvertimeData] = useState<RegularOvertimeRecord[]>([
        {
            code: 'ROT',
            description: 'Regular Overtime',
            afterShift: 'ROT',
            withinShiftWithND: 'NDF8',
            afterShiftWithND: 'NDX8',
            otPremiumAfterShift: 'ROT'
        }
    ]);

    // OT Codes data for search modal
    const otCodesData: OTCode[] = [
        { code: 'ADJ_PAY', description: 'Adjustment', rate: 100.00, defaultAmount: 0.00 },
        { code: 'ATESTOT1', description: 'TEST OT 11', rate: 123.00, defaultAmount: 0.00 },
        { code: 'BASC_RATE', description: 'Basic Rate', rate: 100.00, defaultAmount: 0.00 },
        { code: 'HOLIDAY', description: 'Unworked Holiday Pay', rate: 100.00, defaultAmount: 0.00 },
        { code: 'HOLMON', description: 'Holiday Monthly', rate: 0.00, defaultAmount: 0.00 },
        { code: 'ND_BASIC', description: 'Night Differential Basic Rate', rate: 10.00, defaultAmount: 0.00 },
        { code: 'ND_LHF8', description: 'ND Legal Holiday First 8 Hours', rate: 20.00, defaultAmount: 0.00 },
        { code: 'ND_LHRDF8', description: 'ND Legal Holiday falls on Rest Day First 8 Hours', rate: 26.00, defaultAmount: 0.00 },
        { code: 'ND_LHRDX8', description: 'ND Legal Holiday falls on Rest Day Excess of 8 Hours', rate: 33.80, defaultAmount: 0.00 },
        { code: 'ND_LHX8', description: 'ND Legal Holiday Excess of 8 Hours', rate: 26.00, defaultAmount: 0.00 }
    ];

    const filteredMainData = regularOvertimeData.filter(item =>
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredOTCodes = otCodesData.filter(item =>
        item.code.toLowerCase().includes(otSearchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(otSearchQuery.toLowerCase())
    );

    // Pagination for main table
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredMainData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredMainData.slice(startIndex, endIndex);

    // Pagination for OT search modal
    const otItemsPerPage = 10;
    const otTotalPages = Math.ceil(filteredOTCodes.length / otItemsPerPage);
    const otStartIndex = (otSearchPage - 1) * otItemsPerPage;
    const otEndIndex = otStartIndex + otItemsPerPage;
    const currentOTCodes = filteredOTCodes.slice(otStartIndex, otEndIndex);

    const handleCreateNew = () => {
        setFormData({
            code: '',
            description: '',
            afterShift: '',
            withinShiftWithND: '',
            afterShiftWithND: '',
            otPremiumAfterShift: '128T_ROT'
        });
        setIsEditMode(false);
        setEditingCode('');
        setShowCreateModal(true);
    };

    const handleEdit = (item: RegularOvertimeRecord) => {
        setFormData({
            code: item.code,
            description: item.description,
            afterShift: item.afterShift || '',
            withinShiftWithND: item.withinShiftWithND || '',
            afterShiftWithND: item.afterShiftWithND || '',
            otPremiumAfterShift: item.otPremiumAfterShift || '128T_ROT'
        });
        setEditingCode(item.code);
        setIsEditMode(true);
        setShowCreateModal(true);
    };

    const handleDelete = (code: string, description: string) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete \"${code} - ${description}\"?`
        );

        if (confirmDelete) {
            setRegularOvertimeData(prevData =>
                prevData.filter(item => item.code !== code)
            );
        }
    };

    const handleDetails = (item: RegularOvertimeRecord) => {
        setSelectedRecord(item);
        setShowDetailsModal(true);
    };

    const handleSubmit = () => {
        // Validate required fields
        if (!formData.code.trim() || !formData.description.trim()) {
            alert('Please enter both Code and Description.');
            return;
        }

        if (isEditMode) {
            // Update existing record
            setRegularOvertimeData(prevData =>
                prevData.map(item =>
                    item.code === editingCode
                        ? {
                            code: formData.code,
                            description: formData.description,
                            afterShift: formData.afterShift,
                            withinShiftWithND: formData.withinShiftWithND,
                            afterShiftWithND: formData.afterShiftWithND,
                            otPremiumAfterShift: formData.otPremiumAfterShift
                        }
                        : item
                )
            );
        } else {
            // Check for duplicate code
            const isDuplicate = regularOvertimeData.some(
                item => item.code.toLowerCase() === formData.code.toLowerCase()
            );

            if (isDuplicate) {
                alert('A record with this code already exists.');
                return;
            }

            // Add new record
            setRegularOvertimeData(prevData => [
                ...prevData,
                {
                    code: formData.code,
                    description: formData.description,
                    afterShift: formData.afterShift,
                    withinShiftWithND: formData.withinShiftWithND,
                    afterShiftWithND: formData.afterShiftWithND,
                    otPremiumAfterShift: formData.otPremiumAfterShift
                }
            ]);
        }

        setShowCreateModal(false);
        setIsEditMode(false);
        setEditingCode('');
    };

    const handleOpenSearch = (field: string) => {
        setSearchField(field);
        setOtSearchQuery('');
        setOtSearchPage(1);
        setShowSearchModal(true);
    };

    const handleSelectOTCode = (code: string) => {
        if (searchField === 'afterShift') {
            setFormData({ ...formData, afterShift: code });
        } else if (searchField === 'withinShiftWithND') {
            setFormData({ ...formData, withinShiftWithND: code });
        } else if (searchField === 'afterShiftWithND') {
            setFormData({ ...formData, afterShiftWithND: code });
        } else if (searchField === 'otPremiumAfterShift') {
            setFormData({ ...formData, otPremiumAfterShift: code });
        }
        setShowSearchModal(false);
    };

    const handleClearField = (field: string) => {
        if (field === 'afterShift') {
            setFormData({ ...formData, afterShift: '' });
        } else if (field === 'withinShiftWithND') {
            setFormData({ ...formData, withinShiftWithND: '' });
        } else if (field === 'afterShiftWithND') {
            setFormData({ ...formData, afterShiftWithND: '' });
        } else if (field === 'otPremiumAfterShift') {
            setFormData({ ...formData, otPremiumAfterShift: '' });
        }
    };

    // Handle ESC key press to close modals
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (showDetailsModal) {
                    setShowDetailsModal(false);
                } else if (showSearchModal) {
                    setShowSearchModal(false);
                } else if (showCreateModal) {
                    setShowCreateModal(false);
                }
            }
        };

        if (showSearchModal || showCreateModal || showDetailsModal) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showSearchModal, showCreateModal, showDetailsModal]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
                        <h1 className="text-white">Regular Day OT Rate Setup</h1>
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
                                        Define regular day overtime rate codes and their corresponding overtime premiums. Configure rates for within shift, after shift, and night differential scenarios to ensure accurate overtime calculations.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Within shift OT configurations</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">After shift OT premium rates</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Night differential premiums</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Equivalent overtime code mapping</span>
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
                                        <th className="px-4 py-2 text-left text-gray-700">Code ▲</th>
                                        <th className="px-4 py-2 text-left text-gray-700">Description ▲</th>
                                        <th className="px-4 py-2 text-center text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.map((item, index) => (
                                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="px-4 py-2">{item.code}</td>
                                            <td className="px-4 py-2">{item.description}</td>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleDetails(item)}
                                                        className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                                                    >
                                                        <Info className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-gray-300">|</span>
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-gray-300">|</span>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-gray-600">
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredMainData.length)} of {filteredMainData.length} entries
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        className={`px-3 py-1 rounded ${currentPage === i + 1
                                                ? 'bg-orange-500 text-white'
                                                : 'border border-gray-300 hover:bg-gray-100'
                                            }`}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>

                        {/* Create/Edit Modal */}
                        {showCreateModal && (
                            <>
                                {/* Modal Backdrop */}
                                <div
                                    className="fixed inset-0 bg-black/30 z-10"
                                    onClick={() => setShowCreateModal(false)}
                                ></div>

                                {/* Modal Dialog */}
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                                        {/* Modal Header */}
                                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0">
                                            <h2 className="text-gray-900">{isEditMode ? 'Edit' : 'Create New'}</h2>
                                            <button
                                                onClick={() => setShowCreateModal(false)}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Modal Content */}
                                        <div className="p-4">
                                            <h3 className="text-blue-600 mb-3">Regular Day OT Rate Setup</h3>

                                            {/* Form Fields */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <label className="w-64 text-gray-700 text-sm">Code :</label>
                                                    <input
                                                        type="text"
                                                        value={formData.code}
                                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <label className="w-64 text-gray-700 text-sm">Description :</label>
                                                    <input
                                                        type="text"
                                                        value={formData.description}
                                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <label className="w-64 text-gray-700 text-sm">Within the Shift with ND :</label>
                                                    <input
                                                        type="text"
                                                        value={formData.withinShiftWithND}
                                                        readOnly
                                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded bg-gray-50 text-sm"
                                                    />
                                                    <button
                                                        onClick={() => handleOpenSearch('withinShiftWithND')}
                                                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        <Search className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleClearField('withinShiftWithND')}
                                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <label className="w-64 text-gray-700 text-sm">After the Shift :</label>
                                                    <input
                                                        type="text"
                                                        value={formData.afterShift}
                                                        readOnly
                                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded bg-gray-50 text-sm"
                                                    />
                                                    <button
                                                        onClick={() => handleOpenSearch('afterShift')}
                                                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        <Search className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleClearField('afterShift')}
                                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <label className="w-64 text-gray-700 text-sm">After the Shift with ND :</label>
                                                    <input
                                                        type="text"
                                                        value={formData.afterShiftWithND}
                                                        readOnly
                                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded bg-gray-50 text-sm"
                                                    />
                                                    <button
                                                        onClick={() => handleOpenSearch('afterShiftWithND')}
                                                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        <Search className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleClearField('afterShiftWithND')}
                                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <label className="w-64 text-gray-700 text-sm">OT Premium After the Shift :</label>
                                                    <input
                                                        type="text"
                                                        value={formData.otPremiumAfterShift}
                                                        readOnly
                                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded bg-gray-50 text-sm"
                                                    />
                                                    <button
                                                        onClick={() => handleOpenSearch('otPremiumAfterShift')}
                                                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        <Search className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleClearField('otPremiumAfterShift')}
                                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Modal Actions */}
                                            <div className="flex gap-3 mt-4">
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

                        {/* Search Modal for OT Codes */}
                        {showSearchModal && (
                            <>
                                {/* Modal Backdrop */}
                                <div
                                    className="fixed inset-0 bg-black/30 z-30"
                                    onClick={() => setShowSearchModal(false)}
                                ></div>

                                {/* Modal Dialog */}
                                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                        {/* Modal Header */}
                                        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                                            <h2 className="text-gray-800">Search</h2>
                                            <button
                                                onClick={() => setShowSearchModal(false)}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Modal Content */}
                                        <div className="p-6">
                                            <h3 className="text-blue-600 mb-4">Overtime Code</h3>

                                            {/* Search Field */}
                                            <div className="flex items-center gap-2 mb-4 justify-end">
                                                <label className="text-gray-700">Search:</label>
                                                <input
                                                    type="text"
                                                    value={otSearchQuery}
                                                    onChange={(e) => setOtSearchQuery(e.target.value)}
                                                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                                                />
                                            </div>

                                            {/* Table */}
                                            <div className="overflow-x-auto">
                                                <table className="w-full border-collapse">
                                                    <thead>
                                                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                                                            <th className="px-4 py-2 text-left text-gray-700">Code ▲</th>
                                                            <th className="px-4 py-2 text-left text-gray-700">Description ▲</th>
                                                            <th className="px-4 py-2 text-left text-gray-700">Rate ▲</th>
                                                            <th className="px-4 py-2 text-left text-gray-700">Default Amount ▲</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentOTCodes.map((item, index) => (
                                                            <tr
                                                                key={index}
                                                                className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                                                                onClick={() => handleSelectOTCode(item.code)}
                                                            >
                                                                <td className="px-4 py-2">{item.code}</td>
                                                                <td className="px-4 py-2">{item.description}</td>
                                                                <td className="px-4 py-2">{item.rate.toFixed(2)}</td>
                                                                <td className="px-4 py-2">{item.defaultAmount.toFixed(2)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Pagination */}
                                            <div className="flex items-center justify-center gap-2 mt-4">
                                                <div className="text-gray-600 mr-auto">
                                                    Showing {otStartIndex + 1} to {Math.min(otEndIndex, filteredOTCodes.length)} of {filteredOTCodes.length} entries
                                                </div>
                                                <button
                                                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                                                    onClick={() => setOtSearchPage(prev => Math.max(1, prev - 1))}
                                                    disabled={otSearchPage === 1}
                                                >
                                                    Previous
                                                </button>
                                                {[...Array(Math.min(7, otTotalPages))].map((_, i) => (
                                                    <button
                                                        key={i}
                                                        className={`px-3 py-1 rounded ${otSearchPage === i + 1
                                                                ? 'bg-orange-500 text-white'
                                                                : 'border border-gray-300 hover:bg-gray-100'
                                                            }`}
                                                        onClick={() => setOtSearchPage(i + 1)}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                ))}
                                                <button
                                                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                                                    onClick={() => setOtSearchPage(prev => Math.min(otTotalPages, prev + 1))}
                                                    disabled={otSearchPage === otTotalPages}
                                                >
                                                    Next
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

            {/* Details Modal */}
            {showDetailsModal && selectedRecord && (
                <>
                    {/* Modal Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/30 z-30"
                        onClick={() => setShowDetailsModal(false)}
                    ></div>

                    {/* Modal Dialog */}
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between sticky top-0 z-10">
                                <h2 className="text-gray-800 font-semibold">Details</h2>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="text-gray-600 hover:text-gray-800"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6">
                                <h3 className="text-blue-600 text-xl font-semibold mb-6">Regular Day OT Rate Setup</h3>

                                {/* Details Fields */}
                                <div className="space-y-3">
                                    <div className="flex items-start">
                                        <span className="font-bold text-gray-900 w-80">Code :</span>
                                        <span className="text-gray-700">{selectedRecord.code}</span>
                                    </div>

                                    <div className="flex items-start">
                                        <span className="font-bold text-gray-900 w-80">Description :</span>
                                        <span className="text-gray-700">{selectedRecord.description}</span>
                                    </div>

                                    <div className="flex items-start">
                                        <span className="font-bold text-gray-900 w-80">After the Shift :</span>
                                        <span className="text-gray-700">{selectedRecord.afterShift || ''}</span>
                                    </div>

                                    <div className="flex items-start">
                                        <span className="font-bold text-gray-900 w-80">Within the Shift with ND :</span>
                                        <span className="text-gray-700">{selectedRecord.withinShiftWithND || ''}</span>
                                    </div>

                                    <div className="flex items-start">
                                        <span className="font-bold text-gray-900 w-80">After the Shift with ND :</span>
                                        <span className="text-gray-700">{selectedRecord.afterShiftWithND || ''}</span>
                                    </div>

                                    <div className="flex items-start">
                                        <span className="font-bold text-gray-900 w-80">OT Premium After the Shift :</span>
                                        <span className="text-gray-700">{selectedRecord.otPremiumAfterShift || ''}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Footer */}
            <Footer />
        </div>
    );
}