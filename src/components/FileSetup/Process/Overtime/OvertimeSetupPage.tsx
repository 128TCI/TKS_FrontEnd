import { useState, useEffect } from 'react';
import { X, Plus, Search, ArrowLeft, Check, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';
import Swal from 'sweetalert2';
import apiClient from '../../../../services/apiClient';
import auditTrail from '../../../../services/auditTrail';

const formName = 'Overtime File SetUp';
interface OvertimeSetupProps {
    onBack?: () => void;
}

interface OvertimeItem {
    otfid: number;
    otfCode: string;
    earnCode: string;
    rate1: number;
    rate2: number;
    defAmt: number;
    incPayslip: string;
    incColaOT: string;
    incColaBasic: string;
    description: string;
    isExemptionRpt: boolean;
}

export function OvertimeSetupPage({ onBack }: OvertimeSetupProps) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingItem, setEditingItem] = useState<OvertimeItem | null>(null);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        otfCode: '',
        earnCode: '',
        rate1: '0',
        rate2: '0',
        defAmt: '0.00',
        incPayslip: '',
        incColaOT: '',
        incColaBasic: '',
        description: '',
        isExemptionRpt: false
    });

    // API Data States
    const [overtimeData, setOvertimeData] = useState<OvertimeItem[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [dataError, setDataError] = useState('');

    // Fetch overtime data from API
    useEffect(() => {
        fetchOvertimeData();
    }, []);

    const fetchOvertimeData = async () => {
        setLoadingData(true);
        setDataError('');
        try {
            const response = await apiClient.get('/Fs/Process/Overtime/OverTimeFileSetUp');
            if (response.status === 200 && response.data) {
                setOvertimeData(response.data);
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to load overtime data';
            setDataError(errorMsg);
            console.error('Error fetching overtime data:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const filteredData = overtimeData.filter(item =>
        item.otfCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.earnCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);

    // Reset to page 1 when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handleEdit = (item: OvertimeItem) => {
        setEditingItem(item);
        setFormData({
            otfCode: item.otfCode,
            earnCode: item.earnCode,
            rate1: item.rate1.toString(),
            rate2: item.rate2.toString(),
            defAmt: item.defAmt.toFixed(2),
            incPayslip: item.incPayslip,
            incColaOT: item.incColaOT,
            incColaBasic: item.incColaBasic,
            description: item.description,
            isExemptionRpt: item.isExemptionRpt
        });
        setShowCreateModal(true);
    };

    const handleCreateNew = () => {
        setEditingItem(null);
        setFormData({
            otfCode: '',
            earnCode: '',
            rate1: '0',
            rate2: '0',
            defAmt: '0.00',
            incPayslip: '',
            incColaOT: '',
            incColaBasic: '',
            description: '',
            isExemptionRpt: false
        });
        setShowCreateModal(true);
    };

    const handleDelete = async (item: OvertimeItem) => {
        const confirmed = await Swal.fire({
            icon: 'warning',
            title: 'Confirm Delete',
            text: `Are you sure you want to delete overtime code "${item.otfCode} - ${item.description}"?`,
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
        });

        if (confirmed.isConfirmed) {
            try {
                await apiClient.delete(`/Fs/Process/Overtime/OverTimeFileSetUp/${item.otfid}`);
                await auditTrail.log({
                    accessType: 'Delete',
                    trans: `Deleted overtime code "${item.otfCode} - ${item.description}"`,
                    messages: `Overtime code "${item.otfCode} - ${item.description}" removed`,
                    formName
                });
                await Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Overtime code deleted successfully.',
                    timer: 2000,
                    showConfirmButton: false,
                });
                await fetchOvertimeData();
            } catch (error: any) {
                const errorMsg = error.response?.data?.message || error.message || 'Failed to delete overtime code';
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errorMsg,
                });
                console.error('Error deleting overtime code:', error);
            }
        }
    };

    const handleSubmitCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.otfCode.trim()) {
            await Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Code is required.',
            });
            return;
        }

        if (!formData.description.trim()) {
            await Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Description is required.',
            });
            return;
        }

        // Check for duplicate code
        const isDuplicate = overtimeData.some(item => 
            item.otfCode.toLowerCase() === formData.otfCode.trim().toLowerCase()
        );

        if (isDuplicate) {
            await Swal.fire({
                icon: 'error',
                title: 'Duplicate Code',
                text: 'This overtime code is already in use. Please use a different code.',
            });
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                otfid: 0,
                otfCode: formData.otfCode,
                earnCode: formData.earnCode,
                rate1: parseFloat(formData.rate1) || 0,
                rate2: parseFloat(formData.rate2) || 0,
                defAmt: parseFloat(formData.defAmt) || 0,
                incPayslip: formData.incPayslip,
                incColaOT: formData.incColaOT,
                incColaBasic: formData.incColaBasic,
                description: formData.description,
                isExemptionRpt: formData.isExemptionRpt
            };

            await apiClient.post('/Fs/Process/Overtime/OverTimeFileSetUp', payload);
            await auditTrail.log({
            accessType: 'Add',
            trans: `Created overtime code "${formData.otfCode} - ${formData.description}"`,
            messages: `Overtime code "${formData.otfCode} - ${formData.description}" created`,
            formName
            });
            await Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Overtime code created successfully.',
                timer: 2000,
                showConfirmButton: false,
            });

            await fetchOvertimeData();
            setShowCreateModal(false);
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMsg,
            });
            console.error('Error creating overtime code:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitEdit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingItem) return;

        // Validate required fields
        if (!formData.otfCode.trim()) {
            await Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Code is required.',
            });
            return;
        }

        if (!formData.description.trim()) {
            await Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Description is required.',
            });
            return;
        }

        // Check for duplicate code (excluding current item)
        const isDuplicate = overtimeData.some(item => 
            item.otfid !== editingItem.otfid && 
            item.otfCode.toLowerCase() === formData.otfCode.trim().toLowerCase()
        );

        if (isDuplicate) {
            await Swal.fire({
                icon: 'error',
                title: 'Duplicate Code',
                text: 'This overtime code is already in use. Please use a different code.',
            });
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                otfid: editingItem.otfid,
                otfCode: formData.otfCode,
                earnCode: formData.earnCode,
                rate1: parseFloat(formData.rate1) || 0,
                rate2: parseFloat(formData.rate2) || 0,
                defAmt: parseFloat(formData.defAmt) || 0,
                incPayslip: formData.incPayslip,
                incColaOT: formData.incColaOT,
                incColaBasic: formData.incColaBasic,
                description: formData.description,
                isExemptionRpt: formData.isExemptionRpt
            };

            await apiClient.put(`/Fs/Process/Overtime/OverTimeFileSetUp/${editingItem.otfid}`, payload);
            await auditTrail.log({
            accessType: 'Edit',
            trans: `Updated overtime code "${formData.otfCode} - ${formData.description}"`,
            messages: `Overtime code "${formData.otfCode} - ${formData.description}" updated`,
            formName
            });
            await Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Overtime code updated successfully.',
                timer: 2000,
                showConfirmButton: false,
            });

            await fetchOvertimeData();
            setShowCreateModal(false);
            setEditingItem(null);
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMsg,
            });
            console.error('Error updating overtime code:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        if (editingItem) {
            handleSubmitEdit(e);
        } else {
            handleSubmitCreate(e);
        }
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
                                <label className="text-gray-700 text-sm">Search:</label>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-sm"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            {loadingData ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="text-gray-600 text-sm">Loading overtime data...</div>
                                </div>
                            ) : dataError ? (
                                <div className="p-4 bg-red-50 border border-red-200 rounded">
                                    <p className="text-red-700 text-sm">{dataError}</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-100 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Code</th>
                                                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Description</th>
                                                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Earn Code</th>
                                                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Rate 1</th>
                                                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Rate 2</th>
                                                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Default Amount</th>
                                                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Is Exempted Rpt</th>
                                                <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {currentData.length > 0 ? (
                                                currentData.map((item) => (
                                                    <tr key={item.otfid} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 text-sm text-gray-900">{item.otfCode}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">{item.description}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">{item.earnCode}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">{item.rate1.toFixed(2)}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">{item.rate2.toFixed(2)}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">{item.defAmt.toFixed(2)}</td>
                                                        <td className="px-6 py-4 text-sm">
                                                            <input
                                                                type="checkbox"
                                                                checked={item.isExemptionRpt}
                                                                readOnly
                                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
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
                                                                    onClick={() => handleDelete(item)}
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
                                                    <td colSpan={8} className="px-6 py-16 text-center">
                                                        <div className="text-gray-500">No data available in table</div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                                Showing {filteredData.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1 rounded transition-colors ${
                                            currentPage === page
                                                ? 'bg-blue-600 text-white'
                                                : 'border border-gray-300 hover:bg-gray-100'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages || 1, prev + 1))}
                                    disabled={currentPage >= totalPages || filteredData.length === 0}
                                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>

                        {/* Create/Edit Modal */}
                        {showCreateModal && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0">
                                        <h2 className="text-gray-900">{editingItem ? 'Edit' : 'Create New'}</h2>
                                        <button
                                            onClick={() => {
                                                setShowCreateModal(false);
                                                setEditingItem(null);
                                            }}
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Modal Content */}
                                    <form onSubmit={handleSubmit} className="p-6">
                                        <h3 className="text-blue-600 mb-4">Overtime File Setup</h3>

                                        {/* Form Fields */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <label className="text-gray-700 text-sm whitespace-nowrap w-36">Code :</label>
                                                <input
                                                    type="text"
                                                    value={formData.otfCode}
                                                    maxLength={10}
                                                    onChange={(e) => setFormData({ ...formData, otfCode: e.target.value })}
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    required
                                                />
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <label className="text-gray-700 text-sm whitespace-nowrap w-36">Description :</label>
                                                <input
                                                    type="text"
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    required
                                                />
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <label className="text-gray-700 text-sm whitespace-nowrap w-36">Earn Code :</label>
                                                <input
                                                    type="text"
                                                    value={formData.earnCode}
                                                    onChange={(e) => setFormData({ ...formData, earnCode: e.target.value })}
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <label className="text-gray-700 text-sm whitespace-nowrap w-36">Rate 1 :</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.rate1}
                                                    onChange={(e) => setFormData({ ...formData, rate1: e.target.value })}
                                                    className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <label className="text-gray-700 text-sm whitespace-nowrap w-36">Rate 2 :</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.rate2}
                                                    onChange={(e) => setFormData({ ...formData, rate2: e.target.value })}
                                                    className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <label className="text-gray-700 text-sm whitespace-nowrap w-36">Default Amount :</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.defAmt}
                                                    onChange={(e) => setFormData({ ...formData, defAmt: e.target.value })}
                                                    className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <label className="text-gray-700 text-sm whitespace-nowrap w-36">Inc Payslip :</label>
                                                <input
                                                    type="text"
                                                    value={formData.incPayslip}
                                                    onChange={(e) => setFormData({ ...formData, incPayslip: e.target.value })}
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <label className="text-gray-700 text-sm whitespace-nowrap w-36">Inc Cola OT :</label>
                                                <input
                                                    type="text"
                                                    value={formData.incColaOT}
                                                    onChange={(e) => setFormData({ ...formData, incColaOT: e.target.value })}
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <label className="text-gray-700 text-sm whitespace-nowrap w-36">Inc Cola Basic :</label>
                                                <input
                                                    type="text"
                                                    value={formData.incColaBasic}
                                                    onChange={(e) => setFormData({ ...formData, incColaBasic: e.target.value })}
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <label className="text-gray-700 text-sm whitespace-nowrap w-36">Is Exempted Rpt :</label>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isExemptionRpt}
                                                    onChange={(e) => setFormData({ ...formData, isExemptionRpt: e.target.checked })}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        {/* Modal Actions */}
                                        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm"
                                            >
                                                {submitting ? (editingItem ? 'Updating...' : 'Submitting...') : (editingItem ? 'Update' : 'Submit')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowCreateModal(false);
                                                    setEditingItem(null);
                                                }}
                                                disabled={submitting}
                                                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm"
                                            >
                                                Back to List
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}