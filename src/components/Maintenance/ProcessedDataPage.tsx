import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../services/apiClient';
import { Check, Plus, Clock, AlertCircle, TrendingDown, CalendarX,
         Zap, DollarSign, Settings, Layers, Search, X, Calendar, Edit, Trash2,} from 'lucide-react';
import { AdvancedModal, AdjustmentModal, OtherEarningsModal, UndertimeModal, OvertimeModal, 
        TardinessModal, LeaveAbsencesModal, NoOfHoursModal, WorkshiftSearchModal, 
    OTCodeSearchModal, LeaveTypeSearchModal,} from '../Modals/ProcessedDataModals';
import { EmployeeSearchModal } from '../Modals/EmployeeSearchModal';
import { CalendarPopup } from '../CalendarPopup';
import { Footer } from '../Footer/Footer';
import Swal from 'sweetalert2';
import auditTrail from '../../services/auditTrail'

// ─── Shared Types ─────────────────────────────────────────────────────────────
interface NoOfHoursRecord {
    id: number;
    empCode: string;
    workshiftCode: string;
    dateIn: string;
    dateOut: string;
    noOfHours: string;
    groupCode?: string;
    glCode?: string;
}

// ─── Shared Utility ───────────────────────────────────────────────────────────
const parseToISO = (raw: string): string | null => {
    if (!raw) return null;

    // Format 1: "MM/DD/YYYY HH:MM AM/PM" (typed in modal)
    const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})\s*(AM|PM))?/i);
    if (slashMatch) {
        const [, month, day, year, rawH, rawM, period] = slashMatch;
        let hours = rawH ? parseInt(rawH) : 0;
        const minutes = rawM ? parseInt(rawM) : 0;
        if (period?.toUpperCase() === 'PM' && hours !== 12) hours += 12;
        if (period?.toUpperCase() === 'AM' && hours === 12) hours = 0;
        return `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}T${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:00`;
    }

    // Format 2: "Nov. 1, 2025 8:00 am" (from formatDateTime when editing)
    const monthNames: Record<string,string> = {
        jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06',
        jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12'
    };
    const longMatch = raw.match(/^(\w+)\.?\s+(\d{1,2}),\s+(\d{4})\s+(\d{1,2}):(\d{2})\s*(am|pm)/i);
    if (longMatch) {
        const [, mon, day, year, rawH, rawM, period] = longMatch;
        const month = monthNames[mon.slice(0,3).toLowerCase()];
        if (!month) return null;
        let hours = parseInt(rawH);
        const minutes = parseInt(rawM);
        if (period.toLowerCase() === 'pm' && hours !== 12) hours += 12;
        if (period.toLowerCase() === 'am' && hours === 12) hours = 0;
        return `${year}-${month}-${day.padStart(2,'0')}T${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:00`;
    }

    return null;
};

const parseDate = (raw: string): string | null => {
    if (!raw) return null;
    const date = new Date(raw);
    if (isNaN(date.getTime())) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const formatDateTime = (raw: string | null | undefined): string => {
    if (!raw) return '';
    const date = new Date(raw);
    if (isNaN(date.getTime())) return raw;
    const datePart = date
        .toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        .replace(/(\w+)\s(\d+),/, '$1. $2,');
    const timePart = date
        .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        .toLowerCase();
    return `${datePart} ${timePart}`;
};
const formatDateOnly = (raw: string | null | undefined): string => {
    if (!raw) return '';
    const date = new Date(raw);
    if (isNaN(date.getTime())) return raw;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                .replace(/(\w+)\s(\d+),/, '$1. $2,');
};
const formatTimeOnly = (raw: string | null | undefined): string => {
    if (!raw) return '';
    const date = new Date(raw);
    if (isNaN(date.getTime())) return raw;
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};
export function Pagination({
    currentPage,
    totalCount,
    pageSize,
    onPageChange,
}: {
    currentPage:  number;
    totalCount:   number;
    pageSize:     number;
    onPageChange: (page: number) => void;
}) {
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex   = Math.min(startIndex + pageSize, totalCount);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 4) {
            for (let i = 1; i <= 5; i++) pages.push(i);
            pages.push('...'); pages.push(totalPages);
        } else if (currentPage >= totalPages - 3) {
            pages.push(1); pages.push('...');
            for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1); pages.push('...');
            for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
            pages.push('...'); pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-between mt-4 px-4 pb-4">
            <div className="text-gray-600 text-sm">
                Showing {totalCount === 0 ? 0 : startIndex + 1} to {endIndex} of {totalCount} entries
            </div>
            <div className="flex gap-1">
                <button
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    Previous
                </button>
                {getPageNumbers().map((page, idx) =>
                    page === '...' ? (
                        <span key={`e-${idx}`} className="px-2 text-gray-500 text-sm">...</span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page as number)}
                            className={`px-3 py-1 rounded text-sm transition-colors ${
                                currentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-gray-300 hover:bg-gray-100'
                            }`}
                        >
                            {page}
                        </button>
                    )
                )}
                <button
                    onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export function ProcessedDataPage() {

    // ── Shared filter state ───────────────────────────────────────────────────
    const [employeeCode, setEmployeeCode]   = useState('');
    const [employeeName, setEmployeeName]   = useState('');
    const [employeeGroupCode, setEmployeeGroupCode] = useState('');

    const [dateFrom,     setDateFrom]       = useState('01/01/2019');
    const [dateTo,       setDateTo]         = useState('12/31/2019');
    const [subTab,       setSubTab]         = useState('No Of Hrs Per Day');

    // ── Calendar popup state ──────────────────────────────────────────────────
    const [showDateFromCalendar, setShowDateFromCalendar] = useState(false);
    const [showDateToCalendar,   setShowDateToCalendar]   = useState(false);

    // ── Employee Search Modal ─────────────────────────────────────────────────
    const [showEmpSearchModal, setShowEmpSearchModal] = useState(false);
    const [loadingEmployees,   setLoadingEmployees]   = useState(false);
    const [employeeError,      setEmployeeError]      = useState<string>('');
    const [employeeData,       setEmployeeData]       = useState<{ empCode: string; name: string; groupCode: string }[]>([]);

    // ── Shared edit/create state ──────────────────────────────────────────────
    const [isEditMode,    setIsEditMode]    = useState(false);
    const [editingIndex,  setEditingIndex]  = useState<number | null>(null);

    // ── Workshift / OT Code / Leave Type Search Modals ────────────────────────
    const [showWorkshiftSearchModal,  setShowWorkshiftSearchModal]  = useState(false);
    const [showOTCodeSearchModal,     setShowOTCodeSearchModal]     = useState(false);
    const [showLeaveTypeSearchModal,  setShowLeaveTypeSearchModal]  = useState(false);
    const [workshiftSearchTerm,       setWorkshiftSearchTerm]       = useState('');
    const [otCodeSearchTerm,          setOtCodeSearchTerm]          = useState('');
    const [leaveTypeSearchTerm,       setLeaveTypeSearchTerm]       = useState('');
    
    // ── Pagination state for each sub tab ─────────────────────────────────────────
    const [noOfHoursPage,            setNoOfHoursPage]            = useState(1);
    const [noOfHoursTotalCount,      setNoOfHoursTotalCount]      = useState(0);

    const [tardinessPage,            setTardinessPage]            = useState(1);
    const [tardinessTotalCount,      setTardinessTotalCount]      = useState(0);

    const [undertimePage,            setUndertimePage]            = useState(1);
    const [undertimeTotalCount,      setUndertimeTotalCount]      = useState(0);

    const [leaveAbsencesPage,        setLeaveAbsencesPage]        = useState(1);
    const [leaveAbsencesTotalCount,  setLeaveAbsencesTotalCount]  = useState(0);

    const [overtimePage,             setOvertimePage]             = useState(1);
    const [overtimeTotalCount,       setOvertimeTotalCount]       = useState(0);

    const [otherEarningsPage,        setOtherEarningsPage]        = useState(1);
    const [otherEarningsTotalCount,  setOtherEarningsTotalCount]  = useState(0);

    const [adjustmentPage,           setAdjustmentPage]           = useState(1);
    const [adjustmentTotalCount,     setAdjustmentTotalCount]     = useState(0);

    const [advancedPage,             setAdvancedPage]             = useState(1);
    const [advancedTotalCount,       setAdvancedTotalCount]       = useState(0);

    const PAGE_SIZE = 10;
    
    // =========================================================================
    // ── § EMPLOYEE SEARCH ─────────────────────────────────────────────────────
    // =========================================================================

    const fetchEmployees = async () => {
        setLoadingEmployees(true);
        setEmployeeError('');
        try {
            const response = await apiClient.get('/Maintenance/EmployeeMasterFile');
            if (response.status === 200 && response.data) {
                const mappedData = response.data.map((emp: any) => ({
                    empCode:   emp.empCode || emp.code || '',
                    name:      `${emp.lName || ''}, ${emp.fName || ''} ${emp.mName || ''}`.trim(),
                    groupCode: emp.grpCode || '',
                }));
                setEmployeeData(mappedData);
            }
        } catch (error: any) {
            setEmployeeError(error.response?.data?.message || error.message || 'Failed to load employees');
        } finally {
            setLoadingEmployees(false);
        }
    };

    const handleOpenEmpSearch = () => { fetchEmployees(); setShowEmpSearchModal(true); };
    const handleEmployeeSelect = (empCode: string, name: string, groupCode: string) => {
        setEmployeeCode(empCode);
        setEmployeeName(name);
        setEmployeeGroupCode(groupCode); 
    }
    const handleClearEmployee  = () => {
        setEmployeeCode('');
        setEmployeeName('');
        setEmployeeGroupCode(''); 
        setNoOfHoursData([]);
        setNoOfHoursError('');
    };

    // =========================================================================
    // ── § NO OF HRS PER DAY ───────────────────────────────────────────────────
    // =========================================================================

    // ── State ─────────────────────────────────────────────────────────────────
    const [noOfHoursData,    setNoOfHoursData]    = useState<NoOfHoursRecord[]>([]);
    const [noOfHoursLoading, setNoOfHoursLoading] = useState(false);
    const [noOfHoursError,   setNoOfHoursError]   = useState<string>('');
    const [showNoOfHoursModal, setShowNoOfHoursModal] = useState(false);

    // Modal form fields
    const [noOfHoursEmpCode,      setNoOfHoursEmpCode]      = useState('');
    const [noOfHoursWorkshiftCode, setNoOfHoursWorkshiftCode] = useState('');
    const [noOfHoursDateIn,       setNoOfHoursDateIn]       = useState('');
    const [noOfHoursDateOut,      setNoOfHoursDateOut]      = useState('');
    const [noOfHoursNoOfHours,    setNoOfHoursNoOfHours]    = useState('');
    const [noOfHoursGroupCode,     setNoOfHoursGroupCode]     = useState('');
    // ── Fetch ─────────────────────────────────────────────────────────────────
    const fetchNoOfHours = useCallback(async () => {
        if (!employeeCode) return;
        setNoOfHoursLoading(true);
        setNoOfHoursError('');



        const parsedFrom = parseDate(dateFrom);
        const parsedTo   = parseDate(dateTo);

        if (!parsedFrom || !parsedTo) {
            setNoOfHoursError('Invalid date range. Please check Date From and Date To.');
            setNoOfHoursLoading(false);
            return;
        }



        try {
            const response = await apiClient.get(
                '/Maintenance/ProcessedData/PDNumberHoursPerDay',
                { params: {
                    empCode:   employeeCode,
                    dateFrom:  parsedFrom,
                    dateTo:    parsedTo,
                    start:     (noOfHoursPage - 1) * PAGE_SIZE, 
                    length:    PAGE_SIZE,
                }}
            );
            if (response.status === 200 && response.data) {
                const rows = response.data.data ?? response.data;
                const total = response.data.totalCount ?? 0;             // ← capture total
                setNoOfHoursTotalCount(total);
                const records: NoOfHoursRecord[] = rows.map((r: any) => ({
                    id:            r.id            ?? 0,
                    empCode:       r.empCode       ?? '',
                    workshiftCode: r.workShiftCode ?? '',
                    dateIn:        formatDateTime(r.dateIn),
                    dateOut:       formatDateTime(r.dateOut),
                    noOfHours:     r.noOfHoursHHMM ?? r.noOfHours ?? '',
                    groupCode:     r.groupCode     ?? '',
                    glCode:        r.glCode        ?? '',
                }));
                setNoOfHoursData(records);
            }
        } catch (error: any) {
            setNoOfHoursError(error.response?.data?.message || error.message || 'Failed to load No Of Hours data');
        } finally {
            setNoOfHoursLoading(false);
        }
    }, [employeeCode, dateFrom, dateTo, noOfHoursPage]); 

    // ── Auto-fetch when tab switches ──────────────────────────────────────────
    useEffect(() => {
        if (!employeeCode) return;
        if (subTab === 'No Of Hrs Per Day') fetchNoOfHours();
    }, [subTab, fetchNoOfHours]);

    // ── Create ────────────────────────────────────────────────────────────────
    const handleOpenCreateNoOfHours = () => {
        setIsEditMode(false);
        setEditingIndex(null);
        setNoOfHoursEmpCode(employeeCode);
        setNoOfHoursWorkshiftCode('');
        setNoOfHoursDateIn('');
        setNoOfHoursDateOut('');
        setNoOfHoursNoOfHours('');
        setNoOfHoursGroupCode(employeeGroupCode);
        setShowNoOfHoursModal(true);
    };

    // ── Edit ──────────────────────────────────────────────────────────────────
    const handleEditNoOfHours = (index: number) => {
        const record = noOfHoursData[index];
        setIsEditMode(true);
        setEditingIndex(index);
        setNoOfHoursEmpCode(record.empCode);
        setNoOfHoursWorkshiftCode(record.workshiftCode);
        setNoOfHoursDateIn(record.dateIn);
        setNoOfHoursDateOut(record.dateOut);
        setNoOfHoursNoOfHours(record.noOfHours);
        setNoOfHoursGroupCode(record.groupCode ?? '');        
        setShowNoOfHoursModal(true);
    };

    // ── Submit (create / update) ──────────────────────────────────────────────
    const handleNoOfHoursSubmit = async () => {

        const parsedDateIn  = parseToISO(noOfHoursDateIn);
        const parsedDateOut = parseToISO(noOfHoursDateOut);

        if (!parsedDateIn || !parsedDateOut) {
            await Swal.fire({
                icon: 'error',
                title: 'Invalid Date',
                text: 'Invalid Date In or Date Out. Please use MM/DD/YYYY HH:MM AM format.'
            });
            return;
        }

        const parsedNoOfHours = noOfHoursNoOfHours ? parseFloat(noOfHoursNoOfHours) : null;

        const payload = {
            empCode:       noOfHoursEmpCode,
            workshiftCode: noOfHoursWorkshiftCode || null,
            dateIn:        parsedDateIn,
            dateOut:       parsedDateOut,
            noOfHours:     parsedNoOfHours,
            noOfHoursHHMM: parsedNoOfHours,
            groupCode:     noOfHoursGroupCode || null,
            glCode:        null,
        };

        const recordLabel = `${formatDateTime(payload.dateIn)} → ${formatDateTime(payload.dateOut)}`;

        try {
            if (isEditMode && editingIndex !== null) {

                const confirm = await Swal.fire({
                    icon: 'question',
                    title: 'Confirm Update',
                    text: `Are you sure you want to update the record for ${recordLabel}?`,
                    showCancelButton: true,
                    confirmButtonColor: '#2563eb',
                    cancelButtonColor: '#6b7280',
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'Cancel'
                });

                if (!confirm.isConfirmed) return;

                const id = noOfHoursData[editingIndex].id;

                await apiClient.put(
                    `/Maintenance/ProcessedData/PDNumberHoursPerDay/${id}`,
                    payload
                );
                await Swal.fire({
                    icon: 'success',
                    title: 'Updated successfully',
                    text: `Record for ${recordLabel} updated.`,
                    timer: 1500,
                    showConfirmButton: false
                });
            }
            else {
                await apiClient.post(
                    '/Maintenance/ProcessedData/PDNumberHoursPerDay',
                    payload
                );
                await Swal.fire({
                    icon: 'success',
                    title: 'Created successfully',
                    text: `Record for ${recordLabel} created.`,
                    timer: 1500,
                    showConfirmButton: false
                });
            }
            await fetchNoOfHours();
        } catch (err: any) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.message || err.message || 'Failed to save record'
            });
        } finally {
            setShowNoOfHoursModal(false);
            setIsEditMode(false);
            setEditingIndex(null);
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDeleteNoOfHours = async (index: number) => {

        const record = noOfHoursData[index];

        const recordLabel = `${record.dateIn} → ${record.dateOut}`;

        const confirm = await Swal.fire({
            icon: 'warning',
            title: 'Confirm Delete',
            text: `Are you sure you want to delete the record for ${recordLabel}?`,
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel'
        });

        if (!confirm.isConfirmed) return;
        try {
            await apiClient.delete(
                `/Maintenance/ProcessedData/PDNumberHoursPerDay/${record.id}`
            );
            await fetchNoOfHours();
            await Swal.fire({
                icon: 'success',
                title: 'Deleted successfully',
                text: `Record for ${recordLabel} deleted.`,
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err: any) {

            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.message || err.message || 'Failed to delete record'
            });
        }
    };

 // =========================================================================
    // ── § TARDINESS ───────────────────────────────────────────────────────────
    // =========================================================================

    // ── Types ─────────────────────────────────────────────────────────────────
    interface TardinessRecord {
        id:                             number;
        empCode:                        string;
        dateFrom:                       string;
        dateTo:                         string;
        timeIn:                         string;
        timeOut:                        string;
        workShiftCode:                  string;
        tardiness:                      string;
        tardinessHHMM:                  string;
        tardinessWithinGracePeriod:     string;
        tardinessWithinGracePeriodHHMM: string;
        actualTardiness:                string;
        actualTardinessHHMM:            string;
        remarks:                        string;
        groupCode:                      string;
        offSetOTFlag:                   boolean;
        exemptionRpt:                   string;
        glCode:                         string;
    }

    // ── State ─────────────────────────────────────────────────────────────────
    const [tardinessData,    setTardinessData]    = useState<TardinessRecord[]>([]);
    const [tardinessLoading, setTardinessLoading] = useState(false);
    const [tardinessError,   setTardinessError]   = useState<string>('');
    const [showTardinessModal, setShowTardinessModal] = useState(false);

    // Modal form fields
    const [tardinessEmpCode,                        setTardinessEmpCode]                        = useState('');
    const [tardinessDateFrom,                       setTardinessDateFrom]                       = useState('');
    const [tardinessDateTo,                         setTardinessDateTo]                         = useState('');
    const [tardinessTimeIn,                         setTardinessTimeIn]                         = useState('');
    const [tardinessTimeOut,                        setTardinessTimeOut]                        = useState('');
    const [tardinessWorkShiftCode,                  setTardinessWorkShiftCode]                  = useState('');
    const [tardinessTardiness,                      setTardinessTardiness]                      = useState('');
    const [tardinessTardinessHHMM,                  setTardinessTardinessHHMM]                  = useState('');
    const [tardinessTardinessWithinGracePeriod,     setTardinessTardinessWithinGracePeriod]     = useState('');
    const [tardinessTardinessWithinGracePeriodHHMM, setTardinessTardinessWithinGracePeriodHHMM] = useState('');
    const [tardinessActualTardiness,                setTardinessActualTardiness]                = useState('');
    const [tardinessActualTardinessHHMM,            setTardinessActualTardinessHHMM]            = useState('');
    const [tardinessRemarks,                        setTardinessRemarks]                        = useState('');
    const [tardinessGroupCode,                      setTardinessGroupCode]                      = useState('');
    const [tardinessOffSetOTFlag,                   setTardinessOffSetOTFlag]                   = useState(false);
    const [tardinessExemptionRpt,                   setTardinessExemptionRpt]                   = useState('');
    const [tardinessGLCode,                         setTardinessGLCode]                         = useState('');



    // ── Fetch ─────────────────────────────────────────────────────────────────
    const fetchTardiness = useCallback(async () => {
        if (!employeeCode) return;
        setTardinessLoading(true);
        setTardinessError('');

        const parsedFrom = parseDate(dateFrom);
        const parsedTo   = parseDate(dateTo);

        if (!parsedFrom || !parsedTo) {
            setTardinessError('Invalid date range. Please check Date From and Date To.');
            setTardinessLoading(false);
            return;
        }

        try {
            const response = await apiClient.get(
                '/Maintenance/ProcessedData/PDTardiness',
                { params: {
                    empCode:  employeeCode,
                    dateFrom: parsedFrom,
                    dateTo:   parsedTo,
                    start:    (tardinessPage - 1) * PAGE_SIZE,
                    length:   PAGE_SIZE,
                }}
            );

            if (response.status === 200 && response.data) {
                const rows  = response.data.data       ?? response.data;
                const total = response.data.totalCount ?? 0;
                setTardinessTotalCount(total);

                const records: TardinessRecord[] = rows.map((r: any) => ({
                    id:                             r.id                             ?? 0,
                    empCode:                        r.empCode                        ?? '',
                    // ── Date-only ─────────────────────────────────────────────
                    dateFrom:                       formatDateOnly(r.dateFrom),
                    dateTo:                         formatDateOnly(r.dateTo),
                    // ── Time-only (strip the 1900-01-01 carrier date) ─────────
                    timeIn:                         formatTimeOnly(r.timeIn),
                    timeOut:                        formatTimeOnly(r.timeOut),
                    // ── Rest ──────────────────────────────────────────────────
                    workShiftCode:                  r.workShiftCode                  ?? '',
                    tardiness:                      r.tardiness                      ?? '',
                    tardinessHHMM:                  r.tardinessHHMM                  ?? '',
                    tardinessWithinGracePeriod:     r.tardinessWithinGracePeriod     ?? '',
                    tardinessWithinGracePeriodHHMM: r.tardinessWithinGracePeriodHHMM ?? '',
                    actualTardiness:                r.actualTardiness                ?? '',
                    actualTardinessHHMM:            r.actualTardinessHHMM            ?? '',
                    remarks:                        r.remarks                        ?? '',
                    groupCode:                      r.groupCode                      ?? '',
                    offSetOTFlag:                   r.offSetOTFlag                   ?? false,
                    exemptionRpt:                   r.exemptionRpt                   ?? '',
                    glCode:                         r.glCode                         ?? '',
                }));

                setTardinessData(records);
            }
        } catch (error: any) {
            setTardinessError(
                error.response?.data?.message || error.message || 'Failed to load Tardiness data'
            );
        } finally {
            setTardinessLoading(false);
        }
    }, [employeeCode, dateFrom, dateTo, tardinessPage]);

    // ── Auto-fetch when tab switches ──────────────────────────────────────────
    useEffect(() => {
        if (!employeeCode) return;
        if (subTab === 'Tardiness') fetchTardiness();
    }, [subTab, fetchTardiness]);

    // ── Create ────────────────────────────────────────────────────────────────
    const handleOpenCreateTardiness = () => {
        setIsEditMode(false);
        setEditingIndex(null);
        setTardinessEmpCode(employeeCode);
        setTardinessDateFrom('');
        setTardinessDateTo('');
        setTardinessTimeIn('');
        setTardinessTimeOut('');
        setTardinessWorkShiftCode('');
        setTardinessTardiness('');
        setTardinessTardinessHHMM('');
        setTardinessTardinessWithinGracePeriod('');
        setTardinessTardinessWithinGracePeriodHHMM('');
        setTardinessActualTardiness('');
        setTardinessActualTardinessHHMM('');
        setTardinessRemarks('');
        setTardinessGroupCode(employeeGroupCode);
        setTardinessOffSetOTFlag(false);
        setTardinessExemptionRpt('');
        setTardinessGLCode('');
        setShowTardinessModal(true);
    };

    // ── Edit ──────────────────────────────────────────────────────────────────
    const handleEditTardiness = (index: number) => {
        const r = tardinessData[index];
        setIsEditMode(true);
        setEditingIndex(index);
        setTardinessEmpCode(r.empCode);
        // dateFrom / dateTo are already formatted as "Nov. 1, 2025" by fetch.
        // parseDate() in the submit will re-parse this back to "YYYY-MM-DD"
        // via the Date constructor which handles "Nov. 1, 2025" fine.
        setTardinessDateFrom(r.dateFrom);
        setTardinessDateTo(r.dateTo);
        // timeIn / timeOut are already formatted as "8:30 AM" by fetch.
        // parseTimeOnly() in the submit accepts "HH:MM AM/PM" directly.
        setTardinessTimeIn(r.timeIn);
        setTardinessTimeOut(r.timeOut);
        setTardinessWorkShiftCode(r.workShiftCode);
        setTardinessTardiness(String(r.tardiness));
        setTardinessTardinessHHMM(String(r.tardinessHHMM));
        setTardinessTardinessWithinGracePeriod(String(r.tardinessWithinGracePeriod));
        setTardinessTardinessWithinGracePeriodHHMM(String(r.tardinessWithinGracePeriodHHMM));
        setTardinessActualTardiness(String(r.actualTardiness));
        setTardinessActualTardinessHHMM(String(r.actualTardinessHHMM));
        setTardinessRemarks(r.remarks);
        setTardinessGroupCode(r.groupCode);
        setTardinessOffSetOTFlag(r.offSetOTFlag);
        setTardinessExemptionRpt(r.exemptionRpt);
        setTardinessGLCode(r.glCode);
        setShowTardinessModal(true);
    };

    // ── Submit (create / update) ──────────────────────────────────────────────
    const handleTardinessSubmit = async () => {
        const parsedDateFrom = parseDate(tardinessDateFrom)
            ? `${parseDate(tardinessDateFrom)}T00:00:00`
            : null;

        const parsedDateTo = parseDate(tardinessDateTo)
            ? `${parseDate(tardinessDateTo)}T00:00:00`
            : null;

        if (!parsedDateFrom || !parsedDateTo) {
            await Swal.fire({
                icon:  'error',
                title: 'Invalid Date',
                text:  'Invalid Date From or Date To. Please use MM/DD/YYYY format.',
            });
            return;
        }
        // ── Time-only fields (timeIn / timeOut) ───────────────────────────────
        const parseTimeOnly = (raw: string): string | null => {
            if (!raw?.trim()) return null;

            const match = raw.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
            if (!match) return null;

            let hours   = parseInt(match[1]);
            const mins  = parseInt(match[2]);
            const period = match[3]?.toUpperCase();

            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12)  hours  = 0;

            // Use a fixed carrier date (1900-01-01) — same trick SQL SP
            // implicitly uses when storing time-only values as datetime.
            return `1900-01-01T${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}:00`;
        };

        const parsedTimeIn  = tardinessTimeIn.trim()  ? parseTimeOnly(tardinessTimeIn)  : null;
        const parsedTimeOut = tardinessTimeOut.trim()  ? parseTimeOnly(tardinessTimeOut) : null;

        // timeIn / timeOut are optional — only validate if the user typed something
        if (tardinessTimeIn.trim() && !parsedTimeIn) {
            await Swal.fire({
                icon:  'error',
                title: 'Invalid Time',
                text:  'Invalid Time In. Please use HH:MM AM/PM format (e.g. 8:30 AM).',
            });
            return;
        }

        if (tardinessTimeOut.trim() && !parsedTimeOut) {
            await Swal.fire({
                icon:  'error',
                title: 'Invalid Time',
                text:  'Invalid Time Out. Please use HH:MM AM/PM format (e.g. 5:00 PM).',
            });
            return;
        }

        // ── Decimal helper ────────────────────────────────────────────────────
        const toDecimal = (val: string) => val?.trim() ? parseFloat(val) : null;

        // ── Build payload ─────────────────────────────────────────────────────
        const payload = {
            empCode:                        tardinessEmpCode,
            dateFrom:                       parsedDateFrom,
            dateTo:                         parsedDateTo,
            timeIn:                         parsedTimeIn,
            timeOut:                        parsedTimeOut,
            workShiftCode:                  tardinessWorkShiftCode                  || null,
            tardiness:                      toDecimal(tardinessTardiness),
            tardinessHHMM:                  toDecimal(tardinessTardinessHHMM),
            tardinessWithinGracePeriod:     toDecimal(tardinessTardinessWithinGracePeriod),
            tardinessWithinGracePeriodHHMM: toDecimal(tardinessTardinessWithinGracePeriodHHMM),
            actualTardiness:                toDecimal(tardinessActualTardiness),
            actualTardinessHHMM:            toDecimal(tardinessActualTardinessHHMM),
            remarks:                        tardinessRemarks                        || null,
            groupCode:                      tardinessGroupCode                      || null,
            offSetOTFlag:                   tardinessOffSetOTFlag,
            exemptionRpt:                   tardinessExemptionRpt                   || null,
            glCode:                         tardinessGLCode                         || null,
        };

        const recordLabel = `${tardinessDateFrom} → ${tardinessDateTo}`;

        try {
            if (isEditMode && editingIndex !== null) {

                const confirm = await Swal.fire({
                    icon:               'question',
                    title:              'Confirm Update',
                    text:               `Are you sure you want to update the record for ${recordLabel}?`,
                    showCancelButton:   true,
                    confirmButtonColor: '#2563eb',
                    cancelButtonColor:  '#6b7280',
                    confirmButtonText:  'Yes',
                    cancelButtonText:   'Cancel',
                });
                if (!confirm.isConfirmed) return;

                const id = tardinessData[editingIndex].id;

                // UpdateRow excludes empCode and glCode — strip before sending
                const { empCode: _emp, glCode: _gl, ...updatePayload } = payload;

                await apiClient.put(
                    `/Maintenance/ProcessedData/PDTardiness/${id}`,
                    updatePayload
                );

                await Swal.fire({
                    icon:              'success',
                    title:             'Updated successfully',
                    text:              `Record for ${recordLabel} updated.`,
                    timer:             1500,
                    showConfirmButton: false,
                });

            } else {

                await apiClient.post(
                    '/Maintenance/ProcessedData/PDTardiness',
                    payload
                );

                await Swal.fire({
                    icon:              'success',
                    title:             'Created successfully',
                    text:              `Record for ${recordLabel} created.`,
                    timer:             1500,
                    showConfirmButton: false,
                });
            }

            await fetchTardiness();

        } catch (err: any) {
            await Swal.fire({
                icon:  'error',
                title: 'Error',
                text:  err.response?.data?.message || err.message || 'Failed to save record',
            });
        } finally {
            setShowTardinessModal(false);
            setIsEditMode(false);
            setEditingIndex(null);
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDeleteTardiness = async (index: number) => {

        const record = tardinessData[index];
        const recordLabel = `${record.dateFrom} → ${record.dateTo}`;

        const confirm = await Swal.fire({
            icon:               'warning',
            title:              'Confirm Delete',
            text:               `Are you sure you want to delete the record for ${recordLabel}?`,
            showCancelButton:   true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor:  '#6b7280',
            confirmButtonText:  'Delete',
            cancelButtonText:   'Cancel',
        });

        if (!confirm.isConfirmed) return;

        try {
            await apiClient.delete(
                `/Maintenance/ProcessedData/PDTardiness/${record.id}`
            );
            await fetchTardiness();
            await Swal.fire({
                icon:              'success',
                title:             'Deleted successfully',
                text:              `Record for ${recordLabel} deleted.`,
                timer:             1500,
                showConfirmButton: false,
            });
        } catch (err: any) {
            await Swal.fire({
                icon:  'error',
                title: 'Error',
                text:  err.response?.data?.message || err.message || 'Failed to delete record',
            });
        }
    };

    // =========================================================================
    // ── § UNDERTIME ───────────────────────────────────────────────────────────
    // =========================================================================

    // ── State ─────────────────────────────────────────────────────────────────
    const [undertimeData,      setUndertimeData]      = useState<any[]>([]);
    const [showUndertimeModal, setShowUndertimeModal] = useState(false);
    const [undertimeEmpCode,               setUndertimeEmpCode]               = useState('');
    const [undertimeDateFrom,              setUndertimeDateFrom]              = useState('');
    const [undertimeDateTo,                setUndertimeDateTo]                = useState('');
    const [undertimeTimeIn,                setUndertimeTimeIn]                = useState('');
    const [undertimeTimeOut,               setUndertimeTimeOut]               = useState('');
    const [undertimeWorkshiftCode,         setUndertimeWorkshiftCode]         = useState('');
    const [undertimeUndertime,             setUndertimeUndertime]             = useState('');
    const [undertimeWithinGracePeriod,     setUndertimeWithinGracePeriod]     = useState('');
    const [undertimeActualUndertime,       setUndertimeActualUndertime]       = useState('');
    const [undertimeRemarks,               setUndertimeRemarks]               = useState('');

    // ── Create ────────────────────────────────────────────────────────────────
    const handleOpenCreateUndertime = () => {
        setIsEditMode(false); setEditingIndex(null);
        setUndertimeEmpCode(''); setUndertimeDateFrom(''); setUndertimeDateTo('');
        setUndertimeTimeIn(''); setUndertimeTimeOut(''); setUndertimeWorkshiftCode('');
        setUndertimeUndertime(''); setUndertimeWithinGracePeriod('');
        setUndertimeActualUndertime(''); setUndertimeRemarks('');
        setShowUndertimeModal(true);
    };

    // ── Edit ──────────────────────────────────────────────────────────────────
    const handleEditUndertime = (index: number) => {
        const r = undertimeData[index];
        setIsEditMode(true); setEditingIndex(index);
        setUndertimeEmpCode(r.empCode); setUndertimeDateFrom(r.dateFrom);
        setUndertimeDateTo(r.dateTo); setUndertimeTimeIn(r.timeIn);
        setUndertimeTimeOut(r.timeOut); setUndertimeWorkshiftCode(r.workshiftCode);
        setUndertimeUndertime(r.undertime);
        setUndertimeWithinGracePeriod(r.undertimeWithinGracePeriod);
        setUndertimeActualUndertime(r.actualUndertime); setUndertimeRemarks(r.remarks);
        setShowUndertimeModal(true);
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleUndertimeSubmit = () => {
        const newRecord = {
            empCode: undertimeEmpCode, dateFrom: undertimeDateFrom, dateTo: undertimeDateTo,
            timeIn: undertimeTimeIn, timeOut: undertimeTimeOut, workshiftCode: undertimeWorkshiftCode,
            undertime: undertimeUndertime, undertimeWithinGracePeriod,
            actualUndertime: undertimeActualUndertime, remarks: undertimeRemarks,
        };
        if (isEditMode && editingIndex !== null) {
            const updated = [...undertimeData]; updated[editingIndex] = newRecord; setUndertimeData(updated);
        } else {
            setUndertimeData([...undertimeData, newRecord]);
        }
        setShowUndertimeModal(false); setIsEditMode(false); setEditingIndex(null);
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDeleteUndertime = (index: number) => {
        if (window.confirm('Delete?')) setUndertimeData(undertimeData.filter((_, i) => i !== index));
    };

    // =========================================================================
    // ── § LEAVE AND ABSENCES ──────────────────────────────────────────────────
    // =========================================================================

    // ── State ─────────────────────────────────────────────────────────────────
    const [leaveData,             setLeaveData]             = useState<any[]>([]);
    const [showLeaveAbsencesModal, setShowLeaveAbsencesModal] = useState(false);
    const [leaveEmpCode,                    setLeaveEmpCode]                    = useState('');
    const [leaveDate,                       setLeaveDate]                       = useState('');
    const [leaveHoursLeaveAbsent,           setLeaveHoursLeaveAbsent]           = useState('');
    const [leaveLeaveCode,                  setLeaveLeaveCode]                  = useState('');
    const [leaveLeaveDescription,           setLeaveLeaveDescription]           = useState('');
    const [leaveReason,                     setLeaveReason]                     = useState('');
    const [leaveRemarks,                    setLeaveRemarks]                    = useState('');
    const [leaveWithPay,                    setLeaveWithPay]                    = useState(false);
    const [leaveExemptForAllowanceDeduction, setLeaveExemptForAllowanceDeduction] = useState(false);

    // ── Create ────────────────────────────────────────────────────────────────
    const handleOpenCreateLeave = () => {
        setIsEditMode(false); setEditingIndex(null);
        setLeaveEmpCode(''); setLeaveDate(''); setLeaveHoursLeaveAbsent('');
        setLeaveLeaveCode(''); setLeaveLeaveDescription(''); setLeaveReason('');
        setLeaveRemarks(''); setLeaveWithPay(false); setLeaveExemptForAllowanceDeduction(false);
        setShowLeaveAbsencesModal(true);
    };

    // ── Edit ──────────────────────────────────────────────────────────────────
    const handleEditLeave = (index: number) => {
        const r = leaveData[index];
        setIsEditMode(true); setEditingIndex(index);
        setLeaveEmpCode(r.empCode); setLeaveDate(r.date);
        setLeaveHoursLeaveAbsent(r.hoursLeaveAbsent); setLeaveLeaveCode(r.leaveCode);
        setLeaveLeaveDescription(r.leaveDescription); setLeaveReason(r.reason);
        setLeaveRemarks(r.remarks); setLeaveWithPay(r.withPay);
        setLeaveExemptForAllowanceDeduction(r.exemptForAllowanceDeduction);
        setShowLeaveAbsencesModal(true);
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleLeaveAbsencesSubmit = () => {
        const newRecord = {
            empCode: leaveEmpCode, date: leaveDate, hoursLeaveAbsent: leaveHoursLeaveAbsent,
            leaveCode: leaveLeaveCode, leaveDescription: leaveLeaveDescription,
            reason: leaveReason, remarks: leaveRemarks,
            withPay: leaveWithPay, exemptForAllowanceDeduction: leaveExemptForAllowanceDeduction,
        };
        if (isEditMode && editingIndex !== null) {
            const updated = [...leaveData]; updated[editingIndex] = newRecord; setLeaveData(updated);
        } else {
            setLeaveData([...leaveData, newRecord]);
        }
        setShowLeaveAbsencesModal(false); setIsEditMode(false); setEditingIndex(null);
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDeleteLeave = (index: number) => {
        if (window.confirm('Delete?')) setLeaveData(leaveData.filter((_, i) => i !== index));
    };

    // =========================================================================
    // ── § OVERTIME ────────────────────────────────────────────────────────────
    // =========================================================================

    // ── State ─────────────────────────────────────────────────────────────────
    const [overtimeData,      setOvertimeData]      = useState<any[]>([]);
    const [showOvertimeModal, setShowOvertimeModal] = useState(false);
    const [overtimeEmpCode,       setOvertimeEmpCode]       = useState('');
    const [overtimeDateFrom,      setOvertimeDateFrom]      = useState('');
    const [overtimeDateTo,        setOvertimeDateTo]        = useState('');
    const [overtimeTimeIn,        setOvertimeTimeIn]        = useState('');
    const [overtimeTimeOut,       setOvertimeTimeOut]       = useState('');
    const [overtimeWorkshiftCode, setOvertimeWorkshiftCode] = useState('');
    const [overtimeOvertime,      setOvertimeOvertime]      = useState('');
    const [overtimeOTCode,        setOvertimeOTCode]        = useState('');
    const [overtimeReason,        setOvertimeReason]        = useState('');
    const [overtimeRemarks,       setOvertimeRemarks]       = useState('');

    // ── Create ────────────────────────────────────────────────────────────────
    const handleOpenCreateOvertime = () => {
        setIsEditMode(false); setEditingIndex(null);
        setOvertimeEmpCode(''); setOvertimeDateFrom(''); setOvertimeDateTo('');
        setOvertimeTimeIn(''); setOvertimeTimeOut(''); setOvertimeWorkshiftCode('');
        setOvertimeOvertime(''); setOvertimeOTCode(''); setOvertimeReason(''); setOvertimeRemarks('');
        setShowOvertimeModal(true);
    };

    // ── Edit ──────────────────────────────────────────────────────────────────
    const handleEditOvertime = (index: number) => {
        const r = overtimeData[index];
        setIsEditMode(true); setEditingIndex(index);
        setOvertimeEmpCode(r.empCode); setOvertimeDateFrom(r.dateFrom);
        setOvertimeDateTo(r.dateTo); setOvertimeTimeIn(r.timeIn);
        setOvertimeTimeOut(r.timeOut); setOvertimeWorkshiftCode(r.workshiftCode);
        setOvertimeOvertime(r.overtime); setOvertimeOTCode(r.otCode);
        setOvertimeReason(r.reason); setOvertimeRemarks(r.remarks);
        setShowOvertimeModal(true);
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleOvertimeSubmit = () => {
        const newRecord = {
            empCode: overtimeEmpCode, dateFrom: overtimeDateFrom, dateTo: overtimeDateTo,
            timeIn: overtimeTimeIn, timeOut: overtimeTimeOut, workshiftCode: overtimeWorkshiftCode,
            overtime: overtimeOvertime, otCode: overtimeOTCode,
            reason: overtimeReason, remarks: overtimeRemarks,
        };
        if (isEditMode && editingIndex !== null) {
            const updated = [...overtimeData]; updated[editingIndex] = newRecord; setOvertimeData(updated);
        } else {
            setOvertimeData([...overtimeData, newRecord]);
        }
        setShowOvertimeModal(false); setIsEditMode(false); setEditingIndex(null);
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDeleteOvertime = (index: number) => {
        if (window.confirm('Delete?')) setOvertimeData(overtimeData.filter((_, i) => i !== index));
    };

    // =========================================================================
    // ── § OTHER EARNINGS AND ALLOWANCES ──────────────────────────────────────
    // =========================================================================

    // ── State ─────────────────────────────────────────────────────────────────
    const [otherEarningsData,      setOtherEarningsData]      = useState<any[]>([]);
    const [showOtherEarningsModal, setShowOtherEarningsModal] = useState(false);
    const [otherEarningsEmpCode,       setOtherEarningsEmpCode]       = useState('');
    const [otherEarningsDate,          setOtherEarningsDate]          = useState('');
    const [otherEarningsAllowanceCode, setOtherEarningsAllowanceCode] = useState('');
    const [otherEarningsDescription,   setOtherEarningsDescription]   = useState('');
    const [otherEarningsAmount,        setOtherEarningsAmount]        = useState('');
    const [otherEarningsRemarks,       setOtherEarningsRemarks]       = useState('');

    // ── Create ────────────────────────────────────────────────────────────────
    const handleOpenCreateOtherEarnings = () => {
        setIsEditMode(false); setEditingIndex(null);
        setOtherEarningsEmpCode(''); setOtherEarningsDate(''); setOtherEarningsAllowanceCode('');
        setOtherEarningsDescription(''); setOtherEarningsAmount(''); setOtherEarningsRemarks('');
        setShowOtherEarningsModal(true);
    };

    // ── Edit ──────────────────────────────────────────────────────────────────
    const handleEditOtherEarnings = (index: number) => {
        const r = otherEarningsData[index];
        setIsEditMode(true); setEditingIndex(index);
        setOtherEarningsEmpCode(r.empCode); setOtherEarningsDate(r.date);
        setOtherEarningsAllowanceCode(r.allowanceCode); setOtherEarningsDescription(r.description);
        setOtherEarningsAmount(r.amount); setOtherEarningsRemarks(r.remarks);
        setShowOtherEarningsModal(true);
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleOtherEarningsSubmit = () => {
        const newRecord = {
            empCode: otherEarningsEmpCode, date: otherEarningsDate,
            allowanceCode: otherEarningsAllowanceCode, description: otherEarningsDescription,
            amount: otherEarningsAmount, remarks: otherEarningsRemarks,
            groupCode: '', glCode: '',
        };
        if (isEditMode && editingIndex !== null) {
            const updated = [...otherEarningsData]; updated[editingIndex] = newRecord; setOtherEarningsData(updated);
        } else {
            setOtherEarningsData([...otherEarningsData, newRecord]);
        }
        setShowOtherEarningsModal(false); setIsEditMode(false); setEditingIndex(null);
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDeleteOtherEarnings = (index: number) => {
        if (window.confirm('Delete?')) setOtherEarningsData(otherEarningsData.filter((_, i) => i !== index));
    };

    // =========================================================================
    // ── § ADJUSTMENT ──────────────────────────────────────────────────────────
    // =========================================================================

    // ── State ─────────────────────────────────────────────────────────────────
    const [adjustmentData,      setAdjustmentData]      = useState<any[]>([]);
    const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
    const [adjustmentEmpCode,                setAdjustmentEmpCode]                = useState('');
    const [adjustmentTransactionDate,        setAdjustmentTransactionDate]        = useState('');
    const [adjustmentTransactionType,        setAdjustmentTransactionType]        = useState('');
    const [adjustmentLeaveType,              setAdjustmentLeaveType]              = useState('');
    const [adjustmentOvertimeCode,           setAdjustmentOvertimeCode]           = useState('');
    const [adjustmentNoOfHours,              setAdjustmentNoOfHours]              = useState('');
    const [adjustmentAdjustType,             setAdjustmentAdjustType]             = useState('');
    const [adjustmentRemarks,                setAdjustmentRemarks]                = useState('');
    const [adjustmentIsLateFiling,           setAdjustmentIsLateFiling]           = useState(false);
    const [adjustmentIsLateFilingActualDate, setAdjustmentIsLateFilingActualDate] = useState('');
    const [adjustmentBorrowedDeviceName,     setAdjustmentBorrowedDeviceName]     = useState('');

    // ── Create ────────────────────────────────────────────────────────────────
    const handleOpenCreateAdjustment = () => {
        setIsEditMode(false); setEditingIndex(null);
        setAdjustmentEmpCode(''); setAdjustmentTransactionDate(''); setAdjustmentTransactionType('');
        setAdjustmentLeaveType(''); setAdjustmentOvertimeCode(''); setAdjustmentNoOfHours('');
        setAdjustmentAdjustType(''); setAdjustmentRemarks('');
        setAdjustmentIsLateFiling(false); setAdjustmentIsLateFilingActualDate('');
        setAdjustmentBorrowedDeviceName('');
        setShowAdjustmentModal(true);
    };

    // ── Edit ──────────────────────────────────────────────────────────────────
    const handleEditAdjustment = (index: number) => {
        const r = adjustmentData[index];
        setIsEditMode(true); setEditingIndex(index);
        setAdjustmentEmpCode(r.empCode); setAdjustmentTransactionDate(r.transactionDate);
        setAdjustmentTransactionType(r.transactionType); setAdjustmentLeaveType(r.leaveType);
        setAdjustmentOvertimeCode(r.overtimeCode); setAdjustmentNoOfHours(r.noOfHours);
        setAdjustmentAdjustType(r.adjustType); setAdjustmentRemarks(r.remarks);
        setAdjustmentIsLateFiling(r.isLateFiling);
        setAdjustmentIsLateFilingActualDate(r.isLateFilingActualDate);
        setAdjustmentBorrowedDeviceName(r.borrowedDeviceName);
        setShowAdjustmentModal(true);
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleAdjustmentSubmit = () => {
        const newRecord = {
            empCode: adjustmentEmpCode, transactionDate: adjustmentTransactionDate,
            transactionType: adjustmentTransactionType, leaveType: adjustmentLeaveType,
            overtimeCode: adjustmentOvertimeCode, noOfHours: adjustmentNoOfHours,
            adjustType: adjustmentAdjustType, remarks: adjustmentRemarks,
            isLateFiling: adjustmentIsLateFiling,
            isLateFilingActualDate: adjustmentIsLateFilingActualDate,
            borrowedDeviceName: adjustmentBorrowedDeviceName,
            groupCode: '', glCode: '',
        };
        if (isEditMode && editingIndex !== null) {
            const updated = [...adjustmentData]; updated[editingIndex] = newRecord; setAdjustmentData(updated);
        } else {
            setAdjustmentData([...adjustmentData, newRecord]);
        }
        setShowAdjustmentModal(false); setIsEditMode(false); setEditingIndex(null);
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDeleteAdjustment = (index: number) => {
        if (window.confirm('Delete?')) setAdjustmentData(adjustmentData.filter((_, i) => i !== index));
    };

    // ── § ADVANCED ────────────────────────────────────────────────────────────

    // ── State ─────────────────────────────────────────────────────────────────
    const [advancedData,      setAdvancedData]      = useState<any[]>([]);
    const [showAdvancedModal, setShowAdvancedModal] = useState(false);
    const [advancedEmpCode,          setAdvancedEmpCode]          = useState('');
    const [advancedTransactionDate,  setAdvancedTransactionDate]  = useState('');
    const [advancedTransactionType,  setAdvancedTransactionType]  = useState('');
    const [advancedNoOfHours,        setAdvancedNoOfHours]        = useState('');
    const [advancedOvertimeCode,     setAdvancedOvertimeCode]     = useState('');

    // ── Create ────────────────────────────────────────────────────────────────
    const handleOpenCreateAdvanced = () => {
        setIsEditMode(false); setEditingIndex(null);
        setAdvancedEmpCode(''); setAdvancedTransactionDate(''); setAdvancedTransactionType('');
        setAdvancedNoOfHours(''); setAdvancedOvertimeCode('');
        setShowAdvancedModal(true);
    };

    // ── Edit ──────────────────────────────────────────────────────────────────
    const handleEditAdvanced = (index: number) => {
        const r = advancedData[index];
        setIsEditMode(true); setEditingIndex(index);
        setAdvancedEmpCode(r.empCode); setAdvancedTransactionDate(r.transactionDate);
        setAdvancedTransactionType(r.transactionType); setAdvancedNoOfHours(r.noOfHours);
        setAdvancedOvertimeCode(r.overtimeCode);
        setShowAdvancedModal(true);
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleAdvancedSubmit = () => {
        const newRecord = {
            empCode: advancedEmpCode, transactionDate: advancedTransactionDate,
            transactionType: advancedTransactionType, noOfHours: advancedNoOfHours,
            overtimeCode: advancedOvertimeCode, groupCode: '', glCode: '',
        };
        if (isEditMode && editingIndex !== null) {
            const updated = [...advancedData]; updated[editingIndex] = newRecord; setAdvancedData(updated);
        } else {
            setAdvancedData([...advancedData, newRecord]);
        }
        setShowAdvancedModal(false); setIsEditMode(false); setEditingIndex(null);
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDeleteAdvanced = (index: number) => {
        if (window.confirm('Delete?')) setAdvancedData(advancedData.filter((_, i) => i !== index));
    };

    // =========================================================================
    // ── § SHARED SEARCH MODAL SELECTORS ──────────────────────────────────────
    // =========================================================================

    const handleWorkshiftSelect = (code: string) => {
        if (showUndertimeModal)   setUndertimeWorkshiftCode(code);
        else if (showOvertimeModal)  setOvertimeWorkshiftCode(code);
        else if (showTardinessModal) setTardinessWorkShiftCode(code);
        else if (showNoOfHoursModal) setNoOfHoursWorkshiftCode(code);
        setShowWorkshiftSearchModal(false);
    };

    const handleOTCodeSelect = (code: string) => {
        setOvertimeOTCode(code);
        setShowOTCodeSearchModal(false);
    };

    const handleLeaveTypeSelect = (code: string, description: string) => {
        setLeaveLeaveCode(code);
        setLeaveLeaveDescription(description);
        setShowLeaveTypeSearchModal(false);
    };

    // =========================================================================
    // ── § GLOBAL SEARCH BUTTON ────────────────────────────────────────────────
    // =========================================================================

    const handleSearch = () => {
        if (subTab === 'No Of Hrs Per Day') fetchNoOfHours();
        // add other tab fetches here as APIs become available
    };

    // =========================================================================
    // ── § ESC KEY HANDLER ─────────────────────────────────────────────────────
    // =========================================================================

    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            setShowEmpSearchModal(false);
            setShowNoOfHoursModal(false);
            setShowTardinessModal(false);
            setShowUndertimeModal(false);
            setShowLeaveAbsencesModal(false);
            setShowOvertimeModal(false);
            setShowOtherEarningsModal(false);
            setShowAdjustmentModal(false);
            setShowAdvancedModal(false);
            setShowWorkshiftSearchModal(false);
            setShowOTCodeSearchModal(false);
            setShowLeaveTypeSearchModal(false);
        };
        document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, []);

    // =========================================================================
    // ── § CREATE NEW DISPATCHER ───────────────────────────────────────────────
    // =========================================================================

    const handleCreateNew = () => {
        switch (subTab) {
            case 'No Of Hrs Per Day':              return handleOpenCreateNoOfHours();
            case 'Tardiness':                      return handleOpenCreateTardiness();
            case 'Undertime':                      return handleOpenCreateUndertime();
            case 'Leave and Absences':             return handleOpenCreateLeave();
            case 'Overtime':                       return handleOpenCreateOvertime();
            case 'Other Earnings and Allowances':  return handleOpenCreateOtherEarnings();
            case 'Adjustment':                     return handleOpenCreateAdjustment();
            case 'Advanced':                       return handleOpenCreateAdvanced();
        }
    };

    // =========================================================================
    // ── § HEADER TITLE ────────────────────────────────────────────────────────
    // =========================================================================

    const getHeaderTitle = () => {
        switch (subTab) {
            case 'No Of Hrs Per Day':             return 'Process No. Hours Per Day';
            case 'Tardiness':                     return 'Process Tardiness';
            case 'Undertime':                     return 'Process Undertime';
            case 'Leave and Absences':            return 'Process Leave and Absences';
            case 'Overtime':                      return 'Process Overtime';
            case 'Other Earnings and Allowances': return 'Process Other Earnings and Allowances';
            case 'Adjustment':                    return 'Process Adjustment';
            case 'Advanced':                      return 'Process Advanced';
            default:                              return 'Process No. Hours Per Day';
        }
    };

    const subTabs = [
        { name: 'No Of Hrs Per Day',             icon: Clock       },
        { name: 'Tardiness',                     icon: AlertCircle },
        { name: 'Undertime',                     icon: TrendingDown },
        { name: 'Leave and Absences',            icon: CalendarX   },
        { name: 'Overtime',                      icon: Zap         },
        { name: 'Other Earnings and Allowances', icon: DollarSign  },
        { name: 'Adjustment',                    icon: Settings    },
        { name: 'Advanced',                      icon: Layers      },
    ];

    // =========================================================================
    // ── § RENDER ──────────────────────────────────────────────────────────────
    // =========================================================================

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <div className="flex-1 relative z-10 p-6">
                <div className="max-w-7xl mx-auto relative">

                    {/* Page Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
                        <h1 className="text-white">{getHeaderTitle()}</h1>
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
                                        Process and manage employee attendance data including hours worked, tardiness, undertime, leaves, and overtime.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        {[
                                            'Track daily work hours',
                                            'Monitor tardiness and undertime',
                                            'Process overtime records',
                                            'Manage leave and absences',
                                        ].map((text) => (
                                            <div key={text} className="flex items-start gap-2">
                                                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-600">{text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Search Filters ── */}
                        <div className="mb-6 space-y-4">

                            {/* Employee Code row */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <label className="text-sm font-bold text-gray-700 w-32 flex-shrink-0">Employee Code</label>
                                    <input
                                        type="text"
                                        value={employeeCode}
                                        readOnly
                                        placeholder="Select employee..."
                                        className="w-48 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 cursor-default"
                                    />
                                    <label className="text-sm font-bold text-gray-700 ml-2 flex-shrink-0">Employee Name</label>
                                    <input
                                        type="text"
                                        value={employeeName}
                                        readOnly
                                        placeholder="Select employee..."
                                        className="flex-1 min-w-[160px] px-3 py-1.5 border border-gray-300 rounded bg-gray-50"
                                    />
                                    <button onClick={handleOpenEmpSearch} className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors" title="Search employee">
                                        <Search className="w-4 h-4" />
                                    </button>
                                    <button onClick={handleClearEmployee} className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors" title="Clear employee">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Date range row */}
                            <div className="flex items-center gap-4 flex-wrap bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <label className="text-gray-700 font-bold text-sm flex-shrink-0">Date From</label>
                                <input type="text" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <div className="relative">
                                    <button onClick={() => setShowDateFromCalendar(!showDateFromCalendar)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        <Calendar className="w-4 h-4" />
                                    </button>
                                    {showDateFromCalendar && (
                                        <div className="absolute top-full left-0 mt-1 z-50">
                                            <CalendarPopup onDateSelect={(date) => { setDateFrom(date); setShowDateFromCalendar(false); }} onClose={() => setShowDateFromCalendar(false)} />
                                        </div>
                                    )}
                                </div>
                                <label className="text-sm font-bold text-gray-700 ml-2 flex-shrink-0">Date To</label>
                                <input type="text" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="MM/DD/YYYY" className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <div className="relative">
                                    <button onClick={() => setShowDateToCalendar(!showDateToCalendar)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        <Calendar className="w-4 h-4" />
                                    </button>
                                    {showDateToCalendar && (
                                        <div className="absolute top-full left-0 mt-1 z-50">
                                            <CalendarPopup onDateSelect={(date) => { setDateTo(date); setShowDateToCalendar(false); }} onClose={() => setShowDateToCalendar(false)} />
                                        </div>
                                    )}
                                </div>
                                <button onClick={handleSearch} disabled={!employeeCode} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Search className="w-4 h-4" />
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* ── Sub Tabs ── */}
                        <div className="mb-6 flex items-center gap-1 border-b border-gray-200 flex-wrap">
                            {subTabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = subTab === tab.name;
                                return (
                                    <button
                                        key={tab.name}
                                        onClick={() => setSubTab(tab.name)}
                                        className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${isActive ? 'font-medium bg-blue-600 text-white -mb-px' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </div>
                        {/* ── Create New ── */}
                        <div
                        title={!employeeCode ? "Select an employee first" : ""}
                        className="inline-block"
                        >
                        <button
                            onClick={handleCreateNew}
                            disabled={!employeeCode}
                            className={`px-4 py-2 rounded transition-colors flex items-center gap-2 shadow-sm
                            ${
                            employeeCode
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            <Plus className="w-4 h-4" />
                            Create New
                        </button>
                        </div>
                        {/* ── § NO OF HRS PER DAY TABLE ── */}
                        {subTab === 'No Of Hrs Per Day' && (
                            <div className="overflow-x-auto">
                                {noOfHoursLoading && (
                                    <div className="flex items-center justify-center py-10 gap-3 text-blue-600">
                                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        <span className="text-sm">Loading records…</span>
                                    </div>
                                )}
                                {noOfHoursError && !noOfHoursLoading && (
                                    <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded p-3 mb-3 text-sm">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        {noOfHoursError}
                                        <button onClick={fetchNoOfHours} className="ml-auto underline text-red-700 hover:text-red-800">Retry</button>
                                    </div>
                                )}
                                {!noOfHoursLoading && (
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100 border-b-2 border-gray-300">
                                                <th className="px-4 py-2 text-left text-gray-700 text-sm">Date In ▲</th>
                                                <th className="px-4 py-2 text-left text-gray-700 text-sm">Date Out ▲</th>
                                                <th className="px-4 py-2 text-left text-gray-700 text-sm">Workshift Code ▲</th>
                                                <th className="px-4 py-2 text-left text-gray-700 text-sm">No Of Hours [hh.mm] ▲</th>
                                                <th className="px-4 py-2 text-left text-gray-700 text-sm">Group Code ▲</th>
                                                <th className="px-4 py-2 text-left text-gray-700 text-sm">GL Code ▲</th>
                                                <th className="px-4 py-2 text-left text-gray-700 text-sm">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {noOfHoursData.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 text-sm">
                                                        {employeeCode ? 'No data available. Click Search to load records.' : 'Select an employee and click Search to load records.'}
                                                    </td>
                                                </tr>
                                            ) : noOfHoursData.map((record, index) => (
                                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{record.dateIn}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{record.dateOut}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{record.workshiftCode}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{record.noOfHours}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{record.groupCode}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{record.glCode}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleEditNoOfHours(index)} className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                                                            <button onClick={() => handleDeleteNoOfHours(index)} className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                        {subTab === 'No Of Hrs Per Day' && (
                            <Pagination
                                currentPage={noOfHoursPage}
                                totalCount={noOfHoursTotalCount}
                                pageSize={PAGE_SIZE}
                                onPageChange={setNoOfHoursPage}
                            />
                        )}
                        {/* ── § TARDINESS TABLE ── */}
                        {subTab === 'Tardiness' && (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Actions</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Date From ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Date To ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Time In ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Time Out ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Workshift Code ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Tardiness [hh.mm] ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Tardi Within Grace Period [hh.mm] ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Actual Tardiness [hh.mm] ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Remarks ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Offset OT Flag ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Group… ▲</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tardinessData.length === 0 ? (
                                            <tr><td colSpan={12} className="px-4 py-8 text-center text-gray-500 text-sm">No data available in table</td></tr>
                                        ) : tardinessData.map((record, index) => (
                                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEditTardiness(index)} className="p-1 text-blue-600 hover:bg-blue-100 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteTardiness(index)} className="p-1 text-red-600 hover:bg-red-100 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.dateFrom}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.dateTo}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.timeIn}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.timeOut}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.workShiftCode}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.tardiness}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.tardinessWithinGracePeriod}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.actualTardiness}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.remarks}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.offSetOTFlag ? 'Yes' : 'No'}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm"></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {subTab === 'Tardiness' && (
                            <Pagination
                                currentPage={tardinessPage}
                                totalCount={tardinessTotalCount}
                                pageSize={PAGE_SIZE}
                                onPageChange={setTardinessPage}
                            />
                        )}
                        {/* ── § UNDERTIME TABLE ── */}
                        {subTab === 'Undertime' && (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Actions</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Date From ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Date To ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Time In ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Time Out ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Workshift Code ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Undertime [hh.mm] ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Undertime Within Grace [hh.mm] ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Actual Undertime [hh.mm] ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Remarks ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Group Code ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">GL Code ▲</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {undertimeData.length === 0 ? (
                                            <tr><td colSpan={12} className="px-4 py-8 text-center text-gray-500 text-sm">No data available in table</td></tr>
                                        ) : undertimeData.map((record, index) => (
                                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEditUndertime(index)} className="p-1 text-blue-600 hover:bg-blue-100 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteUndertime(index)} className="p-1 text-red-600 hover:bg-red-100 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.dateFrom}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.dateTo}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.timeIn}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.timeOut}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.workshiftCode}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.undertime}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.undertimeWithinGracePeriod}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.actualUndertime}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.remarks}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm"></td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm"></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {subTab === 'Undertime' && (
                            <Pagination
                                currentPage={undertimePage}
                                totalCount={undertimeTotalCount}
                                pageSize={PAGE_SIZE}
                                onPageChange={setUndertimePage}
                            />
                        )}
                        {/* ── § LEAVE AND ABSENCES TABLE ── */}
                        {subTab === 'Leave and Absences' && (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Actions</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Date ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Hours Leave Absent ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Leave Code ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Leave Description ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Reason ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Remarks ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Group Code ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">With Pay ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Exempt for Allowance Deduction ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">GL Code ▲</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaveData.length === 0 ? (
                                            <tr><td colSpan={11} className="px-4 py-8 text-center text-gray-500 text-sm">No data available in table</td></tr>
                                        ) : leaveData.map((record, index) => (
                                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEditLeave(index)} className="p-1 text-blue-600 hover:bg-blue-100 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteLeave(index)} className="p-1 text-red-600 hover:bg-red-100 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.date}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.hoursLeaveAbsent}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.leaveCode}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.leaveDescription}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.reason}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.remarks}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm"></td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.withPay ? 'Yes' : 'No'}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.exemptForAllowanceDeduction ? 'Yes' : 'No'}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm"></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {subTab === 'Leave and Absences' && (
                            <Pagination
                                currentPage={leaveAbsencesPage}
                                totalCount={leaveAbsencesTotalCount}
                                pageSize={PAGE_SIZE}
                                onPageChange={setLeaveAbsencesPage}
                            />
                        )}
                        {/* ── § OVERTIME TABLE ── */}
                        {subTab === 'Overtime' && (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Actions</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Date From ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Date To ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Time In ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Time Out ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Workshift Code ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Overtime [hh.mm] ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">OT Code ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Reason ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Remarks ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Group Code ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">GL Code ▲</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {overtimeData.length === 0 ? (
                                            <tr><td colSpan={12} className="px-4 py-8 text-center text-gray-500 text-sm">No data available in table</td></tr>
                                        ) : overtimeData.map((record, index) => (
                                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEditOvertime(index)} className="p-1 text-blue-600 hover:bg-blue-100 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteOvertime(index)} className="p-1 text-red-600 hover:bg-red-100 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.dateFrom}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.dateTo}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.timeIn}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.timeOut}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.workshiftCode}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.overtime}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.otCode}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.reason}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{record.remarks}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm"></td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm"></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {subTab === 'Overtime' && (
                            <Pagination
                                currentPage={overtimePage}
                                totalCount={overtimeTotalCount}
                                pageSize={PAGE_SIZE}
                                onPageChange={setOvertimePage}
                            />
                        )}
                        {/* ── § OTHER EARNINGS TABLE ── */}
                        {subTab === 'Other Earnings and Allowances' && (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Actions</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Date ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Allowance Code ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Allowance Description ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Amount ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Remarks ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Group Code ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">GL Code ▲</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {otherEarningsData.length === 0 ? (
                                            <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500 text-sm">No data available in table</td></tr>
                                        ) : otherEarningsData.map((data, index) => (
                                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEditOtherEarnings(index)} className="p-1 text-blue-600 hover:bg-blue-100 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteOtherEarnings(index)} className="p-1 text-red-600 hover:bg-red-100 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{data.date}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{data.allowanceCode}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{data.description}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{data.amount}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{data.remarks}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm"></td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm"></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {subTab === 'Other Earnings and Allowances' && (
                            <Pagination
                                currentPage={otherEarningsPage}
                                totalCount={otherEarningsTotalCount}
                                pageSize={PAGE_SIZE}
                                onPageChange={setOtherEarningsPage}
                            />
                        )}
                        {/* ── § ADJUSTMENT TABLE ── */}
                        {subTab === 'Adjustment' && (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Actions</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Transaction Date ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Transaction Type ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Leave Type ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Overtime Code ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">No Of Hours [hh.mm] ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Adjust Type ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Remarks ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Group Code ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Is Late Filing ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Is Late Filing Actual Date ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Device Name ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">GL Code ▲</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {adjustmentData.length === 0 ? (
                                            <tr><td colSpan={13} className="px-4 py-8 text-center text-gray-500 text-sm">No data available in table</td></tr>
                                        ) : adjustmentData.map((data, index) => (
                                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEditAdjustment(index)} className="p-1 text-blue-600 hover:bg-blue-100 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteAdjustment(index)} className="p-1 text-red-600 hover:bg-red-100 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{data.transactionDate}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{data.transactionType}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{data.leaveType}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{data.overtimeCode}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{data.noOfHours}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{data.adjustType}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{data.remarks}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm"></td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{data.isLateFiling ? 'Yes' : 'No'}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{data.isLateFilingActualDate}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{data.borrowedDeviceName}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm"></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {subTab === 'Adjustment' && (
                            <Pagination
                                currentPage={adjustmentPage}
                                totalCount={adjustmentTotalCount}
                                pageSize={PAGE_SIZE}
                                onPageChange={setAdjustmentPage}
                            />
                        )}
                        {/* ── § ADVANCED TABLE ── */}
                        {subTab === 'Advanced' && (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Actions</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Transaction Date ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Transaction Type ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">No of Hours [hh.mm] ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Overtime Code ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Group Code ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">GL Code ▲</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {advancedData.length === 0 ? (
                                            <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500 text-sm">No data available in table</td></tr>
                                        ) : advancedData.map((data, index) => (
                                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEditAdvanced(index)} className="p-1 text-blue-600 hover:bg-blue-100 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteAdvanced(index)} className="p-1 text-red-600 hover:bg-red-100 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{data.transactionDate}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{data.transactionType}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{data.noOfHours}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{data.overtimeCode}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm"></td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm"></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {subTab === 'Advanced' && (
                            <Pagination
                                currentPage={advancedPage}
                                totalCount={advancedTotalCount}
                                pageSize={PAGE_SIZE}
                                onPageChange={setAdvancedPage}
                            />
                        )}
                        {/* ── § MODALS ── */}

                        <EmployeeSearchModal
                            isOpen={showEmpSearchModal}
                            onClose={() => setShowEmpSearchModal(false)}
                            onSelect={handleEmployeeSelect}
                            employees={employeeData}
                            loading={loadingEmployees}
                            error={employeeError ?? ''}
                        />

                        {/* No Of Hours Modal */}
                        <NoOfHoursModal
                            show={showNoOfHoursModal}
                            onClose={() => { setShowNoOfHoursModal(false); setIsEditMode(false); setEditingIndex(null); }}
                            isEditMode={isEditMode}
                            empCode={noOfHoursEmpCode}           setEmpCode={setNoOfHoursEmpCode}
                            workshiftCode={noOfHoursWorkshiftCode} setWorkshiftCode={setNoOfHoursWorkshiftCode}
                            dateIn={noOfHoursDateIn}             setDateIn={setNoOfHoursDateIn}
                            dateOut={noOfHoursDateOut}           setDateOut={setNoOfHoursDateOut}
                            noOfHours={noOfHoursNoOfHours}       setNoOfHours={setNoOfHoursNoOfHours}
                            onSubmit={handleNoOfHoursSubmit}
                            onWorkshiftSearch={() => setShowWorkshiftSearchModal(true)}
                        />

                        {/* ── Tardiness Modal ─────────────────────────────────────────────────── */}
                        <TardinessModal
                            show={showTardinessModal}
                            onClose={() => { setShowTardinessModal(false); setIsEditMode(false); setEditingIndex(null); }}
                            isEditMode={isEditMode}

                            empCode={tardinessEmpCode}                              setEmpCode={setTardinessEmpCode}
                            dateFrom={tardinessDateFrom}                            setDateFrom={setTardinessDateFrom}
                            dateTo={tardinessDateTo}                                setDateTo={setTardinessDateTo}
                            timeIn={tardinessTimeIn}                                setTimeIn={setTardinessTimeIn}
                            timeOut={tardinessTimeOut}                              setTimeOut={setTardinessTimeOut}

                            workShiftCode={tardinessWorkShiftCode}                  setWorkShiftCode={setTardinessWorkShiftCode}
                            onWorkshiftSearch={() => setShowWorkshiftSearchModal(true)}

                            tardiness={tardinessTardiness}                          setTardiness={setTardinessTardiness}
                            tardinessHHMM={tardinessTardinessHHMM}                  setTardinessHHMM={setTardinessTardinessHHMM}

                            tardinessWithinGracePeriod={tardinessTardinessWithinGracePeriod}
                            setTardinessWithinGracePeriod={setTardinessTardinessWithinGracePeriod}

                            tardinessWithinGracePeriodHHMM={tardinessTardinessWithinGracePeriodHHMM}
                            setTardinessWithinGracePeriodHHMM={setTardinessTardinessWithinGracePeriodHHMM}

                            actualTardiness={tardinessActualTardiness}              setActualTardiness={setTardinessActualTardiness}
                            actualTardinessHHMM={tardinessActualTardinessHHMM}      setActualTardinessHHMM={setTardinessActualTardinessHHMM}

                            remarks={tardinessRemarks}                              setRemarks={setTardinessRemarks}
                            groupCode={tardinessGroupCode}                          setGroupCode={setTardinessGroupCode}
                            offSetOTFlag={tardinessOffSetOTFlag}                    setOffSetOTFlag={setTardinessOffSetOTFlag}
                            exemptionRpt={tardinessExemptionRpt}                    setExemptionRpt={setTardinessExemptionRpt}
                            glCode={tardinessGLCode}                                setGLCode={setTardinessGLCode}

                            onSubmit={handleTardinessSubmit}
                        />

                        {/* Undertime Modal */}
                        <UndertimeModal
                            show={showUndertimeModal}
                            onClose={() => { setShowUndertimeModal(false); setIsEditMode(false); setEditingIndex(null); }}
                            isEditMode={isEditMode}
                            empCode={undertimeEmpCode}                     setEmpCode={setUndertimeEmpCode}
                            dateFrom={undertimeDateFrom}                   setDateFrom={setUndertimeDateFrom}
                            dateTo={undertimeDateTo}                       setDateTo={setUndertimeDateTo}
                            timeIn={undertimeTimeIn}                       setTimeIn={setUndertimeTimeIn}
                            timeOut={undertimeTimeOut}                     setTimeOut={setUndertimeTimeOut}
                            workshiftCode={undertimeWorkshiftCode}         setWorkshiftCode={setUndertimeWorkshiftCode}
                            undertime={undertimeUndertime}                 setUndertime={setUndertimeUndertime}
                            undertimeWithinGracePeriod={undertimeWithinGracePeriod} setUndertimeWithinGracePeriod={setUndertimeWithinGracePeriod}
                            actualUndertime={undertimeActualUndertime}     setActualUndertime={setUndertimeActualUndertime}
                            remarks={undertimeRemarks}                     setRemarks={setUndertimeRemarks}
                            onSubmit={handleUndertimeSubmit}
                            onWorkshiftSearch={() => setShowWorkshiftSearchModal(true)}
                        />

                        {/* Leave and Absences Modal */}
                        <LeaveAbsencesModal
                            show={showLeaveAbsencesModal}
                            onClose={() => { setShowLeaveAbsencesModal(false); setIsEditMode(false); setEditingIndex(null); }}
                            isEditMode={isEditMode}
                            empCode={leaveEmpCode}                                     setEmpCode={setLeaveEmpCode}
                            date={leaveDate}                                           setDate={setLeaveDate}
                            hoursLeaveAbsent={leaveHoursLeaveAbsent}                   setHoursLeaveAbsent={setLeaveHoursLeaveAbsent}
                            leaveCode={leaveLeaveCode}                                 setLeaveCode={setLeaveLeaveCode}
                            leaveDescription={leaveLeaveDescription}                   setLeaveDescription={setLeaveLeaveDescription}
                            reason={leaveReason}                                       setReason={setLeaveReason}
                            remarks={leaveRemarks}                                     setRemarks={setLeaveRemarks}
                            withPay={leaveWithPay}                                     setWithPay={setLeaveWithPay}
                            exemptForAllowanceDeduction={leaveExemptForAllowanceDeduction} setExemptForAllowanceDeduction={setLeaveExemptForAllowanceDeduction}
                            onSubmit={handleLeaveAbsencesSubmit}
                            onLeaveCodeSearch={() => setShowLeaveTypeSearchModal(true)}
                        />

                        {/* Overtime Modal */}
                        <OvertimeModal
                            show={showOvertimeModal}
                            onClose={() => { setShowOvertimeModal(false); setIsEditMode(false); setEditingIndex(null); }}
                            isEditMode={isEditMode}
                            empCode={overtimeEmpCode}           setEmpCode={setOvertimeEmpCode}
                            dateFrom={overtimeDateFrom}         setDateFrom={setOvertimeDateFrom}
                            dateTo={overtimeDateTo}             setDateTo={setOvertimeDateTo}
                            timeIn={overtimeTimeIn}             setTimeIn={setOvertimeTimeIn}
                            timeOut={overtimeTimeOut}           setTimeOut={setOvertimeTimeOut}
                            workshiftCode={overtimeWorkshiftCode} setWorkshiftCode={setOvertimeWorkshiftCode}
                            overtime={overtimeOvertime}         setOvertime={setOvertimeOvertime}
                            otCode={overtimeOTCode}             setOtCode={setOvertimeOTCode}
                            reason={overtimeReason}             setReason={setOvertimeReason}
                            remarks={overtimeRemarks}           setRemarks={setOvertimeRemarks}
                            onSubmit={handleOvertimeSubmit}
                            onWorkshiftSearch={() => setShowWorkshiftSearchModal(true)}
                            onOTCodeSearch={() => setShowOTCodeSearchModal(true)}
                        />

                        {/* Other Earnings Modal */}
                        <OtherEarningsModal
                            show={showOtherEarningsModal}
                            onClose={() => { setShowOtherEarningsModal(false); setIsEditMode(false); setEditingIndex(null); }}
                            isEditMode={isEditMode}
                            empCode={otherEarningsEmpCode}             setEmpCode={setOtherEarningsEmpCode}
                            date={otherEarningsDate}                   setDate={setOtherEarningsDate}
                            allowanceCode={otherEarningsAllowanceCode} setAllowanceCode={setOtherEarningsAllowanceCode}
                            description={otherEarningsDescription}     setDescription={setOtherEarningsDescription}
                            amount={otherEarningsAmount}               setAmount={setOtherEarningsAmount}
                            remarks={otherEarningsRemarks}             setRemarks={setOtherEarningsRemarks}
                            onSubmit={handleOtherEarningsSubmit}
                        />

                        {/* Adjustment Modal */}
                        <AdjustmentModal
                            show={showAdjustmentModal}
                            onClose={() => { setShowAdjustmentModal(false); setIsEditMode(false); setEditingIndex(null); }}
                            isEditMode={isEditMode}
                            empCode={adjustmentEmpCode}                           setEmpCode={setAdjustmentEmpCode}
                            transactionDate={adjustmentTransactionDate}           setTransactionDate={setAdjustmentTransactionDate}
                            transactionType={adjustmentTransactionType}           setTransactionType={setAdjustmentTransactionType}
                            leaveType={adjustmentLeaveType}                       setLeaveType={setAdjustmentLeaveType}
                            overtimeCode={adjustmentOvertimeCode}                 setOvertimeCode={setAdjustmentOvertimeCode}
                            noOfHours={adjustmentNoOfHours}                       setNoOfHours={setAdjustmentNoOfHours}
                            adjustType={adjustmentAdjustType}                     setAdjustType={setAdjustmentAdjustType}
                            remarks={adjustmentRemarks}                           setRemarks={setAdjustmentRemarks}
                            isLateFiling={adjustmentIsLateFiling}                 setIsLateFiling={setAdjustmentIsLateFiling}
                            isLateFilingActualDate={adjustmentIsLateFilingActualDate} setIsLateFilingActualDate={setAdjustmentIsLateFilingActualDate}
                            borrowedDeviceName={adjustmentBorrowedDeviceName}     setBorrowedDeviceName={setAdjustmentBorrowedDeviceName}
                            onSubmit={handleAdjustmentSubmit}
                        />

                        {/* Advanced Modal */}
                        <AdvancedModal
                            show={showAdvancedModal}
                            onClose={() => { setShowAdvancedModal(false); setIsEditMode(false); setEditingIndex(null); }}
                            isEditMode={isEditMode}
                            empCode={advancedEmpCode}                 setEmpCode={setAdvancedEmpCode}
                            transactionDate={advancedTransactionDate} setTransactionDate={setAdvancedTransactionDate}
                            transactionType={advancedTransactionType} setTransactionType={setAdvancedTransactionType}
                            noOfHours={advancedNoOfHours}             setNoOfHours={setAdvancedNoOfHours}
                            overtimeCode={advancedOvertimeCode}       setOvertimeCode={setAdvancedOvertimeCode}
                            onSubmit={handleAdvancedSubmit}
                        />

                        {/* Shared Search Modals */}
                        <WorkshiftSearchModal
                            show={showWorkshiftSearchModal}
                            onClose={() => setShowWorkshiftSearchModal(false)}
                            onSelect={handleWorkshiftSelect}
                            searchTerm={workshiftSearchTerm}
                            setSearchTerm={setWorkshiftSearchTerm}
                        />
                        <OTCodeSearchModal
                            show={showOTCodeSearchModal}
                            onClose={() => setShowOTCodeSearchModal(false)}
                            onSelect={handleOTCodeSelect}
                            searchTerm={otCodeSearchTerm}
                            setSearchTerm={setOtCodeSearchTerm}
                        />
                        <LeaveTypeSearchModal
                            show={showLeaveTypeSearchModal}
                            onClose={() => setShowLeaveTypeSearchModal(false)}
                            onSelect={handleLeaveTypeSelect}
                            searchTerm={leaveTypeSearchTerm}
                            setSearchTerm={setLeaveTypeSearchTerm}
                        />
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}