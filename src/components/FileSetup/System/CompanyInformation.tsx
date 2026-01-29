import { Upload, X, Pencil, Save, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Footer } from '../../Footer/Footer';
import apiClient from '../../../services/apiClient';
import Swal from 'sweetalert2';

interface CompanyInformationProps {
  onBack?: () => void;
}

interface CompanyData {
  companyID: number;
  companyCode: string;
  companyName: string;
  companyLogo: string | null;
  address: string;
  city: string;
  province: string;
  zipCode: string;
  telNo: string;
  email: string;
  sssNo: string;
  philHealthNo: string;
  pag_Ibig: string;
  tin: string;
  biR_BRNCode: string;
  busFr: string;
  busTo: string;
  timeInTimeOutScreen: string | null;
  militaryTime: boolean | null;
  decPlaces: number | null;
  webLogo: string | null;
  webLogoType: string | null;
  webLogoReports: string | null;
  webLogoReportsType: string | null;
  line1: string | null;
  line2: string | null;
  head: string | null;
  chartAcct: string | null;
  payrollPath: string;
  hrisPath: string;
  otPremiumFlag: boolean;
  terminalID: boolean;
  validateLogs: boolean;
  readOnlyTxtDate: boolean;
  policy: string;
  flag: boolean;
  gsisNo: string;
  exportEmail: boolean;
  siteLogo: string | null;
  siteContent: string | null;
  passwordHistory: boolean;
  tksPhotoPath: string;
  exportLateFilingDateFlag: boolean;
  enableAutoPairingLogsFlag: boolean;
  enableAppOTRawDataFlag: boolean;
  enable2ndShiftRawDataFlag: boolean;
}

export function CompanyInformation({ onBack }: CompanyInformationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [formData, setFormData] = useState<CompanyData | null>(null);

  // Fetch company information on component mount
  useEffect(() => {
    fetchCompanyInformation();
  }, []);

  const fetchCompanyInformation = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/Fs/System/CompanyInformation');
      
      if (response.status === 200 && response.data) {
        // Assuming the API returns an array and we want the first item
        const data = Array.isArray(response.data) ? response.data[0] : response.data;
        setCompanyData(data);
        setFormData(data);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load company information';
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
      });
      console.error('Error fetching company information:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData) return;

    try {
      setLoading(true);

      const response = await apiClient.put('/Fs/System/CompanyInformation', formData);

      if (response.status === 200) {
        const updatedData = response.data;
        setCompanyData(updatedData);
        setFormData(updatedData);
        setIsEditing(false);
        
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Company information updated successfully!',
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
      console.error('Error updating company information:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(companyData);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof CompanyData, value: any) => {
    if (formData) {
      setFormData({
        ...formData,
        [field]: value
      });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
  };

  if (loading && !formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading company information...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Company Information</h1>
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
                    Configure essential company details including identification numbers, addresses, contact information, database paths, and system policies. Upload company and site logos to customize the application appearance.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Company registration details</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Government ID numbers</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Database path configuration</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Logo and branding management</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6 p-6 pt-0">
              {/* Left Sidebar - Logo Upload */}
              <div className="col-span-3">
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="aspect-square bg-white border-2 border-dashed border-gray-300 rounded-lg mb-4 flex items-center justify-center">
                    {formData?.companyLogo ? (
                      <img src={formData.companyLogo} alt="Company Logo" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="text-gray-400">Company Logo</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block">
                      <input type="file" className="hidden" disabled={!isEditing} />
                      <span className={`block w-full px-4 py-2 bg-gray-200 text-gray-700 text-center rounded transition-colors ${isEditing ? 'cursor-pointer hover:bg-gray-300' : 'cursor-not-allowed opacity-50'}`}>
                        Choose File
                      </span>
                    </label>
                    <div className="flex gap-2">
                      <button 
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!isEditing}
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </button>
                      <button 
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!isEditing}
                      >
                        <X className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="col-span-9 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-gray-700">Code</label>
                      <div className="flex gap-2">
                        <button 
                          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm ${
                            isEditing 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : 'bg-gray-600 text-white hover:bg-gray-700'
                          }`} 
                          onClick={isEditing ? handleSave : handleEdit}
                          disabled={loading}
                        >
                          {isEditing ? (
                            <>
                              <Save className="w-4 h-4" />
                              Save
                            </>
                          ) : (
                            <>
                              <Pencil className="w-4 h-4" />
                              Edit
                            </>
                          )}
                        </button>
                        {isEditing && (
                          <button 
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm" 
                            onClick={handleCancel}
                            disabled={loading}
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      type="text"
                      value={formData?.companyCode || ''}
                      onChange={(e) => handleInputChange('companyCode', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData?.companyName || ''}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={formData?.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={formData?.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Province</label>
                    <input
                      type="text"
                      value={formData?.province || ''}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={formData?.zipCode || ''}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly={!isEditing}
                    />
                  </div>
                </div>

                {/* Two Column Section */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-2">SSS No.</label>
                      <input
                        type="text"
                        value={formData?.sssNo || ''}
                        onChange={(e) => handleInputChange('sssNo', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly={!isEditing}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Philhealth No</label>
                      <input
                        type="text"
                        value={formData?.philHealthNo || ''}
                        onChange={(e) => handleInputChange('philHealthNo', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly={!isEditing}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Pagibig No :</label>
                      <input
                        type="text"
                        value={formData?.pag_Ibig || ''}
                        onChange={(e) => handleInputChange('pag_Ibig', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly={!isEditing}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Tin No :</label>
                      <input
                        type="text"
                        value={formData?.tin || ''}
                        onChange={(e) => handleInputChange('tin', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly={!isEditing}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Branch Code (BIR) :</label>
                      <input
                        type="text"
                        value={formData?.biR_BRNCode || ''}
                        onChange={(e) => handleInputChange('biR_BRNCode', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly={!isEditing}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">GSIS No.</label>
                      <input
                        type="text"
                        value={formData?.gsisNo || ''}
                        onChange={(e) => handleInputChange('gsisNo', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly={!isEditing}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Business Cycle From</label>
                      <input
                        type="text"
                        value={formData?.busFr ? formatDate(formData.busFr) : ''}
                        onChange={(e) => handleInputChange('busFr', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly={!isEditing}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Business Cycle To</label>
                      <input
                        type="text"
                        value={formData?.busTo ? formatDate(formData.busTo) : ''}
                        onChange={(e) => handleInputChange('busTo', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Telephone</label>
                      <input
                        type="text"
                        value={formData?.telNo || ''}
                        onChange={(e) => handleInputChange('telNo', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly={!isEditing}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData?.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly={!isEditing}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Hrs Database Path:</label>
                      <input
                        type="text"
                        value={formData?.hrisPath || ''}
                        onChange={(e) => handleInputChange('hrisPath', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly={!isEditing}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Payroll Database Path:</label>
                      <input
                        type="text"
                        value={formData?.payrollPath || ''}
                        onChange={(e) => handleInputChange('payrollPath', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly={!isEditing}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">TKS Photo Path:</label>
                      <input
                        type="text"
                        value={formData?.tksPhotoPath || ''}
                        onChange={(e) => handleInputChange('tksPhotoPath', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={formData?.otPremiumFlag || false}
                          onChange={(e) => handleInputChange('otPremiumFlag', e.target.checked)}
                          disabled={!isEditing}
                        />
                        <span className="text-gray-700">Use OT Premium Breakdown</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={formData?.terminalID || false}
                          onChange={(e) => handleInputChange('terminalID', e.target.checked)}
                          disabled={!isEditing}
                        />
                        <span className="text-gray-700">With Terminal</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={formData?.validateLogs || false}
                          onChange={(e) => handleInputChange('validateLogs', e.target.checked)}
                          disabled={!isEditing}
                        />
                        <span className="text-gray-700">Logs Validate</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={formData?.readOnlyTxtDate || false}
                          onChange={(e) => handleInputChange('readOnlyTxtDate', e.target.checked)}
                          disabled={!isEditing}
                        />
                        <span className="text-gray-700">Read Only Textbox Date</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={formData?.exportEmail || false}
                          onChange={(e) => handleInputChange('exportEmail', e.target.checked)}
                          disabled={!isEditing}
                        />
                        <span className="text-gray-700">Export with Sending Email</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={formData?.exportLateFilingDateFlag || false}
                          onChange={(e) => handleInputChange('exportLateFilingDateFlag', e.target.checked)}
                          disabled={!isEditing}
                        />
                        <span className="text-gray-700">Export Late Filing Date</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={formData?.enableAutoPairingLogsFlag || false}
                          onChange={(e) => handleInputChange('enableAutoPairingLogsFlag', e.target.checked)}
                          disabled={!isEditing}
                        />
                        <span className="text-gray-700">Enable Auto Pairing Logs</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={formData?.enableAppOTRawDataFlag || false}
                          onChange={(e) => handleInputChange('enableAppOTRawDataFlag', e.target.checked)}
                          disabled={!isEditing}
                        />
                        <span className="text-gray-700">Enable Approved OT</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={formData?.enable2ndShiftRawDataFlag || false}
                          onChange={(e) => handleInputChange('enable2ndShiftRawDataFlag', e.target.checked)}
                          disabled={!isEditing}
                        />
                        <span className="text-gray-700">Enable 2nd Shift in Raw Data</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Company Config and License Policy Section */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Company Config */}
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                    <h3 className="text-gray-800 mb-4">Company Config</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-gray-700">Number of Attempts</label>
                        <input
                          type="text"
                          defaultValue="5"
                          className="w-40 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly={!isEditing}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-gray-700">Policy</label>
                        <input
                          type="text"
                          value={formData?.policy || ''}
                          onChange={(e) => handleInputChange('policy', e.target.value)}
                          className="w-40 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly={!isEditing}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-gray-700">Password Age</label>
                        <input
                          type="text"
                          defaultValue="5"
                          className="w-40 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly={!isEditing}
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={formData?.passwordHistory || false}
                          onChange={(e) => handleInputChange('passwordHistory', e.target.checked)}
                          disabled={!isEditing}
                        />
                        <span className="text-gray-700">Enforce Password History</span>
                      </label>
                    </div>
                  </div>

                  {/* License Policy */}
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                    <h3 className="text-gray-800 mb-4">License Policy</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-gray-700">Server Name:</label>
                        <input
                          type="text"
                          defaultValue="128PC-65\SQL2022"
                          className="w-40 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly={!isEditing}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-gray-700">Max No Companies:</label>
                        <input
                          type="text"
                          defaultValue="Unlimited"
                          className="w-40 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly={!isEditing}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-gray-700">Max No Employees:</label>
                        <input
                          type="text"
                          defaultValue="Unlimited"
                          className="w-40 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly={!isEditing}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-gray-700">Registered Database:</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            defaultValue="TIMEKEEP128"
                            className="w-32 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            readOnly={!isEditing}
                          />
                          <button className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded transition-colors" disabled={!isEditing}>▶</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Site Logo and Content */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Site Logo :</label>
                    <div className="flex gap-2 mb-2">
                      <label className="flex-1">
                        <input type="file" className="hidden" disabled={!isEditing} />
                        <span className={`block w-full px-4 py-2 bg-gray-200 text-gray-700 text-center rounded transition-colors ${isEditing ? 'cursor-pointer hover:bg-gray-300' : 'cursor-not-allowed opacity-50'}`}>
                          Choose File
                        </span>
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!isEditing}
                      >
                        Upload
                      </button>
                      <button 
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!isEditing}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Site Content :</label>
                    <div className="flex gap-2 mb-2">
                      <label className="flex-1">
                        <input type="file" className="hidden" disabled={!isEditing} />
                        <span className={`block w-full px-4 py-2 bg-gray-200 text-gray-700 text-center rounded transition-colors ${isEditing ? 'cursor-pointer hover:bg-gray-300' : 'cursor-not-allowed opacity-50'}`}>
                          Choose File
                        </span>
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!isEditing}
                      >
                        Upload
                      </button>
                      <button 
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!isEditing}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
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