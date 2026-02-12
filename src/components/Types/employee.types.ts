// types/employee.types.ts
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
  catCode: string;
  unitCode: string;
  contractual: boolean;
  areaCode: string;
  locCode: string;
  gsisNo: string;
  suffix: string;
  onlineAppCode: string;
}

export interface Branch {
  branchId: string;
  code: string;
  description: string;
  branchManager: string;
  branchManagerCode: string;
  deviceName: string;
}

export interface Division {
  id: string;
  code: string;
  description: string;
  head: string;
  headCode: string;
  deviceName: string;
}

export interface Section {
  id: string;
  code: string;
  description: string;
  head: string;
  headCode: string;
  deviceName: string;
}

export interface Unit {
  id: string;
  code: string;
  description: string;
  head: string;
  position: string;
  deviceName: string;
}

export interface PayHouse {
  id: string;
  code: string;
  description: string;
  head: string;
  headCode: string;
  position: string;
  deviceName: string;
}

export interface Area {
  id: string;
  code: string;
  description: string;
  head: string;
  headCode: string;
  deviceName: string;
}

export interface Location {
  id: string;
  code: string;
  description: string;
  head: string;
  headCode: string;
  acctCode: string;
  createdBy: string;
  createdDate: string;
  editedBy: string;
  editedDate: string;
  deviceName: string;
}

export interface OnlineApproval {
  id: string;
  code: string;
  description: string;
  head: string;
  headCode: string;
  deviceName: string;
  createdBy: string;
  createdDate: string;
  editedBy: string;
  editedDate: string;
}

export interface JobLevel {
  id: string;
  code: string;
  description: string;
}

export interface EmpStatus {
  code: string;
  description: string;
}