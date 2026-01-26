import { useState, useEffect } from 'react';
import { X, Plus, Search, ArrowLeft, Check, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';

interface OvertimeSetupProps {
    onBack?: () => void;
}

export function OvertimeSetupPage({ onBack }: OvertimeSetupProps) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        rate: '0',
        defaultAmount: '0.00',
        isExemptedRpt: false
    });

    const [overtimeData, setOvertimeData] = useState([
        { code: 'ADJ_PAY', description: 'Adjustment', rate: 100.00, defaultAmount: 0.00, isExemptedRpt: false },
        { code: 'ATESTOT1', description: 'TEST OT 11', rate: 123.00, defaultAmount: 0.00, isExemptedRpt: false },
        { code: 'BASC_RATE', description: 'Basic Rate', rate: 100.00, defaultAmount: 0.00, isExemptedRpt: false },
        { code: 'HOLIDAY', description: 'Unworked Holiday Pay', rate: 100.00, defaultAmount: 0.00, isExemptedRpt: false },
        { code: 'HOLMON', description: 'Holiday Monthly', rate: 0.00, defaultAmount: 0.00, isExemptedRpt: false },
        { code: 'ND_BASIC', description: 'Night Differential Basic Rate', rate: 10.00, defaultAmount: 0.00, isExemptedRpt: false },
        { code: 'ND_LHF8', description: 'ND Legal Holiday First 8 Hours', rate: 20.00, defaultAmount: 0.00, isExemptedRpt: false },
        { code: 'ND_LHRDF8', description: 'ND Legal Holiday falls on Rest Day First 8 Hours', rate: 26.00, defaultAmount: 0.00, isExemptedRpt: false },
        { code: 'ND_LHRDX8', description: 'ND Legal Holiday falls on Rest Day Excess of 8 Hours', rate: 33.80, defaultAmount: 0.00, isExemptedRpt: false },
        { code: 'ND_LHX8', description: 'ND Legal Holiday Excess of 8 Hours', rate: 26.00, defaultAmount: 0.00, isExemptedRpt: false },
        { code: 'ND_OT', description: 'Night diff in excess of 8 hrs', rate: 12.50, defaultAmount: 0.00, isExemptedRpt: false },
        { code: 'ND_RDF8', description: 'ND Rest Day First 8 Hours', rate: 13.00, defaultAmount: 0.00, isExemptedRpt: false },
        { code: 'ND_RDX8', description: 'ND Rest Day Excess of 8 Hours', rate: 16.90, defaultAmount: 0.00, isExemptedRpt: false },
        { code: 'ND_SHF8', description: 'ND Special Holiday First 8 Hours', rate: 13.00, defaultAmount: 0.00, isExemptedRpt: false },
        { code: 'ND_SHRDF8', description: 'ND Special Holiday Falls on Rest Day First 8 Hours', rate: 15.00, defaultAmount: 0.00, isExemptedRpt: false },
        { code: 'ND_SHRDX8', description: 'ND Special Holiday Falls on Rest Day Excess of 8 Hours', rate: 19.50, defaultAmount: 0.00, isExemptedRpt: false },
        { code: 'ND_SHX8', description: 'ND Special Holiday Excess of 8 Hours', rate: 13.00, defaultAmount: 0.00, isExemptedRpt: false },
        { code: 'ND2LHF8', description: 'Double regular holiday, night shift', rate: 30.00, defaultAmount: 0.00, isExemptedRpt: false },
        { code: 'ND2LHRDF8', description: 'Double regular holiday, rest day, night shift', rate: 39.00, defaultAmount: 0.00, isExemptedRpt: false },
        { code: 'ND2LHRDX8', description: 'Double regular holiday, rest day, night shift, overtime', rate: 50.70, defaultAmount: 0.00, isExemptedRpt: false },
        { code: 'ND2LHX8', description: 'Double regular holiday, night shift overtime', rate: 39.00, defaultAmount: 0.00, isExemptedRpt: false },
        { code: 'NDF8', description: 'ND Basic', rate: 10.00, defaultAmount: 0.00, isExemptedRpt: false },
        { code: 'NDLHF8', description: 'ND Legal Holiday 1st 8hrs', rate: 13.00, defaultAmount: 0.00, isExemptedRpt: false },
        { code: 'NDLHRDF8', description: 'ND Legal Holiday On Rest Day 1st 8hrs', rate: 26.00, defaultAmount: 0.00, isExemptedRpt: false },
        { code: 'NDLHRDX8', description: 'ND Legal Holiday On Rest Day Excess 8hrs', rate: 33.80, defaultAmount: 0.00, isExemptedRpt: false },
    ]);

    const filteredData = overtimeData.filter(item =>
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setFormData({
            code: item.code,
            description: item.description,
            rate: item.rate.toFixed(2),
            defaultAmount: item.defaultAmount.toFixed(2),
            isExemptedRpt: item.isExemptedRpt
        });
        setShowCreateModal(true);
    };

    const handleCreateNew = () => {
        setEditingItem(null);
        setFormData({
            code: '',
            description: '',
            rate: '0',
            defaultAmount: '0.00',
            isExemptedRpt: false
        });
        setShowCreateModal(true);
    };

    const handleDelete = (item: any) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete overtime code "${item.code} - ${item.description}"?`
        );

        if (confirmDelete) {
            setOvertimeData(prevData =>
                prevData.filter(data => data.code !== item.code)
            );
        }
    };

    const handleSubmit = () => {
        if (editingItem) {
            // Update existing item
            setOvertimeData(prevData =>
                prevData.map(item =>
                    item.code === editingItem.code
                        ? {
                            code: formData.code,
                            description: formData.description,
                            rate: parseFloat(formData.rate),
                            defaultAmount: parseFloat(formData.defaultAmount),
                            isExemptedRpt: formData.isExemptedRpt
                        }
                        : item
                )
            );
        } else {
            // Add new item
            setOvertimeData(prevData => [
                ...prevData,
                {
                    code: formData.code,
                    description: formData.description,
                    rate: parseFloat(formData.rate),
                    defaultAmount: parseFloat(formData.defaultAmount),
                    isExemptedRpt: formData.isExemptedRpt
                }
            ]);
        }
        setShowCreateModal(false);
        setEditingItem(null);
    };

    // Handle ESC key press to close modals
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (showCreateModal) {
                    setShowCreateModal(false);
                    setEditingItem(null);
                }
            }
        };

        if (showCreateModal) {
            document.addEventListener('keydown', handleEscKey);
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
                        <h1 className="text-white">Overtime File Setup</h1>
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
                                        Configure overtime codes with their respective rates and default amounts. These codes are used throughout the system for calculating overtime pay and generating reports.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Define overtime rate codes</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Set default amounts per code</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Configure exemption from reports</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Manage basic and premium rates</span>
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
                                        <th className="px-4 py-2 text-left text-gray-700">Description</th>
                                        <th className="px-4 py-2 text-left text-gray-700">Rate ▲</th>
                                        <th className="px-4 py-2 text-left text-gray-700">Default Amount ▲</th>
                                        <th className="px-4 py-2 text-left text-gray-700">Is Exempted Rpt ▲</th>
                                        <th className="px-4 py-2 text-center text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.map((item, index) => (
                                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="px-4 py-2">{item.code}</td>
                                            <td className="px-4 py-2">{item.description}</td>
                                            <td className="px-4 py-2">{item.rate.toFixed(2)}</td>
                                            <td className="px-4 py-2">{item.defaultAmount.toFixed(2)}</td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={item.isExemptedRpt}
                                                    readOnly
                                                    className="w-4 h-4"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center justify-center gap-2">
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
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
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
                                                ? 'bg-blue-600 text-white'
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
                                {/* Modal Dialog */}
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 p-4">
                                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                        {/* Modal Header */}
                                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0">
                                            <h2 className="text-gray-800">{editingItem ? 'Edit' : 'Create New'}</h2>
                                            <button
                                                onClick={() => {
                                                    setShowCreateModal(false);
                                                    setEditingItem(null);
                                                }}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Modal Content */}
                                        <div className="p-4">
                                            <h3 className="text-blue-600 mb-3">Overtime File Setup</h3>

                                            {/* Form Fields */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <label className="w-36 text-gray-700 text-sm">Code :</label>
                                                    <input
                                                        type="text"
                                                        value={formData.code}
                                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <label className="w-36 text-gray-700 text-sm">Description :</label>
                                                    <input
                                                        type="text"
                                                        value={formData.description}
                                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <label className="w-36 text-gray-700 text-sm">Rate :</label>
                                                    <input
                                                        type="text"
                                                        value={formData.rate}
                                                        onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                                                        className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <label className="w-36 text-gray-700 text-sm">Default Amount :</label>
                                                    <input
                                                        type="text"
                                                        value={formData.defaultAmount}
                                                        onChange={(e) => setFormData({ ...formData, defaultAmount: e.target.value })}
                                                        className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <label className="w-36 text-gray-700 text-sm">Is Exempted Rpt :</label>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.isExemptedRpt}
                                                        onChange={(e) => setFormData({ ...formData, isExemptedRpt: e.target.checked })}
                                                        className="w-4 h-4"
                                                    />
                                                </div>
                                            </div>

                                            {/* Modal Actions */}
                                            <div className="flex gap-3 mt-4">
                                                <button
                                                    onClick={handleSubmit}
                                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
                                                >
                                                    {editingItem ? 'Update' : 'Submit'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowCreateModal(false);
                                                        setEditingItem(null);
                                                    }}
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

            {/* Footer */}
            <Footer />
        </div>
    );
}