import { useState, useEffect, useRef } from 'react';
import { Search, Plus, X, Check, Calendar, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';
import apiClient from '../../../../services/apiClient';
import Swal from 'sweetalert2';

interface MySQLConfig {
    id: number;
    description: string;
    server: string;
    databaseName: string;
    username: string;
    password: string;
    lastDateUpdated: string;
    lastDateUpdateReplica: string;
    lastDateUpdateTo: string;
    lastDateUpdateFlag: boolean;
    lastDateUpdateFrom: string;
    withDeviceCode: boolean;
}

interface CalendarPopupProps {
    value: string;
    onChange: (date: string) => void;
    onClose: () => void;
    position: { top: number; left: number };
}

function CalendarPopup({ value, onChange, onClose, position }: CalendarPopupProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const handleDateClick = (day: number) => {
        const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
        const year = currentMonth.getFullYear();
        const dayStr = String(day).padStart(2, '0');
        onChange(`${year}-${month}-${dayStr}T00:00:00.000Z`);
        onClose();
    };

    const renderDays = () => {
        const days = [];
        const prevMonthDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();

        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            days.push(
                <div key={`prev-${i}`} className="text-center py-2 text-gray-400 text-sm">
                    {prevMonthDays - i}
                </div>
            );
        }
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(
                <div
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className="text-center py-2 text-sm cursor-pointer hover:bg-blue-100 rounded transition-colors"
                >
                    {day}
                </div>
            );
        }
        const remainingDays = 42 - days.length;
        for (let day = 1; day <= remainingDays; day++) {
            days.push(
                <div key={`next-${day}`} className="text-center py-2 text-gray-400 text-sm">
                    {day}
                </div>
            );
        }
        return days;
    };

    return (
        <div
            ref={popupRef}
            className="fixed inset-0 flex items-center justify-center z-[100]"
        >
            <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-4" style={{ width: '280px' }}>
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="font-medium">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</div>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-center text-xs text-gray-600 font-medium">{day}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
        </div>
        </div>
    );
}

// Helper to format ISO date to display string
const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    } catch {
        return dateStr;
    }
};

export function MySQLDatabaseConfigurationSetupPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [showCalendar, setShowCalendar] = useState<'lastDateUpdated' | 'lastDateUpdateFrom' | 'lastDateUpdateTo' | null>(null);
    const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });

    const [formData, setFormData] = useState({
        description: '',
        server: '',
        databaseName: '',
        username: '',
        password: '',
        withDeviceCode: false,
        lastDateUpdated: '',
        lastDateUpdateReplica: '',
        lastDateUpdateFlag: false,
        lastDateUpdateFrom: '',
        lastDateUpdateTo: ''
    });

    // List & loading states
    const [configs, setConfigs] = useState<MySQLConfig[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const itemsPerPage = 20;

    // Fetch all configs
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/Fs/Process/Device/MySQLDbConfigSetUp');
            if (response.status === 200 && response.data) {
                setConfigs(response.data);
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to load configurations';
            await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
            console.error('Error fetching MySQL configs:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filtered & paginated
    const filteredData = configs.filter(item =>
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.server.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.databaseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

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
    }, [searchTerm]);

    // Reset form
    const resetForm = () => {
        setFormData({
            description: '',
            server: '',
            databaseName: '',
            username: '',
            password: '',
            withDeviceCode: false,
            lastDateUpdated: '',
            lastDateUpdateReplica: '',
            lastDateUpdateFlag: false,
            lastDateUpdateFrom: '',
            lastDateUpdateTo: ''
        });
    };

    const handleCreateNew = () => {
        setIsEditMode(false);
        setSelectedId(null);
        resetForm();
        setShowModal(true);
    };

    const handleEdit = (item: MySQLConfig) => {
        setIsEditMode(true);
        setSelectedId(item.id);
        setFormData({
            description: item.description || '',
            server: item.server || '',
            databaseName: item.databaseName || '',
            username: item.username || '',
            password: item.password || '',
            withDeviceCode: item.withDeviceCode || false,
            lastDateUpdated: item.lastDateUpdated || '',
            lastDateUpdateReplica: item.lastDateUpdateReplica || '',
            lastDateUpdateFlag: item.lastDateUpdateFlag || false,
            lastDateUpdateFrom: item.lastDateUpdateFrom || '',
            lastDateUpdateTo: item.lastDateUpdateTo || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (item: MySQLConfig) => {
        const confirmed = await Swal.fire({
            icon: 'warning',
            title: 'Confirm Delete',
            text: `Are you sure you want to delete "${item.description}"?`,
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
        });

        if (confirmed.isConfirmed) {
            try {
                await apiClient.delete(`/Fs/Process/Device/MySQLDbConfigSetUp/${item.id}`);
                await Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Configuration deleted successfully.',
                    timer: 2000,
                    showConfirmButton: false,
                });
                await fetchData();
            } catch (error: any) {
                const errorMsg = error.response?.data?.message || error.message || 'Failed to delete configuration';
                await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
            }
        }
    };

    const handleSubmit = async () => {
        if (!formData.description.trim()) {
            await Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Please enter a Description.' });
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                description: formData.description,
                server: formData.server || null,
                databaseName: formData.databaseName || null,
                username: formData.username || null,
                password: formData.password || null,
                withDeviceCode: formData.withDeviceCode,
                lastDateUpdated: formData.lastDateUpdated || null,
                lastDateUpdateReplica: formData.lastDateUpdateReplica || null,
                lastDateUpdateFlag: formData.lastDateUpdateFlag,
                lastDateUpdateFrom: formData.lastDateUpdateFrom || null,
                lastDateUpdateTo: formData.lastDateUpdateTo || null
            };

            if (isEditMode && selectedId !== null) {
                await apiClient.put(`/Fs/Process/Device/MySQLDbConfigSetUp/${selectedId}`, payload);
                await Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Configuration updated successfully.',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } else {
                await apiClient.post('/Fs/Process/Device/MySQLDbConfigSetUp', payload);
                await Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Configuration created successfully.',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }

            setShowModal(false);
            resetForm();
            setIsEditMode(false);
            setSelectedId(null);
            await fetchData();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
            await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCalendarClick = (field: 'lastDateUpdated' | 'lastDateUpdateFrom' | 'lastDateUpdateTo', event: React.MouseEvent<HTMLButtonElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setCalendarPosition({
            top: rect.bottom + window.scrollY + 5,
            left: rect.left + window.scrollX
        });
        setShowCalendar(field);
    };

    const handleDateChange = (date: string) => {
        if (showCalendar) {
            setFormData({ ...formData, [showCalendar]: date });
        }
    };

    // Handle ESC key
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && showModal) {
                setShowModal(false);
            }
        };
        if (showModal) document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [showModal]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex-1 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
                        <h1 className="text-white">MySQL Database Configuration Setup</h1>
                    </div>

                    <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
                        {/* Info Box */}
                        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-700 mb-2">
                                        Configure MySQL database connections for alternative attendance data storage. Set up server credentials, connection parameters, and date range filters for MySQL-based time log synchronization and backup.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        {['MySQL connectivity', 'Date range filtering', 'Backup configuration', 'Cross-platform support'].map(txt => (
                                            <div key={txt} className="flex items-start gap-2">
                                                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-600">{txt}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                            <button onClick={handleCreateNew} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                                <Plus className="w-4 h-4" />
                                Create New
                            </button>
                            <div className="flex items-center gap-2">
                                <label className="text-gray-700 text-sm">Search:</label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm">Description</th>
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm">Server</th>
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm">Database Name</th>
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm">Username</th>
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm">Last Date Updated</th>
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-sm">Loading...</td>
                                        </tr>
                                    ) : paginatedData.length > 0 ? (
                                        paginatedData.map((item) => (
                                            <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-4 py-2 text-sm">{item.description}</td>
                                                <td className="px-4 py-2 text-sm">{item.server}</td>
                                                <td className="px-4 py-2 text-sm">{item.databaseName}</td>
                                                <td className="px-4 py-2 text-sm">{item.username}</td>
                                                <td className="px-4 py-2 text-sm">{formatDateDisplay(item.lastDateUpdated)}</td>
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEdit(item)} className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors" title="Edit">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <span className="text-gray-300">|</span>
                                                        <button onClick={() => handleDelete(item)} className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors" title="Delete">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-sm">No data available in table</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-gray-600 text-sm">
                                Showing {filteredData.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
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

                        {/* Create / Edit Modal */}
                        {showModal && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                                        <h2 className="text-gray-800">{isEditMode ? 'Edit MySQL Configuration' : 'Create New'}</h2>
                                        <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-gray-800">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-blue-600 mb-4">MySQL Database Configuration Setup</h3>

                                        <div className="space-y-3">
                                            {/* Description */}
                                            <div className="flex items-center gap-3">
                                                <label className="text-gray-700 text-sm whitespace-nowrap w-48">Description :</label>
                                                <input
                                                    type="text"
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>

                                            {/* Server */}
                                            <div className="flex items-center gap-3">
                                                <label className="text-gray-700 text-sm whitespace-nowrap w-48">Server :</label>
                                                <input
                                                    type="text"
                                                    value={formData.server}
                                                    onChange={(e) => setFormData({ ...formData, server: e.target.value })}
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>

                                            {/* Database Name */}
                                            <div className="flex items-center gap-3">
                                                <label className="text-gray-700 text-sm whitespace-nowrap w-48">Database Name :</label>
                                                <input
                                                    type="text"
                                                    value={formData.databaseName}
                                                    onChange={(e) => setFormData({ ...formData, databaseName: e.target.value })}
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>

                                            {/* Username */}
                                            <div className="flex items-center gap-3">
                                                <label className="text-gray-700 text-sm whitespace-nowrap w-48">Username :</label>
                                                <input
                                                    type="text"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>

                                            {/* Password */}
                                            <div className="flex items-center gap-3">
                                                <label className="text-gray-700 text-sm whitespace-nowrap w-48">Password :</label>
                                                <input
                                                    type="password"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>

                                            {/* With Device Code */}
                                            <div className="flex items-center gap-3">
                                                <label className="text-gray-700 text-sm whitespace-nowrap w-48">With Device Code :</label>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.withDeviceCode}
                                                    onChange={(e) => setFormData({ ...formData, withDeviceCode: e.target.checked })}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                                />
                                            </div>

                                            {/* Last Date Updated */}
                                            <div className="flex items-center gap-3">
                                                <label className="text-gray-700 text-sm whitespace-nowrap w-48">Last Date Updated :</label>
                                                <input
                                                    type="text"
                                                    value={formatDateDisplay(formData.lastDateUpdated)}
                                                    readOnly
                                                    className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32 bg-gray-50"
                                                />
                                                <button
                                                    type="button"
                                                    className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center transition-colors"
                                                    onClick={(e) => handleCalendarClick('lastDateUpdated', e)}
                                                >
                                                    <Calendar className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, lastDateUpdated: '' })}
                                                    className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Last Date Update Flag (Specific Range) */}
                                            <div className="flex items-center gap-3">
                                                <label className="text-gray-700 text-sm whitespace-nowrap w-48">Specific Range :</label>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.lastDateUpdateFlag}
                                                    onChange={(e) => setFormData({ ...formData, lastDateUpdateFlag: e.target.checked })}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                                />
                                            </div>

                                            {/* Last Date Update From */}
                                            <div className="flex items-center gap-3">
                                                <label className="text-gray-700 text-sm whitespace-nowrap w-48">Last Date Updated From :</label>
                                                <input
                                                    type="text"
                                                    value={formatDateDisplay(formData.lastDateUpdateFrom)}
                                                    readOnly
                                                    className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32 bg-gray-50"
                                                />
                                                <button
                                                    type="button"
                                                    className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center transition-colors"
                                                    onClick={(e) => handleCalendarClick('lastDateUpdateFrom', e)}
                                                >
                                                    <Calendar className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, lastDateUpdateFrom: '' })}
                                                    className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Last Date Update To */}
                                            <div className="flex items-center gap-3">
                                                <label className="text-gray-700 text-sm whitespace-nowrap w-48">Last Date Updated To :</label>
                                                <input
                                                    type="text"
                                                    value={formatDateDisplay(formData.lastDateUpdateTo)}
                                                    readOnly
                                                    className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32 bg-gray-50"
                                                />
                                                <button
                                                    type="button"
                                                    className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center transition-colors"
                                                    onClick={(e) => handleCalendarClick('lastDateUpdateTo', e)}
                                                >
                                                    <Calendar className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, lastDateUpdateTo: '' })}
                                                    className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Modal Actions */}
                                        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                                            <button
                                                onClick={handleSubmit}
                                                disabled={submitting}
                                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {submitting ? 'Processing...' : (isEditMode ? 'Update' : 'Submit')}
                                            </button>
                                            <button
                                                onClick={() => setShowModal(false)}
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

                        {/* Calendar Popup */}
                        {showCalendar && (
                            <CalendarPopup
                                value={formData[showCalendar]}
                                onChange={handleDateChange}
                                onClose={() => setShowCalendar(null)}
                                position={calendarPosition}
                            />
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}