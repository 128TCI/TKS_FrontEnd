// types/security.ts

export interface User {
  id: number;
  username: string;
  expiration: string;
  logIn: boolean;
  machineName: string;
  suspended: boolean;
  isWindowsAuth: boolean;
  windowsLoginName: string;
}

export interface UserGroup {
  id: number;
  groupName: string;
  description: string;
}

// ── Access Type tab ───────────────────────────────────────────────────────────

/** One row from tk_FormAccessType — defines a permission column (e.g. "CanView") */
export interface FormAccessType {
  id: number;
  accessTypeName: string;   // e.g. "CanView", "CanAdd" — used as dict key
  description: string | null;
  sortOrder: number;
}

/** One row from tk_Forms */
export interface Form {
  id: number;
  formName: string;
  formDescription: string | null;
}

/**
 * One row in the User Group Access table.
 * accessFlags is keyed by FormAccessType.accessTypeName → boolean value.
 * Example: { "CanView": true, "CanAdd": false, "CanEdit": true }
 */
export interface FormAccess {
  id: number;
  formName: string;
  accessFlags: Record<string, boolean>;
}

// ── TKS Group ─────────────────────────────────────────────────────────────────

export interface TKSGroup {
  id: number;
  code: string;
  description: string;
  isSelected?: boolean;
}

export interface TKSGroupAccess {
  id: number;
  tksGroupCode: string;   // TKSGroupCode from SP
  tksGroupName: string;   // GroupName from SP
  description: string;    // GroupDescription from SP
  userGroup: string;      // the user group (resolved from groupName param)
}

// ── Generic ───────────────────────────────────────────────────────────────────

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ApiResult {
  success: boolean;
  message: string;
}

// ── Access type display helpers ──────────────────────────────────────────────

export const ACCESS_TYPE_LABELS: Record<string, string> = {
  View:             'View',
  Add:              'Add',
  Edit:             'Edit',
  Delete:           'Delete',
  Print:            'Print',
  ImportLogs:       'Import Logs',
  EnableEditPosted: 'EnableEditPosted',
};

export const ACCESS_TYPE_ORDER: Record<string, number> = {
  View:             1,
  Add:              2,
  Edit:             3,
  Delete:           4,
  Print:            5,
  ImportLogs:       6,
  EnableEditPosted: 7,
};

// ── Request payloads ──────────────────────────────────────────────────────────

export interface CreateUserRequest {
  username: string;
  password: string;
  expiration?: string;
  machineName?: string;
  suspended: boolean;
  isWindowsAuthenticate: boolean;
  windowsLoginName?: string;
}

export interface UpdateUserRequest {
  expiration?: string;
  machineName?: string;
  suspended: boolean;
  isWindowsAuthenticate: boolean;
  windowsLoginName?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

/**
 * Save payload for one form/group row.
 * accessFlags mirrors FormAccess.accessFlags — keyed by AccessTypeName.
 */
export interface SaveGroupAccessRequest {
  groupName: string;
  formName: string;
  accessFlags: Record<string, boolean>;
}
