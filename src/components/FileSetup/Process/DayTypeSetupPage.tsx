import { useState, useEffect } from 'react';
import { Save, X, Check } from 'lucide-react';
import { Footer } from '../../Footer/Footer';

interface DayType {
  label: string;
  code: string;
  fieldName: string;
}

export function DayTypeSetupPage() {
  const [formData, setFormData] = useState({
    regularDay: 'RegDay',
    restDay: 'RestDay',
    legalHoliday: 'Legal',
    specialHoliday: 'SPH',
    legalHolidayRestday: 'LHFRD',
    specialHolidayRestday: 'SHFRD',
    doubleLegalHoliday: '2LEGHOL',
    doubleLegalHolidayRestday: '2LEGHOLRD',
    specialHoliday2: 'SPH2',
    specialHoliday2Restday: 'SPH2RD',
    nonWorkingHoliday: 'NWH',
    nonWorkingHolidayRestday: 'NWHRD'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const dayTypes: DayType[] = [
    { label: 'Regular Day:', code: formData.regularDay, fieldName: 'regularDay' },
    { label: 'Rest Day:', code: formData.restDay, fieldName: 'restDay' },
    { label: 'Legal Holiday:', code: formData.legalHoliday, fieldName: 'legalHoliday' },
    { label: 'Special Holiday:', code: formData.specialHoliday, fieldName: 'specialHoliday' },
    { label: 'Legal Holiday that Falls on Restday:', code: formData.legalHolidayRestday, fieldName: 'legalHolidayRestday' },
    { label: 'Special Holiday that Falls on Restday:', code: formData.specialHolidayRestday, fieldName: 'specialHolidayRestday' },
    { label: 'Double Legal Holiday:', code: formData.doubleLegalHoliday, fieldName: 'doubleLegalHoliday' },
    { label: 'Double Legal Holiday Falling on Restday:', code: formData.doubleLegalHolidayRestday, fieldName: 'doubleLegalHolidayRestday' },
    { label: 'Special Holiday 2:', code: formData.specialHoliday2, fieldName: 'specialHoliday2' },
    { label: 'Special Holiday 2 Falling on the Rest Day:', code: formData.specialHoliday2Restday, fieldName: 'specialHoliday2Restday' },
    { label: 'Non-Working Holiday:', code: formData.nonWorkingHoliday, fieldName: 'nonWorkingHoliday' },
    { label: 'Non-Working Holiday Falling on the Rest Day:', code: formData.nonWorkingHolidayRestday, fieldName: 'nonWorkingHolidayRestday' }
  ];

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values
    setFormData({
      regularDay: 'RegDay',
      restDay: 'RestDay',
      legalHoliday: 'Legal',
      specialHoliday: 'SPH',
      legalHolidayRestday: 'LHFRD',
      specialHolidayRestday: 'SHFRD',
      doubleLegalHoliday: '2LEGHOL',
      doubleLegalHolidayRestday: '2LEGHOLRD',
      specialHoliday2: 'SPH2',
      specialHoliday2Restday: 'SPH2RD',
      nonWorkingHoliday: 'NWH',
      nonWorkingHolidayRestday: 'NWHRD'
    });
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  return (
      <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Day Type Setup</h1>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
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
                    Configure day type classifications for different working days including regular days, special holidays, regular holidays, rest days, and premium days with corresponding earning codes.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Multiple day type categories</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Earning code mapping</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Holiday rate configuration</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Automated payroll calculations</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {showSuccessMessage && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Day Type Setup saved successfully!
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-6">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  Edit Configuration
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              )}
            </div>

            {/* Day Types Form */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="space-y-4">
                  {dayTypes.map((dayType, index) => (
                    <div key={index} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-b-0">
                      <label className="text-gray-700 text-sm w-80 flex-shrink-0">
                        {dayType.label}
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={dayType.code}
                          onChange={(e) => handleInputChange(dayType.fieldName, e.target.value)}
                          className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      ) : (
                        <div className="flex-1 max-w-xs px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">
                          {dayType.code}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="mb-1">These day type codes are used throughout the timekeeping system to classify different types of days for payroll calculation.</p>
                  <p>Ensure codes are unique and recognizable for proper processing.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}