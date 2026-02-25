export interface Workshift {
  code: string;
  description: string;
  timeIn: string;
  break1Out: string;
  break1In: string;
  break2Out: string;
  break2In: string;
  break3Out: string;
  break3In: string;
  timeOut: string;
  halfOfShift: string;
  midnightShift: boolean;
  shift12AMOnwards: boolean;
  flexibleWorkshift: boolean;
  flexibleBaseOnWorkshift: boolean;
  flexibleBreak: boolean;
  maxAllowableBreak2: string;
  inExcessAllowableBreak2ForFlexiBreak: boolean;
  computeAsTardiness: boolean;
  computeAsUndertime: boolean;
  standardHours: string;
  hoursForAbsent: string;
  hoursForNoLogin: string;
  hoursForNoLogout: string;
  hoursForNoBreak2Out: string;
  hoursForNoBreak2In: string;
  paidUnworkedHoliday: string;
  minHoursToCompleteShift: string;
  completeShiftWithUndertime: boolean;
  loginTimeConsiderAbsent: string;
  allowFlexibleTimeIn: string;
  brkRoundUpNearest: string;
  hoursForOTCode: string;
  requiredHours: string;
  requiredHoursPayIfPaidLeave: string;
  secondShiftForRawData: boolean;
  deductBreak1Overbreak: boolean;
  flexibleBreak1: boolean;
  deductBreak3Overbreak: boolean;
  flexibleBreak3: boolean;
  combineBreak1And3: boolean;
  computeAsTardinessCombine: boolean;
  computeAsUndertimeCombine: boolean;
  tardiness: string;
  undertime: string;
}

export interface BracketingItem {
  code: string;
  description: string;
  flag: string;
}

export const DEFAULT_WORKSHIFT: Workshift = {
  code: '',
  description: '',
  timeIn: '03:00 PM',
  break1Out: '',
  break1In: '',
  break2Out: '',
  break2In: '',
  break3Out: '',
  break3In: '',
  timeOut: '12:00 AM',
  halfOfShift: '',
  midnightShift: false,
  shift12AMOnwards: false,
  flexibleWorkshift: false,
  flexibleBaseOnWorkshift: false,
  flexibleBreak: false,
  maxAllowableBreak2: '',
  inExcessAllowableBreak2ForFlexiBreak: false,
  computeAsTardiness: false,
  computeAsUndertime: false,
  standardHours: '8.00',
  hoursForAbsent: '8.00',
  hoursForNoLogin: '4.00',
  hoursForNoLogout: '4.00',
  hoursForNoBreak2Out: '',
  hoursForNoBreak2In: '',
  paidUnworkedHoliday: '8.00',
  minHoursToCompleteShift: '0.00',
  completeShiftWithUndertime: false,
  loginTimeConsiderAbsent: '',
  allowFlexibleTimeIn: '',
  brkRoundUpNearest: '',
  hoursForOTCode: '',
  requiredHours: '',
  requiredHoursPayIfPaidLeave: '0.00',
  secondShiftForRawData: false,
  deductBreak1Overbreak: false,
  flexibleBreak1: false,
  deductBreak3Overbreak: false,
  flexibleBreak3: false,
  combineBreak1And3: false,
  computeAsTardinessCombine: false,
  computeAsUndertimeCombine: false,
  tardiness: '',
  undertime: '',
};