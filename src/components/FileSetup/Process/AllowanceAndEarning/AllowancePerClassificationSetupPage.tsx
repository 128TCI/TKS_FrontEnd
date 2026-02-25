import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Check, Info, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';
import apiClient from '../../../../services/apiClient';
import auditTrail from '../../../../services/auditTrail';
import { decryptData } from '../../../../services/encryptionService';

const formName = 'Allowance Per Classification SetUp';

interface AllowancePerClassification {
    id: number;
    refNo: string;
    allowanceCode: string;
    workShiftCode: string;
    classificationCode: string | null;
    minHrsRegDay: number;
    minAmtRegDay: number;
    maxHrsRegDay: number;
    maxAmtRegDay: number;
    minHrsRestDay: number;
    minAmtRestDay: number;
    maxHrsRestDay: number;
    maxAmtRestDay: number;
    minHrsHoliday: number;
    minAmtHoliday: number;
    maxHrsHoliday: number;
    maxAmtHoliday: number;
    minHrsHolidayRestDay: number;
    minAmountHolidayRestDay: number;
    maxHrsHolidayRestDay: number;
    maxAmountHolidayRestDay: number;
}

interface EarningCode {
    id: string;
    code: string;
    description: string;
    earnType?: string;
    sysId?: string;
}

interface WorkshiftCode {
    code: string;
    description: string;
}

interface ClassificationCode {
    id: string;
    code: string;
    description: string;
}

const API_BASE_URL = '/Fs/Process/AllowanceAndEarnings/AllowancePerClassificationSetUp';

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        refNo: '',
        allowanceCode: '',
        workShiftCode: '',
        classificationCode: '',
        minHrsRegDay: 0,
        minAmtRegDay: 0,
        maxHrsRegDay: 0,
        maxAmtRegDay: 0,
        minHrsRestDay: 0,
        minAmtRestDay: 0,
        maxHrsRestDay: 0,
        maxAmtRestDay: 0,
        minHrsHoliday: 0,
        minAmtHoliday: 0,
        maxHrsHoliday: 0,
        maxAmtHoliday: 0,
        minHrsHolidayRestDay: 0,
        minAmountHolidayRestDay: 0,
        maxHrsHolidayRestDay: 0,
        maxAmountHolidayRestDay: 0
    });

    const [classificationData, setClassificationData] = useState<AllowancePerClassification[]>([]);
    const [earningCodes, setEarningCodes] = useState<EarningCode[]>([]);
    const [workshiftCodes, setWorkshiftCodes] = useState<WorkshiftCode[]>([]);
    const [classificationCodes, setClassificationCodes] = useState<ClassificationCode[]>([]);

    useEffect(() => {
        fetchAllowancePerClassification();
        fetchEarningCodes();
        fetchWorkshiftCodes();
        fetchClassificationCodes();
    }, []);

    const fetchAllowancePerClassification = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get(API_BASE_URL);
            if (response.status === 200 && response.data) {
                setClassificationData(response.data);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
            console.error('Error fetching allowance per classification:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEarningCodes = async () => {
        try {
            const response = await apiClient.get('/Fs/Process/AllowanceAndEarnings/EarningsSetUp');
            if (response.status === 200 && response.data) {
                const mappedData = response.data.map((earning: any) => ({
                    id: earning.earnID?.toString() || earning.id || '',
                    code: earning.earnCode || earning.code || '',
                    description: earning.earnDesc || earning.description || '',
                    earnType: earning.earnType || '',
                    sysId: earning.sysId || '',
                }));
                setEarningCodes(mappedData);
            }
        } catch (err) {
            console.error('Error fetching earning codes:', err);
        }
    };

    const fetchWorkshiftCodes = async () => {
        try {
            const response = await apiClient.get('/Fs/Process/AllowanceAndEarnings/WorkshiftSetUp');
            if (response.status === 200 && response.data) {
                const mappedData = response.data.map((workshift: any) => ({
                    code: workshift.workShiftCode || workshift.code || '',
                    description: workshift.workShiftDesc || workshift.description || '',
                }));
                setWorkshiftCodes(mappedData);
            }
        } catch (err) {
            console.error('Error fetching workshift codes:', err);
        }
    };

    const fetchClassificationCodes = async () => {
        try {
            const response = await apiClient.get('/Fs/Process/AllowanceAndEarnings/ClassificationSetUp');
            if (response.status === 200 && response.data) {
                const mappedData = response.data.map((classification: any) => ({
                    id: classification.classId || '',
                    code: classification.classCode || '',
                    description: classification.classDesc || '',
                }));
                setClassificationCodes(mappedData);
            }
        } catch (err) {
            console.error('Error fetching classification codes:', err);
        }
    };

    const filteredData = classificationData.filter(item =>
        item.refNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.allowanceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.workShiftCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.classificationCode && item.classificationCode.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

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
            refNo: '',
            allowanceCode: '',
            workShiftCode: '',
            classificationCode: '',
            minHrsRegDay: 0,
            minAmtRegDay: 0,
            maxHrsRegDay: 0,
            maxAmtRegDay: 0,
            minHrsRestDay: 0,
            minAmtRestDay: 0,
            maxHrsRestDay: 0,
            maxAmtRestDay: 0,
            minHrsHoliday: 0,
            minAmtHoliday: 0,
            maxHrsHoliday: 0,
            maxAmtHoliday: 0,
            minHrsHolidayRestDay: 0,
            minAmountHolidayRestDay: 0,
            maxHrsHolidayRestDay: 0,
            maxAmountHolidayRestDay: 0
        });
        setShowCreateModal(true);
    };

    const handleEdit = (item: AllowancePerClassification) => {
        setEditingItem(item);
        setFormData({
            refNo: item.refNo,
            allowanceCode: item.allowanceCode,
            workShiftCode: item.workShiftCode,
            classificationCode: item.classificationCode || '',
            minHrsRegDay: item.minHrsRegDay,
            minAmtRegDay: item.minAmtRegDay,
            maxHrsRegDay: item.maxHrsRegDay,
            maxAmtRegDay: item.maxAmtRegDay,
            minHrsRestDay: item.minHrsRestDay,
            minAmtRestDay: item.minAmtRestDay,
            maxHrsRestDay: item.maxHrsRestDay,
            maxAmtRestDay: item.maxAmtRestDay,
            minHrsHoliday: item.minHrsHoliday,
            minAmtHoliday: item.minAmtHoliday,
            maxHrsHoliday: item.maxHrsHoliday,
            maxAmtHoliday: item.maxAmtHoliday,
            minHrsHolidayRestDay: item.minHrsHolidayRestDay,
            minAmountHolidayRestDay: item.minAmountHolidayRestDay,
            maxHrsHolidayRestDay: item.maxHrsHolidayRestDay,
            maxAmountHolidayRestDay: item.maxAmountHolidayRestDay
        });
        setShowEditModal(true);
    };

    const handleDetails = (item: AllowancePerClassification) => {
        setDetailsItem(item);
        setShowDetailsModal(true);
    };

    const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this entry?')) {
        try {
        setLoading(true);
        const response = await apiClient.delete(`${API_BASE_URL}/${id}`);
        if (response.status === 200 || response.status === 204) {
            try {
            await auditTrail.log({
                accessType: 'Delete',
                trans: `Deleted allowance entry ID ${id}`,
                messages: `Deleted entry ID: ${id}`,
                formName: formName,
            });
            } catch (err) {
            console.error('Audit trail failed:', err);
            }

            await fetchAllowancePerClassification();
            alert('Entry deleted successfully');
        }
        } catch (err: any) {
        setError(err.message || 'Failed to delete entry');
        alert('Failed to delete entry');
        } finally {
        setLoading(false);
        }
    }
    };

    const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        setLoading(true);
        const payload = { ...formData, classificationCode: formData.classificationCode || null };
        const response = await apiClient.post(API_BASE_URL, payload);
        if (response.status === 200 || response.status === 201) {
        try {
            await auditTrail.log({
            accessType: 'Add',
            trans: `Created allowance entry ${payload.classificationCode ?? 'N/A'}`,
            messages: `Created entry details: ${JSON.stringify(payload)}`,
            formName: formName,
            });
        } catch (err) {
            console.error('Audit trail failed:', err);
        }

        await fetchAllowancePerClassification();
        setShowCreateModal(false);
        alert('Entry created successfully');
        }
    } catch (err: any) {
        setError(err.message || 'Failed to create entry');
        alert('Failed to create entry');
    } finally {
        setLoading(false);
    }
    };

    const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
        setLoading(true);
        const payload = { ...formData, classificationCode: formData.classificationCode || null };
        const response = await apiClient.put(`${API_BASE_URL}/${editingItem.id}`, payload);
        if (response.status === 200) {
        try {
            await auditTrail.log({
            accessType: 'Edit',
            trans: `Updated allowance entry ID ${editingItem.id}`,
            messages: `Updated entry details: ${JSON.stringify(payload)}`,
            formName: formName,
            });
        } catch (err) {
            console.error('Audit trail failed:', err);
        }

        await fetchAllowancePerClassification();
        setShowEditModal(false);
        setEditingItem(null);
        alert('Entry updated successfully');
        }
    } catch (err: any) {
        setError(err.message || 'Failed to update entry');
        alert('Failed to update entry');
    } finally {
        setLoading(false);
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

    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
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

    const [permissions, setPermissions] = useState<Record<string, boolean>>({});
    const hasPermission = (accessType: string) => permissions[accessType] === true;

    useEffect(() => {
        getAllowancePerClassificationSetUpPermissions();
    }, []);

    const getAllowancePerClassificationSetUpPermissions = () => {
        const rawPayload = localStorage.getItem("loginPayload");
        if (!rawPayload) return;

        try {
            const parsedPayload = JSON.parse(rawPayload);
            const encryptedArray: any[] = parsedPayload.permissions || [];

            const branchEntries = encryptedArray.filter(
                (p) => decryptData(p.formName) === "AllowancePerClassificationSetUp"
            );

            const permMap: Record<string, boolean> = {};
            branchEntries.forEach((p) => {
                const accessType = decryptData(p.accessTypeName);
                if (accessType) permMap[accessType] = true;
            });

            setPermissions(permMap);
        } catch (e) {
            console.error("Error parsing or decrypting payload", e);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex-1 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
                        <h1 className="text-white text-2xl font-bold">Allowance Per Classification Setup</h1>
                    </div>

                    <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
                        {error && (
                            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                                <p className="text-red-700">{error}</p>
                            </div>
                        )}

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

                        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                            {(hasPermission('Add') && hasPermission('View')) && (
                                <button
                                    onClick={handleCreateNew}
                                    disabled={loading}
                                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create New
                                </button>
                            )}

                            {hasPermission('View') && (
                                <div className="flex items-center gap-2">
                                    <label className="text-gray-700 text-sm">Search:</label>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            {hasPermission('View') ? (
                                <table className="w-full">
                                    <thead className="bg-gray-100 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Reference Code</th>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Allowance Code</th>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Workshift Code</th>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Classification Code</th>
                                            {(hasPermission('Edit') || hasPermission('Delete')) && (
                                                <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase">Actions</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-16 text-center">
                                                    <div className="text-gray-500">Loading...</div>
                                                </td>
                                            </tr>
                                        ) : paginatedData.length > 0 ? (
                                            paginatedData.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm text-gray-900">{item.refNo}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{item.allowanceCode}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{item.workShiftCode}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{item.classificationCode || '-'}</td>
                                                    {(hasPermission('Edit') || hasPermission('Delete')) && (
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => handleDetails(item)}
                                                                    className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                                                                >
                                                                    <Info className="w-4 h-4" />
                                                                </button>
                                                                {hasPermission('Edit') && (
                                                                    <span className="text-gray-300">|</span>
                                                                )}
                                                                {hasPermission('Edit') && (
                                                                    <button
                                                                        onClick={() => handleEdit(item)}
                                                                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                                {hasPermission('Delete') && (
                                                                    <span className="text-gray-300">|</span>
                                                                )}
                                                                {hasPermission('Delete') && (
                                                                    <button
                                                                        onClick={() => handleDelete(item.id)}
                                                                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                                        title="Delete"
                                                                        disabled={loading}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    )}
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
                            ) : (
                                <div className="text-center py-10 text-gray-500">
                                    You do not have permission to view this list.
                                </div>
                            )}
                        </div>

                        {hasPermission('View') && (
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
                        )}
                    </div>
                </div>
            </div>

            {showCreateModal && (
                <FormModal
                    title="Create New"
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmitCreate}
                    onClose={handleCloseModal}
                    loading={loading}
                    setShowAllowanceCodeModal={setShowAllowanceCodeModal}
                    setShowWorkshiftCodeModal={setShowWorkshiftCodeModal}
                    setShowClassificationCodeModal={setShowClassificationCodeModal}
                    submitButtonText="Submit"
                />
            )}

            {showEditModal && editingItem && (
                <FormModal
                    title="Edit"
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmitEdit}
                    onClose={handleCloseModal}
                    loading={loading}
                    setShowAllowanceCodeModal={setShowAllowanceCodeModal}
                    setShowWorkshiftCodeModal={setShowWorkshiftCodeModal}
                    setShowClassificationCodeModal={setShowClassificationCodeModal}
                    submitButtonText="Update"
                />
            )}

            {showDetailsModal && detailsItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[50vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0 z-10">
                            <h2 className="text-gray-900 font-semibold">Details</h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <h3 className="text-blue-600 mb-4 font-semibold">Allowance Per Classification Details</h3>
                            <div className="space-y-3 text-sm">
                                <div><span className="text-gray-700 font-medium">Reference Code : </span><span className="text-gray-900">{detailsItem.refNo}</span></div>
                                <div><span className="text-gray-700 font-medium">Allowance Code : </span><span className="text-gray-900">{detailsItem.allowanceCode}</span></div>
                                <div><span className="text-gray-700 font-medium">Workshift Code : </span><span className="text-gray-900">{detailsItem.workShiftCode}</span></div>
                                <div><span className="text-gray-700 font-medium">Classification : </span><span className="text-gray-900">{detailsItem.classificationCode || '-'}</span></div>
                                <div><span className="text-gray-700 font-medium">Min. Hours for Regular Day : </span><span className="text-gray-900">{detailsItem.minHrsRegDay}</span> <span className="text-gray-700 font-medium">Amount: </span><span className="text-gray-900">{detailsItem.minAmtRegDay}</span></div>
                                <div><span className="text-gray-700 font-medium">Max. Hours for Regular Day : </span><span className="text-gray-900">{detailsItem.maxHrsRegDay}</span> <span className="text-gray-700 font-medium">Amount: </span><span className="text-gray-900">{detailsItem.maxAmtRegDay}</span></div>
                                <div><span className="text-gray-700 font-medium">Min. Hours for Rest Day : </span><span className="text-gray-900">{detailsItem.minHrsRestDay}</span> <span className="text-gray-700 font-medium">Amount: </span><span className="text-gray-900">{detailsItem.minAmtRestDay}</span></div>
                                <div><span className="text-gray-700 font-medium">Max. Hours for Rest Day : </span><span className="text-gray-900">{detailsItem.maxHrsRestDay}</span> <span className="text-gray-700 font-medium">Amount: </span><span className="text-gray-900">{detailsItem.maxAmtRestDay}</span></div>
                                <div><span className="text-gray-700 font-medium">Min. Hours for Holiday : </span><span className="text-gray-900">{detailsItem.minHrsHoliday}</span> <span className="text-gray-700 font-medium">Amount: </span><span className="text-gray-900">{detailsItem.minAmtHoliday}</span></div>
                                <div><span className="text-gray-700 font-medium">Max. Hours for Holiday : </span><span className="text-gray-900">{detailsItem.maxHrsHoliday}</span> <span className="text-gray-700 font-medium">Amount: </span><span className="text-gray-900">{detailsItem.maxAmtHoliday}</span></div>
                                <div><span className="text-gray-700 font-medium">Min. Hours for Holiday and Rest Day : </span><span className="text-gray-900">{detailsItem.minHrsHolidayRestDay}</span> <span className="text-gray-700 font-medium">Amount: </span><span className="text-gray-900">{detailsItem.minAmountHolidayRestDay}</span></div>
                                <div><span className="text-gray-700 font-medium">Max. Hours for Holiday and Rest Day : </span><span className="text-gray-900">{detailsItem.maxHrsHolidayRestDay}</span> <span className="text-gray-700 font-medium">Amount: </span><span className="text-gray-900">{detailsItem.maxAmountHolidayRestDay}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showAllowanceCodeModal && (
                <SearchModal
                    title="Earnings Code"
                    searchTerm={allowanceCodeSearchTerm}
                    setSearchTerm={setAllowanceCodeSearchTerm}
                    data={filteredEarningCodes}
                    onSelect={(code) => {
                        setFormData({ ...formData, allowanceCode: code });
                        setShowAllowanceCodeModal(false);
                        setAllowanceCodeSearchTerm('');
                    }}
                    onClose={() => setShowAllowanceCodeModal(false)}
                />
            )}

            {showWorkshiftCodeModal && (
                <SearchModal
                    title="Workshift Code"
                    searchTerm={workshiftCodeSearchTerm}
                    setSearchTerm={setWorkshiftCodeSearchTerm}
                    data={filteredWorkshiftCodes}
                    onSelect={(code) => {
                        setFormData({ ...formData, workShiftCode: code });
                        setShowWorkshiftCodeModal(false);
                        setWorkshiftCodeSearchTerm('');
                    }}
                    onClose={() => setShowWorkshiftCodeModal(false)}
                />
            )}

            {showClassificationCodeModal && (
                <SearchModal
                    title="Classification Code"
                    searchTerm={classificationCodeSearchTerm}
                    setSearchTerm={setClassificationCodeSearchTerm}
                    data={filteredClassificationCodes}
                    onSelect={(code) => {
                        setFormData({ ...formData, classificationCode: code });
                        setShowClassificationCodeModal(false);
                        setClassificationCodeSearchTerm('');
                    }}
                    onClose={() => setShowClassificationCodeModal(false)}
                />
            )}

            <Footer />
        </div>
    );
}

// Form Modal Component
interface FormModalProps {
    title: string;
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    loading: boolean;
    setShowAllowanceCodeModal: (show: boolean) => void;
    setShowWorkshiftCodeModal: (show: boolean) => void;
    setShowClassificationCodeModal: (show: boolean) => void;
    submitButtonText: string;
}

function FormModal({
    title,
    formData,
    setFormData,
    onSubmit,
    onClose,
    loading,
    setShowAllowanceCodeModal,
    setShowWorkshiftCodeModal,
    setShowClassificationCodeModal,
    submitButtonText
}: FormModalProps) {

    const numVal = (val: number) => val === 0 ? '' : val;
    const parseNum = (val: string) => val === '' ? 0 : parseFloat(val) || 0;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[75vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl flex-shrink-0">
                    <h2 className="text-gray-800 font-semibold">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1">
                    <form onSubmit={onSubmit} className="p-6">
                        <h3 className="text-blue-600 mb-4 font-semibold">Allowance Per Classification</h3>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <label className="text-gray-700 text-sm whitespace-nowrap w-56">Reference Code :</label>
                                <input
                                    type="text"
                                    value={formData.refNo}
                                    onChange={(e) => setFormData({ ...formData, refNo: e.target.value })}
                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="text-gray-700 text-sm whitespace-nowrap w-56">Allowance Code :</label>
                                <input
                                    type="text"
                                    value={formData.allowanceCode}
                                    onChange={(e) => setFormData({ ...formData, allowanceCode: e.target.value })}
                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    required
                                />
                                <button type="button" onClick={() => setShowAllowanceCodeModal(true)}
                                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                    <Search className="w-4 h-4" />
                                </button>
                                <button type="button" onClick={() => setFormData({ ...formData, allowanceCode: '' })}
                                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="text-gray-700 text-sm whitespace-nowrap w-56">Workshift Code :</label>
                                <input
                                    type="text"
                                    value={formData.workShiftCode}
                                    onChange={(e) => setFormData({ ...formData, workShiftCode: e.target.value })}
                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    required
                                />
                                <button type="button" onClick={() => setShowWorkshiftCodeModal(true)}
                                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                    <Search className="w-4 h-4" />
                                </button>
                                <button type="button" onClick={() => setFormData({ ...formData, workShiftCode: '' })}
                                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="text-gray-700 text-sm whitespace-nowrap w-56">Classification :</label>
                                <input
                                    type="text"
                                    value={formData.classificationCode}
                                    onChange={(e) => setFormData({ ...formData, classificationCode: e.target.value })}
                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                <button type="button" onClick={() => setShowClassificationCodeModal(true)}
                                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                    <Search className="w-4 h-4" />
                                </button>
                                <button type="button" onClick={() => setFormData({ ...formData, classificationCode: '' })}
                                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Regular Day */}
                            <div className="flex items-center gap-3">
                                <label className="text-gray-700 text-sm whitespace-nowrap w-56">Min. Hours for Regular Day :</label>
                                <input type="number" step="0.01"
                                    value={numVal(formData.minHrsRegDay)}
                                    onChange={(e) => setFormData({ ...formData, minHrsRegDay: parseNum(e.target.value) })}
                                    placeholder="0"
                                    className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                                <label className="text-gray-700 text-sm whitespace-nowrap">Amount :</label>
                                <input type="number" step="0.01"
                                    value={numVal(formData.minAmtRegDay)}
                                    onChange={(e) => setFormData({ ...formData, minAmtRegDay: parseNum(e.target.value) })}
                                    placeholder="0"
                                    className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="text-gray-700 text-sm whitespace-nowrap w-56">Max. Hours for Regular Day :</label>
                                <input type="number" step="0.01"
                                    value={numVal(formData.maxHrsRegDay)}
                                    onChange={(e) => setFormData({ ...formData, maxHrsRegDay: parseNum(e.target.value) })}
                                    placeholder="0"
                                    className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                                <label className="text-gray-700 text-sm whitespace-nowrap">Amount :</label>
                                <input type="number" step="0.01"
                                    value={numVal(formData.maxAmtRegDay)}
                                    onChange={(e) => setFormData({ ...formData, maxAmtRegDay: parseNum(e.target.value) })}
                                    placeholder="0"
                                    className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                            </div>

                            {/* Rest Day */}
                            <div className="flex items-center gap-3">
                                <label className="text-gray-700 text-sm whitespace-nowrap w-56">Min. Hours for Rest Day :</label>
                                <input type="number" step="0.01"
                                    value={numVal(formData.minHrsRestDay)}
                                    onChange={(e) => setFormData({ ...formData, minHrsRestDay: parseNum(e.target.value) })}
                                    placeholder="0"
                                    className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                                <label className="text-gray-700 text-sm whitespace-nowrap">Amount :</label>
                                <input type="number" step="0.01"
                                    value={numVal(formData.minAmtRestDay)}
                                    onChange={(e) => setFormData({ ...formData, minAmtRestDay: parseNum(e.target.value) })}
                                    placeholder="0"
                                    className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="text-gray-700 text-sm whitespace-nowrap w-56">Max. Hours for Rest Day :</label>
                                <input type="number" step="0.01"
                                    value={numVal(formData.maxHrsRestDay)}
                                    onChange={(e) => setFormData({ ...formData, maxHrsRestDay: parseNum(e.target.value) })}
                                    placeholder="0"
                                    className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                                <label className="text-gray-700 text-sm whitespace-nowrap">Amount :</label>
                                <input type="number" step="0.01"
                                    value={numVal(formData.maxAmtRestDay)}
                                    onChange={(e) => setFormData({ ...formData, maxAmtRestDay: parseNum(e.target.value) })}
                                    placeholder="0"
                                    className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                            </div>

                            {/* Holiday */}
                            <div className="flex items-center gap-3">
                                <label className="text-gray-700 text-sm whitespace-nowrap w-56">Min. Hours for Holiday :</label>
                                <input type="number" step="0.01"
                                    value={numVal(formData.minHrsHoliday)}
                                    onChange={(e) => setFormData({ ...formData, minHrsHoliday: parseNum(e.target.value) })}
                                    placeholder="0"
                                    className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                                <label className="text-gray-700 text-sm whitespace-nowrap">Amount :</label>
                                <input type="number" step="0.01"
                                    value={numVal(formData.minAmtHoliday)}
                                    onChange={(e) => setFormData({ ...formData, minAmtHoliday: parseNum(e.target.value) })}
                                    placeholder="0"
                                    className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="text-gray-700 text-sm whitespace-nowrap w-56">Max. Hours for Holiday :</label>
                                <input type="number" step="0.01"
                                    value={numVal(formData.maxHrsHoliday)}
                                    onChange={(e) => setFormData({ ...formData, maxHrsHoliday: parseNum(e.target.value) })}
                                    placeholder="0"
                                    className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                                <label className="text-gray-700 text-sm whitespace-nowrap">Amount :</label>
                                <input type="number" step="0.01"
                                    value={numVal(formData.maxAmtHoliday)}
                                    onChange={(e) => setFormData({ ...formData, maxAmtHoliday: parseNum(e.target.value) })}
                                    placeholder="0"
                                    className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                            </div>

                            {/* Holiday and Rest Day */}
                            <div className="flex items-center gap-3">
                                <label className="text-gray-700 text-sm whitespace-nowrap w-56">Min. Hours for Holiday and Rest Day :</label>
                                <input type="number" step="0.01"
                                    value={numVal(formData.minHrsHolidayRestDay)}
                                    onChange={(e) => setFormData({ ...formData, minHrsHolidayRestDay: parseNum(e.target.value) })}
                                    placeholder="0"
                                    className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                                <label className="text-gray-700 text-sm whitespace-nowrap">Amount :</label>
                                <input type="number" step="0.01"
                                    value={numVal(formData.minAmountHolidayRestDay)}
                                    onChange={(e) => setFormData({ ...formData, minAmountHolidayRestDay: parseNum(e.target.value) })}
                                    placeholder="0"
                                    className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="text-gray-700 text-sm whitespace-nowrap w-56">Max. Hours for Holiday and Rest Day :</label>
                                <input type="number" step="0.01"
                                    value={numVal(formData.maxHrsHolidayRestDay)}
                                    onChange={(e) => setFormData({ ...formData, maxHrsHolidayRestDay: parseNum(e.target.value) })}
                                    placeholder="0"
                                    className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                                <label className="text-gray-700 text-sm whitespace-nowrap">Amount :</label>
                                <input type="number" step="0.01"
                                    value={numVal(formData.maxAmountHolidayRestDay)}
                                    onChange={(e) => setFormData({ ...formData, maxAmountHolidayRestDay: parseNum(e.target.value) })}
                                    placeholder="0"
                                    className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button type="submit" disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm disabled:opacity-50">
                                {submitButtonText}
                            </button>
                            <button type="button" onClick={onClose}
                                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm">
                                Back to List
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

interface SearchModalProps {
    title: string;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    data: any[];
    onSelect: (code: string) => void;
    onClose: () => void;
    style?: React.CSSProperties;
}

function SearchModal({ title, searchTerm, setSearchTerm, data, onSelect, onClose, style }: SearchModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
                style={style}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                    <h2 className="text-gray-800 text-sm font-semibold">Search</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-3">
                    <h3 className="text-blue-600 mb-2 text-sm font-semibold">{title}</h3>

                    <div className="flex items-center gap-2 mb-3">
                        <label className="text-gray-700 text-sm whitespace-nowrap">Search:</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Type to filter..."
                        />
                    </div>

                    <div className="border border-gray-200 rounded overflow-hidden" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="w-full border-collapse text-sm">
                            <thead className="sticky top-0 bg-white z-10">
                                <tr className="bg-gray-100 border-b-2 border-gray-300">
                                    <th className="px-3 py-1.5 text-left text-gray-700 text-sm font-semibold">Code</th>
                                    <th className="px-3 py-1.5 text-left text-gray-700 text-sm font-semibold">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.length > 0 ? (
                                    data.map((item) => (
                                        <tr
                                            key={item.id || item.code}
                                            className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                                            onClick={() => onSelect(item.code)}
                                        >
                                            <td className="px-3 py-1.5 text-gray-900 font-medium">{item.code}</td>
                                            <td className="px-3 py-1.5 text-gray-600">{item.description}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={2} className="px-3 py-8 text-center text-gray-500 italic">
                                            No entries found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}