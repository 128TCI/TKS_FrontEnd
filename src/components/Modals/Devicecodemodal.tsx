import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

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
  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      ></div>

      {/* Modal Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <h2 className="text-gray-800">{isEditMode ? 'Edit Device Code' : 'Add Device Code'}</h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-5">
            <h3 className="text-blue-600 mb-4">Device Code Information</h3>

            {/* Form Fields */}
            <div className="space-y-3">
              {/* EmpCode */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">EmpCode :</label>
                <input
                  type="text"
                  value={empCode}
                  readOnly
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-100"
                />
              </div>

              {/* Code */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Code :</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => onCodeChange(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Password */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Password :</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Effectivity Date */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Effectivity Date :</label>
                <input
                  type="date"
                  value={effectivityDate}
                  onChange={(e) => onEffectivityDateChange(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Expiry Date */}
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Expiry Date :</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => onExpiryDateChange(e.target.value)}
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
                {isEditMode ? 'Update' : 'Add'}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
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