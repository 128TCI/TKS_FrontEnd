import { useState, useEffect } from 'react';
import { X, Plus, Check, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';

interface RestDayRecord {
  code: string;
  week1Day1: string;
  week1Day2: string;
  week1Day3: string;
  week2Day1: string;
  week2Day2: string;
  week2Day3: string;
}

export function RestDaySetupPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCode, setEditingCode] = useState('');

  const [formData, setFormData] = useState({
    referenceNo: '',
    week1Day1: '',
    week1Day2: '',
    week1Day3: '',
    week2Day1: '',
    week2Day2: '',
    week2Day3: ''
  });

  // Sample data - Rest Day records
  const [restDayData, setRestDayData] = useState<RestDayRecord[]>([
    { code: '11', week1Day1: 'Monday', week1Day2: '', week1Day3: '', week2Day1: '', week2Day2: '', week2Day3: '' },
    { code: 'A', week1Day1: 'Monday', week1Day2: 'Tuesday', week1Day3: '', week2Day1: '', week2Day2: '', week2Day3: '' }
  ]);

  // Days of the week for dropdown
  const daysOfWeek = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const filteredData = restDayData.filter(item => 
    item.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination for main table
  const itemsPerPage = 25;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleCreateNew = () => {
    setFormData({
      referenceNo: '',
      week1Day1: '',
      week1Day2: '',
      week1Day3: '',
      week2Day1: '',
      week2Day2: '',
      week2Day3: ''
    });
    setIsEditMode(false);
    setShowCreateModal(true);
  };

  const handleEdit = (item: RestDayRecord) => {
    setFormData({
      referenceNo: item.code,
      week1Day1: item.week1Day1,
      week1Day2: item.week1Day2,
      week1Day3: item.week1Day3,
      week2Day1: item.week2Day1,
      week2Day2: item.week2Day2,
      week2Day3: item.week2Day3
    });
    setIsEditMode(true);
    setEditingCode(item.code);
    setShowCreateModal(true);
  };

    const handleDelete = (code: string) => {
        if (confirm('Are you sure you want to delete this entry?')) {
            setRestDayData(prevData => prevData.filter(item => item.code !== code));
        }
  };

  const handleSubmit = () => {
    // Validate reference number
    if (!formData.referenceNo.trim()) {
      alert('Please enter a Reference No.');
      return;
    }

    if (isEditMode) {
      // Update existing record
      setRestDayData(prevData => 
        prevData.map(item => 
          item.code === editingCode 
            ? {
                code: formData.referenceNo,
                week1Day1: formData.week1Day1,
                week1Day2: formData.week1Day2,
                week1Day3: formData.week1Day3,
                week2Day1: formData.week2Day1,
                week2Day2: formData.week2Day2,
                week2Day3: formData.week2Day3
              }
            : item
        )
      );
    } else {
      // Check if code already exists
      if (restDayData.some(item => item.code === formData.referenceNo)) {
        alert('A Rest Day Setup with this Reference No. already exists.');
        return;
      }

      // Add new record
      const newRecord: RestDayRecord = {
        code: formData.referenceNo,
        week1Day1: formData.week1Day1,
        week1Day2: formData.week1Day2,
        week1Day3: formData.week1Day3,
        week2Day1: formData.week2Day1,
        week2Day2: formData.week2Day2,
        week2Day3: formData.week2Day3
      };
      setRestDayData(prevData => [...prevData, newRecord]);
    }

    // Close modal and reset form
    setShowCreateModal(false);
    setFormData({
      referenceNo: '',
      week1Day1: '',
      week1Day2: '',
      week1Day3: '',
      week2Day1: '',
      week2Day2: '',
      week2Day3: ''
    });
    setIsEditMode(false);
    setEditingCode('');
  };

  // Handle ESC key press to close modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showCreateModal) {
          setShowCreateModal(false);
        }
      }
    };

    if (showCreateModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showCreateModal]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Rest Day Setup</h1>
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
                    Define rest day schedules by specifying up to three rest days per week over a two-week cycle. Create reference codes that represent complete rest day patterns for easy assignment to employees or groups.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Two-week rest day patterns</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Up to 3 rest days per week</span>
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
                    <th className="px-4 py-2 text-left text-gray-700" rowSpan={2}>Code ▲</th>
                    <th className="px-4 py-2 text-center text-gray-700 border-l border-gray-300" colSpan={3}>Week 1</th>
                    <th className="px-4 py-2 text-center text-gray-700 border-l border-gray-300" colSpan={3}>Week 2</th>
                    <th className="px-4 py-2 text-left text-gray-700 border-l border-gray-300" rowSpan={2}></th>
                  </tr>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-4 py-2 text-left text-gray-700 border-l border-gray-300">Day 1</th>
                    <th className="px-4 py-2 text-left text-gray-700 border-l border-gray-300">Day 2</th>
                    <th className="px-4 py-2 text-left text-gray-700 border-l border-gray-300">Day 3</th>
                    <th className="px-4 py-2 text-left text-gray-700 border-l border-gray-300">Day 1</th>
                    <th className="px-4 py-2 text-left text-gray-700 border-l border-gray-300">Day 2</th>
                    <th className="px-4 py-2 text-left text-gray-700 border-l border-gray-300">Day 3</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-2">{item.code}</td>
                      <td className="px-4 py-2 border-l border-gray-200">{item.week1Day1}</td>
                      <td className="px-4 py-2 border-l border-gray-200">{item.week1Day2}</td>
                      <td className="px-4 py-2 border-l border-gray-200">{item.week1Day3}</td>
                      <td className="px-4 py-2 border-l border-gray-200">{item.week2Day1}</td>
                      <td className="px-4 py-2 border-l border-gray-200">{item.week2Day2}</td>
                      <td className="px-4 py-2 border-l border-gray-200">{item.week2Day3}</td>
                      <td className="px-4 py-2 border-l border-gray-200">
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
                            onClick={() => handleDelete(item.code)}
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
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
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
                      <h3 className="text-blue-600 mb-3">Rest Day Setup</h3>

                      {/* Form Fields */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">Reference No :</label>
                          <input
                            type="text"
                            value={formData.referenceNo}
                            onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>

                        {/* Week 1 Section */}
                        <h4 className="text-blue-600 text-sm mt-4">Week 1</h4>
                        
                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">RestDay 1 :</label>
                          <select
                            value={formData.week1Day1}
                            onChange={(e) => setFormData({ ...formData, week1Day1: e.target.value })}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            {daysOfWeek.map((day, idx) => (
                              <option key={idx} value={day}>{day}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">RestDay 2 :</label>
                          <select
                            value={formData.week1Day2}
                            onChange={(e) => setFormData({ ...formData, week1Day2: e.target.value })}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            {daysOfWeek.map((day, idx) => (
                              <option key={idx} value={day}>{day}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">RestDay 3 :</label>
                          <select
                            value={formData.week1Day3}
                            onChange={(e) => setFormData({ ...formData, week1Day3: e.target.value })}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            {daysOfWeek.map((day, idx) => (
                              <option key={idx} value={day}>{day}</option>
                            ))}
                          </select>
                        </div>

                        {/* Week 2 Section */}
                        <h4 className="text-blue-600 text-sm mt-4">Week 2</h4>
                        
                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">RestDay 1 :</label>
                          <select
                            value={formData.week2Day1}
                            onChange={(e) => setFormData({ ...formData, week2Day1: e.target.value })}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            {daysOfWeek.map((day, idx) => (
                              <option key={idx} value={day}>{day}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">RestDay 2 :</label>
                          <select
                            value={formData.week2Day2}
                            onChange={(e) => setFormData({ ...formData, week2Day2: e.target.value })}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            {daysOfWeek.map((day, idx) => (
                              <option key={idx} value={day}>{day}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="w-32 text-gray-700 text-sm">RestDay 3 :</label>
                          <select
                            value={formData.week2Day3}
                            onChange={(e) => setFormData({ ...formData, week2Day3: e.target.value })}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            {daysOfWeek.map((day, idx) => (
                              <option key={idx} value={day}>{day}</option>
                            ))}
                          </select>
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
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}