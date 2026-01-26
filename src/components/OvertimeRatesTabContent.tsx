import { X, Search, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface OvertimeRatesTabContentProps {
  tksGroupCode: string;
  tksGroupDescription: string;
  isEditMode: boolean;
  regularDayOT: string;
  setRegularDayOT: (value: string) => void;
  restDayOT: string;
  setRestDayOT: (value: string) => void;
  legalHolidayOT: string;
  setLegalHolidayOT: (value: string) => void;
  specialHolidayOT: string;
  setSpecialHolidayOT: (value: string) => void;
  otBreakMinHours: string;
  setOtBreakMinHours: (value: string) => void;
}

export function OvertimeRatesTabContent({ 
  tksGroupCode, 
  tksGroupDescription, 
  isEditMode,
  regularDayOT,
  setRegularDayOT,
  restDayOT,
  setRestDayOT,
  legalHolidayOT,
  setLegalHolidayOT,
  specialHolidayOT,
  setSpecialHolidayOT,
  otBreakMinHours,
  setOtBreakMinHours
}: OvertimeRatesTabContentProps) {
  const checkboxClass = "w-4 h-4 appearance-none border-2 border-gray-400 rounded bg-white checked:bg-blue-600 checked:border-blue-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";
  const searchButtonClass = "px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors";
  const clearButtonClass = "px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors";

  const [showEarningCodeModal, setShowEarningCodeModal] = useState(false);
  const [earningCodeSearchTerm, setEarningCodeSearchTerm] = useState('');
  
  // Birthday Pay state
  const [birthdayPay, setBirthdayPay] = useState('');
  const [showBirthdayPayModal, setShowBirthdayPayModal] = useState(false);
  const [birthdayPaySearchTerm, setBirthdayPaySearchTerm] = useState('');
  
  // OT Allowances state
  const [minOTHrs, setMinOTHrs] = useState('');
  const [accumOTHrs, setAccumOTHrs] = useState('');
  const [amount, setAmount] = useState('');
  const [earningCode, setEarningCode] = useState('');
  const [otAllowances, setOtAllowances] = useState<Array<{
    minOTHrs: string;
    accumOTHrs: string;
    amount: string;
    earningCode: string;
  }>>([]);
  
  // Mock earning codes data
  const earningCodes = [
    { code: 'E01', description: 'Regular Pay' },
    { code: 'E02', description: 'Overtime' },
    { code: 'E03', description: 'Charge SL/VL' },
    { code: 'E04', description: 'Absences' },
    { code: 'E05', description: 'UT/Tardiness' },
    { code: 'E06', description: '13th Month Pay NonTax' },
    { code: 'E07', description: 'COLA' },
    { code: 'E08', description: 'Transportation Expense Reimbursement Allowance' },
    { code: 'E09', description: 'Onsite Rollform Allowance' },
    { code: 'E10', description: 'Overwithheld' },
  ];

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showEarningCodeModal) {
          setShowEarningCodeModal(false);
        } else if (showBirthdayPayModal) {
          setShowBirthdayPayModal(false);
        }
      }
    };

    if (showEarningCodeModal || showBirthdayPayModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showEarningCodeModal, showBirthdayPayModal]);

  // Handle Add button click
  const handleAddAllowance = () => {
    if (!isEditMode) return;
    
    // Validate that all fields have values
    if (!minOTHrs || !accumOTHrs || !amount || !earningCode) {
      alert('Please fill in all fields before adding.');
      return;
    }

    // Add new allowance to the table
    setOtAllowances([...otAllowances, {
      minOTHrs,
      accumOTHrs,
      amount,
      earningCode
    }]);

    // Clear input fields
    setMinOTHrs('');
    setAccumOTHrs('');
    setAmount('');
    setEarningCode('');
  };

  // Handle earning code selection from modal
  const handleEarningCodeSelect = (code: string) => {
    setEarningCode(code);
    setShowEarningCodeModal(false);
  };

  // Handle clear earning code
  const handleClearEarningCode = () => {
    setEarningCode('');
  };

  // Handle delete allowance
  const handleDeleteAllowance = (index: number) => {
    if (!isEditMode) return;
    setOtAllowances(otAllowances.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Group Code and Definition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-3">
          <label className="w-40 text-gray-700 text-sm flex-shrink-0">TKS Group Code</label>
          <input
            type="text"
            value={tksGroupCode}
            disabled
            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-100"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="w-48 text-gray-700 text-sm flex-shrink-0">TKS Group Definition</label>
          <input
            type="text"
            value={tksGroupDescription}
            disabled
            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-100"
          />
        </div>
      </div>

      {/* Two Column Layout - Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div>
          {/* Overtime Rates Fields */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="w-48 text-gray-700 text-sm text-right">Regular Day Overtime Rates</label>
              <input
                type="text"
                value={regularDayOT}
                onChange={(e) => setRegularDayOT(e.target.value)}
                readOnly={!isEditMode}
                className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
              />
              {isEditMode && (
                <>
                  <button className={searchButtonClass}><Search className="w-4 h-4" /></button>
                  <button className={clearButtonClass}><X className="w-4 h-4" /></button>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="w-48 text-gray-700 text-sm text-right">Rest Day Overtime Rates</label>
              <input
                type="text"
                value={restDayOT}
                onChange={(e) => setRestDayOT(e.target.value)}
                readOnly={!isEditMode}
                className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
              />
              {isEditMode && (
                <>
                  <button className={searchButtonClass}><Search className="w-4 h-4" /></button>
                  <button className={clearButtonClass}><X className="w-4 h-4" /></button>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="w-48 text-gray-700 text-sm text-right">Legal Holiday Overtime Rates</label>
              <input
                type="text"
                value={legalHolidayOT}
                onChange={(e) => setLegalHolidayOT(e.target.value)}
                readOnly={!isEditMode}
                className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
              />
              {isEditMode && (
                <>
                  <button className={searchButtonClass}><Search className="w-4 h-4" /></button>
                  <button className={clearButtonClass}><X className="w-4 h-4" /></button>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="w-48 text-gray-700 text-sm text-right">Special Holiday Overtime Rates</label>
              <input
                type="text"
                value={specialHolidayOT}
                onChange={(e) => setSpecialHolidayOT(e.target.value)}
                readOnly={!isEditMode}
                className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
              />
              {isEditMode && (
                <>
                  <button className={searchButtonClass}><Search className="w-4 h-4" /></button>
                  <button className={clearButtonClass}><X className="w-4 h-4" /></button>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="w-48 text-gray-700 text-sm text-right">Double Legal Holiday</label>
              <input
                type="text"
                readOnly={!isEditMode}
                className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
              />
              {isEditMode && (
                <>
                  <button className={searchButtonClass}><Search className="w-4 h-4" /></button>
                  <button className={clearButtonClass}><X className="w-4 h-4" /></button>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="w-48 text-gray-700 text-sm text-right">Special Holiday 2</label>
              <input
                type="text"
                readOnly={!isEditMode}
                className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
              />
              {isEditMode && (
                <>
                  <button className={searchButtonClass}><Search className="w-4 h-4" /></button>
                  <button className={clearButtonClass}><X className="w-4 h-4" /></button>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="w-48 text-gray-700 text-sm text-right">Non-Working Holiday</label>
              <input
                type="text"
                readOnly={!isEditMode}
                className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
              />
              {isEditMode && (
                <>
                  <button className={searchButtonClass}><Search className="w-4 h-4" /></button>
                  <button className={clearButtonClass}><X className="w-4 h-4" /></button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <span className="text-gray-700 text-sm w-56">Use OT Premium BreakDown</span>
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} defaultChecked={true} />
            </label>

            <label className="flex items-center gap-3">
              <span className="text-gray-700 text-sm w-56">Use Actual Day Type</span>
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} defaultChecked={true} />
            </label>

            <label className="flex items-center gap-3">
              <span className="text-gray-700 text-sm w-56">Holiday With Workshift</span>
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} defaultChecked={true} />
            </label>

            <label className="flex items-center gap-3">
              <span className="text-gray-700 text-sm w-56">Deduct MealBreak in OT Comp.</span>
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
            </label>

            <label className="flex items-center gap-3">
              <span className="text-gray-700 text-sm w-56">Compute OT for Break2Out/Break2In</span>
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} defaultChecked={true} />
            </label>

            <label className="flex items-center gap-3">
              <span className="text-gray-700 text-sm w-56">Enable 24-hr OT</span>
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
            </label>

            <label className="flex items-start gap-3">
              <span className="text-gray-700 text-sm w-56 pt-1">Include Unworked Holiday Pay in the Regular Days/Hours</span>
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} defaultChecked={true} />
            </label>

            <label className="flex items-start gap-3">
              <span className="text-gray-700 text-sm w-56 pt-1">Sunday Work is considered OT if Worked on Saturday</span>
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} defaultChecked={true} />
            </label>
          </div>
        </div>
      </div>

      {/* Aligned Sections Row 1: Overtime Code for Late Filing & OT Break */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Overtime Code for Late Filing */}
        <div>
          <div className="bg-gray-50 p-4 rounded border border-gray-300">
            <h4 className="text-gray-700 mb-4">Overtime Code for Late Filing</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="w-48 text-gray-700 text-sm text-right">Regular Day Overtime Rates</label>
                <input
                  type="text"
                  readOnly={!isEditMode}
                  className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                {isEditMode && (
                  <>
                    <button className={searchButtonClass}><Search className="w-4 h-4" /></button>
                    <button className={clearButtonClass}><X className="w-4 h-4" /></button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="w-48 text-gray-700 text-sm text-right">Rest Day Overtime Rates</label>
                <input
                  type="text"
                  readOnly={!isEditMode}
                  className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                {isEditMode && (
                  <>
                    <button className={searchButtonClass}><Search className="w-4 h-4" /></button>
                    <button className={clearButtonClass}><X className="w-4 h-4" /></button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="w-48 text-gray-700 text-sm text-right">Legal Holiday Overtime Rates</label>
                <input
                  type="text"
                  readOnly={!isEditMode}
                  className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                {isEditMode && (
                  <>
                    <button className={searchButtonClass}><Search className="w-4 h-4" /></button>
                    <button className={clearButtonClass}><X className="w-4 h-4" /></button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="w-48 text-gray-700 text-sm text-right">Special Holiday Overtime Rates</label>
                <input
                  type="text"
                  readOnly={!isEditMode}
                  className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                {isEditMode && (
                  <>
                    <button className={searchButtonClass}><Search className="w-4 h-4" /></button>
                    <button className={clearButtonClass}><X className="w-4 h-4" /></button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="w-48 text-gray-700 text-sm text-right">Double Legal Holiday</label>
                <input
                  type="text"
                  readOnly={!isEditMode}
                  className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                {isEditMode && (
                  <>
                    <button className={searchButtonClass}><Search className="w-4 h-4" /></button>
                    <button className={clearButtonClass}><X className="w-4 h-4" /></button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="w-48 text-gray-700 text-sm text-right">Special Holiday 2</label>
                <input
                  type="text"
                  readOnly={!isEditMode}
                  className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                {isEditMode && (
                  <>
                    <button className={searchButtonClass}><Search className="w-4 h-4" /></button>
                    <button className={clearButtonClass}><X className="w-4 h-4" /></button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="w-48 text-gray-700 text-sm text-right">Non-Working Holiday</label>
                <input
                  type="text"
                  readOnly={!isEditMode}
                  className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                {isEditMode && (
                  <>
                    <button className={searchButtonClass}><Search className="w-4 h-4" /></button>
                    <button className={clearButtonClass}><X className="w-4 h-4" /></button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: OT Break */}
        <div>
          <div className="bg-gray-50 p-4 rounded border border-gray-300">
            <h4 className="text-red-600 mb-4">OT Break</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="w-40 text-gray-700 text-sm text-right">Minimum Hours</label>
                <input
                  type="text"
                  value={otBreakMinHours}
                  onChange={(e) => setOtBreakMinHours(e.target.value)}
                  readOnly={!isEditMode}
                  className={`w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                <span className="text-gray-500 text-sm">[hh.mm]</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="w-40 text-gray-700 text-sm text-right">No. of Hrs Deductible</label>
                <input
                  type="text"
                  readOnly={!isEditMode}
                  className={`w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                <span className="text-gray-500 text-sm">[hh.hh]</span>
              </div>

              <div className="mt-4">
                <label className="text-gray-700 text-sm mb-2 block">Applies To:</label>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 pl-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
                    <span className="text-gray-700 text-sm">Regular Day</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
                    <span className="text-gray-700 text-sm">Rest Day</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
                    <span className="text-gray-700 text-sm">Legal Holiday</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
                    <span className="text-gray-700 text-sm">Legal Holiday Falling On Restday</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
                    <span className="text-gray-700 text-sm">Special Holiday</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
                    <span className="text-gray-700 text-sm">Special Holiday Falling On Restday</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
                    <span className="text-gray-700 text-sm">Double Legal Holiday</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
                    <span className="text-gray-700 text-sm">Double Legal Holiday Falling On Restday</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
                    <span className="text-gray-700 text-sm">Special 2 Holiday</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
                    <span className="text-gray-700 text-sm">Special 2 Holiday Falling On Restday</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
                    <span className="text-gray-700 text-sm">Non-Working Holiday</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
                    <span className="text-gray-700 text-sm">Non-Working Holiday Falling On Restday</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aligned Sections Row 2: Minimum Hrs To Compute OT & RestDay Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Minimum Hrs To Compute OT */}
        <div>
          <div className="bg-gray-50 p-4 rounded border border-gray-300">
            <h4 className="text-gray-700 mb-4">Minimum Hrs To Compute OT</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="w-40 text-gray-700 text-sm text-right">Regular Day</label>
                <input
                  type="text"
                  readOnly={!isEditMode}
                  className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                <span className="text-gray-500 text-sm">[hh.mm]</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="w-40 text-gray-700 text-sm text-right">Rest Day</label>
                <input
                  type="text"
                  readOnly={!isEditMode}
                  className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                <span className="text-gray-500 text-sm">[hh.mm]</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="w-40 text-gray-700 text-sm text-right">Legal Holiday</label>
                <input
                  type="text"
                  readOnly={!isEditMode}
                  className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                <span className="text-gray-500 text-sm">[hh.mm]</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="w-40 text-gray-700 text-sm text-right">Special Holiday</label>
                <input
                  type="text"
                  readOnly={!isEditMode}
                  className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                <span className="text-gray-500 text-sm">[hh.mm]</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="w-40 text-gray-700 text-sm text-right">Special 2 Holiday</label>
                <input
                  type="text"
                  readOnly={!isEditMode}
                  className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                <span className="text-gray-500 text-sm">[hh.mm]</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="w-40 text-gray-700 text-sm text-right">Double Legal Holiday</label>
                <input
                  type="text"
                  readOnly={!isEditMode}
                  className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                <span className="text-gray-500 text-sm">[hh.mm]</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="w-40 text-gray-700 text-sm text-right">Non-Working Holiday</label>
                <input
                  type="text"
                  readOnly={!isEditMode}
                  className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                <span className="text-gray-500 text-sm">[hh.mm]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: RestDay and Overtime Fields */}
        <div>
          <div className="bg-gray-50 p-4 rounded border border-gray-300">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="w-56 text-gray-700 text-sm">RestDay to be Computed as Other Rate</label>
                <select
                  disabled={!isEditMode}
                  className={`flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                >
                  <option value=""></option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="w-56 text-gray-700 text-sm">RestDay Other Rate</label>
                <input
                  type="text"
                  readOnly={!isEditMode}
                  className={`flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                {isEditMode && (
                  <>
                    <button className={searchButtonClass}><Search className="w-4 h-4" /></button>
                    <button className={clearButtonClass}><X className="w-4 h-4" /></button>
                  </>
                )}
              </div>

              <label className="flex items-center gap-3">
                <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
                <span className="text-gray-700 text-sm">Overtime Per CutOff</span>
              </label>

              <div className="flex items-center gap-3">
                <label className="w-56 text-gray-700 text-sm">Overtime Code</label>
                <input
                  type="text"
                  readOnly={!isEditMode}
                  className={`flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                {isEditMode && (
                  <>
                    <button className={searchButtonClass}><Search className="w-4 h-4" /></button>
                    <button className={clearButtonClass}><X className="w-4 h-4" /></button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="w-56 text-gray-700 text-sm">Required Hours</label>
                <input
                  type="text"
                  readOnly={!isEditMode}
                  className={`flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                <span className="text-gray-500 text-sm">[hh.hh]</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="w-56 text-gray-700 text-sm">Overtime Code for 2Shifts In A Day</label>
                <input
                  type="text"
                  defaultValue="ADJ_PAY"
                  readOnly={!isEditMode}
                  className={`flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                {isEditMode && (
                  <>
                    <button className={searchButtonClass}><Search className="w-4 h-4" /></button>
                    <button className={clearButtonClass}><X className="w-4 h-4" /></button>
                  </>
                )}
              </div>

              <div className="border-t border-gray-300 pt-3 mt-3">
                <div className="flex items-center gap-3">
                  <label className="w-64 text-gray-700 text-sm text-right">OT Rounding Down to the Nearest Hour/Min</label>
                  <input
                    type="text"
                    defaultValue="1.00"
                    readOnly={!isEditMode}
                    className={`w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                  />
                  <span className="text-gray-500 text-sm">[hh.mm]</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="w-64 text-gray-700 text-sm text-right">Birthday Pay</label>
                <input
                  type="text"
                  value={birthdayPay}
                  onChange={(e) => setBirthdayPay(e.target.value)}
                  readOnly={!isEditMode}
                  className={`w-40 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                {isEditMode && (
                  <>
                    <button 
                      onClick={() => setShowBirthdayPayModal(true)}
                      className={searchButtonClass}
                    >
                      <Search className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setBirthdayPay('')}
                      className={clearButtonClass}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="w-64 text-gray-700 text-sm text-right">ND Basic Rounding Down to the Nearest Hour/Min</label>
                <input
                  type="text"
                  defaultValue="0.30"
                  readOnly={!isEditMode}
                  className={`w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-white' : ''}`}
                />
                <span className="text-gray-500 text-sm">[hh.mm]</span>
              </div>

              <div className="border-t border-gray-300 pt-3 mt-3 space-y-3">
                <label className="flex items-start gap-3">
                  <input type="checkbox" className={checkboxClass} disabled={!isEditMode} defaultChecked={true} />
                  <span className="text-gray-700 text-sm">
                    Use Over Time Authorization
                    <br />
                    <span className="text-xs text-gray-500">[if checked, Overtime computation is based on the entry Overtime Application]</span>
                  </span>
                </label>

                <label className="flex items-start gap-3">
                  <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
                  <span className="text-gray-700 text-sm">
                    Special OT Computation
                    <br />
                    <span className="text-xs text-gray-500">[if checked, Excess OT is based on the Day Type of Date Out; this applies if rendered more than one day]</span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Full Width */}
      <div className="space-y-6 border-t pt-6">

        {/* OT Allowances Section */}
        <div className="bg-gray-50 p-4 rounded border border-gray-300">
          <h4 className="text-gray-700 mb-4">OT Allowances</h4>
          
          {/* Add Row with Input Fields */}
          <div className="flex items-center gap-3 mb-4">
            <button 
              disabled={!isEditMode}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddAllowance}
            >
              Add
            </button>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 whitespace-nowrap">Min. OT Hrs.</label>
              <input
                type="text"
                value={minOTHrs}
                onChange={(e) => setMinOTHrs(e.target.value)}
                readOnly={!isEditMode}
                className={`w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 whitespace-nowrap">Accum. OT Hrs. To Earn Meal Allow.</label>
              <input
                type="text"
                value={accumOTHrs}
                onChange={(e) => setAccumOTHrs(e.target.value)}
                readOnly={!isEditMode}
                className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 whitespace-nowrap">Amount</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                readOnly={!isEditMode}
                className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 whitespace-nowrap">Earning Code</label>
              <input
                type="text"
                value={earningCode}
                onChange={(e) => setEarningCode(e.target.value)}
                readOnly={!isEditMode}
                className={`w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
              />
              {isEditMode && (
                <>
                  <button 
                    onClick={() => setShowEarningCodeModal(true)}
                    className={searchButtonClass}
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  <button className={clearButtonClass} onClick={handleClearEarningCode}>
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
            <div className="grid grid-cols-5 gap-4 bg-gray-100 p-3 border-b border-gray-300">
              <div className="text-gray-700 text-sm font-medium">Minimum OT Hours</div>
              <div className="text-gray-700 text-sm font-medium">Accumulated OT Hours To Earn Meal Allowance</div>
              <div className="text-gray-700 text-sm font-medium">Earning Code</div>
              <div className="text-gray-700 text-sm font-medium">Amount</div>
              {isEditMode && <div className="text-gray-700 text-sm font-medium">Actions</div>}
            </div>
            {otAllowances.length === 0 ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                No data available
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {otAllowances.map((allowance, index) => (
                  <div key={index} className="grid grid-cols-5 gap-4 p-3 hover:bg-gray-50">
                    <div className="text-sm text-gray-700">{allowance.minOTHrs}</div>
                    <div className="text-sm text-gray-700">{allowance.accumOTHrs}</div>
                    <div className="text-sm text-gray-700">{allowance.earningCode}</div>
                    <div className="text-sm text-gray-700">{allowance.amount}</div>
                    {isEditMode && (
                      <div>
                        <button
                          onClick={() => handleDeleteAllowance(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Holiday Pay Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-6">
            <label className="text-gray-700 text-sm">Holiday Pay</label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} defaultChecked={true} />
              <span className="text-gray-700 text-sm">Legal</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} defaultChecked={true} />
              <span className="text-gray-700 text-sm">Special</span>
            </label>
          </div>

          <div className="pl-8 space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
              <span className="text-gray-700 text-sm">Compute Holiday Pay for Monthly</span>
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} defaultChecked={true} />
              <span className="text-gray-700 text-sm">No Pay if Absent Before Holiday</span>
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
              <span className="text-gray-700 text-sm">Compute Holiday Pay If Worked Before Holiday Even on RestDay</span>
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} defaultChecked={true} />
              <span className="text-gray-700 text-sm">Compute Holiday Pay If Worked Before Holiday Even on Legal Holiday</span>
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
              <span className="text-gray-700 text-sm">Compute Holiday Pay If Worked Before Holiday Even on Special Holiday</span>
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
              <span className="text-gray-700 text-sm">No Pay If Absent After Holiday</span>
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" className={checkboxClass} disabled={!isEditMode} defaultChecked={true} />
              <span className="text-gray-700 text-sm">Compute Holiday Pay If With Paid Leave Prior To Holiday</span>
            </label>

            <div className="flex items-center gap-3 pt-2">
              <label className="text-gray-700 text-sm">Minimum Hours Rendered If Worked Prior To Holiday For Holiday Pay</label>
              <input
                type="text"
                readOnly={!isEditMode}
                className={`w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!isEditMode ? 'bg-gray-50' : ''}`}
              />
              <span className="text-gray-500 text-sm">[hh.hh]</span>
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" className={checkboxClass} disabled={!isEditMode} />
            <span className="text-gray-700 text-sm">First 8 Hours Base on Shift during Restday and Holidays</span>
          </label>
        </div>
      </div>

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
            <div className="flex-1 overflow-auto">
              <table className="w-full">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Earning Code ▲</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {earningCodes
                    .filter(item => 
                      item.code.toLowerCase().includes(earningCodeSearchTerm.toLowerCase()) ||
                      item.description.toLowerCase().includes(earningCodeSearchTerm.toLowerCase())
                    )
                    .map((item, index) => (
                      <tr 
                        key={item.code}
                        className={`hover:bg-gray-50 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                        onClick={() => {
                          // Handle selection
                          handleEarningCodeSelect(item.code);
                        }}
                      >
                        <td className="px-4 py-2 text-sm border-b">{item.code}</td>
                        <td className="px-4 py-2 text-sm border-b">{item.description}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>

            {/* Pagination and Close Button */}
            <div className="flex items-center justify-between p-4 border-t">
              <button
                onClick={() => setShowEarningCodeModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">Previous</button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">1</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">2</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">3</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">4</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">5</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">6</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">Next</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Birthday Pay Search Modal */}
      {showBirthdayPayModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={() => setShowBirthdayPayModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Search</h2>
              <button
                onClick={() => setShowBirthdayPayModal(false)}
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
                  value={birthdayPaySearchTerm}
                  onChange={(e) => setBirthdayPaySearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder=""
                />
              </div>
            </div>

            {/* Table */}
            <div className="px-6 py-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="w-full">
                <thead className="border-b-2 border-gray-300">
                  <tr>
                    <th className="text-left py-2 text-gray-700 font-semibold">
                      <div className="flex items-center gap-1">
                        Code
                        <span className="text-blue-600">▲</span>
                      </div>
                    </th>
                    <th className="text-left py-2 text-gray-700 font-semibold">Description</th>
                    <th className="text-left py-2 text-gray-700 font-semibold">Rate</th>
                    <th className="text-left py-2 text-gray-700 font-semibold">Default Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { code: 'ADJ_PAY', desc: 'Adjustment', rate: '100.00', defaultAmount: '0.00' },
                    { code: 'ATESTOT1', desc: 'TEST OT 11', rate: '123.00', defaultAmount: '0.00' },
                    { code: 'BASC_RATE', desc: 'Basic Rate', rate: '100.00', defaultAmount: '0.00' },
                    { code: 'HOLIDAY', desc: 'Unworked Holiday Pay', rate: '100.00', defaultAmount: '0.00' },
                    { code: 'HOLMON', desc: 'Holiday Monthly', rate: '0.00', defaultAmount: '0.00' },
                    { code: 'ND_BASIC', desc: 'Night Differential Basic Rate', rate: '10.00', defaultAmount: '0.00' },
                    { code: 'ND_LHF8', desc: 'ND Legal Holiday First 8 Hours', rate: '20.00', defaultAmount: '0.00' },
                    { code: 'ND_LHRDF8', desc: 'ND Legal Holiday falls on Rest Day First 8 Hours', rate: '26.00', defaultAmount: '0.00' },
                    { code: 'ND_LHRDX8', desc: 'ND Legal Holiday falls on Rest Day Excess of 8 Hours', rate: '33.80', defaultAmount: '0.00' },
                    { code: 'ND_LHX8', desc: 'ND Legal Holiday Excess of 8 Hours', rate: '26.00', defaultAmount: '0.00' },
                  ]
                    .filter(item => 
                      birthdayPaySearchTerm === '' ||
                      item.code.toLowerCase().includes(birthdayPaySearchTerm.toLowerCase()) ||
                      item.desc.toLowerCase().includes(birthdayPaySearchTerm.toLowerCase())
                    )
                    .map((item, index) => (
                    <tr 
                      key={item.code}
                      className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                      onClick={() => {
                        setBirthdayPay(item.code);
                        setShowBirthdayPayModal(false);
                      }}
                    >
                      <td className="py-2 text-gray-800">{item.code}</td>
                      <td className="py-2 text-gray-800">{item.desc}</td>
                      <td className="py-2 text-gray-800">{item.rate}</td>
                      <td className="py-2 text-gray-800">{item.defaultAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Showing 1 to 10 of 68 entries</span>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded transition-colors">
                    Previous
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
                  <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded transition-colors">2</button>
                  <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded transition-colors">3</button>
                  <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded transition-colors">4</button>
                  <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded transition-colors">5</button>
                  <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded transition-colors">6</button>
                  <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded transition-colors">7</button>
                  <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded transition-colors">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}