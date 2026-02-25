import { useState, useEffect } from 'react';
import { X, Plus, Check, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../Footer/Footer';
import apiClient from '../../../services/apiClient';
import Swal from 'sweetalert2';

interface PayrollLocation {
    id: number;
    locId: number;
    locCode: string;
    locName: string;
    confidential: string;
    notedBy: string;
    preparedBy: string;
    reviewedBy: string;
    approvedBy: string;
    nonTaxAccum: number;
    header: string;
    desc1: string;
    desc2: string;
    desc3: string;
    desc4: string;
    contribFormula: string;
    contribPayPer: number;
    ins: string;
    insPayPer: number;
    pagIbig: string;
    pagPayPer: number;
    sssContrib: string;
    sssPayPer: number;
    philContrib: string;
    philPayPer: number;
    companyCode: string;
    clsCode: string;
    payCode: string;
    rateCode: string;
    noOfDays: number;
    noOfHours: number;
    totalPeriod: number;
    costCenter1: string;
    costCenter2: string;
}

export function PayrollLocationSetupPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditMode, setIsEditMode] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [sortConfig, setSortConfig] = useState<{
        key: keyof PayrollLocation | null;
        direction: 'asc' | 'desc';
    }>({ key: null, direction: 'asc' });

    const [formData, setFormData] = useState({
        locCode: '',
        locName: '',
        payCode: 'M',
        noOfDays: '0',
        noOfHours: '0',
        totalPeriod: '0'
    });

    const [payrollLocationData, setPayrollLocationData] = useState<PayrollLocation[]>([]);

    // Pay code mapping - stores short codes (M, S, D) but displays full names
    const payCodeOptions = [
        { value: 'M', label: 'Monthly' },
        { value: 'S', label: 'Semi-Monthly' },
        { value: 'D', label: 'Daily' }
    ];

    // Helper function to get display label for pay code
    const getPayCodeLabel = (code: string) => {
        const option = payCodeOptions.find(opt => opt.value === code);
        return option ? option.label : code;
    };

    // Fetch data on mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/Fs/Process/PayRollLocationSetUp');
            if (response.status === 200 && response.data) {
                setPayrollLocationData(response.data);
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to load payroll locations';
            await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
            console.error('Error fetching payroll locations:', error);
        } finally {
            setLoading(false);
        }
    };

    // Sorting function
    const handleSort = (key: keyof PayrollLocation) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Helper function for sort icons
    const getSortIcon = (columnKey: keyof PayrollLocation) => {
        if (sortConfig.key !== columnKey) {
            return '⇅';
        }
        return sortConfig.direction === 'asc' ? '▲' : '▼';
    };

    const filteredData = payrollLocationData.filter(item =>
        item.locCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.locName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getPayCodeLabel(item.payCode)?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortConfig.key) return 0;
        
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination
    const itemsPerPage = 20;
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = sortedData.slice(startIndex, endIndex);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
        pages.push(1);
        if (currentPage > 3) pages.push('...');
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        if (currentPage < totalPages - 2) pages.push('...');
        pages.push(totalPages);
        return pages;
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handleCreateNew = () => {
        setFormData({
            locCode: '',
            locName: '',
            payCode: 'M',
            noOfDays: '0',
            noOfHours: '0',
            totalPeriod: '0'
        });
        setIsEditMode(false);
        setSelectedId(null);
        setShowCreateModal(true);
    };

    const handleEdit = (item: PayrollLocation) => {
        setFormData({
            locCode: item.locCode || '',
            locName: item.locName || '',
            payCode: item.payCode || 'M',
            noOfDays: item.noOfDays?.toString() || '0',
            noOfHours: item.noOfHours?.toString() || '0',
            totalPeriod: item.totalPeriod?.toString() || '0'
        });
        setIsEditMode(true);
        setSelectedId(item.id);
        setShowCreateModal(true);
    };

    const handleDelete = async (item: PayrollLocation) => {
        const confirmed = await Swal.fire({
            icon: 'warning',
            title: 'Confirm Delete',
            text: `Are you sure you want to delete "${item.locName}"?`,
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
        });

        if (confirmed.isConfirmed) {
            try {
                await apiClient.delete(`/Fs/Process/PayRollLocationSetUp/${item.id}`);
                await Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Payroll location deleted successfully.',
                    timer: 2000,
                    showConfirmButton: false,
                });
                await fetchData();
            } catch (error: any) {
                const errorMsg = error.response?.data?.message || error.message || 'Failed to delete payroll location';
                await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
            }
        }
    };

    const handleSubmit = async () => {
        if (!formData.locCode.trim()) {
            await Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Please enter a Location Code.' });
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                id: 0,
                locId: 0,
                locCode: formData.locCode,
                locName: formData.locName || null,
                payCode: formData.payCode || null,
                noOfDays: parseInt(formData.noOfDays) || 0,
                noOfHours: parseInt(formData.noOfHours) || 0,
                totalPeriod: parseInt(formData.totalPeriod) || 0,
                confidential: null,
                notedBy: null,
                preparedBy: null,
                reviewedBy: null,
                approvedBy: null,
                nonTaxAccum: 0,
                header: null,
                desc1: null,
                desc2: null,
                desc3: null,
                desc4: null,
                contribFormula: null,
                contribPayPer: 0,
                ins: null,
                insPayPer: 0,
                pagIbig: null,
                pagPayPer: 0,
                sssContrib: null,
                sssPayPer: 0,
                philContrib: null,
                philPayPer: 0,
                companyCode: null,
                clsCode: null,
                rateCode: null,
                costCenter1: null,
                costCenter2: null
            };

            if (isEditMode && selectedId !== null) {
                const updatePayload = {
                    ...payload,
                    id: selectedId
                };
                
                await apiClient.put(`/Fs/Process/PayRollLocationSetUp/${selectedId}`, updatePayload);
                await Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Payroll location updated successfully.',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } else {
                await apiClient.post('/Fs/Process/PayRollLocationSetUp', payload);
                await Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Payroll location created successfully.',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }

            setShowCreateModal(false);
            setFormData({
                locCode: '',
                locName: '',
                payCode: 'M',
                noOfDays: '0',
                noOfHours: '0',
                totalPeriod: '0'
            });
            setIsEditMode(false);
            setSelectedId(null);
            await fetchData();
        } catch (error: any) {
            console.error('Error details:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
            await Swal.fire({ 
                icon: 'error', 
                title: 'Error', 
                text: errorMsg 
            });
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && showCreateModal) {
                setShowCreateModal(false);
            }
        };
        if (showCreateModal) document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [showCreateModal]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex-1 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
                        <h1 className="text-white">Payroll Location Setup</h1>
                    </div>

                    <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
                        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-700 mb-2">
                                        Define payroll locations with specific pay schedules and period configurations. Set up location-based payroll processing parameters including pay codes, working days, hours, and total periods.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        {['Location-specific pay schedules', 'Daily and semi-monthly configurations', 'Working days and hours setup', 'Total period definitions'].map(txt => (
                                            <div key={txt} className="flex items-start gap-2">
                                                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-600">{txt}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

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

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                                        <th 
                                            className="px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-gray-200 select-none"
                                            onClick={() => handleSort('locCode')}
                                        >
                                            Loc Code {getSortIcon('locCode')}
                                        </th>
                                        <th 
                                            className="px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-gray-200 select-none"
                                            onClick={() => handleSort('locName')}
                                        >
                                            Loc Name {getSortIcon('locName')}
                                        </th>
                                        <th 
                                            className="px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-gray-200 select-none"
                                            onClick={() => handleSort('payCode')}
                                        >
                                            Pay Code {getSortIcon('payCode')}
                                        </th>
                                        <th 
                                            className="px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-gray-200 select-none"
                                            onClick={() => handleSort('noOfDays')}
                                        >
                                            No. of Days {getSortIcon('noOfDays')}
                                        </th>
                                        <th 
                                            className="px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-gray-200 select-none"
                                            onClick={() => handleSort('noOfHours')}
                                        >
                                            No. of Hours {getSortIcon('noOfHours')}
                                        </th>
                                        <th 
                                            className="px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-gray-200 select-none"
                                            onClick={() => handleSort('totalPeriod')}
                                        >
                                            Total Period {getSortIcon('totalPeriod')}
                                        </th>
                                        <th className="px-4 py-2 text-center text-gray-700 whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500 text-sm">Loading...</td>
                                        </tr>
                                    ) : paginatedData.length > 0 ? (
                                        paginatedData.map((item) => (
                                            <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-4 py-2">{item.locCode}</td>
                                                <td className="px-4 py-2">{item.locName}</td>
                                                <td className="px-4 py-2">{getPayCodeLabel(item.payCode)}</td>
                                                <td className="px-4 py-2">{item.noOfDays}</td>
                                                <td className="px-4 py-2">{item.noOfHours}</td>
                                                <td className="px-4 py-2">{item.totalPeriod}</td>
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
                                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500 text-sm">No data available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <div className="text-gray-600 text-sm">
                                Showing {sortedData.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} entries
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    Previous
                                </button>
                                {getPageNumbers().map((page, idx) => (
                                    page === '...' ? (
                                        <span key={`ellipsis-${idx}`} className="px-2 flex items-center text-gray-500 text-sm">...</span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page as number)}
                                            className={`px-4 py-2 rounded text-sm font-medium ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                                        >
                                            {page}
                                        </button>
                                    )
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    Next
                                </button>
                            </div>
                        </div>

                        {showCreateModal && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                                        <h2 className="text-gray-800">{isEditMode ? 'Edit Payroll Location' : 'Create New'}</h2>
                                        <button onClick={() => setShowCreateModal(false)} className="text-gray-600 hover:text-gray-800">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="text-blue-600 mb-3">Payroll Location Setup</h3>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <label className="w-36 text-gray-700 text-sm">Loc Code :</label>
                                                <input
                                                    type="text"
                                                    value={formData.locCode}
                                                    onChange={(e) => setFormData({ ...formData, locCode: e.target.value })}
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <label className="w-36 text-gray-700 text-sm">Loc Name :</label>
                                                <input
                                                    type="text"
                                                    value={formData.locName}
                                                    onChange={(e) => setFormData({ ...formData, locName: e.target.value })}
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <label className="w-36 text-gray-700 text-sm">Pay Code :</label>
                                                <select
                                                    value={formData.payCode}
                                                    onChange={(e) => setFormData({ ...formData, payCode: e.target.value })}
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                >
                                                    {payCodeOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <label className="w-36 text-gray-700 text-sm">No. Of Days :</label>
                                                <input
                                                    type="number"
                                                    value={formData.noOfDays}
                                                    onChange={(e) => setFormData({ ...formData, noOfDays: e.target.value })}
                                                    className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <label className="w-36 text-gray-700 text-sm">No. Of Hours :</label>
                                                <input
                                                    type="number"
                                                    value={formData.noOfHours}
                                                    onChange={(e) => setFormData({ ...formData, noOfHours: e.target.value })}
                                                    className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <label className="w-36 text-gray-700 text-sm">Total Period :</label>
                                                <input
                                                    type="number"
                                                    value={formData.totalPeriod}
                                                    onChange={(e) => setFormData({ ...formData, totalPeriod: e.target.value })}
                                                    className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-3 mt-4">
                                            <button
                                                onClick={handleSubmit}
                                                disabled={submitting}
                                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {submitting ? 'Processing...' : (isEditMode ? 'Update' : 'Submit')}
                                            </button>
                                            <button
                                                onClick={() => setShowCreateModal(false)}
                                                disabled={submitting}
                                                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Back to List
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}