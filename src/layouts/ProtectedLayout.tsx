import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer/Footer';

// Sections whose page components render their own footer internally.
// For these routes we suppress the global footer to avoid duplication.
const PAGES_WITH_OWN_FOOTER = new Set([
  '/file-setup/system/company-information',
  '/file-setup/process/calendar-setup',
  '/file-setup/process/allowance-and-earnings/allowance-bracket-code-setup',
  '/file-setup/process/allowance-and-earnings/allowance-bracketing-setup',
  '/file-setup/process/allowance-and-earnings/allowance-per-classification-setup',
  '/file-setup/process/allowance-and-earnings/classification-setup',
  '/file-setup/process/allowance-and-earnings/earning-setup',
  '/file-setup/process/day-type-setup',
  '/file-setup/process/device/ams-database-configuration-setup',
  '/file-setup/process/device/borrowed-device-name',
  '/file-setup/process/device/coordinates-setup',
  '/file-setup/process/device/device-type-setup',
  '/file-setup/process/device/dtr-flag-setup',
  '/file-setup/process/device/dtr-log-fields-setup',
  '/file-setup/process/device/sdk-list-setup',
  '/file-setup/process/device/mysql-database-configuration-setup',
  '/file-setup/process/equivalent-hours-deduction-setup',
  '/file-setup/process/group-schedule-setup',
  '/file-setup/process/help-setup',
  '/file-setup/process/leave-type-setup',
  '/file-setup/process/overtime/additional-ot-hours-per-week',
  '/file-setup/process/overtime/holiday-ot-rates-setup',
  '/file-setup/process/overtime/overtime-setup',
  '/file-setup/process/overtime/regular-overtime-setup',
  '/file-setup/process/overtime/rest-day-overtime-setup',
  '/file-setup/process/payroll-location-setup',
  '/file-setup/process/system-configuration-setup',
  '/file-setup/process/tardiness/bracket-code-setup',
  '/file-setup/process/tardiness/tardiness-undertime-accumulation-table-setup',
  '/file-setup/process/timekeep-group-setup',
  '/file-setup/process/unpaid-lunch-deduction-bracket-setup',
  '/file-setup/process/workshift-and-restday/daily-schedule-setup',
  '/file-setup/process/workshift-and-restday/rest-day-setup',
  '/file-setup/process/workshift-and-restday/workshift-setup',
  '/file-setup/employment/area-setup',
  '/file-setup/employment/branch-setup',
  '/file-setup/employment/department-setup',
  '/file-setup/employment/division-setup',
  '/file-setup/employment/employee-designation-setup',
  '/file-setup/employment/employee-status-setup',
  '/file-setup/employment/group-setup',
  '/file-setup/employment/job-level-setup',
  '/file-setup/employment/location-setup',
  '/file-setup/employment/online-approval-setup',
  '/file-setup/employment/pay-house-setup',
  '/file-setup/employment/section-setup',
  '/file-setup/employment/unit-setup',
  '/maintenance/employee-master-file',
  '/maintenance/employee-timekeep-configuration',
  '/maintenance/raw-data',
  '/maintenance/rawdata-ot-gap',
  '/maintenance/rawdata-on-straight-duty',
  '/maintenance/processed-data',
  '/maintenance/2-shifts/employee-timekeep-config',
  '/maintenance/2-shifts/raw-data',
  '/process/process-data',
  '/process/process-2-shifts-payroll',
  '/reports/daily-time-record-monitoring',
  '/import/workshift-variable',
  '/import/leave-application',
  '/import/overtime-application',
  '/import/device-code',
  '/import/employee-masterfile',
  '/import/logs-from-device-v2',
  '/import/update-rawdata',
  '/import/adjustment',
  '/import/2-shifts/overtime-application',
  '/import/2-shifts/workshift-variable',
  '/import/2-shifts/logs-from-device-v2',
  '/export/payroll-data',
  '/export/nav',
  '/export/payroll-dtr-allowance',
  '/utilities/employee/update-status',
  '/utilities/employee/update-overtime-application',
  '/utilities/employee/update-workshift',
  '/utilities/employee/update-leave-application',
  '/utilities/employee/update-pay-house',
  '/utilities/employee/update-classification',
  '/utilities/employee/update-batch-rest-day',
  '/utilities/employee/delete-transactions',
  '/utilities/employee/update-rawdata-online',
  '/utilities/rawdata/update-daytype',
  '/utilities/rawdata/update-workshift',
  '/utilities/rawdata/delete-incomplete-logs',
  '/utilities/rawdata/delete-rawdata',
  '/utilities/processed/unpost-transaction',
  '/utilities/processed/additional-hours-per-week',
  '/utilities/processed/apply-ot-allowances',
  '/utilities/processed/apply-break-overbreak',
  '/utilities/processed/update-allowance-per-bracket',
  '/utilities/processed/update-sss-notification',
  '/utilities/processed/update-hours-per-week',
  '/utilities/processed/update-tardiness-penalty',
  '/utilities/processed/deduct-tardiness-to-overtime',
  '/utilities/processed/delete-ot-restday-absent',
  '/utilities/processed/process-overtime-cutoff',
  '/utilities/processed/update-assumed-days',
  '/utilities/processed/process-overtime-24hours',
  '/utilities/processed/deduct-absences-excess',
  '/utilities/processed/post-processed-timekeeping',
  '/utilities/processed/update-time-flag-breaks',
  '/utilities/processed/unpaid-lunch-deduction',
  '/utilities/processed/update-flexi-break',
  '/utilities/processed/update-gl-code-utility',
  '/utilities/reports/timekeep-email-distribution',
  '/utilities/2-shifts/include-unworked-holiday-pay',
  '/utilities/2-shifts/nd-basic-round-down',
  '/utilities/2-shifts/saturday-unworked-paid-regular-hours',
  '/utilities/2-shifts/sunday-work-ot-if-worked-saturday',
  '/utilities/2-shifts/unpost-transaction',
  '/utilities/2-shifts/delete-incomplete-logs',
  '/utilities/2-shifts/delete-records-raw-data',
  '/security/security-manager',
  '/security/audit-trail',
  '/security/email-configuration',
  '/security/create-new-database',
]);

interface ProtectedLayoutProps {
  onLogout: () => void;
}

export function ProtectedLayout({ onLogout }: ProtectedLayoutProps) {
  const token = localStorage.getItem('authToken');
  const location = useLocation();

  // Redirect to login if not authenticated, preserving intended destination
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hideGlobalFooter = PAGES_WITH_OWN_FOOTER.has(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Background decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob" />
        <div className="absolute top-40 -right-20 w-96 h-96 bg-lime-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000" />
      </div>

      <Navigation onLogout={onLogout} />

      {/* Page content rendered by matched child route */}
      <main className="flex-1 relative">
        <Outlet />
      </main>

      {!hideGlobalFooter && <Footer />}
    </div>
  );
}