import { useMemo } from 'react';
import { decryptData } from '../services/encryptionService';

// Shape of each raw encrypted entry in loginPayload.permissions
interface RawPermissionEntry {
  formName:       string; // encrypted
  accessTypeName: string; // encrypted
  permissionKey:  string; // encrypted (not needed but present)
}

// Internal map: decrypted formName → Set of decrypted accessTypeNames
type PermissionMap = Record<string, Set<string>>;

// ── Read the logged-in username (decrypted) ───────────────────────────────────
function getDecryptedUsername(): string {
  try {
    const raw = localStorage.getItem('userData');
    if (!raw) return '';
    const parsed = JSON.parse(raw);
    const encrypted = parsed?.username ?? parsed?.userName ?? parsed?.name ?? '';
    return decryptData(encrypted) || encrypted; // fallback: use as-is if already plain
  } catch {
    return '';
  }
}

// ── Build permission map from loginPayload ────────────────────────────────────
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

// ── Hook ──────────────────────────────────────────────────────────────────────
export function usePermissions() {
  // Run the decryption loop exactly once per session
  const permissionMap = useMemo(() => buildPermissionMap(), []);

  // If the logged-in user is '128TCI', bypass all permission checks
  const isSuperAdmin = useMemo(
    () => getDecryptedUsername().toUpperCase() === '128TCI',
    []
  );

  /**
   * Returns true if the user has the given accessType for the formName.
   * Always returns true for the '128TCI' super-admin account.
   * Defaults to checking 'View'.
   */
  const hasPermission = (formName: string, accessType = 'View'): boolean => {
    if (isSuperAdmin) return true;
    return permissionMap[formName]?.has(accessType) ?? false;
  };

  /**
   * Convenience: true if the user has View access for the given formName.
   * Always true for '128TCI'.
   */
  const canView = (formName: string): boolean => hasPermission(formName, 'View');

  return { hasPermission, canView, permissionMap, isSuperAdmin };
}
