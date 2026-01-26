import { useState, useEffect } from 'react';
import { Plus, Search, X, Check, ArrowLeft, Calendar, Edit, Trash2 } from 'lucide-react';
import { CalendarPopup } from './CalendarPopup';
import { Footer } from './Footer/Footer';

interface RawDataEntry {
    id: number;
    empCode: string;
    empName: string;
    workshiftCode: string;
    dateIn: string;
    timeIn: string;
    actualDateIn: string;
    actualTimeIn: string;
    break1Out: string;
    break1In: string;
    break2Out: string;
    break2In: string;
    break3Out: string;
    break3In: string;
    dateOut: string;
    timeOut: string;
    dayType: string;
    otApproved: boolean;
    isLateFiling: boolean;
    remarks: string;
    borrowedDeviceName: string;
    terminalId: string;
    secondDayType: string;
    approvedOtTime: string;
    deviceName: string;
    entryFlag: string;
}

export function RawDataPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [dateFrom, setDateFrom] = useState('5/5/2021');
    const [dateTo, setDateTo] = useState('05/05/2021');
    const [incompleteLogs, setIncompleteLogs] = useState(true);
    const [displayMode, setDisplayMode] = useState<'all' | 'specific'>('all');

    // Form fields for Create New modal
    const [empCode, setEmpCode] = useState('');
    const [empName, setEmpName] = useState('');
    const [workshiftCode, setWorkshiftCode] = useState('');
    const [dateIn, setDateIn] = useState('');
    const [timeIn, setTimeIn] = useState('');
    const [actualDateIn, setActualDateIn] = useState('');
    const [actualTimeIn, setActualTimeIn] = useState('');
    const [break1Out, setBreak1Out] = useState('');
    const [break1In, setBreak1In] = useState('');
    const [break2Out, setBreak2Out] = useState('');
    const [break2In, setBreak2In] = useState('');
    const [break3Out, setBreak3Out] = useState('');
    const [break3In, setBreak3In] = useState('');
    const [dateOut, setDateOut] = useState('');
    const [timeOut, setTimeOut] = useState('');
    const [otApproved, setOtApproved] = useState(false);
    const [isLateFiling, setIsLateFiling] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [borrowedDeviceName, setBorrowedDeviceName] = useState('');

    // Search modals
    const [showEmpCodeModal, setShowEmpCodeModal] = useState(false);
    const [empCodeSearchTerm, setEmpCodeSearchTerm] = useState('');
    const [showWorkshiftModal, setShowWorkshiftModal] = useState(false);
    const [workshiftSearchTerm, setWorkshiftSearchTerm] = useState('');
    const [showDeviceModal, setShowDeviceModal] = useState(false);
    const [deviceSearchTerm, setDeviceSearchTerm] = useState('');

    // Calendar states
    const [showDateFromCalendar, setShowDateFromCalendar] = useState(false);
    const [showDateToCalendar, setShowDateToCalendar] = useState(false);
    const [showDateInCalendar, setShowDateInCalendar] = useState(false);
    const [showDateOutCalendar, setShowDateOutCalendar] = useState(false);

    // Raw data storage (CRUD)
    const [rawDataList, setRawDataList] = useState<RawDataEntry[]>([]);
    const [nextId, setNextId] = useState(1);

    // Hide Column checkboxes state
    const [hideColumns, setHideColumns] = useState({
        break1Out: true,
        break1In: true,
        break2Out: false,
        break2In: false,
        break3Out: true,
        break3In: true,
        terminalId: false,
        secondDayType: false,
        remarks: false,
        entryFlag: false,
        isLateFiling: false,
        borrowedDeviceName: false,
        approvedOvertime: false,
        deviceName: false,
        selectAll: false,
    });

    // Sample employee data for search modal
    const employeeData = [
        { empCode: '000877', name: 'Last122, First A', groupCode: '45' },
        { empCode: '000878', name: 'Last, First A', groupCode: '45' },
        { empCode: '000900', name: 'Last, First A', groupCode: '109' },
        { empCode: '000901', name: 'Last, First A', groupCode: '109' },
        { empCode: '000902', name: 'Last, First III A', groupCode: '45' },
        { empCode: '000903', name: 'Last, First A', groupCode: '45' },
        { empCode: '000904', name: 'Last, First A', groupCode: '45' },
        { empCode: '000905', name: 'Last, First A', groupCode: '45' },
        { empCode: '000906', name: 'Last, First A', groupCode: '45' },
        { empCode: '000907', name: 'Last, First A', groupCode: '45' },
    ];

    // Sample workshift data
    const workshiftData = [
        { code: 'WS001', description: 'Regular Shift' },
        { code: 'WS002', description: 'Night Shift' },
        { code: 'WS003', description: 'Swing Shift' },
    ];

    // Sample device data
    const deviceData = [
        { deviceCode: 'DEV001', deviceName: 'Device 1' },
        { deviceCode: 'DEV002', deviceName: 'Device 2' },
        { deviceCode: 'DEV003', deviceName: 'Device 3' },
    ];

    // Time validation function for HH:MM TT format
    const validateTimeFormat = (value: string): string => {
        // Remove extra spaces
        const trimmed = value.trim().toUpperCase();

        // Allow partial input while typing
        if (trimmed.length === 0) return '';

        // Full validation for complete input (e.g., "07:00 AM")
        const timeRegex = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;

        if (timeRegex.test(trimmed)) {
            // Format to ensure consistent spacing and padding
            const match = trimmed.match(timeRegex);
            if (match) {
                const hours = match[1].padStart(2, '0');
                const minutes = match[2];
                const period = match[3].toUpperCase();
                return `${hours}:${minutes} ${period}`;
            }
        }

        // Return the value as-is if still typing
        return value;
    };

    const handleTimeInputChange = (setter: (value: string) => void) => {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setter(value);
        };
    };

    const handleTimeInputBlur = (value: string, setter: (value: string) => void) => {
        return () => {
            const formatted = validateTimeFormat(value);
            setter(formatted);
        };
    };

    // Handle ESC key to close modals
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (showEmpCodeModal) {
                    setShowEmpCodeModal(false);
                } else if (showWorkshiftModal) {
                    setShowWorkshiftModal(false);
                } else if (showDeviceModal) {
                    setShowDeviceModal(false);
                } else if (showCreateModal) {
                    setShowCreateModal(false);
                }
                // Close calendars
                setShowDateFromCalendar(false);
                setShowDateToCalendar(false);
                setShowDateInCalendar(false);
                setShowDateOutCalendar(false);
            }
        };

        if (showCreateModal || showEmpCodeModal || showWorkshiftModal || showDeviceModal) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showEmpCodeModal, showWorkshiftModal, showDeviceModal, showCreateModal]);

    const handleHideColumnChange = (column: string) => {
        setHideColumns(prev => ({
            ...prev,
            [column]: !prev[column as keyof typeof hideColumns]
        }));
    };

    const handleSelectAllChange = () => {
        const newValue = !hideColumns.selectAll;
        setHideColumns({
            break1Out: newValue,
            break1In: newValue,
            break2Out: newValue,
            break2In: newValue,
            break3Out: newValue,
            break3In: newValue,
            terminalId: newValue,
            secondDayType: newValue,
            remarks: newValue,
            entryFlag: newValue,
            isLateFiling: newValue,
            borrowedDeviceName: newValue,
            approvedOvertime: newValue,
            deviceName: newValue,
            selectAll: newValue,
        });
    };

    const handleCreateNew = () => {
        // Clear form
        setEditingId(null);
        setEmpCode('');
        setEmpName('');
        setWorkshiftCode('');
        setDateIn('');
        setTimeIn('');
        setActualDateIn('');
        setActualTimeIn('');
        setBreak1Out('');
        setBreak1In('');
        setBreak2Out('');
        setBreak2In('');
        setBreak3Out('');
        setBreak3In('');
        setDateOut('');
        setTimeOut('');
        setOtApproved(false);
        setIsLateFiling(false);
        setRemarks('');
        setBorrowedDeviceName('');
        setShowCreateModal(true);
    };

    // CRUD Functions
    const handleSubmit = () => {
        // Validate required fields
        if (!empCode.trim()) {
            alert('Please enter an Employee Code.');
            return;
        }

        if (editingId !== null) {
            // Update existing entry
            setRawDataList(prev => prev.map(entry =>
                entry.id === editingId
                    ? {
                        ...entry,
                        empCode,
                        empName,
                        workshiftCode,
                        dateIn,
                        timeIn,
                        actualDateIn,
                        actualTimeIn,
                        break1Out,
                        break1In,
                        break2Out,
                        break2In,
                        break3Out,
                        break3In,
                        dateOut,
                        timeOut,
                        otApproved,
                        isLateFiling,
                        remarks,
                        borrowedDeviceName,
                    }
                    : entry
            ));
        } else {
            // Create new entry
            const newEntry: RawDataEntry = {
                id: nextId,
                empCode,
                empName,
                workshiftCode,
                dateIn,
                timeIn,
                actualDateIn,
                actualTimeIn,
                break1Out,
                break1In,
                break2Out,
                break2In,
                break3Out,
                break3In,
                dateOut,
                timeOut,
                dayType: 'Regular',
                otApproved,
                isLateFiling,
                remarks,
                borrowedDeviceName,
                terminalId: '',
                secondDayType: '',
                approvedOtTime: '',
                deviceName: '',
                entryFlag: '',
            };
            setRawDataList(prev => [...prev, newEntry]);
            setNextId(nextId + 1);
        }

        // Close modal and reset form
        setShowCreateModal(false);
        setEditingId(null);
    };

    const handleEdit = (entry: RawDataEntry) => {
        setEditingId(entry.id);
        setEmpCode(entry.empCode);
        setEmpName(entry.empName);
        setWorkshiftCode(entry.workshiftCode);
        setDateIn(entry.dateIn);
        setTimeIn(entry.timeIn);
        setActualDateIn(entry.actualDateIn);
        setActualTimeIn(entry.actualTimeIn);
        setBreak1Out(entry.break1Out);
        setBreak1In(entry.break1In);
        setBreak2Out(entry.break2Out);
        setBreak2In(entry.break2In);
        setBreak3Out(entry.break3Out);
        setBreak3In(entry.break3In);
        setDateOut(entry.dateOut);
        setTimeOut(entry.timeOut);
        setOtApproved(entry.otApproved);
        setIsLateFiling(entry.isLateFiling);
        setRemarks(entry.remarks);
        setBorrowedDeviceName(entry.borrowedDeviceName);
        setShowCreateModal(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this entry?')) {
            setRawDataList(prev => prev.filter(entry => entry.id !== id));
        }
    };

    const handleEmpCodeSelect = (code: string, name: string) => {
        setEmpCode(code);
        setEmpName(name);
        setShowEmpCodeModal(false);
    };

    const handleWorkshiftSelect = (code: string) => {
        setWorkshiftCode(code);
        setShowWorkshiftModal(false);
    };

    const handleDeviceSelect = (deviceName: string) => {
        setBorrowedDeviceName(deviceName);
        setShowDeviceModal(false);
    };

    const filteredEmployees = employeeData.filter(emp =>
        emp.empCode.toLowerCase().includes(empCodeSearchTerm.toLowerCase()) ||
        emp.name.toLowerCase().includes(empCodeSearchTerm.toLowerCase()) ||
        emp.groupCode.toLowerCase().includes(empCodeSearchTerm.toLowerCase())
    );

    const filteredWorkshifts = workshiftData.filter(ws =>
        ws.code.toLowerCase().includes(workshiftSearchTerm.toLowerCase()) ||
        ws.description.toLowerCase().includes(workshiftSearchTerm.toLowerCase())
    );

    const filteredDevices = deviceData.filter(device =>
        device.deviceCode.toLowerCase().includes(deviceSearchTerm.toLowerCase()) ||
        device.deviceName.toLowerCase().includes(deviceSearchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Main Content */}
            <div className="flex-1">
                <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
                    {/* Page Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
                        <h1 className="text-white">Raw Data</h1>
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
                                        Manage and view employee raw time data including clock in/out times, breaks, and overtime approvals for accurate payroll processing and attendance tracking.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Employee time tracking</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Break time management</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Overtime approval tracking</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Workshift assignment</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Controls */}
                        <div className="flex items-center gap-4 mb-6">
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                                onClick={handleCreateNew}
                            >
                                <Plus className="w-4 h-4" />
                                Create New
                            </button>

                            <div className="flex items-center gap-2 ml-2">
                                <input
                                    type="checkbox"
                                    id="incomplete-logs"
                                    checked={incompleteLogs}
                                    onChange={(e) => setIncompleteLogs(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="incomplete-logs" className="text-gray-700">Incomplete Logs</label>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                                <input
                                    type="radio"
                                    id="display-all"
                                    checked={displayMode === 'all'}
                                    onChange={() => setDisplayMode('all')}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <label htmlFor="display-all" className="text-gray-700">All</label>

                                <input
                                    type="radio"
                                    id="display-specific"
                                    checked={displayMode === 'specific'}
                                    onChange={() => setDisplayMode('specific')}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 ml-4"
                                />
                                <label htmlFor="display-specific" className="text-gray-700">Specific</label>
                            </div>
                        </div>

                        {/* Date Range and Search */}
                        <div className="flex items-center gap-4 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 relative">
                                <label className="text-sm font-bold text-gray-700 ml-4">Date From</label>
                                <input
                                    type="text"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    placeholder="MM/DD/YYYY"
                                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-5002"
                                />
                                <button
                                    onClick={() => setShowDateFromCalendar(!showDateFromCalendar)}
                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Calendar className="w-4 h-4" />
                                </button>
                                {showDateFromCalendar && (
                                    <CalendarPopup
                                        onDateSelect={(date) => setDateFrom(date)}
                                        onClose={() => setShowDateFromCalendar(false)}
                                    />
                                )}
                            </div>

                            <div className="flex items-center gap-2 relative">
                                <label className="text-sm font-bold text-gray-700 ml-4">Date To</label>
                                <input
                                    type="text"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    placeholder="MM/DD/YYYY"
                                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={() => setShowDateToCalendar(!showDateToCalendar)}
                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Calendar className="w-4 h-4" />
                                </button>
                                {showDateToCalendar && (
                                    <CalendarPopup
                                        onDateSelect={(date) => setDateTo(date)}
                                        onClose={() => setShowDateToCalendar(false)}
                                    />
                                )}
                            </div>
                            <button
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                Search
                            </button>
                        </div>

                        {/* Hide Column Section */}
                        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-gray-700 mb-4">Hide Column</h3>
                            <div className="grid grid-cols-4 gap-x-6 gap-y-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="break1-out"
                                        checked={hideColumns.break1Out}
                                        onChange={() => handleHideColumnChange('break1Out')}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="break1-out" className="text-gray-700 text-sm">Break 1 Out</label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="break1-in"
                                        checked={hideColumns.break1In}
                                        onChange={() => handleHideColumnChange('break1In')}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="break1-in" className="text-gray-700 text-sm">Break 1 In</label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="break2-out"
                                        checked={hideColumns.break2Out}
                                        onChange={() => handleHideColumnChange('break2Out')}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="break2-out" className="text-gray-700 text-sm">Break 2 Out</label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="break2-in"
                                        checked={hideColumns.break2In}
                                        onChange={() => handleHideColumnChange('break2In')}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="break2-in" className="text-gray-700 text-sm">Break 2 In</label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="break3-out"
                                        checked={hideColumns.break3Out}
                                        onChange={() => handleHideColumnChange('break3Out')}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="break3-out" className="text-gray-700 text-sm">Break 3 Out</label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="break3-in"
                                        checked={hideColumns.break3In}
                                        onChange={() => handleHideColumnChange('break3In')}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="break3-in" className="text-gray-700 text-sm">Break 3 In</label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="remarks"
                                        checked={hideColumns.remarks}
                                        onChange={() => handleHideColumnChange('remarks')}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="remarks" className="text-gray-700 text-sm">Remarks</label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="entry-flag"
                                        checked={hideColumns.entryFlag}
                                        onChange={() => handleHideColumnChange('entryFlag')}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="entry-flag" className="text-gray-700 text-sm">Entry Flag</label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="terminal-id"
                                        checked={hideColumns.terminalId}
                                        onChange={() => handleHideColumnChange('terminalId')}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="terminal-id" className="text-gray-700 text-sm">TerminalID</label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="2nd-day-type"
                                        checked={hideColumns.secondDayType}
                                        onChange={() => handleHideColumnChange('secondDayType')}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="2nd-day-type" className="text-gray-700 text-sm">2nd Day Type</label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="approved-overtime"
                                        checked={hideColumns.approvedOvertime}
                                        onChange={() => handleHideColumnChange('approvedOvertime')}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="approved-overtime" className="text-gray-700 text-sm">Approved Overtime</label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="device-name"
                                        checked={hideColumns.deviceName}
                                        onChange={() => handleHideColumnChange('deviceName')}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="device-name" className="text-gray-700 text-sm">Device Name</label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is-late-filing"
                                        checked={hideColumns.isLateFiling}
                                        onChange={() => handleHideColumnChange('isLateFiling')}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="is-late-filing" className="text-gray-700 text-sm">Is Late Filing</label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="bdevice-name"
                                        checked={hideColumns.borrowedDeviceName}
                                        onChange={() => handleHideColumnChange('borrowedDeviceName')}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="bdevice-name" className="text-gray-700 text-sm">BDevice Name</label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="select-all"
                                        checked={hideColumns.selectAll}
                                        onChange={handleSelectAllChange}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="select-all" className="text-gray-700 text-sm">Select All</label>
                                </div>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Actions</th>
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">
                                            Employee Code
                                            <span className="ml-1 text-blue-500">▲</span>
                                        </th>
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Employee Name</th>
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Workshift Code</th>
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Date-In</th>
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Time-In</th>
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Actual Date/Time In</th>
                                        {!hideColumns.break1Out && <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Break1-Out</th>}
                                        {!hideColumns.break1In && <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Break1-In</th>}
                                        {!hideColumns.break2Out && <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Break2-Out</th>}
                                        {!hideColumns.break2In && <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Break2-In</th>}
                                        {!hideColumns.break3Out && <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Break3-Out</th>}
                                        {!hideColumns.break3In && <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Break3-In</th>}
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Time-Out</th>
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Date-Out</th>
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">DayType</th>
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">OT Approved</th>
                                        {!hideColumns.remarks && <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Remarks</th>}
                                        {!hideColumns.entryFlag && <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Entry Flag</th>}
                                        {!hideColumns.terminalId && <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Terminal Id</th>}
                                        {!hideColumns.secondDayType && <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">2nd Day Type</th>}
                                        {!hideColumns.approvedOvertime && <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Approved OT Time</th>}
                                        {!hideColumns.deviceName && <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Device Name</th>}
                                        {!hideColumns.isLateFiling && <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Is Late Filing</th>}
                                        {!hideColumns.borrowedDeviceName && <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">BDevice Name</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rawDataList.length === 0 ? (
                                        <tr>
                                            <td colSpan={25} className="px-6 py-8 text-center text-gray-500">
                                                No data available in table
                                            </td>
                                        </tr>
                                    ) : (
                                        rawDataList.map((entry) => (
                                            <tr
                                                key={entry.id}
                                                className="border-b border-gray-200 hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(entry)}
                                                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(entry.id)}
                                                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.empCode}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.empName}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.workshiftCode}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.dateIn}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.timeIn}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.actualDateIn} {entry.actualTimeIn}</td>
                                                {!hideColumns.break1Out && <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.break1Out}</td>}
                                                {!hideColumns.break1In && <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.break1In}</td>}
                                                {!hideColumns.break2Out && <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.break2Out}</td>}
                                                {!hideColumns.break2In && <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.break2In}</td>}
                                                {!hideColumns.break3Out && <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.break3Out}</td>}
                                                {!hideColumns.break3In && <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.break3In}</td>}
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.timeOut}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.dateOut}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.dayType}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.otApproved ? 'Yes' : 'No'}</td>
                                                {!hideColumns.remarks && <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.remarks}</td>}
                                                {!hideColumns.entryFlag && <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.entryFlag}</td>}
                                                {!hideColumns.terminalId && <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.terminalId}</td>}
                                                {!hideColumns.secondDayType && <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.secondDayType}</td>}
                                                {!hideColumns.approvedOvertime && <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.approvedOtTime}</td>}
                                                {!hideColumns.deviceName && <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.deviceName}</td>}
                                                {!hideColumns.isLateFiling && <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.isLateFiling ? 'Yes' : 'No'}</td>}
                                                {!hideColumns.borrowedDeviceName && <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.borrowedDeviceName}</td>}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-gray-600 text-sm">
                                Showing {rawDataList.length > 0 ? '1' : '0'} to {rawDataList.length} of {rawDataList.length} entries
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
                                    Previous
                                </button>
                                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
                                    Next
                                </button>
                            </div>
                        </div>

                        {/* Create New Modal */}
                        {showCreateModal && (
                            <>
                                {/* Modal Backdrop */}
                                <div
                                    className="fixed inset-0 bg-black/30 z-10"
                                    onClick={() => setShowCreateModal(false)}
                                ></div>

                                {/* Modal Dialog */}
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                    <div className="bg-white rounded-lg border-gray-300 shadow-xl w-full max-w-3xl max-h-[110vh] overflow">
                                        {/* Modal Header */}
                                        <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between rounded-t-lg">
                                            <h2 className="text-gray-800">{editingId !== null ? 'Edit Entry' : 'Create New'}</h2>
                                            <button
                                                onClick={() => setShowCreateModal(false)}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Modal Content */}
                                        <div className="p-4">
                                            <h3 className="text-blue-600 mb-4">Raw Data</h3>

                                            {/* Form Fields */}
                                            <div className="space-y-3">
                                                {/* Emp Code */}
                                                <div className="flex items-center gap-3">
                                                    <label className="w-40 text-gray-700 text-sm">Emp Code :</label>
                                                    <input
                                                        type="text"
                                                        value={empCode}
                                                        onChange={(e) => setEmpCode(e.target.value)}
                                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                        readOnly
                                                    />
                                                    <button
                                                        onClick={() => setShowEmpCodeModal(true)}
                                                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                        title="Search Employee"
                                                    >
                                                        <Search className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Workshift Code */}
                                                <div className="flex items-center gap-3">
                                                    <label className="w-40 text-gray-700 text-sm">Workshift Code :</label>
                                                    <input
                                                        type="text"
                                                        value={workshiftCode}
                                                        onChange={(e) => setWorkshiftCode(e.target.value)}
                                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                        readOnly
                                                    />
                                                    <button
                                                        onClick={() => setShowWorkshiftModal(true)}
                                                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                        title="Search Workshift"
                                                    >
                                                        <Search className="w-4 h-4" />
                                                    </button>
                                                    <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                                                        Get Shift
                                                    </button>
                                                </div>

                                                {/* Date In and Time In */}
                                                <div className="flex items-center gap-3">
                                                    <label className="w-40 text-gray-700 text-sm">Date In :</label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            value={dateIn}
                                                            onChange={(e) => setDateIn(e.target.value)}
                                                            placeholder="MM/DD/YYYY"
                                                            className="w-40 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-10"
                                                        />
                                                        <button
                                                            onClick={() => setShowDateInCalendar(!showDateInCalendar)}
                                                            type="button"
                                                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                                        >
                                                            <Calendar className="w-4 h-4" />
                                                        </button>
                                                        {showDateInCalendar && (
                                                            <CalendarPopup
                                                                onDateSelect={(date) => setDateIn(date)}
                                                                onClose={() => setShowDateInCalendar(false)}
                                                            />
                                                        )}
                                                    </div>
                                                    <label className="text-gray-700 text-sm ml-4">Time In :</label>
                                                    <input
                                                        type="text"
                                                        value={timeIn}
                                                        onChange={handleTimeInputChange(setTimeIn)}
                                                        onBlur={handleTimeInputBlur(timeIn, setTimeIn)}
                                                        placeholder="HH:MM TT"
                                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </div>

                                                {/* Actual Date In */}
                                                <div className="flex items-center gap-3">
                                                    <label className="w-40 text-gray-700 text-sm">Actual Date In :</label>
                                                    <input
                                                        type="text"
                                                        value={actualDateIn}
                                                        onChange={(e) => setActualDateIn(e.target.value)}
                                                        placeholder="MM/DD/YYYY"
                                                        className="w-40 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={actualTimeIn}
                                                        onChange={handleTimeInputChange(setActualTimeIn)}
                                                        onBlur={handleTimeInputBlur(actualTimeIn, setActualTimeIn)}
                                                        placeholder="HH:MM TT"
                                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </div>

                                                {/* Break 1 Out and Break 1 In */}
                                                <div className="flex items-center gap-3">
                                                    <label className="w-40 text-gray-700 text-sm">Break 1 Out :</label>
                                                    <input
                                                        type="text"
                                                        value={break1Out}
                                                        onChange={handleTimeInputChange(setBreak1Out)}
                                                        onBlur={handleTimeInputBlur(break1Out, setBreak1Out)}
                                                        placeholder="HH:MM TT"
                                                        className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                    <label className="text-gray-700 text-sm ml-4">Break 1 In :</label>
                                                    <input
                                                        type="text"
                                                        value={break1In}
                                                        onChange={handleTimeInputChange(setBreak1In)}
                                                        onBlur={handleTimeInputBlur(break1In, setBreak1In)}
                                                        placeholder="HH:MM TT"
                                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </div>

                                                {/* Break 2 Out and Break 2 In */}
                                                <div className="flex items-center gap-3">
                                                    <label className="w-40 text-gray-700 text-sm">Break 2 Out :</label>
                                                    <input
                                                        type="text"
                                                        value={break2Out}
                                                        onChange={handleTimeInputChange(setBreak2Out)}
                                                        onBlur={handleTimeInputBlur(break2Out, setBreak2Out)}
                                                        placeholder="HH:MM TT"
                                                        className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                    <label className="text-gray-700 text-sm ml-4">Break 2 In :</label>
                                                    <input
                                                        type="text"
                                                        value={break2In}
                                                        onChange={handleTimeInputChange(setBreak2In)}
                                                        onBlur={handleTimeInputBlur(break2In, setBreak2In)}
                                                        placeholder="HH:MM TT"
                                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </div>

                                                {/* Break 3 Out and Break 3 In */}
                                                <div className="flex items-center gap-3">
                                                    <label className="w-40 text-gray-700 text-sm">Break 3 Out :</label>
                                                    <input
                                                        type="text"
                                                        value={break3Out}
                                                        onChange={handleTimeInputChange(setBreak3Out)}
                                                        onBlur={handleTimeInputBlur(break3Out, setBreak3Out)}
                                                        placeholder="HH:MM TT"
                                                        className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                    <label className="text-gray-700 text-sm ml-4">Break 3 In :</label>
                                                    <input
                                                        type="text"
                                                        value={break3In}
                                                        onChange={handleTimeInputChange(setBreak3In)}
                                                        onBlur={handleTimeInputBlur(break3In, setBreak3In)}
                                                        placeholder="HH:MM TT"
                                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </div>

                                                {/* Date Out and Time Out */}
                                                <div className="flex items-center gap-3">
                                                    <label className="w-40 text-gray-700 text-sm">Date Out :</label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            value={dateOut}
                                                            onChange={(e) => setDateOut(e.target.value)}
                                                            placeholder="MM/DD/YYYY"
                                                            className="w-40 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-10"
                                                        />
                                                        <button
                                                            onClick={() => setShowDateOutCalendar(!showDateOutCalendar)}
                                                            type="button"
                                                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                                        >
                                                            <Calendar className="w-4 h-4" />
                                                        </button>
                                                        {showDateOutCalendar && (
                                                            <CalendarPopup
                                                                onDateSelect={(date) => setDateOut(date)}
                                                                onClose={() => setShowDateOutCalendar(false)}
                                                            />
                                                        )}
                                                    </div>
                                                    <label className="text-gray-700 text-sm ml-4">Time Out :</label>
                                                    <input
                                                        type="text"
                                                        value={timeOut}
                                                        onChange={handleTimeInputChange(setTimeOut)}
                                                        onBlur={handleTimeInputBlur(timeOut, setTimeOut)}
                                                        placeholder="HH:MM TT"
                                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </div>

                                                {/* OT Approved */}
                                                <div className="flex items-center gap-3">
                                                    <label className="w-40 text-gray-700 text-sm">OT Approved :</label>
                                                    <input
                                                        type="checkbox"
                                                        checked={otApproved}
                                                        onChange={(e) => setOtApproved(e.target.checked)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                </div>

                                                {/* IsLateFiling */}
                                                <div className="flex items-center gap-3">
                                                    <label className="w-40 text-gray-700 text-sm">IsLateFiling :</label>
                                                    <input
                                                        type="checkbox"
                                                        checked={isLateFiling}
                                                        onChange={(e) => setIsLateFiling(e.target.checked)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                </div>

                                                {/* Remarks */}
                                                <div className="flex items-start gap-3">
                                                    <label className="w-40 text-gray-700 text-sm pt-1">Remarks :</label>
                                                    <textarea
                                                        value={remarks}
                                                        onChange={(e) => setRemarks(e.target.value)}
                                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                        rows={3}
                                                    />
                                                </div>

                                                {/* Borrowed Device Name */}
                                                <div className="flex items-center gap-3">
                                                    <label className="w-40 text-gray-700 text-sm">Borrowed Device Name :</label>
                                                    <input
                                                        type="text"
                                                        value={borrowedDeviceName}
                                                        onChange={(e) => setBorrowedDeviceName(e.target.value)}
                                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                        readOnly
                                                    />
                                                    <button
                                                        onClick={() => setShowDeviceModal(true)}
                                                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                        title="Search Device"
                                                    >
                                                        <Search className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setBorrowedDeviceName('')}
                                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                        title="Clear"
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
                                                    {editingId !== null ? 'Update' : 'Submit'}
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

                        {/* Employee Code Search Modal */}
                        {showEmpCodeModal && (
                            <>
                                {/* Modal Backdrop */}
                                <div
                                    className="fixed inset-0 bg-black/30 z-30"
                                    onClick={() => setShowEmpCodeModal(false)}
                                ></div>

                                {/* Modal Dialog */}
                                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[110vh] overflow-y-auto">
                                        {/* Modal Header */}
                                        <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                                            <h2 className="text-gray-800 text-sm">Search</h2>
                                            <button
                                                onClick={() => setShowEmpCodeModal(false)}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Modal Content */}
                                        <div className="p-3">
                                            <h3 className="text-blue-600 mb-2 text-sm">Employee Code</h3>

                                            {/* Search Input */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <label className="text-gray-700 text-sm">Search:</label>
                                                <input
                                                    type="text"
                                                    value={empCodeSearchTerm}
                                                    onChange={(e) => setEmpCodeSearchTerm(e.target.value)}
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>

                                            {/* Employee Table */}
                                            <div className="border border-gray-200 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                                <table className="w-full border-collapse text-sm">
                                                    <thead className="sticky top-0 bg-white">
                                                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                                                            <th className="px-3 py-1.5 text-left text-gray-700 text-sm">EmpCode ▲</th>
                                                            <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Name</th>
                                                            <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Group Code</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredEmployees.map((emp, index) => (
                                                            <tr
                                                                key={emp.empCode}
                                                                className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                                                                onClick={() => handleEmpCodeSelect(emp.empCode, emp.name)}
                                                            >
                                                                <td className="px-3 py-1.5">{emp.empCode}</td>
                                                                <td className="px-3 py-1.5">{emp.name}</td>
                                                                <td className="px-3 py-1.5">{emp.groupCode}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Pagination */}
                                            <div className="flex items-center justify-between mt-3">
                                                <div className="text-gray-600 text-xs">
                                                    Showing 1 to 10 of 1,658 entries
                                                </div>
                                                <div className="flex gap-1">
                                                    <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">
                                                        Previous
                                                    </button>
                                                    <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs">1</button>
                                                    <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">2</button>
                                                    <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">3</button>
                                                    <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Workshift Search Modal */}
                        {showWorkshiftModal && (
                            <>
                                {/* Modal Backdrop */}
                                <div
                                    className="fixed inset-0 bg-black/30 z-30"
                                    onClick={() => setShowWorkshiftModal(false)}
                                ></div>

                                {/* Modal Dialog */}
                                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[110vh] overflow-y-auto">
                                        {/* Modal Header */}
                                        <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                                            <h2 className="text-gray-800 text-sm">Search</h2>
                                            <button
                                                onClick={() => setShowWorkshiftModal(false)}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Modal Content */}
                                        <div className="p-3">
                                            <h3 className="text-blue-600 mb-2 text-sm">Workshift Code</h3>

                                            {/* Search Input */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <label className="text-gray-700 text-sm">Search:</label>
                                                <input
                                                    type="text"
                                                    value={workshiftSearchTerm}
                                                    onChange={(e) => setWorkshiftSearchTerm(e.target.value)}
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>

                                            {/* Workshift Table */}
                                            <div className="border border-gray-200 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                                <table className="w-full border-collapse text-sm">
                                                    <thead className="sticky top-0 bg-white">
                                                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                                                            <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Code ▲</th>
                                                            <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Description</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredWorkshifts.map((ws, index) => (
                                                            <tr
                                                                key={ws.code}
                                                                className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                                                                onClick={() => handleWorkshiftSelect(ws.code)}
                                                            >
                                                                <td className="px-3 py-1.5">{ws.code}</td>
                                                                <td className="px-3 py-1.5">{ws.description}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Device Search Modal */}
                        {showDeviceModal && (
                            <>
                                {/* Modal Backdrop */}
                                <div
                                    className="fixed inset-0 bg-black/30 z-30"
                                    onClick={() => setShowDeviceModal(false)}
                                ></div>

                                {/* Modal Dialog */}
                                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[110vh] overflow-y-auto">
                                        {/* Modal Header */}
                                        <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                                            <h2 className="text-gray-800 text-sm">Search</h2>
                                            <button
                                                onClick={() => setShowDeviceModal(false)}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Modal Content */}
                                        <div className="p-3">
                                            <h3 className="text-blue-600 mb-2 text-sm">Device Name</h3>

                                            {/* Search Input */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <label className="text-gray-700 text-sm">Search:</label>
                                                <input
                                                    type="text"
                                                    value={deviceSearchTerm}
                                                    onChange={(e) => setDeviceSearchTerm(e.target.value)}
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>

                                            {/* Device Table */}
                                            <div className="border border-gray-200 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                                <table className="w-full border-collapse text-sm">
                                                    <thead className="sticky top-0 bg-white">
                                                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                                                            <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Device Code ▲</th>
                                                            <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Device Name</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredDevices.map((device, index) => (
                                                            <tr
                                                                key={device.deviceCode}
                                                                className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                                                                onClick={() => handleDeviceSelect(device.deviceName)}
                                                            >
                                                                <td className="px-3 py-1.5">{device.deviceCode}</td>
                                                                <td className="px-3 py-1.5">{device.deviceName}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
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
