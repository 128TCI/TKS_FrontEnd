// ─── services/employeeService.ts ─────────────────────────────────────────────
// Provides employee data fetching utilities:
//  • fetchEmployees() — authorized fetch with fallback to full masterfile
//  • Types: Employee, AuthorizedEmployee, FetchEmployeesResult

import apiClient, { getLoggedInUsername } from './apiClient';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthorizedEmployee {
  empID: number;
  empCode: string;
  lName: string;
  fName: string;
  mName: string;
  suffix: string;
  sssNo: string;
  pagIbigNo: string;
  philHealthNo: string;
  tin: string;
  gsisNo: string;
  active: boolean;
  name: string; // computed: "LName, FName"
}

export interface Employee {
  empID: number;
  empCode: string;
  empStatCode: string;
  courtesy: string;
  lName: string;
  fName: string;
  mName: string;
  nickName: string;
  hAddress: string;
  pAddress: string;
  city: string;
  province: string;
  postalCode: string;
  civilStatus: string;
  citizenship: string;
  religion: string;
  sex: string;
  email: string;
  weight: string;
  height: string;
  mobilePhone: string;
  homePhone: string;
  presentPhone: string;
  dateHired: string | null;
  dateRegularized: string | null;
  dateResigned: string | null;
  dateSuspended: string | null;
  probeStart: string | null;
  probeEnd: string | null;
  suspend: boolean;
  separated: boolean;
  birthDate: string | null;
  age: number;
  birthPlace: string;
  unionMember: boolean;
  agency: boolean;
  divCode: string;
  depCode: string;
  secCode: string;
  grpCode: string;
  braCode: string;
  subAcctCode: string;
  desCode: string;
  shiftCode: string;
  superior: string;
  grdCode: string;
  clsCode: string;
  payCode: string;
  locId: number;
  rateCode: string;
  taxID: number;
  taxCode: string;
  bankAccount: string;
  bankCode: string;
  sssNo: string;
  pHilHealthNo: string;
  pagIbigNo: string;
  tin: string;
  pagibigCode: string;
  photo: string;
  photoBytes?: string;
  catCode: string;
  unitCode: string;
  contractual: boolean;
  areaCode: string;
  locCode: string;
  gsisNo: string;
  suffix: string;
  onlineAppCode: string;
}

export interface FetchEmployeesResult {
  employees: Employee[];
  authorizedEmployees: AuthorizedEmployee[];
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function toAuthorizedEmployee(e: any): AuthorizedEmployee {
  return {
    empID:        e.empID,
    empCode:      e.empCode      ?? '',
    lName:        e.lName        ?? '',
    fName:        e.fName        ?? '',
    mName:        e.mName        ?? '',
    suffix:       e.suffix       ?? '',
    sssNo:        e.sssNo        ?? '',
    pagIbigNo:    e.pagIbigNo    ?? '',
    philHealthNo: e.pHilHealthNo ?? e.philHealthNo ?? '',
    tin:          e.tin          ?? '',
    gsisNo:       e.gsisNo       ?? '',
    active:       e.active       ?? true,
    name:         `${e.lName ?? ''}, ${e.fName ?? ''}`.trim(),
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetches employees using the authorized endpoint when a valid user session
 * exists; falls back to the full masterfile otherwise.
 *
 * @throws Re-throws the original Axios error so the caller can handle / display it.
 */
export async function fetchEmployees(userName?: string): Promise<FetchEmployeesResult> {
  const user = userName ?? getLoggedInUsername();

  if (user && user !== 'Guest') {
    const { data } = await apiClient.get(
      `/Maintenance/EmployeeMasterFile/GetAuthorized?userName=${encodeURIComponent(user)}`
    );
    const employees: Employee[] = data ?? [];
    const authorizedEmployees: AuthorizedEmployee[] = employees.map(toAuthorizedEmployee);
    return { employees, authorizedEmployees };
  }

  const { data } = await apiClient.get('/Maintenance/EmployeeMasterFile');
  const employees: Employee[] = data ?? [];
  const authorizedEmployees: AuthorizedEmployee[] = employees.map(toAuthorizedEmployee);
  return { employees, authorizedEmployees };
}