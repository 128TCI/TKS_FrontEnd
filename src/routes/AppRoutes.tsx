import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { ProtectedLayout } from '../layouts/ProtectedLayout';

// Auth Pages
import { LoginPage } from '../components/LoginPage';
import { ForgotPasswordPage } from '../components/ForgotPasswordPage';

// Dashboard
import { Dashboard } from '../components/Dashboard/Dashboard';

// ─── File Setup ───────────────────────────────────────────────────────────────
// System
import { CompanyInformation } from '../components/FileSetup/System/CompanyInformation';
// Process – Allowance & Earnings
import { AllowanceBracketCodeSetupPage } from '../components/FileSetup/Process/AllowanceAndEarning/AllowanceBracketCodeSetupPage';
import { AllowanceBracketingSetupPage } from '../components/FileSetup/Process/AllowanceAndEarning/AllowanceBracketingSetupPage';
import { AllowancePerClassificationSetupPage } from '../components/FileSetup/Process/AllowanceAndEarning/AllowancePerClassificationSetupPage';
import { ClassificationSetupPage } from '../components/FileSetup/Process/AllowanceAndEarning/ClassificationSetupPage';
import { EarningSetupPage } from '../components/FileSetup/Process/AllowanceAndEarning/EarningSetupPage';
// Process – Calendar & Day
import { CalendarSetup } from '../components/FileSetup/Process/CalendarSetup';
import { DayTypeSetupPage } from '../components/FileSetup/Process/DayTypeSetupPage';
// Process – Device
import { AMSDatabaseConfigurationSetupPage } from '../components/FileSetup/Process/Device/AMSDatabaseConfigurationSetupPage';
import { BorrowedDeviceNamePage } from '../components/FileSetup/Process/Device/BorrowedDeviceNamePage';
import { CoordinatesSetupPage } from '../components/FileSetup/Process/Device/CoordinatesSetupPage';
import { DeviceTypeSetupPage } from '../components/FileSetup/Process/Device/DeviceTypeSetupPage';
import { DTRFlagSetupPage } from '../components/FileSetup/Process/Device/DTRFlagSetupPage';
import { DTRLogFieldsSetupPage } from '../components/FileSetup/Process/Device/DTRLogFieldsSetupPage';
import { SDKListSetupPage } from '../components/FileSetup/Process/Device/SDKListSetupPage';
import { MySQLDatabaseConfigurationSetupPage } from '../components/FileSetup/Process/Device/MySQLDatabaseConfigurationSetupPage';
// Process – Overtime
import { AdditionalOTHoursPerWeekPage } from '../components/FileSetup/Process/Overtime/AdditionalOTHoursPerWeekPage';
import { HolidayOTRateSetupPage } from '../components/FileSetup/Process/Overtime/HolidayOTRateSetupPage';
import { OvertimeSetupPage } from '../components/FileSetup/Process/Overtime/OvertimeSetupPage';
import { RegularOvertimeSetupPage } from '../components/FileSetup/Process/Overtime/RegularOvertimeSetupPage';
import { RestDayOvertimeSetupPage } from '../components/FileSetup/Process/Overtime/RestDayOvertimeSetupPage';
// Process – Tardiness
import { BracketCodeSetupPage } from '../components/FileSetup/Process/Tardines-setup/BracketCodeSetupPage';
import { TardinessUndertimeAccumulationTableSetupPage } from '../components/FileSetup/Process/Tardines-setup/TardinessUndertimeAccumulationTableSetupPage';
// Process – Workshift & Restday
import { DailyScheduleSetupPage } from '../components/FileSetup/Process/WorkshipAndRestday/DailyScheduleSetupPage';
import { RestDaySetupPage } from '../components/FileSetup/Process/WorkshipAndRestday/RestDaySetupPage';
import { WorkshiftSetupPage } from '../components/FileSetup/Process/WorkshipAndRestday/WorkshiftSetupPage';
// Process – Misc
import { EquivalentHoursDeductionSetupPage } from '../components/FileSetup/Process/EquivalentHoursDeductionSetupPage';
import { GroupScheduleSetupPage } from '../components/FileSetup/Process/GroupScheduleSetupPage';
import { HelpSetupPage } from '../components/FileSetup/Process/HelpSetupPage';
import { LeaveTypeSetupPage } from '../components/FileSetup/Process/LeaveTypeSetupPage';
import { PayrollLocationSetupPage } from '../components/FileSetup/Process/PayrollLocationSetupPage';
import { SystemConfigurationSetupPage } from '../components/FileSetup/Process/SystemConfigurationSetupPage';
import { TimeKeepGroupPage } from '../components/FileSetup/Process/TimeKeepGroupPage';
import { UnpaidLunchDeductionBracketSetupPage } from '../components/FileSetup/Process/UnpaidLunchDeductionBracketSetupPage';
// Employment
import { AreaSetupPage } from '../components/FileSetup/Employment/AreaSetupPage';
import { BranchSetupPage } from '../components/FileSetup/Employment/BranchSetupPage';
import { DepartmentSetupPage } from '../components/FileSetup/Employment/DepartmentSetupPage';
import { DivisionSetupPage } from '../components/FileSetup/Employment/DivisionSetupPage';
import { EmployeeDesignationSetupPage } from '../components/FileSetup/Employment/EmployeeDesignationSetupPage';
import { EmployeeStatusSetupPage } from '../components/FileSetup/Employment/EmployeeStatusSetupPage';
import { GroupSetupPage } from '../components/FileSetup/Employment/GroupSetupPage';
import { JobLevelSetupPage } from '../components/FileSetup/Employment/JobLevelSetupPage';
import { LocationSetupPage } from '../components/FileSetup/Employment/LocationSetupPage';
import { OnlineApprovalSetupPage } from '../components/FileSetup/Employment/OnlineApprovalSetupPage';
import { PayHouseSetupPage } from '../components/FileSetup/Employment/PayHouseSetupPage';
import { SectionSetupPage } from '../components/FileSetup/Employment/SectionSetupPage';
import { UnitSetupPage } from '../components/FileSetup/Employment/UnitSetupPage';

// ─── Maintenance ──────────────────────────────────────────────────────────────
import { EmployeeMasterFilePage } from '../components/Maintenance/EmployeeMasterFilePage';
import { EmployeeTimekeepConfigPage } from '../components/Maintenance/EmployeeTimekeepConfigPage';
import { RawDataPage } from '../components/Maintenance/RawDataPage';
import { RawdataOtGapPage } from '../components/Maintenance/RawdataOtGapPage';
import { RawdataOnStraightDutyPage } from '../components/Maintenance/RawdataOnStraightDutyPage';
import { ProcessedDataPage } from '../components/Maintenance/ProcessedDataPage';
import { TwoShiftsEmployeeTimekeepConfigPage } from '../components/Maintenance/TwoShiftsEmployeeTimekeepConfigPage';
import { TwoShiftsRawDataPage } from '../components/Maintenance/TwoShiftsRawDataPage';
import { UpdateRawdataOnlinePage } from '../components/Maintenance/UpdateRawdataOnlinePage';

// ─── Process ──────────────────────────────────────────────────────────────────
import { ProcessPage } from '../components/Process/ProcessPage';
import { Process2ShiftsPayrollPage } from '../components/Process/Process2ShiftsPayrollPage';

// ─── Reports ──────────────────────────────────────────────────────────────────
import { DailyTimeRecordMonitoringPage } from '../components/Reports/DailyTimeRecordMonitoringPage';

// ─── Import ───────────────────────────────────────────────────────────────────
import { WorkshiftVariablePage } from '../components/Import/WorkshiftVariablePage';
import { LeaveApplicationPage } from '../components/Import/LeaveApplicationPage';
import { OvertimeApplicationPage } from '../components/Import/OvertimeApplicationPage';
import { ImportDeviceCodePage } from '../components/Import/ImportDeviceCodePage';
import { ImportEmployeeMasterfilePage } from '../components/Import/ImportEmployeeMasterfilePage';
import { ImportLogsFromDeviceV2Page } from '../components/Import/ImportLogsFromDeviceV2Page';
import { UpdateRawDataPage } from '../components/Import/UpdateRawDataPage';
import { ImportAdjustmentPage } from '../components/Import/ImportAdjustmentPage';
import { OvertimeApplication2ShiftsPage } from '../components/OvertimeApplication2ShiftsPage';
import { WorkshiftVariable2ShiftsPage } from '../components/WorkshiftVariable2ShiftsPage';
import { ImportLogsFromDevice2ShiftsPage } from '../components/ImportLogsFromDevice2ShiftsPage';

// ─── Export ───────────────────────────────────────────────────────────────────
import { ExportPayrollDataPage } from '../components/Export/ExportPayrollDataPage';
import { ExportNAVPage } from '../components/Export/ExportNAVPage';
import { PayrollDTRAllowancePage } from '../components/Export/PayrollDTRAllowancePage';

// ─── Utilities – Employee Configuration ──────────────────────────────────────
import { UpdateStatusPage } from '../components/Utilities/UpdateStatusPage';
import { UpdateEmployeeOvertimeApplicationPage } from '../components/Utilities/UpdateEmployeeOvertimeApplicationPage';
import { UpdateEmployeeWorkshiftPage } from '../components/Utilities/UpdateEmployeeWorkshiftPage';
import { UpdateEmployeeLeaveApplicationPage } from '../components/Utilities/UpdateEmployeeLeaveApplicationPage';
import { UpdateEmployeePayHousePage } from '../components/Utilities/UpdateEmployeePayHousePage';
import { UpdateEmployeeClassificationPage } from '../components/Utilities/UpdateEmployeeClassificationPage';
import { UpdateBatchRestDayPage } from '../components/Utilities/UpdateBatchRestDayPage';
import { DeleteEmployeeTransactionsPage } from '../components/Utilities/DeleteEmployeeTransactionsPage';
// Utilities – Rawdata
import { UpdateDaytypeRawdataPage } from '../components/Utilities/UpdateDaytypeRawdataPage';
import { UpdateWorkshiftRawdataPage } from '../components/Utilities/UpdateWorkshiftRawdataPage';
import { DeleteIncompleteLogsPage } from '../components/Utilities/DeleteIncompleteLogsPage';
import { DeleteRawdataPage } from '../components/Utilities/DeleteRawdataPage';
// Utilities – Processed Data
import { UnpostTransactionPage } from '../components/Utilities/UnpostTransactionPage';
import { AdditionalHoursPerWeekPage } from '../components/Utilities/AdditionalHoursPerWeekPage';
import { ApplyOTAllowancesPage } from '../components/Utilities/ApplyOTAllowancesPage';
import { ApplyBreakOverbreakPage } from '../components/Utilities/ApplyBreakOverbreakPage';
import { UpdateAllowancePerBracketPage } from '../components/Utilities/UpdateAllowancePerBracketPage';
import { UpdateSssNotificationPage } from '../components/Utilities/UpdateSssNotificationPage';
import { UpdateHoursPerWeekPage } from '../components/Utilities/UpdateHoursPerWeekPage';
import { UpdateTardinessPenaltyPage } from '../components/Utilities/UpdateTardinessPenaltyPage';
import { DeductTardinessToOvertimePage } from '../components/Utilities/DeductTardinessToOvertimePage';
import { DeleteOtRestdayAbsentPage } from '../components/Utilities/DeleteOtRestdayAbsentPage';
import { ProcessOvertimeCutoffPage } from '../components/Utilities/ProcessOvertimeCutoffPage';
import { UpdateAssumedDaysPage } from '../components/Utilities/UpdateAssumedDaysPage';
import { ProcessOvertime24HoursPage } from '../components/Utilities/ProcessOvertime24HoursPage';
import { DeductAbsencesExcessPage } from '../components/Utilities/DeductAbsencesExcessPage';
import { PostProcessedTimekeepingPage } from '../components/Utilities/PostProcessedTimekeepingPage';
import { UpdateTimeFlagBreaksPage } from '../components/Utilities/UpdateTimeFlagBreaksPage';
import { UnpaidLunchDeductionPage } from '../components/Utilities/UnpaidLunchDeductionPage';
import { UpdateFlexiBreakPage } from '../components/Utilities/UpdateFlexiBreakPage';
import { UpdateGLCodeUtilityPage } from '../components/Utilities/UpdateGLCodeUtilityPage';
// Utilities – Reports
import { TimekeepEmailDistributionPage } from '../components/Utilities/TimekeepEmailDistributionPage';
// Utilities – 2 Shifts
import { IncludeUnworkedHolidayPayRegularDaysHoursPage } from '../components/Utilities/IncludeUnworkedHolidayPayRegularDaysHoursPage';
import { NDBasicRoundDownPage } from '../components/Utilities/NDBasicRoundDownPage';
import { SaturdayUnworkedPaidRegularHoursPage } from '../components/Utilities/SaturdayUnworkedPaidRegularHoursPage';
import { SundayWorkOTIfWorkedSaturdayPage } from '../components/Utilities/SundayWorkOTIfWorkedSaturdayPage';
import { Unpost2ShiftsTransactionPage } from '../components/Utilities/Unpost2ShiftsTransactionPage';
import { DeleteIncompleteLogs2ShiftsPage } from '../components/Utilities/DeleteIncompleteLogs2ShiftsPage';
import { DeleteRecordsRawData2ShiftsPage } from '../components/Utilities/DeleteRecordsRawData2ShiftsPage';

// ─── Security ─────────────────────────────────────────────────────────────────
import { SecurityManagerPage } from '../components/Security/SecurityManagerPage';
import { AuditTrailPage } from '../components/Security/AuditTrailPage';
import { EmailConfigurationPage } from '../components/Security/EmailConfigurationPage';
import { CreateNewDatabasePage } from '../components/Security/CreateNewDatabasePage';

// ─────────────────────────────────────────────────────────────────────────────

interface AppRoutesProps {
  onLogout: () => void;
  onLogin: () => void;
  onForgotPassword: () => void;
  onBackToLogin: () => void;
}

export function AppRoutes({ onLogout, onLogin, onForgotPassword, onBackToLogin }: AppRoutesProps) {
  return (
    <Routes>
      {/* ── Public Routes ─────────────────────────────────────────── */}
      <Route path="/login" element={<LoginPage onLogin={onLogin} onForgotPassword={onForgotPassword} />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage onBack={onBackToLogin} />} />

      {/* ── Protected Routes (all share Navigation + Footer layout) ── */}
      <Route element={<ProtectedLayout onLogout={onLogout} />}>

        {/* Dashboard */}
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Dashboard />} />

        {/* ── File Setup ──────────────────────────────────────────── */}
        {/* System */}
        <Route path="/file-setup/system/company-information" element={<CompanyInformation />} />

        {/* Process – Allowance & Earnings */}
        <Route path="/file-setup/process/allowance-and-earnings/allowance-bracket-code-setup" element={<AllowanceBracketCodeSetupPage />} />
        <Route path="/file-setup/process/allowance-and-earnings/allowance-bracketing-setup" element={<AllowanceBracketingSetupPage />} />
        <Route path="/file-setup/process/allowance-and-earnings/allowance-per-classification-setup" element={<AllowancePerClassificationSetupPage />} />
        <Route path="/file-setup/process/allowance-and-earnings/classification-setup" element={<ClassificationSetupPage />} />
        <Route path="/file-setup/process/allowance-and-earnings/earning-setup" element={<EarningSetupPage />} />

        {/* Process – Calendar & Day */}
        <Route path="/file-setup/process/calendar-setup" element={<CalendarSetup />} />
        <Route path="/file-setup/process/day-type-setup" element={<DayTypeSetupPage />} />

        {/* Process – Device */}
        <Route path="/file-setup/process/device/ams-database-configuration-setup" element={<AMSDatabaseConfigurationSetupPage />} />
        <Route path="/file-setup/process/device/borrowed-device-name" element={<BorrowedDeviceNamePage />} />
        <Route path="/file-setup/process/device/coordinates-setup" element={<CoordinatesSetupPage />} />
        <Route path="/file-setup/process/device/device-type-setup" element={<DeviceTypeSetupPage />} />
        <Route path="/file-setup/process/device/dtr-flag-setup" element={<DTRFlagSetupPage />} />
        <Route path="/file-setup/process/device/dtr-log-fields-setup" element={<DTRLogFieldsSetupPage />} />
        <Route path="/file-setup/process/device/sdk-list-setup" element={<SDKListSetupPage />} />
        <Route path="/file-setup/process/device/mysql-database-configuration-setup" element={<MySQLDatabaseConfigurationSetupPage />} />

        {/* Process – Overtime */}
        <Route path="/file-setup/process/overtime/additional-ot-hours-per-week" element={<AdditionalOTHoursPerWeekPage />} />
        <Route path="/file-setup/process/overtime/holiday-ot-rates-setup" element={<HolidayOTRateSetupPage />} />
        <Route path="/file-setup/process/overtime/overtime-setup" element={<OvertimeSetupPage />} />
        <Route path="/file-setup/process/overtime/regular-overtime-setup" element={<RegularOvertimeSetupPage />} />
        <Route path="/file-setup/process/overtime/rest-day-overtime-setup" element={<RestDayOvertimeSetupPage />} />

        {/* Process – Tardiness */}
        <Route path="/file-setup/process/tardiness/bracket-code-setup" element={<BracketCodeSetupPage />} />
        <Route path="/file-setup/process/tardiness/tardiness-undertime-accumulation-table-setup" element={<TardinessUndertimeAccumulationTableSetupPage />} />

        {/* Process – Workshift & Restday */}
        <Route path="/file-setup/process/workshift-and-restday/daily-schedule-setup" element={<DailyScheduleSetupPage />} />
        <Route path="/file-setup/process/workshift-and-restday/rest-day-setup" element={<RestDaySetupPage />} />
        <Route path="/file-setup/process/workshift-and-restday/workshift-setup" element={<WorkshiftSetupPage />} />

        {/* Process – Misc */}
        <Route path="/file-setup/process/equivalent-hours-deduction-setup" element={<EquivalentHoursDeductionSetupPage />} />
        <Route path="/file-setup/process/group-schedule-setup" element={<GroupScheduleSetupPage />} />
        <Route path="/file-setup/process/help-setup" element={<HelpSetupPage />} />
        <Route path="/file-setup/process/leave-type-setup" element={<LeaveTypeSetupPage />} />
        <Route path="/file-setup/process/payroll-location-setup" element={<PayrollLocationSetupPage />} />
        <Route path="/file-setup/process/system-configuration-setup" element={<SystemConfigurationSetupPage />} />
        <Route path="/file-setup/process/timekeep-group-setup" element={<TimeKeepGroupPage />} />
        <Route path="/file-setup/process/unpaid-lunch-deduction-bracket-setup" element={<UnpaidLunchDeductionBracketSetupPage />} />

        {/* Employment */}
        <Route path="/file-setup/employment/area-setup" element={<AreaSetupPage />} />
        <Route path="/file-setup/employment/branch-setup" element={<BranchSetupPage />} />
        <Route path="/file-setup/employment/department-setup" element={<DepartmentSetupPage />} />
        <Route path="/file-setup/employment/division-setup" element={<DivisionSetupPage />} />
        <Route path="/file-setup/employment/employee-designation-setup" element={<EmployeeDesignationSetupPage />} />
        <Route path="/file-setup/employment/employee-status-setup" element={<EmployeeStatusSetupPage />} />
        <Route path="/file-setup/employment/group-setup" element={<GroupSetupPage />} />
        <Route path="/file-setup/employment/job-level-setup" element={<JobLevelSetupPage />} />
        <Route path="/file-setup/employment/location-setup" element={<LocationSetupPage />} />
        <Route path="/file-setup/employment/online-approval-setup" element={<OnlineApprovalSetupPage />} />
        <Route path="/file-setup/employment/pay-house-setup" element={<PayHouseSetupPage />} />
        <Route path="/file-setup/employment/section-setup" element={<SectionSetupPage />} />
        <Route path="/file-setup/employment/unit-setup" element={<UnitSetupPage />} />

        {/* ── Maintenance ─────────────────────────────────────────── */}
        <Route path="/maintenance/employee-master-file" element={<EmployeeMasterFilePage />} />
        <Route path="/maintenance/employee-timekeep-configuration" element={<EmployeeTimekeepConfigPage />} />
        <Route path="/maintenance/raw-data" element={<RawDataPage />} />
        <Route path="/maintenance/rawdata-ot-gap" element={<RawdataOtGapPage />} />
        <Route path="/maintenance/rawdata-on-straight-duty" element={<RawdataOnStraightDutyPage />} />
        <Route path="/maintenance/processed-data" element={<ProcessedDataPage />} />
        <Route path="/maintenance/update-rawdata-online" element={<UpdateRawdataOnlinePage />} />
        {/* 2 Shifts */}
        <Route path="/maintenance/2-shifts/employee-timekeep-config" element={<TwoShiftsEmployeeTimekeepConfigPage />} />
        <Route path="/maintenance/2-shifts/raw-data" element={<TwoShiftsRawDataPage />} />

        {/* ── Process ─────────────────────────────────────────────── */}
        <Route path="/process/process-data" element={<ProcessPage />} />
        <Route path="/process/process-2-shifts-payroll" element={<Process2ShiftsPayrollPage />} />

        {/* ── Reports ─────────────────────────────────────────────── */}
        <Route path="/reports/daily-time-record-monitoring" element={<DailyTimeRecordMonitoringPage />} />

        {/* ── Import ──────────────────────────────────────────────── */}
        {/* 1 Shift */}
        <Route path="/import/workshift-variable" element={<WorkshiftVariablePage />} />
        <Route path="/import/leave-application" element={<LeaveApplicationPage />} />
        <Route path="/import/overtime-application" element={<OvertimeApplicationPage />} />
        <Route path="/import/device-code" element={<ImportDeviceCodePage />} />
        <Route path="/import/employee-masterfile" element={<ImportEmployeeMasterfilePage />} />
        <Route path="/import/logs-from-device-v2" element={<ImportLogsFromDeviceV2Page />} />
        <Route path="/import/update-rawdata" element={<UpdateRawDataPage />} />
        <Route path="/import/adjustment" element={<ImportAdjustmentPage />} />
        {/* 2 Shifts */}
        <Route path="/import/2-shifts/overtime-application" element={<OvertimeApplication2ShiftsPage />} />
        <Route path="/import/2-shifts/workshift-variable" element={<WorkshiftVariable2ShiftsPage />} />
        <Route path="/import/2-shifts/logs-from-device-v2" element={<ImportLogsFromDevice2ShiftsPage />} />

        {/* ── Export ──────────────────────────────────────────────── */}
        <Route path="/export/payroll-data" element={<ExportPayrollDataPage />} />
        <Route path="/export/nav" element={<ExportNAVPage />} />
        <Route path="/export/payroll-dtr-allowance" element={<PayrollDTRAllowancePage />} />

        {/* ── Utilities – Employee Configuration ──────────────────── */}
        <Route path="/utilities/employee/update-status" element={<UpdateStatusPage />} />
        <Route path="/utilities/employee/update-overtime-application" element={<UpdateEmployeeOvertimeApplicationPage />} />
        <Route path="/utilities/employee/update-workshift" element={<UpdateEmployeeWorkshiftPage />} />
        <Route path="/utilities/employee/update-leave-application" element={<UpdateEmployeeLeaveApplicationPage />} />
        <Route path="/utilities/employee/update-pay-house" element={<UpdateEmployeePayHousePage />} />
        <Route path="/utilities/employee/update-classification" element={<UpdateEmployeeClassificationPage />} />
        <Route path="/utilities/employee/update-batch-rest-day" element={<UpdateBatchRestDayPage />} />
        <Route path="/utilities/employee/delete-transactions" element={<DeleteEmployeeTransactionsPage />} />
        <Route path="/utilities/employee/update-rawdata-online" element={<UpdateRawdataOnlinePage />} />

        {/* ── Utilities – Rawdata ──────────────────────────────────── */}
        <Route path="/utilities/rawdata/update-daytype" element={<UpdateDaytypeRawdataPage />} />
        <Route path="/utilities/rawdata/update-workshift" element={<UpdateWorkshiftRawdataPage />} />
        <Route path="/utilities/rawdata/delete-incomplete-logs" element={<DeleteIncompleteLogsPage />} />
        <Route path="/utilities/rawdata/delete-rawdata" element={<DeleteRawdataPage />} />

        {/* ── Utilities – Processed Data ───────────────────────────── */}
        <Route path="/utilities/processed/unpost-transaction" element={<UnpostTransactionPage />} />
        <Route path="/utilities/processed/additional-hours-per-week" element={<AdditionalHoursPerWeekPage />} />
        <Route path="/utilities/processed/apply-ot-allowances" element={<ApplyOTAllowancesPage />} />
        <Route path="/utilities/processed/apply-break-overbreak" element={<ApplyBreakOverbreakPage />} />
        <Route path="/utilities/processed/update-allowance-per-bracket" element={<UpdateAllowancePerBracketPage />} />
        <Route path="/utilities/processed/update-sss-notification" element={<UpdateSssNotificationPage />} />
        <Route path="/utilities/processed/update-hours-per-week" element={<UpdateHoursPerWeekPage />} />
        <Route path="/utilities/processed/update-tardiness-penalty" element={<UpdateTardinessPenaltyPage />} />
        <Route path="/utilities/processed/deduct-tardiness-to-overtime" element={<DeductTardinessToOvertimePage />} />
        <Route path="/utilities/processed/delete-ot-restday-absent" element={<DeleteOtRestdayAbsentPage />} />
        <Route path="/utilities/processed/process-overtime-cutoff" element={<ProcessOvertimeCutoffPage />} />
        <Route path="/utilities/processed/update-assumed-days" element={<UpdateAssumedDaysPage />} />
        <Route path="/utilities/processed/process-overtime-24hours" element={<ProcessOvertime24HoursPage />} />
        <Route path="/utilities/processed/deduct-absences-excess" element={<DeductAbsencesExcessPage />} />
        <Route path="/utilities/processed/post-processed-timekeeping" element={<PostProcessedTimekeepingPage />} />
        <Route path="/utilities/processed/update-time-flag-breaks" element={<UpdateTimeFlagBreaksPage />} />
        <Route path="/utilities/processed/unpaid-lunch-deduction" element={<UnpaidLunchDeductionPage />} />
        <Route path="/utilities/processed/update-flexi-break" element={<UpdateFlexiBreakPage />} />
        <Route path="/utilities/processed/update-gl-code-utility" element={<UpdateGLCodeUtilityPage />} />

        {/* ── Utilities – Reports ──────────────────────────────────── */}
        <Route path="/utilities/reports/timekeep-email-distribution" element={<TimekeepEmailDistributionPage />} />

        {/* ── Utilities – 2 Shifts ─────────────────────────────────── */}
        <Route path="/utilities/2-shifts/include-unworked-holiday-pay" element={<IncludeUnworkedHolidayPayRegularDaysHoursPage />} />
        <Route path="/utilities/2-shifts/nd-basic-round-down" element={<NDBasicRoundDownPage />} />
        <Route path="/utilities/2-shifts/saturday-unworked-paid-regular-hours" element={<SaturdayUnworkedPaidRegularHoursPage />} />
        <Route path="/utilities/2-shifts/sunday-work-ot-if-worked-saturday" element={<SundayWorkOTIfWorkedSaturdayPage />} />
        <Route path="/utilities/2-shifts/unpost-transaction" element={<Unpost2ShiftsTransactionPage />} />
        <Route path="/utilities/2-shifts/delete-incomplete-logs" element={<DeleteIncompleteLogs2ShiftsPage />} />
        <Route path="/utilities/2-shifts/delete-records-raw-data" element={<DeleteRecordsRawData2ShiftsPage />} />

        {/* ── Security ────────────────────────────────────────────── */}
        <Route path="/security/security-manager" element={<SecurityManagerPage />} />
        <Route path="/security/audit-trail" element={<AuditTrailPage />} />
        <Route path="/security/email-configuration" element={<EmailConfigurationPage />} />
        <Route path="/security/create-new-database" element={<CreateNewDatabasePage />} />

        {/* Catch-all: unknown protected paths → home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
}