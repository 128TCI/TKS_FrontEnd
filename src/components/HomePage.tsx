import { useState } from 'react';
import { Navigation } from './Navigation';
import { DashboardContent } from '../components/Dashboard/DashboardContent';
import { Footer } from './Footer/Footer';

interface HomePageProps {
  onLogout: () => void;
}

export function HomePage({ onLogout }: HomePageProps) {
  const [activeSection, setActiveSection] = useState('home');

  // Full-page components that have their own footer
  const fullPageSections = [
    'workshift-variable',
    'import-workshift-variable',
    'import-adjustment',
    'import-device-code',
    'import-employee-masterfile',
    'overtime-application',
    'import-overtime-application',
    'leave-application',
    'import-leave-application',
    'logs-from-device-v2',
    'import-logs-from-device-v2',
    'update-raw-data',
    'update-rawdata-import',
    'raw-data-ot-group',
    'rawdata-ot-gap',
    'rawdata-on-straight-duty',
    '2-shifts-rawdata',
    'raw-data',
    'process',
    '2-shifts-payroll',
    'process-data',
    'process-2-shifts-payroll',
    'processed-data',
    'daily-time-record-monitoring',
    'timekeep-group',
    'timekeep-group-setup',
    'tks-group-setup',
    'tks-group-setup-definition',
    'company-information',
    'calendar-setup',
    'holiday-ot-rates-setup',
    'overtime-setup',
    'employee-master-file',
    'employee-timekeep-configuration',
    'allowance-bracket-code-setup',
    'allowance-bracketing-setup',
    'allowance-per-classification-setup',
    'classification-setup',
    'earning-setup',
    'day-type-setup',
    'ams-database-configuration-setup',
    'borrowed-device-name',
    'coordinates-setup',
    'device-type-setup',
    'dtr-flag-setup',
    'dtr-log-fields-setup',
    'sdk-list-setup',
    'mysql-database-configuration-setup',
    'equivalent-hours-deduction-setup',
    'group-schedule-setup',
    'help-setup',
    'leave-type-setup',
    'additional-ot-hours-per-week',
    'regular-overtime-setup',
    'rest-day-overtime-setup',
    'payroll-location-setup',
    'system-configuration-setup',
    'daily-schedule-setup',
    'rest-day-setup',
    'workshift-setup',
    'unpaid-lunch-deduction-bracket-setup',
    'bracket-code-setup',
    'tardiness-undertime-accumulation-table-setup',
    'area-setup',
    'branch-setup',
    'department-setup',
    'division-setup',
    'employee-designation-setup',
    'employee-status-setup',
    'group-setup',
    'job-level-setup',
    'location-setup',
    'pay-house-setup',
    'online-approval-setup',
    'section-setup',
    'unit-setup',
    '2-shifts-employee-timekeep-config',
    'overtime-application-2-shifts',
    'workshift-variable-2-shifts',
    'logs-from-device-2-shifts',
    'update-status',
    'update-employee-overtime-application',
    'update-employee-workshift',
    'update-employee-leave-application',
    'update-employee-pay-house',
    'update-employee-classification',
    'update-batch-rest-day',
    'delete-employee-transactions',
    'update-rawdata-online',
    'update-daytype-rawdata',
    'update-workshift-rawdata',
    'delete-incomplete-logs',
    'delete-rawdata',
    'unpost-transaction',
    'additional-hours-per-week',
    'apply-ot-allowances',
    'apply-break-overbreak',
    'update-allowance-per-bracket',
    'update-gl-code-utility',
    'update-sss-notification',
    'process-overtime-24hours',
    'post-processed-timekeeping',
    'update-time-flag-breaks',
    'unpaid-lunch-deduction',
    'update-flexi-break',
    'deduct-tardiness-to-overtime',
    'timekeep-email-distribution',
    'include-unworked-holiday-pay-regular-days-hours',
    'nd-basic-round-down',
    'saturday-unworked-paid-regular-hours',
    'sunday-work-ot-if-worked-saturday',
    'unpost-2-shifts-transaction',
    'delete-incomplete-logs-2-shifts',
    'delete-records-raw-data-2-shifts',
  ];

  const hasOwnFooter = fullPageSections.includes(activeSection);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 3D Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-40 -right-20 w-96 h-96 bg-lime-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
      </div>    
      <Navigation onLogout={onLogout} activeSection={activeSection} setActiveSection={setActiveSection} />
      <DashboardContent activeSection={activeSection} />
      {!hasOwnFooter && <Footer />}
    </div>
  );
}