/**
 * Maps every protected route path to the formName used in the permissions payload.
 *
 * Rules:
 *  - If a path has an entry here, the user must have "View" permission for that
 *    formName to see its nav item and access the page.
 *  - If a path has NO entry here it is always visible (e.g. /home).
 *
 * formName values must match exactly what decryptData() returns from the payload.
 *
 * Total entries: 118
 *   File Setup        : 48  (System: 1 | Process: 34 | Employment: 13)
 *   Maintenance       : 8
 *   Processing        : 2
 *   Import            : 11
 *   Export            : 3
 *   Utilities         : 41  (Employee Config: 9 | RawData: 4 | Processed: 20 | Reports: 1 | 2 Shifts: 7)
 *   Reports           : 1
 *   Security          : 4
 * 
 * Commented Routes are left as comment for as its form names 
 * are not shown on the Security COntrol > User Group Access
 */

export const ROUTE_PERMISSIONS: Record<string, string> = {

  // ╔══════════════════════════════════════════════════════════════════════════╗
  // ║  FILE SETUP                                                              ║
  // ╚══════════════════════════════════════════════════════════════════════════╝

  // ── File Setup › System ──────────────────────────────────────────────
  '/file-setup/system/company-information':                                        'CompanyInformationSetUp',

  // ── File Setup › Process › Allowance and Earnings ────────────────────
  '/file-setup/process/allowance-and-earnings/allowance-bracket-code-setup':       'AllowBracketingCode',
  '/file-setup/process/allowance-and-earnings/allowance-bracketing-setup':         'AllowBracketing',
  '/file-setup/process/allowance-and-earnings/allowance-per-classification-setup': 'AllowancePerClassificationSetUp',
  '/file-setup/process/allowance-and-earnings/classification-setup':               'ClassificationSetUp',
  '/file-setup/process/allowance-and-earnings/earning-setup':                      'EarningSetUp',

  // ── File Setup › Process › Calendar & Day ────────────────────────────
  '/file-setup/process/calendar-setup':                                            'CalendarSetUp',
  '/file-setup/process/day-type-setup':                                            'DayTypeSetUp',

  // ── File Setup › Process › Device ────────────────────────────────────
  '/file-setup/process/device/ams-database-configuration-setup':                   'AMSDbConfigSetup',
  '/file-setup/process/device/borrowed-device-name':                               'BorrowedDeviceNameSetUp',
  '/file-setup/process/device/coordinates-setup':                                  'CoordinatesSetUp',
  '/file-setup/process/device/device-type-setup':                                  'DeviceTypeSetUp',
  '/file-setup/process/device/dtr-flag-setup':                                     'DTRFlagSetup',
  '/file-setup/process/device/dtr-log-fields-setup':                               'DTRLogFieldsSetup',
  '/file-setup/process/device/sdk-list-setup':                                     'SDKListSetup',
  '/file-setup/process/device/mysql-database-configuration-setup':                 'MySQLDbConfigSetup',

  // ── File Setup › Process › Overtime ──────────────────────────────────
  '/file-setup/process/overtime/additional-ot-hours-per-week':                     'AdditionalOTHoursPerWeek',
  '/file-setup/process/overtime/holiday-ot-rates-setup':                           'HolidayOTRatesSetUp',
  '/file-setup/process/overtime/overtime-setup':                                   'OverTimeSetUp',
  '/file-setup/process/overtime/regular-overtime-setup':                           'RegularOvertimeSetUp',
  '/file-setup/process/overtime/rest-day-overtime-setup':                          'RestdayOvertimeRates',

  // ── File Setup › Process › Tardiness/Undertime/Accumulation ──────────
  '/file-setup/process/tardiness/bracket-code-setup':                              'BracketCodeSetup',
  '/file-setup/process/tardiness/tardiness-undertime-accumulation-table-setup':    'TardinessAndUndertimeTableSetUp',

  // ── File Setup › Process › Workshift and Restday ─────────────────────
  '/file-setup/process/workshift-and-restday/daily-schedule-setup':                'DailyScheduleSetUp',
  '/file-setup/process/workshift-and-restday/rest-day-setup':                      'RestDaySetup',
  '/file-setup/process/workshift-and-restday/workshift-setup':                     'WorkShiftSetUp',

  // ── File Setup › Process › Misc ──────────────────────────────────────
  '/file-setup/process/equivalent-hours-deduction-setup':                          'EquivHoursDeduction',
  '/file-setup/process/gl-code-setup':                                             'GL_CodeSetup',
  '/file-setup/process/group-schedule-setup':                                      'GroupScheduleSetUp',
  '/file-setup/process/help-setup':                                                'HelpSetUp',
  '/file-setup/process/leave-type-setup':                                          'LeaveTypeSetUp',
  '/file-setup/process/payroll-location-setup':                                    'PayrollLocationSetup',
  '/file-setup/process/system-configuration-setup':                                'SystemConfig',
  '/file-setup/process/timekeep-group-setup':                                      'TimeKeepGroupSetUp',
  //'/file-setup/process/unpaid-lunch-deduction-bracket-setup':                      'UnpaidLunchDeductionBracketSetup',

  // ── File Setup › Employment ──────────────────────────────────────────
  '/file-setup/employment/area-setup':                                             'AreaSetUp',
  '/file-setup/employment/branch-setup':                                           'BranchSetup',
  '/file-setup/employment/department-setup':                                       'DepartmentSetUp',
  '/file-setup/employment/division-setup':                                         'DivisionSetUp',
  '/file-setup/employment/employee-designation-setup':                             'EmployeeDesignationSetup',
  '/file-setup/employment/employee-status-setup':                                  'EmployeeStatusSetUp',
  '/file-setup/employment/group-setup':                                            'GroupSetUp',
  '/file-setup/employment/job-level-setup':                                        'JobLevelSetup',
  '/file-setup/employment/location-setup':                                         'LocationSetUp',
  '/file-setup/employment/online-approval-setup':                                  'OnlineApprovalSetup',
  '/file-setup/employment/section-setup':                                          'SectionSetUp',
  '/file-setup/employment/unit-setup':                                             'UnitSetUp',
  '/file-setup/employment/pay-house-setup':                                        'LineSetUp',


  // ╔══════════════════════════════════════════════════════════════════════════╗
  // ║  MAINTENANCE                                                             ║
  // ╚══════════════════════════════════════════════════════════════════════════╝

  // ── Maintenance › Employee Management ────────────────────────────────
  '/maintenance/employee-master-file':                                             'EmpMasterFile',
  '/maintenance/employee-timekeep-configuration':                                  'EmpTKConfigMaint',
  '/maintenance/raw-data':                                                         'RawData',
  '/maintenance/rawdata-ot-gap':                                                   'RawDataOTGap',
  '/maintenance/rawdata-on-straight-duty':                                         'RawDataStraightDuty',
  '/maintenance/processed-data':                                                   'ProcessData',

  // ── Maintenance › 2 Shifts In A Day ──────────────────────────────────
  '/maintenance/2-shifts/employee-timekeep-config':                                'EmpTKConfigMaintWorkshift2ShiftsInADay',
  //'/maintenance/2-shifts/raw-data':                                                'RawData2ShiftsInADay',


  // ╔══════════════════════════════════════════════════════════════════════════╗
  // ║  PROCESSING                                                              ║
  // ╚══════════════════════════════════════════════════════════════════════════╝

  '/process/process-data':                                                         'ProcessPayroll',
  '/process/process-2-shifts-payroll':                                             'Process2ShiftsInADayPayroll',


  // ╔══════════════════════════════════════════════════════════════════════════╗
  // ║  IMPORT                                                                  ║
  // ╚══════════════════════════════════════════════════════════════════════════╝

  // ── Import › 1 Shift In A Day ────────────────────────────────────────
  '/import/workshift-variable':                                                    'ImportEmployeeWorkshiftVariable',
  '/import/leave-application':                                                     'ImportLeaveApplication',
  '/import/overtime-application':                                                  'ImportOvertimeApplication',
  '/import/device-code':                                                           'ImportDeviceCode',
  '/import/employee-masterfile':                                                   'ImportEmployeeMasterFileFromExcelTemplate',
  '/import/logs-from-device-v2':                                                   'ImportLogsFromDevice',
  '/import/update-rawdata':                                                        'UpdateRawData',
  '/import/adjustment':                                                            'ImportAdjustments',

  // ── Import › 2 Shifts In A Day ───────────────────────────────────────
  '/import/2-shifts/overtime-application':                                         'ImportOvertimeApplication2ShiftsInADay',
  '/import/2-shifts/workshift-variable':                                           'ImportEmployeeWorkshiftVariable2ShiftsInADay',
  '/import/2-shifts/logs-from-device-v2':                                          'ImportLogsFromDevice',


  // ╔══════════════════════════════════════════════════════════════════════════╗
  // ║  EXPORT                                                                  ║
  // ╚══════════════════════════════════════════════════════════════════════════╝

  '/export/payroll-data':                                                          'ExportPayrollData',
  '/export/nav':                                                                   'frmExportNAV',
  '/export/payroll-dtr-allowance':                                                 'ExportPayrollAllowData',


  // ╔══════════════════════════════════════════════════════════════════════════╗
  // ║  UTILITIES                                                               ║
  // ╚══════════════════════════════════════════════════════════════════════════╝

  // ── Utilities › Employee Configuration ───────────────────────────────
  '/utilities/employee/update-status':                                             'UpdateStatusUtil',
  '/utilities/employee/update-overtime-application':                               'UpdateOvertimeApplicationMaint',
  '/utilities/employee/update-workshift':                                          'UpdateEmployeeWorkShiftMaint',
  '/utilities/employee/update-leave-application':                                  'UpdateEmployeeLeaveApplication',
  '/utilities/employee/update-batch-rest-day':                                     'UpdateBatchRestDays',
  '/utilities/employee/update-classification':                                     'UpdateEmployeeClassification',
  '/utilities/employee/delete-transactions':                                       'DeleteEmployeeTransactions',
  '/utilities/employee/update-rawdata-online':                                     'UpdateRawData',
  //'/utilities/employee/update-pay-house':                                          '',                              // ⚠️ no formName in DB yet — pending

  // ── Utilities › Employee RawData ─────────────────────────────────────
  '/utilities/rawdata/update-daytype':                                             'UpdateEmpRawDayType',
  '/utilities/rawdata/update-workshift':                                           'UpdateWorkShiftInRawData',
  '/utilities/rawdata/delete-incomplete-logs':                                     'DeleteIncompleteLogs',
  '/utilities/rawdata/delete-rawdata':                                             'DeleteRecordsInRawData',

  // ── Utilities › Processed Data ──────────────────────────────────────
  '/utilities/processed/unpost-transaction':                                       'UnpostTransactionsUtil',
  //'/utilities/processed/unpost-2-shifts-transaction':                              'UnpostTransactions2ShiftsInADayUtil',
  '/utilities/processed/additional-hours-per-week':                                'AdditionalOTHoursPerWeekUtility',
  '/utilities/processed/apply-ot-allowances':                                      'ApplyOTAllowances',
  '/utilities/processed/apply-break-overbreak':                                    'AddShortBreakOverBreakUtil',
  '/utilities/processed/update-allowance-per-bracket':                             'UpdateAllowancePerBracketUtl',
  '/utilities/processed/update-sss-notification':                                  'UpdateSSSNotif',
  '/utilities/processed/update-hours-per-week':                                    'UpdateNoOfHrsPerWeek',
  '/utilities/processed/update-tardiness-penalty':                                 'UpdateTardinessPenalty',
  '/utilities/processed/deduct-tardiness-to-overtime':                             'DeductTardinesstoOTDayUtl',
  '/utilities/processed/delete-ot-restday-absent':                                 'DeleteOTRestIfAbsIncomplete8HrsUtl',
  '/utilities/processed/process-overtime-cutoff':                                  'ProcessOTPerCutOffUtl',
  '/utilities/processed/update-assumed-days':                                      'UpdateAssumedDays',
  '/utilities/processed/process-overtime-24hours':                                 'ProcessOT24HoursRuleUtl',
  '/utilities/processed/deduct-absences-excess':                                   'DeductAbsinExcessTotalHoursWithPayifWithFiledLvUtl',
  '/utilities/processed/post-processed-timekeeping':                               'PostTKSTransactionsUtil',
  '/utilities/processed/update-time-flag-breaks':                                  'UpdateTimeFlags',
  //'/utilities/processed/unpaid-lunch-deduction':                                   'UnpaidLunchDeductionUtl',
  '/utilities/processed/update-flexi-break':                                       'UpdateFlexiBreakUtil',
  '/utilities/processed/update-gl-code-utility':                                   'UpdateGLCode',

  // ── Utilities › Reports ──────────────────────────────────────────────
  '/utilities/reports/timekeep-email-distribution':                                'DTRDistribution',

  // ── Utilities › 2 Shifts In A Day ────────────────────────────────────
//   '/utilities/2-shifts/include-unworked-holiday-pay':                              'IncludeUnWorkHolInRegDayUtl',
//   '/utilities/2-shifts/nd-basic-round-down':                                       'NDBasicRoundDownUtl',
//   '/utilities/2-shifts/saturday-unworked-paid-regular-hours':                      'SaturdayUnWrkConsiderPdRegHrs',
//   '/utilities/2-shifts/sunday-work-ot-if-worked-saturday':                         'SunDayOTIfWrkSaturdayUtl',
//   '/utilities/2-shifts/unpost-transaction':                                        'Unpost2ShiftsInADayTransactionsUtil',
//   '/utilities/2-shifts/delete-incomplete-logs':                                    'DeleteIncompleteLogs2ShiftsInADay',
//   '/utilities/2-shifts/delete-records-raw-data':                                   'DeleteRecordsInRawData2ShiftsInADay',


  // ╔══════════════════════════════════════════════════════════════════════════╗
  // ║  REPORTS                                                                 ║
  // ╚══════════════════════════════════════════════════════════════════════════╝

  '/reports/daily-time-record-monitoring':                                         'RPTParam2',


  // ╔══════════════════════════════════════════════════════════════════════════╗
  // ║  SECURITY                                                                ║
  // ╚══════════════════════════════════════════════════════════════════════════╝

  '/security/audit-trail':                                                         'AuditTrail',
  '/security/email-configuration':                                                 'EmailConfiguration',
  '/security/create-new-database':                                                 'CreateNewDB',
  '/security/security-manager':                                                    'Security',

};