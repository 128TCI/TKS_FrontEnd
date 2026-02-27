import { useState, useEffect, use } from "react";
import {
  Search,
  X,
  Calendar,
  Building2,
  Users,
  Clock,
  CheckSquare,
  Check,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Save,
  Shield,
  FileText,
  Settings,
  Layers,
} from "lucide-react";
import { DatePicker } from "../../DateSetup/DatePicker";
import { OvertimeRatesTabContent } from "../../OvertimeRatesTabContent";
import { OtherPoliciesTabContent } from "../../OtherPoliciesTabContent";
import { Footer } from "../../Footer/Footer";
import apiClient from "../../../services/apiClient";
import { useTablePagination } from "../../../hooks/useTablePagination";

import Swal from "sweetalert2";

interface GroupItem {
  id: number;
  tksGroupCode: string;
  description: string;
  payrollGroup: string;
  cutOffDateFrom: string;
  cutOffDateTo: string;
  cutOffDateMonth: string;
  cutOffDatePeriod: string;
  integrationPayroll: string | null;
  integrationHRIS: string | null;
  preparedBy: string | null;
  preparedByPosition: string | null;
  checkedBy: string | null;
  checkedByPosition: string | null;
  notedBy: string | null;
  notedByPosition: string | null;
  approvedBy: string | null;
  approvedByPosition: string | null;
  terminalID: string | null; //
  autoPairLogsDateFrom: string;
  autoPairLogsDateTo: string;
}

interface PayrollLocationItem {
  id: number;
  locationCode: string;
  locationName: string;
}

interface OverTimeRatesItem {
  id: number;
  groupCode: string;
  regDayOT?: string;
  restDayOT?: string;
  legalHolidayOT?: string;
  specHolidayOT?: string;
  minHoursToComputeOT?: number;
  roundOfftHourMin?: string;
  offsetLate?: boolean;
  useOTAuthorization?: boolean;
  holidayPayLegal?: boolean;
  holidayPaySpecial?: boolean;
  noPayIfAbsentBeforeHoliday?: boolean;
  noPayIfAbsentAfterHoliday?: boolean;
  considerTardinessDayBeforeHoliday?: boolean;
  considerUndertimeDayBeforeHoliday?: boolean;
  computeUnprodHourIfInc?: boolean;
  computeUnprodHourIfIncLegal?: boolean;
  computeUnprodHourIfIncSpecial?: boolean;
  computeUnprodHourIfLeave?: boolean;
  minHoursToPriorToHoliday?: number;
  computeBasedDateIn?: boolean;
  holidayWithWorkShift?: boolean;
  deductMealBreakOTComputation?: boolean;
  compHolidayWithPaidLeave?: boolean;
  compUnprodWithPaidLeave?: boolean;
  compHolidayWithPaidLeaveMinHr?: number;
  compUnprodWithPaidLeaveMinHR?: number;
  useOTPremiumBreakdown?: boolean;
  useDayType2?: boolean;
  minHoursOTBreak?: number;
  hoursOTBreakDeduction?: number;
  spRDDay?: string;
  spRDDayOT?: string;
  computeBrk2OI?: boolean;
  useDOLEOT?: boolean;
  doubleLegalHolidayOT?: string;
  specialHoliday2?: string;
  birthDayPayOT?: string;
  compHolPayMonth?: boolean;
  nonWrkHolidayOT?: string;
  minimumNoOfHrsRequiredToCompHol?: string;
  compHolPayIfWorkBeforeHolidayRestDay?: boolean;
  compHolPayIfWorkBeforeHolidaySpecialHoliday?: boolean;
  compHolPayIfWorkBeforeHolidayLegalHoliday?: boolean;
  minHrsToCompOTRegDay?: string;
  minHrsToCompOTRestDay?: string;
  minHrsToCompOTLegal?: string;
  minHrsToCompOTSpecial?: string;
  minHrsToCompOTSpecial2?: string;
  minHrsToCompOTDoubleLegal?: string;
  minHrsToCompOTNWH?: string;
  regDayOTAdj?: string;
  restDayOTAdj?: string;
  legalHolidayOTAdj?: string;
  specHolidayOTAdj?: string;
  doubleLegalHolidayOTAdj?: string;
  specialHoliday2Adj?: string;
  nonWrkHolidayOTAdj?: string;
  compFirstRestdayHoliday?: boolean;
  otCutOffFlag?: boolean;
  otCutOffOTCode?: string;
  otCutOffHours?: string;
  enable24HrOTFlag?: boolean;
  roundOffNDBasicHourMin?: string;
  includeUnWorkHolInRegDay?: boolean;
  sundayWrkOTIfWrkSaturday?: boolean;
  otCode2ShiftsInADay?: string;
}

interface LoginPolicyItem {
  id: number;
  groupCode: string;
  gracePeriod?: number;
  gracePeriodIncTard?: boolean;
  dedExcessGPInAMonth?: boolean;
  maxGPInMonth?: number;
  empLogsConfig?: string;
  nightDiffStartTime?: string;
  nightDiffEndTime?: string;
  otInandOTOut?: boolean;
  dedForAbsent?: string;
  dedForNoLogin?: string;
  dedForNoLogout?: string;
  deductMealBreakinNDComput?: boolean;
  incRestdayinNDComput?: boolean;
  incHolidayinNDComput?: boolean;
  restdayNDComputBasedOnDateIn?: boolean;
  holidayNDComputbasedOnDateIn?: boolean;
  tardinessMaxHours?: number;
  undertimeMaxHours?: number;
  undertimeHoursFromTardy?: number;
  deductOverbreak?: boolean;
  gracePerSemiAnnualFlag?: boolean;
  graceSemiNoofHours?: number;
  firstHalfFrom?: string;
  firstHalfTo?: string;
  secondHalfFrom?: string;
  secondHalfTo?: string;
  dedForNoBrk2out?: string;
  dedForNoBrk2In?: string;
  useTardinessBracketNDD?: boolean;
  computeShrtBrkTardy?: boolean;
  maxTimePerMonth?: number;
  shrtBrkGracePeriod?: number;
  incldBrk2?: boolean;
  dedEvnWGrace?: boolean;
  calamityWFlood?: number;
  hrsCompleteWeek?: number;
  startWkToComplete?: string;
  compAsPerWeek?: string;
  otCodePerWeek?: string;
  combineTardiOfTimeInBrk2?: boolean;
  compTardinessForNoLogout?: boolean;
  twoShiftsInADay?: boolean;
  twoShiftsInADayInterval?: number;
  numberAllowGracePrdInAMonth?: number;
  maxDaysPerWeekSatWrk?: number;
  saturdayPdRegHrsFlag?: boolean;
  excludeAllowGracePrdFlag?: boolean;
  allowableGracePrdInAMonthBasedActualMonthFlag?: boolean;
  excludeTardywGracePrdInCountAllowableGracePrdInAMonthFlag?: boolean;
  numberAllowTardyExcessGracePrd?: number;
  supGroupCode?: string;
}

interface OTBreakItem {
  id: number;
  regDay: boolean;
  restDay: boolean;
  legalHoliday: boolean;
  specialHoliday: boolean;
  legalHolidayRest: boolean;
  specialHolidayRest: boolean;
  groupCode: string;
  doubleHoliday: boolean;
  doubleHolidayRest: boolean;
  specialHoliday2: boolean;
  specialHoliday2Rest: boolean;
  nonWorkingHoliday: boolean;
  nonWorkingHolidayRest: boolean;
}

interface OvertimeFileSetupItem {
  oTFileSetupID: number;
  oTFileSetupCode: string;
  earnCode: string;
  rateOne: number;
  description: string;
  defaultAmount: number;
}

interface EquivDayItem {
  id: number;
  code: string;
  description: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

interface OTAllowancesItem {
  id: number;
  groupCode: string;
  minimumOTHours: string;
  accumOTHrsToEarnMealAllow: string;
  dayType: string;
  earningCode: string;
  amount: string;
}

interface SystemConfigItem {
  id: number;
  groupCode: string;
  numOfMinBeforeTheShift: string;
  numOfMinToIgnoreMultipleOutInBreak: string;
  numOfMinBeforeMidnightShift: string;
  devicePolicy: string;
  noOfMinToConsiderBrk2In: string;
  useTKSystemConfig: boolean;
}

export function TimeKeepGroupPage() {
  const checkboxClass =
    "w-4 h-4 appearance-none border-2 border-gray-400 rounded bg-white checked:bg-blue-600 checked:border-blue-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";
  const [activeTab, setActiveTab] = useState("definition");
  const [showTksGroupModal, setShowTksGroupModal] = useState(false);
  const [tksGroupSearchTerm, setTksGroupSearchTerm] = useState("");
  const [tksGroupCode, setTksGroupCode] = useState("1");
  const [tksGroupDescription, setTksGroupDescription] = useState("");
  const [showPayrollLocationModal, setShowPayrollLocationModal] =useState(false);
  const [payrollLocationSearchTerm, setPayrollLocationSearchTerm] =useState("");
  const [payrollLocationCode, setPayrollLocationCode] = useState("");
  const [payrollDescription, setPayrollDescription] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [cutOffMonth, setCutOffMonth] = useState("");
  const [cutOffPeriod, setcutOffPeriod] = useState("");
  const [terminalId, setTerminalId] = useState("");

  // Modals for For Absent, For No Login, For No Logout
  const [showForAbsentModal, setShowForAbsentModal] = useState(false);
  const [forAbsentSearchTerm, setForAbsentSearchTerm] = useState("");
  const [showForNoLoginModal, setShowForNoLoginModal] = useState(false);
  const [forNoLoginSearchTerm, setForNoLoginSearchTerm] = useState("");
  const [showForNoLogoutModal, setShowForNoLogoutModal] = useState(false);
  const [forNoLogoutSearchTerm, setForNoLogoutSearchTerm] = useState("");
  const [showForNoBreak2InModal, setShowForNoBreak2InModal] = useState(false);
  const [forNoBreak2InSearchTerm, setForNoBreak2InSearchTerm] = useState("");
  const [showForNoBreak2OutModal, setShowForNoBreak2OutModal] = useState(false);
  const [forNoBreak2OutSearchTerm, setForNoBreak2OutSearchTerm] = useState("");


  // Modals for Supervisory GroupCode and OT Code Per Week
  const [showSupervisoryGroupModal, setShowSupervisoryGroupModal] = useState(false);
  const [supervisoryGroupSearchTerm, setSupervisoryGroupSearchTerm] = useState("");
  const [showOtCodeModal, setShowOtCodeModal] = useState(false);
  const [otCodeSearchTerm, setOtCodeSearchTerm] = useState("");
  const [isEditOTRates, setIsEditOTRates] = useState(false);
  const [isEditOTRatesFor2Shifts, setIsEditOTRatesFor2Shifts] = useState(false);
  const [isEditBirthDayPay, setIsEditBirthDayPay] = useState(false);

  

  // Auto Pairing Logs Cut-Off Dates
  const [autoPairingFrom, setAutoPairingFrom] = useState("09/29/2025");
  const [autoPairingTo, setAutoPairingTo] = useState("09/29/2025");

  // Login Policy StateF
  const [gracePeriodSemiAnnual, setGracePeriodSemiAnnual] = useState(false);
  const [gracePeriodPerDay, setGracePeriodPerDay] = useState("");
  const [gracePeriodIncludeTardiness, setGracePeriodIncludeTardiness] =useState(false);
  const [includeBreak2InGrace, setIncludeBreak2InGrace] = useState(false);
  const [deductibleEvenWithinGrace, setDeductibleEvenWithinGrace] =useState(false);
  const [gracePeriodPerSemiAnnual, setGracePeriodPerSemiAnnual] = useState("");
  const [firstHalfDateFrom, setFirstHalfDateFrom] = useState("");
  const [firstHalfDateTo, setFirstHalfDateTo] = useState("");
  const [secondHalfDateFrom, setSecondHalfDateFrom] = useState("");
  const [secondHalfDateTo, setSecondHalfDateTo] = useState("");
  const [deductOverBreak, setDeductOverBreak] = useState(true);
  const [gracePeriodCalamity2, setGracePeriodCalamity2] = useState("");
  const [combineTardinessTimeInBreak2, setCombineTardinessTimeInBreak2] = useState(false);
  const [computeTardinessNoLogout, setComputeTardinessNoLogout] = useState(false);

  const [nightDiffStartTime, setNightDiffStartTime] = useState("10:00 PM");
  const [nightDiffEndTime, setNightDiffEndTime] = useState("6:00 AM");
  const [deductMealBreakND, setDeductMealBreakND] = useState(false);
  const [twoShiftsInDay, setTwoShiftsInDay] = useState(true);
  const [hoursIntervalTwoShifts, setHoursIntervalTwoShifts] = useState("2.00");
  const [allowableGracePeriodMonth, setAllowableGracePeriodMonth] = useState("3");
  const [excludeAllowableGraceBracket, setExcludeAllowableGraceBracket] = useState(false);
  const [allowableGraceActualMonth, setAllowableGraceActualMonth] = useState(true);
  const [considerSaturdayPaid, setConsiderSaturdayPaid] = useState(true);
  const [maxDaysPerWeekSaturday, setMaxDaysPerWeekSaturday] = useState("3.00");
  const [allowableTardyExcess, setAllowableTardyExcess] = useState("");
  const [excludeTardinessInGrace, setExcludeTardinessInGrace] = useState(false);
  const [supervisoryGroupCode, setSupervisoryGroupCode] = useState("");
  const [applyOccurancesBreak, setApplyOccurancesBreak] = useState(false);
  const [maxOccurancesNoDeduction, setMaxOccurancesNoDeduction] = useState("12");
  const [gracePeriodOccurance, setGracePeriodOccurance] = useState("");
  const [hoursRequiredPerWeek, setHoursRequiredPerWeek] = useState("");
  const [startOfWeek, setStartOfWeek] = useState("");
  const [computeType, setComputeType] = useState("tardiness");
  const [otCodePerWeek, setOtCodePerWeek] = useState("");

  const [forAbsent, setForAbsent] = useState("ABSENT");
  const [forNoLogin, setForNoLogin] = useState("NOLOGIN");
  const [forNoLogout, setForNoLogout] = useState("NOLOGOUT");
  const [forNoBreak2Out, setForNoBreak2Out] = useState("");
  const [forNoBreak2In, setForNoBreak2In] = useState("");

  // Overtime Rates State
  const [regularDayOT, setRegularDayOT] = useState("");
  const [restDayOT, setRestDayOT] = useState("");
  const [legalHolidayOT, setLegalHolidayOT] = useState("");
  const [specialHolidayOT, setSpecialHolidayOT] = useState("");
  const [doubleLegalHolidayOT, setDoubleLegalHolidayOT] = useState("");
  const [specialHolidayOT2, setSpecialHolidayOT2] = useState("")
  const [nonWorkingHolidayOT, setNonWorkingHolidayOT] = useState("");

  // Late Filing
  const [regularDayOTLateFiling, setRegularDayOTLateFiling] = useState("");
  const [restDayOTLateFiling, setRestDayOTLateFiling] = useState("");
  const [legalHolidayOTLateFiling, setLegalHolidayOTLateFiling] = useState("");
  const [specialHolidayOTLateFiling, setSpecialHolidayOTLateFiling] = useState("");
  const [doubleLegalHolidayOTLateFiling, setDoubleLegalHolidayOTLateFiling] = useState("");
  const [specialHoliday2OTLateFiling, setSpecialHoliday2OTLateFiling] = useState("")
  const [nonWorkingHolidayOTLateFiling, setNonWorkingHolidayOTLateFiling] = useState("");

  // 
  const [useOTPremium, setUseOTPremium] = useState(false);
  const [useActualDayType, setUseActualDayType] = useState(false);
  const [holidayWithWorkshift, setHolidayWithWorkshift] = useState(false);
  const [deductMealBreakFromOT, setDeductMealBreakFromOT] = useState(false);
  const [computeOTForBreak2, setComputeOTForBreak2] = useState(false);
  const [enable24HourOT, setEnable24HourOT] = useState(false);
  const [includeUnworkedHolidayInRegular, setIncludeUnworkedHolidayInRegular] = useState(false);
  const [sundayOTIfWorkedSaturday, setSundayOTIfWorkedSaturday] = useState(false);

  // OT Break
  const [otBreakMinHours, setOtBreakMinHours] = useState(0);
  const [oTBreakNoOfHrsDed, setOTBreakNoOfHrsDed] = useState(0);
  const [oTBreakAppliesToRegDay, setOTBreakAppliesToRegDay] = useState(false);
  const [oTBreakAppliesToLegHol, setOTBreakAppliesToLegHol] = useState(false);
  const [oTBreakAppliesToSHol, setOTBreakAppliesToSHol] = useState(false);
  const [oTBreakAppliesToDoubleLegHol, setOTBreakAppliesToDoubleLegHol] = useState(false);
  const [oTBreakAppliesToS2Hol, setOTBreakAppliesToS2Hol] = useState(false);
  const [oTBreakAppliesToNonWorkHol, setOTBreakAppliesToNonWorkHol] = useState(false);
  const [oTBreakAppliesToRestDay, setOTBreakAppliesToRestDay] = useState(false);
  const [oTBreakAppliesToLegHolRest, setOTBreakAppliesToLegHolRest] = useState(false);
  const [oTBreakAppliesToSHolRest, setOTBreakAppliesToSHolRest] = useState(false);
  const [oTBreakAppliesToDoubleLegHolRest, setOTBreakAppliesToDoubleLegHolRest] = useState(false);
  const [oTBreakAppliesToS2HolRest, setOTBreakAppliesToS2HolRest] = useState(false);
  const [oTBreakAppliesToNonWorkRest, setOTBreakAppliesToNonWorkRest] = useState(false);

  // Minimum Hrs To Compute OT
  const [regDayMinHrsToCompOT, setRegDayMinHrsToCompOT] = useState("");
  const [restDayMinHrsToCompOT, setRestDayMinHrsToCompOT] = useState("");
  const [legalHolidayMinHrsToCompOT, setLegalHolidayMinHrsToCompOT] = useState("");
  const [specialHolidayMinHrsToCompOT, setSpecialHolidayMinHrsToCompOT] = useState("");
  const [specialHoliday2MinHrsToCompOT, setSpecialHoliday2MinHrsToCompOT] = useState("");
  const [doubleLegalHolidayMinHrsToCompOT, setDoubleLegalHolidayMinHrsToCompOT] = useState("");
  const [nonWorkingHolidayMinHrsToCompOT, setNonWorkingHolidayMinHrsToCompOT] = useState("");

  const [restDayToBeComputedAsOtherRate, setRestDayToBeComputedAsOtherRate] = useState("");
  const [restDayOtherRate, setRestDayOtherRate] = useState("");
  const [isOverTimeCutOffFlag, setIsOverTimeCutoffFlag] = useState(false);
  const [overTimeCode, setOverTimeCode] = useState(""); 
  const [requiredHours, setRequiredHours] = useState("");
  const [overTimeCodeFor2ShiftsDay, setOverTimeCodeFor2ShiftsDay] = useState("");
  const [oTRoundingToTheNearestHourMin, setOTRoundingToTheNearestHourMin] = useState("");
  const [birthdayPay, setBirthdayPay] = useState("");
  const [nDBasicRoundingToTheNearestHourMin, setNDBasicRoundingToTheNearestHourMin] = useState("");
  const [useOverTimeAuthorization, setUseOverTimeAuthorization] = useState(false);
  const [isSpecialOTCompFlag, setIsSpecialOTCompFlag] = useState(false);
  const [isHolPayLegalFlag, setIsHolPayLegalFlag] = useState(false);
  const [isHolPaySpecialFlag, setIsHolPaySpecialFlag] = useState(false)
  const [compHolPayForMonth, setCompHolPayForMonth] = useState(false);
  const [compHolPayIfWorkBeforeHolidayRestDay, setCompHolPayIfWorkBeforeHolidayRestDay] = useState(false);
  const [compHolPayIfWorkBeforeHolidayLegalHoliday, setCompHolPayIfWorkBeforeHolidayLegalHoliday] = useState(false);
  const [compHolPayIfWorkBeforeHolidaySpecialHoliday, setCompHolPayIfWorkBeforeHolidaySpecialHoliday] = useState(false);
  const [noPayIfAbsentBeforeHoliday, setNoPayIfAbsentBeforeHoliday] = useState(false);
  const [noPayIfAbsentAfterHoliday, setNoPayIfAbsentAfterHoliday] = useState(false);
  const [compHolidayWithPaidLeave, setCompHolidayWithPaidLeave ] = useState(false);
  const [minimumNoOfHrsRequiredToCompHol, setMinimumNoOfHrsRequiredToCompHol] = useState('');
  const [compFirstRestdayHoliday, setCompFirstRestdayHoliday] = useState(false);

  // OT Allowances States
  const [oTAllowanceseID, setOTAllowancesID] = useState(0)
  const [oTAllowancesGroupCode, setOTAllowancesGroupCode] = useState('');
  const [minOTHrs, setMinOTHrs] = useState('');
  const [accumOTHrsToEarnMealAllow, setAccumOTHrsToEarnMealAllow] = useState('');
  const [dayType, setDayType] = useState('')
  const [amount, setAmount] = useState('');
  const [earningCode, setEarningCode] = useState('');

  // Other Policies State
  const [useDefaultRestday, setUseDefaultRestday] = useState(false);
  const [restdayWithWorkshift, setRestdayWithWorkshift] = useState(false);
  const [useTardinessBracket, setUseTardinessBracket] = useState(false);
  const [computeUndertimeToAbsences, setComputeUndertimeToAbsences] =
    useState("3.00");

  // System Configuration State
  const [showSystemConfigModal, setShowSystemConfigModal] = useState(false);
  const [useTimekeepingSystemConfig, setUseTimekeepingSystemConfig] = useState(false);
  const [minBeforeShift, setMinBeforeShift] = useState("0");
  const [minIgnoreMultipleBreak, setMinIgnoreMultipleBreak] = useState("0");
  const [minBeforeMidnightShift, setMinBeforeMidnightShift] = useState("0");
  const [minConsiderBreak2In, setMinConsiderBreak2In] = useState("0");
  const [devicePolicy, setDevicePolicy] = useState("");

  // Global Edit Mode
  const [isEditMode, setIsEditMode] = useState(false);

  // Values Before Editing (for Cancel action)
  const [snapshot, setSnapshot] = useState<Record<string, any>>({});

  // TKSGroup List states
  const [loadingTKSGroup, setLoadingTKSGroup] = useState(false);
  const [tksGroupItems, setTKSGroupItems] = useState<GroupItem[]>([]);
  const [currentGroupPage, setCurrentGroupPage] = useState(1);

  // Payroll Location List 
  const [payrollLocationList, setPayrollLocationList] = useState<PayrollLocationItem[]>([]);

  // Group Login Policy List
  const [groupLoginPolicyItems, setGroupLoginPolicyItems] = useState<LoginPolicyItem[]>([]);

  // Overtime Rates List
  const [overTimeRates, setOverTimeRates] = useState<OverTimeRatesItem[]>([]);

  // Overtime Break List
  const [oTBreakList, setOTBreakList] = useState<OTBreakItem[]>([]);

  //  GroupSetup Overtime Allowancs List 
  const [oTAllowancesList, setOTAllowancesList] = useState<OTAllowancesItem[]>([]);

  // System Config List
  const [systemConfigList, setSystemConfigList] = useState<SystemConfigItem[]>([])

  // Cutoff Group States
  const [cutOffTableSearchTerm, setCutOffTableSearchTerm] = useState("");
  const [selectedCutOffRows, setSelectedCutOffRows] = useState<string[]>([]);

  //Supervisory Group states
  const [supervisoryGroupsList, setSupervisoryGroupsList] = useState<GroupItem[]>([]);
  const [otCodePerWeekList, setOtCodePerWeekList] = useState<OvertimeFileSetupItem[]>([]);
  const [equivDayAbsentList, setEquivDayAbsentList] = useState<EquivDayItem[]>([],);
  const [equivDayNoLoginList, setEquivDayNoLoginList] = useState<EquivDayItem[]>([]);
  const [equivDayNoLogoutList, setEquivDayNoLogoutList] = useState<EquivDayItem[]>([],);
  const [equivDayForNoBreak2InList, setEquivDayForNoBreak2InList] = useState<EquivDayItem[]>([],);
  const [equivDayForNoBreak2OutList, setEquivDayForNoBreak2OutList] = useState<EquivDayItem[]>([],);
 

  // Pagination Numbers of Page
  const itemsPerPage = 10;

  
  const [autoPairingTableSearchTerm, setAutoPairingTableSearchTerm] =useState("");
  const [selectedAutoPairingRows, setSelectedAutoPairingRows] = useState<string[]>([]);
  const [autoPairingCurrentPage, setAutoPairingCurrentPage] = useState(1);
  const autoPairingPageSize = 10;

  const autoPairingFilteredData = tksGroupItems.filter(
    (item: GroupItem) =>
      autoPairingTableSearchTerm === "" ||
      item.tksGroupCode
        .toLowerCase()
        .includes(autoPairingTableSearchTerm.toLowerCase()) ||
      item.description
        .toLowerCase()
        .includes(autoPairingTableSearchTerm.toLowerCase()),
  );

  const autoPairingTotalPages = Math.max(
    1,
    Math.ceil(autoPairingFilteredData.length / autoPairingPageSize),
  );
  const autoPairingStartIndex =
    (autoPairingCurrentPage - 1) * autoPairingPageSize;
  const autoPairingEndIndex = autoPairingStartIndex + autoPairingPageSize;
  const autoPairingPaginatedData = autoPairingFilteredData.slice(
    autoPairingStartIndex,
    autoPairingEndIndex,
  );

  useEffect(() => {
    setAutoPairingCurrentPage(1);
  }, [autoPairingTableSearchTerm]);

  const getAutoPairingPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (autoPairingTotalPages <= 7) {
      for (let i = 1; i <= autoPairingTotalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (autoPairingCurrentPage > 3) pages.push("...");
      for (
        let i = Math.max(2, autoPairingCurrentPage - 1);
        i <= Math.min(autoPairingTotalPages - 1, autoPairingCurrentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (autoPairingCurrentPage < autoPairingTotalPages - 2) pages.push("...");
      pages.push(autoPairingTotalPages);
    }
    return pages;
  };

  const groupList = [
    { code: "2", description: "ASSISTANT MANAGER", appliesAll: false },
    { code: "3", description: "RANK AND FILE", appliesAll: false },
  ];

  const tabs = [
    { id: "definition", label: "TKS Group Definition", icon: Users },
    { id: "login-policy", label: "Login Policy", icon: Shield },
    { id: "overtime", label: "Overtime Rates", icon: Clock },
    { id: "other", label: "Other Policies", icon: FileText },
    { id: "system", label: "SystemConfiguration", icon: Settings },
  ];

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Filter Groups
  const filteredGroups = tksGroupItems.filter(
    (item) =>
      (item.tksGroupCode
        ?.toLowerCase()
        .includes(tksGroupSearchTerm.toLowerCase()) ??
        false) ||
      (item.description
        ?.toLowerCase()
        .includes(tksGroupSearchTerm.toLowerCase()) ??
        false),
  );

  useEffect(() => {
    setCurrentGroupPage(1);
  }, [tksGroupSearchTerm]);

  // Pagination Calculations For Tks Group
  const totalGroupPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const startGroupIndex = (currentGroupPage - 1) * itemsPerPage;
  const endGroupIndex = startGroupIndex + itemsPerPage;
  const paginatedGroups = filteredGroups.slice(startGroupIndex, endGroupIndex);

  const getGroupPageNumbers = () => {
    const pages: (number | string)[] = [];
    for (let i = 1; i <= totalGroupPages; i++) {
      if (
        i === 1 ||
        i === totalGroupPages ||
        (i >= currentGroupPage - 1 &&
          i <= currentGroupPage + 1)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  // CuttOff Group Pagination and Search
  const {
    paginatedData: filteredCutOffData,
    totalPages: cutOffTotalPages,
    currentPage: cutOffCurrentPage,
    setCurrentPage: setCutOffCurrentPage,
    getPageNumbers: getCutOffPageNumbers
  } = useTablePagination(
    tksGroupItems,
    cutOffTableSearchTerm,
    (item, search) =>
      item.tksGroupCode?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search),
    itemsPerPage
  );

  const cutOffStartIndex = (cutOffCurrentPage - 1) * itemsPerPage;
  const cutOffEndIndex = cutOffStartIndex + itemsPerPage;



  useEffect(() => {
    setCutOffCurrentPage(1);
  }, [cutOffTableSearchTerm]);

  // For Supervisory Groups
  const {
    paginatedData: filteredSupervisoryGroups,
    totalPages: totalSupervisoryPages,
    currentPage: currentSupervisoryPage,
    setCurrentPage: setCurrentSupervisoryPage,
  } = useTablePagination(
    supervisoryGroupsList,
    supervisoryGroupSearchTerm,
    (item, search) =>
      item.tksGroupCode?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search),
    itemsPerPage
  );

  const getSupervisoryPageNumbers = (): number[] => {
    const pages: number[] = [];
    for (let i = 1; i <= totalSupervisoryPages; i++) {
      pages.push(i);
    }
    return pages;
  };


  const startSupervisoryIndex = (currentSupervisoryPage - 1) * itemsPerPage;
  const endSupervisoryIndex = startSupervisoryIndex + itemsPerPage;

  // For OT Code Per Week Pagination and Search
  const {
    filteredData: filteredOtCodes,
    paginatedData: paginatedOtCodes,
    totalPages: totalOtCodesPages,
    currentPage: currentOtCodePerWeekPage,
    setCurrentPage: setCurrentOtCodePerWeekPage,
    getPageNumbers: getOtCodesPageNumbers,
  } = useTablePagination(
    otCodePerWeekList,
    otCodeSearchTerm,
    (item, search) =>
      item.oTFileSetupCode.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search) ||
      Object.values(item).some(
        (val) =>
          typeof val === "number" &&
          val.toFixed(2).includes(search)
      ),
    itemsPerPage
  );

  const startOtCodesIndex = (currentOtCodePerWeekPage - 1) * itemsPerPage;
  const endOtCodesIndex = startOtCodesIndex + itemsPerPage;

  // For Payroll Location Pagination and Search
  const {
    filteredData: filteredPayrollLocations,
    paginatedData: paginatedPayrollLocations,
    totalPages: totalPayrollLocationsPages,
    currentPage: currentPayrollLocationsPage,
    setCurrentPage: setCurrentPayrollLocationsPage,
    getPageNumbers: getPayrollLocationsPageNumbers,
  } = useTablePagination(
    payrollLocationList,
    payrollLocationSearchTerm,
    (item, search) =>
      item.locationCode.toLowerCase().includes(search) ||
      item.locationName.toLowerCase().includes(search) ||
      Object.values(item).some(
        (val) =>
          typeof val === "number" &&
          val.toFixed(2).includes(search)
      ),
    itemsPerPage
  );

  const startPayrollLocationsIndex = (currentPayrollLocationsPage - 1) * itemsPerPage;
  const endPayrollLocationsIndex = startPayrollLocationsIndex + itemsPerPage;

  useEffect(() => {
    setCurrentPayrollLocationsPage(1);
  }, [payrollLocationSearchTerm]);

  // For Absent Pagination and Search
  const {
    filteredData: filteredEquivDayAbsent,
    paginatedData: paginatedEquivDayAbsent,
    totalPages: totalEquivDayAbsentPages,
    currentPage: currentEquivDayAbsentPage,
    setCurrentPage: setCurrentEquivDayAbsentPage,
    getPageNumbers: getEquivDayAbsentPageNumbers,
  } = useTablePagination(
    equivDayAbsentList,
    forAbsentSearchTerm,
    (item, search) =>
      item.code.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search) ||
      Object.values(item).some(
        (val) =>
          typeof val === "number" &&
          val.toFixed(2).includes(search)
      ),
    itemsPerPage
  );

  const startEquivDayAbsentIndex = (currentEquivDayAbsentPage - 1) * itemsPerPage;
  const endEquivDayAbsentIndex = startEquivDayAbsentIndex + itemsPerPage;

  // For No Login Pagination and Search
  const {
    filteredData: filteredEquivDayNoLogin,
    paginatedData: paginatedEquivDayNoLogin,
    totalPages: totalEquivDayNoLoginPages,
    currentPage: currentEquivDayNoLoginPage,
    setCurrentPage: setCurrentEquivDayNoLoginPage,
    getPageNumbers: getEquivDayNoLoginPageNumbers,
  } = useTablePagination(
    equivDayNoLoginList,
    forNoLoginSearchTerm,
    (item, search) =>
      item.code.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search) ||
      Object.values(item).some(
        (val) =>
          typeof val === "number" &&
          val.toFixed(2).includes(search)
      ),
    itemsPerPage
  );

  const startEquivDayNoLoginIndex = (currentEquivDayNoLoginPage - 1) * itemsPerPage;
  const endEquivDayNoLoginIndex = startEquivDayNoLoginIndex + itemsPerPage;


  // For No Logout Pagination and Search
  const {
    filteredData: filteredEquivDayNoLogout,
    paginatedData: paginatedEquivDayNoLogout,
    totalPages: totalEquivDayNoLogoutPages,
    currentPage: currentEquivDayNoLogoutPage,
    setCurrentPage: setCurrentEquivDayNoLogoutPage,
    getPageNumbers: getEquivDayNoLogoutPageNumbers,
  } = useTablePagination(
    equivDayNoLogoutList,
    forNoLogoutSearchTerm,
    (item, search) =>
      item.code.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search) ||
      Object.values(item).some(
        (val) =>
          typeof val === "number" &&
          val.toFixed(2).includes(search)
      ),
    itemsPerPage
  );

  const startEquivDayNoLogoutIndex = (currentEquivDayNoLogoutPage - 1) * itemsPerPage;
  const endEquivDayNoLogoutIndex = startEquivDayNoLogoutIndex + itemsPerPage;

  // For No Break 2 In Pagination and Search
  const {
    filteredData: filteredEquivDayNoBreak2In,
    paginatedData: paginatedEquivDayNoBreak2In,
    totalPages: totalEquivDayNoBreak2InPages,
    currentPage: currentEquivDayForNoBreak2InPage,
    setCurrentPage: setCurrentEquivDayForNoBreak2InPage,
    getPageNumbers: getEquivDayNoBreak2InPageNumbers,
  } = useTablePagination(
    equivDayForNoBreak2InList,
    forNoBreak2InSearchTerm,
    (item, search) =>
      item.code.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search) ||
      Object.values(item).some(
        (val) =>
          typeof val === "number" &&
          val.toFixed(2).includes(search)
      ),
    itemsPerPage
  );

  const startEquivDayNoBreak2InIndex = (currentEquivDayForNoBreak2InPage - 1) * itemsPerPage;
  const endEquivDayNoBreak2InIndex = startEquivDayNoBreak2InIndex + itemsPerPage;


  // For No Break 2 OutPagination and Search
  const {
    filteredData: filteredEquivDayNoBreak2Out,
    paginatedData: paginatedEquivDayNoBreak2Out,
    totalPages: totalEquivDayNoBreak2OutPages,
    currentPage: currentEquivDayForNoBreak2OutPage,
    setCurrentPage: setCurrentEquivDayForNoBreak2OutPage,
    getPageNumbers: getEquivDayNoBreak2OutPageNumbers,
  } = useTablePagination(
    equivDayForNoBreak2OutList,
    forNoBreak2OutSearchTerm,
    (item, search) =>
      item.code.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search) ||
      Object.values(item).some(
        (val) =>
          typeof val === "number" &&
          val.toFixed(2).includes(search)
      ),
    itemsPerPage
  );

  const startEquivDayNoBreak2OutIndex = (currentEquivDayForNoBreak2OutPage - 1) * itemsPerPage;
  const endEquivDayNoBreak2OutIndex = startEquivDayNoBreak2OutIndex + itemsPerPage;
  
  // Converts "2021-05-05T00:00:00" → "05/05/2021"
  const formatApiDate = (apiDate: string | null | undefined) => {
    if (!apiDate) return "";
    const date = new Date(apiDate);
    if (isNaN(date.getTime())) return ""; // invalid date check
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Fetch TKSGroup data from API
  const fetchTKSGroupData = async (): Promise<GroupItem[]> => {
    const response = await apiClient.get("/Fs/Process/TimeKeepGroupSetUp");

    return response.data.map((item: any) => ({
      id: item.ID || item.id,
      tksGroupCode: item.groupCode ?? "",
      description: item.groupDescription ?? "",
      cutOffDateMonth: item.cutOffDateMonth ?? "",
      cutOffDateFrom: item.cutOffDateFrom ?? "",
      cutOffDateTo: item.cutOffDateTo ?? "",
      cutOffDatePeriod: item.cutOffDatePeriod ?? "",
      terminalID: item.terminalID ?? "",
      autoPairLogsDateFrom: item.autoPairLogsDateFrom ?? "",
      autoPairLogsDateTo: item.autoPairLogsDateTo ?? "",
    }));
  };

  // Fetch OvertimeFileSetup data from API
  const fetchOvertimeFileSetup = async (): Promise<OvertimeFileSetupItem[]> => {
    const response = await apiClient.get(
      "/Fs/Process/Overtime/OverTimeFileSetUp",
    );

    return response.data.map((item: any) => ({
      oTFileSetupID: item.otfid,
      oTFileSetupCode: item.otfCode,
      earnCode: item.earnCode,
      rateOne: item.rate1,
      description: item.description,
      defaultAmount: item.defAmt,
    }));
  };

 // Fetch Group System Config data from API
  const fetchGroupSystemConfig = async (): Promise<SystemConfigItem[]> => {
    const response = await apiClient.get(
      "/Fs/Process/TimeKeepGroup/GroupSetUpSystemConfig",
    );

    return response.data.map((item: any) => ({
      id: item.id,
      groupCode: item.groupCode,
      numOfMinBeforeTheShift: item.numOfMinBeforeTheShift?.toString() ?? "0",
      numOfMinToIgnoreMultipleOutInBreak: item.numOfMinToIgnoreMultipleOutInBreak?.toString() ?? "0",
      numOfMinBeforeMidnightShift: item.numOfMinBeforeMidnightShift?.toString() ?? "0",
      devicePolicy: item.devicePolicy ?? "",
      noOfMinToConsiderBrk2In: item.noOfMinToConsiderBrk2In?.toString() ?? "0",
      useTKSystemConfig: item.useTKSystemConfig ?? false,
    }));
  };

  // Fetch 
  const fetchOTAllowancesData = async (): Promise<OTAllowancesItem[]> => {
    const response = await apiClient.get(
      `Fs/Process/TimeKeepGroup/GroupSetUpOTAllowances/ByGroupCode/${tksGroupCode}`,
    );

    return response.data.map((item: any) => ({
      id: item.id,
      groupCode: item.groupCode,
      minimumOTHours: item.minimumOTHrs,
      accumOTHrsToEarnMealAllow: item.accumOTHrsToEarnMealAllow,
      dayType: item.dayType,
      earningCode: item.earningCode,
      amount: item.amount
    }));
  };

  useEffect(() => {
    const loadOvertimeFileSetup = async () => {
      const items = await fetchOvertimeFileSetup();
      setOtCodePerWeekList(items);
    };
    const loadAllowancesData =  async () => {
      const items = await fetchOTAllowancesData();
      setOTAllowancesList(items);
    };
    const loadSystemConfig = async () =>  {
      const items = await fetchGroupSystemConfig();
      setSystemConfigList(items);
      populateSystemConfigStates(items[0]);
    }
    loadOvertimeFileSetup();
    loadAllowancesData();
    loadSystemConfig();
  }, []);

  const fetchPayrollLocationData = async (): Promise<PayrollLocationItem[]> => {
    const response = await apiClient.get("/Fs/Process/PayrollLocationSetUp");

    return response.data.map((item: any) => ({
      id: item.ID || item.id,
      locationCode: item.locCode ?? "",
      locationName: item.locName ?? "",
    }));
  };

  useEffect(() => {
    const loadPayrollLocation = async () => {
      const items = await fetchPayrollLocationData();
      setPayrollLocationList(items);
    };

    loadPayrollLocation();
  }, []);


  // Fetch Over Time Rates
  const fetchOverTimeRates = async (): Promise<OverTimeRatesItem[]> => {
    const response = await apiClient.get("/Fs/Process/TimeKeepGroup/GroupSetUpOTRates");

    return response.data.map((item: any) => ({
      id: item.id,
      groupCode: item.groupCode,
      regDayOT: item.regDayOT,
      restDayOT: item.restDayOT,
      legalHolidayOT: item.legalHolidayOT,
      specHolidayOT: item.specHolidayOT,
      minHoursToComputeOT: item.minHoursToComputeOT,
      roundOfftHourMin: item.roundOfftHourMin,
      offsetLate: item.offsetLate,
      useOTAuthorization: item.useOTAuthorization,
      holidayPayLegal: item.holidayPayLegal,
      holidayPaySpecial: item.holidayPaySpecial,
      noPayIfAbsentBeforeHoliday: item.noPayIfAbsentBeforeHoliday,
      noPayIfAbsentAfterHoliday: item.noPayIfAbsentAfterHoliday,
      considerTardinessDayBeforeHoliday: item.considerTardinessDayBeforeHoliday,
      considerUndertimeDayBeforeHoliday: item.considerUndertimeDayBeforeHoliday,
      computeUnprodHourIfInc: item.computeUnprodHourIfInc,
      computeUnprodHourIfIncLegal: item.computeUnprodHourIfIncLegal,
      computeUnprodHourIfIncSpecial: item.computeUnprodHourIfIncSpecial,
      computeUnprodHourIfLeave: item.computeUnprodHourIfLeave,
      minHoursToPriorToHoliday: item.minHoursToPriorToHoliday,
      computeBasedDateIn: item.computeBasedDateIn,
      holidayWithWorkShift: item.holidayWithWorkShift,
      deductMealBreakOTComputation: item.deductMealBreakOTComputation,
      compHolidayWithPaidLeave: item.compHolidayWithPaidLeave,
      compUnprodWithPaidLeave: item.compUnprodWithPaidLeave,
      compHolidayWithPaidLeaveMinHr: item.compHolidayWithPaidLeaveMinHr,
      compUnprodWithPaidLeaveMinHR: item.compUnprodWithPaidLeaveMinHR,
      useOTPremiumBreakdown: item.useOTPremiumBreakdown,
      useDayType2: item.useDayType2,
      minHoursOTBreak: item.minHoursOTBreak,
      hoursOTBreakDeduction: item.hoursOTBreakDeduction,
      spRDDay: item.spRDDay,
      spRDDayOT: item.spRDDayOT,
      computeBrk2OI: item.computeBrk2OI,
      useDOLEOT: item.useDOLEOT,
      doubleLegalHolidayOT: item.doubleLegalHolidayOT,
      specialHoliday2: item.specialHoliday2,
      birthDayPayOT: item.birthDayPayOT,
      compHolPayMonth: item.compHolPayMonth,
      nonWrkHolidayOT: item.nonWrkHolidayOT,
      minimumNoOfHrsRequiredToCompHol: item.minimumNoOfHrsRequiredToCompHol,
      compHolPayIfWorkBeforeHolidayRestDay: item.compHolPayIfWorkBeforeHolidayRestDay,
      compHolPayIfWorkBeforeHolidaySpecialHoliday: item.compHolPayIfWorkBeforeHolidaySpecialHoliday,
      compHolPayIfWorkBeforeHolidayLegalHoliday: item.compHolPayIfWorkBeforeHolidayLegalHoliday,
      minHrsToCompOTRegDay: item.minHrsToCompOTRegDay,
      minHrsToCompOTRestDay: item.minHrsToCompOTRestDay,
      minHrsToCompOTLegal: item.minHrsToCompOTLegal,
      minHrsToCompOTSpecial: item.minHrsToCompOTSpecial,
      minHrsToCompOTSpecial2: item.minHrsToCompOTSpecial2,
      minHrsToCompOTDoubleLegal: item.minHrsToCompOTDoubleLegal,
      minHrsToCompOTNWH: item.minHrsToCompOTNWH,
      regDayOTAdj: item.regDayOTAdj,
      restDayOTAdj: item.restDayOTAdj,
      legalHolidayOTAdj: item.legalHolidayOTAdj,
      specHolidayOTAdj: item.specHolidayOTAdj,
      doubleLegalHolidayOTAdj: item.doubleLegalHolidayOTAdj,
      specialHoliday2Adj: item.specialHoliday2Adj,
      nonWrkHolidayOTAdj: item.nonWrkHolidayOTAdj,
      compFirstRestdayHoliday: item.compFirstRestdayHoliday,
      otCutOffFlag: item.otCutOffFlag,
      otCutOffOTCode: item.otCutOffOTCode,
      otCutOffHours: item.otCutOffHours,
      enable24HrOTFlag: item.enable24HrOTFlag,
      roundOffNDBasicHourMin: item.roundOffNDBasicHourMin,
      includeUnWorkHolInRegDay: item.includeUnWorkHolInRegDay,
      sundayWrkOTIfWrkSaturday: item.sundayWrkOTIfWrkSaturday,
      otCode2ShiftsInADay: item.otCode2ShiftsInADay
    }));
  };

  const populateFromOTBreak = (item: OTBreakItem) => {
    setOTBreakAppliesToRegDay(item.regDay ?? false);
    setOTBreakAppliesToLegHol(item.doubleHoliday ?? false);
    setOTBreakAppliesToSHol(item.specialHoliday ?? false);
    setOTBreakAppliesToDoubleLegHol(item.doubleHoliday ?? false);
    setOTBreakAppliesToS2Hol(item.specialHoliday2 ?? false);
    setOTBreakAppliesToNonWorkHol(item.nonWorkingHoliday ?? false);
    setOTBreakAppliesToRestDay(item.restDay ?? false);
    setOTBreakAppliesToLegHolRest(item.legalHolidayRest ?? false);
    setOTBreakAppliesToSHolRest(item.specialHolidayRest ?? false)
    setOTBreakAppliesToDoubleLegHolRest(item.doubleHolidayRest ?? false);
    setOTBreakAppliesToS2HolRest(item.specialHoliday2Rest ?? false);
    setOTBreakAppliesToNonWorkRest(item.nonWorkingHolidayRest ?? false);
  };

  const populateSystemConfigStates = (item: SystemConfigItem) => {
    setUseTimekeepingSystemConfig(item.useTKSystemConfig);
    setMinBeforeShift(item.numOfMinBeforeTheShift);
    setMinIgnoreMultipleBreak(item.numOfMinToIgnoreMultipleOutInBreak);
    setMinBeforeMidnightShift(item.numOfMinBeforeMidnightShift);
    setMinConsiderBreak2In(item.noOfMinToConsiderBrk2In);
    setDevicePolicy(item.devicePolicy);
  };

  const populateFromOTRates = (item: OverTimeRatesItem) => {
    setRegularDayOT(item.regDayOT ?? '');
    setRestDayOT(item.restDayOT ?? '');
    setLegalHolidayOT(item.legalHolidayOT ?? '');
    setSpecialHolidayOT(item.specHolidayOT ?? '');
    setDoubleLegalHolidayOT(item.doubleLegalHolidayOT ?? '')
    setSpecialHolidayOT2(item.specialHoliday2 ?? '');
    setNonWorkingHolidayOT(item.nonWrkHolidayOT ?? '');

    setRegularDayOTLateFiling(item.regDayOTAdj ?? '');
    setRestDayOTLateFiling(item.restDayOTAdj ?? '');
    setLegalHolidayOTLateFiling(item.legalHolidayOTAdj ?? '');
    setSpecialHolidayOTLateFiling(item.legalHolidayOTAdj ?? '');
    setDoubleLegalHolidayOTLateFiling(item.doubleLegalHolidayOTAdj ?? '');
    setSpecialHoliday2OTLateFiling(item.specialHoliday2Adj ?? '');
    setNonWorkingHolidayOTLateFiling(item.nonWrkHolidayOTAdj ?? '');
    
    setOtBreakMinHours(item.minHoursOTBreak ?? 0)
    setOTBreakNoOfHrsDed(item.hoursOTBreakDeduction ?? 0)
    setUseOTPremium(item.useOTPremiumBreakdown ?? false);
    setUseActualDayType(item.useDayType2 ?? false);
    setHolidayWithWorkshift(item.holidayWithWorkShift ?? false)
    setDeductMealBreakFromOT(item.deductMealBreakOTComputation ?? false); 
    setComputeOTForBreak2(item.computeBrk2OI ?? false);
    setEnable24HourOT(item.enable24HrOTFlag ?? false);
    setIncludeUnworkedHolidayInRegular(item.includeUnWorkHolInRegDay ?? false);
    setSundayOTIfWorkedSaturday(item.sundayWrkOTIfWrkSaturday ?? false);

    setRegDayMinHrsToCompOT(item.minHrsToCompOTRegDay ?? '');
    setRestDayMinHrsToCompOT(item.minHrsToCompOTRestDay ?? '');
    setLegalHolidayMinHrsToCompOT(item.minHrsToCompOTLegal ?? '');
    setSpecialHolidayMinHrsToCompOT(item.minHrsToCompOTSpecial ?? '');
    setSpecialHoliday2MinHrsToCompOT(item.minHrsToCompOTSpecial2 ?? '');
    setDoubleLegalHolidayMinHrsToCompOT(item.minHrsToCompOTDoubleLegal ?? '');
    setNonWorkingHolidayMinHrsToCompOT(item.minHrsToCompOTNWH ?? '');

    setRestDayToBeComputedAsOtherRate(item.spRDDay ?? '');
    setRestDayOtherRate(item.spRDDayOT ?? '');
    setIsOverTimeCutoffFlag(item.otCutOffFlag ?? false)
    setOverTimeCode(item.otCutOffOTCode ?? '');
    setRequiredHours(item.otCutOffHours ?? '');
    setOverTimeCodeFor2ShiftsDay(item.otCode2ShiftsInADay?? '');
    setOTRoundingToTheNearestHourMin(item.roundOfftHourMin ?? '')
    setBirthdayPay(item.birthDayPayOT ?? '');
    setNDBasicRoundingToTheNearestHourMin(item.roundOffNDBasicHourMin ?? '');
    setUseOverTimeAuthorization(item.useOTAuthorization ?? false);
    setIsSpecialOTCompFlag(item.useDayType2 ?? false);
    setIsHolPayLegalFlag(item.holidayPayLegal ?? false);
    setIsHolPaySpecialFlag(item.holidayPaySpecial ?? false);
    setCompHolPayForMonth(item.compHolPayMonth ?? false);
    setCompHolPayIfWorkBeforeHolidayRestDay(item.compHolPayIfWorkBeforeHolidayRestDay ?? false);
    setCompHolPayIfWorkBeforeHolidayLegalHoliday(item.compHolPayIfWorkBeforeHolidayLegalHoliday ?? false);
    setCompHolPayIfWorkBeforeHolidaySpecialHoliday(item.compHolPayIfWorkBeforeHolidaySpecialHoliday ?? false);
    setNoPayIfAbsentBeforeHoliday(item.noPayIfAbsentBeforeHoliday ?? false);
    setNoPayIfAbsentAfterHoliday(item.noPayIfAbsentAfterHoliday ?? false);
    setCompHolidayWithPaidLeave(item.compHolidayWithPaidLeave ?? false );
    setMinimumNoOfHrsRequiredToCompHol(item.minimumNoOfHrsRequiredToCompHol ?? '')
    setCompFirstRestdayHoliday(item.compFirstRestdayHoliday ?? false);
  };
  


  const fetchOTBreakData = async (): Promise<OTBreakItem[]> => {
    const response = await apiClient.get(
      "/Fs/Process/TimeKeepGroup/GroupOTBreak"
    );

    return response.data.map((item: any): OTBreakItem => ({
      id: item.id,
      regDay: item.regDay,
      restDay: item.restDay,
      legalHoliday: item.lHoliday,
      specialHoliday: item.sHoliday,
      legalHolidayRest: item.lHolidayRest,
      specialHolidayRest: item.sHolidayRest,
      groupCode: item.groupCode,
      doubleHoliday: item.doubleHoliday,
      doubleHolidayRest: item.doubleHolidayRest,
      specialHoliday2: item.s2Holiday,
      specialHoliday2Rest: item.s2HolidayRest,
      nonWorkingHoliday: item.nonWorkHoliday,
      nonWorkingHolidayRest: item.nonWorkHolidayRest,
    }));
  };

  useEffect(() => {
    const loadOverTimeRates = async () => {
      const items = await fetchOverTimeRates();
      setOverTimeRates(items);
      populateFromOTRates(items[0]);
    };
    const loadOTBreakData = async () => {
      const items = await fetchOTBreakData();
      setOTBreakList(items);
      populateFromOTBreak(items[0]);
    };
    loadOverTimeRates();
    loadOTBreakData();
  }, []);

  // Generic fetch function
  const fetchEquivDayData = async (
    endpoint: string,
  ): Promise<EquivDayItem[]> => {
    const response = await apiClient.get(endpoint);
    return response.data.map((item: any) => ({
      id: item.ID,
      code: item.code,
      description: item.desc,
      monday: item.monday,
      tuesday: item.tuesday,
      wednesday: item.wednesday,
      thursday: item.thursday,
      friday: item.friday,
      saturday: item.saturday,
      sunday: item.sunday,
    }));
  };

  useEffect(() => {
    const loadData = async () => {
      const forAbsentItems = await fetchEquivDayData(
        "/Fs/Process/Device/EquivHoursDeductionSetUp/ForAbsent",
      );
      setEquivDayAbsentList(forAbsentItems);

      const forNoLoginItems = await fetchEquivDayData(
        "/Fs/Process/Device/EquivHoursDeductionSetUp/ForNoLogin",
      );
      setEquivDayNoLoginList(forNoLoginItems);

      const forNoLogoutItems = await fetchEquivDayData(
        "/Fs/Process/Device/EquivHoursDeductionSetUp/ForNoLogout",
      );
      setEquivDayNoLogoutList(forNoLogoutItems);

      const forNoBreak2InItems = await fetchEquivDayData(
        "/Fs/Process/Device/EquivHoursDeductionSetUp/ForNoBreak2In",
      );
      setEquivDayForNoBreak2InList(forNoBreak2InItems);

      const forNoBreak2OutItems = await fetchEquivDayData(
        "/Fs/Process/Device/EquivHoursDeductionSetUp/ForNoBreak2Out",
      );
      setEquivDayForNoBreak2OutList(forNoBreak2OutItems);
    };

    loadData();
  }, []);


  

  const populateFromGroup = (firstGroup: GroupItem) => {
    setTksGroupCode(firstGroup.tksGroupCode ?? "");
    setTksGroupDescription(firstGroup.description ?? "");
    setPayrollLocationCode(firstGroup.tksGroupCode ?? "");
    setPayrollDescription(firstGroup.description ?? "");
    setDateFrom(formatApiDate(firstGroup.cutOffDateFrom) ?? "");
    setDateTo(formatApiDate(firstGroup.cutOffDateTo) ?? "");
    const monthIndex = parseInt(firstGroup.cutOffDateMonth ?? "0", 10) - 1;
    setCutOffMonth(months[monthIndex] || "");
    setcutOffPeriod(firstGroup.cutOffDatePeriod ?? "");
    setTerminalId(firstGroup.terminalID ?? "");
    setAutoPairingFrom(formatApiDate(firstGroup.autoPairLogsDateFrom) ?? "");
    setAutoPairingTo(formatApiDate(firstGroup.autoPairLogsDateTo) ?? "");
  };

  useEffect(() => {
    const loadTKSGroup = async () => {
      const items = await fetchTKSGroupData();
      setTKSGroupItems(items); // Set TKSGroup items to state
      setSupervisoryGroupsList(items); // Set Supervisory Groups
      if (items.length > 0) {
        populateFromGroup(items[0]);
      }
    };
    loadTKSGroup();
  }, []);


  const formatTimeTo12Hour = (isoString: string | null): string => {
    if (!isoString) return "";
    const date = new Date(isoString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // convert 0 => 12
    const minutesStr = minutes.toString().padStart(2, "0");
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const populateFromGroupSetupLoginPolicy = (item: LoginPolicyItem) => {
    setGracePeriodSemiAnnual(item.gracePerSemiAnnualFlag ?? false);
    setGracePeriodPerDay(item.gracePeriod?.toString() ?? "");
    setGracePeriodIncludeTardiness(item.gracePeriodIncTard ?? false);
    setIncludeBreak2InGrace(item.incldBrk2 ?? false);
    setDeductibleEvenWithinGrace(item.dedEvnWGrace ?? false);
    setGracePeriodPerSemiAnnual(item.graceSemiNoofHours?.toString() ?? "");
    setFirstHalfDateFrom(item.firstHalfFrom ?? "");
    setFirstHalfDateTo(item.firstHalfTo ?? "");
    setSecondHalfDateFrom(item.secondHalfFrom ?? "");
    setSecondHalfDateTo(item.secondHalfTo ?? "");
    setDeductOverBreak(item.deductOverbreak ?? false);
    setGracePeriodCalamity2(item.calamityWFlood?.toString() ?? "");
    setCombineTardinessTimeInBreak2(item.combineTardiOfTimeInBrk2 ?? false);
    setComputeTardinessNoLogout(item.compTardinessForNoLogout ?? false);
    setNightDiffStartTime(formatTimeTo12Hour(item.nightDiffStartTime ?? null));
    setNightDiffEndTime(formatTimeTo12Hour(item.nightDiffEndTime ?? null));
    setDeductMealBreakND(item.deductMealBreakinNDComput ?? false);
    setTwoShiftsInDay(item.twoShiftsInADay ?? false);
    setHoursIntervalTwoShifts(item.twoShiftsInADayInterval?.toString() ?? "");
    setAllowableGracePeriodMonth(item.numberAllowGracePrdInAMonth?.toString() ?? "",);
    setExcludeAllowableGraceBracket(item.excludeAllowGracePrdFlag ?? false);
    setAllowableGraceActualMonth(item.allowableGracePrdInAMonthBasedActualMonthFlag ?? false,);
    setConsiderSaturdayPaid(item.saturdayPdRegHrsFlag ?? false);
    setMaxDaysPerWeekSaturday(item.maxDaysPerWeekSatWrk?.toString() ?? "");
    setAllowableTardyExcess(item.numberAllowTardyExcessGracePrd?.toString() ?? "",);
    setExcludeTardinessInGrace(item.excludeTardywGracePrdInCountAllowableGracePrdInAMonthFlag ?? false,);
    setSupervisoryGroupCode(item.supGroupCode ?? "");
    setApplyOccurancesBreak(item.computeShrtBrkTardy ?? false);
    setMaxOccurancesNoDeduction(item.maxTimePerMonth?.toString() ?? "");
    setGracePeriodOccurance(item.shrtBrkGracePeriod?.toString() ?? "");
    setHoursRequiredPerWeek(item.hrsCompleteWeek?.toString() ?? "");
    setStartOfWeek(item.startWkToComplete ?? "");
    setComputeType(item.compAsPerWeek ?? "");
    setOtCodePerWeek(item.otCodePerWeek ?? "");
    setForAbsent(item.dedForAbsent ?? "");
    setForNoLogin(item.dedForNoLogin ?? "");
    setForNoLogout(item.dedForNoLogout ?? "");
    setForNoBreak2Out(item.dedForNoBrk2out ?? "");
    setForNoBreak2In(item.dedForNoBrk2In ?? "");
  };

  const fetchGroupSetupLoginPolicyData = async (
    groupCode?: string,
  ): Promise<LoginPolicyItem[] | LoginPolicyItem | null> => {
    try {
      const url = "/Fs/Process/TimeKeepGroup/GroupSetupLoginPolicy";

      const response = await apiClient.get(url);

      if (!response.data) return groupCode ? null : [];

      const mapped: LoginPolicyItem[] = response.data.map((item: any) => ({
        id: item.id ?? 0,
        groupCode: item.groupCode ?? "",
        gracePeriod: item.gracePeriod ?? null,
        gracePeriodIncTard: item.gracePeriodIncTard ?? false,
        dedExcessGPInAMonth: item.dedExcessGPInAMonth ?? false,
        maxGPInMonth: item.maxGPInMonth ?? null,
        empLogsConfig: item.empLogsConfig ?? "",
        nightDiffStartTime: item.nightDiffStartTime ?? null,
        nightDiffEndTime: item.nightDiffEndTime ?? null,
        otInandOTOut: item.otInandOTOut ?? false,
        dedForAbsent: item.dedForAbsent ?? "",
        dedForNoLogin: item.dedForNoLogin ?? "",
        dedForNoLogout: item.dedForNoLogout ?? "",
        deductMealBreakinNDComput: item.deductMealBreakinNDComput ?? false,
        incRestdayinNDComput: item.incRestdayinNDComput ?? false,
        incHolidayinNDComput: item.incHolidayinNDComput ?? false,
        restdayNDComputBasedOnDateIn: item.restdayNDComputBasedOnDateIn ?? false,
        holidayNDComputbasedOnDateIn: item.holidayNDComputbasedOnDateIn ?? false,
        tardinessMaxHours: item.tardinessMaxHours ?? null,
        undertimeMaxHours: item.undertimeMaxHours ?? null,
        undertimeHoursFromTardy: item.undertimeHoursFromTardy ?? null,
        deductOverbreak: item.deductOverbreak ?? false,
        gracePerSemiAnnualFlag: item.gracePerSemiAnnualFlag ?? false,
        graceSemiNoofHours: item.graceSemiNoofHours ?? null,
        firstHalfFrom: item.firstHalfFrom ?? "",
        firstHalfTo: item.firstHalfTo ?? "",
        secondHalfFrom: item.secondHalfFrom ?? "",
        secondHalfTo: item.secondHalfTo ?? "",
        dedForNoBrk2out: item.dedForNoBrk2out ?? "",
        dedForNoBrk2In: item.dedForNoBrk2In ?? "",
        useTardinessBracketNDD: item.useTardinessBracketNDD ?? false,
        computeShrtBrkTardy: item.computeShrtBrkTardy ?? false,
        maxTimePerMonth: item.maxTimePerMonth ?? null,
        shrtBrkGracePeriod: item.shrtBrkGracePeriod ?? null,
        incldBrk2: item.incldBrk2 ?? false,
        dedEvnWGrace: item.dedEvnWGrace ?? false,
        calamityWFlood: item.calamityWFlood ?? null,
        hrsCompleteWeek: item.hrsCompleteWeek ?? null,
        startWkToComplete: item.startWkToComplete ?? "",
        compAsPerWeek: item.compAsPerWeek ?? "",
        otCodePerWeek: item.otCodePerWeek ?? "",
        combineTardiOfTimeInBrk2: item.combineTardiOfTimeInBrk2 ?? false,
        compTardinessForNoLogout: item.compTardinessForNoLogout ?? false,
        twoShiftsInADay: item.twoShiftsInADay ?? false,
        twoShiftsInADayInterval: item.twoShiftsInADayInterval ?? null,
        numberAllowGracePrdInAMonth: item.numberAllowGracePrdInAMonth ?? null,
        maxDaysPerWeekSatWrk: item.maxDaysPerWeekSatWrk ?? null,
        saturdayPdRegHrsFlag: item.saturdayPdRegHrsFlag ?? false,
        excludeAllowGracePrdFlag: item.excludeAllowGracePrdFlag ?? false,
        allowableGracePrdInAMonthBasedActualMonthFlag: item.allowableGracePrdInAMonthBasedActualMonthFlag ?? false,
        excludeTardywGracePrdInCountAllowableGracePrdInAMonthFlag: item.excludeTardywGracePrdInCountAllowableGracePrdInAMonthFlag ?? false,
        numberAllowTardyExcessGracePrd: item.numberAllowTardyExcessGracePrd ?? null,
        supGroupCode: item.supGroupCode ?? "",
      }));

      if (groupCode) {
        const found = mapped.find((x) => x.groupCode === groupCode);
        return found ?? null;
      }

      return mapped;
    } catch (error) {
      console.error("Error fetching group login policy data", error);
      return groupCode ? null : [];
    }
  };

  useEffect(() => {
    const loadGroupLoginSetupPolicy = async () => {
      const items =
        (await fetchGroupSetupLoginPolicyData()) as LoginPolicyItem[];
      setGroupLoginPolicyItems(items);
      if (items.length > 0) populateFromGroupSetupLoginPolicy(items[0]);
    };
    loadGroupLoginSetupPolicy();
  }, []);



  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showPayrollLocationModal) {
          setShowPayrollLocationModal(false);
        } else if (showTksGroupModal) {
          setShowTksGroupModal(false);
        } else if (showForAbsentModal) {
          setShowForAbsentModal(false);
        } else if (showForNoLoginModal) {
          setShowForNoLoginModal(false);
        } else if (showForNoLogoutModal) {
          setShowForNoLogoutModal(false);
        } else if (showSupervisoryGroupModal) {
          setShowSupervisoryGroupModal(false);
        } else if (showOtCodeModal) {
          setShowOtCodeModal(false);
        }
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [
    showTksGroupModal,
    showPayrollLocationModal,
    showForAbsentModal,
    showForNoLoginModal,
    showForNoLogoutModal,
    showSupervisoryGroupModal,
    showOtCodeModal,
  ]);

  // Function to create new record - clears all fields
  const handleCreateNew = () => {
    console.log("Creating new record...");
    // TKS Group Definition
    setTksGroupCode("");
    setTksGroupDescription("");
    setPayrollLocationCode("");
    setPayrollDescription("");
    setDateFrom("");
    setDateTo("");
    setCutOffMonth("January");
    setcutOffPeriod("");
    setTerminalId("");

    // Auto Pairing Logs Cut-Off Dates
    setAutoPairingFrom("");
    setAutoPairingTo("");

    // Login Policy
    setGracePeriodSemiAnnual(false);
    setGracePeriodPerDay("");
    setGracePeriodIncludeTardiness(false);
    setIncludeBreak2InGrace(false);
    setDeductibleEvenWithinGrace(false);
    setGracePeriodPerSemiAnnual("");
    setFirstHalfDateFrom("");
    setFirstHalfDateTo("");
    setSecondHalfDateFrom("");
    setSecondHalfDateTo("");
    setDeductOverBreak(false);
    setGracePeriodCalamity2("");
    setCombineTardinessTimeInBreak2(false);
    setComputeTardinessNoLogout(false);
    setNightDiffStartTime("");
    setNightDiffEndTime("");
    setDeductMealBreakND(false);
    setTwoShiftsInDay(false);
    setHoursIntervalTwoShifts("");
    setAllowableGracePeriodMonth("");
    setExcludeAllowableGraceBracket(false);
    setAllowableGraceActualMonth(false);
    setConsiderSaturdayPaid(false);
    setMaxDaysPerWeekSaturday("");
    setAllowableTardyExcess("");
    setExcludeTardinessInGrace(false);
    setSupervisoryGroupCode("");
    setApplyOccurancesBreak(false);
    setMaxOccurancesNoDeduction("");
    setGracePeriodOccurance("");
    setHoursRequiredPerWeek("");
    setStartOfWeek("");
    setComputeType("");
    setOtCodePerWeek("");
    setForAbsent("");
    setForNoLogin("");
    setForNoLogout("");
    setForNoBreak2Out("");
    setForNoBreak2In("");

    // Overtime Rates
    setRegularDayOT("");
    setRestDayOT("");
    setLegalHolidayOT("");
    setSpecialHolidayOT("");
    setUseOTPremium(false);
    setUseActualDayType(false);
    setHolidayWithWorkshift(false);
    setOtBreakMinHours(0);

    // Other Policies
    setUseDefaultRestday(false);
    setRestdayWithWorkshift(false);
    setUseTardinessBracket(false);
    setComputeUndertimeToAbsences("");

    // System Configuration
    setUseTimekeepingSystemConfig(false);
    setMinBeforeShift("");
    setMinIgnoreMultipleBreak("");
    setMinBeforeMidnightShift("");
    setMinConsiderBreak2In("");
    setDevicePolicy("");

    // Enable edit mode and switch to definition tab
    setIsEditMode(true);
    setActiveTab("definition");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Time Keep Group</h1>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6">
            {/* Information Frame */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    Configure time keeping groups with detailed policies
                    including login rules, overtime rates, grace periods, and
                    system configurations for automated payroll processing.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Group definitions and payroll location setup
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Login policies and grace period rules
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Overtime rates and special calculations
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">
                        Cut-off dates and terminal configurations
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-6">
              {!isEditMode ? (
                <>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                    onClick={handleCreateNew}
                  >
                    <Plus className="w-4 h-4" />
                    Create New
                  </button>
                  <button
                    onClick={() => {
                      setSnapshot({
                        payrollLocationCode,
                        payrollDescription,
                        tksGroupCode,
                        tksGroupDescription,
                        dateFrom,
                        dateTo,
                        cutOffMonth,
                        cutOffPeriod,
                        terminalId,
                        autoPairingFrom,
                        autoPairingTo,
                      });
                      setIsEditMode(true);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                  <button
                    onClick={() => setShowTksGroupModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      // Save logic would go here
                      setIsEditMode(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      // Restore all values from snapshot
                      setPayrollLocationCode(
                        snapshot.payrollLocationCode ?? "",
                      );
                      setPayrollDescription(snapshot.payrollDescription ?? "");
                      setTksGroupCode(snapshot.tksGroupCode ?? "");
                      setTksGroupDescription(
                        snapshot.tksGroupDescription ?? "",
                      );
                      setDateFrom(snapshot.dateFrom ?? "");
                      setDateTo(snapshot.dateTo ?? "");
                      setCutOffMonth(snapshot.cutOffMonth ?? "");
                      setcutOffPeriod(snapshot.cutOffPeriod ?? "");
                      setTerminalId(snapshot.terminalId ?? "");
                      setAutoPairingFrom(snapshot.autoPairingFrom ?? "");
                      setAutoPairingTo(snapshot.autoPairingTo ?? "");
                      setIsEditMode(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-gray-300">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                      activeTab === tab.id
                        ? "font-medium bg-blue-600 text-white -mb-px"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    } transition-colors`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content - Definition */}
            {activeTab === "definition" && (
              <div className="space-y-6">
                {/* Form Fields - Single Column Layout */}
                <div className="space-y-4 max-w-full">
                  {/* Row 1: TKS Group Code and Description */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <label className="w-40 text-gray-700 text-sm flex-shrink-0">
                        TKS Group Code
                      </label>
                      <input
                        type="text"
                        value={tksGroupCode}
                        onChange={(e) => setTksGroupCode(e.target.value)}
                        readOnly={!isEditMode}
                        className={`flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-40 text-gray-700 text-sm flex-shrink-0">
                        TKS Group Description
                      </label>
                      <input
                        type="text"
                        value={tksGroupDescription}
                        onChange={(e) => setTksGroupDescription(e.target.value)}
                        readOnly={!isEditMode}
                        className={`flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
                      />
                    </div>
                  </div>

                  {/* Row 2: Payroll Location Code and Description */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <label className="w-40 text-gray-700 text-sm flex-shrink-0">
                        Payroll Location Code
                      </label>
                      <div className="flex-1 min-w-0 flex gap-2">
                        <input
                          type="text"
                          value={payrollLocationCode}
                          onChange={(e) =>
                            setPayrollLocationCode(e.target.value)
                          }
                          readOnly={!isEditMode}
                          className={`flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
                        />
                        {isEditMode && (
                          <>
                            <button
                              onClick={() => setShowPayrollLocationModal(true)}
                              className="px-3 py-2 rounded-lg transition-all duration-200 flex-shrink-0 shadow-sm bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95"
                            >
                              <Search className="w-4 h-4" />
                            </button>
                            <button className="px-3 py-2 rounded-lg transition-all duration-200 flex-shrink-0 shadow-sm bg-red-600 text-white hover:bg-red-700 hover:shadow-md active:scale-95">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-40 text-gray-700 text-sm flex-shrink-0">
                        Payroll Description
                      </label>
                      <input
                        type="text"
                        value={payrollDescription}
                        onChange={(e) => setPayrollDescription(e.target.value)}
                        readOnly={!isEditMode}
                        className={`flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
                      />
                    </div>
                  </div>

                  {/* Time Keep Cut Off Dates Section */}
                  <div className="border-t pt-4">
                    <div className="flex items-center mb-3">
                      <h3 className="text-gray-700">Time Keep Cut Off Dates</h3>
                      {isEditMode && (
                        <div className="flex items-center gap-2 ml-auto">
                          <label className="text-sm text-gray-700">
                            Search:
                          </label>
                          <input
                            type="text"
                            value={cutOffTableSearchTerm}
                            onChange={(e) =>
                              setCutOffTableSearchTerm(e.target.value)
                            }
                            className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-48"
                          />
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column - Form Fields */}
                      <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                        <div className="space-y-3">
                          {/* Month and Period */}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                              <label className="w-16 text-gray-700 text-sm flex-shrink-0">
                                Month
                              </label>
                              <select
                                value={cutOffMonth}
                                onChange={(e) => setCutOffMonth(e.target.value)}
                                disabled={!isEditMode}
                                className={`w-40 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                                  !isEditMode ? "bg-gray-50" : "bg-white"
                                }`}
                              >
                                {months.map((m) => (
                                  <option key={m} value={m}>
                                    {m}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="flex items-center gap-3">
                              <label className="w-16 text-gray-700 text-sm flex-shrink-0">
                                Period
                              </label>
                              <input
                                type="text"
                                value={cutOffPeriod}
                                onChange={(e) =>
                                  setcutOffPeriod(e.target.value)
                                }
                                readOnly={!isEditMode}
                                className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                                  !isEditMode ? "bg-gray-50" : ""
                                }`}
                              />
                            </div>
                          </div>

                          {/* Date From */}
                          <div className="flex items-center gap-3">
                            <label className="w-20 text-gray-700 text-sm flex-shrink-0">
                              Date From
                            </label>
                            <DatePicker
                              value={dateFrom}
                              onChange={(date) => setDateFrom(date)}
                              disabled={!isEditMode}
                              className="w-52"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>

                          {/* Date To */}
                          <div className="flex items-center gap-3">
                            <label className="w-20 text-gray-700 text-sm flex-shrink-0">
                              Date To
                            </label>
                            <DatePicker
                              value={dateTo}
                              onChange={(date) => setDateTo(date)}
                              disabled={!isEditMode}
                              className="w-52"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>

                          {/* Terminal ID */}
                          <div className="flex items-center gap-3">
                            <label className="w-20 text-gray-700 text-sm flex-shrink-0">
                              Terminal ID
                            </label>
                            <input
                              type="text"
                              value={terminalId}
                              onChange={(e) => setTerminalId(e.target.value)}
                              readOnly={!isEditMode}
                              className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                                !isEditMode ? "bg-gray-50" : ""
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right Column - TKS Group Table (edit mode only) */}
                      {isEditMode && (
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 flex flex-col">
                          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex-1">
                            <div
                              className="overflow-y-auto"
                              style={{ maxHeight: "180px" }}
                            >
                              <table className="w-full">
                                <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs text-gray-600 w-10">
                                      <input
                                        type="checkbox"
                                        checked={
                                          filteredCutOffData.length > 0 &&
                                          filteredCutOffData.every(
                                            (item: GroupItem) =>
                                              selectedCutOffRows.includes(
                                                item.id.toString(),
                                              ),
                                              
                                          )
                                        }
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedCutOffRows(
                                              filteredCutOffData.map(
                                                (i: GroupItem) =>
                                                  i.id.toString(),
                                              ),
                                            );
                                          } else {
                                            setSelectedCutOffRows([]);
                                          }
                                        }}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                      />
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs text-gray-600 font-semibold">
                                      <div className="flex items-center gap-1">
                                        Code{" "}
                                        <span className="text-blue-600">▲</span>
                                      </div>
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs text-gray-600 font-semibold">
                                      Description
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {filteredCutOffData.map(
                                    (item: GroupItem, index: number) => (
                                      <tr
                                        key={item.id}
                                        className={`hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                                      >
                                        <td className="px-4 py-2">
                                          <input
                                            type="checkbox"
                                            checked={selectedCutOffRows.includes(
                                              item.id.toString(),
                                            )}
                                            onChange={() => {
                                              setSelectedCutOffRows((prev) =>
                                                prev.includes(
                                                  item.id.toString(),
                                                )
                                                  ? prev.filter(
                                                      (id) =>
                                                        id !==
                                                        item.id.toString(),
                                                    )
                                                  : [
                                                      ...prev,
                                                      item.id.toString(),
                                                    ],
                                              );
                                            }}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                          />
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900">
                                          {item.tksGroupCode}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-600">
                                          {item.description}
                                        </td>
                                      </tr>
                                    ),
                                  )}

                                  {filteredCutOffData.length === 0 && (
                                    <tr>
                                      <td
                                        colSpan={3}
                                        className="px-4 py-6 text-center text-sm text-gray-400"
                                      >
                                        No records found.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Pagination */}
                          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                            <span>
                              Showing{" "}
                              {filteredCutOffData.length === 0
                                ? 0
                                : cutOffStartIndex + 1}{" "}
                              to{" "}
                              {Math.min(
                                cutOffEndIndex,
                                filteredCutOffData.length,
                              )}{" "}
                              of {filteredCutOffData.length} entries
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  setCutOffCurrentPage((p) =>
                                    Math.max(1, p - 1),
                                  )
                                }
                                disabled={cutOffCurrentPage === 1}
                                className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Previous
                              </button>
                              {getCutOffPageNumbers().map((page, idx) =>
                                page === "..." ? (
                                  <span
                                    key={`e-${idx}`}
                                    className="px-1 text-gray-500 text-xs"
                                  >
                                    ...
                                  </span>
                                ) : (
                                  <button
                                    key={page}
                                    onClick={() =>
                                      setCutOffCurrentPage(page as number)
                                    }
                                    className={`px-2 py-1 rounded text-xs ${
                                      cutOffCurrentPage === page
                                        ? "bg-blue-600 text-white"
                                        : "border border-gray-300 hover:bg-gray-100"
                                    }`}
                                  >
                                    {page}
                                  </button>
                                ),
                              )}
                              <button
                                onClick={() =>
                                  setCutOffCurrentPage((p) =>
                                    Math.min(cutOffTotalPages, p + 1),
                                  )
                                }
                                disabled={
                                  cutOffCurrentPage === cutOffTotalPages ||
                                  cutOffTotalPages === 0
                                }
                                className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Next
                              </button>
                            </div>
                          </div>

                          {/* Selected count */}
                          {selectedCutOffRows.length > 0 && (
                            <p className="mt-1.5 text-xs text-blue-600">
                              {selectedCutOffRows.length} row
                              {selectedCutOffRows.length > 1 ? "s" : ""}{" "}
                              selected
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Auto Pairing Logs Cut-Off Dates */}
                  <div className="border-t pt-4">
                    <div className="flex items-center mb-3">
                      <h3 className="text-gray-700">
                        Auto Pairing Logs Cut-Off Dates
                      </h3>
                      {isEditMode && (
                        <div className="flex items-center gap-2 ml-auto">
                          <label className="text-sm text-gray-700">
                            Search:
                          </label>
                          <input
                            type="text"
                            value={autoPairingTableSearchTerm}
                            onChange={(e) =>
                              setAutoPairingTableSearchTerm(e.target.value)
                            }
                            className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-48"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column - Date Pickers */}
                      <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <label className="w-16 text-gray-700 text-sm flex-shrink-0">
                              From:
                            </label>
                            <DatePicker
                              value={autoPairingFrom}
                              onChange={(date) => setAutoPairingFrom(date)}
                              disabled={!isEditMode}
                              className="w-52"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="w-16 text-gray-700 text-sm flex-shrink-0">
                              To:
                            </label>
                            <DatePicker
                              value={autoPairingTo}
                              onChange={(date) => setAutoPairingTo(date)}
                              disabled={!isEditMode}
                              className="w-52"
                              placeholder="MM/DD/YYYY"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right Column - TKS Group Table (edit mode only) */}
                      {isEditMode && (
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 flex flex-col">
                          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex-1">
                            <div
                              className="overflow-y-auto"
                              style={{ maxHeight: "180px" }}
                            >
                              <table className="w-full">
                                <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs text-gray-600 w-10">
                                      <input
                                        type="checkbox"
                                        checked={
                                          autoPairingFilteredData.length > 0 &&
                                          autoPairingFilteredData.every(
                                            (item: GroupItem) =>
                                              selectedAutoPairingRows.includes(
                                                item.id.toString(),
                                              ),
                                          )
                                        }
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedAutoPairingRows(
                                              autoPairingFilteredData.map(
                                                (i: GroupItem) =>
                                                  i.id.toString(),
                                              ),
                                            );
                                          } else {
                                            setSelectedAutoPairingRows([]);
                                          }
                                        }}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                      />
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs text-gray-600 font-semibold">
                                      <div className="flex items-center gap-1">
                                        Code{" "}
                                        <span className="text-blue-600">▲</span>
                                      </div>
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs text-gray-600 font-semibold">
                                      Description
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {autoPairingPaginatedData.map(
                                    (item: GroupItem, index: number) => (
                                      <tr
                                        key={item.id}
                                        className={`hover:bg-gray-50 ${
                                          index % 2 === 0
                                            ? "bg-white"
                                            : "bg-gray-50"
                                        }`}
                                      >
                                        <td className="px-4 py-2">
                                          <input
                                            type="checkbox"
                                            checked={selectedAutoPairingRows.includes(
                                              item.id.toString(),
                                            )}
                                            onChange={() => {
                                              setSelectedAutoPairingRows(
                                                (prev) =>
                                                  prev.includes(
                                                    item.id.toString(),
                                                  )
                                                    ? prev.filter(
                                                        (id) =>
                                                          id !==
                                                          item.id.toString(),
                                                      )
                                                    : [
                                                        ...prev,
                                                        item.id.toString(),
                                                      ],
                                              );
                                            }}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                          />
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900">
                                          {item.tksGroupCode}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-600">
                                          {item.description}
                                        </td>
                                      </tr>
                                    ),
                                  )}

                                  {autoPairingPaginatedData.length === 0 && (
                                    <tr>
                                      <td
                                        colSpan={3}
                                        className="px-4 py-6 text-center text-sm text-gray-400"
                                      >
                                        No records found.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Pagination */}
                          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                            <span>
                              Showing{" "}
                              {autoPairingFilteredData.length === 0
                                ? 0
                                : autoPairingStartIndex + 1}{" "}
                              to{" "}
                              {Math.min(
                                autoPairingEndIndex,
                                autoPairingFilteredData.length,
                              )}{" "}
                              of {autoPairingFilteredData.length} entries
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  setAutoPairingCurrentPage((p) =>
                                    Math.max(1, p - 1),
                                  )
                                }
                                disabled={autoPairingCurrentPage === 1}
                                className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Previous
                              </button>
                              {getAutoPairingPageNumbers().map((page, idx) =>
                                page === "..." ? (
                                  <span
                                    key={`e-${idx}`}
                                    className="px-1 text-gray-500 text-xs"
                                  >
                                    ...
                                  </span>
                                ) : (
                                  <button
                                    key={page}
                                    onClick={() =>
                                      setAutoPairingCurrentPage(page as number)
                                    }
                                    className={`px-2 py-1 rounded text-xs ${
                                      autoPairingCurrentPage === page
                                        ? "bg-blue-600 text-white"
                                        : "border border-gray-300 hover:bg-gray-100"
                                    }`}
                                  >
                                    {page}
                                  </button>
                                ),
                              )}
                              <button
                                onClick={() =>
                                  setAutoPairingCurrentPage((p) =>
                                    Math.min(autoPairingTotalPages, p + 1),
                                  )
                                }
                                disabled={
                                  autoPairingCurrentPage ===
                                    autoPairingTotalPages ||
                                  autoPairingTotalPages === 0
                                }
                                className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Next
                              </button>
                            </div>
                          </div>

                          {/* Selected count */}
                          {selectedAutoPairingRows.length > 0 && (
                            <p className="mt-1.5 text-xs text-blue-600">
                              {selectedAutoPairingRows.length} row
                              {selectedAutoPairingRows.length > 1
                                ? "s"
                                : ""}{" "}
                              selected
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content - Login Policy */}
            {activeTab === "login-policy" && (
              <div className="space-y-6">
                {/* Group Code and Definition */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <label className="w-40 text-gray-700 text-sm flex-shrink-0">
                      TKS Group Code
                    </label>
                    <input
                      type="text"
                      value={tksGroupCode}
                      disabled
                      className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded focus:outline-none text-sm bg-gray-100"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="w-48 text-gray-700 text-sm flex-shrink-0">
                      TKS Group Definition
                    </label>
                    <input
                      type="text"
                      value={tksGroupDescription}
                      disabled
                      className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded focus:outline-none text-sm bg-gray-100"
                    />
                  </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <label className="w-56 text-gray-700 text-sm flex-shrink-0">
                        Grace Period Semi-Annual
                      </label>
                      <input
                        type="checkbox"
                        checked={gracePeriodSemiAnnual}
                        onChange={(e) =>
                          setGracePeriodSemiAnnual(e.target.checked)
                        }
                        disabled={!isEditMode}
                        className="w-4 h-4 mt-1"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-56 text-gray-700 text-sm flex-shrink-0">
                        Grace Period Per Day
                      </label>
                      <input
                        type="text"
                        value={gracePeriodPerDay}
                        onChange={(e) => setGracePeriodPerDay(e.target.value)}
                        readOnly={!isEditMode}
                        className={`w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
                      />
                      <span className="text-gray-500 text-sm">[hh:mm]</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-56 text-gray-700 text-sm flex-shrink-0">
                        Grace Period Include in Tardiness
                      </label>
                      <input
                        type="checkbox"
                        checked={gracePeriodIncludeTardiness}
                        onChange={(e) =>
                          setGracePeriodIncludeTardiness(e.target.checked)
                        }
                        disabled={!isEditMode}
                        className="w-4 h-4 mt-1"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-56 text-gray-700 text-sm flex-shrink-0">
                        Include Break 2 in Grace Period
                      </label>
                      <input
                        type="checkbox"
                        checked={includeBreak2InGrace}
                        onChange={(e) =>
                          setIncludeBreak2InGrace(e.target.checked)
                        }
                        disabled={!isEditMode}
                        className="w-4 h-4 mt-1"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-56 text-gray-700 text-sm flex-shrink-0">
                        Deductible even within grace period
                      </label>
                      <input
                        type="checkbox"
                        checked={deductibleEvenWithinGrace}
                        onChange={(e) =>
                          setDeductibleEvenWithinGrace(e.target.checked)
                        }
                        disabled={!isEditMode}
                        className="w-4 h-4 mt-1"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-56 text-gray-700 text-sm flex-shrink-0">
                        Grace Period Per Semi-Annual
                      </label>
                      <input
                        type="text"
                        value={gracePeriodPerSemiAnnual}
                        onChange={(e) =>
                          setGracePeriodPerSemiAnnual(e.target.value)
                        }
                        readOnly={!isEditMode}
                        className={`w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
                      />
                      <span className="text-gray-500 text-sm">[hh:hh]</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-56 text-gray-700 text-sm flex-shrink-0">
                        1st Half Semi-Annual Date From
                      </label>
                      <DatePicker
                        value={firstHalfDateFrom}
                        onChange={(date) => setFirstHalfDateFrom(date)}
                        disabled={!isEditMode}
                        className="w-52"
                        placeholder="MM/DD/YYYY"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-56 text-gray-700 text-sm flex-shrink-0">
                        1st Half Semi-Annual Date To
                      </label>
                      <DatePicker
                        value={firstHalfDateTo}
                        onChange={(date) => setFirstHalfDateTo(date)}
                        disabled={!isEditMode}
                        className="w-52"
                        placeholder="MM/DD/YYYY"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-56 text-gray-700 text-sm flex-shrink-0">
                        2nd Half Semi-Annual Date From
                      </label>
                      <DatePicker
                        value={secondHalfDateFrom}
                        onChange={(date) => setSecondHalfDateFrom(date)}
                        disabled={!isEditMode}
                        className="w-52"
                        placeholder="MM/DD/YYYY"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-56 text-gray-700 text-sm flex-shrink-0">
                        2nd Half Semi-Annual Date To
                      </label>
                      <DatePicker
                        value={secondHalfDateTo}
                        onChange={(date) => setSecondHalfDateTo(date)}
                        disabled={!isEditMode}
                        className="w-52"
                        placeholder="MM/DD/YYYY"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-56 text-gray-700 text-sm flex-shrink-0">
                        Deduct Over Break
                      </label>
                      <input
                        type="checkbox"
                        checked={deductOverBreak}
                        onChange={(e) => setDeductOverBreak(e.target.checked)}
                        disabled={!isEditMode}
                        className="w-4 h-4 mt-1"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-56 text-gray-700 text-sm flex-shrink-0">
                        Grace Period for Calamity 2
                      </label>
                      <input
                        type="text"
                        value={gracePeriodCalamity2}
                        onChange={(e) =>
                          setGracePeriodCalamity2(e.target.value)
                        }
                        className="w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        disabled={!isEditMode}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-56 text-gray-700 text-sm flex-shrink-0">
                        Combine Tardiness for TimeIn and Break2
                      </label>
                      <input
                        type="checkbox"
                        checked={combineTardinessTimeInBreak2}
                        onChange={(e) =>
                          setCombineTardinessTimeInBreak2(e.target.checked)
                        }
                        disabled={!isEditMode}
                        className="w-4 h-4 mt-1"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-56 text-gray-700 text-sm flex-shrink-0">
                        Compute Tardiness For No Logout
                      </label>
                      <input
                        type="checkbox"
                        checked={computeTardinessNoLogout}
                        onChange={(e) =>
                          setComputeTardinessNoLogout(e.target.checked)
                        }
                        disabled={!isEditMode}
                        className="w-4 h-4 mt-1"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="w-60 text-gray-700 text-sm flex-shrink-0">
                        Night Diff. Start Time
                      </label>
                      <input
                        type="text"
                        value={nightDiffStartTime}
                        onChange={(e) => setNightDiffStartTime(e.target.value)}
                        readOnly={!isEditMode}
                        className={`w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
                      />
                      <span className="text-gray-500 text-sm">[hh:mm]</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-60 text-gray-700 text-sm flex-shrink-0">
                        Night Diff. End Time
                      </label>
                      <input
                        type="text"
                        value={nightDiffEndTime}
                        onChange={(e) => setNightDiffEndTime(e.target.value)}
                        readOnly={!isEditMode}
                        className={`w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
                      />
                      <span className="text-gray-500 text-sm">[hh:mm]</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-60 text-gray-700 text-sm flex-shrink-0">
                        Deduct Meal Break in ND Comp.
                      </label>
                      <input
                        type="checkbox"
                        checked={deductMealBreakND}
                        onChange={(e) => setDeductMealBreakND(e.target.checked)}
                        disabled={!isEditMode}
                        className="w-4 h-4 mt-1"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-60 text-gray-700 text-sm flex-shrink-0">
                        2 Shifts In A Day
                      </label>
                      <input
                        type="checkbox"
                        checked={twoShiftsInDay}
                        onChange={(e) => setTwoShiftsInDay(e.target.checked)}
                        disabled={!isEditMode}
                        className="w-4 h-4 mt-1"
                      />
                    </div>

                    <div className="flex items-start gap-3">
                      <label className="w-60 text-gray-700 text-sm flex-shrink-0 pt-1">
                        No. of Hours Interval for 2 Shifts in A Day
                      </label>
                      <input
                        type="text"
                        value={hoursIntervalTwoShifts}
                        onChange={(e) =>
                          setHoursIntervalTwoShifts(e.target.value)
                        }
                        readOnly={!isEditMode}
                        className={`w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
                      />
                      <span className="text-gray-500 text-sm pt-1">
                        [hh:hh]
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <label className="w-60 text-gray-700 text-sm flex-shrink-0 pt-1">
                        No. of Allowable Grace Period in a Month
                      </label>
                      <input
                        type="text"
                        value={allowableGracePeriodMonth}
                        onChange={(e) =>
                          setAllowableGracePeriodMonth(e.target.value)
                        }
                        readOnly={!isEditMode}
                        className={`w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
                      />
                    </div>

                    <div className="flex items-start gap-3">
                      <label className="w-60 text-gray-700 text-sm flex-shrink-0 pt-1">
                        Exclude the no. of Allowable Grace Period in Bracket
                      </label>
                      <input
                        type="checkbox"
                        checked={excludeAllowableGraceBracket}
                        onChange={(e) =>
                          setExcludeAllowableGraceBracket(e.target.checked)
                        }
                        disabled={!isEditMode}
                        className="w-4 h-4 mt-1"
                      />
                    </div>

                    <div className="flex items-start gap-3">
                      <label className="w-60 text-gray-700 text-sm flex-shrink-0 pt-1">
                        Allowable Grace Period in a Month Based on Actual Month
                      </label>
                      <input
                        type="checkbox"
                        checked={allowableGraceActualMonth}
                        onChange={(e) =>
                          setAllowableGraceActualMonth(e.target.checked)
                        }
                        disabled={!isEditMode}
                        className="w-4 h-4 mt-1"
                      />
                    </div>

                    <div className="flex items-start gap-3">
                      <label className="w-60 text-gray-700 text-sm flex-shrink-0 pt-1">
                        Consider Saturday as Paid Regular Hours
                      </label>
                      <input
                        type="checkbox"
                        checked={considerSaturdayPaid}
                        onChange={(e) =>
                          setConsiderSaturdayPaid(e.target.checked)
                        }
                        disabled={!isEditMode}
                        className="w-4 h-4 mt-1"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-60 text-gray-700 text-sm break-words">
                        Max. Days Per Week to Consider UnWorked Saturday As Paid
                        <br />
                        Regular Hours
                      </label>
                      <input
                        type="text"
                        value={maxDaysPerWeekSaturday}
                        onChange={(e) =>
                          setMaxDaysPerWeekSaturday(e.target.value)
                        }
                        disabled={!isEditMode}
                        className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    {/* Group 1: Tardy and Supervisory */}
                    <div className="border border-gray-300 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <label className="w-60 text-gray-700 text-sm flex-shrink-0 pt-1">
                          No. of Allowable Tardy in Excess of Grace Period in a
                          Month
                        </label>
                        <input
                          type="text"
                          value={allowableTardyExcess}
                          onChange={(e) =>
                            setAllowableTardyExcess(e.target.value)
                          }
                          disabled={!isEditMode}
                          className="w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div className="flex gap-3 items-center">
                        <label className="w-60 text-gray-700 text-sm leading-snug">
                          Exclude Tardiness Within Grace Period in Count for
                          <br />
                          Allowable Tardy in Excess of Grace Period in a Month
                        </label>
                        <input
                          type="checkbox"
                          checked={excludeTardinessInGrace}
                          onChange={(e) =>
                            setExcludeTardinessInGrace(e.target.checked)
                          }
                          disabled={!isEditMode}
                          className="w-4 h-4 self-start mt-1"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="w-60 text-gray-700 text-sm flex-shrink-0">
                          Supervisory GroupCode
                        </label>
                        <input
                          type="text"
                          value={supervisoryGroupCode}
                          onChange={(e) =>
                            setSupervisoryGroupCode(e.target.value)
                          }
                          readOnly={true} // always read-only
                          className={`w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                            !isEditMode ? "bg-gray-50" : ""
                          }`}
                        />
                        {isEditMode && (
                          <>
                            <button
                              onClick={() => setShowSupervisoryGroupModal(true)}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Search className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSupervisoryGroupCode("")}
                              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Group 2: Occurances */}
                    <div className="border border-gray-300 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <label className="w-60 text-gray-700 text-sm flex-shrink-0 pt-1">
                          Apply Occurances to Break1 and Break3
                        </label>
                        <input
                          type="checkbox"
                          checked={applyOccurancesBreak}
                          onChange={(e) =>
                            setApplyOccurancesBreak(e.target.checked)
                          }
                          disabled={!isEditMode}
                          className="w-4 h-4 mt-1"
                        />
                      </div>

                      <div className="flex items-start gap-3">
                        <label className="w-60 text-gray-700 text-sm flex-shrink-0 pt-1">
                          Max No. of Occurances for no deduction
                        </label>
                        <input
                          type="text"
                          value={maxOccurancesNoDeduction}
                          onChange={(e) =>
                            setMaxOccurancesNoDeduction(e.target.value)
                          }
                          disabled={!isEditMode}
                          className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="w-60 text-gray-700 text-sm flex-shrink-0">
                          Grace Period
                        </label>
                        <input
                          type="text"
                          value={gracePeriodOccurance}
                          onChange={(e) =>
                            setGracePeriodOccurance(e.target.value)
                          }
                          disabled={!isEditMode}
                          className="w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <span className="text-gray-500 text-sm">[hh:mm]</span>
                      </div>
                    </div>

                    {/* Group 3: Weekly Computation */}
                    <div className="border border-gray-300 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <label className="w-60 text-gray-700 text-sm flex-shrink-0 pt-1">
                          No of Hrs Required to Complete Per Week
                        </label>
                        <input
                          type="text"
                          value={hoursRequiredPerWeek}
                          onChange={(e) =>
                            setHoursRequiredPerWeek(e.target.value)
                          }
                          disabled={!isEditMode}
                          className="w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <span className="text-gray-500 text-sm pt-1">
                          [hh:hh]
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="w-60 text-gray-700 text-sm flex-shrink-0">
                          Start of Week
                        </label>
                        <select
                          value={startOfWeek}
                          onChange={(e) => setStartOfWeek(e.target.value)}
                          disabled={!isEditMode}
                          className="w-40 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-50"
                        >
                          <option value="">Select a day</option>
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                          <option value="Sunday">Sunday</option>
                        </select>
                      </div>

                      <div className="flex items-start gap-3">
                        <label className="w-60 text-gray-700 text-sm flex-shrink-0 pt-1"></label>
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="computeType"
                              value="tardiness"
                              checked={computeType === "tardiness"}
                              onChange={(e) => setComputeType(e.target.value)}
                              className="w-4 h-4"
                              disabled={!isEditMode}
                            />
                            <span className="text-gray-700 text-sm">
                              Compute as Tardiness
                            </span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="computeType"
                              value="undertime"
                              checked={computeType === "undertime"}
                              onChange={(e) => setComputeType(e.target.value)}
                              className="w-4 h-4"
                              disabled={!isEditMode}
                            />
                            <span className="text-gray-700 text-sm">
                              Compute as Undertime
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="w-60 text-gray-700 text-sm flex-shrink-0">
                          OT Code Per Week
                        </label>
                        <input
                          type="text"
                          value={otCodePerWeek}
                          onChange={(e) => setOtCodePerWeek(e.target.value)}
                          readOnly={!isEditMode}
                          className={`w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
                        />
                        {isEditMode && (
                          <>
                            <button
                              onClick={() => setShowOtCodeModal(true)}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Search className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setOtCodePerWeek("")}
                              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Section - Default Equivalent Hours */}
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-gray-700 mb-4">
                    Default Equivalent Hours To Be Deducted for Absent, No
                    Login, and No Logout if No Shift Defined
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <label className="w-40 text-gray-700 text-sm flex-shrink-0">
                        For Absent
                      </label>
                      <input
                        type="text"
                        value={forAbsent}
                        onChange={(e) => setForAbsent(e.target.value)}
                        readOnly={!isEditMode}
                        className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
                      />
                      {isEditMode && (
                        <>
                          <button
                            onClick={() => setShowForAbsentModal(true)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setForAbsent("")}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-40 text-gray-700 text-sm flex-shrink-0">
                        For No Break 2 Out
                      </label>
                      <input
                        type="text"
                        value={forNoBreak2Out}
                        onChange={(e) => setForNoBreak2Out(e.target.value)}
                        readOnly={!isEditMode}
                        className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
                      />
                      {isEditMode && (
                        <>
                          <button 
                            onClick={() => setShowForNoBreak2OutModal(true)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <Search className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setForNoBreak2Out("")}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-40 text-gray-700 text-sm flex-shrink-0">
                        For No Login
                      </label>
                      <input
                        type="text"
                        value={forNoLogin}
                        onChange={(e) => setForNoLogin(e.target.value)}
                        readOnly={!isEditMode}
                        className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
                      />
                      {isEditMode && (
                        <>
                          <button
                            onClick={() => setShowForNoLoginModal(true)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setForNoLogin("")}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-40 text-gray-700 text-sm flex-shrink-0">
                        For No Break 2 In
                      </label>
                      <input
                        type="text"
                        value={forNoBreak2In}
                        onChange={(e) => setForNoBreak2In(e.target.value)}
                        readOnly={!isEditMode}
                        className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
                      />
                      {isEditMode && (
                        <>
                          <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            onClick={() => setShowForNoBreak2InModal(true)}>
                            <Search className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setForNoBreak2In("")}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-40 text-gray-700 text-sm flex-shrink-0">
                        For No Logout
                      </label>
                      <input
                        type="text"
                        value={forNoLogout}
                        onChange={(e) => setForNoLogout(e.target.value)}
                        readOnly={!isEditMode}
                        className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
                      />
                      {isEditMode && (
                        <>
                          <button
                            onClick={() => setShowForNoLogoutModal(true)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setForNoLogout("")}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content - Overtime Rates */}
            {activeTab === "overtime" && (
              <OvertimeRatesTabContent
                tksGroupCode={tksGroupCode}
                tksGroupDescription={tksGroupDescription}
                isEditMode={isEditMode}
                isEditOTRates={isEditOTRates}
                setIsEditOTRates={setIsEditOTRates}
                showOtCodeModal={showOtCodeModal}
                setShowOtCodeModal={setShowOtCodeModal}
                isEditOTRatesFor2Shifts={isEditOTRatesFor2Shifts}
                setIsEditOTRatesFor2Shifts={setIsEditOTRatesFor2Shifts}
                isEditBirthDayPay={isEditBirthDayPay}
                setIsEditBirthDayPay={setIsEditBirthDayPay}

                regularDayOT={regularDayOT}
                setRegularDayOT={setRegularDayOT}
                restDayOT={restDayOT}
                setRestDayOT={setRestDayOT}
                legalHolidayOT={legalHolidayOT}
                setLegalHolidayOT={setLegalHolidayOT}
                specialHolidayOT={specialHolidayOT}
                setSpecialHolidayOT={setSpecialHolidayOT}
                doubleLegalHolidayOT={doubleLegalHolidayOT}
                setDoubleLegalHolidayOT={setDoubleLegalHolidayOT}
                specialHolidayOT2={specialHolidayOT2}
                setSpecialHolidayOT2={setSpecialHolidayOT2}
                nonWorkingHolidayOT={nonWorkingHolidayOT}
                setNonWorkingHolidayOT={setNonWorkingHolidayOT}

                regularDayOTLateFiling={regularDayOTLateFiling}
                setRegularDayOTLateFiling={setRegularDayOTLateFiling}
                restDayOTLateFiling={restDayOTLateFiling}
                setRestDayOTLateFiling={setRestDayOTLateFiling}
                legalHolidayOTLateFiling={legalHolidayOTLateFiling}
                setLegalHolidayOTLateFiling={setLegalHolidayOTLateFiling}
                specialHolidayOTLateFiling={specialHolidayOTLateFiling}
                setSpecialHolidayOTLateFiling={setSpecialHolidayOTLateFiling}
                doubleLegalHolidayOTLateFiling={doubleLegalHolidayOTLateFiling}
                setDoubleLegalHolidayOTLateFiling={setDoubleLegalHolidayOTLateFiling}
                specialHoliday2OTLateFiling={specialHoliday2OTLateFiling}
                setSpecialHoliday2OTLateFiling={setSpecialHoliday2OTLateFiling}
                nonWorkingHolidayOTLateFiling={nonWorkingHolidayOTLateFiling}
                setNonWorkingHolidayOTLateFiling={setNonWorkingHolidayOTLateFiling}

                regDayMinHrsToCompOT={regDayMinHrsToCompOT}
                setRegDayMinHrsToCompOT={setRegDayMinHrsToCompOT}
                restDayMinHrsToCompOT={restDayMinHrsToCompOT}
                setRestDayMinHrsToCompOT={setRestDayMinHrsToCompOT}
                legalHolidayMinHrsToCompOT={legalHolidayMinHrsToCompOT}
                setLegalHolidayMinHrsToCompOT={setLegalHolidayMinHrsToCompOT}
                specialHolidayMinHrsToCompOT={specialHolidayMinHrsToCompOT}
                setSpecialHolidayMinHrsToCompOT={setSpecialHolidayMinHrsToCompOT}
                specialHoliday2MinHrsToCompOT={specialHoliday2MinHrsToCompOT}
                setSpecialHoliday2MinHrsToCompOT={setSpecialHoliday2MinHrsToCompOT}
                doubleLegalHolidayMinHrsToCompOT={doubleLegalHolidayMinHrsToCompOT}
                setDoubleLegalHolidayMinHrsToCompOT={setDoubleLegalHolidayMinHrsToCompOT}
                nonWorkingHolidayMinHrsToCompOT={nonWorkingHolidayMinHrsToCompOT}
                setNonWorkingHolidayMinHrsToCompOT={setNonWorkingHolidayMinHrsToCompOT}

                otBreakMinHours={otBreakMinHours}
                setOtBreakMinHours={setOtBreakMinHours}
                oTBreakNoOfHrsDed={oTBreakNoOfHrsDed}
                setOTBreakNoOfHrsDed={setOTBreakNoOfHrsDed}

                oTBreakAppliesToRegDay={oTBreakAppliesToRegDay}
                setOTBreakAppliesToRegDay={setOTBreakAppliesToRegDay}
                oTBreakAppliesToLegHol={oTBreakAppliesToLegHol}
                setOTBreakAppliesToLegHol={setOTBreakAppliesToLegHol}
                oTBreakAppliesToSHol={oTBreakAppliesToSHol}
                setOTBreakAppliesToSHol={setOTBreakAppliesToSHol}
                oTBreakAppliesToDoubleLegHol={oTBreakAppliesToDoubleLegHol}
                setOTBreakAppliesToDoubleLegHol={setOTBreakAppliesToDoubleLegHol}
                oTBreakAppliesToS2Hol={oTBreakAppliesToS2Hol}
                setOTBreakAppliesToS2Hol={setOTBreakAppliesToS2Hol}
                oTBreakAppliesToNonWorkHol={oTBreakAppliesToNonWorkHol}
                setOTBreakAppliesToNonWorkHol={setOTBreakAppliesToNonWorkHol}
                oTBreakAppliesToRestDay={oTBreakAppliesToRestDay}
                setOTBreakAppliesToRestDay={setOTBreakAppliesToRestDay}
                oTBreakAppliesToLegHolRest={oTBreakAppliesToLegHolRest}
                setOTBreakAppliesToLegHolRest={setOTBreakAppliesToLegHolRest}
                oTBreakAppliesToSHolRest={oTBreakAppliesToSHolRest}
                setOTBreakAppliesToSHolRest={setOTBreakAppliesToSHolRest}
                oTBreakAppliesToDoubleLegHolRest={oTBreakAppliesToDoubleLegHolRest}
                setOTBreakAppliesToDoubleLegHolRest={setOTBreakAppliesToDoubleLegHolRest}
                oTBreakAppliesToS2HolRest={oTBreakAppliesToS2HolRest}
                setOTBreakAppliesToS2HolRest={setOTBreakAppliesToS2HolRest}
                oTBreakAppliesToNonWorkRest={oTBreakAppliesToNonWorkRest}
                setOTBreakAppliesToNonWorkRest={setOTBreakAppliesToNonWorkRest}

                useOTPremiumBreakDwn={useOTPremium}
                setOTPremiumBreakDwn={setUseOTPremium}
                useActualDayType={useActualDayType}
                setUseActualDayType={setUseActualDayType}
                holidayWithWorkShift={holidayWithWorkshift}
                setHolidayWithWorkShift={setHolidayWithWorkshift}
                deductMealBreakFromOT={deductMealBreakFromOT}
                setDeductMealBreakFromOT={setDeductMealBreakFromOT}
                computeOTForBreak2={computeOTForBreak2}
                setComputeOTForBreak2={setComputeOTForBreak2}
                enable24HourOT={enable24HourOT}
                setEnable24HourOT={setEnable24HourOT}
                includeUnworkedHolidayInRegular={includeUnworkedHolidayInRegular}
                setIncludeUnworkedHolidayInRegular={setIncludeUnworkedHolidayInRegular}
                sundayOTIfWorkedSaturday={sundayOTIfWorkedSaturday}
                setSundayOTIfWorkedSaturday={setSundayOTIfWorkedSaturday}

                restDayToBeComputedAsOtherRate={restDayToBeComputedAsOtherRate}
                setRestDayToBeComputedAsOtherRate={setRestDayToBeComputedAsOtherRate}
                restDayOtherRate={restDayOtherRate}
                setRestDayOtherRate={setRestDayOtherRate}
                isOverTimeCutOffFlag={isOverTimeCutOffFlag}
                setIsOverTimeCutoffFlag={setIsOverTimeCutoffFlag}
                overTimeCode={overTimeCode}
                setOverTimeCode={setOverTimeCode}
                requiredHours={requiredHours}
                setRequiredHours={setRequiredHours}
                overTimeCodeFor2ShiftsDay={overTimeCodeFor2ShiftsDay}
                setOverTimeCodeFor2ShiftsDay={setOverTimeCodeFor2ShiftsDay}
                oTRoundingToTheNearestHourMin={oTRoundingToTheNearestHourMin}
                setOTRoundingToTheNearestHourMin={setOTRoundingToTheNearestHourMin}
                birthdayPay={birthdayPay}
                setBirthdayPay={setBirthdayPay}
                nDBasicRoundingToTheNearestHourMin={nDBasicRoundingToTheNearestHourMin}
                setNDBasicRoundingToTheNearestHourMin={setNDBasicRoundingToTheNearestHourMin}
                useOverTimeAuthorization={useOverTimeAuthorization}
                setUseOverTimeAuthorization={setUseOverTimeAuthorization}
                isSpecialOTCompFlag={isSpecialOTCompFlag}
                setIsSpecialOTCompFlag={setIsSpecialOTCompFlag}
                isHolPayLegalFlag={isHolPayLegalFlag}
                setIsHolPayLegalFlag={setIsHolPayLegalFlag}
                isHolPaySpecialFlag={isHolPaySpecialFlag}
                setIsHolPaySpecialFlag={setIsHolPaySpecialFlag}
                compHolPayForMonth={compHolPayForMonth}
                setCompHolPayForMonth={setCompHolPayForMonth}
                compHolPayIfWorkBeforeHolidayRestDay={compHolPayIfWorkBeforeHolidayRestDay}
                setCompHolPayIfWorkBeforeHolidayRestDay={setCompHolPayIfWorkBeforeHolidayRestDay}
                compHolPayIfWorkBeforeHolidayLegalHoliday={compHolPayIfWorkBeforeHolidayLegalHoliday}
                setCompHolPayIfWorkBeforeHolidayLegalHoliday={setCompHolPayIfWorkBeforeHolidayLegalHoliday}
                compHolPayIfWorkBeforeHolidaySpecialHoliday={compHolPayIfWorkBeforeHolidaySpecialHoliday}
                setCompHolPayIfWorkBeforeHolidaySpecialHoliday={setCompHolPayIfWorkBeforeHolidaySpecialHoliday}
                noPayIfAbsentBeforeHoliday={noPayIfAbsentBeforeHoliday}
                setNoPayIfAbsentBeforeHoliday={setNoPayIfAbsentBeforeHoliday}
                noPayIfAbsentAfterHoliday={noPayIfAbsentAfterHoliday}
                setNoPayIfAbsentAfterHoliday={setNoPayIfAbsentAfterHoliday}
                compHolidayWithPaidLeave={compHolidayWithPaidLeave}
                setCompHolidayWithPaidLeave={setCompHolidayWithPaidLeave}
                minimumNoOfHrsRequiredToCompHol={minimumNoOfHrsRequiredToCompHol}
                setMinimumNoOfHrsRequiredToCompHol={setMinimumNoOfHrsRequiredToCompHol}
                compFirstRestdayHoliday={compFirstRestdayHoliday}
                setCompFirstRestdayHoliday={setCompFirstRestdayHoliday}

                minimumOTHours={minOTHrs}
                setMinimumOTHours={setMinOTHrs}
                accumOTHrsToEarnMealAllow={accumOTHrsToEarnMealAllow}
                setAccumOTHrsToEarnMealAllow={setAccumOTHrsToEarnMealAllow}
                dayType={dayType}
                setDayType={setDayType}
                amount={amount}
                setAmount={setAmount}
                earningCode={earningCode}
                setEarningCode={setEarningCode}
                oTAllowancesList={oTAllowancesList}
                setOTAllowancesList={setOTAllowancesList}
                id={oTAllowanceseID}
                setID={setOTAllowancesID}
                groupCode={oTAllowancesGroupCode}
                setGroupCode={setOTAllowancesGroupCode}
              />
            )}

            {/* Tab Content - Other Policies */}
            {activeTab === "other" && (
              <OtherPoliciesTabContent
                tksGroupCode={tksGroupCode}
                tksGroupDescription={tksGroupDescription}
                isEditMode={isEditMode}
              />
            )}

            {activeTab === "system" && (
              <div className="space-y-6">
                {/* Use Timekeeping System Config */}
                <div className="flex items-start gap-3">
                  <label className="text-gray-700 text-sm">
                    Use Timekeeping System Config :
                  </label>
                  <input
                    type="checkbox"
                    checked={useTimekeepingSystemConfig}
                    onChange={(e) =>
                      setUseTimekeepingSystemConfig(e.target.checked)
                    }
                    disabled={!isEditMode}
                    className="w-4 h-4 mt-1"
                  />
                </div>

                {/* No. of Min. Before the Shift */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm">
                      No. of Min. Before the Shift :
                    </label>
                    <input
                      type="number"
                      value={minBeforeShift}
                      onChange={(e) => setMinBeforeShift(e.target.value)}
                      readOnly={!isEditMode}
                      className={`w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
                    />
                  </div>
                  <ul className="ml-6 space-y-1">
                    <li className="text-green-600 text-sm">
                      • Used in Validate Logs in Import {">"} Update Raw Data
                    </li>
                  </ul>
                </div>

                {/* No. of Min. to Ignore Multiple Break Out/In */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm">
                      No. of Min. to Ignore Multiple Break Out/In :
                    </label>
                    <input
                      type="number"
                      value={minIgnoreMultipleBreak}
                      onChange={(e) => setMinIgnoreMultipleBreak(e.target.value)}
                      readOnly={!isEditMode}
                      className={`w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
                    />
                  </div>
                  <ul className="ml-6 space-y-1">
                    <li className="text-green-600 text-sm">
                      • This will be triggered when your Device Policy is Device
                      4
                    </li>
                    <li className="text-green-600 text-sm">
                      During pairing of Breaks The system will ignore Multiple
                      breaks when the difference of break is equal or less than
                      to defined policy.
                    </li>
                  </ul>
                </div>

                {/* No. of Min. Before Midnight Shift */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm">
                      No. of Min. Before Midnight Shift :
                    </label>
                    <input
                      type="text"
                      value={minBeforeMidnightShift}
                      onChange={(e) => setMinBeforeMidnightShift(e.target.value)}
                      readOnly={!isEditMode}
                      className={`w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
                    />
                  </div>
                  <ul className="ml-6 space-y-1">
                    <li className="text-green-600 text-sm">
                      • This will be triggered when Midnight Shift is check in
                      workshift.
                    </li>
                  </ul>
                </div>

                {/* No of Min. to Consider Break2 In */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm">
                      No of Min. to Consider Break2 In :
                    </label>
                    <input
                      type="text"
                      value={minConsiderBreak2In}
                      onChange={(e) => setMinConsiderBreak2In(e.target.value)}
                      readOnly={!isEditMode}
                      className={`w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
                    />
                  </div>
                  <ul className="ml-6 space-y-1">
                    <li className="text-green-600 text-sm">
                      • This is the number of minutes to consider as the pair of
                      Break 2 Out, this is used in Device 5.
                    </li>
                  </ul>
                </div>

                {/* Device Policy */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm">
                      Device Policy :
                    </label>
                    <input
                      type="text"
                      value={devicePolicy}
                      onChange={(e) => setDevicePolicy(e.target.value)}
                      readOnly={!isEditMode}
                      className={`w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
                    />
                  </div>
                  <ul className="ml-6 space-y-1">
                    <li className="text-green-600 text-sm">
                      • Leave blank if you want the default pairing of logs.
                    </li>
                  </ul>
                </div>

                {/* Device Policy Descriptions */}
                <div className="ml-6 space-y-3 text-sm">
                  <div>
                    <div className="text-green-600">
                      <strong>Device 1</strong> - First In Last Out Regardless
                      of flagging
                    </div>
                  </div>

                  <div>
                    <div className="text-green-600 mb-1">
                      <strong>Device 2</strong>
                    </div>
                    <div className="ml-4 space-y-1 text-green-600">
                      <div>First In = Time In</div>
                      <div>Second In = Break2 In</div>
                      <div>First Out = Break2 Out</div>
                      <div>
                        Second Out = Time Out (if no second out First Out will
                        become Time Out)
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-green-600 mb-1">
                      <strong>Device 3</strong>
                    </div>
                    <div className="ml-4 space-y-1 text-green-600">
                      <div>First Flag for Break1Out = Break1Out</div>
                      <div>Second Flag for Break1Out = Break3Out</div>
                      <div>First flag for Break1In = Break1In</div>
                      <div>Last flag for break1In = Break3In</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-green-600 mb-1">
                      <strong>Device 4</strong>
                    </div>
                    <div className="ml-4 space-y-1 text-green-600">
                      <div>First Flag for BreakIn = Break1In</div>
                      <div>Second Flag for BreakIn = Break2In</div>
                      <div>Third Flag for BreakIn = Break3In</div>
                      <div>First Flag for BreakOut = Break1Out</div>
                      <div>Second Flag for BreakOut = Break2Out</div>
                      <div>Third Flag for BreakOut = Break3Out</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-green-600">
                      <strong>Device 5</strong>
                      <br />
                      If there is First Flag of any Break before Any flag of
                      In/Out, Flagging of In/Out will always be Out.
                    </div>
                  </div>

                  <div>
                    <div className="text-green-600">
                      <strong>Device 6</strong>
                      <br />
                      From Windows Validation.
                    </div>
                  </div>

                  <div>
                    <div className="text-green-600">
                      <strong>Device 7</strong>
                      <br />
                      All Logs that falls on 6:00am Current Date to 5:59am the
                      next day will be paired to Current Date
                    </div>
                  </div>

                  <div>
                    <div className="text-green-600">
                      <strong>Device 8</strong>
                      <br />
                      24 Hours Pairing
                    </div>
                  </div>

                  <div>
                    <div className="text-green-600">
                      <strong>Device 9</strong>
                      <br />
                      Standard pairing but First Time Out will pair
                    </div>
                  </div>

                  <div>
                    <div className="text-green-600">
                      <strong>Device 10</strong>
                      <br />
                      First In of the current day and last out before first in
                      of next day
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* TKS Group Search Modal */}
          {showTksGroupModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
              onClick={() => setShowTksGroupModal(false)}
            >
              <div
                className="bg-white rounded-lg shadow-2xl w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800">
                    TKS Group
                  </h2>
                  <button
                    onClick={() => setShowTksGroupModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search Input */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <label className="text-gray-700 font-medium">Search:</label>
                    <input
                      type="text"
                      value={tksGroupSearchTerm}
                      onChange={(e) => setTksGroupSearchTerm(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search by code or description..."
                    />
                  </div>
                </div>

                {/* Table */}
                <div
                  className="px-6 py-4"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <table className="w-full">
                    <thead className="border-b-2 border-gray-300">
                      <tr>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          <div className="flex items-center gap-1">
                            Code
                            <span className="text-blue-600">▲</span>
                          </div>
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Desc
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedGroups.map((item, index) => (
                        <tr
                          key={item.id}
                          className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                          onClick={async () => {
                            setTksGroupCode(item.tksGroupCode);
                            setTksGroupDescription(item.description);
                            setPayrollDescription(item.description);
                            setPayrollLocationCode(item.tksGroupCode);
                            setcutOffPeriod(item.cutOffDatePeriod);
                            const monthIndex =
                              parseInt(item.cutOffDateMonth, 10) - 1;
                            setCutOffMonth(months[monthIndex] || "");

                            const latestPolicy =
                              (await fetchGroupSetupLoginPolicyData(
                                item.tksGroupCode,
                              )) as LoginPolicyItem;
                            if (latestPolicy)
                              populateFromGroupSetupLoginPolicy(latestPolicy);

                            setShowTksGroupModal(false);
                          }}
                        >
                          <td className="py-2 text-gray-800">
                            {item.tksGroupCode}
                          </td>
                          <td className="py-2 text-gray-800">
                            {item.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-3 px-6 pb-4">
                  <div className="text-gray-600 text-xs">
                    Showing{" "}
                    {filteredGroups.length === 0 ? 0 : startGroupIndex + 1} to{" "}
                    {Math.min(endGroupIndex, filteredGroups.length)} of{" "}
                    {filteredGroups.length} entries
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        setCurrentGroupPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentGroupPage === 1}
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {getGroupPageNumbers().map((page, idx) =>
                      page === "..." ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-1 text-gray-500 text-xs"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentGroupPage(page as number)}
                          className={`px-2 py-1 rounded text-xs ${
                            currentGroupPage === page
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}

                    <button
                      onClick={() =>
                        setCurrentGroupPage((prev) =>
                          Math.min(prev + 1, totalGroupPages),
                        )
                      }
                      disabled={
                        currentGroupPage === totalGroupPages ||
                        totalGroupPages === 0
                      }
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* Close Button */}
                <div className="px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowTksGroupModal(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payroll Location Search Modal */}
          {showPayrollLocationModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
              onClick={() => setShowPayrollLocationModal(false)}
            >
              <div
                className="bg-white rounded-lg shadow-2xl w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Payroll Location
                  </h2>
                  <button
                    onClick={() => setShowPayrollLocationModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search Input */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <label className="text-gray-700 font-medium">Search:</label>
                    <input
                      type="text"
                      value={payrollLocationSearchTerm}
                      onChange={(e) => setPayrollLocationSearchTerm(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search by code or description..."
                    />
                  </div>
                </div>

                {/* Table */}
                <div
                  className="px-6 py-4"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <table className="w-full">
                    <thead className="border-b-2 border-gray-300">
                      <tr>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          <div className="flex items-center gap-1">
                            Code
                            <span className="text-blue-600">▲</span>
                          </div>
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Desc
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPayrollLocations.map((item, index) => (
                        <tr
                          key={item.id}
                          className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                          onClick={() => {
                            setPayrollDescription(item.locationName);
                            setPayrollLocationCode(item.locationCode);
                            setShowPayrollLocationModal(false);
                          }}
                        >
                          <td className="py-2 text-gray-800">
                            {item.locationCode}
                          </td>
                          <td className="py-2 text-gray-800">
                            {item.locationName}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-3 px-6 pb-4">
                  <div className="text-gray-600 text-xs">
                    Showing{" "}
                    {filteredPayrollLocations.length === 0 ? 0 : startPayrollLocationsIndex + 1} to{" "}
                    {Math.min(endPayrollLocationsIndex, filteredPayrollLocations.length)} of{" "}
                    {filteredPayrollLocations.length} entries
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        setCurrentPayrollLocationsPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPayrollLocationsPage === 1}
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {getPayrollLocationsPageNumbers().map((page, idx) =>
                      page === "..." ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-1 text-gray-500 text-xs"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentPayrollLocationsPage(page as number)}
                          className={`px-2 py-1 rounded text-xs ${
                            currentPayrollLocationsPage === page
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}

                    <button
                      onClick={() =>
                        setCurrentPayrollLocationsPage((prev) =>
                          Math.min(prev + 1, totalPayrollLocationsPages),
                        )
                      }
                      disabled={
                        currentPayrollLocationsPage === totalPayrollLocationsPages ||
                        totalPayrollLocationsPages === 0
                      }
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* Close Button */}
                <div className="px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowPayrollLocationModal(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* For Absent Search Modal */}
          {showForAbsentModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
              onClick={() => setShowForAbsentModal(false)}
            >
              <div
                className="bg-white rounded-lg shadow-2xl w-full max-w-4xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Select Code
                  </h2>
                  <button
                    onClick={() => setShowForAbsentModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search Field */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-end gap-3">
                    <label className="text-gray-700">Search:</label>
                    <input
                      type="text"
                      value={forAbsentSearchTerm}
                      onChange={(e) => setForAbsentSearchTerm(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search by code, description, or hours..."
                    />
                  </div>
                </div>

                {/* Table */}
                <div
                  className="px-6 py-4"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <table className="w-full">
                    <thead className="border-b-2 border-gray-300">
                      <tr>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Code
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Description
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Monday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Tuesday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Wednesday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Thursday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Friday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Saturday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Sunday
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEquivDayAbsent.map((item, index) => (
                        <tr
                          key={`${item.id}-${index}`}
                          className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors`}
                          onClick={() => {
                            setForAbsent(item.code);
                            setShowForAbsentModal(false);
                          }}
                        >
                          <td className="py-2 text-gray-800">{item.code}</td>
                          <td className="py-2 text-gray-800">
                            {item.description}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.monday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.tuesday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.wednesday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.thursday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.friday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.saturday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.sunday ?? 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-3 px-6 pb-4">
                  <div className="text-gray-600 text-xs">
                    Showing{" "}
                    {filteredEquivDayAbsent.length === 0
                      ? 0
                      : startEquivDayAbsentIndex + 1}{" "}
                    to {Math.min(endEquivDayAbsentIndex, filteredEquivDayAbsent.length)}{" "}
                    of {filteredEquivDayAbsent.length} entries
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        setCurrentEquivDayAbsentPage((prev) =>
                          Math.max(prev - 1, 1),
                        )
                      }
                      disabled={currentEquivDayAbsentPage === 1}
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {getEquivDayAbsentPageNumbers().map((page, idx) =>
                      typeof page === "string" ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-1 text-gray-500 text-xs"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentEquivDayAbsentPage(page)}
                          className={`px-2 py-1 rounded text-xs ${
                            currentEquivDayAbsentPage === page
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}

                    <button
                      onClick={() =>
                        setCurrentEquivDayAbsentPage((prev) =>
                          Math.min(prev + 1, totalEquivDayAbsentPages),
                        )
                      }
                      disabled={
                        currentEquivDayAbsentPage ===
                          totalEquivDayAbsentPages ||
                        totalEquivDayAbsentPages === 0
                      }
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* For No Login Search Modal */}
          {showForNoLoginModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
              onClick={() => setShowForNoLoginModal(false)}
            >
              <div
                className="bg-white rounded-lg shadow-2xl w-full max-w-4xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Select Code
                  </h2>
                  <button
                    onClick={() => setShowForNoLoginModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search Field */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-end gap-3">
                    <label className="text-gray-700">Search:</label>
                    <input
                      type="text"
                      value={forNoLoginSearchTerm}
                      onChange={(e) => setForNoLoginSearchTerm(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder=""
                    />
                  </div>
                </div>

                {/* Table */}
                <div
                  className="px-6 py-4"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <table className="w-full">
                    <thead className="border-b-2 border-gray-300">
                      <tr>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          <div className="flex items-center gap-1">
                            Code
                            <span className="text-blue-600">▲</span>
                          </div>
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Description
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Monday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Tuesday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Wednesday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Thursday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Friday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Saturday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Sunday
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEquivDayNoLogin.map((item, index) => (//dito yun
                        <tr
                          key={`${item.id}-${index}`}
                          className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors`}
                          onClick={() => {
                            setForNoLogin(item.code);
                            setShowForNoLoginModal(false);
                          }}
                        >
                          <td className="py-2 text-gray-800">{item.code}</td>
                          <td className="py-2 text-gray-800">
                            {item.description}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.monday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.tuesday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.wednesday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.thursday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.friday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.saturday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.sunday ?? 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-3 px-6 pb-4">
                  <div className="text-gray-600 text-xs">
                    Showing{" "}
                    {filteredEquivDayNoLogin.length === 0
                      ? 0
                      : startEquivDayNoLoginIndex + 1}{" "}
                    to {Math.min(endEquivDayNoLoginIndex, filteredEquivDayNoLogin.length)}{" "}
                    of {filteredEquivDayNoLogin.length} entries
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        setCurrentEquivDayNoLoginPage((prev) =>
                          Math.max(prev - 1, 1),
                        )
                      }
                      disabled={currentEquivDayNoLoginPage === 1}
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {getEquivDayNoLoginPageNumbers().map((page, idx) =>
                      typeof page === "string" ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-1 text-gray-500 text-xs"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentEquivDayNoLoginPage(page)}
                          className={`px-2 py-1 rounded text-xs ${
                            currentEquivDayNoLoginPage === page
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}

                    <button
                      onClick={() =>
                        setCurrentEquivDayNoLoginPage((prev) =>
                          Math.min(prev + 1, totalEquivDayNoLoginPages),
                        )
                      }
                      disabled={
                        currentEquivDayNoLoginPage ===
                          totalEquivDayNoLoginPages ||
                        totalEquivDayNoLoginPages === 0
                      }
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* For No Logout Search Modal */}
          {showForNoLogoutModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
              onClick={() => setShowForNoLogoutModal(false)}
            >
              <div
                className="bg-white rounded-lg shadow-2xl w-full max-w-4xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Select Code
                  </h2>
                  <button
                    onClick={() => setShowForNoLogoutModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search Field */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-end gap-3">
                    <label className="text-gray-700">Search:</label>
                    <input
                      type="text"
                      value={forNoLogoutSearchTerm}
                      onChange={(e) => setForNoLogoutSearchTerm(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder=""
                    />
                  </div>
                </div>

                {/* Table */}
                <div
                  className="px-6 py-4"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <table className="w-full">
                    <thead className="border-b-2 border-gray-300">
                      <tr>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          <div className="flex items-center gap-1">
                            Code
                            <span className="text-blue-600">▲</span>
                          </div>
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Description
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Monday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Tuesday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Wednesday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Thursday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Friday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Saturday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Sunday
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEquivDayNoLogout.map((item, index) => (
                        <tr
                          key={`${item.id}-${index}`}
                          className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors`}
                          onClick={() => {
                            setForNoLogout(item.code);
                            setShowForNoLogoutModal(false);
                          }}
                        >
                          <td className="py-2 text-gray-800">{item.code}</td>
                          <td className="py-2 text-gray-800">
                            {item.description}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.monday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.tuesday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.wednesday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.thursday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.friday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.saturday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.sunday ?? 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-3 px-6 pb-4">
                  <div className="text-gray-600 text-xs">
                    Showing{" "}
                    {filteredEquivDayNoLogout.length === 0
                      ? 0
                      : startEquivDayNoLogoutIndex + 1}{" "}
                    to {Math.min(endEquivDayNoLogoutIndex, filteredEquivDayNoLogout.length)}{" "}
                    of {filteredEquivDayNoLogout.length} entries
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        setCurrentEquivDayNoLogoutPage((prev) =>
                          Math.max(prev - 1, 1),
                        )
                      }
                      disabled={currentEquivDayNoLogoutPage === 1}
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {getEquivDayNoLogoutPageNumbers().map((page, idx) =>
                      typeof page === "string" ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-1 text-gray-500 text-xs"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentEquivDayNoLogoutPage(page)}
                          className={`px-2 py-1 rounded text-xs ${
                            currentEquivDayNoLogoutPage === page
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}

                    <button
                      onClick={() =>
                        setCurrentEquivDayNoLogoutPage((prev) =>
                          Math.min(prev + 1, totalEquivDayNoLogoutPages),
                        )
                      }
                      disabled={
                        currentEquivDayNoLogoutPage ===
                          totalEquivDayNoLogoutPages ||
                        totalEquivDayNoLogoutPages === 0
                      }
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* For No Break 2 In Search Modal */}
          {showForNoBreak2InModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
              onClick={() => setShowForNoBreak2InModal(false)}
            >
              <div
                className="bg-white rounded-lg shadow-2xl w-full max-w-4xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Select Code
                  </h2>
                  <button
                    onClick={() => setShowForNoBreak2InModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search Field */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-end gap-3">
                    <label className="text-gray-700">Search:</label>
                    <input
                      type="text"
                      value={forNoBreak2InSearchTerm}
                      onChange={(e) => setForNoBreak2InSearchTerm(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder=""
                    />
                  </div>
                </div>

                {/* Table */}
                <div
                  className="px-6 py-4"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <table className="w-full">
                    <thead className="border-b-2 border-gray-300">
                      <tr>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          <div className="flex items-center gap-1">
                            Code
                            <span className="text-blue-600">▲</span>
                          </div>
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Description
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Monday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Tuesday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Wednesday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Thursday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Friday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Saturday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Sunday
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEquivDayNoBreak2In.map((item, index) => (
                        <tr
                          key={`${item.id}-${index}`}
                          className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors`}
                          onClick={() => {
                            setForNoBreak2In(item.code);
                            setShowForNoBreak2InModal(false);
                          }}
                        >
                          <td className="py-2 text-gray-800">{item.code}</td>
                          <td className="py-2 text-gray-800">
                            {item.description}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.monday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.tuesday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.wednesday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.thursday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.friday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.saturday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.sunday ?? 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-3 px-6 pb-4">
                  <div className="text-gray-600 text-xs">
                    Showing{" "}
                    {filteredEquivDayNoBreak2In.length === 0
                      ? 0
                      : startEquivDayNoBreak2InIndex + 1}{" "}
                    to {Math.min(endEquivDayNoBreak2InIndex, filteredEquivDayNoBreak2In.length)}{" "}
                    of {filteredEquivDayNoBreak2In.length} entries
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        setCurrentEquivDayForNoBreak2InPage((prev) =>
                          Math.max(prev - 1, 1),
                        )
                      }
                      disabled={currentEquivDayForNoBreak2InPage === 1}
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {getEquivDayNoBreak2InPageNumbers().map((page, idx) =>
                      typeof page === "string" ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-1 text-gray-500 text-xs"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentEquivDayForNoBreak2InPage(page)}
                          className={`px-2 py-1 rounded text-xs ${
                            currentEquivDayForNoBreak2InPage === page
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}

                    <button
                      onClick={() =>
                        setCurrentEquivDayForNoBreak2InPage((prev) =>
                          Math.min(prev + 1, totalEquivDayNoBreak2InPages),
                        )
                      }
                      disabled={
                        currentEquivDayForNoBreak2InPage ===
                          totalEquivDayNoBreak2InPages ||
                        totalEquivDayNoBreak2InPages === 0
                      }
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* For No Break 2 In Search Modal */}
          {showForNoBreak2OutModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
              onClick={() => setShowForNoBreak2OutModal(false)}
            >
              <div
                className="bg-white rounded-lg shadow-2xl w-full max-w-4xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Select Code
                  </h2>
                  <button
                    onClick={() => setShowForNoBreak2OutModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search Field */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-end gap-3">
                    <label className="text-gray-700">Search:</label>
                    <input
                      type="text"
                      value={forNoBreak2OutSearchTerm}
                      onChange={(e) => setForNoBreak2OutSearchTerm(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder=""
                    />
                  </div>
                </div>

                {/* Table */}
                <div
                  className="px-6 py-4"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <table className="w-full">
                    <thead className="border-b-2 border-gray-300">
                      <tr>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          <div className="flex items-center gap-1">
                            Code
                            <span className="text-blue-600">▲</span>
                          </div>
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Description
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Monday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Tuesday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Wednesday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Thursday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Friday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Saturday
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Sunday
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEquivDayNoBreak2Out.map((item, index) => (
                        <tr
                          key={`${item.id}-${index}`}
                          className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors`}
                          onClick={() => {
                            setForNoBreak2Out(item.code);
                            setShowForNoBreak2OutModal(false);
                          }}
                        >
                          <td className="py-2 text-gray-800">{item.code}</td>
                          <td className="py-2 text-gray-800">
                            {item.description}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.monday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.tuesday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.wednesday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.thursday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.friday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.saturday ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.sunday ?? 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-3 px-6 pb-4">
                  <div className="text-gray-600 text-xs">
                    Showing{" "}
                    {filteredEquivDayNoBreak2Out.length === 0
                      ? 0
                      : startEquivDayNoBreak2OutIndex + 1}{" "}
                    to {Math.min(endEquivDayNoBreak2OutIndex, filteredEquivDayNoBreak2Out.length)}{" "}
                    of {filteredEquivDayNoBreak2Out.length} entries
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        setCurrentEquivDayForNoBreak2OutPage((prev) =>
                          Math.max(prev - 1, 1),
                        )
                      }
                      disabled={currentEquivDayForNoBreak2OutPage === 1}
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {getEquivDayNoBreak2OutPageNumbers().map((page, idx) =>
                      typeof page === "string" ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-1 text-gray-500 text-xs"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentEquivDayForNoBreak2OutPage(page)}
                          className={`px-2 py-1 rounded text-xs ${
                            currentEquivDayForNoBreak2OutPage === page
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}

                    <button
                      onClick={() =>
                        setCurrentEquivDayForNoBreak2OutPage((prev) =>
                          Math.min(prev + 1, totalEquivDayNoBreak2OutPages),
                        )
                      }
                      disabled={
                        currentEquivDayForNoBreak2OutPage ===
                          totalEquivDayNoBreak2OutPages ||
                        totalEquivDayNoBreak2OutPages === 0
                      }
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Supervisory Group Search Modal */}
          {showSupervisoryGroupModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
              onClick={() => setShowSupervisoryGroupModal(false)}
            >
              <div
                className="bg-white rounded-lg shadow-2xl w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Supervisory Group
                  </h2>
                  <button
                    onClick={() => setShowSupervisoryGroupModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <label className="text-gray-700 font-medium">Search:</label>
                    <input
                      type="text"
                      value={supervisoryGroupSearchTerm}
                      onChange={(e) => {
                        setSupervisoryGroupSearchTerm(e.target.value);
                        setCurrentSupervisoryPage(1);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search by code or description..."
                    />
                  </div>
                </div>

                {/* Table */}
                <div
                  className="px-6 py-4"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <table className="w-full">
                    <thead className="border-b-2 border-gray-300">
                      <tr>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Code
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSupervisoryGroups.map((item, index) => (
                        <tr
                          key={item.id}
                          className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                          onClick={() => {
                            setSupervisoryGroupCode(item.tksGroupCode);
                            setShowSupervisoryGroupModal(false);
                          }}
                        >
                          <td className="py-2 text-gray-800">
                            {item.tksGroupCode}
                          </td>
                          <td className="py-2 text-gray-800">
                            {item.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-3 px-6 pb-4">
                  <div className="text-gray-600 text-xs">
                    Showing{" "}
                    {filteredSupervisoryGroups.length === 0
                      ? 0
                      : startSupervisoryIndex + 1}{" "}
                    to{" "}
                    {Math.min(
                      endSupervisoryIndex,
                      filteredSupervisoryGroups.length,
                    )}{" "}
                    of {filteredSupervisoryGroups.length} entries
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        setCurrentSupervisoryPage((prev) =>
                          Math.max(prev - 1, 1),
                        )
                      }
                      disabled={currentSupervisoryPage === 1}
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50"
                    >
                      Previous
                    </button>

                    {getSupervisoryPageNumbers().map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentSupervisoryPage(page)}
                        className={`px-2 py-1 rounded text-xs ${
                          currentSupervisoryPage === page
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setCurrentSupervisoryPage((prev) =>
                          Math.min(prev + 1, totalSupervisoryPages),
                        )
                      }
                      disabled={
                        currentSupervisoryPage === totalSupervisoryPages ||
                        totalSupervisoryPages === 0
                      }
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* Close */}
                <div className="px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowSupervisoryGroupModal(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* OT Code Per Week Search Modal */}
          {showOtCodeModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
              onClick={() => {
                setIsEditOTRates(false);
                setShowOtCodeModal(false);
                setIsEditOTRatesFor2Shifts(false);
                setIsEditBirthDayPay(false);
              }}
            >
              <div
                className="bg-white rounded-lg shadow-2xl w-full max-w-4xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Search
                  </h2>
                  <button
                    onClick={() => {
                      setIsEditOTRates(false);
                      setShowOtCodeModal(false);
                      setIsEditOTRatesFor2Shifts(false);
                      setIsEditBirthDayPay(false);
                    }}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Overtime Code Title and Search */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-blue-600 mb-3">Overtime Code</h3>
                  <div className="flex items-center justify-end gap-3">
                    <label className="text-gray-700">Search:</label>
                    <input
                      type="text"
                      value={otCodeSearchTerm}
                      onChange={(e) => setOtCodeSearchTerm(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder=""
                    />
                  </div>
                </div>

                {/* Table */}
                <div
                  className="px-6 py-4"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <table className="w-full">
                    <thead className="border-b-2 border-gray-300">
                      <tr>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          <div className="flex items-center gap-1">
                            Code
                            <span className="text-blue-600">▲</span>
                          </div>
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Description
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Rate
                        </th>
                        <th className="text-left py-2 text-gray-700 font-semibold">
                          Default Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOtCodes.map((item, index) => (
                        <tr
                          key={item.oTFileSetupID}
                          className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                          onClick={() => {
                            if (isEditOTRates) {
                              setOverTimeCode(item.oTFileSetupCode);
                            } else if (isEditOTRatesFor2Shifts) {
                              setOverTimeCodeFor2ShiftsDay(item.oTFileSetupCode);
                            }  else if (isEditBirthDayPay) {
                              setBirthdayPay(item.oTFileSetupCode);
                            } else {
                              setOtCodePerWeek(item.oTFileSetupCode);
                            }
                            setIsEditOTRates(false);
                            setIsEditOTRatesFor2Shifts(false);
                            setIsEditBirthDayPay(false);
                            setShowOtCodeModal(false);
                          }}
                        >
                          <td className="py-2 text-gray-800">
                            {item.oTFileSetupCode}
                          </td>
                          <td className="py-2 text-gray-800">
                            {item.description}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.rateOne ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 text-gray-800">
                            {Number(item.defaultAmount ?? 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-3 px-6 pb-4">
                  <div className="text-gray-600 text-xs">
                    Showing{" "}
                    {filteredOtCodes.length === 0 ? 0 : startOtCodesIndex + 1} to{" "}
                    {Math.min(endOtCodesIndex, filteredOtCodes.length)} of{" "}
                    {filteredOtCodes.length} entries
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        setCurrentOtCodePerWeekPage((prev) =>
                          Math.max(prev - 1, 1),
                        )
                      }
                      disabled={currentOtCodePerWeekPage === 1}
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {getOtCodesPageNumbers().map((page, idx) =>
                      typeof page === "string" ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-1 text-gray-500 text-xs"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentOtCodePerWeekPage(page)}
                          className={`px-2 py-1 rounded text-xs ${
                            currentOtCodePerWeekPage === page
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}

                    <button
                      onClick={() =>
                        setCurrentOtCodePerWeekPage((prev) =>
                          Math.min(prev + 1, totalOtCodesPages),
                        )
                      }
                      disabled={
                        currentOtCodePerWeekPage === totalOtCodesPages ||
                        totalOtCodesPages === 0
                      }
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
