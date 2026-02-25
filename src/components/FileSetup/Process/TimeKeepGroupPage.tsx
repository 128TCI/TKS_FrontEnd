import { useState, useEffect } from 'react';
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
  Layers
} from 'lucide-react';
import { DatePicker } from '../../DateSetup/DatePicker';
import { OvertimeRatesTabContent } from '../../OvertimeRatesTabContent';
import { OtherPoliciesTabContent } from '../../OtherPoliciesTabContent';
import { Footer } from '../../Footer/Footer';

export function TimeKeepGroupPage() {
  const checkboxClass = "w-4 h-4 appearance-none border-2 border-gray-400 rounded bg-white checked:bg-blue-600 checked:border-blue-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";
  const [activeTab, setActiveTab] = useState('definition');
  const [showTksGroupModal, setShowTksGroupModal] = useState(false);
  const [tksGroupSearchTerm, setTksGroupSearchTerm] = useState('');
  const [tksGroupCode, setTksGroupCode] = useState('1');
  const [tksGroupDescription, setTksGroupDescription] = useState('Batangas1 Balagtas Monthly Payroll');
  const [showPayrollLocationModal, setShowPayrollLocationModal] = useState(false);
  const [payrollLocationSearchTerm, setPayrollLocationSearchTerm] = useState('');
  const [payrollLocationCode, setPayrollLocationCode] = useState('1');
  const [payrollDescription, setPayrollDescription] = useState('Batangas Balagtas Monthly Payroll');
  const [dateFrom, setDateFrom] = useState('05/05/2021');
  const [dateTo, setDateTo] = useState('05/05/2021');
  const [month, setMonth] = useState('August');
  const [period, setPeriod] = useState('2');
  const [terminalId, setTerminalId] = useState('');

  // Modals for For Absent, For No Login, For No Logout
  const [showForAbsentModal, setShowForAbsentModal] = useState(false);
  const [forAbsentSearchTerm, setForAbsentSearchTerm] = useState('');
  const [showForNoLoginModal, setShowForNoLoginModal] = useState(false);
  const [forNoLoginSearchTerm, setForNoLoginSearchTerm] = useState('');
  const [showForNoLogoutModal, setShowForNoLogoutModal] = useState(false);
  const [forNoLogoutSearchTerm, setForNoLogoutSearchTerm] = useState('');

  // Modals for Supervisory GroupCode and OT Code Per Week
  const [showSupervisoryGroupModal, setShowSupervisoryGroupModal] = useState(false);
  const [supervisoryGroupSearchTerm, setSupervisoryGroupSearchTerm] = useState('');
  const [showOtCodeModal, setShowOtCodeModal] = useState(false);
  const [otCodeSearchTerm, setOtCodeSearchTerm] = useState('');

  // Auto Pairing Logs Cut-Off Dates
  const [autoPairingFrom, setAutoPairingFrom] = useState('09/29/2025');
  const [autoPairingTo, setAutoPairingTo] = useState('09/29/2025');

  // Login Policy State
  const [gracePeriodSemiAnnual, setGracePeriodSemiAnnual] = useState(false);
  const [gracePeriodPerDay, setGracePeriodPerDay] = useState('');
  const [gracePeriodIncludeTardiness, setGracePeriodIncludeTardiness] = useState(false);
  const [includeBreak2InGrace, setIncludeBreak2InGrace] = useState(false);
  const [deductibleEvenWithinGrace, setDeductibleEvenWithinGrace] = useState(false);
  const [gracePeriodPerSemiAnnual, setGracePeriodPerSemiAnnual] = useState('');
  const [firstHalfDateFrom, setFirstHalfDateFrom] = useState('');
  const [firstHalfDateTo, setFirstHalfDateTo] = useState('');
  const [secondHalfDateFrom, setSecondHalfDateFrom] = useState('');
  const [secondHalfDateTo, setSecondHalfDateTo] = useState('');
  const [deductOverBreak, setDeductOverBreak] = useState(true);
  const [gracePeriodCalamity2, setGracePeriodCalamity2] = useState('');
  const [combineTardinessTimeInBreak2, setCombineTardinessTimeInBreak2] = useState(false);
  const [computeTardinessNoLogout, setComputeTardinessNoLogout] = useState(false);
  
  const [nightDiffStartTime, setNightDiffStartTime] = useState('10:00 PM');
  const [nightDiffEndTime, setNightDiffEndTime] = useState('6:00 AM');
  const [deductMealBreakND, setDeductMealBreakND] = useState(false);
  const [twoShiftsInDay, setTwoShiftsInDay] = useState(true);
  const [hoursIntervalTwoShifts, setHoursIntervalTwoShifts] = useState('2.00');
  const [allowableGracePeriodMonth, setAllowableGracePeriodMonth] = useState('3');
  const [excludeAllowableGraceBracket, setExcludeAllowableGraceBracket] = useState(false);
  const [allowableGraceActualMonth, setAllowableGraceActualMonth] = useState(true);
  const [considerSaturdayPaid, setConsiderSaturdayPaid] = useState(true);
  const [maxDaysPerWeekSaturday, setMaxDaysPerWeekSaturday] = useState('3.00');
  const [allowableTardyExcess, setAllowableTardyExcess] = useState('');
  const [excludeTardinessInGrace, setExcludeTardinessInGrace] = useState(false);
  const [supervisoryGroupCode, setSupervisoryGroupCode] = useState('');
  const [applyOccurancesBreak, setApplyOccurancesBreak] = useState(false);
  const [maxOccurancesNoDeduction, setMaxOccurancesNoDeduction] = useState('12');
  const [gracePeriodOccurance, setGracePeriodOccurance] = useState('');
  const [hoursRequiredPerWeek, setHoursRequiredPerWeek] = useState('');
  const [startOfWeek, setStartOfWeek] = useState('');
  const [computeType, setComputeType] = useState('tardiness');
  const [otCodePerWeek, setOtCodePerWeek] = useState('');
  
  const [forAbsent, setForAbsent] = useState('ABSENT');
  const [forNoLogin, setForNoLogin] = useState('NOLOGIN');
  const [forNoLogout, setForNoLogout] = useState('NOLOGOUT');
  const [forNoBreak2Out, setForNoBreak2Out] = useState('');
  const [forNoBreak2In, setForNoBreak2In] = useState('');

  // Overtime Rates State
  const [regularDayOT, setRegularDayOT] = useState('ROT');
  const [restDayOT, setRestDayOT] = useState('RDOT');
  const [legalHolidayOT, setLegalHolidayOT] = useState('LEGAL');
  const [specialHolidayOT, setSpecialHolidayOT] = useState('SPECIAL');
  const [useOTPremium, setUseOTPremium] = useState(false);
  const [useActualDayType, setUseActualDayType] = useState(false);
  const [holidayWithWorkshift, setHolidayWithWorkshift] = useState(false);
  const [otBreakMinHours, setOtBreakMinHours] = useState('0.00');

  // Other Policies State
  const [useDefaultRestday, setUseDefaultRestday] = useState(false);
  const [restdayWithWorkshift, setRestdayWithWorkshift] = useState(false);
  const [useTardinessBracket, setUseTardinessBracket] = useState(false);
  const [computeUndertimeToAbsences, setComputeUndertimeToAbsences] = useState('3.00');

  // System Configuration State
  const [showSystemConfigModal, setShowSystemConfigModal] = useState(false);
  const [useTimekeepingSystemConfig, setUseTimekeepingSystemConfig] = useState(false);
  const [minBeforeShift, setMinBeforeShift] = useState('0');
  const [minIgnoreMultipleBreak, setMinIgnoreMultipleBreak] = useState('0');
  const [minBeforeMidnightShift, setMinBeforeMidnightShift] = useState('0');
  const [minConsiderBreak2In, setMinConsiderBreak2In] = useState('0');
  const [devicePolicy, setDevicePolicy] = useState('');
  
  // Global Edit Mode
  const [isEditMode, setIsEditMode] = useState(false);

  const groupList = [
    { code: '2', description: 'ASSISTANT MANAGER', appliesAll: false },
    { code: '3', description: 'RANK AND FILE', appliesAll: false }
  ];

  const tabs = [
    { id: 'definition', label: 'TKS Group Definition', icon: Users },
    { id: 'login-policy', label: 'Login Policy', icon: Shield },
    { id: 'overtime', label: 'Overtime Rates', icon: Clock },
    { id: 'other', label: 'Other Policies', icon: FileText },
    { id: 'system', label: 'SystemConfiguration', icon: Settings }
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
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

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showTksGroupModal, showPayrollLocationModal, showForAbsentModal, showForNoLoginModal, showForNoLogoutModal, showSupervisoryGroupModal, showOtCodeModal]);

  // Function to create new record - clears all fields
  const handleCreateNew = () => {
    // TKS Group Definition
    setTksGroupCode('');
    setTksGroupDescription('');
    setPayrollLocationCode('');
    setPayrollDescription('');
    setDateFrom('');
    setDateTo('');
    setMonth('January');
    setPeriod('');
    setTerminalId('');
    
    // Auto Pairing Logs Cut-Off Dates
    setAutoPairingFrom('');
    setAutoPairingTo('');
    
    // Login Policy
    setGracePeriodSemiAnnual(false);
    setGracePeriodPerDay('');
    setGracePeriodIncludeTardiness(false);
    setIncludeBreak2InGrace(false);
    setDeductibleEvenWithinGrace(false);
    setGracePeriodPerSemiAnnual('');
    setFirstHalfDateFrom('');
    setFirstHalfDateTo('');
    setSecondHalfDateFrom('');
    setSecondHalfDateTo('');
    setDeductOverBreak(false);
    setGracePeriodCalamity2('');
    setCombineTardinessTimeInBreak2(false);
    setComputeTardinessNoLogout(false);
    setNightDiffStartTime('');
    setNightDiffEndTime('');
    setDeductMealBreakND(false);
    setTwoShiftsInDay(false);
    setHoursIntervalTwoShifts('');
    setAllowableGracePeriodMonth('');
    setExcludeAllowableGraceBracket(false);
    setAllowableGraceActualMonth(false);
    setConsiderSaturdayPaid(false);
    setMaxDaysPerWeekSaturday('');
    setAllowableTardyExcess('');
    setExcludeTardinessInGrace(false);
    setSupervisoryGroupCode('');
    setApplyOccurancesBreak(false);
    setMaxOccurancesNoDeduction('');
    setGracePeriodOccurance('');
    setHoursRequiredPerWeek('');
    setStartOfWeek('');
    setComputeType('');
    setOtCodePerWeek('');
    setForAbsent('');
    setForNoLogin('');
    setForNoLogout('');
    setForNoBreak2Out('');
    setForNoBreak2In('');
    
    // Overtime Rates
    setRegularDayOT('');
    setRestDayOT('');
    setLegalHolidayOT('');
    setSpecialHolidayOT('');
    setUseOTPremium(false);
    setUseActualDayType(false);
    setHolidayWithWorkshift(false);
    setOtBreakMinHours('');
    
    // Other Policies
    setUseDefaultRestday(false);
    setRestdayWithWorkshift(false);
    setUseTardinessBracket(false);
    setComputeUndertimeToAbsences('');
    
    // System Configuration
    setUseTimekeepingSystemConfig(false);
    setMinBeforeShift('');
    setMinIgnoreMultipleBreak('');
    setMinBeforeMidnightShift('');
    setMinConsiderBreak2In('');
    setDevicePolicy('');
    
    // Enable edit mode and switch to definition tab
    setIsEditMode(true);
    setActiveTab('definition');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Time Keep Group</h1>
          </div>

      {/* Content Container */}
      <div className="bg-white rounded-b-lg shadow-lg p-6">
        {/* Information Frame */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 mb-2">
                Configure time keeping groups with detailed policies including login rules, overtime rates, grace periods, and system configurations for automated payroll processing.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Group definitions and payroll location setup</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Login policies and grace period rules</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Overtime rates and special calculations</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Cut-off dates and terminal configurations</span>
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
                onClick={handleCreateNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Create New
              </button>
              <button 
                onClick={() => setIsEditMode(true)}
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
                onClick={() => setIsEditMode(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-sm"
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
                className={`px-6 py-2 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white -mb-px'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content - Definition */}
        {activeTab === 'definition' && (
          <div className="space-y-6">
            {/* Form Fields - Single Column Layout */}
            <div className="space-y-4 max-w-full">
              {/* Row 1: TKS Group Code and Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <label className="w-40 text-gray-700 text-sm flex-shrink-0">TKS Group Code</label>
                  <input
                    type="text"
                    value={tksGroupCode}
                    onChange={(e) => setTksGroupCode(e.target.value)}
                    readOnly={!isEditMode}
                    className={`flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-40 text-gray-700 text-sm flex-shrink-0">TKS Group Description</label>
                  <input
                    type="text"
                    value={tksGroupDescription}
                    onChange={(e) => setTksGroupDescription(e.target.value)}
                    readOnly={!isEditMode}
                    className={`flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
                  />
                </div>
              </div>

              {/* Row 2: Payroll Location Code and Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <label className="w-40 text-gray-700 text-sm flex-shrink-0">Payroll Location Code</label>
                  <div className="flex-1 min-w-0 flex gap-2">
                    <input
                      type="text"
                      value={payrollLocationCode}
                      onChange={(e) => setPayrollLocationCode(e.target.value)}
                      readOnly={!isEditMode}
                      className={`flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
                    />
                    {isEditMode && (
                      <>
                        <button 
                          onClick={() => setShowPayrollLocationModal(true)}
                          className="px-3 py-2 rounded-lg transition-all duration-200 flex-shrink-0 shadow-sm bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                        <button 
                          className="px-3 py-2 rounded-lg transition-all duration-200 flex-shrink-0 shadow-sm bg-red-600 text-white hover:bg-red-700 hover:shadow-md active:scale-95"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-40 text-gray-700 text-sm flex-shrink-0">Payroll Description</label>
                  <input
                    type="text"
                    value={payrollDescription}
                    onChange={(e) => setPayrollDescription(e.target.value)}
                    readOnly={!isEditMode}
                    className={`flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
                  />
                </div>
              </div>

              {/* Time Keep Cut Off Dates Section */}
              <div className="border-t pt-4">
                <h3 className="text-gray-700 mb-3">Time Keep Cut Off Dates</h3>
                
                <div className="space-y-3">
                  {/* First Row: Month and Period */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <label className="w-16 text-gray-700 text-sm flex-shrink-0">Month</label>
                      <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        disabled={!isEditMode}
                        className={`w-40 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : 'bg-white'}`}
                      >
                        {months.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="w-16 text-gray-700 text-sm flex-shrink-0">Period</label>
                      <input
                        type="text"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        readOnly={!isEditMode}
                        className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Second Row: Date From */}
                  <div className="flex items-center gap-3">
                    <label className="w-20 text-gray-700 text-sm flex-shrink-0">Date From</label>
                    <DatePicker
                      value={dateFrom}
                      onChange={(date) => setDateFrom(date)}
                      disabled={!isEditMode}
                      className="w-52"
                      placeholder="MM/DD/YYYY"
                    />
                  </div>

                  {/* Third Row: Date To */}
                  <div className="flex items-center gap-3">
                    <label className="w-20 text-gray-700 text-sm flex-shrink-0">Date To</label>
                    <DatePicker
                      value={dateTo}
                      onChange={(date) => setDateTo(date)}
                      disabled={!isEditMode}
                      className="w-52"
                      placeholder="MM/DD/YYYY"
                    />
                  </div>

                  {/* Fourth Row: Terminal ID */}
                  <div className="flex items-center gap-3">
                    <label className="w-20 text-gray-700 text-sm flex-shrink-0">Terminal ID</label>
                    <input
                      type="text"
                      value={terminalId}
                      onChange={(e) => setTerminalId(e.target.value)}
                      readOnly={!isEditMode}
                      className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                </div>
              </div>

              {/* Auto Pairing Logs Cut-Off Dates */}
              <div className="border-t pt-4">
                <h3 className="text-gray-700 mb-3">Auto Pairing Logs Cut-Off Dates</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="w-16 text-gray-700 text-sm flex-shrink-0">From:</label>
                    <DatePicker
                      value={autoPairingFrom}
                      onChange={(date) => setAutoPairingFrom(date)}
                      disabled={!isEditMode}
                      className="w-52"
                      placeholder="MM/DD/YYYY"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="w-16 text-gray-700 text-sm flex-shrink-0">To:</label>
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
            </div>
          </div>
        )}

        {/* Tab Content - Login Policy */}
        {activeTab === 'login-policy' && (
          <div className="space-y-6">
            {/* Group Code and Definition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <label className="w-40 text-gray-700 text-sm flex-shrink-0">TKS Group Code</label>
                <input
                  type="text"
                  value={tksGroupCode}
                  disabled
                  className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded focus:outline-none text-sm bg-gray-100"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="w-48 text-gray-700 text-sm flex-shrink-0">TKS Group Definition</label>
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
                <div className="flex items-center gap-3">
                  <label className="w-56 text-gray-700 text-sm flex-shrink-0">Grace Period Semi-Annual</label>
                  <input
                    type="checkbox"
                    checked={gracePeriodSemiAnnual}
                    onChange={(e) => setGracePeriodSemiAnnual(e.target.checked)}
                    disabled={!isEditMode}
                    className={checkboxClass}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-56 text-gray-700 text-sm flex-shrink-0">Grace Period Per Day</label>
                  <input
                    type="text"
                    value={gracePeriodPerDay}
                    onChange={(e) => setGracePeriodPerDay(e.target.value)}
                    readOnly={!isEditMode}
                    className={`w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
                  />
                  <span className="text-gray-500 text-sm">[hh:mm]</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-56 text-gray-700 text-sm flex-shrink-0">Grace Period Include in Tardiness</label>
                  <input
                    type="checkbox"
                    checked={gracePeriodIncludeTardiness}
                    onChange={(e) => setGracePeriodIncludeTardiness(e.target.checked)}
                    disabled={!isEditMode}
                    className={checkboxClass}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-56 text-gray-700 text-sm flex-shrink-0">Include Break 2 in Grace Period</label>
                  <input
                    type="checkbox"
                    checked={includeBreak2InGrace}
                    onChange={(e) => setIncludeBreak2InGrace(e.target.checked)}
                    disabled={!isEditMode}
                    className={checkboxClass}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-56 text-gray-700 text-sm flex-shrink-0">Deductible even within grace period</label>
                  <input
                    type="checkbox"
                    checked={deductibleEvenWithinGrace}
                    onChange={(e) => setDeductibleEvenWithinGrace(e.target.checked)}
                    disabled={!isEditMode}
                    className={checkboxClass}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-56 text-gray-700 text-sm flex-shrink-0">Grace Period Per Semi-Annual</label>
                  <input
                    type="text"
                    value={gracePeriodPerSemiAnnual}
                    onChange={(e) => setGracePeriodPerSemiAnnual(e.target.value)}
                    readOnly={!isEditMode}
                    className={`w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
                  />
                  <span className="text-gray-500 text-sm">[hh:hh]</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-56 text-gray-700 text-sm flex-shrink-0">1st Half Semi-Annual Date From</label>
                  <DatePicker
                    value={firstHalfDateFrom}
                    onChange={(date) => setFirstHalfDateFrom(date)}
                    disabled={!isEditMode}
                    className="w-52"
                    placeholder="MM/DD/YYYY"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-56 text-gray-700 text-sm flex-shrink-0">1st Half Semi-Annual Date To</label>
                  <DatePicker
                    value={firstHalfDateTo}
                    onChange={(date) => setFirstHalfDateTo(date)}
                    disabled={!isEditMode}
                    className="w-52"
                    placeholder="MM/DD/YYYY"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-56 text-gray-700 text-sm flex-shrink-0">2nd Half Semi-Annual Date From</label>
                  <DatePicker
                    value={secondHalfDateFrom}
                    onChange={(date) => setSecondHalfDateFrom(date)}
                    disabled={!isEditMode}
                    className="w-52"
                    placeholder="MM/DD/YYYY"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-56 text-gray-700 text-sm flex-shrink-0">2nd Half Semi-Annual Date To</label>
                  <DatePicker
                    value={secondHalfDateTo}
                    onChange={(date) => setSecondHalfDateTo(date)}
                    disabled={!isEditMode}
                    className="w-52"
                    placeholder="MM/DD/YYYY"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-56 text-gray-700 text-sm flex-shrink-0">Deduct Over Break</label>
                  <input
                    type="checkbox"
                    checked={deductOverBreak}
                    onChange={(e) => setDeductOverBreak(e.target.checked)}
                    disabled={!isEditMode}
                    className={checkboxClass}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-56 text-gray-700 text-sm flex-shrink-0">Grace Period for Calamity 2</label>
                  <input
                    type="text"
                    value={gracePeriodCalamity2}
                    onChange={(e) => setGracePeriodCalamity2(e.target.value)}
                    className="w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-56 text-gray-700 text-sm flex-shrink-0">Combine Tardiness for TimeIn and Break2</label>
                  <input
                    type="checkbox"
                    checked={combineTardinessTimeInBreak2}
                    onChange={(e) => setCombineTardinessTimeInBreak2(e.target.checked)}
                    className={checkboxClass}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-56 text-gray-700 text-sm flex-shrink-0">Compute Tardiness For No Logout</label>
                  <input
                    type="checkbox"
                    checked={computeTardinessNoLogout}
                    onChange={(e) => setComputeTardinessNoLogout(e.target.checked)}
                    className={checkboxClass}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="w-60 text-gray-700 text-sm flex-shrink-0">Night Diff. Start Time</label>
                  <input
                    type="text"
                    value={nightDiffStartTime}
                    onChange={(e) => setNightDiffStartTime(e.target.value)}
                    readOnly={!isEditMode}
                    className={`w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
                  />
                  <span className="text-gray-500 text-sm">[hh:mm]</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-60 text-gray-700 text-sm flex-shrink-0">Night Diff. End Time</label>
                  <input
                    type="text"
                    value={nightDiffEndTime}
                    onChange={(e) => setNightDiffEndTime(e.target.value)}
                    readOnly={!isEditMode}
                    className={`w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
                  />
                  <span className="text-gray-500 text-sm">[hh:mm]</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-60 text-gray-700 text-sm flex-shrink-0">Deduct Meal Break in ND Comp.</label>
                  <input
                    type="checkbox"
                    checked={deductMealBreakND}
                    onChange={(e) => setDeductMealBreakND(e.target.checked)}
                    disabled={!isEditMode}
                    className={checkboxClass}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-60 text-gray-700 text-sm flex-shrink-0">2 Shifts In A Day</label>
                  <input
                    type="checkbox"
                    checked={twoShiftsInDay}
                    onChange={(e) => setTwoShiftsInDay(e.target.checked)}
                    disabled={!isEditMode}
                    className={checkboxClass}
                  />
                </div>

                <div className="flex items-start gap-3">
                  <label className="w-60 text-gray-700 text-sm flex-shrink-0 pt-1">No. of Hours Interval for 2 Shifts in A Day</label>
                  <input
                    type="text"
                    value={hoursIntervalTwoShifts}
                    onChange={(e) => setHoursIntervalTwoShifts(e.target.value)}
                    readOnly={!isEditMode}
                    className={`w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
                  />
                  <span className="text-gray-500 text-sm pt-1">[hh:hh]</span>
                </div>

                <div className="flex items-start gap-3">
                  <label className="w-60 text-gray-700 text-sm flex-shrink-0 pt-1">No. of Allowable Grace Period in a Month</label>
                  <input
                    type="text"
                    value={allowableGracePeriodMonth}
                    onChange={(e) => setAllowableGracePeriodMonth(e.target.value)}
                    readOnly={!isEditMode}
                    className={`w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
                  />
                </div>

                <div className="flex items-start gap-3">
                  <label className="w-60 text-gray-700 text-sm flex-shrink-0 pt-1">Exclude the no. of Allowable Grace Period in Bracket</label>
                  <input
                    type="checkbox"
                    checked={excludeAllowableGraceBracket}
                    onChange={(e) => setExcludeAllowableGraceBracket(e.target.checked)}
                    disabled={!isEditMode}
                    className={checkboxClass}
                  />
                </div>

                <div className="flex items-start gap-3">
                  <label className="w-60 text-gray-700 text-sm flex-shrink-0 pt-1">Allowable Grace Period in a Month Based on Actual Month</label>
                  <input
                    type="checkbox"
                    checked={allowableGraceActualMonth}
                    onChange={(e) => setAllowableGraceActualMonth(e.target.checked)}
                    className={checkboxClass}
                  />
                </div>

                <div className="flex items-start gap-3">
                  <label className="w-60 text-gray-700 text-sm flex-shrink-0 pt-1">Consider Saturday as Paid Regular Hours</label>
                  <input
                    type="checkbox"
                    checked={considerSaturdayPaid}
                    onChange={(e) => setConsiderSaturdayPaid(e.target.checked)}
                    className={checkboxClass}
                  />
                </div>

                <div className="flex items-start gap-3">
                  <label className="w-60 text-gray-700 text-sm flex-shrink-0 pt-1">Max. Days Per Week to Consider UnWorked Saturday As Paid Regular Hours</label>
                  <input
                    type="text"
                    value={maxDaysPerWeekSaturday}
                    onChange={(e) => setMaxDaysPerWeekSaturday(e.target.value)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Group 1: Tardy and Supervisory */}
                <div className="border border-gray-300 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <label className="w-60 text-gray-700 text-sm flex-shrink-0 pt-1">No. of Allowable Tardy in Excess of Grace Period in a Month</label>
                    <input
                      type="text"
                      value={allowableTardyExcess}
                      onChange={(e) => setAllowableTardyExcess(e.target.value)}
                      className="w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <label className="w-60 text-gray-700 text-sm flex-shrink-0 pt-1">Exclude Tardiness Within Grace Period in Count for Allowable Tardy in Excess of Grace Period in a Month</label>
                    <input
                      type="checkbox"
                      checked={excludeTardinessInGrace}
                      onChange={(e) => setExcludeTardinessInGrace(e.target.checked)}
                      className="w-4 h-4 mt-1"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="w-60 text-gray-700 text-sm flex-shrink-0">Supervisory GroupCode</label>
                    <input
                      type="text"
                      value={supervisoryGroupCode}
                      onChange={(e) => setSupervisoryGroupCode(e.target.value)}
                      readOnly={!isEditMode}
                      className={`w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
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
                          onClick={() => setSupervisoryGroupCode('')}
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
                    <label className="w-60 text-gray-700 text-sm flex-shrink-0 pt-1">Apply Occurances to Break1 and Break3</label>
                    <input
                      type="checkbox"
                      checked={applyOccurancesBreak}
                      onChange={(e) => setApplyOccurancesBreak(e.target.checked)}
                      className="w-4 h-4 mt-1"
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <label className="w-60 text-gray-700 text-sm flex-shrink-0 pt-1">Max No. of Occurances for no deduction</label>
                    <input
                      type="text"
                      value={maxOccurancesNoDeduction}
                      onChange={(e) => setMaxOccurancesNoDeduction(e.target.value)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="w-60 text-gray-700 text-sm flex-shrink-0">Grace Period</label>
                    <input
                      type="text"
                      value={gracePeriodOccurance}
                      onChange={(e) => setGracePeriodOccurance(e.target.value)}
                      className="w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <span className="text-gray-500 text-sm">[hh:mm]</span>
                  </div>
                </div>

                {/* Group 3: Weekly Computation */}
                <div className="border border-gray-300 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <label className="w-60 text-gray-700 text-sm flex-shrink-0 pt-1">No of Hrs Required to Complete Per Week</label>
                    <input
                      type="text"
                      value={hoursRequiredPerWeek}
                      onChange={(e) => setHoursRequiredPerWeek(e.target.value)}
                      className="w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <span className="text-gray-500 text-sm pt-1">[hh:hh]</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="w-60 text-gray-700 text-sm flex-shrink-0">Start of Week</label>
                    <input
                      type="text"
                      value={startOfWeek}
                      onChange={(e) => setStartOfWeek(e.target.value)}
                      className="w-40 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <label className="w-60 text-gray-700 text-sm flex-shrink-0 pt-1"></label>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="computeType"
                          value="tardiness"
                          checked={computeType === 'tardiness'}
                          onChange={(e) => setComputeType(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-700 text-sm">Compute as Tardiness</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="computeType"
                          value="undertime"
                          checked={computeType === 'undertime'}
                          onChange={(e) => setComputeType(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-700 text-sm">Compute as Undertime</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="w-60 text-gray-700 text-sm flex-shrink-0">OT Code Per Week</label>
                    <input
                      type="text"
                      value={otCodePerWeek}
                      onChange={(e) => setOtCodePerWeek(e.target.value)}
                      readOnly={!isEditMode}
                      className={`w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
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
                          onClick={() => setOtCodePerWeek('')}
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
              <h3 className="text-gray-700 mb-4">Default Equivalent Hours To Be Deducted for Absent, No Login, and No Logout if No Shift Defined</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <label className="w-40 text-gray-700 text-sm flex-shrink-0">For Absent</label>
                  <input
                    type="text"
                    value={forAbsent}
                    onChange={(e) => setForAbsent(e.target.value)}
                    readOnly={!isEditMode}
                    className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
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
                        onClick={() => setForAbsent('')}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-40 text-gray-700 text-sm flex-shrink-0">For No Break 2 Out</label>
                  <input
                    type="text"
                    value={forNoBreak2Out}
                    onChange={(e) => setForNoBreak2Out(e.target.value)}
                    readOnly={!isEditMode}
                    className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
                  />
                  {isEditMode && (
                    <>
                      <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <Search className="w-4 h-4" />
                      </button>
                      <button className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-40 text-gray-700 text-sm flex-shrink-0">For No Login</label>
                  <input
                    type="text"
                    value={forNoLogin}
                    onChange={(e) => setForNoLogin(e.target.value)}
                    readOnly={!isEditMode}
                    className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
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
                        onClick={() => setForNoLogin('')}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-40 text-gray-700 text-sm flex-shrink-0">For No Break 2 In</label>
                  <input
                    type="text"
                    value={forNoBreak2In}
                    onChange={(e) => setForNoBreak2In(e.target.value)}
                    readOnly={!isEditMode}
                    className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
                  />
                  {isEditMode && (
                    <>
                      <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <Search className="w-4 h-4" />
                      </button>
                      <button className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-40 text-gray-700 text-sm flex-shrink-0">For No Logout</label>
                  <input
                    type="text"
                    value={forNoLogout}
                    onChange={(e) => setForNoLogout(e.target.value)}
                    readOnly={!isEditMode}
                    className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
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
                        onClick={() => setForNoLogout('')}
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
        {activeTab === 'overtime' && (
          <OvertimeRatesTabContent 
            tksGroupCode={tksGroupCode}
            tksGroupDescription={tksGroupDescription}
            isEditMode={isEditMode}
            regularDayOT={regularDayOT}
            setRegularDayOT={setRegularDayOT}
            restDayOT={restDayOT}
            setRestDayOT={setRestDayOT}
            legalHolidayOT={legalHolidayOT}
            setLegalHolidayOT={setLegalHolidayOT}
            specialHolidayOT={specialHolidayOT}
            setSpecialHolidayOT={setSpecialHolidayOT}
            otBreakMinHours={otBreakMinHours}
            setOtBreakMinHours={setOtBreakMinHours}
          />
        )}

        {/* Tab Content - Other Policies */}
        {activeTab === 'other' && (
          <OtherPoliciesTabContent
            tksGroupCode={tksGroupCode}
            tksGroupDescription={tksGroupDescription}
            isEditMode={isEditMode}
          />
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            {/* Use Timekeeping System Config */}
            <div className="flex items-start gap-3">
              <label className="text-gray-700 text-sm">Use Timekeeping System Config :</label>
              <input 
                type="checkbox" 
                checked={useTimekeepingSystemConfig}
                onChange={(e) => setUseTimekeepingSystemConfig(e.target.checked)}
                disabled={!isEditMode}
                className={checkboxClass}
              />
            </div>

            {/* No. of Min. Before the Shift */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <label className="text-gray-700 text-sm">No. of Min. Before the Shift :</label>
                <input
                  type="text"
                  defaultValue="0"
                  readOnly={!isEditMode}
                  className={`w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
                />
              </div>
              <ul className="ml-6 space-y-1">
                <li className="text-green-600 text-sm">• Used in Validate Logs in Import {'>'} Update Raw Data</li>
              </ul>
            </div>

            {/* No. of Min. to Ignore Multiple Break Out/In */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <label className="text-gray-700 text-sm">No. of Min. to Ignore Multiple Break Out/In :</label>
                <input
                  type="text"
                  defaultValue="0"
                  readOnly={!isEditMode}
                  className={`w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
                />
              </div>
              <ul className="ml-6 space-y-1">
                <li className="text-green-600 text-sm">• This will be triggered when your Device Policy is Device 4</li>
                <li className="text-green-600 text-sm">During pairing of Breaks The system will ignore Multiple breaks when the difference of break is equal or less than to defined policy.</li>
              </ul>
            </div>

            {/* No. of Min. Before Midnight Shift */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <label className="text-gray-700 text-sm">No. of Min. Before Midnight Shift :</label>
                <input
                  type="text"
                  defaultValue="0"
                  readOnly={!isEditMode}
                  className={`w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
                />
              </div>
              <ul className="ml-6 space-y-1">
                <li className="text-green-600 text-sm">• This will be triggered when Midnight Shift is check in workshift.</li>
              </ul>
            </div>

            {/* No of Min. to Consider Break2 In */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <label className="text-gray-700 text-sm">No of Min. to Consider Break2 In :</label>
                <input
                  type="text"
                  defaultValue="0"
                  readOnly={!isEditMode}
                  className={`w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
                />
              </div>
              <ul className="ml-6 space-y-1">
                <li className="text-green-600 text-sm">• This is the number of minutes to consider as the pair of Break 2 Out, this is used in Device 5.</li>
              </ul>
            </div>

            {/* Device Policy */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <label className="text-gray-700 text-sm">Device Policy :</label>
                <input
                  type="text"
                  readOnly={!isEditMode}
                  className={`w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
                />
              </div>
              <ul className="ml-6 space-y-1">
                <li className="text-green-600 text-sm">• Leave blank if you want the default pairing of logs.</li>
              </ul>
            </div>

            {/* Device Policy Descriptions */}
            <div className="ml-6 space-y-3 text-sm">
              <div>
                <div className="text-green-600"><strong>Device 1</strong> - First In Last Out Regardless of flagging</div>
              </div>

              <div>
                <div className="text-green-600 mb-1"><strong>Device 2</strong></div>
                <div className="ml-4 space-y-1 text-green-600">
                  <div>First In = Time In</div>
                  <div>Second In = Break2 In</div>
                  <div>First Out = Break2 Out</div>
                  <div>Second Out = Time Out (if no second out First Out will become Time Out)</div>
                </div>
              </div>

              <div>
                <div className="text-green-600 mb-1"><strong>Device 3</strong></div>
                <div className="ml-4 space-y-1 text-green-600">
                  <div>First Flag for Break1Out = Break1Out</div>
                  <div>Second Flag for Break1Out = Break3Out</div>
                  <div>First flag for Break1In = Break1In</div>
                  <div>Last flag for break1In = Break3In</div>
                </div>
              </div>

              <div>
                <div className="text-green-600 mb-1"><strong>Device 4</strong></div>
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
                  If there is First Flag of any Break before Any flag of In/Out, Flagging of In/Out will always be Out.
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
                  All Logs that falls on 6:00am Current Date to 5:59am the next day will be paired to Current Date
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
                  First In of the current day and last out before first in of next day
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TKS Group Search Modal */}
      {showTksGroupModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"
            onClick={() => setShowTksGroupModal(false)}
          />
      
      {/* Modal Content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl"
          onClick={(e) => e.stopPropagation() }
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">TKS Group</h2>
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
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="border-b-2 border-gray-300">
                <tr>
                  <th className="text-left py-2 text-gray-700 font-semibold">
                    <div className="flex items-center gap-1">
                      Code
                      <span className="text-blue-600">▲</span>
                    </div>
                  </th>
                  <th className="text-left py-2 text-gray-700 font-semibold">Desc</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { code: '1', desc: 'Batangas1 Balagtas Monthly Payroll' },
                  { code: '10', desc: 'Batangas Monthly Cash Payroll with Paycard' },
                  { code: '100', desc: '' },
                  { code: '101', desc: 'Main Batangas Daily' },
                  { code: '102', desc: 'Main Batangas Daily with Paycard' },
                  { code: '103', desc: 'Main Batangas Monthly' },
                  { code: '104', desc: 'Main Batangas Monthly with Paycard' },
                  { code: '105', desc: 'Nueva Ecija Monthly Payroll' },
                  { code: '106', desc: 'Nueva Ecija Daily Payroll' },
                  { code: '107', desc: 'Nueva Ecija Monthly Cash Payroll' },
                ]
                  .filter(item => 
                    tksGroupSearchTerm === '' ||
                    item.code.toLowerCase().includes(tksGroupSearchTerm.toLowerCase()) ||
                    item.desc.toLowerCase().includes(tksGroupSearchTerm.toLowerCase())
                  )
                  .map((item, index) => (
                  <tr 
                    key={item.code}
                    className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                    onClick={() => {
                      setTksGroupCode(item.code);
                      setTksGroupDescription(item.desc);
                      setShowTksGroupModal(false);
                    }}
                  >
                    <td className="py-2 text-gray-800">{item.code}</td>
                    <td className="py-2 text-gray-800">{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-center gap-2">
            <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded transition-colors">
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
            <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded transition-colors">2</button>
            <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded transition-colors">3</button>
            <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded transition-colors">4</button>
            <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded transition-colors">5</button>
            <span className="px-2 text-gray-500">...</span>
            <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded transition-colors">12</button>
            <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded transition-colors">
              Next
            </button>
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
    </div>
      )}
      
      {/* Payroll Location Search Modal - FIXED */}
      {showPayrollLocationModal && (
        {/* <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"
            onClick={() => setShowPayrollLocationModal(false)}
          />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="relative bg-white rounded-lg shadow-2xl w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >

            </div>
          </div>
        </div> */}
      )}

      {/* For Absent Search Modal */}
      {showForAbsentModal && (
        {/*}
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"
            onClick={() => setShowForAbsentModal(false)}
          />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
            </div>
          </div>
        </div>
        */}
      )}

      {/* For No Login Search Modal - FIXED */}
      {showForNoLoginModal && (
        {/*
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"
            onClick={() => setShowForNoLoginModal(false)}
          />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
            </div>
          </div>
        </div>
        */}
      )}

      {/* For No Logout Search Modal - FIXED */}
      {showForNoLogoutModal && (
        {/*
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"
            onClick={() => setShowForNoLogoutModal(false)}
          />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
            </div>
          </div>
        </div>
        */}
      )}

      {/* Supervisory Group Code Search Modal - FIXED */}
      {showSupervisoryGroupModal && (
        {/*
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"
            onClick={() => setShowSupervisoryGroupModal(false)}
          />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="relative bg-white rounded-lg shadow-2xl w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
            </div>
          </div>
        </div>
        */}
      )}

      {/* OT Code Per Week Search Modal - FIXED */}
      {showOtCodeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"
            onClick={() => setShowOtCodeModal(false)}
          />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Rest of modal content - keep as is */}
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