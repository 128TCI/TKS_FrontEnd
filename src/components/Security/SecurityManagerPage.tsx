import { useState, useEffect, useCallback } from 'react';
import {
  Shield, Check, UserPlus, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft,
  Search, Users, Settings, Plus, Trash2, Save, X, Key, Calendar, Eye, EyeOff
} from 'lucide-react';
import { Footer } from '../Footer/Footer';
import { ApiService, showSuccessModal, showErrorModal } from '../../services/apiService';
import apiClient from '../../services/apiClient';
import { securityService } from '../../services/securityService';
import type { User, UserGroup, Form, FormAccessType, FormAccess, TKSGroup, TKSGroupAccess } from '../Types/security';
import { ACCESS_TYPE_LABELS, ACCESS_TYPE_ORDER } from '../Types/security';
import Swal from 'sweetalert2';
import { CalendarPopup } from '../CalendarPopup';
import { createPortal } from 'react-dom';
import { decryptData } from '../../services/encryptionService';
import auditTrail from '../../services/auditTrail';

export function SecurityManagerPage() {
  const [activeTab, setActiveTab] = useState<'security-manager' | 'group-member' | 'security-control'>('security-manager');
  const [selectedUserGroup, setSelectedUserGroup] = useState('Administrator');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [securityControlTab, setSecurityControlTab] = useState<'access-type' | 'tks-group'>('access-type');
  const [searchTKGroupTerm, setSearchTKGroupTerm] = useState('');
  const [searchGroupAccessTerm, setSearchGroupAccessTerm] = useState('');
  const [selectedTKSGroupAccess, setSelectedTKSGroupAccess] = useState<number[]>([]);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editedRowData, setEditedRowData] = useState<FormAccess | null>(null);
  const [showPassword, setShowPassword] = useState(false);  
  const itemsPerPage = 10;

  // Show/hide password toggles
  const [showOldPassword,          setShowOldPassword]          = useState(false);
  const [showNewPassword,          setShowNewPassword]          = useState(false);
  const [showConfirmNewPassword,   setShowConfirmNewPassword]   = useState(false);
  const [showResetNewPassword,     setShowResetNewPassword]     = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [showUserPassword,         setShowUserPassword]         = useState(false);
  const [showUserConfirmPassword,  setShowUserConfirmPassword]  = useState(false);

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showUserGroupModal, setShowUserGroupModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentAccessPage, setCurrentAccessPage] = useState(1);
  const [showExpirationCalendar, setShowExpirationCalendar] = useState(false);
  const [expirationCalendarPos, setExpirationCalendarPos] = useState({ top: 0, left: 0 });
  // User form state
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    expiration: '',
    machineName: '',
    suspended: false,
    isWindowsAuth: false,
    windowsLoginName: '',
    emailAddress:     '',
  });

  // User Group form state
  const [groupForm, setGroupForm] = useState({
    groupName: '',
    description: ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // ── API-backed data states (replaces mock arrays) ──────────────────────────
  const [usersList, setUsersList] = useState<User[]>([]);
  const [userGroupsList, setUserGroupsList] = useState<UserGroup[]>([]);
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<string[]>([]);
  const [formAccessData, setFormAccessData] = useState<FormAccess[]>([]);
  const [tksGroup, setTKSGroupItems] = useState<TKSGroup[]>([]);
  const [tksGroupAccessData, setTksGroupAccessData] = useState<TKSGroupAccess[]>([]);

  // Pagination for users
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);

  // Loading states
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [loadingTKSGroup, setLoadingTKSGroup] = useState(false);
  const [savingAccess, setSavingAccess] = useState(false);

  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [currentTKSPage, setCurrentTKSPage] = useState(1);

  // API-backed — replaces static arrays
  const [forms, setForms]             = useState<Form[]>([]);
  const [accessTypes, setAccessTypes] = useState<FormAccessType[]>([]);

  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [selectedAccessTypes, setSelectedAccessTypes] = useState<string[]>([]);

  // ── Fetch helpers ──────────────────────────────────────────────────────────

  const fetchUsers = useCallback(async (page = 1) => {
    setLoadingUsers(true);
    try {
      const res = await securityService.getUsers(page, itemsPerPage);
      setUsersList(res.data);
      setUsersTotalPages(Math.ceil(res.totalCount / res.pageSize));
    } catch {
      showErrorModal('Failed to load users.');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchUserGroups = useCallback(async () => {
    setLoadingGroups(true);
    try {
      const data = await securityService.getUserGroups();
      setUserGroupsList(data);
      if (data.length > 0 && !selectedUserGroup) {
        setSelectedUserGroup(data[0].groupName);
      }
    } catch {
      showErrorModal('Failed to load user groups.');
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  const fetchMembers = useCallback(async (groupName: string) => {
    if (!groupName) return;
    setLoadingMembers(true);
    try {
      const [members, nonMembers] = await Promise.all([
        securityService.getMembers(groupName),
        securityService.getNonMembers(groupName),
      ]);
      setGroupMembers(members);
      setAvailableUsers(nonMembers);
    } catch {
      showErrorModal('Failed to load group members.');
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  const fetchGroupAccess = useCallback(async (groupName: string) => {
    if (!groupName) return;
    setLoadingAccess(true);
    try {
      const data = await securityService.getGroupAccess(groupName);
      // Ensure ascending order by formName regardless of API response order
      const sorted = [...data].sort((a, b) => a.formName.localeCompare(b.formName));
      setFormAccessData(sorted);
      setCurrentAccessPage(1);
    } catch {
      showErrorModal('Failed to load group access.');
    } finally {
      setLoadingAccess(false);
    }
  }, []);

  const fetchForms = useCallback(async () => {
    try {
      const data = await securityService.getForms();
      setForms(data);
    } catch {
      showErrorModal('Failed to load forms.');
    }
  }, []);

  const fetchAccessTypes = useCallback(async () => {
    try {
      const data = await securityService.getFormAccessTypes();
      const sorted = [...data].sort((a, b) =>
        (ACCESS_TYPE_ORDER[a.accessTypeName] ?? 99) - (ACCESS_TYPE_ORDER[b.accessTypeName] ?? 99)
      );
      setAccessTypes(sorted);
    } catch {
      showErrorModal('Failed to load access types.');
    }
  }, []);

  // Matches original pattern: fetches from /Fs/Process/TimeKeepGroupSetUp via securityService
  const fetchTKSGroupData = useCallback(async (groupName: string) => {
    setLoadingTKSGroup(true);
    try {
      const data = await securityService.getAvailableTksGroups(groupName);
      setTKSGroupItems(data);
    } catch {
      showErrorModal('Failed to load TKS groups.');
    } finally {
      setLoadingTKSGroup(false);
    }
  }, []);

  const fetchTksGroupAccess = useCallback(async (groupName: string) => {
    if (!groupName) return;
    try {
      const data = await securityService.getTksGroupAccess(groupName);
      setTksGroupAccessData(data);
    } catch {
      showErrorModal('Failed to load TKS group access.');
    }
  }, []);

  // ── Initial load (mirrors original useEffect pattern) ─────────────────────

  useEffect(() => {
    fetchUsers(1);
    fetchUserGroups();
    fetchTKSGroupData('Administrator');
    fetchForms();
    fetchAccessTypes();
  }, []);

  useEffect(() => {
    if (!selectedUserGroup) return;
    if (activeTab === 'group-member') fetchMembers(selectedUserGroup);
    if (activeTab === 'security-control') {
      fetchGroupAccess(selectedUserGroup);
      fetchTksGroupAccess(selectedUserGroup);
      fetchTKSGroupData(selectedUserGroup);
    }
  }, [selectedUserGroup, activeTab]);

  // ── TKS Group pagination (exact original logic) ────────────────────────────

  const filteredTKGroups = tksGroup.filter(item =>
    item.code.toLowerCase().includes(searchTKGroupTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTKGroupTerm.toLowerCase())
  );

  const totalTKSPages = Math.ceil(filteredTKGroups.length / itemsPerPage);
  const startIndex = (currentTKSPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedItem = filteredTKGroups.slice(
    (currentTKSPage - 1) * itemsPerPage,
    currentTKSPage * itemsPerPage
  );

  const getGroupPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalTKSPages <= 7) {
      for (let i = 1; i <= totalTKSPages; i++) pages.push(i);
    } else if (currentTKSPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...'); pages.push(totalTKSPages);
    } else if (currentTKSPage >= totalTKSPages - 3) {
      pages.push(1); pages.push('...');
      for (let i = totalTKSPages - 4; i <= totalTKSPages; i++) pages.push(i);
    } else {
      pages.push(1); pages.push('...');
      for (let i = currentTKSPage - 1; i <= currentTKSPage + 1; i++) pages.push(i);
      pages.push('...'); pages.push(totalTKSPages);
    }
    return pages;
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? filteredTKGroups.map(item => item.id) : []);
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    setSelectedItems(prev => checked ? [...prev, id] : prev.filter(itemId => itemId !== id));
  };

  // TKS Group Access — now API-backed, was a hardcoded const in original
  const tksGroupAccess: TKSGroupAccess[] = tksGroupAccessData;

  const filteredAccessGroups = tksGroupAccess.filter(item =>
    (item.tksGroupCode ?? '').toLowerCase().includes(searchGroupAccessTerm.toLowerCase()) ||
    (item.tksGroupName ?? '').toLowerCase().includes(searchGroupAccessTerm.toLowerCase()) ||
    (item.description  ?? '').toLowerCase().includes(searchGroupAccessTerm.toLowerCase())
  );

  // ── TKS Group Access pagination ────────────────────────────────────────────
  const [currentTKSAccessPage, setCurrentTKSAccessPage] = useState(1);
  const totalTKSAccessPages = Math.ceil(filteredAccessGroups.length / itemsPerPage);
  const paginatedAccessGroups = filteredAccessGroups.slice(
    (currentTKSAccessPage - 1) * itemsPerPage,
    currentTKSAccessPage * itemsPerPage
  );

  const handleSelectAllAccess = (checked: boolean) => {
    setSelectedTKSGroupAccess(checked ? filteredAccessGroups.map(item => item.id) : []);
  };

  const handleSelectItemAccess = (id: number, checked: boolean) => {
    setSelectedTKSGroupAccess(prev => checked ? [...prev, id] : prev.filter(itemId => itemId !== id));
  };

  const getAccessPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalTKSAccessPages <= 7) {
      for (let i = 1; i <= totalTKSAccessPages; i++) pages.push(i);
    } else if (currentTKSAccessPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...'); pages.push(totalTKSAccessPages);
    } else if (currentTKSAccessPage >= totalTKSAccessPages - 3) {
      pages.push(1); pages.push('...');
      for (let i = totalTKSAccessPages - 4; i <= totalTKSAccessPages; i++) pages.push(i);
    } else {
      pages.push(1); pages.push('...');
      for (let i = currentTKSAccessPage - 1; i <= currentTKSAccessPage + 1; i++) pages.push(i);
      pages.push('...'); pages.push(totalTKSAccessPages);
    }
    return pages;
  };

  // ── User Group Access pagination ───────────────────────────────────────────

  const filteredFormAccess = formAccessData.filter(a =>
    a.formName.toLowerCase().includes(searchGroupAccessTerm.toLowerCase())
  );

  const totalFormAccessPages = Math.ceil(filteredFormAccess.length / itemsPerPage);
  const paginatedFormAccess = filteredFormAccess.slice(
    (currentAccessPage - 1) * itemsPerPage,
    currentAccessPage * itemsPerPage
  );

  const handleAccessPageChange = (page: number) => setCurrentAccessPage(page);

  const getFormAccessPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (totalFormAccessPages <= 7) {
      for (let i = 1; i <= totalFormAccessPages; i++) pages.push(i);
    } else if (currentAccessPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...'); pages.push(totalFormAccessPages);
    } else if (currentAccessPage >= totalFormAccessPages - 3) {
      pages.push(1); pages.push('...');
      for (let i = totalFormAccessPages - 4; i <= totalFormAccessPages; i++) pages.push(i);
    } else {
      pages.push(1); pages.push('...');
      for (let i = currentAccessPage - 1; i <= currentAccessPage + 1; i++) pages.push(i);
      pages.push('...'); pages.push(totalFormAccessPages);
    }
    return pages;
  };

  // ── Group member transfer handlers (original logic preserved) ──────────────

  // ── Group member transfer handlers ────────────────────────────────────────
  // ">" — remove selected group members from tk_UserGroupMember
  const moveToUsers = async () => {
    try {
      if (selectedGroupMembers.length === 0) {
        showErrorModal('Please select member(s) to remove.');
        return
      }
      else  
        await securityService.removeMembers(selectedUserGroup, selectedGroupMembers);
        setGroupMembers(prev => prev.filter(m => !selectedGroupMembers.includes(m)));
        setAvailableUsers(prev => [...prev, ...selectedGroupMembers]);
        setSelectedGroupMembers([]);
        showSuccessModal(`${selectedGroupMembers.length} member(s) removed successfully.`);
      } catch (error) {
        showErrorModal('Failed to remove member(s).');
        }    
  };

  // ">>" — remove ALL group members from tk_UserGroupMember
  const moveAllToUsers = async () => {
    if (groupMembers.length === 0) return;
    try {
      await securityService.removeMembers(selectedUserGroup, groupMembers);
      setAvailableUsers(prev => [...prev, ...groupMembers]);
      setGroupMembers([]);
      setSelectedGroupMembers([]);
      showSuccessModal(`${groupMembers.length} member(s) removed successfully.`);
    } catch (error) {
      showErrorModal('Failed to remove all members.');
    }
  };

  // "<" — add selected users to tk_UserGroupMember
  const moveToGroupMembers = async () => {
    if (selectedUsers.length === 0) return;
    try {
      await securityService.addMembers(selectedUserGroup, selectedUsers);
      setGroupMembers(prev => [...prev, ...selectedUsers]);
      setAvailableUsers(prev => prev.filter(u => !selectedUsers.includes(u)));
      setSelectedUsers([]);
      showSuccessModal(`${selectedUsers.length} member(s) added successfully.`);
    } catch (error) {
      showErrorModal('Failed to add member(s).');
    }
  };

  // Access Type handlers
  const handleToggleAllAccessTypes = (checked: boolean) => {
    if (checked) {
      setSelectedAccessTypes([...accessTypes.map(at => at.accessTypeName)]);
    } else {
      setSelectedAccessTypes([]);
    }
  };  

  // "<<" — add ALL available users to tk_UserGroupMember
  const moveAllToGroupMembers = async () => {
    if (availableUsers.length === 0) return;
    try {
      await securityService.addMembers(selectedUserGroup, availableUsers);
      setGroupMembers(prev => [...prev, ...availableUsers]);
      setAvailableUsers([]);
      setSelectedUsers([]);
      showSuccessModal(`${availableUsers.length} member(s) added successfully.`);
    } catch (error) {
      showErrorModal('Failed to add all members.');
    }
  };

  // ── User CRUD handlers ─────────────────────────────────────────────────────

const handleAddUser = () => {
  setIsEditMode(false);
  setSelectedUser(null);
  setUserForm({ username: '', password: '', confirmPassword: '', expiration: '', machineName: '', suspended: false, isWindowsAuth: false, windowsLoginName: '', emailAddress: '' });
  setShowUserModal(true);
};

const handleEditUser = (user: User) => {
  setIsEditMode(true);
  setSelectedUser(user);
  setUserForm({ username: user.username, password: '', confirmPassword: '', expiration: user.expiration, machineName: user.machineName, suspended: user.suspended, isWindowsAuth: user.isWindowsAuth, windowsLoginName: user.windowsLoginName, emailAddress: user.emailAddress ?? '' }); // ← FIX
  setShowUserModal(true);
};
  // Parse MM/DD/YYYY manually, no timezone shift:
  const toISOOrNull = (val: string | undefined): string | undefined => {
    if (!val || val.trim() === '') return undefined;
    
    const parts = val.split('/');
    if (parts.length === 3) {
      const [mm, dd, yyyy] = parts;
      return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}T00:00:00`;
    }

    // fallback for other formats
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  };

  // Original signature: handleRemoveUser(userId: number)
  // We look up the username from usersList to call the API
  const handleRemoveUser = async (userId: number) => {
    const user = usersList.find(u => u.id === userId);
    if (!user) return;

    const { isConfirmed } = await Swal.fire({
      title: 'Delete User Account?',
      html: `
        <p>You are about to permanently delete:</p>
        <strong style="color:#d33;">${user.username}</strong>
        <br/><br/>
        <small>Are you sure you want to delete this account?</small>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (!isConfirmed) return;

    try {
      const res = await securityService.removeUser(user.username);

      if (res.success) {
        await auditTrail.log({
          accessType: 'Delete',
          trans: `Deleted account record for user '${user.username}'`,
          messages: `Security Manager - Users deleted: ${user.username}`,
          formName: 'Security Manager - Users',
        });
        await Swal.fire({
          title: 'Deleted!',
          text: res.message,
          icon: 'success',
          confirmButtonColor: '#3085d6'
        });
        fetchUsers(usersPage);
      } else {
        Swal.fire('Error', res.message, 'error');
      }
    } catch {
      Swal.fire('Error', 'Failed to remove user.', 'error');
    }
  };

  const handleSaveUser = async () => {
    if (!userForm.username.trim()) { showErrorModal('Please enter a username.'); return; }
    if (!isEditMode && !userForm.password.trim()) { showErrorModal('Please enter a password.'); return; }
    if (!isEditMode && userForm.password !== userForm.confirmPassword) { showErrorModal('Passwords do not match.'); return; }

    // ── Resolve the currently logged-in username ──
    const raw = localStorage.getItem('userData');
    const stored = raw ? JSON.parse(raw) : null;
    const currentUser = stored?.userName ? decryptData(stored.userName) : '';
    console.log(currentUser);
    try {
      if (isEditMode && selectedUser) {
        await securityService.updateUser(selectedUser.username, {
          expiration:            toISOOrNull(userForm.expiration),
          machineName:           userForm.machineName     || undefined,
          suspended:             userForm.suspended,
          isWindowsAuthenticate: userForm.isWindowsAuth,
          windowsLoginName:      userForm.windowsLoginName || undefined,
          emailAddress:          userForm.emailAddress    || undefined, 
          editedBy:              currentUser,                            
        });
        await auditTrail.log({
          accessType: 'Edit',
          trans: `Updated record for ${selectedUser.username}`,
          messages: `Security Manager - Users update record: ${selectedUser.username}`,
          formName: 'Security Manager - Users',
        });
        //console.log("API response:", res);
        showSuccessModal('User updated successfully.');
      } else {
        await securityService.createUser({
          username:              userForm.username,
          password:              userForm.password,
          expiration:            toISOOrNull(userForm.expiration),
          machineName:           userForm.machineName     || undefined,
          suspended:             userForm.suspended,
          isWindowsAuthenticate: userForm.isWindowsAuth,
          windowsLoginName:      userForm.windowsLoginName || undefined,
          emailAddress:          userForm.emailAddress    || undefined,  
          createdBy:             currentUser,                            
        });
        await auditTrail.log({
          accessType: 'Add',
          trans: `Created new account '${userForm.username}'`,
          messages: `Security Manager - Users new record: ${userForm.username}`,
          formName: 'Security Manager - Users',
        });
        showSuccessModal('User created successfully.');
      }
      setShowUserModal(false);
      fetchUsers(usersPage);
    } catch {
      showErrorModal('Failed to save user.');
    }
  };

  // ── Password handlers ──────────────────────────────────────────────────────

  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    setPasswordForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    setShowChangePasswordModal(true);
  };

  const handleSaveChangePassword = async () => {
    if (!passwordForm.oldPassword.trim()) { showErrorModal('Please enter your old password.'); return; }
    if (!passwordForm.newPassword.trim()) { showErrorModal('Please enter a new password.'); return; }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) { showErrorModal('New passwords do not match.'); return; }
    try {
      const res = await securityService.changePassword(selectedUser!.username, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      if (res.success) { 
        await auditTrail.log({
          accessType: 'Edit',
          trans: `Changed Password for account '${selectedUser!.username}'`,
          messages: `Security Manager - Users update record: ${selectedUser!.username}`,
          formName: 'Security Manager - Users',
        });
        showSuccessModal(res.message); setShowChangePasswordModal(false); }
      else showErrorModal(res.message);
    } catch {
      showErrorModal('Failed to change password.');
    }
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setPasswordForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    setShowResetPasswordModal(true);
  };

  const handleSaveResetPassword = async () => {
    if (!passwordForm.newPassword.trim()) { showErrorModal('Please enter a new password.'); return; }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) { showErrorModal('Passwords do not match.'); return; }

    try {
      await securityService.resetPassword(selectedUser!.username, {
        newPassword: passwordForm.newPassword,  
      });
      await auditTrail.log({
        accessType: 'Edit',
        trans: `Reset Password for account ${selectedUser!.username}`,
        messages: `Security Manager - Users update record: ${selectedUser!.username}`,
        formName: 'Security Manager - Users',
      });
      showSuccessModal('Password reset successfully.');
      setShowResetPasswordModal(false);
    } catch {
      showErrorModal('Failed to reset password.');
    }
  };

  // ── User Group handlers ────────────────────────────────────────────────────

  const handleAddUserGroup = () => {
    setGroupForm({ groupName: '', description: '' });
    setShowUserGroupModal(true);
  };

  // Original signature: handleRemoveUserGroup(groupId: number)
  // We look up groupName from userGroupsList to call the API
  const handleRemoveUserGroup = async (groupId: number) => {
    const confirmed = await ApiService.showDeleteGroupConfirmDialog(
      'Are you sure you want to remove this user group?', 'Confirm Delete'
    );
    if (!confirmed) return;
    const group = userGroupsList.find(g => g.id === groupId);
    if (!group) return;
    try {
      const res = await securityService.removeUserGroup(group.groupName);
      if (res.success) { showSuccessModal(res.message); fetchUserGroups(); }
      else showErrorModal(res.message);
    } catch {
      showErrorModal('Failed to remove group.');
    }
  };

  const handleSaveUserGroup = async () => {
    if (!groupForm.groupName.trim()) { showErrorModal('Please enter a group name.'); return; }
    try {
      await securityService.createUserGroup(groupForm.groupName, groupForm.description);
      showSuccessModal('Group created successfully.');
      setShowUserGroupModal(false);
      fetchUserGroups();
    } catch {
      showErrorModal('Failed to create group.');
    }
  };

  // ── Security Control — Access save ─────────────────────────────────────────

  const handleSaveAccess = async (access: FormAccess) => {
    setSavingAccess(true);
    try {
      const res = await securityService.saveGroupAccess({
        groupName:   selectedUserGroup,
        formName:    access.formName,
        accessFlags: access.accessFlags,
      });
      if (res.success) {
        setFormAccessData(formAccessData.map(item => item.id === access.id ? access : item));
        showSuccessModal('Access saved.');
      } else {
        showErrorModal(res.message);
      }
    } catch {
      showErrorModal('Failed to save access.');
    } finally {
      setSavingAccess(false);
    }
  };


  // ── Access Type — Add button handler ──────────────────────────────────────
  const handleAddAccessType = async () => {
    if (selectedForms.length === 0) {
      showErrorModal('Please select at least one Form.');
      return;
    }
    if (selectedAccessTypes.length === 0) {
      showErrorModal('Please select at least one Access Type.');
      return;
    }

    // Check for duplicates against existing User Group Access list
    const existingFormNames = formAccessData.map(a => a.formName);
    const duplicates = selectedForms.filter(f => existingFormNames.includes(f));

    if (duplicates.length > 0) {
      const dupList = duplicates.join(', ');
      const proceed = await ApiService.showDeleteGroupConfirmDialog(
        `The following form(s) already exist in User Group Access for "${selectedUserGroup}":\n\n${dupList}\n\nDo you want to overwrite them?`,
        'Duplicate Form(s) Detected'
      );
      if (!proceed) return;
    }    

    // Build accessFlags: every known access type defaults false, selected ones true
    const baseFlags: Record<string, boolean> = {};
    accessTypes.forEach(at => { baseFlags[at.accessTypeName] = false; });
    selectedAccessTypes.forEach(name => { baseFlags[name] = true; });

    setSavingAccess(true);
    let successCount = 0;
    let failCount = 0;

    for (const formName of selectedForms) {
      try {
        const res = await securityService.saveGroupAccess({
          groupName:   selectedUserGroup,
          formName,
          accessFlags: baseFlags,
        });
        if (res.success) successCount++;
        else failCount++;
      } catch {
        failCount++;
      }
    }

    setSavingAccess(false);

    if (failCount === 0) {
      showSuccessModal(`Added access for ${successCount} form(s) successfully.`);
    } else {
      showErrorModal(`${successCount} saved, ${failCount} failed.`);
    }

    // Clear selections and refresh the table
    setSelectedForms([]);
    setSelectedAccessTypes([]);
    fetchGroupAccess(selectedUserGroup);
  };  

  // ── TKS Group Access remove ────────────────────────────────────────────────

  // ── TKS Group Add handler ──────────────────────────────────────────────────
  const handleAddTksGroupAccess = async () => {
    if (!selectedItems.length) {
      showErrorModal('Please select at least one TKS Group to add.');
      return;
    }
    // Collect the GroupCode (stored in item.code) of each selected row
    const selectedCodes = tksGroup
      .filter(item => selectedItems.includes(item.id))
      .map(item => item.code);

    try {
      const res = await securityService.saveTksGroupAccess(
        selectedUserGroup,
        selectedCodes,
        undefined   // createdBy — pass logged-in username here if available
      );
      if (res.success) {
        showSuccessModal(`Added ${selectedCodes.length} TKS group(s) successfully.`);
        setSelectedItems([]);                       // clear selection in left panel
        fetchTksGroupAccess(selectedUserGroup);     // refresh right panel
        fetchTKSGroupData(selectedUserGroup);       // refresh left panel (now fewer available)
      } else {
        showErrorModal(res.message);
      }
    } catch {
      showErrorModal('Failed to add TKS group access.');
    }
  };

  // ── TKS Group Remove handler ────────────────────────────────────────────────
  const handleRemoveTksGroupAccess = async () => {
    if (!selectedTKSGroupAccess.length) {
      showErrorModal('Please select at least one record to remove.');
      return;
    }
    // Use tksGroupAccessData (state) — never the const alias which may be stale
    const selectedCodes = tksGroupAccessData
      .filter(item => selectedTKSGroupAccess.includes(item.id))
      .map(item => item.tksGroupCode);

    if (!selectedCodes.length) return;

    try {
      const res = await securityService.removeTksGroupAccess(selectedUserGroup, selectedCodes);
      if (res.success) {
        showSuccessModal(res.message);
        setSelectedTKSGroupAccess([]);
        fetchTksGroupAccess(selectedUserGroup);
        fetchTKSGroupData(selectedUserGroup);       // removed codes reappear in left panel
        showSuccessModal(`Removed ${selectedCodes.length} TKS group access record(s) successfully.`);   
      } else {
        showErrorModal(res.message);
      }
    } catch {
      showErrorModal('Failed to remove TKS group access.');
    }
  };

  // ── ESC key handler (original logic preserved) ─────────────────────────────

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showUserModal) setShowUserModal(false);
        if (showUserGroupModal) setShowUserGroupModal(false);
        if (showChangePasswordModal) setShowChangePasswordModal(false);
        if (showResetPasswordModal) setShowResetPasswordModal(false);
      }
    };

    if (showUserModal || showUserGroupModal || showChangePasswordModal || showResetPasswordModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => { document.removeEventListener('keydown', handleEscKey); };
  }, [showUserModal, showUserGroupModal, showChangePasswordModal, showResetPasswordModal]);

  // ── Render (original JSX structure preserved exactly) ─────────────────────

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-blue-600 text-white px-6 py-4 rounded-lg mb-1">
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
                className={`px-4 py-2.5 text-sm transition-all flex items-center gap-2 rounded-t ${
                  activeTab === 'security-manager' ? 'text-white bg-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Shield className="w-4 h-4" /> Security Manager
              </button>
              <button
                onClick={() => setActiveTab('group-member')}
                className={`px-4 py-2.5 text-sm transition-all flex items-center gap-2 rounded-t ${
                  activeTab === 'group-member' ? 'text-white bg-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Users className="w-4 h-4" /> Group Member SetUp
              </button>
              <button
                onClick={() => setActiveTab('security-control')}
                className={`px-4 py-2.5 text-sm transition-all flex items-center gap-2 rounded-t ${
                  activeTab === 'security-control' ? 'text-white bg-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-4 h-4" /> Security Control
              </button>
            </div>

            {/* ── Security Manager Tab ───────────────────────────────────── */}
            {activeTab === 'security-manager' && (
              <div className="space-y-6">
                {/* Users Section */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900">Users</h3>
                    <button onClick={handleAddUser} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
                      <UserPlus className="w-4 h-4" /> Add
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
                          {loadingUsers ? (
                            <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400 text-sm">Loading...</td></tr>
                          ) : usersList.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{user.username}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{user.expiration}</td>
                              <td className="px-4 py-3"><input type="checkbox" checked={user.logIn} readOnly className="w-4 h-4" /></td>
                              <td className="px-4 py-3 text-sm text-gray-600">{user.machineName}</td>
                              <td className="px-4 py-3"><input type="checkbox" checked={user.suspended} readOnly className="w-4 h-4" /></td>
                              <td className="px-4 py-3"><input type="checkbox" checked={user.isWindowsAuth} readOnly className="w-4 h-4" /></td>
                              <td className="px-4 py-3 text-sm text-gray-600">{user.windowsLoginName}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleChangePassword(user)} className="px-3 py-1 text-xs text-blue-600 hover:text-blue-700 border border-blue-600 rounded hover:bg-blue-50">Change Password</button>
                                  <button onClick={() => handleResetPassword(user)} className="px-3 py-1 text-xs text-gray-600 hover:text-gray-700 border border-gray-600 rounded hover:bg-gray-50">Reset</button>
                                  <button onClick={() => handleRemoveUser(user.id)} className="px-3 py-1 text-xs text-red-600 hover:text-red-700 border border-red-600 rounded hover:bg-red-50">Remove</button>
                                  <button onClick={() => handleEditUser(user)} className="px-3 py-1 text-xs text-green-600 hover:text-green-700 border border-green-600 rounded hover:bg-green-50">Edit</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Pagination */}
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
                      <button
                        onClick={() => { const p = Math.max(1, usersPage - 1); setUsersPage(p); fetchUsers(p); }}
                        disabled={usersPage === 1}
                        className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs disabled:opacity-50"
                      >Previous</button>
                      <button className="px-3 py-1 rounded border border-blue-500 bg-blue-500 text-white text-xs">{usersPage}</button>
                      <button
                        onClick={() => { const p = Math.min(usersTotalPages, usersPage + 1); setUsersPage(p); fetchUsers(p); }}
                        disabled={usersPage === usersTotalPages}
                        className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs disabled:opacity-50"
                      >Next</button>
                    </div>
                  </div>
                </div>

                {/* User Group Section */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900">User Group</h3>
                    <button onClick={handleAddUserGroup} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
                      <UserPlus className="w-4 h-4" /> Add
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
                          {loadingGroups ? (
                            <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400 text-sm">Loading...</td></tr>
                          ) : userGroupsList.map(group => (
                            <tr key={group.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{group.groupName}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{group.description}</td>
                              <td className="px-4 py-3">
                                {/* Original signature: handleRemoveUserGroup(group.id) */}
                                <button onClick={() => handleRemoveUserGroup(group.id)} className="px-3 py-1 text-xs text-red-600 hover:text-red-700 border border-red-600 rounded hover:bg-red-50">Remove</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Pagination */}
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
                      <button className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs">Previous</button>
                      <button className="px-3 py-1 rounded border border-blue-500 bg-blue-500 text-white text-xs">1</button>
                      <button className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs">Next</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Group Member Tab ───────────────────────────────────────── */}
            {activeTab === 'group-member' && (
              <div className="space-y-6">
                {/* User Group Selector */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <label className="block text-gray-700 mb-2">User Group</label>
                  <select
                    value={selectedUserGroup}
                    onChange={e => { setSelectedUserGroup(e.target.value); fetchMembers(e.target.value); }}
                    className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {userGroupsList.map(g => <option key={g.id} value={g.description}>{g.description}</option>)}
                  </select>
                </div>

                {/* Group Members and Users */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Group Members */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                    <h3 className="text-gray-700 mb-3 text-sm">Group Members</h3>
                    {loadingMembers ? (
                      <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
                    ) : (
                      <select
                        multiple
                        value={selectedGroupMembers}
                        onChange={e => setSelectedGroupMembers(Array.from(e.target.selectedOptions, o => o.value))}
                        className="w-full h-64 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        {groupMembers.map(member => <option key={member} value={member}>{member}</option>)}
                      </select>
                    )}
                  </div>

                  {/* Transfer Buttons */}
                  <div className="flex flex-col items-center justify-center gap-3">
                    <button onClick={moveToUsers} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button onClick={moveToGroupMembers} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={moveAllToUsers} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition-colors">
                      <ChevronsRight className="w-5 h-5" />
                    </button>
                    <button onClick={moveAllToGroupMembers} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition-colors">
                      <ChevronsLeft className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Users */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                    <h3 className="text-gray-700 mb-3 text-sm">Users</h3>
                    <select
                      multiple
                      value={selectedUsers}
                      onChange={e => setSelectedUsers(Array.from(e.target.selectedOptions, o => o.value))}
                      className="w-full h-64 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {availableUsers.map(user => <option key={user} value={user}>{user}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── Security Control Tab ───────────────────────────────────── */}
            {activeTab === 'security-control' && (
              <div className="space-y-6">
                {/* Sub-tabs */}
                <div className="flex items-center gap-1 border-b border-gray-200">
                  <button
                    onClick={() => setSecurityControlTab('access-type')}
                    className={`px-4 py-2 text-sm transition-colors ${securityControlTab === 'access-type' ? 'bg-gray-100 text-gray-900 border border-gray-300 border-b-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >Set Up AccessType</button>
                  <button
                    onClick={() => setSecurityControlTab('tks-group')}
                    className={`px-4 py-2 text-sm transition-colors ${securityControlTab === 'tks-group' ? 'bg-gray-100 text-gray-900 border border-gray-300 border-b-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >Set Up TKS Group</button>
                </div>

                {/* User Group Selector */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <label className="block text-gray-700 mb-2">User Group</label>
                  <select
                    value={selectedUserGroup}
                    onChange={e => {
                      const g = e.target.value;
                      setSelectedUserGroup(g);
                      setSearchGroupAccessTerm('');
                      setCurrentAccessPage(1);
                      setCurrentTKSPage(1);
                      setCurrentTKSAccessPage(1);
                      fetchTksGroupAccess(g);
                      fetchGroupAccess(g);
                      fetchTKSGroupData(g);
                    }}
                    className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {userGroupsList.map(g => <option key={g.id} value={g.description}>{g.description}</option>)}
                  </select>
                </div>

                {securityControlTab === 'access-type' ? (
                  <>
                    {/* Forms and Access Type */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                        <h3 className="text-gray-900 mb-3">Forms</h3>
                        <div className="bg-white border border-gray-200 rounded-lg p-3 h-96 overflow-y-auto">
                          <div className="space-y-2">
                            {/* Select All */}
                            <label className="flex items-center gap-2 hover:bg-blue-50 p-2 rounded cursor-pointer border-b border-gray-200 mb-2">
                              <input
                                type="checkbox"
                                checked={selectedForms.length === forms.length && forms.length > 0}
                                onChange={e => setSelectedForms(e.target.checked ? forms.map(f => f.formName) : [])}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm font-small text-gray-900">Select All</span>
                            </label>
                            {forms.map((form) => (
                              <label key={form.id} className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded cursor-pointer">
                                <input type="checkbox" checked={selectedForms.includes(form.formName)}
                                  onChange={e => setSelectedForms(p => e.target.checked ? [...p, form.formName] : p.filter(f => f !== form.formName))}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-sm text-gray-700 leading-tight">{form.formName}</span>
                                  {form.formDescription && (
                                    <span className="text-xs text-gray-400 leading-tight truncate">{form.formDescription}</span>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                        <h3 className="text-gray-900 mb-3">Access Type</h3>
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          {/* Select All */}
                          <label className="flex items-center gap-2 hover:bg-blue-50 p-2 rounded cursor-pointer border-b border-gray-200 mb-2">
                            <input
                              type="checkbox"
                              checked={selectedAccessTypes.length === accessTypes.length && accessTypes.length > 0}
                              onChange={(e) => handleToggleAllAccessTypes(e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-50"
                            />
                            <span className="text-sm font-small text-gray-900">Select All</span>
                          </label>                         
                          <div className="space-y-2">
                            {accessTypes.map((type) => (
                              <label key={type.id} className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded cursor-pointer">
                                <input type="checkbox" checked={selectedAccessTypes.includes(type.accessTypeName)}
                                  onChange={e => setSelectedAccessTypes(p => e.target.checked ? [...p, type.accessTypeName] : p.filter(t => t !== type.accessTypeName))}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                <span className="text-sm text-gray-700">{ACCESS_TYPE_LABELS[type.accessTypeName] ?? type.description ?? type.accessTypeName}</span>
                              </label>
                            ))}
                          </div>
                          <button
                            onClick={handleAddAccessType}
                            disabled={savingAccess || selectedForms.length === 0 || selectedAccessTypes.length === 0} 
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
                            <Plus className="w-4 h-4" /> {savingAccess ? 'Saving...' : 'Add'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* User Group Access Table */}
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                      {/* Header with search */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-900">User Group Access</h3>
                        <div className="flex items-center gap-2 border border-gray-300 rounded px-3 py-1.5 bg-white w-64">
                          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <input
                            type="text"
                            placeholder="Search form name..."
                            value={searchGroupAccessTerm}
                            onChange={e => { setSearchGroupAccessTerm(e.target.value); setCurrentAccessPage(1); }}
                            className="flex-1 text-sm outline-none bg-transparent"
                          />
                          {searchGroupAccessTerm && (
                            <button onClick={() => { setSearchGroupAccessTerm(''); setCurrentAccessPage(1); }}>
                              <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs text-gray-600">Form Name</th>
                                {accessTypes.map(at => (
                                  <th key={at.id} className="px-4 py-3 text-center text-xs text-gray-600">
                                    {ACCESS_TYPE_LABELS[at.accessTypeName] ?? at.description ?? at.accessTypeName}
                                  </th>
                                ))}
                                <th className="px-4 py-3 text-center text-xs text-gray-600">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {loadingAccess ? (
                                <tr><td colSpan={accessTypes.length + 2} className="px-4 py-6 text-center text-gray-400 text-sm">Loading...</td></tr>
                              ) : paginatedFormAccess.map(access => {
                                const isEditing = editingRowId === access.id;
                                const currentData = isEditing && editedRowData ? editedRowData : access;
                                return (
                                  <tr key={access.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      <div className="flex flex-col">
                                        <span>{access.formDescription || access.formName}</span>
                                        {access.formDescription && (
                                          <span className="text-xs text-gray-400">{access.formName}</span>
                                        )}
                                      </div>
                                    </td>
                                    {accessTypes.map(at => (
                                      <td key={at.id} className="px-4 py-3 text-center">
                                        <input
                                          type="checkbox"
                                          checked={currentData.accessFlags[at.accessTypeName] ?? false}
                                          disabled={!isEditing}
                                          onChange={e => {
                                            if (isEditing && editedRowData)
                                              setEditedRowData({
                                                ...editedRowData,
                                                accessFlags: { ...editedRowData.accessFlags, [at.accessTypeName]: e.target.checked }
                                              });
                                          }}
                                          className="w-4 h-4 cursor-pointer"
                                        />
                                      </td>
                                    ))}
                                    <td className="px-4 py-3 text-center">
                                      {isEditing ? (
                                        <div className="flex items-center justify-center gap-1">
                                          <button
                                            onClick={async () => {
                                              if (editedRowData) await handleSaveAccess(editedRowData);
                                              setEditingRowId(null); setEditedRowData(null);
                                            }}
                                            disabled={savingAccess}
                                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                                          >
                                            <Save className="w-3 h-3" /> Save
                                          </button>
                                          <button
                                            onClick={() => { setEditingRowId(null); setEditedRowData(null); }}
                                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                                          >
                                            <X className="w-3 h-3" /> Cancel
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => { setEditingRowId(access.id); setEditedRowData({ ...access }); }}
                                          className="px-3 py-1 text-xs text-green-600 hover:text-green-700 border border-green-600 rounded hover:bg-green-50"
                                        >Edit</button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-3 px-2 pb-2">
                          <div className="text-gray-600 text-xs">
                            Showing {filteredFormAccess.length === 0 ? 0 : (currentAccessPage - 1) * itemsPerPage + 1} to {Math.min(currentAccessPage * itemsPerPage, filteredFormAccess.length)} of {filteredFormAccess.length} entries
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => handleAccessPageChange(Math.max(1, currentAccessPage - 1))} disabled={currentAccessPage === 1}
                              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                            {getFormAccessPageNumbers().map((page, idx) => (
                              page === '...' ? (
                                <span key={`ellipsis-${idx}`} className="px-1 text-gray-500 text-xs self-center">...</span>
                              ) : (
                                <button key={page} onClick={() => handleAccessPageChange(page as number)}
                                  className={`px-2 py-1 rounded text-xs ${currentAccessPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>
                                  {page}
                                </button>
                              )
                            ))}
                            <button onClick={() => handleAccessPageChange(Math.min(totalFormAccessPages, currentAccessPage + 1))} disabled={currentAccessPage === totalFormAccessPages || totalFormAccessPages === 0}
                              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                          </div>
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
                          <button
                            onClick={handleAddTksGroupAccess}
                            //disabled={selectedItems.length === 0}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" /> Add
                          </button>
                        </div>
                        <div className="mb-4 flex items-center gap-3">
                          <Search className="w-4 h-4 text-gray-500" />
                          <input type="text" placeholder="Search..." value={searchTKGroupTerm}
                            onChange={e => { setSearchTKGroupTerm(e.target.value); setCurrentTKSPage(1); }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs text-gray-600">
                                    <input type="checkbox"
                                      checked={selectedItems.length === filteredTKGroups.length && filteredTKGroups.length > 0}
                                      onChange={e => handleSelectAll(e.target.checked)}
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs text-gray-600">TKS Group Name</th>
                                  <th className="px-4 py-2 text-left text-xs text-gray-600">Description</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {paginatedItem.length === 0 ? (
                                  <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-sm">No records found.</td></tr>
                                ) : paginatedItem.map(item => (
                                  <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2">
                                      <input type="checkbox"
                                        checked={selectedItems.includes(item.id)}
                                        onChange={e => handleSelectItem(item.id, e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-900">{item.code}</td>
                                    <td className="px-4 py-2 text-sm text-gray-600">{item.description}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {/* Pagination */}
                          <div className="flex items-center justify-between mt-3 px-2 pb-2">
                            <div className="text-gray-600 text-xs">
                              Showing {filteredTKGroups.length === 0 ? 0 : (currentTKSPage - 1) * itemsPerPage + 1} to {Math.min(currentTKSPage * itemsPerPage, filteredTKGroups.length)} of {filteredTKGroups.length} entries
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => setCurrentTKSPage(prev => Math.max(prev - 1, 1))} disabled={currentTKSPage === 1}
                                className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                              {getGroupPageNumbers().map((page, idx) => (
                                page === '...' ? (
                                  <span key={`ellipsis-${idx}`} className="px-1 text-gray-500 text-xs">...</span>
                                ) : (
                                  <button key={page} onClick={() => setCurrentTKSPage(page as number)}
                                    className={`px-2 py-1 rounded text-xs ${currentTKSPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>
                                    {page}
                                  </button>
                                )
                              ))}
                              <button onClick={() => setCurrentTKSPage(prev => Math.min(prev + 1, totalTKSPages))} disabled={currentTKSPage === totalTKSPages || totalTKSPages === 0}
                                className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* TKS Group Access */}
                      <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-gray-900">TKS Group Access</h3>
                          <button onClick={handleRemoveTksGroupAccess} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Remove
                          </button>
                        </div>
                        <div className="mb-4 flex items-center gap-3">
                          <Search className="w-4 h-4 text-gray-500" />
                          <input type="text" placeholder="Search..." value={searchGroupAccessTerm}
                            onChange={e => { setSearchGroupAccessTerm(e.target.value); setCurrentTKSAccessPage(1); }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs text-gray-600">
                                    <input type="checkbox"
                                      checked={selectedTKSGroupAccess.length === filteredAccessGroups.length && filteredAccessGroups.length > 0}
                                      onChange={e => handleSelectAllAccess(e.target.checked)}
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs text-gray-600">TKS Group Name</th>
                                  <th className="px-4 py-2 text-left text-xs text-gray-600">Description</th>
                                  <th className="px-4 py-2 text-left text-xs text-gray-600">User Group</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {paginatedAccessGroups.length === 0 ? (
                                  <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-sm">No records found.</td></tr>
                                ) : paginatedAccessGroups.map(access => (
                                  <tr key={access.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2">
                                      <input type="checkbox"
                                        checked={selectedTKSGroupAccess.includes(access.id)}
                                        onChange={e => handleSelectItemAccess(access.id, e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-900">{access.tksGroupCode}</td>
                                    <td className="px-4 py-2 text-sm text-gray-600">{access.description}</td>
                                    <td className="px-4 py-2 text-sm text-gray-600">{access.userGroup}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {/* Pagination */}
                          <div className="flex items-center justify-between mt-3 px-2 pb-2">
                            <div className="text-gray-600 text-xs">
                              Showing {filteredAccessGroups.length === 0 ? 0 : (currentTKSAccessPage - 1) * itemsPerPage + 1} to {Math.min(currentTKSAccessPage * itemsPerPage, filteredAccessGroups.length)} of {filteredAccessGroups.length} entries
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => setCurrentTKSAccessPage(prev => Math.max(prev - 1, 1))} disabled={currentTKSAccessPage === 1}
                                className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                              {getAccessPageNumbers().map((page, idx) => (
                                page === '...' ? (
                                  <span key={`ellipsis-${idx}`} className="px-1 text-gray-500 text-xs">...</span>
                                ) : (
                                  <button key={page} onClick={() => setCurrentTKSAccessPage(page as number)}
                                    className={`px-2 py-1 rounded text-xs ${currentTKSAccessPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>
                                    {page}
                                  </button>
                                )
                              ))}
                              <button onClick={() => setCurrentTKSAccessPage(prev => Math.min(prev + 1, totalTKSAccessPages))} disabled={currentTKSAccessPage === totalTKSAccessPages || totalTKSAccessPages === 0}
                                className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                            </div>
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

      {/* ── Add/Edit User Modal ───────────────────────────────────────── */}
      {showUserModal && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowUserModal(false)} />
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                <h2 className="text-gray-800">{isEditMode ? 'Edit User' : 'Create New User'}</h2>
                <button onClick={() => setShowUserModal(false)} className="text-gray-600 hover:text-gray-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Username *</label>
                      <input
                        type="text"
                        value={userForm.username}
                        onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    {/* ── Expiration Date ── */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Expiration Date</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={userForm.expiration}
                          onChange={e => setUserForm({ ...userForm, expiration: e.target.value })}
                          placeholder="MM/DD/YYYY"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            setExpirationCalendarPos({
                              top:  rect.bottom + window.scrollY + 4,
                              left: rect.left  + window.scrollX,
                            });
                            setShowExpirationCalendar(v => !v);
                          }}
                          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserForm({ ...userForm, expiration: '' })}
                          className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={userForm.emailAddress}
                      onChange={e => setUserForm({ ...userForm, emailAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="user@company.com"
                    />
                  </div>
                  {!isEditMode && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Password *</label>
                        <div className="relative">
                          <input type={showUserPassword ? 'text' : 'password'} value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                            className="w-full px-3 pr-11 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                          <button type="button" tabIndex={-1} onMouseDown={e => e.preventDefault()} onClick={() => setShowUserPassword(p => !p)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
                            {showUserPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Confirm Password *</label>
                        <div className="relative">
                          <input type={showUserConfirmPassword ? 'text' : 'password'} value={userForm.confirmPassword} onChange={e => setUserForm({ ...userForm, confirmPassword: e.target.value })}
                            className="w-full px-3 pr-11 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                          <button type="button" tabIndex={-1} onMouseDown={e => e.preventDefault()} onClick={() => setShowUserConfirmPassword(p => !p)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
                            {showUserConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Machine Name</label>
                    <input
                      type="text"
                      value={userForm.machineName}
                      onChange={e => setUserForm({ ...userForm, machineName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Windows Login Name</label>
                    <input
                      type="text"
                      value={userForm.windowsLoginName}
                      onChange={e => setUserForm({ ...userForm, windowsLoginName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userForm.suspended}
                        onChange={e => setUserForm({ ...userForm, suspended: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Suspended</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userForm.isWindowsAuth}
                        onChange={e => setUserForm({ ...userForm, isWindowsAuth: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Windows Authentication</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={handleSaveUser} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button onClick={() => setShowUserModal(false)} className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
          {showExpirationCalendar && createPortal(
            <div
              style={{
                position: 'absolute',
                top:  expirationCalendarPos.top,
                left: expirationCalendarPos.left,
                zIndex: 9999,
              }}
            >
              <CalendarPopup
                onDateSelect={(date) => {
                  setUserForm(prev => ({ ...prev, expiration: date }));
                  setShowExpirationCalendar(false);
                }}
                onClose={() => setShowExpirationCalendar(false)}
              />
            </div>,
            document.body
          )}
        </>
      )}

      {/* ── Change Password Modal (original structure) ─────────────────── */}
      {showChangePasswordModal && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowChangePasswordModal(false)} />
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                <h2 className="text-gray-800">Change Password</h2>
                <button onClick={() => setShowChangePasswordModal(false)} className="text-gray-600 hover:text-gray-800"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4">Changing password for user: <strong>{selectedUser?.username}</strong></p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Old Password *</label>
                    <div className="relative">
                      <input type={showOldPassword ? 'text' : 'password'} value={passwordForm.oldPassword} onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                        className="w-full px-3 pr-11 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      <button type="button" tabIndex={-1} onMouseDown={e => e.preventDefault()} onClick={() => setShowOldPassword(p => !p)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
                        {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">New Password *</label>
                    <div className="relative">
                      <input type={showNewPassword ? 'text' : 'password'} value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-3 pr-11 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      <button type="button" tabIndex={-1} onMouseDown={e => e.preventDefault()} onClick={() => setShowNewPassword(p => !p)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Confirm New Password *</label>
                    <div className="relative">
                      <input type={showConfirmNewPassword ? 'text' : 'password'} value={passwordForm.confirmNewPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                        className="w-full px-3 pr-11 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      <button type="button" tabIndex={-1} onMouseDown={e => e.preventDefault()} onClick={() => setShowConfirmNewPassword(p => !p)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
                        {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={handleSaveChangePassword} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm flex items-center gap-2">
                    <Key className="w-4 h-4" /> Change Password
                  </button>
                  <button onClick={() => setShowChangePasswordModal(false)} className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Reset Password Modal (original structure) ──────────────────── */}
      {showResetPasswordModal && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowResetPasswordModal(false)} />
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                <h2 className="text-gray-800">Reset Password</h2>
                <button onClick={() => setShowResetPasswordModal(false)} className="text-gray-600 hover:text-gray-800"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4">Resetting password for user: <strong>{selectedUser?.username}</strong></p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">New Password *</label>
                    <div className="relative">
                      <input type={showResetNewPassword ? 'text' : 'password'} value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-3 pr-11 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      <button type="button" tabIndex={-1} onMouseDown={e => e.preventDefault()} onClick={() => setShowResetNewPassword(p => !p)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
                        {showResetNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Confirm New Password *</label>
                    <div className="relative">
                      <input type={showResetConfirmPassword ? 'text' : 'password'} value={passwordForm.confirmNewPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                        className="w-full px-3 pr-11 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      <button type="button" tabIndex={-1} onMouseDown={e => e.preventDefault()} onClick={() => setShowResetConfirmPassword(p => !p)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
                        {showResetConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={handleSaveResetPassword} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm flex items-center gap-2">
                    <Key className="w-4 h-4" /> Reset Password
                  </button>
                  <button onClick={() => setShowResetPasswordModal(false)} className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}



      {/* ── Add User Group Modal (original structure) ──────────────────── */}
      {showUserGroupModal && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowUserGroupModal(false)} />
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                <h2 className="text-gray-800">Add User Group</h2>
                <button onClick={() => setShowUserGroupModal(false)} className="text-gray-600 hover:text-gray-800"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Group Name *</label>
                    <input type="text" value={groupForm.groupName} onChange={e => setGroupForm({ ...groupForm, groupName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Description</label>
                    <input type="text" value={groupForm.description} onChange={e => setGroupForm({ ...groupForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={handleSaveUserGroup} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button onClick={() => setShowUserGroupModal(false)} className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
