import { useState, useEffect } from 'react';
import { Check, Save, Pencil, X } from 'lucide-react';
import { Footer } from '../../Footer/Footer';
import { decryptData } from '../../../services/encryptionService';
import apiClient from '../../../services/apiClient';
import Swal from 'sweetalert2';
import auditTrail from '../../../services/auditTrail';

const formName = 'System Configuration SetUp';
interface SystemConfig {
  id: number;
  numOfMinBeforeTheShift: number;
  numOfMinToIgnoreMultipleOutInBreak: number;
  numOfMinBeforeMidnightShift: number;
  devicePolicy: string;
  retryCount: number;
  retryInterval: number;
  noOfMinToConsiderBrk2In: number;
  oldOvertimeProc: boolean;
  oldNighDiffProc: boolean;
  oldTardinessProc: boolean;
  useHHMM: boolean;
  borrowedDeviceNameOrg: string | null;
  disableMultipleLogin: boolean;
  brk1Brk3NoMinutes: number;
  brk2NoMinutes: number;
  noFlag_Break1: number | null;
  noFlag_Break2: number | null;
  noFlag_Break3: number | null;
}

export function SystemConfigurationSetupPage() {
  const [showEditMode, setShowEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [originalData, setOriginalData] = useState<SystemConfig | null>(null);

  // Simplified checkbox component for better reliability
  const CustomCheckbox = ({ 
    checked, 
    onChange, 
    disabled 
  }: { 
    checked: boolean; 
    onChange: (checked: boolean) => void; 
    disabled: boolean;
  }) => (
    <div 
      onClick={() => !disabled && onChange(!checked)}
      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${checked 
          ? 'bg-blue-600 border-blue-600' 
          : 'bg-white border-gray-400 hover:border-gray-500'
        }`}
    >
      {checked && (
        <Check className="w-4 h-4 text-white stroke-[3]" />
      )}
    </div>
  );

  // Helper function for numeric-only input
  const formatNumericInput = (value: string): string => {
    return value.replace(/[^\d]/g, '');
  };

  const [formData, setFormData] = useState({
    numOfMinBeforeTheShift: '',
    numOfMinToIgnoreMultipleOutInBreak: '',
    numOfMinBeforeMidnightShift: '',
    devicePolicy: 'Device11',
    retryCount: '',
    retryInterval: '',
    noOfMinToConsiderBrk2In: '',
    oldOvertimeProc: false,
    oldNighDiffProc: false,
    oldTardinessProc: false,
    useHHMM: false,
    borrowedDeviceNameOrg: '',
    disableMultipleLogin: false,
    brk1Brk3NoMinutes: '',
    brk2NoMinutes: '',
    noFlag_Break1: '',
    noFlag_Break2: '',
    noFlag_Break3: ''
  });

  // Permissions
    const [permissions, setPermissions] = useState<Record<string, boolean>>({});
    const hasPermission = (accessType: string) => permissions[accessType] === true;
  
    useEffect(() => {
      getSystemConfigSetupPermissions();
    }, []);
  
    const getSystemConfigSetupPermissions = () => {
      const rawPayload = localStorage.getItem("loginPayload");
      if (!rawPayload) return;
  
      try {
        const parsedPayload = JSON.parse(rawPayload);
        const encryptedArray: any[] = parsedPayload.permissions || [];
  
        const branchEntries = encryptedArray.filter(
          (p) => decryptData(p.formName) === "SystemConfig"
        );
  
        // Build a map: { Add: true, Edit: true, ... }
        const permMap: Record<string, boolean> = {};
        branchEntries.forEach((p) => {
          const accessType = decryptData(p.accessTypeName);
          if (accessType) permMap[accessType] = true;
        });
  
        setPermissions(permMap);
  
      } catch (e) {
        console.error("Error parsing or decrypting payload", e);
      }
    };

  // Handle ESC key press
  useEffect(() => {
    fetchSystemConfig();
  }, []);

  // Debug: Log formData changes
  useEffect(() => {
    console.log('FormData updated:', formData);
  }, [formData]);

  const fetchSystemConfig = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/Fs/Process/Device/SystemConfiguration');
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      
      if (response.status === 200 && response.data) {
        // Handle if data is an array (get first item) or direct object
        let config: SystemConfig;
        if (Array.isArray(response.data)) {
          config = response.data[0];
          console.log('Data is array, using first item:', config);
        } else {
          config = response.data;
          console.log('Data is object:', config);
        }
        
        if (!config) {
          console.error('No config data found');
          return;
        }
        
        console.log('Parsed config:', config);
        console.log('numOfMinBeforeTheShift:', config.numOfMinBeforeTheShift);
        console.log('retryCount:', config.retryCount);
        
        setOriginalData(config);
        
        // Map API data to form
        const mappedData = {
          numOfMinBeforeTheShift: String(config.numOfMinBeforeTheShift ?? ''),
          numOfMinToIgnoreMultipleOutInBreak: String(config.numOfMinToIgnoreMultipleOutInBreak ?? ''),
          numOfMinBeforeMidnightShift: String(config.numOfMinBeforeMidnightShift ?? ''),
          devicePolicy: config.devicePolicy || 'Device11',
          retryCount: String(config.retryCount ?? ''),
          retryInterval: String(config.retryInterval ?? ''),
          noOfMinToConsiderBrk2In: String(config.noOfMinToConsiderBrk2In ?? ''),
          oldOvertimeProc: Boolean(config.oldOvertimeProc),
          oldNighDiffProc: Boolean(config.oldNighDiffProc),
          oldTardinessProc: Boolean(config.oldTardinessProc),
          useHHMM: Boolean(config.useHHMM),
          borrowedDeviceNameOrg: config.borrowedDeviceNameOrg ?? '',
          disableMultipleLogin: Boolean(config.disableMultipleLogin),
          brk1Brk3NoMinutes: String(config.brk1Brk3NoMinutes ?? ''),
          brk2NoMinutes: String(config.brk2NoMinutes ?? ''),
          noFlag_Break1: config.noFlag_Break1 !== null && config.noFlag_Break1 !== undefined ? String(config.noFlag_Break1) : '',
          noFlag_Break2: config.noFlag_Break2 !== null && config.noFlag_Break2 !== undefined ? String(config.noFlag_Break2) : '',
          noFlag_Break3: config.noFlag_Break3 !== null && config.noFlag_Break3 !== undefined ? String(config.noFlag_Break3) : ''
        };
        
        console.log('Mapped form data:', mappedData);
        setFormData(mappedData);
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || error.message || 'Failed to load system configuration'
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: SystemConfig = {
        id: originalData?.id || 1,
        numOfMinBeforeTheShift: parseInt(formData.numOfMinBeforeTheShift) || 0,
        numOfMinToIgnoreMultipleOutInBreak: parseInt(formData.numOfMinToIgnoreMultipleOutInBreak) || 0,
        numOfMinBeforeMidnightShift: parseInt(formData.numOfMinBeforeMidnightShift) || 0,
        devicePolicy: formData.devicePolicy,
        retryCount: parseInt(formData.retryCount) || 0,
        retryInterval: parseInt(formData.retryInterval) || 0,
        noOfMinToConsiderBrk2In: parseInt(formData.noOfMinToConsiderBrk2In) || 0,
        oldOvertimeProc: formData.oldOvertimeProc,
        oldNighDiffProc: formData.oldNighDiffProc,
        oldTardinessProc: formData.oldTardinessProc,
        useHHMM: formData.useHHMM,
        borrowedDeviceNameOrg: formData.borrowedDeviceNameOrg || null,
        disableMultipleLogin: formData.disableMultipleLogin,
        brk1Brk3NoMinutes: parseInt(formData.brk1Brk3NoMinutes) || 0,
        brk2NoMinutes: parseInt(formData.brk2NoMinutes) || 0,
        noFlag_Break1: formData.noFlag_Break1 ? parseInt(formData.noFlag_Break1) : null,
        noFlag_Break2: formData.noFlag_Break2 ? parseInt(formData.noFlag_Break2) : null,
        noFlag_Break3: formData.noFlag_Break3 ? parseInt(formData.noFlag_Break3) : null
      };

      await apiClient.put('/Fs/Process/Device/SystemConfiguration/1', payload);
      await auditTrail.log({
        accessType: 'Edit',
        trans: 'System Configuration Update',
        messages: 'System configuration saved successfully',
        formName,
      });
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'System configuration saved successfully.',
        timer: 2000,
        showConfirmButton: false
      });
      
      setShowEditMode(false);
      await fetchSystemConfig();
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || error.message || 'Failed to save system configuration'
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Cancel (revert to original) ───────────────────────────────────────────
  const handleCancel = () => {
    if (originalData) {
      setFormData({
        numOfMinBeforeTheShift: String(originalData.numOfMinBeforeTheShift),
        numOfMinToIgnoreMultipleOutInBreak: String(originalData.numOfMinToIgnoreMultipleOutInBreak),
        numOfMinBeforeMidnightShift: String(originalData.numOfMinBeforeMidnightShift),
        devicePolicy: originalData.devicePolicy || 'Device11',
        retryCount: String(originalData.retryCount),
        retryInterval: String(originalData.retryInterval),
        noOfMinToConsiderBrk2In: String(originalData.noOfMinToConsiderBrk2In),
        oldOvertimeProc: originalData.oldOvertimeProc,
        oldNighDiffProc: originalData.oldNighDiffProc,
        oldTardinessProc: originalData.oldTardinessProc,
        useHHMM: originalData.useHHMM,
        borrowedDeviceNameOrg: originalData.borrowedDeviceNameOrg || '',
        disableMultipleLogin: originalData.disableMultipleLogin,
        brk1Brk3NoMinutes: String(originalData.brk1Brk3NoMinutes),
        brk2NoMinutes: String(originalData.brk2NoMinutes),
        noFlag_Break1: originalData.noFlag_Break1 !== null ? String(originalData.noFlag_Break1) : '',
        noFlag_Break2: originalData.noFlag_Break2 !== null ? String(originalData.noFlag_Break2) : '',
        noFlag_Break3: originalData.noFlag_Break3 !== null ? String(originalData.noFlag_Break3) : ''
      });
    }
    setShowEditMode(false);
  };

  // ── ESC key ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showEditMode) {
        handleCancel();
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showEditMode, originalData]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">System Configuration Setup</h1>
          </div>

          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
            {/* Info banner */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    Configure system-wide settings for time and attendance processing. Define device policies, pairing rules, overtime calculations, and various system behaviors to match your organization's requirements.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {['Device pairing policies and configurations', 'Overtime and tardiness process options', 'Break time and shift validation rules', 'System retry and interval settings'].map(t => (
                      <div key={t} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Edit/Save Buttons */}
            <div className="mb-6">
              {!showEditMode && hasPermission("View") && (
                <button 
                  onClick={() => setShowEditMode(true)}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
              )}
              {showEditMode && (
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Configuration Form */}
            {hasPermission('View') ? (
            <div className="space-y-6">
              {/* Old Process Options */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <label className="w-64 text-gray-700">Old Overtime Process :</label>
                  <div className="flex-1">
                    <input
                      type="checkbox"
                      checked={formData.oldOvertimeProcess}
                      onChange={(e) => setFormData({ ...formData, oldOvertimeProcess: e.target.checked })}
                      disabled={!showEditMode}
                      className={checkboxClass}
                    />
                    <p className="text-sm text-green-600 mt-1 ml-6">Use Old Overtime Process</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <label className="w-64 text-gray-700">Old Night Differential Process :</label>
                  <div className="flex-1">
                    <input
                      type="checkbox"
                      checked={formData.oldNightDifferentialProcess}
                      onChange={(e) => setFormData({ ...formData, oldNightDifferentialProcess: e.target.checked })}
                      disabled={!showEditMode}
                      className={checkboxClass}
                    />
                    <p className="text-sm text-green-600 mt-1 ml-6">Use Old Night Differential Process</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <label className="w-64 text-gray-700">Old Tardiness Process :</label>
                  <div className="flex-1">
                    <input
                      type="checkbox"
                      checked={formData.oldTardinessProcess}
                      onChange={(e) => setFormData({ ...formData, oldTardinessProcess: e.target.checked })}
                      disabled={!showEditMode}
                      className={checkboxClass}
                    />
                    <p className="text-sm text-green-600 mt-1 ml-6">Use Old Tardiness Process</p>
                  </div>
                </div>
              </div>
            ) : !originalData ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-red-600">No configuration data available</div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Old Process Options */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <label className="w-64 text-gray-700">Old Overtime Process :</label>
                    <div className="flex-1 flex items-center gap-3">
                      <CustomCheckbox
                        checked={formData.oldOvertimeProc}
                        onChange={(checked) => setFormData({ ...formData, oldOvertimeProc: checked })}
                        disabled={!showEditMode}
                      />
                      <p className="text-sm text-green-600">Use Old Overtime Process</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <label className="w-64 text-gray-700">Old Night Differential Process :</label>
                    <div className="flex-1 flex items-center gap-3">
                      <CustomCheckbox
                        checked={formData.oldNighDiffProc}
                        onChange={(checked) => setFormData({ ...formData, oldNighDiffProc: checked })}
                        disabled={!showEditMode}
                      />
                      <p className="text-sm text-green-600">Use Old Night Differential Process</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <label className="w-64 text-gray-700">Old Tardiness Process :</label>
                    <div className="flex-1 flex items-center gap-3">
                      <CustomCheckbox
                        checked={formData.oldTardinessProc}
                        onChange={(checked) => setFormData({ ...formData, oldTardinessProc: checked })}
                        disabled={!showEditMode}
                      />
                      <p className="text-sm text-green-600">Use Old Tardiness Process</p>
                    </div>
                  </div>
                </div>

                {/* Device and Login Settings */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="w-64 text-gray-700">Borrowed Device Name Org :</label>
                    <input
                      type="text"
                      value={formData.borrowedDeviceNameOrg}
                      onChange={(e) => setFormData({ ...formData, borrowedDeviceNameOrg: e.target.value })}
                      disabled={!showEditMode}
                      className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 disabled:bg-gray-100"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="w-64 text-gray-700">Disable Multiple Login :</label>
                    <CustomCheckbox
                      checked={formData.disableMultipleLogin}
                      onChange={(checked) => setFormData({ ...formData, disableMultipleLogin: checked })}
                      disabled={!showEditMode}
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <label className="w-64 text-gray-700">Use HH:MM :</label>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <CustomCheckbox
                          checked={formData.useHHMM}
                          onChange={(checked) => setFormData({ ...formData, useHHMM: checked })}
                          disabled={!showEditMode}
                        />
                        <p className="text-sm text-green-600">To show HH:MM format in processing/processed data</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time and Validation Settings */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <label className="w-64 text-gray-700">No. of Min. Before the Shift :</label>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={formData.numOfMinBeforeTheShift}
                        onChange={(e) => setFormData({ ...formData, numOfMinBeforeTheShift: formatNumericInput(e.target.value) })}
                        disabled={!showEditMode}
                        className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 disabled:bg-gray-100"
                      />
                      <p className="text-sm text-green-600 mt-1">Used in Validate Logs in Import {'>'} Update Raw Data</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <label className="w-64 text-gray-700">No. of Min. to Ignore Multiple Break Out/In :</label>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={formData.numOfMinToIgnoreMultipleOutInBreak}
                        onChange={(e) => setFormData({ ...formData, numOfMinToIgnoreMultipleOutInBreak: formatNumericInput(e.target.value) })}
                        disabled={!showEditMode}
                        className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 disabled:bg-gray-100"
                      />
                      <p className="text-sm text-green-600 mt-1">This will be triggered when your Device Policy is Device 4</p>
                      <p className="text-sm text-green-600">During pairing of Breaks The system will ignore Multiple breaks when the difference of break is equal or less than to defined policy.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <label className="w-64 text-gray-700">No. of Min. Before Midnight Shift :</label>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={formData.numOfMinBeforeMidnightShift}
                        onChange={(e) => setFormData({ ...formData, numOfMinBeforeMidnightShift: formatNumericInput(e.target.value) })}
                        disabled={!showEditMode}
                        className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 disabled:bg-gray-100"
                      />
                      <p className="text-sm text-green-600 mt-1">This will be triggered when Midnight Shift is check in workshift.</p>
                    </div>
                  </div>
                </div>

                {/* Retry Settings */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <label className="w-64 text-gray-700">Retry Count :</label>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={formData.retryCount}
                        onChange={(e) => setFormData({ ...formData, retryCount: formatNumericInput(e.target.value) })}
                        disabled={!showEditMode}
                        className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 disabled:bg-gray-100"
                      />
                      <p className="text-sm text-green-600 mt-1">This will be the count on retries when deadlock occured.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <label className="w-64 text-gray-700">Retry Interval :</label>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={formData.retryInterval}
                        onChange={(e) => setFormData({ ...formData, retryInterval: formatNumericInput(e.target.value) })}
                        disabled={!showEditMode}
                        className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 disabled:bg-gray-100"
                      />
                      <p className="text-sm text-green-600 mt-1">This will be the interval of system before retries when deadlock occured.</p>
                      <p className="text-sm text-green-600">Note: that this setup is in seconds</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <label className="w-64 text-gray-700">No of Min. to Consider Break2 In :</label>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={formData.noOfMinToConsiderBrk2In}
                        onChange={(e) => setFormData({ ...formData, noOfMinToConsiderBrk2In: formatNumericInput(e.target.value) })}
                        disabled={!showEditMode}
                        className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 disabled:bg-gray-100"
                      />
                      <p className="text-sm text-green-600 mt-1">This is the number of minutes to consider as the pair of Break 2 Out, this is used in Device 5.</p>
                    </div>
                  </div>
                </div>

                {/* Device Policy */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <label className="w-64 text-gray-700">Device Policy :</label>
                    <div className="flex-1">
                      <select
                        value={formData.devicePolicy}
                        onChange={(e) => setFormData({ ...formData, devicePolicy: e.target.value })}
                        disabled={!showEditMode}
                        className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 disabled:bg-gray-100"
                      >
                        <option value="Device11">Device 11</option>
                        <option value="Device1">Device 1</option>
                        <option value="Device2">Device 2</option>
                        <option value="Device3">Device 3</option>
                        <option value="Device4">Device 4</option>
                        <option value="Device5">Device 5</option>
                        <option value="Device6">Device 6</option>
                        <option value="Device7">Device 7</option>
                        <option value="Device8">Device 8</option>
                        <option value="Device9">Device 9</option>
                        <option value="Device10">Device 10</option>
                        <option value="Device12">Device 12</option>
                        <option value="Device13">Device 13</option>
                        <option value="Device14">Device 14</option>
                        <option value="Device15">Device 15</option>
                        <option value="Device12_v810">Device 12_v810</option>
                      </select>
                      <p className="text-sm text-green-600 mt-1">Leave blank if you want the default pairing of logs.</p>
                    </div>
                  </div>
                </div>

                {/* Device Descriptions */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-gray-700 mb-3 font-semibold">Device Policy Descriptions:</h3>
                  <ul className="space-y-2 text-sm">
                    {[
                      { dev: 'Device 1', desc: 'First in Last Out Regardless of flagging' },
                      { dev: 'Device 2', desc: 'First In = Time In, Second In = Break2 In, First Out = Break2 Out, Second Out = Time Out (if no second out First Out will become Time Out)' },
                      { dev: 'Device 3', desc: 'First Flag for Break1Out = Break1Out, Second Flag for Break1Out = Break3Out, First flag for Break1In = Break1In, Last flag for break1In = Break3In' },
                      { dev: 'Device 4', desc: 'First Flag for BreakIn = Break1In, Second Flag for BreakIn = Break2In, Third Flag for BreakIn = Break3In, First Flag for BreakOut = Break1Out, Second Flag for BreakOut = Break2Out, Third Flag for BreakOut = Break3Out' },
                      { dev: 'Device 5', desc: 'If there is First Flag of any Break before Any flag of In/Out, Flagging of In/Out will always be Out.' },
                      { dev: 'Device 6', desc: 'From Windows Validation.' },
                      { dev: 'Device 7', desc: 'All Logs that falls on 6:00am Current Date to 5:59am the next day will be paired to Current Date' },
                      { dev: 'Device 8', desc: '24 Hours Pairing' },
                      { dev: 'Device 9', desc: 'Standard pairing but First Time Out will pair' },
                      { dev: 'Device 10', desc: 'First In of the current day and last out before first in of next day' },
                      { dev: 'Device 11', desc: '24 Hours Pairing With Workshift Validation' },
                      { dev: 'Device 12', desc: '24 Hours Pairing Device8 Replica' },
                      { dev: 'Device 13', desc: '24 Hours Pairing Breaks Flag are the Same' },
                      { dev: 'Device 14', desc: 'Device10 Replica' },
                      { dev: 'Device 15', desc: '24 Hours Pairing Breaks IN/OUT Flags is same with IN/OUT Flags' },
                      { dev: 'Device 12_v810', desc: 'Device12 of v810' }
                    ].map(({ dev, desc }) => (
                      <li key={dev}>
                        <strong className="text-gray-700">{dev}</strong>
                        <p className="text-gray-600 ml-4">- {desc}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Break Time Policy */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-blue-700 mb-3 font-semibold">Policy for Utility to Update the Time Flag Base on Set Policy of Breaks</h3>
                  <p className="text-sm text-gray-700 mb-3">No Flags - Break Hours Policy from Time In</p>
                  
                  <div className="bg-gray-100 p-3 rounded mb-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <label className="w-24 text-sm text-gray-700">Break1 (min)</label>
                        <input
                          type="text"
                          value={formData.noFlag_Break1}
                          onChange={(e) => setFormData({ ...formData, noFlag_Break1: formatNumericInput(e.target.value) })}
                          disabled={!showEditMode}
                          className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 disabled:bg-gray-100"
                          placeholder="minutes"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="w-24 text-sm text-gray-700">Break2 (min)</label>
                        <input
                          type="text"
                          value={formData.noFlag_Break2}
                          onChange={(e) => setFormData({ ...formData, noFlag_Break2: formatNumericInput(e.target.value) })}
                          disabled={!showEditMode}
                          className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 disabled:bg-gray-100"
                          placeholder="minutes"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="w-24 text-sm text-gray-700">Break3 (min)</label>
                        <input
                          type="text"
                          value={formData.noFlag_Break3}
                          onChange={(e) => setFormData({ ...formData, noFlag_Break3: formatNumericInput(e.target.value) })}
                          disabled={!showEditMode}
                          className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 disabled:bg-gray-100"
                          placeholder="minutes"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>) : (
              <div className="text-center py-10 text-gray-500">
                  You do not have permission to view this list.
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}