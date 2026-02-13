import { useState, useEffect, useRef } from 'react';
import apiClient from '../services/apiClient';
import Swal from 'sweetalert2';

import { 
  Home, 
  FileText, 
  Settings, 
  Play, 
  BarChart3, 
  Download, 
  Upload, 
  Wrench, 
  Shield, 
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Clock,
  LogOut,
  User,
  X,
  Menu
} from 'lucide-react';
import lifeBankLogo from '../assets/Lifebank.png';
import { decryptData } from '../services/encryptionService';

interface NavigationProps {
  onLogout: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  submenu?: SubMenuItem[];
}

interface SubMenuItem {
  label: string;
  formName?: string;
  action?: string;
  separator?: boolean;
  isCategory?: boolean;
  indent?: number;
  children?: SubMenuItem[];
  hasSubmenu?: boolean;
}

export function Navigation({ onLogout, activeSection, setActiveSection }: NavigationProps) {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [hoveredSubmenu, setHoveredSubmenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVersionTooltip, setShowVersionTooltip] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Permissions
const [permissions, setPermissions] = useState<Record<string, boolean>>({});
const hasPermission = (accessType: string) => permissions[accessType] === true;

  useEffect(() => {
    getBranchPermissions();
  }, []);
  
  const getBranchPermissions = () => {
    const rawPayload = localStorage.getItem("loginPayload");
    if (!rawPayload) return;
  
    try {
      const parsedPayload = JSON.parse(rawPayload);
      const encryptedArray: any[] = parsedPayload.permissions || [];
  
      const branchEntries = encryptedArray.filter(
        (p) => decryptData(p.formName) === "BranchSetup"
      );
  
      // Build a map: { Add: true, Edit: true, ... }
      const permMap: Record<string, boolean> = {};
      branchEntries.forEach((p) => {
        const accessType = decryptData(p.accessTypeName);
        if (accessType) permMap[accessType] = true;
      });
  
      setPermissions(permMap);
  
    } catch (e) {
      console.error("Error parsing or decrypting payload", e);
    }
  };
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Get login payload from localStorage
      const loginPayloadStr = localStorage.getItem('userData');
      const loginPayload = loginPayloadStr ? JSON.parse(loginPayloadStr) : {};
      const userId = loginPayload.userID || loginPayload.userId || loginPayload.id || 0;

      // Call logout API with userId
      await apiClient.post('UserLogin/logout', {
        userId: userId
      });

      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('loginTimestamp');
      localStorage.removeItem('loginPayload');
      localStorage.removeItem('userData');

      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Logout Successful',
        text: 'You have been logged out.',
        timer: 1500,
        showConfirmButton: false,
      });

      // Call onLogout to update app state
      onLogout();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Logout failed';
      await Swal.fire({
        icon: 'error',
        title: 'Logout Error',
        text: errorMsg,
      });
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home
    },
    {
      id: 'file-setup',
      label: 'File Setup',
      icon: FileText,
      submenu: [
        {
          label: 'System',
          isCategory: true,
          children: [
            { label: 'Company Information', formName:'', action: 'company-information' }
          ]
        },
        {
          label: 'Process',
          isCategory: true,
          children: [
            { 
              label: 'Allowance and Earnings',
              hasSubmenu: true,
              children: [
                { label: 'Allowance Bracket Code Setup', action: 'allowance-bracket-code-setup' },
                { label: 'Allowance Bracketing Setup', action: 'allowance-bracketing-setup' },
                { label: 'Allowance per Classification Setup', action: 'allowance-per-classification-setup' },
                { label: 'Classification Setup', action: 'classification-setup' },
                { label: 'Earning Setup', action: 'earning-setup' }
              ]
            },
            { label: 'Calendar Setup', action: 'calendar-setup' },
            { label: 'Day Type Setup', action: 'day-type-setup' },
            { 
              label: 'Device',
              hasSubmenu: true,
              children: [
                { label: 'AMS Database Configuration Setup', action: 'ams-database-configuration-setup' },
                { label: 'Borrowed Device Name', action: 'borrowed-device-name' },
                { label: 'Coordinates Setup', action: 'coordinates-setup' },
                { label: 'Device Type Setup', action: 'device-type-setup' },
                { label: 'DTR Flag Setup', action: 'dtr-flag-setup' },
                { label: 'DTR Log Fields Setup', action: 'dtr-log-fields-setup' },
                { label: 'SDK List Setup', action: 'sdk-list-setup' },
                { label: 'MYSQL Database Configuration Setup', action: 'mysql-database-configuration-setup' }
              ]
            },
            { label: 'Equivalent Hours Deduction Setup', action: 'equivalent-hours-deduction-setup' },
            { label: 'Group Schedule Setup', action: 'group-schedule-setup' },
            { label: 'Help Setup', action: 'help-setup' },
            { label: 'Leave Type Setup', action: 'leave-type-setup' },
            { 
              label: 'Overtime',
              hasSubmenu: true,
              children: [
                { label: 'Additional OT Hours Per Week', action: 'additional-ot-hours-per-week' },
                { label: 'Holiday OT Rates Setup', action: 'holiday-ot-rates-setup' },
                { label: 'Overtime Setup', action: 'overtime-setup' },
                { label: 'Regular Overtime Setup', action: 'regular-overtime-setup' },
                { label: 'RestDay Overtime Setup', action: 'rest-day-overtime-setup' }
              ]
            },
            { label: 'Payroll Location Setup', action: 'payroll-location-setup' },
            { label: 'System Configuration Setup', action: 'system-configuration-setup' },
            { 
              label: 'Tardiness/Undertime/Accumulation Bracket',
              hasSubmenu: true,
              children: [
                { label: 'Bracket Code Setup', action: 'bracket-code-setup' },
                { label: 'Tardiness/ Undertime/ Accumulation Table Setup', action: 'tardiness-undertime-accumulation-table-setup' }
              ]
            },
            { label: 'Timekeep Group Setup', action: 'timekeep-group-setup' },
            { 
              label: 'Workshift and Restday',
              hasSubmenu: true,
              children: [
                { label: 'Daily Schedule Setup', action: 'daily-schedule-setup' },
                { label: 'Restday Setup', action: 'rest-day-setup' },
                { label: 'Workshift Setup', action: 'workshift-setup' }
              ]
            },
            { label: 'Unpaid Lunch Deduction Bracket Setup', action: 'unpaid-lunch-deduction-bracket-setup' }
          ]
        },
        {
          label: 'Employment',
          isCategory: true,
          children: [
            { label: 'Area Setup', action: 'area-setup' },
            { label: 'Branch Setup', action: 'branch-setup' },
            { label: 'Department Setup', action: 'department-setup' },
            { label: 'Division Setup', action: 'division-setup' },
            { label: 'Employee Designation Setup', action: 'employee-designation-setup' },
            { label: 'Employee Status Setup', action: 'employee-status-setup' },
            { label: 'Group Setup', action: 'group-setup' },
            { label: 'Job Level Setup', action: 'job-level-setup' },
            { label: 'Location Setup', action: 'location-setup' },
            { label: 'Pay House Setup', action: 'pay-house-setup' },
            { label: 'Online Approval Setup', action: 'online-approval-setup' },
            { label: 'Section Setup', action: 'section-setup' },
            { label: 'Unit Setup', action: 'unit-setup' }
          ]
        }
      ]
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      icon: Settings,
      submenu: [
        {
          label: 'Employee Management',
          isCategory: true,
          children: [
            { label: 'Employee Master File', action: 'employee-master-file' },
            { label: 'Employee Timekeep Configuration', action: 'employee-timekeep-configuration' },
            { separator: true },
            { label: 'Rawdata', action: 'raw-data' },
            { label: 'Rawdata Ot Gap', action: 'rawdata-ot-gap' },
            { label: 'Rawdata On Straight Duty', action: 'rawdata-on-straight-duty' },
            { separator: true },
            { label: 'Processed Data', action: 'processed-data' }
          ]
        },
        {
          label: '2 Shifts In A Day',
          isCategory: true,
          children: [
            { label: '2 Shifts In A Day - Employee Timekeep Configuration', action: '2-shifts-employee-timekeep-config' },
            { label: '2 Shifts In A Day - Rawdata', action: '2-shifts-rawdata' }
          ]
        }
      ]
    },
    {
      id: 'process',
      label: 'Process',
      icon: Play,
      submenu: [
        { label: 'Process Data', action: 'process-data' },
        { label: 'Process 2 Shifts In A Day Payroll', action: 'process-2-shifts-payroll' }
      ]
    },
    {
      id: 'utilities',
      label: 'Utilities',
      icon: Wrench,
      submenu: [
        {
          isCategory: true,
          label: 'Utility On Employee Configuration',
          children: [
            { label: 'Update Status', action: 'update-status' },
            { label: 'Update Employee Overtime Application', action: 'update-employee-overtime-application' },
            { label: 'Update Employee Workshift', action: 'update-employee-workshift' },
            { label: 'Update Employee Leave Application', action: 'update-employee-leave-application' },
            { label: 'Update Employee Pay House', action: 'update-employee-pay-house' },
            { label: 'Update Batch Restday', action: 'update-batch-rest-day' },
            { label: 'Update Employee Classification', action: 'update-employee-classification' },
            { label: 'Delete Employee Transactions', action: 'delete-employee-transactions' },
            { label: 'Update Rawdata Online', action: 'update-rawdata-online' }
          ]
        },
        {
          isCategory: true,
          label: 'Utility On Rawdata',
          children: [
            { label: 'Update Daytype In Rawdata', action: 'update-daytype-rawdata' },
            { label: 'Update Workshift In Rawdata', action: 'update-workshift-rawdata' },
            { label: 'Delete Incomplete Logs', action: 'delete-incomplete-logs' },
            { label: 'Delete Rawdata', action: 'delete-rawdata' }
          ]
        },
        {
          isCategory: true,
          label: 'Utility On Processed Data',
          children: [
            { label: 'Unpost Transaction', action: 'unpost-transaction' },
            { label: 'Additional Hours Per Week', action: 'additional-hours-per-week' },
            { label: 'Apply Ot Allowance', action: 'apply-ot-allowances' },
            { label: 'Apply Break1 And Break3 Overbreak', action: 'apply-break-overbreak' },
            { label: 'Update Allowance Per Bracket', action: 'update-allowance-per-bracket' },
            { label: 'Update SSS Notification', action: 'update-sss-notification' },
            { label: 'Update No. Of Hours Per Week', action: 'update-hours-per-week' },
            { label: 'Update Tardiness Penalty', action: 'update-tardiness-penalty' },
            { label: 'Deduct Tardiness To Overtime Of The Day', action: 'deduct-tardiness-to-overtime' },
            { label: 'Delete Ot During Restday If Absent Or Incomplete In Previous Day', action: 'delete-ot-restday-absent' },
            { label: 'Process Overtime Per Cut-Off', action: 'process-overtime-cutoff' },
            { label: 'Update Assumed Days', action: 'update-assumed-days' },
            { label: 'Process Overtime 24 Hours Rule', action: 'process-overtime-24hours' },
            { label: 'Deduct Absences In Excess Of Total Hours With Pay If With Filed Leave', action: 'deduct-absences-excess' },
            { label: 'Post Processed Timekeeping Transactions', action: 'post-processed-timekeeping' },
            { label: 'Utility To Update The Time Flag Based On Set Policy Of Breaks', action: 'update-time-flag-breaks' },
            { label: 'Unpaid Lunch Deduction', action: 'unpaid-lunch-deduction' },
            { label: 'Update Flexi Break', action: 'update-flexi-break' },
            { label: 'Update GL Code Utility', action: 'update-gl-code-utility' }
          ]
        }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      submenu: [
        { label: 'Daily Time Record Monitoring', action: 'daily-time-record-monitoring' }
      ]
    },
    {
      id: 'import',
      label: 'Import',
      icon: Upload,
      submenu: [
        {
          label: '1 shift in a Day',
          isCategory: true,
          children: [
            { label: 'Import Workshift Variable', action: 'import-workshift-variable' },
            { label: 'Import Leave Application', action: 'import-leave-application' },
            { label: 'Import Overtime Application', action: 'import-overtime-application' },
            { label: 'Import Device Code', action: 'import-device-code' },
            { label: 'Import Employee Masterfile', action: 'import-employee-masterfile' },
            { label: 'Import Logs From Device V2', action: 'import-logs-from-device-v2' },
            { label: 'Update Rawdata', action: 'update-rawdata-import' },
            { label: 'Import Adjustment', action: 'import-adjustment' }
          ]
        },
        {
          label: '2 Shift in a Day',
          isCategory: true,
          children: [
            { label: 'Import Overtime Application', action: 'overtime-application-2-shifts' },
            { label: 'Import Workshift Variable', action: 'workshift-variable-2-shifts' },
            { label: 'Import Logs From Device V2', action: 'logs-from-device-2-shifts' }
          ]
        }
      ]
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      submenu: [
        { label: 'Payroll Data', action: 'export-payroll-data' },
        { label: 'Export NAV', action: 'export-nav' },
        { label: 'Payroll DTR Allowance', action: 'payroll-dtr-allowance' }
      ]
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      submenu: [
        { label: 'Security Manager', action: 'security-manager' },
        { label: 'Audit Trail', action: 'audit-trail' },
        { label: 'Email Configuration', action: 'email-configuration' },
        { label: 'Create New Database', action: 'create-new-database' }
      ]
    }
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExpandedMenu(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (itemId: string) => {
    const item = menuItems.find(m => m.id === itemId);
    if (item?.submenu) {
      setExpandedMenu(expandedMenu === itemId ? null : itemId);
    } else {
      setActiveSection(itemId);
      setExpandedMenu(null);
    }
  };

  const handleSubmenuClick = (action: string) => {
    setActiveSection(action);
    setExpandedMenu(null);
  };

  // Helper function to check if a menu item contains the active section
  const isMenuItemActive = (item: MenuItem): boolean => {
    if (item.id === activeSection) return true;
    if (!item.submenu) return false;
    
    const checkSubmenuActive = (submenuItems: SubMenuItem[]): boolean => {
      return submenuItems.some(subItem => {
        if (subItem.action === activeSection) return true;
        if (subItem.children) return checkSubmenuActive(subItem.children);
        return false;
      });
    };
    
    return checkSubmenuActive(item.submenu);
  };

  // Helper functions for delayed menu closing
  const handleFlyoutEnter = (menuKey: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setExpandedMenu(menuKey);
  };

  const handleFlyoutLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setExpandedMenu(null);
    }, 200);
  };

  const handleDirectItemHover = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setExpandedMenu(null);
  };

  // Render mega-menu for File Setup (multi-column layout)
  const renderFileSetupMegaMenu = (submenu: SubMenuItem[]) => {
    const categories = submenu.filter(item => item.isCategory);
    
    return (
      <div className="flex gap-8 p-6 min-w-[900px]">
        {categories.map((category, catIndex) => (
          <div key={catIndex} className="flex-1 min-w-0">
            {/* Category Header */}
            <h3 className="text-cyan-600 font-semibold text-base mb-3 pb-2 border-b border-green-300">
              {category.label}
            </h3>
            
            {/* Category Items */}
            <div className="space-y-0.5">
              {category.children?.map((child, childIndex) => {
                if (child.hasSubmenu && child.children) {
                  // Item with submenu (like Allowance and Earnings)
                  return (
                    <div key={childIndex} className="relative group">
                      <div 
                        className="w-full text-left px-2 py-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-150 text-sm rounded flex items-center justify-between cursor-pointer"
                        onMouseEnter={() => setHoveredSubmenu(`file-setup-${catIndex}-${childIndex}`)}
                        onMouseLeave={() => setHoveredSubmenu(null)}
                      >
                        <span>{child.label}</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                      
                      {/* Flyout submenu */}
                      {hoveredSubmenu === `file-setup-${catIndex}-${childIndex}` && (
                        <div 
                          className="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-72 z-50 animate-slideRight"
                          onMouseEnter={() => setHoveredSubmenu(`file-setup-${catIndex}-${childIndex}`)}
                          onMouseLeave={() => setHoveredSubmenu(null)}
                        >
                          {child.children.map((subChild, subChildIndex) => (
                            <button
                              key={subChildIndex}
                              onClick={() => handleSubmenuClick(subChild.action || '')}
                              className={`w-full text-left px-4 py-2 transition-colors duration-150 text-sm ${
                                activeSection === subChild.action
                                  ? 'bg-blue-100 text-blue-700 font-medium'
                                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                              }`}
                            >
                              {subChild.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                } else if (child.children) {
                  // Subcategory with children (legacy structure)
                  return (
                    <div key={childIndex} className="mb-2">
                      <div className="text-gray-800 font-medium text-sm mb-1 px-2">
                        {child.label}
                      </div>
                      <div className="space-y-0.5 pl-2">
                        {child.children.map((subChild, subChildIndex) => (
                          <button
                            key={subChildIndex}
                            onClick={() => handleSubmenuClick(subChild.action || '')}
                            className={`w-full text-left px-2 py-1 transition-colors duration-150 text-sm rounded ${
                              activeSection === subChild.action
                                ? 'bg-blue-100 text-blue-700 font-medium'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            {subChild.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                } else {
                  // Direct action item
                  return (
                    <button
                      key={childIndex}
                      onClick={() => handleSubmenuClick(child.action || '')}
                      className={`w-full text-left px-2 py-1 transition-colors duration-150 text-sm rounded ${
                        activeSection === child.action
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {child.label}
                    </button>
                  );
                }
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render mega-menu for Maintenance (multi-column layout)
  const renderMaintenanceMegaMenu = (submenu: SubMenuItem[]) => {
    const categories = submenu.filter(item => item.isCategory);
    
    return (
      <div className="flex gap-8 p-6 min-w-[800px]">
        {categories.map((category, catIndex) => (
          <div key={catIndex} className="flex-1 min-w-0">
            {/* Category Header */}
            <h3 className="text-cyan-600 font-semibold text-base mb-3 pb-2 border-b border-gray-300">
              {category.label}
            </h3>
            
            {/* Category Items */}
            <div className="space-y-0.5">
              {category.children?.map((child, childIndex) => {
                if (child.separator) {
                  return <div key={childIndex} className="my-2 border-t border-gray-300"></div>;
                }
                return (
                  <button
                    key={childIndex}
                    onClick={() => handleSubmenuClick(child.action || '')}
                    className={`w-full text-left px-2 py-1 transition-colors duration-150 text-sm rounded ${
                      activeSection === child.action
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {child.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render mega-menu for Process (multi-column layout)
  const renderProcessMegaMenu = (submenu: SubMenuItem[]) => {
    // Use standard submenu rendering for responsive dropdown
    return (
      <div className="py-2">
        {submenu.map((item, index) => renderSubmenuItem(item, index, 'process'))}
      </div>
    );
  };

  // Render mega-menu for Utilities (multi-column layout)
  const renderUtilitiesMegaMenu = (submenu: SubMenuItem[]) => {
    const categories = submenu.filter(item => item.isCategory);
    
    return (
      <div className="flex gap-8 p-6 min-w-[900px]">
        {categories.map((category, catIndex) => (
          <div key={catIndex} className="flex-1 min-w-0">
            {/* Category Header */}
            <h3 className="text-cyan-600 font-semibold text-base mb-3 pb-2 border-b border-gray-300">
              {category.label}
            </h3>
            
            {/* Category Items */}
            <div className="space-y-0.5">
              {category.children?.map((child, childIndex) => {
                if (child.separator) {
                  return <div key={childIndex} className="my-2 border-t border-gray-300"></div>;
                }
                return (
                  <button
                    key={childIndex}
                    onClick={() => handleSubmenuClick(child.action || '')}
                    className={`w-full text-left px-2 py-1 transition-colors duration-150 text-sm rounded ${
                      activeSection === child.action
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {child.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render mega-menu for Import (multi-column layout)
  const renderImportMegaMenu = (submenu: SubMenuItem[]) => {
    const categories = submenu.filter(item => item.isCategory);
    
    return (
        <div className="flex gap-8 p-6 min-w-[800px]">
            {categories.map((category, catIndex) => (
                <div key={catIndex} className="flex-1 min-w-0">
                    {/* Category Header */}
                    <h3 className="text-cyan-600 font-semibold text-base mb-3 pb-2 border-b border-gray-300">
                        {category.label}
                    </h3>

                    {/* Category Items */}
                    <div className="space-y-0.5">
                        {category.children?.map((child, childIndex) => {
                            if (child.separator) {
                                return <div key={childIndex} className="my-2 border-t border-gray-300"></div>;
                            }
                            return (
                                <button
                                    key={childIndex}
                                    onClick={() => handleSubmenuClick(child.action || '')}
                                    className={`w-full text-left px-2 py-1 transition-colors duration-150 text-sm rounded ${activeSection === child.action
                                            ? 'bg-blue-100 text-blue-700 font-medium'
                                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                        }`}
                                >
                                    {child.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
  };

  // Render submenu items (used for Import, Export, Security, Reports, etc.)
  const renderSubmenuItem = (subItem: SubMenuItem, index: number, parentKey: string = 'submenu') => {
    const itemKey = `${parentKey}-${index}`;
    
    if (subItem.separator) {
      return <div key={itemKey} className="my-1 border-t border-gray-200"></div>;
    }
    
    if (subItem.isCategory && subItem.children) {
      return (
        <div key={itemKey} className="relative group">
          <div
            className="px-4 py-2 text-gray-900 font-semibold text-sm flex items-center justify-between hover:bg-gray-50 cursor-default"
            onMouseEnter={() => {
              if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
                closeTimeoutRef.current = null;
              }
              setExpandedMenu(itemKey);
            }}
            onMouseLeave={() => {
              closeTimeoutRef.current = window.setTimeout(() => {
                setExpandedMenu(null);
              }, 200);
            }}
          >
            {subItem.label}
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
          
          {/* Flyout Menu */}
          {expandedMenu === itemKey && (
            <div 
              className="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-80 max-h-[70vh] overflow-y-auto animate-slideRight z-50"
              onMouseEnter={() => {
                if (closeTimeoutRef.current) {
                  clearTimeout(closeTimeoutRef.current);
                  closeTimeoutRef.current = null;
                }
                setExpandedMenu(itemKey);
              }}
              onMouseLeave={() => {
                closeTimeoutRef.current = window.setTimeout(() => {
                  setExpandedMenu(null);
                }, 200);
              }}
            >
              {subItem.children.map((child, childIndex) => renderSubmenuItem(child, childIndex, itemKey))}
            </div>
          )}
        </div>
      );
    }
    
    if (subItem.children) {
      return (
        <div key={itemKey} className="relative group">
          <div
            className="px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 text-sm flex items-center justify-between cursor-pointer"
            onMouseEnter={() => {
              if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
                closeTimeoutRef.current = null;
              }
              setExpandedMenu(itemKey);
            }}
            onMouseLeave={() => {
              closeTimeoutRef.current = window.setTimeout(() => {
                setExpandedMenu(null);
              }, 200);
            }}
          >
            {subItem.label}
            <ChevronRight className="w-4 h-4" />
          </div>
          
          {/* Flyout Menu */}
          {expandedMenu === itemKey && (
            <div 
              className="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-80 max-h-[70vh] overflow-y-auto animate-slideRight z-50"
              onMouseEnter={() => {
                if (closeTimeoutRef.current) {
                  clearTimeout(closeTimeoutRef.current);
                  closeTimeoutRef.current = null;
                }
                setExpandedMenu(itemKey);
              }}
              onMouseLeave={() => {
                closeTimeoutRef.current = window.setTimeout(() => {
                  setExpandedMenu(null);
                }, 200);
              }}
            >
              {subItem.children.map((child, childIndex) => renderSubmenuItem(child, childIndex, itemKey))}
            </div>
          )}
        </div>
      );
    }
    
    // Regular menu item with action
    if (subItem.action) {
      return (
        <button
          key={itemKey}
          onClick={() => handleSubmenuClick(subItem.action || '')}
          className={`w-full text-left px-4 py-2 transition-colors duration-150 text-sm ${
            activeSection === subItem.action
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
          }`}
        >
          {subItem.label}
        </button>
      );
    }
    
    // Fallback for items without action (shouldn't happen but just in case)
    return null;
  };

  return (
    <>
      {/* LifeBank Foundation Header */}
      <div className="bg-white border-b border-cyan-200 shadow-sm">
        <div className="px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={lifeBankLogo} 
                alt="LifeBank Foundation" 
                className="h-10 object-contain"
              />
            </div>
            <div className="hidden md:block">
              <p className="text-orange-500 italic" style={{ fontSize: '1.1rem' }}>
                we <span className="font-semibold">excel</span>, we <span className="font-semibold">care</span>, we <span className="font-semibold">share</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <nav className="bg-green-600 border-b border-green-600 sticky top-0 z-50 shadow-lg">
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-md">
                <Clock className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-white text-lg">128 Timekeeping</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div ref={dropdownRef} className="hidden lg:flex items-center space-x-1">
              {menuItems.map((item) => (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => handleMenuClick(item.id)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isMenuItemActive(item)
                        ? 'bg-amber-100 text-gray text-bold'
                        : 'text-slate-200 hover:bg--amber-100 hover:text-white text-bold'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                    {item.submenu && (
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform duration-200 ${
                          expandedMenu === item.id ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {item.submenu && expandedMenu === item.id && (
                    <div className={`absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 animate-slideDown ${
                      item.id === 'file-setup' || item.id === 'maintenance' || item.id === 'utilities' || item.id === 'import' ? '' : item.id === 'process' ? 'py-2' : 'py-2 w-56'
                    } ${
                      item.id === 'process' ? 'w-80' : ''
                              }`}>
                              {item.id === 'file-setup' ? renderFileSetupMegaMenu(item.submenu) : item.id === 'maintenance' ? renderMaintenanceMegaMenu(item.submenu) : item.id === 'process' ? renderProcessMegaMenu(item.submenu) : item.id === 'utilities' ? renderUtilitiesMegaMenu(item.submenu) : item.id === 'import' ? renderImportMegaMenu(item.submenu) : item.submenu.map((subItem, index) => renderSubmenuItem(subItem, index))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div 
                className="hidden md:flex items-center space-x-2 px-3 py-2 bg-slate-600 rounded-lg relative cursor-pointer"
                onMouseEnter={() => setShowVersionTooltip(true)}
                onMouseLeave={() => setShowVersionTooltip(false)}
              >
                <User className="w-4 h-4 text-slate-200" />
                <span className="text-slate-200 text-sm">Admin</span>
                
                {/* Version Tooltip */}
                {showVersionTooltip && (
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded shadow-lg whitespace-nowrap z-50 animate-fadeIn">
                    <div className="text-sm">v910.000 20251201</div>
                    {/* Arrow pointer */}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rotate-45"></div>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 text-slate-200 hover:text-white hover:bg-slate-600 rounded-lg transition-all duration-200"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden pb-3 space-y-1">
            {menuItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-slate-600 text-white'
                      : 'text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {item.submenu && (
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        expandedMenu === item.id ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>
                
                {item.submenu && expandedMenu === item.id && (
                  <div className="ml-6 mt-1 space-y-1 max-h-[60vh] overflow-y-auto">
                    {item.submenu.map((subItem, index) => renderSubmenuItem(subItem, index))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slideDown {
            animation: slideDown 0.2s ease-out;
          }

          @keyframes slideRight {
            from {
              opacity: 0;
              transform: translateX(-10px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          .animate-slideRight {
            animation: slideRight 0.2s ease-out;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
          }
        `}</style>
      </nav>
    </>
  );
}