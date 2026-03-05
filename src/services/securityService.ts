// services/securityService.ts

import apiClient from './apiClient';
import type {
  User,
  UserGroup,
  Form,
  FormAccessType,
  FormAccess,
  TKSGroup,
  TKSGroupAccess,
  PagedResult,
  ApiResult,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  SaveGroupAccessRequest,
} from '../components/Types/security';

const BASE = '/Security';

export const securityService = {

  // ── Users ──────────────────────────────────────────────────────────────────

  async getUsers(page = 1, pageSize = 10): Promise<PagedResult<User>> {
    const res = await apiClient.get('/User', { params: { page, pageSize } });

    // API returns a flat array or paged object
    const raw: any[] = Array.isArray(res.data) ? res.data : (res.data.data ?? []);
    const total: number = res.data.totalCount ?? raw.length;

    const data: User[] = raw.map((u: any) => ({
      id:               u.userID            ?? u.id               ?? 0,
      username:         u.userName          ?? u.username         ?? '',
      expiration:       (() => {
        const raw = u.expirationDate ?? u.expiration ?? '';
        if (!raw) return '';
        const d = new Date(raw);
        if (isNaN(d.getTime())) return raw;
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${mm}/${dd}/${yyyy}`;
      })(),
      logIn:            u.isLoggedIn        ?? u.logIn            ?? false,
      machineName:      u.machineName                             ?? '',
      suspended:        u.isSuspended       ?? u.suspended        ?? false,
      isWindowsAuth:    u.isWindowsAuthenticate                   ?? false,
      windowsLoginName: u.windowsLoginName                        ?? '',
    }));

    // Client-side pagination when API returns all records at once
    const start = (page - 1) * pageSize;
    const paged = total === raw.length
      ? data.slice(start, start + pageSize)
      : data;

    return { data: paged, totalCount: total, page, pageSize };
  },

  async createUser(data: CreateUserRequest): Promise<User> {
    const res = await apiClient.post(`${BASE}/SecurityManager/users`, {
      Username:              data.username,
      Password:              data.password,
      Expiration:            data.expiration || null,
      MachineName:           data.machineName,
      Suspended:             data.suspended,
      IsWindowsAuthenticate: data.isWindowsAuthenticate,
      WindowsLoginName:      data.windowsLoginName,
    });
    return res.data;
  },

  async updateUser(username: string, data: UpdateUserRequest): Promise<User> {
    const res = await apiClient.put(`${BASE}/SecurityManager/users/${username}`, {
      UserName:              data.username,
      Expiration:            data.expiration || null,
      MachineName:           data.machineName,
      Suspended:             data.suspended,
      IsWindowsAuthenticate: data.isWindowsAuthenticate,
      WindowsLoginName:      data.windowsLoginName,
    });
    return res.data;
  },

  async changePassword(username: string, data: ChangePasswordRequest): Promise<ApiResult> {
    const res = await apiClient.put(
      `${BASE}/SecurityManager/users/${username}/change-password`,
      { OldPassword: data.oldPassword, NewPassword: data.newPassword }
    );
    return res.data;
  },

  async resetPassword(username: string, newPassword: { newPassword: string; }): Promise<ApiResult> {
    const res = await apiClient.put(
      `${BASE}/SecurityManager/users/${username}/reset-password`, newPassword
    );
    return res.data;
  },

  async removeUser(username: string): Promise<ApiResult> {
    const res = await apiClient.delete(`${BASE}/SecurityManager/users/${username}`);
    return res.data;
  },

  // ── User Groups ────────────────────────────────────────────────────────────

  async getUserGroups(): Promise<UserGroup[]> {
    const res = await apiClient.get(`${BASE}/SecurityManager/groups`);
    return res.data;
  },

  async createUserGroup(groupName: string, description?: string): Promise<UserGroup> {
    const res = await apiClient.post(`${BASE}/SecurityManager/groups`, {
      GroupName: groupName, Description: description,
    });
    return res.data;
  },

  async removeUserGroup(groupName: string): Promise<ApiResult> {
    const res = await apiClient.delete(`${BASE}/SecurityManager/groups/${groupName}`);
    return res.data;
  },

  // ── Group Members ──────────────────────────────────────────────────────────

  async getMembers(groupName: string): Promise<string[]> {
    const res = await apiClient.get(`${BASE}/GroupMember/members/${groupName}`);
    return res.data;
  },

  async getNonMembers(groupName: string): Promise<string[]> {
    const res = await apiClient.get(`${BASE}/GroupMember/non-members/${groupName}`);
    return res.data;
  },

  async updateMembers(groupName: string, usernames: string[]): Promise<ApiResult> {
    const res = await apiClient.post(`${BASE}/GroupMember/update`, {
      GroupName: groupName, Usernames: usernames,
    });
    return res.data;
  },

  async addMembers(groupName: string, usernames: string[]): Promise<ApiResult> {
    const res = await apiClient.post(`${BASE}/GroupMember/add`, {
      GroupName: groupName, Usernames: usernames,
    });
    return res.data;
  },

  async removeMembers(groupName: string, usernames: string[]): Promise<ApiResult> {
    const res = await apiClient.post(`${BASE}/GroupMember/delete`, {
      GroupName: groupName, Usernames: usernames,
    });
    return res.data;
  },




  // ── Security Control — Access Types (from tk_FormAccessType) ───────────────

  /**
   * Returns all access type definitions from tk_FormAccessType.
   * Call once on mount to build dynamic column headers.
   */
  async getFormAccessTypes(): Promise<FormAccessType[]> {
    const res = await apiClient.get(`${BASE}/SecurityControl/access-types`);
    return res.data.map((a: any) => ({
      id:             a.id,
      accessTypeName: a.accessTypeName,
      description:    a.description ?? null,
      sortOrder:      a.sortOrder ?? 0,
    }));
  },

  // ── Security Control — Forms (from tk_Forms) ───────────────────────────────

  /** Returns all form definitions from tk_Forms. */
  async getForms(): Promise<Form[]> {
    const res = await apiClient.get(`${BASE}/SecurityControl/forms`);
    return res.data.map((f: any) => ({
      id:              f.id,
      formName:        f.formName,
      formDescription: f.formDesc ?? f.formDescription ?? f.description ?? null,
    }));
  },

  // ── Security Control — Group Access ────────────────────────────────────────

  /**
   * Returns group access rows for a given group.
   * Each row's accessFlags dict is keyed by AccessTypeName → boolean.
   */
  async getGroupAccess(groupName: string): Promise<FormAccess[]> {
    const res = await apiClient.get(`${BASE}/SecurityControl/group-access/${groupName}`);
    return res.data.map((a: any) => ({
      id:          a.id,
      formName:    a.formName,
      formDescription: a.formDescription ?? a.formDesc ?? '',
      accessFlags: a.accessFlags ?? {},   // already { CanView: bool, CanAdd: bool, ... }
    }));
  },

  async saveGroupAccess(data: SaveGroupAccessRequest): Promise<ApiResult> {
    const res = await apiClient.post(`${BASE}/SecurityControl/group-access`, {
      GroupName:   data.groupName,
      FormName:    data.formName,
      AccessFlags: data.accessFlags,      // { CanView: bool, CanAdd: bool, ... }
    });
    return res.data;
  },

  // ── Security Control — TKS Group ───────────────────────────────────────────

  // All TKS groups (for the TKS Group table)
  async getTksGroups(): Promise<TKSGroup[]> {
    const res = await apiClient.get('/Fs/Process/TimeKeepGroupSetUp');
    return res.data.map((item: any, index: number) => ({
      id:          item.ID || item.id || (index + 1),
      code:        item.groupCode   ?? item.code ?? '',
      description: item.groupDescription ?? item.description ?? '',
    }));
  },

  async getAvailableTksGroups(groupName: string): Promise<TKSGroup[]> {
    const res = await apiClient.get(`${BASE}/SecurityControl/tks-groups/${groupName}`);
    console.log('API response:', res);
    return res.data.map((item: any, index: number) => ({
      id:          item.ID || item.id || (index + 1),
      code:        item.tksGroupName ?? item.groupCode ?? item.code ?? '',
      description: item.description  ?? item.groupDescription       ?? '',
    }));
  },

  async getTksGroupAccess(groupName: string): Promise<TKSGroupAccess[]> {
    const res = await apiClient.get(`${BASE}/SecurityControl/tks-group-access/${groupName}`);
    console.log('API response:', res);
    return res.data.map((a: any) => ({
      id:           a.id,
      tksGroupCode: a.tksGroupCode ?? '',
      tksGroupName: a.tksGroupName ?? '',
      description:  a.description  ?? '',
      userGroup:    a.groupName    ?? '',
    }));
  },

  async saveTksGroupAccess(tksGroupName: string, tksGroupCodes: string[], createdBy?: string): Promise<ApiResult> {
    const res = await apiClient.post(`${BASE}/SecurityControl/tks-group-access`, {
      TksGroupName: tksGroupName, TksGroupCodes: tksGroupCodes, CreatedBy: createdBy ?? null,
    });
    console.log('API response: ', res);
    return res.data;
  },

  // Body: { groupName, tksGroupCodes: ["1","10"] }
  async removeTksGroupAccess(tksGroupName: string, tksGroupCodes: string[]): Promise<ApiResult> {
    const res = await apiClient.delete(`${BASE}/SecurityControl/tks-group-access`, {
       data: { tksGroupName, tksGroupCodes }
    });
    console.log('API response: ', res);
    return { success: res.data?.success ?? true, message: res.data?.message ?? 'Removed.' };
  },

  /*

  // Remove multiple rows from tk_UserGroupTKSGroupAccess by IDs (bulk)
  async removeTksGroupAccessBulk(ids: number[]): Promise<ApiResult> {
    const res = await apiClient.delete(`${BASE}/SecurityControl/tks-group-access/bulk`, {
      data: ids,
    });
    return { success: res.data?.success ?? true, message: res.data?.message ?? 'Removed.' };
  },
  */

};