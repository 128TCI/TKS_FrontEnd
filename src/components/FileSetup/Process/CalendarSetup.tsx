import { useState, useEffect } from 'react';
import { X, Plus, Trash, Copy, Search, Check, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../Footer/Footer';
import apiClient from '../../../services/apiClient';
import Swal from 'sweetalert2';

interface CalendarSetupProps {
  onBack?: () => void;
}

interface Holiday {
  id: string;
  year: string;
  day: string;
  month: string;
  description: string;
  holidayType: string;
  branch: string;
  time: string | null;
  tdate: string;
  time2: string | null;
}

interface Branch {
  branchId: string;
  code: string;
  description: string;
  branchManager: string;
  branchManagerCode: string;
  deviceName: string;
}

export function CalendarSetup({ onBack }: CalendarSetupProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [branchSearchQuery, setBranchSearchQuery] = useState('');
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const [formData, setFormData] = useState({
    year: '2026',
    month: 'January',
    day: '1',
    description: '',
    holidayType: 'Legal Holiday',
    time: ''
  });

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [branchList, setBranchList] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [branchError, setBranchError] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const holidayTypeOptions = [
    { value: 'Legal Holiday', label: 'Legal Holiday' },
    { value: 'Special Holiday', label: 'Special Holiday' },
    { value: 'Special1', label: 'Special1' },
    { value: 'Special2', label: 'Special2' },
  ];

  // Fetch holidays and branches on component mount
  useEffect(() => {
    fetchHolidayData();
    fetchBranchData();
  }, []);

  const fetchHolidayData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/Fs/Process/CalendarSetUp');
      if (response.status === 200 && response.data) {
        const mappedData = response.data.map((holiday: any) => ({
          id: holiday.id?.toString() || '',
          year: holiday.year || '',
          day: holiday.day || '',
          month: holiday.month || '',
          description: holiday.description || '',
          holidayType: holiday.holidayType || '',
          branch: holiday.branch || '',
          time: holiday.time || null,
          tdate: holiday.tdate || '',
          time2: holiday.time2 || null,
        }));
        setHolidays(mappedData);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load holidays';
      setError(errorMsg);
      console.error('Error fetching holidays:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranchData = async () => {
    setLoadingBranches(true);
    setBranchError('');
    try {
      const response = await apiClient.get('/Fs/Employment/BranchSetUp');
      if (response.status === 200 && response.data) {
        const mappedData = response.data.map((branch: any) => ({
          branchId: branch.braID || branch.id || '',
          code: branch.braCode || branch.code || '',
          description: branch.braDesc || branch.description || '',
          branchManager: branch.braMngr || branch.branchManager || '',
          branchManagerCode: branch.braMngrCode || '',
          deviceName: branch.deviceName || branch.DeviceName || '',
        }));
        setBranchList(mappedData);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load branches';
      setBranchError(errorMsg);
      console.error('Error fetching branches:', error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const filteredHolidays = holidays.filter(holiday =>
    (holiday.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     holiday.month?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     holiday.branch?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    holiday.year === selectedYear
  );

  const filteredBranches = branchList.filter(branch =>
    branch.code.toLowerCase().includes(branchSearchQuery.toLowerCase()) ||
    branch.description.toLowerCase().includes(branchSearchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredHolidays.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHolidays = filteredHolidays.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedYear]);

  const handleCreateNew = () => {
    setEditingHoliday(null);
    setFormData({
      year: selectedYear,
      month: 'January',
      day: '1',
      description: '',
      holidayType: 'Legal Holiday',
      time: ''
    });
    setSelectedBranches([]);
    setShowCreateModal(true);
  };

  const handleEdit = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      year: holiday.year,
      month: holiday.month,
      day: holiday.day,
      description: holiday.description,
      holidayType: holiday.holidayType,
      time: holiday.time || ''
    });
    // Parse branch string to selected branches array
    const branches = holiday.branch ? holiday.branch.split(',').map(b => b.trim()) : [];
    setSelectedBranches(branches);
    setShowCreateModal(true);
  };

  const handleDelete = async (holiday: Holiday) => {
    const confirmed = await Swal.fire({
      icon: 'warning',
      title: 'Confirm Delete',
      text: `Are you sure you want to delete holiday "${holiday.description}"?`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (confirmed.isConfirmed) {
      try {
        await apiClient.delete(`/Fs/Process/CalendarSetUp/${holiday.id}`);
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Holiday deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
        await fetchHolidayData();
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to delete holiday';
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg,
        });
        console.error('Error deleting holiday:', error);
      }
    }
  };

  const handleBranchToggle = (branchCode: string) => {
    setSelectedBranches(prev => {
      if (prev.includes(branchCode)) {
        return prev.filter(code => code !== branchCode);
      } else {
        return [...prev, branchCode];
      }
    });
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.description) {
      await Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter a description.',
      });
      return;
    }

    setSubmitting(true);
    try {
      // Create date string from form data
      const monthIndex = monthNames.indexOf(formData.month) + 1;
      const dateStr = `${formData.year}-${monthIndex.toString().padStart(2, '0')}-${formData.day.padStart(2, '0')}T00:00:00`;

      const payload = {
        id: editingHoliday ? parseInt(editingHoliday.id) : 0,
        year: formData.year,
        day: formData.day,
        month: formData.month,
        description: formData.description,
        holidayType: formData.holidayType,
        branch: selectedBranches.join(', '),
        time: formData.time || null,
        tdate: dateStr,
        time2: null,
      };

      if (editingHoliday) {
        await apiClient.put(`/Fs/Process/CalendarSetUp/${editingHoliday.id}`, payload);
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Holiday updated successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await apiClient.post('/Fs/Process/CalendarSetUp', payload);
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Holiday created successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
      }

      await fetchHolidayData();
      setShowCreateModal(false);
      setEditingHoliday(null);
      setSelectedBranches([]);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
      });
      console.error('Error submitting holiday:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingHoliday(null);
    setSelectedBranches([]);
  };

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

  const years = Array.from({ length: 20 }, (_, i) => (new Date().getFullYear() - 5 + i).toString());

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
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
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
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-600 text-sm">Loading holidays...</div>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-4 py-2 text-left text-gray-700">Year</th>
                      <th className="px-4 py-2 text-left text-gray-700">Month</th>
                      <th className="px-4 py-2 text-left text-gray-700">Day</th>
                      <th className="px-4 py-2 text-left text-gray-700">Description</th>
                      <th className="px-4 py-2 text-left text-gray-700">Holiday Type</th>
                      <th className="px-4 py-2 text-left text-gray-700">Branch</th>
                      <th className="px-4 py-2 text-left text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHolidays.length > 0 ? (
                      paginatedHolidays.map((holiday) => (
                        <tr key={holiday.id} className="border-b border-gray-200 hover:bg-gray-50">
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
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleEdit(holiday)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={() => handleDelete(holiday)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <div className="text-gray-500">No holidays found for {selectedYear}</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {filteredHolidays.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredHolidays.length)} of {filteredHolidays.length} entries
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage >= totalPages || filteredHolidays.length === 0}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0 z-10">
                    <h2 className="text-gray-900 font-semibold">{editingHoliday ? 'Edit Holiday' : 'Create New Holiday'}</h2>
                    <button 
                      onClick={handleCloseModal}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6">
                    <h3 className="text-blue-600 mb-4 font-semibold">Holiday Calendar</h3>

                    {/* Form Fields */}
                    <div className="space-y-3 text-sm mb-6">
                      <div className="flex items-center">
                        <span className="text-gray-700 font-medium w-40">Year :</span>
                        <input
                          type="text"
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                        />
                      </div>

                      <div className="flex items-center">
                        <span className="text-gray-700 font-medium w-40">Month :</span>
                        <select 
                          value={formData.month}
                          onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                          className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                        >
                          {monthNames.map(month => (
                            <option key={month} value={month}>{month}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center">
                        <span className="text-gray-700 font-medium w-40">Day :</span>
                        <select 
                          value={formData.day}
                          onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                          className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
                        >
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                            <option key={day} value={day.toString()}>{day}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center">
                        <span className="text-gray-700 font-medium w-40">Description :</span>
                        <input
                          type="text"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center">
                        <span className="text-gray-700 font-medium w-40">Holiday Type :</span>
                        <select 
                          value={formData.holidayType}
                          onChange={(e) => setFormData({ ...formData, holidayType: e.target.value })}
                          className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                        >
                          {holidayTypeOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center">
                        <span className="text-gray-700 font-medium w-40">Time :</span>
                        <input
                          type="text"
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    {/* Branch Selection Section */}
                    <div className="mb-6">
                      <h4 className="text-gray-700 font-medium mb-3">Select Branches:</h4>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <label className="text-sm text-gray-600">Search:</label>
                        <input
                          type="text"
                          value={branchSearchQuery}
                          onChange={(e) => setBranchSearchQuery(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Search by code or description..."
                        />
                      </div>

                      <div className="border border-gray-300 rounded overflow-hidden max-h-64 overflow-y-auto">
                        {loadingBranches ? (
                          <div className="p-4 text-center text-gray-600 text-sm">Loading branches...</div>
                        ) : branchError ? (
                          <div className="p-4 text-center text-red-600 text-sm">{branchError}</div>
                        ) : (
                          <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-gray-100 border-b border-gray-300">
                              <tr>
                                <th className="px-3 py-2 text-left w-16">
                                  <input 
                                    type="checkbox" 
                                    className="w-4 h-4"
                                    checked={selectedBranches.length === filteredBranches.length && filteredBranches.length > 0}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedBranches(filteredBranches.map(b => b.code));
                                      } else {
                                        setSelectedBranches([]);
                                      }
                                    }}
                                  />
                                </th>
                                <th className="px-3 py-2 text-left text-gray-700 font-medium">Code</th>
                                <th className="px-3 py-2 text-left text-gray-700 font-medium">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredBranches.length > 0 ? (
                                filteredBranches.map((branch) => (
                                  <tr key={branch.branchId} className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer" onClick={() => handleBranchToggle(branch.code)}>
                                    <td className="px-3 py-2">
                                      <input 
                                        type="checkbox" 
                                        className="w-4 h-4"
                                        checked={selectedBranches.includes(branch.code)}
                                        onChange={() => handleBranchToggle(branch.code)}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </td>
                                    <td className="px-3 py-2 text-gray-900">{branch.code}</td>
                                    <td className="px-3 py-2 text-gray-600">{branch.description}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={3} className="px-3 py-8 text-center text-gray-500">
                                    No branches found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        )}
                      </div>

                      {selectedBranches.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          Selected: <span className="font-medium text-blue-600">{selectedBranches.length}</span> branch(es)
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      <button 
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm text-sm font-medium"
                        onClick={handleSubmit}
                        disabled={submitting}
                      >
                        {submitting ? 'Saving...' : (editingHoliday ? 'Update' : 'Submit')}
                      </button>
                      <button 
                        className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm text-sm font-medium"
                        onClick={handleCloseModal}
                        disabled={submitting}
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