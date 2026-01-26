import { useState, useEffect } from 'react';
import { X, Plus, Trash, Copy, Search, ArrowLeft, Check, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../Footer/Footer';

interface CalendarSetupProps {
  onBack?: () => void;
}

export function CalendarSetup({ onBack }: CalendarSetupProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [branchSearchQuery, setBranchSearchQuery] = useState('');
  const [editingHoliday, setEditingHoliday] = useState<any>(null);
  const [formData, setFormData] = useState({
    year: '2021',
    month: 'January',
    day: 1,
    description: '',
    holidayType: 'Legal Holiday',
    time: ''
  });

  const holidays = [
    { year: 2021, month: 'January', day: 1, description: 'New Year', holidayType: 'Legal Holiday', branch: '', time: '' },
    { year: 2021, month: 'January', day: 20, description: 'Kaisa Festival', holidayType: 'Special Holiday', branch: 'Tarlac', time: '' },
    { year: 2021, month: 'February', day: 3, description: '71st Founding Anniversary', holidayType: 'Special Holiday', branch: 'NUEVA ECIJA', time: '' },
    { year: 2021, month: 'February', day: 12, description: 'Chinese New Year', holidayType: 'Special Holiday', branch: '', time: '' },
    { year: 2021, month: 'February', day: 25, description: 'EDSA People Power Revolution Anniversary', holidayType: 'Special Holiday', branch: '', time: '' },
    { year: 2021, month: 'March', day: 22, description: 'Birth Anniv. Of Emilio Aguinaldo', holidayType: 'Special Holiday', branch: 'Cavite', time: '' },
    { year: 2021, month: 'April', day: 2, description: 'Good Friday', holidayType: 'Legal Holiday', branch: '', time: '' },
    { year: 2021, month: 'April', day: 3, description: 'Black Saturday', holidayType: 'Special Holiday', branch: '', time: '' },
    { year: 2021, month: 'April', day: 5, description: 'Pangasinan Day', holidayType: 'Special Holiday', branch: 'DN Steel Marketing, Inc. - Urdaneta', time: '' },
    { year: 2021, month: 'April', day: 9, description: 'Araw ng Kagitingan', holidayType: 'Legal Holiday', branch: '', time: '' },
    { year: 2021, month: 'April', day: 19, description: '23rd Tarlac City Charter Anniversary', holidayType: 'Special Holiday', branch: 'Tarlac', time: '' },
    { year: 2021, month: 'May', day: 1, description: 'Labor Day', holidayType: 'Legal Holiday', branch: '', time: '' },
    { year: 2021, month: 'May', day: 7, description: 'Jose Abad Santos Day', holidayType: 'Special Holiday', branch: 'Pampanga', time: '' },
    { year: 2021, month: 'May', day: 13, description: 'Eid\'l Fitr', holidayType: 'Legal Holiday', branch: '', time: '' },
    { year: 2021, month: 'May', day: 28, description: 'Araw ng Lalawigan ng Tarlak', holidayType: 'Special Holiday', branch: 'Tarlac', time: '' },
    { year: 2021, month: 'June', day: 12, description: 'Independence Day', holidayType: 'Legal Holiday', branch: '', time: '' },
    { year: 2021, month: 'June', day: 15, description: 'Pinabuko Day', holidayType: 'Special Holiday', branch: 'Pampanga', time: '' },
    { year: 2021, month: 'July', day: 15, description: 'CAR 33rd Founding Anniversary', holidayType: 'Special Holiday', branch: 'Cordillera Administrative Region', time: '' },
    { year: 2021, month: 'July', day: 20, description: 'Eid Al-Adha', holidayType: 'Legal Holiday', branch: '', time: '' },
    { year: 2021, month: 'July', day: 23, description: 'Batangas City Foundation Day', holidayType: 'Special Holiday', branch: 'Batangass', time: '' },
    { year: 2021, month: 'August', day: 19, description: 'Quezon City Day', holidayType: 'Special Holiday', branch: 'Main', time: '' },
    { year: 2021, month: 'August', day: 21, description: 'Ninoy Aquino Day', holidayType: 'Special Holiday', branch: '', time: '' },
    { year: 2021, month: 'August', day: 30, description: 'National Heroes\' Day', holidayType: 'Legal Holiday', branch: '', time: '' },
    { year: 2021, month: 'September', day: 2, description: 'Simeon Ola Day', holidayType: 'Special Holiday', branch: 'Bicol-Daraga', time: '' },
    { year: 2021, month: 'September', day: 2, description: 'Nueva Ecija Day', holidayType: 'Special Holiday', branch: 'NUEVA ECIJA', time: '' },
  ];

  const branches = [
    { code: 'BATANGAS', description: 'Batangass' },
    { code: 'BIC-DARAGA', description: 'Bicol-Daraga' },
    { code: 'BICOL', description: 'Bicol' },
    { code: 'CAR', description: 'Cordillera Administrative Region' },
    { code: 'CAVITE', description: 'Cavite' },
    { code: 'LAUNION', description: 'La Union' },
    { code: 'MAIN', description: 'Main' },
    { code: 'NCR', description: 'National Capital Region' },
  ];

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showCreateModal) {
          setShowCreateModal(false);
          setEditingHoliday(null);
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
            <h1 className="text-white">Holiday Calendar</h1>
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
                    Manage company holidays, special occasions, and branch-specific observances. This calendar is used to calculate holiday pay and overtime rates for employees.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600"><span className="text-blue-600">Legal Holidays:</span> Regular pay + holiday premium</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600"><span className="text-orange-600">Special Holidays:</span> Standard pay rates apply</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Configure branch-specific holidays for regional offices</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Copy holidays from previous years for efficiency</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <label className="text-gray-700">Year:</label>
                <select className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>2021</option>
                  <option>2022</option>
                  <option>2023</option>
                  <option>2024</option>
                  <option>2025</option>
                </select>
              </div>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                onClick={() => {
                  setEditingHoliday(null);
                  setFormData({
                    year: '2021',
                    month: 'January',
                    day: 1,
                    description: '',
                    holidayType: 'Legal Holiday',
                    time: ''
                  });
                  setShowCreateModal(true);
                }}
              >
                <Plus className="w-4 h-4" />
                Create New
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm">
                <Trash className="w-4 h-4" />
                Delete Year
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-sm">
                <Copy className="w-4 h-4" />
                Copy To Current
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
                    <th className="px-4 py-2 text-left text-gray-700">Year ▲</th>
                    <th className="px-4 py-2 text-left text-gray-700">Month</th>
                    <th className="px-4 py-2 text-left text-gray-700">Day</th>
                    <th className="px-4 py-2 text-left text-gray-700">Description</th>
                    <th className="px-4 py-2 text-left text-gray-700">Holiday Type</th>
                    <th className="px-4 py-2 text-left text-gray-700">Branch</th>
                    <th className="px-4 py-2 text-left text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.map((holiday, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-2 text-blue-600">{holiday.year}</td>
                      <td className="px-4 py-2">{holiday.month}</td>
                      <td className="px-4 py-2">{holiday.day}</td>
                      <td className="px-4 py-2">{holiday.description}</td>
                      <td className="px-4 py-2">
                        <span className={holiday.holidayType === 'Legal Holiday' ? 'text-blue-600' : 'text-orange-600'}>
                          {holiday.holidayType}
                        </span>
                      </td>
                      <td className="px-4 py-2">{holiday.branch}</td>
                      <td className="px-4 py-2">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            setEditingHoliday(holiday);
                            setFormData({
                              year: holiday.year.toString(),
                              month: holiday.month,
                              day: holiday.day,
                              description: holiday.description,
                              holidayType: holiday.holidayType,
                              time: holiday.time
                            });
                            setShowCreateModal(true);
                          }}
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-gray-600">Showing 1 to 25 of 31 entries</div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">Previous</button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">2</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">Next</button>
              </div>
            </div>

            {/* Create New Modal - Positioned absolutely within the content container */}
            {showCreateModal && (
              <>
                {/* Modal Dialog */}
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                      <h2 className="text-gray-800">{editingHoliday ? 'Edit Holiday' : 'Create New'}</h2>
                      <button 
                        onClick={() => {
                          setShowCreateModal(false);
                          setEditingHoliday(null);
                        }}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-4">
                      <h3 className="text-blue-600 mb-3">Holiday Calendar</h3>

                      {/* Form Fields */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-4">
                          <label className="w-32 text-gray-700">Year :</label>
                          <input
                            type="text"
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                          />
                        </div>

                        <div className="flex items-center gap-4">
                          <label className="w-32 text-gray-700">Month :</label>
                          <select 
                            value={formData.month}
                            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                            className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                          >
                            <option>January</option>
                            <option>February</option>
                            <option>March</option>
                            <option>April</option>
                            <option>May</option>
                            <option>June</option>
                            <option>July</option>
                            <option>August</option>
                            <option>September</option>
                            <option>October</option>
                            <option>November</option>
                            <option>December</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-4">
                          <label className="w-32 text-gray-700">Day :</label>
                          <select 
                            value={formData.day}
                            onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) })}
                            className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
                          >
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-4">
                          <label className="w-32 text-gray-700">Description :</label>
                          <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="flex items-center gap-4">
                          <label className="w-32 text-gray-700">Holiday Type :</label>
                          <select 
                            value={formData.holidayType}
                            onChange={(e) => setFormData({ ...formData, holidayType: e.target.value })}
                            className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                          >
                            <option>Legal Holiday</option>
                            <option>Special Holiday</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-4">
                          <label className="w-32 text-gray-700">Time :</label>
                          <input
                            type="text"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                          />
                        </div>
                      </div>

                      {/* Branch Search and Table */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <label className="text-gray-700">Search:</label>
                          <input
                            type="text"
                            value={branchSearchQuery}
                            onChange={(e) => setBranchSearchQuery(e.target.value)}
                            className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="border border-gray-300 rounded overflow-hidden">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-100 border-b border-gray-300">
                                <th className="px-2 py-1 text-left w-12"></th>
                                <th className="px-2 py-1 text-left text-gray-700">▲ Code</th>
                                <th className="px-2 py-1 text-left text-gray-700">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {branches.map((branch, index) => (
                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                  <td className="px-2 py-1">
                                    <input type="checkbox" className="w-4 h-4" />
                                  </td>
                                  <td className="px-2 py-1">{branch.code}</td>
                                  <td className="px-2 py-1">{branch.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <div className="text-gray-600 text-sm">Showing 1 to 8 of 13 entries</div>
                          <div className="flex gap-2">
                            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm">Previous</button>
                            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">1</button>
                            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm">2</button>
                            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm">Next</button>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 mt-4">
                        <button 
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                          onClick={() => {
                            // Handle submit - would update the holiday in real app
                            console.log('Submitting:', formData);
                            setShowCreateModal(false);
                            setEditingHoliday(null);
                          }}
                        >
                          {editingHoliday ? 'Update' : 'Submit'}
                        </button>
                        <button 
                          className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm"
                          onClick={() => {
                            setShowCreateModal(false);
                            setEditingHoliday(null);
                          }}
                        >
                          Back to List
                        </button>
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