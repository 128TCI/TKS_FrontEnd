import { useState, useEffect } from 'react';
import { X, Search, Plus, Check, ArrowLeft, Calendar, Edit, Trash2 } from 'lucide-react';
import { CalendarPopup } from './CalendarPopup';
import { Footer } from './Footer/Footer';

interface OTGapRecord {
    id: number;
    empCode: string;
    empName: string;
    workshiftCode: string;
    actualDateIn: string;
    dateIn: string;
    timeIn: string;
    dateOut: string;
    timeOut: string;
    dayType: string;
}

export function RawdataOtGapPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedRecordIndex, setSelectedRecordIndex] = useState<number | null>(null);

    // Filter controls
    const [incompleteLogs, setIncompleteLogs] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'specific'>('all');
    const [dateFrom, setDateFrom] = useState('5/5/2021');
    const [dateTo, setDateTo] = useState('05/05/2021');

    // Search modal states
    const [showEmpCodeModal, setShowEmpCodeModal] = useState(false);
    const [showWorkshiftModal, setShowWorkshiftModal] = useState(false);
    const [empCodeSearchTerm, setEmpCodeSearchTerm] = useState('');
    const [workshiftSearchTerm, setWorkshiftSearchTerm] = useState('');

    // Calendar states
    const [showDateFromCalendar, setShowDateFromCalendar] = useState(false);
    const [showDateToCalendar, setShowDateToCalendar] = useState(false);

    // Calendar states for modal date fields
    const [showActualDateInCalendar, setShowActualDateInCalendar] = useState(false);
    const [showDateInCalendar, setShowDateInCalendar] = useState(false);
    const [showDateOutCalendar, setShowDateOutCalendar] = useState(false);

    // Form fields
    const [empCode, setEmpCode] = useState('');
    const [empName, setEmpName] = useState('');
    const [workshiftCode, setWorkshiftCode] = useState('');
    const [actualDateIn, setActualDateIn] = useState('');
    const [dateIn, setDateIn] = useState('');
    const [timeIn, setTimeIn] = useState('');
    const [dateOut, setDateOut] = useState('');
    const [timeOut, setTimeOut] = useState('');
    const [dayType, setDayType] = useState('');

    // Sample data for the list
    const [recordList, setRecordList] = useState<OTGapRecord[]>([
        {
            id: 1,
            empCode: 'Z1047',
            empName: 'PERLITA, MANALO LUCAS',
            workshiftCode: '730AM08PM',
            actualDateIn: '3/2/2020',
            dateIn: '3/2/2020',
            timeIn: '7:00 PM',
            dateOut: '3/2/2020',
            timeOut: '9:58 PM',
            dayType: 'RegDay'
        }
    ]);

    // Sample employee data for search modal
    const employeeData = [
        { empCode: '000877', name: 'Last122, First A', groupCode: '45' },
        { empCode: '000878', name: 'Last, First A', groupCode: '45' },
        { empCode: '000900', name: 'Last, First A', groupCode: '109' },
        { empCode: 'Z1047', name: 'PERLITA, MANALO LUCAS', groupCode: '45' },
    ];

    // Sample workshift data for search modal
    const workshiftData = [
        { code: '730AM08PM', description: '7:30 AM - 8:00 PM' },
        { code: '800AM05PM', description: '8:00 AM - 5:00 PM' },
        { code: '900AM06PM', description: '9:00 AM - 6:00 PM' },
    ];

    // Handle ESC key to close modals
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (showEmpCodeModal) {
                    setShowEmpCodeModal(false);
                } else if (showWorkshiftModal) {
                    setShowWorkshiftModal(false);
                } else if (showCreateModal) {
                    setShowCreateModal(false);
                }
            }
        };

        if (showCreateModal || showEmpCodeModal || showWorkshiftModal) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showCreateModal, showEmpCodeModal, showWorkshiftModal]);

    const handleCreateNew = () => {
        setIsEditMode(false);
        setSelectedRecordIndex(null);
        // Clear form
        setEmpCode('');
        setEmpName('');
        setWorkshiftCode('');
        setActualDateIn('');
        setDateIn('');
        setTimeIn('');
        setDateOut('');
        setTimeOut('');
        setDayType('');
        setShowCreateModal(true);
    };

    const handleEdit = (record: OTGapRecord, index: number) => {
        setIsEditMode(true);
        setSelectedRecordIndex(index);
        setEmpCode(record.empCode);
        setEmpName(record.empName);
        setWorkshiftCode(record.workshiftCode);
        setActualDateIn(record.actualDateIn);
        setDateIn(record.dateIn);
        setTimeIn(record.timeIn);
        setDateOut(record.dateOut);
        setTimeOut(record.timeOut);
        setDayType(record.dayType);
        setShowCreateModal(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            setRecordList(recordList.filter(record => record.id !== id));
        }
    };

    const handleSubmit = () => {
        // Validate employee code
        if (!empCode.trim()) {
            alert('Please enter an Employee Code.');
            return;
        }

        if (isEditMode && selectedRecordIndex !== null) {
            // Update existing record
            const updatedList = [...recordList];
            updatedList[selectedRecordIndex] = {
                id: recordList[selectedRecordIndex].id,
                empCode: empCode,
                empName: empName,
                workshiftCode: workshiftCode,
                actualDateIn: actualDateIn,
                dateIn: dateIn,
                timeIn: timeIn,
                dateOut: dateOut,
                timeOut: timeOut,
                dayType: dayType
            };
            setRecordList(updatedList);
        } else {
            // Create new record
            const newRecord: OTGapRecord = {
                id: Math.max(...recordList.map(r => r.id), 0) + 1,
                empCode: empCode,
                empName: empName,
                workshiftCode: workshiftCode,
                actualDateIn: actualDateIn,
                dateIn: dateIn,
                timeIn: timeIn,
                dateOut: dateOut,
                timeOut: timeOut,
                dayType: dayType
            };
            setRecordList([...recordList, newRecord]);
        }

        // Close modal and reset form
        setShowCreateModal(false);
        setEmpCode('');
        setEmpName('');
        setWorkshiftCode('');
        setActualDateIn('');
        setDateIn('');
        setTimeIn('');
        setDateOut('');
        setTimeOut('');
        setDayType('');
        setIsEditMode(false);
        setSelectedRecordIndex(null);
    };

    const handleSearch = () => {
        // Handle search logic here
        console.log('Searching with filters:', {
            incompleteLogs,
            filterType,
            dateFrom,
            dateTo
        });
    };

    const handleEmpCodeSelect = (empCodeValue: string, name: string) => {
        setEmpCode(empCodeValue);
        setEmpName(name);
        setShowEmpCodeModal(false);
    };

    const handleWorkshiftSelect = (code: string) => {
        setWorkshiftCode(code);
        setShowWorkshiftModal(false);
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

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Main Content */}
            <div className="flex-1">
                <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
                    {/* Page Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
                        <h1 className="text-white">Rawdata OT Gap</h1>
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
                                        Manage overtime gap records and adjustments for employee timekeeping. View and edit overtime gaps to ensure accurate time tracking and payroll processing.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Track employee overtime gaps</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Manage workshift assignments</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Edit time records</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Review day type classifications</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Controls Row */}
                        <div className="mb-6">
                            {/* First Row: Create New, Checkbox, Radio Buttons */}
                            <div className="flex items-center gap-4 mb-3">
                                <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                                    onClick={handleCreateNew}
                                >
                                    <Plus className="w-4 h-4" />
                                    Create New
                                </button>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={incompleteLogs}
                                        onChange={(e) => setIncompleteLogs(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700">Incomplete Logs</span>
                                </label>

                                <div className="flex items-center gap-4 ml-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="filterType"
                                            checked={filterType === 'all'}
                                            onChange={() => setFilterType('all')}
                                            className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700">All</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="filterType"
                                            checked={filterType === 'specific'}
                                            onChange={() => setFilterType('specific')}
                                            className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700">Specific</span>
                                    </label>
                                </div>
                            </div>

                            {/* Second Row: Date Filters and Search Button */}
                            <div className="flex items-center gap-4 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 relative">
                                    <label className="text-sm font-bold text-gray-700 ml-4">Date From</label>
                                    <input
                                        type="text"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        placeholder="MM/DD/YYYY"
                                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowDateFromCalendar(!showDateFromCalendar)}
                                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Calendar className="w-4 h-4" />
                                        </button>
                                        {showDateFromCalendar && (
                                            <div className="absolute top-full left-0 mt-1 z-50">
                                                <CalendarPopup
                                                    onDateSelect={(date) => {
                                                        setDateFrom(date);
                                                        setShowDateFromCalendar(false);
                                                    }}
                                                    onClose={() => setShowDateFromCalendar(false)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 relative">
                                    <label className="text-gray-700 font-bold text-sm">Date To</label>
                                    <input
                                        type="text"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        placeholder="MM/DD/YYYY"
                                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowDateToCalendar(!showDateToCalendar)}
                                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Calendar className="w-4 h-4" />
                                        </button>
                                        {showDateToCalendar && (
                                            <div className="absolute top-full left-0 mt-1 z-50">
                                                <CalendarPopup
                                                    onDateSelect={(date) => {
                                                        setDateTo(date);
                                                        setShowDateToCalendar(false);
                                                    }}
                                                    onClose={() => setShowDateToCalendar(false)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <Search className="w-4 h-4" />
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Actions</th>
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Employee Code ▲</th>
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Employee Name</th>
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Workshift Code</th>
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Actual Date-In</th>
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Date-In</th>
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Time-In</th>
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Date-Out</th>
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">Time-Out</th>
                                        <th className="px-4 py-2 text-left text-gray-700 text-sm whitespace-nowrap">DayType</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recordList.map((record, index) => (
                                        <tr
                                            key={record.id}
                                            className="border-b border-gray-200 hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(record, index)}
                                                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(record.id)}
                                                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{record.empCode}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{record.empName}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{record.workshiftCode}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{record.actualDateIn}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{record.dateIn}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{record.timeIn}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{record.dateOut}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{record.timeOut}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{record.dayType}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-gray-600 text-sm">
                                Showing 1 to {recordList.length} of {recordList.length} entries
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
                                    Previous
                                </button>
                                <button className="px-3 py-1 bg-blue-600 text-white rounded">
                                    1
                                </button>
                                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
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
                                    <div className="bg-white rounded-lg border-gray-300 shadow-xl w-full max-w-3xl max-h-[110vh] overflow">
                                        {/* Modal Header */}
                                        <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between rounded-t-lg">
                                            <h2 className="text-gray-800">{isEditMode ? 'Edit Record' : 'Create New'}</h2>
                                            <button
                                                onClick={() => setShowCreateModal(false)}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Modal Content */}
                                        <div className="p-5">
                                            <h3 className="text-blue-600 mb-4">Rawdata OT Gap</h3>

                                            {/* Form Fields */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <label className="w-32 text-gray-700 text-sm">Employee Code :</label>
                                                    <input
                                                        type="text"
                                                        value={empCode}
                                                        onChange={(e) => setEmpCode(e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                    <button
                                                        onClick={() => setShowEmpCodeModal(true)}
                                                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        <Search className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEmpCode('');
                                                            setEmpName('');
                                                        }}
                                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <label className="w-32 text-gray-700 text-sm">Employee Name :</label>
                                                    <input
                                                        type="text"
                                                        value={empName}
                                                        onChange={(e) => setEmpName(e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <label className="w-32 text-gray-700 text-sm">Workshift Code :</label>
                                                    <input
                                                        type="text"
                                                        value={workshiftCode}
                                                        onChange={(e) => setWorkshiftCode(e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                    <button
                                                        onClick={() => setShowWorkshiftModal(true)}
                                                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        <Search className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setWorkshiftCode('')}
                                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-2 relative">
                                                    <label className="w-32 text-gray-700 text-sm">Actual Date-In :</label>
                                                    <input
                                                        type="text"
                                                        value={actualDateIn}
                                                        onChange={(e) => setActualDateIn(e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                        placeholder="MM/DD/YYYY"
                                                    />
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setShowActualDateInCalendar(!showActualDateInCalendar)}
                                                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                        >
                                                            <Calendar className="w-4 h-4" />
                                                        </button>
                                                        {showActualDateInCalendar && (
                                                            <div className="absolute top-full left-0 mt-1 z-50">
                                                                <CalendarPopup
                                                                    onDateSelect={(date) => {
                                                                        setActualDateIn(date);
                                                                        setShowActualDateInCalendar(false);
                                                                    }}
                                                                    onClose={() => setShowActualDateInCalendar(false)}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 relative">
                                                    <label className="w-32 text-gray-700 text-sm">Date-In :</label>
                                                    <input
                                                        type="text"
                                                        value={dateIn}
                                                        onChange={(e) => setDateIn(e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                        placeholder="MM/DD/YYYY"
                                                    />
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setShowDateInCalendar(!showDateInCalendar)}
                                                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                        >
                                                            <Calendar className="w-4 h-4" />
                                                        </button>
                                                        {showDateInCalendar && (
                                                            <div className="absolute top-full left-0 mt-1 z-50">
                                                                <CalendarPopup
                                                                    onDateSelect={(date) => {
                                                                        setDateIn(date);
                                                                        setShowDateInCalendar(false);
                                                                    }}
                                                                    onClose={() => setShowDateInCalendar(false)}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <label className="w-32 text-gray-700 text-sm">Time-In :</label>
                                                    <input
                                                        type="text"
                                                        value={timeIn}
                                                        onChange={(e) => setTimeIn(e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                        placeholder="HH:MM AM/PM"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-2 relative">
                                                    <label className="w-32 text-gray-700 text-sm">Date-Out :</label>
                                                    <input
                                                        type="text"
                                                        value={dateOut}
                                                        onChange={(e) => setDateOut(e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                        placeholder="MM/DD/YYYY"
                                                    />
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setShowDateOutCalendar(!showDateOutCalendar)}
                                                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                        >
                                                            <Calendar className="w-4 h-4" />
                                                        </button>
                                                        {showDateOutCalendar && (
                                                            <div className="absolute top-full left-0 mt-1 z-50">
                                                                <CalendarPopup
                                                                    onDateSelect={(date) => {
                                                                        setDateOut(date);
                                                                        setShowDateOutCalendar(false);
                                                                    }}
                                                                    onClose={() => setShowDateOutCalendar(false)}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <label className="w-32 text-gray-700 text-sm">Time-Out :</label>
                                                    <input
                                                        type="text"
                                                        value={timeOut}
                                                        onChange={(e) => setTimeOut(e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                        placeholder="HH:MM AM/PM"
                                                    />
                                                </div>
                                            </div>

                                            {/* Modal Actions */}
                                            <div className="flex gap-3 mt-6">
                                                <button
                                                    onClick={handleSubmit}
                                                    className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
                                                >
                                                    {isEditMode ? 'Update' : 'Submit'}
                                                </button>
                                                <button
                                                    onClick={() => setShowCreateModal(false)}
                                                    className="px-5 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
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
                                                        {filteredEmployees.map((emp) => (
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
                                                    Showing 1 to {filteredEmployees.length} of {filteredEmployees.length} entries
                                                </div>
                                                <div className="flex gap-1">
                                                    <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">
                                                        Previous
                                                    </button>
                                                    <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs">1</button>
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

                        {/* Workshift Code Search Modal */}
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
                                                        {filteredWorkshifts.map((ws) => (
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

                                            {/* Pagination */}
                                            <div className="flex items-center justify-between mt-3">
                                                <div className="text-gray-600 text-xs">
                                                    Showing 1 to {filteredWorkshifts.length} of {filteredWorkshifts.length} entries
                                                </div>
                                                <div className="flex gap-1">
                                                    <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs">
                                                        Previous
                                                    </button>
                                                    <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs">1</button>
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
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}