import { useState, useEffect } from 'react';
import { Check, Plus, Clock, AlertCircle, TrendingDown, CalendarX, Zap, DollarSign, Settings, Layers, Search, X, Calendar, Edit, Trash2 } from 'lucide-react';
import { AdvancedModal, AdjustmentModal, OtherEarningsModal, UndertimeModal, OvertimeModal, TardinessModal, LeaveAbsencesModal, NoOfHoursModal, WorkshiftSearchModal, OTCodeSearchModal, LeaveTypeSearchModal } from './ProcessedDataModals';
import { CalendarPopup } from './CalendarPopup';
import { Footer } from './Footer/Footer';

export function ProcessedDataPage() {
    const [employeeCode, setEmployeeCode] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [dateFrom, setDateFrom] = useState('5/5/2021');
    const [dateTo, setDateTo] = useState('05/05/2021');

    // Sub-tab state
    const [subTab, setSubTab] = useState('No Of Hrs Per Day');

    // Employee Code Search Modal
    const [showEmpCodeModal, setShowEmpCodeModal] = useState(false);
    const [empCodeSearchTerm, setEmpCodeSearchTerm] = useState('');

    // Create/Edit Modals for specific tabs
    const [showAdvancedModal, setShowAdvancedModal] = useState(false);
    const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
    const [showOtherEarningsModal, setShowOtherEarningsModal] = useState(false);
    const [showUndertimeModal, setShowUndertimeModal] = useState(false);
    const [showOvertimeModal, setShowOvertimeModal] = useState(false);
    const [showTardinessModal, setShowTardinessModal] = useState(false);
    const [showLeaveAbsencesModal, setShowLeaveAbsencesModal] = useState(false);
    const [showNoOfHoursModal, setShowNoOfHoursModal] = useState(false);
    const [showWorkshiftSearchModal, setShowWorkshiftSearchModal] = useState(false);
    const [showOTCodeSearchModal, setShowOTCodeSearchModal] = useState(false);
    const [showLeaveTypeSearchModal, setShowLeaveTypeSearchModal] = useState(false);
    const [workshiftSearchTerm, setWorkshiftSearchTerm] = useState('');
    const [otCodeSearchTerm, setOtCodeSearchTerm] = useState('');
    const [leaveTypeSearchTerm, setLeaveTypeSearchTerm] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Calendar states
    const [showDateFromCalendar, setShowDateFromCalendar] = useState(false);
    const [showDateToCalendar, setShowDateToCalendar] = useState(false);

    // Form fields for Advanced tab
    const [advancedEmpCode, setAdvancedEmpCode] = useState('');
    const [advancedTransactionDate, setAdvancedTransactionDate] = useState('');
    const [advancedTransactionType, setAdvancedTransactionType] = useState('');
    const [advancedNoOfHours, setAdvancedNoOfHours] = useState('');
    const [advancedOvertimeCode, setAdvancedOvertimeCode] = useState('');

    // Form fields for No Of Hours Per Day tab
    const [noOfHoursEmpCode, setNoOfHoursEmpCode] = useState('');
    const [noOfHoursWorkshiftCode, setNoOfHoursWorkshiftCode] = useState('');
    const [noOfHoursDateIn, setNoOfHoursDateIn] = useState('');
    const [noOfHoursDateOut, setNoOfHoursDateOut] = useState('');
    const [noOfHoursNoOfHours, setNoOfHoursNoOfHours] = useState('');

    // Form fields for Adjustment tab
    const [adjustmentEmpCode, setAdjustmentEmpCode] = useState('');
    const [adjustmentTransactionDate, setAdjustmentTransactionDate] = useState('');
    const [adjustmentTransactionType, setAdjustmentTransactionType] = useState('');
    const [adjustmentLeaveType, setAdjustmentLeaveType] = useState('');
    const [adjustmentOvertimeCode, setAdjustmentOvertimeCode] = useState('');
    const [adjustmentNoOfHours, setAdjustmentNoOfHours] = useState('');
    const [adjustmentAdjustType, setAdjustmentAdjustType] = useState('');
    const [adjustmentRemarks, setAdjustmentRemarks] = useState('');
    const [adjustmentIsLateFiling, setAdjustmentIsLateFiling] = useState(false);
    const [adjustmentIsLateFilingActualDate, setAdjustmentIsLateFilingActualDate] = useState('');
    const [adjustmentBorrowedDeviceName, setAdjustmentBorrowedDeviceName] = useState('');

    // Form fields for Other Earnings and Allowances tab
    const [otherEarningsEmpCode, setOtherEarningsEmpCode] = useState('');
    const [otherEarningsDate, setOtherEarningsDate] = useState('');
    const [otherEarningsAllowanceCode, setOtherEarningsAllowanceCode] = useState('');
    const [otherEarningsDescription, setOtherEarningsDescription] = useState('');
    const [otherEarningsAmount, setOtherEarningsAmount] = useState('');
    const [otherEarningsRemarks, setOtherEarningsRemarks] = useState('');

    // Form fields for Undertime tab
    const [undertimeEmpCode, setUndertimeEmpCode] = useState('');
    const [undertimeDateFrom, setUndertimeDateFrom] = useState('');
    const [undertimeDateTo, setUndertimeDateTo] = useState('');
    const [undertimeTimeIn, setUndertimeTimeIn] = useState('');
    const [undertimeTimeOut, setUndertimeTimeOut] = useState('');
    const [undertimeWorkshiftCode, setUndertimeWorkshiftCode] = useState('');
    const [undertimeUndertime, setUndertimeUndertime] = useState('');
    const [undertimeWithinGracePeriod, setUndertimeWithinGracePeriod] = useState('');
    const [undertimeActualUndertime, setUndertimeActualUndertime] = useState('');
    const [undertimeRemarks, setUndertimeRemarks] = useState('');

    // Form fields for Overtime tab
    const [overtimeEmpCode, setOvertimeEmpCode] = useState('');
    const [overtimeDateFrom, setOvertimeDateFrom] = useState('');
    const [overtimeDateTo, setOvertimeDateTo] = useState('');
    const [overtimeTimeIn, setOvertimeTimeIn] = useState('');
    const [overtimeTimeOut, setOvertimeTimeOut] = useState('');
    const [overtimeWorkshiftCode, setOvertimeWorkshiftCode] = useState('');
    const [overtimeOvertime, setOvertimeOvertime] = useState('');
    const [overtimeOTCode, setOvertimeOTCode] = useState('');
    const [overtimeReason, setOvertimeReason] = useState('');
    const [overtimeRemarks, setOvertimeRemarks] = useState('');

    // Form fields for Tardiness tab
    const [tardinessEmpCode, setTardinessEmpCode] = useState('');
    const [tardinessDateFrom, setTardinessDateFrom] = useState('');
    const [tardinessDateTo, setTardinessDateTo] = useState('');
    const [tardinessTimeIn, setTardinessTimeIn] = useState('');
    const [tardinessTimeOut, setTardinessTimeOut] = useState('');
    const [tardinessWorkshiftCode, setTardinessWorkshiftCode] = useState('');
    const [tardinessTardiness, setTardinessTardiness] = useState('');
    const [tardinessTardinessWithinGracePeriod, setTardinessTardinessWithinGracePeriod] = useState('');
    const [tardinessActualTardiness, setTardinessActualTardiness] = useState('');
    const [tardinessRemarks, setTardinessRemarks] = useState('');
    const [tardinessOffsetOTFlag, setTardinessOffsetOTFlag] = useState(false);
    const [tardinessExemptionRpt, setTardinessExemptionRpt] = useState('');

    // Form fields for Leave and Absences tab
    const [leaveEmpCode, setLeaveEmpCode] = useState('');
    const [leaveDate, setLeaveDate] = useState('');
    const [leaveHoursLeaveAbsent, setLeaveHoursLeaveAbsent] = useState('');
    const [leaveLeaveCode, setLeaveLeaveCode] = useState('');
    const [leaveLeaveDescription, setLeaveLeaveDescription] = useState('');
    const [leaveReason, setLeaveReason] = useState('');
    const [leaveRemarks, setLeaveRemarks] = useState('');
    const [leaveWithPay, setLeaveWithPay] = useState(false);
    const [leaveExemptForAllowanceDeduction, setLeaveExemptForAllowanceDeduction] = useState(false);

    // Sample data arrays
    const [advancedData, setAdvancedData] = useState<any[]>([]);
    const [adjustmentData, setAdjustmentData] = useState<any[]>([]);
    const [otherEarningsData, setOtherEarningsData] = useState<any[]>([]);
    const [undertimeData, setUndertimeData] = useState<any[]>([]);
    const [overtimeData, setOvertimeData] = useState<any[]>([]);
    const [tardinessData, setTardinessData] = useState<any[]>([]);
    const [leaveData, setLeaveData] = useState<any[]>([]);
    const [noOfHoursData, setNoOfHoursData] = useState<any[]>([]);

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

    // Handle ESC key to close modals
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (showEmpCodeModal) {
                    setShowEmpCodeModal(false);
                }
                if (showAdvancedModal) {
                    setShowAdvancedModal(false);
                }
                if (showAdjustmentModal) {
                    setShowAdjustmentModal(false);
                }
                if (showOtherEarningsModal) {
                    setShowOtherEarningsModal(false);
                }
                if (showUndertimeModal) {
                    setShowUndertimeModal(false);
                }
                if (showOvertimeModal) {
                    setShowOvertimeModal(false);
                }
                if (showTardinessModal) {
                    setShowTardinessModal(false);
                }
                if (showLeaveAbsencesModal) {
                    setShowLeaveAbsencesModal(false);
                }
                if (showNoOfHoursModal) {
                    setShowNoOfHoursModal(false);
                }
                if (showWorkshiftSearchModal) {
                    setShowWorkshiftSearchModal(false);
                }
                if (showOTCodeSearchModal) {
                    setShowOTCodeSearchModal(false);
                }
                if (showLeaveTypeSearchModal) {
                    setShowLeaveTypeSearchModal(false);
                }
            }
        };

        if (showEmpCodeModal || showAdvancedModal || showAdjustmentModal || showOtherEarningsModal || showUndertimeModal || showOvertimeModal || showTardinessModal || showLeaveAbsencesModal || showNoOfHoursModal || showWorkshiftSearchModal || showOTCodeSearchModal || showLeaveTypeSearchModal) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showEmpCodeModal, showAdvancedModal, showAdjustmentModal, showOtherEarningsModal, showUndertimeModal, showOvertimeModal, showTardinessModal, showLeaveAbsencesModal, showNoOfHoursModal, showWorkshiftSearchModal, showOTCodeSearchModal, showLeaveTypeSearchModal]);

    const handleEmpCodeSelect = (empCode: string, name: string) => {
        setEmployeeCode(empCode);
        setEmployeeName(name);
        setShowEmpCodeModal(false);
    };

    const filteredEmployees = employeeData.filter(emp =>
        emp.empCode.toLowerCase().includes(empCodeSearchTerm.toLowerCase()) ||
        emp.name.toLowerCase().includes(empCodeSearchTerm.toLowerCase()) ||
        emp.groupCode.toLowerCase().includes(empCodeSearchTerm.toLowerCase())
    );

    // Get header title based on sub tab
    const getHeaderTitle = () => {
        switch (subTab) {
            case 'No Of Hrs Per Day':
                return 'Process No. Hours Per Day';
            case 'Tardiness':
                return 'Process Tardiness';
            case 'Undertime':
                return 'Process Undertime';
            case 'Leave and Absences':
                return 'Process Leave and Absences';
            case 'Overtime':
                return 'Process Overtime';
            case 'Other Earnings and Allowances':
                return 'Process Other Earnings and Allowances';
            case 'Adjustment':
                return 'Process Adjustment';
            case 'Advanced':
                return 'Process Advanced';
            default:
                return 'Process No. Hours Per Day';
        }
    };

    // Sub-tabs with icons
    const subTabs = [
        { name: 'No Of Hrs Per Day', icon: Clock },
        { name: 'Tardiness', icon: AlertCircle },
        { name: 'Undertime', icon: TrendingDown },
        { name: 'Leave and Absences', icon: CalendarX },
        { name: 'Overtime', icon: Zap },
        { name: 'Other Earnings and Allowances', icon: DollarSign },
        { name: 'Adjustment', icon: Settings },
        { name: 'Advanced', icon: Layers }
    ];

    const handleSearch = () => {
        console.log('Searching with filters:', { employeeCode, employeeName, dateFrom, dateTo });
    };

    const handleAdvancedSubmit = () => {
        if (isEditMode && editingIndex !== null) {
            const updatedData = [...advancedData];
            updatedData[editingIndex] = {
                empCode: advancedEmpCode,
                transactionDate: advancedTransactionDate,
                transactionType: advancedTransactionType,
                noOfHours: advancedNoOfHours,
                overtimeCode: advancedOvertimeCode,
                groupCode: '',
                glCode: ''
            };
            setAdvancedData(updatedData);
        } else {
            setAdvancedData([
                ...advancedData,
                {
                    empCode: advancedEmpCode,
                    transactionDate: advancedTransactionDate,
                    transactionType: advancedTransactionType,
                    noOfHours: advancedNoOfHours,
                    overtimeCode: advancedOvertimeCode,
                    groupCode: '',
                    glCode: ''
                },
            ]);
        }
        setShowAdvancedModal(false);
        setIsEditMode(false);
        setEditingIndex(null);
    };

    const handleAdjustmentSubmit = () => {
        if (isEditMode && editingIndex !== null) {
            const updatedData = [...adjustmentData];
            updatedData[editingIndex] = {
                empCode: adjustmentEmpCode,
                transactionDate: adjustmentTransactionDate,
                transactionType: adjustmentTransactionType,
                leaveType: adjustmentLeaveType,
                overtimeCode: adjustmentOvertimeCode,
                noOfHours: adjustmentNoOfHours,
                adjustType: adjustmentAdjustType,
                remarks: adjustmentRemarks,
                isLateFiling: adjustmentIsLateFiling,
                isLateFilingActualDate: adjustmentIsLateFilingActualDate,
                borrowedDeviceName: adjustmentBorrowedDeviceName,
                groupCode: '',
                glCode: ''
            };
            setAdjustmentData(updatedData);
        } else {
            setAdjustmentData([
                ...adjustmentData,
                {
                    empCode: adjustmentEmpCode,
                    transactionDate: adjustmentTransactionDate,
                    transactionType: adjustmentTransactionType,
                    leaveType: adjustmentLeaveType,
                    overtimeCode: adjustmentOvertimeCode,
                    noOfHours: adjustmentNoOfHours,
                    adjustType: adjustmentAdjustType,
                    remarks: adjustmentRemarks,
                    isLateFiling: adjustmentIsLateFiling,
                    isLateFilingActualDate: adjustmentIsLateFilingActualDate,
                    borrowedDeviceName: adjustmentBorrowedDeviceName,
                    groupCode: '',
                    glCode: ''
                },
            ]);
        }
        setShowAdjustmentModal(false);
        setIsEditMode(false);
        setEditingIndex(null);
    };

    const handleOtherEarningsSubmit = () => {
        if (isEditMode && editingIndex !== null) {
            const updatedData = [...otherEarningsData];
            updatedData[editingIndex] = {
                empCode: otherEarningsEmpCode,
                date: otherEarningsDate,
                allowanceCode: otherEarningsAllowanceCode,
                description: otherEarningsDescription,
                amount: otherEarningsAmount,
                remarks: otherEarningsRemarks,
                groupCode: '',
                glCode: ''
            };
            setOtherEarningsData(updatedData);
        } else {
            setOtherEarningsData([
                ...otherEarningsData,
                {
                    empCode: otherEarningsEmpCode,
                    date: otherEarningsDate,
                    allowanceCode: otherEarningsAllowanceCode,
                    description: otherEarningsDescription,
                    amount: otherEarningsAmount,
                    remarks: otherEarningsRemarks,
                    groupCode: '',
                    glCode: ''
                },
            ]);
        }
        setShowOtherEarningsModal(false);
        setIsEditMode(false);
        setEditingIndex(null);
    };

    const handleUndertimeSubmit = () => {
        if (isEditMode && editingIndex !== null) {
            const updatedData = [...undertimeData];
            updatedData[editingIndex] = {
                empCode: undertimeEmpCode,
                dateFrom: undertimeDateFrom,
                dateTo: undertimeDateTo,
                timeIn: undertimeTimeIn,
                timeOut: undertimeTimeOut,
                workshiftCode: undertimeWorkshiftCode,
                undertime: undertimeUndertime,
                undertimeWithinGracePeriod: undertimeWithinGracePeriod,
                actualUndertime: undertimeActualUndertime,
                remarks: undertimeRemarks
            };
            setUndertimeData(updatedData);
        } else {
            setUndertimeData([
                ...undertimeData,
                {
                    empCode: undertimeEmpCode,
                    dateFrom: undertimeDateFrom,
                    dateTo: undertimeDateTo,
                    timeIn: undertimeTimeIn,
                    timeOut: undertimeTimeOut,
                    workshiftCode: undertimeWorkshiftCode,
                    undertime: undertimeUndertime,
                    undertimeWithinGracePeriod: undertimeWithinGracePeriod,
                    actualUndertime: undertimeActualUndertime,
                    remarks: undertimeRemarks
                },
            ]);
        }
        setShowUndertimeModal(false);
        setIsEditMode(false);
        setEditingIndex(null);
    };

    const handleOvertimeSubmit = () => {
        if (isEditMode && editingIndex !== null) {
            const updatedData = [...overtimeData];
            updatedData[editingIndex] = {
                empCode: overtimeEmpCode,
                dateFrom: overtimeDateFrom,
                dateTo: overtimeDateTo,
                timeIn: overtimeTimeIn,
                timeOut: overtimeTimeOut,
                workshiftCode: overtimeWorkshiftCode,
                overtime: overtimeOvertime,
                otCode: overtimeOTCode,
                reason: overtimeReason,
                remarks: overtimeRemarks
            };
            setOvertimeData(updatedData);
        } else {
            setOvertimeData([
                ...overtimeData,
                {
                    empCode: overtimeEmpCode,
                    dateFrom: overtimeDateFrom,
                    dateTo: overtimeDateTo,
                    timeIn: overtimeTimeIn,
                    timeOut: overtimeTimeOut,
                    workshiftCode: overtimeWorkshiftCode,
                    overtime: overtimeOvertime,
                    otCode: overtimeOTCode,
                    reason: overtimeReason,
                    remarks: overtimeRemarks
                },
            ]);
        }
        setShowOvertimeModal(false);
        setIsEditMode(false);
        setEditingIndex(null);
    };

    const handleTardinessSubmit = () => {
        if (isEditMode && editingIndex !== null) {
            const updatedData = [...tardinessData];
            updatedData[editingIndex] = {
                empCode: tardinessEmpCode,
                dateFrom: tardinessDateFrom,
                dateTo: tardinessDateTo,
                timeIn: tardinessTimeIn,
                timeOut: tardinessTimeOut,
                workshiftCode: tardinessWorkshiftCode,
                tardiness: tardinessTardiness,
                tardinessWithinGracePeriod: tardinessTardinessWithinGracePeriod,
                actualTardiness: tardinessActualTardiness,
                remarks: tardinessRemarks,
                offsetOTFlag: tardinessOffsetOTFlag,
                exemptionRpt: tardinessExemptionRpt
            };
            setTardinessData(updatedData);
        } else {
            setTardinessData([
                ...tardinessData,
                {
                    empCode: tardinessEmpCode,
                    dateFrom: tardinessDateFrom,
                    dateTo: tardinessDateTo,
                    timeIn: tardinessTimeIn,
                    timeOut: tardinessTimeOut,
                    workshiftCode: tardinessWorkshiftCode,
                    tardiness: tardinessTardiness,
                    tardinessWithinGracePeriod: tardinessTardinessWithinGracePeriod,
                    actualTardiness: tardinessActualTardiness,
                    remarks: tardinessRemarks,
                    offsetOTFlag: tardinessOffsetOTFlag,
                    exemptionRpt: tardinessExemptionRpt
                },
            ]);
        }
        setShowTardinessModal(false);
        setIsEditMode(false);
        setEditingIndex(null);
    };

    const handleLeaveAbsencesSubmit = () => {
        if (isEditMode && editingIndex !== null) {
            const updatedData = [...leaveData];
            updatedData[editingIndex] = {
                empCode: leaveEmpCode,
                date: leaveDate,
                hoursLeaveAbsent: leaveHoursLeaveAbsent,
                leaveCode: leaveLeaveCode,
                leaveDescription: leaveLeaveDescription,
                reason: leaveReason,
                remarks: leaveRemarks,
                withPay: leaveWithPay,
                exemptForAllowanceDeduction: leaveExemptForAllowanceDeduction
            };
            setLeaveData(updatedData);
        } else {
            setLeaveData([
                ...leaveData,
                {
                    empCode: leaveEmpCode,
                    date: leaveDate,
                    hoursLeaveAbsent: leaveHoursLeaveAbsent,
                    leaveCode: leaveLeaveCode,
                    leaveDescription: leaveLeaveDescription,
                    reason: leaveReason,
                    remarks: leaveRemarks,
                    withPay: leaveWithPay,
                    exemptForAllowanceDeduction: leaveExemptForAllowanceDeduction
                },
            ]);
        }
        setShowLeaveAbsencesModal(false);
        setIsEditMode(false);
        setEditingIndex(null);
    };

    const handleNoOfHoursSubmit = () => {
        if (isEditMode && editingIndex !== null) {
            const updatedData = [...noOfHoursData];
            updatedData[editingIndex] = {
                empCode: noOfHoursEmpCode,
                workshiftCode: noOfHoursWorkshiftCode,
                dateIn: noOfHoursDateIn,
                dateOut: noOfHoursDateOut,
                noOfHours: noOfHoursNoOfHours
            };
            setNoOfHoursData(updatedData);
        } else {
            setNoOfHoursData([
                ...noOfHoursData,
                {
                    empCode: noOfHoursEmpCode,
                    workshiftCode: noOfHoursWorkshiftCode,
                    dateIn: noOfHoursDateIn,
                    dateOut: noOfHoursDateOut,
                    noOfHours: noOfHoursNoOfHours
                },
            ]);
        }
        setShowNoOfHoursModal(false);
        setIsEditMode(false);
        setEditingIndex(null);
    };

    const handleWorkshiftSelect = (code: string, description: string) => {
        if (showUndertimeModal) {
            setUndertimeWorkshiftCode(code);
        } else if (showOvertimeModal) {
            setOvertimeWorkshiftCode(code);
        } else if (showTardinessModal) {
            setTardinessWorkshiftCode(code);
        } else if (showNoOfHoursModal) {
            setNoOfHoursWorkshiftCode(code);
        }
        setShowWorkshiftSearchModal(false);
    };

    const handleOTCodeSelect = (code: string, description: string) => {
        setOvertimeOTCode(code);
        setShowOTCodeSearchModal(false);
    };

    const handleLeaveTypeSelect = (code: string, description: string) => {
        setLeaveLeaveCode(code);
        setLeaveLeaveDescription(description);
        setShowLeaveTypeSearchModal(false);
    };

    // Delete handlers for all tabs
    const handleDeleteNoOfHours = (index: number) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            setNoOfHoursData(noOfHoursData.filter((_, i) => i !== index));
        }
    };

    const handleDeleteTardiness = (index: number) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            setTardinessData(tardinessData.filter((_, i) => i !== index));
        }
    };

    const handleDeleteUndertime = (index: number) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            setUndertimeData(undertimeData.filter((_, i) => i !== index));
        }
    };

    const handleDeleteLeave = (index: number) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            setLeaveData(leaveData.filter((_, i) => i !== index));
        }
    };

    const handleDeleteOvertime = (index: number) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            setOvertimeData(overtimeData.filter((_, i) => i !== index));
        }
    };

    const handleDeleteOtherEarnings = (index: number) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            setOtherEarningsData(otherEarningsData.filter((_, i) => i !== index));
        }
    };

    const handleDeleteAdjustment = (index: number) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            setAdjustmentData(adjustmentData.filter((_, i) => i !== index));
        }
    };

    const handleDeleteAdvanced = (index: number) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            setAdvancedData(advancedData.filter((_, i) => i !== index));
        }
    };

    // Edit handlers for all tabs
    const handleEditNoOfHours = (index: number) => {
        const record = noOfHoursData[index];
        setIsEditMode(true);
        setEditingIndex(index);
        setNoOfHoursEmpCode(record.empCode);
        setNoOfHoursWorkshiftCode(record.workshiftCode);
        setNoOfHoursDateIn(record.dateIn);
        setNoOfHoursDateOut(record.dateOut);
        setNoOfHoursNoOfHours(record.noOfHours);
        setShowNoOfHoursModal(true);
    };

    const handleEditTardiness = (index: number) => {
        const record = tardinessData[index];
        setIsEditMode(true);
        setEditingIndex(index);
        setTardinessEmpCode(record.empCode);
        setTardinessDateFrom(record.dateFrom);
        setTardinessDateTo(record.dateTo);
        setTardinessTimeIn(record.timeIn);
        setTardinessTimeOut(record.timeOut);
        setTardinessWorkshiftCode(record.workshiftCode);
        setTardinessTardiness(record.tardiness);
        setTardinessTardinessWithinGracePeriod(record.tardinessWithinGracePeriod);
        setTardinessActualTardiness(record.actualTardiness);
        setTardinessRemarks(record.remarks);
        setTardinessOffsetOTFlag(record.offsetOTFlag);
        setTardinessExemptionRpt(record.exemptionRpt);
        setShowTardinessModal(true);
    };

    const handleEditUndertime = (index: number) => {
        const record = undertimeData[index];
        setIsEditMode(true);
        setEditingIndex(index);
        setUndertimeEmpCode(record.empCode);
        setUndertimeDateFrom(record.dateFrom);
        setUndertimeDateTo(record.dateTo);
        setUndertimeTimeIn(record.timeIn);
        setUndertimeTimeOut(record.timeOut);
        setUndertimeWorkshiftCode(record.workshiftCode);
        setUndertimeUndertime(record.undertime);
        setUndertimeWithinGracePeriod(record.undertimeWithinGracePeriod);
        setUndertimeActualUndertime(record.actualUndertime);
        setUndertimeRemarks(record.remarks);
        setShowUndertimeModal(true);
    };

    const handleEditLeave = (index: number) => {
        const record = leaveData[index];
        setIsEditMode(true);
        setEditingIndex(index);
        setLeaveEmpCode(record.empCode);
        setLeaveDate(record.date);
        setLeaveHoursLeaveAbsent(record.hoursLeaveAbsent);
        setLeaveLeaveCode(record.leaveCode);
        setLeaveLeaveDescription(record.leaveDescription);
        setLeaveReason(record.reason);
        setLeaveRemarks(record.remarks);
        setLeaveWithPay(record.withPay);
        setLeaveExemptForAllowanceDeduction(record.exemptForAllowanceDeduction);
        setShowLeaveAbsencesModal(true);
    };

    const handleEditOvertime = (index: number) => {
        const record = overtimeData[index];
        setIsEditMode(true);
        setEditingIndex(index);
        setOvertimeEmpCode(record.empCode);
        setOvertimeDateFrom(record.dateFrom);
        setOvertimeDateTo(record.dateTo);
        setOvertimeTimeIn(record.timeIn);
        setOvertimeTimeOut(record.timeOut);
        setOvertimeWorkshiftCode(record.workshiftCode);
        setOvertimeOvertime(record.overtime);
        setOvertimeOTCode(record.otCode);
        setOvertimeReason(record.reason);
        setOvertimeRemarks(record.remarks);
        setShowOvertimeModal(true);
    };

    const handleEditOtherEarnings = (index: number) => {
        const record = otherEarningsData[index];
        setIsEditMode(true);
        setEditingIndex(index);
        setOtherEarningsEmpCode(record.empCode);
        setOtherEarningsDate(record.date);
        setOtherEarningsAllowanceCode(record.allowanceCode);
        setOtherEarningsDescription(record.description);
        setOtherEarningsAmount(record.amount);
        setOtherEarningsRemarks(record.remarks);
        setShowOtherEarningsModal(true);
    };

    const handleEditAdjustment = (index: number) => {
        const record = adjustmentData[index];
        setIsEditMode(true);
        setEditingIndex(index);
        setAdjustmentEmpCode(record.empCode);
        setAdjustmentTransactionDate(record.transactionDate);
        setAdjustmentTransactionType(record.transactionType);
        setAdjustmentLeaveType(record.leaveType);
        setAdjustmentOvertimeCode(record.overtimeCode);
        setAdjustmentNoOfHours(record.noOfHours);
        setAdjustmentAdjustType(record.adjustType);
        setAdjustmentRemarks(record.remarks);
        setAdjustmentIsLateFiling(record.isLateFiling);
        setAdjustmentIsLateFilingActualDate(record.isLateFilingActualDate);
        setAdjustmentBorrowedDeviceName(record.borrowedDeviceName);
        setShowAdjustmentModal(true);
    };

    const handleEditAdvanced = (index: number) => {
        const record = advancedData[index];
        setIsEditMode(true);
        setEditingIndex(index);
        setAdvancedEmpCode(record.empCode);
        setAdvancedTransactionDate(record.transactionDate);
        setAdvancedTransactionType(record.transactionType);
        setAdvancedNoOfHours(record.noOfHours);
        setAdvancedOvertimeCode(record.overtimeCode);
        setShowAdvancedModal(true);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Main Content */}
            <div className="flex-1 relative z-10 p-6">
                <div className="max-w-7xl mx-auto relative">
                    {/* Page Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
                        <h1 className="text-white">{getHeaderTitle()}</h1>
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
                                        Process and manage employee attendance data including hours worked, tardiness, undertime, leaves, and overtime. Review and approve processed timekeeping records for accurate payroll calculation.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Track daily work hours</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Monitor tardiness and undertime</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Process overtime records</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">Manage leave and absences</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search Filters */}
                        <div className="mb-6 space-y-4">
                            {/* Employee Info Display */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-bold text-gray-700 w-32">Employee Code</label>
                                <input
                                    type="text"
                                    value={employeeCode}
                                    onChange={(e) => setEmployeeCode(e.target.value)}
                                    readOnly
                                    className="w-48 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                />
                                <button
                                    onClick={() => setShowEmpCodeModal(true)}
                                    className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                >
                                    <Search className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        setEmployeeCode('');
                                        setEmployeeName('');
                                    }}
                                    className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <label className="text-sm font-bold text-gray-700 ml-4">Employee Name</label>
                                <input
                                    type="text"
                                    value={employeeName}
                                    readOnly
                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded bg-gray-50"
                                />
                                <button
                                    onClick={handleSearch}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <Search className="w-4 h-4" />
                                    Search
                                </button>
                                </div>
                            </div>

                            {/* Date Range and Search */}
                            <div className="flex items-center gap-4 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-4">
                                <label className="text-gray-700 font-bold text-sm">Date From</label>
                                <input
                                    type="text"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
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
                                <label className="text-sm font-bold text-gray-700 ml-4">Date To</label>
                                <input
                                    type="text"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="MM/DD/YYYY"
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
                                <button
                                    onClick={handleSearch}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <Search className="w-4 h-4" />
                                    Search
                                </button>
                                </div>
                            </div>
                        </div>

                        {/* Sub Tabs */}
                        <div className="mb-6 flex items-center gap-1 border-b border-gray-200 flex-wrap">
                            {subTabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = subTab === tab.name;
                                return (
                                    <button
                                        key={tab.name}
                                        onClick={() => setSubTab(tab.name)}
                                        className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${isActive
                                            ? 'font-medium bg-blue-600 text-white -mb-px'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        } transition-colors`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Create New Button */}
                        <div className="mb-4">
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                                onClick={() => {
                                    setIsEditMode(false);
                                    setEditingIndex(null);
                                    if (subTab === 'No Of Hrs Per Day') {
                                        setNoOfHoursEmpCode('');
                                        setNoOfHoursWorkshiftCode('');
                                        setNoOfHoursDateIn('');
                                        setNoOfHoursDateOut('');
                                        setNoOfHoursNoOfHours('');
                                        setShowNoOfHoursModal(true);
                                    } else if (subTab === 'Advanced') {
                                        setAdvancedEmpCode('');
                                        setAdvancedTransactionDate('');
                                        setAdvancedTransactionType('');
                                        setAdvancedNoOfHours('');
                                        setAdvancedOvertimeCode('');
                                        setShowAdvancedModal(true);
                                    } else if (subTab === 'Adjustment') {
                                        setAdjustmentEmpCode('');
                                        setAdjustmentTransactionDate('');
                                        setAdjustmentTransactionType('');
                                        setAdjustmentLeaveType('');
                                        setAdjustmentOvertimeCode('');
                                        setAdjustmentNoOfHours('');
                                        setAdjustmentAdjustType('');
                                        setAdjustmentRemarks('');
                                        setAdjustmentIsLateFiling(false);
                                        setAdjustmentIsLateFilingActualDate('');
                                        setAdjustmentBorrowedDeviceName('');
                                        setShowAdjustmentModal(true);
                                    } else if (subTab === 'Other Earnings and Allowances') {
                                        setOtherEarningsEmpCode('');
                                        setOtherEarningsDate('');
                                        setOtherEarningsAllowanceCode('');
                                        setOtherEarningsDescription('');
                                        setOtherEarningsAmount('');
                                        setOtherEarningsRemarks('');
                                        setShowOtherEarningsModal(true);
                                    } else if (subTab === 'Undertime') {
                                        setUndertimeEmpCode('');
                                        setUndertimeDateFrom('');
                                        setUndertimeDateTo('');
                                        setUndertimeTimeIn('');
                                        setUndertimeTimeOut('');
                                        setUndertimeWorkshiftCode('');
                                        setUndertimeUndertime('');
                                        setUndertimeWithinGracePeriod('');
                                        setUndertimeActualUndertime('');
                                        setUndertimeRemarks('');
                                        setShowUndertimeModal(true);
                                    } else if (subTab === 'Overtime') {
                                        setOvertimeEmpCode('');
                                        setOvertimeDateFrom('');
                                        setOvertimeDateTo('');
                                        setOvertimeTimeIn('');
                                        setOvertimeTimeOut('');
                                        setOvertimeWorkshiftCode('');
                                        setOvertimeOvertime('');
                                        setOvertimeOTCode('');
                                        setOvertimeReason('');
                                        setOvertimeRemarks('');
                                        setShowOvertimeModal(true);
                                    } else if (subTab === 'Tardiness') {
                                        setTardinessEmpCode('');
                                        setTardinessDateFrom('');
                                        setTardinessDateTo('');
                                        setTardinessTimeIn('');
                                        setTardinessTimeOut('');
                                        setTardinessWorkshiftCode('');
                                        setTardinessTardiness('');
                                        setTardinessTardinessWithinGracePeriod('');
                                        setTardinessActualTardiness('');
                                        setTardinessRemarks('');
                                        setTardinessOffsetOTFlag(false);
                                        setTardinessExemptionRpt('');
                                        setShowTardinessModal(true);
                                    } else if (subTab === 'Leave and Absences') {
                                        setLeaveEmpCode('');
                                        setLeaveDate('');
                                        setLeaveHoursLeaveAbsent('');
                                        setLeaveLeaveCode('');
                                        setLeaveLeaveDescription('');
                                        setLeaveReason('');
                                        setLeaveRemarks('');
                                        setLeaveWithPay(false);
                                        setLeaveExemptForAllowanceDeduction(false);
                                        setShowLeaveAbsencesModal(true);
                                    }
                                }}
                            >
                                <Plus className="w-4 h-4" />
                                Create New
                            </button>
                        </div>

                        {/* Table - No Of Hrs Per Day */}
                        {subTab === 'No Of Hrs Per Day' && (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Actions</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Date In ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Date Out ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Workshift Code ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">No Of Hours [hh.mm] ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Group Code ▲</th>
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">GL Code ▲</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {noOfHoursData.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500 text-sm">
                                                    No data available in table
                                                </td>
                                            </tr>
                                        ) : (
                                            noOfHoursData.map((record, index) => (
                                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleEditNoOfHours(index)}
                                                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteNoOfHours(index)}
                                                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{record.dateIn}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{record.dateOut}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{record.workshiftCode}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{record.noOfHours}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm"></td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm"></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Table - Tardiness */}
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
                                            <th className="px-4 py-2 text-left text-gray-700 text-sm">Group... ▲</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tardinessData.length === 0 ? (
                                            <tr>
                                                <td colSpan={12} className="px-4 py-8 text-center text-gray-500 text-sm">
                                                    No data available in table
                                                </td>
                                            </tr>
                                        ) : (
                                            tardinessData.map((record, index) => (
                                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleEditTardiness(index)}
                                                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteTardiness(index)}
                                                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{record.dateFrom}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{record.dateTo}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{record.timeIn}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{record.timeOut}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{record.workshiftCode}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{record.tardiness}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{record.tardinessWithinGracePeriod}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{record.actualTardiness}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{record.remarks}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{record.offsetOTFlag ? 'Yes' : 'No'}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm"></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Table - Undertime */}
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
                                            <tr>
                                                <td colSpan={12} className="px-4 py-8 text-center text-gray-500 text-sm">
                                                    No data available in table
                                                </td>
                                            </tr>
                                        ) : (
                                            undertimeData.map((record, index) => (
                                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleEditUndertime(index)}
                                                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUndertime(index)}
                                                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
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
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Table - Leave and Absences */}
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
                                            <tr>
                                                <td colSpan={11} className="px-4 py-8 text-center text-gray-500 text-sm">
                                                    No data available in table
                                                </td>
                                            </tr>
                                        ) : (
                                            leaveData.map((record, index) => (
                                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleEditLeave(index)}
                                                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteLeave(index)}
                                                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
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
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Table - Overtime */}
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
                                            <tr>
                                                <td colSpan={12} className="px-4 py-8 text-center text-gray-500 text-sm">
                                                    No data available in table
                                                </td>
                                            </tr>
                                        ) : (
                                            overtimeData.map((record, index) => (
                                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleEditOvertime(index)}
                                                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteOvertime(index)}
                                                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
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
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Table - Other Earnings and Allowances */}
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
                                            <tr>
                                                <td colSpan={8} className="px-4 py-8 text-center text-gray-500 text-sm">
                                                    No data available in table
                                                </td>
                                            </tr>
                                        ) : (
                                            otherEarningsData.map((data, index) => (
                                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleEditOtherEarnings(index)}
                                                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteOtherEarnings(index)}
                                                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
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
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Table - Adjustment */}
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
                                            <tr>
                                                <td colSpan={13} className="px-4 py-8 text-center text-gray-500 text-sm">
                                                    No data available in table
                                                </td>
                                            </tr>
                                        ) : (
                                            adjustmentData.map((data, index) => (
                                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleEditAdjustment(index)}
                                                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteAdjustment(index)}
                                                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
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
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Table - Advanced */}
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
                                            <tr>
                                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500 text-sm">
                                                    No data available in table
                                                </td>
                                            </tr>
                                        ) : (
                                            advancedData.map((data, index) => (
                                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleEditAdvanced(index)}
                                                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteAdvanced(index)}
                                                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{data.transactionDate}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{data.transactionType}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{data.noOfHours}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{data.overtimeCode}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm"></td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm"></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-gray-600 text-sm">
                                Showing 0 to 0 of 0 entries
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

                        {/* Employee Code Search Modal */}
                        {showEmpCodeModal && (
                            <>
                                {/* Modal Backdrop */}
                                <div
                                    className="fixed inset-0 bg-black/30 z-30"
                                    onClick={() => setShowEmpCodeModal(false)}
                                ></div>

                                {/* Modal Dialog */}
                                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-3xl px-4">
                                    <div className="bg-white rounded-lg shadow-2xl border border-gray-300">
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

                        {/* Advanced Modal */}
                        <AdvancedModal
                            show={showAdvancedModal}
                            onClose={() => {
                                setShowAdvancedModal(false);
                                setIsEditMode(false);
                                setEditingIndex(null);
                            }}
                            isEditMode={isEditMode}
                            empCode={advancedEmpCode}
                            setEmpCode={setAdvancedEmpCode}
                            transactionDate={advancedTransactionDate}
                            setTransactionDate={setAdvancedTransactionDate}
                            transactionType={advancedTransactionType}
                            setTransactionType={setAdvancedTransactionType}
                            noOfHours={advancedNoOfHours}
                            setNoOfHours={setAdvancedNoOfHours}
                            overtimeCode={advancedOvertimeCode}
                            setOvertimeCode={setAdvancedOvertimeCode}
                            onSubmit={handleAdvancedSubmit}
                        />

                        {/* Adjustment Modal */}
                        <AdjustmentModal
                            show={showAdjustmentModal}
                            onClose={() => {
                                setShowAdjustmentModal(false);
                                setIsEditMode(false);
                                setEditingIndex(null);
                            }}
                            isEditMode={isEditMode}
                            empCode={adjustmentEmpCode}
                            setEmpCode={setAdjustmentEmpCode}
                            transactionDate={adjustmentTransactionDate}
                            setTransactionDate={setAdjustmentTransactionDate}
                            transactionType={adjustmentTransactionType}
                            setTransactionType={setAdjustmentTransactionType}
                            leaveType={adjustmentLeaveType}
                            setLeaveType={setAdjustmentLeaveType}
                            overtimeCode={adjustmentOvertimeCode}
                            setOvertimeCode={setAdjustmentOvertimeCode}
                            noOfHours={adjustmentNoOfHours}
                            setNoOfHours={setAdjustmentNoOfHours}
                            adjustType={adjustmentAdjustType}
                            setAdjustType={setAdjustmentAdjustType}
                            remarks={adjustmentRemarks}
                            setRemarks={setAdjustmentRemarks}
                            isLateFiling={adjustmentIsLateFiling}
                            setIsLateFiling={setAdjustmentIsLateFiling}
                            isLateFilingActualDate={adjustmentIsLateFilingActualDate}
                            setIsLateFilingActualDate={setAdjustmentIsLateFilingActualDate}
                            borrowedDeviceName={adjustmentBorrowedDeviceName}
                            setBorrowedDeviceName={setAdjustmentBorrowedDeviceName}
                            onSubmit={handleAdjustmentSubmit}
                        />

                        {/* Other Earnings Modal */}
                        <OtherEarningsModal
                            show={showOtherEarningsModal}
                            onClose={() => {
                                setShowOtherEarningsModal(false);
                                setIsEditMode(false);
                                setEditingIndex(null);
                            }}
                            isEditMode={isEditMode}
                            empCode={otherEarningsEmpCode}
                            setEmpCode={setOtherEarningsEmpCode}
                            date={otherEarningsDate}
                            setDate={setOtherEarningsDate}
                            allowanceCode={otherEarningsAllowanceCode}
                            setAllowanceCode={setOtherEarningsAllowanceCode}
                            description={otherEarningsDescription}
                            setDescription={setOtherEarningsDescription}
                            amount={otherEarningsAmount}
                            setAmount={setOtherEarningsAmount}
                            remarks={otherEarningsRemarks}
                            setRemarks={setOtherEarningsRemarks}
                            onSubmit={handleOtherEarningsSubmit}
                        />

                        {/* Undertime Modal */}
                        <UndertimeModal
                            show={showUndertimeModal}
                            onClose={() => setShowUndertimeModal(false)}
                            isEditMode={isEditMode}
                            empCode={undertimeEmpCode}
                            setEmpCode={setUndertimeEmpCode}
                            dateFrom={undertimeDateFrom}
                            setDateFrom={setUndertimeDateFrom}
                            dateTo={undertimeDateTo}
                            setDateTo={setUndertimeDateTo}
                            timeIn={undertimeTimeIn}
                            setTimeIn={setUndertimeTimeIn}
                            timeOut={undertimeTimeOut}
                            setTimeOut={setUndertimeTimeOut}
                            workshiftCode={undertimeWorkshiftCode}
                            setWorkshiftCode={setUndertimeWorkshiftCode}
                            undertime={undertimeUndertime}
                            setUndertime={setUndertimeUndertime}
                            undertimeWithinGracePeriod={undertimeWithinGracePeriod}
                            setUndertimeWithinGracePeriod={setUndertimeWithinGracePeriod}
                            actualUndertime={undertimeActualUndertime}
                            setActualUndertime={setUndertimeActualUndertime}
                            remarks={undertimeRemarks}
                            setRemarks={setUndertimeRemarks}
                            onSubmit={handleUndertimeSubmit}
                            onWorkshiftSearch={() => setShowWorkshiftSearchModal(true)}
                        />

                        {/* Overtime Modal */}
                        <OvertimeModal
                            show={showOvertimeModal}
                            onClose={() => setShowOvertimeModal(false)}
                            isEditMode={isEditMode}
                            empCode={overtimeEmpCode}
                            setEmpCode={setOvertimeEmpCode}
                            dateFrom={overtimeDateFrom}
                            setDateFrom={setOvertimeDateFrom}
                            dateTo={overtimeDateTo}
                            setDateTo={setOvertimeDateTo}
                            timeIn={overtimeTimeIn}
                            setTimeIn={setOvertimeTimeIn}
                            timeOut={overtimeTimeOut}
                            setTimeOut={setOvertimeTimeOut}
                            workshiftCode={overtimeWorkshiftCode}
                            setWorkshiftCode={setOvertimeWorkshiftCode}
                            overtime={overtimeOvertime}
                            setOvertime={setOvertimeOvertime}
                            otCode={overtimeOTCode}
                            setOtCode={setOvertimeOTCode}
                            reason={overtimeReason}
                            setReason={setOvertimeReason}
                            remarks={overtimeRemarks}
                            setRemarks={setOvertimeRemarks}
                            onSubmit={handleOvertimeSubmit}
                            onWorkshiftSearch={() => setShowWorkshiftSearchModal(true)}
                            onOTCodeSearch={() => setShowOTCodeSearchModal(true)}
                        />

                        {/* Tardiness Modal */}
                        <TardinessModal
                            show={showTardinessModal}
                            onClose={() => setShowTardinessModal(false)}
                            isEditMode={isEditMode}
                            empCode={tardinessEmpCode}
                            setEmpCode={setTardinessEmpCode}
                            dateFrom={tardinessDateFrom}
                            setDateFrom={setTardinessDateFrom}
                            dateTo={tardinessDateTo}
                            setDateTo={setTardinessDateTo}
                            timeIn={tardinessTimeIn}
                            setTimeIn={setTardinessTimeIn}
                            timeOut={tardinessTimeOut}
                            setTimeOut={setTardinessTimeOut}
                            workshiftCode={tardinessWorkshiftCode}
                            setWorkshiftCode={setTardinessWorkshiftCode}
                            tardiness={tardinessTardiness}
                            setTardiness={setTardinessTardiness}
                            tardinessWithinGracePeriod={tardinessTardinessWithinGracePeriod}
                            setTardinessWithinGracePeriod={setTardinessTardinessWithinGracePeriod}
                            actualTardiness={tardinessActualTardiness}
                            setActualTardiness={setTardinessActualTardiness}
                            remarks={tardinessRemarks}
                            setRemarks={setTardinessRemarks}
                            offsetOTFlag={tardinessOffsetOTFlag}
                            setOffsetOTFlag={setTardinessOffsetOTFlag}
                            exemptionRpt={tardinessExemptionRpt}
                            setExemptionRpt={setTardinessExemptionRpt}
                            onSubmit={handleTardinessSubmit}
                            onWorkshiftSearch={() => setShowWorkshiftSearchModal(true)}
                        />

                        {/* Leave and Absences Modal */}
                        <LeaveAbsencesModal
                            show={showLeaveAbsencesModal}
                            onClose={() => setShowLeaveAbsencesModal(false)}
                            isEditMode={isEditMode}
                            empCode={leaveEmpCode}
                            setEmpCode={setLeaveEmpCode}
                            date={leaveDate}
                            setDate={setLeaveDate}
                            hoursLeaveAbsent={leaveHoursLeaveAbsent}
                            setHoursLeaveAbsent={setLeaveHoursLeaveAbsent}
                            leaveCode={leaveLeaveCode}
                            setLeaveCode={setLeaveLeaveCode}
                            leaveDescription={leaveLeaveDescription}
                            setLeaveDescription={setLeaveLeaveDescription}
                            reason={leaveReason}
                            setReason={setLeaveReason}
                            remarks={leaveRemarks}
                            setRemarks={setLeaveRemarks}
                            withPay={leaveWithPay}
                            setWithPay={setLeaveWithPay}
                            exemptForAllowanceDeduction={leaveExemptForAllowanceDeduction}
                            setExemptForAllowanceDeduction={setLeaveExemptForAllowanceDeduction}
                            onSubmit={handleLeaveAbsencesSubmit}
                            onLeaveCodeSearch={() => setShowLeaveTypeSearchModal(true)}
                        />

                        {/* No Of Hours Per Day Modal */}
                        <NoOfHoursModal
                            show={showNoOfHoursModal}
                            onClose={() => setShowNoOfHoursModal(false)}
                            isEditMode={isEditMode}
                            empCode={noOfHoursEmpCode}
                            setEmpCode={setNoOfHoursEmpCode}
                            workshiftCode={noOfHoursWorkshiftCode}
                            setWorkshiftCode={setNoOfHoursWorkshiftCode}
                            dateIn={noOfHoursDateIn}
                            setDateIn={setNoOfHoursDateIn}
                            dateOut={noOfHoursDateOut}
                            setDateOut={setNoOfHoursDateOut}
                            noOfHours={noOfHoursNoOfHours}
                            setNoOfHours={setNoOfHoursNoOfHours}
                            onSubmit={handleNoOfHoursSubmit}
                            onWorkshiftSearch={() => setShowWorkshiftSearchModal(true)}
                        />

                        {/* Workshift Search Modal */}
                        <WorkshiftSearchModal
                            show={showWorkshiftSearchModal}
                            onClose={() => setShowWorkshiftSearchModal(false)}
                            onSelect={handleWorkshiftSelect}
                            searchTerm={workshiftSearchTerm}
                            setSearchTerm={setWorkshiftSearchTerm}
                        />

                        {/* OT Code Search Modal */}
                        <OTCodeSearchModal
                            show={showOTCodeSearchModal}
                            onClose={() => setShowOTCodeSearchModal(false)}
                            onSelect={handleOTCodeSelect}
                            searchTerm={otCodeSearchTerm}
                            setSearchTerm={setOtCodeSearchTerm}
                        />

                        {/* Leave Type Search Modal */}
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

            {/* Footer */}
            <Footer />
        </div>
    );
}