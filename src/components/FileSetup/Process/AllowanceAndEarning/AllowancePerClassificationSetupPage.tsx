import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Check, ArrowLeft, Info, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';

interface AllowancePerClassification {
    id: number;
    referenceCode: string;
    allowanceCode: string;
    workshiftCode: string;
    classificationCode: string;
    minHoursRegular: string;
    amountMinRegular: string;
    maxHoursRegular: string;
    amountMaxRegular: string;
    minHoursRest: string;
    amountMinRest: string;
    maxHoursRest: string;
    amountMaxRest: string;
    minHoursHoliday: string;
    amountMinHoliday: string;
    maxHoursHoliday: string;
    amountMaxHoliday: string;
    minHoursHolidayRest: string;
    amountMinHolidayRest: string;
    maxHoursHolidayRest: string;
    amountMaxHolidayRest: string;
}

interface EarningCode {
    code: string;
    description: string;
}

interface WorkshiftCode {
    code: string;
    description: string;
}

interface ClassificationCode {
    code: string;
    description: string;
}

export function AllowancePerClassificationSetupPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showAllowanceCodeModal, setShowAllowanceCodeModal] = useState(false);
    const [showWorkshiftCodeModal, setShowWorkshiftCodeModal] = useState(false);
    const [showClassificationCodeModal, setShowClassificationCodeModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingItem, setEditingItem] = useState<AllowancePerClassification | null>(null);
    const [detailsItem, setDetailsItem] = useState<AllowancePerClassification | null>(null);
    const [allowanceCodeSearchTerm, setAllowanceCodeSearchTerm] = useState('');
    const [workshiftCodeSearchTerm, setWorkshiftCodeSearchTerm] = useState('');
    const [classificationCodeSearchTerm, setClassificationCodeSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        referenceCode: '',
        allowanceCode: '',
        workshiftCode: '',
        classificationCode: '',
        minHoursRegular: '0',
        amountMinRegular: '0',
        maxHoursRegular: '0',
        amountMaxRegular: '0',
        minHoursRest: '0',
        amountMinRest: '0',
        maxHoursRest: '0',
        amountMaxRest: '0',
        minHoursHoliday: '0',
        amountMinHoliday: '0',
        maxHoursHoliday: '0',
        amountMaxHoliday: '0',
        minHoursHolidayRest: '0',
        amountMinHolidayRest: '0',
        maxHoursHolidayRest: '0',
        amountMaxHolidayRest: '0'
    });

    const [classificationData, setClassificationData] = useState<AllowancePerClassification[]>([
        {
            id: 1,
            referenceCode: 'z',
            allowanceCode: 'E01',
            workshiftCode: '3PM12AM',
            classificationCode: '',
            minHoursRegular: '1.00',
            amountMinRegular: '1.00',
            maxHoursRegular: '0.00',
            amountMaxRegular: '0.00',
            minHoursRest: '0.00',
            amountMinRest: '0.00',
            maxHoursRest: '0.00',
            amountMaxRest: '0.00',
            minHoursHoliday: '0.00',
            amountMinHoliday: '0.00',
            maxHoursHoliday: '0.00',
            amountMaxHoliday: '0.00',
            minHoursHolidayRest: '0.00',
            amountMinHolidayRest: '0.00',
            maxHoursHolidayRest: '0.00',
            amountMaxHolidayRest: '0.00'
        }
    ]);

    const filteredData = classificationData.filter(item =>
        item.referenceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.allowanceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.workshiftCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.classificationCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    // Mock data for search modals
    const earningCodes: EarningCode[] = [
        { code: 'E01', description: 'Regular Pay' },
        { code: 'E02', description: 'Overtime' },
        { code: 'E03', description: 'Charge SL/VL' },
        { code: 'E04', description: 'Absences' },
        { code: 'E05', description: 'UT/Tardiness' },
        { code: 'E06', description: '13th Month Pay NonTax' },
        { code: 'E07', description: 'COLA' },
        { code: 'E08', description: 'Transportation Expense Reimbursement Allowance' },
        { code: 'E09', description: 'Onsite Rollform Allowance' },
        { code: 'E10', description: 'Overwithheld' }
    ];

    const workshiftCodes: WorkshiftCode[] = [
        { code: '3PM12AM', description: '3PM TO 12AM' },
        { code: '6AM3PM', description: '6AM3PM' },
        { code: '6PM3AM', description: '6PM3AM' },
        { code: '724AM6PM', description: '7:24AM TO 6PM' },
        { code: '7AM4PM', description: '7AM to 4PM' },
        { code: '7AM530PM', description: '7AM TO 530PM' },
        { code: '7AM535PM', description: '7AM TO 535PM' },
        { code: '7AM5PM', description: '7AM to 5PM' },
        { code: '7AM6PM', description: '7AM to 6PM' },
        { code: '8AM5PM', description: '8AM to 5PM' }
    ];

    const classificationCodes: ClassificationCode[] = [
        { code: 'a', description: 'aa' }
    ];

    const filteredEarningCodes = earningCodes.filter(item =>
        item.code.toLowerCase().includes(allowanceCodeSearchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(allowanceCodeSearchTerm.toLowerCase())
    );

    const filteredWorkshiftCodes = workshiftCodes.filter(item =>
        item.code.toLowerCase().includes(workshiftCodeSearchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(workshiftCodeSearchTerm.toLowerCase())
    );

    const filteredClassificationCodes = classificationCodes.filter(item =>
        item.code.toLowerCase().includes(classificationCodeSearchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(classificationCodeSearchTerm.toLowerCase())
    );

    const handleCreateNew = () => {
        setFormData({
            referenceCode: '',
            allowanceCode: '',
            workshiftCode: '',
            classificationCode: '',
            minHoursRegular: '0',
            amountMinRegular: '0',
            maxHoursRegular: '0',
            amountMaxRegular: '0',
            minHoursRest: '0',
            amountMinRest: '0',
            maxHoursRest: '0',
            amountMaxRest: '0',
            minHoursHoliday: '0',
            amountMinHoliday: '0',
            maxHoursHoliday: '0',
            amountMaxHoliday: '0',
            minHoursHolidayRest: '0',
            amountMinHolidayRest: '0',
            maxHoursHolidayRest: '0',
            amountMaxHolidayRest: '0'
        });
        setShowCreateModal(true);
    };

    const handleEdit = (item: AllowancePerClassification) => {
        setEditingItem(item);
        setFormData({
            referenceCode: item.referenceCode,
            allowanceCode: item.allowanceCode,
            workshiftCode: item.workshiftCode,
            classificationCode: item.classificationCode,
            minHoursRegular: item.minHoursRegular,
            amountMinRegular: item.amountMinRegular,
            maxHoursRegular: item.maxHoursRegular,
            amountMaxRegular: item.amountMaxRegular,
            minHoursRest: item.minHoursRest,
            amountMinRest: item.amountMinRest,
            maxHoursRest: item.maxHoursRest,
            amountMaxRest: item.amountMaxRest,
            minHoursHoliday: item.minHoursHoliday,
            amountMinHoliday: item.amountMinHoliday,
            maxHoursHoliday: item.maxHoursHoliday,
            amountMaxHoliday: item.amountMaxHoliday,
            minHoursHolidayRest: item.minHoursHolidayRest,
            amountMinHolidayRest: item.amountMinHolidayRest,
            maxHoursHolidayRest: item.maxHoursHolidayRest,
            amountMaxHolidayRest: item.amountMaxHolidayRest
        });
        setShowEditModal(true);
    };

    const handleDetails = (item: AllowancePerClassification) => {
        setDetailsItem(item);
        setShowDetailsModal(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this entry?')) {
            setClassificationData(prev => prev.filter(item => item.id !== id));
        }
    };

    const handleSubmitCreate = (e: any) => {
        e.preventDefault();
        const newEntry: AllowancePerClassification = {
            id: Math.max(...classificationData.map(b => b.id), 0) + 1,
            ...formData
        };
        setClassificationData(prev => [...prev, newEntry]);
        setShowCreateModal(false);
    };

    const handleSubmitEdit = (e: any) => {
        e.preventDefault();
        if (editingItem) {
            setClassificationData(prev =>
                prev.map(item =>
                    item.id === editingItem.id
                        ? { ...item, ...formData }
                        : item
                )
            );
            setShowEditModal(false);
            setEditingItem(null);
        }
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setShowDetailsModal(false);
        setShowAllowanceCodeModal(false);
        setShowWorkshiftCodeModal(false);
        setShowClassificationCodeModal(false);
        setEditingItem(null);
        setDetailsItem(null);
    };

    // Handle ESC key press with hierarchy
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                // Close modals in hierarchical order - search modals first, then main modals
                if (showAllowanceCodeModal) {
                    setShowAllowanceCodeModal(false);
                } else if (showWorkshiftCodeModal) {
                    setShowWorkshiftCodeModal(false);
                } else if (showClassificationCodeModal) {
                    setShowClassificationCodeModal(false);
                } else if (showCreateModal) {
                    setShowCreateModal(false);
                } else if (showEditModal) {
                    setShowEditModal(false);
                    setEditingItem(null);
                } else if (showDetailsModal) {
                    setShowDetailsModal(false);
                    setDetailsItem(null);
                }
            }
        };

        if (showCreateModal || showEditModal || showDetailsModal ||
            showAllowanceCodeModal || showWorkshiftCodeModal || showClassificationCodeModal) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showCreateModal, showEditModal, showDetailsModal,
        showAllowanceCodeModal, showWorkshiftCodeModal, showClassificationCodeModal]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
                        <h1 className="text-white">Allowance Per Classification Setup</h1>
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
                                        Set up classification-based allowance rules with flexible amounts and earning codes, enabling tailored compensation structures for different employee classifications.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Classification-specific allowances</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Customizable earning codes</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Flexible amount configuration</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Multi-classification support</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Controls */}
                        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                            <button
                                onClick={handleCreateNew}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Create New
                            </button>

                            <div className="flex items-center gap-2">
                                <label className="text-gray-700 text-sm">Search:</label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Reference Code</th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Allowance Code</th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Workshift Code</th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Classification Code</th>
                                        <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedData.length > 0 ? (
                                        paginatedData.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-900">{item.referenceCode}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{item.allowanceCode}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{item.workshiftCode}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{item.classificationCode}</td>
                                                <td className="px-6 py-4">
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
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-16 text-center">
                                                <div className="text-gray-500">No data available in table</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    Previous
                                </button>
                                <button className="px-3 py-1 bg-blue-500 text-white rounded">
                                    {currentPage}
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages || 1, prev + 1))}
                                    disabled={currentPage >= totalPages || filteredData.length === 0}
                                    className="px-4 py-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create New Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                            <h2 className="text-gray-800">Create New</h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitCreate} className="p-6">
                            <h3 className="text-blue-600 mb-4">Allowance Per Classification</h3>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-48">
                                        Reference Code :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.referenceCode}
                                        onChange={(e) => setFormData({ ...formData, referenceCode: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-48">
                                        Allowance Code :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.allowanceCode}
                                        onChange={(e) => setFormData({ ...formData, allowanceCode: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowAllowanceCodeModal(true)}
                                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <Search className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, allowanceCode: '' })}
                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-48">
                                        Workshift Code :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.workshiftCode}
                                        onChange={(e) => setFormData({ ...formData, workshiftCode: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowWorkshiftCodeModal(true)}
                                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <Search className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, workshiftCode: '' })}
                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-48">
                                        Classification :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.classificationCode}
                                        onChange={(e) => setFormData({ ...formData, classificationCode: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowClassificationCodeModal(true)}
                                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <Search className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, classificationCode: '' })}
                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Regular Day */}
                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-48">
                                        Min. Hours for Regular Day :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.minHoursRegular}
                                        onChange={(e) => setFormData({ ...formData, minHoursRegular: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="text-gray-700 text-sm whitespace-nowrap">Amount :</label>
                                    <input
                                        type="text"
                                        value={formData.amountMinRegular}
                                        onChange={(e) => setFormData({ ...formData, amountMinRegular: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-48">
                                        Max. Hours for Regular Day :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.maxHoursRegular}
                                        onChange={(e) => setFormData({ ...formData, maxHoursRegular: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="text-gray-700 text-sm whitespace-nowrap">Amount :</label>
                                    <input
                                        type="text"
                                        value={formData.amountMaxRegular}
                                        onChange={(e) => setFormData({ ...formData, amountMaxRegular: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Rest Day */}
                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-48">
                                        Min. Hours for Rest Day :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.minHoursRest}
                                        onChange={(e) => setFormData({ ...formData, minHoursRest: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="text-gray-700 text-sm whitespace-nowrap">Amount :</label>
                                    <input
                                        type="text"
                                        value={formData.amountMinRest}
                                        onChange={(e) => setFormData({ ...formData, amountMinRest: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-48">
                                        Max. Hours for Rest Day :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.maxHoursRest}
                                        onChange={(e) => setFormData({ ...formData, maxHoursRest: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="text-gray-700 text-sm whitespace-nowrap">Amount :</label>
                                    <input
                                        type="text"
                                        value={formData.amountMaxRest}
                                        onChange={(e) => setFormData({ ...formData, amountMaxRest: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Holiday */}
                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-48">
                                        Min. Hours for Holiday :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.minHoursHoliday}
                                        onChange={(e) => setFormData({ ...formData, minHoursHoliday: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="text-gray-700 text-sm whitespace-nowrap">Amount :</label>
                                    <input
                                        type="text"
                                        value={formData.amountMinHoliday}
                                        onChange={(e) => setFormData({ ...formData, amountMinHoliday: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-48">
                                        Max. Hours for Holiday :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.maxHoursHoliday}
                                        onChange={(e) => setFormData({ ...formData, maxHoursHoliday: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="text-gray-700 text-sm whitespace-nowrap">Amount :</label>
                                    <input
                                        type="text"
                                        value={formData.amountMaxHoliday}
                                        onChange={(e) => setFormData({ ...formData, amountMaxHoliday: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Holiday and Restday */}
                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-48">
                                        Min. Hours for Holiday and Restday :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.minHoursHolidayRest}
                                        onChange={(e) => setFormData({ ...formData, minHoursHolidayRest: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="text-gray-700 text-sm whitespace-nowrap">Amount :</label>
                                    <input
                                        type="text"
                                        value={formData.amountMinHolidayRest}
                                        onChange={(e) => setFormData({ ...formData, amountMinHolidayRest: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-48">
                                        Max. Hours for Holiday and Restday :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.maxHoursHolidayRest}
                                        onChange={(e) => setFormData({ ...formData, maxHoursHolidayRest: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="text-gray-700 text-sm whitespace-nowrap">Amount :</label>
                                    <input
                                        type="text"
                                        value={formData.amountMaxHolidayRest}
                                        onChange={(e) => setFormData({ ...formData, amountMaxHolidayRest: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
                                >
                                    Back to List
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal - Same as Create but with Edit title */}
            {showEditModal && editingItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                            <h2 className="text-gray-800">Edit</h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitEdit} className="p-6">
                            <h3 className="text-blue-600 mb-4">Allowance Per Classification</h3>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-48">
                                        Reference Code :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.referenceCode}
                                        onChange={(e) => setFormData({ ...formData, referenceCode: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-48">
                                        Allowance Code :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.allowanceCode}
                                        onChange={(e) => setFormData({ ...formData, allowanceCode: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowAllowanceCodeModal(true)}
                                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <Search className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, allowanceCode: '' })}
                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-48">
                                        Workshift Code :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.workshiftCode}
                                        onChange={(e) => setFormData({ ...formData, workshiftCode: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowWorkshiftCodeModal(true)}
                                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <Search className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, workshiftCode: '' })}
                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-48">
                                        Classification :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.classificationCode}
                                        onChange={(e) => setFormData({ ...formData, classificationCode: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowClassificationCodeModal(true)}
                                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <Search className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, classificationCode: '' })}
                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Regular Day */}
                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-48">
                                        Min. Hours for Regular Day :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.minHoursRegular}
                                        onChange={(e) => setFormData({ ...formData, minHoursRegular: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="text-gray-700 text-sm whitespace-nowrap">Amount :</label>
                                    <input
                                        type="text"
                                        value={formData.amountMinRegular}
                                        onChange={(e) => setFormData({ ...formData, amountMinRegular: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-48">
                                        Max. Hours for Regular Day :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.maxHoursRegular}
                                        onChange={(e) => setFormData({ ...formData, maxHoursRegular: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="text-gray-700 text-sm whitespace-nowrap">Amount :</label>
                                    <input
                                        type="text"
                                        value={formData.amountMaxRegular}
                                        onChange={(e) => setFormData({ ...formData, amountMaxRegular: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Rest Day */}
                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-48">
                                        Min. Hours for Rest Day :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.minHoursRest}
                                        onChange={(e) => setFormData({ ...formData, minHoursRest: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="text-gray-700 text-sm whitespace-nowrap">Amount :</label>
                                    <input
                                        type="text"
                                        value={formData.amountMinRest}
                                        onChange={(e) => setFormData({ ...formData, amountMinRest: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-48">
                                        Max. Hours for Rest Day :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.maxHoursRest}
                                        onChange={(e) => setFormData({ ...formData, maxHoursRest: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="text-gray-700 text-sm whitespace-nowrap">Amount :</label>
                                    <input
                                        type="text"
                                        value={formData.amountMaxRest}
                                        onChange={(e) => setFormData({ ...formData, amountMaxRest: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Holiday */}
                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-48">
                                        Min. Hours for Holiday :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.minHoursHoliday}
                                        onChange={(e) => setFormData({ ...formData, minHoursHoliday: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="text-gray-700 text-sm whitespace-nowrap">Amount :</label>
                                    <input
                                        type="text"
                                        value={formData.amountMinHoliday}
                                        onChange={(e) => setFormData({ ...formData, amountMinHoliday: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-48">
                                        Max. Hours for Holiday :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.maxHoursHoliday}
                                        onChange={(e) => setFormData({ ...formData, maxHoursHoliday: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="text-gray-700 text-sm whitespace-nowrap">Amount :</label>
                                    <input
                                        type="text"
                                        value={formData.amountMaxHoliday}
                                        onChange={(e) => setFormData({ ...formData, amountMaxHoliday: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Holiday and Restday */}
                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-48">
                                        Min. Hours for Holiday and Restday :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.minHoursHolidayRest}
                                        onChange={(e) => setFormData({ ...formData, minHoursHolidayRest: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="text-gray-700 text-sm whitespace-nowrap">Amount :</label>
                                    <input
                                        type="text"
                                        value={formData.amountMinHolidayRest}
                                        onChange={(e) => setFormData({ ...formData, amountMinHolidayRest: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-gray-700 text-sm whitespace-nowrap w-48">
                                        Max. Hours for Holiday and Restday :
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.maxHoursHolidayRest}
                                        onChange={(e) => setFormData({ ...formData, maxHoursHolidayRest: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="text-gray-700 text-sm whitespace-nowrap">Amount :</label>
                                    <input
                                        type="text"
                                        value={formData.amountMaxHolidayRest}
                                        onChange={(e) => setFormData({ ...formData, amountMaxHolidayRest: e.target.value })}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
                                >
                                    Update
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
                                >
                                    Back to List
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && detailsItem && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0">
                            <h2 className="text-gray-900">Details</h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <h3 className="text-blue-600 mb-4">Allowance Per Classification Details</h3>

                            <div className="space-y-3 text-sm">
                                <div><span className="text-gray-700">Reference Code : </span><span className="text-gray-900">{detailsItem.referenceCode}</span></div>
                                <div><span className="text-gray-700">Allowance Code : </span><span className="text-gray-900">{detailsItem.allowanceCode}</span></div>
                                <div><span className="text-gray-700">Workshift Code : </span><span className="text-gray-900">{detailsItem.workshiftCode}</span></div>
                                <div><span className="text-gray-700">Classification : </span><span className="text-gray-900">{detailsItem.classificationCode || '-'}</span></div>
                                <div><span className="text-gray-700">Min. Hours for Regular Day : </span><span className="text-gray-900">{detailsItem.minHoursRegular}</span> <span className="text-gray-700">Amount: </span><span className="text-gray-900">{detailsItem.amountMinRegular}</span></div>
                                <div><span className="text-gray-700">Max. Hours for Regular Day : </span><span className="text-gray-900">{detailsItem.maxHoursRegular}</span> <span className="text-gray-700">Amount: </span><span className="text-gray-900">{detailsItem.amountMaxRegular}</span></div>
                                <div><span className="text-gray-700">Min. Hours for Rest Day : </span><span className="text-gray-900">{detailsItem.minHoursRest}</span> <span className="text-gray-700">Amount: </span><span className="text-gray-900">{detailsItem.amountMinRest}</span></div>
                                <div><span className="text-gray-700">Max. Hours for Rest Day : </span><span className="text-gray-900">{detailsItem.maxHoursRest}</span> <span className="text-gray-700">Amount: </span><span className="text-gray-900">{detailsItem.amountMaxRest}</span></div>
                                <div><span className="text-gray-700">Min. Hours for Holiday : </span><span className="text-gray-900">{detailsItem.minHoursHoliday}</span> <span className="text-gray-700">Amount: </span><span className="text-gray-900">{detailsItem.amountMinHoliday}</span></div>
                                <div><span className="text-gray-700">Max. Hours for Holiday : </span><span className="text-gray-900">{detailsItem.maxHoursHoliday}</span> <span className="text-gray-700">Amount: </span><span className="text-gray-900">{detailsItem.amountMaxHoliday}</span></div>
                                <div><span className="text-gray-700">Min. Hours for Holiday and Restday : </span><span className="text-gray-900">{detailsItem.minHoursHolidayRest}</span> <span className="text-gray-700">Amount: </span><span className="text-gray-900">{detailsItem.amountMinHolidayRest}</span></div>
                                <div><span className="text-gray-700">Max. Hours for Holiday and Restday : </span><span className="text-gray-900">{detailsItem.maxHoursHolidayRest}</span> <span className="text-gray-700">Amount: </span><span className="text-gray-900">{detailsItem.amountMaxHolidayRest}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Allowance Code Search Modal */}
            {showAllowanceCodeModal && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0">
                            <h2 className="text-gray-900">Search</h2>
                            <button
                                onClick={() => setShowAllowanceCodeModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <h3 className="text-blue-600 mb-4">Earnings Code</h3>

                            {/* Search Input */}
                            <div className="flex items-center justify-end gap-2 mb-4">
                                <label className="text-sm text-gray-700">Search:</label>
                                <input
                                    type="text"
                                    value={allowanceCodeSearchTerm}
                                    onChange={(e) => setAllowanceCodeSearchTerm(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                                />
                            </div>

                            {/* Table */}
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-100 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Code</th>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredEarningCodes.map((item) => (
                                            <tr
                                                key={item.code}
                                                className="hover:bg-blue-50 cursor-pointer"
                                                onClick={() => {
                                                    setFormData({ ...formData, allowanceCode: item.code });
                                                    setShowAllowanceCodeModal(false);
                                                }}
                                            >
                                                <td className="px-6 py-3 text-sm text-gray-900">{item.code}</td>
                                                <td className="px-6 py-3 text-sm text-gray-600">{item.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Workshift Code Search Modal */}
            {showWorkshiftCodeModal && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0">
                            <h2 className="text-gray-900">Search</h2>
                            <button
                                onClick={() => setShowWorkshiftCodeModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <h3 className="text-blue-600 mb-4">Workshift Code</h3>

                            {/* Search Input */}
                            <div className="flex items-center justify-end gap-2 mb-4">
                                <label className="text-sm text-gray-700">Search:</label>
                                <input
                                    type="text"
                                    value={workshiftCodeSearchTerm}
                                    onChange={(e) => setWorkshiftCodeSearchTerm(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                                />
                            </div>

                            {/* Table */}
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-100 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Code</th>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredWorkshiftCodes.map((item) => (
                                            <tr
                                                key={item.code}
                                                className="hover:bg-blue-50 cursor-pointer"
                                                onClick={() => {
                                                    setFormData({ ...formData, workshiftCode: item.code });
                                                    setShowWorkshiftCodeModal(false);
                                                }}
                                            >
                                                <td className="px-6 py-3 text-sm text-gray-900">{item.code}</td>
                                                <td className="px-6 py-3 text-sm text-gray-600">{item.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Classification Code Search Modal */}
            {showClassificationCodeModal && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0">
                            <h2 className="text-gray-900">Search</h2>
                            <button
                                onClick={() => setShowClassificationCodeModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <h3 className="text-blue-600 mb-4">Classification Code</h3>

                            {/* Search Input */}
                            <div className="flex items-center justify-end gap-2 mb-4">
                                <label className="text-sm text-gray-700">Search:</label>
                                <input
                                    type="text"
                                    value={classificationCodeSearchTerm}
                                    onChange={(e) => setClassificationCodeSearchTerm(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                                />
                            </div>

                            {/* Table */}
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-100 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Code</th>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredClassificationCodes.map((item) => (
                                            <tr
                                                key={item.code}
                                                className="hover:bg-blue-50 cursor-pointer"
                                                onClick={() => {
                                                    setFormData({ ...formData, classificationCode: item.code });
                                                    setShowClassificationCodeModal(false);
                                                }}
                                            >
                                                <td className="px-6 py-3 text-sm text-gray-900">{item.code}</td>
                                                <td className="px-6 py-3 text-sm text-gray-600">{item.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <Footer />

            {/* CSS Animations */}
            <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
        </div>
    );
}