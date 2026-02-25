import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, X, Check, Calendar, Edit, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { CalendarPopup } from '../CalendarPopup';
import { Footer } from '../Footer/Footer';
import apiClient from '../../services/apiClient';
import { EmployeeSearchModal } from '../Modals/EmployeeSearchModal';
import { TimePicker } from '../Modals/TimePickerModal';


// ─── Types ────────────────────────────────────────────────────────────────────

interface RawDataEntry {
    id: number;
    empCode: string;
    rawDateIn: string;
    workShiftCode: string;
    dayType: string;
    rawTimeIn: string;
    rawBreak1In: string;
    rawBreak1Out: string;
    rawBreak2In: string;
    rawBreak2Out: string;
    rawBreak3In: string;
    rawBreak3Out: string;
    rawTimeOut: string;
    rawDateOut: string;
    rawotApproved: boolean;
    rawRemarks: string;
    rawTardiness: boolean;
    rawUndertime: boolean;
    rawOT: boolean;
    rawNightDiff: boolean;
    rawOtherEarnings: boolean;
    rawUnproductive: boolean;
    rawDisplDateFrom: string;
    rawDisplDateTo: string;
    isSuspended: boolean;
    rawNoofDays: boolean;
    dayType2: string;
    actualDateIn2: string;
    actualTimeIn2: string;
    entryFlag: string;
    terminalID: string;
    dayTypeDOLE: string;
    aprOTTime: string;
    actualDateIn: string;
    deviceNameIn: string;
    deviceNameOut: string;
    isLateFiling: boolean;
    isLateFilingProcessed: boolean;
    bDeviceName: string;
    post_Tardy: boolean;
    post_UT: boolean;
    post_OT: boolean;
    post_Earn: boolean;
    post_ND: boolean;
    post_NoOfDays: boolean;
    otAppApprovalFlag: boolean;
    sdWorkShiftCodeFlag: boolean;
    flexiBreakFlag: boolean;
}

interface BorrowedDevice {
    id: number;
    code: string;
    description: string;
}

interface WorkShift {
    code: string;
    description: string;
}

interface EmployeeData {
    empCode: string;
    name: string;
    groupCode: string;
}

// ─── API Endpoints ─────────────────────────────────────────────────────────────

const RAW_DATA_BASE_URL = '/Maintenance/EmployeeRawData';
const DEVICE_BASE_URL = '/Fs/Process/Device/BorrowedDeviceName';
const WORKSHIFT_BASE_URL = '/Maintenance/WorkShift';
const EMPLOYEE_MASTER_URL = '/Maintenance/EmployeeMasterFile';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toISOSafe = (dateStr: string, timeStr: string = ''): string => {
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
                const period = match[3];
                if (period === 'PM' && hours !== 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0;
                return `${base}T${String(hours).padStart(2, '0')}:${mins}:00.000Z`;
            }
        }
        return `${base}T00:00:00.000Z`;
    } catch {
        return new Date().toISOString();
    }
};

const fromISO = (iso: string): { date: string; time: string } => {
    if (!iso) return { date: '', time: '' };
    try {
        const d = new Date(iso);
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        const year = d.getUTCFullYear();
        let hours = d.getUTCHours();
        const mins = String(d.getUTCMinutes()).padStart(2, '0');
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

const todayStr = () => {
    const d = new Date();
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function RawDataPage() {
    // ── Filter state ──
    const [dateFrom, setDateFrom] = useState(todayStr());
    const [dateTo, setDateTo] = useState(todayStr());
    const [incompleteLogs, setIncompleteLogs] = useState(true);
    const [displayMode, setDisplayMode] = useState<'all' | 'specific'>('all');
    const [showDateFromCalendar, setShowDateFromCalendar] = useState(false);
    const [showDateToCalendar, setShowDateToCalendar] = useState(false);

    // ── Table data ──
    const [rawDataList, setRawDataList] = useState<RawDataEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [tableError, setTableError] = useState('');

    // ── Sorting ──
    type SortKey = 'empCode' | 'workShiftCode' | 'rawDateIn' | 'rawTimeIn' | 'actualDateIn' | 'rawDateOut' | 'rawTimeOut' | 'dayType' | 'rawotApproved';
    const [sortKey, setSortKey] = useState<SortKey>('empCode');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    // ── Hide columns ──
    const [hideColumns, setHideColumns] = useState({
        break1Out: true, break1In: true,
        break2Out: false, break2In: false,
        break3Out: true, break3In: true,
        terminalId: false, secondDayType: false,
        remarks: false, entryFlag: false,
        isLateFiling: false, borrowedDeviceName: false,
        approvedOvertime: false, deviceName: false,
        selectAll: false,
    });

    // ── Modal state ──
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [formError, setFormError] = useState('');

    // ── Form fields ──
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

    // ── Calendar / TimePicker visibility ──
    const [showDateInCalendar, setShowDateInCalendar] = useState(false);
    const [showTimeInPicker, setShowTimeInPicker] = useState(false);
    const [showActualDateInCalendar, setShowActualDateInCalendar] = useState(false);
    const [showActualTimeInPicker, setShowActualTimeInPicker] = useState(false);
    const [showBreak1OutPicker, setShowBreak1OutPicker] = useState(false);
    const [showBreak1InPicker, setShowBreak1InPicker] = useState(false);
    const [showBreak2OutPicker, setShowBreak2OutPicker] = useState(false);
    const [showBreak2InPicker, setShowBreak2InPicker] = useState(false);
    const [showBreak3OutPicker, setShowBreak3OutPicker] = useState(false);
    const [showBreak3InPicker, setShowBreak3InPicker] = useState(false);
    const [showDateOutCalendar, setShowDateOutCalendar] = useState(false);
    const [showTimeOutPicker, setShowTimeOutPicker] = useState(false);

    // ── Employee search modal ──
    const [showEmpCodeModal, setShowEmpCodeModal] = useState(false);
    const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [employeeError, setEmployeeError] = useState('');

    // ── "Specific" mode – search by employee ──
    const [specificEmpCode, setSpecificEmpCode] = useState('');
    const [specificEmpName, setSpecificEmpName] = useState('');
    const [showSpecificEmpModal, setShowSpecificEmpModal] = useState(false);

    // ── Workshift search modal ──
    const [showWorkshiftModal, setShowWorkshiftModal] = useState(false);
    const [workshiftSearchTerm, setWorkshiftSearchTerm] = useState('');
    const [workshifts, setWorkshifts] = useState<WorkShift[]>([]);
    const [loadingWorkshifts, setLoadingWorkshifts] = useState(false);
    const [workshiftError, setWorkshiftError] = useState('');

    // ── Device search modal ──
    const [showDeviceModal, setShowDeviceModal] = useState(false);
    const [deviceSearchTerm, setDeviceSearchTerm] = useState('');
    const [devices, setDevices] = useState<BorrowedDevice[]>([]);
    const [loadingDevices, setLoadingDevices] = useState(false);
    const [deviceError, setDeviceError] = useState('');

    // ─────────────────────────────────────────────────────────────────────────
    // DATA FETCHING
    // ─────────────────────────────────────────────────────────────────────────

    const fetchRawData = useCallback(async () => {
        setLoading(true);
        setTableError('');
        try {
            const params: Record<string, string> = {
                dateFrom: toISOSafe(dateFrom),
                dateTo:   toISOSafe(dateTo),
            };
            if (displayMode === 'specific' && specificEmpCode) {
                params.empCode = specificEmpCode;
            }

            const response = await apiClient.get(RAW_DATA_BASE_URL, { params });
            if (response.status === 200 && response.data) {
                const list: RawDataEntry[] = Array.isArray(response.data) ? response.data : [];

                const fromMs = new Date(toISOSafe(dateFrom)).setUTCHours(0, 0, 0, 0);
                const toMs   = new Date(toISOSafe(dateTo)).setUTCHours(23, 59, 0, 0);

                const filtered = list.filter(entry => {
                    if (!entry.rawDateIn) return false;
                    const rawDateInMs = new Date(entry.rawDateIn).getTime();
                    if (rawDateInMs < fromMs || rawDateInMs > toMs) return false;

                    const hasDateOut = !!entry.rawDateOut && entry.rawDateOut.trim() !== '';
                    const hasTimeIn  = !!entry.rawTimeIn;
                    const hasTimeOut = !!entry.rawTimeOut;
                    const isComplete = hasDateOut && hasTimeIn && hasTimeOut;

                    return incompleteLogs ? !isComplete : isComplete;
                });

                setRawDataList(filtered);
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message || 'Failed to load raw data';
            setTableError(msg);
            console.error('Error fetching raw data:', error);
        } finally {
            setLoading(false);
        }
    }, [dateFrom, dateTo, incompleteLogs, displayMode, specificEmpCode]);

    const fetchDevices = useCallback(async () => {
        setLoadingDevices(true);
        setDeviceError('');
        try {
            const response = await apiClient.get(DEVICE_BASE_URL);
            if (response.status === 200 && response.data) {
                setDevices(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message || 'Failed to load devices';
            setDeviceError(msg);
            console.error('Error fetching devices:', error);
        } finally {
            setLoadingDevices(false);
        }
    }, []);

    const fetchWorkshifts = useCallback(async () => {
        setLoadingWorkshifts(true);
        setWorkshiftError('');
        try {
            const response = await apiClient.get(WORKSHIFT_BASE_URL);
            if (response.status === 200 && response.data) {
                const data = Array.isArray(response.data) ? response.data : [];
                setWorkshifts(data.map((w: any) => ({
                    code: w.code || w.workShiftCode || w.workshiftCode || '',
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

    const fetchEmployeeData = async () => {
        setLoadingEmployees(true);
        setEmployeeError('');
        try {
            const response = await apiClient.get(EMPLOYEE_MASTER_URL);
            if (response.status === 200 && response.data) {
                const mappedData = response.data.map((emp: any) => ({
                    empCode: emp.empCode || emp.code || '',
                    name: `${emp.lName || ''}, ${emp.fName || ''} ${emp.mName || ''}`.trim(),
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

    // ─────────────────────────────────────────────────────────────────────────
    // CRUD
    // ─────────────────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        if (!empCode.trim()) {
            setFormError('Please select an Employee Code.');
            return;
        }
        if (!dateIn.trim()) {
            setFormError('Date In is required.');
            return;
        }
        setFormError('');
        setSubmitLoading(true);

        const payload: Omit<RawDataEntry, 'id'> & { id?: number } = {
            empCode,
            workShiftCode: workshiftCode,
            dayType: 'Regular',
            rawDateIn: toISOSafe(dateIn),
            rawTimeIn: toISOSafe(dateIn, timeIn),
            actualDateIn: toISOSafe(actualDateIn || dateIn),
            actualTimeIn2: toISOSafe(actualDateIn || dateIn, actualTimeIn),
            rawBreak1Out: toISOSafe(dateIn, break1Out),
            rawBreak1In: toISOSafe(dateIn, break1In),
            rawBreak2Out: toISOSafe(dateIn, break2Out),
            rawBreak2In: toISOSafe(dateIn, break2In),
            rawBreak3Out: toISOSafe(dateIn, break3Out),
            rawBreak3In: toISOSafe(dateIn, break3In),
            rawDateOut: toISOSafe(dateOut || dateIn),
            rawTimeOut: toISOSafe(dateOut || dateIn, timeOut),
            rawotApproved: otApproved,
            rawRemarks: remarks,
            isLateFiling,
            bDeviceName: borrowedDeviceName,
            rawTardiness: false, rawUndertime: false, rawOT: false,
            rawNightDiff: false, rawOtherEarnings: false, rawUnproductive: false,
            rawDisplDateFrom: toISOSafe(dateFrom),
            rawDisplDateTo: toISOSafe(dateTo),
            isSuspended: false, rawNoofDays: false,
            dayType2: '', actualDateIn2: '', entryFlag: '',
            terminalID: '', dayTypeDOLE: '',
            aprOTTime: '', deviceNameIn: '', deviceNameOut: '',
            isLateFilingProcessed: false,
            post_Tardy: false, post_UT: false, post_OT: false,
            post_Earn: false, post_ND: false, post_NoOfDays: false,
            otAppApprovalFlag: false, sdWorkShiftCodeFlag: false, flexiBreakFlag: false,
        };

        try {
            if (editingId !== null) {
                await apiClient.put(`${RAW_DATA_BASE_URL}/${editingId}`, { ...payload, id: editingId });
            } else {
                await apiClient.post(RAW_DATA_BASE_URL, payload);
            }
            setShowCreateModal(false);
            setEditingId(null);
            await fetchRawData();
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message || 'Failed to save entry';
            setFormError(msg);
            console.error('Error saving raw data:', error);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEdit = (entry: RawDataEntry) => {
        setEditingId(entry.id);
        setEmpCode(entry.empCode);
        setWorkshiftCode(entry.workShiftCode);

        const di = fromISO(entry.rawDateIn);
        const ti = fromISO(entry.rawTimeIn);
        const adi = fromISO(entry.actualDateIn);
        const ati = fromISO(entry.actualTimeIn2);
        const b1o = fromISO(entry.rawBreak1Out);
        const b1i = fromISO(entry.rawBreak1In);
        const b2o = fromISO(entry.rawBreak2Out);
        const b2i = fromISO(entry.rawBreak2In);
        const b3o = fromISO(entry.rawBreak3Out);
        const b3i = fromISO(entry.rawBreak3In);
        const doDate = fromISO(entry.rawDateOut);
        const toTime = fromISO(entry.rawTimeOut);

        setDateIn(di.date);
        setTimeIn(ti.time);
        setActualDateIn(adi.date);
        setActualTimeIn(ati.time);
        setBreak1Out(b1o.time);
        setBreak1In(b1i.time);
        setBreak2Out(b2o.time);
        setBreak2In(b2i.time);
        setBreak3Out(b3o.time);
        setBreak3In(b3i.time);
        setDateOut(doDate.date);
        setTimeOut(toTime.time);
        setOtApproved(entry.rawotApproved);
        setIsLateFiling(entry.isLateFiling);
        setRemarks(entry.rawRemarks);
        setBorrowedDeviceName(entry.bDeviceName);
        setFormError('');
        setShowCreateModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this entry?')) return;
        try {
            await apiClient.delete(`${RAW_DATA_BASE_URL}/${id}`);
            setRawDataList(prev => prev.filter(e => e.id !== id));
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message || 'Failed to delete entry';
            alert(msg);
            console.error('Error deleting raw data:', error);
        }
    };

    const handleCreateNew = () => {
        setEditingId(null);
        setEmpCode(''); setEmpName(''); setWorkshiftCode('');
        setDateIn(''); setTimeIn(''); setActualDateIn(''); setActualTimeIn('');
        setBreak1Out(''); setBreak1In('');
        setBreak2Out(''); setBreak2In('');
        setBreak3Out(''); setBreak3In('');
        setDateOut(''); setTimeOut('');
        setOtApproved(false); setIsLateFiling(false);
        setRemarks(''); setBorrowedDeviceName('');
        setFormError('');
        setShowCreateModal(true);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // SEARCH HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    const handleEmpCodeSelect = (code: string, name: string) => {
        setEmpCode(code);
        setEmpName(name);
        setShowEmpCodeModal(false);
    };

    const handleSpecificEmpSelect = (code: string, name: string) => {
        setSpecificEmpCode(code);
        setSpecificEmpName(name);
        setShowSpecificEmpModal(false);
    };

    const handleWorkshiftSelect = (code: string) => {
        setWorkshiftCode(code);
        setShowWorkshiftModal(false);
    };

    const handleDeviceSelect = (desc: string) => {
        setBorrowedDeviceName(desc);
        setShowDeviceModal(false);
    };

    const filteredWorkshifts = workshifts.filter(ws =>
        ws.code.toLowerCase().includes(workshiftSearchTerm.toLowerCase()) ||
        ws.description.toLowerCase().includes(workshiftSearchTerm.toLowerCase())
    );

    const filteredDevices = devices.filter(d =>
        d.code.toLowerCase().includes(deviceSearchTerm.toLowerCase()) ||
        d.description.toLowerCase().includes(deviceSearchTerm.toLowerCase())
    );

    // ─────────────────────────────────────────────────────────────────────────
    // COLUMN TOGGLE
    // ─────────────────────────────────────────────────────────────────────────

    const handleHideColumnChange = (column: string) => {
        setHideColumns(prev => ({ ...prev, [column]: !prev[column as keyof typeof prev] }));
    };

    const handleSelectAllChange = () => {
        const val = !hideColumns.selectAll;
        setHideColumns({
            break1Out: val, break1In: val, break2Out: val, break2In: val,
            break3Out: val, break3In: val, terminalId: val, secondDayType: val,
            remarks: val, entryFlag: val, isLateFiling: val, borrowedDeviceName: val,
            approvedOvertime: val, deviceName: val, selectAll: val,
        });
    };

    // ─────────────────────────────────────────────────────────────────────────
    // EFFECTS
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        fetchEmployeeData();
    }, []);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            if (showEmpCodeModal)       { setShowEmpCodeModal(false);       return; }
            if (showSpecificEmpModal)   { setShowSpecificEmpModal(false);   return; }
            if (showWorkshiftModal)     { setShowWorkshiftModal(false);     return; }
            if (showDeviceModal)        { setShowDeviceModal(false);        return; }
            if (showCreateModal)        { setShowCreateModal(false);        return; }
            setShowDateFromCalendar(false);
            setShowDateToCalendar(false);
            setShowDateInCalendar(false);
            setShowTimeInPicker(false);
            setShowActualDateInCalendar(false);
            setShowActualTimeInPicker(false);
            setShowBreak1OutPicker(false);
            setShowBreak1InPicker(false);
            setShowBreak2OutPicker(false);
            setShowBreak2InPicker(false);
            setShowBreak3OutPicker(false);
            setShowBreak3InPicker(false);
            setShowDateOutCalendar(false);
            setShowTimeOutPicker(false);
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [showEmpCodeModal, showSpecificEmpModal, showWorkshiftModal, showDeviceModal, showCreateModal]);

    useEffect(() => {
        if (showWorkshiftModal && workshifts.length === 0) fetchWorkshifts();
    }, [showWorkshiftModal, workshifts.length, fetchWorkshifts]);

    useEffect(() => {
        if (showDeviceModal) fetchDevices();
    }, [showDeviceModal, fetchDevices]);

    // ─────────────────────────────────────────────────────────────────────────
    // TIME INPUT HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    const timeChangeHandler = (setter: (v: string) => void) =>
        (e: React.ChangeEvent<HTMLInputElement>) => setter(e.target.value);

    const timeBlurHandler = (val: string, setter: (v: string) => void) =>
        () => setter(validateTimeFormat(val));

    // ── SortIcon helper ──
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

    // ── Derived sorted + filtered list ──
    const filteredByEmp = displayMode === 'specific' && specificEmpCode
        ? rawDataList.filter(e => e.empCode === specificEmpCode)
        : rawDataList;

    const sortedList = [...filteredByEmp].sort((a, b) => {
        let aVal: string | number | boolean = '';
        let bVal: string | number | boolean = '';

        if (sortKey === 'rawotApproved') {
            aVal = a.rawotApproved ? 1 : 0;
            bVal = b.rawotApproved ? 1 : 0;
        } else if (['rawDateIn', 'rawTimeIn', 'actualDateIn', 'rawDateOut', 'rawTimeOut'].includes(sortKey)) {
            aVal = a[sortKey] ? new Date(a[sortKey]).getTime() : 0;
            bVal = b[sortKey] ? new Date(b[sortKey]).getTime() : 0;
        } else {
            aVal = (a[sortKey as keyof RawDataEntry] as string) ?? '';
            bVal = (b[sortKey as keyof RawDataEntry] as string) ?? '';
        }

        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    const renderDateWithCalendar = (
        label: string,
        val: string,
        setter: (v: string) => void,
        showCalendar: boolean,
        setShowCalendar: (v: boolean) => void
    ) => (
        <div className="flex items-center gap-2">
            <label className="text-gray-700 text-sm whitespace-nowrap">{label} :</label>
            <div className="relative">
                <input
                    type="text"
                    value={val}
                    onChange={e => setter(e.target.value)}
                    placeholder="MM/DD/YYYY"
                    className="w-36 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-9"
                />
                <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    <Calendar className="w-3.5 h-3.5" />
                </button>
                {showCalendar && (
                    <CalendarPopup
                        onDateSelect={date => { setter(date); setShowCalendar(false); }}
                        onClose={() => setShowCalendar(false)}
                    />
                )}
            </div>
        </div>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // JSX
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <div className="flex-1">
                <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">

                    {/* Page Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
                        <h1 className="text-white text-xl font-semibold">Raw Data</h1>
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
                                        Manage and view employee raw time data including clock in/out times, breaks, and overtime approvals.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        {['Employee time tracking', 'Break time management', 'Overtime approval tracking', 'Workshift assignment'].map(item => (
                                            <div key={item} className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                <span className="text-gray-600">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Controls */}
                        <div className="flex flex-wrap items-center gap-4 mb-6">
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
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                                />
                                <span className="text-gray-700">Incomplete Logs</span>
                            </label>
                            <div className="flex items-center gap-4">
                                {(['all', 'specific'] as const).map(mode => (
                                    <label key={mode} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={displayMode === mode}
                                            onChange={() => {
                                                setDisplayMode(mode);
                                                if (mode === 'all') {
                                                    setSpecificEmpCode('');
                                                    setSpecificEmpName('');
                                                }
                                            }}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="text-gray-700 capitalize">{mode}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Specific Employee Picker */}
                        {displayMode === 'specific' && (
                            <div className="flex flex-wrap items-center gap-3 mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <span className="text-sm font-medium text-blue-700 whitespace-nowrap">Employee:</span>
                                <input
                                    type="text"
                                    value={specificEmpCode}
                                    readOnly
                                    placeholder="Select employee..."
                                    className="w-32 px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                                />
                                <input
                                    type="text"
                                    value={specificEmpName}
                                    readOnly
                                    placeholder="Employee name"
                                    className="flex-1 min-w-[160px] px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                                />
                                <button
                                    onClick={() => setShowSpecificEmpModal(true)}
                                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 text-sm"
                                >
                                    <Search className="w-3.5 h-3.5" />
                                    Browse
                                </button>
                                {specificEmpCode && (
                                    <button
                                        onClick={() => { setSpecificEmpCode(''); setSpecificEmpName(''); }}
                                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1 text-sm"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        Clear
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Date Filter */}
                        <div className="flex flex-wrap items-center gap-4 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                            {renderDateWithCalendar('Date From', dateFrom, setDateFrom, showDateFromCalendar, setShowDateFromCalendar)}
                            {renderDateWithCalendar('Date To', dateTo, setDateTo, showDateToCalendar, setShowDateToCalendar)}
                            <button
                                onClick={fetchRawData}
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

                        {/* Hide Columns */}
                        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-gray-700 font-medium mb-4">Hide Column</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
                                {[
                                    { key: 'break1Out', label: 'Break 1 Out' },
                                    { key: 'break1In', label: 'Break 1 In' },
                                    { key: 'break2Out', label: 'Break 2 Out' },
                                    { key: 'break2In', label: 'Break 2 In' },
                                    { key: 'break3Out', label: 'Break 3 Out' },
                                    { key: 'break3In', label: 'Break 3 In' },
                                    { key: 'remarks', label: 'Remarks' },
                                    { key: 'entryFlag', label: 'Entry Flag' },
                                    { key: 'terminalId', label: 'TerminalID' },
                                    { key: 'secondDayType', label: '2nd Day Type' },
                                    { key: 'approvedOvertime', label: 'Approved Overtime' },
                                    { key: 'deviceName', label: 'Device Name' },
                                    { key: 'isLateFiling', label: 'Is Late Filing' },
                                    { key: 'borrowedDeviceName', label: 'BDevice Name' },
                                ].map(col => (
                                    <label key={col.key} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={hideColumns[col.key as keyof typeof hideColumns]}
                                            onChange={() => handleHideColumnChange(col.key)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                                        />
                                        <span className="text-gray-700 text-sm">{col.label}</span>
                                    </label>
                                ))}
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={hideColumns.selectAll}
                                        onChange={handleSelectAllChange}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                                    />
                                    <span className="text-gray-700 text-sm font-medium">Select All</span>
                                </label>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                                        <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">Actions</th>
                                        {([
                                            { key: 'empCode',      label: 'Emp Code' },
                                            { key: 'workShiftCode',label: 'Workshift' },
                                            { key: 'rawDateIn',    label: 'Date-In' },
                                            { key: 'rawTimeIn',    label: 'Time-In' },
                                            { key: 'actualDateIn', label: 'Actual Date/Time In' },
                                        ] as { key: SortKey; label: string }[]).map(({ key, label }) => (
                                            <th key={key} onClick={() => handleSort(key)}
                                                className="px-4 py-2 text-left text-gray-700 whitespace-nowrap cursor-pointer select-none hover:bg-gray-200 transition-colors">
                                                {label}<SortIcon col={key} />
                                            </th>
                                        ))}
                                        {!hideColumns.break1Out && <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">Break1-Out</th>}
                                        {!hideColumns.break1In && <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">Break1-In</th>}
                                        {!hideColumns.break2Out && <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">Break2-Out</th>}
                                        {!hideColumns.break2In && <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">Break2-In</th>}
                                        {!hideColumns.break3Out && <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">Break3-Out</th>}
                                        {!hideColumns.break3In && <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">Break3-In</th>}
                                        {([
                                            { key: 'rawDateOut',    label: 'Date-Out' },
                                            { key: 'rawTimeOut',    label: 'Time-Out' },
                                            { key: 'dayType',       label: 'Day Type' },
                                            { key: 'rawotApproved', label: 'OT Approved' },
                                        ] as { key: SortKey; label: string }[]).map(({ key, label }) => (
                                            <th key={key} onClick={() => handleSort(key)}
                                                className="px-4 py-2 text-left text-gray-700 whitespace-nowrap cursor-pointer select-none hover:bg-gray-200 transition-colors">
                                                {label}<SortIcon col={key} />
                                            </th>
                                        ))}
                                        {!hideColumns.remarks && <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">Remarks</th>}
                                        {!hideColumns.entryFlag && <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">Entry Flag</th>}
                                        {!hideColumns.terminalId && <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">Terminal ID</th>}
                                        {!hideColumns.secondDayType && <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">2nd Day Type</th>}
                                        {!hideColumns.approvedOvertime && <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">Approved OT</th>}
                                        {!hideColumns.deviceName && <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">Device In/Out</th>}
                                        {!hideColumns.isLateFiling && <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">Late Filing</th>}
                                        {!hideColumns.borrowedDeviceName && <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">BDevice</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={25} className="px-6 py-12 text-center">
                                                <div className="flex items-center justify-center gap-2 text-gray-500">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Loading data...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : sortedList.length === 0 ? (
                                        <tr>
                                            <td colSpan={25} className="px-6 py-8 text-center text-gray-500">
                                                No data available. Use the Search button to load records.
                                            </td>
                                        </tr>
                                    ) : (
                                        sortedList.map(entry => {
                                            const di = fromISO(entry.rawDateIn);
                                            const ti = fromISO(entry.rawTimeIn);
                                            const adi = fromISO(entry.actualDateIn);
                                            const ati = fromISO(entry.actualTimeIn2);
                                            const b1o = fromISO(entry.rawBreak1Out);
                                            const b1i = fromISO(entry.rawBreak1In);
                                            const b2o = fromISO(entry.rawBreak2Out);
                                            const b2i = fromISO(entry.rawBreak2In);
                                            const b3o = fromISO(entry.rawBreak3Out);
                                            const b3i = fromISO(entry.rawBreak3In);
                                            const doDate = fromISO(entry.rawDateOut);
                                            const toTime = fromISO(entry.rawTimeOut);
                                            const apOT = fromISO(entry.aprOTTime);
                                            return (
                                                <tr key={entry.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        <div className="flex gap-1">
                                                            <button onClick={() => handleEdit(entry)} className="p-1 text-blue-600 hover:bg-blue-100 rounded" title="Edit">
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDelete(entry.id)} className="p-1 text-red-600 hover:bg-red-100 rounded" title="Delete">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap">{entry.empCode}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap">{entry.workShiftCode}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap">{di.date}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap">{ti.time}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap">{adi.date} {ati.time}</td>
                                                    {!hideColumns.break1Out && <td className="px-4 py-2 whitespace-nowrap">{b1o.time}</td>}
                                                    {!hideColumns.break1In && <td className="px-4 py-2 whitespace-nowrap">{b1i.time}</td>}
                                                    {!hideColumns.break2Out && <td className="px-4 py-2 whitespace-nowrap">{b2o.time}</td>}
                                                    {!hideColumns.break2In && <td className="px-4 py-2 whitespace-nowrap">{b2i.time}</td>}
                                                    {!hideColumns.break3Out && <td className="px-4 py-2 whitespace-nowrap">{b3o.time}</td>}
                                                    {!hideColumns.break3In && <td className="px-4 py-2 whitespace-nowrap">{b3i.time}</td>}
                                                    <td className="px-4 py-2 whitespace-nowrap">{doDate.date}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap">{toTime.time}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap">{entry.dayType}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap">{entry.rawotApproved ? 'Yes' : 'No'}</td>
                                                    {!hideColumns.remarks && <td className="px-4 py-2 text-sm max-w-xs truncate">{entry.rawRemarks}</td>}
                                                    {!hideColumns.entryFlag && <td className="px-4 py-2 whitespace-nowrap">{entry.entryFlag}</td>}
                                                    {!hideColumns.terminalId && <td className="px-4 py-2 whitespace-nowrap">{entry.terminalID}</td>}
                                                    {!hideColumns.secondDayType && <td className="px-4 py-2 whitespace-nowrap">{entry.dayType2}</td>}
                                                    {!hideColumns.approvedOvertime && <td className="px-4 py-2 whitespace-nowrap">{apOT.time}</td>}
                                                    {!hideColumns.deviceName && <td className="px-4 py-2 whitespace-nowrap text-xs">{entry.deviceNameIn}/{entry.deviceNameOut}</td>}
                                                    {!hideColumns.isLateFiling && <td className="px-4 py-2 whitespace-nowrap">{entry.isLateFiling ? 'Yes' : 'No'}</td>}
                                                    {!hideColumns.borrowedDeviceName && <td className="px-4 py-2 whitespace-nowrap">{entry.bDeviceName}</td>}
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination info */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-gray-600 text-sm">
                                {rawDataList.length > 0 ? `Showing 1 to ${rawDataList.length} of ${rawDataList.length} entries` : 'No entries'}
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
                                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                                        {/* Modal Header */}
                                        <div className="sticky top-0 bg-white px-5 py-3 border-b border-gray-200 flex items-center justify-between z-10">
                                            <h2 className="text-gray-800 font-semibold">
                                                {editingId !== null ? 'Edit Entry' : 'Create New Entry'}
                                            </h2>
                                            <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="p-5 space-y-3">
                                            <h3 className="text-blue-600 font-medium">Raw Data</h3>

                                            {/* Form Error */}
                                            {formError && (
                                                <div className="p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-700 text-sm">
                                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                    {formError}
                                                </div>
                                            )}

                                            {/* ── Emp Code ── */}
                                            <div className="flex items-center gap-3">
                                                <label className="w-44 text-gray-700 text-sm flex-shrink-0">Emp Code :</label>
                                                <input
                                                    type="text" value={empCode} readOnly
                                                    placeholder="Select employee..."
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm bg-gray-50"
                                                />
                                                <button
                                                    onClick={() => setShowEmpCodeModal(true)}
                                                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-shrink-0"
                                                >
                                                    <Search className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* ── Workshift Code ── */}
                                            <div className="flex items-center gap-3">
                                                <label className="w-44 text-gray-700 text-sm flex-shrink-0">Workshift Code :</label>
                                                <input
                                                    type="text" value={workshiftCode} readOnly
                                                    placeholder="Select workshift..."
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm bg-gray-50"
                                                />
                                                <button
                                                    onClick={() => { setWorkshiftSearchTerm(''); setShowWorkshiftModal(true); }}
                                                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-shrink-0"
                                                >
                                                    <Search className="w-4 h-4" />
                                                </button>
                                                <button className="px-4 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm flex-shrink-0">
                                                    Get Shift
                                                </button>
                                            </div>

                                            {/* ── Date In / Time In ── */}
                                            <div className="flex items-center gap-3">
                                                <label className="w-44 text-gray-700 text-sm flex-shrink-0">Date In :</label>
                                                <div className="relative">
                                                    <input
                                                        type="text" value={dateIn} onChange={e => setDateIn(e.target.value)}
                                                        placeholder="MM/DD/YYYY"
                                                        className="w-36 px-3 py-1.5 border border-gray-300 rounded text-sm pr-9"
                                                    />
                                                    <button
                                                        type="button" onClick={() => setShowDateInCalendar(!showDateInCalendar)}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                    >
                                                        <Calendar className="w-3.5 h-3.5" />
                                                    </button>
                                                    {showDateInCalendar && (
                                                        <CalendarPopup
                                                            onDateSelect={d => { setDateIn(d); setShowDateInCalendar(false); }}
                                                            onClose={() => setShowDateInCalendar(false)}
                                                        />
                                                    )}
                                                </div>
                                                <label className="text-gray-700 text-sm whitespace-nowrap">Time In :</label>
                                                <div className="relative flex-1">
                                                    <input
                                                        type="text" value={timeIn}
                                                        onChange={timeChangeHandler(setTimeIn)}
                                                        onBlur={timeBlurHandler(timeIn, setTimeIn)}
                                                        placeholder="HH:MM AM/PM"
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        type="button" onClick={() => setShowTimeInPicker(!showTimeInPicker)}
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

                                            {/* ── Actual Date In / Actual Time In ── */}
                                            <div className="flex items-center gap-3">
                                                <label className="w-44 text-gray-700 text-sm flex-shrink-0">Actual Date In :</label>
                                                <div className="relative">
                                                    <input
                                                        type="text" value={actualDateIn} onChange={e => setActualDateIn(e.target.value)}
                                                        placeholder="MM/DD/YYYY"
                                                        className="w-36 px-3 py-1.5 border border-gray-300 rounded text-sm pr-9"
                                                    />
                                                    <button
                                                        type="button" onClick={() => setShowActualDateInCalendar(!showActualDateInCalendar)}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                    >
                                                        <Calendar className="w-3.5 h-3.5" />
                                                    </button>
                                                    {showActualDateInCalendar && (
                                                        <CalendarPopup
                                                            onDateSelect={d => { setActualDateIn(d); setShowActualDateInCalendar(false); }}
                                                            onClose={() => setShowActualDateInCalendar(false)}
                                                        />
                                                    )}
                                                </div>
                                                <label className="text-gray-700 text-sm whitespace-nowrap">Actual Time In :</label>
                                                <div className="relative flex-1">
                                                    <input
                                                        type="text" value={actualTimeIn}
                                                        onChange={timeChangeHandler(setActualTimeIn)}
                                                        onBlur={timeBlurHandler(actualTimeIn, setActualTimeIn)}
                                                        placeholder="HH:MM AM/PM"
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        type="button" onClick={() => setShowActualTimeInPicker(!showActualTimeInPicker)}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                    >
                                                        <Calendar className="w-3.5 h-3.5" />
                                                    </button>
                                                    {showActualTimeInPicker && (
                                                        <TimePicker
                                                            initialTime={actualTimeIn}
                                                            onTimeSelect={time => { setActualTimeIn(time); setShowActualTimeInPicker(false); }}
                                                            onClose={() => setShowActualTimeInPicker(false)}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* ── Break 1 ── */}
                                            <div className="flex items-center gap-3">
                                                <label className="w-44 text-gray-700 text-sm flex-shrink-0">Break 1 Out :</label>
                                                <div className="relative w-32">
                                                    <input
                                                        type="text" value={break1Out}
                                                        onChange={timeChangeHandler(setBreak1Out)}
                                                        onBlur={timeBlurHandler(break1Out, setBreak1Out)}
                                                        placeholder="HH:MM AM/PM"
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        type="button" onClick={() => setShowBreak1OutPicker(!showBreak1OutPicker)}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                    >
                                                        <Calendar className="w-3.5 h-3.5" />
                                                    </button>
                                                    {showBreak1OutPicker && (
                                                        <TimePicker
                                                            initialTime={break1Out}
                                                            onTimeSelect={time => { setBreak1Out(time); setShowBreak1OutPicker(false); }}
                                                            onClose={() => setShowBreak1OutPicker(false)}
                                                        />
                                                    )}
                                                </div>
                                                <label className="text-gray-700 text-sm whitespace-nowrap">Break 1 In :</label>
                                                <div className="relative flex-1">
                                                    <input
                                                        type="text" value={break1In}
                                                        onChange={timeChangeHandler(setBreak1In)}
                                                        onBlur={timeBlurHandler(break1In, setBreak1In)}
                                                        placeholder="HH:MM AM/PM"
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        type="button" onClick={() => setShowBreak1InPicker(!showBreak1InPicker)}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                    >
                                                        <Calendar className="w-3.5 h-3.5" />
                                                    </button>
                                                    {showBreak1InPicker && (
                                                        <TimePicker
                                                            initialTime={break1In}
                                                            onTimeSelect={time => { setBreak1In(time); setShowBreak1InPicker(false); }}
                                                            onClose={() => setShowBreak1InPicker(false)}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* ── Break 2 ── */}
                                            <div className="flex items-center gap-3">
                                                <label className="w-44 text-gray-700 text-sm flex-shrink-0">Break 2 Out :</label>
                                                <div className="relative w-32">
                                                    <input
                                                        type="text" value={break2Out}
                                                        onChange={timeChangeHandler(setBreak2Out)}
                                                        onBlur={timeBlurHandler(break2Out, setBreak2Out)}
                                                        placeholder="HH:MM AM/PM"
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        type="button" onClick={() => setShowBreak2OutPicker(!showBreak2OutPicker)}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                    >
                                                        <Calendar className="w-3.5 h-3.5" />
                                                    </button>
                                                    {showBreak2OutPicker && (
                                                        <TimePicker
                                                            initialTime={break2Out}
                                                            onTimeSelect={time => { setBreak2Out(time); setShowBreak2OutPicker(false); }}
                                                            onClose={() => setShowBreak2OutPicker(false)}
                                                        />
                                                    )}
                                                </div>
                                                <label className="text-gray-700 text-sm whitespace-nowrap">Break 2 In :</label>
                                                <div className="relative flex-1">
                                                    <input
                                                        type="text" value={break2In}
                                                        onChange={timeChangeHandler(setBreak2In)}
                                                        onBlur={timeBlurHandler(break2In, setBreak2In)}
                                                        placeholder="HH:MM AM/PM"
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        type="button" onClick={() => setShowBreak2InPicker(!showBreak2InPicker)}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                    >
                                                        <Calendar className="w-3.5 h-3.5" />
                                                    </button>
                                                    {showBreak2InPicker && (
                                                        <TimePicker
                                                            initialTime={break2In}
                                                            onTimeSelect={time => { setBreak2In(time); setShowBreak2InPicker(false); }}
                                                            onClose={() => setShowBreak2InPicker(false)}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* ── Break 3 ── */}
                                            <div className="flex items-center gap-3">
                                                <label className="w-44 text-gray-700 text-sm flex-shrink-0">Break 3 Out :</label>
                                                <div className="relative w-32">
                                                    <input
                                                        type="text" value={break3Out}
                                                        onChange={timeChangeHandler(setBreak3Out)}
                                                        onBlur={timeBlurHandler(break3Out, setBreak3Out)}
                                                        placeholder="HH:MM AM/PM"
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        type="button" onClick={() => setShowBreak3OutPicker(!showBreak3OutPicker)}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                    >
                                                        <Calendar className="w-3.5 h-3.5" />
                                                    </button>
                                                    {showBreak3OutPicker && (
                                                        <TimePicker
                                                            initialTime={break3Out}
                                                            onTimeSelect={time => { setBreak3Out(time); setShowBreak3OutPicker(false); }}
                                                            onClose={() => setShowBreak3OutPicker(false)}
                                                        />
                                                    )}
                                                </div>
                                                <label className="text-gray-700 text-sm whitespace-nowrap">Break 3 In :</label>
                                                <div className="relative flex-1">
                                                    <input
                                                        type="text" value={break3In}
                                                        onChange={timeChangeHandler(setBreak3In)}
                                                        onBlur={timeBlurHandler(break3In, setBreak3In)}
                                                        placeholder="HH:MM AM/PM"
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        type="button" onClick={() => setShowBreak3InPicker(!showBreak3InPicker)}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                    >
                                                        <Calendar className="w-3.5 h-3.5" />
                                                    </button>
                                                    {showBreak3InPicker && (
                                                        <TimePicker
                                                            initialTime={break3In}
                                                            onTimeSelect={time => { setBreak3In(time); setShowBreak3InPicker(false); }}
                                                            onClose={() => setShowBreak3InPicker(false)}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* ── Date Out / Time Out ── */}
                                            <div className="flex items-center gap-3">
                                                <label className="w-44 text-gray-700 text-sm flex-shrink-0">Date Out :</label>
                                                <div className="relative">
                                                    <input
                                                        type="text" value={dateOut} onChange={e => setDateOut(e.target.value)}
                                                        placeholder="MM/DD/YYYY"
                                                        className="w-36 px-3 py-1.5 border border-gray-300 rounded text-sm pr-9"
                                                    />
                                                    <button
                                                        type="button" onClick={() => setShowDateOutCalendar(!showDateOutCalendar)}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                    >
                                                        <Calendar className="w-3.5 h-3.5" />
                                                    </button>
                                                    {showDateOutCalendar && (
                                                        <CalendarPopup
                                                            onDateSelect={d => { setDateOut(d); setShowDateOutCalendar(false); }}
                                                            onClose={() => setShowDateOutCalendar(false)}
                                                        />
                                                    )}
                                                </div>
                                                <label className="text-gray-700 text-sm whitespace-nowrap">Time Out :</label>
                                                <div className="relative flex-1">
                                                    <input
                                                        type="text" value={timeOut}
                                                        onChange={timeChangeHandler(setTimeOut)}
                                                        onBlur={timeBlurHandler(timeOut, setTimeOut)}
                                                        placeholder="HH:MM AM/PM"
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        type="button" onClick={() => setShowTimeOutPicker(!showTimeOutPicker)}
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

                                            {/* ── OT Approved ── */}
                                            <div className="flex items-center gap-3">
                                                <label className="w-44 text-gray-700 text-sm flex-shrink-0">OT Approved :</label>
                                                <input
                                                    type="checkbox" checked={otApproved}
                                                    onChange={e => setOtApproved(e.target.checked)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                                                />
                                            </div>

                                            {/* ── Is Late Filing ── */}
                                            <div className="flex items-center gap-3">
                                                <label className="w-44 text-gray-700 text-sm flex-shrink-0">Is Late Filing :</label>
                                                <input
                                                    type="checkbox" checked={isLateFiling}
                                                    onChange={e => setIsLateFiling(e.target.checked)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                                                />
                                            </div>

                                            {/* ── Remarks ── */}
                                            <div className="flex items-start gap-3">
                                                <label className="w-44 text-gray-700 text-sm flex-shrink-0 pt-1">Remarks :</label>
                                                <textarea
                                                    value={remarks} onChange={e => setRemarks(e.target.value)}
                                                    rows={3}
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                                                />
                                            </div>

                                            {/* ── Borrowed Device ── */}
                                            <div className="flex items-center gap-3">
                                                <label className="w-44 text-gray-700 text-sm flex-shrink-0">Borrowed Device :</label>
                                                <input
                                                    type="text" value={borrowedDeviceName} readOnly
                                                    placeholder="Select device..."
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm bg-gray-50"
                                                />
                                                <button
                                                    onClick={() => { setDeviceSearchTerm(''); setShowDeviceModal(true); }}
                                                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex-shrink-0"
                                                >
                                                    <Search className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setBorrowedDeviceName('')}
                                                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex-shrink-0"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
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

                        {/* ── Employee Search Modal (Create/Edit form) ── */}
                        <EmployeeSearchModal
                            isOpen={showEmpCodeModal}
                            onClose={() => setShowEmpCodeModal(false)}
                            onSelect={(empCode: string) => {
                                const found = employeeData.find(e => e.empCode === empCode);
                                handleEmpCodeSelect(empCode, found?.name ?? '');
                            }}
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

                        {/* ══════════════════════════════════════════════════════════
                            BORROWED DEVICE SEARCH MODAL
                        ══════════════════════════════════════════════════════════ */}
                        {showDeviceModal && (
                            <>
                                <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowDeviceModal(false)} />
                                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
                                        <div className="bg-gray-100 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between rounded-t-lg">
                                            <h2 className="text-gray-800 font-medium text-sm">Search – Borrowed Device Name</h2>
                                            <button onClick={() => setShowDeviceModal(false)} className="text-gray-500 hover:text-gray-700">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="p-4 flex flex-col flex-1 overflow-hidden">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Search className="w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text" value={deviceSearchTerm} autoFocus
                                                    onChange={e => setDeviceSearchTerm(e.target.value)}
                                                    placeholder="Search devices..."
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                            </div>
                                            {deviceError && (
                                                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4" /> {deviceError}
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
                                                        {loadingDevices ? (
                                                            <tr>
                                                                <td colSpan={2} className="px-4 py-6 text-center text-gray-500">
                                                                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />Loading...
                                                                </td>
                                                            </tr>
                                                        ) : filteredDevices.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={2} className="px-4 py-6 text-center text-gray-500">No devices found</td>
                                                            </tr>
                                                        ) : (
                                                            filteredDevices.map(d => (
                                                                <tr
                                                                    key={d.id}
                                                                    className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                                                                    onClick={() => handleDeviceSelect(d.description)}
                                                                >
                                                                    <td className="px-3 py-2 font-mono">{d.code}</td>
                                                                    <td className="px-3 py-2">{d.description}</td>
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

                        {/* ── Employee Search Modal (Specific filter) ── */}
                        <EmployeeSearchModal
                            isOpen={showSpecificEmpModal}
                            onClose={() => setShowSpecificEmpModal(false)}
                            onSelect={(empCode: string) => {
                                const found = employeeData.find(e => e.empCode === empCode);
                                handleSpecificEmpSelect(empCode, found?.name ?? '');
                            }}
                            employees={employeeData}
                            loading={loadingEmployees}
                            error={employeeError}
                        />

                    </div>{/* /Content Container */}
                </div>
            </div>
            <Footer />
        </div>
    );
}