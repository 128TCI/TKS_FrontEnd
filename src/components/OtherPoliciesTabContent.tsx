import { Search, X } from "lucide-react";
import { use, useEffect, useState } from "react";
import apiClient from "../services/apiClient";
import { useTablePagination } from "../hooks/useTablePagination";

interface OtherPoliciesTabContentProps {
  tksGroupCode: string;
  tksGroupDescription: string;
  isEditMode: boolean;
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
  calamYearsOfService?: string;
  calamConsiderNoOfHours?: string;
  calamAmount?: string;
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

export function OtherPoliciesTabContent({
  tksGroupCode,
  tksGroupDescription,
  isEditMode,
}: OtherPoliciesTabContentProps) {
  const checkboxClass =
    "w-4 h-4 border-2 border-gray-400 rounded bg-white checked:bg-blue-600 checked:border-blue-600 cursor-pointer";

  const [groupSetUpOtherPoliciesList, setGroupSetUpOtherPoliciesList] =
    useState<GroupSetUpOtherPoliciesItem[]>([]);

  // Other Policies States
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
  const [calamYearsOfService, setCalamYearsOfService] = useState("");
  const [calamConsiderNoOfHours, setCalamConsiderNoOfHours] = useState("");
  const [calamAmount, setCalamAmount] = useState("");
  const [calamEarnCode, setCalamEarnCode] = useState("");

  // Tardiness Bracket States
  const [showTardBrackModal, setShowTardBrackModal] = useState(false);
  const [currentTardBrackPage, setCurrentTardBrackPage] = useState(1);
  const [tardBrackSearchTerm, setTardBrackSearchTerm] = useState('');
  const [tardBracketItemList, setTardBracketItemList] = useState<BracketItem[]>([])
  const itemsPerPage = 10;

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
      Object.values(item).some(
        (val) =>
          typeof val === "number" &&
          val.toFixed(2).includes(search)
      ),
    itemsPerPage
  );

  const startTardBracketIndex = (currentTardBracketPage - 1) * itemsPerPage;
  const endTardBracketIndex = startTardBracketIndex + itemsPerPage;

  const fetchGroupSetUpOtherPoliciesData = async (): Promise<
    GroupSetUpOtherPoliciesItem[]
  > => {
    const response = await apiClient.get(
      "/Fs/Process/TimeKeepGroup/GroupSetUpOtherPolicies",
    );

    return response.data.map(
      (item: any): GroupSetUpOtherPoliciesItem => ({
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
      }),
    );
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
    setCalamYearsOfService(item.calamYearsOfService ?? "");
    setCalamConsiderNoOfHours(item.calamConsiderNoOfHours ?? "");
    setCalamAmount(item.calamAmount ?? "");
    setCalamEarnCode(item.calamEarnCode ?? "");
    setAllowPerClassCode(item.allowPerClassCode ?? "");
    setEnableClassification(item.enableClassification ?? false);
    setAllowBracketCode(item.allowBracketCode ?? "");
    setByEmploymentStatFlag(item.byEmploymentStatFlag ?? false);
    setEmploymentStatus(item.employmentStatus ?? "");
  };

  useEffect(() => {
    const loadOtherPoliciesSetUp = async () => {
      const items = await fetchGroupSetUpOtherPoliciesData();
      setGroupSetUpOtherPoliciesList(items);
      populateGroupSetUpOtherPolicies(items[0]);
    };
    loadOtherPoliciesSetUp();
  }, []);

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
                <select className="w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
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
                  onChange={(e) => setDefRestDay1(e.target.value)}
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
                <select className="w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
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
                  onChange={(e) => setDefRestDay2(e.target.value)}
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
                <select className="w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
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
                  onChange={(e) => setDefRestDay3(e.target.value)}
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
                onChange={(e) => setUseTardBracket(e.target.checked)}
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
                disabled={!isEditMode}
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
                onChange={(e) => setUseUndertimeBracket(e.target.checked)}
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
                    // pop up modal
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
                disabled={!isEditMode}
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
                onChange={(e) => setUseAccumBracket(e.target.checked)}
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
                    // pop up modal here
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
                  onChange={(e) => setAccumulation(e.target.checked)}
                  className={checkboxClass}
                  disabled={!isEditMode}
                />
                <span className="text-gray-700">Accumulate Tardiness</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={accumulateUndertime}
                  onChange={(e) => setAccumulateUndertime(e.target.checked)}
                  className={checkboxClass}
                  disabled={!isEditMode}
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
                  type="text"
                  value={calamYearsOfService}
                  onChange={(e) =>
                    isEditMode && setCalamYearsOfService(e.target.value)
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
                  onChange={(e) => setCalamConsiderNoOfHours(e.target.value)}
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
                  onChange={(e) => isEditMode && setCalamAmount(e.target.value)}
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
                    // modal here set true
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
                    // set pop up here true
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
                  //pop up set true here
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
                  // pop up here set true
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
                      // pop up modal here
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
                  {filteredTardBracket.map((item, index) => (
                    <tr
                      key={`${item.id}-${index}`}
                      className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors`}
                      onClick={() => {
                        setTardBracketCode(item.bracketCode);
                        setShowTardBrackModal(false);
                      }}
                    >
                      <td className="py-2 text-gray-800">{item.bracketCode}</td>
                      <td className="py-2 text-gray-800">{item.description}</td>
                      <td className="py-2 text-gray-800">{item.flag}</td>
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
                to{" "}
                {Math.min(
                  endTardBracketIndex,
                  filteredTardBracket.length,
                )}{" "}
                of {filteredTardBracket.length} entries
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setCurrentTardBrackPage((prev) =>
                      Math.max(prev - 1, 1),
                    )
                  }
                  disabled={currentTardBrackPage === 1}
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
                      onClick={() => setCurrentTardBrackPage(page)}
                      className={`px-2 py-1 rounded text-xs ${
                        currentTardBrackPage === page
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
                    setCurrentTardBrackPage((prev) =>
                      Math.min(prev + 1, totalTardBracketPages),
                    )
                  }
                  disabled={
                    currentTardBrackPage === totalTardBracketPages ||
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
    </div>
  );
}
