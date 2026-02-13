import { useState, useEffect } from 'react';
import { Check, Save, Pencil, X } from 'lucide-react';
import { Footer } from '../../Footer/Footer';
import { decryptData } from '../../../services/encryptionService';


export function SystemConfigurationSetupPage() {
  const [showEditMode, setShowEditMode] = useState(false);
  const checkboxClass = "w-4 h-4 appearance-none border-2 border-gray-400 rounded bg-white checked:bg-blue-600 checked:border-blue-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

  // Helper function to format time input (hh:mm)
  const formatTimeInput = (value: string): string => {
    // Remove all non-numeric characters except colon
    let cleaned = value.replace(/[^\d:]/g, '');
    
    // Remove any colons
    let numbers = cleaned.replace(/:/g, '');
    
    // Limit to 4 digits
    numbers = numbers.slice(0, 4);
    
    // Format as hh:mm
    if (numbers.length >= 3) {
      return numbers.slice(0, 2) + ':' + numbers.slice(2);
    } else if (numbers.length >= 1) {
      return numbers;
    }
    return '';
  };

  // Helper function for numeric-only input
  const formatNumericInput = (value: string): string => {
    // Remove all non-numeric characters
    return value.replace(/[^\d]/g, '');
  };

  const [formData, setFormData] = useState({
    oldOvertimeProcess: false,
    oldNightDifferentialProcess: false,
    oldTardinessProcess: false,
    borrowedDeviceNameOrg: '',
    disableMultipleLogin: false,
    useHHMM: false,
    minBeforeShift: '480',
    minIgnoreMultipleBreak: '2',
    minBeforeMidnightShift: '120',
    retryCount: '1',
    retryInterval: '10',
    minConsiderBreak2: '60',
    devicePolicy: 'Device 11',
    break1Minutes: '',
    break2Minutes: '',
    break3Minutes: ''
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
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showEditMode) {
          setShowEditMode(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showEditMode]);

  const handleSave = () => {
    // Save logic here
    setShowEditMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">System Configuration Setup</h1>
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
                    Configure system-wide settings for time and attendance processing. Define device policies, pairing rules, overtime calculations, and various system behaviors to match your organization's requirements.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Device pairing policies and configurations</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Overtime and tardiness process options</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Break time and shift validation rules</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">System retry and interval settings</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div className="mb-6">
              {!showEditMode && hasPermission("View") && (
                <button 
                  onClick={() => setShowEditMode(true)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
              )}
              {showEditMode && (
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => setShowEditMode(false)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
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

              {/* Device and Login Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="w-64 text-gray-700">Borrowed Device Name Org :</label>
                  <input
                    type="text"
                    value={formData.borrowedDeviceNameOrg}
                    onChange={(e) => setFormData({ ...formData, borrowedDeviceNameOrg: e.target.value })}
                    disabled={!showEditMode}
                    className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-64 text-gray-700">Disable Multiple Login :</label>
                  <input
                    type="checkbox"
                    checked={formData.disableMultipleLogin}
                    onChange={(e) => setFormData({ ...formData, disableMultipleLogin: e.target.checked })}
                    disabled={!showEditMode}
                    className={checkboxClass}
                  />
                </div>

                <div className="flex items-start gap-3">
                  <label className="w-64 text-gray-700">Use HH:MM :</label>
                  <div className="flex-1">
                    <input
                      type="checkbox"
                      checked={formData.useHHMM}
                      onChange={(e) => setFormData({ ...formData, useHHMM: e.target.checked })}
                      disabled={!showEditMode}
                      className={checkboxClass}
                    />
                    <p className="text-sm text-green-600 mt-1 ml-6">To show HH:MM format in processing/processed data</p>
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
                      value={formData.minBeforeShift}
                      onChange={(e) => setFormData({ ...formData, minBeforeShift: formatNumericInput(e.target.value) })}
                      disabled={!showEditMode}
                      className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                    />
                    <p className="text-sm text-green-600 mt-1">Used in Validate Logs in Import {'>'} Update Raw Data</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <label className="w-64 text-gray-700">No. of Min. to Ignore Multiple Break Out/In :</label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.minIgnoreMultipleBreak}
                      onChange={(e) => setFormData({ ...formData, minIgnoreMultipleBreak: formatNumericInput(e.target.value) })}
                      disabled={!showEditMode}
                      className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
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
                      value={formData.minBeforeMidnightShift}
                      onChange={(e) => setFormData({ ...formData, minBeforeMidnightShift: formatNumericInput(e.target.value) })}
                      disabled={!showEditMode}
                      className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
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
                      className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
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
                      className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
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
                      value={formData.minConsiderBreak2}
                      onChange={(e) => setFormData({ ...formData, minConsiderBreak2: formatNumericInput(e.target.value) })}
                      disabled={!showEditMode}
                      className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
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
                      className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                    >
                      <option value="Device 11">Device 11</option>
                      <option value="Device 1">Device 1</option>
                      <option value="Device 2">Device 2</option>
                      <option value="Device 3">Device 3</option>
                      <option value="Device 4">Device 4</option>
                      <option value="Device 5">Device 5</option>
                      <option value="Device 6">Device 6</option>
                      <option value="Device 7">Device 7</option>
                      <option value="Device 8">Device 8</option>
                      <option value="Device 9">Device 9</option>
                      <option value="Device 10">Device 10</option>
                      <option value="Device 12">Device 12</option>
                      <option value="Device 13">Device 13</option>
                      <option value="Device 14">Device 14</option>
                      <option value="Device 15">Device 15</option>
                      <option value="Device 12_v810">Device 12_v810</option>
                    </select>
                    <p className="text-sm text-green-600 mt-1">Leave blank if you want the default pairing of logs.</p>
                  </div>
                </div>
              </div>

              {/* Device Descriptions */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-gray-700 mb-3">Device Policy Descriptions:</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <strong className="text-gray-700">Device 1</strong>
                    <p className="text-gray-600 ml-4">- First in Last Out Regardless of flagging</p>
                  </li>
                  <li>
                    <strong className="text-gray-700">Device 2</strong>
                    <div className="text-gray-600 ml-4">
                      <p>First In = Time In</p>
                      <p>Second In = Break2 In</p>
                      <p>First Out = Break2 Out</p>
                      <p>Second Out = Time Out (if no second out First Out will become Time Out)</p>
                    </div>
                  </li>
                  <li>
                    <strong className="text-gray-700">Device 3</strong>
                    <div className="text-gray-600 ml-4">
                      <p>First Flag for Break1Out = Break1Out</p>
                      <p>Second Flag for Break1Out = Break3Out</p>
                      <p>First flag for Break1In = Break1In</p>
                      <p>Last flag for break1In = Break3In</p>
                    </div>
                  </li>
                  <li>
                    <strong className="text-gray-700">Device 4</strong>
                    <div className="text-gray-600 ml-4">
                      <p>First Flag for BreakIn = Break1In</p>
                      <p>Second Flag for BreakIn = Break2In</p>
                      <p>Third Flag for BreakIn = Break3In</p>
                      <p>First Flag for BreakOut = Break1Out</p>
                      <p>Second Flag for BreakOut = Break2Out</p>
                      <p>Third Flag for BreakOut = Break3Out</p>
                    </div>
                  </li>
                  <li>
                    <strong className="text-gray-700">Device 5</strong>
                    <p className="text-gray-600 ml-4">If there is First Flag of any Break before Any flag of In/Out, Flagging of In/Out will always be Out.</p>
                  </li>
                  <li>
                    <strong className="text-gray-700">Device 6</strong>
                    <p className="text-gray-600 ml-4">From Windows Validation.</p>
                  </li>
                  <li>
                    <strong className="text-gray-700">Device 7</strong>
                    <p className="text-gray-600 ml-4">All Logs that falls on 6:00am Current Date to 5:59am the next day will be paired to Current Date</p>
                  </li>
                  <li>
                    <strong className="text-gray-700">Device 8</strong>
                    <p className="text-gray-600 ml-4">24 Hours Pairing</p>
                  </li>
                  <li>
                    <strong className="text-gray-700">Device 9</strong>
                    <p className="text-gray-600 ml-4">Standard pairing but First Time Out will pair</p>
                  </li>
                  <li>
                    <strong className="text-gray-700">Device 10</strong>
                    <p className="text-gray-600 ml-4">First In of the current day and last out before first in of next day</p>
                  </li>
                  <li>
                    <strong className="text-gray-700">Device 11</strong>
                    <p className="text-gray-600 ml-4">24 Hours Pairing With Workshift Validation</p>
                  </li>
                  <li>
                    <strong className="text-gray-700">Device 12</strong>
                    <p className="text-gray-600 ml-4">24 Hours Pairing Device8 Replica</p>
                  </li>
                  <li>
                    <strong className="text-gray-700">Device 13</strong>
                    <p className="text-gray-600 ml-4">24 Hours Pairing Breaks Flag are the Same</p>
                  </li>
                  <li>
                    <strong className="text-gray-700">Device 14</strong>
                    <p className="text-gray-600 ml-4">Device10 Replica</p>
                  </li>
                  <li>
                    <strong className="text-gray-700">Device 15</strong>
                    <p className="text-gray-600 ml-4">24 Hours Pairing Breaks IN/OUT Flags is same with IN/OUT Flags</p>
                  </li>
                  <li>
                    <strong className="text-gray-700">Device 12_v810</strong>
                    <p className="text-gray-600 ml-4">Device12 of v810</p>
                  </li>
                </ul>
              </div>

              {/* Break Time Policy */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-blue-700 mb-3">Policy for Utility to Update the Time Flag Base on Set Policy of Breaks</h3>
                <p className="text-sm text-gray-700 mb-3">No Flags - Break Hours Policy from Time In</p>
                
                <div className="bg-gray-100 p-3 rounded mb-3">
                  <p className="text-sm text-gray-700 mb-2">No Flags - Break Hours Policy from Time In</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <label className="w-24 text-sm text-gray-700">Break1</label>
                      <input
                        type="text"
                        value={formData.break1Minutes}
                        onChange={(e) => setFormData({ ...formData, break1Minutes: formatTimeInput(e.target.value) })}
                        disabled={!showEditMode}
                        className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                        placeholder="[hh:mm]"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="w-24 text-sm text-gray-700">Break2</label>
                      <input
                        type="text"
                        value={formData.break2Minutes}
                        onChange={(e) => setFormData({ ...formData, break2Minutes: formatTimeInput(e.target.value) })}
                        disabled={!showEditMode}
                        className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                        placeholder="[hh:mm]"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="w-24 text-sm text-gray-700">Break3</label>
                      <input
                        type="text"
                        value={formData.break3Minutes}
                        onChange={(e) => setFormData({ ...formData, break3Minutes: formatTimeInput(e.target.value) })}
                        disabled={!showEditMode}
                        className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                        placeholder="[hh:mm]"
                      />
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

      {/* Footer */}
      <Footer />
    </div>
  );
}