import { useState, useEffect, useCallback } from 'react';
import { X, Search, Plus, Check, Calendar, Edit, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { CalendarPopup } from '../CalendarPopup';
import { Footer } from '../Footer/Footer';
import apiClient from '../../services/apiClient';
import { EmployeeSearchModal } from '../Modals/EmployeeSearchModal';
import { TimePicker } from '../Modals/TimePickerModal';


// ─── Types ────────────────────────────────────────────────────────────────────

interface OTGapRecord {
    id: number;
    empCode: string;
    actualDateIn: string;   // ISO
    dateIn: string;         // ISO
    timeIn: string;         // ISO
    dateOut: string;        // ISO
    timeOut: string;        // ISO
    workShiftCode: string;
    dayType: string;
    otGap: boolean;
    isLateFilingProcessed: boolean;
}

interface EmployeeData {
    empCode: string;
    name: string;
    groupCode: string;
}

interface WorkShift {
    code: string;
    description: string;
}

// ─── API Endpoints ────────────────────────────────────────────────────────────

const OT_GAP_BASE_URL    = '/Maintenance/EmployeeRawDataOTGap';
const EMPLOYEE_MASTER_URL = '/Maintenance/EmployeeMasterFile';
const WORKSHIFT_BASE_URL  = '/Maintenance/WorkShift';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const todayStr = () => {
    const d = new Date();
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
};

/** MM/DD/YYYY → ISO date-only string (00:00 UTC) */
const toISODate = (dateStr: string): string => {
    if (!dateStr) return new Date().toISOString();
    try {
        if (dateStr.includes('/')) {
            const [m, d, y] = dateStr.split('/');
            return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T00:00:00.000Z`;
        }
        return new Date(dateStr).toISOString();
    } catch {
        return new Date().toISOString();
    }
};

/** MM/DD/YYYY + "HH:MM AM/PM" → full ISO datetime string */
const toISODateTime = (dateStr: string, timeStr: string = ''): string => {
    if (!dateStr) return new Date().toISOString();
    try {
        let base = dateStr;
        if (dateStr.includes('/')) {
            const [m, d, y] = dateStr.split('/');
            base = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        if (timeStr) {
            const upper = timeStr.toUpperCase().trim();
            const match = upper.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/);
            if (match) {
                let hours = parseInt(match[1]);
                const mins = match[2];
                if (match[3] === 'PM' && hours !== 12) hours += 12;
                if (match[3] === 'AM' && hours === 12) hours = 0;
                return `${base}T${String(hours).padStart(2, '0')}:${mins}:00.000Z`;
            }
        }
        return `${base}T00:00:00.000Z`;
    } catch {
        return new Date().toISOString();
    }
};

/** ISO → { date: 'MM/DD/YYYY', time: 'HH:MM AM/PM' } */
const fromISO = (iso: string): { date: string; time: string } => {
    if (!iso) return { date: '', time: '' };
    try {
        const d = new Date(iso);
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day   = String(d.getUTCDate()).padStart(2, '0');
        const year  = d.getUTCFullYear();
        let hours   = d.getUTCHours();
        const mins  = String(d.getUTCMinutes()).padStart(2, '0');
        const period = hours >= 12 ? 'PM' : 'AM';
        if (hours > 12) hours -= 12;
        if (hours === 0) hours = 12;
        return {
            date: `${month}/${day}/${year}`,
            time: `${String(hours).padStart(2, '0')}:${mins} ${period}`,
        };
    } catch {
        return { date: '', time: '' };
    }
};

const validateTimeFormat = (value: string): string => {
    const trimmed = value.trim().toUpperCase();
    if (!trimmed) return '';
    const timeRegex = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;
    if (timeRegex.test(trimmed)) {
        const match = trimmed.match(timeRegex)!;
        return `${match[1].padStart(2, '0')}:${match[2]} ${match[3].toUpperCase()}`;
    }
    return value;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function RawdataOtGapPage() {

    // ── Filter state ──
    const [incompleteLogs, setIncompleteLogs]   = useState(false);
    const [filterType, setFilterType]           = useState<'all' | 'specific'>('all');
    const [dateFrom, setDateFrom]               = useState(todayStr());
    const [dateTo, setDateTo]                   = useState(todayStr());
    const [showDateFromCalendar, setShowDateFromCalendar] = useState(false);
    const [showDateToCalendar,   setShowDateToCalendar]   = useState(false);

    // ── Specific-employee filter ──
    const [specificEmpCode, setSpecificEmpCode] = useState('');
    const [specificEmpName, setSpecificEmpName] = useState('');
    const [showSpecificEmpModal, setShowSpecificEmpModal] = useState(false);

    // ── Table data ──
    const [recordList, setRecordList] = useState<OTGapRecord[]>([]);
    const [loading, setLoading]       = useState(false);
    const [tableError, setTableError] = useState('');

    // ── Sorting ──
    type SortKey = 'empCode' | 'empName' | 'workShiftCode' | 'actualDateIn' | 'dateIn' | 'timeIn' | 'dateOut' | 'timeOut' | 'dayType' | 'otGap';
    const [sortKey, setSortKey]         = useState<SortKey>('empCode');
    const [sortDir, setSortDir]         = useState<'asc' | 'desc'>('asc');

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    // ── Create / Edit modal ──
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingId, setEditingId]             = useState<number | null>(null);
    const [submitLoading, setSubmitLoading]     = useState(false);
    const [formError, setFormError]             = useState('');

    // ── Form fields ──
    const [empCode,       setEmpCode]       = useState('');
    const [empName,       setEmpName]       = useState('');
    const [workshiftCode, setWorkshiftCode] = useState('');
    const [actualDateIn,  setActualDateIn]  = useState('');
    const [dateIn,        setDateIn]        = useState('');
    const [timeIn,        setTimeIn]        = useState('');
    const [dateOut,       setDateOut]       = useState('');
    const [timeOut,       setTimeOut]       = useState('');
    const [otGap,         setOtGap]         = useState(false);
    const [isLateFilingProcessed, setIsLateFilingProcessed] = useState(false);

    // ── Calendar / TimePicker states inside modal ──
    const [showActualDateInCalendar, setShowActualDateInCalendar] = useState(false);
    const [showDateInCalendar,       setShowDateInCalendar]       = useState(false);
    const [showTimeInPicker,         setShowTimeInPicker]         = useState(false);
    const [showDateOutCalendar,      setShowDateOutCalendar]      = useState(false);
    const [showTimeOutPicker,        setShowTimeOutPicker]        = useState(false);

    // ── Employee modal (form) ──
    const [showEmpCodeModal, setShowEmpCodeModal]   = useState(false);
    const [employeeData,     setEmployeeData]       = useState<EmployeeData[]>([]);
    const [loadingEmployees, setLoadingEmployees]   = useState(false);
    const [employeeError,    setEmployeeError]      = useState('');

    // ── Workshift modal ──
    const [showWorkshiftModal,  setShowWorkshiftModal]  = useState(false);
    const [workshiftSearchTerm, setWorkshiftSearchTerm] = useState('');
    const [workshifts,          setWorkshifts]          = useState<WorkShift[]>([]);
    const [loadingWorkshifts,   setLoadingWorkshifts]   = useState(false);
    const [workshiftError,      setWorkshiftError]      = useState('');

    // ─────────────────────────────────────────────────────────────────────────
    // DATA FETCHING
    // ─────────────────────────────────────────────────────────────────────────

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        setTableError('');
        try {
            const params: Record<string, string> = {
                dateFrom: toISODate(dateFrom),
                dateTo:   toISODate(dateTo),
            };
            if (filterType === 'specific' && specificEmpCode) {
                params.empCode = specificEmpCode;
            }

            const response = await apiClient.get(OT_GAP_BASE_URL, { params });
            if (response.status === 200 && response.data) {
                const list: OTGapRecord[] = Array.isArray(response.data) ? response.data : [];

                const fromMs = new Date(toISODate(dateFrom)).setUTCHours(0, 0, 0, 0);
                const toMs   = new Date(toISODate(dateTo)).setUTCHours(23, 59, 0, 0);

                const filtered = list.filter(entry => {
                    if (!entry.dateIn) return false;
                    const dateInMs = new Date(entry.dateIn).getTime();
                    if (dateInMs < fromMs || dateInMs > toMs) return false;

                    const hasDateOut = !!entry.dateOut && entry.dateOut.trim() !== '';
                    const hasTimeIn  = !!entry.timeIn;
                    const hasTimeOut = !!entry.timeOut;
                    const isComplete = hasDateOut && hasTimeIn && hasTimeOut;

                    return incompleteLogs ? !isComplete : isComplete;
                });

                setRecordList(filtered);
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message || 'Failed to load records';
            setTableError(msg);
            console.error('Error fetching OT gap records:', error);
        } finally {
            setLoading(false);
        }
    }, [dateFrom, dateTo, incompleteLogs, filterType, specificEmpCode]);

    const fetchEmployeeData = async () => {
        setLoadingEmployees(true);
        setEmployeeError('');
        try {
            const response = await apiClient.get(EMPLOYEE_MASTER_URL);
            if (response.status === 200 && response.data) {
                const mappedData = response.data.map((emp: any) => ({
                    empCode:   emp.empCode || emp.code || '',
                    name:      `${emp.lName || ''}, ${emp.fName || ''} ${emp.mName || ''}`.trim(),
                    groupCode: emp.grpCode || '',
                }));
                setEmployeeData(mappedData);
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to load employees';
            setEmployeeError(errorMsg);
            console.error('Error fetching employees:', error);
        } finally {
            setLoadingEmployees(false);
        }
    };

    const fetchWorkshifts = useCallback(async () => {
        setLoadingWorkshifts(true);
        setWorkshiftError('');
        try {
            const response = await apiClient.get(WORKSHIFT_BASE_URL);
            if (response.status === 200 && response.data) {
                const data = Array.isArray(response.data) ? response.data : [];
                setWorkshifts(data.map((w: any) => ({
                    code:        w.code || w.workShiftCode || w.workshiftCode || '',
                    description: w.description || w.workShiftDescription || '',
                })));
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message || 'Failed to load workshifts';
            setWorkshiftError(msg);
            console.error('Error fetching workshifts:', error);
        } finally {
            setLoadingWorkshifts(false);
        }
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // CRUD
    // ─────────────────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        if (!empCode.trim()) { setFormError('Please select an Employee Code.'); return; }
        if (!dateIn.trim())  { setFormError('Date In is required.'); return; }
        setFormError('');
        setSubmitLoading(true);

        const payload = {
            empCode,
            actualDateIn: toISODate(actualDateIn || dateIn),
            dateIn:       toISODate(dateIn),
            timeIn:       toISODateTime(dateIn, timeIn),
            dateOut:      toISODate(dateOut || dateIn),
            timeOut:      toISODateTime(dateOut || dateIn, timeOut),
            workShiftCode: workshiftCode,
            dayType:      '',
            otGap,
            isLateFilingProcessed,
        };

        try {
            if (editingId !== null) {
                await apiClient.put(`${OT_GAP_BASE_URL}/${editingId}`, { ...payload, id: editingId });
            } else {
                await apiClient.post(OT_GAP_BASE_URL, payload);
            }
            setShowCreateModal(false);
            setEditingId(null);
            await fetchRecords();
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message || 'Failed to save record';
            setFormError(msg);
            console.error('Error saving OT gap record:', error);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEdit = (record: OTGapRecord) => {
        setEditingId(record.id);
        setEmpCode(record.empCode);

        const found = employeeData.find(e => e.empCode === record.empCode);
        setEmpName(found?.name ?? '');

        setWorkshiftCode(record.workShiftCode);

        const adi  = fromISO(record.actualDateIn);
        const di   = fromISO(record.dateIn);
        const ti   = fromISO(record.timeIn);
        const doD  = fromISO(record.dateOut);
        const tot  = fromISO(record.timeOut);

        setActualDateIn(adi.date);
        setDateIn(di.date);
        setTimeIn(ti.time);
        setDateOut(doD.date);
        setTimeOut(tot.time);
        setOtGap(record.otGap);
        setIsLateFilingProcessed(record.isLateFilingProcessed);
        setFormError('');
        setShowCreateModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this record?')) return;
        try {
            await apiClient.delete(`${OT_GAP_BASE_URL}/${id}`);
            setRecordList(prev => prev.filter(r => r.id !== id));
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message || 'Failed to delete record';
            alert(msg);
            console.error('Error deleting OT gap record:', error);
        }
    };

    const handleCreateNew = () => {
        setEditingId(null);
        setEmpCode(''); setEmpName(''); setWorkshiftCode('');
        setActualDateIn(''); setDateIn(''); setTimeIn('');
        setDateOut(''); setTimeOut('');
        setOtGap(false); setIsLateFilingProcessed(false);
        setFormError('');
        setShowCreateModal(true);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // SELECT HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    const handleEmpCodeSelect = (code: string) => {
        const found = employeeData.find(e => e.empCode === code);
        setEmpCode(code);
        setEmpName(found?.name ?? '');
        setShowEmpCodeModal(false);
    };

    const handleSpecificEmpSelect = (code: string) => {
        const found = employeeData.find(e => e.empCode === code);
        setSpecificEmpCode(code);
        setSpecificEmpName(found?.name ?? '');
        setShowSpecificEmpModal(false);
    };

    const handleWorkshiftSelect = (code: string) => {
        setWorkshiftCode(code);
        setShowWorkshiftModal(false);
    };

    const filteredWorkshifts = workshifts.filter(ws =>
        ws.code.toLowerCase().includes(workshiftSearchTerm.toLowerCase()) ||
        ws.description.toLowerCase().includes(workshiftSearchTerm.toLowerCase())
    );

    // ─────────────────────────────────────────────────────────────────────────
    // EFFECTS
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => { fetchEmployeeData(); }, []);

    useEffect(() => {
        if (showWorkshiftModal && workshifts.length === 0) fetchWorkshifts();
    }, [showWorkshiftModal, workshifts.length, fetchWorkshifts]);

    useEffect(() => {
        const onEsc = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            if (showEmpCodeModal)      { setShowEmpCodeModal(false);      return; }
            if (showSpecificEmpModal)  { setShowSpecificEmpModal(false);  return; }
            if (showWorkshiftModal)    { setShowWorkshiftModal(false);    return; }
            if (showCreateModal)       { setShowCreateModal(false);       return; }
            setShowDateFromCalendar(false);
            setShowDateToCalendar(false);
            setShowActualDateInCalendar(false);
            setShowDateInCalendar(false);
            setShowTimeInPicker(false);
            setShowDateOutCalendar(false);
            setShowTimeOutPicker(false);
        };
        document.addEventListener('keydown', onEsc);
        return () => document.removeEventListener('keydown', onEsc);
    }, [showEmpCodeModal, showSpecificEmpModal, showWorkshiftModal, showCreateModal]);

    // ─────────────────────────────────────────────────────────────────────────
    // JSX
    // ─────────────────────────────────────────────────────────────────────────

    const SortIcon = ({ col }: { col: SortKey }) => {
        if (sortKey !== col) return (
            <span className="inline-flex flex-col ml-1 leading-none" style={{ fontSize: '8px', verticalAlign: 'middle' }}>
                <span className="text-gray-400">▲</span>
                <span className="text-gray-400">▼</span>
            </span>
        );
        return (
            <span className="inline-flex flex-col ml-1 leading-none" style={{ fontSize: '8px', verticalAlign: 'middle' }}>
                <span className={sortDir === 'asc' ? 'text-blue-600' : 'text-gray-300'}>▲</span>
                <span className={sortDir === 'desc' ? 'text-blue-600' : 'text-gray-300'}>▼</span>
            </span>
        );
    };

    const filteredByEmp = filterType === 'specific' && specificEmpCode
        ? recordList.filter(r => r.empCode === specificEmpCode)
        : recordList;

    const sortedRecords = [...filteredByEmp].sort((a, b) => {
        let aVal: string | number | boolean = '';
        let bVal: string | number | boolean = '';

        if (sortKey === 'empName') {
            aVal = employeeData.find(e => e.empCode === a.empCode)?.name ?? '';
            bVal = employeeData.find(e => e.empCode === b.empCode)?.name ?? '';
        } else if (sortKey === 'otGap') {
            aVal = a.otGap ? 1 : 0;
            bVal = b.otGap ? 1 : 0;
        } else if (['actualDateIn', 'dateIn', 'timeIn', 'dateOut', 'timeOut'].includes(sortKey)) {
            aVal = a[sortKey] ? new Date(a[sortKey]).getTime() : 0;
            bVal = b[sortKey] ? new Date(b[sortKey]).getTime() : 0;
        } else {
            aVal = (a[sortKey as keyof OTGapRecord] as string) ?? '';
            bVal = (b[sortKey as keyof OTGapRecord] as string) ?? '';
        }

        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <div className="flex-1">
                <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">

                    {/* Page Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
                        <h1 className="text-white text-xl font-semibold">Rawdata OT Gap</h1>
                    </div>

                    {/* Content Container */}
                    <div className="bg-white rounded-b-lg shadow-lg p-6 relative">

                        {/* Info Banner */}
                        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-700 mb-2">
                                        Manage overtime gap records and adjustments for employee timekeeping.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        {['Track employee overtime gaps', 'Manage workshift assignments', 'Edit time records', 'Review day type classifications'].map(item => (
                                            <div key={item} className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                <span className="text-gray-600">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Top Controls ── */}
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                                onClick={handleCreateNew}
                            >
                                <Plus className="w-4 h-4" />
                                Create New
                            </button>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={incompleteLogs}
                                    onChange={e => setIncompleteLogs(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="text-gray-700">Incomplete Logs</span>
                            </label>

                            <div className="flex items-center gap-4">
                                {(['all', 'specific'] as const).map(mode => (
                                    <label key={mode} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="filterType"
                                            checked={filterType === mode}
                                            onChange={() => {
                                                setFilterType(mode);
                                                if (mode === 'all') { setSpecificEmpCode(''); setSpecificEmpName(''); }
                                            }}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="text-gray-700 capitalize">{mode}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* ── Specific Employee Picker ── */}
                        {filterType === 'specific' && (
                            <div className="flex flex-wrap items-center gap-3 mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <span className="text-sm font-medium text-blue-700 whitespace-nowrap">Employee:</span>
                                <input
                                    type="text" value={specificEmpCode} readOnly
                                    placeholder="Code"
                                    className="w-28 px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                                />
                                <input
                                    type="text" value={specificEmpName} readOnly
                                    placeholder="Employee name"
                                    className="flex-1 min-w-[160px] px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                                />
                                <button
                                    onClick={() => setShowSpecificEmpModal(true)}
                                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm"
                                >
                                    <Search className="w-3.5 h-3.5" /> Browse
                                </button>
                                {specificEmpCode && (
                                    <button
                                        onClick={() => { setSpecificEmpCode(''); setSpecificEmpName(''); }}
                                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-1 text-sm"
                                    >
                                        <X className="w-3.5 h-3.5" /> Clear
                                    </button>
                                )}
                            </div>
                        )}

                        {/* ── Date Filter Row ── */}
                        <div className="flex flex-wrap items-center gap-4 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                            {/* Date From */}
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-bold text-gray-700 whitespace-nowrap">Date From</label>
                                <div className="relative">
                                    <input
                                        type="text" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                                        placeholder="MM/DD/YYYY"
                                        className="w-34 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-9"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowDateFromCalendar(!showDateFromCalendar)}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        <Calendar className="w-3.5 h-3.5" />
                                    </button>
                                    {showDateFromCalendar && (
                                        <div className="absolute top-full left-0 mt-1 z-50">
                                            <CalendarPopup
                                                onDateSelect={d => { setDateFrom(d); setShowDateFromCalendar(false); }}
                                                onClose={() => setShowDateFromCalendar(false)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Date To */}
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-bold text-gray-700 whitespace-nowrap">Date To</label>
                                <div className="relative">
                                    <input
                                        type="text" value={dateTo} onChange={e => setDateTo(e.target.value)}
                                        placeholder="MM/DD/YYYY"
                                        className="w-34 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-9"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowDateToCalendar(!showDateToCalendar)}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        <Calendar className="w-3.5 h-3.5" />
                                    </button>
                                    {showDateToCalendar && (
                                        <div className="absolute top-full left-0 mt-1 z-50">
                                            <CalendarPopup
                                                onDateSelect={d => { setDateTo(d); setShowDateToCalendar(false); }}
                                                onClose={() => setShowDateToCalendar(false)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={fetchRecords}
                                disabled={loading}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-60"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                Search
                            </button>
                        </div>

                        {/* Error Banner */}
                        {tableError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {tableError}
                            </div>
                        )}

                        {/* ── Data Table ── */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                                        <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">Actions</th>
                                        {([
                                            { key: 'empCode',      label: 'Employee Code' },
                                            { key: 'empName',      label: 'Employee Name' },
                                            { key: 'workShiftCode',label: 'Workshift Code' },
                                            { key: 'actualDateIn', label: 'Actual Date-In' },
                                            { key: 'dateIn',       label: 'Date-In' },
                                            { key: 'timeIn',       label: 'Time-In' },
                                            { key: 'dateOut',      label: 'Date-Out' },
                                            { key: 'timeOut',      label: 'Time-Out' },
                                            { key: 'dayType',      label: 'Day Type' },
                                            { key: 'otGap',        label: 'OT Gap' },
                                        ] as { key: SortKey; label: string }[]).map(({ key, label }) => (
                                            <th
                                                key={key}
                                                onClick={() => handleSort(key)}
                                                className="px-4 py-2 text-left text-gray-700 whitespace-nowrap cursor-pointer select-none hover:bg-gray-200 transition-colors"
                                            >
                                                {label}<SortIcon col={key} />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={11} className="px-6 py-12 text-center">
                                                <div className="flex items-center justify-center gap-2 text-gray-500">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Loading data...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : recordList.length === 0 ? (
                                        <tr>
                                            <td colSpan={11} className="px-6 py-8 text-center text-gray-500">
                                                No data available. Use Search to load records.
                                            </td>
                                        </tr>
                                    ) : (
                                        sortedRecords.map(record => {
                                            const adi = fromISO(record.actualDateIn);
                                            const di  = fromISO(record.dateIn);
                                            const ti  = fromISO(record.timeIn);
                                            const doD = fromISO(record.dateOut);
                                            const tot = fromISO(record.timeOut);
                                            const empDisplay = employeeData.find(e => e.empCode === record.empCode);
                                            return (
                                                <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => handleEdit(record)}
                                                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(record.id)}
                                                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap font-mono">{record.empCode}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap">{empDisplay?.name ?? ''}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap">{record.workShiftCode}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap">{adi.date}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap">{di.date}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap">{ti.time}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap">{doD.date}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap">{tot.time}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap">{record.dayType}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${record.otGap ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                                            {record.otGap ? 'Yes' : 'No'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-gray-600 text-sm">
                                {recordList.length > 0
                                    ? `Showing 1 to ${recordList.length} of ${recordList.length} entries`
                                    : 'No entries'}
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm disabled:opacity-50" disabled>Previous</button>
                                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm disabled:opacity-50" disabled>Next</button>
                            </div>
                        </div>

                        {/* ══════════════════════════════════════════════════════════
                            CREATE / EDIT MODAL
                        ══════════════════════════════════════════════════════════ */}
                        {showCreateModal && (
                            <>
                                <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowCreateModal(false)} />
                                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                                        {/* Modal Header */}
                                        <div className="sticky top-0 bg-white px-5 py-3 border-b border-gray-200 flex items-center justify-between z-10">
                                            <h2 className="text-gray-800 font-semibold">
                                                {editingId !== null ? 'Edit Record' : 'Create New'}
                                            </h2>
                                            <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="p-5 space-y-3">
                                            <h3 className="text-blue-600 font-medium">Rawdata OT Gap</h3>

                                            {/* Form Error */}
                                            {formError && (
                                                <div className="p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-700 text-sm">
                                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                    {formError}
                                                </div>
                                            )}

                                            {/* ── Employee Code ── */}
                                            <div className="flex items-center gap-2">
                                                <label className="w-36 text-gray-700 text-sm flex-shrink-0">Employee Code :</label>
                                                <input
                                                    type="text" value={empCode} readOnly
                                                    placeholder="Select employee..."
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm bg-gray-50"
                                                />
                                                <button
                                                    onClick={() => setShowEmpCodeModal(true)}
                                                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex-shrink-0"
                                                >
                                                    <Search className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => { setEmpCode(''); setEmpName(''); }}
                                                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex-shrink-0"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* ── Employee Name ── */}
                                            <div className="flex items-center gap-2">
                                                <label className="w-36 text-gray-700 text-sm flex-shrink-0">Employee Name :</label>
                                                <input
                                                    type="text" value={empName} readOnly
                                                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded text-sm bg-gray-50 text-gray-600"
                                                />
                                            </div>

                                            {/* ── Workshift Code ── */}
                                            <div className="flex items-center gap-2">
                                                <label className="w-36 text-gray-700 text-sm flex-shrink-0">Workshift Code :</label>
                                                <input
                                                    type="text" value={workshiftCode} readOnly
                                                    placeholder="Select workshift..."
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm bg-gray-50"
                                                />
                                                <button
                                                    onClick={() => { setWorkshiftSearchTerm(''); setShowWorkshiftModal(true); }}
                                                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex-shrink-0"
                                                >
                                                    <Search className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setWorkshiftCode('')}
                                                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex-shrink-0"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* ── Actual Date-In ── */}
                                            <div className="flex items-center gap-2">
                                                <label className="w-36 text-gray-700 text-sm flex-shrink-0">Actual Date-In :</label>
                                                <div className="relative flex-1">
                                                    <input
                                                        type="text" value={actualDateIn}
                                                        onChange={e => setActualDateIn(e.target.value)}
                                                        placeholder="MM/DD/YYYY"
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm pr-9"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowActualDateInCalendar(!showActualDateInCalendar)}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                    >
                                                        <Calendar className="w-3.5 h-3.5" />
                                                    </button>
                                                    {showActualDateInCalendar && (
                                                        <div className="absolute top-full left-0 mt-1 z-50">
                                                            <CalendarPopup
                                                                onDateSelect={d => { setActualDateIn(d); setShowActualDateInCalendar(false); }}
                                                                onClose={() => setShowActualDateInCalendar(false)}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* ── Date-In ── */}
                                            <div className="flex items-center gap-2">
                                                <label className="w-36 text-gray-700 text-sm flex-shrink-0">Date-In :</label>
                                                <div className="relative flex-1">
                                                    <input
                                                        type="text" value={dateIn}
                                                        onChange={e => setDateIn(e.target.value)}
                                                        placeholder="MM/DD/YYYY"
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm pr-9"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowDateInCalendar(!showDateInCalendar)}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                    >
                                                        <Calendar className="w-3.5 h-3.5" />
                                                    </button>
                                                    {showDateInCalendar && (
                                                        <div className="absolute top-full left-0 mt-1 z-50">
                                                            <CalendarPopup
                                                                onDateSelect={d => { setDateIn(d); setShowDateInCalendar(false); }}
                                                                onClose={() => setShowDateInCalendar(false)}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* ── Time-In ── */}
                                            <div className="flex items-center gap-2">
                                                <label className="w-36 text-gray-700 text-sm flex-shrink-0">Time-In :</label>
                                                <div className="relative flex-1">
                                                    <input
                                                        type="text" value={timeIn}
                                                        onChange={e => setTimeIn(e.target.value)}
                                                        onBlur={() => setTimeIn(validateTimeFormat(timeIn))}
                                                        placeholder="HH:MM AM/PM"
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm pr-9 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowTimeInPicker(!showTimeInPicker)}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                    >
                                                        <Calendar className="w-3.5 h-3.5" />
                                                    </button>
                                                    {showTimeInPicker && (
                                                        <TimePicker
                                                            initialTime={timeIn}
                                                            onTimeSelect={time => { setTimeIn(time); setShowTimeInPicker(false); }}
                                                            onClose={() => setShowTimeInPicker(false)}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* ── Date-Out ── */}
                                            <div className="flex items-center gap-2">
                                                <label className="w-36 text-gray-700 text-sm flex-shrink-0">Date-Out :</label>
                                                <div className="relative flex-1">
                                                    <input
                                                        type="text" value={dateOut}
                                                        onChange={e => setDateOut(e.target.value)}
                                                        placeholder="MM/DD/YYYY"
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm pr-9"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowDateOutCalendar(!showDateOutCalendar)}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                    >
                                                        <Calendar className="w-3.5 h-3.5" />
                                                    </button>
                                                    {showDateOutCalendar && (
                                                        <div className="absolute top-full left-0 mt-1 z-50">
                                                            <CalendarPopup
                                                                onDateSelect={d => { setDateOut(d); setShowDateOutCalendar(false); }}
                                                                onClose={() => setShowDateOutCalendar(false)}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* ── Time-Out ── */}
                                            <div className="flex items-center gap-2">
                                                <label className="w-36 text-gray-700 text-sm flex-shrink-0">Time-Out :</label>
                                                <div className="relative flex-1">
                                                    <input
                                                        type="text" value={timeOut}
                                                        onChange={e => setTimeOut(e.target.value)}
                                                        onBlur={() => setTimeOut(validateTimeFormat(timeOut))}
                                                        placeholder="HH:MM AM/PM"
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm pr-9 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowTimeOutPicker(!showTimeOutPicker)}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                    >
                                                        <Calendar className="w-3.5 h-3.5" />
                                                    </button>
                                                    {showTimeOutPicker && (
                                                        <TimePicker
                                                            initialTime={timeOut}
                                                            onTimeSelect={time => { setTimeOut(time); setShowTimeOutPicker(false); }}
                                                            onClose={() => setShowTimeOutPicker(false)}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* ── OT Gap ── */}
                                            <div className="flex items-center gap-2">
                                                <label className="w-36 text-gray-700 text-sm flex-shrink-0">OT Gap :</label>
                                                <input
                                                    type="checkbox" checked={otGap}
                                                    onChange={e => setOtGap(e.target.checked)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                                                />
                                            </div>

                                            {/* ── Is Late Filing Processed ── */}
                                            <div className="flex items-center gap-2">
                                                <label className="w-36 text-gray-700 text-sm flex-shrink-0">Late Filing Processed :</label>
                                                <input
                                                    type="checkbox" checked={isLateFilingProcessed}
                                                    onChange={e => setIsLateFilingProcessed(e.target.checked)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                                                />
                                            </div>

                                            {/* ── Actions ── */}
                                            <div className="flex gap-3 pt-2 border-t border-gray-100">
                                                <button
                                                    onClick={handleSubmit}
                                                    disabled={submitLoading}
                                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-60"
                                                >
                                                    {submitLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                                    {editingId !== null ? 'Update' : 'Submit'}
                                                </button>
                                                <button
                                                    onClick={() => setShowCreateModal(false)}
                                                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                                                >
                                                    Back to List
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ══════════════════════════════════════════════════════════
                            EMPLOYEE SEARCH MODAL (Create/Edit form)
                        ══════════════════════════════════════════════════════════ */}
                        <EmployeeSearchModal
                            isOpen={showEmpCodeModal}
                            onClose={() => setShowEmpCodeModal(false)}
                            onSelect={(empCode: string) => handleEmpCodeSelect(empCode)}
                            employees={employeeData}
                            loading={loadingEmployees}
                            error={employeeError}
                        />

                        {/* ══════════════════════════════════════════════════════════
                            EMPLOYEE SEARCH MODAL (Specific filter)
                        ══════════════════════════════════════════════════════════ */}
                        <EmployeeSearchModal
                            isOpen={showSpecificEmpModal}
                            onClose={() => setShowSpecificEmpModal(false)}
                            onSelect={(empCode: string) => handleSpecificEmpSelect(empCode)}
                            employees={employeeData}
                            loading={loadingEmployees}
                            error={employeeError}
                        />

                        {/* ══════════════════════════════════════════════════════════
                            WORKSHIFT SEARCH MODAL
                        ══════════════════════════════════════════════════════════ */}
                        {showWorkshiftModal && (
                            <>
                                <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowWorkshiftModal(false)} />
                                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
                                        <div className="bg-gray-100 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between rounded-t-lg">
                                            <h2 className="text-gray-800 font-medium text-sm">Search – Workshift Code</h2>
                                            <button onClick={() => setShowWorkshiftModal(false)} className="text-gray-500 hover:text-gray-700">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="p-4 flex flex-col flex-1 overflow-hidden">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Search className="w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text" value={workshiftSearchTerm} autoFocus
                                                    onChange={e => setWorkshiftSearchTerm(e.target.value)}
                                                    placeholder="Search workshifts..."
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                            </div>
                                            {workshiftError && (
                                                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4" /> {workshiftError}
                                                </div>
                                            )}
                                            <div className="flex-1 overflow-y-auto border border-gray-200 rounded">
                                                <table className="w-full border-collapse text-sm">
                                                    <thead className="sticky top-0 bg-white">
                                                        <tr className="bg-gray-50 border-b-2 border-gray-200">
                                                            <th className="px-3 py-2 text-left text-gray-700">Code ▲</th>
                                                            <th className="px-3 py-2 text-left text-gray-700">Description</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {loadingWorkshifts ? (
                                                            <tr>
                                                                <td colSpan={2} className="px-4 py-6 text-center text-gray-500">
                                                                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />Loading...
                                                                </td>
                                                            </tr>
                                                        ) : filteredWorkshifts.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={2} className="px-4 py-6 text-center text-gray-500">No workshifts found</td>
                                                            </tr>
                                                        ) : (
                                                            filteredWorkshifts.map(ws => (
                                                                <tr
                                                                    key={ws.code}
                                                                    className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                                                                    onClick={() => handleWorkshiftSelect(ws.code)}
                                                                >
                                                                    <td className="px-3 py-2 font-mono font-medium">{ws.code}</td>
                                                                    <td className="px-3 py-2">{ws.description}</td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                    </div>{/* /Content Container */}
                </div>
            </div>
            <Footer />
        </div>
    );
}