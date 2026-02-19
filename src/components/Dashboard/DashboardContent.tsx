import {
    Users,
    Clock,
    AlertCircle,
    CheckCircle,
    FileText,
    BarChart3,
    Calendar,
    TrendingUp,
    ArrowRight
} from 'lucide-react';
// import { WorkshiftVariablePage } from '../WorkshiftVariablePage';
import { WorkshiftVariablePage } from '../Import/WorkshiftVariablePage';
import { ImportAdjustmentPage } from '../Import/ImportAdjustmentPage';
import { ImportLogsFromDeviceV2Page } from '../Import/ImportLogsFromDeviceV2Page';
import { ImportDeviceCodePage } from '../Import/ImportDeviceCodePage';
import { ImportEmployeeMasterfilePage } from '../Import/ImportEmployeeMasterfilePage';
import { OvertimeApplicationPage } from '../Import/OvertimeApplicationPage';
import { LeaveApplicationPage } from '../Import/LeaveApplicationPage';
import { ImportLogsFromDevicePage } from '../ImportLogsFromDevicePage';
import { UpdateRawDataPage } from '../Import/UpdateRawDataPage';
import { RawDataOTGroupPage } from '../RawDataOTGroupPage';
import { RawdataOtGapPage } from '../Maintenance/RawdataOtGapPage';
import { RawdataOnStraightDutyPage } from '../Maintenance/RawdataOnStraightDutyPage';
import { TwoShiftsRawDataPage } from '../Maintenance/TwoShiftsRawDataPage';
import { TwoShiftsEmployeeTimekeepConfigPage } from '../Maintenance/TwoShiftsEmployeeTimekeepConfigPage';
import { OvertimeApplication2ShiftsPage } from '../OvertimeApplication2ShiftsPage';
import { WorkshiftVariable2ShiftsPage } from '../WorkshiftVariable2ShiftsPage';
import { ImportLogsFromDevice2ShiftsPage } from '../ImportLogsFromDevice2ShiftsPage';

//Maintenance Sub-menu
import { ProcessedDataPage } from '../Maintenance/ProcessedDataPage';

//Utilities
//Utility on Employee Configuration
import { UpdateStatusPage } from '../Utilities/UpdateStatusPage';
import { UpdateEmployeeOvertimeApplicationPage } from '../Utilities/UpdateEmployeeOvertimeApplicationPage';
import { UpdateEmployeeWorkshiftPage } from '../Utilities/UpdateEmployeeWorkshiftPage';
import { UpdateEmployeeLeaveApplicationPage } from '../Utilities/UpdateEmployeeLeaveApplicationPage';
import { UpdateEmployeePayHousePage } from '../Utilities/UpdateEmployeePayHousePage';
import { UpdateEmployeeClassificationPage } from '../Utilities/UpdateEmployeeClassificationPage';
import { UpdateBatchRestDayPage } from '../Utilities/UpdateBatchRestDayPage';
import { DeleteEmployeeTransactionsPage } from '../Utilities/DeleteEmployeeTransactionsPage';
import { UpdateRawdataOnlinePage } from '../Maintenance/UpdateRawdataOnlinePage';
//Utility on Raw Data
import { UpdateDaytypeRawdataPage } from '../Utilities/UpdateDaytypeRawdataPage';
import { UpdateWorkshiftRawdataPage } from '../Utilities/UpdateWorkshiftRawdataPage';
import { DeleteIncompleteLogsPage } from '../Utilities/DeleteIncompleteLogsPage';
import { DeleteRawdataPage } from '../Utilities/DeleteRawdataPage';
//Utility on Processed Data
import { UnpostTransactionPage } from '../Utilities/UnpostTransactionPage';
import { AdditionalHoursPerWeekPage } from '../Utilities/AdditionalHoursPerWeekPage';
import { ApplyOTAllowancesPage } from '../Utilities/ApplyOTAllowancesPage';
import { ApplyBreakOverbreakPage } from '../Utilities/ApplyBreakOverbreakPage';
import { UpdateAllowancePerBracketPage } from '../Utilities/UpdateAllowancePerBracketPage';
import { UpdateGLCodeUtilityPage } from '../Utilities/UpdateGLCodeUtilityPage';
import { UpdateFlexiBreakPage } from '../Utilities/UpdateFlexiBreakPage';
import { UpdateSssNotificationPage } from '../Utilities/UpdateSssNotificationPage';
import { UpdateHoursPerWeekPage } from '../Utilities/UpdateHoursPerWeekPage';
import { UpdateTardinessPenaltyPage } from '../Utilities/UpdateTardinessPenaltyPage';
import { DeleteOtRestdayAbsentPage } from '../Utilities/DeleteOtRestdayAbsentPage';
import { ProcessOvertimeCutoffPage } from '../Utilities/ProcessOvertimeCutoffPage';
import { UpdateAssumedDaysPage } from '../Utilities/UpdateAssumedDaysPage';
import { DeductAbsencesExcessPage } from '../Utilities/DeductAbsencesExcessPage';
import { ProcessOvertime24HoursPage } from '../Utilities/ProcessOvertime24HoursPage';
import { PostProcessedTimekeepingPage } from '../Utilities/PostProcessedTimekeepingPage';
import { UpdateTimeFlagBreaksPage } from '../Utilities/UpdateTimeFlagBreaksPage';
import { UnpaidLunchDeductionPage } from '../Utilities/UnpaidLunchDeductionPage';
import { DeductTardinessToOvertimePage } from '../Utilities/DeductTardinessToOvertimePage';



//Process Sub-Menu
import { ProcessPage } from '../Process/ProcessPage';
import { Process2ShiftsPayrollPage } from '../Process/Process2ShiftsPayrollPage';

import { DailyTimeRecordMonitoringPage } from '../Reports/DailyTimeRecordMonitoringPage';
import { TKSGroupSetupDefinitionPage } from '../TKSGroupSetupDefinitionPage';
import { CompanyInformation } from '../../components/FileSetup/System/CompanyInformation';
import { CalendarSetup } from '../FileSetup/Process/CalendarSetup';
import { HolidayOTRateSetupPage } from '../FileSetup/Process/Overtime/HolidayOTRateSetupPage';
import { OvertimeSetupPage } from '../FileSetup/Process/Overtime/OvertimeSetupPage';

import { AllowanceBracketCodeSetupPage } from '../FileSetup/Process/AllowanceAndEarning/AllowanceBracketCodeSetupPage';
import { AllowanceBracketingSetupPage } from '../FileSetup/Process/AllowanceAndEarning/AllowanceBracketingSetupPage';
import { AllowancePerClassificationSetupPage } from '../FileSetup/Process/AllowanceAndEarning/AllowancePerClassificationSetupPage';
import { ClassificationSetupPage } from '../FileSetup/Process/AllowanceAndEarning/ClassificationSetupPage';
import { EarningSetupPage } from '../FileSetup/Process/AllowanceAndEarning/EarningSetupPage';
import { DayTypeSetupPage } from '../FileSetup/Process/DayTypeSetupPage';

import { SDKListSetupPage } from '../FileSetup/Process/Device/SDKListSetupPage';

import { EquivalentHoursDeductionSetupPage } from '../FileSetup/Process/EquivalentHoursDeductionSetupPage';

import { AdditionalOTHoursPerWeekPage } from '../FileSetup/Process/Overtime/AdditionalOTHoursPerWeekPage';
import { RegularOvertimeSetupPage } from '../FileSetup/Process/Overtime/RegularOvertimeSetupPage';
import { RestDayOvertimeSetupPage } from '../FileSetup/Process/Overtime/RestDayOvertimeSetupPage';


import { DailyScheduleSetupPage } from '../FileSetup/Process/WorkshipAndRestday/DailyScheduleSetupPage';
import { RestDaySetupPage } from '../FileSetup/Process/WorkshipAndRestday/RestDaySetupPage';
import { WorkshiftSetupPage } from '../FileSetup/Process/WorkshipAndRestday/WorkshiftSetupPage';

import { BracketCodeSetupPage } from '../FileSetup/Process/Tardines-setup/BracketCodeSetupPage';
import { TardinessUndertimeAccumulationTableSetupPage } from '../FileSetup/Process/Tardines-setup/TardinessUndertimeAccumulationTableSetupPage';
import { AreaSetupPage } from '../FileSetup/Employment/AreaSetupPage';
import { BranchSetupPage } from '../FileSetup/Employment/BranchSetupPage';
import { DepartmentSetupPage } from '../FileSetup/Employment/DepartmentSetupPage';
import { DivisionSetupPage } from '../FileSetup/Employment/DivisionSetupPage';
import { EmployeeDesignationSetupPage } from '../FileSetup/Employment/EmployeeDesignationSetupPage';
import { EmployeeStatusSetupPage } from '../FileSetup/Employment/EmployeeStatusSetupPage';
import { GroupSetupPage } from '../FileSetup/Employment/GroupSetupPage';
import { JobLevelSetupPage } from '../FileSetup/Employment/JobLevelSetupPage';
import { LocationSetupPage } from '../FileSetup/Employment/LocationSetupPage';
import { PayHouseSetupPage } from '../FileSetup/Employment/PayHouseSetupPage';
import { OnlineApprovalSetupPage } from '../FileSetup/Employment/OnlineApprovalSetupPage';
import { SectionSetupPage } from '../FileSetup/Employment/SectionSetupPage';
import { UnitSetupPage } from '../FileSetup/Employment/UnitSetupPage';
import { CreateNewDatabasePage } from '../CreateNewDatabasePage';
import { EmailConfigurationPage } from '../EmailConfigurationPage';
import { AuditTrailPage } from '../AuditTrailPage';
import { SecurityManagerPage } from '../SecurityManagerPage';

//Export Sub-menu
import { PayrollDTRAllowancePage } from '../Export/PayrollDTRAllowancePage';
import { ExportNAVPage } from '../Export/ExportNAVPage';
import { ExportPayrollDataPage } from '../Export/ExportPayrollDataPage';

import { GroupScheduleSetupPage } from '../FileSetup/Process/GroupScheduleSetupPage';
import { HelpSetupPage } from '../FileSetup/Process/HelpSetupPage';
import { LeaveTypeSetupPage } from '../FileSetup/Process/LeaveTypeSetupPage';
import { PayrollLocationSetupPage } from '../FileSetup/Process/PayrollLocationSetupPage';
import { SystemConfigurationSetupPage } from '../FileSetup/Process/SystemConfigurationSetupPage';
import { UnpaidLunchDeductionBracketSetupPage } from '../FileSetup/Process/UnpaidLunchDeductionBracketSetupPage';
import { TimeKeepGroupPage } from '../FileSetup/Process/TimeKeepGroupPage';

import { BorrowedDeviceNamePage } from '../FileSetup/Process/Device/BorrowedDeviceNamePage';

import { DTRFlagSetupPage } from '../FileSetup/Process/Device/DTRFlagSetupPage';
import { DTRLogFieldsSetupPage } from '../FileSetup/Process/Device/DTRLogFieldsSetupPage';
import { DeviceTypeSetupPage } from '../FileSetup/Process/Device/DeviceTypeSetupPage';
import { CoordinatesSetupPage } from '../FileSetup/Process/Device/CoordinatesSetupPage';
import { AMSDatabaseConfigurationSetupPage } from '../FileSetup/Process/Device/AMSDatabaseConfigurationSetupPage';
import { MySQLDatabaseConfigurationSetupPage } from '../FileSetup/Process/Device/MySQLDatabaseConfigurationSetupPage';
import { EmployeeMasterFilePage } from '../Maintenance/EmployeeMasterFilePage';
import { EmployeeTimekeepConfigPage } from '../Maintenance/EmployeeTimekeepConfigPage';
import { RawDataPage } from '../Maintenance/RawDataPage';

interface DashboardContentProps {
    activeSection: string;
}

export function DashboardContent({ activeSection }: DashboardContentProps) {
    // Special handling for specific pages
    if (activeSection === 'workshift-variable') {
        return <WorkshiftVariablePage />;
    }

    if (activeSection === 'import-workshift-variable') {
        
        return <WorkshiftVariablePage />;
    }

    if (activeSection === 'import-adjustment') {
        return <ImportAdjustmentPage />;
    }

    if (activeSection === 'import-logs-from-device-v2') {
        return <ImportLogsFromDeviceV2Page />;
    }

    if (activeSection === 'import-device-code') {
        return <ImportDeviceCodePage />;
    }

    if (activeSection === 'import-employee-masterfile') {
        return <ImportEmployeeMasterfilePage />;
    }

    if (activeSection === 'overtime-application') {
        return <OvertimeApplicationPage />;
    }

    if (activeSection === 'import-overtime-application') {
        return <OvertimeApplicationPage />;
    }

    if (activeSection === 'leave-application') {

        return <LeaveApplicationPage />;
    }

    if (activeSection === 'import-leave-application') {
        return <LeaveApplicationPage />;
    }

    if (activeSection === 'logs-from-device-v2') {
        return <ImportLogsFromDevicePage />;
    }

    if (activeSection === 'overtime-application-2-shifts') {
        return <OvertimeApplication2ShiftsPage />;
    }

    if (activeSection === 'workshift-variable-2-shifts') {
        return <WorkshiftVariable2ShiftsPage />;
    }

    if (activeSection === 'logs-from-device-2-shifts') {
        return <ImportLogsFromDevice2ShiftsPage />;
    }

    if (activeSection === 'update-raw-data' || activeSection === 'update-rawdata-import') {
        return <UpdateRawDataPage />;
    }

    if (activeSection === 'raw-data-ot-group') {
        return <RawDataOTGroupPage />;
    }

    if (activeSection === 'rawdata-ot-gap') {
        return <RawdataOtGapPage />;
    }

    if (activeSection === 'rawdata-on-straight-duty') {
        return <RawdataOnStraightDutyPage />;
    }

    if (activeSection === '2-shifts-rawdata') {
        return <TwoShiftsRawDataPage />;
    }

    if (activeSection === '2-shifts-employee-timekeep-config') {
        return <TwoShiftsEmployeeTimekeepConfigPage />;
    }

    if (activeSection === 'raw-data') {
        return <RawDataPage />;
    }

    if (activeSection === 'process' || activeSection === 'process-data') {
        return <ProcessPage />;
    }

    if (activeSection === '2-shifts-payroll' || activeSection === 'process-2-shifts-payroll') {
        return <Process2ShiftsPayrollPage />;
    }

    if (activeSection === 'processed-data') {
        return <ProcessedDataPage />;
    }

    if (activeSection === 'daily-time-record-monitoring') {
        return <DailyTimeRecordMonitoringPage />;
    }

    if (activeSection === 'update-status') {
        return <UpdateStatusPage />;
    }

    if (activeSection === 'update-employee-overtime-application') {
        return <UpdateEmployeeOvertimeApplicationPage />;
    }

    if (activeSection === 'update-employee-workshift') {
        return <UpdateEmployeeWorkshiftPage />;
    }

    if (activeSection === 'update-employee-leave-application') {
        return <UpdateEmployeeLeaveApplicationPage />;
    }

    if (activeSection === 'update-employee-pay-house') {
        return <UpdateEmployeePayHousePage />;
    }

    if (activeSection === 'update-employee-classification') {
        return <UpdateEmployeeClassificationPage />;
    }

    if (activeSection === 'update-batch-rest-day') {
        return <UpdateBatchRestDayPage />;
    }

    if (activeSection === 'delete-employee-transactions') {
        return <DeleteEmployeeTransactionsPage />;
    }

    if (activeSection === 'update-rawdata-online') {
        return <UpdateRawdataOnlinePage />;
    }

    if (activeSection === 'update-daytype-rawdata') {
        return <UpdateDaytypeRawdataPage />;
    }

    if (activeSection === 'update-workshift-rawdata') {
        return <UpdateWorkshiftRawdataPage />;
    }

    if (activeSection === 'delete-incomplete-logs') {
        return <DeleteIncompleteLogsPage />;
    }

    if (activeSection === 'delete-rawdata') {
        return <DeleteRawdataPage />;
    }

    if (activeSection === 'unpost-transaction') {
        return <UnpostTransactionPage />;
    }

    if (activeSection === 'additional-hours-per-week') {
        return <AdditionalHoursPerWeekPage />;
    }

    if (activeSection === 'apply-ot-allowances') {
        return <ApplyOTAllowancesPage />;
    }

    if (activeSection === 'apply-break-overbreak') {
        return <ApplyBreakOverbreakPage />;
    }

    if (activeSection === 'update-allowance-per-bracket') {
        return <UpdateAllowancePerBracketPage />;
    }

    if (activeSection === 'update-gl-code-utility') {
        return <UpdateGLCodeUtilityPage />;
    }

    if (activeSection === 'update-flexi-break') {
        return <UpdateFlexiBreakPage />;
    }

    if (activeSection === 'update-sss-notification') {
        return <UpdateSssNotificationPage />;
    }

    if (activeSection === 'update-hours-per-week') {
        return <UpdateHoursPerWeekPage />;
    }

    if (activeSection === 'update-tardiness-penalty') {
        return <UpdateTardinessPenaltyPage />;
    }

    if (activeSection === 'delete-ot-restday-absent') {
        return <DeleteOtRestdayAbsentPage />;
    }

    if (activeSection === 'process-overtime-cutoff') {
        return <ProcessOvertimeCutoffPage />;
    }

    if (activeSection === 'update-assumed-days') {
        return <UpdateAssumedDaysPage />;
    }

    if (activeSection === 'deduct-absences-excess') {
        return <DeductAbsencesExcessPage />;
    }

    if (activeSection === 'process-overtime-24hours') {
        return <ProcessOvertime24HoursPage />;
    }

    if (activeSection === 'post-processed-timekeeping') {
        return <PostProcessedTimekeepingPage />;
    }

    if (activeSection === 'update-time-flag-breaks') {
        return <UpdateTimeFlagBreaksPage />;
    }

    if (activeSection === 'unpaid-lunch-deduction') {
        return <UnpaidLunchDeductionPage />;
    }

    if (activeSection === 'deduct-tardiness-to-overtime') {
        return <DeductTardinessToOvertimePage />;
    }

    if (activeSection === 'timekeep-group' || activeSection === 'tks-group-setup' || activeSection === 'timekeep-group-setup') {
        return <TimeKeepGroupPage />;
    }

    if (activeSection === 'tks-group-setup-definition') {
        return <TKSGroupSetupDefinitionPage />;
    }

    if (activeSection === 'company-information') {
        return <CompanyInformation />;
    }

    if (activeSection === 'calendar-setup') {
        return <CalendarSetup />;
    }

    if (activeSection === 'holiday-ot-rates-setup') {
        return <HolidayOTRateSetupPage />;
    }

    if (activeSection === 'overtime-setup') {
        return <OvertimeSetupPage />;
    }

    if (activeSection === 'employee-master-file') {
        return <EmployeeMasterFilePage />;
    }

    if (activeSection === 'employee-timekeep-configuration') {
        return <EmployeeTimekeepConfigPage />;
    }

    if (activeSection === 'allowance-bracket-code-setup') {
        return <AllowanceBracketCodeSetupPage />;
    }

    if (activeSection === 'allowance-bracketing-setup') {
        return <AllowanceBracketingSetupPage />;
    }

    if (activeSection === 'allowance-per-classification-setup') {
        return <AllowancePerClassificationSetupPage />;
    }

    if (activeSection === 'classification-setup') {
        return <ClassificationSetupPage />;
    }

    if (activeSection === 'earning-setup') {
        return <EarningSetupPage />;
    }

    if (activeSection === 'day-type-setup') {
        return <DayTypeSetupPage />;
    }

    if (activeSection === 'ams-database-configuration-setup') {
        return <AMSDatabaseConfigurationSetupPage />;
    }

    if (activeSection === 'borrowed-device-name') {
        return <BorrowedDeviceNamePage />;
    }

    if (activeSection === 'coordinates-setup') {
        return <CoordinatesSetupPage />;
    }

    if (activeSection === 'device-type-setup') {
        return <DeviceTypeSetupPage />;
    }

    if (activeSection === 'dtr-flag-setup') {
        return <DTRFlagSetupPage />;
    }

    if (activeSection === 'dtr-log-fields-setup') {
        return <DTRLogFieldsSetupPage />;
    }

    if (activeSection === 'sdk-list-setup') {
        return <SDKListSetupPage />;
    }

    if (activeSection === 'mysql-database-configuration-setup') {
        return <MySQLDatabaseConfigurationSetupPage />;
    }

    if (activeSection === 'equivalent-hours-deduction-setup') {
        return <EquivalentHoursDeductionSetupPage />;
    }

    if (activeSection === 'group-schedule-setup') {
        return <GroupScheduleSetupPage />;
    }

    if (activeSection === 'help-setup') {
        return <HelpSetupPage />;
    }

    if (activeSection === 'leave-type-setup') {
        return <LeaveTypeSetupPage />;
    }

    if (activeSection === 'additional-ot-hours-per-week') {
        return <AdditionalOTHoursPerWeekPage />;
    }

    if (activeSection === 'regular-overtime-setup') {
        return <RegularOvertimeSetupPage />;
    }

    if (activeSection === 'rest-day-overtime-setup') {
        return <RestDayOvertimeSetupPage />;
    }

    if (activeSection === 'payroll-location-setup') {
        return <PayrollLocationSetupPage />;
    }

    if (activeSection === 'system-configuration-setup') {
        return <SystemConfigurationSetupPage />;
    }

    if (activeSection === 'daily-schedule-setup') {
        return <DailyScheduleSetupPage />;
    }

    if (activeSection === 'rest-day-setup') {
        return <RestDaySetupPage />;
    }

    if (activeSection === 'workshift-setup') {
        return <WorkshiftSetupPage />;
    }

    if (activeSection === 'unpaid-lunch-deduction-bracket-setup') {
        return <UnpaidLunchDeductionBracketSetupPage />;
    }

    if (activeSection === 'bracket-code-setup') {
        return <BracketCodeSetupPage />;
    }

    if (activeSection === 'tardiness-undertime-accumulation-table-setup') {
        return <TardinessUndertimeAccumulationTableSetupPage />;
    }

    if (activeSection === 'area-setup') {
        return <AreaSetupPage />;
    }

    if (activeSection === 'branch-setup') {
        return <BranchSetupPage />;
    }

    if (activeSection === 'department-setup') {
        return <DepartmentSetupPage />;
    }

    if (activeSection === 'division-setup') {
        return <DivisionSetupPage />;
    }

    if (activeSection === 'employee-designation-setup') {
        return <EmployeeDesignationSetupPage />;
    }

    if (activeSection === 'employee-status-setup') {
        return <EmployeeStatusSetupPage />;
    }

    if (activeSection === 'group-setup') {
        return <GroupSetupPage />;
    }

    if (activeSection === 'job-level-setup') {
        return <JobLevelSetupPage />;
    }

    if (activeSection === 'location-setup') {
        return <LocationSetupPage />;
    }

    if (activeSection === 'pay-house-setup') {
        return <PayHouseSetupPage />;
    }

    if (activeSection === 'online-approval-setup') {
        return <OnlineApprovalSetupPage />;
    }

    if (activeSection === 'section-setup') {
        return <SectionSetupPage />;
    }

    if (activeSection === 'unit-setup') {
        return <UnitSetupPage />;
    }

    if (activeSection === 'create-new-database') {
        return <CreateNewDatabasePage />;
    }

    if (activeSection === 'email-configuration') {
        return <EmailConfigurationPage />;
    }

    if (activeSection === 'audit-trail') {
        return <AuditTrailPage />;
    }

    if (activeSection === 'security-manager') {
        return <SecurityManagerPage />;
    }

    if (activeSection === 'security') {
        return <SecurityManagerPage />;
    }

    if (activeSection === 'export-nav') {
        return <ExportNAVPage />;
    }

    if (activeSection === 'export-payroll-data') {
        return <ExportPayrollDataPage />;
    }

    if (activeSection === 'payroll-dtr-allowance') {
        return <PayrollDTRAllowancePage />;
    }

    if (activeSection !== 'home') {
        return (
            <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-gray-900 mb-2">{getSectionTitle(activeSection)}</h2>
                    <p className="text-gray-600">Content for {getSectionTitle(activeSection)} will be displayed here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 flex-1">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-gray-900 mb-2">Welcome back, Admin</h1>
                <p className="text-gray-600">Here's what's happening with your timekeeping today</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={Users}
                    label="Active Employees"
                    value="247"
                    change="+12 this month"
                    changeType="positive"
                    color="blue"
                />
                <StatCard
                    icon={Clock}
                    label="Hours This Week"
                    value="9,845"
                    change="+5.2% vs last week"
                    changeType="positive"
                    color="cyan"
                />
                <StatCard
                    icon={AlertCircle}
                    label="Pending Exceptions"
                    value="18"
                    change="Needs attention"
                    changeType="warning"
                    color="amber"
                />
                <StatCard
                    icon={CheckCircle}
                    label="Approved Time Cards"
                    value="229"
                    change="92.7% completion"
                    changeType="positive"
                    color="green"
                />
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <QuickActionCard
                        icon={FileText}
                        title="Review Time Cards"
                        description="View and approve pending time cards"
                        action="Go to Time Cards"
                    />
                    <QuickActionCard
                        icon={Users}
                        title="Manage Employees"
                        description="Add, edit, or deactivate employees"
                        action="Manage Employees"
                    />
                    <QuickActionCard
                        icon={BarChart3}
                        title="Generate Reports"
                        description="Create custom reports and exports"
                        action="View Reports"
                    />
                    <QuickActionCard
                        icon={AlertCircle}
                        title="Exception Review"
                        description="Handle exceptions and discrepancies"
                        action="Review Exceptions"
                    />
                    <QuickActionCard
                        icon={Calendar}
                        title="Schedule Management"
                        description="Update shifts and schedules"
                        action="Manage Schedules"
                    />
                    <QuickActionCard
                        icon={TrendingUp}
                        title="Process Payroll"
                        description="Calculate and post payroll data"
                        action="Process Now"
                    />
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        <ActivityItem
                            type="success"
                            title="Payroll Posted"
                            description="Period ending 11/30/2025 successfully posted"
                            time="2 hours ago"
                        />
                        <ActivityItem
                            type="info"
                            title="New Employee Added"
                            description="Sarah Johnson added to Sales department"
                            time="4 hours ago"
                        />
                        <ActivityItem
                            type="warning"
                            title="Exception Created"
                            description="Missing punch for employee #1247"
                            time="Yesterday"
                        />
                        <ActivityItem
                            type="success"
                            title="Data Backup Complete"
                            description="Automated backup finished successfully"
                            time="Yesterday"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-gray-900 mb-4">Upcoming Tasks</h3>
                    <div className="space-y-4">
                        <TaskItem
                            title="Weekly Payroll Processing"
                            due="Due in 2 days"
                            priority="high"
                        />
                        <TaskItem
                            title="Monthly Report Generation"
                            due="Due in 5 days"
                            priority="medium"
                        />
                        <TaskItem
                            title="Employee Schedule Update"
                            due="Due in 1 week"
                            priority="low"
                        />
                        <TaskItem
                            title="Quarterly Data Backup"
                            due="Due in 2 weeks"
                            priority="medium"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

interface StatCardProps {
    icon: React.ComponentType<any>;
    label: string;
    value: string;
    change: string;
    changeType: 'positive' | 'warning' | 'negative';
    color: 'blue' | 'cyan' | 'amber' | 'green';
}

function StatCard({ icon: Icon, label, value, change, changeType, color }: StatCardProps) {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        cyan: 'from-cyan-500 to-cyan-600',
        amber: 'from-amber-500 to-amber-600',
        green: 'from-green-500 to-green-600'
    };

    const changeColors = {
        positive: 'text-green-600',
        warning: 'text-amber-600',
        negative: 'text-red-600'
    };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-gradient-to-br ${colorClasses[color]} rounded-xl shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="mb-1">
        <div className="text-gray-900" style={{ fontSize: '1.875rem', lineHeight: '2.25rem' }}>{value}</div>
      </div>
      <div className="text-gray-600 mb-2">{label}</div>
      <div className={`${changeColors[changeType]}`} style={{ fontSize: '0.875rem', lineHeight: '1.25rem' }}>
        {change}
      </div>
    </div>
  );
}

interface QuickActionCardProps {
    icon: React.ComponentType<any>;
    title: string;
    description: string;
    action: string;
}

function QuickActionCard({ icon: Icon, title, description, action }: QuickActionCardProps) {
    return (
        <button className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all duration-200 text-left group">
            <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="text-gray-900 mb-1">{title}</h4>
            <p className="text-gray-600 mb-3" style={{ fontSize: '0.875rem', lineHeight: '1.25rem' }}>{description}</p>
            <div className="text-blue-600" style={{ fontSize: '0.875rem', lineHeight: '1.25rem' }}>{action} →</div>
        </button>
    );
}

interface ActivityItemProps {
    type: 'success' | 'info' | 'warning';
    title: string;
    description: string;
    time: string;
}

function ActivityItem({ type, title, description, time }: ActivityItemProps) {
    const typeColors = {
        success: 'bg-green-100 text-green-600',
        info: 'bg-blue-100 text-blue-600',
        warning: 'bg-amber-100 text-amber-600'
    };

    return (
        <div className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
            <div className={`w-2 h-2 rounded-full mt-2 ${typeColors[type].replace('text-', 'bg-')}`}></div>
            <div className="flex-1">
                <div className="text-gray-900">{title}</div>
                <div className="text-gray-600" style={{ fontSize: '0.875rem', lineHeight: '1.25rem' }}>{description}</div>
                <div className="text-gray-500 mt-1" style={{ fontSize: '0.75rem', lineHeight: '1rem' }}>{time}</div>
            </div>
        </div>
    );
}

interface TaskItemProps {
    title: string;
    due: string;
    priority: 'high' | 'medium' | 'low';
}

function TaskItem({ title, due, priority }: TaskItemProps) {
    const priorityColors = {
        high: 'bg-red-100 text-red-700',
        medium: 'bg-amber-100 text-amber-700',
        low: 'bg-blue-100 text-blue-700'
    };

    return (
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0">
            <div className="flex-1">
                <div className="text-gray-900">{title}</div>
                <div className="text-gray-600 mt-1" style={{ fontSize: '0.875rem', lineHeight: '1.25rem' }}>{due}</div>
            </div>
            <span className={`px-3 py-1 rounded-full ${priorityColors[priority]}`} style={{ fontSize: '0.75rem', lineHeight: '1rem' }}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
        </div>
    );
}

function getSectionTitle(section: string): string {
    const titles: { [key: string]: string } = {
        'home': 'Home',
        'file-setup': 'File Setup',
        'timekeep-group-setup': 'TimeKeep Group Setup',
        'holiday-calendar': 'Holiday Calendar',
        'maintenance': 'Maintenance',
        'employee-master-file': 'Employee Master File',
        'employee-timekeep-configuration': 'Employee Timekeep Configuration',
        'raw-data': 'Raw Data',
        'raw-data-ot-group': 'Raw Data OT Group',
        'processed-data': 'Processed Data',
        'process': 'Process',
        'reports': 'Reports',
        'import': 'Import',
        'workshift-variable': 'Workshift Variable',
        'leave-application': 'Leave Application',
        'overtime-application': 'Overtime Application',
        'rawdata-ot-gap': 'Rawdata OT Gap',
        'rawdata-on-straight-duty': 'Rawdata On Straight Duty',
        '2-shifts-rawdata': 'Two Shifts Raw Data',
        '2-shifts-employee-timekeep-config': 'Two Shifts Employee Timekeep Config',
        'export': 'Export',
        'utilities': 'Utilities',
        'security': 'Security',
        'daily-time-record-monitoring': 'Daily Time Record Monitoring',
        'tks-group-setup-definition': 'TKS Group Setup Definition',
        'company-information': 'Company Information',
        'calendar-setup': 'Calendar Setup',
        'holiday-ot-rates-setup': 'Holiday OT Rates Setup',
        'overtime-setup': 'Overtime Setup',
        'allowance-bracket-code-setup': 'Allowance Bracket Code Setup',
        'allowance-bracketing-setup': 'Allowance Bracketing Setup',
        'allowance-per-classification-setup': 'Allowance Per Classification Setup',
        'classification-setup': 'Classification Setup',
        'earning-setup': 'Earning Setup',
        'day-type-setup': 'Day Type Setup',
        'ams-database-configuration-setup': 'AMS Database Configuration Setup',
        'borrowed-device-name': 'Borrowed Device Name',
        'coordinates-setup': 'Coordinates Setup',
        'device-type-setup': 'Device Type Setup',
        'dtr-flag-setup': 'DTR Flag Setup',
        'dtr-log-fields-setup': 'DTR Log Fields Setup',
        'sdk-list-setup': 'SDK List Setup',
        'mysql-database-configuration-setup': 'MySQL Database Configuration Setup',
        'equivalent-hours-deduction-setup': 'Equivalent Hours Deduction Setup',
        'group-schedule-setup': 'Group Schedule Setup',
        'help-setup': 'Help Setup',
        'leave-type-setup': 'Leave Type Setup',
        'additional-ot-hours-per-week': 'Additional OT Hours Per Week',
        'regular-overtime-setup': 'Regular Overtime Setup',
        'rest-day-overtime-setup': 'Rest Day Overtime Setup',
        'payroll-location-setup': 'Payroll Location Setup',
        'system-configuration-setup': 'System Configuration Setup',
        'daily-schedule-setup': 'Daily Schedule Setup',
        'rest-day-setup': 'Rest Day Setup',
        'workshift-setup': 'Workshift Setup',
        'unpaid-lunch-deduction-bracket-setup': 'Unpaid Lunch Deduction Bracket Setup',
        'bracket-code-setup': 'Bracket Code Setup',
        'tardiness-undertime-accumulation-table-setup': 'Tardiness Undertime Accumulation Table Setup',
        'area-setup': 'Area Setup',
        'branch-setup': 'Branch Setup',
        'department-setup': 'Department Setup',
        'division-setup': 'Division Setup',
        'employee-designation-setup': 'Employee Designation Setup',
        'employee-status-setup': 'Employee Status Setup',
        'group-setup': 'Group Setup',
        'job-level-setup': 'Job Level Setup',
        'location-setup': 'Location Setup',
        'pay-house-setup': 'Pay House Setup',
        'online-approval-setup': 'Online Approval Setup',
        'section-setup': 'Section Setup',
        'unit-setup': 'Unit Setup',
        'create-new-database': 'Create New Database',
        'email-configuration': 'Email Configuration',
        'audit-trail': 'Audit Trail',
        'export-nav': 'Export NAV',
        'export-payroll-data': 'Export Payroll Data',
        'payroll-dtr-allowance': 'Payroll DTR Allowance'
    };
    return titles[section] || section;
}