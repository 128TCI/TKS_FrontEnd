import { useState, useEffect } from 'react';
import { X, Plus, Check, ArrowLeft, Search, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../Footer/Footer';

export function EmployeeDesignationSetupPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJobLevelSearchModal, setShowJobLevelSearchModal] = useState(false);
  const [showDeviceNameSearchModal, setShowDeviceNameSearchModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobLevelSearchTerm, setJobLevelSearchTerm] = useState('');
  const [deviceNameSearchTerm, setDeviceNameSearchTerm] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDesignationIndex, setSelectedDesignationIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  
  // Form fields
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [jobLevelCode, setJobLevelCode] = useState('');
  const [deviceName, setDeviceName] = useState('');
  
  // Sample data for Job Level Code
  const [jobLevelList] = useState([
    { code: 'ASSOCSTAFF', description: 'Associate Staff' },
    { code: 'DIRECTOR', description: 'Director' },
    { code: 'EXECUTIVE', description: 'Executive' },
    { code: 'INTERSTAFF', description: 'Intermediate Staff' },
    { code: 'MANAGER', description: 'Manager' },
    { code: 'ProjB', description: 'Installer' },
    { code: 'SRDIR', description: 'Senior Director' },
    { code: 'SREXEC', description: 'Senior Executive' },
    { code: 'SRMNGR', description: 'Senior Manager' },
    { code: 'SRSTAFF', description: 'Senior Staff' },
  ]);

  // Sample data for the designation list
  const [designationList, setDesignationList] = useState([
    { code: 'AA/RA', description: 'Accounting Analyst/Relief Assistant', jobLevelCode: '', deviceName: '' },
    { code: 'ACC/ADMSTF', description: 'Accounting/Admin Staff', jobLevelCode: '', deviceName: '' },
    { code: 'ACCLERK', description: 'Accounting Clerk', jobLevelCode: '', deviceName: '' },
    { code: 'ACCLERK-R', description: 'ACCOUNTING CLERK-RELIEVER', jobLevelCode: '', deviceName: '' },
    { code: 'ACCLRK-RLV', description: 'Accounting Clerk- Reliever', jobLevelCode: '', deviceName: '' },
    { code: 'ACCT', description: 'ACCOUNTANT', jobLevelCode: '', deviceName: '' },
    { code: 'ACHFTW', description: 'Actual Measurer, In-house Tinsmith & Welder', jobLevelCode: '', deviceName: '' },
    { code: 'ACLRK/COOR', description: 'Accounting Clerk/Coordinator', jobLevelCode: '', deviceName: '' },
    { code: 'ADM', description: 'Admin Assistant', jobLevelCode: '', deviceName: '' },
    { code: 'ADMCOOR', description: 'Building Administrative Coordinator', jobLevelCode: '', deviceName: '' },
    { code: 'ADMINCLRK', description: 'Office Administrative Clerk', jobLevelCode: '', deviceName: '' },
    { code: 'AELECTRIC', description: 'Auto/Building Electrician', jobLevelCode: '', deviceName: '' },
    { code: 'AM', description: 'Actual Measurer', jobLevelCode: '', deviceName: '' },
    { code: 'AM/SR', description: 'Actual Measurer/Service Repairman', jobLevelCode: '', deviceName: '' },
    { code: 'AMGR', description: 'Audit Manager', jobLevelCode: '', deviceName: '' },
    { code: 'AMKO', description: 'Assistant Marketing Operations Manager', jobLevelCode: '', deviceName: '' },
    { code: 'ASST-WHM', description: 'Assistant Warehouseman', jobLevelCode: '', deviceName: '' },
    { code: 'AUTOCAD', description: 'Autocad Operator', jobLevelCode: '', deviceName: '' },
    { code: 'AVP', description: 'AVP Marketing Operations', jobLevelCode: '', deviceName: '' },
    { code: 'BA', description: 'Branch Accountant', jobLevelCode: '', deviceName: '' },
    { code: 'BA-TR', description: 'Branch Accountant-Trainee', jobLevelCode: '', deviceName: '' },
    { code: 'BAPROG', description: 'BUSINESS APPLICATION PROG.', jobLevelCode: '', deviceName: '' },
    { code: 'BENDER', description: 'BENDER', jobLevelCode: '', deviceName: '' },
    { code: 'BENDMAOP', description: 'Bending Machine Operator', jobLevelCode: '', deviceName: '' },
    { code: 'BILLER', description: 'Biller', jobLevelCode: '', deviceName: '' },
  ]);

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showJobLevelSearchModal) {
          setShowJobLevelSearchModal(false);
        } else if (showDeviceNameSearchModal) {
          setShowDeviceNameSearchModal(false);
        } else if (showCreateModal) {
          setShowCreateModal(false);
        }
      }
    };

    if (showCreateModal || showJobLevelSearchModal || showDeviceNameSearchModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showCreateModal, showJobLevelSearchModal, showDeviceNameSearchModal]);

  const handleCreateNew = () => {
    setIsEditMode(false);
    setSelectedDesignationIndex(null);
    // Clear form
    setCode('');
    setDescription('');
    setJobLevelCode('');
    setDeviceName('');
    setShowCreateModal(true);
  };

  const handleEdit = (designation: any, index: number) => {
    setIsEditMode(true);
    setSelectedDesignationIndex(index);
    setCode(designation.code);
    setDescription(designation.description);
    setJobLevelCode(designation.jobLevelCode);
    setDeviceName(designation.deviceName);
    setShowCreateModal(true);
  };

  const handleDelete = (designationCode: string) => {
    if (window.confirm('Are you sure you want to delete this designation?')) {
      setDesignationList(designationList.filter(designation => designation.code !== designationCode));
    }
  };

  const handleSubmit = () => {
    // Validate code
    if (!code.trim()) {
      alert('Please enter a Code.');
      return;
    }

    if (isEditMode && selectedDesignationIndex !== null) {
      // Update existing record
      const updatedList = [...designationList];
      updatedList[selectedDesignationIndex] = {
        code: code,
        description: description,
        jobLevelCode: jobLevelCode,
        deviceName: deviceName
      };
      setDesignationList(updatedList);
    } else {
      // Create new record
      const newDesignation = {
        code: code,
        description: description,
        jobLevelCode: jobLevelCode,
        deviceName: deviceName
      };
      setDesignationList([...designationList, newDesignation]);
    }

    // Close modal and reset form
    setShowCreateModal(false);
    setCode('');
    setDescription('');
    setJobLevelCode('');
    setDeviceName('');
    setIsEditMode(false);
    setSelectedDesignationIndex(null);
  };

  const handleSelectJobLevel = (jobLevel: any) => {
    setJobLevelCode(jobLevel.code);
    setShowJobLevelSearchModal(false);
  };

  const filteredDesignations = designationList.filter(designation =>
    designation.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    designation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    designation.jobLevelCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    designation.deviceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredJobLevels = jobLevelList.filter(jobLevel =>
    jobLevel.code.toLowerCase().includes(jobLevelSearchTerm.toLowerCase()) ||
    jobLevel.description.toLowerCase().includes(jobLevelSearchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredDesignations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDesignations = filteredDesignations.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Designation Setup</h1>
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
                    Configure employee designation codes and descriptions for job positions, linking them to job level classifications and device assignments for comprehensive employee role management.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Designation code management</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Job level code assignment</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Position description tracking</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Device name configuration</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-4 mb-6">
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                onClick={handleCreateNew}
              >
                <Plus className="w-4 h-4" />
                Create New
              </button>
              <div className="ml-auto flex items-center gap-2">
                <label className="text-gray-700">Search:</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-4 py-2 text-left text-gray-700">Code ▲</th>
                    <th className="px-4 py-2 text-left text-gray-700">Description</th>
                    <th className="px-4 py-2 text-left text-gray-700">Job Level Code</th>
                    <th className="px-4 py-2 text-left text-gray-700">Device Name</th>
                    <th className="px-4 py-2 text-left text-gray-700 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDesignations.map((designation, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">{designation.code}</td>
                      <td className="px-4 py-2">{designation.description}</td>
                      <td className="px-4 py-2">{designation.jobLevelCode}</td>
                      <td className="px-4 py-2">{designation.deviceName}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(designation, index)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleDelete(designation.code)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredDesignations.length)} of {filteredDesignations.length} entries
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Previous
                </button>
                {renderPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={index} className="px-3 py-1">...</span>
                  ) : (
                    <button
                      key={index}
                      onClick={() => handlePageChange(page as number)}
                      className={`px-3 py-1 rounded ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Create/Edit Modal */}
              {showCreateModal && (
                <>
                {/* Modal Dialog */}
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                      <h2 className="text-gray-800">{isEditMode ? 'Edit Designation' : 'Create New'}</h2>
                      <button 
                        onClick={() => setShowCreateModal(false)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-4">
                      <h3 className="text-blue-600 mb-3">Designation Setup</h3>

                      {/* Form Fields */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <label className="w-36 text-gray-700 text-sm">Code :</label>
                          <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="w-36 text-gray-700 text-sm">Description :</label>
                          <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="w-36 text-gray-700 text-sm">Job Level Code :</label>
                          <input
                            type="text"
                            value={jobLevelCode}
                            onChange={(e) => setJobLevelCode(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            readOnly
                          />
                          <button
                            onClick={() => setShowJobLevelSearchModal(true)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setJobLevelCode('')}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="w-36 text-gray-700 text-sm">Device Name :</label>
                          <input
                            type="text"
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            readOnly
                          />
                          <button
                            onClick={() => setShowDeviceNameSearchModal(true)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeviceName('')}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Modal Actions */}
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={handleSubmit}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
                        >
                          {isEditMode ? 'Update' : 'Submit'}
                        </button>
                        <button
                          onClick={() => setShowCreateModal(false)}
                          className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
                        >
                          Back to List
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Job Level Search Modal */}
            {showJobLevelSearchModal && (
              <>
                {/* Modal Backdrop */}
                <div 
                  className="fixed inset-0 bg-black/30 z-30"
                  onClick={() => setShowJobLevelSearchModal(false)}
                ></div>

                {/* Modal Dialog */}
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[110vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                      <h2 className="text-gray-800">Search</h2>
                      <button 
                        onClick={() => setShowJobLevelSearchModal(false)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-4 flex-1 overflow-y-auto">
                      <h3 className="text-blue-600 mb-3">Job Level Code</h3>

                      {/* Search Field */}
                      <div className="flex items-center gap-2 mb-4">
                        <label className="text-gray-700 text-sm">Search:</label>
                        <input
                          type="text"
                          value={jobLevelSearchTerm}
                          onChange={(e) => setJobLevelSearchTerm(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      {/* Job Level Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100 border-b-2 border-gray-300">
                              <th className="px-4 py-2 text-left text-gray-700 text-sm">Code ▲</th>
                              <th className="px-4 py-2 text-left text-gray-700 text-sm">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredJobLevels.map((jobLevel, index) => (
                              <tr
                                key={index}
                                onClick={() => handleSelectJobLevel(jobLevel)}
                                className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                              >
                                <td className="px-4 py-2 text-sm">{jobLevel.code}</td>
                                <td className="px-4 py-2 text-sm">{jobLevel.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Info */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-gray-600 text-sm">
                          Showing 1 to {filteredJobLevels.length} of {filteredJobLevels.length} entries
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-sm">
                            Previous
                          </button>
                          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                            1
                          </button>
                          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-sm">
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Device Name Search Modal (placeholder - similar to Job Level) */}
            {showDeviceNameSearchModal && (
              <>
                {/* Modal Backdrop */}
                <div 
                  className="fixed inset-0 bg-black/30 z-30"
                  onClick={() => setShowDeviceNameSearchModal(false)}
                ></div>

                {/* Modal Dialog */}
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[110vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                      <h2 className="text-gray-800">Search</h2>
                      <button 
                        onClick={() => setShowDeviceNameSearchModal(false)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-4">
                      <h3 className="text-blue-600 mb-3">Device Name</h3>

                      {/* Search Field */}
                      <div className="flex items-center gap-2 mb-4">
                        <label className="text-gray-700 text-sm">Search:</label>
                        <input
                          type="text"
                          value={deviceNameSearchTerm}
                          onChange={(e) => setDeviceNameSearchTerm(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <p className="text-gray-500 text-sm text-center py-8">No device names available</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}