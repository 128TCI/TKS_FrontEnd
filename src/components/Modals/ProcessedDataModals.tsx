import { X, Search, Calendar, Clock, Check, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CalendarPopup } from '../CalendarPopup';
import { TimePicker } from '../Modals/TimePickerModal';

// ─── No of Hours Modal Component ───────────────────────────────────────────────
interface NoOfHoursModalProps {
  show: boolean;
  onClose: () => void;
  isEditMode: boolean;
  empCode: string;
  setEmpCode: (value: string) => void;
  workshiftCode: string;
  setWorkshiftCode: (value: string) => void;
  dateIn: string;
  setDateIn: (value: string) => void;
  dateOut: string;
  setDateOut: (value: string) => void;
  noOfHours: string;
  setNoOfHours: (value: string) => void;
  onSubmit: () => void;
  onWorkshiftSearch: () => void;
}
export function NoOfHoursModal({
  show,
  onClose,
  isEditMode,
  empCode,
  setEmpCode,
  workshiftCode,
  setWorkshiftCode,
  dateIn,
  setDateIn,
  dateOut,
  setDateOut,
  noOfHours,
  setNoOfHours,
  onSubmit,
  onWorkshiftSearch
}: NoOfHoursModalProps) {
  const [showDateInCalendar,  setShowDateInCalendar]  = useState(false);
  const [showDateOutCalendar, setShowDateOutCalendar] = useState(false);
  const [showTimeInPicker,    setShowTimeInPicker]    = useState(false);
  const [showTimeOutPicker,   setShowTimeOutPicker]   = useState(false);

  const splitDateTime = (value: string) => {
    const parts = value.trim().split(' ');
    return { datePart: parts[0] ?? '', timePart: parts.length > 1 ? parts.slice(1).join(' ') : '' };
  };

  const closeAllPickers = () => {
    setShowDateInCalendar(false);
    setShowDateOutCalendar(false);
    setShowTimeInPicker(false);
    setShowTimeOutPicker(false);
  };

  useEffect(() => {
    if (!show) closeAllPickers();
  }, [show]);

  const handleDateInSelect = (pickedDate: string) => {
    const { timePart } = splitDateTime(dateIn);
    setDateIn(timePart ? `${pickedDate} ${timePart}` : pickedDate);
    setShowDateInCalendar(false);
  };

  const handleDateOutSelect = (pickedDate: string) => {
    const { timePart } = splitDateTime(dateOut);
    setDateOut(timePart ? `${pickedDate} ${timePart}` : pickedDate);
    setShowDateOutCalendar(false);
  };

  const handleTimeInSelect = (pickedTime: string) => {
    const { datePart } = splitDateTime(dateIn);
    setDateIn(datePart ? `${datePart} ${pickedTime}` : pickedTime);
    setShowTimeInPicker(false);
  };

  const handleTimeOutSelect = (pickedTime: string) => {
    const { datePart } = splitDateTime(dateOut);
    setDateOut(datePart ? `${datePart} ${pickedTime}` : pickedTime);
    setShowTimeOutPicker(false);
  };

  if (!show) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-10" onClick={onClose} />

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">

          {/* Header */}
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <h2 className="text-gray-800">{isEditMode ? 'Edit Record' : 'Create New'}</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            <h3 className="text-blue-600 mb-3">Adjustments</h3>
            <div className="space-y-3">

              {/* EmpCode */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">EmpCode :</label>
                <input type="text" value={empCode} onChange={(e) => setEmpCode(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>

              {/* Workshift */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Workshift Code :</label>
                <input type="text" value={workshiftCode} onChange={(e) => setWorkshiftCode(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <button onClick={onWorkshiftSearch} className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Search className="w-4 h-4" />
                </button>
                <button onClick={() => setWorkshiftCode('')} className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Date In */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Date In :</label>

                <input
                  type="text"
                  value={dateIn}
                  onChange={(e) => setDateIn(e.target.value)}
                  placeholder="MM/DD/YYYY HH:MM AM"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                {/* Calendar */}
                <div className="relative">
                  <button
                    onClick={() => {
                      closeAllPickers();
                      setShowDateInCalendar(v => !v);
                    }}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>

                  {showDateInCalendar && (
                    <div className="absolute top-full left-0 mt-1 z-50">
                      <CalendarPopup
                        onDateSelect={handleDateInSelect}
                        onClose={() => setShowDateInCalendar(false)}
                      />
                    </div>
                  )}
                </div>

                {/* Time */}
                <button
                  onClick={() => {
                    closeAllPickers();
                    setShowTimeInPicker(v => !v);
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Clock className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDateIn('')}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Date Out */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Date Out :</label>
                <input
                  type="text"
                  value={dateOut}
                  onChange={(e) => setDateOut(e.target.value)}
                  placeholder="MM/DD/YYYY HH:MM AM"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {/* Calendar */}
                <div className="relative">
                  <button
                    onClick={() => {
                      closeAllPickers();
                      setShowDateOutCalendar(v => !v);
                    }}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                  {showDateOutCalendar && (
                    <div className="absolute top-full left-0 mt-1 z-50">
                      <CalendarPopup
                        onDateSelect={handleDateOutSelect}
                        onClose={() => setShowDateOutCalendar(false)}
                      />
                    </div>
                  )}
                </div>
                {/* Time */}
                <button
                  onClick={() => {
                    closeAllPickers();
                    setShowTimeOutPicker(v => !v);
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Clock className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDateOut('')}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* No. Of Hours */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">No. Of Hours :</label>
                <input type="text" value={noOfHours} onChange={(e) => setNoOfHours(e.target.value)}
                  className="w-32 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="[hh.mm]" />
                <span className="text-gray-500 text-sm">[hh.mm]</span>
              </div>

            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={onSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                {isEditMode ? 'Update' : 'Submit'}
              </button>
              <button onClick={onClose} className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm">
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDateInCalendar && createPortal(
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
          <CalendarPopup onDateSelect={handleDateInSelect} onClose={() => setShowDateInCalendar(false)} />
        </div>,
        document.body
      )}

      {showTimeInPicker && createPortal(
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
          <TimePicker onTimeSelect={handleTimeInSelect} onClose={() => setShowTimeInPicker(false)}
            initialTime={splitDateTime(dateIn).timePart} />
        </div>,
        document.body
      )}

      {showDateOutCalendar && createPortal(
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
          <CalendarPopup onDateSelect={handleDateOutSelect} onClose={() => setShowDateOutCalendar(false)} />
        </div>,
        document.body
      )}

      {showTimeOutPicker && createPortal(
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
          <TimePicker onTimeSelect={handleTimeOutSelect} onClose={() => setShowTimeOutPicker(false)}
            initialTime={splitDateTime(dateOut).timePart} />
        </div>,
        document.body
      )}
    </>
  );
}

// ─── Tardiness Modal Component ───────────────────────────────────────────────
interface TardinessModalProps {
    show:                               boolean;
    onClose:                            () => void;
    isEditMode:                         boolean;
    empCode:                            string;
    setEmpCode:                         (v: string)  => void;
    dateFrom:                           string;
    setDateFrom:                        (v: string)  => void;
    dateTo:                             string;
    setDateTo:                          (v: string)  => void;
    timeIn:                             string;
    setTimeIn:                          (v: string)  => void;
    timeOut:                            string;
    setTimeOut:                         (v: string)  => void;
    workShiftCode:                      string;
    setWorkShiftCode:                   (v: string)  => void;
    onWorkshiftSearch:                  () => void;
    tardiness:                          string;
    setTardiness:                       (v: string)  => void;
    tardinessHHMM:                      string;
    setTardinessHHMM:                   (v: string)  => void;
    tardinessWithinGracePeriod:         string;
    setTardinessWithinGracePeriod:      (v: string)  => void;
    tardinessWithinGracePeriodHHMM:     string;
    setTardinessWithinGracePeriodHHMM:  (v: string)  => void;
    actualTardiness:                    string;
    setActualTardiness:                 (v: string)  => void;
    actualTardinessHHMM:                string;
    setActualTardinessHHMM:             (v: string)  => void;
    remarks:                            string;
    setRemarks:                         (v: string)  => void;
    groupCode:                          string;
    setGroupCode:                       (v: string)  => void;
    offSetOTFlag:                       boolean;
    setOffSetOTFlag:                    (v: boolean) => void;
    exemptionRpt:                       string;
    setExemptionRpt:                    (v: string)  => void;
    glCode:                             string;
    setGLCode:                          (v: string)  => void;
    onSubmit:                           () => void;
}
export function TardinessModal({
    show, onClose, isEditMode,
    empCode,           setEmpCode,
    dateFrom,          setDateFrom,
    dateTo,            setDateTo,
    timeIn,            setTimeIn,
    timeOut,           setTimeOut,
    workShiftCode,     setWorkShiftCode,   onWorkshiftSearch,
    tardiness,         setTardiness,
    tardinessHHMM,     setTardinessHHMM,
    tardinessWithinGracePeriod,         setTardinessWithinGracePeriod,
    tardinessWithinGracePeriodHHMM,     setTardinessWithinGracePeriodHHMM,
    actualTardiness,   setActualTardiness,
    actualTardinessHHMM, setActualTardinessHHMM,
    remarks,           setRemarks,
    groupCode,         setGroupCode,
    offSetOTFlag,      setOffSetOTFlag,
    exemptionRpt,      setExemptionRpt,
    glCode,            setGLCode,
    onSubmit,
}: TardinessModalProps) {

    const [showDateFromCalendar, setShowDateFromCalendar] = useState(false);
    const [showDateToCalendar,   setShowDateToCalendar]   = useState(false);
    const [showTimeInPicker,     setShowTimeInPicker]     = useState(false);
    const [showTimeOutPicker,    setShowTimeOutPicker]    = useState(false);

    const splitDateTime = (value: string) => {
        const parts = value.trim().split(' ');
        return { timePart: parts.length > 1 ? parts.slice(1).join(' ') : '' };
    };

    const closeAllPickers = () => {
        setShowDateFromCalendar(false);
        setShowDateToCalendar(false);
        setShowTimeInPicker(false);
        setShowTimeOutPicker(false);
    };

    useEffect(() => { if (!show) closeAllPickers(); }, [show]);

    const handleDateFromSelect = (picked: string) => {
        const { timePart } = splitDateTime(dateFrom);
        setDateFrom(timePart ? `${picked} ${timePart}` : picked);
        setShowDateFromCalendar(false);
    };
    const handleDateToSelect = (picked: string) => {
        const { timePart } = splitDateTime(dateTo);
        setDateTo(timePart ? `${picked} ${timePart}` : picked);
        setShowDateToCalendar(false);
    };
    const handleTimeInSelect  = (picked: string) => { setTimeIn(picked);  setShowTimeInPicker(false);  };
    const handleTimeOutSelect = (picked: string) => { setTimeOut(picked); setShowTimeOutPicker(false); };

    if (!show) return null;

    const inp  = "w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm";
    const lbl  = "block text-xs text-gray-500 mb-1";
    const iBtn = (c: string) => `px-2.5 py-1 ${c} text-white rounded-lg transition-colors shrink-0`;
    const card = "border border-gray-200 rounded-lg p-4 space-y-3";

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 z-10" onClick={onClose} />

            {/* Dialog — fixed size */}
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl flex flex-col" style={{ width: '680px', height: '600px' }}>

                    {/* ── Fixed Header ── */}
                    <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between rounded-t-2xl shrink-0">
                        <h2 className="text-gray-800 text-sm font-medium">
                            {isEditMode ? 'Edit Record' : 'Create New'}
                        </h2>
                        <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* ── Scrollable Body ── */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        <h3 className="text-blue-600 text-sm">Processed Tardiness</h3>

                        {/* EmpCode */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700 w-24 shrink-0">EmpCode :</label>
                            <input type="text" value={empCode} onChange={e => setEmpCode(e.target.value)}
                                className="w-48 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" />
                        </div>

                        {/* ── CARD 1: Schedule ── */}
                        <div className={card}>
                            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Schedule</p>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={lbl}>Date From :</label>
                                    <div className="flex gap-1">
                                        <input type="text" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                                            placeholder="MM/DD/YYYY" className={inp} />
                                        <button onClick={() => { closeAllPickers(); setShowDateFromCalendar(v => !v); }}
                                            className={iBtn('bg-blue-600 hover:bg-blue-700')}>
                                            <Calendar className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setDateFrom('')}
                                            className={iBtn('bg-red-600 hover:bg-red-700')}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className={lbl}>Date To :</label>
                                    <div className="flex gap-1">
                                        <input type="text" value={dateTo} onChange={e => setDateTo(e.target.value)}
                                            placeholder="MM/DD/YYYY" className={inp} />
                                        <button onClick={() => { closeAllPickers(); setShowDateToCalendar(v => !v); }}
                                            className={iBtn('bg-blue-600 hover:bg-blue-700')}>
                                            <Calendar className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setDateTo('')}
                                            className={iBtn('bg-red-600 hover:bg-red-700')}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={lbl}>Time In :</label>
                                    <div className="flex gap-1">
                                        <input type="text" value={timeIn} onChange={e => setTimeIn(e.target.value)}
                                            placeholder="HH:MM AM/PM" className={inp} />
                                        <button onClick={() => { closeAllPickers(); setShowTimeInPicker(v => !v); }}
                                            className={iBtn('bg-blue-600 hover:bg-blue-700')}>
                                            <Clock className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setTimeIn('')}
                                            className={iBtn('bg-red-600 hover:bg-red-700')}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className={lbl}>Time Out :</label>
                                    <div className="flex gap-1">
                                        <input type="text" value={timeOut} onChange={e => setTimeOut(e.target.value)}
                                            placeholder="HH:MM AM/PM" className={inp} />
                                        <button onClick={() => { closeAllPickers(); setShowTimeOutPicker(v => !v); }}
                                            className={iBtn('bg-blue-600 hover:bg-blue-700')}>
                                            <Clock className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setTimeOut('')}
                                            className={iBtn('bg-red-600 hover:bg-red-700')}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className={lbl}>Workshift Code :</label>
                                <div className="flex gap-1">
                                    <input type="text" value={workShiftCode} onChange={e => setWorkShiftCode(e.target.value)}
                                        className={inp} />
                                    <button onClick={onWorkshiftSearch} className={iBtn('bg-green-600 hover:bg-green-700')}>
                                        <Search className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setWorkShiftCode('')} className={iBtn('bg-red-600 hover:bg-red-700')}>
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── CARD 2: Tardiness ── */}
                        <div className={card}>
                            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Tardiness</p>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className={lbl}>Tardiness :</label>
                                    <input type="text" value={tardiness} onChange={e => setTardiness(e.target.value)}
                                        placeholder="hh.mm" className={inp} />
                                </div>
                                <div>
                                    <label className={lbl}>Tardiness HHMM :</label>
                                    <input type="text" value={tardinessHHMM} onChange={e => setTardinessHHMM(e.target.value)}
                                        placeholder="hh.mm" className={inp} />
                                </div>
                                <div>
                                    <label className={lbl}>Tardiness Within Grace Period :</label>
                                    <input type="text" value={tardinessWithinGracePeriod} onChange={e => setTardinessWithinGracePeriod(e.target.value)}
                                        placeholder="hh.mm" className={inp} />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">

                                <div>
                                    <label className={lbl}>Grace Period HHMM :</label>
                                    <input type="text" value={tardinessWithinGracePeriodHHMM} onChange={e => setTardinessWithinGracePeriodHHMM(e.target.value)}
                                        placeholder="hh.mm" className={inp} />
                                </div>
                                <div>
                                    <label className={lbl}>Actual Tardiness :</label>
                                    <input type="text" value={actualTardiness} onChange={e => setActualTardiness(e.target.value)}
                                        placeholder="hh.mm" className={inp} />
                                </div>
                                <div>
                                    <label className={lbl}>Actual Tardiness HHMM :</label>
                                    <input type="text" value={actualTardinessHHMM} onChange={e => setActualTardinessHHMM(e.target.value)}
                                        placeholder="hh.mm" className={inp} />
                                </div>
                            </div>
                        </div>

                        {/* ── CARD 3: Misc / Others ── */}
                        <div className={card}>
                            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Misc / Others</p>

                            <div>
                                <label className={lbl}>Remarks :</label>
                                <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)} className={inp} />
                            </div>

                            <div>
                                <label className={lbl}>Exemption Rpt :</label>
                                <select value={exemptionRpt} onChange={e => setExemptionRpt(e.target.value)} className={inp}>
                                    <option value=""></option>
                                    <option value="Approved">Approved</option>
                                    <option value="Disapproved">Disapproved</option>
                                    <option value="Disapproved by HR">Disapproved by HR</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={lbl}>Group Code :</label>
                                    <input type="text" value={groupCode} onChange={e => setGroupCode(e.target.value)} className={inp} />
                                </div>
                                <div>
                                    <label className={lbl}>GL Code :</label>
                                    <input type="text" value={glCode} onChange={e => setGLCode(e.target.value)}
                                        className={`${inp} ${isEditMode ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                                        disabled={isEditMode}
                                        title={isEditMode ? 'GL Code cannot be changed after creation' : ''} />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-500">Offset OT Flag :</label>
                                <input type="checkbox" checked={offSetOTFlag} onChange={e => setOffSetOTFlag(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            </div>
                        </div>
                    </div>

                    {/* ── Fixed Footer ── */}
                    <div className="border-t border-gray-200 px-4 py-3 flex gap-3 shrink-0 rounded-b-2xl bg-white">
                        <button onClick={onSubmit}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm">
                            {isEditMode ? 'Update' : 'Submit'}
                        </button>
                        <button onClick={onClose}
                            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-sm text-sm">
                            Back to List
                        </button>
                    </div>

                </div>
            </div>

            {/* ── Portals ── */}
            {showDateFromCalendar && createPortal(
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
                    <CalendarPopup onDateSelect={handleDateFromSelect} onClose={() => setShowDateFromCalendar(false)} />
                </div>, document.body
            )}
            {showDateToCalendar && createPortal(
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
                    <CalendarPopup onDateSelect={handleDateToSelect} onClose={() => setShowDateToCalendar(false)} />
                </div>, document.body
            )}
            {showTimeInPicker && createPortal(
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
                    <TimePicker onTimeSelect={handleTimeInSelect} onClose={() => setShowTimeInPicker(false)} initialTime={timeIn} />
                </div>, document.body
            )}
            {showTimeOutPicker && createPortal(
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
                    <TimePicker onTimeSelect={handleTimeOutSelect} onClose={() => setShowTimeOutPicker(false)} initialTime={timeOut} />
                </div>, document.body
            )}
        </>
    );
}
// ─── Undertime Modal Component ────────────────────────────────────────────────
interface UndertimeModalProps {
    show:                          boolean;
    onClose:                       () => void;
    isEditMode:                    boolean;
    empCode:                       string;
    setEmpCode:                    (v: string) => void;
    dateFrom:                      string;
    setDateFrom:                   (v: string) => void;
    dateTo:                        string;
    setDateTo:                     (v: string) => void;
    timeIn:                        string;
    setTimeIn:                     (v: string) => void;
    timeOut:                       string;
    setTimeOut:                    (v: string) => void;
    workshiftCode:                 string;
    setWorkshiftCode:              (v: string) => void;
    onWorkshiftSearch:             () => void;
    undertime:                     string;
    setUndertime:                  (v: string) => void;
    undertimeWithinGracePeriod:    string;
    setUndertimeWithinGracePeriod: (v: string) => void;
    actualUndertime:               string;
    setActualUndertime:            (v: string) => void;
    remarks:                       string;
    setRemarks:                    (v: string) => void;
    onSubmit:                      () => void;
}
export function UndertimeModal({
    show,
    onClose,
    isEditMode,
    empCode,            setEmpCode,
    dateFrom,           setDateFrom,
    dateTo,             setDateTo,
    timeIn,             setTimeIn,
    timeOut,            setTimeOut,
    workshiftCode,      setWorkshiftCode,   onWorkshiftSearch,
    undertime,          setUndertime,
    undertimeWithinGracePeriod,    setUndertimeWithinGracePeriod,
    actualUndertime,    setActualUndertime,
    remarks,            setRemarks,
    onSubmit,
}: UndertimeModalProps) {

    const [showDateFromCalendar, setShowDateFromCalendar] = useState(false);
    const [showDateToCalendar,   setShowDateToCalendar]   = useState(false);
    const [showTimeInPicker,     setShowTimeInPicker]     = useState(false);
    const [showTimeOutPicker,    setShowTimeOutPicker]    = useState(false);

    const splitDateTime = (value: string) => {
        const parts = value.trim().split(' ');
        return { timePart: parts.length > 1 ? parts.slice(1).join(' ') : '' };
    };

    const closeAllPickers = () => {
        setShowDateFromCalendar(false);
        setShowDateToCalendar(false);
        setShowTimeInPicker(false);
        setShowTimeOutPicker(false);
    };

    useEffect(() => { if (!show) closeAllPickers(); }, [show]);

    const handleDateFromSelect = (picked: string) => {
        const { timePart } = splitDateTime(dateFrom);
        setDateFrom(timePart ? `${picked} ${timePart}` : picked);
        setShowDateFromCalendar(false);
    };
    const handleDateToSelect = (picked: string) => {
        const { timePart } = splitDateTime(dateTo);
        setDateTo(timePart ? `${picked} ${timePart}` : picked);
        setShowDateToCalendar(false);
    };
    const handleTimeInSelect  = (picked: string) => { setTimeIn(picked);  setShowTimeInPicker(false);  };
    const handleTimeOutSelect = (picked: string) => { setTimeOut(picked); setShowTimeOutPicker(false); };

    if (!show) return null;

    const inp  = "w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm";
    const lbl  = "block text-xs text-gray-500 mb-1";
    const iBtn = (c: string) => `px-2.5 py-1 ${c} text-white rounded-lg transition-colors shrink-0`;
    const card = "border border-gray-200 rounded-lg p-4 space-y-3";

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 z-10" onClick={onClose} />

            {/* Dialog — fixed size */}
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl flex flex-col" style={{ width: '680px', height: '520px' }}>

                    {/* ── Fixed Header ── */}
                    <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between rounded-t-2xl shrink-0">
                        <h2 className="text-gray-800 text-sm font-medium">
                            {isEditMode ? 'Edit Record' : 'Create New'}
                        </h2>
                        <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* ── Scrollable Body ── */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        <h3 className="text-blue-600 text-sm">Undertime</h3>

                        {/* EmpCode */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700 w-24 shrink-0">EmpCode :</label>
                            <input type="text" value={empCode} onChange={e => setEmpCode(e.target.value)}
                                className="w-48 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" />
                        </div>

                        {/* ── CARD 1: Schedule ── */}
                        <div className={card}>
                            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Schedule</p>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={lbl}>Date From :</label>
                                    <div className="flex gap-1">
                                        <input type="text" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                                            placeholder="MM/DD/YYYY" className={inp} />
                                        <button onClick={() => { closeAllPickers(); setShowDateFromCalendar(v => !v); }}
                                            className={iBtn('bg-blue-600 hover:bg-blue-700')}>
                                            <Calendar className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setDateFrom('')}
                                            className={iBtn('bg-red-600 hover:bg-red-700')}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className={lbl}>Date To :</label>
                                    <div className="flex gap-1">
                                        <input type="text" value={dateTo} onChange={e => setDateTo(e.target.value)}
                                            placeholder="MM/DD/YYYY" className={inp} />
                                        <button onClick={() => { closeAllPickers(); setShowDateToCalendar(v => !v); }}
                                            className={iBtn('bg-blue-600 hover:bg-blue-700')}>
                                            <Calendar className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setDateTo('')}
                                            className={iBtn('bg-red-600 hover:bg-red-700')}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={lbl}>Time In :</label>
                                    <div className="flex gap-1">
                                        <input type="text" value={timeIn} onChange={e => setTimeIn(e.target.value)}
                                            placeholder="HH:MM AM/PM" className={inp} />
                                        <button onClick={() => { closeAllPickers(); setShowTimeInPicker(v => !v); }}
                                            className={iBtn('bg-blue-600 hover:bg-blue-700')}>
                                            <Clock className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setTimeIn('')}
                                            className={iBtn('bg-red-600 hover:bg-red-700')}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className={lbl}>Time Out :</label>
                                    <div className="flex gap-1">
                                        <input type="text" value={timeOut} onChange={e => setTimeOut(e.target.value)}
                                            placeholder="HH:MM AM/PM" className={inp} />
                                        <button onClick={() => { closeAllPickers(); setShowTimeOutPicker(v => !v); }}
                                            className={iBtn('bg-blue-600 hover:bg-blue-700')}>
                                            <Clock className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setTimeOut('')}
                                            className={iBtn('bg-red-600 hover:bg-red-700')}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className={lbl}>Workshift Code :</label>
                                <div className="flex gap-1">
                                    <input type="text" value={workshiftCode} onChange={e => setWorkshiftCode(e.target.value)}
                                        className={inp} />
                                    <button onClick={onWorkshiftSearch} className={iBtn('bg-green-600 hover:bg-green-700')}>
                                        <Search className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setWorkshiftCode('')} className={iBtn('bg-red-600 hover:bg-red-700')}>
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── CARD 2: Undertime / Remarks ── */}
                        <div className={card}>
                            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Undertime</p>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className={lbl}>Undertime :</label>
                                    <input type="text" value={undertime} onChange={e => setUndertime(e.target.value)}
                                        placeholder="hh.mm" className={inp} />
                                </div>
                                <div>
                                    <label className={lbl}>Undertime Within Grace Period :</label>
                                    <input type="text" value={undertimeWithinGracePeriod} onChange={e => setUndertimeWithinGracePeriod(e.target.value)}
                                        placeholder="hh.mm" className={inp} />
                                </div>
                                <div>
                                    <label className={lbl}>Actual Undertime :</label>
                                    <input type="text" value={actualUndertime} onChange={e => setActualUndertime(e.target.value)}
                                        placeholder="hh.mm" className={inp} />
                                </div>
                            </div>

                            <div>
                                <label className={lbl}>Remarks :</label>
                                <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)} className={inp} />
                            </div>
                        </div>

                    </div>

                    {/* ── Fixed Footer ── */}
                    <div className="border-t border-gray-200 px-4 py-3 flex gap-3 shrink-0 rounded-b-2xl bg-white">
                        <button onClick={onSubmit}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm">
                            {isEditMode ? 'Update' : 'Submit'}
                        </button>
                        <button onClick={onClose}
                            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-sm text-sm">
                            Back to List
                        </button>
                    </div>

                </div>
            </div>

            {/* ── Portals ── */}
            {showDateFromCalendar && createPortal(
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
                    <CalendarPopup onDateSelect={handleDateFromSelect} onClose={() => setShowDateFromCalendar(false)} />
                </div>, document.body
            )}
            {showDateToCalendar && createPortal(
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
                    <CalendarPopup onDateSelect={handleDateToSelect} onClose={() => setShowDateToCalendar(false)} />
                </div>, document.body
            )}
            {showTimeInPicker && createPortal(
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
                    <TimePicker onTimeSelect={handleTimeInSelect} onClose={() => setShowTimeInPicker(false)} initialTime={timeIn} />
                </div>, document.body
            )}
            {showTimeOutPicker && createPortal(
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
                    <TimePicker onTimeSelect={handleTimeOutSelect} onClose={() => setShowTimeOutPicker(false)} initialTime={timeOut} />
                </div>, document.body
            )}
        </>
    );
}
// ─── Leave and Absences Modal Component ──────────────────────────────────────
interface LeaveAbsencesModalProps {
    show:                           boolean;
    onClose:                        () => void;
    isEditMode:                     boolean;
    empCode:                        string;
    setEmpCode:                     (v: string)  => void;
    date:                           string;
    setDate:                        (v: string)  => void;
    hoursLeaveAbsent:               string;
    setHoursLeaveAbsent:            (v: string)  => void;
    leaveCode:                      string;
    setLeaveCode:                   (v: string)  => void;
    leaveDescription:               string;
    setLeaveDescription:            (v: string)  => void;
    reason:                         string;
    setReason:                      (v: string)  => void;
    remarks:                        string;
    setRemarks:                     (v: string)  => void;
    withPay:                        boolean;
    setWithPay:                     (v: boolean) => void;
    exemptForAllowanceDeduction:    boolean;
    setExemptForAllowanceDeduction: (v: boolean) => void;
    onSubmit:                       () => void;
    onLeaveCodeSearch:              () => void;
}
export function LeaveAbsencesModal({
    show,
    onClose,
    isEditMode,
    empCode,                        setEmpCode,
    date,                           setDate,
    hoursLeaveAbsent,               setHoursLeaveAbsent,
    leaveCode,                      setLeaveCode,
    leaveDescription,               setLeaveDescription,
    reason,                         setReason,
    remarks,                        setRemarks,
    withPay,                        setWithPay,
    exemptForAllowanceDeduction,    setExemptForAllowanceDeduction,
    onSubmit,
    onLeaveCodeSearch,
}: LeaveAbsencesModalProps) {

    const [showDateCalendar, setShowDateCalendar] = useState(false);

    useEffect(() => { if (!show) setShowDateCalendar(false); }, [show]);

    const handleDateSelect = (picked: string) => {
        setDate(picked);
        setShowDateCalendar(false);
    };

    if (!show) return null;

    const inp  = "w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm";
    const lbl  = "block text-xs text-gray-500 mb-1";
    const iBtn = (c: string) => `px-2.5 py-1 ${c} text-white rounded-lg transition-colors shrink-0`;
    const card = "border border-gray-200 rounded-lg p-4 space-y-3";

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 z-10" onClick={onClose} />

            {/* Dialog — fixed size */}
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl flex flex-col" style={{ width: '680px', height: '520px' }}>

                    {/* ── Fixed Header ── */}
                    <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between rounded-t-2xl shrink-0">
                        <h2 className="text-gray-800 text-sm font-medium">
                            {isEditMode ? 'Edit Record' : 'Create New'}
                        </h2>
                        <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* ── Scrollable Body ── */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        <h3 className="text-blue-600 text-sm">Processed Leaves And Absences</h3>

                        {/* EmpCode */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700 w-24 shrink-0">EmpCode :</label>
                            <input type="text" value={empCode} onChange={e => setEmpCode(e.target.value)}
                                className="w-48 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" />
                        </div>

                        {/* ── CARD 1: Leave Info ── */}
                        <div className={card}>
                            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Leave Info</p>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={lbl}>Date :</label>
                                    <div className="flex gap-1">
                                        <input type="text" value={date} onChange={e => setDate(e.target.value)}
                                            placeholder="MM/DD/YYYY" className={inp} />
                                        <button onClick={() => setShowDateCalendar(v => !v)}
                                            className={iBtn('bg-blue-600 hover:bg-blue-700')}>
                                            <Calendar className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setDate('')}
                                            className={iBtn('bg-red-600 hover:bg-red-700')}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className={lbl}>Hours Leave Absent :</label>
                                    <input type="text" value={hoursLeaveAbsent} onChange={e => setHoursLeaveAbsent(e.target.value)}
                                        placeholder="hh.mm" className={inp} />
                                </div>
                            </div>

                            <div>
                                <label className={lbl}>Leave Code :</label>
                                <div className="flex gap-1">
                                    <input type="text" value={leaveCode} onChange={e => setLeaveCode(e.target.value)}
                                        className={inp} />
                                    <button onClick={onLeaveCodeSearch} className={iBtn('bg-green-600 hover:bg-green-700')}>
                                        <Search className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setLeaveCode('')} className={iBtn('bg-red-600 hover:bg-red-700')}>
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className={lbl}>Leave Description :</label>
                                <input type="text" value={leaveDescription} onChange={e => setLeaveDescription(e.target.value)}
                                    className={inp} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-500">With Pay :</label>
                                    <input type="checkbox" checked={withPay} onChange={e => setWithPay(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-500">Exempt for Allowance Deduction :</label>
                                    <input type="checkbox" checked={exemptForAllowanceDeduction} onChange={e => setExemptForAllowanceDeduction(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                </div>
                            </div>
                        </div>

                        {/* ── CARD 2: Misc / Others ── */}
                        <div className={card}>
                            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Misc / Others</p>

                            <div>
                                <label className={lbl}>Reason :</label>
                                <input type="text" value={reason} onChange={e => setReason(e.target.value)} className={inp} />
                            </div>

                            <div>
                                <label className={lbl}>Remarks :</label>
                                <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)} className={inp} />
                            </div>
                        </div>

                    </div>

                    {/* ── Fixed Footer ── */}
                    <div className="border-t border-gray-200 px-4 py-3 flex gap-3 shrink-0 rounded-b-2xl bg-white">
                        <button onClick={onSubmit}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm">
                            {isEditMode ? 'Update' : 'Submit'}
                        </button>
                        <button onClick={onClose}
                            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-sm text-sm">
                            Back to List
                        </button>
                    </div>

                </div>
            </div>

            {/* ── Portal ── */}
            {showDateCalendar && createPortal(
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
                    <CalendarPopup onDateSelect={handleDateSelect} onClose={() => setShowDateCalendar(false)} />
                </div>, document.body
            )}
        </>
    );
}

// ─── Overtime Modal Component ─────────────────────────────────────────────────
interface OvertimeModalProps {
    show:              boolean;
    onClose:           () => void;
    isEditMode:        boolean;
    empCode:           string;
    setEmpCode:        (v: string) => void;
    dateFrom:          string;
    setDateFrom:       (v: string) => void;
    dateTo:            string;
    setDateTo:         (v: string) => void;
    timeIn:            string;
    setTimeIn:         (v: string) => void;
    timeOut:           string;
    setTimeOut:        (v: string) => void;
    workshiftCode:     string;
    setWorkshiftCode:  (v: string) => void;
    overtime:          string;
    setOvertime:       (v: string) => void;
    otCode:            string;
    setOtCode:         (v: string) => void;
    reason:            string;
    setReason:         (v: string) => void;
    remarks:           string;
    setRemarks:        (v: string) => void;
    onSubmit:          () => void;
    onWorkshiftSearch: () => void;
    onOTCodeSearch:    () => void;
}
export function OvertimeModal({
    show, onClose, isEditMode,
    empCode,        setEmpCode,
    dateFrom,       setDateFrom,
    dateTo,         setDateTo,
    timeIn,         setTimeIn,
    timeOut,        setTimeOut,
    workshiftCode,  setWorkshiftCode,  onWorkshiftSearch,
    overtime,       setOvertime,
    otCode,         setOtCode,         onOTCodeSearch,
    reason,         setReason,
    remarks,        setRemarks,
    onSubmit,
}: OvertimeModalProps) {

    const [showDateFromCalendar, setShowDateFromCalendar] = useState(false);
    const [showDateToCalendar,   setShowDateToCalendar]   = useState(false);
    const [showTimeInPicker,     setShowTimeInPicker]     = useState(false);
    const [showTimeOutPicker,    setShowTimeOutPicker]    = useState(false);

    const splitDateTime = (value: string) => {
        const parts = value.trim().split(' ');
        return { timePart: parts.length > 1 ? parts.slice(1).join(' ') : '' };
    };

    const closeAllPickers = () => {
        setShowDateFromCalendar(false);
        setShowDateToCalendar(false);
        setShowTimeInPicker(false);
        setShowTimeOutPicker(false);
    };

    useEffect(() => { if (!show) closeAllPickers(); }, [show]);

    const handleDateFromSelect = (picked: string) => {
        const { timePart } = splitDateTime(dateFrom);
        setDateFrom(timePart ? `${picked} ${timePart}` : picked);
        setShowDateFromCalendar(false);
    };
    const handleDateToSelect = (picked: string) => {
        const { timePart } = splitDateTime(dateTo);
        setDateTo(timePart ? `${picked} ${timePart}` : picked);
        setShowDateToCalendar(false);
    };
    const handleTimeInSelect  = (picked: string) => { setTimeIn(picked);  setShowTimeInPicker(false);  };
    const handleTimeOutSelect = (picked: string) => { setTimeOut(picked); setShowTimeOutPicker(false); };

    if (!show) return null;

    const inp  = "w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm";
    const lbl  = "block text-xs text-gray-500 mb-1";
    const iBtn = (c: string) => `px-2.5 py-1 ${c} text-white rounded-lg transition-colors shrink-0`;
    const card = "border border-gray-200 rounded-lg p-4 space-y-3";

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 z-10" onClick={onClose} />

            {/* Dialog — fixed size */}
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl flex flex-col" style={{ width: '680px', height: '540px' }}>

                    {/* ── Fixed Header ── */}
                    <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between rounded-t-2xl shrink-0">
                        <h2 className="text-gray-800 text-sm font-medium">
                            {isEditMode ? 'Edit Record' : 'Create New'}
                        </h2>
                        <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* ── Scrollable Body ── */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        <h3 className="text-blue-600 text-sm">Overtime</h3>

                        {/* EmpCode */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700 w-24 shrink-0">EmpCode :</label>
                            <input type="text" value={empCode} onChange={e => setEmpCode(e.target.value)}
                                className="w-48 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" />
                        </div>

                        {/* ── CARD 1: Schedule ── */}
                        <div className={card}>
                            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Schedule</p>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={lbl}>Date From :</label>
                                    <div className="flex gap-1">
                                        <input type="text" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                                            placeholder="MM/DD/YYYY" className={inp} />
                                        <button onClick={() => { closeAllPickers(); setShowDateFromCalendar(v => !v); }}
                                            className={iBtn('bg-blue-600 hover:bg-blue-700')}>
                                            <Calendar className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setDateFrom('')}
                                            className={iBtn('bg-red-600 hover:bg-red-700')}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className={lbl}>Date To :</label>
                                    <div className="flex gap-1">
                                        <input type="text" value={dateTo} onChange={e => setDateTo(e.target.value)}
                                            placeholder="MM/DD/YYYY" className={inp} />
                                        <button onClick={() => { closeAllPickers(); setShowDateToCalendar(v => !v); }}
                                            className={iBtn('bg-blue-600 hover:bg-blue-700')}>
                                            <Calendar className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setDateTo('')}
                                            className={iBtn('bg-red-600 hover:bg-red-700')}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={lbl}>Time In :</label>
                                    <div className="flex gap-1">
                                        <input type="text" value={timeIn} onChange={e => setTimeIn(e.target.value)}
                                            placeholder="HH:MM AM/PM" className={inp} />
                                        <button onClick={() => { closeAllPickers(); setShowTimeInPicker(v => !v); }}
                                            className={iBtn('bg-blue-600 hover:bg-blue-700')}>
                                            <Clock className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setTimeIn('')}
                                            className={iBtn('bg-red-600 hover:bg-red-700')}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className={lbl}>Time Out :</label>
                                    <div className="flex gap-1">
                                        <input type="text" value={timeOut} onChange={e => setTimeOut(e.target.value)}
                                            placeholder="HH:MM AM/PM" className={inp} />
                                        <button onClick={() => { closeAllPickers(); setShowTimeOutPicker(v => !v); }}
                                            className={iBtn('bg-blue-600 hover:bg-blue-700')}>
                                            <Clock className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setTimeOut('')}
                                            className={iBtn('bg-red-600 hover:bg-red-700')}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className={lbl}>Workshift Code :</label>
                                <div className="flex gap-1">
                                    <input type="text" value={workshiftCode} onChange={e => setWorkshiftCode(e.target.value)}
                                        className={inp} />
                                    <button onClick={onWorkshiftSearch} className={iBtn('bg-green-600 hover:bg-green-700')}>
                                        <Search className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setWorkshiftCode('')} className={iBtn('bg-red-600 hover:bg-red-700')}>
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── CARD 2: Overtime / Others ── */}
                        <div className={card}>
                            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Overtime / Others</p>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={lbl}>Overtime :</label>
                                    <input type="text" value={overtime} onChange={e => setOvertime(e.target.value)}
                                        placeholder="hh.mm" className={inp} />
                                </div>
                                <div>
                                    <label className={lbl}>OT Code :</label>
                                    <div className="flex gap-1">
                                        <input type="text" value={otCode} onChange={e => setOtCode(e.target.value)}
                                            className={inp} />
                                        <button onClick={onOTCodeSearch} className={iBtn('bg-green-600 hover:bg-green-700')}>
                                            <Search className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setOtCode('')} className={iBtn('bg-red-600 hover:bg-red-700')}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className={lbl}>Reason :</label>
                                <input type="text" value={reason} onChange={e => setReason(e.target.value)} className={inp} />
                            </div>

                            <div>
                                <label className={lbl}>Remarks :</label>
                                <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)} className={inp} />
                            </div>
                        </div>

                    </div>

                    {/* ── Fixed Footer ── */}
                    <div className="border-t border-gray-200 px-4 py-3 flex gap-3 shrink-0 rounded-b-2xl bg-white">
                        <button onClick={onSubmit}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm">
                            {isEditMode ? 'Update' : 'Submit'}
                        </button>
                        <button onClick={onClose}
                            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-sm text-sm">
                            Back to List
                        </button>
                    </div>

                </div>
            </div>

            {/* ── Portals ── */}
            {showDateFromCalendar && createPortal(
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
                    <CalendarPopup onDateSelect={handleDateFromSelect} onClose={() => setShowDateFromCalendar(false)} />
                </div>, document.body
            )}
            {showDateToCalendar && createPortal(
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
                    <CalendarPopup onDateSelect={handleDateToSelect} onClose={() => setShowDateToCalendar(false)} />
                </div>, document.body
            )}
            {showTimeInPicker && createPortal(
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
                    <TimePicker onTimeSelect={handleTimeInSelect} onClose={() => setShowTimeInPicker(false)} initialTime={timeIn} />
                </div>, document.body
            )}
            {showTimeOutPicker && createPortal(
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
                    <TimePicker onTimeSelect={handleTimeOutSelect} onClose={() => setShowTimeOutPicker(false)} initialTime={timeOut} />
                </div>, document.body
            )}
        </>
    );
}

// ─── Other Earnings Modal Component ─────────────────────────────────────────────────
interface OtherEarningsModalProps {
  show: boolean;
  onClose: () => void;
  isEditMode: boolean;
  empCode: string;
  setEmpCode: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  allowanceCode: string;
  setAllowanceCode: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  remarks: string;
  setRemarks: (value: string) => void;
  onSubmit: () => void;
  onOpenAllowanceSearch: () => void;
}
export function OtherEarningsModal({
  show,
  onClose,
  isEditMode,
  empCode,
  setEmpCode,
  date,
  setDate,
  allowanceCode,
  setAllowanceCode,
  description,
  setDescription,
  amount,
  setAmount,
  remarks,
  setRemarks,
  onSubmit,
  onOpenAllowanceSearch,
}: OtherEarningsModalProps) {
  if (!show) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-10"
        onClick={onClose}
      ></div>

      {/* Modal Dialog */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">

          {/* Modal Header */}
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <h2 className="text-gray-800">{isEditMode ? 'Edit Record' : 'Create New'}</h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4">
            <h3 className="text-blue-600 mb-3">Overtime</h3>

            {/* Form Fields */}
            <div className="space-y-3">

              {/* Employee Code */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">EmpCode :</label>
                <input
                  type="text"
                  value={empCode}
                  onChange={(e) => setEmpCode(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Date */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Date :</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Allowance Code */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Allowance Code :</label>
                <input
                  type="text"
                  value={allowanceCode}
                  onChange={(e) => setAllowanceCode(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={onOpenAllowanceSearch}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setAllowanceCode(''); setDescription(''); }}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Allowance Description:</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Amount */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Amount :</label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Remarks */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Remarks :</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={onSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
              >
                {isEditMode ? 'Update' : 'Submit'}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Adjustment Modal Component ──────────────────────────────────────────────
interface AdjustmentModalProps {
    show:                      boolean;
    onClose:                   () => void;
    isEditMode:                boolean;
    empCode:                   string;
    setEmpCode:                (v: string)  => void;
    transactionDate:           string;
    setTransactionDate:        (v: string)  => void;
    transactionType:           string;
    setTransactionType:        (v: string)  => void;
    leaveType:                 string;
    setLeaveType:              (v: string)  => void;
    overtimeCode:              string;
    setOvertimeCode:           (v: string)  => void;
    noOfHours:                 string;
    setNoOfHours:              (v: string)  => void;
    adjustType:                string;
    setAdjustType:             (v: string)  => void;
    remarks:                   string;
    setRemarks:                (v: string)  => void;
    isLateFiling:              boolean;
    setIsLateFiling:           (v: boolean) => void;
    isLateFilingActualDate:    string;
    setIsLateFilingActualDate: (v: string)  => void;
    borrowedDeviceName:        string;
    setBorrowedDeviceName:     (v: string)  => void;
    onSubmit:                  () => void;
    onOTCodeSearch:         () => void;
    onBorrowedDeviceSearch: () => void;
    onLeaveTypeSearch:      () => void;
}
export function AdjustmentModal({
    show, onClose, isEditMode,
    empCode,                   setEmpCode,
    transactionDate,           setTransactionDate,
    transactionType,           setTransactionType,
    leaveType,                 setLeaveType,
    overtimeCode,              setOvertimeCode,
    noOfHours,                 setNoOfHours,
    adjustType,                setAdjustType,
    remarks,                   setRemarks,
    isLateFiling,              setIsLateFiling,
    isLateFilingActualDate,    setIsLateFilingActualDate,
    borrowedDeviceName,        setBorrowedDeviceName,
    onSubmit,
    onOTCodeSearch,
    onBorrowedDeviceSearch,
    onLeaveTypeSearch,
}: AdjustmentModalProps) {

    const [showDateCalendar,           setShowDateCalendar]           = useState(false);
    const [showLateFilingDateCalendar, setShowLateFilingDateCalendar] = useState(false);

    const closeAllPickers = () => {
        setShowDateCalendar(false);
        setShowLateFilingDateCalendar(false);
    };

    useEffect(() => { if (!show) closeAllPickers(); }, [show]);

    const handleTransactionDateSelect = (picked: string) => {
        setTransactionDate(picked);
        setShowDateCalendar(false);
    };
    const handleLateFilingDateSelect = (picked: string) => {
        setIsLateFilingActualDate(picked);
        setShowLateFilingDateCalendar(false);
    };

    if (!show) return null;

    const inp  = "w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm";
    const lbl  = "block text-xs text-gray-500 mb-1";
    const iBtn = (c: string) => `px-2.5 py-1 ${c} text-white rounded-lg transition-colors shrink-0`;
    const card = "border border-gray-200 rounded-lg p-4 space-y-3";

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 z-10" onClick={onClose} />

            {/* Dialog */}
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl flex flex-col" style={{ width: '680px', height: '580px' }}>

                    {/* ── Fixed Header ── */}
                    <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between rounded-t-2xl shrink-0">
                        <h2 className="text-gray-800 text-sm font-medium">
                            {isEditMode ? 'Edit Record' : 'Create New'}
                        </h2>
                        <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* ── Scrollable Body ── */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        <h3 className="text-blue-600 text-sm">Adjustments</h3>

                        {/* EmpCode */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700 w-24 shrink-0">EmpCode :</label>
                            <input type="text" value={empCode} onChange={e => setEmpCode(e.target.value)}
                                className="w-48 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" />
                        </div>

                        {/* ── CARD 1: Transaction Info ── */}
                        <div className={card}>
                            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Transaction Info</p>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={lbl}>Transaction Date :</label>
                                    <div className="flex gap-1">
                                        <input type="text" value={transactionDate} onChange={e => setTransactionDate(e.target.value)}
                                            placeholder="MM/DD/YYYY" className={inp} />
                                        <button onClick={() => { closeAllPickers(); setShowDateCalendar(v => !v); }}
                                            className={iBtn('bg-blue-600 hover:bg-blue-700')}>
                                            <Calendar className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setTransactionDate('')}
                                            className={iBtn('bg-red-600 hover:bg-red-700')}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className={lbl}>No Of Hours :</label>
                                    <input type="text" value={noOfHours} onChange={e => setNoOfHours(e.target.value)}
                                        placeholder="hh.mm" className={inp} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={lbl}>Transaction Type :</label>
                                    <select value={transactionType} onChange={e => setTransactionType(e.target.value)} className={inp}>
                                        <option value=""></option>
                                        <option value="Tardiness">Tardiness</option>
                                        <option value="Overtime">Overtime</option>
                                        <option value="Undertime">Undertime</option>
                                        <option value="Leave and Absences">Leave and Absences</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={lbl}>Adjust Type :</label>
                                    <select value={adjustType} onChange={e => setAdjustType(e.target.value)} className={inp}>
                                        <option value=""></option>
                                        <option value="Tardiness">Tardiness</option>
                                        <option value="Overtime">Overtime</option>
                                        <option value="Undertime">Undertime</option>
                                        <option value="Leave and Absences">Leave and Absences</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className={lbl}>Leave Type :</label>
                                <div className="flex gap-1">
                                    <input type="text" value={leaveType} onChange={e => setLeaveType(e.target.value)} className={inp} />
                                    <button onClick={onLeaveTypeSearch} className={iBtn('bg-green-600 hover:bg-green-700')}>
                                        <Search className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setLeaveType('')} className={iBtn('bg-red-600 hover:bg-red-700')}>
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className={lbl}>OT Code :</label>
                                <div className="flex gap-1">
                                    <input type="text" value={overtimeCode} onChange={e => setOvertimeCode(e.target.value)} className={inp} />
                                    <button onClick={onOTCodeSearch} className={iBtn('bg-green-600 hover:bg-green-700')}>
                                        <Search className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setOvertimeCode('')} className={iBtn('bg-red-600 hover:bg-red-700')}>
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── CARD 2: Late Filing / Device ── */}
                        <div className={card}>
                            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Late Filing / Device</p>

                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-500">Is Late Filing :</label>
                                <input type="checkbox" checked={isLateFiling} onChange={e => setIsLateFiling(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            </div>

                            <div>
                                <label className={lbl}>Late Filing Actual Date :</label>
                                <div className="flex gap-1">
                                    <input type="text" value={isLateFilingActualDate} onChange={e => setIsLateFilingActualDate(e.target.value)}
                                        placeholder="MM/DD/YYYY" className={inp} />
                                    <button onClick={() => { closeAllPickers(); setShowLateFilingDateCalendar(v => !v); }}
                                        className={iBtn('bg-blue-600 hover:bg-blue-700')}>
                                        <Calendar className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setIsLateFilingActualDate('')}
                                        className={iBtn('bg-red-600 hover:bg-red-700')}>
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className={lbl}>Borrowed Device Name :</label>
                                <div className="flex gap-1">
                                    <input type="text" value={borrowedDeviceName} onChange={e => setBorrowedDeviceName(e.target.value)} className={inp} />
                                    <button onClick={onBorrowedDeviceSearch} className={iBtn('bg-green-600 hover:bg-green-700')}>
                                        <Search className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setBorrowedDeviceName('')} className={iBtn('bg-red-600 hover:bg-red-700')}>
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── CARD 3: Misc / Others ── */}
                        <div className={card}>
                            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Misc / Others</p>

                            <div>
                                <label className={lbl}>Remarks :</label>
                                <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)} className={inp} />
                            </div>
                        </div>

                    </div>

                    {/* ── Fixed Footer ── */}
                    <div className="border-t border-gray-200 px-4 py-3 flex gap-3 shrink-0 rounded-b-2xl bg-white">
                        <button onClick={onSubmit}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm">
                            {isEditMode ? 'Update' : 'Submit'}
                        </button>
                        <button onClick={onClose}
                            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-sm text-sm">
                            Back to List
                        </button>
                    </div>

                </div>
            </div>

            {/* ── Portals ── */}
            {showDateCalendar && createPortal(
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
                    <CalendarPopup onDateSelect={handleTransactionDateSelect} onClose={() => setShowDateCalendar(false)} />
                </div>, document.body
            )}
            {showLateFilingDateCalendar && createPortal(
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
                    <CalendarPopup onDateSelect={handleLateFilingDateSelect} onClose={() => setShowLateFilingDateCalendar(false)} />
                </div>, document.body
            )}
        </>
    );
}

// ─── Advanced Modal Component ──────────────────────────────────────────────
interface AdvancedModalProps {
    show:               boolean;
    onClose:            () => void;
    isEditMode:         boolean;
    empCode:            string;
    setEmpCode:         (v: string) => void;
    transactionDate:    string;
    setTransactionDate: (v: string) => void;
    transactionType:    string;
    setTransactionType: (v: string) => void;
    noOfHours:          string;
    setNoOfHours:       (v: string) => void;
    overtimeCode:       string;
    setOvertimeCode:    (v: string) => void;
    onSubmit:           () => void;
    onOTCodeSearch:     () => void;
}
export function AdvancedModal({
    show,
    onClose,
    isEditMode,
    empCode,            setEmpCode,
    transactionDate,    setTransactionDate,
    transactionType,    setTransactionType,
    noOfHours,          setNoOfHours,
    overtimeCode,       setOvertimeCode,
    onSubmit,
    onOTCodeSearch,
}: AdvancedModalProps) {

    const [showDateCalendar, setShowDateCalendar] = useState(false);

    useEffect(() => { if (!show) setShowDateCalendar(false); }, [show]);

    const handleDateSelect = (picked: string) => {
        setTransactionDate(picked);
        setShowDateCalendar(false);
    };

    if (!show) return null;

    return (
        <>
            {/* Modal Backdrop */}
            <div className="fixed inset-0 bg-black/30 z-10" onClick={onClose} />

            {/* Modal Dialog */}
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">

                    {/* Modal Header */}
                    <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                        <h2 className="text-gray-800">{isEditMode ? 'Edit Record' : 'Create New'}</h2>
                        <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-4">
                        <h3 className="text-blue-600 mb-3">Overtime</h3>

                        <div className="space-y-3">

                            {/* Employee Code */}
                            <div className="flex items-center gap-2">
                                <label className="w-40 text-gray-700">EmpCode :</label>
                                <input type="text" value={empCode} onChange={e => setEmpCode(e.target.value)}
                                    className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>

                            {/* Transaction Date */}
                            <div className="flex items-center gap-2">
                                <label className="w-40 text-gray-700">Transaction Date :</label>
                                <input type="text" value={transactionDate} onChange={e => setTransactionDate(e.target.value)}
                                    placeholder="MM/DD/YYYY"
                                    className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                <button onClick={() => setShowDateCalendar(v => !v)}
                                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shrink-0">
                                    <Calendar className="w-4 h-4" />
                                </button>
                                <button onClick={() => setTransactionDate('')}
                                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shrink-0">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Transaction Type */}
                            <div className="flex items-center gap-2">
                                <label className="w-40 text-gray-700">Transaction Type :</label>
                                <select value={transactionType} onChange={e => setTransactionType(e.target.value)}
                                    className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500">
                                    <option value=""></option>
                                    <option value="Tardiness">Tardiness</option>
                                    <option value="Overtime">Overtime</option>
                                    <option value="Undertime">Undertime</option>
                                    <option value="Leave and Absences">Leave and Absences</option>
                                </select>
                            </div>

                            {/* No of Hours */}
                            <div className="flex items-center gap-2">
                                <label className="w-40 text-gray-700">No of Hours :</label>
                                <input type="text" value={noOfHours} onChange={e => setNoOfHours(e.target.value)}
                                    placeholder="[hh.mm]"
                                    className="w-32 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                <span className="text-gray-500 text-xs">[hh.mm]</span>
                            </div>

                            {/* Overtime Code */}
                            <div className="flex items-center gap-2">
                                <label className="w-40 text-gray-700">Overtime Code :</label>
                                <input type="text" value={overtimeCode} onChange={e => setOvertimeCode(e.target.value)}
                                    className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                <button onClick={onOTCodeSearch}
                                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                    <Search className="w-4 h-4" />
                                </button>
                                <button onClick={() => setOvertimeCode('')}
                                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                        </div>

                        {/* Modal Actions */}
                        <div className="flex gap-3 mt-4">
                            <button onClick={onSubmit}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm">
                                {isEditMode ? 'Update' : 'Submit'}
                            </button>
                            <button onClick={onClose}
                                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm">
                                Back to List
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Portal ── */}
            {showDateCalendar && createPortal(
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
                    <CalendarPopup onDateSelect={handleDateSelect} onClose={() => setShowDateCalendar(false)} />
                </div>, document.body
            )}
        </>
    );
}