import { X, Calendar, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CalendarPopup } from '../CalendarPopup';

interface DeviceCodeModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  empCode: string;
  code: string;
  password: string;
  effectivityDate: string;
  expiryDate: string;
  onClose: () => void;
  onCodeChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onEffectivityDateChange: (value: string) => void;
  onExpiryDateChange: (value: string) => void;
  onSubmit: () => void;
}

export function DeviceCodeModal({
  isOpen,
  isEditMode,
  empCode,
  code,
  password,
  effectivityDate,
  expiryDate,
  onClose,
  onCodeChange,
  onPasswordChange,
  onEffectivityDateChange,
  onExpiryDateChange,
  onSubmit
}: DeviceCodeModalProps) {
  const [showEffectCalendar, setShowEffectCalendar] = useState(false);
  const [showExpiryCalendar, setShowExpiryCalendar] = useState(false);
  const [showPassword,       setShowPassword]       = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowEffectCalendar(false);
      setShowExpiryCalendar(false);
      setShowPassword(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !isOpen) return;
      if (showEffectCalendar) { setShowEffectCalendar(false); return; }
      if (showExpiryCalendar) { setShowExpiryCalendar(false); return; }
      onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose, showEffectCalendar, showExpiryCalendar]);

  const toDisplayDate = (iso: string): string => {
    if (!iso) return '';
    if (iso.includes('/')) return iso;
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) return iso;
    return `${parseInt(m)}/${parseInt(d)}/${y}`;
  };

  const toInputDate = (display: string): string => {
    if (!display) return '';
    if (display.includes('-')) return display;
    const parts = display.split('/');
    if (parts.length !== 3) return display;
    const [m, d, y] = parts;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-30" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-visible">

          {/* Modal Header */}
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between sticky top-0 z-10 rounded-t-2xl">
            <h2 className="text-gray-800 font-semibold text-sm">
              {isEditMode ? 'Edit Device Code' : 'Add Device Code'}
            </h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-5">
            <h3 className="text-blue-600 font-medium mb-4">Device Code Information</h3>

            <div className="space-y-3">

              {/* EmpCode */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700 text-sm flex-shrink-0">EmpCode :</label>
                <input
                  type="text"
                  value={empCode}
                  readOnly
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm bg-gray-100 focus:outline-none"
                />
              </div>

              {/* Code */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700 text-sm flex-shrink-0">Code :</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => onCodeChange(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Password with show/hide toggle */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700 text-sm flex-shrink-0">Password :</label>
                <div className="relative flex-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                    style={{ height: '100%', top: 0, transform: 'none', display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Effectivity Date — same pattern as OvertimeApplicationModal */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700 text-sm flex-shrink-0">Effectivity Date :</label>
                <div className="relative">
                  <input
                    type="text"
                    value={toDisplayDate(effectivityDate)}
                    onChange={(e) => onEffectivityDateChange(toInputDate(e.target.value))}
                    placeholder="MM/DD/YYYY"
                    className="w-36 px-3 py-1.5 border border-gray-300 rounded text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => { setShowEffectCalendar(v => !v); setShowExpiryCalendar(false); }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </button>
                  {showEffectCalendar && (
                    <div className="absolute z-[9999]" style={{ top: '100%', left: 0 }}>
                      <CalendarPopup
                        onDateSelect={d => { onEffectivityDateChange(toInputDate(d)); setShowEffectCalendar(false); }}
                        onClose={() => setShowEffectCalendar(false)}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Expiry Date — same pattern as OvertimeApplicationModal */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700 text-sm flex-shrink-0">Expiry Date :</label>
                <div className="relative">
                  <input
                    type="text"
                    value={toDisplayDate(expiryDate)}
                    onChange={(e) => onExpiryDateChange(toInputDate(e.target.value))}
                    placeholder="MM/DD/YYYY"
                    className="w-36 px-3 py-1.5 border border-gray-300 rounded text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => { setShowExpiryCalendar(v => !v); setShowEffectCalendar(false); }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </button>
                  {showExpiryCalendar && (
                    <div className="absolute z-[9999]" style={{ top: '100%', left: 0 }}>
                      <CalendarPopup
                        onDateSelect={d => { onExpiryDateChange(toInputDate(d)); setShowExpiryCalendar(false); }}
                        onClose={() => setShowExpiryCalendar(false)}
                      />
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={onSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm"
              >
                {isEditMode ? 'Update' : 'Add'}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-sm text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}