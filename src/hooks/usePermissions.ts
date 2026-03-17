import { useMemo } from 'react';
import { decryptData } from '../services/encryptionService';

interface RawPermissionEntry {
  formName: string;
  accessTypeName: string;
  permissionKey: string;
}

type PermissionMap = Record<string, Set<string>>;

const SUPERUSER_ACCOUNTS = new Set(['128TCI']);

function isSuperUser(): boolean {
  try {
    const raw = localStorage.getItem('userData');
    if (!raw) return false;

    const parsed = JSON.parse(raw);

    // Try every possible key the login response might use
    const encryptedUsername =
      parsed.username ??
      parsed.userName ??
      parsed.UserName ??
      parsed.user_name ??
      '';

    if (!encryptedUsername) return false;

    const decrypted = decryptData(encryptedUsername);

    // Case-sensitive match — SUPERUSER_ACCOUNTS must match exactly
    return SUPERUSER_ACCOUNTS.has(decrypted);
  } catch (err) {
    console.error('isSuperUser check failed:', err);
    return false;
  }
}

function buildPermissionMap(): PermissionMap {
  try {
    const raw = localStorage.getItem('loginPayload');
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    const permissions: RawPermissionEntry[] = parsed.permissions ?? [];

    return permissions.reduce<PermissionMap>((map, entry) => {
      const formName   = decryptData(entry.formName);
      const accessType = decryptData(entry.accessTypeName);

      if (!formName || !accessType) return map;
      if (!map[formName]) map[formName] = new Set();
      map[formName].add(accessType);

      return map;
    }, {});
  } catch (err) {
    console.error('usePermissions: failed to build permission map', err);
    return {};
  }
}

export function usePermissions() {
  const superUser     = useMemo(() => isSuperUser(), []);
  const permissionMap = useMemo(() => buildPermissionMap(), []);

  const hasPermission = (formName: string, accessType = 'View'): boolean => {
    if (superUser) return true;
    return permissionMap[formName]?.has(accessType) ?? false;
  };

  const canView = (formName: string): boolean => hasPermission(formName, 'View');

  return { hasPermission, canView, permissionMap, isSuperUser: superUser };
}