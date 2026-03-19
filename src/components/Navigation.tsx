import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useHref } from 'react-router-dom';
import apiClient, { getLoggedInUsername } from '../services/apiClient';
import auditTrail from '../services/auditTrail';
import Swal from 'sweetalert2';
import {
  Home, FileText, Settings,
  Play, BarChart3, Download,
  Upload, Wrench, Shield,
  ChevronDown, ChevronRight,
  Clock, LogOut, User, X, Menu,
} from 'lucide-react';
import { decryptData } from '../services/encryptionService';
import { usePermissions } from '../hooks/usePermissions';
import { ROUTE_PERMISSIONS } from '../config/routePermissions';
import { SystemInfo } from './Types/system';
import { systemService } from '../services/systemService';

// ── Basename-aware href hook ───────────────────────────────────────────────
function useBasename(): string {
  const root = useHref('/');
  return root.endsWith('/') ? root.slice(0, -1) : root;
}

interface NavigationProps {
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  submenu?: SubMenuItem[];
}

interface SubMenuItem {
  label?: string;
  path?: string;
  separator?: boolean;
  isCategory?: boolean;
  hasSubmenu?: boolean;
  children?: SubMenuItem[];
}

export function Navigation({ onLogout }: NavigationProps) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const basename  = useBasename();

  // href helper — always in sync with BrowserRouter basename
  const href = (path: string) => `${basename}${path}`;

  const [systemInfo, setSystemInfo]   = useState<SystemInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  const [expandedMenu, setExpandedMenu]                       = useState<string | null>(null);
  const [hoveredSubmenu, setHoveredSubmenu]                   = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen]                   = useState(false);
  const [showVersionTooltip, setShowVersionTooltip]           = useState(false);
  const [navToast, setNavToast]                               = useState(false);
  const [isLoggingOut, setIsLoggingOut]                       = useState(false);
  const [mobileExpandedSubmenus, setMobileExpandedSubmenus]   = useState<Set<string>>(new Set());
  const [mobileExpandedMainMenu, setMobileExpandedMainMenu]   = useState<string | null>(null);
  const [buttonPositions, setButtonPositions]                 = useState<{ [key: string]: { left: number; top: number; width: number } }>({});
  const [companyDisplayName, setCompanyDisplayName]           = useState('');

  const dropdownRef          = useRef<HTMLDivElement>(null);
  const closeTimeoutRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inactivityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchedRef           = useRef(false);

  const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
  const token = localStorage.getItem('token');

  const { canView } = usePermissions();

  const canViewPath = (path?: string): boolean => {
    if (!path) return true;
    const formName = ROUTE_PERMISSIONS[path];
    if (!formName) return true;
    return canView(formName);
  };

  const filterSubmenu = (items: SubMenuItem[]): SubMenuItem[] =>
    items.reduce<SubMenuItem[]>((acc, item) => {
      if (item.separator) { acc.push(item); return acc; }
      if (item.children) {
        const visibleChildren = filterSubmenu(item.children);
        if (visibleChildren.filter(c => !c.separator).length > 0) acc.push({ ...item, children: visibleChildren });
        return acc;
      }
      if (canViewPath(item.path)) acc.push(item);
      return acc;
    }, []);

  // ── Reset mobile state when switching to desktop ───────────────────────────
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleScreenChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        setMobileMenuOpen(false);
        setMobileExpandedMainMenu(null);
        setMobileExpandedSubmenus(new Set());
      }
    };
    handleScreenChange(mediaQuery);
    mediaQuery.addEventListener('change', handleScreenChange);
    return () => mediaQuery.removeEventListener('change', handleScreenChange);
  }, []);

  // ── Inactivity auto-logout ─────────────────────────────────────────────────
  useEffect(() => {
    const resetInactivityTimer = () => {
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = setTimeout(handleAutoLogout, INACTIVITY_TIMEOUT);
    };
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(e => document.addEventListener(e, resetInactivityTimer));
    resetInactivityTimer();
    return () => {
      activityEvents.forEach(e => document.removeEventListener(e, resetInactivityTimer));
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
    };
  }, []);

  const handleAutoLogout = async () => {
    setIsLoggingOut(true);
    try {
      const loginPayloadStr = localStorage.getItem('userData');
      const loginPayload    = loginPayloadStr ? JSON.parse(loginPayloadStr) : {};
      const username = loginPayload.username || loginPayload.userName || 'Unknown';
      const userId   = loginPayload.userID   || loginPayload.userId   || loginPayload.id || 0;
      await apiClient.post('UserLogin/logout', { userId });
      try {
        await auditTrail.log({
          trans: `Employee ${decryptData(username)} logged out (auto).`,
          messages: `Employee ${decryptData(username)} logged out due to inactivity.`,
          formName: 'LogOut',
          accessType: 'LogOut',
        });
      } catch (err) { console.error('Audit trail failed for auto logout:', err); }
      localStorage.removeItem('authToken');
      localStorage.removeItem('loginTimestamp');
      localStorage.removeItem('loginPayload');
      localStorage.removeItem('userData');
      await Swal.fire({ icon: 'warning', title: 'Session Expired', text: 'You have been logged out due to inactivity.', timer: 2000, showConfirmButton: false });
      onLogout();
    } catch {
      localStorage.removeItem('authToken');
      localStorage.removeItem('loginTimestamp');
      localStorage.removeItem('loginPayload');
      localStorage.removeItem('userData');
      onLogout();
    }
  };

  // ── Manual logout ──────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const loginPayloadStr = localStorage.getItem('userData');
      const loginPayload    = loginPayloadStr ? JSON.parse(loginPayloadStr) : {};
      const username = loginPayload.username || loginPayload.userName || 'Unknown';
      const userId   = loginPayload.userID   || loginPayload.userId   || loginPayload.id || 0;
      await apiClient.post('UserLogin/logout', { userId }, { headers: { Authorization: `Bearer ${token}` } });
      try {
        await auditTrail.log({
          trans: `Employee ${decryptData(username)} logged out.`,
          messages: `Employee ${decryptData(username)} logged out.`,
          formName: 'LogOut',
          accessType: 'LogOut',
        });
      } catch (err) { console.error('Audit trail failed for logout:', err); }
      localStorage.removeItem('authToken');
      localStorage.removeItem('loginTimestamp');
      localStorage.removeItem('loginPayload');
      localStorage.removeItem('userData');
      await Swal.fire({ icon: 'success', title: 'Logout Successful', text: 'You have been logged out.', timer: 1500, showConfirmButton: false });
      onLogout();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Logout failed';
      await Swal.fire({ icon: 'error', title: 'Logout Error', text: errorMsg });
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const fetchCompanyName = async () => {
      try {
        const response = await apiClient.get('/Fs/System/CompanyInformation');
        const infoList = Array.isArray(response.data) ? response.data : [];
        setCompanyDisplayName(infoList[0]?.companyName ?? '');
      } catch {
        setCompanyDisplayName('');
      }
    };
    fetchCompanyName();
  }, []);

  const fetchSystemInfo = async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setLoadingInfo(true);
    try {
      const data = await systemService.getSystemInfo();
      setSystemInfo(data);
    } catch {
      fetchedRef.current = false;
      setSystemInfo(null);
    } finally {
      setLoadingInfo(false);
    }
  };

  // ── Copy build info to clipboard ──────────────────────────────────────────
  const handleCopyBuildInfo = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!systemInfo) return;
    const text = `${systemInfo.appVersion} ${systemInfo.buildDate}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    }
    setNavToast(true);
    setTimeout(() => setNavToast(false), 2500);
  };

  // ── Menu definition ────────────────────────────────────────────────────────
  const menuItems: MenuItem[] = [
    { id: 'home', label: 'Home', icon: Home, path: '/home' },
    {
      id: 'file-setup', label: 'File Setup', icon: FileText, path: '/file-setup',
      submenu: [
        { label: 'System', isCategory: true, children: [
          { label: 'Company Information', path: '/file-setup/system/company-information' },
        ]},
        { label: 'Process', isCategory: true, children: [
          { label: 'Allowance and Earnings', hasSubmenu: true, children: [
            { label: 'Allowance Bracket Code Setup',           path: '/file-setup/process/allowance-and-earnings/allowance-bracket-code-setup' },
            { label: 'Allowance Bracketing Setup',             path: '/file-setup/process/allowance-and-earnings/allowance-bracketing-setup' },
            { label: 'Allowance per Classification Setup',     path: '/file-setup/process/allowance-and-earnings/allowance-per-classification-setup' },
            { label: 'Classification Setup',                   path: '/file-setup/process/allowance-and-earnings/classification-setup' },
            { label: 'Earning Setup',                          path: '/file-setup/process/allowance-and-earnings/earning-setup' },
          ]},
          { label: 'Calendar Setup',                           path: '/file-setup/process/calendar-setup' },
          { label: 'Day Type Setup',                           path: '/file-setup/process/day-type-setup' },
          { label: 'Device', hasSubmenu: true, children: [
            { label: 'AMS Database Configuration Setup',       path: '/file-setup/process/device/ams-database-configuration-setup' },
            { label: 'Borrowed Device Name',                   path: '/file-setup/process/device/borrowed-device-name' },
            { label: 'Coordinates Setup',                      path: '/file-setup/process/device/coordinates-setup' },
            { label: 'Device Type Setup',                      path: '/file-setup/process/device/device-type-setup' },
            { label: 'DTR Flag Setup',                         path: '/file-setup/process/device/dtr-flag-setup' },
            { label: 'DTR Log Fields Setup',                   path: '/file-setup/process/device/dtr-log-fields-setup' },
            { label: 'SDK List Setup',                         path: '/file-setup/process/device/sdk-list-setup' },
            { label: 'MYSQL Database Configuration Setup',     path: '/file-setup/process/device/mysql-database-configuration-setup' },
          ]},
          { label: 'Equivalent Hours Deduction Setup',         path: '/file-setup/process/equivalent-hours-deduction-setup' },
          { label: 'Group Schedule Setup',                     path: '/file-setup/process/group-schedule-setup' },
          { label: 'Help Setup',                               path: '/file-setup/process/help-setup' },
          { label: 'Leave Type Setup',                         path: '/file-setup/process/leave-type-setup' },
          { label: 'Overtime', hasSubmenu: true, children: [
            { label: 'Additional OT Hours Per Week',           path: '/file-setup/process/overtime/additional-ot-hours-per-week' },
            { label: 'Holiday OT Rates Setup',                 path: '/file-setup/process/overtime/holiday-ot-rates-setup' },
            { label: 'Overtime Setup',                         path: '/file-setup/process/overtime/overtime-setup' },
            { label: 'Regular Overtime Setup',                 path: '/file-setup/process/overtime/regular-overtime-setup' },
            { label: 'RestDay Overtime Setup',                 path: '/file-setup/process/overtime/rest-day-overtime-setup' },
          ]},
          { label: 'Payroll Location Setup',                   path: '/file-setup/process/payroll-location-setup' },
          { label: 'System Configuration Setup',               path: '/file-setup/process/system-configuration-setup' },
          { label: 'Tardiness/Undertime/Accumulation Bracket', hasSubmenu: true, children: [
            { label: 'Bracket Code Setup',                                        path: '/file-setup/process/tardiness/bracket-code-setup' },
            { label: 'Tardiness/Undertime/Accumulation Table Setup',              path: '/file-setup/process/tardiness/tardiness-undertime-accumulation-table-setup' },
          ]},
          { label: 'Timekeep Group Setup',                     path: '/file-setup/process/timekeep-group-setup' },
          { label: 'Workshift and Restday', hasSubmenu: true, children: [
            { label: 'Daily Schedule Setup',                   path: '/file-setup/process/workshift-and-restday/daily-schedule-setup' },
            { label: 'Restday Setup',                          path: '/file-setup/process/workshift-and-restday/rest-day-setup' },
            { label: 'Workshift Setup',                        path: '/file-setup/process/workshift-and-restday/workshift-setup' },
          ]},
          { label: 'Unpaid Lunch Deduction Bracket Setup',     path: '/file-setup/process/unpaid-lunch-deduction-bracket-setup' },
        ]},
        { label: 'Employment', isCategory: true, children: [
          { label: 'Area Setup',                   path: '/file-setup/employment/area-setup' },
          { label: 'Branch Setup',                 path: '/file-setup/employment/branch-setup' },
          { label: 'Department Setup',             path: '/file-setup/employment/department-setup' },
          { label: 'Division Setup',               path: '/file-setup/employment/division-setup' },
          { label: 'Employee Designation Setup',   path: '/file-setup/employment/employee-designation-setup' },
          { label: 'Employee Status Setup',        path: '/file-setup/employment/employee-status-setup' },
          { label: 'Group Setup',                  path: '/file-setup/employment/group-setup' },
          { label: 'Job Level Setup',              path: '/file-setup/employment/job-level-setup' },
          { label: 'Location Setup',               path: '/file-setup/employment/location-setup' },
          { label: 'Pay House Setup',              path: '/file-setup/employment/pay-house-setup' },
          { label: 'Online Approval Setup',        path: '/file-setup/employment/online-approval-setup' },
          { label: 'Section Setup',                path: '/file-setup/employment/section-setup' },
          { label: 'Unit Setup',                   path: '/file-setup/employment/unit-setup' },
        ]},
      ],
    },
    {
      id: 'maintenance', label: 'Maintenance', icon: Settings, path: '/maintenance',
      submenu: [
        { label: 'Employee Management', isCategory: true, children: [
          { label: 'Employee Master File',                path: '/maintenance/employee-master-file' },
          { label: 'Employee Timekeep Configuration',     path: '/maintenance/employee-timekeep-configuration' },
          { separator: true },
          { label: 'Rawdata',                             path: '/maintenance/raw-data' },
          { label: 'Rawdata Ot Gap',                      path: '/maintenance/rawdata-ot-gap' },
          { label: 'Rawdata On Straight Duty',            path: '/maintenance/rawdata-on-straight-duty' },
          { separator: true },
          { label: 'Processed Data',                      path: '/maintenance/processed-data' },
        ]},
        { label: '2 Shifts In A Day', isCategory: true, children: [
          { label: '2 Shifts In A Day - Employee Timekeep Configuration', path: '/maintenance/2-shifts/employee-timekeep-config' },
          { label: '2 Shifts In A Day - Rawdata',                         path: '/maintenance/2-shifts/raw-data' },
        ]},
      ],
    },
    {
      id: 'process', label: 'Process', icon: Play, path: '/process',
      submenu: [
        { label: 'Process Data',                      path: '/process/process-data' },
        { label: 'Process 2 Shifts In A Day Payroll', path: '/process/process-2-shifts-payroll' },
      ],
    },
    {
      id: 'utilities', label: 'Utilities', icon: Wrench, path: '/utilities',
      submenu: [
        { isCategory: true, label: 'Utility On Employee Configuration', children: [
          { label: 'Update Status',                          path: '/utilities/employee/update-status' },
          { label: 'Update Employee Overtime Application',   path: '/utilities/employee/update-overtime-application' },
          { label: 'Update Employee Workshift',              path: '/utilities/employee/update-workshift' },
          { label: 'Update Employee Leave Application',      path: '/utilities/employee/update-leave-application' },
          { label: 'Update Employee Pay House',              path: '/utilities/employee/update-pay-house' },
          { label: 'Update Batch Restday',                   path: '/utilities/employee/update-batch-rest-day' },
          { label: 'Update Employee Classification',         path: '/utilities/employee/update-classification' },
          { label: 'Delete Employee Transactions',           path: '/utilities/employee/delete-transactions' },
          { label: 'Update Rawdata Online',                  path: '/utilities/employee/update-rawdata-online' },
        ]},
        { isCategory: true, label: 'Utility On Rawdata', children: [
          { label: 'Update Daytype In Rawdata',  path: '/utilities/rawdata/update-daytype' },
          { label: 'Update Workshift In Rawdata', path: '/utilities/rawdata/update-workshift' },
          { label: 'Delete Incomplete Logs',      path: '/utilities/rawdata/delete-incomplete-logs' },
          { label: 'Delete Rawdata',              path: '/utilities/rawdata/delete-rawdata' },
        ]},
        { isCategory: true, label: 'Utility On Processed Data', children: [
          { label: 'Unpost Transaction',                                                             path: '/utilities/processed/unpost-transaction' },
          { label: 'Additional Hours Per Week',                                                      path: '/utilities/processed/additional-hours-per-week' },
          { label: 'Apply Ot Allowance',                                                             path: '/utilities/processed/apply-ot-allowances' },
          { label: 'Apply Break1 And Break3 Overbreak',                                              path: '/utilities/processed/apply-break-overbreak' },
          { label: 'Update Allowance Per Bracket',                                                   path: '/utilities/processed/update-allowance-per-bracket' },
          { label: 'Update SSS Notification',                                                        path: '/utilities/processed/update-sss-notification' },
          { label: 'Update No. Of Hours Per Week',                                                   path: '/utilities/processed/update-hours-per-week' },
          { label: 'Update Tardiness Penalty',                                                       path: '/utilities/processed/update-tardiness-penalty' },
          { label: 'Deduct Tardiness To Overtime Of The Day',                                        path: '/utilities/processed/deduct-tardiness-to-overtime' },
          { label: 'Delete Ot During Restday If Absent Or Incomplete In Previous Day',               path: '/utilities/processed/delete-ot-restday-absent' },
          { label: 'Process Overtime Per Cut-Off',                                                   path: '/utilities/processed/process-overtime-cutoff' },
          { label: 'Update Assumed Days',                                                            path: '/utilities/processed/update-assumed-days' },
          { label: 'Process Overtime 24 Hours Rule',                                                 path: '/utilities/processed/process-overtime-24hours' },
          { label: 'Deduct Absences In Excess Of Total Hours With Pay If With Filed Leave',          path: '/utilities/processed/deduct-absences-excess' },
          { label: 'Post Processed Timekeeping Transactions',                                        path: '/utilities/processed/post-processed-timekeeping' },
          { label: 'Utility To Update The Time Flag Based On Set Policy Of Breaks',                 path: '/utilities/processed/update-time-flag-breaks' },
          { label: 'Unpaid Lunch Deduction',                                                         path: '/utilities/processed/unpaid-lunch-deduction' },
          { label: 'Update Flexi Break',                                                             path: '/utilities/processed/update-flexi-break' },
          { label: 'Update GL Code Utility',                                                         path: '/utilities/processed/update-gl-code-utility' },
        ]},
        { isCategory: true, label: 'Utility On Reports', children: [
          { label: 'Timekeep Email Distribution', path: '/utilities/reports/timekeep-email-distribution' },
        ]},
        { isCategory: true, label: 'Utility On 2 Shifts In A Day', children: [
          { label: 'Include Unworked Holiday Pay in the Regular Days/Hours',        path: '/utilities/2-shifts/include-unworked-holiday-pay' },
          { label: 'ND Basic Round Down',                                            path: '/utilities/2-shifts/nd-basic-round-down' },
          { label: 'Saturday Unworked Considered as Paid Regular Hours',             path: '/utilities/2-shifts/saturday-unworked-paid-regular-hours' },
          { label: 'Sunday Work Is Considered OT if Worked on Saturday',             path: '/utilities/2-shifts/sunday-work-ot-if-worked-saturday' },
          { label: 'Unpost 2 Shifts In A Day Transaction',                           path: '/utilities/2-shifts/unpost-transaction' },
          { label: 'Delete Incomplete Logs 2 Shifts In A Day',                       path: '/utilities/2-shifts/delete-incomplete-logs' },
          { label: 'Delete Records In Raw Data 2 Shifts In A Day',                   path: '/utilities/2-shifts/delete-records-raw-data' },
        ]},
      ],
    },
    {
      id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports',
      submenu: [{ label: 'Daily Time Record Monitoring', path: '/reports/daily-time-record-monitoring' }],
    },
    {
      id: 'import', label: 'Import', icon: Upload, path: '/import',
      submenu: [
        { label: '1 shift in a Day', isCategory: true, children: [
          { label: 'Import Workshift Variable',      path: '/import/workshift-variable' },
          { label: 'Import Leave Application',       path: '/import/leave-application' },
          { label: 'Import Overtime Application',    path: '/import/overtime-application' },
          { label: 'Import Device Code',             path: '/import/device-code' },
          { label: 'Import Employee Masterfile',     path: '/import/employee-masterfile' },
          { label: 'Import Logs From Device V2',     path: '/import/logs-from-device-v2' },
          { label: 'Update Raw Data',                path: '/import/update-rawdata' },
          { label: 'Import Adjustment',              path: '/import/adjustment' },
        ]},
        { label: '2 Shift in a Day', isCategory: true, children: [
          { label: 'Import Overtime Application',    path: '/import/2-shifts/overtime-application' },
          { label: 'Import Workshift Variable',      path: '/import/2-shifts/workshift-variable' },
          { label: 'Import Logs From Device V2',     path: '/import/2-shifts/logs-from-device-v2' },
        ]},
      ],
    },
    {
      id: 'export', label: 'Export', icon: Download, path: '/export',
      submenu: [
        { label: 'Payroll Data',            path: '/export/payroll-data' },
        { label: 'Export NAV',              path: '/export/nav' },
        { label: 'Payroll DTR Allowance',   path: '/export/payroll-dtr-allowance' },
      ],
    },
    {
      id: 'security', label: 'Security', icon: Shield, path: '/security',
      submenu: [
        { label: 'Security Manager',    path: '/security/security-manager' },
        { label: 'Audit Trail',         path: '/security/audit-trail' },
        { label: 'Email Configuration', path: '/security/email-configuration' },
        { label: 'Create New Database', path: '/security/create-new-database' },
      ],
    },
  ];

  // ── Click outside closes dropdown ─────────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node))
        setExpandedMenu(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Navigation helpers ─────────────────────────────────────────────────────
  const goTo = (path: string) => {
    navigate(path);
    setExpandedMenu(null);
    setMobileMenuOpen(false);
    setMobileExpandedMainMenu(null);
    setMobileExpandedSubmenus(new Set());
    setButtonPositions({});
  };

  const handleMenuClick = (item: MenuItem, event?: React.MouseEvent<HTMLButtonElement>) => {
    if (item.submenu) {
      if (expandedMenu === item.id) {
        setExpandedMenu(null);
        setButtonPositions({});
      } else {
        if (event) {
          const button = event.currentTarget;
          const buttonRect = button.getBoundingClientRect();
          const navContainer = button.closest('.px-4.lg\\:px-6');
          if (navContainer) {
            const navRect = navContainer.getBoundingClientRect();
            setButtonPositions({ [item.id]: { left: buttonRect.left - navRect.left, top: buttonRect.bottom - navRect.top, width: buttonRect.width } });
          }
        }
        setExpandedMenu(item.id);
      }
    } else {
      goTo(item.path);
    }
  };

  const handleMobileMenuClick = (item: MenuItem) => {
    if (item.submenu) setMobileExpandedMainMenu(mobileExpandedMainMenu === item.id ? null : item.id);
    else goTo(item.path);
  };

  const toggleMobileSubmenu = (key: string) => {
    const next = new Set(mobileExpandedSubmenus);
    next.has(key) ? next.delete(key) : next.add(key);
    setMobileExpandedSubmenus(next);
  };

  const isMenuItemActive  = (item: MenuItem): boolean =>
    location.pathname === item.path || location.pathname.startsWith(item.path + '/');

  const isSubItemActive = (path?: string): boolean =>
    !!path && location.pathname === path;

  const handleFlyoutEnter = (key: string) => {
    if (closeTimeoutRef.current) { clearTimeout(closeTimeoutRef.current); closeTimeoutRef.current = null; }
    setExpandedMenu(key);
  };

  const handleFlyoutLeave = () => {
    closeTimeoutRef.current = setTimeout(() => setExpandedMenu(null), 200);
  };

  // ── Desktop mega-menu renderers ────────────────────────────────────────────
  const renderFileSetupMegaMenu = (submenu: SubMenuItem[]) => {
    const categories = submenu.filter(i => i.isCategory);
    return (
      <div className="flex gap-8 p-6 min-w-[900px]">
        {categories.map((category, catIndex) => (
          <div key={catIndex} className="flex-1 min-w-0">
            <h3 className="text-cyan-600 font-semibold text-base mb-3 pb-2 border-b border-green-300">{category.label}</h3>
            <div className="space-y-0.5">
              {category.children?.map((child, childIndex) => {
                if (child.hasSubmenu && child.children) {
                  return (
                    <div key={childIndex} className="relative group">
                      <button
                        type="button"
                        className="w-full text-left px-2 py-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-150 text-sm rounded flex items-center justify-between cursor-pointer"
                        onMouseEnter={() => setHoveredSubmenu(`file-setup-${catIndex}-${childIndex}`)}
                        onMouseLeave={() => setHoveredSubmenu(null)}
                      >
                        <span>{child.label}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                      {hoveredSubmenu === `file-setup-${catIndex}-${childIndex}` && (
                        <div
                          className="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-72 z-50 animate-slideRight"
                          onMouseEnter={() => setHoveredSubmenu(`file-setup-${catIndex}-${childIndex}`)}
                          onMouseLeave={() => setHoveredSubmenu(null)}
                        >
                          {child.children.map((sub, subIdx) => (
                            <a
                              key={subIdx}
                              href={href(sub.path || '')}
                              onClick={(e) => { e.preventDefault(); goTo(sub.path || ''); }}
                              className={`block w-full px-4 py-2 transition-colors duration-150 text-sm ${isSubItemActive(sub.path) ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
                            >
                              {sub.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                if (child.children) {
                  return (
                    <div key={childIndex} className="mb-2">
                      <div className="text-gray-800 font-medium text-sm mb-1 px-2">{child.label}</div>
                      <div className="space-y-0.5 pl-2">
                        {child.children.map((sub, subIdx) => (
                          <a
                            key={subIdx}
                            href={href(sub.path || '')}
                            onClick={(e) => { e.preventDefault(); goTo(sub.path || ''); }}
                            className={`block w-full px-2 py-1 transition-colors duration-150 text-sm rounded ${isSubItemActive(sub.path) ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
                          >
                            {sub.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <a
                    key={childIndex}
                    href={href(child.path || '')}
                    onClick={(e) => { e.preventDefault(); goTo(child.path || ''); }}
                    className={`block w-full px-2 py-1 transition-colors duration-150 text-sm rounded ${isSubItemActive(child.path) ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
                  >
                    {child.label}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCategoryMegaMenu = (submenu: SubMenuItem[], minWidth = 'min-w-[800px]') => {
    const categories = submenu.filter(i => i.isCategory);
    return (
      <div className={`flex gap-8 p-6 ${minWidth}`}>
        {categories.map((category, catIndex) => (
          <div key={catIndex} className="flex-1 min-w-0">
            <h3 className="text-cyan-600 font-semibold text-base mb-3 pb-2 border-b border-gray-300">{category.label}</h3>
            <div className="space-y-0.5">
              {category.children?.map((child, childIndex) => {
                if (child.separator) return <div key={childIndex} className="my-2 border-t border-gray-300" />;
                return (
                  <a
                    key={childIndex}
                    href={href(child.path || '')}
                    onClick={(e) => { e.preventDefault(); goTo(child.path || ''); }}
                    className={`block w-full px-2 py-1 transition-colors duration-150 text-sm rounded ${isSubItemActive(child.path) ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
                  >
                    {child.label}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSimpleSubmenu = (submenu: SubMenuItem[], parentKey = 'submenu') => (
    <div className="py-2">{submenu.map((item, index) => renderSubmenuItem(item, index, parentKey))}</div>
  );

  const renderSubmenuItem = (subItem: SubMenuItem, index: number, parentKey = 'submenu'): React.ReactNode => {
    const itemKey = `${parentKey}-${index}`;
    if (subItem.separator) return <div key={itemKey} className="my-1 border-t border-gray-200" />;
    if (subItem.isCategory && subItem.children) {
      return (
        <div key={itemKey} className="relative group">
          <button
            type="button"
            className="w-full text-left px-4 py-2 text-gray-900 font-semibold text-sm flex items-center justify-between hover:bg-gray-50"
            onMouseEnter={() => handleFlyoutEnter(itemKey)}
            onMouseLeave={handleFlyoutLeave}
          >
            {subItem.label}<ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          {expandedMenu === itemKey && (
            <div
              className="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-80 max-h-[70vh] overflow-y-auto animate-slideRight z-50"
              onMouseEnter={() => handleFlyoutEnter(itemKey)}
              onMouseLeave={handleFlyoutLeave}
            >
              {subItem.children.map((child, i) => renderSubmenuItem(child, i, itemKey))}
            </div>
          )}
        </div>
      );
    }
    if (subItem.children) {
      return (
        <div key={itemKey} className="relative group">
          <button
            type="button"
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 text-sm flex items-center justify-between"
            onMouseEnter={() => handleFlyoutEnter(itemKey)}
            onMouseLeave={handleFlyoutLeave}
          >
            {subItem.label}<ChevronRight className="w-4 h-4" />
          </button>
          {expandedMenu === itemKey && (
            <div
              className="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-80 max-h-[70vh] overflow-y-auto animate-slideRight z-50"
              onMouseEnter={() => handleFlyoutEnter(itemKey)}
              onMouseLeave={handleFlyoutLeave}
            >
              {subItem.children.map((child, i) => renderSubmenuItem(child, i, itemKey))}
            </div>
          )}
        </div>
      );
    }
    if (subItem.path) {
      return (
        <a
          key={itemKey}
          href={href(subItem.path)}
          onClick={(e) => { e.preventDefault(); goTo(subItem.path!); }}
          className={`block w-full px-4 py-2 transition-colors duration-150 text-sm ${isSubItemActive(subItem.path) ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}
        >
          {subItem.label}
        </a>
      );
    }
    return null;
  };

  const renderMobileSubmenuItem = (subItem: SubMenuItem, index: number, parentKey = 'mobile-submenu', depth = 0): React.ReactNode => {
    const itemKey    = `${parentKey}-${index}`;
    const paddingLeft = `${(depth + 1) * 1}rem`;
    if (subItem.separator) return <div key={itemKey} className="my-1 border-t border-gray-300" />;
    if ((subItem.isCategory || subItem.hasSubmenu || subItem.children) && subItem.children) {
      const isExpanded = mobileExpandedSubmenus.has(itemKey);
      return (
        <div key={itemKey} className="w-full">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleMobileSubmenu(itemKey); }}
            className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between hover:bg-slate-600 active:bg-slate-700 rounded transition-colors touch-manipulation ${subItem.isCategory ? 'text-slate-200 font-semibold' : 'text-slate-200'}`}
            style={{ paddingLeft }}
          >
            <span className="flex-1">{subItem.label}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ml-2 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
          {isExpanded && (
            <div className="space-y-0.5 mt-0.5 bg-green-800/40 rounded py-1">
              {subItem.children.map((child, i) => renderMobileSubmenuItem(child, i, itemKey, depth + 1))}
            </div>
          )}
        </div>
      );
    }
    if (subItem.path) {
      return (
        <a
          key={itemKey}
          href={href(subItem.path)}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); goTo(subItem.path!); }}
          className={`block w-full px-3 py-2.5 text-sm rounded transition-colors touch-manipulation ${isSubItemActive(subItem.path) ? 'bg-blue-500 text-white font-medium' : 'text-slate-200 hover:bg-slate-600 active:bg-slate-700'}`}
          style={{ paddingLeft }}
        >
          {subItem.label}
        </a>
      );
    }
    return null;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <nav className="bg-green-600 border-b border-green-600 sticky top-0 z-50 shadow-lg">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-md">
              <Clock className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-white text-lg">
              {companyDisplayName || 'DEMO ACCOUNT'}
            </h1>
          </div>

          {/* Desktop menu buttons */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center relative">
            <div className="flex items-center space-x-1 overflow-x-auto nav-scroll max-w-full">
              {menuItems.map((item) => {
                const visibleSubmenu = item.submenu ? filterSubmenu(item.submenu) : undefined;
                if (item.submenu && visibleSubmenu!.length === 0) return null;
                return (
                  <div key={item.id} className="flex-shrink-0">
                    <button
                      onClick={(e) => handleMenuClick(item, e)}
                      className={`flex items-center space-x-2 px-3 py-3 rounded-lg transition-all duration-200 whitespace-nowrap ${
                        expandedMenu === item.id || isMenuItemActive(item)
                          ? 'bg-amber-100 text-gray-800 font-semibold'
                          : 'text-slate-200 hover:bg-green-700 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                      {item.submenu && <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedMenu === item.id ? 'rotate-180' : ''}`} />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dropdown menus rendered at nav level */}
          {expandedMenu && buttonPositions[expandedMenu] && (
            <div ref={dropdownRef} className="absolute z-50"
              style={{ left: `${buttonPositions[expandedMenu].left}px`, top: '56px' }}>
              {menuItems.map((item) => {
                if (expandedMenu !== item.id || !item.submenu) return null;
                return (
                  <div
                    key={`dropdown-${item.id}`}
                    className={`bg-white rounded-lg shadow-xl border border-gray-200 animate-slideDown ${
                      ['file-setup', 'maintenance', 'utilities', 'import'].includes(item.id) ? '' :
                      item.id === 'process' ? 'py-2 w-80' : 'py-2 w-56'
                    }`}
                  >
                    {item.id === 'file-setup'  ? renderFileSetupMegaMenu(filterSubmenu(item.submenu)) :
                     item.id === 'maintenance' ? renderCategoryMegaMenu(filterSubmenu(item.submenu), 'min-w-[800px]') :
                     item.id === 'utilities'   ? renderCategoryMegaMenu(filterSubmenu(item.submenu), 'min-w-[900px]') :
                     item.id === 'import'      ? renderCategoryMegaMenu(filterSubmenu(item.submenu), 'min-w-[800px]') :
                     item.id === 'process'     ? renderSimpleSubmenu(filterSubmenu(item.submenu), item.id) :
                     filterSubmenu(item.submenu).map((sub, i) => renderSubmenuItem(sub, i, item.id))}
                  </div>
                );
              })}
            </div>
          )}

          {/* User menu */}
          <div className="flex items-center space-x-3">
            <div
              className="hidden md:flex items-center space-x-2 px-3 py-2 bg-green-700 hover:bg-green-800 rounded-lg relative cursor-pointer transition-colors duration-150"
              onMouseEnter={() => { fetchSystemInfo(); setShowVersionTooltip(true); }}
              onMouseLeave={() => setShowVersionTooltip(false)}
              onClick={() => goTo('/security/change-password')}
            >
              <User className="w-4 h-4 text-slate-200" />
              <span className="text-slate-200 text-sm">{getLoggedInUsername()}</span>
              <span className="text-green-300 text-xs">🔑</span>

              {showVersionTooltip && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-lg whitespace-nowrap z-50 animate-fadeIn min-w-[180px]">
                  {loadingInfo ? (
                    <div className="text-sm text-green-200">Loading...</div>
                  ) : systemInfo ? (
                    <button
                      type="button"
                      onClick={handleCopyBuildInfo}
                      onMouseDown={e => e.preventDefault()}
                      title="Click to copy build info"
                      className="w-full text-left focus:outline-none group"
                    >
                      <div className="text-sm font-semibold tracking-wide group-hover:text-green-100 transition-colors">
                        {systemInfo.appVersion} {systemInfo.buildDate}
                      </div>
                      <div className="text-xs text-green-200 mt-0.5">
                        SQL {systemInfo.sqlVersion}
                      </div>
                    </button>
                  ) : (
                    <div className="text-sm text-green-200">Unable to load</div>
                  )}
                  <div className="mt-2 pt-2 border-t border-green-500 text-xs text-green-200 text-center">
                    Click to change password
                  </div>
                  <div className={`mt-2 text-center text-xs transition-all duration-300 ${
                    navToast ? 'text-green-300 opacity-100' : 'opacity-0 h-0 mt-0 overflow-hidden'
                  }`}>
                    ✓ Build info copied
                  </div>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-green-600 rotate-45" />
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 text-slate-200 hover:text-white hover:bg-slate-600 rounded-lg transition-all duration-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden pb-3 space-y-1 max-h-[calc(100vh-10rem)] overflow-y-auto mobile-menu-scroll">
            {menuItems.map((item) => {
              const visibleSubmenu = item.submenu ? filterSubmenu(item.submenu) : undefined;
              if (item.submenu && visibleSubmenu!.length === 0) return null;
              return (
                <div key={item.id}>
                  <button
                    onClick={() => handleMobileMenuClick(item)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 ${
                      mobileExpandedMainMenu === item.id || isMenuItemActive(item)
                        ? 'bg-slate-700 text-white font-semibold'
                        : 'text-slate-200 hover:bg-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {item.submenu && <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileExpandedMainMenu === item.id ? 'rotate-180' : ''}`} />}
                  </button>
                  {item.submenu && mobileExpandedMainMenu === item.id && (
                    <div className="mt-1 space-y-0.5 bg-green-700 rounded-lg p-2">
                      {filterSubmenu(item.submenu).map((subItem, index) =>
                        renderMobileSubmenuItem(subItem, index, `mobile-${item.id}`)
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown  { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideDown  { animation: slideDown  0.2s ease-out; }
        @keyframes slideRight { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        .animate-slideRight { animation: slideRight 0.2s ease-out; }
        @keyframes fadeIn     { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn     { animation: fadeIn     0.2s ease-out; }
        .nav-scroll::-webkit-scrollbar        { height: 6px; }
        .nav-scroll::-webkit-scrollbar-track  { background: rgba(255,255,255,0.1); border-radius: 3px; }
        .nav-scroll::-webkit-scrollbar-thumb  { background: rgba(255,255,255,0.3); border-radius: 3px; }
        .nav-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.5); }
        .mobile-menu-scroll::-webkit-scrollbar       { width: 4px; }
        .mobile-menu-scroll::-webkit-scrollbar-track { background: transparent; }
        .mobile-menu-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }
      `}</style>
    </nav>
  );
}