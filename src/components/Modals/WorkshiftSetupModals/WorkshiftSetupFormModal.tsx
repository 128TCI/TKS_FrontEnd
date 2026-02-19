import { useState } from 'react';
import { X, Clock, Search, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Workshift } from '../../Types/Workshift.types';
import { WorkshiftTimePickerModal } from './WorkshiftSetupTimePickerModal';
import { WorkshiftBracketingSearchModal } from './WorkshiftSetupBracketingSearchModal';
import apiClient from '../../../services/apiClient';

// ---------------------------------------------------------------------------
// Helpers — user input formatting
// ---------------------------------------------------------------------------
const formatTimeInput = (value: string): string => {
  const numbers = value.replace(/[^\d]/g, '').slice(0, 4);
  if (numbers.length >= 3) return numbers.slice(0, 2) + ':' + numbers.slice(2);
  return numbers;
};

const formatTimeWithPeriod = (value: string): string => {
  const numbers = value.replace(/[^\d]/g, '').slice(0, 4);
  const upper = value.toUpperCase();
  const period = upper.includes('AM') ? 'AM' : upper.includes('PM') ? 'PM' : '';

  let formatted = '';
  if (numbers.length >= 3) {
    let hours = numbers.slice(0, 2);
    let minutes = numbers.slice(2, 4);
    const hourNum = parseInt(hours, 10);
    if (hourNum > 12) hours = '12';
    if (hourNum === 0) hours = '01';
    const minNum = parseInt(minutes, 10);
    if (minNum > 59) minutes = '59';
    formatted = `${hours}:${minutes}`;
  } else if (numbers.length >= 1) {
    formatted = numbers;
  }

  return formatted && period ? `${formatted} ${period}` : formatted;
};

// ---------------------------------------------------------------------------
// Helpers — DB → form conversion (call when loading data for edit)
// ---------------------------------------------------------------------------

/**
 * "1900-01-01T07:00:00"  →  "07:00 AM"
 * "1900-01-01T13:00:00"  →  "01:00 PM"
 * "1900-01-01T00:00:00"  →  "12:00 AM"
 * Handles both T and space separators from the DB.
 */
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

/**
 * 8.00  →  "08:00"
 * 9.35  →  "09:35"
 * Decimal part is hundredths-as-minutes (not a true hour fraction).
 */
const dbDecimalToHhmm = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  const hours = Math.floor(num);
  const minutes = Math.round((num - hours) * 100);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// ---------------------------------------------------------------------------
// Helpers — form → DB conversion (call before POST/PUT)
// ---------------------------------------------------------------------------

/**
 * "07:00 AM"  →  "1900-01-01T07:00:00"
 * "12:00 AM"  →  "1900-01-01T00:00:00"
 * Uses ISO 8601 T separator — required by ASP.NET DateTime? JSON deserializer.
 */
const formTimeToDbDateTime = (value: string | null | undefined): string | null => {
  if (!value || !value.trim()) return null;
  const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const mins = match[2];
  const period = match[3].toUpperCase();
  if (period === 'AM' && hours === 12) hours = 0;
  else if (period === 'PM' && hours !== 12) hours += 12;
  return `1900-01-01T${String(hours).padStart(2, '0')}:${mins}:00`;
};

/**
 * "08:00"  →  8.00
 * "09:35"  →  9.35
 */
const hhmmToDbDecimal = (value: string | null | undefined): number | null => {
  if (!value || !value.trim()) return null;
  const match = value.match(/(\d+):(\d{2})/);
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return parseFloat(`${hours}.${String(minutes).padStart(2, '0')}`);
};

// ---------------------------------------------------------------------------
// Field lists
// ---------------------------------------------------------------------------

const DB_DATETIME_FIELDS: (keyof Workshift)[] = [
  'timeIn', 'timeOut',
  'break1Out', 'break1In',
  'break2Out', 'break2In',
  'break3Out', 'break3In',
  'halfOfShift',
  'loginTimeConsiderAbsent',
  'allowFlexibleTimeIn',
];

const DB_DECIMAL_FIELDS: (keyof Workshift)[] = [
  'standardHours', 'hoursForAbsent', 'hoursForNoLogin', 'hoursForNoLogout',
  'hoursForNoBreak2Out', 'hoursForNoBreak2In', 'paidUnworkedHoliday',
  'minHoursToCompleteShift', 'hoursForOTCode', 'requiredHours',
  'requiredHoursPayIfPaidLeave', 'brkRoundUpNearest', 'maxAllowableBreak2',
];

/**
 * Call this on raw API data before passing into formData / setFormData.
 */
export const normalizeWorkshiftForForm = (raw: Record<string, unknown>): Workshift => {
  const result = { ...raw } as Record<string, unknown>;

  // Null-safe all fields first so React never sees null as a controlled input value
  for (const key of Object.keys(result)) {
    if (result[key] === null || result[key] === undefined) {
      result[key] = '';
    }
  }

  for (const field of DB_DATETIME_FIELDS) {
    result[field as string] = dbDateTimeToFormTime(raw[field as string] as string);
  }
  for (const field of DB_DECIMAL_FIELDS) {
    result[field as string] = dbDecimalToHhmm(raw[field as string] as number);
  }

  return result as unknown as Workshift;
};

/**
 * Call this just before apiClient.post() / apiClient.put().
 */
const denormalizeWorkshiftForApi = (form: Workshift): Record<string, unknown> => {
  const result = { ...form } as Record<string, unknown>;

  for (const field of DB_DATETIME_FIELDS) {
    const val = form[field as keyof Workshift] as string;
    result[field as string] = val?.trim() ? formTimeToDbDateTime(val) : null;
  }

  for (const field of DB_DECIMAL_FIELDS) {
    const val = form[field as keyof Workshift] as string;
    result[field as string] = val?.trim() ? hhmmToDbDecimal(val) : null;
  }

  // Final pass — any field still holding "" was a DB-only field that got
  // null-safed to "" by normalizeWorkshiftForForm. Send null instead so
  // ASP.NET's DateTime?/decimal? deserializer doesn't reject empty strings.
  for (const key of Object.keys(result)) {
    if (result[key] === '') {
      result[key] = null;
    }
  }

  return result;
};

// ---------------------------------------------------------------------------
// Step metadata
// ---------------------------------------------------------------------------
const STEPS = [
  { id: 1, label: 'Basic Info',      description: 'Code, description, and shift times'   },
  { id: 2, label: 'Hour Config',     description: 'Standard hours and attendance rules'  },
  { id: 3, label: 'Break & Bracket', description: 'Break rules and tardiness bracketing' },
];

// ---------------------------------------------------------------------------
// Sub-component: time field row (used in step 1)
// ---------------------------------------------------------------------------
interface TimeFieldProps {
  label: string;
  value: string;
  field: keyof Workshift;
  formData: Workshift;
  setFormData: (d: Workshift) => void;
  onOpenTimePicker: (field: string) => void;
}

function TimeFieldRow({ label, value, field, formData, setFormData, onOpenTimePicker }: TimeFieldProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="w-32 text-gray-700 text-sm shrink-0">{label}</label>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => setFormData({ ...formData, [field]: formatTimeWithPeriod(e.target.value) })}
        className="w-32 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        placeholder="HH:mm TT"
      />
      <button
        type="button"
        onClick={() => onOpenTimePicker(field as string)}
        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors shrink-0"
      >
        <Clock className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1 — Basic Info
// ---------------------------------------------------------------------------
interface Step1Props {
  formData: Workshift;
  setFormData: (d: Workshift) => void;
  isEditMode: boolean;
  onOpenTimePicker: (field: string) => void;
}

function Step1BasicInfo({ formData, setFormData, isEditMode, onOpenTimePicker }: Step1Props) {
  const timeFields: { label: string; field: keyof Workshift }[] = [
    { label: 'Time In :',       field: 'timeIn'      },
    { label: 'Break1 Out :',    field: 'break1Out'   },
    { label: 'Break1 In :',     field: 'break1In'    },
    { label: 'Break2 Out :',    field: 'break2Out'   },
    { label: 'Break2 In :',     field: 'break2In'    },
    { label: 'Break3 Out :',    field: 'break3Out'   },
    { label: 'Break3 In :',     field: 'break3In'    },
    { label: 'Time Out :',      field: 'timeOut'     },
    { label: 'Half of Shift :', field: 'halfOfShift' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="w-32 text-gray-700 text-sm shrink-0">Code :</label>
        <input
          type="text"
          value={formData.code ?? ''}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:text-gray-500"
          disabled={isEditMode}
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="w-32 text-gray-700 text-sm shrink-0">Description :</label>
        <input
          type="text"
          maxLength={300}
          value={formData.description ?? ''}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      <hr className="border-gray-200" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {timeFields.map(({ label, field }) => (
          <TimeFieldRow
            key={field as string}
            label={label}
            value={(formData[field] as string) ?? ''}
            field={field}
            formData={formData}
            setFormData={setFormData}
            onOpenTimePicker={onOpenTimePicker}
          />
        ))}
      </div>

      <hr className="border-gray-200" />

      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Shift Flags</p>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="midnightShift" checked={!!formData.midnightShift}
            onChange={(e) => setFormData({ ...formData, midnightShift: e.target.checked })}
            className="w-4 h-4 accent-blue-600" />
          <label htmlFor="midnightShift" className="text-sm text-gray-700">Midnight Shift</label>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="shift12AMOnwards" checked={!!formData.shift12AMOnwards}
            onChange={(e) => setFormData({ ...formData, shift12AMOnwards: e.target.checked })}
            className="w-4 h-4 accent-blue-600" />
          <label htmlFor="shift12AMOnwards" className="text-sm text-gray-700">
            Shift that falls on 12:00 AM onwards
          </label>
        </div>

        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="flexibleWorkshift" checked={!!formData.flexibleWorkshift}
              onChange={(e) => setFormData({ ...formData, flexibleWorkshift: e.target.checked })}
              className="w-4 h-4 accent-blue-600" />
            <label htmlFor="flexibleWorkshift" className="text-sm text-gray-700">Flexible Workshift</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="flexibleBaseOnWorkshift" checked={!!formData.flexibleBaseOnWorkshift}
              onChange={(e) => setFormData({ ...formData, flexibleBaseOnWorkshift: e.target.checked })}
              className="w-4 h-4 accent-blue-600" />
            <label htmlFor="flexibleBaseOnWorkshift" className="text-sm text-gray-700">
              Flexible Base on Workshift
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="flexibleBreak" checked={!!formData.flexibleBreak}
            onChange={(e) => setFormData({ ...formData, flexibleBreak: e.target.checked })}
            className="w-4 h-4 accent-blue-600" />
          <label htmlFor="flexibleBreak" className="text-sm text-gray-700">Flexible Break</label>
        </div>

        {formData.flexibleBreak && (
          <div className="ml-6 space-y-3 pt-2 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 whitespace-nowrap">Max Allowable Break2 :</label>
              <input
                type="text"
                value={(formData.maxAllowableBreak2 as string) ?? ''}
                onChange={(e) => setFormData({ ...formData, maxAllowableBreak2: formatTimeInput(e.target.value) })}
                className="w-28 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="hh:mm"
              />
              <span className="text-xs text-gray-400">[hh:mm]</span>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="inExcessAllowableBreak2ForFlexiBreak"
                checked={!!formData.inExcessAllowableBreak2ForFlexiBreak}
                onChange={(e) => setFormData({ ...formData, inExcessAllowableBreak2ForFlexiBreak: e.target.checked })}
                className="w-4 h-4 accent-blue-600" />
              <label htmlFor="inExcessAllowableBreak2ForFlexiBreak" className="text-sm text-gray-700">
                In Excess of Allowable Break2 for Flexi Break
              </label>
            </div>

            {formData.inExcessAllowableBreak2ForFlexiBreak && (
              <div className="ml-6 space-y-2">
                {(
                  [
                    { id: 'computeAsTardiness', label: 'Compute as Tardiness', pair: 'computeAsUndertime' },
                    { id: 'computeAsUndertime', label: 'Compute as Undertime', pair: 'computeAsTardiness' },
                  ] as { id: keyof Workshift; label: string; pair: keyof Workshift }[]
                ).map(({ id, label, pair }) => (
                  <div key={id as string} className="flex items-center gap-2">
                    <input type="radio" id={id as string} name="excessCompute"
                      checked={!!formData[id]}
                      onChange={() => setFormData({ ...formData, [id]: true, [pair]: false })}
                      className="w-4 h-4 accent-blue-600" />
                    <label htmlFor={id as string} className="text-sm text-gray-700">{label}</label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — Hour Configuration
// ---------------------------------------------------------------------------
interface Step2Props {
  formData: Workshift;
  setFormData: (d: Workshift) => void;
  onOpenTimePicker: (field: string) => void;
}

function Step2HourConfig({ formData, setFormData, onOpenTimePicker }: Step2Props) {
  const durationRows: { label: string; field: keyof Workshift }[] = [
    { label: 'No. of Hrs. Standard Time :',              field: 'standardHours'               },
    { label: 'No. of Hrs. For Absent :',                 field: 'hoursForAbsent'              },
    { label: 'No. of Hrs. For No Login :',               field: 'hoursForNoLogin'             },
    { label: 'No. of Hrs. For No Logout :',              field: 'hoursForNoLogout'            },
    { label: 'No. of Hrs. For No Break2 Out :',          field: 'hoursForNoBreak2Out'         },
    { label: 'No. of Hrs. For No Break2 In :',           field: 'hoursForNoBreak2In'          },
    { label: 'For Paid Unworked Holiday :',              field: 'paidUnworkedHoliday'         },
    { label: 'Min. Hours To Complete a Shift :',         field: 'minHoursToCompleteShift'     },
    { label: 'No of Hrs for OT Code :',                  field: 'hoursForOTCode'              },
    { label: 'Required No of Hrs. :',                    field: 'requiredHours'               },
    { label: 'Required Hours w/ Pay if w/ Paid Leave :', field: 'requiredHoursPayIfPaidLeave' },
    { label: 'Brk Round Up to Nearest Hr/Min :',         field: 'brkRoundUpNearest'           },
  ];

  const clockRows: { label: string; field: keyof Workshift }[] = [
    { label: 'Login Time To Consider as Absent :', field: 'loginTimeConsiderAbsent' },
    { label: 'Allow. Flexible Time In :',          field: 'allowFlexibleTimeIn'     },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {durationRows.map(({ label, field }) => (
          <div key={field as string} className="flex items-center gap-3">
            <label className="w-64 text-gray-700 text-sm shrink-0">{label}</label>
            <input
              type="text"
              value={(formData[field] as string) ?? ''}
              onChange={(e) => setFormData({ ...formData, [field]: formatTimeInput(e.target.value) })}
              className="w-28 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <span className="text-xs text-gray-400">[hh:mm]</span>
          </div>
        ))}
      </div>

      <hr className="border-gray-200" />

      {clockRows.map(({ label, field }) => (
        <div key={field as string} className="flex items-center gap-3">
          <label className="w-64 text-gray-700 text-sm shrink-0">{label}</label>
          <input
            type="text"
            value={(formData[field] as string) ?? ''}
            onChange={(e) => setFormData({ ...formData, [field]: formatTimeWithPeriod(e.target.value) })}
            className="w-28 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="HH:mm TT"
          />
          <button type="button" onClick={() => onOpenTimePicker(field as string)}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors shrink-0">
            <Clock className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      ))}

      <hr className="border-gray-200" />

      <div className="space-y-3">
        {(
          [
            { id: 'completeShiftWithUndertime', label: 'Complete a Shift with Undertime' },
            { id: 'secondShiftForRawData',      label: '2nd Shift For RawData'           },
          ] as { id: keyof Workshift; label: string }[]
        ).map(({ id, label }) => (
          <div key={id as string} className="flex items-center gap-2">
            <input type="checkbox" id={id as string} checked={!!formData[id]}
              onChange={(e) => setFormData({ ...formData, [id]: e.target.checked })}
              className="w-4 h-4 accent-blue-600" />
            <label htmlFor={id as string} className="text-sm text-gray-700">{label}</label>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — Break Rules & Bracketing
// ---------------------------------------------------------------------------
interface Step3Props {
  formData: Workshift;
  setFormData: (d: Workshift) => void;
  onOpenSearch: (type: 'tardiness' | 'undertime') => void;
  onClearBracketing: (type: 'tardiness' | 'undertime') => void;
}

function Step3BreakAndBracket({ formData, setFormData, onOpenSearch, onClearBracketing }: Step3Props) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <p className="text-sm font-semibold text-gray-600 mb-3">Break 1</p>
          <div className="space-y-2">
            {(
              [
                { id: 'deductBreak1Overbreak', label: 'Deduct Break1 Overbreak' },
                { id: 'flexibleBreak1',        label: 'Flexible Break1'         },
              ] as { id: keyof Workshift; label: string }[]
            ).map(({ id, label }) => (
              <div key={id as string} className="flex items-center gap-2">
                <input type="checkbox" id={id as string} checked={!!formData[id]}
                  onChange={(e) => setFormData({ ...formData, [id]: e.target.checked })}
                  className="w-4 h-4 accent-blue-600" />
                <label htmlFor={id as string} className="text-xs text-gray-700">{label}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <p className="text-sm font-semibold text-gray-600 mb-3">Break 3</p>
          <div className="space-y-2">
            {(
              [
                { id: 'deductBreak3Overbreak', label: 'Deduct Break3 Overbreak' },
                { id: 'flexibleBreak3',        label: 'Flexible Break3'         },
              ] as { id: keyof Workshift; label: string }[]
            ).map(({ id, label }) => (
              <div key={id as string} className="flex items-center gap-2">
                <input type="checkbox" id={id as string} checked={!!formData[id]}
                  onChange={(e) => setFormData({ ...formData, [id]: e.target.checked })}
                  className="w-4 h-4 accent-blue-600" />
                <label htmlFor={id as string} className="text-xs text-gray-700">{label}</label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="flex items-center gap-2 mb-3">
          <input type="checkbox" id="combineBreak1And3" checked={!!formData.combineBreak1And3}
            onChange={(e) => setFormData({ ...formData, combineBreak1And3: e.target.checked })}
            className="w-4 h-4 accent-blue-600" />
          <label htmlFor="combineBreak1And3" className="text-sm font-semibold text-gray-700">
            Combine Break1 and Break3
          </label>
        </div>

        {formData.combineBreak1And3 && (
          <div className="ml-6 space-y-2">
            {(
              [
                { id: 'computeAsTardinessCombine', label: 'Compute as Tardiness (Combined)', pair: 'computeAsUndertimeCombine'  },
                { id: 'computeAsUndertimeCombine', label: 'Compute as Undertime (Combined)',  pair: 'computeAsTardinessCombine' },
              ] as { id: keyof Workshift; label: string; pair: keyof Workshift }[]
            ).map(({ id, label, pair }) => (
              <div key={id as string} className="flex items-center gap-2">
                <input type="radio" id={id as string} name="combineCompute"
                  checked={!!formData[id]}
                  onChange={() => setFormData({ ...formData, [id]: true, [pair]: false })}
                  className="w-4 h-4 accent-blue-600" />
                <label htmlFor={id as string} className="text-sm text-gray-700">{label}</label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <p className="text-sm font-semibold text-gray-600 mb-3">Bracketing</p>
        <div className="space-y-3">
          {(
            [
              { type: 'tardiness', label: 'Tardiness :', field: 'tardiness' },
              { type: 'undertime', label: 'Undertime :', field: 'undertime' },
            ] as { type: 'tardiness' | 'undertime'; label: string; field: keyof Workshift }[]
          ).map(({ type, label, field }) => (
            <div key={type} className="flex items-center gap-2">
              <label className="w-24 text-sm text-gray-700 shrink-0">{label}</label>
              <input type="text" value={(formData[field] as string) ?? ''}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              <button type="button" onClick={() => onOpenSearch(type)}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                title={`Search ${type} bracket`}>
                <Search className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => onClearBracketing(type)}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                title={`Clear ${type}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main modal
// ---------------------------------------------------------------------------
export interface WorkshiftFormModalProps {
  isEditMode:    boolean;
  editingCode:   string;
  formData:      Workshift;
  setFormData:   (data: Workshift) => void;
  existingCodes: string[];
  onSuccess:     (saved: Workshift) => void;
  onClose:       () => void;
}

export function WorkshiftFormModal({
  isEditMode,
  editingCode,
  formData,
  setFormData,
  existingCodes,
  onSuccess,
  onClose,
}: WorkshiftFormModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving,    setIsSaving]    = useState(false);

  const [showTimePicker,  setShowTimePicker]  = useState(false);
  const [timePickerField, setTimePickerField] = useState<string>('');
  const [selectedHour,    setSelectedHour]    = useState(3);
  const [selectedMinute,  setSelectedMinute]  = useState(0);
  const [selectedPeriod,  setSelectedPeriod]  = useState<'AM' | 'PM'>('PM');

  const [showBracketing, setShowBracketing] = useState(false);
  const [bracketingType, setBracketingType] = useState<'tardiness' | 'undertime'>('tardiness');

  // ── Time picker helpers ──────────────────────────────────────────────────
  const handleOpenTimePicker = (field: string) => {
    const current = formData[field as keyof Workshift] as string;
    if (current) {
      const withPeriod = current.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (withPeriod) {
        setSelectedHour(parseInt(withPeriod[1], 10));
        setSelectedMinute(parseInt(withPeriod[2], 10));
        setSelectedPeriod(withPeriod[3].toUpperCase() as 'AM' | 'PM');
      }
    }
    setTimePickerField(field);
    setShowTimePicker(true);
  };

  const handleTimeConfirm = () => {
    const durationFields = ['loginTimeConsiderAbsent', 'allowFlexibleTimeIn'];
    let formatted: string;
    if (durationFields.includes(timePickerField)) {
      let h = selectedHour;
      if (selectedPeriod === 'PM' && h !== 12) h += 12;
      else if (selectedPeriod === 'AM' && h === 12) h = 0;
      formatted = `${String(h).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
    } else {
      formatted = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')} ${selectedPeriod}`;
    }
    setFormData({ ...formData, [timePickerField]: formatted });
    setShowTimePicker(false);
  };

  // ── Bracketing helpers ───────────────────────────────────────────────────
  const handleOpenSearch = (type: 'tardiness' | 'undertime') => {
    setBracketingType(type);
    setShowBracketing(true);
  };

  const handleSelectBracketing = (code: string) => {
    setFormData({ ...formData, [bracketingType]: code });
    setShowBracketing(false);
  };

  const handleClearBracketing = (type: 'tardiness' | 'undertime') => {
    setFormData({ ...formData, [type]: '' });
  };

  // ── Step validation ──────────────────────────────────────────────────────
  const canProceed = (): boolean => {
    if (currentStep === 1) {
      if (!formData.code?.trim())        { alert('Please enter a Code.');        return false; }
      if (!formData.description?.trim()) { alert('Please enter a Description.'); return false; }
    }
    return true;
  };

  const goNext = () => { if (canProceed()) setCurrentStep((s) => Math.min(s + 1, STEPS.length)); };
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 1));

  // ── API submit ───────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!formData.code?.trim()) {
      alert('Please enter a Code.');
      return;
    }
    if (!formData.description?.trim()) {
      alert('Please enter a Description.');
      return;
    }

    // Only check duplicates on create, not on edit
    if (!isEditMode && existingCodes.includes(formData.code)) {
      alert('A Workshift with this Code already exists.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = denormalizeWorkshiftForApi(formData);

      if (isEditMode) {
        await apiClient.put(`/Fs/Process/WorkshiftSetUp/${editingCode}`, payload);
      } else {
        await apiClient.post('/Fs/Process/WorkshiftSetUp', payload);
      }

      onSuccess({ ...formData });
    } catch (error) {
      console.error('Failed to save workshift:', error);
      alert('Failed to save workshift. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Stepper indicator ────────────────────────────────────────────────────
  const StepIndicator = () => (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((step, idx) => {
        const done   = currentStep > step.id;
        const active = currentStep === step.id;
        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
                done    ? 'bg-blue-600 border-blue-600 text-white'
                : active ? 'bg-white border-blue-600 text-blue-600'
                         : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {done ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span className={`text-xs mt-1 font-medium ${active ? 'text-blue-600' : done ? 'text-blue-500' : 'text-gray-400'}`}>
                {step.label}
              </span>
              <span className="text-xs text-gray-400 hidden sm:block">{step.description}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[100]" onClick={onClose} />

      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 pointer-events-none">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl pointer-events-auto flex flex-col max-h-[90vh]">

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-xl flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-white font-semibold text-lg">
                {isEditMode ? 'Edit Workshift' : 'Create New Workshift'}
              </h2>
              <p className="text-blue-200 text-xs mt-0.5">
                Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1].description}
              </p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            <StepIndicator />
            <div className="min-h-[300px]">
              {currentStep === 1 && (
                <Step1BasicInfo
                  formData={formData}
                  setFormData={setFormData}
                  isEditMode={isEditMode}
                  onOpenTimePicker={handleOpenTimePicker}
                />
              )}
              {currentStep === 2 && (
                <Step2HourConfig
                  formData={formData}
                  setFormData={setFormData}
                  onOpenTimePicker={handleOpenTimePicker}
                />
              )}
              {currentStep === 3 && (
                <Step3BreakAndBracket
                  formData={formData}
                  setFormData={setFormData}
                  onOpenSearch={handleOpenSearch}
                  onClearBracketing={handleClearBracketing}
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl shrink-0">
            <button onClick={goPrev} disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm">
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <span className="text-xs text-gray-400">{currentStep} / {STEPS.length}</span>

            {currentStep < STEPS.length ? (
              <button onClick={goNext}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={onClose} disabled={isSaving}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm disabled:opacity-40">
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={isSaving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-60 flex items-center gap-2">
                  {isSaving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    isEditMode ? 'Update' : 'Submit'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showTimePicker && (
        <WorkshiftTimePickerModal
          selectedHour={selectedHour}
          selectedMinute={selectedMinute}
          selectedPeriod={selectedPeriod}
          onHourIncrement={() => {
            if (selectedHour === 12) { setSelectedHour(1); setSelectedPeriod((p) => (p === 'AM' ? 'PM' : 'AM')); }
            else setSelectedHour((h) => h + 1);
          }}
          onHourDecrement={() => {
            if (selectedHour === 1) { setSelectedHour(12); setSelectedPeriod((p) => (p === 'AM' ? 'PM' : 'AM')); }
            else setSelectedHour((h) => h - 1);
          }}
          onMinuteIncrement={() => setSelectedMinute((m) => (m === 59 ? 0  : m + 1))}
          onMinuteDecrement={() => setSelectedMinute((m) => (m === 0  ? 59 : m - 1))}
          onPeriodChange={setSelectedPeriod}
          onConfirm={handleTimeConfirm}
          onClose={() => setShowTimePicker(false)}
        />
      )}

      {showBracketing && (
        <WorkshiftBracketingSearchModal
          searchType={bracketingType}
          onSelect={handleSelectBracketing}
          onClose={() => setShowBracketing(false)}
        />
      )}
    </>
  );
}