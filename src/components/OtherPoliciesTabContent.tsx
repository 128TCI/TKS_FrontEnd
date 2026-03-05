import { Code, Search, X } from "lucide-react";
import {
  use,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import apiClient from "../services/apiClient";
import { useTablePagination } from "../hooks/useTablePagination";
import Swal from "sweetalert2";

interface OtherPoliciesTabContentProps {
  tksGroupCode: string;
  tksGroupDescription: string;
  isEditMode: boolean;
  isCreateNew: boolean;
}

export interface OtherPoliciesTabContentHandle {
  handleSave: () => Promise<void>;
  handleSaveNew: () => Promise<void>;
  handleDelete: () => Promise<void>;
}

export interface GroupSetUpOtherPoliciesItem {
  id: number;
  groupCode: string;
  useDefRestDay?: boolean;
  defRestDay1?: string;
  defRestDay2?: string;
  defRestDay3?: string;
  useTardBracket?: boolean;
  useUndertimeBracket?: boolean;
  exempTard?: boolean;
  exempUndertime?: boolean;
  exempNightDiffBasic?: boolean;
  exempOT?: boolean;
  exempAbsences?: boolean;
  exempOtherEarnAndAllowance?: boolean;
  exempHolidaypay?: boolean;
  exempUnProWorkHoliday?: boolean;
  allowMealSubsidyCode?: string;
  allowsMealSubsidyAmount?: string;
  allowMinHoursToBeMealSubsidy?: string;
  transSubsidyCode?: string;
  transSubsidyAmount?: string;
  transSubsidyMinHours?: string;
  weekOTSubsidyCode?: string;
  weekOTSubsidyAmount?: string;
  weekOTMinHours?: string;
  restDayOTSubsidyCode?: string;
  restDayOTSubsidyAmount?: string;
  restDayOTSubsidyMinHours?: string;
  legalHolidayOTSubsidyCode?: string;
  legalHolidayOTSubsidyAmount?: string;
  legalHolidayOTSubsidyMinHours?: string;
  specialHolidayOTSubsidyCode?: string;
  specialHolidayOTSubsidyAmount?: string;
  specialHolidayOTSubsidyMinHours?: string;
  dailySchedule?: string;
  useAutoAssignedShift?: boolean;
  numHoursBefore?: string;
  numHoursAfter?: string;
  unprodWorkOnHoliday?: boolean;
  restDayWithWorkShift?: boolean;
  numWorkHrsPerPeriodPerMosCode?: string;
  allowPerClassCode?: string;
  basedonFixedNoDaysRule?: boolean;
  regOTSubsidyCode?: string;
  regOTSubsidyAmount?: string;
  regOTSubsidyTime?: string;
  regOTSubsidyShift?: string;
  birthdayLeave?: boolean;
  useOvertimeBracket?: boolean;
  tardBracketCode?: string;
  underTimeBracketCode?: string;
  enableClassification?: boolean;
  accumulation?: boolean;
  accumulateUndertime?: boolean;
  useAccumBracket?: boolean;
  accumulationBracketYear?: string;
  undertimeToAbsences?: boolean;
  noOfHoursFrmUnderToAbsences?: string;
  tardinessToAbsences?: boolean;
  noOfHoursFrmTardiToAbsences?: string;
  compNoOfHoursEvnWOutLog?: boolean;
  allowBracketCode?: string;
  calamYearsOfService?: number;
  calamConsiderNoOfHours?: number;
  calamAmount?: number;
  calamEarnCode?: string;
  compAbsDateSeparated?: boolean;
  compNoOfHoursRD?: boolean;
  compNoOfHoursLegal?: boolean;
  compNoOfHoursSpecial?: boolean;
  compNoOfHoursNonWork?: boolean;
  noAbsBeforeDateHired?: boolean;
  applyLeaveForFirstHalfExempt?: boolean;
  applyLeaveForSecondHalfExempt?: boolean;
  excludeRestDayInSuspension?: boolean;
  excludeLegalInSuspension?: boolean;
  excludeSpecialInSuspension?: boolean;
  excludeNonWorkingInSuspension?: boolean;
  deductFirstHalfBeforeBracket?: boolean;
  deductSecondHalfBeforeBracket?: boolean;
  byEmploymentStatFlag?: boolean;
  employmentStatus?: string;
}

interface BracketItem {
  id: number;
  bracketCode: string;
  description: string;
  flag: number;
}

interface DailySchedItem {
  dailyScheduleId: number;
  referenceNo: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

interface EarningCodeItem {
  earnID: number;
  earnCode: string;
  earnDesc: string;
  earnType: string;
  sysID: string;
}

interface AllowancePerClass {
  id: number;
  refNo: string;
  allowanceCode: string;
  workShiftCode: string;
  classificationCode: string;
}

interface AllowBracketCodeItem {
  id: number;
  code: string;
  description: string;
}

interface AllowanceBracketingSetupItem {
  id: number;
  code: string;
  description: string;
}

export const OtherPoliciesTabContent = forwardRef<
  OtherPoliciesTabContentHandle,
  OtherPoliciesTabContentProps
>(({ tksGroupCode, tksGroupDescription, isEditMode, isCreateNew }, ref) => {
  const checkboxClass =
    "w-4 h-4 border-2 border-gray-400 rounded bg-white checked:bg-blue-600 checked:border-blue-600 cursor-pointer";

  const [groupSetUpOtherPoliciesList, setGroupSetUpOtherPoliciesList] =
    useState<GroupSetUpOtherPoliciesItem[]>([]);

  // Other Policies States
  const [groupCode, setGroupCode] = useState(tksGroupCode);
  const [useDefRestDay, setUseDefRestDay] = useState(false);
  const [restDayWithWorkShift, setRestDayWithWorkShift] = useState(false);
  const [defRestDay1, setDefRestDay1] = useState("");
  const [defRestDay2, setDefRestDay2] = useState("");
  const [defRestDay3, setDefRestDay3] = useState("");
  const [useTardBracket, setUseTardBracket] = useState(false);
  const [tardBracketCode, setTardBracketCode] = useState("");
  const [deductFirstHalfBeforeBracket, setDeductFirstHalfBeforeBracket] =
    useState(false);
  const [useUndertimeBracket, setUseUndertimeBracket] = useState(false);
  const [underTimeBracketCode, setUnderTimeBracketCode] = useState("");
  const [deductSecondHalfBeforeBracket, setDeductSecondHalfBeforeBracket] =
    useState(false);
  const [useAccumBracket, setUseAccumBracket] = useState(false);
  const [accumulationBracketYear, setAccumulationBracketYear] = useState("");
  const [accumulation, setAccumulation] = useState(false);
  const [accumulateUndertime, setAccumulateUndertime] = useState(false);
  const [undertimeToAbsences, setUndertimeToAbsences] = useState(true);
  const [noOfHoursFrmUnderToAbsences, setNoOfHoursFrmUnderToAbsences] =
    useState("3");
  const [tardinessToAbsences, setTardinessToAbsences] = useState(true);
  const [noOfHoursFrmTardiToAbsences, setNoOfHoursFrmTardiToAbsences] =
    useState("4");
  const [compNoOfHoursEvnWOutLog, setCompNoOfHoursEvnWOutLog] = useState(false);
  const [compAbsDateSeparated, setCompAbsDateSeparated] = useState(false);
  const [compNoOfHoursRD, setCompNoOfHoursRD] = useState(false);
  const [compNoOfHoursLegal, setCompNoOfHoursLegal] = useState(false);
  const [compNoOfHoursSpecial, setCompNoOfHoursSpecial] = useState(false);
  const [compNoOfHoursNonWork, setCompNoOfHoursNonWork] = useState(false);
  const [noAbsBeforeDateHired, setNoAbsBeforeDateHired] = useState(false);
  const [exempTard, setExempTard] = useState(false);
  const [exempUndertime, setExempUndertime] = useState(false);
  const [exempNightDiffBasic, setExempNightDiffBasic] = useState(false);
  const [exempOT, setExempOT] = useState(false);
  const [exempAbsences, setExempAbsences] = useState(false);
  const [exempOtherEarnAndAllowance, setExempOtherEarnAndAllowance] =
    useState(false);
  const [exempHolidaypay, setExempHolidaypay] = useState(false);
  const [exempUnProWorkHoliday, setExempUnProWorkHoliday] = useState(false);
  const [applyLeaveForFirstHalfExempt, setApplyLeaveForFirstHalfExempt] =
    useState(true);
  const [applyLeaveForSecondHalfExempt, setApplyLeaveForSecondHalfExempt] =
    useState(true);
  const [birthdayLeave, setBirthdayLeave] = useState(false);
  const [dailySchedule, setDailySchedule] = useState("");
  //const [useAutoAssignedShift, setUseAutoAssignedShift] = useState(false);
  const [excludeRestDayInSuspension, setExcludeRestDayInSuspension] =
    useState(false);
  const [excludeLegalInSuspension, setExcludeLegalInSuspension] =
    useState(false);
  const [excludeSpecialInSuspension, setExcludeSpecialInSuspension] =
    useState(false);
  const [excludeNonWorkingInSuspension, setExcludeNonWorkingInSuspension] =
    useState(false);
  // const [allowMealSubsidyCode, setAllowMealSubsidyCode] = useState("");
  // const [allowsMealSubsidyAmount, setAllowsMealSubsidyAmount] = useState("");
  // const [allowMinHoursToBeMealSubsidy, setAllowMinHoursToBeMealSubsidy] =
  //   useState("");
  // const [transSubsidyCode, setTransSubsidyCode] = useState("");
  // const [transSubsidyAmount, setTransSubsidyAmount] = useState("");
  // const [transSubsidyMinHours, setTransSubsidyMinHours] = useState("");
  // const [weekOTSubsidyCode, setWeekOTSubsidyCode] = useState("");
  // const [weekOTSubsidyAmount, setWeekOTSubsidyAmount] = useState("");
  // const [weekOTMinHours, setWeekOTMinHours] = useState("");
  // const [restDayOTSubsidyCode, setRestDayOTSubsidyCode] = useState("");
  // const [restDayOTSubsidyAmount, setRestDayOTSubsidyAmount] = useState("");
  // const [restDayOTSubsidyMinHours, setRestDayOTSubsidyMinHours] = useState("");
  // const [legalHolidayOTSubsidyCode, setLegalHolidayOTSubsidyCode] =
  //   useState("");
  // const [legalHolidayOTSubsidyAmount, setLegalHolidayOTSubsidyAmount] =
  //   useState("");
  // const [legalHolidayOTSubsidyMinHours, setLegalHolidayOTSubsidyMinHours] =
  //   useState("");
  // const [specialHolidayOTSubsidyCode, setSpecialHolidayOTSubsidyCode] =
  //   useState("");
  // const [specialHolidayOTSubsidyAmount, setSpecialHolidayOTSubsidyAmount] =
  //   useState("");
  // const [specialHolidayOTSubsidyMinHours, setSpecialHolidayOTSubsidyMinHours] =
  //   useState("");
  const [allowPerClassCode, setAllowPerClassCode] = useState("");
  const [enableClassification, setEnableClassification] = useState(false);
  const [allowBracketCode, setAllowBracketCode] = useState("");
  const [byEmploymentStatFlag, setByEmploymentStatFlag] = useState(false);
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [calamYearsOfService, setCalamYearsOfService] = useState(0);
  const [calamConsiderNoOfHours, setCalamConsiderNoOfHours] = useState(0);
  const [calamAmount, setCalamAmount] = useState(0);
  const [calamEarnCode, setCalamEarnCode] = useState("");

  // Bracket States
  const [showTardBrackModal, setShowTardBrackModal] = useState(false);
  const [showUnderTimeBrackModal, setShowUnderTimeBrackModal] = useState(false);
  const [showAccumulateBrackModal, setShowAccumulateBrackModal] =
    useState(false);
  const [showDailySchedModal, setShowDailySchedModal] = useState(false);
  const [showEarningCodeModal, setShowEarningCodeModal] = useState(false);
  const [showAllowPerClassModal, setShowAllowPerClassModal] = useState(false);
  const [showAllowBracketCodeModal, setShowAllowBracketCodeModal] =
    useState(false);
  const [showAllowBrackByEmpStatModal, setShowAllowBrackByEmpStatModal] =
    useState(false);

  const [tardBrackSearchTerm, setTardBrackSearchTerm] = useState("");
  const [underTimeBrackSearchTerm, setUnderTimeBrackSearchTerm] = useState("");
  const [accumulateBrackSearchTerm, setAccumulateBrackSearchTerm] =
    useState("");
  const [dailySchedSearchTerm, setDailySchedSearchTerm] = useState("");
  const [earningCodeSearchTerm, setEarningCodeSearchTerm] = useState("");
  const [allowancePerClassSearchTerm, setAllowancePerClassSearchTerm] =
    useState("");
  const [allowaBracketCodeSearchTerm, setAllowBracketCodeSearchTerm] =
    useState("");
  const [allowBrackByEmpStatSearchTerm, setAllowBrackByEmpStatSearchTerm] =
    useState("");
  const [tardBracketItemList, setTardBracketItemList] = useState<BracketItem[]>(
    [],
  );
  const [undertimeBracketItemList, setUndertimeBracketItemlist] = useState<
    BracketItem[]
  >([]);
  const [accumulateBracketItemList, setAccumulateBracektItemList] = useState<
    BracketItem[]
  >([]);
  const [dailyScheduleList, setDailyScheduleList] = useState<DailySchedItem[]>(
    [],
  );
  const [earningCodeList, setEarningCodesetList] = useState<EarningCodeItem[]>(
    [],
  );
  const [allowancePerClassList, setAllowancePerClassList] = useState<
    AllowancePerClass[]
  >([]);
  const [allowBracketCodeList, setAllowBracketCodeList] = useState<
    AllowBracketCodeItem[]
  >([]);
  const [allowBrackByEmpStatList, setAllowBrackByEmpStatList] = useState<
    AllowanceBracketingSetupItem[]
  >([]);

  const itemsPerPage = 10;

  // Flag Convert to Text Helper
  const getFlagLabel = (flag: number): string => {
    switch (flag) {
      case 1:
        return "TARDINESS";
      case 2:
        return "UNDERTIME";
      case 3:
        return "ACCUMULATE";
      default:
        return "";
    }
  };

  // For Tardiness Bracket Pagination and Search
  const {
    filteredData: filteredTardBracket,
    paginatedData: paginatedTardBracket,
    totalPages: totalTardBracketPages,
    currentPage: currentTardBracketPage,
    setCurrentPage: setCurrentTardBracketPage,
    getPageNumbers: getTardBracketPageNumbers,
  } = useTablePagination(
    tardBracketItemList,
    tardBrackSearchTerm,
    (item, search) =>
      item.bracketCode.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search) ||
      getFlagLabel(item.flag).toLowerCase().includes(search) ||
      Object.values(item).some(
        (val) => typeof val === "number" && val.toFixed(2).includes(search),
      ),
    itemsPerPage,
  );

  const startTardBracketIndex = (currentTardBracketPage - 1) * itemsPerPage;
  const endTardBracketIndex = startTardBracketIndex + itemsPerPage;

  // For Undertime Bracket Pagination and Search
  const {
    filteredData: filteredUTBracket,
    paginatedData: paginatedUTBracket,
    totalPages: totalUTBracketPages,
    currentPage: currentUTBracketPage,
    setCurrentPage: setCurrentUTBracketPage,
    getPageNumbers: getUTBracketPageNumbers,
  } = useTablePagination(
    undertimeBracketItemList,
    underTimeBrackSearchTerm,
    (item, search) =>
      item.bracketCode.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search) ||
      getFlagLabel(item.flag).toLowerCase().includes(search) ||
      Object.values(item).some(
        (val) => typeof val === "number" && val.toFixed(2).includes(search),
      ),
    itemsPerPage,
  );

  const startUTBracketIndex = (currentUTBracketPage - 1) * itemsPerPage;
  const endUTBracketIndex = startUTBracketIndex + itemsPerPage;

  // For Accumulate Bracket Pagination and Search
  const {
    filteredData: filteredACCBracket,
    paginatedData: paginatedACCBracket,
    totalPages: totalACCBracketPages,
    currentPage: currentACCBracketPage,
    setCurrentPage: setCurrentACCBracketPage,
    getPageNumbers: getACCBracketPageNumbers,
  } = useTablePagination(
    accumulateBracketItemList,
    accumulateBrackSearchTerm,
    (item, search) =>
      item.bracketCode.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search) ||
      getFlagLabel(item.flag).toLowerCase().includes(search) ||
      Object.values(item).some(
        (val) => typeof val === "number" && val.toFixed(2).includes(search),
      ),
    itemsPerPage,
  );

  const startACCBracketIndex = (currentACCBracketPage - 1) * itemsPerPage;
  const endACCBracketIndex = startACCBracketIndex + itemsPerPage;

  // Earning Code Pagination and Search
  const {
    filteredData: earningCodeTotalData,
    paginatedData: filteredEarningCodeData,
    totalPages: earningCodeTotalPages,
    currentPage: earningCodeCurrentPage,
    setCurrentPage: setEarningCodeCurrentPage,
    getPageNumbers: getEarningCodePageNumbers,
    startIndex,
    endIndex,
  } = useTablePagination(
    earningCodeList,
    earningCodeSearchTerm,
    (item, search) =>
      item.earnCode?.toLowerCase().includes(search) ||
      item.earnDesc?.toLowerCase().includes(search),
    itemsPerPage,
  );

  const earningCodeStartIndex =
    filteredEarningCodeData.length === 0 ? 0 : startIndex + 1;
  const earningCodeEndIndex =
    filteredEarningCodeData.length === 0 ? 0 : endIndex;

  useEffect(() => {
    setEarningCodeCurrentPage(1);
  }, [earningCodeSearchTerm]);

  // For Daily Schedule Pagination and Search
  const {
    filteredData: filteredAllowPerClass,
    paginatedData: paginatedAllowPerClass,
    totalPages: totalAllowPerClassPages,
    currentPage: currentAllowPerClassPage,
    setCurrentPage: setCurrentAllowPerClassPage,
    getPageNumbers: getAllowPerClassPageNumbers,
  } = useTablePagination(
    allowancePerClassList,
    allowancePerClassSearchTerm,
    (item, search) => {
      const s = search.toLowerCase();
      return (
        (item.refNo?.toLowerCase().includes(s) ?? false) ||
        (item.allowanceCode?.toLowerCase().includes(s) ?? false) ||
        (item.workShiftCode?.toLowerCase().includes(s) ?? false) ||
        (item.classificationCode?.toLowerCase().includes(s) ?? false)
      );
    },
    itemsPerPage,
  );

  const startAllowPerClassIndex = (currentAllowPerClassPage - 1) * itemsPerPage;
  const endAllowPerClassIndex = startAllowPerClassIndex + itemsPerPage;

  // For Daily Schedule Pagination and Search
  const {
    filteredData: filteredDailySched,
    paginatedData: paginatedDailySched,
    totalPages: totalDailySchedPages,
    currentPage: currentDailySchedPage,
    setCurrentPage: setCurrentDailySchedPage,
    getPageNumbers: getDailySchedPageNumbers,
  } = useTablePagination(
    dailyScheduleList,
    dailySchedSearchTerm,
    (item, search) => {
      const s = search.toLowerCase();
      return (
        (item.referenceNo?.toLowerCase().includes(s) ?? false) ||
        (item.monday?.toLowerCase().includes(s) ?? false) ||
        (item.tuesday?.toLowerCase().includes(s) ?? false) ||
        (item.wednesday?.toLowerCase().includes(s) ?? false) ||
        (item.thursday?.toLowerCase().includes(s) ?? false)
      );
    },
    itemsPerPage,
  );

  const startDailySchedIndex = (currentDailySchedPage - 1) * itemsPerPage;
  const endDailySchedIndex = startDailySchedIndex + itemsPerPage;

  // For Allowance Bracket Code Pagination and Search
  const {
    filteredData: filteredAllowBracketCode,
    paginatedData: paginatedAllowBracketCode,
    totalPages: totalAllowBracketCodePages,
    currentPage: currentAllowBracketCodePage,
    setCurrentPage: setCurrentAllowBracketCodePage,
    getPageNumbers: getAllowBracketCodePageNumbers,
  } = useTablePagination(
    allowBracketCodeList,
    allowaBracketCodeSearchTerm,
    (item, search) => {
      const s = search.toLowerCase();
      return (
        (item.code?.toLowerCase().includes(s) ?? false) ||
        (item.description?.toLowerCase().includes(s) ?? false)
      );
    },
    itemsPerPage,
  );

  const startAllowBracketCodeIndex =
    (currentAllowBracketCodePage - 1) * itemsPerPage;
  const endAllowBracketCodeIndex = startAllowBracketCodeIndex + itemsPerPage;

  // For Allowance Bracket Code By Employee Status Pagination and Search
  const {
    filteredData: filteredAllowBrackByEmpStat,
    paginatedData: paginatedAllowBrackByEmpStat,
    totalPages: totalAllowBrackByEmpStatPages,
    currentPage: currentAllowBrackByEmpStatPage,
    setCurrentPage: setCurrentAllowBrackByEmpStatPage,
    getPageNumbers: getAllowBrackByEmpStatPageNumbers,
  } = useTablePagination(
    allowBrackByEmpStatList,
    allowBrackByEmpStatSearchTerm,
    (item, search) => {
      const s = search.toLowerCase();
      return (
        (item.code?.toLowerCase().includes(s) ?? false) ||
        (item.description?.toLowerCase().includes(s) ?? false)
      );
    },
    itemsPerPage,
  );

  const startAllowBrackByEmpStatIndex =
    (currentAllowBrackByEmpStatPage - 1) * itemsPerPage;
  const endAllowBrackByEmpStatIndex =
    startAllowBrackByEmpStatIndex + itemsPerPage;

  // Fetch by GroupCode
  const fetchGroupSetUpOtherPoliciesData = async (
    groupCode: string,
  ): Promise<GroupSetUpOtherPoliciesItem | null> => {
    if (!groupCode) return null;

    try {
      const response = await apiClient.get(
        `/Fs/Process/TimeKeepGroup/GroupSetUpOtherPolicies/ByGroupCode/${groupCode}`,
      );

      if (!response.data) return null;

      const item = response.data;

      return {
        id: item.id,
        groupCode: item.groupCode,

        useDefRestDay: item.useDefRestDay,
        defRestDay1: item.defRestDay1,
        defRestDay2: item.defRestDay2,
        defRestDay3: item.defRestDay3,

        useTardBracket: item.useTardBracket,
        useUndertimeBracket: item.useUndertimeBracket,
        exempTard: item.exempTard,
        exempUndertime: item.exempUndertime,
        exempNightDiffBasic: item.exempNightDiffBasic,
        exempOT: item.exempOT,
        exempAbsences: item.exempAbsences,
        exempOtherEarnAndAllowance: item.exempOtherEarnAndAllowance,
        exempHolidaypay: item.exempHolidaypay,
        exempUnProWorkHoliday: item.exempUnProWorkHoliday,

        allowMealSubsidyCode: item.allowMealSubsidyCode,
        allowsMealSubsidyAmount: item.allowsMealSubsidyAmount,
        allowMinHoursToBeMealSubsidy: item.allowMinHoursToBeMealSubsidy,

        transSubsidyCode: item.transSubsidyCode,
        transSubsidyAmount: item.transSubsidyAmount,
        transSubsidyMinHours: item.transSubsidyMinHours,

        weekOTSubsidyCode: item.weekOTSubsidyCode,
        weekOTSubsidyAmount: item.weekOTSubsidyAmount,
        weekOTMinHours: item.weekOTMinHours,

        restDayOTSubsidyCode: item.restDayOTSubsidyCode,
        restDayOTSubsidyAmount: item.restDayOTSubsidyAmount,
        restDayOTSubsidyMinHours: item.restDayOTSubsidyMinHours,

        legalHolidayOTSubsidyCode: item.legalHolidayOTSubsidyCode,
        legalHolidayOTSubsidyAmount: item.legalHolidayOTSubsidyAmount,
        legalHolidayOTSubsidyMinHours: item.legalHolidayOTSubsidyMinHours,

        specialHolidayOTSubsidyCode: item.specialHolidayOTSubsidyCode,
        specialHolidayOTSubsidyAmount: item.specialHolidayOTSubsidyAmount,
        specialHolidayOTSubsidyMinHours: item.specialHolidayOTSubsidyMinHours,

        dailySchedule: item.dailySchedule,
        useAutoAssignedShift: item.useAutoAssignedShift,

        numHoursBefore: item.numHoursBefore,
        numHoursAfter: item.numHoursAfter,

        unprodWorkOnHoliday: item.unprodWorkOnHoliday,
        restDayWithWorkShift: item.restDayWithWorkShift,

        numWorkHrsPerPeriodPerMosCode: item.numWorkHrsPerPeriodPerMosCode,
        allowPerClassCode: item.allowPerClassCode,
        basedonFixedNoDaysRule: item.basedonFixedNoDaysRule,

        regOTSubsidyCode: item.regOTSubsidyCode,
        regOTSubsidyAmount: item.regOTSubsidyAmount,
        regOTSubsidyTime: item.regOTSubsidyTime,
        regOTSubsidyShift: item.regOTSubsidyShift,

        birthdayLeave: item.birthdayLeave,
        useOvertimeBracket: item.useOvertimeBracket,

        tardBracketCode: item.tardBracketCode,
        underTimeBracketCode: item.underTimeBracketCode,

        enableClassification: item.enableClassification,
        accumulation: item.accumulation,
        accumulateUndertime: item.accumulateUndertime,
        useAccumBracket: item.useAccumBracket,

        accumulationBracketYear: item.accumulationBracketYear,

        undertimeToAbsences: item.undertimeToAbsences,
        noOfHoursFrmUnderToAbsences: item.noOfHoursFrmUnderToAbsences,

        tardinessToAbsences: item.tardinessToAbsences,
        noOfHoursFrmTardiToAbsences: item.noOfHoursFrmTardiToAbsences,

        compNoOfHoursEvnWOutLog: item.compNoOfHoursEvnWOutLog,
        allowBracketCode: item.allowBracketCode,

        calamYearsOfService: item.calamYearsOfService,
        calamConsiderNoOfHours: item.calamConsiderNoOfHours,
        calamAmount: item.calamAmount,
        calamEarnCode: item.calamEarnCode,

        compAbsDateSeparated: item.compAbsDateSeparated,
        compNoOfHoursRD: item.compNoOfHoursRD,
        compNoOfHoursLegal: item.compNoOfHoursLegal,
        compNoOfHoursSpecial: item.compNoOfHoursSpecial,
        compNoOfHoursNonWork: item.compNoOfHoursNonWork,

        noAbsBeforeDateHired: item.noAbsBeforeDateHired,
        applyLeaveForFirstHalfExempt: item.applyLeaveForFirstHalfExempt,
        applyLeaveForSecondHalfExempt: item.applyLeaveForSecondHalfExempt,

        excludeRestDayInSuspension: item.excludeRestDayInSuspension,
        excludeLegalInSuspension: item.excludeLegalInSuspension,
        excludeSpecialInSuspension: item.excludeSpecialInSuspension,
        excludeNonWorkingInSuspension: item.excludeNonWorkingInSuspension,

        deductFirstHalfBeforeBracket: item.deductFirstHalfBeforeBracket,
        deductSecondHalfBeforeBracket: item.deductSecondHalfBeforeBracket,

        byEmploymentStatFlag: item.byEmploymentStatFlag,
        employmentStatus: item.employmentStatus,
      };
    } catch (error) {
      console.error("Error fetching GroupSetUpOtherPolicies:", error);
      return null;
    }
  };

  const populateGroupSetUpOtherPolicies = (
    item: GroupSetUpOtherPoliciesItem,
  ) => {
    setUseDefRestDay(item.useDefRestDay ?? false);
    setRestDayWithWorkShift(item.restDayWithWorkShift ?? false);
    setDefRestDay1(item.defRestDay1 ?? "");
    setDefRestDay2(item.defRestDay2 ?? "");
    setDefRestDay3(item.defRestDay3 ?? "");
    setUseTardBracket(item.useTardBracket ?? false);
    setTardBracketCode(item.tardBracketCode ?? "");
    setDeductFirstHalfBeforeBracket(item.deductFirstHalfBeforeBracket ?? false);
    setUseUndertimeBracket(item.useUndertimeBracket ?? false);
    setUnderTimeBracketCode(item.underTimeBracketCode ?? "");
    setDeductSecondHalfBeforeBracket(
      item.deductSecondHalfBeforeBracket ?? false,
    );
    setUseAccumBracket(item.useAccumBracket ?? false);
    setAccumulationBracketYear(item.accumulationBracketYear ?? "");
    setAccumulation(item.accumulation ?? false);
    setAccumulateUndertime(item.accumulateUndertime ?? false);
    setUndertimeToAbsences(item.undertimeToAbsences ?? false);
    setNoOfHoursFrmUnderToAbsences(
      item.noOfHoursFrmUnderToAbsences?.toString() ?? "0",
    );
    setTardinessToAbsences(item.tardinessToAbsences ?? false);
    setNoOfHoursFrmTardiToAbsences(
      item.noOfHoursFrmTardiToAbsences?.toString() ?? "0",
    );
    setCompNoOfHoursEvnWOutLog(item.compNoOfHoursEvnWOutLog ?? false);
    setCompAbsDateSeparated(item.compAbsDateSeparated ?? false);
    setCompNoOfHoursRD(item.compNoOfHoursRD ?? false);
    setCompNoOfHoursLegal(item.compNoOfHoursLegal ?? false);
    setCompNoOfHoursSpecial(item.compNoOfHoursSpecial ?? false);
    setCompNoOfHoursNonWork(item.compNoOfHoursNonWork ?? false);
    setNoAbsBeforeDateHired(item.noAbsBeforeDateHired ?? false);
    setExempTard(item.exempTard ?? false);
    setExempUndertime(item.exempUndertime ?? false);
    setExempNightDiffBasic(item.exempNightDiffBasic ?? false);
    setExempOT(item.exempOT ?? false);
    setExempAbsences(item.exempAbsences ?? false);
    setExempOtherEarnAndAllowance(item.exempOtherEarnAndAllowance ?? false);
    setExempHolidaypay(item.exempHolidaypay ?? false);
    setExempUnProWorkHoliday(item.exempUnProWorkHoliday ?? false);
    setApplyLeaveForFirstHalfExempt(item.applyLeaveForFirstHalfExempt ?? false);
    setApplyLeaveForSecondHalfExempt(
      item.applyLeaveForSecondHalfExempt ?? false,
    );
    setBirthdayLeave(item.birthdayLeave ?? false);
    setDailySchedule(item.dailySchedule ?? "");
    setExcludeRestDayInSuspension(item.excludeRestDayInSuspension ?? false);
    setExcludeLegalInSuspension(item.excludeLegalInSuspension ?? false);
    setExcludeSpecialInSuspension(item.excludeSpecialInSuspension ?? false);
    setExcludeNonWorkingInSuspension(
      item.excludeNonWorkingInSuspension ?? false,
    );
    setCalamYearsOfService(item.calamYearsOfService ?? 0);
    setCalamConsiderNoOfHours(item.calamConsiderNoOfHours ?? 0);
    setCalamAmount(item.calamAmount ?? 0);
    setCalamEarnCode(item.calamEarnCode ?? "");
    setAllowPerClassCode(item.allowPerClassCode ?? "");
    setEnableClassification(item.enableClassification ?? false);
    setAllowBracketCode(item.allowBracketCode ?? "");
    setByEmploymentStatFlag(item.byEmploymentStatFlag ?? false);
    setEmploymentStatus(item.employmentStatus ?? "");
  };

  useEffect(() => {
    const loadOtherPoliciesSetUp = async () => {
      if (!tksGroupCode) return;

      const item = await fetchGroupSetUpOtherPoliciesData(tksGroupCode);

      if (item) {
        setGroupSetUpOtherPoliciesList([item]);
        if (!isCreateNew) populateGroupSetUpOtherPolicies(item);
      } else {
        setGroupSetUpOtherPoliciesList([]);
      }
    };

    loadOtherPoliciesSetUp();
  }, [tksGroupCode, isCreateNew]);

  // Fetch BracketCodeSetUp
  const fetchBracketCodeSetUp = async (
    selectedflag: number,
  ): Promise<BracketItem[]> => {
    const response = await apiClient.get(
      "/Fs/Process/Tardiness/BracketCodeSetup",
    );

    return response.data
      .filter((item: any) => item.flag === selectedflag)
      .map((item: any) => ({
        id: item.id,
        bracketCode: item.bracketCode,
        description: item.description,
        flag: item.flag,
      }));
  };

  // Fetch Daily Schedule API
  const fetchDailyScheduleSetUp = async (): Promise<DailySchedItem[]> => {
    const response = await apiClient.get("/Fs/Process/DailyScheduleSetUp/All");

    return response.data.map((item: any) => ({
      dailyScheduleId: item.dailyScheduleId,
      referenceNo: item.referenceNo,
      monday: item.monday,
      tuesday: item.tuesday,
      wednesday: item.wednesday,
      thursday: item.thursday,
    }));
  };

  // Fetch EarningCodeSetUp
  const fetchEarningCodeSetUp = async (): Promise<EarningCodeItem[]> => {
    const response = await apiClient.get(
      "/Fs/Process/AllowanceAndEarnings/EarningsSetUp",
    );

    return response.data.map((item: any) => ({
      earnID: item.earnID,
      earnCode: item.earnCode,
      earnDesc: item.earnDesc,
      earnType: item.earnType,
      sysID: item.sysId,
    }));
  };

  // Fetch Allowance Per Classification
  const fetchAllowancePerClassificationSetUp = async (): Promise<
    AllowancePerClass[]
  > => {
    const response = await apiClient.get(
      "/Fs/Process/AllowanceAndEarnings/AllowancePerClassificationSetUp",
    );

    return response.data.map((item: any) => ({
      id: item.id,
      refNo: item.refNo,
      allowanceCode: item.allowanceCode,
      workShiftCode: item.workShiftCode,
    }));
  };

  // Fetch Allowance Bracket Code
  const fetchAllowanceBracketCodeSetUp = async (): Promise<
    AllowBracketCodeItem[]
  > => {
    const response = await apiClient.get(
      "/Fs/Process/AllowanceAndEarnings/AllowanceBracketCodeSetUp",
    );

    return response.data.map((item: any) => ({
      id: item.id,
      code: item.code,
      description: item.description,
    }));
  };

  // Fetch Allowance Bracket Code
  const fetchAllowanceBracketingSetUp = async (): Promise<
    AllowanceBracketingSetupItem[]
  > => {
    const response = await apiClient.get(
      "/Fs/Process/AllowanceAndEarnings/AllowanceBracketingSetUp",
    );

    return response.data.map((item: any) => ({
      id: item.id,
      code: item.code,
      description: item.employmentStatus,
    }));
  };

  useEffect(() => {
    const loadAllowanceBracketingSetUpData = async () => {
      const items = await fetchAllowanceBracketingSetUp();
      setAllowBrackByEmpStatList(items);
    };
    loadAllowanceBracketingSetUpData();
  }, []);

  useEffect(() => {
    const loadAllowanceBracketCodeSetUpData = async () => {
      const items = await fetchAllowanceBracketCodeSetUp();
      setAllowBracketCodeList(items);
    };
    loadAllowanceBracketCodeSetUpData();
  }, []);

  useEffect(() => {
    const loadAllowancePerClassificationSetUpData = async () => {
      const items = await fetchAllowancePerClassificationSetUp();
      setAllowancePerClassList(items);
    };
    loadAllowancePerClassificationSetUpData();
  }, []);

  useEffect(() => {
    const loadTardinessBracketCodeSetupData = async () => {
      const tard = await fetchBracketCodeSetUp(1);
      const undertime = await fetchBracketCodeSetUp(2);
      const accumulate = await fetchBracketCodeSetUp(3);
      setTardBracketItemList(tard);
      setUndertimeBracketItemlist(undertime);
      setAccumulateBracektItemList(accumulate);
    };

    loadTardinessBracketCodeSetupData();
  }, []);

  useEffect(() => {
    const loadDailySchedule = async () => {
      const items = await fetchDailyScheduleSetUp();
      setDailyScheduleList(items);
    };
    loadDailySchedule();
  }, [currentDailySchedPage]);

  useEffect(() => {
    const loadEarningCodeSetUp = async () => {
      const items = await fetchEarningCodeSetUp();
      setEarningCodesetList(items);
    };

    loadEarningCodeSetUp();
  }, [earningCodeCurrentPage]);

  const HandleCreateNew = () => {
    if (isCreateNew) {
      setUseDefRestDay(false);
      setRestDayWithWorkShift(false);
      setDefRestDay1("");
      setDefRestDay2("");
      setDefRestDay3("");
      setUseTardBracket(false);
      setTardBracketCode("");
      setDeductFirstHalfBeforeBracket(false);
      setUseUndertimeBracket(false);
      setUnderTimeBracketCode("");
      setDeductSecondHalfBeforeBracket(false);
      setUseAccumBracket(false);
      setAccumulationBracketYear("");
      setAccumulation(false);
      setAccumulateUndertime(false);
      setUndertimeToAbsences(false);
      setNoOfHoursFrmUnderToAbsences("0");
      setTardinessToAbsences(false);
      setNoOfHoursFrmTardiToAbsences("0");
      setCompNoOfHoursEvnWOutLog(false);
      setCompAbsDateSeparated(false);
      setCompNoOfHoursRD(false);
      setCompNoOfHoursLegal(false);
      setCompNoOfHoursSpecial(false);
      setCompNoOfHoursNonWork(false);
      setNoAbsBeforeDateHired(false);
      setExempTard(false);
      setExempUndertime(false);
      setExempNightDiffBasic(false);
      setExempOT(false);
      setExempAbsences(false);
      setExempOtherEarnAndAllowance(false);
      setExempHolidaypay(false);
      setExempUnProWorkHoliday(false);
      setApplyLeaveForFirstHalfExempt(false);
      setApplyLeaveForSecondHalfExempt(false);
      setBirthdayLeave(false);
      setDailySchedule("");
      setExcludeRestDayInSuspension(false);
      setExcludeLegalInSuspension(false);
      setExcludeSpecialInSuspension(false);
      setExcludeNonWorkingInSuspension(false);
      setCalamYearsOfService(0);
      setCalamConsiderNoOfHours(0);
      setCalamAmount(0);
      setCalamEarnCode("");
      setAllowPerClassCode("");
      setEnableClassification(false);
      setAllowBracketCode("");
      setByEmploymentStatFlag(false);
      setEmploymentStatus("");
    }
  };

  useEffect(() => {
    HandleCreateNew();
  }, [isCreateNew]);

  const handleSave = async () => {
    if (!groupSetUpOtherPoliciesList.length) return;

    const existingItem = groupSetUpOtherPoliciesList.find(
      (item) => item.groupCode === tksGroupCode,
    );
    if (!existingItem) return;

    // Build updated payload from current states
    const updatedPayload: GroupSetUpOtherPoliciesItem = {
      ...existingItem, // keep id, groupCode, and any untouched fields
      useDefRestDay,
      restDayWithWorkShift,
      defRestDay1,
      defRestDay2,
      defRestDay3,
      useTardBracket,
      tardBracketCode,
      deductFirstHalfBeforeBracket,
      useUndertimeBracket,
      underTimeBracketCode,
      deductSecondHalfBeforeBracket,
      useAccumBracket,
      accumulationBracketYear,
      accumulation,
      accumulateUndertime,
      undertimeToAbsences,
      noOfHoursFrmUnderToAbsences,
      tardinessToAbsences,
      noOfHoursFrmTardiToAbsences,
      compNoOfHoursEvnWOutLog,
      compAbsDateSeparated,
      compNoOfHoursRD,
      compNoOfHoursLegal,
      compNoOfHoursSpecial,
      compNoOfHoursNonWork,
      noAbsBeforeDateHired,
      exempTard,
      exempUndertime,
      exempNightDiffBasic,
      exempOT,
      exempAbsences,
      exempOtherEarnAndAllowance,
      exempHolidaypay,
      exempUnProWorkHoliday,
      applyLeaveForFirstHalfExempt,
      applyLeaveForSecondHalfExempt,
      birthdayLeave,
      dailySchedule,
      excludeRestDayInSuspension,
      excludeLegalInSuspension,
      excludeSpecialInSuspension,
      excludeNonWorkingInSuspension,
      calamYearsOfService,
      calamConsiderNoOfHours,
      calamAmount,
      calamEarnCode,
      allowPerClassCode,
      enableClassification,
      allowBracketCode,
      byEmploymentStatFlag,
      employmentStatus,
    };

    // Check if there are any changes compared to existingItem
    const hasChanges = Object.keys(updatedPayload).some(
      (key) => (updatedPayload as any)[key] !== (existingItem as any)[key],
    );
    if (!hasChanges) return; // Exit early if nothing changed

    try {
      const response = await apiClient.put(
        `/Fs/Process/TimeKeepGroup/GroupSetUpOtherPolicies/${existingItem.id}`,
        updatedPayload,
      );

      const updatedItem: GroupSetUpOtherPoliciesItem =
        response.data ?? updatedPayload;

      setGroupSetUpOtherPoliciesList([updatedItem]);
      populateGroupSetUpOtherPolicies(updatedItem);

      await Swal.fire({
        icon: "success",
        title: "Other Policies Saved",
        text: "Other Policies saved successfully!",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error("Failed to save Other Policies:", error);
      const errorMsg =
        error.response?.data?.message || error.message || "Save failed.";
      await Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: errorMsg,
      });
    }
  };

  const handleSaveNew = async () => {
    if (!tksGroupCode) return;

    try {
      const otherPoliciesPayload = {
        id: 0,
        groupCode: tksGroupCode,
        useDefRestDay,
        defRestDay1: defRestDay1 || null,
        defRestDay2: defRestDay2 || null,
        defRestDay3: defRestDay3 || null,
        useTardBracket,
        useUndertimeBracket,
        exempTard,
        exempUndertime,
        exempNightDiffBasic,
        exempOT,
        exempAbsences,
        exempOtherEarnAndAllowance,
        exempHolidaypay,
        exempUnProWorkHoliday,
        allowMealSubsidyCode: null,
        allowsMealSubsidyAmount: 0,
        allowMinHoursToBeMealSubsidy: 0,
        transSubsidyCode: null,
        transSubsidyAmount: 0,
        transSubsidyMinHours: 0,
        weekOTSubsidyCode: null,
        weekOTSubsidyAmount: 0,
        weekOTMinHours: 0,
        restDayOTSubsidyCode: null,
        restDayOTSubsidyAmount: 0,
        restDayOTSubsidyMinHours: 0,
        legalHolidayOTSubsidyCode: null,
        legalHolidayOTSubsidyAmount: 0,
        legalHolidayOTSubsidyMinHours: 0,
        specialHolidayOTSubsidyCode: null,
        specialHolidayOTSubsidyAmount: 0,
        specialHolidayOTSubsidyMinHours: 0,
        dailySchedule: dailySchedule || null,
        useAutoAssignedShift: false,
        numHoursBefore: 0,
        numHoursAfter: 0,
        unprodWorkOnHoliday: false,
        restDayWithWorkShift,
        numWorkHrsPerPeriodPerMosCode: null,
        allowPerClassCode: allowPerClassCode || null,
        basedonFixedNoDaysRule: false,
        regOTSubsidyCode: null,
        regOTSubsidyAmount: 0,
        regOTSubsidyTime: null,
        regOTSubsidyShift: null,
        birthdayLeave,
        useOvertimeBracket: false,
        tardBracketCode: tardBracketCode || null,
        underTimeBracketCode: underTimeBracketCode || null,
        enableClassification,
        accumulation,
        accumulateUndertime,
        useAccumBracket,
        accumulationBracketYear: accumulationBracketYear || null,
        undertimeToAbsences,
        noOfHoursFrmUnderToAbsences: Number(noOfHoursFrmUnderToAbsences) || 0,
        tardinessToAbsences,
        noOfHoursFrmTardiToAbsences: Number(noOfHoursFrmTardiToAbsences) || 0,
        compNoOfHoursEvnWOutLog,
        allowBracketCode: allowBracketCode || null,
        calamYearsOfService: calamYearsOfService || 0,
        calamConsiderNoOfHours: calamConsiderNoOfHours || 0,
        calamAmount: calamAmount || 0,
        calamEarnCode: calamEarnCode || null,
        compAbsDateSeparated,
        compNoOfHoursRD,
        compNoOfHoursLegal,
        compNoOfHoursSpecial,
        compNoOfHoursNonWork,
        noAbsBeforeDateHired,
        applyLeaveForFirstHalfExempt,
        applyLeaveForSecondHalfExempt,
        excludeRestDayInSuspension,
        excludeLegalInSuspension,
        excludeSpecialInSuspension,
        excludeNonWorkingInSuspension,
        deductFirstHalfBeforeBracket,
        deductSecondHalfBeforeBracket,
        byEmploymentStatFlag,
        employmentStatus: employmentStatus || null,
      };

      const response = await apiClient.post(
        "/Fs/Process/TimeKeepGroup/GroupSetUpOtherPolicies",
        otherPoliciesPayload,
      );

      const newItem: GroupSetUpOtherPoliciesItem =
        response.data ?? otherPoliciesPayload;
      setGroupSetUpOtherPoliciesList([newItem]);
      populateGroupSetUpOtherPolicies(newItem);

      await Swal.fire({
        icon: "success",
        title: "Other Policies Created",
        text: "Other Policies created successfully!",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error("Failed to create Other Policies:", error);
      const errorMsg =
        error.response?.data?.message || error.message || "Create failed.";
      await Swal.fire({
        icon: "error",
        title: "Create Failed",
        text: errorMsg,
      });
    }
  };

const handleDelete = async () => {
  try {
    const freshItem = await fetchGroupSetUpOtherPoliciesData(tksGroupCode);
    if (!freshItem?.id) return;
    await apiClient.delete(
      `/Fs/Process/TimeKeepGroup/GroupSetUpOtherPolicies/${freshItem.id}`,
    );
  } catch (error) {
    console.error("Failed to delete Other Policies:", error);
    throw error;
  }
};

  useImperativeHandle(ref, () => ({
    handleSave,
    handleSaveNew,
    handleDelete,
  }));
  return (
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
            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-100"
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
            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-100"
          />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Restday Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="w-40 text-gray-700 text-sm">
                Use Default Restday
              </label>
              <input
                type="checkbox"
                checked={useDefRestDay}
                onChange={(e) => setUseDefRestDay(e.target.checked)}
                disabled={!isEditMode}
                className={checkboxClass}
              />
              <label className="text-gray-700 text-sm ml-4">
                Restday With Workshift
              </label>
              <input
                type="checkbox"
                checked={restDayWithWorkShift}
                onChange={(e) => setRestDayWithWorkShift(e.target.checked)}
                disabled={!isEditMode}
                className={checkboxClass}
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="w-40 text-gray-700 text-sm">
                Default Restday 1
              </label>
              {isEditMode ? (
                <select
                  className="w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={defRestDay1} // <-- bind to state
                  onChange={(e) => setDefRestDay1(e.target.value)} // <-- update state
                >
                  <option value="">Select Day</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={defRestDay1}
                  readOnly
                  className="w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                />
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="w-40 text-gray-700 text-sm">
                Default Restday 2
              </label>
              {isEditMode ? (
                <select
                  className="w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={defRestDay2} // bind to state
                  onChange={(e) => setDefRestDay2(e.target.value)} // update state
                >
                  <option value="">Select Day</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={defRestDay2}
                  readOnly
                  className="w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                />
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="w-40 text-gray-700 text-sm">
                Default Restday 3
              </label>
              {isEditMode ? (
                <select
                  className="w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={defRestDay3} // bind to state
                  onChange={(e) => setDefRestDay3(e.target.value)} // update state
                >
                  <option value="">Select Day</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={defRestDay3}
                  readOnly
                  className="w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                />
              )}
            </div>
          </div>

          {/* Brackets Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="w-40 text-gray-700 text-sm">
                Use Tardiness Bracket
              </label>
              <input
                type="checkbox"
                checked={useTardBracket}
                onChange={(e) => {
                  setUseTardBracket(e.target.checked);
                  if (!e.target.checked) {
                    setDeductFirstHalfBeforeBracket(false);
                    setTardBracketCode("");
                  }
                }}
                disabled={!isEditMode}
                className={checkboxClass}
              />
              <input
                type="text"
                value={tardBracketCode}
                readOnly
                className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
              />
              {isEditMode && (
                <>
                  <button
                    onClick={() => setShowTardBrackModal(true)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => setTardBracketCode("")}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
              <label className="text-gray-700 text-sm ml-8">
                Deduct 1st Half Leave Before Bracket
              </label>
              <input
                type="checkbox"
                checked={deductFirstHalfBeforeBracket}
                onChange={(e) =>
                  setDeductFirstHalfBeforeBracket(e.target.checked)
                }
                disabled={!isEditMode || !useTardBracket}
                className={checkboxClass}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-40 text-gray-700 text-sm">
                Use Undertime Bracket
              </label>
              <input
                type="checkbox"
                checked={useUndertimeBracket}
                onChange={(e) => {
                  setUseUndertimeBracket(e.target.checked);
                  if (!e.target.checked) {
                    setDeductSecondHalfBeforeBracket(false);
                    setUnderTimeBracketCode("");
                  }
                }}
                disabled={!isEditMode}
                className={checkboxClass}
              />
              <input
                type="text"
                value={underTimeBracketCode}
                readOnly
                className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
              />
              {isEditMode && (
                <>
                  <button
                    onClick={() => setShowUnderTimeBrackModal(true)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => setUnderTimeBracketCode("")}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
              <label className="text-gray-700 text-sm ml-8">
                Deduct 2nd Half Leave Before Bracket
              </label>
              <input
                type="checkbox"
                checked={deductSecondHalfBeforeBracket}
                onChange={(e) =>
                  setDeductSecondHalfBeforeBracket(e.target.checked)
                }
                disabled={!isEditMode || !useUndertimeBracket}
                className={checkboxClass}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-40 text-gray-700 text-sm">
                Use Accumulation Bracket
              </label>
              <input
                type="checkbox"
                checked={useAccumBracket}
                onChange={(e) => {
                  setUseAccumBracket(e.target.checked);
                  setAccumulation(e.target.checked);
                  setAccumulateUndertime(e.target.checked);
                }}
                disabled={!isEditMode}
                className={checkboxClass}
              />
              <input
                type="text"
                value={accumulationBracketYear}
                readOnly
                className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
              />
              {isEditMode && (
                <>
                  <button
                    onClick={() => setShowAccumulateBrackModal(true)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => setAccumulationBracketYear("")}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-8 ml-12">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={accumulation}
                  onChange={(e) => {
                    setAccumulation(e.target.checked);
                    if (!e.target.checked && !accumulateUndertime) {
                      setAccumulateUndertime(true);
                    }
                  }}
                  className={checkboxClass}
                  disabled={!isEditMode || !useAccumBracket}
                />
                <span className="text-gray-700">Accumulate Tardiness</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={accumulateUndertime}
                  onChange={(e) => {
                    setAccumulateUndertime(e.target.checked);
                    if (!e.target.checked && !accumulation) {
                      setAccumulation(true);
                    }
                  }}
                  className={checkboxClass}
                  disabled={!isEditMode || !useAccumBracket}
                />
                <span className="text-gray-700">Accumulate Undertime</span>
              </label>
            </div>
          </div>

          {/* Compute Options */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="w-64 text-gray-700 text-sm">
                Compute Undertime to Absences
              </label>
              <input
                type="checkbox"
                checked={undertimeToAbsences}
                onChange={(e) => setUndertimeToAbsences(e.target.checked)}
                disabled={!isEditMode}
                className={checkboxClass}
              />
              <input
                type="number"
                value={noOfHoursFrmUnderToAbsences}
                onChange={(e) => setNoOfHoursFrmUnderToAbsences(e.target.value)}
                readOnly={!isEditMode}
                className={`w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
              />
              <span className="text-gray-500 text-sm">hh.hh</span>
            </div>

            <div className="flex items-center gap-3">
              <label className="w-64 text-gray-700 text-sm">
                Compute Tardiness to Absences
              </label>
              <input
                type="checkbox"
                checked={tardinessToAbsences}
                onChange={(e) => setTardinessToAbsences(e.target.checked)}
                disabled={!isEditMode}
                className={checkboxClass}
              />
              <input
                type="number"
                value={noOfHoursFrmTardiToAbsences}
                onChange={(e) => setNoOfHoursFrmTardiToAbsences(e.target.value)}
                readOnly={!isEditMode}
                className={`w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
              />
              <span className="text-gray-500 text-sm">hh.hh</span>
            </div>

            <label className="flex items-center gap-3 text-sm">
              <span className="w-64 text-gray-700">
                Compute No Of Hours Even Without Logs
              </span>
              <input
                type="checkbox"
                checked={compNoOfHoursEvnWOutLog}
                onChange={(e) => setCompNoOfHoursEvnWOutLog(e.target.checked)}
                className={checkboxClass}
                disabled={!isEditMode}
              />
            </label>

            <label className="flex items-center gap-3 text-sm">
              <span className="w-64 text-gray-700">
                Compute Absences in Middle of Cut off Dates
              </span>
              <input
                type="checkbox"
                checked={compAbsDateSeparated}
                onChange={(e) => setCompAbsDateSeparated(e.target.checked)}
                className={checkboxClass}
                disabled={!isEditMode}
              />
            </label>

            <label className="flex items-center gap-3 text-sm">
              <span className="w-64 text-gray-700">
                Compute No Of Hours For Rest Day
              </span>
              <input
                type="checkbox"
                checked={compNoOfHoursRD}
                onChange={(e) => setCompNoOfHoursRD(e.target.checked)}
                className={checkboxClass}
                disabled={!isEditMode}
              />
            </label>

            <label className="flex items-center gap-3 text-sm">
              <span className="w-64 text-gray-700">
                Compute No Of Hours For Legal
              </span>
              <input
                type="checkbox"
                checked={compNoOfHoursLegal}
                onChange={(e) => setCompNoOfHoursLegal(e.target.checked)}
                className={checkboxClass}
                disabled={!isEditMode}
              />
            </label>

            <label className="flex items-center gap-3 text-sm">
              <span className="w-64 text-gray-700">
                Compute No Of Hours For Special
              </span>
              <input
                type="checkbox"
                checked={compNoOfHoursSpecial}
                onChange={(e) => setCompNoOfHoursSpecial(e.target.checked)}
                className={checkboxClass}
                disabled={!isEditMode}
              />
            </label>

            <label className="flex items-center gap-3 text-sm">
              <span className="w-64 text-gray-700">
                Compute No Of Hours For Non-Working Holiday
              </span>
              <input
                type="checkbox"
                checked={compNoOfHoursNonWork}
                onChange={(e) => setCompNoOfHoursNonWork(e.target.checked)}
                className={checkboxClass}
                disabled={!isEditMode}
              />
            </label>

            <label className="flex items-center gap-3 text-sm">
              <span className="w-64 text-gray-700">
                No Absences before Date Hired
              </span>
              <input
                type="checkbox"
                checked={noAbsBeforeDateHired}
                onChange={(e) => setNoAbsBeforeDateHired(e.target.checked)}
                className={checkboxClass}
                disabled={!isEditMode}
              />
            </label>
          </div>

          {/* Calamity2 Allowance Policy - Separate Division */}
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <h4 className="text-gray-700 mb-4">Calamity2 Allowance Policy</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="w-40 text-gray-700 text-sm">
                  Years of Service
                </label>
                <input
                  type="number"
                  value={calamYearsOfService}
                  onChange={(e) =>
                    isEditMode && setCalamYearsOfService(Number(e.target.value))
                  }
                  readOnly={!isEditMode}
                  className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-white" : ""}`}
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="w-40 text-gray-700 text-sm">
                  Min Hrs for Allowance
                </label>
                <input
                  type="number"
                  value={calamConsiderNoOfHours}
                  onChange={(e) =>
                    setCalamConsiderNoOfHours(parseFloat(e.target.value))
                  }
                  readOnly={!isEditMode}
                  className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-white" : ""}`}
                />
                <span className="text-gray-500 text-sm">[hh.hh]</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="w-40 text-gray-700 text-sm">
                  Allowance Amount
                </label>
                <input
                  type="text"
                  value={calamAmount}
                  onChange={(e) =>
                    isEditMode && setCalamAmount(parseFloat(e.target.value))
                  }
                  readOnly={!isEditMode}
                  className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-white" : ""}`}
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700 text-sm">
                  Allowance Code
                </label>
                <input
                  type="text"
                  value={calamEarnCode}
                  readOnly
                  className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-white" : ""}`}
                />
                {isEditMode && (
                  <button
                    onClick={() => setShowEarningCodeModal(true)}
                    className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Allowance Per Classification Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="w-48 text-gray-700 text-sm">
                Allowance Per Classification
              </label>
              <input
                type="text"
                value={allowPerClassCode}
                readOnly
                className={`flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
              />
              {isEditMode && (
                <>
                  <button
                    onClick={() => setShowAllowPerClassModal(true)}
                    className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setAllowPerClassCode("")}
                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={enableClassification}
                onChange={(e) => setEnableClassification(e.target.checked)}
                className={checkboxClass}
                disabled={!isEditMode}
              />
              <span className="text-gray-700">
                Enable Classification in Allowance Per Classification
                Computation
              </span>
            </label>

            <div className="flex items-center gap-2">
              <label className="w-48 text-gray-700 text-sm">
                Allowance Bracket Code
              </label>
              <input
                type="text"
                value={allowBracketCode}
                readOnly
                className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
              />
              {isEditMode && (
                <button
                  onClick={() => setShowAllowBracketCodeModal(true)}
                  className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={byEmploymentStatFlag}
                onChange={(e) => setByEmploymentStatFlag(e.target.checked)}
                className={checkboxClass}
                disabled={!isEditMode}
              />
              <span className="text-gray-700">By Employment Status</span>
            </label>

            <div className="flex items-center gap-2">
              <label className="w-48 text-gray-700 text-sm">
                Allowance by Status
              </label>
              <input
                type="text"
                value={employmentStatus}
                readOnly
                className={`flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-gray-50" : ""}`}
              />
              {isEditMode && (
                <button
                  onClick={() => setShowAllowBrackByEmpStatModal(true)}
                  className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Exemptions */}
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <h4 className="text-gray-700 mb-3">Exemptions</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">Tardiness</span>
                <input
                  type="checkbox"
                  checked={exempTard}
                  onChange={(e) => setExempTard(e.target.checked)}
                  className={checkboxClass}
                  disabled={!isEditMode}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">Undertime</span>
                <input
                  type="checkbox"
                  checked={exempUndertime}
                  onChange={(e) => setExempUndertime(e.target.checked)}
                  className={checkboxClass}
                  disabled={!isEditMode}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">Night Differential</span>
                <input
                  type="checkbox"
                  checked={exempNightDiffBasic}
                  onChange={(e) => setExempNightDiffBasic(e.target.checked)}
                  className={checkboxClass}
                  disabled={!isEditMode}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">Overtime</span>
                <input
                  type="checkbox"
                  checked={exempOT}
                  onChange={(e) => setExempOT(e.target.checked)}
                  className={checkboxClass}
                  disabled={!isEditMode}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">Absences</span>
                <input
                  type="checkbox"
                  checked={exempAbsences}
                  onChange={(e) => setExempAbsences(e.target.checked)}
                  className={checkboxClass}
                  disabled={!isEditMode}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">
                  Other Earnings and Allowance
                </span>
                <input
                  type="checkbox"
                  checked={exempOtherEarnAndAllowance}
                  onChange={(e) =>
                    setExempOtherEarnAndAllowance(e.target.checked)
                  }
                  className={checkboxClass}
                  disabled={!isEditMode}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">Holiday Pay</span>
                <input
                  type="checkbox"
                  checked={exempHolidaypay}
                  onChange={(e) => setExempHolidaypay(e.target.checked)}
                  className={checkboxClass}
                  disabled={!isEditMode}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">
                  Unpaid Work on holiday
                </span>
                <input
                  type="checkbox"
                  checked={exempUnProWorkHoliday}
                  onChange={(e) => setExempUnProWorkHoliday(e.target.checked)}
                  className={checkboxClass}
                  disabled={!isEditMode}
                />
              </label>
            </div>
          </div>

          {/* Leave/Absences Exemption */}
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <h4 className="text-gray-700 mb-3">Leave/Absences Exemption</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">
                  Apply Leave For First Half
                </span>
                <input
                  type="checkbox"
                  checked={applyLeaveForFirstHalfExempt}
                  onChange={(e) =>
                    setApplyLeaveForFirstHalfExempt(e.target.checked)
                  }
                  className={checkboxClass}
                  disabled={!isEditMode}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">
                  Apply Leave For Second Half
                </span>
                <input
                  type="checkbox"
                  checked={applyLeaveForSecondHalfExempt}
                  onChange={(e) =>
                    setApplyLeaveForSecondHalfExempt(e.target.checked)
                  }
                  className={checkboxClass}
                  disabled={!isEditMode}
                />
              </label>
            </div>
          </div>

          {/* Birthday Leave */}
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <h4 className="text-gray-700 mb-3">Birthday Leave</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-32">Birthday Leave</span>
                <input
                  type="checkbox"
                  checked={birthdayLeave}
                  onChange={(e) => setBirthdayLeave(e.target.checked)}
                  className={checkboxClass}
                  disabled={!isEditMode}
                />
              </label>
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700 text-sm">
                  Daily Schedule
                </label>
                <input
                  type="text"
                  value={dailySchedule}
                  readOnly
                  className={`flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? "bg-white" : ""}`}
                />
                {isEditMode && (
                  <>
                    <button
                      onClick={() => setShowDailySchedModal(true)}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => setDailySchedule("")}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Exclude Suspension */}
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <h4 className="text-gray-700 mb-3">Exclude Suspension</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">Rest Day</span>
                <input
                  type="checkbox"
                  checked={excludeRestDayInSuspension}
                  onChange={(e) =>
                    setExcludeRestDayInSuspension(e.target.checked)
                  }
                  className={checkboxClass}
                  disabled={!isEditMode}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">Legal Holiday</span>
                <input
                  type="checkbox"
                  checked={excludeLegalInSuspension}
                  onChange={(e) =>
                    setExcludeLegalInSuspension(e.target.checked)
                  }
                  className={checkboxClass}
                  disabled={!isEditMode}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">Special Holiday</span>
                <input
                  type="checkbox"
                  checked={excludeSpecialInSuspension}
                  onChange={(e) =>
                    setExcludeSpecialInSuspension(e.target.checked)
                  }
                  className={checkboxClass}
                  disabled={!isEditMode}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 w-56">Non-Working Holiday</span>
                <input
                  type="checkbox"
                  checked={excludeNonWorkingInSuspension}
                  onChange={(e) =>
                    setExcludeNonWorkingInSuspension(e.target.checked)
                  }
                  className={checkboxClass}
                  disabled={!isEditMode}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* For Tardiness Bracket Search Modal */}
      {showTardBrackModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
          onClick={() => setShowTardBrackModal(false)}
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
                onClick={() => setShowTardBrackModal(false)}
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
                  value={tardBrackSearchTerm}
                  onChange={(e) => setTardBrackSearchTerm(e.target.value)}
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
                      Flag
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTardBracket.map((item, index) => (
                    <tr
                      key={`${item.id}-${index}`}
                      className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setTardBracketCode(item.bracketCode);
                        setShowTardBrackModal(false);
                      }}
                    >
                      <td className="py-2 text-gray-800">{item.bracketCode}</td>
                      <td className="py-2 text-gray-800">{item.description}</td>
                      <td className="py-2 text-gray-800">
                        {getFlagLabel(item.flag)}
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
                {filteredTardBracket.length === 0
                  ? 0
                  : startTardBracketIndex + 1}{" "}
                to {Math.min(endTardBracketIndex, filteredTardBracket.length)}{" "}
                of {filteredTardBracket.length} entries
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setCurrentTardBracketPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentTardBracketPage === 1}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {getTardBracketPageNumbers().map((page, idx) =>
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
                      onClick={() => setCurrentTardBracketPage(page)}
                      className={`px-2 py-1 rounded text-xs ${
                        currentTardBracketPage === page
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
                    setCurrentTardBracketPage((prev) =>
                      Math.min(prev + 1, totalTardBracketPages),
                    )
                  }
                  disabled={
                    currentTardBracketPage === totalTardBracketPages ||
                    totalTardBracketPages === 0
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

      {/* For UnderTime Bracket Search Modal */}
      {showUnderTimeBrackModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
          onClick={() => setShowUnderTimeBrackModal(false)}
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
                onClick={() => setShowUnderTimeBrackModal(false)}
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
                  value={underTimeBrackSearchTerm}
                  onChange={(e) => setUnderTimeBrackSearchTerm(e.target.value)}
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
                      Flag
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUTBracket.map((item, index) => (
                    <tr
                      key={`${item.id}-${index}`}
                      className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setUnderTimeBracketCode(item.bracketCode);
                        setShowUnderTimeBrackModal(false);
                      }}
                    >
                      <td className="py-2 text-gray-800">{item.bracketCode}</td>
                      <td className="py-2 text-gray-800">{item.description}</td>
                      <td className="py-2 text-gray-800">
                        {getFlagLabel(item.flag)}
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
                {filteredUTBracket.length === 0 ? 0 : startUTBracketIndex + 1}{" "}
                to {Math.min(endUTBracketIndex, filteredUTBracket.length)} of{" "}
                {filteredUTBracket.length} entries
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setCurrentUTBracketPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentUTBracketPage === 1}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {getUTBracketPageNumbers().map((page, idx) =>
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
                      onClick={() => setCurrentUTBracketPage(page)}
                      className={`px-2 py-1 rounded text-xs ${
                        currentUTBracketPage === page
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
                    setCurrentUTBracketPage((prev) =>
                      Math.min(prev + 1, totalUTBracketPages),
                    )
                  }
                  disabled={
                    currentUTBracketPage === totalUTBracketPages ||
                    totalUTBracketPages === 0
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

      {/* For Accumulate Bracket Search Modal */}
      {showAccumulateBrackModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
          onClick={() => setShowAccumulateBrackModal(false)}
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
                onClick={() => setShowAccumulateBrackModal(false)}
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
                  value={accumulateBrackSearchTerm}
                  onChange={(e) => setAccumulateBrackSearchTerm(e.target.value)}
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
                      Flag
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedACCBracket.map((item, index) => (
                    <tr
                      key={`${item.id}-${index}`}
                      className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setAccumulationBracketYear(item.bracketCode);
                        setShowAccumulateBrackModal(false);
                      }}
                    >
                      <td className="py-2 text-gray-800">{item.bracketCode}</td>
                      <td className="py-2 text-gray-800">{item.description}</td>
                      <td className="py-2 text-gray-800">
                        {getFlagLabel(item.flag)}
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
                {filteredACCBracket.length === 0 ? 0 : startACCBracketIndex + 1}{" "}
                to {Math.min(endACCBracketIndex, filteredACCBracket.length)} of{" "}
                {filteredACCBracket.length} entries
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setCurrentACCBracketPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentACCBracketPage === 1}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {getACCBracketPageNumbers().map((page, idx) =>
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
                      onClick={() => setCurrentACCBracketPage(page)}
                      className={`px-2 py-1 rounded text-xs ${
                        currentACCBracketPage === page
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
                    setCurrentACCBracketPage((prev) =>
                      Math.min(prev + 1, totalACCBracketPages),
                    )
                  }
                  disabled={
                    currentACCBracketPage === totalACCBracketPages ||
                    totalACCBracketPages === 0
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

      {/* For Daily Schedule Search Modal */}
      {showDailySchedModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
          onClick={() => setShowDailySchedModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                Select Schedule
              </h2>
              <button
                onClick={() => setShowDailySchedModal(false)}
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
                  value={dailySchedSearchTerm}
                  onChange={(e) => setDailySchedSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search by Reference No or Monday-Thursday..."
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
                      Reference No
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
                  </tr>
                </thead>
                <tbody>
                  {paginatedDailySched.map((item, index) => (
                    <tr
                      key={`${item.dailyScheduleId}-${index}`}
                      className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setDailySchedule(item.referenceNo);
                        setShowDailySchedModal(false);
                      }}
                    >
                      <td className="py-2 text-gray-800">{item.referenceNo}</td>
                      <td className="py-2 text-gray-800">{item.monday}</td>
                      <td className="py-2 text-gray-800">{item.tuesday}</td>
                      <td className="py-2 text-gray-800">{item.wednesday}</td>
                      <td className="py-2 text-gray-800">{item.thursday}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-3 px-6 pb-4">
              <div className="text-gray-600 text-xs">
                Showing{" "}
                {filteredDailySched.length === 0 ? 0 : startDailySchedIndex + 1}{" "}
                to {Math.min(endDailySchedIndex, filteredDailySched.length)} of{" "}
                {filteredDailySched.length} entries
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setCurrentDailySchedPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentDailySchedPage === 1}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {getDailySchedPageNumbers().map((page, idx) =>
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
                      onClick={() => setCurrentDailySchedPage(page)}
                      className={`px-2 py-1 rounded text-xs ${
                        currentDailySchedPage === page
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
                    setCurrentDailySchedPage((prev) =>
                      Math.min(prev + 1, totalDailySchedPages),
                    )
                  }
                  disabled={
                    currentDailySchedPage === totalDailySchedPages ||
                    totalDailySchedPages === 0
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

      {/* Earning Code Search Modal */}
      {showEarningCodeModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">Search Earning Code</h3>
              <button
                onClick={() => setShowEarningCodeModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Search:</label>
                <input
                  type="text"
                  value={earningCodeSearchTerm}
                  onChange={(e) => setEarningCodeSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                        Earning Code
                        <span className="text-blue-600">▲</span>
                      </div>
                    </th>
                    <th className="text-left py-2 text-gray-700 font-semibold">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEarningCodeData.map((item, index) => (
                    <tr
                      key={`${item.earnID}-${index}`}
                      className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                      onClick={() => {
                        setCalamEarnCode(item.earnCode);
                        setShowEarningCodeModal(false);
                      }}
                    >
                      <td className="py-2 text-gray-800">{item.earnCode}</td>
                      <td className="py-2 text-gray-800">{item.earnDesc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-3 px-6 pb-4">
              <div className="text-gray-600 text-xs">
                Showing {earningCodeStartIndex} to {earningCodeEndIndex} of{" "}
                {earningCodeTotalData.length} entries
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setEarningCodeCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={earningCodeCurrentPage === 1}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {getEarningCodePageNumbers().map((page, idx) =>
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
                      onClick={() => setEarningCodeCurrentPage(page)}
                      className={`px-2 py-1 rounded text-xs ${
                        earningCodeCurrentPage === page
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
                    setEarningCodeCurrentPage((prev) =>
                      Math.min(prev + 1, earningCodeTotalPages),
                    )
                  }
                  disabled={
                    earningCodeCurrentPage === earningCodeTotalPages ||
                    earningCodeTotalPages === 0
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

      {/* Earning Code Search Modal */}
      {showAllowPerClassModal && (
        <div
          onClick={() => setShowAllowPerClassModal(false)}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">
                Search Allowance Classification Setup
              </h3>
              <button
                onClick={() => setShowAllowPerClassModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Search:</label>
                <input
                  type="text"
                  value={allowancePerClassSearchTerm}
                  onChange={(e) =>
                    setAllowancePerClassSearchTerm(e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                        RefNo
                        <span className="text-blue-600">▲</span>
                      </div>
                    </th>
                    <th className="text-left py-2 text-gray-700 font-semibold">
                      Allowance Code
                    </th>
                    <th className="text-left py-2 text-gray-700 font-semibold">
                      WorkShift Code
                    </th>
                    <th className="text-left py-2 text-gray-700 font-semibold">
                      Classification Code
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAllowPerClass.map((item, index) => (
                    <tr
                      key={`${item.id}-${index}`}
                      className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                      onClick={() => {
                        setAllowPerClassCode(item.refNo);
                        setShowAllowPerClassModal(false);
                      }}
                    >
                      <td className="py-2 text-gray-800">{item.refNo}</td>
                      <td className="py-2 text-gray-800">
                        {item.allowanceCode}
                      </td>
                      <td className="py-2 text-gray-800">
                        {item.workShiftCode}
                      </td>
                      <td className="py-2 text-gray-800">
                        {item.classificationCode}
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
                {filteredAllowPerClass.length === 0
                  ? 0
                  : startAllowPerClassIndex + 1}{" "}
                to{" "}
                {Math.min(
                  startAllowPerClassIndex + paginatedAllowPerClass.length,
                  filteredAllowPerClass.length,
                )}{" "}
                of {filteredAllowPerClass.length} entries
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setCurrentAllowPerClassPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentAllowPerClassPage === 1}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {getAllowPerClassPageNumbers().map((page, idx) =>
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
                      onClick={() => setCurrentAllowPerClassPage(page)}
                      className={`px-2 py-1 rounded text-xs ${
                        currentAllowPerClassPage === page
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
                    setCurrentAllowPerClassPage((prev) =>
                      Math.min(prev + 1, totalAllowPerClassPages),
                    )
                  }
                  disabled={
                    currentAllowPerClassPage === totalAllowPerClassPages ||
                    totalAllowPerClassPages === 0
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

      {/* Allowance Bracket Code Search Modal */}
      {showAllowBracketCodeModal && (
        <div
          onClick={() => setShowAllowBracketCodeModal(false)}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">
                Search Allowance Bracket Code
              </h3>
              <button
                onClick={() => setShowAllowBracketCodeModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Search:</label>
                <input
                  type="text"
                  value={allowaBracketCodeSearchTerm}
                  onChange={(e) =>
                    setAllowBracketCodeSearchTerm(e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAllowBracketCode.map((item, index) => (
                    <tr
                      key={`${item.code}-${index}`}
                      className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                      onClick={() => {
                        setAllowBracketCode(item.code);
                        setShowAllowBracketCodeModal(false);
                      }}
                    >
                      <td className="py-2 text-gray-800">{item.code}</td>
                      <td className="py-2 text-gray-800">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-3 px-6 pb-4">
              <div className="text-gray-600 text-xs">
                Showing{" "}
                {filteredAllowBracketCode.length === 0
                  ? 0
                  : startAllowBracketCodeIndex + 1}{" "}
                to{" "}
                {Math.min(
                  startAllowBracketCodeIndex + paginatedAllowBracketCode.length,
                  filteredAllowBracketCode.length,
                )}{" "}
                of {filteredAllowBracketCode.length} entries
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setCurrentAllowBracketCodePage((prev) =>
                      Math.max(prev - 1, 1),
                    )
                  }
                  disabled={currentAllowBracketCodePage === 1}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {getAllowBracketCodePageNumbers().map((page, idx) =>
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
                      onClick={() => setCurrentAllowBracketCodePage(page)}
                      className={`px-2 py-1 rounded text-xs ${
                        currentAllowBracketCodePage === page
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
                    setCurrentAllowBracketCodePage((prev) =>
                      Math.min(prev + 1, totalAllowBracketCodePages),
                    )
                  }
                  disabled={
                    currentAllowBracketCodePage ===
                      totalAllowBracketCodePages ||
                    totalAllowBracketCodePages === 0
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

      {/* Allowance by Employmet  Status Code Search Modal */}
      {showAllowBrackByEmpStatModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={() => setShowAllowBrackByEmpStatModal(false)}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">
                Search Allowance Bracket Code
              </h3>
              <button
                onClick={() => setShowAllowBrackByEmpStatModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Search:</label>
                <input
                  type="text"
                  value={allowBrackByEmpStatSearchTerm}
                  onChange={(e) =>
                    setAllowBrackByEmpStatSearchTerm(e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAllowBrackByEmpStat.map((item, index) => (
                    <tr
                      key={`${item.code}-${index}`}
                      className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                      onClick={() => {
                        setEmploymentStatus(item.code);
                        setShowAllowBrackByEmpStatModal(false);
                      }}
                    >
                      <td className="py-2 text-gray-800">{item.code}</td>
                      <td className="py-2 text-gray-800">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-3 px-6 pb-4">
              <div className="text-gray-600 text-xs">
                Showing{" "}
                {filteredAllowBrackByEmpStat.length === 0
                  ? 0
                  : startAllowBrackByEmpStatIndex + 1}{" "}
                to{" "}
                {Math.min(
                  startAllowBrackByEmpStatIndex +
                    paginatedAllowBrackByEmpStat.length,
                  filteredAllowBrackByEmpStat.length,
                )}{" "}
                of {filteredAllowBrackByEmpStat.length} entries
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setCurrentAllowBrackByEmpStatPage((prev) =>
                      Math.max(prev - 1, 1),
                    )
                  }
                  disabled={currentAllowBrackByEmpStatPage === 1}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {getAllowBrackByEmpStatPageNumbers().map((page, idx) =>
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
                      onClick={() => setCurrentAllowBrackByEmpStatPage(page)}
                      className={`px-2 py-1 rounded text-xs ${
                        currentAllowBrackByEmpStatPage === page
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
                    setCurrentAllowBrackByEmpStatPage((prev) =>
                      Math.min(prev + 1, totalAllowBrackByEmpStatPages),
                    )
                  }
                  disabled={
                    currentAllowBrackByEmpStatPage ===
                      totalAllowBrackByEmpStatPages ||
                    totalAllowBrackByEmpStatPages === 0
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
  );
});
