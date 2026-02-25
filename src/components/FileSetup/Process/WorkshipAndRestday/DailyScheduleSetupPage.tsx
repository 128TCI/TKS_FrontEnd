import { useState, useEffect } from 'react';
import { X, Plus, Check, Search as SearchIcon, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';

interface DailySchedule {
  referenceCode: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

interface WorkshiftCode {
  code: string;
  description: string;
}

export function DailyScheduleSetupPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchModalField, setSearchModalField] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [workshiftSearchQuery, setWorkshiftSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [workshiftCurrentPage, setWorkshiftCurrentPage] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCode, setEditingCode] = useState('');

  const [formData, setFormData] = useState({
    referenceCode: '',
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: ''
  });

  // Sample data - Daily Schedule records
  const [dailyScheduleData, setDailyScheduleData] = useState<DailySchedule[]>([
    { referenceCode: '8AM7PM', monday: '6PM3AM', tuesday: '8AM7PM', wednesday: '8AM7PM', thursday: '8AM7PM', friday: '8AM5PM', saturday: '8AM5PM', sunday: '8AM5PM' },
    { referenceCode: 'test', monday: '6PM3AM', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: '' }
  ]);

  // Sample Workshift Code data
  const [workshiftCodeData] = useState<WorkshiftCode[]>([
    { code: '3PM12AM', description: '3PM TO 12AM' },
    { code: '6AM3PM', description: '6AM3PM' },
    { code: '6PM3AM', description: '6PM3AM' },
    { code: '724AM6PM', description: '7:24AM TO 6PM' },
    { code: '7AM4PM', description: '7AM to 4PM' },
    { code: '7AM530PM', description: '7AM TO 530PM' },
    { code: '7AM535PM', description: '7AM TO 535PM' },
    { code: '7AM5PM', description: '7AM to 5PM' },
    { code: '7AM6PM', description: '7AM to 6PM' },
    { code: '8AM5PM', description: '8AM to 5PM' },
    { code: '8AM7PM', description: '8AM to 7PM' },
    { code: '9AM6PM', description: '9AM to 6PM' }
  ]);

  const filteredData = dailyScheduleData.filter(item => 
    item.referenceCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWorkshiftData = workshiftCodeData.filter(item =>
    item.code.toLowerCase().includes(workshiftSearchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(workshiftSearchQuery.toLowerCase())
  );

  // Pagination for main table
  const itemsPerPage = 25;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Pagination for workshift search modal
  const workshiftItemsPerPage = 10;
  const workshiftTotalPages = Math.ceil(filteredWorkshiftData.length / workshiftItemsPerPage);
  const workshiftStartIndex = (workshiftCurrentPage - 1) * workshiftItemsPerPage;
  const workshiftEndIndex = workshiftStartIndex + workshiftItemsPerPage;
  const workshiftCurrentData = filteredWorkshiftData.slice(workshiftStartIndex, workshiftEndIndex);

  const handleCreateNew = () => {
    setFormData({
      referenceCode: '',
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    });
    setIsEditMode(false);
    setShowCreateModal(true);
  };

  const handleEdit = (item: DailySchedule) => {
    setFormData({
      referenceCode: item.referenceCode,
      monday: item.monday,
      tuesday: item.tuesday,
      wednesday: item.wednesday,
      thursday: item.thursday,
      friday: item.friday,
      saturday: item.saturday,
      sunday: item.sunday
    });
    setEditingCode(item.referenceCode);
    setIsEditMode(true);
    setShowCreateModal(true);
  };

  const handleOpenSearch = (field: string) => {
    setSearchModalField(field);
    setWorkshiftSearchQuery('');
    setWorkshiftCurrentPage(1);
    setShowSearchModal(true);
  };

  const handleSelectWorkshift = (code: string) => {
    setFormData({
      ...formData,
      [searchModalField]: code
    });
    setShowSearchModal(false);
  };

  const handleClearField = (field: string) => {
    setFormData({
      ...formData,
      [field]: ''
    });
  };

  const handleDelete = (referenceCode: string) => {
      if (confirm('Are you sure you want to delete this entry?')) {
          setDailyScheduleData(prevData => prevData.filter(item => item.referenceCode !== referenceCode));
      }
  };

  const handleSubmit = () => {
    // Validate reference code
    if (!formData.referenceCode.trim()) {
      alert('Please enter a Reference Code.');
      return;
    }

    if (isEditMode) {
      // Update existing record
      setDailyScheduleData(prevData => 
        prevData.map(item => 
          item.referenceCode === editingCode 
            ? {
                referenceCode: formData.referenceCode,
                monday: formData.monday,
                tuesday: formData.tuesday,
                wednesday: formData.wednesday,
                thursday: formData.thursday,
                friday: formData.friday,
                saturday: formData.saturday,
                sunday: formData.sunday
              }
            : item
        )
      );
    } else {
      // Check if code already exists
      if (dailyScheduleData.some(item => item.referenceCode === formData.referenceCode)) {
        alert('A Daily Schedule with this Reference Code already exists.');
        return;
      }

      // Add new record
      const newRecord: DailySchedule = {
        referenceCode: formData.referenceCode,
        monday: formData.monday,
        tuesday: formData.tuesday,
        wednesday: formData.wednesday,
        thursday: formData.thursday,
        friday: formData.friday,
        saturday: formData.saturday,
        sunday: formData.sunday
      };
      setDailyScheduleData(prevData => [...prevData, newRecord]);
    }

    // Close modal and reset form
    setShowCreateModal(false);
    setFormData({
      referenceCode: '',
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    });
    setIsEditMode(false);
    setEditingCode('');
  };

  // Handle ESC key press to close modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showSearchModal) {
          setShowSearchModal(false);
        } else if (showCreateModal) {
          setShowCreateModal(false);
        }
      }
    };

    if (showCreateModal || showSearchModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showCreateModal, showSearchModal]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Daily Schedule Setup</h1>
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
                    Define daily work schedules by assigning workshift codes for each day of the week. Create reference codes that represent complete weekly schedule patterns for easy assignment to employees or groups.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Weekly schedule templates</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Day-specific workshift assignments</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Reference code organization</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Flexible schedule configurations</span>
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-4 py-2 text-left text-gray-700">Reference Code ▲</th>
                    <th className="px-4 py-2 text-left text-gray-700">Monday</th>
                    <th className="px-4 py-2 text-left text-gray-700">Tuesday</th>
                    <th className="px-4 py-2 text-left text-gray-700">Wednesday</th>
                    <th className="px-4 py-2 text-left text-gray-700">Thursday</th>
                    <th className="px-4 py-2 text-left text-gray-700">Friday</th>
                    <th className="px-4 py-2 text-left text-gray-700">Saturday</th>
                    <th className="px-4 py-2 text-left text-gray-700">Sunday</th>
                    <th className="px-4 py-2 text-center text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-2">{item.referenceCode}</td>
                      <td className="px-4 py-2">{item.monday}</td>
                      <td className="px-4 py-2">{item.tuesday}</td>
                      <td className="px-4 py-2">{item.wednesday}</td>
                      <td className="px-4 py-2">{item.thursday}</td>
                      <td className="px-4 py-2">{item.friday}</td>
                      <td className="px-4 py-2">{item.saturday}</td>
                      <td className="px-4 py-2">{item.sunday}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => handleEdit(item)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Edit"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                            onClick={() => handleDelete(item.id)}
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
                Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
              </div>
              <div className="flex gap-2">
                <button 
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  {currentPage}
                </button>
                <button 
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                      <h2 className="text-gray-800">Create New</h2>
                      <button 
                        onClick={() => setShowCreateModal(false)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-4">
                      <h3 className="text-blue-600 mb-3">Daily Schedule</h3>

                      {/* Form Fields */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">Reference Code :</label>
                          <input
                            type="text"
                            value={formData.referenceCode}
                            onChange={(e) => setFormData({ ...formData, referenceCode: e.target.value })}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>

                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                          <div key={day} className="flex items-center gap-3">
                            <label className="w-32 text-gray-700 text-sm capitalize">{day} :</label>
                            <input
                              type="text"
                              value={formData[day as keyof typeof formData]}
                              onChange={(e) => setFormData({ ...formData, [day]: e.target.value })}
                              className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              readOnly
                            />
                            <button
                              onClick={() => handleOpenSearch(day)}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <SearchIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleClearField(day)}
                              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
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
            )}

            {/* Search Modal for Workshift Code */}
            {showSearchModal && (
                <>
                    {/* Modal Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/30 z-30"
                        onClick={() => setShowSearchModal(false)}
                    ></div>

                    {/* Modal Dialog */}
                    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                                <h2 className="text-gray-800">Search</h2>
                      <button 
                        onClick={() => setShowSearchModal(false)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-3">
                      <h3 className="text-blue-600 mb-2 text-sm">Workshift Code</h3>

                      {/* Search Field */}
                      <div className="flex items-center gap-2 mb-4 justify-end">
                        <label className="text-gray-700">Search:</label>
                        <input
                            type="text"
                            value={workshiftSearchQuery}
                            onChange={(e) => setWorkshiftSearchQuery(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        />
                      </div>

                      {/* Workshift Table */}
                      <div className="border border-gray-200 rounded">
                        <table className="w-full border-collapse text-sm">
                          <thead className="sticky top-0 bg-white">
                            <tr className="bg-gray-100 border-b-2 border-gray-300">
                              <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Code ▲</th>
                              <th className="px-3 py-1.5 text-left text-gray-700 text-sm">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {workshiftCurrentData.map((item, index) => (
                              <tr 
                                key={index} 
                                className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                                onClick={() => handleSelectWorkshift(item.code)}
                              >
                                <td className="px-3 py-1.5">{item.code}</td>
                                <td className="px-3 py-1.5">{item.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-gray-600 text-xs">
                          Showing {workshiftStartIndex + 1} to {Math.min(workshiftEndIndex, filteredWorkshiftData.length)} of {filteredWorkshiftData.length} entries
                        </div>
                        <div className="flex gap-1">
                          <button 
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-xs"
                            onClick={() => setWorkshiftCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={workshiftCurrentPage === 1}
                          >
                            Previous
                          </button>
                          <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                            {workshiftCurrentPage}
                          </button>
                          {workshiftCurrentPage < workshiftTotalPages && (
                            <button 
                              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs"
                              onClick={() => setWorkshiftCurrentPage(workshiftCurrentPage + 1)}
                            >
                              {workshiftCurrentPage + 1}
                            </button>
                          )}
                          <button 
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-xs"
                            onClick={() => setWorkshiftCurrentPage(prev => Math.min(workshiftTotalPages, prev + 1))}
                            disabled={workshiftCurrentPage === workshiftTotalPages}
                          >
                            Next
                          </button>
                        </div>
                      </div>
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