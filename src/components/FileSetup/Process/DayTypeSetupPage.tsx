import { useState, useEffect } from 'react';
import { Save, X, Check } from 'lucide-react';
import { Footer } from '../../Footer/Footer';
import apiClient from '../../../services/apiClient';
import Swal from 'sweetalert2';

interface DayType {
  label: string;
  fieldName: string;
}

interface DayTypeData {
  id: number;
  regularDay: string;
  restDay: string;
  legalHoliday: string;
  specialHoliday: string;
  legalHolidayFallRestDay: string;
  specialHolidayFallRestDay: string;
  doubleLegalHoliday: string;
  doubleLegalHolidayFallRestday: string;
  specialHoliday2: string;
  specialHoliday2FallRestDay: string;
  nonWorkingHoliday: string;
  nonWorkingHolidayFallRestDay: string;
}

export function DayTypeSetupPage() {
  const [formData, setFormData] = useState<DayTypeData>({
    id: 0,
    regularDay: '',
    restDay: '',
    legalHoliday: '',
    specialHoliday: '',
    legalHolidayFallRestDay: '',
    specialHolidayFallRestDay: '',
    doubleLegalHoliday: '',
    doubleLegalHolidayFallRestday: '',
    specialHoliday2: '',
    specialHoliday2FallRestDay: '',
    nonWorkingHoliday: '',
    nonWorkingHolidayFallRestDay: ''
  });

  const [originalData, setOriginalData] = useState<DayTypeData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const dayTypes: DayType[] = [
    { label: 'Regular Day:', fieldName: 'regularDay' },
    { label: 'Rest Day:', fieldName: 'restDay' },
    { label: 'Legal Holiday:', fieldName: 'legalHoliday' },
    { label: 'Special Holiday:', fieldName: 'specialHoliday' },
    { label: 'Legal Holiday that Falls on Restday:', fieldName: 'legalHolidayFallRestDay' },
    { label: 'Special Holiday that Falls on Restday:', fieldName: 'specialHolidayFallRestDay' },
    { label: 'Double Legal Holiday:', fieldName: 'doubleLegalHoliday' },
    { label: 'Double Legal Holiday Falling on Restday:', fieldName: 'doubleLegalHolidayFallRestday' },
    { label: 'Special Holiday 2:', fieldName: 'specialHoliday2' },
    { label: 'Special Holiday 2 Falling on the Rest Day:', fieldName: 'specialHoliday2FallRestDay' },
    { label: 'Non-Working Holiday:', fieldName: 'nonWorkingHoliday' },
    { label: 'Non-Working Holiday Falling on the Rest Day:', fieldName: 'nonWorkingHolidayFallRestDay' }
  ];

  useEffect(() => {
    fetchDayTypeData();
  }, []);

  const fetchDayTypeData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/Fs/Process/DayTypeSetUp');
      if (response.status === 200 && response.data) {
        // Assuming the API returns an array and we want the first item
        const data = Array.isArray(response.data) ? response.data[0] : response.data;
        setFormData(data);
        setOriginalData(data);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load day type configuration';
      setError(errorMsg);
      console.error('Error fetching day type data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
        
      const response = await apiClient.put(`/Fs/Process/DayTypeSetUp/${formData.id}`, formData);
      
      if (response.status === 200) {
        const updatedData = response.data;
        setFormData(updatedData);
        setOriginalData(updatedData);
        setIsEditing(false);
        
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Day Type Setup saved successfully!',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save changes';
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
      });
      console.error('Error saving day type data:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalData) {
      setFormData(originalData);
    }
    setIsEditing(false);
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading day type configuration...</div>
      </div>
    );
  }

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

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
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
                    disabled={saving}
                    className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm"
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
                          value={formData[dayType.fieldName as keyof DayTypeData] as string}
                          onChange={(e) => handleInputChange(dayType.fieldName, e.target.value)}
                          className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      ) : (
                        <div className="flex-1 max-w-xs px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">
                          {formData[dayType.fieldName as keyof DayTypeData] as string}
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