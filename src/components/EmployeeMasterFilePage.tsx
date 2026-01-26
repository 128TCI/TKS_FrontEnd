import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Check, X, ChevronLeft, ChevronRight, Save, XCircle, User, Briefcase } from 'lucide-react';
import { Footer } from './Footer/Footer';
import { InlineDatePicker } from './InlineDatePicker';

type TabType = 'employment' | 'personal';

// Mock employee data for search
const mockEmployees = [
  { empCode: '000877', name: 'Last122, First A', groupCode: '45' },
  { empCode: '000878', name: 'Last, First A', groupCode: '45' },
  { empCode: '000900', name: 'Last, First A', groupCode: '109' },
  { empCode: '000901', name: 'Last, First A', groupCode: '109' },
  { empCode: '000902', name: 'Last, First III A', groupCode: '45' },
  { empCode: '000903', name: 'Last, First A', groupCode: '45' },
  { empCode: '000904', name: 'Last, First A', groupCode: '45' },
  { empCode: '000905', name: 'Last, First A', groupCode: '45' },
  { empCode: '000906', name: 'Last, First A', groupCode: '45' },
  { empCode: '000907', name: 'Last, First A', groupCode: '45' },
];

// Mock employee status data for search
const mockEmpStatuses = [
  { code: 'Contractual', description: 'Contractual' },
  { code: 'PROBATIONARY', description: 'PROBATIONARY' },
  { code: 'PROBEE', description: 'PROBEE' },
  { code: 'Project Based Employee', description: 'Project Based Employee' },
  { code: 'PROJECT BASED', description: 'PROJECT BASED' },
  { code: 'REGULAR', description: 'REGULAR' },
  { code: 'RESIGNED - MWE', description: 'RESIGNED - MWE' },
  { code: 'Reliever', description: 'Reliever' },
  { code: 'Trainee', description: 'Trainee' },
];

export function EmployeeMasterFilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('employment');
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showEmpStatModal, setShowEmpStatModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  
  const [formData, setFormData] = useState({
    empCode: '000878',
    empStatCode: 'REGULAR',
    courtesy: '',
    lastName: 'Last',
    firstName: 'First',
    middleName: 'A',
    suffix: '',
    dateHired: '03/28/2021',
    regularized: '',
    probeStart: '',
    probeEnd: '',
    dateResigned: '',
    suspended: '',
    suspend: false,
    separated: false,
    contractual: false,
    sss: '1233567831',
    pagibig: '12335678901',
    philhealth: '12335678901',
    tin: '113222333',
    gsisNo: '0',
    branch: 'Main',
    division: '_',
    department: '_',
    section: '_',
    unit: '_',
    payHouse: '_',
    area: '_',
    location: '_',
    onlineApplication: '',
    designation: '_',
    jobLevel: '',
    // Personal Information
    homeAddress: 's',
    presentAddress: '',
    city: '',
    province: '',
    postalCode: '',
    mobilePhone: '',
    presentPhone: '',
    homePhone: '',
    civilStatus: '',
    citizenship: '',
    religion: '',
    weight: '0',
    height: '0',
    gender: 'M',
    email: 'perilia.manalok@128techcons',
    birthDate: '10/25/1962',
    age: '63',
    birthPlace: ''
  });

  const handleCreateNew = () => {
    setIsEditing(true);
    setIsCreatingNew(true);
    // Reset form or create new
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    setIsCreatingNew(false);
    // Save changes logic here
    console.log('Saving changes:', formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreatingNew(false);
    // Add cancel/reset logic here
  };

  const handleDelete = () => {
    // Show confirmation modal
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    // Handle actual delete
    console.log('Delete employee confirmed');
    setShowDeleteConfirmModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmModal(false);
  };

  const handleSearch = () => {
    // Handle search
    setShowSearchModal(true);
  };

  // Handle ESC key for Search modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showSearchModal) {
        setShowSearchModal(false);
      }
    };

    if (showSearchModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showSearchModal]);

  // Handle ESC key for Delete Confirmation modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDeleteConfirmModal) {
        setShowDeleteConfirmModal(false);
      }
    };

    if (showDeleteConfirmModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showDeleteConfirmModal]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Employee Master File</h1>
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
                    Manage employee records including personal information, employment details, organizational assignments, and government ID numbers. This master file serves as the central repository for all employee data.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Employment and organizational information</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Personal details and contact information</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Government IDs (SSS, PAG-IBIG, PhilHealth, TIN)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Status tracking and employment history</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-6">
              {!isCreatingNew && !isEditing && (
                <button 
                  onClick={handleCreateNew}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create New
                </button>
              )}
              {!isEditing ? (
                <button 
                  onClick={handleEdit}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              )}
              {!isCreatingNew && !isEditing && (
                <>
                  <button 
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                  <button 
                    onClick={handleSearch}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </button>
                </>
              )}
            </div>

            {/* Employee Info Display */}
            <div className="mb-6 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                {/* Employee Code and Status */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-700 font-bold text-sm mb-2">Emp. Code</label>
                    <input
                      type="text"
                      value={formData.empCode}
                      onChange={(e) => setFormData({...formData, empCode: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 text-blue-700 font-bold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold text-sm mb-2">Emp. Stat Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.empStatCode}
                        onChange={(e) => setFormData({...formData, empStatCode: e.target.value})}
                        disabled={!isEditing}
                        className="flex-1 px-4 py-2 text-blue-700 font-bold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                      />
                      {isEditing && (
                        <button 
                          onClick={() => setShowEmpStatModal(true)}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-700 font-bold text-sm mb-2">Courtesy</label>
                    <select
                      value={formData.courtesy}
                      onChange={(e) => setFormData({...formData, courtesy: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 text-blue-700 font-bold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                    >
                      <option value="" className="text-gray-700 font-bold">Select...</option>
                      <option value="Engr">Engr (Engineer)</option>
                      <option value="Dr">Dr (Doctor)</option>
                      <option value="Mr">Mr (Mister)</option>
                      <option value="Mrs">Mrs (Mrs)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold text-sm mb-2">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 text-blue-700 font-bold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold text-sm mb-2">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 text-blue-700 font-bold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold text-sm mb-2">Middle Name</label>
                    <input
                      type="text"
                      value={formData.middleName}
                      onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 text-blue-700 font-bold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold text-sm mb-2">Suffix</label>
                    <input
                      type="text"
                      value={formData.suffix}
                      onChange={(e) => setFormData({...formData, suffix: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 text-blue-700 font-bold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                    />
                  </div>
                </div>
            </div>
                      </div>

            {/* Tabs */}
            <div className="mb-6 flex items-center gap-1 border-b border-gray-200 flex-wrap">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('employment')}
                  className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                    activeTab === 'employment'
                      ? 'font-medium bg-blue-600 text-white -mb-px'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
                >
                  <Briefcase className="w-4 h-4" />
                  Employment Information
                </button>
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                    activeTab === 'personal'
                      ? 'font-medium bg-blue-600 text-white -mb-px'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
                 >
                  <User className="w-4 h-4" />
                  Personal Information
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'employment' && (
              <div className="space-y-6">
                {/* Position Section */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-gray-900 mb-4">Position</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-gray-700 font-bold text-sm mb-2">Designation</label>
                      <input
                        type="text"
                        value={formData.designation}
                        onChange={(e) => setFormData({...formData, designation: e.target.value})}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold text-sm mb-2">Job Level</label>
                      <input
                        type="text"
                        value={formData.jobLevel}
                        onChange={(e) => setFormData({...formData, jobLevel: e.target.value})}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>

                {/* Employment Dates Section */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-gray-900 mb-4">Employment Dates</h3>
                  <div className="space-y-4">
                    {/* Row 1: Date Hired, Regularized, Contractual checkbox */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="block text-gray-700 font-bold text-sm mb-2">Date Hired</label>
                        <InlineDatePicker
                          date={formData.dateHired}
                          onChange={(date) => setFormData({...formData, dateHired: date})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold text-sm mb-2">Regularized</label>
                        <InlineDatePicker
                          date={formData.regularized}
                          onChange={(date) => setFormData({...formData, regularized: date})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="flex items-center h-[42px]">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.contractual}
                            onChange={(e) => setFormData({...formData, contractual: e.target.checked})}
                            disabled={!isEditing}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">Contractual</span>
                        </label>
                      </div>
                    </div>

                    {/* Row 2: Probe Start, Probe End, Separated checkbox */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="block text-gray-700 font-bold text-sm mb-2">Probe Start</label>
                        <InlineDatePicker
                          date={formData.probeStart}
                          onChange={(date) => setFormData({...formData, probeStart: date})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold text-sm mb-2">Probe End</label>
                        <InlineDatePicker
                          date={formData.probeEnd}
                          onChange={(date) => setFormData({...formData, probeEnd: date})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="flex items-center h-[42px]">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.separated}
                            onChange={(e) => setFormData({...formData, separated: e.target.checked})}
                            disabled={!isEditing}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">Separated</span>
                        </label>
                      </div>
                    </div>

                    {/* Row 3: Date Resigned, Suspended, Suspend checkbox */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="block text-gray-700 font-bold text-sm mb-2">Date Resigned</label>
                        <InlineDatePicker
                          date={formData.dateResigned}
                          onChange={(date) => setFormData({...formData, dateResigned: date})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold text-sm mb-2">Suspended</label>
                        <InlineDatePicker
                          date={formData.suspended}
                          onChange={(date) => setFormData({...formData, suspended: date})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="flex items-center h-[42px]">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.suspend}
                            onChange={(e) => setFormData({...formData, suspend: e.target.checked})}
                            disabled={!isEditing}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">Suspend</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Government IDs Section */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-gray-900 mb-4">Government IDs</h3>
                  <div className="space-y-4">
                    {/* Row 1: SSS, PAG-IBIG, Philhealth */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-700 font-bold text-sm mb-2">SSS</label>
                        <input
                          type="text"
                          value={formData.sss}
                          onChange={(e) => setFormData({...formData, sss: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold text-sm mb-2">PAG-IBIG</label>
                        <input
                          type="text"
                          value={formData.pagibig}
                          onChange={(e) => setFormData({...formData, pagibig: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold text-sm mb-2">Philhealth</label>
                        <input
                          type="text"
                          value={formData.philhealth}
                          onChange={(e) => setFormData({...formData, philhealth: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                      </div>
                    </div>

                    {/* Row 2: TIN, GSIS/No */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-700 font-bold text-sm mb-2">TIN</label>
                        <input
                          type="text"
                          value={formData.tin}
                          onChange={(e) => setFormData({...formData, tin: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold text-sm mb-2">GSIS/No</label>
                        <input
                          type="text"
                          value={formData.gsisNo}
                          onChange={(e) => setFormData({...formData, gsisNo: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organizational Assignment Section */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-gray-900 mb-4">Organizational Assignment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 font-bold text-sm mb-2">Branch</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.branch}
                          onChange={(e) => setFormData({...formData, branch: e.target.value})}
                          disabled={!isEditing}
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                        <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          <Search className="w-4 h-4" />
                        </button>
                        <button className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold text-sm mb-2">Division</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.division}
                          onChange={(e) => setFormData({...formData, division: e.target.value})}
                          disabled={!isEditing}
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                        <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          <Search className="w-4 h-4" />
                        </button>
                        <button className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold text-sm mb-2">Department</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.department}
                          onChange={(e) => setFormData({...formData, department: e.target.value})}
                          disabled={!isEditing}
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                        <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          <Search className="w-4 h-4" />
                        </button>
                        <button className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold text-sm mb-2">Section</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.section}
                          onChange={(e) => setFormData({...formData, section: e.target.value})}
                          disabled={!isEditing}
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                        <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          <Search className="w-4 h-4" />
                        </button>
                                              <button className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold text-sm mb-2">Unit</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.unit}
                          onChange={(e) => setFormData({...formData, unit: e.target.value})}
                          disabled={!isEditing}
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                        <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          <Search className="w-4 h-4" />
                        </button>
                        <button className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold text-sm mb-2">Pay House</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.payHouse}
                          onChange={(e) => setFormData({...formData, payHouse: e.target.value})}
                          disabled={!isEditing}
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                        <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          <Search className="w-4 h-4" />
                        </button>
                        <button className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold text-sm mb-2">Area</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.area}
                          onChange={(e) => setFormData({...formData, area: e.target.value})}
                          disabled={!isEditing}
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                        <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          <Search className="w-4 h-4" />
                        </button>
                        <button className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold text-sm mb-2">Location</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          disabled={!isEditing}
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                        <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          <Search className="w-4 h-4" />
                        </button>
                        <button className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold text-sm mb-2">Online Application</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.onlineApplication}
                          onChange={(e) => setFormData({...formData, onlineApplication: e.target.value})}
                          disabled={!isEditing}
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        />
                        <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          <Search className="w-4 h-4" />
                        </button>
                        <button className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Address & Contact Information */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Address Section */}
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="text-gray-900 mb-4">Address Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Home Address</label>
                          <textarea
                            value={formData.homeAddress}
                            onChange={(e) => setFormData({...formData, homeAddress: e.target.value})}
                            disabled={!isEditing}
                            rows={3}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Present Address</label>
                          <textarea
                            value={formData.presentAddress}
                            onChange={(e) => setFormData({...formData, presentAddress: e.target.value})}
                            disabled={!isEditing}
                            rows={3}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 resize-none"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-gray-700 font-bold text-sm mb-2">City</label>
                            <input
                              type="text"
                              value={formData.city}
                              onChange={(e) => setFormData({...formData, city: e.target.value})}
                              disabled={!isEditing}
                              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-bold text-sm mb-2">Province</label>
                            <input
                              type="text"
                              value={formData.province}
                              onChange={(e) => setFormData({...formData, province: e.target.value})}
                              disabled={!isEditing}
                              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-bold text-sm mb-2">Postal Code</label>
                            <input
                              type="text"
                              value={formData.postalCode}
                              onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                              disabled={!isEditing}
                              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="text-gray-900 mb-4">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Mobile Phone</label>
                          <input
                            type="text"
                            value={formData.mobilePhone}
                            onChange={(e) => setFormData({...formData, mobilePhone: e.target.value})}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Present Phone</label>
                          <input
                            type="text"
                            value={formData.presentPhone}
                            onChange={(e) => setFormData({...formData, presentPhone: e.target.value})}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Home Phone</label>
                          <input
                            type="text"
                            value={formData.homePhone}
                            onChange={(e) => setFormData({...formData, homePhone: e.target.value})}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Personal Details & Birth Information - Merged */}
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="text-gray-900 mb-4">Personal Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Civil Status</label>
                          <input
                            type="text"
                            value={formData.civilStatus}
                            onChange={(e) => setFormData({...formData, civilStatus: e.target.value})}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Citizenship</label>
                          <input
                            type="text"
                            value={formData.citizenship}
                            onChange={(e) => setFormData({...formData, citizenship: e.target.value})}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Religion</label>
                          <input
                            type="text"
                            value={formData.religion}
                            onChange={(e) => setFormData({...formData, religion: e.target.value})}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-700 font-bold text-sm mb-2">Weight</label>
                            <input
                              type="text"
                              value={formData.weight}
                              onChange={(e) => setFormData({...formData, weight: e.target.value})}
                              disabled={!isEditing}
                              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-bold text-sm mb-2">Height</label>
                            <input
                              type="text"
                              value={formData.height}
                              onChange={(e) => setFormData({...formData, height: e.target.value})}
                              disabled={!isEditing}
                              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Gender</label>
                          <input
                            type="text"
                            value={formData.gender}
                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Email</label>
                          <input
                            type="text"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Birth Date</label>
                          <InlineDatePicker
                            date={formData.birthDate}
                            onChange={(date) => setFormData({...formData, birthDate: date})}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Age</label>
                          <input
                            type="text"
                            value={formData.age}
                            onChange={(e) => setFormData({...formData, age: e.target.value})}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold text-sm mb-2">Birth Place</label>
                          <input
                            type="text"
                            value={formData.birthPlace}
                            onChange={(e) => setFormData({...formData, birthPlace: e.target.value})}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Photo */}
                  <div className="space-y-6">
                    {/* Photo Section */}
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="text-gray-900 mb-4">Photo</h3>
                      <div className="flex items-center justify-center w-full h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg border-2 border-dashed border-blue-300">
                        <svg className="w-32 h-32 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden pointer-events-auto">
            {/* Modal Header */}
            <div className="bg-gray-200 px-4 py-3 flex items-center justify-between border-b border-gray-300">
              <h2 className="text-gray-800">Search</h2>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[calc(85vh-60px)] overflow-y-auto">
              {/* Section Title */}
              <h3 className="text-blue-600 mb-4">Employee Code</h3>

              {/* Search Input */}
              <div className="flex items-center gap-2 mb-4">
                <label className="text-gray-700">Search:</label>
                <input
                  type="text"
                  placeholder=""
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Table */}
              <div className="border border-gray-300 rounded overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-gray-200">
                        <div className="flex items-center gap-1">
                          EmpCode
                          <span className="text-blue-600">▲</span>
                        </div>
                      </th>
                      <th className="px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-gray-200">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-gray-200">
                        Group Code
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockEmployees.map((employee, index) => (
                      <tr
                        key={employee.empCode}
                        className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                        onClick={() => {
                          // Load employee data
                          setShowSearchModal(false);
                        }}
                      >
                        <td className="px-4 py-2 text-gray-800">{employee.empCode}</td>
                        <td className="px-4 py-2 text-gray-800">{employee.name}</td>
                        <td className="px-4 py-2 text-gray-800">{employee.groupCode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 text-sm text-gray-700">
                <div>Showing 1 to 10 of 1,658 entries</div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
                    Previous
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white border border-blue-600 rounded">
                    1
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
                    2
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
                    3
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
                    4
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
                    5
                  </button>
                  <span className="px-2">...</span>
                  <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
                    166
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emp Stat Code Search Modal */}
      {showEmpStatModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden pointer-events-auto">
            {/* Modal Header */}
            <div className="bg-gray-200 px-4 py-3 flex items-center justify-between border-b border-gray-300">
              <h2 className="text-gray-800">Search</h2>
              <button
                onClick={() => setShowEmpStatModal(false)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[calc(85vh-60px)] overflow-y-auto">
              {/* Section Title */}
              <h3 className="text-blue-600 mb-4">Emp Stat Code</h3>

              {/* Search Input */}
              <div className="flex items-center gap-2 mb-4">
                <label className="text-gray-700">Search:</label>
                <input
                  type="text"
                  placeholder=""
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Table */}
              <div className="border border-gray-300 rounded overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-gray-200">
                        <div className="flex items-center gap-1">
                          Code
                          <span className="text-blue-600">▲</span>
                        </div>
                      </th>
                      <th className="px-4 py-2 text-left text-gray-700 cursor-pointer hover:bg-gray-200">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockEmpStatuses.map((status, index) => (
                      <tr
                        key={status.code}
                        className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                        onClick={() => {
                          setFormData({...formData, empStatCode: status.code});
                          setShowEmpStatModal(false);
                        }}
                      >
                        <td className="px-4 py-2 text-gray-800">{status.code}</td>
                        <td className="px-4 py-2 text-gray-800">{status.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 text-sm text-gray-700">
                <div>Showing 1 to 9 of 9 entries</div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
                    Previous
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white border border-blue-600 rounded">
                    1
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            {/* Modal Header */}
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
              <h2 className="text-gray-800">localhost:54096 says</h2>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-gray-800 mb-6">Are you sure you want to delete?</p>
              
              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleConfirmDelete}
                  className="px-8 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm"
                >
                  OK
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 50px) scale(1.05);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}