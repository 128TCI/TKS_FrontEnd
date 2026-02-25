import { X, Edit } from 'lucide-react';
import { Workshift } from '../../../components/Types/Workshift.types';

interface WorkshiftDetailsModalProps {
  workshift: Workshift;
  onClose: () => void;
  onEdit: (workshift: Workshift) => void;
}

// Converters
const dbDateTimeToFormTime = (value: string | null | undefined): string => {
  if (!value) return '';
  const match = value.match(/(\d{2}):(\d{2}):\d{2}/);
  if (!match) return '';
  let hours = parseInt(match[1], 10);
  const mins = match[2];
  const period: 'AM' | 'PM' = hours >= 12 ? 'PM' : 'AM';
  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;
  return `${String(hours).padStart(2, '0')}:${mins} ${period}`;
};

const dbDecimalToHhmm = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  const hours = Math.floor(num);
  const minutes = Math.round((num - hours) * 100);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const toDisplayTime = (value: string | null | undefined): string => {
  if (!value) return '';
  if (/AM|PM/i.test(value)) return value;
  if (/\d{4}-\d{2}-\d{2}/.test(value)) return dbDateTimeToFormTime(value);
  return value;
};

const toDisplayDecimal = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'string' && value.includes(':')) return value;
  return dbDecimalToHhmm(value);
};

// Sub-components
function TimeStop({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  const display = toDisplayTime(value);
  const empty = !display;
  return (
    <div className="flex items-start">
      <div className="flex flex-col items-center gap-2 min-w-[72px]">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 shrink-0 ${
          empty
            ? 'bg-gray-50 border-gray-200'
            : 'bg-blue-600 border-blue-700 shadow-md shadow-blue-200'
        }`}>
          <svg className={`w-4 h-4 ${empty ? 'text-gray-300' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center leading-tight whitespace-nowrap">
          {label}
        </span>
        <span className={`text-xs font-bold text-center ${empty ? 'text-gray-300' : 'text-blue-700'}`}>
          {display || '—'}
        </span>
      </div>
      {!isLast && (
        <div className={`h-0.5 w-8 mx-1 mt-5 shrink-0 ${empty ? 'bg-gray-200' : 'bg-blue-200'}`} />
      )}
    </div>
  );
}

function Badge({ label, active }: { label: string; active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border ${
      active
        ? 'bg-blue-50 border-blue-200 text-blue-700'
        : 'bg-gray-50 border-gray-200 text-gray-400'
    }`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-blue-500' : 'bg-gray-300'}`} />
      {label}
    </span>
  );
}

function HourRow({ label, value }: { label: string; value: string }) {
  const empty = !value;
  return (
    <div className="flex items-center justify-between gap-8 py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className={`text-sm font-bold tabular-nums ${empty ? 'text-gray-300' : 'text-gray-800'}`}>
        {value || '—'}
      </span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Title / Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm md:text-base font-semibold text-gray-600 uppercase tracking-wide">
          {title}
        </h3>
      </div>

      {/* Content */}
      <div className="px-5 py-4">
        {children}
      </div>
    </div>
  );
}

// Main modal
export function WorkshiftDetailsModal({ workshift, onClose, onEdit }: WorkshiftDetailsModalProps) {
  const ws = workshift;

  const timeStops = [
    { label: 'Time In',   value: ws.timeIn      as string },
    { label: 'Brk1 Out',  value: ws.break1Out   as string },
    { label: 'Brk1 In',   value: ws.break1In    as string },
    { label: 'Brk2 Out',  value: ws.break2Out   as string },
    { label: 'Brk2 In',   value: ws.break2In    as string },
    { label: 'Brk3 Out',  value: ws.break3Out   as string },
    { label: 'Brk3 In',   value: ws.break3In    as string },
    { label: 'Time Out',  value: ws.timeOut     as string },
    { label: 'Mid-Shift', value: ws.halfOfShift as string },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-[100]" onClick={onClose} />

      {/* Dialog */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 pointer-events-none">
        <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-4xl pointer-events-auto flex flex-col max-h-[90vh]">

          {/* ── Header — just the title + dark X ── */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-xl shrink-0 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-lg">Workshift Details</p>
              <p className="text-blue-200 text-xs mt-0.5">Read-only view</p>
            </div>
            {/* Dark X button — always visible */}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/20 hover:bg-black/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="overflow-y-auto flex-1 p-6 space-y-8">

            {/* Code / Description + Edit — sits above the timeline */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Shift Code</p>
                <h2 className="text-xl font-bold text-gray-800 leading-tight">{ws.code}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{ws.description}</p>
              </div>
              <button
                onClick={() => { onClose(); onEdit(ws); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold shadow-sm shrink-0"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </button>
            </div>

            {/* Shift Timeline */}
            <Card title="Shift Timeline">
              <div className="flex items-start flex-wrap gap-y-6 overflow-x-auto pb-1">
                {timeStops.map((stop, i) => (
                  <TimeStop
                    key={stop.label}
                    label={stop.label}
                    value={stop.value}
                    isLast={i === timeStops.length - 1}
                  />
                ))}
              </div>
            </Card>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* ── Left — Hour Configuration only ── */}
              <div>
                <Card title="Hour Configuration">
                  <HourRow label="Standard Hours"             value={toDisplayDecimal(ws.standardHours)}               />
                  <HourRow label="Hours for Absent"           value={toDisplayDecimal(ws.hoursForAbsent)}              />
                  <HourRow label="Hours for No Login"         value={toDisplayDecimal(ws.hoursForNoLogin)}             />
                  <HourRow label="Hours for No Logout"        value={toDisplayDecimal(ws.hoursForNoLogout)}            />
                  <HourRow label="Hours — No Break2 Out"      value={toDisplayDecimal(ws.hoursForNoBreak2Out)}         />
                  <HourRow label="Hours — No Break2 In"       value={toDisplayDecimal(ws.hoursForNoBreak2In)}          />
                  <HourRow label="Paid Unworked Holiday"      value={toDisplayDecimal(ws.paidUnworkedHoliday)}         />
                  <HourRow label="Min. to Complete Shift"     value={toDisplayDecimal(ws.minHoursToCompleteShift)}     />
                  <HourRow label="Hours for OT Code"          value={toDisplayDecimal(ws.hoursForOTCode)}              />
                  <HourRow label="Required Hours"             value={toDisplayDecimal(ws.requiredHours)}               />
                  <HourRow label="Required Hrs w/ Paid Leave" value={toDisplayDecimal(ws.requiredHoursPayIfPaidLeave)} />
                  <HourRow label="Break Round Up Nearest"     value={toDisplayDecimal(ws.brkRoundUpNearest)}           />
                  <HourRow label="Login Time → Absent"        value={toDisplayTime(ws.loginTimeConsiderAbsent as string)} />
                  <HourRow label="Allow. Flexible Time In"    value={toDisplayTime(ws.allowFlexibleTimeIn as string)}     />
                </Card>
              </div>

              {/* ── Right — Attendance Rules + Shift Flags + Break Rules + Bracketing ── */}
              <div className="flex flex-col gap-8">

                {/* Shift Flags */}
                <Card title="Shift Flags">
                  <div className="flex flex-wrap gap-2.5">
                    <Badge label="Midnight Shift"             active={!!ws.midnightShift}           />
                    <Badge label="12:00 AM Onwards"           active={!!ws.shift12AMOnwards}        />
                    <Badge label="Flexible Workshift"         active={!!ws.flexibleWorkshift}       />
                    <Badge label="Flexible Base on Workshift" active={!!ws.flexibleBaseOnWorkshift} />
                    <Badge label="Flexible Break"             active={!!ws.flexibleBreak}           />
                  </div>

                  {ws.flexibleBreak && (
                    <div className="mt-5 pt-5 border-t border-gray-100 space-y-4">
                      <HourRow label="Max Allowable Break2" value={toDisplayDecimal(ws.maxAllowableBreak2)} />
                      <div className="flex flex-wrap gap-2.5">
                        <Badge label="In Excess of Allowable Break2" active={!!ws.inExcessAllowableBreak2ForFlexiBreak} />
                      </div>
                      {ws.inExcessAllowableBreak2ForFlexiBreak && (
                        <div className="flex flex-wrap gap-2.5 pl-4 border-l-2 border-blue-200">
                          <Badge label="Compute as Tardiness" active={!!ws.computeAsTardiness} />
                          <Badge label="Compute as Undertime" active={!!ws.computeAsUndertime} />
                        </div>
                      )}
                    </div>
                  )}
                </Card>

                {/* Break Rules */}
                <Card title="Break Rules">
                  <div className="grid grid-cols-2 gap-8 pb-5 border-b border-gray-100">
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Break 1</p>
                      <Badge label="Deduct Overbreak" active={!!ws.deductBreak1Overbreak} />
                      <Badge label="Flexible Break1"  active={!!ws.flexibleBreak1}        />
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Break 3</p>
                      <Badge label="Deduct Overbreak" active={!!ws.deductBreak3Overbreak} />
                      <Badge label="Flexible Break3"  active={!!ws.flexibleBreak3}        />
                    </div>
                  </div>
                  <div className="pt-5 space-y-3">
                    <Badge label="Combine Break1 and Break3" active={!!ws.combineBreak1And3} />
                    {ws.combineBreak1And3 && (
                      <div className="flex flex-wrap gap-2.5 pl-4 border-l-2 border-blue-200 mt-2">
                        <Badge label="Tardiness (Combined)" active={!!ws.computeAsTardinessCombine} />
                        <Badge label="Undertime (Combined)" active={!!ws.computeAsUndertimeCombine} />
                      </div>
                    )}
                  </div>
                </Card>

                {/* Attendance Rules — moved here from left */}
                <Card title="Attendance Rules">
                  <div className="flex flex-wrap gap-3">
                    <Badge label="Complete Shift w/ Undertime" active={!!ws.completeShiftWithUndertime} />
                    <Badge label="2nd Shift for Raw Data"      active={!!ws.secondShiftForRawData}      />
                  </div>
                </Card>

                {/* Bracketing */}
                <Card title="Tardiness & Undertime Bracketing">
                  <HourRow label="Tardiness Bracket" value={ws.tardiness as string} />
                  <HourRow label="Undertime Bracket"  value={ws.undertime  as string} />
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}