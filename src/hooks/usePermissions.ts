import { useMemo } from 'react';
import { decryptData } from '../services/encryptionService';

// Shape of each raw encrypted entry in loginPayload.permissions
interface RawPermissionEntry {
  formName: string;      // encrypted
  accessTypeName: string; // encrypted
  permissionKey: string;  // encrypted (not needed but present)
}

// Internal map: decrypted formName → Set of decrypted accessTypeNames
type PermissionMap = Record<string, Set<string>>;

function buildPermissionMap(): PermissionMap {
  try {
    const raw = localStorage.getItem('loginPayload');
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    const permissions: RawPermissionEntry[] = parsed.permissions ?? [];

    return permissions.reduce<PermissionMap>((map, entry) => {
      const formName    = decryptData(entry.formName);
      const accessType  = decryptData(entry.accessTypeName);

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
  // useMemo so the 1116-entry decryption loop runs exactly once per session
  const permissionMap = useMemo(() => buildPermissionMap(), []);

  /**
   * Returns true if the user has the given accessType for the formName.
   * Defaults to checking 'View'.
   */
  const hasPermission = (formName: string, accessType = 'View'): boolean =>
    permissionMap[formName]?.has(accessType) ?? false;

  /**
   * Convenience: true if the user has View access for the given formName.
   */
  const canView = (formName: string): boolean => hasPermission(formName, 'View');

  return { hasPermission, canView, permissionMap };
}