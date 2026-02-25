import { useState } from 'react';
import { Shield, Check, UserPlus, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft, Search, ChevronUp, ChevronDown, Users, Settings, Plus, Trash2, Save, X } from 'lucide-react';
import { Footer } from './Footer/Footer';

interface User {
  id: number;
  username: string;
  expiration: string;
  logIn: boolean;
  machineName: string;
  suspended: boolean;
  isWindowsAuth: boolean;
  windowsLoginName: string;
}

interface UserGroup {
  id: number;
  groupName: string;
  description: string;
}

interface FormAccess {
  id: number;
  formName: string;
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  print: boolean;
  importLogs: boolean;
  enableEditPosted: boolean;
}

interface TKSGroup {
  id: number;
  name: string;
  description: string;
}

interface TKSGroupAccess {
  id: number;
  tksGroupName: string;
  description: string;
  userGroup: string;
}

export function SecurityManagerPage() {
  const [activeTab, setActiveTab] = useState<'security-manager' | 'group-member' | 'security-control'>('security-manager');
  const [selectedUserGroup, setSelectedUserGroup] = useState('Administrator');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [securityControlTab, setSecurityControlTab] = useState<'access-type' | 'tks-group'>('access-type');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTKSGroups, setSelectedTKSGroups] = useState<number[]>([]);
  const [selectedTKSGroupAccess, setSelectedTKSGroupAccess] = useState<number[]>([]);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editedRowData, setEditedRowData] = useState<FormAccess | null>(null);
  const itemsPerPage = 25;

  // Mock data
  const users: User[] = [
    { id: 1, username: '123', expiration: '10/31/2024', logIn: false, machineName: '128PC-80', suspended: false, isWindowsAuth: false, windowsLoginName: '' },
    { id: 2, username: '128Dennis', expiration: '7/4/2029', logIn: false, machineName: '128PC-80', suspended: false, isWindowsAuth: false, windowsLoginName: '' },
    { id: 3, username: '128Lhet', expiration: '10/1/2042', logIn: false, machineName: '128PC-80', suspended: false, isWindowsAuth: false, windowsLoginName: '' },
    { id: 4, username: '128Manalo', expiration: '11/1/2030', logIn: false, machineName: '128PC-80', suspended: false, isWindowsAuth: false, windowsLoginName: '' },
    { id: 5, username: '128Villano', expiration: '11/1/2041', logIn: false, machineName: '128PC-80', suspended: false, isWindowsAuth: false, windowsLoginName: '' }
  ];

  const userGroups: UserGroup[] = [
    { id: 1, groupName: 'ADMIN', description: 'administrator' },
    { id: 2, groupName: 'TIMEKEEP', description: 'Timekeeper' },
    { id: 3, groupName: 'TIMEKEEP2', description: 'Timekeeper 2' },
    { id: 4, groupName: 'TIMEKEEP3', description: 'Timekeeper3' }
  ];

  const groupMembers = ['123', '128Manalo'];
  const availableUsers = ['128TCI', '128Villano'];

  const forms = [
    'AdditionalOTHoursPerWeek',
    'AdditionalOTHoursPerWeekUtility',
    'AddShortBreakOverBreakUtl',
    'AllowancePerClassificationSetUp',
    'Allowance',
    'Allowance Bracket Code',
    'AMS Database Configuration SetUp',
    'Apply OT Allowances',
    'Area SetUp',
    'Audit Trail',
    'Borrowed Device Name SetUp'
  ];

  const accessTypes = [
    'Add New Record',
    'Delete Record',
    'Edit Record',
    'Enable Editing Posted Record',
    'Import Logs',
    'Print Record',
    'View Form'
  ];

  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [selectedAccessTypes, setSelectedAccessTypes] = useState<string[]>([]);

  const [formAccessData, setFormAccessData] = useState<FormAccess[]>([
    { id: 1, formName: 'AdditionalOTHoursPerWeek', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false },
    { id: 2, formName: 'AdditionalOTHoursPerWeekUtility', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false },
    { id: 3, formName: 'AllowancePerClassificationSetUp', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false },
    { id: 4, formName: 'Audit Trail', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false },
    { id: 5, formName: 'Bracket Code Setup', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false },
    { id: 6, formName: 'BranchSetup', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false },
    { id: 7, formName: 'CalendarSetUp', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false },
    { id: 8, formName: 'ClassificationSetUp', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false },
    { id: 9, formName: 'CompanyInformationSetUp', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false },
    { id: 10, formName: 'Create New Database', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false },
    { id: 11, formName: 'DailyScheduleSetUp', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false },
    { id: 12, formName: 'DayTypeSetUp', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false },
    { id: 13, formName: 'DeductionSetUp', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false },
    { id: 14, formName: 'Delete Incomplete Logs', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false },
    { id: 15, formName: 'Delete Records in Raw Data', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false },
    { id: 16, formName: 'DepartmentSetUp', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false },
    { id: 17, formName: 'DivisionSetUp', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false },
    { id: 18, formName: 'EarningSetUp', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false },
    { id: 19, formName: 'Employee Category Setup', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false },
    { id: 20, formName: 'EmployeeDesignationSetup', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false },
    { id: 21, formName: 'EmployeeLogsSetUp', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false },
    { id: 22, formName: 'EmployeeStatusSetUp', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false },
    { id: 23, formName: 'EmpMasterFile', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false },
    { id: 24, formName: 'EmpTKConfigMaint', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false },
    { id: 25, formName: 'EquivHoursDeduction', view: true, add: true, edit: true, delete: true, print: true, importLogs: true, enableEditPosted: false }
  ]);

  const tksGroups: TKSGroup[] = [
    { id: 1, name: 'TK3', description: 'TK3' }
  ];

  const tksGroupAccess: TKSGroupAccess[] = [
    { id: 1, tksGroupName: '1', description: 'Batangas1 Balagtas Monthly Payroll', userGroup: 'ADMIN' },
    { id: 10, tksGroupName: '10', description: 'Batangas Monthly Cash Payroll with Paycard', userGroup: 'ADMIN' },
    { id: 100, tksGroupName: '100', description: '-', userGroup: 'ADMIN' },
    { id: 101, tksGroupName: '101', description: 'Main Batangas Daily', userGroup: 'ADMIN' },
    { id: 102, tksGroupName: '102', description: 'Main Batangas Daily with Paycard', userGroup: 'ADMIN' },
    { id: 103, tksGroupName: '103', description: 'Main Batangas Monthly', userGroup: 'ADMIN' },
    { id: 104, tksGroupName: '104', description: 'Main Batangas Monthly with', userGroup: 'ADMIN' }
  ];

  const totalPages = Math.ceil(formAccessData.length / itemsPerPage);
  const paginatedFormAccess = formAccessData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded border text-xs ${
            currentPage === i
              ? 'border-blue-500 bg-blue-500 text-white'
              : 'border-gray-300 bg-white hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  const handleMoveRight = () => {
    if (selectedUsers.length > 0) {
      // Logic to move selected users to group members
      console.log('Moving users to group:', selectedUsers);
    }
  };

  const handleMoveLeft = () => {
    if (selectedGroupMembers.length > 0) {
      // Logic to move selected group members to users
      console.log('Removing users from group:', selectedGroupMembers);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">
              {activeTab === 'security-manager' && 'User SetUp'}
              {activeTab === 'group-member' && 'Group Member SetUp'}
              {activeTab === 'security-control' && 'Security Control'}
            </h1>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
            {/* Information Frame */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    Configure user accounts, manage user groups, and set up security permissions for forms and features. Control access levels and authentication methods for system security.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Create and manage user accounts</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Configure user group memberships</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Set form-level access permissions</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Windows authentication support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('security-manager')}
                className={`px-4 py-2.5 text-sm transition-all flex items-center gap-2 rounded-t-lg ${
                  activeTab === 'security-manager'
                    ? 'font-medium bg-blue-600 text-white -mb-px'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
              >
                <Shield className="w-4 h-4" />
                Security Manager
              </button>
              <button
                onClick={() => setActiveTab('group-member')}
                className={`px-4 py-2.5 text-sm transition-all flex items-center gap-2 rounded-t-lg ${
                  activeTab === 'group-member'
                    ? 'font-medium bg-blue-600 text-white -mb-px'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
              >
                <Users className="w-4 h-4" />
                Group Member SetUp
              </button>
              <button
                onClick={() => setActiveTab('security-control')}
                className={`px-4 py-2.5 text-sm transition-all flex items-center gap-2 rounded-t-lg ${
                  activeTab === 'security-control'
                    ? 'font-medium bg-blue-600 text-white -mb-px'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
              >
                <Settings className="w-4 h-4" />
                Security Control
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'security-manager' && (
              <div className="space-y-6">
                {/* Users Section */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900">Users</h3>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Add
                    </button>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs text-gray-600">Username</th>
                            <th className="px-4 py-3 text-left text-xs text-gray-600">Expiration</th>
                            <th className="px-4 py-3 text-left text-xs text-gray-600">Log In</th>
                            <th className="px-4 py-3 text-left text-xs text-gray-600">Machine Name</th>
                            <th className="px-4 py-3 text-left text-xs text-gray-600">Suspended</th>
                            <th className="px-4 py-3 text-left text-xs text-gray-600">IsWindowsAuthenticate</th>
                            <th className="px-4 py-3 text-left text-xs text-gray-600">WindowsLoginName</th>
                            <th className="px-4 py-3 text-left text-xs text-gray-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{user.username}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{user.expiration}</td>
                              <td className="px-4 py-3">
                                <input type="checkbox" checked={user.logIn} readOnly className="w-4 h-4" />
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{user.machineName}</td>
                              <td className="px-4 py-3">
                                <input type="checkbox" checked={user.suspended} readOnly className="w-4 h-4" />
                              </td>
                              <td className="px-4 py-3">
                                <input type="checkbox" checked={user.isWindowsAuth} readOnly className="w-4 h-4" />
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{user.windowsLoginName}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button className="px-3 py-1 text-xs text-blue-600 hover:text-blue-700 border border-blue-600 rounded hover:bg-blue-50">
                                    Change Password
                                  </button>
                                  <button className="px-3 py-1 text-xs text-gray-600 hover:text-gray-700 border border-gray-600 rounded hover:bg-gray-50">
                                    Reset
                                  </button>
                                  <button className="px-3 py-1 text-xs text-red-600 hover:text-red-700 border border-red-600 rounded hover:bg-red-50">
                                    Remove
                                  </button>
                                  <button className="px-3 py-1 text-xs text-green-600 hover:text-green-700 border border-green-600 rounded hover:bg-green-50">
                                    Edit
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
                      <button className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs">
                        Previous
                      </button>
                      <button className="px-3 py-1 rounded border border-blue-500 bg-blue-500 text-white text-xs">
                        1
                      </button>
                      <button className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs">
                        Next
                      </button>
                    </div>
                  </div>
                </div>

                {/* User Group Section */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900">User Group</h3>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Add
                    </button>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs text-gray-600">GroupName</th>
                            <th className="px-4 py-3 text-left text-xs text-gray-600">Description</th>
                            <th className="px-4 py-3 text-left text-xs text-gray-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {userGroups.map((group) => (
                            <tr key={group.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{group.groupName}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{group.description}</td>
                              <td className="px-4 py-3">
                                <button className="px-3 py-1 text-xs text-red-600 hover:text-red-700 border border-red-600 rounded hover:bg-red-50">
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
                      <button className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs">
                        Previous
                      </button>
                      <button className="px-3 py-1 rounded border border-blue-500 bg-blue-500 text-white text-xs">
                        1
                      </button>
                      <button className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs">
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'group-member' && (
              <div className="space-y-6">
                {/* User Group Selector */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <label className="block text-gray-700 mb-2">User Group</label>
                  <select
                    value={selectedUserGroup}
                    onChange={(e) => setSelectedUserGroup(e.target.value)}
                    className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option>Administrator</option>
                    <option>Timekeeper</option>
                    <option>Timekeeper 2</option>
                    <option>Timekeeper3</option>
                  </select>
                </div>

                {/* Group Members and Users */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Group Members */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                    <h3 className="text-gray-700 mb-3 text-sm">Group Members</h3>
                    <select
                      multiple
                      value={selectedGroupMembers}
                      onChange={(e) => setSelectedGroupMembers(Array.from(e.target.selectedOptions, option => option.value))}
                      className="w-full h-64 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {groupMembers.map((member) => (
                        <option key={member} value={member}>{member}</option>
                      ))}
                    </select>
                  </div>

                  {/* Transfer Buttons */}
                  <div className="flex flex-col items-center justify-center gap-3">
                    <button
                      onClick={handleMoveRight}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleMoveLeft}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition-colors"
                    >
                      <ChevronsRight className="w-5 h-5" />
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition-colors"
                    >
                      <ChevronsLeft className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Users */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                    <h3 className="text-gray-700 mb-3 text-sm">Users</h3>
                    <select
                      multiple
                      value={selectedUsers}
                      onChange={(e) => setSelectedUsers(Array.from(e.target.selectedOptions, option => option.value))}
                      className="w-full h-64 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {availableUsers.map((user) => (
                        <option key={user} value={user}>{user}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security-control' && (
              <div className="space-y-6">
                {/* Sub-tabs */}
                <div className="flex items-center gap-1 border-b border-gray-200">
                  <button
                    onClick={() => setSecurityControlTab('access-type')}
                    className={`px-4 py-2 text-sm transition-colors ${
                      securityControlTab === 'access-type'
                        ? 'bg-gray-100 text-gray-900 border border-gray-300 border-b-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Set Up AccessType
                  </button>
                  <button
                    onClick={() => setSecurityControlTab('tks-group')}
                    className={`px-4 py-2 text-sm transition-colors ${
                      securityControlTab === 'tks-group'
                        ? 'bg-gray-100 text-gray-900 border border-gray-300 border-b-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Set Up TKS Group
                  </button>
                </div>

                {/* User Group Selector */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <label className="block text-gray-700 mb-2">User Group</label>
                  <select
                    value={selectedUserGroup}
                    onChange={(e) => setSelectedUserGroup(e.target.value)}
                    className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option>Administrator</option>
                    <option>Timekeeper</option>
                    <option>Timekeeper 2</option>
                    <option>Timekeeper3</option>
                  </select>
                </div>

                {securityControlTab === 'access-type' ? (
                  <>
                    {/* Forms and Access Type */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Forms */}
                      <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                        <h3 className="text-gray-900 mb-3">Forms</h3>
                        <div className="bg-white border border-gray-200 rounded-lg p-3 h-96 overflow-y-auto">
                          <div className="space-y-2">
                            {forms.map((form, index) => (
                              <label key={index} className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedForms.includes(form)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedForms([...selectedForms, form]);
                                    } else {
                                      setSelectedForms(selectedForms.filter(f => f !== form));
                                    }
                                  }}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{form}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Access Type */}
                      <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                        <h3 className="text-gray-900 mb-3">Access Type</h3>
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="space-y-2">
                            {accessTypes.map((type, index) => (
                              <label key={index} className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedAccessTypes.includes(type)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedAccessTypes([...selectedAccessTypes, type]);
                                    } else {
                                      setSelectedAccessTypes(selectedAccessTypes.filter(t => t !== type));
                                    }
                                  }}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{type}</span>
                              </label>
                            ))}
                          </div>
                          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* User Group Access Table */}
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                      <h3 className="text-gray-900 mb-4">User Group Access</h3>
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs text-gray-600">Form Name</th>
                                <th className="px-4 py-3 text-center text-xs text-gray-600">View</th>
                                <th className="px-4 py-3 text-center text-xs text-gray-600">Add</th>
                                <th className="px-4 py-3 text-center text-xs text-gray-600">Edit</th>
                                <th className="px-4 py-3 text-center text-xs text-gray-600">Delete</th>
                                <th className="px-4 py-3 text-center text-xs text-gray-600">Print</th>
                                <th className="px-4 py-3 text-center text-xs text-gray-600">ImportLogs</th>
                                <th className="px-4 py-3 text-center text-xs text-gray-600">EnableEditPosted</th>
                                <th className="px-4 py-3 text-center text-xs text-gray-600">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {paginatedFormAccess.map((access) => {
                                const isEditing = editingRowId === access.id;
                                const currentData = isEditing && editedRowData ? editedRowData : access;
                                
                                return (
                                  <tr key={access.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-900">{access.formName}</td>
                                    <td className="px-4 py-3 text-center">
                                      <input 
                                        type="checkbox" 
                                        checked={currentData.view} 
                                        disabled={!isEditing}
                                        onChange={(e) => {
                                          if (isEditing && editedRowData) {
                                            setEditedRowData({ ...editedRowData, view: e.target.checked });
                                          }
                                        }}
                                        className="w-4 h-4 cursor-pointer" 
                                      />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <input 
                                        type="checkbox" 
                                        checked={currentData.add} 
                                        disabled={!isEditing}
                                        onChange={(e) => {
                                          if (isEditing && editedRowData) {
                                            setEditedRowData({ ...editedRowData, add: e.target.checked });
                                          }
                                        }}
                                        className="w-4 h-4 cursor-pointer" 
                                      />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <input 
                                        type="checkbox" 
                                        checked={currentData.edit} 
                                        disabled={!isEditing}
                                        onChange={(e) => {
                                          if (isEditing && editedRowData) {
                                            setEditedRowData({ ...editedRowData, edit: e.target.checked });
                                          }
                                        }}
                                        className="w-4 h-4 cursor-pointer" 
                                      />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <input 
                                        type="checkbox" 
                                        checked={currentData.delete} 
                                        disabled={!isEditing}
                                        onChange={(e) => {
                                          if (isEditing && editedRowData) {
                                            setEditedRowData({ ...editedRowData, delete: e.target.checked });
                                          }
                                        }}
                                        className="w-4 h-4 cursor-pointer" 
                                      />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <input 
                                        type="checkbox" 
                                        checked={currentData.print} 
                                        disabled={!isEditing}
                                        onChange={(e) => {
                                          if (isEditing && editedRowData) {
                                            setEditedRowData({ ...editedRowData, print: e.target.checked });
                                          }
                                        }}
                                        className="w-4 h-4 cursor-pointer" 
                                      />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <input 
                                        type="checkbox" 
                                        checked={currentData.importLogs} 
                                        disabled={!isEditing}
                                        onChange={(e) => {
                                          if (isEditing && editedRowData) {
                                            setEditedRowData({ ...editedRowData, importLogs: e.target.checked });
                                          }
                                        }}
                                        className="w-4 h-4 cursor-pointer" 
                                      />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <input 
                                        type="checkbox" 
                                        checked={currentData.enableEditPosted} 
                                        disabled={!isEditing}
                                        onChange={(e) => {
                                          if (isEditing && editedRowData) {
                                            setEditedRowData({ ...editedRowData, enableEditPosted: e.target.checked });
                                          }
                                        }}
                                        className="w-4 h-4 cursor-pointer" 
                                      />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      {isEditing ? (
                                        <div className="flex items-center justify-center gap-1">
                                          <button 
                                            onClick={() => {
                                              // Save logic - update the formAccessData array
                                              if (editedRowData) {
                                                setFormAccessData(formAccessData.map(item => 
                                                  item.id === editedRowData.id ? editedRowData : item
                                                ));
                                              }
                                              setEditingRowId(null);
                                              setEditedRowData(null);
                                            }}
                                            className="px-3 py-1 text-xs text-blue-600 hover:text-blue-700 border border-blue-600 rounded hover:bg-blue-50 flex items-center gap-1"
                                          >
                                            <Save className="w-3 h-3" />
                                            Save
                                          </button>
                                          <button 
                                            onClick={() => {
                                              // Cancel logic - discard changes
                                              setEditingRowId(null);
                                              setEditedRowData(null);
                                            }}
                                            className="px-3 py-1 text-xs text-gray-600 hover:text-gray-700 border border-gray-600 rounded hover:bg-gray-50 flex items-center gap-1"
                                          >
                                            <X className="w-3 h-3" />
                                            Cancel
                                          </button>
                                        </div>
                                      ) : (
                                        <button 
                                          onClick={() => {
                                            setEditingRowId(access.id);
                                            setEditedRowData({ ...access });
                                          }}
                                          className="px-3 py-1 text-xs text-green-600 hover:text-green-700 border border-green-600 rounded hover:bg-green-50"
                                        >
                                          Edit
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
                          <button 
                            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs disabled:opacity-50"
                          >
                            Previous
                          </button>
                          {renderPageNumbers()}
                          <button 
                            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* TKS Group and TKS Group Access */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* TKS Group */}
                      <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-gray-900">TKS Group</h3>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add
                          </button>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                  <th className="px-4 py-3 text-center text-xs text-gray-600 w-12">
                                    <input type="checkbox" className="w-4 h-4" />
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs text-gray-600">TKS Group Name</th>
                                  <th className="px-4 py-3 text-left text-xs text-gray-600">Description</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {tksGroups.map((group) => (
                                  <tr key={group.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-center">
                                      <input 
                                        type="checkbox" 
                                        checked={selectedTKSGroups.includes(group.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedTKSGroups([...selectedTKSGroups, group.id]);
                                          } else {
                                            setSelectedTKSGroups(selectedTKSGroups.filter(id => id !== group.id));
                                          }
                                        }}
                                        className="w-4 h-4" 
                                      />
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{group.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{group.description}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* TKS Group Access */}
                      <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-gray-900">TKS Group Access</h3>
                          <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                  <th className="px-4 py-3 text-center text-xs text-gray-600 w-12">
                                    <input type="checkbox" className="w-4 h-4" />
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs text-gray-600">TKS Group Name</th>
                                  <th className="px-4 py-3 text-left text-xs text-gray-600">Description</th>
                                  <th className="px-4 py-3 text-left text-xs text-gray-600">User Group</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {tksGroupAccess.map((access) => (
                                  <tr key={access.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-center">
                                      <input 
                                        type="checkbox" 
                                        checked={selectedTKSGroupAccess.includes(access.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedTKSGroupAccess([...selectedTKSGroupAccess, access.id]);
                                          } else {
                                            setSelectedTKSGroupAccess(selectedTKSGroupAccess.filter(id => id !== access.id));
                                          }
                                        }}
                                        className="w-4 h-4" 
                                      />
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{access.tksGroupName}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{access.description}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{access.userGroup}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
       
    </div>
  );
}