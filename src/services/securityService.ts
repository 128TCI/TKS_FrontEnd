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
} from '../types/security';

const BASE = '/Security';
//get token
const authToken = localStorage.getItem("authToken");

export const securityService = {

  // ── Users ──────────────────────────────────────────────────────────────────

  async getUsers(page = 1, pageSize = 10): Promise<PagedResult<User>> {
    const res = await apiClient.get('/User', { 
      params: { page, pageSize },
      headers: { Authorization: `Bearer ${authToken}` } 
    });
    
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
    }, { 
      headers: { Authorization: `Bearer ${authToken}` } });
    console.log('API response:', res); 
    return res.data;
  },

  async updateUser(username: string, data: UpdateUserRequest): Promise<User> {
    const res = await apiClient.put(`${BASE}/SecurityManager/users/${username}`, {
      Expiration:            data.expiration || null,
      MachineName:           data.machineName,
      Suspended:             data.suspended,
      IsWindowsAuthenticate: data.isWindowsAuthenticate,
      WindowsLoginName:      data.windowsLoginName,
    }, { 
      headers: { Authorization: `Bearer ${authToken}` } });
    console.log('API response:', res);
    return res.data;
  },

  async changePassword(username: string, data: ChangePasswordRequest): Promise<ApiResult> {
    const res = await apiClient.put(
      `${BASE}/SecurityManager/users/${username}/change-password`,
      { OldPassword: data.oldPassword, NewPassword: data.newPassword },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('API response:', res); 
    return res.data;
  },

  async resetPassword(username: string, p0: { newPassword: string; }): Promise<ApiResult> {
    const res = await apiClient.put(
      `${BASE}/SecurityManager/users/${username}/reset-password`, {
        NewPassword: p0.newPassword,
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('API response:', res); 
    return res.data;
  },

  async removeUser(username: string): Promise<ApiResult> {
    const res = await apiClient.delete(`${BASE}/SecurityManager/users/${username}`, {
      headers: { Authorization: `Bearer ${authToken}` } });
    console.log('API response:', res); 
    return res.data;
  },

  // ── User Groups ────────────────────────────────────────────────────────────

  async getUserGroups(): Promise<UserGroup[]> {
    const res = await apiClient.get(`${BASE}/SecurityManager/groups`, { 
      headers: { Authorization: `Bearer ${authToken}` } });
    console.log('API response:', res); 
    return res.data;
  },

  async createUserGroup(groupName: string, description?: string): Promise<UserGroup> {
    const res = await apiClient.post(`${BASE}/SecurityManager/groups`, {
      GroupName: groupName, Description: description,
    }, { headers: { Authorization: `Bearer ${authToken}` } });
    console.log('API response:', res); 
    return res.data;
  },

  async removeUserGroup(groupName: string): Promise<ApiResult> {
    const res = await apiClient.delete(`${BASE}/SecurityManager/groups/${groupName}`, {
      headers: { Authorization: `Bearer ${authToken}` } });
    console.log('API response:', res); 
    return res.data;
  },

  // ── Group Members ──────────────────────────────────────────────────────────

  async getMembers(groupName: string): Promise<string[]> {
    const res = await apiClient.get(`${BASE}/GroupMember/members/${groupName}`,
      { headers: { Authorization: `Bearer ${authToken}` } });
      console.log('API response:', res); 
    return res.data;
  },

  async getNonMembers(groupName: string): Promise<string[]> {

    const res = await apiClient.get(`${BASE}/GroupMember/non-members/${groupName}`,
      { headers: { Authorization: `Bearer ${authToken}` } });
    console.log('API response:', res);  
    return res.data;
  },

  async updateMembers(groupName: string, usernames: string[]): Promise<ApiResult> {
    const res = await apiClient.post(`${BASE}/GroupMember/update`, 
      { GroupName: groupName, Usernames: usernames,}, 
      { headers: { Authorization: `Bearer ${authToken}` } });
    console.log('API response:', res); 
    return res.data;
  },

  // ── Security Control — Access Types (from tk_FormAccessType) ───────────────

  /**
   * Returns all access type definitions from tk_FormAccessType.
   * Call once on mount to build dynamic column headers.
   */
  async getFormAccessTypes(): Promise<FormAccessType[]> {
    const res = await apiClient.get(`${BASE}/SecurityControl/access-types`, { 
      headers: { Authorization: `Bearer ${authToken}` } });
      console.log('API response:', res); 
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
    const res = await apiClient.get(`${BASE}/SecurityControl/forms`,{ 
      headers: { Authorization: `Bearer ${authToken}` } });
    console.log('API response:', res); 
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
    const res = await apiClient.get(`${BASE}/SecurityControl/group-access/${groupName}`, {
      headers: { Authorization: `Bearer ${authToken}` }});
    console.log('API response:', res);
    return res.data.map((a: any) => ({
      id:          a.id,
      formName:    a.formName,
      accessFlags: a.accessFlags ?? {},   // already { CanView: bool, CanAdd: bool, ... }
    }));
  },

  async saveGroupAccess(data: SaveGroupAccessRequest): Promise<ApiResult> {
    const res = await apiClient.post(`${BASE}/SecurityControl/group-access`, {
      GroupName:   data.groupName,
      FormName:    data.formName,
      AccessFlags: data.accessFlags,},
    { headers: { Authorization: `Bearer ${authToken}` } });
    console.log('API response:', res); 
    return res.data;
  },

  // ── Security Control — TKS Group ───────────────────────────────────────────

  async getTksGroups(): Promise<TKSGroup[]> {
    const res = await apiClient.get('/Fs/Process/TimeKeepGroupSetUp', {
      headers: { Authorization: `Bearer ${authToken}` } } );
    console.log('API response:', res);   
    return res.data.map((item: any) => ({
      id:          item.ID   || item.id,
      code:        item.groupCode        || item.code,
      description: item.groupDescription || item.description,
    }));
  },

  async getTksGroupAccess(groupName: string): Promise<TKSGroupAccess[]> {
    const res = await apiClient.get(`${BASE}/SecurityControl/tks-group-access/${groupName}`, {
      headers: { Authorization: `Bearer ${authToken}` }});
    console.log('API response:', res);
    return res.data.map((a: any) => ({
      id:           a.id,
      tksGroupName: a.tksGroupName,
      description:  a.description ?? '',
      userGroup:    a.groupName,
    }));
  },

  async saveTksGroupAccess(tksGroupName: string, groupName: string): Promise<ApiResult> {
    const res = await apiClient.post(`${BASE}/SecurityControl/tks-group-access`, {
      TksGroupName: tksGroupName, GroupName: groupName,}, { 
      headers: { Authorization: `Bearer ${authToken}` } });
    console.log('API response:', res);
    return res.data;
  },

  async removeTksGroupAccess(id: number): Promise<ApiResult> {
    const res = await apiClient.delete(`${BASE}/SecurityControl/tks-group-access/${id}`, {
      headers: { Authorization: `Bearer ${authToken}` } });
    console.log('API response:', res);
    return res.data;
  },
};
