import { useState, useEffect, useRef } from 'react';
import { Search, Plus, X, Check, Calendar, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';
import Swal from 'sweetalert2';
import apiClient from '../../../../services/apiClient';
import { decryptData } from '../../../../services/encryptionService';
import { CalendarPopup } from '../../../CalendarPopup';


interface AMSDatabase {
    id: number;
    description: string;
    server: string;
    databaseName: string;
    username: string;
    password?: string;
    withDeviceCode: boolean;
    lastDateUpdated: string;
    tableName: string;
    empCode: string;
    timeStamp: string;
    flag: string;
    flagCode: string;
    isAutomaticEmpCode: boolean;
    employeeCodeTable: string;
    employeeCodeCol: string;
    empoyeeCodeIDCol: string;
    dateDaysAhead: number;
    lastDateUpdateReplica: string;
    lastDateUpdateTo: string;
    lastDateUpdateFlag: boolean;
    lastDateUpdateFrom: string;
    deviceNameCol: string;
}

interface FlagCode {
    id: number;
    flagCode: string;
    timeIn: string;
    timeOut: string;
    break1Out: string;
    break1In: string;
    break2Out: string;
    break2In: string;
    break3Out: string;
    break3In: string;
}

export function AMSDatabaseConfigurationSetupPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showFlagSearchModal, setShowFlagSearchModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingItem, setEditingItem] = useState<AMSDatabase | null>(null);
    const [flagSearchTerm, setFlagSearchTerm] = useState('');
    const [showCalendar, setShowCalendar] = useState<'lastDateUpdated' | 'lastDateUpdatedFrom' | 'lastDateUpdatedTo' | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        description: '',
        server: '',
        databaseName: '',
        username: '',
        password: '',
        withDeviceCode: false,
        lastDateUpdated: '',
        tableName: '',
        empCodeColumn: '',
        timeStampColumn: '',
        flagColumn: '',
        flagCode: '',
        automaticEmpCode: false,
        empCodeTableName: '',
        empCodeColumnName: '',
        empCodeIDColumn: '',
        daysToDeduct: '',
        specificRange: false,
        lastDateUpdatedFrom: '',
        lastDateUpdatedTo: '',
        deviceNameColumn: ''
    });

    const [databases, setDatabases] = useState<AMSDatabase[]>([]);
    const [loadingDatabases, setLoadingDatabases] = useState(false);
    const [databasesError, setDatabasesError] = useState('');

    const [flagCodes, setFlagCodes] = useState<FlagCode[]>([]);
    const [loadingFlags, setLoadingFlags] = useState(false);

    const itemsPerPage = 10;

    // Permissions
    const [permissions, setPermissions] = useState<Record<string, boolean>>({});
    const hasPermission = (accessType: string) => permissions[accessType] === true;

    useEffect(() => {
        getAMSDatabaseConfigPermissions();
    }, []);

    const getAMSDatabaseConfigPermissions = () => {
        const rawPayload = localStorage.getItem("loginPayload");
        if (!rawPayload) return;
        try {
            const parsedPayload = JSON.parse(rawPayload);
            const encryptedArray: any[] = parsedPayload.permissions || [];
            const branchEntries = encryptedArray.filter(
                (p) => decryptData(p.formName) === "AMSDbConfigSetup"
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

    useEffect(() => {
        fetchAMSDatabases();
        fetchFlagCodes();
    }, []);

    const fetchAMSDatabases = async () => {
        setLoadingDatabases(true);
        setDatabasesError('');
        try {
            const response = await apiClient.get('/Fs/Process/Device/AMSDbConfigSetUp');
            if (response.status === 200 && response.data) {
                setDatabases(response.data);
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to load AMS databases';
            setDatabasesError(errorMsg);
        } finally {
            setLoadingDatabases(false);
        }
    };

    const fetchFlagCodes = async () => {
        setLoadingFlags(true);
        try {
            const response = await apiClient.get('/Fs/Process/Device/DTRFlagSetUp');
            if (response.status === 200 && response.data) {
                setFlagCodes(response.data);
            }
        } catch (error: any) {
            console.error('Error fetching flag codes:', error);
            setFlagCodes([]);
        } finally {
            setLoadingFlags(false);
        }
    };

    const filteredData = databases.filter(item =>
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.server.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.databaseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const filteredFlags = flagCodes.filter(flag =>
        flag.flagCode.toLowerCase().includes(flagSearchTerm.toLowerCase())
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleCreateNew = () => {
        setFormData({
            description: '',
            server: '',
            databaseName: '',
            username: '',
            password: '',
            withDeviceCode: false,
            lastDateUpdated: '',
            tableName: '',
            empCodeColumn: '',
            timeStampColumn: '',
            flagColumn: '',
            flagCode: '',
            automaticEmpCode: false,
            empCodeTableName: '',
            empCodeColumnName: '',
            empCodeIDColumn: '',
            daysToDeduct: '',
            specificRange: false,
            lastDateUpdatedFrom: '',
            lastDateUpdatedTo: '',
            deviceNameColumn: ''
        });
        setShowCalendar(null);
        setShowCreateModal(true);
    };

    const handleEdit = (item: AMSDatabase) => {
        setEditingItem(item);
        setFormData({
            description: item.description,
            server: item.server,
            databaseName: item.databaseName,
            username: item.username,
            password: '',
            withDeviceCode: item.withDeviceCode,
            lastDateUpdated: item.lastDateUpdated,
            tableName: item.tableName,
            empCodeColumn: item.empCode,
            timeStampColumn: item.timeStamp,
            flagColumn: item.flag,
            flagCode: item.flagCode,
            automaticEmpCode: item.isAutomaticEmpCode,
            empCodeTableName: item.employeeCodeTable,
            empCodeColumnName: item.employeeCodeCol,
            empCodeIDColumn: item.empoyeeCodeIDCol,
            daysToDeduct: item.dateDaysAhead.toString(),
            specificRange: item.lastDateUpdateFlag,
            lastDateUpdatedFrom: item.lastDateUpdateFrom,
            lastDateUpdatedTo: item.lastDateUpdateTo,
            deviceNameColumn: item.deviceNameCol
        });
        setShowCalendar(null);
        setShowEditModal(true);
    };

    const handleDelete = async (item: AMSDatabase) => {
        const confirmed = await Swal.fire({
            icon: 'warning',
            title: 'Confirm Delete',
            text: `Are you sure you want to delete database configuration "${item.description}"?`,
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
        });
        if (confirmed.isConfirmed) {
            try {
                await apiClient.delete(`/Fs/Process/Device/AMSDbConfigSetUp/${item.id}`);
                await Swal.fire({ icon: 'success', title: 'Success', text: 'Database configuration deleted successfully.', timer: 2000, showConfirmButton: false });
                await fetchAMSDatabases();
            } catch (error: any) {
                const errorMsg = error.response?.data?.message || error.message || 'Failed to delete database configuration';
                await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
            }
        }
    };

    const handleSubmitCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description.trim()) { await Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Description is required.' }); return; }
        if (!formData.server.trim()) { await Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Server is required.' }); return; }
        if (!formData.databaseName.trim()) { await Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Database Name is required.' }); return; }
        if (!formData.username.trim()) { await Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Username is required.' }); return; }

        setSubmitting(true);
        try {
            const payload = {
                id: 0,
                description: formData.description,
                server: formData.server,
                databaseName: formData.databaseName,
                username: formData.username,
                password: formData.password,
                lastDateUpdated: formData.lastDateUpdated || new Date().toISOString(),
                withDeviceCode: formData.withDeviceCode,
                tableName: formData.tableName,
                empCode: formData.empCodeColumn,
                timeStamp: formData.timeStampColumn,
                flag: formData.flagColumn,
                flagCode: formData.flagCode,
                isAutomaticEmpCode: formData.automaticEmpCode,
                employeeCodeTable: formData.empCodeTableName,
                employeeCodeCol: formData.empCodeColumnName,
                empoyeeCodeIDCol: formData.empCodeIDColumn,
                dateDaysAhead: parseInt(formData.daysToDeduct) || 0,
                lastDateUpdateReplica: '',
                lastDateUpdateTo: formData.lastDateUpdatedTo || new Date().toISOString(),
                lastDateUpdateFlag: formData.specificRange,
                lastDateUpdateFrom: formData.lastDateUpdatedFrom || new Date().toISOString(),
                deviceNameCol: formData.deviceNameColumn
            };
            await apiClient.post('/Fs/Process/Device/AMSDbConfigSetUp', payload);
            await Swal.fire({ icon: 'success', title: 'Success', text: 'Database configuration created successfully.', timer: 2000, showConfirmButton: false });
            await fetchAMSDatabases();
            setShowCreateModal(false);
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
            await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;
        if (!formData.description.trim()) { await Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Description is required.' }); return; }
        if (!formData.server.trim()) { await Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Server is required.' }); return; }
        if (!formData.databaseName.trim()) { await Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Database Name is required.' }); return; }
        if (!formData.username.trim()) { await Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Username is required.' }); return; }

        setSubmitting(true);
        try {
            const payload = {
                id: editingItem.id,
                description: formData.description,
                server: formData.server,
                databaseName: formData.databaseName,
                username: formData.username,
                password: formData.password || editingItem.password,
                lastDateUpdated: formData.lastDateUpdated || editingItem.lastDateUpdated,
                withDeviceCode: formData.withDeviceCode,
                tableName: formData.tableName,
                empCode: formData.empCodeColumn,
                timeStamp: formData.timeStampColumn,
                flag: formData.flagColumn,
                flagCode: formData.flagCode,
                isAutomaticEmpCode: formData.automaticEmpCode,
                employeeCodeTable: formData.empCodeTableName,
                employeeCodeCol: formData.empCodeColumnName,
                empoyeeCodeIDCol: formData.empCodeIDColumn,
                dateDaysAhead: parseInt(formData.daysToDeduct) || 0,
                lastDateUpdateReplica: editingItem.lastDateUpdateReplica,
                lastDateUpdateTo: formData.lastDateUpdatedTo || editingItem.lastDateUpdateTo,
                lastDateUpdateFlag: formData.specificRange,
                lastDateUpdateFrom: formData.lastDateUpdatedFrom || editingItem.lastDateUpdateFrom,
                deviceNameCol: formData.deviceNameColumn
            };
            await apiClient.put(`/Fs/Process/Device/AMSDbConfigSetUp/${editingItem.id}`, payload);
            await Swal.fire({ icon: 'success', title: 'Success', text: 'Database configuration updated successfully.', timer: 2000, showConfirmButton: false });
            await fetchAMSDatabases();
            setShowEditModal(false);
            setEditingItem(null);
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
            await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setShowFlagSearchModal(false);
        setShowCalendar(null);
        setEditingItem(null);
    };

    const handleSelectFlagCode = (code: string) => {
        setFormData(prev => ({ ...prev, flagCode: code }));
        setShowFlagSearchModal(false);
        setFlagSearchTerm('');
    };

    const handleCalendarSelect = (field: 'lastDateUpdated' | 'lastDateUpdatedFrom' | 'lastDateUpdatedTo', date: string) => {
        setFormData(prev => ({ ...prev, [field]: date }));
        setShowCalendar(null);
    };

    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (showCalendar) {
                    setShowCalendar(null);
                } else if (showFlagSearchModal) {
                    setShowFlagSearchModal(false);
                } else if (showCreateModal) {
                    setShowCreateModal(false);
                } else if (showEditModal) {
                    setShowEditModal(false);
                    setEditingItem(null);
                }
            }
        };
        if (showCreateModal || showEditModal || showFlagSearchModal || showCalendar) {
            document.addEventListener('keydown', handleEscKey);
        }
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [showCreateModal, showEditModal, showFlagSearchModal, showCalendar]);

    const labelClass = "text-gray-700 text-sm whitespace-nowrap w-40 shrink-0";
    const inputClass = "flex-1 min-w-0 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

    // Reusable date field with inline CalendarPopup
    const renderDateField = (
        label: string,
        fieldKey: 'lastDateUpdated' | 'lastDateUpdatedFrom' | 'lastDateUpdatedTo',
        labelWidth: string = 'w-40'
    ) => (
        <div className="flex items-center gap-1 flex-1 min-w-0 relative">
            <input
                type="text"
                value={formData[fieldKey]}
                onChange={(e) => setFormData({ ...formData, [fieldKey]: e.target.value })}
                placeholder="MM/DD/YYYY"
                className={inputClass}
            />
            <button
                type="button"
                className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center transition-colors shrink-0"
                onClick={() => setShowCalendar(showCalendar === fieldKey ? null : fieldKey)}
            >
                <Calendar className="w-4 h-4" />
            </button>
            {showCalendar === fieldKey && (
                <CalendarPopup
                    onDateSelect={(date) => handleCalendarSelect(fieldKey, date)}
                    onClose={() => setShowCalendar(null)}
                />
            )}
        </div>
    );

    const renderFormFields = () => (
        <div className="space-y-3">
            {/* Description */}
            <div className="flex items-center gap-3">
                <label className={labelClass}>Description :</label>
                <input type="text" value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={inputClass} required />
            </div>

            {/* Server & Database Name */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                    <label className={labelClass}>Server :</label>
                    <input type="text" value={formData.server}
                        onChange={(e) => setFormData({ ...formData, server: e.target.value })}
                        className={inputClass} required />
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm whitespace-nowrap w-36 shrink-0">Database Name :</label>
                    <input type="text" value={formData.databaseName}
                        onChange={(e) => setFormData({ ...formData, databaseName: e.target.value })}
                        className={inputClass} required />
                </div>
            </div>

            {/* Username & Password */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                    <label className={labelClass}>Username :</label>
                    <input type="text" value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className={inputClass} required />
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm whitespace-nowrap w-36 shrink-0">Password :</label>
                    <input type="password" value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={inputClass} />
                </div>
            </div>

            {/* With Device Code & Last Date Updated */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                    <label className={labelClass}>With Device Code :</label>
                    <input type="checkbox" checked={formData.withDeviceCode}
                        onChange={(e) => setFormData({ ...formData, withDeviceCode: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm whitespace-nowrap w-36 shrink-0">Last Date Updated :</label>
                    {renderDateField('Last Date Updated', 'lastDateUpdated', 'w-36')}
                </div>
            </div>

            {/* Table Name */}
            <div className="flex items-center gap-3">
                <label className={labelClass}>Table Name :</label>
                <input type="text" value={formData.tableName}
                    onChange={(e) => setFormData({ ...formData, tableName: e.target.value })}
                    className={inputClass} />
            </div>

            {/* EmpCode Column & Time Stamp Column */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                    <label className={labelClass}>EmpCode Column :</label>
                    <input type="text" value={formData.empCodeColumn}
                        onChange={(e) => setFormData({ ...formData, empCodeColumn: e.target.value })}
                        className={inputClass} />
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm whitespace-nowrap w-36 shrink-0">Time Stamp Column :</label>
                    <input type="text" value={formData.timeStampColumn}
                        onChange={(e) => setFormData({ ...formData, timeStampColumn: e.target.value })}
                        className={inputClass} />
                </div>
            </div>

            {/* Flag Column & Flag Code */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                    <label className={labelClass}>Flag Column :</label>
                    <input type="text" value={formData.flagColumn}
                        onChange={(e) => setFormData({ ...formData, flagColumn: e.target.value })}
                        className={inputClass} />
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm whitespace-nowrap w-36 shrink-0">Flag Code :</label>
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                        <input type="text" value={formData.flagCode}
                            onChange={(e) => setFormData({ ...formData, flagCode: e.target.value })}
                            className={inputClass} readOnly />
                        <button type="button" onClick={() => setShowFlagSearchModal(true)}
                            className="w-8 h-8 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center shrink-0">
                            <Search className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => setFormData({ ...formData, flagCode: '' })}
                            className="w-8 h-8 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center justify-center shrink-0">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Automatic EmpCode */}
            <div className="flex items-center gap-3">
                <label className={labelClass}>Automatic EmpCode :</label>
                <input type="checkbox" checked={formData.automaticEmpCode}
                    onChange={(e) => setFormData({ ...formData, automaticEmpCode: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* EmpCode Table Name */}
            <div className="flex items-center gap-3">
                <label className={labelClass}>EmpCode Table Name :</label>
                <input type="text" value={formData.empCodeTableName}
                    onChange={(e) => setFormData({ ...formData, empCodeTableName: e.target.value })}
                    className={inputClass} />
            </div>

            {/* EmpCode Column & EmpCode ID Column */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                    <label className={labelClass}>EmpCode Column :</label>
                    <input type="text" value={formData.empCodeColumnName}
                        onChange={(e) => setFormData({ ...formData, empCodeColumnName: e.target.value })}
                        className={inputClass} />
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm whitespace-nowrap w-36 shrink-0">EmpCode ID Column :</label>
                    <input type="text" value={formData.empCodeIDColumn}
                        onChange={(e) => setFormData({ ...formData, empCodeIDColumn: e.target.value })}
                        className={inputClass} />
                </div>
            </div>

            {/* Days to Deduct */}
            <div className="flex items-center gap-3">
                <label className="text-gray-700 text-sm whitespace-nowrap w-56 shrink-0">Days to Deduct to Convert Date :</label>
                <input type="text" value={formData.daysToDeduct}
                    onChange={(e) => setFormData({ ...formData, daysToDeduct: e.target.value })}
                    className={inputClass} />
            </div>

            {/* Specific Range */}
            <div className="flex items-center gap-3">
                <label className={labelClass}>Specific Range :</label>
                <input type="checkbox" checked={formData.specificRange}
                    onChange={(e) => setFormData({ ...formData, specificRange: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Last Date Updated From & To */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm whitespace-nowrap w-40 shrink-0">Last Date Updated From :</label>
                    {renderDateField('Last Date Updated From', 'lastDateUpdatedFrom', 'w-40')}
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm whitespace-nowrap w-36 shrink-0">Date Updated To :</label>
                    {renderDateField('Date Updated To', 'lastDateUpdatedTo', 'w-36')}
                </div>
            </div>

            {/* Device Name Column */}
            <div className="flex items-center gap-3">
                <label className={labelClass}>Device Name Column :</label>
                <input type="text" value={formData.deviceNameColumn}
                    onChange={(e) => setFormData({ ...formData, deviceNameColumn: e.target.value })}
                    className={inputClass} />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex-1 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
                        <h1 className="text-white">AMS Database Configuration Setup</h1>
                    </div>

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
                                        Configure database connections for Attendance Management System (AMS) integration. Set up server details, credentials, and field mappings to synchronize employee time logs from external biometric systems.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        {['External database connectivity', 'Field mapping configuration', 'Device code support', 'Automatic synchronization'].map(item => (
                                            <div key={item} className="flex items-start gap-2">
                                                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-600">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Controls */}
                        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                            {(hasPermission('Add') && hasPermission('View')) && (
                                <button onClick={handleCreateNew}
                                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                                    <Plus className="w-4 h-4" />
                                    Create New
                                </button>
                            )}
                            {hasPermission('View') && (
                                <div className="flex items-center gap-2">
                                    <label className="text-gray-700 text-sm">Search:</label>
                                    <input type="text" value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64" />
                                </div>
                            )}
                        </div>

                        {/* Table */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            {loadingDatabases ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="text-gray-600 text-sm">Loading database configurations...</div>
                                </div>
                            ) : databasesError ? (
                                <div className="p-4 bg-red-50 border border-red-200 rounded">
                                    <p className="text-red-700 text-sm">{databasesError}</p>
                                </div>
                            ) : hasPermission('View') ? (
                                <table className="w-full">
                                    <thead className="bg-gray-100 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Description</th>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Server</th>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Database Name</th>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Username</th>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">With Device Code</th>
                                            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Last Date Updated</th>
                                            {(hasPermission('Edit') || hasPermission('Delete')) && (
                                                <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase">Actions</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {paginatedData.length > 0 ? (
                                            paginatedData.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{item.server}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{item.databaseName}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{item.username}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{item.withDeviceCode ? 'Yes' : 'No'}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {new Date(item.lastDateUpdated).toLocaleDateString()}
                                                    </td>
                                                    {(hasPermission('Edit') || hasPermission('Delete')) && (
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-center gap-2">
                                                                {hasPermission('Edit') && (
                                                                    <button onClick={() => handleEdit(item)}
                                                                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors" title="Edit">
                                                                        <Edit className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                                {hasPermission('Edit') && hasPermission('Delete') && (
                                                                    <span className="text-gray-300">|</span>
                                                                )}
                                                                {hasPermission('Delete') && (
                                                                    <button onClick={() => handleDelete(item)}
                                                                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors" title="Delete">
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
                                                <td colSpan={7} className="px-6 py-16 text-center">
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

                        {/* Pagination */}
                        {hasPermission('View') && (
                            <div className="mt-4 flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                    Showing {filteredData.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
                                </span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                        Previous
                                    </button>
                                    <button className="px-3 py-1 bg-blue-500 text-white rounded">
                                        {currentPage}
                                    </button>
                                    <button onClick={() => setCurrentPage(prev => Math.min(totalPages || 1, prev + 1))}
                                        disabled={currentPage >= totalPages || filteredData.length === 0}
                                        className="px-4 py-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0">
                            <h2 className="text-gray-900">Create New</h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitCreate} className="p-6">
                            <h3 className="text-blue-600 mb-4">AMS Database Configuration Setup</h3>
                            {renderFormFields()}
                            <div className="flex gap-3 mt-5 pt-4 border-t border-gray-200">
                                <button type="submit" disabled={submitting}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm">
                                    {submitting ? 'Submitting...' : 'Submit'}
                                </button>
                                <button type="button" onClick={handleCloseModal} disabled={submitting}
                                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm">
                                    Back to List
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0">
                            <h2 className="text-gray-900">Edit</h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitEdit} className="p-6">
                            <h3 className="text-blue-600 mb-4">AMS Database Configuration Setup</h3>
                            {renderFormFields()}
                            <div className="flex gap-3 mt-5 pt-4 border-t border-gray-200">
                                <button type="submit" disabled={submitting}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm">
                                    {submitting ? 'Updating...' : 'Update'}
                                </button>
                                <button type="button" onClick={handleCloseModal} disabled={submitting}
                                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm">
                                    Back to List
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Flag Search Modal */}
            {showFlagSearchModal && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0">
                            <h2 className="text-gray-900">Search</h2>
                            <button onClick={() => setShowFlagSearchModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <h3 className="text-blue-600 mb-4">DTR Flag</h3>
                            <div className="flex items-center justify-end gap-2 mb-4">
                                <label className="text-gray-700 text-sm">Search:</label>
                                <input type="text" value={flagSearchTerm}
                                    onChange={(e) => setFlagSearchTerm(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64" />
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                                {loadingFlags ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="text-gray-600 text-sm">Loading flag codes...</div>
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Flag Code</th>
                                                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Time In</th>
                                                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Time Out</th>
                                                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Break1 Out</th>
                                                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Break1 In</th>
                                                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Break2 Out</th>
                                                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Break2 In</th>
                                                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Break3 Out</th>
                                                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Break3 In</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredFlags.length > 0 ? (
                                                filteredFlags.map((flag, index) => (
                                                    <tr key={index}
                                                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                                                        onClick={() => handleSelectFlagCode(flag.flagCode)}>
                                                        <td className="px-4 py-3 text-sm text-blue-600 hover:underline">{flag.flagCode}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{flag.timeIn}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{flag.timeOut}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{flag.break1Out}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{flag.break1In}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{flag.break2Out}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{flag.break2In}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{flag.break3Out}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{flag.break3In}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">No flag codes available</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}