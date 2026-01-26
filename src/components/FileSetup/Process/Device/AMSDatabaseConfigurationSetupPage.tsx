import { useState, useEffect, useRef } from 'react';
import { Search, Plus, X, Check, ArrowLeft, Calendar, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';


interface AMSDatabase {
    id: number;
    description: string;
    server: string;
    databaseName: string;
    username: string;
    withDeviceCode: boolean;
    lastDateUpdated: string;
}

interface FlagCode {
    code: string;
    timeIn: string;
    timeOut: string;
    break1Out: string;
    break1In: string;
    break2Out: string;
    break2In: string;
    break3Out: string;
    break3In: string;
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

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const handleDateClick = (day: number) => {
        const month = currentMonth.getMonth() + 1;
        const year = currentMonth.getFullYear();
        const formattedDate = `${month}/${day}/${year}`;
        onChange(formattedDate);
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
            className="absolute bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50"
            style={{ top: position.top, left: position.left, width: '280px' }}
        >
            <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="font-medium">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </div>
                <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-center text-xs text-gray-600 font-medium">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {renderDays()}
            </div>
        </div>
    );
}

export function AMSDatabaseConfigurationSetupPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showFlagSearchModal, setShowFlagSearchModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingItem, setEditingItem] = useState<AMSDatabase | null>(null);
    const [flagSearchTerm, setFlagSearchTerm] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });

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

    const [databases, setDatabases] = useState<AMSDatabase[]>([
        {
            id: 1,
            description: 'test2',
            server: 'TXRPC-8XSQL2017',
            databaseName: 'attendancedb',
            username: 'sa',
            withDeviceCode: false,
            lastDateUpdated: '5/2/2023'
        }
    ]);

    const flagCodes: FlagCode[] = [
        { code: 'CANON', timeIn: 'Face (IN)', timeOut: 'Face (OUT)', break1Out: '', break1In: '', break2Out: '', break2In: '', break3Out: '', break3In: '' },
        { code: 'DTR_Logs', timeIn: 'T/IN', timeOut: 'T/OUT', break1Out: 'B1O', break1In: 'B1I', break2Out: 'B2O', break2In: 'B2I', break3Out: 'B3O', break3In: 'B3I' },
        { code: 'ZK', timeIn: 'I', timeOut: 'O', break1Out: '', break1In: '', break2Out: 'Out', break2In: 'Out Back', break3Out: '', break3In: '' },
        { code: 'ZK2', timeIn: 'IN', timeOut: 'OUT', break1Out: '', break1In: '', break2Out: '', break2In: '', break3Out: '', break3In: '' }
    ];

    const itemsPerPage = 10;

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
        flag.code.toLowerCase().includes(flagSearchTerm.toLowerCase())
    );

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
        setShowEditModal(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this database configuration?')) {
            setDatabases(prev => prev.filter(item => item.id !== id));
        }
    };

    const handleSubmitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const newDatabase: AMSDatabase = {
            id: Math.max(...databases.map(d => d.id), 0) + 1,
            description: formData.description,
            server: formData.server,
            databaseName: formData.databaseName,
            username: formData.username,
            withDeviceCode: formData.withDeviceCode,
            lastDateUpdated: formData.lastDateUpdated || new Date().toLocaleDateString()
        };
        setDatabases(prev => [...prev, newDatabase]);
        setShowCreateModal(false);
    };

    const handleSubmitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            setDatabases(prev =>
                prev.map(item =>
                    item.id === editingItem.id
                        ? {
                            ...item,
                            description: formData.description,
                            server: formData.server,
                            databaseName: formData.databaseName,
                            username: formData.username,
                            withDeviceCode: formData.withDeviceCode,
                            lastDateUpdated: formData.lastDateUpdated || item.lastDateUpdated
                        }
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
        setShowFlagSearchModal(false);
        setEditingItem(null);
    };

    const handleSelectFlagCode = (code: string) => {
        setFormData(prev => ({ ...prev, flagCode: code }));
        setShowFlagSearchModal(false);
        setFlagSearchTerm('');
    };

    // Handle ESC key press with hierarchy
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (showFlagSearchModal) {
                    setShowFlagSearchModal(false);
                } else if (showCreateModal) {
                    setShowCreateModal(false);
                } else if (showEditModal) {
                    setShowEditModal(false);
                    setEditingItem(null);
                }
            }
        };

        if (showCreateModal || showEditModal || showFlagSearchModal) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showCreateModal, showEditModal, showFlagSearchModal]);

    // Render form fields - shared between Create and Edit modals
    const renderFormFields = () => (
        <div className="space-y-3">
            {/* Description - Full Width */}
            <div className="flex items-center gap-3">
                <label className="text-gray-700 text-sm whitespace-nowrap w-40">
                    Description :
                </label>
                <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                />
            </div>

            {/* Server & Database Name Row */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm whitespace-nowrap w-40">
                        Server :
                    </label>
                    <input
                        type="text"
                        value={formData.server}
                        onChange={(e) => setFormData({ ...formData, server: e.target.value })}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        required
                    />
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm whitespace-nowrap w-32">
                        Database Name :
                    </label>
                    <input
                        type="text"
                        value={formData.databaseName}
                        onChange={(e) => setFormData({ ...formData, databaseName: e.target.value })}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        required
                    />
                </div>
            </div>

            {/* Username & Password Row */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm whitespace-nowrap w-40">
                        Username :
                    </label>
                    <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        required
                    />
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm whitespace-nowrap w-32">
                        Password :
                    </label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* With Device Code & Last Date Updated Row */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm whitespace-nowrap w-40">
                        With Device Code :
                    </label>
                    <input
                        type="checkbox"
                        checked={formData.withDeviceCode}
                        onChange={(e) => setFormData({ ...formData, withDeviceCode: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm whitespace-nowrap w-32">
                        Last Date Updated :
                    </label>
                    <input
                        type="text"
                        value={formData.lastDateUpdated}
                        onChange={(e) => setFormData({ ...formData, lastDateUpdated: e.target.value })}
                        className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                    />
                    <button
                        type="button"
                        className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center transition-colors"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setCalendarPosition({
                                top: rect.bottom + 5,
                                left: rect.left
                            });
                            setShowCalendar(true);
                        }}
                    >
                        <Calendar className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Table Name - Full Width */}
            <div className="flex items-center gap-3">
                <label className="text-gray-700 text-sm whitespace-nowrap w-40">
                    Table Name :
                </label>
                <input
                    type="text"
                    value={formData.tableName}
                    onChange={(e) => setFormData({ ...formData, tableName: e.target.value })}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
            </div>

            {/* EmpCode Column & Time Stamp Column Row */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm whitespace-nowrap w-40">
                        EmpCode Column :
                    </label>
                    <input
                        type="text"
                        value={formData.empCodeColumn}
                        onChange={(e) => setFormData({ ...formData, empCodeColumn: e.target.value })}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm whitespace-nowrap w-32">
                        Time Stamp Column :
                    </label>
                    <input
                        type="text"
                        value={formData.timeStampColumn}
                        onChange={(e) => setFormData({ ...formData, timeStampColumn: e.target.value })}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* Flag Column & Flag Code Row */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm whitespace-nowrap w-40">
                        Flag Column :
                    </label>
                    <input
                        type="text"
                        value={formData.flagColumn}
                        onChange={(e) => setFormData({ ...formData, flagColumn: e.target.value })}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm whitespace-nowrap w-32">
                        Flag Code :
                    </label>
                    <input
                        type="text"
                        value={formData.flagCode}
                        onChange={(e) => setFormData({ ...formData, flagCode: e.target.value })}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        readOnly
                    />
                    <button
                        type="button"
                        onClick={() => setShowFlagSearchModal(true)}
                        className="w-10 h-10 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                        <Search className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, flagCode: '' })}
                        className="w-10 h-10 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Automatic EmpCode - Left Column Only */}
            <div className="flex items-center gap-3">
                <label className="text-gray-700 text-sm whitespace-nowrap w-40">
                    Automatic EmpCode :
                </label>
                <input
                    type="checkbox"
                    checked={formData.automaticEmpCode}
                    onChange={(e) => setFormData({ ...formData, automaticEmpCode: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* EmpCode Table Name - Full Width */}
            <div className="flex items-center gap-3">
                <label className="text-gray-700 text-sm whitespace-nowrap w-40">
                    EmpCode Table Name :
                </label>
                <input
                    type="text"
                    value={formData.empCodeTableName}
                    onChange={(e) => setFormData({ ...formData, empCodeTableName: e.target.value })}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
            </div>

            {/* EmpCode Column & EmpCode ID Column Row */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm whitespace-nowrap w-40">
                        EmpCode Column :
                    </label>
                    <input
                        type="text"
                        value={formData.empCodeColumnName}
                        onChange={(e) => setFormData({ ...formData, empCodeColumnName: e.target.value })}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm whitespace-nowrap w-32">
                        EmpCode ID Column :
                    </label>
                    <input
                        type="text"
                        value={formData.empCodeIDColumn}
                        onChange={(e) => setFormData({ ...formData, empCodeIDColumn: e.target.value })}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* Days to Deduct to Convert Date - Full Width */}
            <div className="flex items-center gap-3">
                <label className="text-gray-700 text-sm whitespace-nowrap w-40">
                    Days to Deduct to Convert Date :
                </label>
                <input
                    type="text"
                    value={formData.daysToDeduct}
                    onChange={(e) => setFormData({ ...formData, daysToDeduct: e.target.value })}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
            </div>

            {/* Specific Range - Left Column Only */}
            <div className="flex items-center gap-3">
                <label className="text-gray-700 text-sm whitespace-nowrap w-40">
                    Specific Range :
                </label>
                <input
                    type="checkbox"
                    checked={formData.specificRange}
                    onChange={(e) => setFormData({ ...formData, specificRange: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Last Date Updated From & To Row */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm whitespace-nowrap w-40">
                        Last Date Updated From :
                    </label>
                    <input
                        type="text"
                        value={formData.lastDateUpdatedFrom}
                        onChange={(e) => setFormData({ ...formData, lastDateUpdatedFrom: e.target.value })}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm whitespace-nowrap w-32">
                        Last Date Updated To :
                    </label>
                    <input
                        type="text"
                        value={formData.lastDateUpdatedTo}
                        onChange={(e) => setFormData({ ...formData, lastDateUpdatedTo: e.target.value })}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* Device Name Column - Full Width */}
            <div className="flex items-center gap-3">
                <label className="text-gray-700 text-sm whitespace-nowrap w-40">
                    Device Name Column :
                </label>
                <input
                    type="text"
                    value={formData.deviceNameColumn}
                    onChange={(e) => setFormData({ ...formData, deviceNameColumn: e.target.value })}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
                        <h1 className="text-white">AMS Database Configuration Setup</h1>
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
                                        Configure database connections for Attendance Management System (AMS) integration. Set up server details, credentials, and field mappings to synchronize employee time logs from external biometric systems.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">External database connectivity</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Field mapping configuration</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Device code support</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Automatic synchronization</span>
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
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Description</th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Server</th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Database Name</th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Username</th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">With Device Code</th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Last Date Updated</th>
                                        <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase">Actions</th>
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
                                                <td className="px-6 py-4 text-sm text-gray-600">{item.lastDateUpdated}</td>
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
                                            <td colSpan={7} className="px-6 py-16 text-center">
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
                                Showing {filteredData.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-blue-500 text-white' : 'text-blue-600 hover:bg-gray-100'
                                        }`}
                                    onClick={() => setCurrentPage(1)}
                                >
                                    1
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages || 1, prev + 1))}
                                    disabled={currentPage >= totalPages || filteredData.length === 0}
                                    className="px-4 py-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0">
                            <h2 className="text-gray-900">Create New</h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitCreate} className="p-6">
                            <h3 className="text-blue-600 mb-4">AMS Database Configuration Setup</h3>
                            {renderFormFields()}
                            <div className="flex gap-3 mt-5 pt-4 border-t border-gray-200">
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

            {/* Edit Modal */}
            {showEditModal && editingItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0">
                            <h2 className="text-gray-900">Edit</h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitEdit} className="p-6">
                            <h3 className="text-blue-600 mb-4">AMS Database Configuration Setup</h3>
                            {renderFormFields()}
                            <div className="flex gap-3 mt-5 pt-4 border-t border-gray-200">
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

            {/* Flag Search Modal */}
            {showFlagSearchModal && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0">
                            <h2 className="text-gray-900">Search</h2>
                            <button
                                onClick={() => setShowFlagSearchModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <h3 className="text-blue-600 mb-4">DTR Flag</h3>

                            <div className="flex items-center justify-end gap-2 mb-4">
                                <label className="text-gray-700 text-sm">Search:</label>
                                <input
                                    type="text"
                                    value={flagSearchTerm}
                                    onChange={(e) => setFlagSearchTerm(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                                />
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
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
                                        {filteredFlags.map((flag, index) => (
                                            <tr
                                                key={index}
                                                className="hover:bg-blue-50 cursor-pointer transition-colors"
                                                onClick={() => handleSelectFlagCode(flag.code)}
                                            >
                                                <td className="px-4 py-3 text-sm text-blue-600 hover:underline">{flag.code}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{flag.timeIn}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{flag.timeOut}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{flag.break1Out}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{flag.break1In}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{flag.break2Out}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{flag.break2In}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{flag.break3Out}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{flag.break3In}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Calendar Popup */}
            {showCalendar && (
                <CalendarPopup
                    value={formData.lastDateUpdated}
                    onChange={(date) => {
                        setFormData({ ...formData, lastDateUpdated: date });
                        setShowCalendar(false);
                    }}
                    onClose={() => setShowCalendar(false)}
                    position={calendarPosition}
                />
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